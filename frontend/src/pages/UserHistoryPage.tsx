// Historique utilisateur: resume quelques actions recentes visibles dans le parcours.
// Cette page reste pour l'instant basee sur des donnees locales de demonstration.
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { formatDateTime, formatDh } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const historyEntries = [
  {
    amount: 2_350_000,
    city: "Casablanca",
    date: "2026-05-31T15:45:00Z",
    icon: "calculate",
    title: "Estimation d'un appartement à Maarif",
    type: "Estimation",
  },
  {
    amount: 6.8,
    city: "Rabat",
    date: "2026-05-30T11:10:00Z",
    icon: "query_stats",
    title: "Simulation locative à Agdal",
    type: "Rendement net",
  },
  {
    amount: 1_920_000,
    city: "Marrakech",
    date: "2026-05-28T09:20:00Z",
    icon: "travel_explore",
    title: "Consultation du marché à Gueliz",
    type: "Veille marché",
  },
];

export default function UserHistoryPage() {
  // Affiche un historique simple des actions et analyses utilisateur.
  // Cette version repose sur des donnees maquette pour illustrer le flux.
  const { user } = useAuth();

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Historique"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Suivi personnel
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Historique
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant">
            Cet espace récapitule les dernières actions visibles dans votre parcours utilisateur. Il peut être
            enrichi progressivement lorsque davantage de sauvegardes backend seront disponibles.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_360px] gap-8">
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-headline font-bold text-primary">
                Dernières actions de {user?.full_name?.split(" ")[0] || "votre compte"}
              </h2>
              <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {historyEntries.length} entrées
              </span>
            </div>

            <div className="space-y-4">
              {historyEntries.map((entry) => (
                <article className="rounded-2xl bg-surface-container-low p-5" key={`${entry.title}-${entry.date}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                      <span className="material-symbols-outlined">{entry.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                            {entry.type} · {entry.city}
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-primary">{entry.title}</h3>
                        </div>
                        <div className="rounded-xl bg-white px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            Valeur
                          </p>
                          <p className="mt-1 font-bold text-primary">
                            {entry.type === "Rendement net" ? `${entry.amount}%` : formatDh(entry.amount, true)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-on-surface-variant">
                        Consulté le {formatDateTime(entry.date)}.
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                Lecture rapide
              </p>
              <h2 className="mt-3 text-2xl font-headline font-extrabold">Historique simplifié</h2>
              <p className="mt-4 text-sm leading-relaxed text-primary-fixed">
                Les éléments affichés ici vous aident à reprendre rapidement une estimation, une simulation ou
                une veille marché récente.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-headline font-bold text-primary">Prochaine évolution possible</h3>
              <div className="mt-5 space-y-4 text-sm text-on-surface-variant">
                <p>Ajout d'une sauvegarde persistante des estimations utilisateur.</p>
                <p>Historique détaillé des simulations par ville et quartier.</p>
                <p>Export des actions récentes en PDF ou Excel.</p>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </ImportedPageDocument>
  );
}
