import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, .font-headline { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .no-scrollbar::-webkit-scrollbar { display: none; }`;

export default function ScenarioSimulatorMarocPage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-background min-h-screen"
      title="Simulateur de Scénarios d'Investissement | SmartEstate Morocco"
      styles={pageStyles}
    >
      <div>
  {/* SideNavBar Execution */}
  <aside className="flex flex-col h-full py-8 px-6 fixed left-0 top-0 z-40 bg-[#ffffff] dark:bg-slate-900 h-screen w-64 font-inter text-sm tracking-normal font-medium">
    <div className="mb-8">
      <h1 className="text-xl font-extrabold text-[#1A237E] dark:text-indigo-300">SmartEstate</h1>
      <p className="text-on-surface-variant text-xs opacity-70">Institutional Grade</p>
    </div>
    <nav className="flex-1 space-y-2">
      <a className="flex items-center gap-3 px-4 py-3 text-[#454652] hover:text-[#1b6d24] hover:translate-x-1 transition-all" href="#">
        <span className="material-symbols-outlined">dashboard</span>
        Dashboard
      </a>
      <a className="flex items-center gap-3 px-4 py-3 text-[#454652] hover:text-[#1b6d24] hover:translate-x-1 transition-all" href="#">
        <span className="material-symbols-outlined">account_balance_wallet</span>
        Portfolio
      </a>
      <a className="flex items-center gap-3 px-4 py-3 text-[#454652] hover:text-[#1b6d24] hover:translate-x-1 transition-all" href="#">
        <span className="material-symbols-outlined">calculate</span>
        Estimation
      </a>
      <a className="flex items-center gap-3 px-4 py-3 text-[#1b6d24] bg-[#f3f3f5] rounded-lg" href="#">
        <span className="material-symbols-outlined">query_stats</span>
        Scenarios
      </a>
      <a className="flex items-center gap-3 px-4 py-3 text-[#454652] hover:text-[#1b6d24] hover:translate-x-1 transition-all" href="#">
        <span className="material-symbols-outlined">auto_awesome</span>
        Recommendations
      </a>
      <a className="flex items-center gap-3 px-4 py-3 text-[#454652] hover:text-[#1b6d24] hover:translate-x-1 transition-all" href="#">
        <span className="material-symbols-outlined">description</span>
        Reports
      </a>
      <a className="flex items-center gap-3 px-4 py-3 text-[#454652] hover:text-[#1b6d24] hover:translate-x-1 transition-all" href="#">
        <span className="material-symbols-outlined">group</span>
        Team
      </a>
    </nav>
    <button className="mt-4 mb-8 bg-gradient-to-br from-secondary to-on-secondary-container text-white py-3 px-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
      <span className="material-symbols-outlined">add</span>
      New Analysis
    </button>
    <div className="space-y-2 border-t border-surface-container-high pt-6">
      <a className="flex items-center gap-3 px-4 py-2 text-[#454652] hover:text-[#1b6d24]" href="#">
        <span className="material-symbols-outlined">help</span>
        Help Center
      </a>
      <a className="flex items-center gap-3 px-4 py-2 text-[#454652] hover:text-[#1b6d24]" href="#">
        <span className="material-symbols-outlined">logout</span>
        Sign Out
      </a>
    </div>
  </aside>
  {/* Main Content Canvas */}
  <main className="ml-64 min-h-screen flex flex-col">
    {/* TopNavBar Execution */}
    <header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50 bg-[#f9f9fb] dark:bg-slate-950 font-manrope tracking-tight font-semibold shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#1A237E]">Simulateur de Scénarios</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center bg-surface-container rounded-full px-4 py-1.5 gap-2">
          <span className="material-symbols-outlined text-outline text-sm">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-48" placeholder="Rechercher un actif..." type="text" />
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#454652] cursor-pointer hover:bg-[#f3f3f5] p-2 rounded-full transition-colors">notifications</span>
          <span className="material-symbols-outlined text-[#454652] cursor-pointer hover:bg-[#f3f3f5] p-2 rounded-full transition-colors">settings</span>
          <div className="w-8 h-8 rounded-full bg-primary overflow-hidden border-2 border-white shadow-sm">
            <img alt="Yassine Mansouri" className="w-full h-full object-cover" data-alt="portrait of a professional man in business attire against a neutral backdrop with clean lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQtoMXRQJ1DOzTE-yRsmupLL0XUNc49EXgzjYh_Yac6OBDDMdQygXchr4IyYpx9em_hsqJSD_Law8M9CSjzmXan1lPKLe1SDwnnhTdqL3lTVdWT1WUa4t4skFye00q5GVuuzS1dDF7hVqV13zdp95PHtyIDHowIm2GCsKpaiG9sP_oBUOnzuK6xPkbqg_yIVkU5LgOSSj7pwjfTJ1Hf7KeOb-MILcG1hRwzGrGFAAuQoxOBgECjVVdDJ5cJkWEAT8rs34acMMb6FTZ" />
          </div>
        </div>
      </div>
    </header>
    <section className="p-10 space-y-10">
      {/* Header Section with Asymmetry */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-surface-container pb-8">
        <div className="max-w-2xl">
          <span className="text-secondary font-bold uppercase tracking-widest text-xs mb-2 block">Outil de projection stratégique</span>
          <h2 className="text-4xl font-extrabold text-primary mb-4 leading-tight">Optimisez votre Patrimoine Immobilier au Maroc</h2>
          <p className="text-on-surface-variant leading-relaxed">Simulez l'impact financier de différentes stratégies d'acquisition et de gestion pour vos actifs à Casablanca, Marrakech ou Tanger.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-surface-dim transition-all">
            <span className="material-symbols-outlined">share</span> Partager
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-xl">
            <span className="material-symbols-outlined">download</span> Exporter PDF
          </button>
        </div>
      </div>
      {/* Simulation Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4">
          <label className="block text-xs font-bold text-outline-variant uppercase">Apport Personnel (MAD)</label>
          <div className="text-2xl font-bold text-primary">1,250,000</div>
          <input className="w-full accent-secondary" max={5000000} min={100000} step={50000} type="range" />
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4">
          <label className="block text-xs font-bold text-outline-variant uppercase">Taux de Crédit (%)</label>
          <div className="text-2xl font-bold text-primary">4.25%</div>
          <input className="w-full accent-secondary" max={6} min={3} step="0.05" type="range" />
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4">
          <label className="block text-xs font-bold text-outline-variant uppercase">Budget Travaux (MAD)</label>
          <div className="text-2xl font-bold text-primary">450,000</div>
          <input className="w-full accent-secondary" max={2000000} min={0} step={25000} type="range" />
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4">
          <label className="block text-xs font-bold text-outline-variant uppercase">Durée (Années)</label>
          <div className="text-2xl font-bold text-primary">15 Ans</div>
          <input className="w-full accent-secondary" max={25} min={5} step={1} type="range" />
        </div>
      </div>
      {/* Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Achat-Revente */}
        <div className="relative group overflow-hidden bg-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-secondary transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">holiday_village</span>
          </div>
          <h3 className="text-xl font-bold text-primary mb-6">Achat-Revente (Flip)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-outline mb-1">TRI ESTIMÉ</p>
              <p className="text-3xl font-black text-secondary">22.4%</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-outline font-bold uppercase">Plus-value nette</p>
                <p className="text-lg font-bold text-on-surface">+840K MAD</p>
              </div>
              <div>
                <p className="text-[10px] text-outline font-bold uppercase">Durée cible</p>
                <p className="text-lg font-bold text-on-surface">18 Mois</p>
              </div>
            </div>
            <div className="pt-4 border-t border-surface-container">
              <p className="text-sm text-on-surface-variant leading-relaxed">Idéal pour une augmentation rapide du capital. Risque de marché modéré selon la zone.</p>
            </div>
          </div>
        </div>
        {/* Location Longue Durée */}
        <div className="relative group bg-primary-container p-8 rounded-3xl border border-transparent transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-on-primary-container">
            <span className="material-symbols-outlined text-8xl">apartment</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-6">Location Longue Durée</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-on-primary-container mb-1">RENDEMENT NET</p>
              <p className="text-3xl font-black text-secondary-fixed">6.8%</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-on-primary-container font-bold uppercase">Cash-flow mens.</p>
                <p className="text-lg font-bold text-white">+4,200 MAD</p>
              </div>
              <div>
                <p className="text-[10px] text-on-primary-container font-bold uppercase">Vacance loc.</p>
                <p className="text-lg font-bold text-white">5%</p>
              </div>
            </div>
            <div className="pt-4 border-t border-primary/20">
              <p className="text-sm text-primary-fixed leading-relaxed">Stabilité institutionnelle. Profil de risque faible avec valorisation organique constante.</p>
            </div>
          </div>
        </div>
        {/* Location Saisonnière */}
        <div className="relative group bg-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-secondary transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">villa</span>
          </div>
          <h3 className="text-xl font-bold text-primary mb-6">Location Saisonnière</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-outline mb-1">RENDEMENT NET</p>
              <p className="text-3xl font-black text-secondary">11.2%</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-outline font-bold uppercase">Cash-flow mens.</p>
                <p className="text-lg font-bold text-on-surface">+12,500 MAD</p>
              </div>
              <div>
                <p className="text-[10px] text-outline font-bold uppercase">Occupation</p>
                <p className="text-lg font-bold text-on-surface">65%</p>
              </div>
            </div>
            <div className="pt-4 border-t border-surface-container">
              <p className="text-sm text-on-surface-variant leading-relaxed">Haute rentabilité en zone touristique (Guéliz, Hivernage). Gestion active requise.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Visualization: Net Value Evolution */}
      <div className="bg-surface-container-lowest p-10 rounded-3xl shadow-sm overflow-hidden relative">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-2xl font-bold text-primary">Projection de la Valeur Nette</h3>
            <p className="text-on-surface-variant">Évolution comparative sur 15 ans (Millions MAD)</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs font-bold text-outline">Long Terme</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-container" />
              <span className="text-xs font-bold text-outline">Saisonnier</span>
            </div>
          </div>
        </div>
        {/* Custom Chart Visualization (SVG) */}
        <div className="h-64 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200">
            {/* Grid Lines */}
            <line stroke="#eeeef0" strokeWidth={1} x1={0} x2={1000} y1={200} y2={200} />
            <line stroke="#eeeef0" strokeWidth={1} x1={0} x2={1000} y1={150} y2={150} />
            <line stroke="#eeeef0" strokeWidth={1} x1={0} x2={1000} y1={100} y2={100} />
            <line stroke="#eeeef0" strokeWidth={1} x1={0} x2={1000} y1={50} y2={50} />
            {/* Area Long Term */}
            <path d="M0 180 Q 250 160, 500 120 T 1000 40 L 1000 200 L 0 200 Z" fill="#1b6d24" fillOpacity="0.05" />
            <path d="M0 180 Q 250 160, 500 120 T 1000 40" fill="none" stroke="#1b6d24" strokeLinecap="round" strokeWidth={4} />
            {/* Path Seasonal */}
            <path d="M0 180 Q 250 170, 500 100 T 1000 10" fill="none" opacity="0.6" stroke="#1a237e" strokeDasharray="8 4" strokeWidth={4} />
            {/* Interactivity Points */}
            <circle cx={500} cy={120} fill="#1b6d24" r={6} />
            <circle cx={1000} cy={40} fill="#1b6d24" r={6} />
          </svg>
          {/* Floating Data Node */}
          <div className="absolute top-[10%] left-[48%] bg-white p-3 rounded-lg shadow-xl border border-surface-container translate-x-[-50%]">
            <p className="text-[10px] text-outline font-bold">ANNÉE 7</p>
            <p className="text-sm font-bold text-primary">8.42M MAD</p>
          </div>
        </div>
        <div className="flex justify-between mt-6 text-[10px] font-bold text-outline-variant px-2">
          <span>2024</span>
          <span>2027</span>
          <span>2030</span>
          <span>2033</span>
          <span>2036</span>
          <span>2039</span>
        </div>
      </div>
      {/* AI Insight Section */}
      <div className="bg-secondary-fixed p-1 bg-opacity-30 rounded-3xl">
        <div className="bg-surface-container-lowest rounded-[22px] p-8 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-shrink-0 relative">
            <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>auto_awesome</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">verified</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-bold text-primary">L'Avis de l'Expert IA SmartEstate</h4>
              <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Analyse en temps réel</span>
            </div>
            <p className="text-on-surface text-lg leading-relaxed font-medium">
              "Basé sur vos paramètres, le scénario de <span className="text-secondary font-bold">Location Saisonnière à Marrakech (Guéliz)</span> présente le meilleur ratio rendement/risque. L'apport de 1.25M MAD permet de limiter l'endettement tout en bénéficiant de l'effet de levier sur un actif premium."
            </p>
            <div className="flex gap-8 pt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
                <span className="text-xs font-semibold text-on-surface-variant">Confiance: 94%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">info</span>
                <span className="text-xs font-semibold text-on-surface-variant">Source: Data Marché 2024 Q3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* Footer Whitespace as per Editorial Rule */}
    <footer className="h-32" />
  </main>
  {/* FAB Suppression logic: Only on main dashboard, but adding a "Save Scenario" button as contextually relevant */}
  <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform z-50">
    <span className="material-symbols-outlined text-3xl">save</span>
    <div className="absolute right-20 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
      Enregistrer ce scénario
    </div>
  </button>
</div>

    </ImportedPageDocument>
  );
}
