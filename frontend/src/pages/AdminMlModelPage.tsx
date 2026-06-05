// Console de supervision du modele Machine Learning et de ses actions.
import { useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { MetricCard } from "../components/DashboardWidgets";
import { ActionButton } from "../components/PageWidgets";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

export default function AdminMlModelPage() {
  // Affiche l'espace admin de suivi du modele de machine learning.
  // La page synthetise les signaux de sante et les actions de supervision.
  const [message, setMessage] = useState("");

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Modèle Machine Learning"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Gouvernance IA
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Modèle Machine Learning
          </h1>
        </section>

        {message && (
          <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary-container/35 px-5 py-4 text-sm font-semibold text-secondary">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
          <MetricCard label="Modèle utilisé" value="smartestate-ml-v2" />
          <MetricCard label="Dernier entraînement" value="31 mai 2026" />
          <MetricCard label="Données utilisées" value="48 200 lignes" />
          <MetricCard label="MAE" value="74 500 DH" />
          <MetricCard label="Score R²" value="0,91" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_380px] gap-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-headline font-bold text-primary">Variables importantes</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Ville", "Quartier", "Surface", "Type de bien", "Nombre de chambres", "Niveau d'équipement"].map((item) => (
                <div className="rounded-2xl bg-surface-container-low px-5 py-4 font-semibold text-primary" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
              Actions
            </p>
            <div className="mt-6 space-y-3">
              <ActionButton label="Lancer l'entraînement" onClick={() => setMessage("Entraînement lancé sur l'environnement de démonstration.")} />
              <ActionButton label="Tester le modèle" onClick={() => setMessage("Batterie de tests du modèle simulée.")} />
              <ActionButton label="Mettre à jour le modèle" onClick={() => setMessage("La mise à jour du modèle a été planifiée.")} />
              <ActionButton label="Consulter les performances" onClick={() => setMessage("Les métriques de performance ont été rechargées.")} />
            </div>
          </aside>
        </section>
      </main>
    </ImportedPageDocument>
  );
}
