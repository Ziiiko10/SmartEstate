import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getHomeRouteForRole, getRoleLabel, getRoleNavigation, getRolePrimaryAction, USER_ROLES } from "../lib/roles";
import { prefetchRoute } from "../lib/routePrefetch";
import { APP_ROUTES } from "../lib/smartestateApp";

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const navItems = getRoleNavigation(user?.role).map((item) => ({
    ...item,
    paths: [item.href],
  }));
  const primaryAction = getRolePrimaryAction(user?.role);
  const homeRoute = getHomeRouteForRole(user?.role);
  const isSimpleUser = user?.role === USER_ROLES.UTILISATEUR_SIMPLE;

  function handleLogout() {
    logout();
    navigate(APP_ROUTES.home, { replace: true });
  }

  function isActive(paths: string[]) {
    return paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  }

  function getPrefetchHandlers(path: string) {
    const warmRoute = () => {
      void prefetchRoute(path, { token });
    };

    return {
      onFocus: warmRoute,
      onMouseEnter: warmRoute,
      onTouchStart: warmRoute,
    };
  }

  return (
    <>
      {isSimpleUser ? (
        <header className="hidden md:flex fixed left-72 right-0 top-0 z-[65] h-16 items-center justify-end bg-[#f9f9fb] px-6">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Deconnecter</span>
          </button>
        </header>
      ) : null}

      <aside className="smartestate-dashboard-sidebar hidden md:flex h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-[#ffffff] flex-col z-[70]">
        <div className="px-8 py-10">
          <Link
            className="text-xl font-headline font-black tracking-tighter text-primary uppercase"
            to={homeRoute}
            {...getPrefetchHandlers(homeRoute)}
          >
            SmartEstate
          </Link>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            {getRoleLabel(user?.role)}
          </p>
        </div>

        <nav className="flex-1 flex flex-col gap-1" aria-label="Navigation principale">
          {navItems.map((item) => {
            const active = isActive(item.paths);
            return (
              <Link
                className={
                  active
                    ? "group flex items-center gap-3 px-8 py-4 bg-[#eeeef0] text-secondary font-bold border-r-4 border-secondary"
                    : "group flex items-center gap-3 px-8 py-4 text-on-surface-variant hover:bg-surface-container-low hover:translate-x-1 transition-all duration-200"
                }
                key={item.href}
                to={item.href}
                {...getPrefetchHandlers(item.href)}
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {!isSimpleUser ? (
          <div className="px-6 pb-4">
            <Link
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white flex items-center justify-center gap-2"
              to={primaryAction.href}
              {...getPrefetchHandlers(primaryAction.href)}
            >
              <span className="material-symbols-outlined text-base">{primaryAction.icon}</span>
              <span>{primaryAction.label}</span>
            </Link>
          </div>
        ) : null}

        <div className="border-t border-outline-variant/10 px-6 py-5">
          <p className="truncate text-sm font-bold text-primary">{user?.full_name}</p>
          <p className="truncate text-xs text-on-surface-variant">{user?.email}</p>
          {!isSimpleUser ? (
            <button
              className="mt-4 w-full rounded-xl border border-outline-variant/20 px-4 py-3 text-sm font-semibold text-primary"
              type="button"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          ) : null}
        </div>
      </aside>

      <header className="smartestate-mobile-dashboard-nav fixed left-0 right-0 top-0 z-[70] md:hidden bg-white/95 border-b border-[#c6c5d4]/15">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            className="font-headline font-black tracking-tighter text-primary uppercase"
            to={homeRoute}
            {...getPrefetchHandlers(homeRoute)}
          >
            SmartEstate
          </Link>
          {isSimpleUser ? (
            <button
              aria-label="Déconnexion"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white"
              onClick={handleLogout}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          ) : (
            <Link
              aria-label={primaryAction.label}
              className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center"
              to={primaryAction.href}
              {...getPrefetchHandlers(primaryAction.href)}
            >
              <span className="material-symbols-outlined text-xl">{primaryAction.icon}</span>
            </Link>
          )}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Navigation mobile">
          {navItems.map((item) => {
            const active = isActive(item.paths);
            return (
              <Link
                className={
                  active
                    ? "shrink-0 rounded-lg bg-[#eeeef0] px-3 py-2 text-secondary"
                    : "shrink-0 rounded-lg px-3 py-2 text-on-surface-variant"
                }
                key={item.href}
                to={item.href}
                {...getPrefetchHandlers(item.href)}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
