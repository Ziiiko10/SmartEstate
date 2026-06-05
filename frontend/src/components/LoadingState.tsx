// Etats de chargement reutilisables pour l'application et les espaces dashboard.
// Le module regroupe ecrans pleins, overlays et squelettes de differents formats.
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

export function AppLoadingScreen({
  message = "Chargement en cours...",
  subtitle = "Préparation de votre expérience SmartEstate.",
}: {
  message?: string;
  subtitle?: string;
}) {
  // Affiche un ecran de chargement plein format avec marque SmartEstate.
  // Il est utilise pendant le bootstrap, les gardes de route et certains changements d'etat.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-on-surface">
      <div className="smartestate-loader-surface max-w-md rounded-[28px] px-10 py-10 shadow-[0_24px_60px_rgba(23,32,58,0.1)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
          <span className="material-symbols-outlined text-[28px]">hourglass_top</span>
        </div>
        <p className="font-headline text-3xl font-black text-primary">SmartEstate</p>
        <div className="mx-auto mt-5 h-1 w-32 overflow-hidden rounded-full bg-surface-container-low">
          <div className="smartestate-loader-bar h-full rounded-full bg-secondary" />
        </div>
        <p className="mt-5 text-sm font-semibold text-on-surface">{message}</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
  );
}

export function RouteTransitionOverlay() {
  // Affiche un voile de transition bref a chaque changement de route.
  // L'effet rend la navigation plus lisible pendant le chargement des modules.
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  return (
    <div
      aria-hidden={!visible}
      className={
        visible
          ? "smartestate-route-loader smartestate-route-loader-visible"
          : "smartestate-route-loader"
      }
    >
      <div className="smartestate-route-loader-inner">
        <span className="material-symbols-outlined text-xl text-secondary">progress_activity</span>
        <span className="text-sm font-bold text-primary">Chargement de la page...</span>
      </div>
    </div>
  );
}

export function SkeletonBlock({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  // Rend un bloc squelette de base reutilisable dans tous les loaders.
  // La forme finale depend des classes et styles passes par le parent.
  return <div className={`smartestate-skeleton ${className}`.trim()} style={style} />;
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  // Simule une grille de cartes KPI pendant l'attente des donnees.
  // Le nombre de cartes peut etre adapte selon la page.
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)]"
          key={`metric-${index}`}
        >
          <SkeletonBlock className="h-3 w-24 rounded-full" />
          <SkeletonBlock className="mt-4 h-9 w-28 rounded-xl" />
          <SkeletonBlock className="mt-3 h-3 w-32 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({
  count = 3,
  withImage = true,
}: {
  count?: number;
  withImage?: boolean;
}) {
  // Simule une grille de cartes visuelles ou de listings.
  // Le mode withImage permet de couvrir les pages avec ou sans galerie.
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm" key={`card-${index}`}>
          {withImage ? <SkeletonBlock className="aspect-[16/10] w-full" /> : null}
          <div className="space-y-4 p-5">
            <div className="flex gap-2">
              <SkeletonBlock className="h-6 w-20 rounded-full" />
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="h-6 w-10/12 rounded-xl" />
            <SkeletonBlock className="h-4 w-8/12 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  // Simule un tableau de donnees avec un nombre parametrable de lignes et colonnes.
  // Les largeurs de colonnes varient legerement pour un rendu plus naturel.
  const columnWidths = useMemo(
    () =>
      Array.from({ length: columns }, (_, index) => {
        const widths = ["40%", "55%", "35%", "45%", "30%", "50%"];
        return widths[index % widths.length];
      }),
    [columns],
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="space-y-0">
        <div className="grid gap-4 border-b border-outline-variant/10 px-5 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {columnWidths.map((width, index) => (
            <SkeletonBlock className="h-3 rounded-full" key={`header-${index}`} style={{ width }} />
          ))}
        </div>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            className="grid gap-4 border-b border-outline-variant/10 px-5 py-5 last:border-b-0"
            key={`row-${rowIndex}`}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {columnWidths.map((width, columnIndex) => (
              <SkeletonBlock
                className="h-4 rounded-full"
                key={`cell-${rowIndex}-${columnIndex}`}
                style={{ width }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({
  barCount = 6,
  compact = false,
}: {
  barCount?: number;
  compact?: boolean;
}) {
  // Simule un bloc graphique a barres pendant le chargement des statistiques.
  // Le mode compact sert aux widgets secondaires ou aux espaces reduits.
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <SkeletonBlock className="h-7 w-56 rounded-xl" />
      <SkeletonBlock className="mt-3 h-4 w-72 rounded-full" />
      <div className={compact ? "mt-8 flex h-48 items-end gap-4 rounded-2xl bg-surface-container-low px-4 pt-8" : "mt-8 flex h-64 items-end gap-4 rounded-2xl bg-surface-container-low px-4 pt-8"}>
        {Array.from({ length: barCount }, (_, index) => (
          <SkeletonBlock
            className="flex-1 rounded-t-xl"
            key={`bar-${index}`}
            style={{ height: `${28 + ((index * 13) % 48)}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-between gap-2">
        {Array.from({ length: barCount }, (_, index) => (
          <SkeletonBlock className="h-3 w-10 rounded-full" key={`label-${index}`} />
        ))}
      </div>
    </div>
  );
}

export function AsidePanelsSkeleton({ count = 2 }: { count?: number }) {
  // Simule une pile de panneaux lateraux complementaires.
  // Ce loader est souvent combine aux cartes et graphiques du contenu principal.
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => (
        <div className="rounded-2xl bg-white p-6 shadow-sm" key={`aside-${index}`}>
          <SkeletonBlock className="h-6 w-40 rounded-xl" />
          <SkeletonBlock className="mt-3 h-4 w-10/12 rounded-full" />
          <div className="mt-6 space-y-4">
            <SkeletonBlock className="h-16 rounded-xl" />
            <SkeletonBlock className="h-16 rounded-xl" />
            <SkeletonBlock className="h-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPageLoader({
  cardCount = 4,
  metricCount = 4,
  showChart = true,
  showTable = false,
  showCards = true,
  sidePanelCount = 2,
}: {
  cardCount?: number;
  metricCount?: number;
  showCards?: boolean;
  showChart?: boolean;
  showTable?: boolean;
  sidePanelCount?: number;
}) {
  // Compose un loader complet pour une grande page de dashboard.
  // Les sections peuvent etre activees ou reduites selon les besoins de l'ecran.
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <SkeletonBlock className="h-3 w-36 rounded-full" />
          <SkeletonBlock className="mt-4 h-12 w-[22rem] max-w-full rounded-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-[28rem] max-w-full rounded-full" />
        </div>
        <SkeletonBlock className="h-12 w-56 rounded-2xl" />
      </div>

      <MetricCardsSkeleton count={metricCount} />

      <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,1.75fr)_360px]">
        <div className="space-y-8">
          {showChart ? <ChartSkeleton /> : null}
          {showCards ? <CardGridSkeleton count={cardCount} /> : null}
          {showTable ? <TableSkeleton /> : null}
        </div>
        <AsidePanelsSkeleton count={sidePanelCount} />
      </div>
    </div>
  );
}

export function WorkspacePageLoader({
  cardCount = 3,
  sidePanelCount = 2,
  showChart = true,
}: {
  cardCount?: number;
  sidePanelCount?: number;
  showChart?: boolean;
}) {
  // Compose un loader pour les pages de travail basees sur formulaires et panneaux.
  // Le layout imite les espaces de simulation, profil ou edition.
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <SkeletonBlock className="h-3 w-40 rounded-full" />
          <SkeletonBlock className="mt-4 h-12 w-[20rem] max-w-full rounded-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-[24rem] max-w-full rounded-full" />
        </div>
        <div className="flex gap-3">
          <SkeletonBlock className="h-12 w-40 rounded-2xl" />
          <SkeletonBlock className="h-12 w-48 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
          <SkeletonBlock className="h-7 w-44 rounded-xl" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <SkeletonBlock className="h-16 rounded-xl" key={`field-${index}`} />
            ))}
          </div>
          <SkeletonBlock className="mt-6 h-12 w-full rounded-xl" />
        </div>

        <AsidePanelsSkeleton count={sidePanelCount} />
      </div>

      <CardGridSkeleton count={cardCount} withImage={false} />
      {showChart ? <ChartSkeleton compact /> : null}
    </div>
  );
}
