import { type FormEvent, useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { WorkspacePageLoader } from "../components/LoadingState";
import { apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type ApiNumber = number | string | null;

type EstimationForm = {
  area_sqm: string;
  asset_type: string;
  bathrooms: string;
  bedrooms: string;
  city: string;
  district: string;
  save_valuation: boolean;
  title: string;
  transaction_type: "rent" | "sale";
};

type MlComparable = {
  area_sqm: ApiNumber;
  city: string;
  district: string;
  external_url: string;
  id: number | null;
  image_urls: string[];
  price: ApiNumber;
  price_per_sqm: ApiNumber;
  primary_image_url: string;
  similarity_score: ApiNumber;
  source: string;
  title: string;
};

type MlModelResult = {
  confidence_score: ApiNumber;
  estimated_price_per_sqm: ApiNumber;
  estimated_value: ApiNumber;
  message?: string;
  method: string;
  sample_size: number;
  status: string;
};

type MlValuationResponse = {
  comparables: MlComparable[];
  confidence_score: ApiNumber;
  estimated_price_per_sqm: ApiNumber;
  estimated_value: ApiNumber;
  high_estimate: ApiNumber;
  low_estimate: ApiNumber;
  message?: string;
  method: string;
  model_version?: string;
  models: MlModelResult[];
  sample_size: number;
  saved_valuation_id: number | null;
  status: string;
  training_rows: number;
  transaction_type: string;
};

const defaultForm: EstimationForm = {
  area_sqm: "125",
  asset_type: "apartment",
  bathrooms: "2",
  bedrooms: "3",
  city: "Casablanca",
  district: "Maarif",
  save_valuation: false,
  title: "Estimation IA Casablanca Maarif",
  transaction_type: "sale",
};

const assetTypes = [
  ["apartment", "Appartement"],
  ["villa", "Villa"],
  ["office", "Bureau"],
  ["retail", "Local commercial"],
  ["land", "Terrain"],
  ["hospitality", "Hospitality"],
];

const statusLabels: Record<string, string> = {
  insufficient_input: "Entrée insuffisante",
  low_sample: "Échantillon réduit",
  model_error: "Erreur modèle",
  no_comparables: "Sans comparables",
  ok: "Actif",
};

function toNumber(value: ApiNumber | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
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

function formatMainAmount(value: ApiNumber | undefined) {
  const amount = toNumber(value);
  if (amount >= 1_000_000) {
    return {
      amount: (amount / 1_000_000).toLocaleString("fr-MA", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 1,
      }),
      unit: "MDH",
    };
  }

  return {
    amount: amount.toLocaleString("fr-MA", {
      maximumFractionDigits: 0,
    }),
    unit: "MAD",
  };
}

function modelLabel(method: string) {
  const labels: Record<string, string> = {
    hedonic_ridge_regression: "Régression hédonique",
    market_segment_baseline: "Baseline marché",
    ml_ensemble_v1: "Ensemble ML",
    weighted_comparable_knn: "KNN comparables",
  };
  return labels[method] ?? method;
}

function payloadFromForm(form: EstimationForm) {
  return {
    area_sqm: Number(form.area_sqm),
    asset_type: form.asset_type,
    bathrooms: form.bathrooms === "" ? null : Number(form.bathrooms),
    bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms),
    city: form.city.trim(),
    district: form.district.trim(),
    save_valuation: form.save_valuation,
    title: form.title.trim(),
    transaction_type: form.transaction_type,
  };
}

export default function AiEstimationPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<EstimationForm>(defaultForm);
  const [result, setResult] = useState<MlValuationResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialEstimate() {
      setIsLoading(true);
      setError("");

      try {
        const response = await apiRequest<MlValuationResponse>("/ml/valuation/", {
          method: "POST",
          token,
          body: payloadFromForm(defaultForm),
        });
        if (isMounted) {
          setResult(response);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError, "Impossible de calculer l'estimation ML."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialEstimate();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest<MlValuationResponse>("/ml/valuation/", {
        method: "POST",
        token,
        body: payloadFromForm(form),
      });
      setResult(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de calculer l'estimation ML."));
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof EstimationForm>(field: K, value: EstimationForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const projection = useMemo(() => {
    const baseValue = toNumber(result?.estimated_value);
    const annualGrowth = form.transaction_type === "sale" ? 0.035 : 0.025;
    const years = [2026, 2028, 2030, 2032, 2034, 2036];
    const values = years.map((year, index) => ({
      label: String(year),
      value: baseValue * Math.pow(1 + annualGrowth, index * 2),
    }));
    const maxValue = Math.max(1, ...values.map((point) => point.value));
    return values.map((point) => ({
      ...point,
      height: Math.max(12, Math.round((point.value / maxValue) * 96)),
    }));
  }, [form.transaction_type, result?.estimated_value]);

  const confidence = toNumber(result?.confidence_score);
  const estimatedValue = toNumber(result?.estimated_value);
  const estimateReady = Boolean(result && estimatedValue > 0);
  const mainAmount = formatMainAmount(result?.estimated_value);
  const finalProjection = projection[projection.length - 1];
  const isInitialLoading = isLoading && result === null && !error;

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased overflow-x-hidden"
      title="SmartEstate | Estimation IA"
      styles={pageStyles}
    >
      <div>
        <aside className="hidden md:flex h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-[#ffffff] flex-col z-50">
          <div className="px-8 py-10">
            <span className="text-xl font-headline font-bold tracking-tighter text-primary uppercase">SmartEstate</span>
          </div>
          <nav className="flex-1 flex flex-col gap-1">
            {[
              ["dashboard", "Tableau de Bord", "/tableau-de-bord-executif", false],
              ["domain", "Portfolio", "/portfolio-immobilier-maroc", false],
              ["calculate", "Estimation", "/estimation-immobiliere-ia", true],
              ["query_stats", "Scénarios", "/simulateur-scenarios-maroc", false],
              ["auto_awesome", "Recommandations", "/recommandations-ia", false],
              ["description", "Rapports", "/rapports", false],
            ].map(([icon, label, href, active]) => (
              <a
                className={
                  active
                    ? "group flex items-center gap-3 px-8 py-4 bg-[#eeeef0] text-secondary font-bold border-r-4 border-secondary"
                    : "group flex items-center gap-3 px-8 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200"
                }
                href={href as string}
                key={label as string}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="font-label text-sm font-medium">{label}</span>
              </a>
            ))}
          </nav>
          <div className="p-6">
            <button
              className="w-full bg-gradient-to-br from-secondary to-on-secondary-container text-white py-3 rounded-lg font-headline font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              data-disable-prototype-actions="true"
              onClick={() => setForm(defaultForm)}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Réinitialiser
            </button>
          </div>
        </aside>

        <main className="md:ml-72 min-h-screen p-6 md:p-12">
          <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div>
              <p className="text-secondary font-label font-bold uppercase tracking-widest text-[10px] mb-2">
                Moteur ML entraîné par les données ETL
              </p>
              <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-primary tracking-tight">
                Estimation immobilière par machine learning
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-lg">
              <span className="material-symbols-outlined text-secondary">model_training</span>
              <span className="text-sm font-bold text-primary">
                {result?.training_rows ?? 0} lignes d'entraînement
              </span>
            </div>
          </header>

          {error && (
            <div className="mb-8 rounded-lg border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
              {error}
            </div>
          )}

          {isInitialLoading ? (
            <WorkspacePageLoader cardCount={3} showChart sidePanelCount={2} />
          ) : (
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-4 space-y-6">
                <form
                  className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)] space-y-5"
                  onSubmit={submitEstimate}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-headline font-bold text-primary">Paramètres du bien</h2>
                    <span className="material-symbols-outlined text-secondary">tune</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Ville</span>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                        onChange={(event) => updateField("city", event.target.value)}
                        required
                        type="text"
                        value={form.city}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Quartier</span>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                        onChange={(event) => updateField("district", event.target.value)}
                        type="text"
                        value={form.district}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Surface m²</span>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                        min={1}
                        onChange={(event) => updateField("area_sqm", event.target.value)}
                        required
                        type="number"
                        value={form.area_sqm}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Transaction</span>
                      <select
                        className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                        onChange={(event) =>
                          updateField("transaction_type", event.target.value as EstimationForm["transaction_type"])
                        }
                        value={form.transaction_type}
                      >
                        <option value="sale">Vente</option>
                        <option value="rent">Location</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Type de bien</span>
                    <select
                      className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                      onChange={(event) => updateField("asset_type", event.target.value)}
                      value={form.asset_type}
                    >
                      {assetTypes.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Chambres</span>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                        min={0}
                        onChange={(event) => updateField("bedrooms", event.target.value)}
                        type="number"
                        value={form.bedrooms}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Salles de bain</span>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                        min={0}
                        onChange={(event) => updateField("bathrooms", event.target.value)}
                        type="number"
                        value={form.bathrooms}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Nom de l'analyse</span>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                      onChange={(event) => updateField("title", event.target.value)}
                      type="text"
                      value={form.title}
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-lg bg-surface-container-low px-4 py-3">
                    <input
                      checked={form.save_valuation}
                      className="rounded border-outline text-secondary focus:ring-secondary"
                      onChange={(event) => updateField("save_valuation", event.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-sm font-semibold text-primary">Enregistrer dans les estimations</span>
                  </label>

                  <button
                    className="w-full bg-primary text-white py-4 rounded-lg font-headline font-extrabold tracking-tight active:scale-95 transition-transform disabled:opacity-60"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? "Calcul ML en cours..." : "Calculer l'estimation IA"}
                  </button>
                </form>

                <div className="bg-primary-container p-8 rounded-xl text-white relative overflow-hidden">
                  <p className="text-primary-fixed text-xs font-bold uppercase mb-4">Valeur estimée</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-headline font-extrabold tracking-tighter">
                      {estimateReady ? mainAmount.amount : "--"}
                    </h3>
                    <span className="text-xl font-bold opacity-60">{estimateReady ? mainAmount.unit : ""}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-on-primary-container">
                    <div>
                      <p className="text-[10px] opacity-70 uppercase">Fourchette basse</p>
                      <p className="font-bold">{estimateReady ? formatMoney(result?.low_estimate, true) : "--"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-70 uppercase">Fourchette haute</p>
                      <p className="font-bold">{estimateReady ? formatMoney(result?.high_estimate, true) : "--"}</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex justify-between text-[10px] opacity-80 mb-2">
                      <span>Confiance ML</span>
                      <span className="font-bold">{formatPercent(result?.confidence_score)}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full">
                      <div
                        className="bg-secondary-container h-full rounded-full"
                        style={{ width: `${Math.min(100, confidence)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-8 space-y-8">
                <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
                    <div>
                      <h2 className="text-lg font-headline font-bold text-primary">Modèles utilisés</h2>
                      <p className="text-xs text-on-surface-variant">
                        {result?.model_version ?? "ensemble_knn_ridge_baseline_v1"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <DataPill
                        label="Statut"
                        value={statusLabels[result?.status ?? ""] ?? result?.status ?? "En attente"}
                      />
                      <DataPill
                        label="Prix / m²"
                        value={estimateReady ? formatMoney(result?.estimated_price_per_sqm) : "--"}
                      />
                      <DataPill label="Comparables" value={`${result?.sample_size ?? 0}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {(result?.models ?? []).map((model) => (
                      <article
                        className="bg-surface-container-low rounded-lg p-5 border border-outline-variant/10"
                        key={model.method}
                      >
                        <div className="flex items-start justify-between gap-3 mb-5">
                          <div>
                            <h3 className="font-headline font-bold text-primary">{modelLabel(model.method)}</h3>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant">
                              {statusLabels[model.status] ?? model.status}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-secondary">analytics</span>
                        </div>
                        <p className="text-2xl font-headline font-extrabold text-primary mb-1">
                          {toNumber(model.estimated_value) > 0 ? formatMoney(model.estimated_value, true) : "--"}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                          <DataPill label="Confiance" value={formatPercent(model.confidence_score)} />
                          <DataPill label="Échantillon" value={`${model.sample_size}`} />
                        </div>
                      </article>
                    ))}

                    {!result?.models?.length && (
                      <div className="lg:col-span-3 rounded-lg border border-dashed border-outline-variant/40 p-8 text-center text-on-surface-variant">
                        Les modèles apparaîtront après le premier calcul.
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-lg font-headline font-bold text-primary">Projection à 10 ans</h2>
                      <p className="text-xs text-on-surface-variant">
                        Croissance simulée à partir de la valeur ML actuelle
                      </p>
                    </div>
                    <span className="text-sm font-bold text-secondary">
                      {estimateReady ? formatMoney(finalProjection?.value ?? 0, true) : "--"}
                    </span>
                  </div>
                  <div className="relative h-[260px] w-full mt-4 flex items-end justify-between gap-4 px-2">
                    <div className="absolute inset-0 border-b border-outline-variant/30 flex flex-col justify-between">
                      <div className="border-t border-outline-variant/10 w-full h-0" />
                      <div className="border-t border-outline-variant/10 w-full h-0" />
                      <div className="border-t border-outline-variant/10 w-full h-0" />
                      <div className="border-t border-outline-variant/10 w-full h-0" />
                    </div>
                    {projection.map((point, index) => (
                      <div
                        className={
                          index === projection.length - 1
                            ? "relative z-10 flex-1 bg-on-secondary-container rounded-t-sm"
                            : "relative z-10 flex-1 bg-secondary/80 rounded-t-sm"
                        }
                        key={point.label}
                        style={{ height: `${estimateReady ? point.height : 12}%` }}
                        title={`${point.label}: ${formatMoney(point.value)}`}
                      >
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-70">
                          {point.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-headline font-bold text-primary">Comparables depuis la base</h2>
                    <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-on-surface-variant">
                      {result?.comparables?.length ?? 0} biens trouvés
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {(result?.comparables ?? []).slice(0, 6).map((comparable) => (
                      <article
                        className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10"
                        key={`${comparable.source}-${comparable.id ?? comparable.external_url}`}
                      >
                        <div className="aspect-[16/10] bg-surface-container-low">
                          {comparable.primary_image_url ? (
                            <img
                              alt={comparable.title || "Comparable"}
                              className="h-full w-full object-cover"
                              src={comparable.primary_image_url}
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary to-secondary text-white p-5 flex flex-col justify-between">
                              <span className="text-[10px] uppercase tracking-[0.22em] font-bold opacity-75">
                                {comparable.source}
                              </span>
                              <div>
                                <p className="text-2xl font-headline font-extrabold">{comparable.city || "Maroc"}</p>
                                <p className="text-sm opacity-80">{comparable.district || "Comparable marché"}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="font-headline font-bold text-primary line-clamp-2">
                                {comparable.title || "Annonce marché"}
                              </h3>
                              <p className="text-[10px] uppercase font-bold text-on-surface-variant">
                                {comparable.source} · {comparable.city || "Maroc"}{" "}
                                {comparable.district ? `· ${comparable.district}` : ""}
                              </p>
                            </div>
                            <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold text-secondary">
                              {formatPercent(toNumber(comparable.similarity_score) * 100)}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <DataPill label="Prix" value={formatMoney(comparable.price, true)} />
                            <DataPill
                              label="Surface"
                              value={`${toNumber(comparable.area_sqm).toLocaleString("fr-MA", {
                                maximumFractionDigits: 0,
                              })} m²`}
                            />
                            <DataPill label="MAD / m²" value={formatMoney(comparable.price_per_sqm)} />
                          </div>
                        </div>
                      </article>
                    ))}

                    {result && result.comparables.length === 0 && (
                      <div className="lg:col-span-2 rounded-xl border border-dashed border-outline-variant/40 p-8 text-center text-on-surface-variant">
                        Aucun comparable direct pour ces paramètres. Le moteur utilisera les autres modèles disponibles.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </section>
          )}
        </main>
      </div>
    </ImportedPageDocument>
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
