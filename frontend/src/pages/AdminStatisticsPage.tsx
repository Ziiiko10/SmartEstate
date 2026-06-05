import { useEffect, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";
import { USER_ROLES } from "../lib/roles";
import { formatDh } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type DashboardOverview = {
  active_users: number;
  average_market_price_per_sqm: number;
  distinct_market_cities: number;
  distinct_market_districts: number;
  market_transactions: { count: number; key: string; label: string }[];
  market_cities: { city: string; listing_count?: number }[];
  market_listings: number;
  organizations: number;
  user_roles: { count: number; key: string; label: string }[];
  valuations: number;
};

export default function AdminStatisticsPage() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview>({
    active_users: 0,
    average_market_price_per_sqm: 0,
    distinct_market_cities: 0,
    distinct_market_districts: 0,
    market_transactions: [],
    market_cities: [],
    market_listings: 0,
    organizations: 0,
    user_roles: [],
    valuations: 0,
  });
  const [error, setError] = useState("");

  const agentCount =
    overview.user_roles.find((item) => item.key === USER_ROLES.AGENT_IMMOBILIER)?.count ?? 0;

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const overviewPayload = await apiRequest<DashboardOverview>("/dashboard/overview/", { token });

        if (!active) {
          return;
        }

        setOverview(overviewPayload);
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Impossible de charger les statistiques globales."));
        }
      }
    }

    void loadStats();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Statistiques globales"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Vision plateforme
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Statistiques globales
          </h1>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <MetricCard label="Utilisateurs actifs" value={String(overview.active_users)} />
          <MetricCard label="Agents immobiliers" value={String(agentCount)} />
          <MetricCard label="Annonces ETL indexées" value={String(overview.market_listings)} />
          <MetricCard label="Prix moyen / m²" value={formatDh(overview.average_market_price_per_sqm)} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_360px] gap-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-headline font-bold text-primary">Villes les plus couvertes</h2>
            <div className="mt-6 space-y-4">
              {overview.market_cities.slice(0, 6).map((city) => (
                <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-5 py-4" key={city.city}>
                  <p className="font-semibold text-primary">{city.city}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-secondary">
                    {city.listing_count ?? 0} annonces
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
              Indicateurs marché
            </p>
            <div className="mt-6 space-y-4">
              <DataRow label="Villes suivies" value={String(overview.distinct_market_cities)} />
              <DataRow label="Quartiers suivis" value={String(overview.distinct_market_districts)} />
              <DataRow label="Organisations actives" value={String(overview.organizations)} />
              <DataRow label="Estimations sauvegardées" value={String(overview.valuations)} />
            </div>
          </aside>
        </section>
      </main>
    </ImportedPageDocument>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-3xl font-headline font-extrabold text-primary">{value}</p>
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
