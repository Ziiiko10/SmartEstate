import { FormEvent, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type SettingsForm = {
  agencyFeesPercent: string;
  defaultInterestRate: string;
  maxLoanDurationYears: string;
  notaryFeesPercent: string;
  validationRule: string;
};

const defaultSettings: SettingsForm = {
  agencyFeesPercent: "2.5",
  defaultInterestRate: "4.7",
  maxLoanDurationYears: "25",
  notaryFeesPercent: "4",
  validationRule: "Toute annonce doit inclure une ville, un quartier, un prix et une surface valides.",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(defaultSettings);
  const [message, setMessage] = useState("");

  function updateField<K extends keyof SettingsForm>(field: K, value: SettingsForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Paramètres enregistrés dans la maquette d'administration.");
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Paramètres"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Paramétrage
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Paramètres
          </h1>
        </section>

        {message && (
          <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary-container/35 px-5 py-4 text-sm font-semibold text-secondary">
            {message}
          </div>
        )}

        <form className="rounded-2xl bg-white p-6 md:p-8 shadow-sm space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Frais de notaire (%)" value={form.notaryFeesPercent} onChange={(value) => updateField("notaryFeesPercent", value)} />
            <Field label="Frais d'agence (%)" value={form.agencyFeesPercent} onChange={(value) => updateField("agencyFeesPercent", value)} />
            <Field label="Taux d'intérêt par défaut (%)" value={form.defaultInterestRate} onChange={(value) => updateField("defaultInterestRate", value)} />
            <Field label="Durée maximale du crédit (ans)" value={form.maxLoanDurationYears} onChange={(value) => updateField("maxLoanDurationYears", value)} />
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Règle de validation des annonces
            </span>
            <textarea
              className="min-h-36 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
              onChange={(event) => updateField("validationRule", event.target.value)}
              value={form.validationRule}
            />
          </label>

          <button className="rounded-xl bg-primary px-5 py-4 text-sm font-bold text-white" type="submit">
            Enregistrer les paramètres
          </button>
        </form>
      </main>
    </ImportedPageDocument>
  );
}

function Field({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      <input
        className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}
