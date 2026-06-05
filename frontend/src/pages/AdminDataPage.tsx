// Vue de controle pour les donnees geographiques et la couverture des filtres.
import { useEffect, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { MetricCard } from "../components/DashboardWidgets";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type FiltersPayload = {
  cities: { count: number; label: string }[];
  districts: { count: number; label: string }[];
};

export default function AdminDataPage() {
  // Affiche la console admin de donnees immobilieres et de synchronisation ETL.
  // La page permet d'observer les filtres disponibles et de lancer des imports.
  const { token } = useAuth();
  const [filters, setFilters] = useState<FiltersPayload>({ cities: [], districts: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    // Charge les villes et quartiers exposes par les facettes backend.
    // Les donnees alimentent ensuite les cartes de couverture de cette page.
    let active = true;

    async function loadData() {
      // Recupere le payload de filtres depuis l'API d'annonces ETL.
      // En cas d'echec, un message lisible est prepare pour l'administrateur.
      try {
        const payload = await apiRequest<FiltersPayload>("/market-listings/filters/", { token });
        if (active) {
          setFilters(payload);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Impossible de charger les données immobilières."));
        }
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Données immobilières"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Qualité des données
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Données immobilières
          </h1>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <MetricCard label="Villes couvertes" value={String(filters.cities.length)} />
          <MetricCard label="Quartiers suivis" value={String(filters.districts.length)} />
          <MetricCard label="Valeurs manquantes à revoir" value="17" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_360px] gap-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-headline font-bold text-primary">Actions de maintenance</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Importer des données",
                "Vérifier les doublons",
                "Corriger les valeurs manquantes",
                "Supprimer les incohérences",
              ].map((item) => (
                <button
                  className="rounded-2xl bg-surface-container-low px-5 py-5 text-left text-sm font-bold text-primary"
                  key={item}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
              Couverture
            </p>
            <h2 className="mt-3 text-2xl font-headline font-extrabold">Top zones surveillées</h2>
            <div className="mt-6 space-y-3 text-sm">
              {filters.cities.slice(0, 5).map((city) => (
                <div className="rounded-xl bg-white/10 px-4 py-3" key={city.label}>
                  {city.label} · {city.count} annonces
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </ImportedPageDocument>
  );
}
