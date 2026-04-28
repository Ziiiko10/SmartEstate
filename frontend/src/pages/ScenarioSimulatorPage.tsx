import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Custom Sliders */
        input[type=range] {
            -webkit-appearance: none;
            background: transparent;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #eeeef0;
            border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #1b6d24;
            cursor: pointer;
            -webkit-appearance: none;
            margin-top: -6px;
        }`;

export default function ScenarioSimulatorPage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-background font-body antialiased"
      title="SmartEstate | Simulateur de Scénarios d'Investissement"
      styles={pageStyles}
    >
      <div>
  {/* SideNavBar */}
  <aside className="h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-white flex flex-col z-50">
    <div className="px-8 py-10">
      <h1 className="text-xl font-headline font-bold tracking-tighter text-primary uppercase">SmartEstate</h1>
    </div>
    <nav className="flex-1 px-4 space-y-1">
      <a className="group flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
        <span className="font-medium">Tableau de Bord</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined" data-icon="domain">domain</span>
        <span className="font-medium">Portfolio</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined" data-icon="calculate">calculate</span>
        <span className="font-medium">Estimation</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 bg-surface-container text-secondary font-bold border-r-4 border-secondary transition-all duration-200" href="#">
        <span className="material-symbols-outlined" data-icon="query_stats" data-weight="fill" style={{fontVariationSettings: '"FILL" 1'}}>query_stats</span>
        <span className="font-medium">Scénarios</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
        <span className="font-medium">Recommandations</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined" data-icon="description">description</span>
        <span className="font-medium">Rapports</span>
      </a>
    </nav>
    <div className="p-6 mt-auto">
      <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
        <img alt="Yassine Mansouri" className="w-10 h-10 rounded-full object-cover" data-alt="professional portrait of a middle-aged male executive in a sharp navy suit with clean studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUHrw_334IU742AuZYExZquAbo5aMloQWDyRPztqtCMys7gf2qYI9CSOIpoGbeU-RujdcD3P3Nl8yl5NyT3dhT9Dmunr5frryiLhx3fkFPgSj4-wm_6dIuGxHcijuH1oz2IMbGSIXaBIdCophb6Uow9Bj8WKzVFe5VMCUJ9ljbdGk_MaJpsHwEii-_wd5J2RhLYAgqH3xDNKQ0qKP5G-p-EbnZxOOIz-fyouq16VLwAwhm3ZXESG2oDT7i4Ht4quP3uDMB4XdCt1_7" />
        <div className="overflow-hidden">
          <p className="text-sm font-bold truncate">Yassine Mansouri</p>
          <p className="text-xs text-on-surface-variant truncate">Directeur d'Investissement</p>
        </div>
      </div>
    </div>
  </aside>
  {/* Main Canvas */}
  <main className="ml-72 min-h-screen">
    {/* TopAppBar */}
    <header className="flex justify-between items-center px-8 py-6 w-full bg-surface-bright/80 backdrop-blur-md sticky top-0 z-40">
      <div>
        <h2 className="text-2xl font-headline font-extrabold tracking-tight text-primary">Simulateur de Scénarios</h2>
        <p className="text-sm text-on-surface-variant">Modélisation financière avancée de vos actifs</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm" data-icon="search">search</span>
          <input className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 w-64" placeholder="Rechercher un actif..." type="text" />
        </div>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
        <button className="bg-gradient-to-br from-secondary to-on-secondary-container text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
          Nouvelle Analyse
        </button>
      </div>
    </header>
    <section className="px-8 py-8 max-w-7xl mx-auto space-y-8">
      {/* Parameter Controls & Main Metrics */}
      <div className="grid grid-cols-12 gap-8">
        {/* Inputs Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-outline-variant/15 shadow-sm">
            <h3 className="text-lg font-headline font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" data-icon="tune">tune</span>
              Paramètres de Base
            </h3>
            <div className="space-y-8">
              {/* Apport */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-semibold text-on-surface-variant">Apport Personnel</label>
                  <span className="text-primary font-bold">120 000 €</span>
                </div>
                <input className="w-full" max={500000} min={0} step={5000} type="range" />
                <div className="flex justify-between text-[10px] text-outline font-bold uppercase tracking-wider">
                  <span>0 €</span>
                  <span>500k €</span>
                </div>
              </div>
              {/* Taux */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-semibold text-on-surface-variant">Taux de Crédit (20 ans)</label>
                  <span className="text-primary font-bold">3.85 %</span>
                </div>
                <input className="w-full" max={6} min="0.5" step="0.05" type="range" />
                <div className="flex justify-between text-[10px] text-outline font-bold uppercase tracking-wider">
                  <span>0.5%</span>
                  <span>6.0%</span>
                </div>
              </div>
              {/* Travaux */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-semibold text-on-surface-variant">Budget Travaux</label>
                  <span className="text-primary font-bold">45 000 €</span>
                </div>
                <input className="w-full" max={150000} min={0} step={1000} type="range" />
                <div className="flex justify-between text-[10px] text-outline font-bold uppercase tracking-wider">
                  <span>0 €</span>
                  <span>150k €</span>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-surface-container">
              <div className="flex items-center gap-3 p-4 bg-primary-container/5 rounded-lg">
                <span className="material-symbols-outlined text-primary" data-icon="info">info</span>
                <p className="text-xs text-on-primary-fixed-variant leading-relaxed">Les frais de notaire sont calculés automatiquement à 7.5% du prix d'acquisition.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Comparison Grid */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scenario: Longue Durée */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/15 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-surface-container-low rounded-lg text-primary">
                  <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Option A</span>
              </div>
              <h4 className="font-headline font-bold text-on-surface mb-1">Longue Durée</h4>
              <p className="text-xs text-on-surface-variant mb-6">Stabilité &amp; Défiscalisation</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">Cash-Flow Mensuel</p>
                  <p className="text-xl font-headline font-extrabold text-secondary">+420 €</p>
                </div>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">TRI (10 ans)</p>
                  <p className="text-xl font-headline font-extrabold text-primary">8.4%</p>
                </div>
              </div>
            </div>
            {/* Scenario: Saisonnier */}
            <div className="bg-primary-container text-white p-6 rounded-xl border border-primary relative overflow-hidden shadow-lg group">
              <div className="absolute top-0 right-0 p-3">
                <span className="bg-secondary-container text-on-secondary-container text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter">Meilleur Rendement</span>
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-white/10 rounded-lg text-white">
                  <span className="material-symbols-outlined" data-icon="beach_access">beach_access</span>
                </div>
              </div>
              <h4 className="font-headline font-bold text-white mb-1 relative z-10">Saisonnier (Marrakech)</h4>
              <p className="text-xs text-white/70 mb-6 relative z-10">Rendement Brut Elevé</p>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold">Cash-Flow Mensuel</p>
                  <p className="text-xl font-headline font-extrabold text-secondary-container">+1 150 €</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold">TRI (10 ans)</p>
                  <p className="text-xl font-headline font-extrabold">14.2%</p>
                </div>
              </div>
              {/* Background Grain/Texture Simulation */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
            </div>
            {/* Scenario: Achat-Revente */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/15 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-surface-container-low rounded-lg text-primary">
                  <span className="material-symbols-outlined" data-icon="handshake">handshake</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Option C</span>
              </div>
              <h4 className="font-headline font-bold text-on-surface mb-1">Achat-Revente</h4>
              <p className="text-xs text-on-surface-variant mb-6">Plus-Value Immédiate</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">Plus-Value Nette</p>
                  <p className="text-xl font-headline font-extrabold text-primary">85 000 €</p>
                </div>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">TRI (18 mois)</p>
                  <p className="text-xl font-headline font-extrabold text-primary">22.1%</p>
                </div>
              </div>
            </div>
          </div>
          {/* Visualization Chart Area */}
          <div className="bg-white p-8 rounded-xl border border-outline-variant/15 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-lg font-headline font-bold">Évolution de la Valeur Nette</h3>
                <p className="text-sm text-on-surface-variant">Projection sur une période de 15 ans</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-on-surface-variant">L. Durée</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-xs font-bold text-on-surface-variant">Marrakech</span>
                </div>
              </div>
            </div>
            {/* Placeholder for Data Visualization (CSS implementation) */}
            <div className="h-64 flex items-end justify-between gap-2 relative">
              {/* Y-Axis labels */}
              <div className="absolute -left-4 h-full flex flex-col justify-between text-[9px] text-outline font-bold">
                <span>500k</span>
                <span>250k</span>
                <span>0</span>
              </div>
              {/* Chart bars/lines simulation */}
              <div className="flex-1 flex items-end gap-1 px-4">
                <div className="w-full h-[20%] bg-surface-container rounded-t-sm" />
                <div className="w-full h-[25%] bg-primary/40 rounded-t-sm" />
                <div className="w-full h-[32%] bg-secondary/60 rounded-t-sm" />
                <div className="w-full h-[38%] bg-primary/60 rounded-t-sm" />
                <div className="w-full h-[45%] bg-secondary/80 rounded-t-sm" />
                <div className="w-full h-[55%] bg-primary/80 rounded-t-sm" />
                <div className="w-full h-[70%] bg-secondary rounded-t-sm" />
                <div className="w-full h-[85%] bg-primary rounded-t-sm" />
                <div className="w-full h-[95%] bg-secondary shadow-lg rounded-t-sm" />
              </div>
            </div>
            <div className="flex justify-between px-10 pt-4 border-t border-surface-container mt-2">
              <span className="text-[10px] text-outline font-bold">AN 1</span>
              <span className="text-[10px] text-outline font-bold">AN 5</span>
              <span className="text-[10px] text-outline font-bold">AN 10</span>
              <span className="text-[10px] text-outline font-bold">AN 15</span>
            </div>
          </div>
        </div>
      </div>
      {/* Detailed Analysis Bento Grid */}
      <div className="grid grid-cols-12 gap-8 pt-4">
        {/* Property Focus */}
        <div className="col-span-12 md:col-span-7 bg-white rounded-xl overflow-hidden border border-outline-variant/15 flex shadow-sm group">
          <div className="w-1/2 relative overflow-hidden">
            <img alt="Luxury Villa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="luxury riad in marrakech with white walls arched doorways and a turquoise pool surrounded by tropical plants" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC9uzSMmdfX-AqTwWwg1Q-1HoGPK9lol7RZ0ZyBr-Xj4zKPNs7WsXX097jLiB4ldb8lbq8PYB4C6Xi2D0KbWiEgahgjIwE3kc38-LB_G-eb-SjF8R0FpbmoxFaksA3qy0DAOZTmpTFIQh1SioBHcOxu74kNADOVObUbbbq1WCHPiac2G5NiH1pFL--z3EYwmgwLbIzKDf2Rzc0QlRSoqMjher6G1Lc2cvQ2-U30uWlmXmGfrLOqSxpyBFJSaEi4GAUPkTwmqP-FLQW" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Focus Actuel</p>
              <h5 className="text-xl font-headline font-bold">Riad Medina, Marrakech</h5>
            </div>
          </div>
          <div className="w-1/2 p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-lg" data-icon="verified">verified</span>
              <span className="text-xs font-bold text-secondary uppercase tracking-tighter">Haute Rentabilité</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-surface-container pb-2">
                <span className="text-sm text-on-surface-variant">Occupation Estimée</span>
                <span className="font-bold">68%</span>
              </div>
              <div className="flex justify-between items-center border-b border-surface-container pb-2">
                <span className="text-sm text-on-surface-variant">Revenu Nuitée Moy.</span>
                <span className="font-bold">245 €</span>
              </div>
              <div className="flex justify-between items-center border-b border-surface-container pb-2">
                <span className="text-sm text-on-surface-variant">Conciergerie (20%)</span>
                <span className="font-bold text-error">-980 €/m</span>
              </div>
            </div>
            <button className="w-full text-xs font-bold text-primary py-3 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg uppercase tracking-widest">
              Voir le détail des charges
            </button>
          </div>
        </div>
        {/* Recommendation Engine */}
        <div className="col-span-12 md:col-span-5 bg-surface-container-low p-8 rounded-xl border-none relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <h4 className="text-lg font-headline font-extrabold text-primary mb-4">L'Avis de l'Expert</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              "Compte tenu de votre apport de 120k€, le scénario **Saisonnier à Marrakech** présente le meilleur effet de levier. Bien que le risque opérationnel soit plus élevé, le Cash-Flow couvre largement le crédit, vous permettant une auto-finance complète dès le mois 1."
            </p>
            <div className="flex gap-4">
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-outline-variant/10">
                <p className="text-[10px] text-outline font-bold uppercase mb-1">Score de Risque</p>
                <div className="flex gap-1">
                  <div className="w-3 h-1 bg-secondary rounded-full" />
                  <div className="w-3 h-1 bg-secondary rounded-full" />
                  <div className="w-3 h-1 bg-secondary rounded-full" />
                  <div className="w-3 h-1 bg-surface-variant rounded-full" />
                  <div className="w-3 h-1 bg-surface-variant rounded-full" />
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-outline-variant/10">
                <p className="text-[10px] text-outline font-bold uppercase mb-1">Potentiel Exit</p>
                <p className="text-sm font-bold text-primary">Très Fort</p>
              </div>
            </div>
          </div>
          {/* Aesthetic element */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
    {/* Contextual FAB */}
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-50">
      <button className="bg-white text-on-surface p-4 rounded-full shadow-xl border border-outline-variant/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
        <span className="material-symbols-outlined" data-icon="ios_share">ios_share</span>
        <span className="text-sm font-bold pr-2">Exporter PDF</span>
      </button>
      <button className="bg-gradient-to-br from-secondary to-on-secondary-container text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-3xl" data-icon="bolt">bolt</span>
      </button>
    </div>
  </main>
</div>

    </ImportedPageDocument>
  );
}
