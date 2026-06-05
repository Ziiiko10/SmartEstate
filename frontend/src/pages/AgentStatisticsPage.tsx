// Statistiques dédiées a l'activite de l'agent immobilier.
import { useEffect, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { DataRow, MetricCard } from "../components/DashboardWidgets";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";
import { formatDh } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const DASHBOARD_OVERVIEW_WITH_OPPORTUNITIES_PATH = "/dashboard/overview/?include_opportunities=1";

type DashboardOverview = {
  active_assets: number;
  assets: number;
  average_annual_yield: number;
  average_occupancy_rate: number;
  market_listings: number;
  monthly_cashflow: number;
  opportunities: { city: string; score: number | null; signal: string; title: string }[];
  portfolios: number;
  recommendations_open: number;
  reports: number;
  scenarios: number;
  valuations: number;
};

const emptyOverview: DashboardOverview = {
  active_assets: 0,
  assets: 0,
  average_annual_yield: 0,
  average_occupancy_rate: 0,
  market_listings: 0,
  monthly_cashflow: 0,
  opportunities: [],
  portfolios: 0,
  recommendations_open: 0,
  reports: 0,
  scenarios: 0,
  valuations: 0,
};

// Affiche les KPI et opportunites IA visibles depuis l'espace agent.
export default function AgentStatisticsPage() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [error, setError] = useState("");

  // Charge la synthese agent enrichie des opportunites detectees par le backend.
  useEffect(() => {
    let active = true;

    // Recupere le dashboard agent et fusionne la reponse avec des valeurs par defaut.
    async function loadOverview() {
      try {
        const payload = await apiRequest<DashboardOverview>(DASHBOARD_OVERVIEW_WITH_OPPORTUNITIES_PATH, { token });
        if (active) {
          setOverview({ ...emptyOverview, ...payload });
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Impossible de charger les statistiques agent."));
        }
      }
    }

    void loadOverview();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Statistiques agent"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Pilotage commercial
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Statistiques agent
          </h1>
        </section>

        {error && (
          <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <MetricCard label="Actifs suivis" value={String(overview.assets)} />
          <MetricCard label="Cash-flow mensuel" value={formatDh(overview.monthly_cashflow, true)} />
          <MetricCard
            label="Occupation moyenne"
            value={`${overview.average_occupancy_rate.toLocaleString("fr-MA", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`}
          />
          <MetricCard
            label="Rendement moyen"
            value={`${overview.average_annual_yield.toLocaleString("fr-MA", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_380px] gap-8">
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-headline font-bold text-primary">Opportunités IA actuelles</h2>
            <div className="mt-6 space-y-4">
              {overview.opportunities.length === 0 ? (
                <div className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm text-on-surface-variant">
                  Aucune opportunité IA active pour le moment.
                </div>
              ) : (
                overview.opportunities.slice(0, 4).map((item) => (
                  <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-5 py-4" key={item.title}>
                    <div>
                      <p className="font-semibold text-primary">{item.title}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{item.city || "Maroc"} · {item.signal}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-secondary">
                      {(item.score ?? 0).toLocaleString("fr-MA", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}/100
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
              Synthèse
            </p>
            <h2 className="mt-3 text-2xl font-headline font-extrabold">Indicateurs du portefeuille agent</h2>
            <div className="mt-6 space-y-4">
              <DataRow label="Actifs exploités" value={String(overview.active_assets)} />
              <DataRow label="Opportunités IA" value={String(overview.opportunities.length)} />
              <DataRow label="Recommandations ouvertes" value={String(overview.recommendations_open)} />
              <DataRow label="Scénarios enregistrés" value={String(overview.scenarios)} />
              <DataRow label="Estimations sauvegardées" value={String(overview.valuations)} />
              <DataRow label="Rapports disponibles" value={String(overview.reports)} />
              <DataRow label="Portefeuilles visibles" value={String(overview.portfolios)} />
            </div>
          </aside>
        </section>
      </main>
    </ImportedPageDocument>
  );
}
