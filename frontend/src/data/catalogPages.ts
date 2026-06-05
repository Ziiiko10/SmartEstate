// Catalogue statique des pages de demonstration exposees dans le frontend.
// Chaque entree fournit un titre, un apercu et une categorie de navigation.
export type CatalogPage = {
  category: string;
  description: string;
  path: string;
  preview: string;
  title: string;
};

export const catalogPages: CatalogPage[] = [
  {
    title: "Page d'Accueil SmartEstate",
    path: "/",
    category: "Landing",
    description: "Page d'accueil produit avec hero, preuve sociale, sections d'explication et CTA.",
    preview: "/imported-pages/page-accueil.png"
  },
  {
    title: "Inscription SmartEstate (Maroc)",
    path: "/inscription",
    category: "Onboarding",
    description: "Ecran d'inscription investisseur avec split layout premium et formulaire complet.",
    preview: "/imported-pages/inscription-smartestate-maroc.png"
  },
  {
    title: "Connexion SmartEstate",
    path: "/connexion",
    category: "Onboarding",
    description: "Page de connexion et d'acces a l'espace SmartEstate.",
    preview: "/imported-pages/connexion-smartestate.png"
  },
  {
    title: "Rapports SmartEstate - Version Finale",
    path: "/rapports",
    category: "Reporting",
    description: "Rapports d'analyse et de synthese pour les investissements immobiliers.",
    preview: "/imported-pages/rapports-smartestate.png"
  },
  {
    title: "Tableau de Bord Executif",
    path: "/tableau-de-bord-executif",
    category: "Dashboard",
    description: "Vue executive avec KPIs, graphiques et pilotage strategique.",
    preview: "/imported-pages/tableau-de-bord-executif.png"
  },
  {
    title: "Simulateur de Scenarios",
    path: "/simulateur-scenarios",
    category: "Simulation",
    description: "Simulateur de scenarios pour tester differents cas d'investissement.",
    preview: "/imported-pages/simulateur-scenarios.png"
  },
  {
    title: "Simulateur de Scenarios (Maroc)",
    path: "/simulateur-scenarios-maroc",
    category: "Simulation",
    description: "Version localisee Maroc du simulateur avec contexte marche et fiscalite.",
    preview: "/imported-pages/simulateur-scenarios-maroc.png"
  },
  {
    title: "Recommandations IA",
    path: "/recommandations-ia",
    category: "AI",
    description: "Page de recommandations automatisees pour actions et opportunites.",
    preview: "/imported-pages/recommandations-ia.png"
  },
  {
    title: "Estimation Immobiliere IA",
    path: "/estimation-immobiliere-ia",
    category: "AI",
    description: "Experience d'estimation immobiliere assistee par intelligence artificielle.",
    preview: "/imported-pages/estimation-immobiliere-ia.png"
  },
  {
    title: "Gestion de l'Equipe SmartEstate",
    path: "/gestion-equipe",
    category: "Operations",
    description: "Gestion de l'equipe, des roles, des activites et de la collaboration.",
    preview: "/imported-pages/gestion-equipe.png"
  }
];
