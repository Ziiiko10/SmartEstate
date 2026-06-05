// Creation d'annonce agent: formulaire, galerie locale et previsualisation avant publication.
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { formatDh } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const MAX_IMAGES = 8;

type ListingForm = {
  address: string;
  bathrooms: string;
  bedrooms: string;
  city: string;
  description: string;
  district: string;
  price: string;
  status: string;
  surface: string;
  title: string;
  type: string;
};

const defaultForm: ListingForm = {
  address: "Rue Ibnou Sina",
  bathrooms: "2",
  bedrooms: "3",
  city: "Casablanca",
  description: "Appartement lumineux proche des axes majeurs, idéal pour une famille ou un investisseur.",
  district: "Maarif",
  price: "2250000",
  status: "Brouillon",
  surface: "146",
  title: "Appartement premium proche du boulevard Zerktouni",
  type: "Appartement",
};

type SelectedImage = {
  id: string;
  name: string;
  previewUrl: string;
  sizeLabel: string;
};

// Prepare une annonce cote interface en attendant la connexion au flux de publication backend.
export default function AgentListingCreatePage() {
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const imageUrlsRef = useRef<string[]>([]);

  // Memorise les URLs temporaires courantes pour pouvoir les liberer proprement.
  useEffect(() => {
    imageUrlsRef.current = images.map((image) => image.previewUrl);
  }, [images]);

  // Nettoie toutes les previews lors du demontage de la page.
  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  // Met a jour un champ du formulaire sans dupliquer la logique dans chaque input.
  function updateField<K extends keyof ListingForm>(field: K, value: ListingForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Transforme les fichiers choisis en apercus locaux et limite la galerie au quota autorise.
  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = Math.max(0, MAX_IMAGES - images.length);
    const nextImages = selectedFiles.slice(0, remainingSlots).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      sizeLabel: `${(file.size / 1024 / 1024).toLocaleString("fr-MA", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      })} Mo`,
    }));

    setImages((current) => [...current, ...nextImages]);
    setMessage(
      nextImages.length < selectedFiles.length
        ? `Seulement ${MAX_IMAGES} images peuvent etre preparees par annonce.`
        : "",
    );
    event.target.value = "";
  }

  // Supprime une image et libere l'URL locale associee.
  function removeImage(imageId: string) {
    setImages((current) => {
      const imageToRemove = current.find((image) => image.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return current.filter((image) => image.id !== imageId);
    });
  }

  // Simule la preparation de l'annonce tant que l'endpoint final n'est pas branche.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      `Annonce preparee avec succes avec ${images.length.toLocaleString("fr-MA")} image(s). ` +
        "Elle pourra etre reliee au backend publication des que l'endpoint sera disponible.",
    );
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Ajouter une annonce"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Publication
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Ajouter une annonce
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant">
            Préparez une fiche propre et cohérente avant validation commerciale ou publication.
          </p>
        </section>

        {message && (
          <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary-container/35 px-5 py-4 text-sm font-semibold text-secondary">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_380px] gap-8">
          <form className="rounded-2xl bg-white p-6 md:p-8 shadow-sm space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Titre" value={form.title} onChange={(value) => updateField("title", value)} />
              <Field label="Type de bien" value={form.type} onChange={(value) => updateField("type", value)} />
              <Field label="Ville" value={form.city} onChange={(value) => updateField("city", value)} />
              <Field label="Quartier" value={form.district} onChange={(value) => updateField("district", value)} />
              <Field label="Adresse approximative" value={form.address} onChange={(value) => updateField("address", value)} />
              <Field label="Surface" value={form.surface} onChange={(value) => updateField("surface", value)} />
              <Field label="Prix" value={form.price} onChange={(value) => updateField("price", value)} />
              <Field label="Statut" value={form.status} onChange={(value) => updateField("status", value)} />
              <Field label="Chambres" value={form.bedrooms} onChange={(value) => updateField("bedrooms", value)} />
              <Field label="Salles de bain" value={form.bathrooms} onChange={(value) => updateField("bathrooms", value)} />
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Description
              </span>
              <textarea
                className="min-h-36 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
                onChange={(event) => updateField("description", event.target.value)}
                value={form.description}
              />
            </label>

            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Images du bien
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Ajoutez jusqu&apos;a {MAX_IMAGES} images pour preparer la galerie de l&apos;annonce.
                  </p>
                </div>
                <button
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"
                  onClick={() => imageInputRef.current?.click()}
                  type="button"
                >
                  Ajouter des images
                </button>
              </div>

              <input
                accept="image/*"
                className="hidden"
                multiple
                onChange={handleImageSelection}
                ref={imageInputRef}
                type="file"
              />

              {images.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-outline-variant/40 bg-white px-5 py-8 text-sm text-on-surface-variant">
                  Aucune image selectionnee pour le moment. La premiere image ajoutee deviendra l&apos;image principale de previsualisation.
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {images.map((image, index) => (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm" key={image.id}>
                      <div className="aspect-[4/3] overflow-hidden bg-surface-container">
                        <img
                          alt={image.name}
                          className="h-full w-full object-cover"
                          src={image.previewUrl}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="line-clamp-1 text-sm font-bold text-primary">{image.name}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">{image.sizeLabel}</p>
                          </div>
                          {index === 0 ? (
                            <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                              Principale
                            </span>
                          ) : null}
                        </div>
                        <button
                          className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700"
                          onClick={() => removeImage(image.id)}
                          type="button"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="rounded-xl bg-primary px-5 py-4 text-sm font-bold text-white" type="submit">
              Préparer l'annonce
            </button>
          </form>

          <aside className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
              Prévisualisation
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl bg-white/10">
              {images[0] ? (
                <img
                  alt={images[0].name}
                  className="aspect-[4/3] w-full object-cover"
                  src={images[0].previewUrl}
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center px-6 text-center text-sm text-primary-fixed">
                  Ajoutez des images pour voir apparaître la galerie de l&apos;annonce ici.
                </div>
              )}
            </div>
            <h2 className="mt-3 text-2xl font-headline font-extrabold">{form.title}</h2>
            <p className="mt-2 text-primary-fixed">
              {form.district}, {form.city}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <PreviewCard label="Prix" value={formatDh(form.price, true)} />
              <PreviewCard label="Surface" value={`${form.surface} m²`} />
              <PreviewCard label="Chambres" value={form.bedrooms} />
              <PreviewCard label="Statut" value={form.status} />
            </div>
            <div className="mt-5 rounded-xl bg-white/10 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim">Galerie</p>
              <p className="mt-1 text-sm font-bold text-white">
                {images.length.toLocaleString("fr-MA")} image(s) preparee(s)
              </p>
            </div>
            {images.length > 1 ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.slice(1, 4).map((image) => (
                  <img
                    alt={image.name}
                    className="aspect-square w-full rounded-xl object-cover"
                    key={image.id}
                    src={image.previewUrl}
                  />
                ))}
              </div>
            ) : null}
            <p className="mt-6 text-sm leading-relaxed text-primary-fixed">{form.description}</p>
          </aside>
        </section>
      </main>
    </ImportedPageDocument>
  );
}

// Champ texte simple reutilise dans la grille des caracteristiques.
function Field({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <input
        className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}

// Carte compacte affichee dans le panneau de previsualisation.
function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}
