// Villes et quartiers admin: permet de piloter le referentiel geographique simplifie.
// Cette page conserve pour l'instant un fonctionnement purement local.
import { FormEvent, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

const initialLocations = [
  { city: "Casablanca", districts: ["Maarif", "Bourgogne", "Sidi Maarouf"] },
  { city: "Rabat", districts: ["Agdal", "Souissi", "Hay Riad"] },
  { city: "Marrakech", districts: ["Gueliz", "Hivernage", "Targa"] },
];

export default function AdminLocationsPage() {
  // Affiche l'ecran admin de gestion des villes et quartiers suivis.
  // Les nouvelles zones sont ajoutees dans un etat local de demonstration.
  const [locations, setLocations] = useState(initialLocations);
  const [city, setCity] = useState("Tanger");
  const [district, setDistrict] = useState("Malabata");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Ajoute un quartier a une ville existante ou cree une nouvelle ville locale.
    // La logique evite aussi de dupliquer un quartier deja present.
    event.preventDefault();
    setLocations((current) => {
      const existing = current.find((item) => item.city === city);
      if (existing) {
        return current.map((item) =>
          item.city === city && !item.districts.includes(district)
            ? { ...item, districts: [...item.districts, district] }
            : item,
        );
      }

      return [...current, { city, districts: [district] }];
    });
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Villes et quartiers"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Structuration géographique
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Villes et quartiers
          </h1>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-8">
          <form className="rounded-2xl bg-white p-6 shadow-sm space-y-4" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-headline font-bold text-primary">Ajouter une zone</h2>
            <Field label="Ville" value={city} onChange={setCity} />
            <Field label="Quartier" value={district} onChange={setDistrict} />
            <button className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white" type="submit">
              Ajouter
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((location) => (
              <article className="rounded-2xl bg-white p-6 shadow-sm" key={location.city}>
                <h3 className="text-2xl font-headline font-bold text-primary">{location.city}</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {location.districts.map((item) => (
                    <span className="rounded-full bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface-variant" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </ImportedPageDocument>
  );
}

function Field({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  // Rend un champ texte simple reutilise dans les formulaires inline de cette page.
  // Le helper garde une apparence homogene avec le reste de l'interface admin.
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      <input
        className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20"
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}
