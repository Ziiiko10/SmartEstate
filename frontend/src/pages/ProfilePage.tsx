// Profil utilisateur: edition directe des champs, avatar et acces lies au role.
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { EditableInfoCard, InfoCard } from "../components/PageWidgets";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../lib/api";
import { getRoleLabel, getRoleNavigation } from "../lib/roles";
import { formatDateTime } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

export default function ProfilePage() {
  // Affiche et permet de modifier le profil courant de l'utilisateur.
  // Les informations sont chargees depuis le contexte d'auth puis sauvegardees via l'API.
  const { token, updateProfile, user } = useAuth();
  const navigation = getRoleNavigation(user?.role);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [avatarImage, setAvatarImage] = useState(user?.avatar_image ?? "");
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Resynchronise le formulaire local quand l'utilisateur courant change.
    // Cela evite d'afficher des valeurs obsoletes apres un refresh de profil.
    setFullName(user?.full_name ?? "");
    setPhoneNumber(user?.phone_number ?? "");
    setAvatarImage(user?.avatar_image ?? "");
  }, [user?.avatar_image, user?.full_name, user?.phone_number]);

  const isDemoProfile = !token;
  const trimmedFullName = fullName.trim();
  const trimmedPhoneNumber = phoneNumber.trim();
  const normalizedAvatarImage = avatarImage.trim();
  const hasChanges =
    trimmedFullName !== (user?.full_name ?? "") ||
    trimmedPhoneNumber !== (user?.phone_number ?? "") ||
    normalizedAvatarImage !== (user?.avatar_image ?? "");

  async function handleSave() {
    // Valide puis enregistre les modifications du profil courant.
    // Les messages de succes et d'erreur sont geres localement pour la page.
    setError(null);
    setSuccess(null);

    if (!trimmedFullName) {
      setError("Le nom complet est obligatoire.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        avatar_image: normalizedAvatarImage,
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
    // Restaure le formulaire sur les valeurs actuellement connues du compte.
    // Le champ fichier est aussi nettoye pour repartir d'un etat sain.
    setFullName(user?.full_name ?? "");
    setPhoneNumber(user?.phone_number ?? "");
    setAvatarImage(user?.avatar_image ?? "");
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleAvatarPickerClick() {
    // Ouvre le selecteur de fichier pour choisir une nouvelle image de profil.
    // Le clic est relaye vers l'input masque dedie a l'upload.
    fileInputRef.current?.click();
  }

  function handleAvatarRemove() {
    // Supprime l'image actuellement previsualisee dans le formulaire.
    // Le composant reste en mode brouillon tant que l'utilisateur n'enregistre pas.
    setAvatarImage("");
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    // Valide puis charge localement la nouvelle image choisie par l'utilisateur.
    // Seuls quelques formats et une taille maximale sont acceptes.
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Utilisez une image JPG, PNG ou WebP pour la photo de profil.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("La photo de profil doit faire 2 Mo maximum.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarImage(result);
      setError(null);
      setSuccess(null);
    };
    reader.onerror = () => {
      setError("Impossible de lire cette image pour le moment.");
    };
    reader.readAsDataURL(file);
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
              <div className="flex flex-col items-center gap-3">
                <UserAvatar
                  className="h-20 w-20 rounded-full object-cover text-3xl"
                  fullName={fullName || user?.full_name}
                  image={avatarImage}
                />
                <div className="flex flex-wrap justify-center gap-2">
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isDemoProfile || isSubmitting}
                    ref={fileInputRef}
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <button
                    className="rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-xs font-bold text-primary transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isDemoProfile || isSubmitting}
                    type="button"
                    onClick={handleAvatarPickerClick}
                  >
                    Choisir une image
                  </button>
                  <button
                    className="rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isDemoProfile || isSubmitting || !avatarImage}
                    type="button"
                    onClick={handleAvatarRemove}
                  >
                    Retirer
                  </button>
                </div>
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
              <InfoCard label="Adresse email" value={user?.email || "Email non renseigné"} />
              <EditableInfoCard
                disabled={isDemoProfile || isSubmitting}
                label="Téléphone"
                placeholder="+212600000000"
                type="tel"
                value={phoneNumber}
                onChange={setPhoneNumber}
              />
              <InfoCard label="Création du compte" value={formatDateTime(user?.created_at || "")} />
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
