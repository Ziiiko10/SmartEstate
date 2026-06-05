import { useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { formatDh, formatPercent, toNumber } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type SimulationForm = {
  agencyFees: string;
  bankRatePresetId: string;
  downPayment: string;
  loanAmount: string;
  loanDurationYears: string;
  monthlyCharges: string;
  monthlyRent: string;
  notaryFees: string;
  purchasePrice: string;
  worksBudget: string;
  yearlyInterestRate: string;
};

type BankRatePreset = {
  annualRate: string;
  asOf: string;
  bankName: string;
  id: string;
  note: string;
  offerLabel: string;
  rateLabel: string;
  sourceLabel: string;
  sourceUrl: string;
};

const CUSTOM_BANK_RATE_PRESET_ID = "custom";

const BANK_RATE_PRESETS: BankRatePreset[] = [
  {
    annualRate: "4.75",
    asOf: "5 juin 2026",
    bankName: "BANK OF AFRICA",
    id: "boa-credit-habitat",
    note: "Taux public annonce a partir de 4,75 % selon le profil de l'emprunteur et la duree du pret.",
    offerLabel: "Credit Habitat / Immo Plus Classique",
    rateLabel: "4,75 % minimum",
    sourceLabel: "Article officiel BANK OF AFRICA",
    sourceUrl:
      "https://www.bankofafrica.ma/index.php/fr/articles/pourquoi-cest-le-bon-moment-pour-lachat-immobilier-au-maroc",
  },
  {
    annualRate: "4.1",
    asOf: "5 juin 2026",
    bankName: "BMCI",
    id: "bmci-credit-habitat-mre",
    note: "Taux nominal HT de 4,1 % affiche sur l'exemple officiel BMCI Credit Habitat MRE.",
    offerLabel: "Credit Habitat MRE",
    rateLabel: "4,10 % nominal HT",
    sourceLabel: "Page officielle BMCI Credit Habitat",
    sourceUrl: "https://www.bmci.ma/particuliers/marocains-residents-a-letranger/credits/credit-habitat/",
  },
];

const defaultForm: SimulationForm = {
  agencyFees: "36000",
  bankRatePresetId: BANK_RATE_PRESETS[0].id,
  downPayment: "320000",
  loanAmount: "1280000",
  loanDurationYears: "20",
  monthlyCharges: "1400",
  monthlyRent: "9800",
  notaryFees: "64000",
  purchasePrice: "1600000",
  worksBudget: "90000",
  yearlyInterestRate: BANK_RATE_PRESETS[0].annualRate,
};

function computeMonthlyPayment(loanAmount: number, annualRate: number, durationYears: number) {
  const monthlyRate = annualRate / 100 / 12;
  const months = durationYears * 12;

  if (loanAmount <= 0 || months <= 0) {
    return 0;
  }

  if (monthlyRate <= 0) {
    return loanAmount / months;
  }

  return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function buildAdvice(monthlyGain: number, netYield: number) {
  if (monthlyGain > 1800 && netYield >= 6) {
    return {
      label: "Rentable",
      tone: "bg-secondary-container text-secondary",
      text: "Le scénario reste sain avec une marge positive et un rendement net solide.",
    };
  }

  if (monthlyGain >= 0 && netYield >= 4) {
    return {
      label: "Moyen",
      tone: "bg-amber-100 text-amber-800",
      text: "Le projet peut tenir, mais il mérite une négociation du prix ou des charges.",
    };
  }

  return {
    label: "Risqué",
    tone: "bg-red-100 text-red-700",
    text: "Le cash-flow est trop tendu. Réduisez le coût d'acquisition ou augmentez le loyer cible.",
  };
}

export default function UserInvestmentSimulationPage() {
  const [form, setForm] = useState<SimulationForm>(defaultForm);

  function updateField<K extends keyof SimulationForm>(field: K, value: SimulationForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function applyBankRatePreset(presetId: string) {
    const preset = BANK_RATE_PRESETS.find((item) => item.id === presetId);

    if (!preset) {
      updateField("bankRatePresetId", CUSTOM_BANK_RATE_PRESET_ID);
      return;
    }

    setForm((current) => ({
      ...current,
      bankRatePresetId: preset.id,
      yearlyInterestRate: preset.annualRate,
    }));
  }

  const selectedBankRatePreset = useMemo(
    () => BANK_RATE_PRESETS.find((item) => item.id === form.bankRatePresetId) ?? null,
    [form.bankRatePresetId],
  );
  const isManualRateOverride =
    selectedBankRatePreset !== null && form.yearlyInterestRate !== selectedBankRatePreset.annualRate;

  const result = useMemo(() => {
    const purchasePrice = toNumber(form.purchasePrice);
    const downPayment = toNumber(form.downPayment);
    const loanAmount = toNumber(form.loanAmount) || Math.max(0, purchasePrice - downPayment);
    const durationYears = Math.max(1, toNumber(form.loanDurationYears));
    const annualRate = toNumber(form.yearlyInterestRate);
    const monthlyRent = toNumber(form.monthlyRent);
    const monthlyCharges = toNumber(form.monthlyCharges);
    const notaryFees = toNumber(form.notaryFees);
    const agencyFees = toNumber(form.agencyFees);
    const worksBudget = toNumber(form.worksBudget);

    const monthlyPayment = computeMonthlyPayment(loanAmount, annualRate, durationYears);
    const totalProjectCost = purchasePrice + notaryFees + agencyFees + worksBudget;
    const yearlyRent = monthlyRent * 12;
    const yearlyCharges = monthlyCharges * 12;
    const grossYield = totalProjectCost > 0 ? (yearlyRent / totalProjectCost) * 100 : 0;
    const netYield = totalProjectCost > 0 ? ((yearlyRent - yearlyCharges) / totalProjectCost) * 100 : 0;
    const monthlyGain = monthlyRent - monthlyCharges - monthlyPayment;

    return {
      advice: buildAdvice(monthlyGain, netYield),
      grossYield,
      loanAmount,
      monthlyGain,
      monthlyPayment,
      netYield,
      totalProjectCost,
    };
  }, [form]);

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Simulation d'investissement"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Projection locative
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Simulation d'investissement
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant">
            Ajustez vos hypothèses d'achat, de financement et de charges pour mesurer instantanément la
            rentabilité d'un projet immobilier au Maroc.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8">
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-headline font-bold text-primary">Hypothèses</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Prix d'achat" suffix="DH" value={form.purchasePrice} onChange={(value) => updateField("purchasePrice", value)} />
              <Field label="Apport personnel" suffix="DH" value={form.downPayment} onChange={(value) => updateField("downPayment", value)} />
              <Field label="Montant du crédit" suffix="DH" value={form.loanAmount} onChange={(value) => updateField("loanAmount", value)} />
              <Field label="Durée du crédit" suffix="ans" value={form.loanDurationYears} onChange={(value) => updateField("loanDurationYears", value)} />
              <SelectField
                label="Banque / taux public"
                options={[
                  ...BANK_RATE_PRESETS.map((preset) => ({
                    label: `${preset.bankName} - ${preset.offerLabel} (${preset.rateLabel})`,
                    value: preset.id,
                  })),
                  { label: "Autre banque / saisie manuelle", value: CUSTOM_BANK_RATE_PRESET_ID },
                ]}
                value={form.bankRatePresetId}
                onChange={applyBankRatePreset}
              />
              <Field
                label="Taux d'intérêt appliqué"
                suffix="%"
                value={form.yearlyInterestRate}
                onChange={(value) => updateField("yearlyInterestRate", value)}
                step="0.1"
              />
              <div className="md:col-span-2 rounded-2xl border border-secondary/15 bg-secondary/5 p-5">
                {selectedBankRatePreset ? (
                  <>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                          Taux bancaire public
                        </p>
                        <h3 className="mt-2 text-lg font-headline font-bold text-primary">
                          {selectedBankRatePreset.bankName}
                        </h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {selectedBankRatePreset.offerLabel}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm">
                        {selectedBankRatePreset.rateLabel}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                      {selectedBankRatePreset.note}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                      <span className="rounded-full bg-white px-3 py-2 text-on-surface-variant">
                        Vérifié le {selectedBankRatePreset.asOf}
                      </span>
                      <a
                        className="rounded-full bg-white px-3 py-2 text-secondary transition hover:opacity-80"
                        href={selectedBankRatePreset.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {selectedBankRatePreset.sourceLabel}
                      </a>
                      <span
                        className={`rounded-full px-3 py-2 ${
                          isManualRateOverride
                            ? "bg-amber-100 text-amber-800"
                            : "bg-white text-on-surface-variant"
                        }`}
                      >
                        {isManualRateOverride ? "Taux modifié manuellement" : "Taux appliqué automatiquement"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                      Taux bancaire
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                      Choisissez une banque avec taux public ou saisissez votre taux négocié manuellement.
                    </p>
                  </>
                )}
              </div>
              <Field label="Loyer mensuel estimé" suffix="DH" value={form.monthlyRent} onChange={(value) => updateField("monthlyRent", value)} />
              <Field label="Charges mensuelles" suffix="DH" value={form.monthlyCharges} onChange={(value) => updateField("monthlyCharges", value)} />
              <Field label="Frais de notaire" suffix="DH" value={form.notaryFees} onChange={(value) => updateField("notaryFees", value)} />
              <Field label="Frais d'agence" suffix="DH" value={form.agencyFees} onChange={(value) => updateField("agencyFees", value)} />
              <Field label="Travaux éventuels" suffix="DH" value={form.worksBudget} onChange={(value) => updateField("worksBudget", value)} />
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                Résultat synthétique
              </p>
              <h2 className="mt-3 text-3xl font-headline font-extrabold">
                {formatDh(result.monthlyGain)}
              </h2>
              <p className="mt-2 text-primary-fixed">
                Gain ou perte mensuelle après charges et mensualité estimée.
              </p>
              <div className={`mt-6 inline-flex rounded-full px-4 py-2 text-sm font-bold ${result.advice.tone}`}>
                {result.advice.label}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-primary-fixed">{result.advice.text}</p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard label="Mensualité estimée" value={formatDh(result.monthlyPayment)} />
              <MetricCard label="Rendement brut" value={formatPercent(result.grossYield)} />
              <MetricCard label="Rendement net" value={formatPercent(result.netYield)} />
              <MetricCard label="Coût total projet" value={formatDh(result.totalProjectCost, true)} />
            </section>
          </div>
        </section>
      </main>
    </ImportedPageDocument>
  );
}

function Field({
  label,
  onChange,
  step = "1",
  suffix,
  value,
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

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <div className="overflow-hidden rounded-xl bg-surface-container-low">
        <select
          className="w-full border-none bg-transparent px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-2xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}
