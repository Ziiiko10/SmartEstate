import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    href: "/tableau-de-bord-executif",
    icon: "dashboard",
    label: "Tableau de Bord",
    paths: ["/tableau-de-bord-executif"],
  },
  {
    href: "/portfolio-immobilier-maroc",
    icon: "domain",
    label: "Portfolio",
    paths: ["/portfolio-immobilier-maroc"],
  },
  {
    href: "/annonces-etl",
    icon: "travel_explore",
    label: "Annonces ETL",
    paths: ["/annonces-etl"],
  },
  {
    href: "/estimation-immobiliere-ia",
    icon: "calculate",
    label: "Estimation",
    paths: ["/estimation-immobiliere-ia"],
  },
  {
    href: "/simulateur-scenarios-maroc",
    icon: "query_stats",
    label: "Scénarios",
    paths: ["/simulateur-scenarios", "/simulateur-scenarios-maroc"],
  },
  {
    href: "/recommandations-ia",
    icon: "auto_awesome",
    label: "Recommandations",
    paths: ["/recommandations-ia"],
  },
  {
    href: "/rapports",
    icon: "description",
    label: "Rapports",
    paths: ["/rapports"],
  },
  {
    href: "/gestion-equipe",
    icon: "group",
    label: "Équipe",
    paths: ["/gestion-equipe"],
  },
];

export default function DashboardSidebar() {
  const location = useLocation();

  function isActive(paths: string[]) {
    return paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  }

  return (
    <>
      <aside className="smartestate-dashboard-sidebar hidden md:flex h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-[#ffffff] flex-col z-[70]">
        <div className="px-8 py-10">
          <Link
            className="text-xl font-headline font-black tracking-tighter text-primary uppercase"
            to="/tableau-de-bord-executif"
          >
            SmartEstate
          </Link>
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

        <div className="p-6">
          <Link
            className="w-full bg-gradient-to-br from-secondary to-on-secondary-container text-white py-3 rounded-lg font-headline font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            to="/estimation-immobiliere-ia"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nouvelle Analyse
          </Link>
        </div>
      </aside>

      <header className="smartestate-mobile-dashboard-nav fixed left-0 right-0 top-0 z-[70] md:hidden bg-white/95 border-b border-[#c6c5d4]/15">
        <div className="flex items-center justify-between px-4 py-3">
          <Link className="font-headline font-black tracking-tighter text-primary uppercase" to="/tableau-de-bord-executif">
            SmartEstate
          </Link>
          <Link
            aria-label="Nouvelle analyse"
            className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center"
            to="/estimation-immobiliere-ia"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </Link>
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
