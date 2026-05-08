from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from html import unescape
from html.parser import HTMLParser
from http.client import IncompleteRead
import logging
import re
import time
import unicodedata
from typing import Callable, Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlencode, urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

DEFAULT_USER_AGENT = (
    "SmartEstateMarketETL/1.0 "
    "(contact: admin@smartestate.local; purpose: market-data aggregation)"
)

AVITO_DEFAULT_URL = "https://www.avito.ma/fr/maroc/immobilier"
MUBAWAB_DEFAULT_URL = "https://www.mubawab.ma/fr/cc/immobilier-a-vendre:o:n"

CITY_NAMES = [
    "Agadir",
    "Al Hoceima",
    "Azemmour",
    "Beni Mellal",
    "Benslimane",
    "Berkane",
    "Berrechid",
    "Bouskoura",
    "Casablanca",
    "Dar Bouazza",
    "El Jadida",
    "El Mansouria",
    "Errachidia",
    "Essaouira",
    "Fes",
    "Fès",
    "Ifrane",
    "Kenitra",
    "Kénitra",
    "Khouribga",
    "Laayoune",
    "Larache",
    "Marrakech",
    "Meknes",
    "Meknès",
    "Mohammedia",
    "Nador",
    "Ouarzazate",
    "Oujda",
    "Rabat",
    "Safi",
    "Saidia",
    "Saïdia",
    "Sale",
    "Salé",
    "Settat",
    "Sidi Bouknadel",
    "Sidi Rahal",
    "Skhirat",
    "Taghazout",
    "Tanger",
    "Taroudant",
    "Taza",
    "Temara",
    "Témara",
    "Tetouan",
    "Tétouan",
]
CITY_BY_NORMALIZED = {unicodedata.normalize("NFKD", city).encode("ascii", "ignore").decode("ascii").lower(): city for city in CITY_NAMES}

SPACES_RE = re.compile(r"[\s\u00a0]+")
SCRIPT_STYLE_RE = re.compile(r"(?is)<(script|style|noscript)\b.*?</\1>")
BLOCK_TAG_RE = re.compile(r"(?i)<br\s*/?>|</(?:p|div|li|h[1-6]|section|article|tr|td)>")
TAG_RE = re.compile(r"(?s)<[^>]+>")
PRICE_RE = re.compile(r"(?<![A-Za-z])(?P<amount>\d[\d \u00a0.,]*)\s*(?P<currency>DH|DHS|MAD)\b", re.I)
AREA_RE = re.compile(r"(\d+(?:[.,]\d+)?)\s*m\s*(?:2|\u00b2|&sup2;)?", re.I)


@dataclass
class ScrapedListing:
    source: str
    url: str
    title: str
    source_id: str = ""
    description: str = ""
    asset_type: str = "unknown"
    transaction_type: str = "unknown"
    city: str = ""
    district: str = ""
    price: Decimal | None = None
    currency: str = "MAD"
    price_period: str = ""
    area_sqm: Decimal | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    seller_name: str = ""
    published_label: str = ""
    raw_payload: dict = field(default_factory=dict)


def normalize_text(value: str) -> str:
    return SPACES_RE.sub(" ", unescape(value or "")).strip()


def normalize_for_match(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return SPACES_RE.sub(" ", ascii_value.lower()).strip()


def fetch_html(url: str, timeout: int = 20, user_agent: str = DEFAULT_USER_AGENT) -> str:
    last_error: Exception | None = None
    for attempt in range(3):
        request = Request(
            url,
            headers={
                "User-Agent": user_agent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "fr-MA,fr;q=0.9,en;q=0.8",
            },
        )
        try:
            with urlopen(request, timeout=timeout) as response:
                charset = response.headers.get_content_charset() or "utf-8"
                try:
                    payload = response.read()
                except IncompleteRead as exc:
                    if exc.partial and len(exc.partial) > 2000:
                        logger.warning("Partial response received for %s; using recovered bytes.", url)
                        payload = exc.partial
                    else:
                        raise
                return payload.decode(charset, errors="replace")
        except (HTTPError, URLError, TimeoutError, OSError, UnicodeError, IncompleteRead) as exc:
            last_error = exc
            if attempt == 2:
                raise
            time.sleep(1 + attempt)

    if last_error:
        raise last_error
    return ""


def iri_to_uri(url: str) -> str:
    parsed = urlparse(url)
    netloc = parsed.netloc.encode("idna").decode("ascii") if parsed.netloc else ""
    return urlunparse(
        (
            parsed.scheme,
            netloc,
            quote(parsed.path, safe="/%"),
            quote(parsed.params, safe=";=%"),
            quote(parsed.query, safe="=&?/:;+,%"),
            quote(parsed.fragment, safe="=&?/:;+,%"),
        )
    )


def html_to_lines(html: str) -> list[str]:
    cleaned = SCRIPT_STYLE_RE.sub("\n", html or "")
    cleaned = BLOCK_TAG_RE.sub("\n", cleaned)
    text = TAG_RE.sub("\n", cleaned)
    lines = [normalize_text(line) for line in text.splitlines()]
    return [line for line in lines if line]


def strip_tags(value: str) -> str:
    return normalize_text(TAG_RE.sub(" ", value or ""))


def get_attr(tag: str, attr_name: str) -> str:
    pattern = rf"""{attr_name}\s*=\s*(['"])(.*?)\1"""
    match = re.search(pattern, tag, re.I | re.S)
    return unescape(match.group(2)).strip() if match else ""


def extract_meta_content(html: str, names: Iterable[str]) -> str:
    accepted = {name.lower() for name in names}
    for match in re.finditer(r"(?is)<meta\b[^>]*>", html or ""):
        tag = match.group(0)
        key = (get_attr(tag, "property") or get_attr(tag, "name")).lower()
        if key in accepted:
            return normalize_text(get_attr(tag, "content"))
    return ""


def extract_tag_text(html: str, tag_name: str) -> str:
    match = re.search(rf"(?is)<{tag_name}\b[^>]*>(.*?)</{tag_name}>", html or "")
    return strip_tags(match.group(1)) if match else ""


def extract_title(html: str, fallback: str = "") -> str:
    title = extract_tag_text(html, "h1")
    if not title:
        title = extract_meta_content(html, ["og:title", "twitter:title"])
    if not title:
        title = extract_tag_text(html, "title")
    if not title:
        title = fallback

    title = re.split(r"\s+[|-]\s+(?:Avito|Mubawab)\b", title, maxsplit=1, flags=re.I)[0]
    return normalize_text(title)[:255]


class AnchorExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors: list[tuple[str, str]] = []
        self._current_href: str | None = None
        self._parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return
        attrs_dict = dict(attrs)
        self._current_href = attrs_dict.get("href") or ""
        self._parts = []

    def handle_data(self, data):
        if self._current_href is not None:
            self._parts.append(data)

    def handle_endtag(self, tag):
        if tag.lower() != "a" or self._current_href is None:
            return
        label = normalize_text(" ".join(self._parts))
        self.anchors.append((self._current_href, label))
        self._current_href = None
        self._parts = []


def extract_anchors(html: str) -> list[tuple[str, str]]:
    parser = AnchorExtractor()
    parser.feed(html or "")
    return parser.anchors


def dedupe_candidates(candidates: Iterable[tuple[str, str]]) -> list[tuple[str, str]]:
    by_url: dict[str, str] = {}
    for url, title in candidates:
        if not url:
            continue
        url = iri_to_uri(url)
        current = by_url.get(url, "")
        if len(title or "") > len(current):
            by_url[url] = normalize_text(title)
    return [(url, title) for url, title in by_url.items()]


def decimal_from_text(value: str) -> Decimal | None:
    value = normalize_text(value).replace(" ", "").replace("\u00a0", "").replace(",", ".")
    value = re.sub(r"[^0-9.]", "", value)
    if not value:
        return None
    try:
        return Decimal(value).quantize(Decimal("0.01"))
    except InvalidOperation:
        return None


def int_from_pattern(text: str, pattern: str) -> int | None:
    match = re.search(pattern, text, re.I)
    if not match:
        return None
    try:
        return int(match.group(1))
    except (TypeError, ValueError):
        return None


def parse_price(text: str, transaction_type: str = "unknown") -> tuple[Decimal | None, str, str]:
    if re.search(r"(prix a consulter|demander le prix)", normalize_for_match(text)):
        return None, "MAD", ""

    for match in PRICE_RE.finditer(text or ""):
        amount = decimal_from_text(match.group("amount"))
        if amount is None:
            continue
        currency = "MAD"
        suffix = normalize_for_match((text or "")[match.end() : match.end() + 14])
        period = ""
        if "/ mois" in suffix or "par mois" in suffix:
            period = "month"
        elif "/ jour" in suffix or "par jour" in suffix:
            period = "day"
        if transaction_type == "sale" and period:
            continue
        elif transaction_type == "rent":
            period = "month"
        elif transaction_type == "vacation":
            period = "day"
        return amount, currency, period
    return None, "MAD", ""


def parse_area(text: str) -> Decimal | None:
    match = AREA_RE.search(text or "")
    return decimal_from_text(match.group(1)) if match else None


def parse_bedrooms(text: str) -> int | None:
    return int_from_pattern(
        text,
        r"(\d+)\s*(?:chambres?|ch\.|ch\b|chambre\(s\))",
    )


def parse_bathrooms(text: str) -> int | None:
    return int_from_pattern(
        text,
        r"(\d+)\s*(?:salles?\s+de\s+bains?|sdbs?|sdb\(s\))",
    )


def infer_asset_type(text: str) -> str:
    value = normalize_for_match(text)
    if any(token in value for token in ["terrain", "ferme", "hectare"]):
        return "land"
    if any(token in value for token in ["bureau", "plateau bureau"]):
        return "office"
    if any(token in value for token in ["local", "magasin", "commerce", "commercial"]):
        return "retail"
    if any(token in value for token in ["villa", "riad", "maison"]):
        return "villa"
    if any(token in value for token in ["hotel", "hote", "hospitality"]):
        return "hospitality"
    if any(token in value for token in ["appartement", "appart", "studio", "duplex"]):
        return "apartment"
    return "unknown"


def infer_transaction_type(text: str) -> str:
    value = normalize_for_match(text)
    if any(token in value for token in ["location de vacances", "louer par jour", "loc par jour", "journalier"]):
        return "vacation"
    if any(token in value for token in ["a louer", "location", "louer"]):
        return "rent"
    if any(token in value for token in ["a vendre", "vente", "vendre", "achat"]):
        return "sale"
    return "unknown"


def extract_location(lines: list[str]) -> tuple[str, str]:
    for line in lines[:160]:
        if "," not in line or len(line) > 140:
            continue
        parts = [normalize_text(part) for part in line.split(",") if normalize_text(part)]
        for index, part in enumerate(reversed(parts)):
            normalized = normalize_for_match(part)
            city = CITY_BY_NORMALIZED.get(normalized)
            if city:
                district = parts[0] if parts and normalize_for_match(parts[0]) != normalized else ""
                return city, district[:120]

            for city_key, city_name in CITY_BY_NORMALIZED.items():
                if re.search(rf"\b{re.escape(city_key)}\b", normalized):
                    original_index = len(parts) - index - 1
                    if original_index + 1 < len(parts):
                        district = parts[original_index + 1]
                    elif original_index > 0:
                        district = parts[original_index - 1]
                    else:
                        district = ""
                    return city_name, district[:120]

    for line in lines[:120]:
        if len(line) > 80:
            continue
        normalized = normalize_for_match(line)
        city = CITY_BY_NORMALIZED.get(normalized)
        if city:
            return city, ""

    return "", ""


def extract_description(html: str, lines: list[str], title: str) -> str:
    description = extract_meta_content(html, ["description", "og:description", "twitter:description"])
    if description and normalize_for_match(description) != normalize_for_match(title):
        return description[:2000]

    ignored_prefixes = (
        "en cliquant",
        "nous utilisons",
        "traitement en cours",
        "contacter",
        "appelez",
        "whatsapp",
        "sauvegarder",
    )
    normalized_title = normalize_for_match(title)
    for line in lines:
        normalized = normalize_for_match(line)
        if len(line) < 70 or normalized == normalized_title:
            continue
        if any(normalized.startswith(prefix) for prefix in ignored_prefixes):
            continue
        return line[:2000]
    return ""


def extract_first_matching_line(lines: list[str], pattern: str) -> str:
    regex = re.compile(pattern, re.I)
    for line in lines[:120]:
        if regex.search(line):
            return line[:120]
    return ""


def extract_image_urls(html: str, base_url: str) -> list[str]:
    urls = []
    meta_image = extract_meta_content(html, ["og:image", "twitter:image"])
    if meta_image:
        urls.append(urljoin(base_url, meta_image))
    for match in re.finditer(r"""(?is)<img\b[^>]*\bsrc\s*=\s*(['"])(.*?)\1""", html or ""):
        src = unescape(match.group(2)).strip()
        if src and not src.startswith("data:"):
            urls.append(urljoin(base_url, src))
    return list(dict.fromkeys(urls))[:8]


class BaseMarketScraper:
    source = ""
    default_url = ""

    def __init__(
        self,
        start_url: str | None = None,
        fetcher: Callable[[str, int, str], str] = fetch_html,
        user_agent: str = DEFAULT_USER_AGENT,
        timeout: int = 20,
    ):
        self.start_url = start_url or self.default_url
        self.fetcher = fetcher
        self.user_agent = user_agent
        self.timeout = timeout
        self.errors: list[str] = []
        self.skipped_known_urls = 0

    def scrape(
        self,
        pages: int = 1,
        limit: int | None = None,
        sleep_seconds: float = 1.0,
        known_urls: set[str] | None = None,
        stop_after_known: int | None = None,
    ) -> Iterable[ScrapedListing]:
        seen_urls: set[str] = set()
        known_url_set = known_urls or set()
        consecutive_known = 0
        emitted = 0

        for page in range(1, pages + 1):
            page_url = self.page_url(page)
            try:
                page_html = self.fetcher(page_url, self.timeout, self.user_agent)
            except (HTTPError, URLError, TimeoutError, OSError, UnicodeError, IncompleteRead) as exc:
                message = f"{self.source}: unable to fetch {page_url}: {exc}"
                self.errors.append(message)
                logger.warning(message)
                continue

            candidates = self.extract_listing_urls(page_html, page_url)
            for listing_url, title_hint in candidates:
                if listing_url in seen_urls:
                    continue
                seen_urls.add(listing_url)
                if listing_url in known_url_set:
                    self.skipped_known_urls += 1
                    consecutive_known += 1
                    if stop_after_known and consecutive_known >= stop_after_known:
                        return
                    continue

                consecutive_known = 0
                if limit is not None and emitted >= limit:
                    return
                if sleep_seconds > 0:
                    time.sleep(sleep_seconds)

                try:
                    detail_html = self.fetcher(listing_url, self.timeout, self.user_agent)
                except (HTTPError, URLError, TimeoutError, OSError, UnicodeError, IncompleteRead) as exc:
                    message = f"{self.source}: unable to fetch {listing_url}: {exc}"
                    self.errors.append(message)
                    logger.warning(message)
                    continue

                listing = self.parse_listing(detail_html, listing_url, title_hint)
                if listing.title:
                    emitted += 1
                    yield listing

    def page_url(self, page: int) -> str:
        return self.start_url

    def extract_listing_urls(self, html: str, base_url: str) -> list[tuple[str, str]]:
        raise NotImplementedError

    def parse_listing(self, html: str, url: str, title_hint: str = "") -> ScrapedListing:
        lines = html_to_lines(html)
        joined = " ".join(lines[:220])
        line_text = "\n".join(lines[:220])
        title = extract_title(html, title_hint)
        text_for_inference = " ".join([title, joined, url])
        transaction_type = infer_transaction_type(text_for_inference)
        asset_type = infer_asset_type(text_for_inference)
        price, currency, price_period = parse_price(line_text, transaction_type)
        city, district = extract_location(lines)

        return ScrapedListing(
            source=self.source,
            source_id=self.extract_source_id(url),
            url=url,
            title=title,
            description=extract_description(html, lines, title),
            asset_type=asset_type,
            transaction_type=transaction_type,
            city=city,
            district=district,
            price=price,
            currency=currency,
            price_period=price_period,
            area_sqm=parse_area(joined),
            bedrooms=parse_bedrooms(joined),
            bathrooms=parse_bathrooms(joined),
            seller_name="",
            published_label=extract_first_matching_line(lines, r"\bil y a\b|aujourd'hui|hier"),
            raw_payload={
                "source_url": url,
                "images": extract_image_urls(html, url),
                "lines_sample": lines[:80],
            },
        )

    def extract_source_id(self, url: str) -> str:
        return ""


class AvitoScraper(BaseMarketScraper):
    source = "avito"
    default_url = AVITO_DEFAULT_URL

    def page_url(self, page: int) -> str:
        if page <= 1:
            return self.start_url
        parsed = urlparse(self.start_url)
        query = parse_qs(parsed.query)
        query["o"] = [str(page)]
        return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))

    def extract_listing_urls(self, html: str, base_url: str) -> list[tuple[str, str]]:
        candidates = []
        for href, title in extract_anchors(html):
            absolute = urljoin(base_url, href)
            if re.search(r"/fr/.+_\d+\.htm(?:$|\?)", absolute):
                candidates.append((absolute, title))

        for match in re.finditer(r"""(?:https?://www\.avito\.ma)?/fr/[^"'<>\s]+?_\d+\.htm""", html or ""):
            candidates.append((urljoin(base_url, match.group(0)), ""))

        return dedupe_candidates(candidates)

    def extract_source_id(self, url: str) -> str:
        match = re.search(r"_(\d+)\.htm", url)
        return match.group(1) if match else ""


class MubawabScraper(BaseMarketScraper):
    source = "mubawab"
    default_url = MUBAWAB_DEFAULT_URL

    def page_url(self, page: int) -> str:
        if page <= 1:
            return self.start_url
        parsed = urlparse(self.start_url)
        path = re.sub(r":p:\d+", "", parsed.path)
        return urlunparse(parsed._replace(path=f"{path}:p:{page}"))

    def extract_listing_urls(self, html: str, base_url: str) -> list[tuple[str, str]]:
        candidates = []
        for href, title in extract_anchors(html):
            absolute = urljoin(base_url, href)
            if re.search(r"/fr/a/\d+/", absolute):
                candidates.append((absolute, title))

        for match in re.finditer(r"""(?:https?://www\.mubawab\.ma)?/fr/a/\d+/[^"'<>\s]+""", html or ""):
            candidates.append((urljoin(base_url, match.group(0)), ""))

        return dedupe_candidates(candidates)

    def extract_source_id(self, url: str) -> str:
        match = re.search(r"/fr/a/(\d+)/", url)
        return match.group(1) if match else ""
