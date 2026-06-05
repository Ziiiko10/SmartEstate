// Validation des agents: charge les profils, les rattachements et les actions de moderation.
import { useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";
import { USER_ROLES } from "../lib/roles";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type ManagedUser = {
  email: string;
  full_name: string;
  id: number;
  is_active: boolean;
  phone_number: string;
  role: string;
};

type MembershipRecord = {
  organization_name: string;
  user_email: string;
};

// Centralise la moderation des comptes agents immobiliers et leur statut d'activation.
export default function AdminAgentsPage() {
  const { token } = useAuth();
  const [agents, setAgents] = useState<ManagedUser[]>([]);
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Charge les agents et leurs rattachements d'organisation pour afficher le contexte commercial.
  useEffect(() => {
    let active = true;

    // Recupere en parallele les comptes agents et les memberships associes.
    async function loadData() {
      try {
        const [agentPayload, membershipPayload] = await Promise.all([
          apiRequest<ManagedUser[]>(`/users/?role=${USER_ROLES.AGENT_IMMOBILIER}`, { token }),
          apiRequest<MembershipRecord[]>("/team-memberships/", { token }),
        ]);

        if (!active) {
          return;
        }

        setAgents(agentPayload);
        setMemberships(membershipPayload);
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Impossible de charger les agents immobiliers."));
        }
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [token]);

  // Construit une table de correspondance email -> organisation pour l'affichage des cartes.
  const agencyByEmail = useMemo(() => {
    const mapping = new Map<string, string>();
    memberships.forEach((membership) => {
      if (!mapping.has(membership.user_email)) {
        mapping.set(membership.user_email, membership.organization_name);
      }
    });
    return mapping;
  }, [memberships]);

  // Met a jour le compte agent cible puis reflete le changement dans l'interface.
  async function patchAgent(id: number, payload: Partial<ManagedUser>, successMessage: string) {
    setMessage("");
    setError("");

    try {
      const updatedAgent = await apiRequest<ManagedUser>(`/users/${id}/`, {
        body: payload,
        method: "PATCH",
        token,
      });
      setAgents((current) => current.map((agent) => (agent.id === id ? updatedAgent : agent)));
      setMessage(successMessage);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de mettre à jour cet agent."));
    }
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Agents immobiliers"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Validation réseau
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Agents immobiliers
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

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <article className="rounded-2xl bg-white p-6 shadow-sm" key={agent.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                    {agencyByEmail.get(agent.email) || "Agence non renseignée"}
                  </p>
                  <h2 className="mt-2 text-2xl font-headline font-extrabold text-primary">{agent.full_name}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">{agent.email}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{agent.phone_number || "Téléphone non renseigné"}</p>
                </div>
                <span className={agent.is_active ? "rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-secondary" : "rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant"}>
                  {agent.is_active ? "Validé" : "Désactivé"}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white" type="button" onClick={() => void patchAgent(agent.id, { is_active: true }, "Agent validé avec succès.")}>
                  Valider
                </button>
                <button className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-bold text-primary" type="button" onClick={() => void patchAgent(agent.id, { is_active: false }, "Agent désactivé.")}>
                  Désactiver
                </button>
                <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" type="button" onClick={() => void patchAgent(agent.id, { role: USER_ROLES.UTILISATEUR_SIMPLE }, "Le rôle a été réaffecté en utilisateur simple.")}>
                  Refuser
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </ImportedPageDocument>
  );
}
