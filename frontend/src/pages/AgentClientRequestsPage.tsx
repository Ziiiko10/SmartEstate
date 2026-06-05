// Demandes clients agent: centralise le suivi commercial d'un portefeuille de prospects.
// La page illustre un tableau de pilotage simple avec statuts editables localement.
import { useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { formatDh } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const initialRequests = [
  { budget: 1_800_000, city: "Casablanca", email: "sara.azzouz@example.ma", id: 1, message: "Je cherche un appartement de 3 chambres à Maarif.", name: "Sara Azzouz", phone: "+212661223344", status: "Nouveau", type: "Achat" },
  { budget: 24_000, city: "Rabat", email: "hamza.elamrani@example.ma", id: 2, message: "Je souhaite louer une villa à Souissi pour 12 mois.", name: "Hamza El Amrani", phone: "+212662556677", status: "En suivi", type: "Location" },
  { budget: 3_400_000, city: "Marrakech", email: "leila.bennani@example.ma", id: 3, message: "Je veux investir dans un bien à fort rendement à Gueliz.", name: "Leila Bennani", phone: "+212663889900", status: "Clôturé", type: "Investissement" },
];

export default function AgentClientRequestsPage() {
  // Affiche les demandes clients affectees a un agent immobilier.
  // Le composant sert surtout de tableau de suivi operationnel.
  const [requests, setRequests] = useState(initialRequests);

  function updateStatus(id: number, status: string) {
    // Met a jour localement le statut d'une demande client.
    // Cette action permet de simuler le cycle de traitement commercial.
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Demandes clients"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Relation client
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Demandes clients
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant">
            Centralisez les demandes, mettez à jour leur statut et facilitez le suivi commercial.
          </p>
        </section>

        <section className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-4 font-bold">Client</th>
                <th className="px-4 py-4 font-bold">Contact</th>
                <th className="px-4 py-4 font-bold">Type</th>
                <th className="px-4 py-4 font-bold">Ville</th>
                <th className="px-4 py-4 font-bold">Budget</th>
                <th className="px-4 py-4 font-bold">Message</th>
                <th className="px-4 py-4 font-bold">Statut</th>
                <th className="px-4 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr className="border-b border-outline-variant/10" key={request.id}>
                  <td className="px-4 py-5 font-bold text-primary">{request.name}</td>
                  <td className="px-4 py-5 text-sm">
                    <p>{request.email}</p>
                    <p className="mt-1 text-on-surface-variant">{request.phone}</p>
                  </td>
                  <td className="px-4 py-5">{request.type}</td>
                  <td className="px-4 py-5">{request.city}</td>
                  <td className="px-4 py-5 font-semibold text-primary">{formatDh(request.budget, true)}</td>
                  <td className="px-4 py-5 max-w-sm text-sm text-on-surface-variant">{request.message}</td>
                  <td className="px-4 py-5">
                    <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white" type="button" onClick={() => updateStatus(request.id, "En suivi")}>
                        Voir
                      </button>
                      <button className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-bold text-primary" type="button" onClick={() => updateStatus(request.id, "Contacté")}>
                        Contacter
                      </button>
                      <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" type="button" onClick={() => updateStatus(request.id, "Clôturé")}>
                        Clôturer
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
