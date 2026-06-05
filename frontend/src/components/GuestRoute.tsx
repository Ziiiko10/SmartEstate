// Route reservee aux visiteurs: redirige les utilisateurs deja connectes.
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getHomeRouteForRole } from "../lib/roles";
import { AppLoadingScreen } from "./LoadingState";

type GuestRouteProps = PropsWithChildren<{
  redirectTo?: string;
}>;

export default function GuestRoute({
  children,
  redirectTo,
}: GuestRouteProps) {
  // Affiche un ecran public uniquement pour les visiteurs non connectes.
  // Les utilisateurs deja authentifies sont rediriges vers leur espace naturel.
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <AppLoadingScreen message="Chargement de votre session..." subtitle="Préparation des écrans d'accès SmartEstate." />;
  }

  if (isAuthenticated) {
    return <Navigate replace to={redirectTo ?? getHomeRouteForRole(user?.role)} />;
  }

  return children;
}
