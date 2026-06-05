import { useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { DashboardPageLoader } from "../components/LoadingState";
import { apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type MembershipRecord = {
  created_at: string;
  id: number;
  is_primary: boolean;
  organization_name: string;
  role: string;
  title: string;
  updated_at: string;
  user_email: string;
  user_is_active: boolean;
  user_name: string;
  user_role: string;
};

type OrganizationRecord = {
  city: string;
  country: string;
  description: string;
  id: number;
  member_count: number;
  name: string;
};

type DashboardOverview = {
  assets: number;
  organizations: number;
  portfolios: number;
  recommendations_open: number;
  reports: number;
  scenarios: number;
};

const emptyOverview: DashboardOverview = {
  assets: 0,
  organizations: 0,
  portfolios: 0,
  recommendations_open: 0,
  reports: 0,
  scenarios: 0,
};

function formatDate(value: string) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function roleLabel(value: string) {
  const labels: Record<string, string> = {
    admin: "Administrateur",
    analyst: "Analyste",
    asset_manager: "Gestionnaire d'actifs",
    executive: "Direction",
    investor: "Investisseur",
    manager: "Manager",
    owner: "Propriétaire",
    viewer: "Lecteur",
  };
  return labels[value] ?? value;
}

function relativeDate(value: string) {
  if (!value) {
    return "Aucune activité";
  }

  const date = new Date(value);
  const diffHours = Math.max(1, Math.round((Date.now() - date.getTime()) / 3600000));
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }
  return formatDate(value);
}

export default function TeamManagementPage() {
  const { token } = useAuth();
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [query, setQuery] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setIsLoading(true);
      setError("");

      try {
        const [membershipPayload, organizationPayload, overviewPayload] = await Promise.all([
          apiRequest<MembershipRecord[]>("/team-memberships/", { token }),
          apiRequest<OrganizationRecord[]>("/organizations/", { token }),
          apiRequest<DashboardOverview>("/dashboard/overview/", { token }),
        ]);

        if (!active) {
          return;
        }

        setMemberships(membershipPayload);
        setOrganizations(organizationPayload);
        setOverview({ ...emptyOverview, ...overviewPayload });
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(getErrorMessage(requestError, "Impossible de charger l'équipe et les organisations."));
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

  const filteredMemberships = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return memberships.filter((membership) => {
      if (selectedOrganization !== "all" && membership.organization_name !== selectedOrganization) {
        return false;
      }

      if (selectedRole !== "all" && membership.role !== selectedRole && membership.user_role !== selectedRole) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        membership.user_name,
        membership.user_email,
        membership.organization_name,
        membership.title,
        membership.role,
        membership.user_role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [memberships, query, selectedOrganization, selectedRole]);

  const activeMembers = memberships.filter((membership) => membership.user_is_active).length;
  const primaryMembers = memberships.filter((membership) => membership.is_primary).length;
  const isInitialLoading =
    isLoading &&
    memberships.length === 0 &&
    organizations.length === 0 &&
    overview.assets === 0 &&
    overview.organizations === 0 &&
    overview.portfolios === 0 &&
    !error;

  const roleBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const membership of memberships) {
      const key = membership.user_role || membership.role;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([role, count]) => ({ count, role }))
      .sort((left, right) => right.count - left.count);
  }, [memberships]);

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Équipe"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
              Collaboration et gouvernance
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
              Équipe et organisations
            </h1>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant">
              Cette section affiche les membres, les rôles et les organisations réellement disponibles via
              le backend, sans passer par des données de démonstration statiques.
            </p>
          </div>

          <div className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant">
            {organizations.length} organisation{organizations.length > 1 ? "s" : ""} visible
            {organizations.length > 0 ? ` · ${organizations[0].country}` : ""}
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        {isInitialLoading ? (
          <DashboardPageLoader cardCount={3} metricCount={4} showTable sidePanelCount={2} />
        ) : (
          <>
            <section className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <MetricCard label="Membres visibles" value={String(memberships.length)} />
              <MetricCard label="Membres actifs" value={String(activeMembers)} />
              <MetricCard label="Référents primaires" value={String(primaryMembers)} />
              <MetricCard
                label="Flux en cours"
                value={String(overview.reports + overview.scenarios + overview.recommendations_open)}
              />
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
                      placeholder="Nom, email, rôle, organisation..."
                      type="text"
                      value={query}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Organisation
                  </span>
                  <select
                    className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                    onChange={(event) => setSelectedOrganization(event.target.value)}
                    value={selectedOrganization}
                  >
                    <option value="all">Toutes</option>
                    {organizations.map((organization) => (
                      <option key={organization.id} value={organization.name}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Rôle
                  </span>
                  <select
                    className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                    onChange={(event) => setSelectedRole(event.target.value)}
                    value={selectedRole}
                  >
                    <option value="all">Tous</option>
                    <option value="admin">Administrateur</option>
                    <option value="analyst">Analyste</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="executive">Executive</option>
                    <option value="investor">Investisseur</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.8fr)_360px] gap-8">
              <div className="space-y-8">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-headline font-bold text-primary">Annuaire collaboratif</h2>
                    </div>
                    <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      {filteredMemberships.length} résultat{filteredMemberships.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="rounded-2xl bg-surface-container-low p-8 text-sm font-semibold text-on-surface-variant">
                      Chargement des membres...
                    </div>
                  ) : filteredMemberships.length === 0 ? (
                    <div className="rounded-2xl bg-surface-container-low p-8 text-sm font-semibold text-on-surface-variant">
                      Aucun membre ne correspond aux filtres actuels.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[780px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                            <th className="px-4 py-4 font-bold">Membre</th>
                            <th className="px-4 py-4 font-bold">Fonction</th>
                            <th className="px-4 py-4 font-bold">Organisation</th>
                            <th className="px-4 py-4 font-bold">Accès</th>
                            <th className="px-4 py-4 font-bold">Statut</th>
                            <th className="px-4 py-4 font-bold">Dernière activité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMemberships.map((membership) => (
                            <tr className="border-b border-outline-variant/10 align-top" key={membership.id}>
                              <td className="px-4 py-5">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-headline font-bold text-white">
                                    {membership.user_name.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-primary">{membership.user_name}</p>
                                    <p className="text-sm text-on-surface-variant">{membership.user_email}</p>
                                    {membership.is_primary && (
                                      <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-secondary">
                                        Référent principal
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-5">
                                <p className="font-bold text-primary">
                                  {membership.title || roleLabel(membership.user_role)}
                                </p>
                                <p className="mt-1 text-sm text-on-surface-variant">
                                  Rôle utilisateur: {roleLabel(membership.user_role)}
                                </p>
                              </td>
                              <td className="px-4 py-5">
                                <p className="font-bold text-primary">{membership.organization_name}</p>
                                <p className="mt-1 text-sm text-on-surface-variant">
                                  Ajouté le {formatDate(membership.created_at)}
                                </p>
                              </td>
                              <td className="px-4 py-5">
                                <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                                  {roleLabel(membership.role)}
                                </span>
                              </td>
                              <td className="px-4 py-5">
                                <span
                                  className={
                                    membership.user_is_active
                                      ? "rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary"
                                      : "rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                                  }
                                >
                                  {membership.user_is_active ? "Actif" : "Inactif"}
                                </span>
                              </td>
                              <td className="px-4 py-5 text-sm text-on-surface-variant">
                                {relativeDate(membership.updated_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h2 className="text-2xl font-headline font-bold text-primary">Répartition des rôles</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Vue synthétique des profils utilisateurs actuellement visibles.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {roleBreakdown.map((item) => (
                      <div className="rounded-2xl bg-surface-container-low p-5" key={item.role}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          {roleLabel(item.role)}
                        </p>
                        <p className="mt-3 text-3xl font-headline font-extrabold text-primary">{item.count}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                    Coordination
                  </p>
                  <h2 className="mt-3 text-2xl font-headline font-extrabold">Charge opérationnelle visible</h2>
                  <div className="mt-6 space-y-4">
                    <DataRow label="Rapports suivis" value={String(overview.reports)} />
                    <DataRow label="Scénarios suivis" value={String(overview.scenarios)} />
                    <DataRow label="Recommandations ouvertes" value={String(overview.recommendations_open)} />
                    <DataRow label="Actifs couverts" value={String(overview.assets)} />
                  </div>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-xl font-headline font-bold text-primary">Organisations visibles</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">Détail issu de `GET /api/organizations/`.</p>
                  </div>

                  <div className="space-y-4">
                    {organizations.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">
                        Aucune organisation visible dans le contexte courant.
                      </p>
                    ) : (
                      organizations.map((organization) => (
                        <article className="rounded-xl bg-surface-container-low p-4" key={organization.id}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-primary">{organization.name}</p>
                              <p className="mt-1 text-sm text-on-surface-variant">
                                {organization.city}, {organization.country}
                              </p>
                            </div>
                            <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                              {organization.member_count} membre{organization.member_count > 1 ? "s" : ""}
                            </span>
                          </div>
                          {organization.description && (
                            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                              {organization.description}
                            </p>
                          )}
                        </article>
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

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm">
      <span className="text-primary-fixed">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
