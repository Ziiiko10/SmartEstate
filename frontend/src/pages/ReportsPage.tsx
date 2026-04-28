import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body { font-family: 'Manrope', sans-serif; background-color: #f9f9fb; color: #1a1c1d; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .chart-bar-casa { background-color: rgba(27, 109, 36, 0.2); border-top: 2px solid #1b6d24; }
        .chart-bar-marrakech { background-color: rgba(26, 35, 126, 0.2); border-top: 2px solid #1a237e; }`;

export default function ReportsPage() {
  return (
    <ImportedPageDocument
      bodyClassName="flex"
      title="SmartEstate - Rapports & Analyses"
      styles={pageStyles}
    >
      <div>
  {/* SideNavBar */}
  <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-white flex flex-col py-8 border-r border-slate-200/50 font-medium">
    <div className="px-6 mb-10">
      <h1 className="text-2xl font-black text-primary tracking-tight">SmartEstate</h1>
    </div>
    <nav className="flex-1 space-y-1">
      <a className="flex items-center gap-3 text-slate-500 px-6 py-3 hover:bg-slate-50 transition-all duration-300" href="#">
        <span className="material-symbols-outlined text-[22px]">dashboard</span>
        <span className="text-sm">Tableau de Bord</span>
      </a>
      <a className="flex items-center gap-3 text-slate-500 px-6 py-3 hover:bg-slate-50 transition-all duration-300" href="#">
        <span className="material-symbols-outlined text-[22px]">domain</span>
        <span className="text-sm">Portfolio</span>
      </a>
      <a className="flex items-center gap-3 text-slate-500 px-6 py-3 hover:bg-slate-50 transition-all duration-300" href="#">
        <span className="material-symbols-outlined text-[22px]">calculate</span>
        <span className="text-sm">Estimation</span>
      </a>
      <a className="flex items-center gap-3 text-slate-500 px-6 py-3 hover:bg-slate-50 transition-all duration-300" href="#">
        <span className="material-symbols-outlined text-[22px]">insights</span>
        <span className="text-sm">Scénarios</span>
      </a>
      <a className="flex items-center gap-3 text-slate-500 px-6 py-3 hover:bg-slate-50 transition-all duration-300" href="#">
        <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
        <span className="text-sm">Recommandations</span>
      </a>
      {/* Active Tab: Rapports */}
      <a className="flex items-center gap-3 text-secondary bg-secondary/5 border-r-4 border-secondary px-6 py-3" href="#">
        <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: '"FILL" 1'}}>assessment</span>
        <span className="text-sm font-bold">Rapports</span>
      </a>
      <a className="flex items-center gap-3 text-slate-500 px-6 py-3 hover:bg-slate-50 transition-all duration-300" href="#">
        <span className="material-symbols-outlined text-[22px]">group</span>
        <span className="text-sm">Équipe</span>
      </a>
    </nav>
    <div className="mt-auto px-6 space-y-4">
      <button className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm">
        <span className="material-symbols-outlined text-lg">add</span>
        <span className="text-sm">Nouvelle Analyse</span>
      </button>
      <div className="pt-4 border-t border-slate-100">
        <a className="flex items-center gap-3 text-slate-500 py-2 hover:text-secondary transition-colors" href="#">
          <span className="material-symbols-outlined text-xl">help</span>
          <span className="text-xs">Aide</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 py-2 hover:text-secondary transition-colors" href="#">
          <span className="material-symbols-outlined text-xl">headset_mic</span>
          <span className="text-xs">Support</span>
        </a>
      </div>
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
        <div className="w-10 h-10 rounded-full bg-primary-container/10 overflow-hidden border border-slate-100">
          <img alt="Yassine Mansouri" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1armMelmf14tDTXp8Bq5XSLGrs1kYVkBJygSoeZ-L7OmDo8DWUCbITdvxi6MEU3BkpDbnrPGH6ctxXsk9sFX3t4EDk0v4CJZlgcfauN_KiDNWmWsHsmXhvbOG0ircNf6mrG8rqCnx-cougIZ5XljJq7ZcsaGHQe2EcVjmlVD41qi1nqvIgn7UAJOJGTnOmXG5EK7GFRpgBeqgyqCkSWBV4fN4LHvtVu8sfCMgxYbGc1vdFKvaHy-0O-lXSNVuaF48Kz7SZD5WDX3N" />
        </div>
        <div>
          <p className="text-xs font-bold text-primary">Yassine Mansouri</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Administrateur</p>
        </div>
      </div>
    </div>
  </aside>
  {/* Main Content */}
  <main className="ml-64 flex-1 min-h-screen bg-background">
    {/* TopAppBar */}
    <header className="fixed top-0 right-0 left-64 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 h-20 flex items-center justify-between px-10">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-secondary/20 text-sm" placeholder="Rechercher un rapport ou une ville..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-secondary transition-colors p-2">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
        </button>
        <button className="text-slate-500 hover:text-secondary transition-colors p-2">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        <button className="text-primary font-bold text-sm tracking-tight hover:text-secondary transition-colors">Déconnexion</button>
      </div>
    </header>
    <div className="pt-28 px-10 pb-12 max-w-7xl mx-auto">
      {/* Hero Title & Quick Filter */}
      <div className="flex justify-between items-end mb-10">
        <div className="max-w-2xl">
          <p className="text-secondary font-bold tracking-[0.2em] text-[10px] uppercase mb-3">Analyses de Performance</p>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-4">Rapports &amp; Insights</h2>
          <p className="text-on-surface-variant text-base leading-relaxed">Visualisez la dynamique du marché marocain et exportez vos analyses stratégiques en un clic.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container rounded-lg p-1 flex">
            <button className="px-6 py-2 rounded-md bg-white shadow-sm text-sm font-bold text-primary">Vue d'ensemble</button>
            <button className="px-6 py-2 rounded-md text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">Par Ville</button>
          </div>
        </div>
      </div>
      {/* Bento Grid - Section Analysis */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Market Trend Chart - Casablanca (Large) */}
        <div className="col-span-8 bg-white rounded-xl p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">Évolution Casablanca vs Marrakech</h3>
              <p className="text-sm text-on-surface-variant">Indice des prix immobiliers (2020 - 2024)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-[11px] font-bold text-primary uppercase">Casa Finance City</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[11px] font-bold text-primary uppercase">Marrakech Hivernage</span>
              </div>
            </div>
          </div>
          {/* Mockup Chart Area */}
          <div className="h-64 relative flex items-end gap-2">
            <div className="flex-1 bg-surface-container-low h-full relative rounded-t-sm">
              <div className="absolute bottom-0 left-0 w-full chart-bar-casa h-[40%]" />
              <div className="absolute bottom-0 left-0 w-full chart-bar-marrakech h-[30%]" />
            </div>
            <div className="flex-1 bg-surface-container-low h-full relative rounded-t-sm">
              <div className="absolute bottom-0 left-0 w-full chart-bar-casa h-[55%]" />
              <div className="absolute bottom-0 left-0 w-full chart-bar-marrakech h-[35%]" />
            </div>
            <div className="flex-1 bg-surface-container-low h-full relative rounded-t-sm">
              <div className="absolute bottom-0 left-0 w-full chart-bar-casa h-[50%]" />
              <div className="absolute bottom-0 left-0 w-full chart-bar-marrakech h-[45%]" />
            </div>
            <div className="flex-1 bg-surface-container-low h-full relative rounded-t-sm">
              <div className="absolute bottom-0 left-0 w-full chart-bar-casa h-[65%]" />
              <div className="absolute bottom-0 left-0 w-full chart-bar-marrakech h-[55%]" />
            </div>
            <div className="flex-1 bg-surface-container-low h-full relative rounded-t-sm">
              <div className="absolute bottom-0 left-0 w-full chart-bar-casa h-[75%]" />
              <div className="absolute bottom-0 left-0 w-full chart-bar-marrakech h-[60%]" />
            </div>
            <div className="flex-1 bg-surface-container-low h-full relative rounded-t-sm">
              <div className="absolute bottom-0 left-0 w-full chart-bar-casa h-[85%]" />
              <div className="absolute bottom-0 left-0 w-full chart-bar-marrakech h-[70%]" />
            </div>
          </div>
        </div>
        {/* KPI Cards */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-primary text-white rounded-xl p-8 flex flex-col justify-between shadow-lg shadow-primary/10">
            <div>
              <span className="material-symbols-outlined opacity-60 mb-4 text-3xl">trending_up</span>
              <p className="text-[10px] opacity-70 uppercase tracking-[0.2em] font-black">Rendement Moyen</p>
              <h4 className="text-5xl font-extrabold mt-2">6.8<span className="text-2xl ml-1 font-medium opacity-60">%</span></h4>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs font-bold text-secondary-container">+1.2% par rapport à 2023</p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl p-8 border border-slate-100 shadow-sm">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-4">Volume Transactions</p>
            <h4 className="text-4xl font-extrabold text-primary tracking-tight">1.2B <span className="text-lg font-bold text-on-surface-variant ml-1">MAD</span></h4>
            <div className="w-full h-2 bg-surface-container-high rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-secondary w-[72%]" />
            </div>
            <p className="text-[10px] mt-3 text-on-surface-variant font-bold">72% de l'objectif annuel atteint</p>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="flex flex-wrap items-center justify-between mb-10 pb-6 border-b border-slate-200/50">
        <div className="flex gap-6">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Type d'actif</label>
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 rounded-lg text-sm font-bold text-primary px-4 py-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none min-w-[180px] cursor-pointer">
                <option>Tous les actifs</option>
                <option>Résidentiel Luxe</option>
                <option>Bureaux (CFC)</option>
                <option>Retail &amp; Mall</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Période</label>
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 rounded-lg text-sm font-bold text-primary px-4 py-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none min-w-[180px] cursor-pointer">
                <option>Derniers 12 mois</option>
                <option>Année 2023</option>
                <option>Trimestre en cours</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-primary px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">filter_list</span> Filtrer
          </button>
          <button className="bg-secondary text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-95 shadow-md transition-all">
            <span className="material-symbols-outlined text-lg">download</span> Exporter Tout
          </button>
        </div>
      </div>
      {/* Main Content Area: AI Reports vs Table */}
      <div className="grid grid-cols-12 gap-8">
        {/* Recent Reports Table */}
        <div className="col-span-8">
          <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">history</span>
            Rapports Générés Récemment
          </h3>
          <div className="space-y-4">
            {/* Report Row */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 hover:border-secondary/30 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/5 rounded-lg flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                  <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: '"FILL" 1'}}>picture_as_pdf</span>
                </div>
                <div>
                  <p className="font-bold text-primary text-sm group-hover:text-secondary transition-colors">Analyse Marché Résidentiel - Marrakech Hivernage</p>
                  <p className="text-[11px] text-slate-500 font-medium">Généré le 12 Oct 2024 • 4.2 MB • Par IA Insights</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-lg"><span className="material-symbols-outlined">visibility</span></button>
                <button className="p-2 text-slate-400 hover:text-secondary transition-colors hover:bg-slate-50 rounded-lg"><span className="material-symbols-outlined">download</span></button>
              </div>
            </div>
            {/* Report Row */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 hover:border-secondary/30 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>table_chart</span>
                </div>
                <div>
                  <p className="font-bold text-primary text-sm group-hover:text-secondary transition-colors">Reporting Financier Q3 - Portfolio CFC Casablanca</p>
                  <p className="text-[11px] text-slate-500 font-medium">Généré le 05 Oct 2024 • 1.8 MB • Manuel</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-lg"><span className="material-symbols-outlined">visibility</span></button>
                <button className="p-2 text-slate-400 hover:text-secondary transition-colors hover:bg-slate-50 rounded-lg"><span className="material-symbols-outlined">download</span></button>
              </div>
            </div>
            {/* Report Row */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 hover:border-secondary/30 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/5 rounded-lg flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                  <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: '"FILL" 1'}}>picture_as_pdf</span>
                </div>
                <div>
                  <p className="font-bold text-primary text-sm group-hover:text-secondary transition-colors">Projection Valorisation 2025 - Tanger Med Area</p>
                  <p className="text-[11px] text-slate-500 font-medium">Généré le 28 Sep 2024 • 3.5 MB • Par IA Insights</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-lg"><span className="material-symbols-outlined">visibility</span></button>
                <button className="p-2 text-slate-400 hover:text-secondary transition-colors hover:bg-slate-50 rounded-lg"><span className="material-symbols-outlined">download</span></button>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white hover:border-secondary hover:text-secondary transition-all">
            Voir tout l'historique
          </button>
        </div>
        {/* AI Personalized Section */}
        <div className="col-span-4">
          <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20">
            {/* Decorative element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary rounded-full blur-[60px] opacity-20" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-container px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <span className="material-symbols-outlined text-xs">auto_awesome</span> 
                Rapports IA Personnalisés
              </div>
              <h3 className="text-2xl font-extrabold mb-4 leading-tight">Générez une analyse prédictive sur mesure</h3>
              <p className="text-white/70 text-sm mb-8 leading-relaxed font-medium">Utilisez nos algorithmes de Machine Learning pour prédire l'évolution des quartiers en plein essor à Casablanca et Rabat.</p>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Focus Géographique</p>
                  <button className="w-full flex justify-between items-center text-sm font-bold">
                    Anfa Park &amp; CFC <span className="material-symbols-outlined text-lg">expand_more</span>
                  </button>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Indicateurs clés</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-bold">ROI 5 ans</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-bold">Taux Vacance</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-bold">+2 plus</span>
                  </div>
                </div>
                <button className="w-full bg-secondary hover:opacity-90 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-3 mt-4">
                  Générer avec l'IA
                  <span className="material-symbols-outlined text-lg">rocket_launch</span>
                </button>
              </div>
            </div>
          </div>
          {/* Market Insights Tip */}
          <div className="mt-8 bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <h4 className="font-black text-primary text-sm flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-lg">lightbulb</span>
              Conseil du Marché
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">Le quartier <strong>Bouskoura</strong> montre une accélération de +14% sur la demande locative ce trimestre. Pensez à réévaluer vos actifs dans cette zone.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

    </ImportedPageDocument>
  );
}
