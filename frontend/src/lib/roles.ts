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
  return (
    role === USER_ROLES.UTILISATEUR_SIMPLE ||
    role === USER_ROLES.AGENT_IMMOBILIER ||
    role === USER_ROLES.ADMINISTRATEUR
  );
}

export function getHomeRouteForRole(role: null | string | undefined) {
  if (isUserRole(role)) {
    return ROLE_HOME_ROUTES[role];
  }

  return APP_ROUTES.login;
}

export function getRoleLabel(role: null | string | undefined) {
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
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return Boolean(role && allowedRoles.includes(role as UserRole));
}

export function getRoleNavigation(role: null | string | undefined): RoleNavigationItem[] {
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
      { href: APP_ROUTES.adminStats, icon: "monitoring", label: "Statistiques globales" },
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
      { href: APP_ROUTES.agentStats, icon: "insights", label: "Statistiques" },
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
