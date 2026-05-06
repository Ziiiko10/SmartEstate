import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import DashboardSidebar from "./DashboardSidebar";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-on-surface">
        <div>
          <p className="font-headline text-3xl font-bold text-primary">SmartEstate</p>
          <p className="mt-3 text-sm text-on-surface-variant">Chargement de votre session...</p>
        </div>
      </div>
    );
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
