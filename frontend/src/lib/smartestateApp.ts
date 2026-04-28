export const APP_ROUTES = {
  home: "/",
  login: "/connexion",
  signup: "/inscription",
  reports: "/rapports",
  dashboard: "/tableau-de-bord-executif",
  scenarios: "/simulateur-scenarios",
  scenariosMaroc: "/simulateur-scenarios-maroc",
  recommendations: "/recommandations-ia",
  estimation: "/estimation-immobiliere-ia",
  portfolio: "/portfolio-immobilier-maroc",
  team: "/gestion-equipe",
  catalog: "/pages",
} as const;

export const SUPPORT_EMAIL = "contact@smartestate.ma";
export const SUPPORT_PHONE = "+212600000000";

export const DEMO_CREDENTIALS = {
  email: "yassine@smartestate.ma",
  password: "demo12345",
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
