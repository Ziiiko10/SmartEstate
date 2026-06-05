// Estimation IA: collecte les caracteristiques du bien et calcule une valeur de marche.
import { type FormEvent, useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { WorkspacePageLoader } from "../components/LoadingState";
import { apiRequest, clearApiCache, getErrorMessage } from "../lib/api";
import { USER_ROLES } from "../lib/roles";

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

type FilterChoice = {
  count: number;
  label: string;
  value: string;
};

type EstimationFormChoices = {
  bathroom_choices: FilterChoice[];
  bedroom_choices: FilterChoice[];
  cities: FilterChoice[];
  districts: FilterChoice[];
};

type MlModelResult = {
  confidence_score: ApiNumber;
  estimated_price_per_sqm: ApiNumber;
  estimated_value: ApiNumber;
  message?: string;
  method: string;
  status: string;
};

type MlValuationResponse = {
  confidence_score: ApiNumber;
  estimated_price_per_sqm: ApiNumber;
  estimated_value: ApiNumber;
  high_estimate: ApiNumber;
  low_estimate: ApiNumber;
  message?: string;
  method: string;
  model_version?: string;
  models: MlModelResult[];
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
  ok: "Actif",
};

// Construit un titre lisible a partir de la localisation choisie.
function buildAnalysisTitle(city: string, district: string) {
  const normalizedCity = city.trim();
  const normalizedDistrict = district.trim();

  if (normalizedCity && normalizedDistrict) {
    return `Estimation IA ${normalizedCity} ${normalizedDistrict}`;
  }

  if (normalizedCity) {
    return `Estimation IA ${normalizedCity}`;
  }

  return "Estimation IA";
}

// Convertit les nombres issus de l'API en valeur fiable pour les calculs d'affichage.
function toNumber(value: ApiNumber | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

// Formate une valeur monetaire en DH ou MDH selon son ordre de grandeur.
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

// Harmonise l'affichage des pourcentages renvoyes par le moteur ML.
function formatPercent(value: ApiNumber | undefined) {
  return `${toNumber(value).toLocaleString("fr-MA", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

// Separe l'unite principale pour afficher une hero metric plus lisible.
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
    unit: "DH",
  };
}

// Fabrique l'URL des filtres dependants du type de bien, de la ville et de la transaction.
function buildEstimationChoicesPath(form: EstimationForm) {
  const searchParams = new URLSearchParams({
    asset_type: form.asset_type,
    transaction_type: form.transaction_type,
  });

  if (form.city.trim()) {
    searchParams.set("city", form.city.trim());
  }

  return `/market-listings/filters/?${searchParams.toString()}`;
}

// Transforme le formulaire de saisie en payload numerique pret pour l'API.
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

// Genere une cle de cache stable pour eviter les recalculs ML inutiles.
function valuationCacheKey(payload: ReturnType<typeof payloadFromForm>) {
  return `ml-valuation:${JSON.stringify(payload)}`;
}

// Reinserre une valeur deja saisie dans les options si elle n'est plus renvoyee par l'API.
function withCurrentChoice(
  choices: FilterChoice[],
  value: string,
  labelFactory: (rawValue: string) => string,
) {
  const normalizedValue = value.trim();
  if (!normalizedValue || choices.some((choice) => choice.value === normalizedValue)) {
    return choices;
  }

  return [
    {
      count: 0,
      label: labelFactory(normalizedValue),
      value: normalizedValue,
    },
    ...choices,
  ];
}

// Coordonne la saisie du bien, les filtres dynamiques et la valorisation ML.
export default function AiEstimationPage() {
  const { token, user } = useAuth();
  const [form, setForm] = useState<EstimationForm>(defaultForm);
  const [isAutoTitle, setIsAutoTitle] = useState(true);
  const [formChoices, setFormChoices] = useState<EstimationFormChoices>({
    bathroom_choices: [],
    bedroom_choices: [],
    cities: [],
    districts: [],
  });
  const [result, setResult] = useState<MlValuationResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Lance une premiere estimation avec le jeu de donnees par defaut pour remplir la page.
  useEffect(() => {
    let isMounted = true;

    // Interroge le endpoint ML principal et met en cache la reponse initiale.
    async function loadInitialEstimate() {
      setIsLoading(true);
      setError("");

      try {
        const initialPayload = payloadFromForm(defaultForm);
        const response = await apiRequest<MlValuationResponse>("/ml/valuation/", {
          cacheKey: valuationCacheKey(initialPayload),
          cacheTtlMs: 120_000,
          method: "POST",
          token,
          body: initialPayload,
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

  // Recharge les listes de choix quand les filtres structurants changent.
  useEffect(() => {
    let isMounted = true;

    // Recupere les villes, quartiers et compteurs compatibles avec la saisie courante.
    async function loadFormChoices() {
      try {
        const payload = await apiRequest<EstimationFormChoices>(buildEstimationChoicesPath(form), {
          token,
        });

        if (!isMounted) {
          return;
        }

        setFormChoices(payload);
        setForm((current) => {
          const nextDistrict = payload.districts.some((choice) => choice.value === current.district)
            ? current.district
            : "";
          const nextBedrooms = payload.bedroom_choices.some((choice) => choice.value === current.bedrooms)
            ? current.bedrooms
            : "";
          const nextBathrooms = payload.bathroom_choices.some((choice) => choice.value === current.bathrooms)
            ? current.bathrooms
            : "";

          if (
            nextDistrict === current.district &&
            nextBedrooms === current.bedrooms &&
            nextBathrooms === current.bathrooms
          ) {
            return current;
          }

          return {
            ...current,
            bathrooms: nextBathrooms,
            bedrooms: nextBedrooms,
            district: nextDistrict,
          };
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setFormChoices({
          bathroom_choices: [],
          bedroom_choices: [],
          cities: [],
          districts: [],
        });
      }
    }

    void loadFormChoices();

    return () => {
      isMounted = false;
    };
  }, [form.asset_type, form.city, form.transaction_type, token]);

  const generatedTitle = useMemo(
    () => buildAnalysisTitle(form.city, form.district),
    [form.city, form.district],
  );

  // Maintient le titre synchronise tant que l'utilisateur n'a pas choisi un libelle manuel.
  useEffect(() => {
    if (!isAutoTitle) {
      return;
    }

    setForm((current) => {
      if (current.title === generatedTitle) {
        return current;
      }

      return {
        ...current,
        title: generatedTitle,
      };
    });
  }, [generatedTitle, isAutoTitle]);

  // Soumet les caracteristiques courantes au moteur ML et rafraichit les estimations sauvegardees.
  async function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const estimatePayload = payloadFromForm(form);
      const response = await apiRequest<MlValuationResponse>("/ml/valuation/", {
        cacheKey: valuationCacheKey(estimatePayload),
        cacheTtlMs: 120_000,
        method: "POST",
        token,
        body: estimatePayload,
      });
      setResult(response);
      if (response.saved_valuation_id) {
        clearApiCache("/valuations/");
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de calculer l'estimation ML."));
    } finally {
      setIsLoading(false);
    }
  }

  // Met a jour un champ de formulaire de maniere generique.
  function updateField<K extends keyof EstimationForm>(field: K, value: EstimationForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Bascule entre titre auto-genere et titre personnalise selon la saisie utilisateur.
  function updateTitle(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
    }));
    setIsAutoTitle(value.trim() === generatedTitle.trim());
  }

  const confidence = toNumber(result?.confidence_score);
  const estimatedValue = toNumber(result?.estimated_value);
  const estimateReady = Boolean(result && estimatedValue > 0);
  const mainAmount = formatMainAmount(result?.estimated_value);
  const isInitialLoading = isLoading && result === null && !error;
  const cityChoices = useMemo(
    () => withCurrentChoice(formChoices.cities, form.city, (value) => value),
    [form.city, formChoices.cities],
  );
  const districtChoices = useMemo(
    () => withCurrentChoice(formChoices.districts, form.district, (value) => value),
    [form.district, formChoices.districts],
  );
  const bedroomChoices = useMemo(
    () => withCurrentChoice(formChoices.bedroom_choices, form.bedrooms, (value) => `${value} chambres`),
    [form.bedrooms, formChoices.bedroom_choices],
  );
  const bathroomChoices = useMemo(
    () => withCurrentChoice(formChoices.bathroom_choices, form.bathrooms, (value) => `${value} salles de bain`),
    [form.bathrooms, formChoices.bathroom_choices],
  );
  const canSaveValuation = user?.role !== USER_ROLES.UTILISATEUR_SIMPLE;
  const pageHeading =
    user?.role === USER_ROLES.AGENT_IMMOBILIER
      ? "Estimation professionnelle d'un bien"
      : "Estimation du prix immobilier";

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased overflow-x-hidden"
      title={`SmartEstate | ${pageHeading}`}
      styles={pageStyles}
    >
      <div>
        <main className="md:ml-72 min-h-screen p-6 md:p-12">
          {error && (
            <div className="mb-8 rounded-lg border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
              {error}
            </div>
          )}

          {isInitialLoading ? (
            <WorkspacePageLoader cardCount={3} showChart sidePanelCount={2} />
          ) : (
            <>
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
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
                        <select
                          className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                          onChange={(event) => {
                            updateField("city", event.target.value);
                            updateField("district", "");
                          }}
                          required
                          value={form.city}
                        >
                          {cityChoices.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                              {choice.label}
                              {choice.count > 0 ? ` (${choice.count})` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Quartier</span>
                        <select
                          className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                          onChange={(event) => updateField("district", event.target.value)}
                          value={form.district}
                        >
                          <option value="">Tous les quartiers</option>
                          {districtChoices.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                              {choice.label}
                              {choice.count > 0 ? ` (${choice.count})` : ""}
                            </option>
                          ))}
                        </select>
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
                        <select
                          className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                          onChange={(event) => updateField("bedrooms", event.target.value)}
                          value={form.bedrooms}
                        >
                          <option value="">Non précisé</option>
                          {bedroomChoices.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                              {choice.label}
                              {choice.count > 0 ? ` (${choice.count})` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Salles de bain</span>
                        <select
                          className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                          onChange={(event) => updateField("bathrooms", event.target.value)}
                          value={form.bathrooms}
                        >
                          <option value="">Non précisé</option>
                          {bathroomChoices.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                              {choice.label}
                              {choice.count > 0 ? ` (${choice.count})` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Nom de l'analyse</span>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                        onChange={(event) => updateTitle(event.target.value)}
                        type="text"
                        value={form.title}
                      />
                    </label>

                    {canSaveValuation ? (
                      <label className="flex items-center gap-3 rounded-lg bg-surface-container-low px-4 py-3">
                        <input
                          checked={form.save_valuation}
                          className="rounded border-outline text-secondary focus:ring-secondary"
                          onChange={(event) => updateField("save_valuation", event.target.checked)}
                          type="checkbox"
                        />
                        <span className="text-sm font-semibold text-primary">Enregistrer dans les estimations</span>
                      </label>
                    ) : (
                      <div className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                        Les utilisateurs simples accèdent à une estimation instantanée sans sauvegarde serveur.
                      </div>
                    )}

                    <button
                      className="w-full bg-primary text-white py-4 rounded-lg font-headline font-extrabold tracking-tight active:scale-95 transition-transform disabled:opacity-60"
                      disabled={isLoading}
                      type="submit"
                    >
                      {isLoading ? "Calcul ML en cours..." : "Calculer l'estimation IA"}
                    </button>
                  </form>
                </div>

                <div className="xl:col-span-8">
                  <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div>
                        <h2 className="text-lg font-headline font-bold text-primary">Valeur estimée</h2>
                        <p className="text-xs text-on-surface-variant">
                          Resultat consolide du moteur ML a partir des donnees ETL.
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
                      </div>
                    </div>

                    <div className="mt-8 rounded-xl bg-primary-container p-8 text-white relative overflow-hidden">
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
                  </section>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </ImportedPageDocument>
  );
}

// Affiche une metrique compacte dans les panneaux de resultat.
function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low/60 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase font-bold text-on-surface-variant">{label}</p>
      <p className="font-bold text-primary">{value}</p>
    </div>
  );
}
