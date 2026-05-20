import { useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { WorkspacePageLoader } from "../components/LoadingState";
import { apiRequest, clearApiCache, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type ApiNumber = number | string | null;
type StrategyKey = "flip" | "long_term" | "seasonal";

type ScenarioForm = {
  annual_expense_rate: string;
  appreciation_rate: string;
  down_payment: string;
  exit_cost_rate: string;
  holding_period_years: string;
  loan_rate: string;
  loan_years: string;
  monthly_rent: string;
  purchase_price: string;
  renovation_budget: string;
};

type ScenarioSimulationResponse = {
  annual_noi: ApiNumber;
  equity_multiple: ApiNumber;
  loan_amount: ApiNumber;
  monthly_debt_service: ApiNumber;
  net_exit_proceeds: ApiNumber;
  projected_exit_value: ApiNumber;
  projected_irr: ApiNumber;
  projected_monthly_cashflow: ApiNumber;
  purchase_price: ApiNumber;
  remaining_debt_at_exit: ApiNumber;
  total_profit: ApiNumber;
};

type SavedScenario = {
  created_at: string;
  holding_period_years: number;
  id: number;
  notes: string;
  organization_name: string;
  projected_exit_value: ApiNumber;
  projected_irr: ApiNumber;
  projected_monthly_cashflow: ApiNumber;
  strategy: StrategyKey;
  title: string;
};

type Organization = {
  id: number;
  name: string;
};

const defaultForm: ScenarioForm = {
  annual_expense_rate: "22",
  appreciation_rate: "4.5",
  down_payment: "450000",
  exit_cost_rate: "4",
  holding_period_years: "10",
  loan_rate: "4.2",
  loan_years: "20",
  monthly_rent: "14500",
  purchase_price: "1800000",
  renovation_budget: "120000",
};

const strategyOrder: StrategyKey[] = ["long_term", "seasonal", "flip"];

const strategyMeta: Record<
  StrategyKey,
  {
    accent: string;
    description: string;
    label: string;
  }
> = {
  flip: {
    accent: "from-[#7b341e] via-[#c05621] to-[#f6ad55]",
    description: "Valorisation rapide après travaux et sortie courte.",
    label: "Achat-revente",
  },
  long_term: {
    accent: "from-[#183153] via-[#1a237e] to-[#2c5282]",
    description: "Stabilité locative et création de valeur progressive.",
    label: "Longue durée",
  },
  seasonal: {
    accent: "from-[#0f766e] via-[#1b6d24] to-[#4ade80]",
    description: "Rendement plus offensif avec exploitation active.",
    label: "Saisonnier",
  },
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

function formatMultiple(value: ApiNumber | undefined) {
  const amount = toNumber(value);
  if (!amount) {
    return "N/A";
  }
  return `${amount.toLocaleString("fr-MA", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  })}x`;
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

function parseFormNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildScenarioPayload(form: ScenarioForm, strategy: StrategyKey) {
  const base = {
    annual_expense_rate: parseFormNumber(form.annual_expense_rate),
    appreciation_rate: parseFormNumber(form.appreciation_rate),
    down_payment: parseFormNumber(form.down_payment),
    exit_cost_rate: parseFormNumber(form.exit_cost_rate),
    holding_period_years: Math.max(1, parseFormNumber(form.holding_period_years)),
    loan_rate: parseFormNumber(form.loan_rate),
    loan_years: Math.max(1, parseFormNumber(form.loan_years)),
    monthly_rent: parseFormNumber(form.monthly_rent),
    purchase_price: parseFormNumber(form.purchase_price),
    renovation_budget: parseFormNumber(form.renovation_budget),
  };

  if (strategy === "seasonal") {
    return {
      ...base,
      annual_expense_rate: base.annual_expense_rate + 8,
      appreciation_rate: base.appreciation_rate + 1,
      holding_period_years: Math.max(base.holding_period_years, 8),
      monthly_rent: base.monthly_rent * 1.55,
      renovation_budget: base.renovation_budget * 1.15,
    };
  }

  if (strategy === "flip") {
    return {
      ...base,
      annual_expense_rate: Math.max(8, base.annual_expense_rate - 10),
      appreciation_rate: base.appreciation_rate + 9,
      exit_cost_rate: base.exit_cost_rate + 1,
      holding_period_years: Math.min(Math.max(1, base.holding_period_years), 2),
      loan_years: Math.min(base.loan_years, 10),
      monthly_rent: base.monthly_rent * 0.2,
      renovation_budget: base.renovation_budget * 1.4,
    };
  }

  return base;
}

function scenarioCacheKey(strategy: StrategyKey, payload: ReturnType<typeof buildScenarioPayload>) {
  return `ml-scenario:${strategy}:${JSON.stringify(payload)}`;
}

function strategySortScore(simulation: ScenarioSimulationResponse | null) {
  if (!simulation) {
    return -Infinity;
  }
  const irr = toNumber(simulation.projected_irr);
  if (irr > 0) {
    return irr;
  }
  return toNumber(simulation.total_profit);
}

export default function ScenarioSimulatorMarocPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<ScenarioForm>(defaultForm);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [simulations, setSimulations] = useState<Record<StrategyKey, ScenarioSimulationResponse | null>>({
    flip: null,
    long_term: null,
    seasonal: null,
  });
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>("long_term");
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBaseData() {
      try {
        const [organizationPayload, scenarioPayload] = await Promise.all([
          apiRequest<Organization[]>("/organizations/", { token }),
          apiRequest<SavedScenario[]>("/scenarios/", { token }),
        ]);

        if (!active) {
          return;
        }

        setOrganizations(organizationPayload);
        setSavedScenarios(scenarioPayload);
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(getErrorMessage(requestError, "Impossible de charger les scénarios sauvegardés."));
      }
    }

    void loadBaseData();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        setError("");

        try {
          const payloads = strategyOrder.map((strategy) =>
            ({
              payload: buildScenarioPayload(form, strategy),
              strategy,
            }),
          );

          const [longTerm, seasonal, flip] = await Promise.all(
            payloads.map(({ payload, strategy }) =>
              apiRequest<ScenarioSimulationResponse>("/ml/scenario-simulation/", {
                body: payload,
                cacheKey: scenarioCacheKey(strategy, payload),
                cacheTtlMs: 120_000,
                method: "POST",
                token,
              }),
            ),
          );

          if (!active) {
            return;
          }

          const nextSimulations = {
            flip,
            long_term: longTerm,
            seasonal: seasonal,
          };

          setSimulations(nextSimulations);

          const bestStrategy = strategyOrder.reduce((best, current) =>
            strategySortScore(nextSimulations[current]) > strategySortScore(nextSimulations[best])
              ? current
              : best,
          );

          setSelectedStrategy((current) => (nextSimulations[current] ? current : bestStrategy));
        } catch (requestError) {
          if (!active) {
            return;
          }
          setError(getErrorMessage(requestError, "Impossible de recalculer les scénarios."));
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      })();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [form, token]);

  function updateField<K extends keyof ScenarioForm>(field: K, value: ScenarioForm[K]) {
    setSaveMessage("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  const bestStrategy = useMemo(
    () =>
      strategyOrder.reduce((best, current) =>
        strategySortScore(simulations[current]) > strategySortScore(simulations[best]) ? current : best,
      ),
    [simulations],
  );

  const activeSimulation = simulations[selectedStrategy];
  const isInitialLoading =
    isLoading &&
    organizations.length === 0 &&
    savedScenarios.length === 0 &&
    Object.values(simulations).every((simulation) => simulation === null) &&
    !error;

  const projectionBars = useMemo(() => {
    if (!activeSimulation) {
      return [];
    }

    const values = [
      { label: "Dette", value: toNumber(activeSimulation.loan_amount) },
      { label: "NOI annuel", value: toNumber(activeSimulation.annual_noi) },
      { label: "Exit net", value: toNumber(activeSimulation.net_exit_proceeds) },
      { label: "Profit", value: toNumber(activeSimulation.total_profit) },
    ];

    const maxValue = Math.max(1, ...values.map((item) => Math.abs(item.value)));

    return values.map((item) => ({
      ...item,
      height: Math.max(12, Math.round((Math.abs(item.value) / maxValue) * 100)),
    }));
  }, [activeSimulation]);

  async function saveScenario() {
    if (!activeSimulation) {
      setSaveMessage("Aucune simulation prête à sauvegarder.");
      return;
    }

    const organization = organizations[0];
    if (!organization) {
      setSaveMessage("Aucune organisation visible pour enregistrer ce scénario.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const strategyPayload = buildScenarioPayload(form, selectedStrategy);
      const response = await apiRequest<SavedScenario>("/scenarios/", {
        method: "POST",
        token,
        body: {
          assumptions: {
            ...strategyPayload,
            source: "scenario-simulator-maroc",
          },
          holding_period_years: strategyPayload.holding_period_years,
          loan_rate: strategyPayload.loan_rate,
          loan_years: strategyPayload.loan_years,
          notes: `Scénario ${strategyMeta[selectedStrategy].label} généré depuis l'interface.`,
          organization: organization.id,
          projected_exit_value: toNumber(activeSimulation.projected_exit_value),
          projected_irr: toNumber(activeSimulation.projected_irr),
          projected_monthly_cashflow: toNumber(activeSimulation.projected_monthly_cashflow),
          renovation_budget: strategyPayload.renovation_budget,
          strategy: selectedStrategy,
          title: `${strategyMeta[selectedStrategy].label} · ${strategyPayload.purchase_price.toLocaleString("fr-MA")} MAD`,
          down_payment: strategyPayload.down_payment,
        },
      });

      setSavedScenarios((current) => [response, ...current]);
      clearApiCache("/scenarios/");
      clearApiCache("/dashboard/overview/");
      setSaveMessage("Scénario enregistré avec succès dans la base.");
    } catch (requestError) {
      setSaveMessage(getErrorMessage(requestError, "Impossible d'enregistrer ce scénario."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Simulateur de Scénarios"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
              Scénarios d'investissement pilotés par le backend
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
              Simulateur de scénarios
            </h1>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant">
              Ajustez les hypothèses financières et comparez trois stratégies concrètes pour transformer vos
              données marché en décision d’investissement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-5 py-3 text-sm font-bold text-primary"
              data-disable-prototype-actions="true"
              onClick={() => setForm(defaultForm)}
              type="button"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              Réinitialiser
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60"
              data-disable-prototype-actions="true"
              disabled={isSaving || isLoading}
              onClick={() => void saveScenario()}
              type="button"
            >
              <span className="material-symbols-outlined text-base">save</span>
              {isSaving ? "Enregistrement..." : "Enregistrer le scénario"}
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        {saveMessage && (
          <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary-container/35 px-5 py-4 text-sm font-semibold text-secondary">
            {saveMessage}
          </div>
        )}

        {isInitialLoading ? (
          <WorkspacePageLoader cardCount={3} showChart sidePanelCount={2} />
        ) : (
          <>
            <section className="mb-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8">
              <div className="rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-primary">Hypothèses</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Tous les champs recalculent automatiquement les scénarios.
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {organizations[0]?.name || "Mode démo"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Prix d'achat"
                    onChange={(value) => updateField("purchase_price", value)}
                    suffix="MAD"
                    value={form.purchase_price}
                  />
                  <Field
                    label="Apport"
                    onChange={(value) => updateField("down_payment", value)}
                    suffix="MAD"
                    value={form.down_payment}
                  />
                  <Field
                    label="Loyer mensuel"
                    onChange={(value) => updateField("monthly_rent", value)}
                    suffix="MAD"
                    value={form.monthly_rent}
                  />
                  <Field
                    label="Budget travaux"
                    onChange={(value) => updateField("renovation_budget", value)}
                    suffix="MAD"
                    value={form.renovation_budget}
                  />
                  <Field
                    label="Taux crédit"
                    onChange={(value) => updateField("loan_rate", value)}
                    step="0.1"
                    suffix="%"
                    value={form.loan_rate}
                  />
                  <Field
                    label="Durée du prêt"
                    onChange={(value) => updateField("loan_years", value)}
                    suffix="ans"
                    value={form.loan_years}
                  />
                  <Field
                    label="Horizon de détention"
                    onChange={(value) => updateField("holding_period_years", value)}
                    suffix="ans"
                    value={form.holding_period_years}
                  />
                  <Field
                    label="Taux de charges"
                    onChange={(value) => updateField("annual_expense_rate", value)}
                    step="0.5"
                    suffix="%"
                    value={form.annual_expense_rate}
                  />
                  <Field
                    label="Appréciation annuelle"
                    onChange={(value) => updateField("appreciation_rate", value)}
                    step="0.1"
                    suffix="%"
                    value={form.appreciation_rate}
                  />
                  <Field
                    label="Coûts de sortie"
                    onChange={(value) => updateField("exit_cost_rate", value)}
                    step="0.1"
                    suffix="%"
                    value={form.exit_cost_rate}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                  Lecture recommandée
                </p>
                <h2 className="mt-3 text-3xl font-headline font-extrabold">{strategyMeta[bestStrategy].label}</h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-fixed">
                  {strategyMeta[bestStrategy].description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <DataPill label="TRI projeté" value={formatPercent(simulations[bestStrategy]?.projected_irr)} />
                  <DataPill
                    label="Cash-flow mensuel"
                    value={formatMoney(simulations[bestStrategy]?.projected_monthly_cashflow, true)}
                  />
                  <DataPill
                    label="Profit total"
                    value={formatMoney(simulations[bestStrategy]?.total_profit, true)}
                  />
                  <DataPill
                    label="Multiple equity"
                    value={formatMultiple(simulations[bestStrategy]?.equity_multiple)}
                  />
                </div>

                <p className="mt-6 text-xs uppercase tracking-widest text-primary-fixed-dim">
                  Sauvegarde disponible vers `/api/scenarios/`
                </p>
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary">Comparatif des stratégies</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Les cartes utilisent le simulateur backend `/api/ml/scenario-simulation/`.
                  </p>
                </div>
                {isLoading && (
                  <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Recalcul en cours
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {strategyOrder.map((strategy) => {
                  const simulation = simulations[strategy];
                  const active = selectedStrategy === strategy;
                  const best = bestStrategy === strategy;
                  return (
                    <button
                      className={
                        active
                          ? "overflow-hidden rounded-2xl border-2 border-secondary bg-white text-left shadow-lg"
                          : "overflow-hidden rounded-2xl border border-slate-200/60 bg-white text-left shadow-sm"
                      }
                      data-disable-prototype-actions="true"
                      key={strategy}
                      onClick={() => setSelectedStrategy(strategy)}
                      type="button"
                    >
                      <div className={`bg-gradient-to-r ${strategyMeta[strategy].accent} p-5 text-white`}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                              {best ? "Meilleur score" : "Stratégie"}
                            </p>
                            <h3 className="mt-2 text-2xl font-headline font-extrabold">
                              {strategyMeta[strategy].label}
                            </h3>
                          </div>
                          {best && (
                            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                              recommandée
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm opacity-90">{strategyMeta[strategy].description}</p>
                      </div>

                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <DataPill label="TRI" value={formatPercent(simulation?.projected_irr)} />
                          <DataPill
                            label="Cash-flow"
                            value={formatMoney(simulation?.projected_monthly_cashflow, true)}
                          />
                          <DataPill label="Exit net" value={formatMoney(simulation?.net_exit_proceeds, true)} />
                          <DataPill label="Profit" value={formatMoney(simulation?.total_profit, true)} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_360px] gap-8">
              <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-primary">
                      Projection détaillée · {strategyMeta[selectedStrategy].label}
                    </h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Vue détaillée du scénario sélectionné, à partir des paramètres courants.
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Horizon {buildScenarioPayload(form, selectedStrategy).holding_period_years} ans
                  </span>
                </div>

                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <DataPill label="Dette mensuelle" value={formatMoney(activeSimulation?.monthly_debt_service)} />
                  <DataPill label="NOI annuel" value={formatMoney(activeSimulation?.annual_noi, true)} />
                  <DataPill
                    label="Valeur de sortie"
                    value={formatMoney(activeSimulation?.projected_exit_value, true)}
                  />
                  <DataPill
                    label="Dette résiduelle"
                    value={formatMoney(activeSimulation?.remaining_debt_at_exit, true)}
                  />
                </div>

                <div className="h-64 rounded-2xl bg-surface-container-low px-4 pt-8 flex items-end gap-4 overflow-hidden">
                  {projectionBars.map((bar, index) => (
                    <div
                      className={
                        index === projectionBars.length - 1
                          ? "flex-1 rounded-t-xl bg-primary"
                          : "flex-1 rounded-t-xl bg-secondary/75"
                      }
                      key={bar.label}
                      style={{ height: `${bar.height}%` }}
                      title={`${bar.label}: ${formatMoney(bar.value, true)}`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {projectionBars.map((bar) => (
                    <span key={bar.label}>{bar.label}</span>
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
                  <h3 className="text-xl font-headline font-bold text-primary">Repères rapides</h3>
                  <div className="mt-5 space-y-4">
                    <DataRow label="Prix d'achat" value={formatMoney(activeSimulation?.purchase_price, true)} />
                    <DataRow label="Montant financé" value={formatMoney(activeSimulation?.loan_amount, true)} />
                    <DataRow label="Exit net" value={formatMoney(activeSimulation?.net_exit_proceeds, true)} />
                    <DataRow label="Profit total" value={formatMoney(activeSimulation?.total_profit, true)} />
                  </div>
                </section>

                <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
                  <h3 className="text-xl font-headline font-bold text-primary">Scénarios sauvegardés</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Historique réel issu de `GET /api/scenarios/`.
                  </p>

                  <div className="mt-5 space-y-4">
                    {savedScenarios.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">Aucun scénario en base pour le moment.</p>
                    ) : (
                      savedScenarios.slice(0, 5).map((scenario) => (
                        <article className="rounded-xl bg-white p-4" key={scenario.id}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-primary">{scenario.title}</p>
                              <p className="mt-1 text-xs text-on-surface-variant">
                                {scenario.organization_name} · {strategyMeta[scenario.strategy].label}
                              </p>
                            </div>
                            <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                              {formatPercent(scenario.projected_irr)}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <DataPill
                              label="Cash-flow"
                              value={formatMoney(scenario.projected_monthly_cashflow, true)}
                            />
                            <DataPill label="Exit" value={formatMoney(scenario.projected_exit_value, true)} />
                          </div>
                          <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
                            {formatDate(scenario.created_at)}
                          </p>
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

function Field({
  label,
  onChange,
  suffix,
  value,
  step = "1",
}: {
  label: string;
  onChange: (value: string) => void;
  step?: string;
  suffix: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <div className="flex items-center overflow-hidden rounded-xl bg-surface-container-low">
        <input
          className="w-full border-none bg-transparent px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
          min={0}
          onChange={(event) => onChange(event.target.value)}
          step={step}
          type="number"
          value={value}
        />
        <span className="px-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {suffix}
        </span>
      </div>
    </label>
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
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-4 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-bold text-primary">{value}</span>
    </div>
  );
}
