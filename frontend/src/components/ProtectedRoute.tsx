import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import DashboardSidebar from "./DashboardSidebar";
import { AppLoadingScreen } from "./LoadingState";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <AppLoadingScreen message="Chargement de votre session..." subtitle="Vérification des accès et préparation du dashboard." />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/connexion" />;
  }

  return (
    <div className="smartestate-dashboard-shell">
      <DashboardSidebar />
      <div className="smartestate-dashboard-content">{children}</div>
    </div>
  );
}
