// Garde de route: verifie l'authentification et le role avant d'afficher la page.
import { type PropsWithChildren, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getHomeRouteForRole, getRoleNavigation, isAllowedRole, type UserRole, USER_ROLES } from "../lib/roles";
import { authenticatedWorkspacePrefetchRoutes, prefetchRoute } from "../lib/routePrefetch";
import { APP_ROUTES } from "../lib/smartestateApp";
import DashboardSidebar from "./DashboardSidebar";
import { AppLoadingScreen } from "./LoadingState";

type ProtectedRouteProps = PropsWithChildren<{
  allowedRoles?: UserRole[];
}>;

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  // Protege une route en verifiant session, role et prechargement de l'espace connecte.
  // Si tout est valide, la page est rendue dans le shell dashboard approprie.
  const { isAuthenticated, isBootstrapping, token, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Prefetche apres un court delai les routes de travail les plus probables.
    // Cela accelere la navigation interne une fois l'utilisateur connecte.
    if (!isAuthenticated) {
      return;
    }

    const timer = window.setTimeout(() => {
      const candidateRoutes =
        getRoleNavigation(user?.role).map((item) => item.href).concat(authenticatedWorkspacePrefetchRoutes)
      Array.from(new Set(candidateRoutes))
        .filter((path) => path !== location.pathname)
        .forEach((path) => {
          void prefetchRoute(path, { token });
        });
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, location.pathname, token, user?.role]);

  if (isBootstrapping) {
    return <AppLoadingScreen message="Chargement de votre session..." subtitle="Vérification des accès et préparation du dashboard." />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/connexion" />;
  }

  if (!isAllowedRole(user?.role, allowedRoles)) {
    return <Navigate replace to={getHomeRouteForRole(user?.role)} />;
  }

  const usesHeaderLogoutLayout =
    user?.role === USER_ROLES.UTILISATEUR_SIMPLE ||
    (user?.role === USER_ROLES.AGENT_IMMOBILIER && location.pathname !== APP_ROUTES.agentDashboard);
  const contentClassName = usesHeaderLogoutLayout
    ? "smartestate-dashboard-content smartestate-dashboard-content-with-header"
    : "smartestate-dashboard-content";

  return (
    <div className="smartestate-dashboard-shell">
      <DashboardSidebar />
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
