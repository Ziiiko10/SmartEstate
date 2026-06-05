// Liste des annonces ETL avec filtres et pagination de maintenance.
import { useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { MetricCard } from "../components/DashboardWidgets";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";
import { formatDh, formatRelative } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type ListingRecord = {
  city: string;
  district: string;
  external_url: string;
  id: number;
  last_seen_at: string;
  price: number | string | null;
  title: string;
  transaction_type: string;
};

type ListingPayload = {
  count: number;
  next_page: number | null;
  page: number;
  page_size: number;
  previous_page: number | null;
  results: ListingRecord[];
};

const ITEMS_PER_PAGE = 50;

function buildListingsPath(page: number) {
  // Construit le chemin API de la page d'annonces admin demandee.
  // Le helper centralise la pagination pour les appels de donnees.
  return `/market-listings/?page=${page}&page_size=${ITEMS_PER_PAGE}`;
}

function getDefaultStatus(index: number) {
  // Attribue un statut visuel de secours quand l'API ne fournit pas cet etat.
  // La rotation permet de garder une maquette variee sans logique complexe.
  if (index % 3 === 0) {
    return "À valider";
  }

  if (index % 3 === 1) {
    return "Validée";
  }

  return "Signalée";
}

export default function AdminListingsPage() {
  // Affiche la liste admin des annonces ETL avec pagination et actions de supervision.
  // La page enrichit certaines lignes avec un statut de presentation local.
  const { token } = useAuth();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Resynchronise le champ de navigation libre avec la page effective.
    // Cela garde l'input coherent apres tout changement de pagination.
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    // Charge la tranche courante d'annonces ETL depuis le backend.
    // Les statuts de presentation sont initialises au premier passage de chaque ligne.
    let active = true;

    async function loadListings() {
      // Recupere la page demandee puis met a jour la liste visible.
      // Les erreurs reseau sont converties en message lisible pour l'admin.
      setIsLoading(true);
      setError("");

      try {
        const payload = await apiRequest<ListingPayload>(buildListingsPath(page), { token });
        if (!active) {
          return;
        }

        setListings(payload.results ?? []);
        setTotalCount(payload.count ?? 0);
        setStatuses((current) => {
          const nextStatuses = { ...current };
          for (const [index, listing] of (payload.results ?? []).entries()) {
            if (!nextStatuses[listing.id]) {
              nextStatuses[listing.id] = getDefaultStatus(index);
            }
          }
          return nextStatuses;
        });
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Impossible de charger les annonces administrateur."));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadListings();
    return () => {
      active = false;
    };
  }, [page, token]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const counts = useMemo(
    () => ({
      pending: listings.filter((listing) => (statuses[listing.id] ?? "À valider") === "À valider").length,
      reported: listings.filter((listing) => (statuses[listing.id] ?? "À valider") === "Signalée").length,
      validated: listings.filter((listing) => (statuses[listing.id] ?? "À valider") === "Validée").length,
    }),
    [listings, statuses],
  );

  function updateStatus(id: number, status: string) {
    // Met a jour le statut local d'une annonce dans la maquette.
    // Un message de confirmation est affiche pour rendre l'action visible.
    setStatuses((current) => ({ ...current, [id]: status }));
    setMessage(`Le statut de l'annonce a été mis à jour vers "${status}".`);
  }

  function goToPage(nextPage: number) {
    // Borne puis applique un changement de page utilisateur.
    // La navigation reste ainsi limitee au nombre total de pages connu.
    setPage(Math.max(1, Math.min(totalPages, nextPage)));
  }

  function handlePageSubmit() {
    // Valide la saisie libre de page avant d'appliquer la navigation.
    // Une valeur invalide remet simplement l'input sur la page courante.
    const requestedPage = Number(pageInput);
    if (!Number.isFinite(requestedPage) || requestedPage < 1) {
      setPageInput(String(currentPage));
      return;
    }

    goToPage(requestedPage);
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Gestion des annonces"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Contrôle plateforme
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Annonces
          </h1>
        </section>

        {message && (
          <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary-container/35 px-5 py-4 text-sm font-semibold text-secondary">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-error/20 bg-error-container px-5 py-4 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <MetricCard label="Annonces indexées" value={String(totalCount)} />
          <MetricCard label="Page courante" value={`${currentPage} / ${totalPages}`} />
          <MetricCard label="Annonces chargées" value={String(listings.length)} />
          <MetricCard label="Validées (page)" value={String(counts.validated)} />
          <MetricCard label="À valider (page)" value={String(counts.pending)} />
          <MetricCard label="Signalées (page)" value={String(counts.reported)} />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                {totalCount.toLocaleString("fr-MA")} annonces disponibles en base
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Navigation serveur active pour parcourir l’ensemble du catalogue ETL.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="admin-listings-page">
                Aller à la page
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="w-24 rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm font-semibold text-primary"
                  id="admin-listings-page"
                  inputMode="numeric"
                  min={1}
                  onChange={(event) => setPageInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handlePageSubmit();
                    }
                  }}
                  value={pageInput}
                />
                <button
                  className="rounded-lg border border-outline-variant/20 px-4 py-2 text-sm font-bold text-primary"
                  onClick={handlePageSubmit}
                  type="button"
                >
                  Aller
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl bg-surface-container-low px-5 py-10 text-center text-sm font-semibold text-on-surface-variant">
              Chargement des annonces de la page {currentPage}...
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low px-5 py-10 text-center text-sm font-semibold text-on-surface-variant">
              Aucune annonce n’est disponible sur cette page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-4 py-4 font-bold">Titre</th>
                    <th className="px-4 py-4 font-bold">Ville</th>
                    <th className="px-4 py-4 font-bold">Quartier</th>
                    <th className="px-4 py-4 font-bold">Prix</th>
                    <th className="px-4 py-4 font-bold">Type</th>
                    <th className="px-4 py-4 font-bold">Statut</th>
                    <th className="px-4 py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr className="border-b border-outline-variant/10" key={listing.id}>
                      <td className="px-4 py-5">
                        <p className="font-bold text-primary">{listing.title}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">{formatRelative(listing.last_seen_at)}</p>
                      </td>
                      <td className="px-4 py-5">{listing.city}</td>
                      <td className="px-4 py-5">{listing.district || "N/A"}</td>
                      <td className="px-4 py-5 font-semibold text-primary">{formatDh(listing.price, true)}</td>
                      <td className="px-4 py-5">{listing.transaction_type}</td>
                      <td className="px-4 py-5">
                        <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
                          {statuses[listing.id] || "À valider"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          <a
                            className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-bold text-primary"
                            href={listing.external_url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Ouvrir
                          </a>
                          <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white" type="button" onClick={() => updateStatus(listing.id, "Validée")}>
                            Valider
                          </button>
                          <button className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-bold text-primary" type="button" onClick={() => updateStatus(listing.id, "Signalée")}>
                            Signaler
                          </button>
                          <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" type="button" onClick={() => updateStatus(listing.id, "Désactivée")}>
                            Désactiver
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-surface-container-low px-5 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-on-surface-variant">
              Page {currentPage} sur {totalPages} · {totalCount.toLocaleString("fr-MA")} annonces
            </p>
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-outline-variant/20 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => goToPage(currentPage - 1)}
                type="button"
              >
                Précédent
              </button>
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => goToPage(currentPage + 1)}
                type="button"
              >
                Suivant
              </button>
            </div>
          </div>
        </section>
      </main>
    </ImportedPageDocument>
  );
}
