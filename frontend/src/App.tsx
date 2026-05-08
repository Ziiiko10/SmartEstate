import { Navigate, Route, Routes } from "react-router-dom";
import { RouteTransitionOverlay } from "./components/LoadingState";
import AiEstimationPage from "./pages/AiEstimationPage";
import AiRecommendationsPage from "./pages/AiRecommendationsPage";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ExecutiveDashboardPage from "./pages/ExecutiveDashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MarketListingsPage from "./pages/MarketListingsPage";
import PageCatalogPage from "./pages/PageCatalogPage";
import PortfolioMarocPage from "./pages/PortfolioMarocPage";
import ReportsPage from "./pages/ReportsPage";
import ScenarioSimulatorMarocPage from "./pages/ScenarioSimulatorMarocPage";
import ScenarioSimulatorPage from "./pages/ScenarioSimulatorPage";
import SignupPage from "./pages/SignupPage";
import TeamManagementPage from "./pages/TeamManagementPage";

export default function App() {
  return (
    <>
      <RouteTransitionOverlay />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/inscription"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />
        <Route
          path="/connexion"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/rapports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tableau-de-bord-executif"
          element={
            <ProtectedRoute>
              <ExecutiveDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulateur-scenarios"
          element={
            <ProtectedRoute>
              <ScenarioSimulatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulateur-scenarios-maroc"
          element={
            <ProtectedRoute>
              <ScenarioSimulatorMarocPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommandations-ia"
          element={
            <ProtectedRoute>
              <AiRecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estimation-immobiliere-ia"
          element={
            <ProtectedRoute>
              <AiEstimationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio-immobilier-maroc"
          element={
            <ProtectedRoute>
              <PortfolioMarocPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/annonces-etl"
          element={
            <ProtectedRoute>
              <MarketListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion-equipe"
          element={
            <ProtectedRoute>
              <TeamManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/pages" element={<PageCatalogPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  );
}
