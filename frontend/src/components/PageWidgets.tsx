// Composants d'interface partages pour les pages: cartes, champs, lignes et indicateurs.
type MetricCardProps = {
  label: string;
  value: string;
};

type InfoCardProps = {
  label: string;
  secondary?: string;
  value: string;
};

type EditableInfoCardProps = {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
};

type FieldProps = {
  label: string;
  min?: number | string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  suffix?: string;
  type?: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
};

type DataPillProps = {
  label: string;
  value: string;
};

type DataRowProps = {
  label: string;
  value: string;
};

type PreviewCardProps = {
  label: string;
  value: string;
};

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

type StatPanelProps = {
  label: string;
  value: string;
};

type DataCellProps = {
  label: string;
  value: string;
};

// Carte KPI simple pour les statistiques principales.
export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-2xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}

// Carte d'information avec valeur principale et texte secondaire optionnel.
export function InfoCard({ label, secondary, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl bg-surface-container-low px-5 py-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-2xl font-extrabold text-primary">{value}</p>
      {secondary ? <p className="mt-2 text-sm text-on-surface-variant">{secondary}</p> : null}
    </div>
  );
}

// Champ editable reutilisable dans les pages profil et formulaires.
export function EditableInfoCard({
  disabled = false,
  label,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: EditableInfoCardProps) {
  return (
    <label className="block rounded-2xl bg-surface-container-low p-5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      <input
        className="mt-3 w-full rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-sm text-on-surface shadow-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/15 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

// Champ numerique standard avec suffixe unite.
export function Field({
  label,
  min,
  onChange,
  placeholder,
  required = false,
  step = "1",
  suffix,
  type = "number",
  value,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <div className="flex items-center overflow-hidden rounded-xl bg-surface-container-low">
        <input
          className="w-full border-none bg-transparent px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
          min={type === "number" ? min ?? 0 : undefined}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          step={step}
          type={type}
          value={value}
        />
        {suffix ? (
          <span className="px-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

// Champ select standard pour les formulaires a options predefinies.
export function SelectField({ label, onChange, options, value }: SelectFieldProps) {
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

// Petit badge de valeur pour les resultats compactes.
export function DataPill({ label, value }: DataPillProps) {
  return (
    <div className="rounded-lg bg-surface-container-low px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-1 font-bold text-primary">{value}</p>
    </div>
  );
}

// Ligne label/valeur pour les tableaux ou les panneaux de synthese.
export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm">
      <span className="text-primary-fixed">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

// Carte de preview simple pour resumer une valeur ou un indicateur.
export function PreviewCard({ label, value }: PreviewCardProps) {
  return (
    <div className="rounded-xl bg-surface-container-low px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-2 font-bold text-primary">{value}</p>
    </div>
  );
}

// Bouton d'action compact utilise dans les panneaux et les formulaires.
export function ActionButton({ className = "", label, onClick }: ActionButtonProps) {
  return (
    <button
      className={`rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white transition-colors hover:bg-white/15 ${className}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

// Bloc compact pour les statuts et les cartes de synthese.
export function StatPanel({ label, value }: StatPanelProps) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-primary">{value}</p>
    </div>
  );
}

// Cellule de tableau simple avec etiquette et valeur.
export function DataCell({ label, value }: DataCellProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-outline-variant/20 pb-3 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-right font-semibold text-primary">{value}</span>
    </div>
  );
}
