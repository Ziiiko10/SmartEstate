import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { apiPrefetch } from "./api";
import { APP_ROUTES } from "./smartestateApp";

type ModuleWithDefault<T extends ComponentType<any>> = {
  default: T;
};

type PreloadableComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<ModuleWithDefault<T>>;
};

type PrefetchOptions = {
  token?: null | string;
};

function lazyWithPreload<T extends ComponentType<any>>(
  loader: () => Promise<ModuleWithDefault<T>>,
): PreloadableComponent<T> {
  const LazyComponent = lazy(loader) as PreloadableComponent<T>;
  LazyComponent.preload = loader;
  return LazyComponent;
}

const pageLoaders = {
  adminAgents: () => import("../pages/AdminAgentsPage"),
  adminData: () => import("../pages/AdminDataPage"),
  adminListings: () => import("../pages/AdminListingsPage"),
  adminLocations: () => import("../pages/AdminLocationsPage"),
  adminMlModel: () => import("../pages/AdminMlModelPage"),
  adminSettings: () => import("../pages/AdminSettingsPage"),
  adminStatistics: () => import("../pages/AdminStatisticsPage"),
  adminUsers: () => import("../pages/AdminUsersPage"),
  agentClientRequests: () => import("../pages/AgentClientRequestsPage"),
  agentListingCreate: () => import("../pages/AgentListingCreatePage"),
  agentListings: () => import("../pages/AgentListingsPage"),
  agentStatistics: () => import("../pages/AgentStatisticsPage"),
  aiEstimation: () => import("../pages/AiEstimationPage"),
  aiRecommendations: () => import("../pages/AiRecommendationsPage"),
  executiveDashboard: () => import("../pages/ExecutiveDashboardPage"),
  home: () => import("../pages/HomePage"),
  login: () => import("../pages/LoginPage"),
  marketListings: () => import("../pages/MarketListingsPage"),
  pageCatalog: () => import("../pages/PageCatalogPage"),
  profile: () => import("../pages/ProfilePage"),
  signup: () => import("../pages/SignupPage"),
  userHistory: () => import("../pages/UserHistoryPage"),
  userInvestmentSimulation: () => import("../pages/UserInvestmentSimulationPage"),
};

export const LazyAdminAgentsPage = lazyWithPreload(pageLoaders.adminAgents);
export const LazyAdminDataPage = lazyWithPreload(pageLoaders.adminData);
export const LazyAdminListingsPage = lazyWithPreload(pageLoaders.adminListings);
export const LazyAdminLocationsPage = lazyWithPreload(pageLoaders.adminLocations);
export const LazyAdminMlModelPage = lazyWithPreload(pageLoaders.adminMlModel);
export const LazyAdminSettingsPage = lazyWithPreload(pageLoaders.adminSettings);
export const LazyAdminStatisticsPage = lazyWithPreload(pageLoaders.adminStatistics);
export const LazyAdminUsersPage = lazyWithPreload(pageLoaders.adminUsers);
export const LazyAgentClientRequestsPage = lazyWithPreload(pageLoaders.agentClientRequests);
export const LazyAgentListingCreatePage = lazyWithPreload(pageLoaders.agentListingCreate);
export const LazyAgentListingsPage = lazyWithPreload(pageLoaders.agentListings);
export const LazyAgentStatisticsPage = lazyWithPreload(pageLoaders.agentStatistics);
export const LazyAiEstimationPage = lazyWithPreload(pageLoaders.aiEstimation);
export const LazyAiRecommendationsPage = lazyWithPreload(pageLoaders.aiRecommendations);
export const LazyExecutiveDashboardPage = lazyWithPreload(pageLoaders.executiveDashboard);
export const LazyHomePage = lazyWithPreload(pageLoaders.home);
export const LazyLoginPage = lazyWithPreload(pageLoaders.login);
export const LazyMarketListingsPage = lazyWithPreload(pageLoaders.marketListings);
export const LazyPageCatalogPage = lazyWithPreload(pageLoaders.pageCatalog);
export const LazyProfilePage = lazyWithPreload(pageLoaders.profile);
export const LazySignupPage = lazyWithPreload(pageLoaders.signup);
export const LazyUserHistoryPage = lazyWithPreload(pageLoaders.userHistory);
export const LazyUserInvestmentSimulationPage = lazyWithPreload(pageLoaders.userInvestmentSimulation);

const routeDefinitions = [
  { path: APP_ROUTES.userEstimation, preload: LazyAiEstimationPage.preload },
  { path: APP_ROUTES.agentEstimation, preload: LazyAiEstimationPage.preload },
  { path: APP_ROUTES.userRecommendations, preload: LazyAiRecommendationsPage.preload },
  { path: APP_ROUTES.marketListings, preload: LazyMarketListingsPage.preload },
  { path: APP_ROUTES.agentDashboard, preload: LazyExecutiveDashboardPage.preload },
  { path: APP_ROUTES.adminDashboard, preload: LazyExecutiveDashboardPage.preload },
  { path: APP_ROUTES.userSimulation, preload: LazyUserInvestmentSimulationPage.preload },
  { path: APP_ROUTES.userHistory, preload: LazyUserHistoryPage.preload },
  { path: APP_ROUTES.userProfile, preload: LazyProfilePage.preload },
  { path: APP_ROUTES.agentProfile, preload: LazyProfilePage.preload },
  { path: APP_ROUTES.adminProfile, preload: LazyProfilePage.preload },
  { path: APP_ROUTES.agentListings, preload: LazyAgentListingsPage.preload },
  { path: APP_ROUTES.agentNewListing, preload: LazyAgentListingCreatePage.preload },
  { path: APP_ROUTES.agentRequests, preload: LazyAgentClientRequestsPage.preload },
  { path: APP_ROUTES.agentStats, preload: LazyAgentStatisticsPage.preload },
  { path: APP_ROUTES.adminUsers, preload: LazyAdminUsersPage.preload },
  { path: APP_ROUTES.adminAgents, preload: LazyAdminAgentsPage.preload },
  { path: APP_ROUTES.adminListings, preload: LazyAdminListingsPage.preload },
  { path: APP_ROUTES.adminLocations, preload: LazyAdminLocationsPage.preload },
  { path: APP_ROUTES.adminData, preload: LazyAdminDataPage.preload },
  { path: APP_ROUTES.adminModel, preload: LazyAdminMlModelPage.preload },
  { path: APP_ROUTES.adminStats, preload: LazyAdminStatisticsPage.preload },
  { path: APP_ROUTES.adminSettings, preload: LazyAdminSettingsPage.preload },
  { path: APP_ROUTES.login, preload: LazyLoginPage.preload },
  { path: APP_ROUTES.signup, preload: LazySignupPage.preload },
  { path: APP_ROUTES.catalog, preload: LazyPageCatalogPage.preload },
  { path: APP_ROUTES.home, preload: LazyHomePage.preload },
] as const;

function canPrefetchInBackground() {
  if (typeof navigator === "undefined") {
    return true;
  }

  const connection = (navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
    };
  }).connection;

  if (!connection) {
    return true;
  }

  if (connection.saveData) {
    return false;
  }

  return connection.effectiveType !== "2g" && connection.effectiveType !== "slow-2g";
}

function matchesPath(currentPath: string, routePath: string) {
  if (routePath === APP_ROUTES.home) {
    return currentPath === routePath;
  }

  return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
}

function resolveRouteDefinition(path: string) {
  return routeDefinitions.find((definition) => matchesPath(path, definition.path)) ?? null;
}

async function prefetchRouteData(path: string, token?: null | string) {
  switch (path) {
    case APP_ROUTES.userEstimation:
    case APP_ROUTES.agentEstimation:
      await apiPrefetch(
        "/market-listings/filters/?asset_type=apartment&transaction_type=sale&city=Casablanca&district=Maarif",
        { token },
      );
      return;
    case APP_ROUTES.userRecommendations:
      await Promise.allSettled([
        apiPrefetch("/dashboard/overview/?include_opportunities=1", { token }),
        apiPrefetch("/recommendations/", { token }),
      ]);
      return;
    case APP_ROUTES.agentDashboard:
    case APP_ROUTES.adminDashboard:
    case APP_ROUTES.adminStats:
      await apiPrefetch("/dashboard/overview/", { token });
      return;
    case APP_ROUTES.agentStats:
      await apiPrefetch("/dashboard/overview/?include_opportunities=1", { token });
      return;
    case APP_ROUTES.marketListings:
    case APP_ROUTES.adminListings:
    case APP_ROUTES.adminData:
      await Promise.allSettled([
        apiPrefetch("/market-listings/filters/", { token }),
        apiPrefetch("/market-listings/?page=1&page_size=12", { token }),
      ]);
      return;
    case APP_ROUTES.adminUsers:
      await apiPrefetch("/users/", { token });
      return;
    case APP_ROUTES.adminAgents:
      await Promise.allSettled([
        apiPrefetch("/users/?role=AGENT_IMMOBILIER", { token }),
        apiPrefetch("/team-memberships/", { token }),
      ]);
      return;
    default:
      return;
  }
}

export async function prefetchRoute(path: string, options: PrefetchOptions = {}) {
  if (!canPrefetchInBackground()) {
    return;
  }

  const definition = resolveRouteDefinition(path);
  if (!definition) {
    return;
  }

  await Promise.allSettled([
    definition.preload(),
    prefetchRouteData(definition.path, options.token),
  ]);
}

export const authenticatedWorkspacePrefetchRoutes = [
  APP_ROUTES.userEstimation,
  APP_ROUTES.userSimulation,
  APP_ROUTES.marketListings,
  APP_ROUTES.userRecommendations,
  APP_ROUTES.agentDashboard,
  APP_ROUTES.agentListings,
  APP_ROUTES.agentRequests,
  APP_ROUTES.adminDashboard,
  APP_ROUTES.adminUsers,
  APP_ROUTES.adminListings,
  APP_ROUTES.adminStats,
] as const;
