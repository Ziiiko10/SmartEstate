// Routeur principal: relie les ecrans publics et les espaces proteges selon le role.
import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import GuestRoute from "./components/GuestRoute";
import { AppLoadingScreen, RouteTransitionOverlay } from "./components/LoadingState";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  LazyAdminAgentsPage,
  LazyAdminListingsPage,
  LazyAdminMlModelPage,
  LazyAdminUsersPage,
  LazyAgentClientRequestsPage,
  LazyAgentListingCreatePage,
  LazyAgentListingsPage,
  LazyAiEstimationPage,
  LazyAiRecommendationsPage,
  LazyExecutiveDashboardPage,
  LazyHomePage,
  LazyLoginPage,
  LazyMarketListingsPage,
  LazyPageCatalogPage,
  LazyProfilePage,
  LazySignupPage,
  LazyUserHistoryPage,
  LazyUserInvestmentSimulationPage,
} from "./lib/routePrefetch";
import { getHomeRouteForRole, USER_ROLES } from "./lib/roles";
import { APP_ROUTES } from "./lib/smartestateApp";

function RoleHomeRedirect() {
  // Redirige l'utilisateur vers sa page d'accueil selon son role courant.
  // Ce helper evite de dupliquer cette logique dans plusieurs routes legacy.
  const { user } = useAuth();
  return <Navigate replace to={getHomeRouteForRole(user?.role)} />;
}

function EstimationAliasRedirect() {
  // Redirige l'alias d'estimation vers l'ecran adapte au role connecte.
  // Les agents ouvrent la version pro, les autres la version utilisateur.
  const { user } = useAuth();
  return (
    <Navigate
      replace
      to={user?.role === USER_ROLES.AGENT_IMMOBILIER ? APP_ROUTES.agentEstimation : APP_ROUTES.userEstimation}
    />
  );
}

export default function App() {
  // Defini l'ensemble du routage principal de l'application.
  // Les routes publiques, protegees et legacy sont centralisees dans ce composant.
  return (
    <>
      <RouteTransitionOverlay />
      <Suspense
        fallback={
          <AppLoadingScreen
            message="Chargement de la page..."
            subtitle="Preparation des modules et des donnees de l'interface."
          />
        }
      >
        <Routes>
          <Route path={APP_ROUTES.home} element={<LazyHomePage />} />
          <Route
            path={APP_ROUTES.signup}
            element={
              <GuestRoute>
                <LazySignupPage />
              </GuestRoute>
            }
          />
          <Route
            path={APP_ROUTES.login}
            element={
              <GuestRoute>
                <LazyLoginPage />
              </GuestRoute>
            }
          />

          <Route
            path={APP_ROUTES.userEstimation}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.UTILISATEUR_SIMPLE]}>
                <LazyAiEstimationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.userSimulation}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.UTILISATEUR_SIMPLE]}>
                <LazyUserInvestmentSimulationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.userRecommendations}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.UTILISATEUR_SIMPLE]}>
                <LazyAiRecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.marketListings}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.UTILISATEUR_SIMPLE, USER_ROLES.AGENT_IMMOBILIER, USER_ROLES.ADMINISTRATEUR]}>
                <LazyMarketListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.userHistory}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.UTILISATEUR_SIMPLE]}>
                <LazyUserHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.userProfile}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.UTILISATEUR_SIMPLE]}>
                <LazyProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={APP_ROUTES.agentDashboard}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}>
                <LazyExecutiveDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.agentListings}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}>
                <LazyAgentListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.agentNewListing}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}>
                <LazyAgentListingCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.agentEstimation}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}>
                <LazyAiEstimationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.agentRequests}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}>
                <LazyAgentClientRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.agentStats}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}>
                <Navigate replace to={APP_ROUTES.agentDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.agentProfile}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}>
                <LazyProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={APP_ROUTES.adminDashboard}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <LazyExecutiveDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminUsers}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <LazyAdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminAgents}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <LazyAdminAgentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminListings}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <LazyAdminListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminLocations}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <Navigate replace to={APP_ROUTES.adminDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminData}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <Navigate replace to={APP_ROUTES.adminDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminModel}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <LazyAdminMlModelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminStats}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <Navigate replace to={APP_ROUTES.adminDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminSettings}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <Navigate replace to={APP_ROUTES.adminDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.adminProfile}
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}>
                <LazyProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={APP_ROUTES.legacyDashboard}
            element={
              <ProtectedRoute>
                <RoleHomeRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyEstimation}
            element={
              <ProtectedRoute>
                <EstimationAliasRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyRecommendations}
            element={
              <ProtectedRoute>
                <Navigate replace to={APP_ROUTES.userRecommendations} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyMarketListings}
            element={
              <ProtectedRoute>
                <Navigate replace to={APP_ROUTES.marketListings} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyComparison}
            element={
              <ProtectedRoute>
                <Navigate replace to={APP_ROUTES.marketListings} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyScenarios}
            element={
              <ProtectedRoute>
                <Navigate replace to={APP_ROUTES.userSimulation} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyScenariosMaroc}
            element={
              <ProtectedRoute>
                <Navigate replace to={APP_ROUTES.userSimulation} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyReports}
            element={
              <ProtectedRoute>
                <RoleHomeRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyPortfolio}
            element={
              <ProtectedRoute>
                <Navigate replace to={APP_ROUTES.marketListings} />
              </ProtectedRoute>
            }
          />
          <Route
            path={APP_ROUTES.legacyTeam}
            element={
              <ProtectedRoute>
                <Navigate replace to={APP_ROUTES.adminUsers} />
              </ProtectedRoute>
            }
          />

          <Route path="/utilisateur" element={<ProtectedRoute allowedRoles={[USER_ROLES.UTILISATEUR_SIMPLE]}><RoleHomeRedirect /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute allowedRoles={[USER_ROLES.AGENT_IMMOBILIER]}><RoleHomeRedirect /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMINISTRATEUR]}><RoleHomeRedirect /></ProtectedRoute>} />
          <Route path={APP_ROUTES.catalog} element={<LazyPageCatalogPage />} />
          <Route path="*" element={<Navigate replace to={APP_ROUTES.home} />} />
        </Routes>
      </Suspense>
    </>
  );
}
