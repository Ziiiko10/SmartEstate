import { useEffect, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { CardGridSkeleton, MetricCardsSkeleton, SkeletonBlock } from "../components/LoadingState";
import { useAuth } from "../auth/AuthContext";
import { apiPrefetch, apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type MarketListing = {
  area_sqm: string | null;
  asset_type: string;
  city: string;
  district: string;
  external_url: string;
  id: number;
  image_urls: string[];
  last_seen_at: string;
  price: string | null;
  price_per_sqm: number | null;
  primary_image_url: string;
  source: string;
  title: string;
  transaction_type: string;
};

type PaginatedMarketListings = {
  count: number;
  next_page: number | null;
  page: number;
  page_size: number;
  previous_page: number | null;
  results: MarketListing[];
};

type FilterChoice = {
  count: number;
  label: string;
  value: string;
};

type MarketListingFilters = {
  cities: FilterChoice[];
  search_choices: FilterChoice[];
};

const ITEMS_PER_PAGE = 24;

function applySearchChoice(searchParams: URLSearchParams, searchChoice: string) {
  if (!searchChoice) {
    return;
  }

  const [kind, ...rawValueParts] = searchChoice.split(":");
  const rawValue = rawValueParts.join(":").trim();
  if (!rawValue) {
    return;
  }

  if (kind === "asset_type") {
    searchParams.set("asset_type", rawValue);
    return;
  }

  if (kind === "q") {
    searchParams.set("q", rawValue);
  }
}

function buildListingsPath(params: {
  city: string;
  page: number;
  searchChoice: string;
  source: string;
  transaction: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    page_size: String(ITEMS_PER_PAGE),
  });

  if (params.source !== "all") {
    searchParams.set("source", params.source);
  }
  if (params.transaction !== "all") {
    searchParams.set("transaction_type", params.transaction);
  }
  if (params.city) {
    searchParams.set("city", params.city);
  }
  applySearchChoice(searchParams, params.searchChoice);

  return `/market-listings/?${searchParams.toString()}`;
}

function buildFilterChoicesPath(params: { source: string; transaction: string }) {
  const searchParams = new URLSearchParams();

  if (params.source !== "all") {
    searchParams.set("source", params.source);
  }
  if (params.transaction !== "all") {
    searchParams.set("transaction_type", params.transaction);
  }

  const query = searchParams.toString();
  return query ? `/market-listings/filters/?${query}` : "/market-listings/filters/";
}

function formatMoney(value: number | string | null | undefined, compact = false) {
  const amount = Number(value ?? 0);
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("fr-MA", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    })} MDH`;
  }

  return `${amount.toLocaleString("fr-MA", {
    maximumFractionDigits: 0,
  })} DH`;
}

function relativeDate(value: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const diffHours = Math.max(1, Math.round((Date.now() - date.getTime()) / 3600000));
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }
  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function transactionLabel(transactionType: string) {
  const labels: Record<string, string> = {
    rent: "Location",
    sale: "Vente",
    unknown: "Non classée",
    vacation: "Saisonnier",
  };
  return labels[transactionType] ?? transactionType;
}

function assetTypeLabel(assetType: string) {
  const labels: Record<string, string> = {
    apartment: "Appartement",
    hospitality: "Hospitality",
    land: "Terrain",
    office: "Bureau",
    retail: "Local",
    unknown: "Bien",
    villa: "Villa",
  };
  return labels[assetType] ?? assetType;
}

function cityGradient(city: string) {
  const palette: Record<string, string> = {
    Casablanca: "from-[#183153] via-[#1b6d24] to-[#89b0ae]",
    Marrakech: "from-[#7b341e] via-[#c05621] to-[#f6ad55]",
    Rabat: "from-[#1a237e] via-[#2c5282] to-[#63b3ed]",
    Tanger: "from-[#0f766e] via-[#0ea5a4] to-[#7dd3fc]",
  };

  return palette[city] ?? "from-[#334155] via-[#475569] to-[#94a3b8]";
}

function getListingImages(listing: MarketListing) {
  const uniqueImages = new Set<string>();
  const preferredImages = listing.image_urls.length > 0 ? listing.image_urls : [listing.primary_image_url];

  for (const imageUrl of preferredImages) {
    const normalizedUrl = imageUrl?.trim();
    if (!normalizedUrl || uniqueImages.has(normalizedUrl)) {
      continue;
    }
    uniqueImages.add(normalizedUrl);
  }

  return Array.from(uniqueImages);
}

export default function MarketListingsPage() {
  const { token } = useAuth();
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [filterChoices, setFilterChoices] = useState<MarketListingFilters>({
    cities: [],
    search_choices: [],
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSearch, setSelectedSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [selectedCity, selectedSearch, selectedSource, selectedTransaction]);

  useEffect(() => {
    let active = true;

    async function loadFilterChoices() {
      try {
        const payload = await apiRequest<MarketListingFilters>(
          buildFilterChoicesPath({
            source: selectedSource,
            transaction: selectedTransaction,
          }),
          { token },
        );

        if (!active) {
          return;
        }

        setFilterChoices(payload);

        if (selectedCity && !payload.cities.some((choice) => choice.value === selectedCity)) {
          setSelectedCity("");
        }
        if (
          selectedSearch &&
          !payload.search_choices.some((choice) => choice.value === selectedSearch)
        ) {
          setSelectedSearch("");
        }
      } catch {
        if (!active) {
          return;
        }

        setFilterChoices({
          cities: [],
          search_choices: [],
        });
      }
    }

    void loadFilterChoices();
    return () => {
      active = false;
    };
  }, [selectedCity, selectedSearch, selectedSource, selectedTransaction, token]);

  useEffect(() => {
    let active = true;

    async function loadListings() {
      setIsLoading(true);
      setError("");

      try {
        const path = buildListingsPath({
          city: selectedCity,
          page,
          searchChoice: selectedSearch,
          source: selectedSource,
          transaction: selectedTransaction,
        });

        const payload = await apiRequest<PaginatedMarketListings>(path, {
          token,
        });

        if (!active) {
          return;
        }

        setMarketListings(payload.results);
        setTotalCount(payload.count);

        if (payload.next_page) {
          void apiPrefetch<PaginatedMarketListings>(
            buildListingsPath({
              city: selectedCity,
              page: payload.next_page,
              searchChoice: selectedSearch,
              source: selectedSource,
              transaction: selectedTransaction,
            }),
            { token },
          );
        }

        if (payload.previous_page) {
          void apiPrefetch<PaginatedMarketListings>(
            buildListingsPath({
              city: selectedCity,
              page: payload.previous_page,
              searchChoice: selectedSearch,
              source: selectedSource,
              transaction: selectedTransaction,
            }),
            { token },
          );
        }
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(getErrorMessage(requestError, "Impossible de charger les annonces ETL."));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadListings();
    return () => {
      active = false;
    };
  }, [page, selectedCity, selectedSearch, selectedSource, selectedTransaction, token]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const isInitialLoading = isLoading && totalCount === 0 && marketListings.length === 0 && !error;

  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-background font-body antialiased"
      title="Annonces ETL | SmartEstate"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">
                Vue complète du marché scrapé
              </span>
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight leading-tight">
                Toutes les annonces ETL
              </h1>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        {isInitialLoading ? (
          <section className="mb-8">
            <MetricCardsSkeleton count={4} />
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard label="Annonces filtrées" value={String(totalCount)} />
            <MetricCard label="Page courante" value={`${currentPage} / ${totalPages}`} />
            <MetricCard label="Sources actives" value={selectedSource === "all" ? "2" : "1"} />
            <MetricCard label="Cartes chargées" value={String(marketListings.length)} />
          </section>
        )}

        {isInitialLoading ? (
          <section className="rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)] mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)] mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Recherche
                </span>
                <select
                  className="w-full rounded-lg border-none bg-surface-container-low py-3 px-4 text-sm focus:ring-2 focus:ring-secondary/20"
                  onChange={(event) => setSelectedSearch(event.target.value)}
                  value={selectedSearch}
                >
                  <option value="">Toutes</option>
                  {filterChoices.search_choices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label} ({choice.count})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Ville
                </span>
                <select
                  className="w-full rounded-lg border-none bg-surface-container-low py-3 px-4 text-sm focus:ring-2 focus:ring-secondary/20"
                  onChange={(event) => setSelectedCity(event.target.value)}
                  value={selectedCity}
                >
                  <option value="">Toutes</option>
                  {filterChoices.cities.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label} ({choice.count})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Source
                </span>
                <select
                  className="w-full rounded-lg border-none bg-surface-container-low py-3 px-4 text-sm focus:ring-2 focus:ring-secondary/20"
                  onChange={(event) => setSelectedSource(event.target.value)}
                  value={selectedSource}
                >
                  <option value="all">Toutes</option>
                  <option value="avito">Avito</option>
                  <option value="mubawab">Mubawab</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Transaction
                </span>
                <select
                  className="w-full rounded-lg border-none bg-surface-container-low py-3 px-4 text-sm focus:ring-2 focus:ring-secondary/20"
                  onChange={(event) => setSelectedTransaction(event.target.value)}
                  value={selectedTransaction}
                >
                  <option value="all">Toutes</option>
                  <option value="sale">Vente</option>
                  <option value="rent">Location</option>
                  <option value="vacation">Saisonnier</option>
                  <option value="unknown">Non classée</option>
                </select>
              </label>
            </div>
          </section>
        )}

        {isInitialLoading ? (
          <CardGridSkeleton count={6} />
        ) : isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
            Actualisation des annonces ETL...
          </div>
        ) : marketListings.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
            Aucune annonce ne correspond aux filtres actuels.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {marketListings.map((listing) => {
                const images = getListingImages(listing);
                const mainImage = images[0] ?? "";

                return (
                  <article className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm" key={listing.id}>
                    <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
                      {mainImage ? (
                        <img
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                          src={mainImage}
                        />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${cityGradient(listing.city)} p-6 text-white flex flex-col justify-between`}>
                          <span className="text-[10px] uppercase tracking-[0.22em] font-bold opacity-80">{listing.source}</span>
                          <div>
                            <p className="text-2xl font-headline font-extrabold">{listing.city || "Maroc"}</p>
                            <p className="text-sm opacity-80">{listing.district || assetTypeLabel(listing.asset_type)}</p>
                          </div>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 top-0 p-4">
                        <span className="rounded-full bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                          {listing.source}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                              {transactionLabel(listing.transaction_type)}
                            </span>
                          </div>
                          <h2 className="text-lg font-headline font-bold text-primary line-clamp-2">{listing.title}</h2>
                        </div>
                        <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold text-on-surface-variant whitespace-nowrap">
                          {relativeDate(listing.last_seen_at)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-on-surface-variant">
                        <p>{listing.district ? `${listing.district}, ${listing.city}` : listing.city || "Ville non précisée"}</p>
                        <p>Type: {assetTypeLabel(listing.asset_type)}</p>
                        <p>Prix: {formatMoney(listing.price)}</p>
                        <p>Surface: {listing.area_sqm ? `${listing.area_sqm} m²` : "N/A"}</p>
                        <p>Prix / m²: {listing.price_per_sqm ? formatMoney(listing.price_per_sqm) : "N/A"}</p>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-on-surface-variant">
                          {images.length} image{images.length > 1 ? "s" : ""}
                        </span>
                        <a
                          className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                          href={listing.external_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Ouvrir l'annonce
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest px-6 py-5 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
              <p className="text-sm text-on-surface-variant">
                Page {currentPage} sur {totalPages} · {totalCount} annonces au total
              </p>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40"
                  data-disable-prototype-actions="true"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  Précédent
                </button>
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  data-disable-prototype-actions="true"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  type="button"
                >
                  Suivant
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </ImportedPageDocument>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-3xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}
