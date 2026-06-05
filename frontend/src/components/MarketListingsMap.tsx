// Carte des annonces: regroupe les biens par zone et colore les quartiers prioritaires.
import { SkeletonBlock } from "./LoadingState";

type MarketMapListing = {
  area_sqm: string | null;
  city: string;
  district: string;
  id: number;
  price: string | null;
  price_per_sqm: number | null;
  source: string;
  title: string;
};

type MapPoint = {
  x: number;
  y: number;
};

type DistrictPoint = {
  averagePricePerSqm: number;
  city: string;
  count: number;
  key: string;
  label: string;
  tier: "expensive" | "standard";
  x: number;
  y: number;
};

type ListingMarker = {
  city: string;
  district: string;
  id: number;
  key: string;
  tier: "expensive" | "standard";
  title: string;
  x: number;
  y: number;
};

type CityLabel = {
  city: string;
  count: number;
  x: number;
  y: number;
};

type MarketMapData = {
  cityLabels: CityLabel[];
  districtPoints: DistrictPoint[];
  expensiveDistrictCount: number;
  listingsCount: number;
  listingMarkers: ListingMarker[];
  topDistricts: DistrictPoint[];
};

const MOROCCO_CITY_COORDINATES: Record<string, MapPoint> = {
  agadir: { x: 31, y: 77 },
  beni_mellal: { x: 53, y: 53 },
  beni_mellal_: { x: 53, y: 53 },
  berrechid: { x: 33, y: 43 },
  casablanca: { x: 29, y: 38 },
  el_jadida: { x: 24, y: 46 },
  errachidia: { x: 73, y: 60 },
  essaouira: { x: 24, y: 63 },
  fes: { x: 52, y: 30 },
  fès: { x: 52, y: 30 },
  kénitra: { x: 31, y: 29 },
  kenitra: { x: 31, y: 29 },
  khouribga: { x: 45, y: 47 },
  larache: { x: 24, y: 20 },
  marrakech: { x: 43, y: 63 },
  meknes: { x: 46, y: 34 },
  mohammedia: { x: 31, y: 36 },
  nador: { x: 76, y: 17 },
  ouarzazate: { x: 57, y: 73 },
  oujda: { x: 82, y: 29 },
  rabat: { x: 30, y: 31 },
  safi: { x: 27, y: 56 },
  salé: { x: 31, y: 31 },
  sale: { x: 31, y: 31 },
  settat: { x: 39, y: 47 },
  tanger: { x: 23, y: 12 },
  tangier: { x: 23, y: 12 },
  temara: { x: 28, y: 33 },
  tetouan: { x: 30, y: 15 },
  tétouan: { x: 30, y: 15 },
};

function normalizeMapKey(value: string) {
  // Normalise une ville ou un quartier pour les cles de dictionnaire.
  // Les accents et espaces sont retires afin de stabiliser les correspondances.
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function hashString(value: string) {
  // Produit un hash numerique simple a partir d'une chaine.
  // Il sert a generer des positions pseudo-stables sur la carte.
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function clamp(value: number, min: number, max: number) {
  // Borne une coordonnee ou une taille dans une plage autorisee.
  // Cela evite que des marqueurs sortent du canevas de la carte.
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: number | string | null | undefined) {
  // Convertit une valeur numerique heterogene en nombre exploitable.
  // Les entrees vides ou invalides reviennent simplement a 0.
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolvePricePerSqm(listing: MarketMapListing) {
  // Determine le prix au metre carre d'une annonce pour la cartographie.
  // La valeur explicite est privilegiee, avec repli sur prix / surface si possible.
  const explicitValue = toNumber(listing.price_per_sqm);
  if (explicitValue > 0) {
    return explicitValue;
  }

  const area = toNumber(listing.area_sqm);
  const price = toNumber(listing.price);
  if (area <= 0 || price <= 0) {
    return 0;
  }

  return price / area;
}

function formatMoney(value: number) {
  // Formate un montant entier en dirhams pour les info-bulles et panneaux.
  // Le rendu reste volontairement compact pour la lecture visuelle.
  return `${Math.round(value).toLocaleString("fr-MA")} DH`;
}

function getCityAnchor(city: string) {
  // Retourne le point de reference d'une ville sur la carte stylisee.
  // Une ancre pseudo-aleatoire stable est generee si la ville n'est pas connue.
  const key = normalizeMapKey(city);
  const knownAnchor = MOROCCO_CITY_COORDINATES[key];

  if (knownAnchor) {
    return knownAnchor;
  }

  const seed = hashString(key || "maroc");
  return {
    x: 22 + (seed % 52),
    y: 18 + (Math.floor(seed / 97) % 62),
  };
}

function getDistrictAnchor(city: string, district: string) {
  // Calcule la position approximate d'un quartier autour de l'ancre de sa ville.
  // Le decalage est stable grace a un hash base sur ville et district.
  const cityAnchor = getCityAnchor(city);
  const districtKey = `${normalizeMapKey(city)}|${normalizeMapKey(district || "sans_district")}`;
  const seed = hashString(districtKey);
  const angle = ((seed % 360) * Math.PI) / 180;
  const radius = district ? 2.4 + (seed % 4) : 0;

  return {
    x: clamp(cityAnchor.x + Math.cos(angle) * radius, 10, 90),
    y: clamp(cityAnchor.y + Math.sin(angle) * radius, 8, 92),
  };
}

function getListingAnchor(listing: MarketMapListing, districtPoint: MapPoint) {
  // Place une annonce a proximite de son quartier sans superposer tous les points.
  // Le leger deplacement repose sur un hash deterministe de l'annonce.
  const seed = hashString(`${listing.id}|${listing.title}|${listing.source}`);
  const angle = ((seed % 360) * Math.PI) / 180;
  const radius = 0.8 + (seed % 5) * 0.55;

  return {
    x: clamp(districtPoint.x + Math.cos(angle) * radius, 9, 91),
    y: clamp(districtPoint.y + Math.sin(angle) * radius, 7, 93),
  };
}

function buildMarketMapData(listings: MarketMapListing[]): MarketMapData {
  // Agrege les annonces en villes, quartiers et marqueurs exploitables par la carte.
  // Cette preparation calcule aussi les zones premium selon le prix moyen au m².
  const districtAccumulator = new Map<
    string,
    {
      city: string;
      count: number;
      district: string;
      pricePerSqmTotal: number;
      x: number;
      y: number;
    }
  >();
  const cityAccumulator = new Map<string, { city: string; count: number; x: number; y: number }>();

  for (const listing of listings) {
    const city = listing.city.trim() || "Ville non précisée";
    const district = listing.district.trim() || "Sans district";
    const districtKey = `${normalizeMapKey(city)}|${normalizeMapKey(district)}`;
    const districtAnchor = getDistrictAnchor(city, district);
    const pricePerSqm = resolvePricePerSqm(listing);
    const currentDistrict = districtAccumulator.get(districtKey);

    if (currentDistrict) {
      currentDistrict.count += 1;
      currentDistrict.pricePerSqmTotal += pricePerSqm;
    } else {
      districtAccumulator.set(districtKey, {
        city,
        count: 1,
        district,
        pricePerSqmTotal: pricePerSqm,
        x: districtAnchor.x,
        y: districtAnchor.y,
      });
    }

    const cityKey = normalizeMapKey(city);
    const currentCity = cityAccumulator.get(cityKey);
    if (currentCity) {
      currentCity.count += 1;
    } else {
      const cityAnchor = getCityAnchor(city);
      cityAccumulator.set(cityKey, {
        city,
        count: 1,
        x: cityAnchor.x,
        y: cityAnchor.y,
      });
    }
  }

  const districtPoints = Array.from(districtAccumulator.entries()).map(([key, value]) => ({
    averagePricePerSqm:
      value.count > 0 ? value.pricePerSqmTotal / value.count : 0,
    city: value.city,
    count: value.count,
    key,
    label: value.district,
    tier: "standard" as const,
    x: value.x,
    y: value.y,
  }));

  const rankedDistricts = [...districtPoints].sort((left, right) => {
    if (right.averagePricePerSqm !== left.averagePricePerSqm) {
      return right.averagePricePerSqm - left.averagePricePerSqm;
    }

    return right.count - left.count;
  });
  const expensiveThresholdCount =
    rankedDistricts.length === 0 ? 0 : Math.max(1, Math.ceil(rankedDistricts.length * 0.3));
  const expensiveDistrictKeys = new Set(
    rankedDistricts.slice(0, expensiveThresholdCount).map((district) => district.key),
  );

  const enrichedDistrictPoints = districtPoints
    .map((district) => {
      const tier: DistrictPoint["tier"] = expensiveDistrictKeys.has(district.key)
        ? "expensive"
        : "standard";

      return {
        ...district,
        tier,
      };
    })
    .sort((left, right) => left.averagePricePerSqm - right.averagePricePerSqm);

  const districtByKey = new Map(enrichedDistrictPoints.map((district) => [district.key, district]));

  const listingMarkers = listings.slice(0, 120).map((listing) => {
    const city = listing.city.trim() || "Ville non précisée";
    const district = listing.district.trim() || "Sans district";
    const districtKey = `${normalizeMapKey(city)}|${normalizeMapKey(district)}`;
    const districtPoint =
      districtByKey.get(districtKey) ??
      ({
        tier: "standard",
        x: getDistrictAnchor(city, district).x,
        y: getDistrictAnchor(city, district).y,
      } satisfies Pick<DistrictPoint, "tier" | "x" | "y">);
    const markerAnchor = getListingAnchor(listing, districtPoint);

    return {
      city,
      district,
      id: listing.id,
      key: `${listing.id}-${districtKey}`,
      tier: districtPoint.tier,
      title: listing.title,
      x: markerAnchor.x,
      y: markerAnchor.y,
    };
  });

  const cityLabels = Array.from(cityAccumulator.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  return {
    cityLabels,
    districtPoints: enrichedDistrictPoints,
    expensiveDistrictCount: expensiveDistrictKeys.size,
    listingsCount: listingMarkers.length,
    listingMarkers,
    topDistricts: rankedDistricts
      .slice(0, 5)
      .map((district) => {
        const tier: DistrictPoint["tier"] = expensiveDistrictKeys.has(district.key)
          ? "expensive"
          : "standard";

        return {
          ...district,
          tier,
        };
      }),
  };
}

function LegendBadge({
  colorClassName,
  label,
}: {
  colorClassName: string;
  label: string;
}) {
  // Rend une pastille de legende pour expliquer les couleurs de la carte.
  // Le composant est volontairement compact pour se superposer au canevas.
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClassName}`} />
      <span>{label}</span>
    </div>
  );
}

function MapMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  // Affiche un KPI synthétique lie a la carte du marche.
  // Ces cartes completent la lecture visuelle avec quelques chiffres cles.
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{label}</p>
      <p className="mt-3 text-2xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}

export default function MarketListingsMap({
  error,
  isFallbackData = false,
  isLoading,
  listings,
  selectedCity,
}: {
  error?: string;
  isFallbackData?: boolean;
  isLoading: boolean;
  listings: MarketMapListing[];
  selectedCity?: string;
}) {
  // Affiche une carte stylisee des annonces ETL par villes et quartiers.
  // Le composant gere aussi les etats vide, chargement et fallback de donnees.
  if (isLoading) {
    return (
      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <SkeletonBlock className="h-5 w-40 rounded-full" />
          <SkeletonBlock className="mt-4 h-10 w-8/12 rounded-2xl" />
          <SkeletonBlock className="mt-4 h-4 w-10/12 rounded-full" />
          <SkeletonBlock className="mt-6 h-[480px] rounded-[28px]" />
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-28 rounded-[28px]" />
          <SkeletonBlock className="h-28 rounded-[28px]" />
          <SkeletonBlock className="h-56 rounded-[28px]" />
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section className="mb-8 rounded-[28px] bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Carte du marché</p>
        <h2 className="mt-3 text-3xl font-headline font-extrabold text-primary">
          Aucune donnée cartographiable
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          Modifiez les filtres pour afficher des annonces ETL et colorer les quartiers les plus chers.
        </p>
      </section>
    );
  }

  const mapData = buildMarketMapData(listings);
  const visibleCityLabel =
    selectedCity && selectedCity.trim() ? `Focus actuel : ${selectedCity}` : "Vue nationale";

  return (
    <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
      <div className="rounded-[28px] bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Carte du marché</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-primary">
              Annonces et quartiers les plus chers
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Les halos indiquent les quartiers premium selon le prix moyen au m². Les petits points
              représentent les annonces ETL visibles avec les filtres courants.
            </p>
          </div>
          <div className="inline-flex rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold text-on-surface-variant">
            {visibleCityLabel}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/70 bg-[radial-gradient(circle_at_top,_rgba(14,165,164,0.18),_transparent_36%),linear-gradient(180deg,_#f8fbff_0%,_#eef6f5_100%)]">
          <div className="p-4 md:p-6">
            <div className="relative overflow-hidden rounded-[24px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.82))] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <svg
                aria-label="Carte de repérage des annonces ETL"
                className="h-[500px] w-full"
                role="img"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient id="moroccoFill" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#dceef1" />
                    <stop offset="100%" stopColor="#bfd9d6" />
                  </linearGradient>
                </defs>

                <g opacity="0.12" stroke="#0f172a" strokeDasharray="1.2 2.6">
                  <path d="M18 10 L18 90" />
                  <path d="M34 10 L34 90" />
                  <path d="M50 10 L50 90" />
                  <path d="M66 10 L66 90" />
                  <path d="M82 10 L82 90" />
                  <path d="M10 18 L90 18" />
                  <path d="M10 34 L90 34" />
                  <path d="M10 50 L90 50" />
                  <path d="M10 66 L90 66" />
                  <path d="M10 82 L90 82" />
                </g>

                <path
                  d="M21 8 L25 9 L28 11 L31 10 L35 12 L39 16 L42 16 L46 14 L48 17 L52 16 L55 19 L58 21 L62 22 L65 26 L69 28 L71 33 L74 38 L73 43 L69 49 L67 55 L63 59 L61 65 L57 70 L56 77 L51 84 L46 88 L41 87 L37 81 L33 78 L31 71 L27 67 L24 60 L21 56 L19 50 L17 45 L16 37 L14 31 L15 24 L17 18 L19 12 Z"
                  fill="url(#moroccoFill)"
                  stroke="#8fb4b0"
                  strokeWidth="1.1"
                />
                <path
                  d="M24 17 L29 18 L34 22 L39 21 L43 24 L49 24 L55 28 L60 31 L62 36 L60 42 L57 48 L53 55 L50 60 L46 66 L42 72 L38 73 L34 68 L30 63 L27 56 L24 49 L22 42 L21 34 L22 26 Z"
                  fill="none"
                  opacity="0.18"
                  stroke="#4b5563"
                  strokeWidth="0.8"
                />

                {mapData.districtPoints.map((district) => (
                  <g key={district.key}>
                    <title>
                      {district.label}, {district.city} - {district.count} annonces -{" "}
                      {formatMoney(district.averagePricePerSqm)}/m²
                    </title>
                    <circle
                      cx={district.x}
                      cy={district.y}
                      fill={district.tier === "expensive" ? "#fb7185" : "#2dd4bf"}
                      opacity={district.tier === "expensive" ? 0.26 : 0.18}
                      r={clamp(2.8 + district.count * 0.28, 3.2, 9.6)}
                    />
                    <circle
                      cx={district.x}
                      cy={district.y}
                      fill={district.tier === "expensive" ? "#e11d48" : "#0f766e"}
                      opacity={0.92}
                      r={clamp(0.95 + district.count * 0.08, 1.1, 2.6)}
                    />
                  </g>
                ))}

                {mapData.listingMarkers.map((marker) => (
                  <g key={marker.key}>
                    <title>
                      {marker.title} - {marker.district}, {marker.city}
                    </title>
                    <circle
                      cx={marker.x}
                      cy={marker.y}
                      fill={marker.tier === "expensive" ? "#9f1239" : "#0f172a"}
                      r={0.55}
                      stroke="#ffffff"
                      strokeWidth={0.22}
                    />
                  </g>
                ))}

                {mapData.cityLabels.map((city) => (
                  <g key={city.city}>
                    <circle cx={city.x} cy={city.y} fill="#1f2937" opacity="0.22" r="0.8" />
                    <text
                      fill="#334155"
                      fontSize="2.3"
                      fontWeight="700"
                      x={clamp(city.x + 1.2, 6, 89)}
                      y={clamp(city.y - 1.4, 7, 96)}
                    >
                      {city.city}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                <LegendBadge colorClassName="bg-rose-600" label="Quartiers les plus chers" />
                <LegendBadge colorClassName="bg-teal-600" label="Autres quartiers" />
                <LegendBadge colorClassName="bg-slate-900" label="Annonces ETL" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <MapMetricCard
            label="Annonces cartographiées"
            value={String(mapData.listingsCount)}
          />
          <MapMetricCard
            label="Quartiers premium"
            value={String(mapData.expensiveDistrictCount)}
          />
          <MapMetricCard
            label="Quartiers visibles"
            value={String(mapData.districtPoints.length)}
          />
          <MapMetricCard
            label="Villes actives"
            value={String(mapData.cityLabels.length)}
          />
        </section>

        <section className="rounded-[28px] bg-primary p-6 text-white shadow-[0_18px_40px_rgba(26,35,126,0.18)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
            Quartiers les plus chers
          </p>
          <div className="mt-5 space-y-4">
            {mapData.topDistricts.length === 0 ? (
              <p className="text-sm text-primary-fixed">
                Pas assez de données pour calculer un classement fiable.
              </p>
            ) : (
              mapData.topDistricts.map((district, index) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4"
                  key={district.key}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-fixed-dim">
                        Top {index + 1}
                      </p>
                      <p className="mt-2 text-lg font-headline font-extrabold text-white">
                        {district.label}
                      </p>
                      <p className="mt-1 text-sm text-primary-fixed">{district.city}</p>
                    </div>
                    <span className="rounded-full bg-white/14 px-3 py-2 text-xs font-bold text-white">
                      {district.count} annonces
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                    <span className="text-primary-fixed">Prix moyen / m²</span>
                    <span className="font-bold text-white">
                      {formatMoney(district.averagePricePerSqm)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">Précision</p>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
            Les positions sont approximatives et déduites de la ville et du quartier, car les annonces ETL
            n&apos;embarquent pas encore de coordonnées GPS exactes.
          </p>
          {isFallbackData ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              La carte utilise temporairement les annonces visibles de la page courante.
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>
      </aside>
    </section>
  );
}
