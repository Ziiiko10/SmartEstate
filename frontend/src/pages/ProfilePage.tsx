import { useEffect, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../lib/api";
import { getRoleLabel, getRoleNavigation } from "../lib/roles";
import { formatDateTime } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

export default function ProfilePage() {
  const { token, updateProfile, user } = useAuth();
  const navigation = getRoleNavigation(user?.role);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
    setPhoneNumber(user?.phone_number ?? "");
  }, [user?.email, user?.full_name, user?.phone_number]);

  const isDemoProfile = !token;
  const trimmedFullName = fullName.trim();
  const trimmedEmail = email.trim();
  const trimmedPhoneNumber = phoneNumber.trim();
  const hasChanges =
    trimmedFullName !== (user?.full_name ?? "") ||
    trimmedEmail !== (user?.email ?? "") ||
    trimmedPhoneNumber !== (user?.phone_number ?? "");

  async function handleSave() {
    setError(null);
    setSuccess(null);

    if (!trimmedFullName) {
      setError("Le nom complet est obligatoire.");
      return;
    }

    if (!trimmedEmail) {
      setError("L'adresse email est obligatoire.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        email: trimmedEmail,
        full_name: trimmedFullName,
        phone_number: trimmedPhoneNumber,
      });
      setSuccess("Vos informations ont ete mises a jour.");
    } catch (submissionError) {
      setError(getErrorMessage(submissionError, "Impossible de mettre a jour le profil pour le moment."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setFullName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
    setPhoneNumber(user?.phone_number ?? "");
    setError(null);
    setSuccess(null);
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Profil"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8 flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Mon espace
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Profil
          </h1>
          <p className="max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant">
            Retrouvez ici les informations de votre compte et les accès actuellement associés à votre rôle.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_360px] gap-8">
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-headline font-extrabold text-white">
                {user?.full_name?.slice(0, 1).toUpperCase() || "S"}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
                  {getRoleLabel(user?.role)}
                </p>
                <h2 className="mt-2 text-3xl font-headline font-extrabold text-primary">
                  {user?.full_name || "Compte SmartEstate"}
                </h2>
                <p className="mt-1 text-on-surface-variant">{user?.email}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableInfoCard
                disabled={isDemoProfile || isSubmitting}
                label="Nom complet"
                placeholder="Votre nom complet"
                required
                value={fullName}
                onChange={setFullName}
              />
              <EditableInfoCard
                disabled={isDemoProfile || isSubmitting}
                label="Adresse email"
                placeholder="nom@exemple.ma"
                required
                type="email"
                value={email}
                onChange={setEmail}
              />
              <EditableInfoCard
                disabled={isDemoProfile || isSubmitting}
                label="Téléphone"
                placeholder="+212600000000"
                type="tel"
                value={phoneNumber}
                onChange={setPhoneNumber}
              />
              <InfoCard label="Statut" value={user?.is_active ? "Compte actif" : "Compte désactivé"} />
              <InfoCard label="Création du compte" value={formatDateTime(user?.created_at || "")} />
              <InfoCard label="Parcours recommandé" value={navigation[0]?.label || "Tableau de bord"} />
            </div>

            <section className="mt-8 rounded-2xl bg-surface-container-low p-6">
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-2xl font-headline font-bold text-primary">Informations du compte</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                    Modifiez directement vos champs de profil ci-dessus.
                  </p>
                </div>
              </div>

              {isDemoProfile ? (
                <div className="mt-6 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-secondary">
                  Le profil de demonstration n&apos;est pas modifiable. Connectez-vous avec un compte reel pour enregistrer des changements.
                </div>
              ) : null}

              {error ? (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="mt-6 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-secondary">
                  {success}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  className="rounded-xl border border-outline-variant/20 bg-white px-5 py-3 text-sm font-bold text-on-surface transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isDemoProfile || isSubmitting || !hasChanges}
                  type="button"
                  onClick={resetForm}
                >
                  Annuler
                </button>
                <button
                  className="rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isDemoProfile || isSubmitting || !hasChanges}
                  type="button"
                  onClick={() => {
                    void handleSave();
                  }}
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                Accès actifs
              </p>
              <h2 className="mt-3 text-2xl font-headline font-extrabold">
                Interfaces rattachées à votre rôle
              </h2>
              <div className="mt-6 space-y-3">
                {navigation.map((item) => (
                  <div
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm"
                    key={item.href}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-headline font-bold text-primary">Conseils rapides</h3>
              <div className="mt-5 space-y-4">
                {[
                  "Vérifiez votre numéro de téléphone pour faciliter les échanges.",
                  "Utilisez toujours les villes et quartiers marocains normalisés dans vos formulaires.",
                  "Les montants affichés dans la plateforme sont exprimés en dirhams marocains (DH).",
                ].map((tip) => (
                  <div className="flex items-start gap-3" key={tip}>
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </ImportedPageDocument>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-lg font-bold text-primary">{value}</p>
    </div>
  );
}

function EditableInfoCard({
  disabled = false,
  label,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="rounded-2xl bg-surface-container-low p-5 block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      <input
        className="mt-3 w-full rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-sm text-on-surface shadow-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/15 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
