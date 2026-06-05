import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { DashboardPageLoader } from "../components/LoadingState";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";
import { getRoleLabel, USER_ROLES } from "../lib/roles";
import { APP_ROUTES } from "../lib/smartestateApp";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const DASHBOARD_REFRESH_INTERVAL_MS = 30000;
const CHART_COLORS = ["#0f766e", "#f59e0b", "#2563eb", "#7c3aed", "#dc2626", "#16a34a"];

type BreakdownItem = {
  count: number;
  key: string;
  label: string;
};

type AssetCityBreakdown = {
  asset_count: number;
  city: string;
};

type ActivitySeriesPoint = {
  assets: number;
  date: string;
  label: string;
  market_updates: number;
  total: number;
  users: number;
  valuations: number;
};

type ActivityItem = {
  icon: string;
  subtitle: string;
  timestamp: string;
  title: string;
  type: string;
};

type PendingAgent = {
  agency_name: string;
  city: string;
  created_at: string;
  email: string;
  full_name: string;
  id: number;
  phone_number: string;
  status: string;
};

type PendingListing = {
  agency_name: string;
  agent_name: string;
  city: string;
  created_at: string;
  district: string;
  id: number;
  price: number;
  status: string;
  title: string;
};

type CityBreakdown = {
  average_price?: number | string | null;
  city: string;
  listing_count?: number;
};

type DistrictBreakdown = {
  district: string;
  listing_count: number;
};

type RecentAsset = {
  city: string;
  created_at: string;
  district: string;
  id: number;
  price: number;
  status: string;
  title: string;
  views_count: number | null;
};

type RecentValuation = {
  asking_price: number | null;
  asset_type: string;
  city: string;
  created_at: string;
  district: string;
  estimated_value: number;
  gap_percent: number | null;
  id: number;
  title: string;
};

type ClientRequestSummary = {
  budget: number | null;
  city: string;
  client_name: string;
  created_at: string;
  id: number;
  request_type: string;
  status: string;
};

type ViewedAsset = {
  city: string;
  id: number;
  inquiries_count: number | null;
  price: number | null;
  title: string;
  views_count: number | null;
};

type NotificationItem = {
  subtitle: string;
  timestamp: string;
  title: string;
};

type AlertItem = {
  count: number;
  description: string;
  id: string;
  severity: string;
  title: string;
};

type ModelState = {
  dataset_size: number;
  last_training_at: string | null;
  mae: number | null;
  model_name: string;
  r2_score: number | null;
  rmse: number | null;
  status: string;
  status_label: string;
  tracking_note: string;
};

type DashboardOverview = {
  active_assets: number;
  active_users: number;
  activity_series: ActivitySeriesPoint[];
  alerts: AlertItem[];
  assets: number;
  asset_statuses: BreakdownItem[];
  average_annual_yield: number;
  average_market_price_per_sqm: number;
  average_occupancy_rate: number;
  client_requests_count: number;
  distinct_market_cities: number;
  distinct_market_districts: number;
  market_signal_note: string;
  market_asset_types: BreakdownItem[];
  market_cities: CityBreakdown[];
  market_listings: number;
  market_transactions: BreakdownItem[];
  model_state: ModelState;
  notifications: NotificationItem[];
  pending_agents: PendingAgent[];
  pending_agents_count: number;
  pending_listings: PendingListing[];
  pending_listings_count: number;
  performance_signal_note: string;
  portfolios: number;
  published_listings: number;
  recent_activity: ActivityItem[];
  recent_assets: RecentAsset[];
  recent_client_requests: ClientRequestSummary[];
  recent_valuations: RecentValuation[];
  recommendations_open: number;
  refreshed_at: string;
  rented_assets: number;
  reports: number;
  scenarios: number;
  sold_assets: number;
  top_market_asset_type: BreakdownItem | null;
  top_market_city: CityBreakdown | null;
  top_market_district: DistrictBreakdown | null;
  top_market_districts: DistrictBreakdown[];
  top_cities: AssetCityBreakdown[];
  top_viewed_assets: ViewedAsset[];
  total_agents: number;
  total_asset_value: number;
  total_listings: number;
  tracked_asset_views: boolean;
  tracked_client_requests: boolean;
  tracked_market_engagement: boolean;
  user_roles: BreakdownItem[];
  users_total: number;
  valuations: number;
  valuations_by_city: { city: string; count: number }[];
};

const emptyDashboard: DashboardOverview = {
  active_assets: 0,
  active_users: 0,
  activity_series: [],
  alerts: [],
  assets: 0,
  asset_statuses: [],
  average_annual_yield: 0,
  average_market_price_per_sqm: 0,
  average_occupancy_rate: 0,
  client_requests_count: 0,
  distinct_market_cities: 0,
  distinct_market_districts: 0,
  market_signal_note: "",
  market_asset_types: [],
  market_cities: [],
  market_listings: 0,
  market_transactions: [],
  model_state: {
    dataset_size: 0,
    last_training_at: null,
    mae: null,
    model_name: "",
    r2_score: null,
    rmse: null,
    status: "update_needed",
    status_label: "A mettre a jour",
    tracking_note: "",
  },
  notifications: [],
  pending_agents: [],
  pending_agents_count: 0,
  pending_listings: [],
  pending_listings_count: 0,
  performance_signal_note: "",
  portfolios: 0,
  published_listings: 0,
  recent_activity: [],
  recent_assets: [],
  recent_client_requests: [],
  recent_valuations: [],
  recommendations_open: 0,
  refreshed_at: "",
  rented_assets: 0,
  reports: 0,
  scenarios: 0,
  sold_assets: 0,
  top_market_asset_type: null,
  top_market_city: null,
  top_market_district: null,
  top_market_districts: [],
  top_cities: [],
  top_viewed_assets: [],
  total_agents: 0,
  total_asset_value: 0,
  total_listings: 0,
  tracked_asset_views: false,
  tracked_client_requests: false,
  tracked_market_engagement: false,
  user_roles: [],
  users_total: 0,
  valuations: 0,
  valuations_by_city: [],
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
  })} DH`;
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Non disponible";
  }

  return `${Number(value).toLocaleString("fr-MA", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

function formatCount(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("fr-MA");
}

function formatNullableMetric(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) {
    return "Non disponible";
  }

  return `${Number(value).toLocaleString("fr-MA", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}${suffix}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Non historise";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatChartDateLabel(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatRelative(value: string) {
  if (!value) {
    return "Aucune date";
  }

  const date = new Date(value);
  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }
  return formatDate(value);
}

export default function ExecutiveDashboardPage() {
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardOverview>(emptyDashboard);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(
    async (forceRefresh = false) => {
      setIsLoading(true);
      setError("");

      try {
        const payload = await apiRequest<DashboardOverview>("/dashboard/overview/", {
          forceRefresh,
          token,
        });
        setDashboard({ ...emptyDashboard, ...payload });
      } catch (requestError) {
        setError(getErrorMessage(requestError, "Impossible de charger le dashboard."));
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadDashboard();
    const interval = window.setInterval(() => {
      void loadDashboard(true);
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  const isAdmin = user?.role === USER_ROLES.ADMINISTRATEUR;
  const roleLabel = getRoleLabel(user?.role);
  const pageTitle = isAdmin ? "Tableau de bord administrateur" : "Tableau de bord agent immobilier";
  const isInitialLoading = isLoading && dashboard.refreshed_at === "" && !error;

  function handleSignOut() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title={`SmartEstate - ${pageTitle}`}
      styles={pageStyles}
    >
      <div>
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-end border-b border-opacity-10 bg-[#f9f9fb] px-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)] md:px-8">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
              onClick={handleSignOut}
              type="button"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Deconnecter</span>
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              onClick={() => void loadDashboard(true)}
              type="button"
            >
              <span className={isLoading ? "material-symbols-outlined animate-spin" : "material-symbols-outlined"}>
                sync
              </span>
              <span>{isLoading ? "Actualisation..." : "Actualiser"}</span>
            </button>
            <span className="hidden text-xs font-semibold text-on-surface-variant sm:inline">
              {isLoading
                ? "Chargement..."
                : `${formatDate(dashboard.refreshed_at)} · auto ${Math.round(DASHBOARD_REFRESH_INTERVAL_MS / 1000)}s`}
            </span>
          </div>
        </header>

        <main className="min-h-screen px-6 pb-12 pt-24 md:ml-72 md:px-10">
          {isInitialLoading ? (
            <DashboardPageLoader cardCount={8} metricCount={3} sidePanelCount={1} />
          ) : (
            <>
              <section className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                  {roleLabel}
                </p>
                <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
                  {pageTitle}
                </h1>
              </section>

              {error && (
                <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
                  {error}
                </div>
              )}

              {isAdmin ? (
                <AdminDashboardContent dashboard={dashboard} navigate={navigate} />
              ) : (
                <AgentDashboardContent dashboard={dashboard} navigate={navigate} />
              )}
            </>
          )}
        </main>
      </div>
    </ImportedPageDocument>
  );
}

function AdminDashboardContent({
  dashboard,
  navigate,
}: {
  dashboard: DashboardOverview;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const userRoleChartItems = dashboard.user_roles.map((item, index) => ({
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: item.label,
    value: item.count,
  }));
  const marketTransactionChartItems = dashboard.market_transactions.map((item, index) => ({
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: item.label,
    value: item.count,
  }));
  const cityPriceChartItems = dashboard.market_cities.map((city, index) => ({
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: city.city,
    secondary: `${city.listing_count ?? 0} annonces`,
    value: Number(city.average_price ?? 0),
  }));

  const topStats = [
    { label: "Nombre total d'utilisateurs", value: dashboard.users_total.toLocaleString("fr-MA") },
    { label: "Nombre total d'agents immobiliers", value: dashboard.total_agents.toLocaleString("fr-MA") },
    { label: "Nombre total d'annonces", value: dashboard.total_listings.toLocaleString("fr-MA") },
    { label: "Annonces en attente de validation", value: dashboard.pending_listings_count.toLocaleString("fr-MA") },
  ];

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle title="Cartes statistiques principales" />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {topStats.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          subtitle="Deux graphiques horizontaux minimum sont affiches ici avec des donnees live."
          title="Graphiques temps reel"
        />
        <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <LineChartCard
            lines={[
              { color: "#2563eb", key: "market_updates", label: "Mises a jour ETL" },
              { color: "#0f766e", key: "valuations", label: "Estimations" },
              { color: "#f59e0b", key: "assets", label: "Nouvelles annonces internes" },
              { color: "#7c3aed", key: "users", label: "Nouveaux utilisateurs" },
            ]}
            points={dashboard.activity_series}
            subtitle="Volume d'activite observe sur les 7 derniers jours."
            title="Flux live de la plateforme"
          />
          <DonutChartCard
            centerLabel="Utilisateurs"
            centerValue={formatCount(dashboard.users_total)}
            items={userRoleChartItems}
            subtitle="Repartition actuelle des profils connectables."
            title="Repartition des roles"
          />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
          <HorizontalBarChartCard
            formatter={(value) => formatMoney(value, false)}
            items={cityPriceChartItems}
            subtitle="Prix moyens observes sur les villes alimentees par l'ETL."
            title="Prix moyen par ville"
          />
          <HorizontalBarChartCard
            formatter={(value) => `${formatCount(value)} annonces`}
            items={marketTransactionChartItems}
            subtitle="Repartition actuelle des annonces scrapées par transaction."
            title="Transactions du marche"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Dernieres actions enregistrees sur la plateforme." title="Activite recente" />
          <div className="mt-6 space-y-5">
            {dashboard.recent_activity.length === 0 ? (
              <EmptyBlock text="Aucune activite recente enregistree." />
            ) : (
              dashboard.recent_activity.map((activity, index) => (
                <div className="flex items-start gap-4" key={`${activity.type}-${activity.timestamp}-${index}`}>
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-secondary">
                    <span className="material-symbols-outlined text-base">{activity.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{activity.title}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{activity.subtitle}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-on-surface-variant">
                      {formatRelative(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-primary p-6 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
          <SectionTitleDark
            subtitle="Acces direct aux modules de gestion."
            title="Acces rapides"
          />
          <div className="mt-6 grid grid-cols-1 gap-3">
            <QuickActionButton label="Gerer les utilisateurs" onClick={() => navigate(APP_ROUTES.adminUsers)} />
            <QuickActionButton label="Gerer les agents" onClick={() => navigate(APP_ROUTES.adminAgents)} />
            <QuickActionButton label="Gerer les annonces" onClick={() => navigate(APP_ROUTES.adminListings)} />
            <QuickActionButton label="Gerer les villes et quartiers" onClick={() => navigate(APP_ROUTES.adminLocations)} />
            <QuickActionButton label="Gerer les donnees immobilieres" onClick={() => navigate(APP_ROUTES.adminData)} />
            <QuickActionButton label="Gerer le modele ML" onClick={() => navigate(APP_ROUTES.adminModel)} />
            <QuickActionButton label="Voir les statistiques globales" onClick={() => navigate(APP_ROUTES.adminStats)} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Annonces internes actuellement en statut attente." title="Annonces a valider" />
          <div className="mt-6 overflow-x-auto">
            {dashboard.pending_listings.length === 0 ? (
              <EmptyBlock text="Aucune annonce n'est actuellement en attente de validation." />
            ) : (
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-3 py-3 font-bold">Titre</th>
                    <th className="px-3 py-3 font-bold">Agent</th>
                    <th className="px-3 py-3 font-bold">Ville</th>
                    <th className="px-3 py-3 font-bold">Prix</th>
                    <th className="px-3 py-3 font-bold">Statut</th>
                    <th className="px-3 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.pending_listings.map((listing) => (
                    <tr className="border-b border-outline-variant/10" key={listing.id}>
                      <td className="px-3 py-4 font-semibold text-primary">{listing.title}</td>
                      <td className="px-3 py-4 text-sm text-on-surface-variant">{listing.agent_name}</td>
                      <td className="px-3 py-4">{listing.city}</td>
                      <td className="px-3 py-4 font-semibold text-primary">{formatMoney(listing.price, false)}</td>
                      <td className="px-3 py-4">
                        <StatusBadge label={listing.status} tone="warning" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <TableActionButton
                            label="Valider"
                            onClick={() => navigate(APP_ROUTES.adminListings)}
                            tone="primary"
                          />
                          <TableActionButton
                            label="Refuser"
                            onClick={() => navigate(APP_ROUTES.adminListings)}
                            tone="danger"
                          />
                          <TableActionButton
                            label="Voir detail"
                            onClick={() => navigate(APP_ROUTES.adminListings)}
                            tone="ghost"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Nouveaux agents demandant l'acces a la plateforme." title="Agents en attente de validation" />
          <div className="mt-6 overflow-x-auto">
            {dashboard.pending_agents.length === 0 ? (
              <EmptyBlock text="Aucun agent n'est actuellement en attente de validation." />
            ) : (
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-3 py-3 font-bold">Agent</th>
                    <th className="px-3 py-3 font-bold">Agence</th>
                    <th className="px-3 py-3 font-bold">Ville</th>
                    <th className="px-3 py-3 font-bold">Telephone</th>
                    <th className="px-3 py-3 font-bold">Statut</th>
                    <th className="px-3 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.pending_agents.map((agent) => (
                    <tr className="border-b border-outline-variant/10" key={agent.id}>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-primary">{agent.full_name}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{agent.email}</p>
                      </td>
                      <td className="px-3 py-4">{agent.agency_name}</td>
                      <td className="px-3 py-4">{agent.city || "N/A"}</td>
                      <td className="px-3 py-4">{agent.phone_number || "N/A"}</td>
                      <td className="px-3 py-4">
                        <StatusBadge label={agent.status} tone="warning" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <TableActionButton
                            label="Valider"
                            onClick={() => navigate(APP_ROUTES.adminAgents)}
                            tone="primary"
                          />
                          <TableActionButton
                            label="Refuser"
                            onClick={() => navigate(APP_ROUTES.adminAgents)}
                            tone="danger"
                          />
                          <TableActionButton
                            label="Consulter le profil"
                            onClick={() => navigate(APP_ROUTES.adminAgents)}
                            tone="ghost"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Indicateurs generaux sur le marche dans l'application." title="Statistiques du marche immobilier" />
          {!dashboard.tracked_market_engagement && dashboard.market_signal_note ? (
            <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
              {dashboard.market_signal_note}
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoCard
              label="Ville la plus recherchee"
              value={dashboard.top_market_city?.city || "Non disponible"}
              secondary={
                dashboard.top_market_city
                  ? dashboard.tracked_market_engagement
                    ? `${dashboard.top_market_city.listing_count ?? 0} recherches`
                    : `Proxy ETL: ${dashboard.top_market_city.listing_count ?? 0} annonces`
                  : "En attente des donnees ETL"
              }
            />
            <InfoCard
              label="Quartier le plus consulte"
              value={dashboard.top_market_district?.district || "Non disponible"}
              secondary={
                dashboard.top_market_district
                  ? dashboard.tracked_market_engagement
                    ? `${dashboard.top_market_district.listing_count} consultations`
                    : `Proxy ETL: ${dashboard.top_market_district.listing_count} annonces`
                  : "En attente des donnees ETL"
              }
            />
            <InfoCard
              label="Type de bien le plus demande"
              value={dashboard.top_market_asset_type?.label || "Non disponible"}
              secondary={
                dashboard.top_market_asset_type
                  ? dashboard.tracked_market_engagement
                    ? `${dashboard.top_market_asset_type.count} demandes`
                    : `Proxy ETL: ${dashboard.top_market_asset_type.count} annonces`
                  : "En attente des donnees ETL"
              }
            />
            <InfoCard
              label="Prix moyen global"
              value={formatMoney(dashboard.average_market_price_per_sqm, false)}
              secondary="DH / m² observe sur les ventes"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ListPanel
              items={dashboard.market_cities.map((city) => ({
                label: city.city,
                secondary: city.average_price
                  ? `Prix moyen: ${formatMoney(Number(city.average_price), false)}`
                  : "Prix moyen indisponible",
                value: `${city.listing_count ?? 0} annonces`,
              }))}
              title="Prix moyen par ville"
            />
            <ListPanel
              items={dashboard.valuations_by_city.map((city) => ({
                label: city.city,
                secondary: "Estimations enregistrees",
                value: `${city.count}`,
              }))}
              title="Nombre d'estimations par ville"
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <SectionTitle subtitle="Etat courant de la couche ML exploitee par la plateforme." title="Etat du modele Machine Learning" />
            <div className="mt-6 space-y-4">
              <DataRow label="Modele utilise" value={dashboard.model_state.model_name || "Non disponible"} />
              <DataRow label="Dernier entrainement" value={formatDate(dashboard.model_state.last_training_at)} />
              <DataRow label="Donnees utilisees" value={dashboard.model_state.dataset_size.toLocaleString("fr-MA")} />
              <DataRow label="Score R²" value={formatNullableMetric(dashboard.model_state.r2_score)} />
              <DataRow label="MAE" value={dashboard.model_state.mae === null ? "Non disponible" : formatMoney(dashboard.model_state.mae, false)} />
              <DataRow label="RMSE" value={dashboard.model_state.rmse === null ? "Non disponible" : formatMoney(dashboard.model_state.rmse, false)} />
              <DataRow label="Statut" value={dashboard.model_state.status_label} />
            </div>
            {dashboard.model_state.tracking_note ? (
              <p className="mt-5 text-xs leading-relaxed text-on-surface-variant">
                {dashboard.model_state.tracking_note}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <SectionTitle subtitle="Problemes a traiter rapidement par l'administration." title="Alertes ou problemes" />
            <div className="mt-6 space-y-4">
              {dashboard.alerts.length === 0 ? (
                <EmptyBlock text="Aucune alerte critique detectee." />
              ) : (
                dashboard.alerts.map((alert) => (
                  <div className="rounded-xl bg-surface-container-low px-4 py-4" key={alert.id}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-primary">{alert.title}</p>
                      <StatusBadge
                        label={alert.count.toLocaleString("fr-MA")}
                        tone={alert.severity === "warning" ? "warning" : "success"}
                      />
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">{alert.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AgentDashboardContent({
  dashboard,
  navigate,
}: {
  dashboard: DashboardOverview;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const assetStatusChartItems = dashboard.asset_statuses.map((item, index) => ({
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: item.label,
    value: item.count,
  }));
  const agentCityChartItems = dashboard.top_cities.map((item, index) => ({
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: item.city,
    value: item.asset_count,
  }));
  const valuationCityChartItems = dashboard.valuations_by_city.map((item, index) => ({
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: item.city,
    value: item.count,
  }));
  const districtSignalItems = dashboard.top_market_districts.map((item, index) => ({
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: item.district,
    value: item.listing_count,
  }));
  const totalTrackedViews = dashboard.top_viewed_assets.reduce(
    (sum, asset) => sum + Number(asset.views_count ?? 0),
    0,
  );
  const totalTrackedInquiries = dashboard.top_viewed_assets.reduce(
    (sum, asset) => sum + Number(asset.inquiries_count ?? 0),
    0,
  );
  const conversionRate =
    dashboard.tracked_asset_views &&
    dashboard.tracked_client_requests &&
    totalTrackedViews > 0
      ? `${((totalTrackedInquiries / totalTrackedViews) * 100).toLocaleString("fr-MA", {
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        })}%`
      : "Non calculable";

  const topStats = [
    { label: "Nombre total de mes annonces", value: dashboard.assets.toLocaleString("fr-MA") },
    { label: "Nombre d'annonces actives", value: dashboard.active_assets.toLocaleString("fr-MA") },
    { label: "Nombre d'annonces vendues", value: dashboard.sold_assets.toLocaleString("fr-MA") },
    { label: "Nombre d'annonces louees", value: dashboard.rented_assets.toLocaleString("fr-MA") },
    { label: "Nombre de demandes clients recues", value: dashboard.client_requests_count.toLocaleString("fr-MA") },
    { label: "Nombre d'estimations realisees", value: dashboard.valuations.toLocaleString("fr-MA") },
  ];

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          subtitle="Vue sur l'activite commerciale personnelle de l'agent."
          title="Cartes statistiques principales"
        />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {topStats.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          subtitle="Graphiques relies aux donnees visibles par l'agent et rafraichis automatiquement."
          title="Graphiques temps reel"
        />
        <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <LineChartCard
            lines={[
              { color: "#0f766e", key: "assets", label: "Annonces creees" },
              { color: "#2563eb", key: "valuations", label: "Estimations" },
              { color: "#f59e0b", key: "market_updates", label: "Mises a jour marche" },
            ]}
            points={dashboard.activity_series}
            subtitle="Activite observee sur les 7 derniers jours dans votre perimetre."
            title="Flux live de votre activite"
          />
          <DonutChartCard
            centerLabel="Mes annonces"
            centerValue={formatCount(dashboard.assets)}
            items={assetStatusChartItems}
            subtitle="Repartition de vos annonces par statut actuel."
            title="Statut de mes annonces"
          />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
          <HorizontalBarChartCard
            formatter={(value) => `${formatCount(value)} annonces`}
            items={agentCityChartItems}
            subtitle="Concentration geographique actuelle de votre portefeuille."
            title="Mes annonces par ville"
          />
          <HorizontalBarChartCard
            formatter={(value) => `${formatCount(value)} signaux`}
            items={valuationCityChartItems.length > 0 ? valuationCityChartItems : districtSignalItems}
            subtitle={
              valuationCityChartItems.length > 0
                ? "Villes sur lesquelles des estimations ont ete enregistrees."
                : "Proxy marche en direct base sur les quartiers les plus alimentes par l'ETL."
            }
            title={valuationCityChartItems.length > 0 ? "Estimations par ville" : "Quartiers chauds du marche"}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <SectionTitle subtitle="Dernieres annonces visibles dans l'espace agent." title="Mes annonces recentes" />
        <div className="mt-6 overflow-x-auto">
          {dashboard.recent_assets.length === 0 ? (
            <EmptyBlock text="Aucune annonce recente n'est disponible." />
          ) : (
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
              <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-3 py-3 font-bold">Titre</th>
                <th className="px-3 py-3 font-bold">Ville</th>
                <th className="px-3 py-3 font-bold">Quartier</th>
                <th className="px-3 py-3 font-bold">Prix</th>
                <th className="px-3 py-3 font-bold">Statut</th>
                <th className="px-3 py-3 font-bold">Vues</th>
                <th className="px-3 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recent_assets.map((asset) => (
                <tr className="border-b border-outline-variant/10" key={asset.id}>
                    <td className="px-3 py-4 font-semibold text-primary">{asset.title}</td>
                    <td className="px-3 py-4">{asset.city}</td>
                    <td className="px-3 py-4">{asset.district || "N/A"}</td>
                    <td className="px-3 py-4 font-semibold text-primary">{formatMoney(asset.price, false)}</td>
                    <td className="px-3 py-4">
                      <StatusBadge label={asset.status} tone="neutral" />
                    </td>
                  <td className="px-3 py-4 text-on-surface-variant">
                    {asset.views_count === null ? "Non suivi" : asset.views_count.toLocaleString("fr-MA")}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <TableActionButton label="Voir" onClick={() => navigate(APP_ROUTES.agentListings)} tone="ghost" />
                      <TableActionButton
                        label="Modifier"
                        onClick={() => navigate(APP_ROUTES.agentListings)}
                        tone="primary"
                      />
                      <TableActionButton
                        label="Desactiver"
                        onClick={() => navigate(APP_ROUTES.agentListings)}
                        tone="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Demandes clients rattachees a l'activite de l'agent." title="Demandes clients recentes" />
          <div className="mt-6 overflow-x-auto">
            {dashboard.recent_client_requests.length === 0 ? (
              <div className="space-y-4">
                <EmptyBlock text="Le suivi structure des demandes clients n'est pas encore branche dans la base." />
                <TableActionButton
                  label="Voir les demandes clients"
                  onClick={() => navigate(APP_ROUTES.agentRequests)}
                  tone="primary"
                />
              </div>
            ) : (
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-3 py-3 font-bold">Client</th>
                    <th className="px-3 py-3 font-bold">Type de demande</th>
                    <th className="px-3 py-3 font-bold">Ville recherchee</th>
                    <th className="px-3 py-3 font-bold">Budget</th>
                    <th className="px-3 py-3 font-bold">Statut</th>
                    <th className="px-3 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_client_requests.map((request) => (
                    <tr className="border-b border-outline-variant/10" key={request.id}>
                      <td className="px-3 py-4 font-semibold text-primary">{request.client_name}</td>
                      <td className="px-3 py-4">{request.request_type}</td>
                      <td className="px-3 py-4">{request.city || "N/A"}</td>
                      <td className="px-3 py-4">
                        {request.budget === null ? "Non disponible" : formatMoney(request.budget, false)}
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge label={request.status} tone="neutral" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <TableActionButton
                            label="Voir la demande"
                            onClick={() => navigate(APP_ROUTES.agentRequests)}
                            tone="ghost"
                          />
                          <TableActionButton
                            label="Contacter le client"
                            onClick={() => navigate(APP_ROUTES.agentRequests)}
                            tone="primary"
                          />
                          <TableActionButton
                            label="Modifier le statut"
                            onClick={() => navigate(APP_ROUTES.agentRequests)}
                            tone="ghost"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Biens les plus consultes par les utilisateurs." title="Biens les plus consultes" />
          <div className="mt-6 overflow-x-auto">
            {dashboard.top_viewed_assets.length === 0 ? (
              <EmptyBlock text="Le suivi des vues et des demandes recues par annonce n'est pas encore historise dans la base." />
            ) : (
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-3 py-3 font-bold">Titre</th>
                    <th className="px-3 py-3 font-bold">Ville</th>
                    <th className="px-3 py-3 font-bold">Prix</th>
                    <th className="px-3 py-3 font-bold">Vues</th>
                    <th className="px-3 py-3 font-bold">Demandes recues</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.top_viewed_assets.map((asset) => (
                    <tr className="border-b border-outline-variant/10" key={asset.id}>
                      <td className="px-3 py-4 font-semibold text-primary">{asset.title}</td>
                      <td className="px-3 py-4">{asset.city || "N/A"}</td>
                      <td className="px-3 py-4">
                        {asset.price === null ? "Non disponible" : formatMoney(asset.price, false)}
                      </td>
                      <td className="px-3 py-4">
                        {asset.views_count === null ? "Non suivi" : asset.views_count.toLocaleString("fr-MA")}
                      </td>
                      <td className="px-3 py-4">
                        {asset.inquiries_count === null ? "Non suivi" : asset.inquiries_count.toLocaleString("fr-MA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Indicateurs utiles pour comprendre l'activite disponible aujourd'hui." title="Resume des performances" />
          {dashboard.performance_signal_note ? (
            <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
              {dashboard.performance_signal_note}
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoCard
              label="Nombre de vues total"
              value={dashboard.tracked_asset_views ? totalTrackedViews.toLocaleString("fr-MA") : "Non suivi"}
              secondary={
                dashboard.tracked_asset_views
                  ? "Somme des vues historisees sur les annonces"
                  : "Aucun suivi de vues detaillees en base"
              }
            />
            <InfoCard
              label="Nombre de contacts recus"
              value={
                dashboard.tracked_client_requests
                  ? dashboard.client_requests_count.toLocaleString("fr-MA")
                  : "Non suivi"
              }
              secondary={
                dashboard.tracked_client_requests
                  ? "Demandes clients historisees"
                  : "Le suivi des contacts n'est pas encore branche"
              }
            />
            <InfoCard
              label="Taux de conversion approximatif"
              value={conversionRate}
              secondary="Calcule uniquement quand vues et demandes sont historisees"
            />
            <InfoCard
              label="Quartier le plus demande"
              value={dashboard.top_market_district?.district || "Non disponible"}
              secondary={
                dashboard.tracked_market_engagement
                  ? "Base sur les signaux d'engagement traces"
                  : "Proxy base sur le volume d'annonces ETL"
              }
            />
            <InfoCard
              label="Type de bien le plus demande"
              value={dashboard.top_market_asset_type?.label || "Non disponible"}
              secondary={
                dashboard.tracked_market_engagement
                  ? "Type de bien le plus demande"
                  : "Proxy base sur le volume d'annonces ETL"
              }
            />
          </div>
        </div>

        <div className="rounded-2xl bg-primary p-6 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
          <SectionTitleDark
            subtitle="Acces direct aux actions utiles pour l'agent."
            title="Acces rapides"
          />
          <div className="mt-6 grid grid-cols-1 gap-3">
            <QuickActionButton label="Ajouter une annonce" onClick={() => navigate(APP_ROUTES.agentNewListing)} />
            <QuickActionButton label="Voir mes annonces" onClick={() => navigate(APP_ROUTES.agentListings)} />
            <QuickActionButton label="Estimer un bien" onClick={() => navigate(APP_ROUTES.agentEstimation)} />
            <QuickActionButton label="Voir les demandes clients" onClick={() => navigate(APP_ROUTES.agentRequests)} />
            <QuickActionButton label="Voir mes statistiques" onClick={() => navigate(APP_ROUTES.agentStats)} />
            <QuickActionButton label="Modifier mon profil" onClick={() => navigate(APP_ROUTES.agentProfile)} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Derniers biens estimes avec le modele ML." title="Estimations recentes" />
          <div className="mt-6 overflow-x-auto">
            {dashboard.recent_valuations.length === 0 ? (
              <EmptyBlock text="Aucune estimation recente n'est disponible." />
            ) : (
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-3 py-3 font-bold">Bien</th>
                    <th className="px-3 py-3 font-bold">Ville</th>
                    <th className="px-3 py-3 font-bold">Quartier</th>
                    <th className="px-3 py-3 font-bold">Prix demande</th>
                    <th className="px-3 py-3 font-bold">Prix estime</th>
                    <th className="px-3 py-3 font-bold">Ecart</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_valuations.map((valuation) => (
                    <tr className="border-b border-outline-variant/10" key={valuation.id}>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-primary">{valuation.asset_type}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{valuation.title}</p>
                      </td>
                      <td className="px-3 py-4">{valuation.city || "N/A"}</td>
                      <td className="px-3 py-4">{valuation.district || "N/A"}</td>
                      <td className="px-3 py-4">{valuation.asking_price === null ? "Non disponible" : formatMoney(valuation.asking_price, false)}</td>
                      <td className="px-3 py-4 font-semibold text-primary">{formatMoney(valuation.estimated_value, false)}</td>
                      <td className="px-3 py-4">{formatPercent(valuation.gap_percent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <SectionTitle subtitle="Rappels et notifications utiles a l'agent." title="Rappels ou notifications" />
          <div className="mt-6 space-y-4">
            {dashboard.notifications.length === 0 ? (
              <EmptyBlock text="Aucune notification recente n'est disponible." />
            ) : (
              dashboard.notifications.map((item, index) => (
                <div className="rounded-xl bg-surface-container-low px-4 py-4" key={`${item.title}-${item.timestamp}-${index}`}>
                  <p className="font-semibold text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{item.subtitle}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-on-surface-variant">
                    {formatRelative(item.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function LineChartCard({
  lines,
  points,
  subtitle,
  title,
}: {
  lines: { color: string; key: keyof ActivitySeriesPoint; label: string }[];
  points: ActivitySeriesPoint[];
  subtitle: string;
  title: string;
}) {
  const width = 560;
  const height = 220;
  const paddingX = 20;
  const paddingTop = 18;
  const paddingBottom = 36;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(
    0,
    ...points.flatMap((point) => lines.map((line) => Number(point[line.key] ?? 0))),
  );

  function buildPolyline(key: keyof ActivitySeriesPoint) {
    if (points.length === 0) {
      return "";
    }

    return points
      .map((point, index) => {
        const x =
          points.length === 1
            ? width / 2
            : paddingX + (index / (points.length - 1)) * usableWidth;
        const y =
          paddingTop +
          usableHeight -
          ((Number(point[key] ?? 0) / Math.max(maxValue, 1)) * usableHeight);
        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle subtitle={subtitle} title={title} />
        <LiveBadge />
      </div>
      <div className="mt-5 flex flex-wrap gap-4">
        {lines.map((line) => (
          <LegendPill color={line.color} key={line.key} label={line.label} />
        ))}
      </div>
      {points.length === 0 || maxValue === 0 ? (
        <div className="mt-6">
          <EmptyBlock text="Aucune serie temporelle exploitable n'est disponible pour le moment." />
        </div>
      ) : (
        <div className="mt-6">
          <svg
            aria-label={title}
            className="h-auto w-full"
            role="img"
            viewBox={`0 0 ${width} ${height}`}
          >
            {[0, 1, 2, 3].map((step) => {
              const y = paddingTop + (usableHeight / 3) * step;
              return (
                <line
                  key={step}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                />
              );
            })}
            {lines.map((line) => (
              <g key={line.key}>
                <polyline
                  fill="none"
                  points={buildPolyline(line.key)}
                  stroke={line.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {points.map((point, index) => {
                  const x =
                    points.length === 1
                      ? width / 2
                      : paddingX + (index / (points.length - 1)) * usableWidth;
                  const y =
                    paddingTop +
                    usableHeight -
                    ((Number(point[line.key] ?? 0) / Math.max(maxValue, 1)) * usableHeight);
                  return (
                    <circle
                      cx={x}
                      cy={y}
                      fill="#ffffff"
                      key={`${line.key}-${point.date}`}
                      r="4.5"
                      stroke={line.color}
                      strokeWidth="3"
                    />
                  );
                })}
              </g>
            ))}
            {points.map((point, index) => {
              const x =
                points.length === 1
                  ? width / 2
                  : paddingX + (index / (points.length - 1)) * usableWidth;
              return (
                <text
                  fill="#64748b"
                  fontSize="12"
                  key={point.date}
                  textAnchor="middle"
                  x={x}
                  y={height - 10}
                >
                  {formatChartDateLabel(point.date)}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

function DonutChartCard({
  centerLabel,
  centerValue,
  items,
  subtitle,
  title,
}: {
  centerLabel: string;
  centerValue: string;
  items: { color: string; label: string; value: number }[];
  subtitle: string;
  title: string;
}) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle subtitle={subtitle} title={title} />
        <LiveBadge />
      </div>
      {total === 0 ? (
        <div className="mt-6">
          <EmptyBlock text="Aucune repartition exploitable n'est disponible pour ce graphique." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
          <div className="mx-auto">
            <svg
              aria-label={title}
              className="h-[170px] w-[170px]"
              role="img"
              viewBox="0 0 160 160"
            >
              <circle cx="80" cy="80" fill="none" r={radius} stroke="#e5e7eb" strokeWidth="18" />
              <g transform="rotate(-90 80 80)">
                {items.map((item) => {
                  const dashLength = (item.value / total) * circumference;
                  const segment = (
                    <circle
                      cx="80"
                      cy="80"
                      fill="none"
                      key={item.label}
                      r={radius}
                      stroke={item.color}
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={-offset}
                      strokeWidth="18"
                    />
                  );
                  offset += dashLength;
                  return segment;
                })}
              </g>
              <text
                fill="#64748b"
                fontSize="12"
                textAnchor="middle"
                x="80"
                y="74"
              >
                {centerLabel}
              </text>
              <text
                fill="#0f172a"
                fontSize="20"
                fontWeight="700"
                textAnchor="middle"
                x="80"
                y="98"
              >
                {centerValue}
              </text>
            </svg>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3" key={item.label}>
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-semibold text-primary">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-secondary">{formatCount(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HorizontalBarChartCard({
  formatter,
  items,
  subtitle,
  title,
}: {
  formatter: (value: number) => string;
  items: { color: string; label: string; secondary?: string; value: number }[];
  subtitle: string;
  title: string;
}) {
  const maxValue = Math.max(0, ...items.map((item) => item.value));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle subtitle={subtitle} title={title} />
        <LiveBadge />
      </div>
      <div className="mt-6 space-y-4">
        {items.length === 0 || maxValue === 0 ? (
          <EmptyBlock text="Aucune distribution exploitable n'est disponible pour ce graphique." />
        ) : (
          items.map((item) => (
            <div key={`${title}-${item.label}`}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary">{item.label}</p>
                  {item.secondary ? (
                    <p className="text-xs text-on-surface-variant">{item.secondary}</p>
                  ) : null}
                </div>
                <span className="text-sm font-bold text-secondary">{formatter(item.value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-surface-container-low">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    backgroundColor: item.color,
                    width: `${Math.max(10, (item.value / maxValue) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-secondary">
      <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
      Temps reel
    </span>
  );
}

function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-primary">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function SectionTitle({ subtitle, title }: { subtitle?: string; title: string }) {
  return (
    <div>
      <h2 className="font-headline text-2xl font-extrabold text-primary">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p> : null}
    </div>
  );
}

function SectionTitleDark({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div>
      <h2 className="font-headline text-2xl font-extrabold text-white">{title}</h2>
      <p className="mt-2 text-sm text-primary-fixed">{subtitle}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 font-headline text-3xl font-extrabold text-primary">{value}</p>
    </div>
  );
}

function InfoCard({
  label,
  secondary,
  value,
}: {
  label: string;
  secondary: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low px-5 py-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-2xl font-extrabold text-primary">{value}</p>
      <p className="mt-2 text-sm text-on-surface-variant">{secondary}</p>
    </div>
  );
}

function ListPanel({
  items,
  title,
}: {
  items: { label: string; secondary: string; value: string }[];
  title: string;
}) {
  return (
    <div>
      <h3 className="font-headline text-lg font-bold text-primary">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <EmptyBlock text="Aucune donnee disponible." />
        ) : (
          items.map((item) => (
            <div className="rounded-xl bg-surface-container-low px-4 py-4" key={`${title}-${item.label}`}>
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-primary">{item.label}</p>
                <span className="font-semibold text-secondary">{item.value}</span>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant">{item.secondary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-outline-variant/20 pb-3 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-right font-semibold text-primary">{value}</span>
    </div>
  );
}

function QuickActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white transition-colors hover:bg-white/15"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TableActionButton({
  label,
  onClick,
  tone,
}: {
  label: string;
  onClick: () => void;
  tone: "danger" | "ghost" | "primary";
}) {
  const className =
    tone === "primary"
      ? "bg-primary text-white hover:bg-primary/90"
      : tone === "danger"
        ? "border border-red-200 text-red-700 hover:bg-red-50"
        : "border border-outline-variant/20 text-primary hover:bg-surface-container-low";

  return (
    <button
      className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${className}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "success" | "warning";
}) {
  const className =
    tone === "success"
      ? "bg-secondary-container text-secondary"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : "bg-surface-container-low text-on-surface-variant";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
      {text}
    </div>
  );
}
