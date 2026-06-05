// Composants partages du dashboard: graphiques, cartes, badges et actions rapides.
import { type ReactNode } from "react";

type ChartLine = {
  color: string;
  key: string;
  label: string;
};

type ChartBlockProps = {
  children: ReactNode;
  tone: "amber" | "blue";
};

type LegendPillProps = {
  color: string;
  label: string;
};

type MetricCardProps = {
  label: string;
  value: string;
};

type LineChartCardProps = {
  lines: ChartLine[];
  points: Array<{ date: string; [key: string]: number | string | null | undefined }>;
  subtitle: string;
  title: string;
};

type HorizontalBarChartCardProps = {
  formatter: (value: number) => string;
  items: { color: string; label: string; secondary?: string; value: number }[];
  subtitle: string;
  title: string;
};

type ListPanelProps = {
  items: { label: string; secondary: string; value: string }[];
  title: string;
};

type DataRowProps = {
  label: string;
  value: string;
};

type QuickActionButtonProps = {
  label: string;
  onClick: () => void;
};

type TableActionButtonProps = {
  label: string;
  onClick: () => void;
  tone: "danger" | "ghost" | "primary";
};

type StatusBadgeProps = {
  label: string;
  tone: "neutral" | "success" | "warning";
};

type EmptyBlockProps = {
  text: string;
};

// Encadrement visuel du chart avec une couleur de fond selon le theme du bloc.
export function ChartBlock({ children, tone }: ChartBlockProps) {
  const shellClassName =
    tone === "blue"
      ? "rounded-[28px] border border-[#d8e4ff] bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] p-3"
      : "rounded-[28px] border border-[#f2dfb8] bg-[linear-gradient(180deg,#fffaf0_0%,#fff4de_100%)] p-3";

  return <div className={shellClassName}>{children}</div>;
}

// Badge qui indique que le dashboard est alimente en temps reel.
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-secondary">
      <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
      Temps reel
    </span>
  );
}

// Petit indicateur couleur pour la legende des charts.
export function LegendPill({ color, label }: LegendPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-primary">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// Carte KPI principale utilisee dans les lignes de statistiques du dashboard.
export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 font-headline text-3xl font-extrabold text-primary">{value}</p>
    </div>
  );
}

// Titre de section standard pour les blocs clairs.
export function SectionTitle({ subtitle, title }: { subtitle?: string; title: string }) {
  return (
    <div>
      <h2 className="font-headline text-2xl font-extrabold text-primary">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p> : null}
    </div>
  );
}

// Titre de section sur fond sombre.
export function SectionTitleDark({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div>
      <h2 className="font-headline text-2xl font-extrabold text-white">{title}</h2>
      <p className="mt-2 text-sm text-primary-fixed">{subtitle}</p>
    </div>
  );
}

// Ligne de synthese pour les panels textuels du dashboard.
export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 text-sm">
      <span className="text-primary-fixed">{label}</span>
      <span className="text-right font-bold text-white">{value}</span>
    </div>
  );
}

// Bouton rapide sur fond sombre.
export function QuickActionButton({ label, onClick }: QuickActionButtonProps) {
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

// Bouton de tableau avec trois variantes de style.
export function TableActionButton({ label, onClick, tone }: TableActionButtonProps) {
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

// Badge d'etat pour les tableaux et les listes.
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const className =
    tone === "success"
      ? "bg-secondary-container text-secondary"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : "bg-surface-container-low text-on-surface-variant";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}

// Bloc vide affiche quand une liste ou un graphe n'a pas encore de donnees.
export function EmptyBlock({ text }: EmptyBlockProps) {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
      {text}
    </div>
  );
}

// Carte de graphique en ligne pour suivre une evolution sur plusieurs jours.
export function LineChartCard({ lines, points, subtitle, title }: LineChartCardProps) {
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

  function buildPolyline(key: string) {
    if (points.length === 0) {
      return "";
    }

    return points
      .map((point, index) => {
        const x = points.length === 1 ? width / 2 : paddingX + (index / (points.length - 1)) * usableWidth;
        const y = paddingTop + usableHeight - ((Number(point[key] ?? 0) / Math.max(maxValue, 1)) * usableHeight);
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
          <svg aria-label={title} className="h-auto w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
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
                  const x = points.length === 1 ? width / 2 : paddingX + (index / (points.length - 1)) * usableWidth;
                  const y =
                    paddingTop + usableHeight - ((Number(point[line.key] ?? 0) / Math.max(maxValue, 1)) * usableHeight);
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
              const x = points.length === 1 ? width / 2 : paddingX + (index / (points.length - 1)) * usableWidth;
              return (
                <text
                  fill="#64748b"
                  fontSize="12"
                  key={point.date}
                  textAnchor="middle"
                  x={x}
                  y={height - 10}
                >
                  {new Intl.DateTimeFormat("fr-MA", {
                    day: "2-digit",
                    month: "short",
                  }).format(new Date(point.date))}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

// Carte horizontale pour comparer plusieurs volumes sur une meme echelle.
export function HorizontalBarChartCard({
  formatter,
  items,
  subtitle,
  title,
}: HorizontalBarChartCardProps) {
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
                  {item.secondary ? <p className="text-xs text-on-surface-variant">{item.secondary}</p> : null}
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

// Bloc textuel de synthese affiche dans les colonnes latérales.
export function ListPanel({ items, title }: ListPanelProps) {
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
