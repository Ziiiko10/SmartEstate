import { Link } from "react-router-dom";
import { catalogPages } from "../data/catalogPages";

export default function PageCatalogPage() {
  return (
    <main className="page-catalog-page">
      <section className="page-catalog-hero">
        <p className="page-catalog-kicker">Catalogue React</p>
        <h1>Bibliotheque SmartEstate</h1>
        <p>
          Toutes les pages de la maquette sont maintenant integrees comme composants React +
          TypeScript natifs, sans renderer externe ni iframe.
        </p>
      </section>

      <section className="page-catalog-grid">
        {catalogPages.map((page) => (
          <article className="page-catalog-card" key={page.path}>
            <img alt={page.title} className="page-catalog-preview" src={page.preview} />
            <div className="page-catalog-body">
              <p className="page-catalog-label">{page.category}</p>
              <h2>{page.title}</h2>
              <p>{page.description}</p>
              <Link className="page-catalog-link" to={page.path}>
                Ouvrir la page
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
