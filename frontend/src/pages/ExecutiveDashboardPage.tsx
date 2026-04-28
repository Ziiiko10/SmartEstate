import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .glass-panel {
            background: rgba(249, 249, 251, 0.8);
            backdrop-filter: blur(24px);
        }`;

export default function ExecutiveDashboardPage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface selection:bg-secondary-container"
      title="SmartEstate - Tableau de Bord Exécutif"
      styles={pageStyles}
    >
      <div>
  {/* TopNavBar */}
  <header className="fixed top-0 left-0 right-0 z-50 bg-[#f9f9fb] dark:bg-slate-950 shadow-[0_12px_40px_rgba(26,28,29,0.06)] border-b border-opacity-10 h-16 flex items-center px-8 justify-between">
    <div className="flex items-center gap-8">
      <span className="text-xl font-bold tracking-tighter text-[#1A237E] dark:text-white uppercase font-headline">SmartEstate</span>
      <div className="hidden md:flex gap-6">
        <span className="text-[#1A237E] dark:text-white font-semibold border-b-2 border-[#1b6d24] cursor-pointer font-['Manrope'] tracking-tight">Tableau de Bord</span>
        <span className="text-[#454652] dark:text-slate-400 font-medium hover:text-[#1b6d24] transition-colors duration-300 cursor-pointer font-['Manrope'] tracking-tight">Portfolio</span>
        <span className="text-[#454652] dark:text-slate-400 font-medium hover:text-[#1b6d24] transition-colors duration-300 cursor-pointer font-['Manrope'] tracking-tight">Recherche</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 hover:bg-surface-container rounded-full transition-all">notifications</span>
      <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 hover:bg-surface-container rounded-full transition-all">settings</span>
      <img alt="Yassine Mansouri" className="w-10 h-10 rounded-full border-2 border-surface-container-high object-cover" data-alt="professional portrait of an executive male in his 40s with a sharp suit and confident expression against a neutral studio background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB708neJT7P5gfxeMcPDtBjBKEZm4zslHlZEW2VaYUru1nxD24Ms6nQipayGmn0jARNy--ZXQPXm5qkgI0GnwWQToFFiVzbprmXHD_M20uMLU67sBFXP7eOGfdzgp2xS9s4wl9_-UVUbutxSal3Mu7kZOdJNBNFGYU6995u4Vu_U8yYCfJBCHDqJHE2Fh22w6wsX2C46yGtuMfy-0F75TDr8y0I_F5KnEnE9A9U0Jobup3lhGAaPNgh6E_NUGdqohBQs_2qH4zVQmD2" />
    </div>
  </header>
  {/* SideNavBar */}
  <aside className="hidden md:flex flex-col h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-[#ffffff] dark:bg-slate-900 z-40 pt-20">
    <div className="px-6 mb-8 flex flex-col gap-1">
      <h2 className="text-[#1A237E] font-bold text-lg">Yassine Mansouri</h2>
      <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">Directeur d'Investissement</p>
    </div>
    <nav className="flex-1 space-y-1">
      <div className="group flex items-center gap-3 px-6 py-4 bg-[#eeeef0] dark:bg-slate-800 text-[#1b6d24] dark:text-emerald-400 font-bold border-r-4 border-[#1b6d24] cursor-pointer">
        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
        <span className="font-['Inter'] text-sm antialiased">Tableau de Bord</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] dark:text-slate-400 hover:bg-[#f9f9fb] dark:hover:bg-slate-800/50 hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="domain">domain</span>
        <span className="font-['Inter'] text-sm antialiased">Portfolio</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] dark:text-slate-400 hover:bg-[#f9f9fb] dark:hover:bg-slate-800/50 hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="calculate">calculate</span>
        <span className="font-['Inter'] text-sm antialiased">Estimation</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] dark:text-slate-400 hover:bg-[#f9f9fb] dark:hover:bg-slate-800/50 hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="query_stats">query_stats</span>
        <span className="font-['Inter'] text-sm antialiased">Scénarios</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] dark:text-slate-400 hover:bg-[#f9f9fb] dark:hover:bg-slate-800/50 hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
        <span className="font-['Inter'] text-sm antialiased">Recommandations</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] dark:text-slate-400 hover:bg-[#f9f9fb] dark:hover:bg-slate-800/50 hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="description">description</span>
        <span className="font-['Inter'] text-sm antialiased">Rapports</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] dark:text-slate-400 hover:bg-[#f9f9fb] dark:hover:bg-slate-800/50 hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="group">group</span>
        <span className="font-['Inter'] text-sm antialiased">Équipe</span>
      </div>
    </nav>
    <div className="p-6">
      <button className="w-full bg-gradient-to-br from-secondary to-on-secondary-container text-on-secondary py-3 rounded-lg font-bold shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-sm">add</span>
        <span>Nouvelle Analyse</span>
      </button>
    </div>
    <div className="border-t border-surface-variant p-4 space-y-1">
      <div className="group flex items-center gap-3 px-6 py-2 text-[#454652] hover:text-primary cursor-pointer text-sm">
        <span className="material-symbols-outlined" data-icon="help">help</span>
        <span>Aide</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-2 text-[#454652] hover:text-error cursor-pointer text-sm">
        <span className="material-symbols-outlined" data-icon="logout">logout</span>
        <span>Déconnexion</span>
      </div>
    </div>
  </aside>
  {/* Main Content */}
  <main className="md:ml-72 pt-24 px-8 pb-12 min-h-screen">
    {/* Header Section */}
    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-1">Vue d'ensemble du marché marocain</p>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tighter">Tableau de Bord Exécutif</h1>
      </div>
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-xl">
        <span className="material-symbols-outlined text-secondary">calendar_today</span>
        <span className="text-on-surface-variant font-medium">Octobre 2023 — Portfolio Actif</span>
      </div>
    </header>
    {/* Metrics Grid (Asymmetric) */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
      {/* Main Total Value Card */}
      <div className="md:col-span-6 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)] relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-on-surface-variant font-medium mb-1">Valeur Totale du Portefeuille</p>
          <h2 className="text-4xl font-extrabold font-headline text-primary mb-6">452,840,000 <span className="text-xl font-medium opacity-60">MAD</span></h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-secondary font-bold bg-secondary-container/30 px-3 py-1 rounded-full text-sm">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12.4%</span>
            </div>
            <span className="text-on-surface-variant text-sm italic">vs. trimestre précédent</span>
          </div>
        </div>
        {/* Sparkline Background */}
        <div className="absolute bottom-0 right-0 w-1/2 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg className="w-full h-full preserve-3d" viewBox="0 0 100 40">
            <path d="M0 35 Q 20 10, 40 25 T 80 5 T 100 15" fill="none" stroke="#1b6d24" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
      {/* Performance Grid */}
      <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-primary-container text-on-primary-fixed p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined mb-4 opacity-70">account_balance_wallet</span>
            <p className="font-medium opacity-80">Cash-flow Mensuel</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-headline">3,120,500 MAD</h3>
            <p className="text-on-primary-container text-sm mt-1">Rendement net: 7.2%</p>
          </div>
        </div>
        <div className="bg-surface-container-highest p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined mb-4 text-secondary" style={{fontVariationSettings: '"FILL" 1'}}>analytics</span>
            <p className="text-on-surface-variant font-medium">Performance Globale</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-headline text-primary">84.5%</h3>
            <div className="w-full bg-surface-variant h-1.5 rounded-full mt-3">
              <div className="bg-secondary h-full rounded-full w-[84.5%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Bento Layout: IA Alerts & Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* AI Opportunities (Casablanca & Marrakech) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-headline text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: '"FILL" 1'}}>auto_awesome</span>
            Alertes Opportunités IA
          </h3>
          <button className="text-secondary font-bold text-sm hover:underline">Voir tout le marché</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opportunity Casablanca */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 group">
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" data-alt="Modern high-rise glass building in Casablanca financial district during sunset with orange and blue sky reflections" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrtiO0z1P9SDl9PU_QSlCYzhaZJdr67St0y8doBeReHnlfBHS66lGOoHbRE7yg8dW8v0fDL7_ijVLbbAvrPNLd8uCvDaEul_1KYgU2kRo_7Gs9-KjgnbmCRoeSTOGRUz9KQHqaSF6QrCHyAaw89UdcV-gLfjOO1E5QROmzZ23NpobEQ-tKPFIOU0tFTcwF70Ca5mGpbvYLGJwTtUj1L-etOqgsrSvuX-ttsw0QUt8N9sc5wm35eY-IQDEBj4khFz7qnDBJ_27wsUk0" />
              <div className="absolute top-4 left-4 bg-secondary text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Casablanca</div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white font-bold">Quartier Finance City</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-primary">Tour de Bureaux Premium</h4>
                <span className="text-secondary font-bold">+18% ROI est.</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                L'algorithme détecte une sous-évaluation de 15% par rapport à l'indice du quartier. Expansion prévue du hub financier en 2024.
              </p>
              <button className="w-full py-2 border-2 border-surface-container-high rounded-lg font-bold text-sm hover:bg-surface-container-low transition-colors">Dossier d'analyse</button>
            </div>
          </div>
          {/* Opportunity Marrakech */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 group">
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" data-alt="luxury boutique riad in marrakech with a central turquoise pool and lush plants in soft morning light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKD8dYh2z0TjU4cMKxZdjDzJz2UkFfceeCLqZuNI-pkD-0NbEpVoJu_qZJj-JldkbHFU7bYKMMlEe34JUKGQxSVno2V57MXmLy2B_7X2s76h42hvJgrogEPFLrHVG6WtFpSGWScvMRQuffYXxAOtOrHEwTPcc-dZnrGCcjZClq9DyOef_PCwnUScljB2sMZzgDxFKSb4KP_p-fckUK2kA91rw-JG01zDfCEpmGkck8xdWDXmrHBXa9Lvp4S5q-pZRwDLpcG47k4RTT" />
              <div className="absolute top-4 left-4 bg-[#8690ee] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Marrakech</div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white font-bold">Hivernage - Résidentiel</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-primary">Complexe Villa "Oasis"</h4>
                <span className="text-secondary font-bold">+12% Rendement</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                Forte demande locative saisonnière détectée. Prévision de croissance du tourisme de luxe pour le T4.
              </p>
              <button className="w-full py-2 border-2 border-surface-container-high rounded-lg font-bold text-sm hover:bg-surface-container-low transition-colors">Dossier d'analyse</button>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Activity Panel */}
      <div className="bg-surface-container-low p-8 rounded-xl h-fit">
        <h3 className="text-xl font-bold font-headline text-primary mb-8">Activités Récentes</h3>
        <div className="space-y-8 relative">
          {/* Activity Line */}
          <div className="absolute left-[11px] top-0 bottom-4 w-px bg-outline-variant/30" />
          <div className="relative flex gap-4">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center relative z-10">
              <span className="material-symbols-outlined text-[14px] text-white">check</span>
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Acquisition validée</p>
              <p className="text-xs text-on-surface-variant">Résidence Marina - Tanger</p>
              <p className="text-[10px] text-on-surface-variant uppercase mt-1">Il y a 2 heures</p>
            </div>
          </div>
          <div className="relative flex gap-4">
            <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center relative z-10">
              <span className="material-symbols-outlined text-[14px] text-on-primary-container">description</span>
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Rapport Trimestriel généré</p>
              <p className="text-xs text-on-surface-variant">Consolidation du portefeuille Q3</p>
              <p className="text-[10px] text-on-surface-variant uppercase mt-1">Il y a 5 heures</p>
            </div>
          </div>
          <div className="relative flex gap-4">
            <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center relative z-10">
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">group</span>
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Réunion de comité</p>
              <p className="text-xs text-on-surface-variant">Évaluation Risques Rabat</p>
              <p className="text-[10px] text-on-surface-variant uppercase mt-1">Hier à 14:30</p>
            </div>
          </div>
          <div className="relative flex gap-4">
            <div className="w-6 h-6 rounded-full bg-error-container flex items-center justify-center relative z-10">
              <span className="material-symbols-outlined text-[14px] text-error">priority_high</span>
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Alerte Maintenance</p>
              <p className="text-xs text-on-surface-variant">Siège Social - Casablanca</p>
              <p className="text-[10px] text-on-surface-variant uppercase mt-1">Hier à 10:00</p>
            </div>
          </div>
        </div>
        <button className="w-full mt-8 py-3 text-secondary font-bold border-b border-secondary/20 hover:border-secondary transition-all">
          Historique complet
        </button>
      </div>
    </div>
    {/* Performance Chart Section */}
    <section className="mt-12">
      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold font-headline text-primary">Croissance du Portefeuille</h3>
            <p className="text-on-surface-variant text-sm">Progression de la valeur sur les 12 derniers mois</p>
          </div>
          <div className="flex bg-surface-container rounded-lg p-1">
            <button className="px-4 py-1.5 text-xs font-bold bg-white rounded-md shadow-sm">Valeur</button>
            <button className="px-4 py-1.5 text-xs font-bold text-on-surface-variant">Rendement</button>
          </div>
        </div>
        {/* Placeholder for Chart */}
        <div className="h-64 w-full bg-gradient-to-b from-surface-container-lowest to-surface-container-low rounded-xl flex items-end px-4 gap-4 overflow-hidden pt-8">
          {/* Dynamic Bars Simulation */}
          <div className="flex-1 bg-primary/10 rounded-t-lg h-[40%] hover:bg-primary/20 transition-colors" />
          <div className="flex-1 bg-primary/10 rounded-t-lg h-[45%] hover:bg-primary/20 transition-colors" />
          <div className="flex-1 bg-primary/10 rounded-t-lg h-[42%] hover:bg-primary/20 transition-colors" />
          <div className="flex-1 bg-primary/10 rounded-t-lg h-[55%] hover:bg-primary/20 transition-colors" />
          <div className="flex-1 bg-primary/10 rounded-t-lg h-[60%] hover:bg-primary/20 transition-colors" />
          <div className="flex-1 bg-primary/10 rounded-t-lg h-[58%] hover:bg-primary/20 transition-colors" />
          <div className="flex-1 bg-primary/20 rounded-t-lg h-[70%] hover:bg-primary/30 transition-colors" />
          <div className="flex-1 bg-primary/20 rounded-t-lg h-[75%] hover:bg-primary/30 transition-colors" />
          <div className="flex-1 bg-primary/20 rounded-t-lg h-[72%] hover:bg-primary/30 transition-colors" />
          <div className="flex-1 bg-secondary rounded-t-lg h-[85%]" />
          <div className="flex-1 bg-secondary/80 rounded-t-lg h-[82%]" />
          <div className="flex-1 bg-secondary rounded-t-lg h-[95%]" />
        </div>
        <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
          <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span><span>Juil</span><span>Août</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Déc</span>
        </div>
      </div>
    </section>
  </main>
  {/* FAB (Suppressed on Dashboard as per rules if not direct match, but "Nouvelle Analyse" is in Sidebar) */}
</div>

    </ImportedPageDocument>
  );
}
