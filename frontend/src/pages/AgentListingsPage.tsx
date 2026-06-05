import { useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { formatDh } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const initialListings = [
  { city: "Casablanca", district: "Maarif", id: 1, price: 2_450_000, status: "Active", surface: 162, title: "Appartement moderne près du Twin Center", type: "Appartement" },
  { city: "Rabat", district: "Agdal", id: 2, price: 3_200_000, status: "Brouillon", surface: 210, title: "Villa familiale avec jardin", type: "Villa" },
  { city: "Marrakech", district: "Gueliz", id: 3, price: 1_980_000, status: "Suspendue", surface: 124, title: "Appartement rénové pour location premium", type: "Appartement" },
];

export default function AgentListingsPage() {
  const [listings, setListings] = useState(initialListings);
  const [message, setMessage] = useState("");

  function updateStatus(id: number, nextStatus: string) {
    setListings((current) =>
      current.map((listing) => (listing.id === id ? { ...listing, status: nextStatus } : listing)),
    );
    setMessage(`Le statut de l'annonce a été mis à jour vers "${nextStatus}".`);
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Mes annonces"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Espace agent
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Mes annonces
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant">
            Gérez rapidement vos biens publiés, suivez leur statut et préparez les prochaines mises en ligne.
          </p>
        </section>

        {message && (
          <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary-container/35 px-5 py-4 text-sm font-semibold text-secondary">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <MetricCard label="Annonces publiées" value={String(listings.length)} />
          <MetricCard label="Annonces actives" value={String(listings.filter((listing) => listing.status === "Active").length)} />
          <MetricCard label="Annonces à relancer" value={String(listings.filter((listing) => listing.status !== "Active").length)} />
        </section>

        <section className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-4 font-bold">Titre</th>
                <th className="px-4 py-4 font-bold">Ville</th>
                <th className="px-4 py-4 font-bold">Quartier</th>
                <th className="px-4 py-4 font-bold">Type</th>
                <th className="px-4 py-4 font-bold">Surface</th>
                <th className="px-4 py-4 font-bold">Prix</th>
                <th className="px-4 py-4 font-bold">Statut</th>
                <th className="px-4 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr className="border-b border-outline-variant/10" key={listing.id}>
                  <td className="px-4 py-5 font-bold text-primary">{listing.title}</td>
                  <td className="px-4 py-5">{listing.city}</td>
                  <td className="px-4 py-5">{listing.district}</td>
                  <td className="px-4 py-5">{listing.type}</td>
                  <td className="px-4 py-5">{listing.surface} m²</td>
                  <td className="px-4 py-5 font-semibold text-primary">{formatDh(listing.price, true)}</td>
                  <td className="px-4 py-5">
                    <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white" type="button" onClick={() => setMessage(`Préparation de la modification: ${listing.title}`)}>
                        Modifier
                      </button>
                      <button className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-bold text-primary" type="button" onClick={() => updateStatus(listing.id, listing.status === "Active" ? "Suspendue" : "Active")}>
                        {listing.status === "Active" ? "Désactiver" : "Activer"}
                      </button>
                      <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" type="button" onClick={() => updateStatus(listing.id, "Archivée")}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </ImportedPageDocument>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-3xl font-headline font-extrabold text-primary">{value}</p>
    </div>
  );
}
