// Definition des roles, routes d'accueil et navigations selon le profil.
import { APP_ROUTES } from "./smartestateApp";

export const USER_ROLES = {
  ADMINISTRATEUR: "ADMINISTRATEUR",
  AGENT_IMMOBILIER: "AGENT_IMMOBILIER",
  UTILISATEUR_SIMPLE: "UTILISATEUR_SIMPLE",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type RoleNavigationItem = {
  href: string;
  icon: string;
  label: string;
};

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  ADMINISTRATEUR: APP_ROUTES.adminDashboard,
  AGENT_IMMOBILIER: APP_ROUTES.agentDashboard,
  UTILISATEUR_SIMPLE: APP_ROUTES.userEstimation,
};

export function isUserRole(role: null | string | undefined): role is UserRole {
  // Verifie qu'une chaine correspond bien a l'un des roles supportes.
  // Ce predicate permet ensuite d'affiner le typage TypeScript.
  return (
    role === USER_ROLES.UTILISATEUR_SIMPLE ||
    role === USER_ROLES.AGENT_IMMOBILIER ||
    role === USER_ROLES.ADMINISTRATEUR
  );
}

export function getHomeRouteForRole(role: null | string | undefined) {
  // Retourne la page d'accueil adaptee a un role donne.
  // Les utilisateurs inconnus ou anonymes sont renvoyes vers la connexion.
  if (isUserRole(role)) {
    return ROLE_HOME_ROUTES[role];
  }

  return APP_ROUTES.login;
}

export function getRoleLabel(role: null | string | undefined) {
  // Convertit une valeur de role en libelle lisible pour l'interface.
  // Une valeur de secours reste prevue si le role est absent ou inattendu.
  switch (role) {
    case USER_ROLES.UTILISATEUR_SIMPLE:
      return "Utilisateur simple";
    case USER_ROLES.AGENT_IMMOBILIER:
      return "Agent immobilier";
    case USER_ROLES.ADMINISTRATEUR:
      return "Administrateur";
    default:
      return "Utilisateur";
  }
}

export function isAllowedRole(role: null | string | undefined, allowedRoles?: UserRole[]) {
  // Verifie si un role peut acceder a une route ou action donnee.
  // Sans liste de restriction, la fonction autorise explicitement l'acces.
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return Boolean(role && allowedRoles.includes(role as UserRole));
}

export function getRoleNavigation(role: null | string | undefined): RoleNavigationItem[] {
  // Retourne la navigation laterale adaptee au profil actif.
  // Chaque role voit uniquement les raccourcis pertinents pour son espace.
  if (role === USER_ROLES.ADMINISTRATEUR) {
    return [
      { href: APP_ROUTES.adminDashboard, icon: "space_dashboard", label: "Tableau de bord" },
      { href: APP_ROUTES.adminUsers, icon: "groups", label: "Utilisateurs" },
      { href: APP_ROUTES.adminAgents, icon: "apartment", label: "Agents immobiliers" },
      { href: APP_ROUTES.adminListings, icon: "feed", label: "Annonces" },
      { href: APP_ROUTES.marketListings, icon: "travel_explore", label: "Annonces ETL" },
      { href: APP_ROUTES.adminLocations, icon: "location_city", label: "Villes et quartiers" },
      { href: APP_ROUTES.adminData, icon: "dataset", label: "Données immobilières" },
      { href: APP_ROUTES.adminModel, icon: "model_training", label: "Modèle Machine Learning" },
      { href: APP_ROUTES.adminSettings, icon: "settings", label: "Paramètres" },
      { href: APP_ROUTES.adminProfile, icon: "account_circle", label: "Profil" },
    ];
  }

  if (role === USER_ROLES.AGENT_IMMOBILIER) {
    return [
      { href: APP_ROUTES.agentDashboard, icon: "space_dashboard", label: "Tableau de bord" },
      { href: APP_ROUTES.agentListings, icon: "inventory_2", label: "Mes annonces" },
      { href: APP_ROUTES.marketListings, icon: "travel_explore", label: "Annonces ETL" },
      { href: APP_ROUTES.agentNewListing, icon: "post_add", label: "Ajouter une annonce" },
      { href: APP_ROUTES.agentEstimation, icon: "calculate", label: "Estimation professionnelle" },
      { href: APP_ROUTES.agentRequests, icon: "support_agent", label: "Demandes clients" },
      { href: APP_ROUTES.agentProfile, icon: "account_circle", label: "Profil" },
    ];
  }

  return [
    { href: APP_ROUTES.userEstimation, icon: "calculate", label: "Estimation du prix" },
    { href: APP_ROUTES.userSimulation, icon: "query_stats", label: "Simulation d'investissement" },
    { href: APP_ROUTES.marketListings, icon: "travel_explore", label: "Annonces ETL" },
    { href: APP_ROUTES.userRecommendations, icon: "auto_awesome", label: "Recommandations" },
    { href: APP_ROUTES.userHistory, icon: "history", label: "Historique" },
    { href: APP_ROUTES.userProfile, icon: "account_circle", label: "Profil" },
  ];
}

export function getRolePrimaryAction(role: null | string | undefined) {
  // Retourne l'action principale a mettre en avant selon le role.
  // Ce raccourci alimente notamment la sidebar desktop et mobile.
  if (role === USER_ROLES.ADMINISTRATEUR) {
    return {
      href: APP_ROUTES.adminUsers,
      icon: "manage_accounts",
      label: "Gérer les accès",
    };
  }

  if (role === USER_ROLES.AGENT_IMMOBILIER) {
    return {
      href: APP_ROUTES.agentNewListing,
      icon: "post_add",
      label: "Nouvelle annonce",
    };
  }

  return {
    href: APP_ROUTES.userEstimation,
    icon: "calculate",
    label: "Nouvelle estimation",
  };
}
