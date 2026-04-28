import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type GuestRouteProps = PropsWithChildren<{
  redirectTo?: string;
}>;

export default function GuestRoute({
  children,
  redirectTo = "/tableau-de-bord-executif",
}: GuestRouteProps) {
  const { isAuthenticated, isBootstrapping } = useAuth();

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

  if (isAuthenticated) {
    return <Navigate replace to={redirectTo} />;
  }

  return children;
}
