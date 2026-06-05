// Administration des utilisateurs: recherche, filtres et mise a jour des comptes.
import { useEffect, useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { apiRequest, getErrorMessage } from "../lib/api";
import { formatDateTime } from "../lib/formatters";
import { getRoleLabel, USER_ROLES } from "../lib/roles";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type ManagedUser = {
  created_at: string;
  email: string;
  full_name: string;
  id: number;
  is_active: boolean;
  phone_number: string;
  role: string;
};

// Pilote la liste des utilisateurs, les filtres d'administration et les mises a jour rapides.
export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  // Charge les comptes visibles au montage afin d'alimenter le tableau d'administration.
  useEffect(() => {
    let active = true;

    // Recupere la liste brute des utilisateurs depuis l'API securisee.
    async function loadUsers() {
      try {
        const payload = await apiRequest<ManagedUser[]>("/users/", { token });
        if (active) {
          setUsers(payload);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Impossible de charger les utilisateurs."));
        }
      }
    }

    void loadUsers();
    return () => {
      active = false;
    };
  }, [token]);

  // Combine recherche texte et filtre de role pour n'afficher que les comptes utiles.
  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      if (selectedRole !== "all" && user.role !== selectedRole) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [user.full_name, user.email, user.phone_number, user.role].join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [query, selectedRole, users]);

  // Applique une modification partielle sur un compte puis resynchronise la ligne locale.
  async function patchUser(id: number, payload: Partial<ManagedUser>) {
    setPendingUserId(id);
    setMessage("");
    setError("");

    try {
      const updatedUser = await apiRequest<ManagedUser>(`/users/${id}/`, {
        body: payload,
        method: "PATCH",
        token,
      });

      setUsers((current) => current.map((user) => (user.id === id ? updatedUser : user)));
      setMessage("Le compte utilisateur a été mis à jour.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Impossible de mettre à jour cet utilisateur."));
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Gestion des utilisateurs"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Administration
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Utilisateurs
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

        <section className="mb-8 rounded-2xl bg-white p-5 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Recherche
              </span>
              <input
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nom, email, téléphone..."
                type="text"
                value={query}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Rôle
              </span>
              <select
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => setSelectedRole(event.target.value)}
                value={selectedRole}
              >
                <option value="all">Tous</option>
                <option value={USER_ROLES.UTILISATEUR_SIMPLE}>Utilisateur simple</option>
                <option value={USER_ROLES.AGENT_IMMOBILIER}>Agent immobilier</option>
                <option value={USER_ROLES.ADMINISTRATEUR}>Administrateur</option>
              </select>
            </label>
          </div>
        </section>

        <section className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-4 font-bold">Nom</th>
                <th className="px-4 py-4 font-bold">Email</th>
                <th className="px-4 py-4 font-bold">Rôle</th>
                <th className="px-4 py-4 font-bold">Inscription</th>
                <th className="px-4 py-4 font-bold">Statut</th>
                <th className="px-4 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr className="border-b border-outline-variant/10" key={user.id}>
                  <td className="px-4 py-5 font-bold text-primary">{user.full_name}</td>
                  <td className="px-4 py-5">{user.email}</td>
                  <td className="px-4 py-5">
                    <select
                      className="rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm"
                      disabled={pendingUserId === user.id}
                      onChange={(event) => void patchUser(user.id, { role: event.target.value })}
                      value={user.role}
                    >
                      <option value={USER_ROLES.UTILISATEUR_SIMPLE}>Utilisateur simple</option>
                      <option value={USER_ROLES.AGENT_IMMOBILIER}>Agent immobilier</option>
                      <option value={USER_ROLES.ADMINISTRATEUR}>Administrateur</option>
                    </select>
                  </td>
                  <td className="px-4 py-5 text-sm text-on-surface-variant">{formatDateTime(user.created_at)}</td>
                  <td className="px-4 py-5">
                    <span className={user.is_active ? "rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-secondary" : "rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant"}>
                      {user.is_active ? "Actif" : "Bloqué"}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        disabled={pendingUserId === user.id}
                        type="button"
                        onClick={() => void patchUser(user.id, { is_active: !user.is_active })}
                      >
                        {user.is_active ? "Bloquer" : "Débloquer"}
                      </button>
                      <button
                        className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-bold text-primary"
                        disabled
                        type="button"
                      >
                        {getRoleLabel(user.role)}
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
