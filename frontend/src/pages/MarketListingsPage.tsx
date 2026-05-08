import { startTransition, useDeferredValue, useEffect, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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

const ITEMS_PER_PAGE = 24;

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
  })} MAD`;
}

function relativeDate(value: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / 3600000));
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

export default function MarketListingsPage() {
  const { token } = useAuth();
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    let active = true;

    async function loadListings() {
      setIsLoading(true);
      setError("");

      try {
        const listingData = await apiRequest<MarketListing[]>("/market-listings/", { token });
        if (!active) {
          return;
        }

        startTransition(() => {
          setMarketListings(listingData);
        });
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
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, selectedCity, selectedSource, selectedTransaction]);

  const cities = Array.from(
    new Set(
      marketListings
        .map((listing) => listing.city)
        .filter((city) => city),
    ),
  ).sort((left, right) => left.localeCompare(right, "fr"));

  const filteredListings = marketListings.filter((listing) => {
    if (selectedCity !== "all" && listing.city !== selectedCity) {
      return false;
    }
    if (selectedSource !== "all" && listing.source !== selectedSource) {
      return false;
    }
    if (selectedTransaction !== "all" && listing.transaction_type !== selectedTransaction) {
      return false;
    }
    if (!deferredQuery) {
      return true;
    }
    return [listing.title, listing.city, listing.district, listing.source, transactionLabel(listing.transaction_type)]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery);
  });

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
              <p className="mt-3 text-on-surface-variant text-sm md:text-base leading-relaxed">
                Cette page affiche toutes les annonces récupérées par l'ETL Avito et Mubawab, avec leurs images, leurs prix et leurs métadonnées.
              </p>
            </div>
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm"
              href="/portfolio-immobilier-maroc"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Retour portfolio
            </a>
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard label="Annonces chargées" value={String(marketListings.length)} />
          <MetricCard label="Annonces filtrées" value={String(filteredListings.length)} />
          <MetricCard
            label="Sources actives"
            value={String(new Set(marketListings.map((listing) => listing.source)).size)}
          />
          <MetricCard label="Villes couvertes" value={String(cities.length)} />
        </section>

        <section className="rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Recherche</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                <input
                  className="w-full rounded-lg border-none bg-surface-container-low py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-secondary/20"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Titre, ville, source..."
                  type="text"
                  value={query}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Source</span>
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
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Transaction</span>
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

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ville</span>
              <select
                className="w-full rounded-lg border-none bg-surface-container-low py-3 px-4 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => setSelectedCity(event.target.value)}
                value={selectedCity}
              >
                <option value="all">Toutes</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
            Chargement des annonces ETL depuis la base...
          </div>
        ) : visibleListings.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
            Aucune annonce ne correspond aux filtres actuels.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {visibleListings.map((listing) => (
                <article className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm" key={listing.id}>
                  <div className="aspect-[16/10] bg-surface-container-low overflow-hidden">
                    {listing.primary_image_url ? (
                      <img
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        src={listing.primary_image_url}
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
                  </div>
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                            {listing.source}
                          </span>
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
                        {listing.image_urls.length} image{listing.image_urls.length > 1 ? "s" : ""}
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
              ))}
            </section>

            <section className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest px-6 py-5 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
              <p className="text-sm text-on-surface-variant">
                Page {currentPage} sur {totalPages} · {filteredListings.length} annonces visibles
              </p>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  Précédent
                </button>
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
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
