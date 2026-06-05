// Recommandations IA: propose des biens et des pistes d'action selon le contexte.
import { useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { DashboardPageLoader } from "../components/LoadingState";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";
import { USER_ROLES } from "../lib/roles";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const DASHBOARD_OVERVIEW_WITH_OPPORTUNITIES_PATH = "/dashboard/overview/?include_opportunities=1";

type ApiNumber = number | string | null;

type DashboardOpportunity = {
  area_sqm: ApiNumber;
  asset_type: string;
  city: string;
  confidence_score: ApiNumber;
  district: string;
  estimated_value: ApiNumber;
  external_url: string;
  id: number;
  image_urls: string[];
  last_seen_at: string;
  market_discount_percent: ApiNumber;
  price: ApiNumber;
  primary_image_url: string;
  published_label: string;
  score: ApiNumber;
  signal: string;
  source: string;
  title: string;
};

type MarketCity = {
  average_price?: ApiNumber;
  city: string;
  listing_count?: number;
};

type DashboardOverview = {
  average_market_price_per_sqm: number;
  market_cities: MarketCity[];
  market_listings: number;
  opportunities: DashboardOpportunity[];
  recommendations_open: number;
  refreshed_at: string;
};

type RecommendationRecord = {
  action_items: string[];
  asset_name: string | null;
  category: string;
  confidence_score: ApiNumber;
  created_at: string;
  description: string;
  expected_roi: ApiNumber;
  id: number;
  organization_name: string;
  priority: string;
  status: string;
  title: string;
};

type GlobalSearchOption = {
  label: string;
  matchTerms: string[];
  value: string;
};

const emptyOverview: DashboardOverview = {
  average_market_price_per_sqm: 0,
  market_cities: [],
  market_listings: 0,
  opportunities: [],
  recommendations_open: 0,
  refreshed_at: "",
};

// Convertit une valeur heterogene venue de l'API en nombre exploitable.
function toNumber(value: ApiNumber | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Normalise le texte pour faciliter les recherches multi-criteres.
function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

// Formate les montants des opportunites et recommandations.
function formatMoney(value: ApiNumber | undefined, compact = false) {
  const amount = toNumber(value);
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("fr-MA", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 1,
    })} MDH`;
  }

  return `${amount.toLocaleString("fr-MA", {
    maximumFractionDigits: 0,
  })} DH`;
}

// Uniformise l'affichage des scores et ROI.
function formatPercent(value: ApiNumber | undefined) {
  return `${toNumber(value).toLocaleString("fr-MA", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

// Rend les timestamps de l'API lisibles dans l'interface.
function formatDate(value: string) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// Produit un indicateur relatif recent pour les cartes d'opportunites.
function relativeDate(value: string) {
  if (!value) {
    return "Synchronisation en attente";
  }

  const date = new Date(value);
  const diffHours = Math.max(1, Math.round((Date.now() - date.getTime()) / 3600000));
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }
  return formatDate(value);
}

// Associe une palette de couleur a chaque ville pour les placeholders visuels.
function cityGradient(city: string) {
  const palette: Record<string, string> = {
    Agadir: "from-[#0f766e] via-[#14b8a6] to-[#67e8f9]",
    Casablanca: "from-[#183153] via-[#1b6d24] to-[#89b0ae]",
    Marrakech: "from-[#7b341e] via-[#c05621] to-[#f6ad55]",
    Rabat: "from-[#1a237e] via-[#2c5282] to-[#63b3ed]",
    Tanger: "from-[#0f766e] via-[#1d4ed8] to-[#7dd3fc]",
  };

  return palette[city] ?? "from-[#334155] via-[#475569] to-[#94a3b8]";
}

// Traduit le signal ML en libelle commercial compréhensible.
function signalLabel(signal: string) {
  const labels: Record<string, string> = {
    avoid: "Risque élevé",
    neutral: "Équilibré",
    strong_buy: "Prioritaire",
    watchlist: "À surveiller",
  };
  return labels[signal] ?? signal;
}

// Convertit la priorite technique en niveau lisible.
function priorityLabel(priority: string) {
  const labels: Record<string, string> = {
    high: "Haute",
    low: "Faible",
    medium: "Moyenne",
  };
  return labels[priority] ?? priority;
}

// Habille les statuts de recommandation renvoyes par le backend.
function statusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Acceptée",
    in_progress: "En cours",
    open: "Ouverte",
    rejected: "Rejetée",
  };
  return labels[status] ?? status;
}

// Traduit la categorie de recommandation dans le vocabulaire metier.
function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    acquisition: "Acquisition",
    disposition: "Arbitrage",
    optimization: "Optimisation",
    risk: "Risque",
  };
  return labels[category] ?? category;
}

// Verifie qu'un enregistrement contient bien tous les termes de la recherche courante.
function matchesSearchTerms(values: Array<string | null | undefined>, matchTerms: string[]) {
  if (matchTerms.length === 0) {
    return true;
  }

  const haystack = values.map((value) => normalizeText(value)).join(" ");
  return matchTerms.every((term) => haystack.includes(normalizeText(term)));
}

// Reunit les opportunites ETL/ML et les recommandations sauvegardees dans un meme cockpit.
export default function AiRecommendationsPage() {
  const { token, user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [selectedSearch, setSelectedSearch] = useState("all");
  const [selectedSignal, setSelectedSignal] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Charge en parallele les opportunites de marche et les recommandations en base.
  useEffect(() => {
    let active = true;

    // Alimente la page depuis le dashboard enrichi et le module de recommandations.
    async function loadPage() {
      setIsLoading(true);
      setError("");

      try {
        const [overviewPayload, recommendationPayload] = await Promise.all([
          apiRequest<DashboardOverview>(DASHBOARD_OVERVIEW_WITH_OPPORTUNITIES_PATH, { token }),
          apiRequest<RecommendationRecord[]>("/recommendations/", { token }),
        ]);

        if (!active) {
          return;
        }

        setOverview({ ...emptyOverview, ...overviewPayload });
        setRecommendations(recommendationPayload);
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(getErrorMessage(requestError, "Impossible de charger les recommandations IA."));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPage();
    return () => {
      active = false;
    };
  }, [token]);

  // Construit les options de recherche globale a partir des villes visibles dans les donnees chargees.
  const searchOptions = useMemo<GlobalSearchOption[]>(() => {
    const options: GlobalSearchOption[] = [
      {
        label: "Toutes les villes",
        matchTerms: [],
        value: "all",
      },
    ];

    const cityCounts = new Map<string, number>();

    overview.market_cities.forEach((city) => {
      const cityName = city.city.trim();
      if (!cityName) {
        return;
      }

      cityCounts.set(cityName, city.listing_count ?? cityCounts.get(cityName) ?? 0);
    });

    overview.opportunities.forEach((opportunity) => {
      const cityName = opportunity.city.trim();
      if (!cityName || cityCounts.has(cityName)) {
        return;
      }

      cityCounts.set(cityName, 0);
    });

    Array.from(cityCounts.entries())
      .sort(([left], [right]) => left.localeCompare(right, "fr"))
      .forEach(([cityName, count]) => {
        options.push({
          label: count > 0 ? `${cityName} (${count})` : cityName,
          matchTerms: [cityName],
          value: `city:${normalizeText(cityName)}`,
        });
      });

    return options;
  }, [overview.market_cities, overview.opportunities]);

  const selectedSearchOption = useMemo(
    () => searchOptions.find((option) => option.value === selectedSearch) ?? searchOptions[0],
    [searchOptions, selectedSearch],
  );

  // Filtre les opportunites selon le signal, la source ETL et la recherche geographique.
  const filteredOpportunities = useMemo(() => {
    return overview.opportunities.filter((opportunity) => {
      if (selectedSignal !== "all" && opportunity.signal !== selectedSignal) {
        return false;
      }

      if (selectedSource !== "all" && opportunity.source !== selectedSource) {
        return false;
      }

      return matchesSearchTerms(
        [opportunity.title, opportunity.city, opportunity.district, opportunity.source],
        selectedSearchOption.matchTerms,
      );
    });
  }, [overview.opportunities, selectedSearchOption, selectedSignal, selectedSource]);

  // Filtre les recommandations en base avec la meme logique de recherche globale.
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((recommendation) =>
      matchesSearchTerms(
        [
          recommendation.title,
          recommendation.description,
          recommendation.organization_name,
          recommendation.asset_name ?? "",
        ],
        selectedSearchOption.matchTerms,
      ),
    );
  }, [recommendations, selectedSearchOption]);

  const averageOpportunityScore =
    filteredOpportunities.length > 0
      ? filteredOpportunities.reduce((total, opportunity) => total + toNumber(opportunity.score), 0) /
        filteredOpportunities.length
      : 0;

  const priorityOpportunities = filteredOpportunities.filter(
    (opportunity) => opportunity.signal === "strong_buy",
  ).length;
  const isInitialLoading =
    isLoading &&
    overview.opportunities.length === 0 &&
    recommendations.length === 0 &&
    !error;
  const pageHeading =
    user?.role === USER_ROLES.UTILISATEUR_SIMPLE
      ? "Recommandations personnalisées"
      : "Recommandations d'investissement";

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title={`SmartEstate | ${pageHeading}`}
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        {isInitialLoading ? (
          <DashboardPageLoader cardCount={4} metricCount={4} sidePanelCount={3} />
        ) : (
          <>
        <section className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
              Flux ETL + moteur ML
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
              {pageHeading}
            </h1>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant">
              Cette section exploite vos annonces scrapées et les estimations machine learning pour mettre
              en avant les opportunités les plus actionnables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant">
              Actualisé le {formatDate(overview.refreshed_at)}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <MetricCard label="Opportunités filtrées" value={String(filteredOpportunities.length)} />
          <MetricCard label="Signaux prioritaires" value={String(priorityOpportunities)} />
          <MetricCard label="Score moyen IA" value={formatPercent(averageOpportunityScore)} />
          <MetricCard
            label="Recommandations ouvertes"
            value={String(overview.recommendations_open || filteredRecommendations.length)}
          />
        </section>

        <section className="mb-8 rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Recherche globale
              </span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  search
                </span>
                <select
                  className="w-full rounded-xl border-none bg-surface-container-low py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-secondary/20"
                  onChange={(event) => setSelectedSearch(event.target.value)}
                  value={selectedSearch}
                >
                  {searchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Signal
              </span>
              <select
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => setSelectedSignal(event.target.value)}
                value={selectedSignal}
              >
                <option value="all">Tous</option>
                <option value="strong_buy">Prioritaire</option>
                <option value="watchlist">À surveiller</option>
                <option value="neutral">Équilibré</option>
                <option value="avoid">Risque élevé</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Source ETL
              </span>
              <select
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => setSelectedSource(event.target.value)}
                value={selectedSource}
              >
                <option value="all">Toutes</option>
                <option value="avito">Avito</option>
                <option value="mubawab">Mubawab</option>
              </select>
            </label>
          </div>
        </section>

        <section className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.75fr)_380px] gap-8">
          <div className="space-y-8">
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary">Opportunités marché</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Résultats issus de l’ETL continu et scorés par les modèles ML.
                  </p>
                </div>
                <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {overview.market_listings} annonces indexées
                </span>
              </div>

              {isLoading ? (
                <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
                  Analyse des opportunités en cours...
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
                  Aucune opportunité ne correspond aux filtres actuels.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredOpportunities.map((opportunity) => (
                    <article
                      className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm"
                      key={opportunity.id}
                    >
                      <div className="aspect-[16/10] bg-surface-container-low overflow-hidden">
                        {opportunity.primary_image_url ? (
                          <img
                            alt={opportunity.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            src={opportunity.primary_image_url}
                          />
                        ) : (
                          <div
                            className={`flex h-full w-full flex-col justify-between bg-gradient-to-br ${cityGradient(opportunity.city)} p-6 text-white`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-80">
                              {opportunity.source}
                            </span>
                            <div>
                              <p className="text-2xl font-headline font-extrabold">
                                {opportunity.city || "Maroc"}
                              </p>
                              <p className="text-sm opacity-85">
                                {opportunity.district || "Opportunité marché"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                            {signalLabel(opportunity.signal)}
                          </span>
                          <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            {opportunity.source}
                          </span>
                          <span className="text-[11px] font-medium text-on-surface-variant">
                            {relativeDate(opportunity.last_seen_at)}
                          </span>
                        </div>

                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-headline font-bold text-primary line-clamp-2">
                              {opportunity.title}
                            </h3>
                            <p className="mt-1 text-sm text-on-surface-variant">
                              {opportunity.district
                                ? `${opportunity.district}, ${opportunity.city}`
                                : opportunity.city || "Ville non précisée"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-primary px-4 py-3 text-white">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Score</p>
                            <p className="text-xl font-headline font-extrabold">
                              {formatPercent(opportunity.score)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <DataPill label="Prix annonce" value={formatMoney(opportunity.price, true)} />
                          <DataPill label="Valeur ML" value={formatMoney(opportunity.estimated_value, true)} />
                          <DataPill label="Décote marché" value={formatPercent(opportunity.market_discount_percent)} />
                          <DataPill label="Confiance" value={formatPercent(opportunity.confidence_score)} />
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-4">
                          <span className="text-xs font-medium text-on-surface-variant">
                            {opportunity.area_sqm ? `${toNumber(opportunity.area_sqm)} m²` : "Surface N/A"}
                          </span>
                          <a
                            className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                            href={opportunity.external_url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Voir l'annonce
                            <span className="material-symbols-outlined text-base">open_in_new</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-headline font-bold text-primary">Recommandations sauvegardées</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Actions déjà enregistrées dans la base pour vos organisations visibles.
                </p>
              </div>

              {filteredRecommendations.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
                  Aucune recommandation sauvegardée pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {filteredRecommendations.map((recommendation) => (
                    <article
                      className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
                      key={recommendation.id}
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          {categoryLabel(recommendation.category)}
                        </span>
                        <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                          Priorité {priorityLabel(recommendation.priority)}
                        </span>
                        <span className="rounded-full bg-primary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {statusLabel(recommendation.status)}
                        </span>
                      </div>

                      <h3 className="text-lg font-headline font-bold text-primary">
                        {recommendation.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                        {recommendation.description}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <DataPill label="Organisation" value={recommendation.organization_name} />
                        <DataPill
                          label="Actif"
                          value={recommendation.asset_name || "Portefeuille global"}
                        />
                        <DataPill
                          label="ROI attendu"
                          value={
                            recommendation.expected_roi === null
                              ? "N/A"
                              : formatPercent(recommendation.expected_roi)
                          }
                        />
                        <DataPill
                          label="Confiance"
                          value={
                            recommendation.confidence_score === null
                              ? "N/A"
                              : formatPercent(recommendation.confidence_score)
                          }
                        />
                      </div>

                      {recommendation.action_items.length > 0 && (
                        <ul className="mt-5 space-y-2 text-sm text-on-surface-variant">
                          {recommendation.action_items.slice(0, 3).map((item) => (
                            <li className="flex items-start gap-2" key={item}>
                              <span className="material-symbols-outlined mt-0.5 text-base text-secondary">
                                arrow_right_alt
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <p className="mt-5 text-[11px] font-medium uppercase tracking-widest text-on-surface-variant">
                        Créée le {formatDate(recommendation.created_at)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                Intelligence marché
              </p>
              <h2 className="mt-3 text-2xl font-headline font-extrabold">
                Le moteur IA reste alimenté en continu
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-primary-fixed">
                Les recommandations dépendent des nouvelles annonces ETL, des comparables ML et des
                signaux de valorisation générés depuis la base.
              </p>

              <div className="mt-6 space-y-4">
                <DataRow label="Prix moyen marché / m²" value={formatMoney(overview.average_market_price_per_sqm)} />
                <DataRow label="Opportunités en file" value={String(overview.opportunities.length)} />
                <DataRow label="Recommandations ouvertes" value={String(overview.recommendations_open)} />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-headline font-bold text-primary">Villes suivies</h3>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {overview.market_cities.length} zones
                </span>
              </div>

              <div className="space-y-4">
                {overview.market_cities.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    Les statistiques ville apparaîtront après le prochain cycle ETL.
                  </p>
                ) : (
                  overview.market_cities.map((city) => (
                    <div key={city.city}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-bold text-primary">{city.city}</span>
                        <span className="text-on-surface-variant">
                          {city.listing_count ?? 0} annonces
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
                        <div
                          className="h-full rounded-full bg-secondary"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                12,
                                ((city.listing_count ?? 0) /
                                  Math.max(1, overview.market_listings || 1)) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-headline font-bold text-primary">Enchaînement conseillé</h3>
              <div className="mt-5 space-y-4">
                {[
                  "Surveiller les nouvelles annonces ETL par ville.",
                  "Comparer prix annoncé et valeur estimée ML.",
                  "Sauvegarder les estimations prometteuses.",
                  "Convertir les meilleurs cas en scénario d'investissement.",
                ].map((step, index) => (
                  <div className="flex items-start gap-3" key={step}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-secondary">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-relaxed text-on-surface-variant">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
          </>
        )}
      </main>
    </ImportedPageDocument>
  );
}

// Carte KPI locale pour les tuiles de tete de page.
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-3xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}

// Badge compact pour afficher une paire libelle / valeur.
function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-low px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-1 font-bold text-primary">{value}</p>
    </div>
  );
}

// Ligne de synthese pour les panneaux lateraux sombres.
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm">
      <span className="text-primary-fixed">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
