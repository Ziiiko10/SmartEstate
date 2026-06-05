export const APP_ROUTES = {
  home: "/",
  login: "/connexion",
  signup: "/inscription",
  userEstimation: "/utilisateur/estimation",
  userSimulation: "/utilisateur/simulation-investissement",
  userRecommendations: "/utilisateur/recommandations",
  marketListings: "/marche/annonces-etl",
  userHistory: "/utilisateur/historique",
  userProfile: "/utilisateur/profil",
  agentDashboard: "/agent/dashboard",
  agentListings: "/agent/annonces",
  agentNewListing: "/agent/annonces/nouvelle",
  agentEstimation: "/agent/estimation-pro",
  agentRequests: "/agent/demandes-clients",
  agentStats: "/agent/statistiques",
  agentProfile: "/agent/profil",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/utilisateurs",
  adminAgents: "/admin/agents-immobiliers",
  adminListings: "/admin/annonces",
  adminLocations: "/admin/villes-quartiers",
  adminData: "/admin/donnees-immobilieres",
  adminModel: "/admin/modele-ml",
  adminStats: "/admin/statistiques",
  adminSettings: "/admin/parametres",
  adminProfile: "/admin/profil",
  legacyReports: "/rapports",
  legacyDashboard: "/tableau-de-bord-executif",
  legacyMarketListings: "/annonces-etl",
  legacyScenarios: "/simulateur-scenarios",
  legacyScenariosMaroc: "/simulateur-scenarios-maroc",
  legacyRecommendations: "/recommandations-ia",
  legacyEstimation: "/estimation-immobiliere-ia",
  legacyComparison: "/utilisateur/comparaison-biens",
  legacyPortfolio: "/portfolio-immobilier-maroc",
  legacyTeam: "/gestion-equipe",
  catalog: "/pages",
} as const;

export const SUPPORT_EMAIL = "contact@smartestate.ma";
export const SUPPORT_PHONE = "+212600000000";

export const DEMO_ACCOUNTS = {
  admin: {
    email: "majid.bourza12@gmail.com",
    label: "Espace administrateur",
    password: "123456789",
  },
  agent: {
    email: "zakaria.bouguerfa18@gmail.com",
    label: "Espace agent immobilier",
    password: "123456789",
  },
  user: {
    email: "zakaria.bouguerfa@gmail.com",
    label: "Espace utilisateur",
    password: "123456789",
  },
} as const;

export const DEMO_CREDENTIALS = {
  email: DEMO_ACCOUNTS.user.email,
  password: DEMO_ACCOUNTS.user.password,
} as const;

export type LoginRedirectState = {
  from?: string;
  prefillDemo?: boolean;
};

export function buildMailtoHref(subject: string, body: string) {
  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}
