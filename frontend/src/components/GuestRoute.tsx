import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppLoadingScreen } from "./LoadingState";

type GuestRouteProps = PropsWithChildren<{
  redirectTo?: string;
}>;

export default function GuestRoute({
  children,
  redirectTo = "/tableau-de-bord-executif",
}: GuestRouteProps) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <AppLoadingScreen message="Chargement de votre session..." subtitle="Préparation des écrans d'accès SmartEstate." />;
  }

  if (isAuthenticated) {
    return <Navigate replace to={redirectTo} />;
  }

  return children;
}
