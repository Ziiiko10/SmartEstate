import { useCallback, useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { DashboardPageLoader } from "../components/LoadingState";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type DashboardOpportunity = {
  asset_type: string;
  city: string;
  confidence_score: number | null;
  district: string;
  estimated_value: number | null;
  external_url: string;
  id: number;
  market_discount_percent: number | null;
  price: number;
  score: number | null;
  signal: string;
  source: string;
  title: string;
};

type DashboardActivity = {
  icon: string;
  subtitle: string;
  timestamp: string;
  title: string;
  type: string;
};

type GrowthPoint = {
  height_percent: number;
  label: string;
  value: number;
};

type CityBreakdown = {
  asset_count?: number;
  average_price?: number | string | null;
  city: string;
  listing_count?: number;
};

type DashboardOverview = {
  assets: number;
  average_annual_yield: number;
  average_market_price_per_sqm: number;
  average_occupancy_rate: number;
  growth_series: GrowthPoint[];
  market_cities: CityBreakdown[];
  market_listings: number;
  monthly_cashflow: number;
  opportunities: DashboardOpportunity[];
  portfolios: number;
  recent_activity: DashboardActivity[];
  recommendations_open: number;
  refreshed_at: string;
  reports: number;
  scenarios: number;
  top_cities: CityBreakdown[];
  total_acquisition_value: number;
  total_asset_value: number;
  value_growth_percent: number;
};

const emptyDashboard: DashboardOverview = {
  assets: 0,
  average_annual_yield: 0,
  average_market_price_per_sqm: 0,
  average_occupancy_rate: 0,
  growth_series: [],
  market_cities: [],
  market_listings: 0,
  monthly_cashflow: 0,
  opportunities: [],
  portfolios: 0,
  recent_activity: [],
  recommendations_open: 0,
  refreshed_at: "",
  reports: 0,
  scenarios: 0,
  top_cities: [],
  total_acquisition_value: 0,
  total_asset_value: 0,
  value_growth_percent: 0,
};

const signalLabel: Record<string, string> = {
  avoid: "Risque",
  neutral: "Neutre",
  strong_buy: "Prioritaire",
  watchlist: "À suivre",
};

function formatMoney(value: number | null | undefined, compact = true) {
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

function formatPercent(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString("fr-MA", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

function formatDate(value: string) {
  if (!value) {
    return "Synchronisation en attente";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRelative(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }
  return formatDate(value);
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    apartment: "Appartement",
    hospitality: "Hospitality",
    land: "Terrain",
    office: "Bureau",
    retail: "Local",
    unknown: "Bien",
    villa: "Villa",
  };
  return labels[type] ?? "Bien";
}

export default function ExecutiveDashboardPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardOverview>(emptyDashboard);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const payload = await apiRequest<DashboardOverview>("/dashboard/overview/", { token });
      setDashboard({ ...emptyDashboard, ...payload });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de charger le dashboard."));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
    const interval = window.setInterval(() => {
      void loadDashboard();
    }, 120000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  const performanceScore = useMemo(() => {
    const occupancy = dashboard.average_occupancy_rate || 0;
    const yieldScore = Math.min(100, (dashboard.average_annual_yield / 8) * 100);
    return Math.round((occupancy * 0.55 + yieldScore * 0.45) * 10) / 10;
  }, [dashboard.average_annual_yield, dashboard.average_occupancy_rate]);

  const growthSeries =
    dashboard.growth_series.length > 0
      ? dashboard.growth_series
      : Array.from({ length: 12 }, (_, index) => ({
          height_percent: 14,
          label: ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"][index],
          value: 0,
        }));
  const isInitialLoading = isLoading && dashboard.refreshed_at === "" && !error;

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface selection:bg-secondary-container"
      title="SmartEstate - Tableau de Bord Exécutif"
      styles={pageStyles}
    >
      <div>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#f9f9fb] shadow-[0_12px_40px_rgba(26,28,29,0.06)] border-b border-opacity-10 h-16 flex items-center px-6 md:px-8 justify-between">
          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-base">monitoring</span>
            <span>Données backend live</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              onClick={() => void loadDashboard()}
              type="button"
            >
              <span className={isLoading ? "material-symbols-outlined animate-spin" : "material-symbols-outlined"}>
                sync
              </span>
              <span>{isLoading ? "Actualisation..." : "Actualiser"}</span>
            </button>
            <span className="hidden sm:inline text-xs font-semibold text-on-surface-variant">
              {isLoading ? "Chargement..." : formatDate(dashboard.refreshed_at)}
            </span>
          </div>
        </header>

        <aside className="hidden md:flex flex-col h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-[#ffffff] z-40 pt-20">
          <div className="px-6 mb-8 flex flex-col gap-1">
            <h2 className="text-[#1A237E] font-bold text-lg">Mode Demo Public</h2>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">Donnees backend live</p>
          </div>
          <nav className="flex-1 space-y-1">
            {[
              ["dashboard", "Tableau de Bord", "/tableau-de-bord-executif", true],
              ["domain", "Portfolio", "/portfolio-immobilier-maroc", false],
              ["calculate", "Estimation", "/estimation-immobiliere-ia", false],
              ["query_stats", "Scenarios", "/simulateur-scenarios-maroc", false],
              ["auto_awesome", "Recommandations", "/recommandations-ia", false],
              ["description", "Rapports", "/rapports", false],
              ["group", "Equipe", "/gestion-equipe", false],
            ].map(([icon, label, href, active]) => (
              <a
                className={
                  active
                    ? "group flex items-center gap-3 px-6 py-4 bg-[#eeeef0] text-[#1b6d24] font-bold border-r-4 border-[#1b6d24]"
                    : "group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200"
                }
                href={href as string}
                key={label as string}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="font-['Inter'] text-sm antialiased">{label}</span>
              </a>
            ))}
          </nav>
          <div className="p-6">
            <a
              className="w-full bg-gradient-to-br from-secondary to-on-secondary-container text-on-secondary py-3 rounded-lg font-bold shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              href="/estimation-immobiliere-ia"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Nouvelle Analyse</span>
            </a>
          </div>
        </aside>

        <main className="md:ml-72 pt-24 px-8 pb-12 min-h-screen">
          {isInitialLoading ? (
            <DashboardPageLoader cardCount={4} metricCount={3} sidePanelCount={1} />
          ) : (
            <>
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-1">Vue d'ensemble du marche marocain</p>
              <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter">Tableau de Bord Executif</h1>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-xl">
              <span className="material-symbols-outlined text-secondary">database</span>
              <span className="text-on-surface-variant font-medium">{dashboard.market_listings} annonces marche indexees</span>
            </div>
          </header>

          {error && (
            <div className="mb-8 rounded-lg border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
            <div className="md:col-span-6 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)] relative overflow-hidden">
              <p className="text-on-surface-variant font-medium mb-1">Valeur Totale du Portefeuille</p>
              <h2 className="text-4xl font-extrabold font-headline text-primary mb-6">
                {formatMoney(dashboard.total_asset_value)}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-secondary font-bold bg-secondary-container/30 px-3 py-1 rounded-full text-sm">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>{formatPercent(dashboard.value_growth_percent)}</span>
                </div>
                <span className="text-on-surface-variant text-sm">vs. valeur d'acquisition</span>
              </div>
            </div>
            <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MetricCard
                icon="account_balance_wallet"
                label="Cash-flow Mensuel"
                value={formatMoney(dashboard.monthly_cashflow, false)}
                sublabel={`Rendement net: ${formatPercent(dashboard.average_annual_yield)}`}
              />
              <MetricCard
                icon="analytics"
                label="Performance Globale"
                value={`${performanceScore}%`}
                sublabel={`Occupation: ${formatPercent(dashboard.average_occupancy_rate)}`}
              />
              <MetricCard
                icon="travel_explore"
                label="Prix Marche Moyen"
                value={formatMoney(dashboard.average_market_price_per_sqm, false)}
                sublabel="MAD / m² depuis ETL"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-headline text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                  Alertes Opportunites IA
                </h3>
                <span className="text-secondary font-bold text-sm">{dashboard.opportunities.length} signaux actifs</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboard.opportunities.length === 0 ? (
                  <EmptyPanel text="Les opportunites apparaitront apres quelques cycles ETL." />
                ) : (
                  dashboard.opportunities.slice(0, 4).map((opportunity) => (
                    <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10" key={opportunity.id}>
                      <div className="h-20 bg-gradient-to-r from-primary to-secondary px-5 py-4 text-white flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">{opportunity.city || "Maroc"}</p>
                          <p className="text-sm opacity-80">{opportunity.district || typeLabel(opportunity.asset_type)}</p>
                        </div>
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                          {signalLabel[opportunity.signal] ?? opportunity.signal}
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h4 className="font-bold text-primary line-clamp-2">{opportunity.title}</h4>
                          <span className="text-secondary font-bold">{formatPercent(opportunity.score)}</span>
                        </div>
                        <p className="text-on-surface-variant text-sm mb-5 leading-relaxed">
                          Prix annonce: {formatMoney(opportunity.price)}. Valeur estimee ML: {formatMoney(opportunity.estimated_value)}.
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <DataPill label="Decote marche" value={formatPercent(opportunity.market_discount_percent)} />
                          <DataPill label="Confiance" value={formatPercent(opportunity.confidence_score)} />
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl h-fit">
              <h3 className="text-xl font-bold font-headline text-primary mb-8">Activites Recentes</h3>
              <div className="space-y-7 relative">
                <div className="absolute left-[11px] top-0 bottom-4 w-px bg-outline-variant/30" />
                {dashboard.recent_activity.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Aucune activite recente en base.</p>
                ) : (
                  dashboard.recent_activity.map((activity, index) => (
                    <div className="relative flex gap-4" key={`${activity.type}-${activity.timestamp}-${index}`}>
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center relative z-10 shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-white">{activity.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{activity.title}</p>
                        <p className="text-xs text-on-surface-variant line-clamp-2">{activity.subtitle}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase mt-1">{formatRelative(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
            <div className="xl:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold font-headline text-primary">Croissance du Portefeuille</h3>
                  <p className="text-on-surface-variant text-sm">Serie generee depuis acquisition et valeur actuelle en base</p>
                </div>
                <span className="text-sm font-bold text-secondary">{formatMoney(dashboard.total_asset_value)}</span>
              </div>
              <div className="h-64 w-full bg-gradient-to-b from-surface-container-lowest to-surface-container-low rounded-xl flex items-end px-4 gap-4 overflow-hidden pt-8">
                {growthSeries.map((point) => (
                  <div
                    className="flex-1 bg-primary/20 rounded-t-lg hover:bg-primary/30 transition-colors"
                    key={point.label}
                    style={{ height: `${point.height_percent}%` }}
                    title={`${point.label}: ${formatMoney(point.value)}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                {growthSeries.map((point) => (
                  <span key={point.label}>{point.label}</span>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
              <h3 className="text-xl font-bold font-headline text-primary mb-6">Marche par Ville</h3>
              <div className="space-y-5">
                {dashboard.market_cities.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">En attente des donnees ETL.</p>
                ) : (
                  dashboard.market_cities.map((city) => (
                    <div key={city.city}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-primary">{city.city}</span>
                        <span className="text-on-surface-variant">{city.listing_count ?? 0} annonces</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{
                            width: `${Math.min(100, Math.max(8, ((city.listing_count ?? 0) / Math.max(1, dashboard.market_listings)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
            </>
          )}
        </main>
      </div>
    </ImportedPageDocument>
  );
}

function MetricCard({
  icon,
  label,
  sublabel,
  tone,
  value,
}: {
  icon: string;
  label: string;
  sublabel: string;
  tone?: "primary";
  value: string;
}) {
  return (
    <div className={tone === "primary" ? "bg-primary-container text-on-primary-fixed p-6 rounded-xl flex flex-col justify-between" : "bg-surface-container-highest p-6 rounded-xl flex flex-col justify-between"}>
      <div>
        <span className={tone === "primary" ? "material-symbols-outlined mb-4 opacity-70" : "material-symbols-outlined mb-4 text-secondary"}>{icon}</span>
        <p className={tone === "primary" ? "font-medium opacity-80" : "text-on-surface-variant font-medium"}>{label}</p>
      </div>
      <div className="mt-4">
        <h3 className={tone === "primary" ? "text-2xl font-bold font-headline" : "text-2xl font-bold font-headline text-primary"}>{value}</h3>
        <p className={tone === "primary" ? "text-on-primary-container text-sm mt-1" : "text-on-surface-variant text-sm mt-1"}>{sublabel}</p>
      </div>
    </div>
  );
}

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low/60 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase font-bold text-on-surface-variant">{label}</p>
      <p className="font-bold text-primary">{value}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/40 p-8 text-center text-on-surface-variant">
      {text}
    </div>
  );
}
