// Portefeuille immobilier: consolide actifs, holdings et statistiques visibles depuis la base.
import { startTransition, useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { DashboardPageLoader } from "../components/LoadingState";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.82);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }`;

type Portfolio = {
  benchmark_return: string;
  currency: string;
  description: string;
  id: number;
  name: string;
  organization_name: string;
  strategy: string;
  target_occupancy: string;
};

type Holding = {
  allocation_share: string;
  asset: number;
  asset_city: string;
  asset_name: string;
  debt_amount: string;
  id: number;
  notes: string;
  portfolio: number;
  portfolio_name: string;
  target_price: string | null;
};

type Asset = {
  annual_yield: string;
  area_sqm: string | null;
  asset_type: string;
  bathrooms: number | null;
  bedrooms: number | null;
  city: string;
  current_value: string;
  district: string;
  id: number;
  monthly_rent: string | null;
  name: string;
  occupancy_rate: string;
  status: string;
};

type DashboardOverview = {
  average_annual_yield: number;
  average_occupancy_rate: number;
  market_listings: number;
  monthly_cashflow: number;
  top_cities: Array<{ asset_count: number; city: string }>;
  total_asset_value: number;
};

const emptyOverview: DashboardOverview = {
  average_annual_yield: 0,
  average_occupancy_rate: 0,
  market_listings: 0,
  monthly_cashflow: 0,
  top_cities: [],
  total_asset_value: 0,
};

// Formate les montants du portefeuille pour les tuiles et les listes.
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

// Uniformise l'affichage des rendements et taux d'occupation.
function formatPercent(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString("fr-MA", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

// Donne une identite visuelle de secours a chaque ville couverte.
function cityGradient(city: string) {
  const palette: Record<string, string> = {
    Casablanca: "from-[#183153] via-[#1b6d24] to-[#89b0ae]",
    Marrakech: "from-[#7b341e] via-[#c05621] to-[#f6ad55]",
    Rabat: "from-[#1a237e] via-[#2c5282] to-[#63b3ed]",
  };

  return palette[city] ?? "from-[#334155] via-[#475569] to-[#94a3b8]";
}

// Traduit les statuts d'actifs vers un vocabulaire lisible.
function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Actif",
    archived: "Archive",
    pipeline: "Pipeline",
    sold: "Vendu",
  };
  return labels[status] ?? status;
}

// Traduit les familles d'actifs dans le libelle metier attendu.
function assetTypeLabel(assetType: string) {
  const labels: Record<string, string> = {
    apartment: "Appartement",
    hospitality: "Hospitality",
    land: "Terrain",
    office: "Bureau",
    retail: "Retail",
    villa: "Villa",
  };
  return labels[assetType] ?? assetType;
}

// Agrege portefeuilles, holdings et actifs pour composer la vue patrimoine.
export default function PortfolioMarocPage() {
  const { token } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dashboard, setDashboard] = useState<DashboardOverview>(emptyOverview);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Charge les portefeuilles, holdings, actifs et KPI globaux en une seule passe.
  useEffect(() => {
    let active = true;

    // Reunit les quatre endpoints de reference du module patrimoine.
    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const [portfolioData, holdingData, assetData, overviewData] = await Promise.all([
          apiRequest<Portfolio[]>("/portfolios/", { token }),
          apiRequest<Holding[]>("/holdings/", { token }),
          apiRequest<Asset[]>("/assets/", { token }),
          apiRequest<DashboardOverview>("/dashboard/overview/", { token }),
        ]);

        if (!active) {
          return;
        }

        startTransition(() => {
          setPortfolios(portfolioData);
          setHoldings(holdingData);
          setAssets(assetData);
          setDashboard({ ...emptyOverview, ...overviewData });
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(getErrorMessage(requestError, "Impossible de charger les donnees depuis la base."));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [token]);

  // Indexe les holdings par actif pour enrichir chaque carte sans recalcul couteux.
  const holdingsByAssetId = useMemo(
    () => new Map(holdings.map((holding) => [holding.asset, holding])),
    [holdings],
  );
  const isInitialLoading =
    isLoading &&
    portfolios.length === 0 &&
    holdings.length === 0 &&
    assets.length === 0 &&
    !error;

  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-background font-body antialiased"
      title="Portfolio Immobilier | SmartEstate Morocco"
      styles={pageStyles}
    >
      <div>
        <aside className="h-screen w-72 fixed left-0 top-0 bg-[#ffffff] flex flex-col border-r border-[#c6c5d4]/15 font-['Inter'] text-sm antialiased z-50">
          <div className="px-8 py-8">
            <h1 className="text-xl font-bold tracking-tighter text-[#1A237E] uppercase font-headline">SmartEstate</h1>
          </div>
          <div className="flex-1 space-y-1">
            <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200" href="/tableau-de-bord-executif">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Tableau de Bord</span>
            </a>
            <a className="group flex items-center gap-3 px-6 py-4 bg-[#eeeef0] text-[#1b6d24] font-bold border-r-4 border-[#1b6d24]" href="/portfolio-immobilier-maroc">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>domain</span>
              <span>Portfolio</span>
            </a>
            <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200" href="/estimation-immobiliere-ia">
              <span className="material-symbols-outlined">calculate</span>
              <span>Estimation</span>
            </a>
            <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200" href="/simulateur-scenarios-maroc">
              <span className="material-symbols-outlined">query_stats</span>
              <span>Scénarios</span>
            </a>
            <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200" href="/recommandations-ia">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Recommandations</span>
            </a>
            <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200" href="/rapports">
              <span className="material-symbols-outlined">description</span>
              <span>Rapports</span>
            </a>
          </div>
          <div className="p-6 mt-auto">
            <a className="block w-full py-3 bg-gradient-to-br from-secondary to-on-secondary-container text-white rounded-xl font-semibold shadow-sm text-center active:scale-95 transition-transform" href="/estimation-immobiliere-ia">
              Nouvelle Analyse
            </a>
          </div>
        </aside>

        <main className="ml-72 min-h-screen">
          {isInitialLoading ? (
            <div className="px-8 py-8">
              <DashboardPageLoader cardCount={6} metricCount={4} sidePanelCount={2} />
            </div>
          ) : (
            <>
          <section className="px-12 py-10">
            <div className="flex justify-between items-end mb-10 gap-8">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">Donnees du portefeuille</span>
                <h2 className="text-5xl font-headline font-extrabold text-primary tracking-tight leading-tight">
                  Portfolio Immobilier
                  <br />
                  Royaume du Maroc
                </h2>
              </div>
              <div className="text-right">
                <p className="text-on-surface-variant text-sm font-medium mb-1">Valeur Totale Sous Gestion</p>
                <p className="text-4xl font-headline font-bold text-secondary">{formatMoney(dashboard.total_asset_value, true)}</p>
              </div>
            </div>

            {error && (
              <div className="mb-8 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
                {error}
              </div>
            )}

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden relative shadow-[0_12px_40px_rgba(26,28,29,0.06)] min-h-[500px] p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(24,49,83,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(27,109,36,0.12),_transparent_35%)]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-headline font-bold text-primary">Concentration geographique</h3>
                      <p className="text-on-surface-variant text-sm">Repartition calculee depuis les actifs stockes en base</p>
                    </div>
                    <div className="glass-panel rounded-full px-4 py-2 border border-white/40 text-xs font-bold text-primary">
                      {assets.length} actifs charges
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {dashboard.top_cities.slice(0, 3).map((city) => (
                      <div className={`rounded-2xl bg-gradient-to-br ${cityGradient(city.city)} p-5 text-white shadow-lg`} key={city.city}>
                        <p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-80">Ville cle</p>
                        <h4 className="mt-2 text-2xl font-headline font-extrabold">{city.city}</h4>
                        <p className="mt-4 text-sm font-semibold">{city.asset_count} actifs relies a la base</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <StatPanel label="Portefeuilles" value={String(portfolios.length)} />
                    <StatPanel label="Holdings" value={String(holdings.length)} />
                    <StatPanel label="Annonces ETL" value={String(dashboard.market_listings)} />
                  </div>
                </div>
              </div>

              <div className="col-span-4 space-y-6">
                <MetricCard
                  helper={`Cashflow mensuel: ${formatMoney(dashboard.monthly_cashflow)}`}
                  label="Performance Moyenne"
                  tone="primary"
                  value={formatPercent(dashboard.average_annual_yield)}
                />
                <MetricCard
                  helper="Calcule a partir des actifs stockes"
                  label="Taux d'Occupation"
                  tone="neutral"
                  value={formatPercent(dashboard.average_occupancy_rate)}
                />
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <p className="text-on-surface-variant text-xs font-bold uppercase tracking-tighter block mb-2">Actifs visibles</p>
                  <p className="text-3xl font-headline font-bold text-on-surface">{assets.length}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Inventaire charge depuis la base de donnees.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-12 py-12 bg-surface-container-low">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-headline font-bold text-primary">Actifs depuis la base</h3>
              </div>
              <div className="flex gap-4 text-xs font-bold text-on-surface-variant">
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">{assets.length} visibles</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">{portfolios.length} portefeuilles</span>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">Chargement des donnees depuis le backend...</div>
            ) : assets.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-sm font-semibold text-on-surface-variant shadow-sm">Aucun actif disponible pour le moment.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {assets.map((asset) => {
                  const holding = holdingsByAssetId.get(asset.id);
                  return (
                    <article className="group bg-surface-container-lowest rounded-xl p-5 flex gap-8 items-start hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300" key={asset.id}>
                      <div className={`w-48 h-32 rounded-2xl bg-gradient-to-br ${cityGradient(asset.city)} p-5 text-white shrink-0 flex flex-col justify-between`}>
                        <span className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-75">{assetTypeLabel(asset.asset_type)}</span>
                        <div>
                          <p className="text-2xl font-headline font-extrabold">{asset.city}</p>
                          <p className="text-sm opacity-80">{asset.district || "Secteur principal"}</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3 gap-8">
                          <div>
                            <h4 className="text-xl font-bold text-on-surface">{asset.name}</h4>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              {asset.district ? `${asset.district}, ${asset.city}` : asset.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-headline font-bold text-primary">{formatMoney(asset.current_value, true)}</p>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{statusLabel(asset.status)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-6">
                          <DataCell label="Rendement" value={formatPercent(asset.annual_yield)} />
                          <DataCell label="Occupation" value={formatPercent(asset.occupancy_rate)} />
                          <DataCell label="Surface" value={asset.area_sqm ? `${asset.area_sqm} m²` : "N/A"} />
                          <DataCell label="Holding" value={holding ? `${Number(holding.allocation_share).toFixed(0)}%` : "Hors portefeuille"} />
                        </div>

                        {holding && (
                          <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-container-low/60 px-4 py-3 text-sm">
                            <span className="font-semibold text-primary">{holding.portfolio_name}</span>
                            <span className="text-on-surface-variant">Dette: {formatMoney(holding.debt_amount, true)}</span>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

            </>
          )}
        </main>
      </div>
    </ImportedPageDocument>
  );
}

// Affiche une statistique compacte dans le bloc geographique principal.
function StatPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-xl border border-white/40 px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">{label}</p>
      <p className="mt-3 text-2xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}

// Carte de metrique hero adaptee a cette page portfolio.
function MetricCard({
  helper,
  label,
  tone,
  value,
}: {
  helper: string;
  label: string;
  tone: "neutral" | "primary";
  value: string;
}) {
  const className =
    tone === "primary"
      ? "bg-primary-container p-8 rounded-xl text-white relative overflow-hidden"
      : "bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]";

  return (
    <div className={className}>
      <span className={tone === "primary" ? "text-on-primary-container text-xs font-bold uppercase tracking-tighter block mb-4" : "text-on-surface-variant text-xs font-bold uppercase tracking-tighter block mb-4"}>
        {label}
      </span>
      <p className={tone === "primary" ? "text-5xl font-headline font-bold mb-2" : "text-4xl font-headline font-bold text-on-surface"}>{value}</p>
      <p className={tone === "primary" ? "text-on-primary-container/80 text-sm" : "text-on-surface-variant text-sm"}>{helper}</p>
    </div>
  );
}

// Cellule detaillee pour les caracteristiques d'un actif.
function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low/50 p-3 rounded-lg">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">{label}</p>
      <div className="text-sm font-bold text-on-surface">{value}</div>
    </div>
  );
}
