import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { DashboardPageLoader } from "../components/LoadingState";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type ApiNumber = number | string | null;

type GrowthPoint = {
  height_percent: number;
  label: string;
  value: number;
};

type MarketCity = {
  average_price?: ApiNumber;
  city: string;
  listing_count?: number;
};

type DashboardOverview = {
  average_annual_yield: number;
  growth_series: GrowthPoint[];
  market_cities: MarketCity[];
  recommendations_open: number;
  refreshed_at: string;
  reports: number;
  scenarios: number;
  total_asset_value: number;
};

type ReportRecord = {
  asset_name: string | null;
  created_at: string;
  file_url: string;
  generated_by_name: string | null;
  id: number;
  metadata: Record<string, unknown>;
  organization_name: string;
  portfolio_name: string | null;
  report_type: string;
  status: string;
  summary: string;
  title: string;
};

type ValuationRecord = {
  asset_name: string | null;
  confidence_score: ApiNumber;
  created_at: string;
  estimated_value: ApiNumber;
  high_estimate: ApiNumber;
  id: number;
  low_estimate: ApiNumber;
  model_version: string;
  organization_name: string;
  summary: string;
  title: string;
};

const emptyOverview: DashboardOverview = {
  average_annual_yield: 0,
  growth_series: [],
  market_cities: [],
  recommendations_open: 0,
  refreshed_at: "",
  reports: 0,
  scenarios: 0,
  total_asset_value: 0,
};

function toNumber(value: ApiNumber | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

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
  })} MAD`;
}

function formatPercent(value: ApiNumber | undefined) {
  return `${toNumber(value).toLocaleString("fr-MA", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

function formatDate(value: string) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function reportTypeLabel(value: string) {
  const labels: Record<string, string> = {
    financial: "Financier",
    market: "Marché",
    portfolio: "Portfolio",
    risk: "Risque",
  };
  return labels[value] ?? value;
}

function reportStatusLabel(value: string) {
  const labels: Record<string, string> = {
    archived: "Archivé",
    generating: "Génération",
    ready: "Prêt",
  };
  return labels[value] ?? value;
}

function suggestionText(report: ReportRecord) {
  if (report.summary) {
    return report.summary;
  }

  const parts = [
    report.portfolio_name ? `Portfolio ${report.portfolio_name}` : "",
    report.asset_name ? `Actif ${report.asset_name}` : "",
    report.organization_name ? `Organisation ${report.organization_name}` : "",
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" · ")
    : "Rapport généré depuis les données de la plateforme SmartEstate.";
}

export default function ReportsPage() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [valuations, setValuations] = useState<ValuationRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setIsLoading(true);
      setError("");

      try {
        const [overviewPayload, reportPayload, valuationPayload] = await Promise.all([
          apiRequest<DashboardOverview>("/dashboard/overview/", { token }),
          apiRequest<ReportRecord[]>("/reports/", { token }),
          apiRequest<ValuationRecord[]>("/valuations/", { token }),
        ]);

        if (!active) {
          return;
        }

        setOverview({ ...emptyOverview, ...overviewPayload });
        setReports(reportPayload);
        setValuations(valuationPayload);
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(getErrorMessage(requestError, "Impossible de charger les rapports et analyses."));
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

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reports.filter((report) => {
      if (selectedType !== "all" && report.report_type !== selectedType) {
        return false;
      }
      if (selectedStatus !== "all" && report.status !== selectedStatus) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return [
        report.title,
        report.summary,
        report.organization_name,
        report.asset_name ?? "",
        report.portfolio_name ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, reports, selectedStatus, selectedType]);

  const filteredValuations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return valuations;
    }

    return valuations.filter((valuation) =>
      [valuation.title, valuation.summary, valuation.organization_name, valuation.asset_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, valuations]);

  const growthSeries =
    overview.growth_series.length > 0
      ? overview.growth_series
      : [
          { height_percent: 18, label: "Jan", value: 0 },
          { height_percent: 22, label: "Mar", value: 0 },
          { height_percent: 28, label: "Mai", value: 0 },
          { height_percent: 34, label: "Juil", value: 0 },
          { height_percent: 42, label: "Sep", value: 0 },
          { height_percent: 48, label: "Nov", value: 0 },
        ];
  const isInitialLoading =
    isLoading &&
    reports.length === 0 &&
    valuations.length === 0 &&
    overview.refreshed_at === "" &&
    !error;

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Rapports"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        {isInitialLoading ? (
          <DashboardPageLoader cardCount={3} metricCount={4} showTable sidePanelCount={2} />
        ) : (
          <>
        <section className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
              Capitalisation des analyses
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
              Rapports et estimations sauvegardées
            </h1>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant">
              Cette page centralise les rapports issus du backend ainsi que les estimations machine learning
              enregistrées dans la base.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant">
              Synchronisé le {formatDate(overview.refreshed_at)}
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm"
              to="/estimation-immobiliere-ia"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nouvelle estimation
            </Link>
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <MetricCard label="Rapports en base" value={String(reports.length || overview.reports)} />
          <MetricCard label="Estimations sauvegardées" value={String(valuations.length)} />
          <MetricCard label="Rendement moyen" value={formatPercent(overview.average_annual_yield)} />
          <MetricCard label="Valeur portefeuille" value={formatMoney(overview.total_asset_value, true)} />
        </section>

        <section className="mb-8 rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Recherche
              </span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  search
                </span>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-low py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-secondary/20"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Titre, actif, portfolio, organisation..."
                  type="text"
                  value={query}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Type
              </span>
              <select
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => setSelectedType(event.target.value)}
                value={selectedType}
              >
                <option value="all">Tous</option>
                <option value="market">Marché</option>
                <option value="portfolio">Portfolio</option>
                <option value="financial">Financier</option>
                <option value="risk">Risque</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Statut
              </span>
              <select
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => setSelectedStatus(event.target.value)}
                value={selectedStatus}
              >
                <option value="all">Tous</option>
                <option value="ready">Prêt</option>
                <option value="generating">Génération</option>
                <option value="archived">Archivé</option>
              </select>
            </label>
          </div>
        </section>

        <section className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.75fr)_360px] gap-8">
          <div className="space-y-8">
            <section className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
              <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary">Lecture portefeuille</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Série synthétique générée à partir des indicateurs de votre dashboard.
                  </p>
                </div>
                <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {growthSeries.length} points
                </span>
              </div>

              <div className="h-64 w-full rounded-2xl bg-surface-container-low px-4 pt-8 flex items-end gap-4 overflow-hidden">
                {growthSeries.map((point, index) => (
                  <div
                    className={index === growthSeries.length - 1 ? "flex-1 rounded-t-xl bg-primary" : "flex-1 rounded-t-xl bg-secondary/75"}
                    key={point.label}
                    style={{ height: `${Math.max(14, point.height_percent)}%` }}
                    title={`${point.label}: ${formatMoney(point.value, true)}`}
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {growthSeries.map((point) => (
                  <span key={point.label}>{point.label}</span>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary">Rapports backend</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Historique des rapports générés et exposés depuis l’API.
                  </p>
                </div>
                <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {filteredReports.length} résultat{filteredReports.length > 1 ? "s" : ""}
                </span>
              </div>

              {isLoading ? (
                <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
                  Chargement des rapports...
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
                  Aucun rapport ne correspond aux filtres actuels.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <article
                      className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
                      key={report.id}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                              {reportTypeLabel(report.report_type)}
                            </span>
                            <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                              {reportStatusLabel(report.status)}
                            </span>
                          </div>
                          <h3 className="text-lg font-headline font-bold text-primary">{report.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                            {suggestionText(report)}
                          </p>
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <DataPill label="Organisation" value={report.organization_name} />
                            <DataPill label="Portfolio" value={report.portfolio_name || "N/A"} />
                            <DataPill label="Actif" value={report.asset_name || "N/A"} />
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-start lg:items-end gap-3">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
                            {formatDate(report.created_at)}
                          </p>
                          {report.file_url ? (
                            <a
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm"
                              href={report.file_url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <span className="material-symbols-outlined text-base">download</span>
                              Ouvrir le fichier
                            </a>
                          ) : (
                            <Link
                              className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-primary"
                              to="/estimation-immobiliere-ia"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                              Voir l’analyse liée
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-headline font-bold text-primary">Estimations enregistrées</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Valorisations générées par le moteur machine learning et conservées en base.
                </p>
              </div>

              {filteredValuations.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">
                  Aucune estimation sauvegardée pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {filteredValuations.slice(0, 6).map((valuation) => (
                    <article
                      className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
                      key={valuation.id}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-headline font-bold text-primary">{valuation.title}</h3>
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {valuation.asset_name || valuation.organization_name}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {valuation.model_version}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <DataPill label="Valeur" value={formatMoney(valuation.estimated_value, true)} />
                        <DataPill label="Confiance" value={formatPercent(valuation.confidence_score)} />
                        <DataPill label="Borne basse" value={formatMoney(valuation.low_estimate, true)} />
                        <DataPill label="Borne haute" value={formatMoney(valuation.high_estimate, true)} />
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                        {valuation.summary || "Estimation enregistrée depuis le moteur ML SmartEstate."}
                      </p>
                      <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
                        {formatDate(valuation.created_at)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                Vue IA
              </p>
              <h2 className="mt-3 text-2xl font-headline font-extrabold">
                Vos analyses vivent déjà dans la base
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-primary-fixed">
                L’objectif ici est de conserver les livrables stratégiques issus des estimations, des scénarios
                et des synthèses marché pour alimenter la décision.
              </p>

              <div className="mt-6 space-y-4">
                <DataRow label="Rapports disponibles" value={String(reports.length)} />
                <DataRow label="Scénarios en base" value={String(overview.scenarios)} />
                <DataRow label="Recommandations ouvertes" value={String(overview.recommendations_open)} />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-headline font-bold text-primary">Couverture marché</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Répartition des annonces ETL par ville prioritaire.
                </p>
              </div>

              <div className="space-y-4">
                {overview.market_cities.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    Les statistiques ville seront disponibles après synchronisation ETL.
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
                                  Math.max(
                                    1,
                                    overview.market_cities.reduce(
                                      (sum, item) => sum + (item.listing_count ?? 0),
                                      0,
                                    ),
                                  )) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-on-surface-variant">
                        Prix moyen: {city.average_price ? formatMoney(city.average_price, true) : "N/A"}
                      </p>
                    </div>
                  ))
                )}
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-3xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-low px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-1 font-bold text-primary">{value}</p>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm">
      <span className="text-primary-fixed">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
