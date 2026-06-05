# Algorithmes de calcul et de prediction utilises par le moteur IA.
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from math import expm1, log1p, pow
from statistics import fmean
from typing import Iterable

from django.utils import timezone



# Constantes utilisées pour arrondir les montants et les pourcentages.
# MONEY = précision des prix ; PERCENT = précision des scores et ratios.
MONEY = Decimal("0.01")
PERCENT = Decimal("0.01")



# Classe de données qui représente une annonce immobilière comparable au bien étudié.
# Elle regroupe les informations affichables : prix, surface, prix/m², ville, quartier, images et score de similarité.
@dataclass
class Comparable:
    id: int | None
    title: str
    source: str
    asset_type: str
    external_url: str
    image_urls: list[str]
    primary_image_url: str
    city: str
    district: str
    price: Decimal
    area_sqm: Decimal
    price_per_sqm: Decimal
    similarity_score: Decimal



# Classe de données utilisée pour préparer les lignes d’apprentissage du modèle.
# Chaque ligne contient les caractéristiques importantes d’une annonce et son prix au m².
@dataclass
class TrainingRow:
    city: str
    district: str
    asset_type: str
    area_sqm: Decimal
    bedrooms: Decimal
    bathrooms: Decimal
    price_per_sqm: Decimal
    last_seen_at: object | None = None



# Convertit une valeur reçue depuis le formulaire ou la base de données en Decimal.
# Si la valeur est vide ou invalide, la fonction retourne la valeur par défaut.
def to_decimal(value, default: Decimal | None = None) -> Decimal | None:
    if value is None or value == "":
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return default



# Arrondit un montant monétaire à deux chiffres après la virgule.
# Cela permet d’obtenir des prix propres et homogènes dans les résultats.
def quantize_money(value: Decimal | None) -> Decimal | None:
    if value is None:
        return None
    return value.quantize(MONEY)



# Arrondit un pourcentage à deux chiffres après la virgule.
# Utilisée pour les scores, rendements, ratios et indicateurs financiers.
def quantize_percent(value: Decimal | None) -> Decimal | None:
    if value is None:
        return None
    return value.quantize(PERCENT)



# Limite une valeur entre une borne minimale et une borne maximale.
# Exemple : empêcher un score de dépasser 100 ou de devenir négatif.
def bounded(value: Decimal, minimum: Decimal, maximum: Decimal) -> Decimal:
    return max(minimum, min(maximum, value))



# Calcule la médiane d’une liste de valeurs Decimal.
# La médiane est plus robuste qu’une moyenne lorsqu’il existe des prix extrêmes.
def median(values: list[Decimal]) -> Decimal | None:
    if not values:
        return None
    ordered = sorted(values)
    midpoint = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[midpoint]
    return (ordered[midpoint - 1] + ordered[midpoint]) / Decimal("2")



# Calcule un percentile par interpolation linéaire.
# Exemple : le 25e percentile sert à obtenir le quart inférieur des prix.
def percentile(values: list[Decimal], percent: Decimal) -> Decimal | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    rank = (Decimal(len(ordered) - 1) * percent) / Decimal("100")
    lower = int(rank)
    upper = min(lower + 1, len(ordered) - 1)
    fraction = rank - Decimal(lower)
    return ordered[lower] + (ordered[upper] - ordered[lower]) * fraction



# Supprime les valeurs aberrantes avec la méthode IQR.
# Elle garde les prix situés dans l’intervalle [Q1 - 1.5 IQR, Q3 + 1.5 IQR].
def remove_iqr_outliers(values: list[Decimal]) -> list[Decimal]:
    if len(values) < 4:
        return values
    q1 = percentile(values, Decimal("25"))
    q3 = percentile(values, Decimal("75"))
    if q1 is None or q3 is None:
        return values
    iqr = q3 - q1
    lower = q1 - Decimal("1.5") * iqr
    upper = q3 + Decimal("1.5") * iqr
    filtered = [value for value in values if lower <= value <= upper]
    return filtered or values



# Calcule une moyenne pondérée.
# Chaque valeur contribue selon son poids, ce qui permet de donner plus d’importance aux biens les plus similaires.
def weighted_average(values: list[tuple[Decimal, Decimal]]) -> Decimal | None:
    numerator = sum(value * weight for value, weight in values)
    denominator = sum(weight for _, weight in values)
    if denominator <= 0:
        return None
    return numerator / denominator



# Normalise un texte avant comparaison : suppression des espaces inutiles et passage en minuscules robustes.
# Cela évite les différences dues aux majuscules/minuscules ou aux espaces.
def normalize(value: str) -> str:
    return (value or "").strip().casefold()



# Arrondit une valeur optionnelle si elle existe.
# Si la valeur est None, la fonction retourne None sans erreur.
def quantize_optional(value: Decimal | None, quantum: Decimal) -> Decimal | None:
    if value is None:
        return None
    return value.quantize(quantum)



# Prépare le résultat d’un modèle pour l’envoyer au frontend ou l’enregistrer.
# Elle garde uniquement les champs importants : méthode, statut, estimation, confiance, taille d’échantillon et message.
def serialize_model_result(result: dict) -> dict:
    return {
        "method": result.get("method"),
        "status": result.get("status"),
        "estimated_value": result.get("estimated_value"),
        "estimated_price_per_sqm": result.get("estimated_price_per_sqm"),
        "confidence_score": result.get("confidence_score"),
        "sample_size": result.get("sample_size", 0),
        "message": result.get("message", ""),
    }



# Récupère les images d’une annonce.
# La fonction lit d’abord image_urls, puis cherche dans raw_payload si nécessaire.
def listing_images(listing) -> list[str]:
    images = getattr(listing, "image_urls", None)
    if isinstance(images, list):
        return [image for image in images if isinstance(image, str) and image]
    raw_payload = getattr(listing, "raw_payload", {}) or {}
    if not isinstance(raw_payload, dict):
        return []
    raw_images = raw_payload.get("images", [])
    if not isinstance(raw_images, list):
        return []
    return [image for image in raw_images if isinstance(image, str) and image]



# Calcule une similarité simple entre deux textes.
# Elle sert à comparer les villes, quartiers ou types de biens même si les textes ne sont pas exactement identiques.
def text_similarity(left: str, right: str) -> Decimal:
    normalized_left = normalize(left)
    normalized_right = normalize(right)
    if not normalized_left or not normalized_right:
        return Decimal("0")
    if normalized_left == normalized_right:
        return Decimal("1")
    if normalized_left in normalized_right or normalized_right in normalized_left:
        return Decimal("0.82")

    left_tokens = {token for token in normalized_left.replace("-", " ").split() if token}
    right_tokens = {token for token in normalized_right.replace("-", " ").split() if token}
    if not left_tokens or not right_tokens:
        return Decimal("0")

    overlap = left_tokens & right_tokens
    if not overlap:
        return Decimal("0")
    union = left_tokens | right_tokens
    return Decimal(str(len(overlap) / len(union)))



# Attribue un score selon la récence d’une annonce.
# Une annonce récente reçoit un score plus élevé car elle reflète mieux le marché actuel.
def listing_recency_score(listing) -> Decimal:
    last_seen_at = getattr(listing, "last_seen_at", None)
    if not last_seen_at:
        return Decimal("0.84")

    try:
        age_days = Decimal(str(max((timezone.now() - last_seen_at).total_seconds(), 0) / 86400))
    except Exception:
        return Decimal("0.84")

    if age_days <= Decimal("7"):
        return Decimal("1")
    if age_days <= Decimal("30"):
        return Decimal("0.95")
    if age_days <= Decimal("90"):
        return Decimal("0.88")
    if age_days <= Decimal("180"):
        return Decimal("0.80")
    return Decimal("0.72")



# Mesure la qualité/completude d’une annonce.
# Plus l’annonce contient de champs importants et d’images, plus son score est élevé.
def listing_completeness_score(listing) -> Decimal:
    checkpoints = [
        getattr(listing, "city", ""),
        getattr(listing, "district", ""),
        getattr(listing, "asset_type", ""),
        getattr(listing, "area_sqm", None),
        getattr(listing, "bedrooms", None),
        getattr(listing, "bathrooms", None),
    ]
    populated = sum(1 for value in checkpoints if value not in {None, ""})
    ratio = Decimal(populated) / Decimal(len(checkpoints))
    image_bonus = Decimal("0.06") if listing_images(listing) else Decimal("0")
    return bounded(Decimal("0.72") + ratio * Decimal("0.28") + image_bonus, Decimal("0.72"), Decimal("1.00"))



# Calcule le score global de similarité entre le bien étudié et une annonce.
# Le score combine type de bien, ville, quartier, surface, chambres, salles de bain, récence et complétude.
def feature_similarity(subject: dict, listing) -> Decimal:
    score = Decimal("0")
    total = Decimal("0")

    def add(weight: str, value: Decimal):
        nonlocal score, total
        decimal_weight = Decimal(weight)
        total += decimal_weight
        score += decimal_weight * bounded(value, Decimal("0"), Decimal("1"))

    subject_type = normalize(subject.get("asset_type"))
    listing_type = normalize(getattr(listing, "asset_type", ""))
    if subject_type:
        add("0.22", Decimal("1") if subject_type == listing_type else Decimal("0.05"))
    else:
        add("0.22", Decimal("0.35"))

    subject_city = normalize(subject.get("city"))
    listing_city = normalize(getattr(listing, "city", ""))
    if subject_city:
        add("0.25", Decimal("1") if subject_city == listing_city else text_similarity(subject_city, listing_city))
    else:
        add("0.25", Decimal("0.30"))

    subject_district = normalize(subject.get("district"))
    listing_district = normalize(getattr(listing, "district", ""))
    if subject_district and listing_district:
        add("0.17", text_similarity(subject_district, listing_district))
    else:
        add("0.17", Decimal("0.30") if subject_city and subject_city == listing_city else Decimal("0.12"))

    subject_area = to_decimal(subject.get("area_sqm"))
    listing_area = to_decimal(getattr(listing, "area_sqm", None))
    if subject_area and listing_area and subject_area > 0 and listing_area > 0:
        relative_gap = abs(subject_area - listing_area) / max(subject_area, listing_area)
        area_score = Decimal("1") - bounded(relative_gap, Decimal("0"), Decimal("1"))
        if relative_gap > Decimal("0.60"):
            area_score *= Decimal("0.60")
        add("0.20", area_score)
    else:
        add("0.20", Decimal("0.25"))

    for key, weight in [("bedrooms", "0.10"), ("bathrooms", "0.08")]:
        subject_value = to_decimal(subject.get(key))
        listing_value = to_decimal(getattr(listing, key, None))
        if subject_value is None or listing_value is None:
            add(weight, Decimal("0.35"))
            continue
        gap = abs(subject_value - listing_value)
        add(weight, Decimal("1") if gap == 0 else max(Decimal("0"), Decimal("1") - gap / Decimal("3")))

    if total == 0:
        return Decimal("0")
    base_similarity = score / total
    recency = listing_recency_score(listing)
    completeness = listing_completeness_score(listing)
    adjusted = base_similarity * (Decimal("0.90") + recency * Decimal("0.06") + completeness * Decimal("0.04"))
    return bounded(adjusted, Decimal("0"), Decimal("1")).quantize(Decimal("0.0001"))



# Construit la liste des annonces comparables au bien étudié.
# La fonction filtre les annonces invalides, calcule le prix/m², vérifie les écarts et trie par similarité.
def build_comparables(
    subject: dict,
    listings: Iterable,
    *,
    transaction_type: str,
    min_similarity: Decimal = Decimal("0.25"),
    max_comparables: int = 12,
) -> list[Comparable]:
    comparables: list[Comparable] = []
    for listing in listings:
        if getattr(listing, "transaction_type", "") != transaction_type:
            continue

        price = to_decimal(getattr(listing, "price", None))
        area = to_decimal(getattr(listing, "area_sqm", None))
        if not price or not area or price <= 0 or area <= 0:
            continue

        price_per_sqm = price / area
        if price_per_sqm < Decimal("100") or price_per_sqm > Decimal("250000"):
            continue

        subject_area = to_decimal(subject.get("area_sqm"))
        if subject_area and subject_area > 0:
            relative_area_gap = abs(subject_area - area) / max(subject_area, area)
            if relative_area_gap > Decimal("0.75"):
                continue

        subject_type = normalize(subject.get("asset_type"))
        listing_type = normalize(getattr(listing, "asset_type", ""))
        if subject_type and listing_type and subject_type != listing_type:
            continue

        for key, max_gap in [("bedrooms", Decimal("4")), ("bathrooms", Decimal("3"))]:
            subject_value = to_decimal(subject.get(key))
            listing_value = to_decimal(getattr(listing, key, None))
            if subject_value is None or listing_value is None:
                continue
            if abs(subject_value - listing_value) > max_gap:
                break
        else:
            similarity = feature_similarity(subject, listing)
            if similarity < min_similarity:
                continue

            images = listing_images(listing)
            comparables.append(
                Comparable(
                    id=getattr(listing, "id", None),
                    title=getattr(listing, "title", ""),
                    source=getattr(listing, "source", ""),
                    asset_type=getattr(listing, "asset_type", ""),
                    external_url=getattr(listing, "external_url", ""),
                    image_urls=images,
                    primary_image_url=images[0] if images else "",
                    city=getattr(listing, "city", ""),
                    district=getattr(listing, "district", ""),
                    price=quantize_money(price),
                    area_sqm=area.quantize(MONEY),
                    price_per_sqm=quantize_money(price_per_sqm),
                    similarity_score=similarity,
                )
            )
            continue

    comparables.sort(key=lambda item: item.similarity_score, reverse=True)
    return comparables[:max_comparables]



# Prépare les données d’apprentissage à partir des annonces du marché.
# Elle transforme chaque annonce valide en TrainingRow et supprime les prix/m² aberrants.
def collect_training_rows(
    listings: Iterable,
    *,
    transaction_type: str,
    max_rows: int = 1200,
) -> list[TrainingRow]:
    rows: list[TrainingRow] = []
    for listing in listings:
        if getattr(listing, "transaction_type", "") != transaction_type:
            continue

        price = to_decimal(getattr(listing, "price", None))
        area = to_decimal(getattr(listing, "area_sqm", None))
        if not price or not area or price <= 0 or area <= 0:
            continue

        price_per_sqm = price / area
        if price_per_sqm < Decimal("100") or price_per_sqm > Decimal("250000"):
            continue

        rows.append(
            TrainingRow(
                city=normalize(getattr(listing, "city", "")),
                district=normalize(getattr(listing, "district", "")),
                asset_type=normalize(getattr(listing, "asset_type", "")),
                area_sqm=area,
                bedrooms=to_decimal(getattr(listing, "bedrooms", None), Decimal("0")) or Decimal("0"),
                bathrooms=to_decimal(getattr(listing, "bathrooms", None), Decimal("0")) or Decimal("0"),
                price_per_sqm=price_per_sqm,
                last_seen_at=getattr(listing, "last_seen_at", None),
            )
        )

        if len(rows) >= max_rows:
            break

    prices = remove_iqr_outliers([row.price_per_sqm for row in rows])
    robust_prices = set(prices)
    return [row for row in rows if row.price_per_sqm in robust_prices]



# Sélectionne les lignes d’apprentissage les plus proches du bien étudié.
# Elle utilise le score de similarité et baisse progressivement le seuil pour obtenir assez de données.
def select_training_rows_for_subject(
    subject: dict,
    rows: list[TrainingRow],
    *,
    max_rows: int = 220,
    min_rows: int = 12,
) -> list[TrainingRow]:
    if not rows:
        return []

    scored_rows = [
        (feature_similarity(subject, row), row)
        for row in rows
    ]
    scored_rows = [(score, row) for score, row in scored_rows if score >= Decimal("0.18")]
    if not scored_rows:
        return rows[:max_rows]

    scored_rows.sort(
        key=lambda item: (
            item[0],
            listing_recency_score(item[1]),
            item[1].price_per_sqm,
        ),
        reverse=True,
    )

    for threshold in [
        Decimal("0.88"),
        Decimal("0.78"),
        Decimal("0.68"),
        Decimal("0.58"),
        Decimal("0.48"),
        Decimal("0.35"),
        Decimal("0.25"),
    ]:
        candidates = [row for score, row in scored_rows if score >= threshold]
        if len(candidates) >= min_rows:
            return candidates[:max_rows]

    return [row for _, row in scored_rows[:max_rows]]



# Compte le nombre d’occurrences d’une catégorie dans les lignes d’apprentissage.
# Exemple : nombre d’annonces par ville, quartier ou type de bien.
def category_counts(rows: list[TrainingRow], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        value = getattr(row, key)
        if not value:
            continue
        counts[value] = counts.get(value, 0) + 1
    return counts



# Retourne les catégories les plus fréquentes pour une variable donnée.
# Ces catégories sont utilisées ensuite comme variables indicatrices dans la régression.
def top_categories(rows: list[TrainingRow], key: str, limit: int = 8) -> list[str]:
    counts = category_counts(rows, key)
    return [
        value
        for value, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:limit]
    ]



# Calcule le produit entre une matrice et un vecteur.
# Utilisée pour appliquer les coefficients de régression aux variables du bien.
def matrix_vector_product(matrix: list[list[float]], vector: list[float]) -> list[float]:
    return [sum(row[index] * vector[index] for index in range(len(vector))) for row in matrix]



# Résout un système linéaire avec la méthode d’élimination de Gauss-Jordan.
# Elle sert à calculer les coefficients de la régression Ridge sans bibliothèque externe.
def solve_linear_system(matrix: list[list[float]], vector: list[float]) -> list[float] | None:
    size = len(vector)
    augmented = [matrix[row][:] + [vector[row]] for row in range(size)]

    for column in range(size):
        pivot = max(range(column, size), key=lambda row: abs(augmented[row][column]))
        if abs(augmented[pivot][column]) < 1e-9:
            return None
        if pivot != column:
            augmented[column], augmented[pivot] = augmented[pivot], augmented[column]

        pivot_value = augmented[column][column]
        for item in range(column, size + 1):
            augmented[column][item] /= pivot_value

        for row in range(size):
            if row == column:
                continue
            factor = augmented[row][column]
            if factor == 0:
                continue
            for item in range(column, size + 1):
                augmented[row][item] -= factor * augmented[column][item]

    return [augmented[row][size] for row in range(size)]



# Transforme les caractéristiques d’un bien en vecteur numérique pour la régression.
# Le vecteur contient surface, log(surface), chambres, salles de bain et variables catégorielles.
def build_regression_vector(
    *,
    area_sqm: Decimal | None,
    bedrooms: Decimal | None,
    bathrooms: Decimal | None,
    asset_type: str,
    city: str,
    district: str,
    asset_categories: list[str],
    city_categories: list[str],
    district_categories: list[str],
) -> list[float]:
    area = float(area_sqm or Decimal("0"))
    bed_count = float(bedrooms or Decimal("0"))
    bath_count = float(bathrooms or Decimal("0"))
    safe_area = max(area, 1.0)
    vector = [
        1.0,
        min(area, 1000.0) / 100.0,
        log1p(min(area, 2000.0)),
        min(area * area, 1_000_000.0) / 10000.0,
        min(bed_count, 10.0) / 5.0,
        min(bath_count, 10.0) / 5.0,
        min((bed_count / safe_area) * 100.0, 12.0) / 12.0,
        min((bath_count / safe_area) * 100.0, 8.0) / 8.0,
    ]
    vector.extend(1.0 if asset_type == value else 0.0 for value in asset_categories)
    vector.extend(1.0 if city == value else 0.0 for value in city_categories)
    vector.extend(1.0 if district == value else 0.0 for value in district_categories)
    return vector



# Calcule les coefficients d’une régression Ridge.
# La régularisation alpha stabilise le modèle et limite les coefficients trop extrêmes.
def ridge_coefficients(
    features: list[list[float]],
    targets: list[float],
    *,
    alpha: float = 0.55,
    sample_weights: list[float] | None = None,
) -> list[float] | None:
    if not features or not targets:
        return None
    width = len(features[0])
    xtx = [[0.0 for _ in range(width)] for _ in range(width)]
    xty = [0.0 for _ in range(width)]

    for index, (row, target) in enumerate(zip(features, targets, strict=False)):
        weight = sample_weights[index] if sample_weights else 1.0
        for left in range(width):
            xty[left] += row[left] * target * weight
            for right in range(width):
                xtx[left][right] += row[left] * row[right] * weight

    for index in range(1, width):
        xtx[index][index] += alpha

    return solve_linear_system(xtx, xty)



# Estime la valeur du bien avec une régression hédonique Ridge.
# Le modèle apprend le prix/m² à partir des caractéristiques du marché, puis multiplie par la surface du bien étudié.
def estimate_with_hedonic_regression(
    subject: dict,
    rows: list[TrainingRow],
    *,
    min_training_rows: int = 8,
) -> dict:
    subject_area = to_decimal(subject.get("area_sqm"))
    if not subject_area or subject_area <= 0:
        return {
            "method": "hedonic_ridge_regression",
            "status": "insufficient_input",
            "message": "area_sqm is required for regression valuation.",
            "estimated_value": None,
            "estimated_price_per_sqm": None,
            "confidence_score": Decimal("0.00"),
            "sample_size": 0,
        }

    if len(rows) < min_training_rows:
        return {
            "method": "hedonic_ridge_regression",
            "status": "low_sample",
            "message": "Not enough market listings to train the regression model.",
            "estimated_value": None,
            "estimated_price_per_sqm": None,
            "confidence_score": Decimal("0.00"),
            "sample_size": len(rows),
        }

    selected_rows = select_training_rows_for_subject(subject, rows, min_rows=min_training_rows)
    if len(selected_rows) < min_training_rows:
        selected_rows = rows[: min(len(rows), 160)]

    asset_categories = top_categories(selected_rows, "asset_type", 8)
    city_categories = top_categories(selected_rows, "city", 10)
    district_categories = top_categories(selected_rows, "district", 12)

    features = [
        build_regression_vector(
            area_sqm=row.area_sqm,
            bedrooms=row.bedrooms,
            bathrooms=row.bathrooms,
            asset_type=row.asset_type,
            city=row.city,
            district=row.district,
            asset_categories=asset_categories,
            city_categories=city_categories,
            district_categories=district_categories,
        )
        for row in selected_rows
    ]
    targets = [log1p(float(row.price_per_sqm)) for row in selected_rows]
    sample_weights = [
        float(
            bounded(
                feature_similarity(subject, row) * Decimal("0.78")
                + listing_recency_score(row) * Decimal("0.14")
                + listing_completeness_score(row) * Decimal("0.08"),
                Decimal("0.18"),
                Decimal("1.00"),
            )
        )
        for row in selected_rows
    ]
    coefficients = ridge_coefficients(features, targets, sample_weights=sample_weights)
    if coefficients is None:
        return {
            "method": "hedonic_ridge_regression",
            "status": "model_error",
            "message": "Regression matrix could not be solved.",
            "estimated_value": None,
            "estimated_price_per_sqm": None,
            "confidence_score": Decimal("0.00"),
            "sample_size": len(selected_rows),
        }

    subject_vector = build_regression_vector(
        area_sqm=subject_area,
        bedrooms=to_decimal(subject.get("bedrooms"), Decimal("0")),
        bathrooms=to_decimal(subject.get("bathrooms"), Decimal("0")),
        asset_type=normalize(subject.get("asset_type")),
        city=normalize(subject.get("city")),
        district=normalize(subject.get("district")),
        asset_categories=asset_categories,
        city_categories=city_categories,
        district_categories=district_categories,
    )
    prediction_log = matrix_vector_product([subject_vector], coefficients)[0]
    prediction = Decimal(str(expm1(prediction_log)))

    prices = [row.price_per_sqm for row in selected_rows]
    p10 = percentile(prices, Decimal("10")) or min(prices)
    p90 = percentile(prices, Decimal("90")) or max(prices)
    prediction = bounded(prediction, p10, p90)

    residuals = [
        abs(Decimal(str(expm1(predicted))) - row.price_per_sqm) / max(row.price_per_sqm, Decimal("1"))
        for predicted, row in zip(matrix_vector_product(features, coefficients), selected_rows, strict=False)
    ]
    median_residual_ratio = median(residuals) or Decimal("0")
    error_ratio = bounded(median_residual_ratio, Decimal("0"), Decimal("1"))
    sample_factor = bounded(Decimal(len(selected_rows)) / Decimal("60"), Decimal("0"), Decimal("1"))
    local_rows = sum(1 for row in selected_rows if feature_similarity(subject, row) >= Decimal("0.70"))
    local_factor = bounded(Decimal(local_rows) / Decimal("18"), Decimal("0"), Decimal("1"))
    coverage_factor = Decimal("0.68")
    subject_city = normalize(subject.get("city"))
    subject_district = normalize(subject.get("district"))
    if subject_city and subject_city in city_categories:
        coverage_factor += Decimal("0.15")
    if subject_district and subject_district in district_categories:
        coverage_factor += Decimal("0.15")
    confidence = (
        Decimal("38")
        + sample_factor * Decimal("18")
        + local_factor * Decimal("18")
        + coverage_factor * Decimal("18")
        - error_ratio * Decimal("36")
    )

    estimated_value = prediction * subject_area
    interval = bounded(error_ratio + Decimal("0.08"), Decimal("0.08"), Decimal("0.30"))

    return {
        "method": "hedonic_ridge_regression",
        "status": "ok",
        "estimated_value": quantize_money(estimated_value),
        "low_estimate": quantize_money(estimated_value * (Decimal("1") - interval)),
        "high_estimate": quantize_money(estimated_value * (Decimal("1") + interval)),
        "estimated_price_per_sqm": quantize_money(prediction),
        "confidence_score": quantize_percent(bounded(confidence, Decimal("0"), Decimal("90"))),
        "sample_size": len(selected_rows),
        "local_training_rows": local_rows,
        "validation_error_ratio": quantize_percent(error_ratio * Decimal("100")),
    }



# Vérifie si une ligne d’apprentissage correspond au bien étudié selon un niveau de précision.
# Les niveaux possibles sont : quartier+type, ville+type, ville, type de bien ou marché global.
def row_matches_subject(row: TrainingRow, subject: dict, *, level: str) -> bool:
    subject_city = normalize(subject.get("city"))
    subject_district = normalize(subject.get("district"))
    subject_type = normalize(subject.get("asset_type"))

    if level == "district_type":
        return bool(subject_city and subject_district and subject_type) and (
            row.city == subject_city and row.district == subject_district and row.asset_type == subject_type
        )
    if level == "city_type":
        return bool(subject_city and subject_type) and row.city == subject_city and row.asset_type == subject_type
    if level == "city":
        return bool(subject_city) and row.city == subject_city
    if level == "asset_type":
        return bool(subject_type) and row.asset_type == subject_type
    return True



# Estime la valeur avec une méthode de référence basée sur les segments du marché.
# Elle prend la médiane du prix/m² du segment le plus précis disponible, avec un fallback plus général.
def estimate_with_market_baseline(
    subject: dict,
    rows: list[TrainingRow],
    *,
    min_segment_rows: int = 3,
) -> dict:
    subject_area = to_decimal(subject.get("area_sqm"))
    if not subject_area or subject_area <= 0:
        return {
            "method": "market_segment_baseline",
            "status": "insufficient_input",
            "message": "area_sqm is required for market baseline valuation.",
            "estimated_value": None,
            "estimated_price_per_sqm": None,
            "confidence_score": Decimal("0.00"),
            "sample_size": 0,
        }

    levels = ["district_type", "city_type", "city", "asset_type", "all"]
    level_matches: dict[str, list[TrainingRow]] = {}
    selected_rows: list[TrainingRow] = []
    selected_level = "all"
    for level in levels:
        matches = [row for row in rows if row_matches_subject(row, subject, level=level)]
        if level != "all":
            matches = select_training_rows_for_subject(subject, matches, max_rows=120, min_rows=min_segment_rows)
        level_matches[level] = matches
        if not selected_rows and (len(matches) >= min_segment_rows or (level == "all" and matches)):
            selected_rows = matches
            selected_level = level

    if not selected_rows:
        return {
            "method": "market_segment_baseline",
            "status": "no_comparables",
            "message": "No market baseline could be computed.",
            "estimated_value": None,
            "estimated_price_per_sqm": None,
            "confidence_score": Decimal("0.00"),
            "sample_size": 0,
        }

    prices = [row.price_per_sqm for row in selected_rows]
    segment_median = median(prices) or Decimal("0")
    low = percentile(prices, Decimal("25")) or segment_median
    high = percentile(prices, Decimal("75")) or segment_median

    fallback_level = "all"
    for level in levels[levels.index(selected_level) + 1 :]:
        if level_matches.get(level):
            fallback_level = level
            break
    fallback_prices = [row.price_per_sqm for row in level_matches.get(fallback_level, [])]
    fallback_median = median(fallback_prices) or segment_median

    segment_weight = bounded(
        Decimal(len(selected_rows)) / Decimal("12"),
        Decimal("0.45"),
        Decimal("0.88"),
    )
    estimate = (segment_median * segment_weight) + (fallback_median * (Decimal("1") - segment_weight))
    level_bonus = {
        "district_type": Decimal("30"),
        "city_type": Decimal("24"),
        "city": Decimal("18"),
        "asset_type": Decimal("12"),
        "all": Decimal("6"),
    }[selected_level]
    sample_factor = bounded(Decimal(len(selected_rows)) / Decimal("25"), Decimal("0"), Decimal("1"))
    stability_bonus = bounded(Decimal("1") - abs(segment_median - fallback_median) / max(segment_median, Decimal("1")), Decimal("0"), Decimal("1"))
    confidence = Decimal("30") + level_bonus + sample_factor * Decimal("18") + stability_bonus * Decimal("12")

    return {
        "method": "market_segment_baseline",
        "status": "ok" if len(selected_rows) >= min_segment_rows else "low_sample",
        "segment": selected_level,
        "fallback_segment": fallback_level,
        "estimated_value": quantize_money(estimate * subject_area),
        "low_estimate": quantize_money(min(low, estimate) * subject_area),
        "high_estimate": quantize_money(max(high, estimate) * subject_area),
        "estimated_price_per_sqm": quantize_money(estimate),
        "confidence_score": quantize_percent(bounded(confidence, Decimal("0"), Decimal("85"))),
        "sample_size": len(selected_rows),
    }



# Estime la valeur avec une approche KNN pondérée par comparables.
# Elle cherche les annonces les plus similaires et calcule une moyenne pondérée du prix/m².
def estimate_from_comparables(
    subject: dict,
    listings: Iterable,
    *,
    transaction_type: str = "sale",
    min_comparables: int = 3,
    max_comparables: int = 12,
) -> dict:
    subject_area = to_decimal(subject.get("area_sqm"))
    if not subject_area or subject_area <= 0:
        return {
            "method": "weighted_comparable_knn",
            "status": "insufficient_input",
            "message": "area_sqm is required for comparable valuation.",
            "estimated_value": None,
            "low_estimate": None,
            "high_estimate": None,
            "confidence_score": Decimal("0.00"),
            "comparables": [],
        }

    comparables = build_comparables(
        subject,
        listings,
        transaction_type=transaction_type,
        max_comparables=max_comparables,
    )
    subject_type = normalize(subject.get("asset_type"))
    subject_city = normalize(subject.get("city"))
    subject_district = normalize(subject.get("district"))
    candidate_groups = [
        [
            item
            for item in comparables
            if subject_type
            and subject_city
            and subject_district
            and normalize(item.city) == subject_city
            and normalize(item.district) == subject_district
            and normalize(item.asset_type) == subject_type
        ],
        [
            item
            for item in comparables
            if subject_type
            and subject_city
            and normalize(item.city) == subject_city
            and normalize(item.asset_type) == subject_type
        ],
        [item for item in comparables if subject_type and normalize(item.asset_type) == subject_type],
        [item for item in comparables if subject_city and normalize(item.city) == subject_city],
    ]
    for candidate_group in candidate_groups:
        if len(candidate_group) >= min_comparables:
            comparables = candidate_group[:max_comparables]
            break

    if not comparables:
        return {
            "method": "weighted_comparable_knn",
            "status": "no_comparables",
            "message": "No comparable market listings found.",
            "estimated_value": None,
            "low_estimate": None,
            "high_estimate": None,
            "confidence_score": Decimal("0.00"),
            "comparables": [],
        }

    prices_per_sqm = [item.price_per_sqm for item in comparables]
    robust_values = set(remove_iqr_outliers(prices_per_sqm))
    weighted_values = [
        (
            item.price_per_sqm,
            item.similarity_score
            * item.similarity_score
            * (Decimal("0.75") + text_similarity(subject.get("district", ""), item.district) * Decimal("0.15"))
            * (Decimal("0.85") + text_similarity(subject.get("city", ""), item.city) * Decimal("0.15")),
        )
        for item in comparables
        if item.price_per_sqm in robust_values
    ]

    estimated_price_per_sqm = weighted_average(weighted_values) or median(prices_per_sqm)
    low_price_per_sqm = percentile(prices_per_sqm, Decimal("25")) or estimated_price_per_sqm
    high_price_per_sqm = percentile(prices_per_sqm, Decimal("75")) or estimated_price_per_sqm

    estimated_value = estimated_price_per_sqm * subject_area
    low_estimate = min(low_price_per_sqm, estimated_price_per_sqm) * subject_area
    high_estimate = max(high_price_per_sqm, estimated_price_per_sqm) * subject_area

    avg_similarity = sum(item.similarity_score for item in comparables) / Decimal(len(comparables))
    exact_match_count = sum(
        1
        for item in comparables
        if normalize(item.city) == normalize(subject.get("city"))
        and text_similarity(item.district, subject.get("district", "")) >= Decimal("0.82")
    )
    sample_factor = bounded(Decimal(len(comparables)) / Decimal(max(min_comparables, 1) * 2), Decimal("0"), Decimal("1"))
    locality_factor = bounded(Decimal(exact_match_count) / Decimal("4"), Decimal("0"), Decimal("1"))
    confidence = Decimal("26") + avg_similarity * Decimal("42") + sample_factor * Decimal("22") + locality_factor * Decimal("10")
    if len(comparables) < min_comparables:
        confidence *= Decimal("0.65")

    return {
        "method": "weighted_comparable_knn",
        "status": "ok" if len(comparables) >= min_comparables else "low_sample",
        "transaction_type": transaction_type,
        "estimated_value": quantize_money(estimated_value),
        "low_estimate": quantize_money(low_estimate),
        "high_estimate": quantize_money(high_estimate),
        "estimated_price_per_sqm": quantize_money(estimated_price_per_sqm),
        "confidence_score": quantize_percent(bounded(confidence, Decimal("0"), Decimal("95"))),
        "sample_size": len(comparables),
        "avg_similarity": avg_similarity.quantize(Decimal("0.0001")),
        "exact_match_count": exact_match_count,
        "comparables": [comparable.__dict__ for comparable in comparables],
    }



# Calcule le poids d’un modèle dans l’estimation finale.
# Plus un modèle est fiable, local et basé sur assez de données, plus son poids est important.
def ensemble_model_weight(result: dict) -> Decimal:
    method = result.get("method", "")
    confidence = to_decimal(result.get("confidence_score"), Decimal("0")) or Decimal("0")
    confidence_factor = bounded(confidence / Decimal("100"), Decimal("0.12"), Decimal("1.00"))

    if method == "weighted_comparable_knn":
        base = Decimal("0.42")
        similarity = to_decimal(result.get("avg_similarity"), Decimal("0.50")) or Decimal("0.50")
        exact_match_count = Decimal(str(result.get("exact_match_count", 0)))
        locality_factor = bounded(exact_match_count / Decimal("4"), Decimal("0"), Decimal("1"))
        sample_factor = bounded(Decimal(result.get("sample_size", 0)) / Decimal("8"), Decimal("0"), Decimal("1"))
        strength = Decimal("0.45") + similarity * Decimal("0.35") + locality_factor * Decimal("0.12") + sample_factor * Decimal("0.08")
        return base * confidence_factor * bounded(strength, Decimal("0.25"), Decimal("1.00"))

    if method == "hedonic_ridge_regression":
        base = Decimal("0.36")
        local_rows = Decimal(str(result.get("local_training_rows", 0)))
        sample_size = Decimal(str(result.get("sample_size", 0)))
        validation_error = to_decimal(result.get("validation_error_ratio"), Decimal("18")) or Decimal("18")
        local_factor = bounded(local_rows / Decimal("20"), Decimal("0"), Decimal("1"))
        sample_factor = bounded(sample_size / Decimal("80"), Decimal("0"), Decimal("1"))
        stability = Decimal("1") - bounded(validation_error / Decimal("45"), Decimal("0"), Decimal("0.70"))
        strength = Decimal("0.40") + local_factor * Decimal("0.30") + sample_factor * Decimal("0.18") + stability * Decimal("0.12")
        return base * confidence_factor * bounded(strength, Decimal("0.20"), Decimal("1.00"))

    if method == "market_segment_baseline":
        base = Decimal("0.22")
        segment = result.get("segment", "all")
        segment_bonus = {
            "district_type": Decimal("1.00"),
            "city_type": Decimal("0.88"),
            "city": Decimal("0.76"),
            "asset_type": Decimal("0.62"),
            "all": Decimal("0.50"),
        }.get(segment, Decimal("0.50"))
        sample_factor = bounded(Decimal(result.get("sample_size", 0)) / Decimal("18"), Decimal("0"), Decimal("1"))
        strength = Decimal("0.40") + segment_bonus * Decimal("0.40") + sample_factor * Decimal("0.20")
        return base * confidence_factor * bounded(strength, Decimal("0.18"), Decimal("0.92"))

    return Decimal("0.10") * confidence_factor



# Fonction principale du moteur IA d’estimation immobilière.
# Elle combine trois modèles : comparables KNN, régression Ridge et baseline marché, puis produit une estimation finale.
def estimate_with_ml_models(
    subject: dict,
    listings: Iterable,
    *,
    transaction_type: str = "sale",
) -> dict:
    market_rows = list(listings)
    comparable_estimate = estimate_from_comparables(
        subject,
        market_rows,
        transaction_type=transaction_type,
    )
    training_rows = collect_training_rows(market_rows, transaction_type=transaction_type)
    regression_estimate = estimate_with_hedonic_regression(subject, training_rows)
    baseline_estimate = estimate_with_market_baseline(subject, training_rows)
    model_results = [comparable_estimate, regression_estimate, baseline_estimate]

    valid_models = [
        result
        for result in model_results
        if result.get("estimated_value") is not None and result.get("status") in {"ok", "low_sample"}
    ]
    if not valid_models:
        return {
            "method": "ml_ensemble_v1",
            "model_version": "ensemble_knn_ridge_baseline_v2",
            "status": "no_comparables",
            "message": "No trained ML estimate could be produced from current market data.",
            "transaction_type": transaction_type,
            "estimated_value": None,
            "low_estimate": None,
            "high_estimate": None,
            "estimated_price_per_sqm": None,
            "confidence_score": Decimal("0.00"),
            "sample_size": 0,
            "training_rows": len(training_rows),
            "models": [serialize_model_result(result) for result in model_results],
            "comparables": comparable_estimate.get("comparables", []),
        }

    weighted_values = []
    weighted_low = []
    weighted_high = []
    weighted_price_per_sqm = []
    model_weights = []
    for result in valid_models:
        weight = ensemble_model_weight(result)
        estimated_value = to_decimal(result.get("estimated_value"))
        low_estimate = to_decimal(result.get("low_estimate"), estimated_value)
        high_estimate = to_decimal(result.get("high_estimate"), estimated_value)
        price_per_sqm = to_decimal(result.get("estimated_price_per_sqm"))
        if estimated_value is not None:
            weighted_values.append((estimated_value, weight))
            model_weights.append(weight)
        if low_estimate is not None:
            weighted_low.append((low_estimate, weight))
        if high_estimate is not None:
            weighted_high.append((high_estimate, weight))
        if price_per_sqm is not None:
            weighted_price_per_sqm.append((price_per_sqm, weight))

    estimated_value = weighted_average(weighted_values)
    if estimated_value is None:
        estimated_value = to_decimal(valid_models[0].get("estimated_value"))

    values = [to_decimal(result.get("estimated_value")) for result in valid_models]
    values = [value for value in values if value is not None and value > 0]
    mean_value = Decimal(str(fmean(float(value) for value in values))) if values else estimated_value
    if mean_value and mean_value > 0 and len(values) > 1:
        avg_abs_gap = sum(abs(value - mean_value) for value in values) / Decimal(len(values))
        disagreement_penalty = bounded(avg_abs_gap / mean_value, Decimal("0"), Decimal("0.40")) * Decimal("50")
    else:
        disagreement_penalty = Decimal("8")

    model_confidences = [
        to_decimal(result.get("confidence_score"), Decimal("0")) or Decimal("0")
        for result in valid_models
    ]
    weight_strength = bounded(sum(model_weights) / Decimal("0.80"), Decimal("0"), Decimal("1")) if model_weights else Decimal("0")
    confidence = (sum(model_confidences) / Decimal(len(model_confidences))) + Decimal(len(valid_models) * 4) + weight_strength * Decimal("8")
    confidence -= disagreement_penalty

    return {
        "method": "ml_ensemble_v1",
        "model_version": "ensemble_knn_ridge_baseline_v2",
        "status": "ok" if comparable_estimate.get("status") == "ok" or len(valid_models) >= 2 else "low_sample",
        "transaction_type": transaction_type,
        "estimated_value": quantize_money(estimated_value),
        "low_estimate": quantize_optional(weighted_average(weighted_low), MONEY),
        "high_estimate": quantize_optional(weighted_average(weighted_high), MONEY),
        "estimated_price_per_sqm": quantize_optional(weighted_average(weighted_price_per_sqm), MONEY),
        "confidence_score": quantize_percent(bounded(confidence, Decimal("0"), Decimal("95"))),
        "sample_size": comparable_estimate.get("sample_size", 0),
        "training_rows": len(training_rows),
        "models": [serialize_model_result(result) for result in model_results],
        "comparables": comparable_estimate.get("comparables", []),
    }



# Calcule un score d’opportunité d’investissement.
# Le score combine décote par rapport au marché, rendement locatif et confiance de l’estimation.
def score_investment_opportunity(subject: dict, sale_estimate: dict, rent_estimate: dict | None = None) -> dict:
    asking_price = to_decimal(subject.get("asking_price") or subject.get("price"))
    estimated_value = to_decimal(sale_estimate.get("estimated_value"))
    monthly_rent = to_decimal(subject.get("monthly_rent"))
    if monthly_rent is None and rent_estimate:
        monthly_rent = to_decimal(rent_estimate.get("estimated_value"))

    if not asking_price or asking_price <= 0 or not estimated_value or estimated_value <= 0:
        return {
            "status": "insufficient_input",
            "score": Decimal("0.00"),
            "signal": "missing_price",
            "message": "asking_price and a market value estimate are required.",
        }

    discount_ratio = (estimated_value - asking_price) / estimated_value
    discount_component = bounded((discount_ratio + Decimal("0.05")) / Decimal("0.30"), Decimal("0"), Decimal("1"))

    gross_yield = None
    yield_component = Decimal("0.35")
    if monthly_rent and monthly_rent > 0:
        gross_yield = (monthly_rent * Decimal("12") / asking_price) * Decimal("100")
        yield_component = bounded(gross_yield / Decimal("8"), Decimal("0"), Decimal("1"))

    confidence = to_decimal(sale_estimate.get("confidence_score"), Decimal("0"))
    confidence_component = bounded(confidence / Decimal("95"), Decimal("0"), Decimal("1"))

    score = discount_component * Decimal("45") + yield_component * Decimal("35") + confidence_component * Decimal("20")
    score = bounded(score, Decimal("0"), Decimal("100"))

    if score >= Decimal("75"):
        signal = "strong_buy"
    elif score >= Decimal("60"):
        signal = "watchlist"
    elif score >= Decimal("45"):
        signal = "neutral"
    else:
        signal = "avoid"

    return {
        "status": "ok",
        "score": quantize_percent(score),
        "signal": signal,
        "market_discount_percent": quantize_percent(discount_ratio * Decimal("100")),
        "gross_yield_percent": quantize_percent(gross_yield) if gross_yield is not None else None,
        "price_to_market": quantize_percent(asking_price / estimated_value),
    }



# Calcule la mensualité d’un crédit immobilier amortissable.
# Elle utilise le capital emprunté, le taux annuel et la durée du prêt.
def monthly_payment(principal: Decimal, annual_rate_percent: Decimal, years: int) -> Decimal:
    if principal <= 0 or years <= 0:
        return Decimal("0")
    monthly_rate = annual_rate_percent / Decimal("100") / Decimal("12")
    months = Decimal(years * 12)
    if monthly_rate == 0:
        return principal / months
    factor = Decimal(str(pow(float(1 + monthly_rate), int(months))))
    return principal * monthly_rate * factor / (factor - 1)



# Calcule le capital restant dû après un certain nombre de mois.
# Elle simule mois par mois les intérêts et le remboursement du prêt.
def remaining_principal(
    principal: Decimal,
    annual_rate_percent: Decimal,
    loan_years: int,
    paid_months: int,
) -> Decimal:
    if principal <= 0:
        return Decimal("0")
    payment = monthly_payment(principal, annual_rate_percent, loan_years)
    monthly_rate = annual_rate_percent / Decimal("100") / Decimal("12")
    balance = principal
    for _ in range(max(paid_months, 0)):
        interest = balance * monthly_rate
        balance = max(Decimal("0"), balance + interest - payment)
    return balance



# Calcule le taux de rentabilité interne IRR/TRI à partir des flux de trésorerie.
# La fonction utilise une recherche binaire pour trouver le taux qui annule la valeur actuelle nette.
def irr(cashflows: list[Decimal]) -> Decimal | None:
    if not cashflows or not any(value < 0 for value in cashflows) or not any(value > 0 for value in cashflows):
        return None

    low = Decimal("-0.95")
    high = Decimal("1.50")
    for _ in range(80):
        mid = (low + high) / Decimal("2")
        npv = Decimal("0")
        for period, cashflow in enumerate(cashflows):
            npv += cashflow / Decimal(str(pow(float(1 + mid), period)))
        if npv > 0:
            low = mid
        else:
            high = mid
    return (low + high) / Decimal("2")



# Simule un scénario complet d’investissement immobilier.
# Elle calcule crédit, cash-flow, valeur de sortie, dette restante, profit total, multiple et TRI projeté.
def simulate_investment_scenario(payload: dict) -> dict:
    purchase_price = to_decimal(payload.get("purchase_price"), Decimal("0")) or Decimal("0")
    down_payment = to_decimal(payload.get("down_payment"), Decimal("0")) or Decimal("0")
    monthly_rent = to_decimal(payload.get("monthly_rent"), Decimal("0")) or Decimal("0")
    loan_rate = to_decimal(payload.get("loan_rate"), Decimal("0")) or Decimal("0")
    loan_years = int(payload.get("loan_years") or 20)
    renovation_budget = to_decimal(payload.get("renovation_budget"), Decimal("0")) or Decimal("0")
    holding_period_years = int(payload.get("holding_period_years") or 10)
    annual_expense_rate = to_decimal(payload.get("annual_expense_rate"), Decimal("20")) or Decimal("20")
    appreciation_rate = to_decimal(payload.get("appreciation_rate"), Decimal("3")) or Decimal("3")
    exit_cost_rate = to_decimal(payload.get("exit_cost_rate"), Decimal("4")) or Decimal("4")

    loan_amount = max(Decimal("0"), purchase_price - down_payment)
    debt_service = monthly_payment(loan_amount, loan_rate, loan_years)
    annual_expenses = monthly_rent * Decimal("12") * annual_expense_rate / Decimal("100")
    annual_noi = monthly_rent * Decimal("12") - annual_expenses
    monthly_cashflow = annual_noi / Decimal("12") - debt_service

    exit_value = purchase_price * Decimal(str(pow(float(1 + appreciation_rate / Decimal("100")), holding_period_years)))
    balance_at_exit = remaining_principal(
        loan_amount,
        loan_rate,
        loan_years,
        holding_period_years * 12,
    )
    net_exit_proceeds = exit_value * (Decimal("1") - exit_cost_rate / Decimal("100")) - balance_at_exit
    initial_cash = down_payment + renovation_budget
    total_cashflow = monthly_cashflow * Decimal(holding_period_years * 12)
    profit = total_cashflow + net_exit_proceeds - initial_cash
    equity_multiple = (total_cashflow + net_exit_proceeds) / initial_cash if initial_cash > 0 else None

    monthly_cashflows = [-initial_cash] + [monthly_cashflow] * (holding_period_years * 12)
    monthly_cashflows[-1] += net_exit_proceeds
    monthly_irr = irr(monthly_cashflows)
    annual_irr = None
    if monthly_irr is not None:
        annual_irr = Decimal(str(pow(float(1 + monthly_irr), 12) - 1)) * Decimal("100")

    return {
        "purchase_price": quantize_money(purchase_price),
        "loan_amount": quantize_money(loan_amount),
        "monthly_debt_service": quantize_money(debt_service),
        "projected_monthly_cashflow": quantize_money(monthly_cashflow),
        "annual_noi": quantize_money(annual_noi),
        "projected_exit_value": quantize_money(exit_value),
        "remaining_debt_at_exit": quantize_money(balance_at_exit),
        "net_exit_proceeds": quantize_money(net_exit_proceeds),
        "total_profit": quantize_money(profit),
        "equity_multiple": quantize_percent(equity_multiple) if equity_multiple is not None else None,
        "projected_irr": quantize_percent(annual_irr) if annual_irr is not None else None,
    }
