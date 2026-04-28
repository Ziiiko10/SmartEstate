import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .glass-effect {
        background: rgba(249, 249, 251, 0.8);
        backdrop-filter: blur(24px);
      }
      .text-shadow-sm {
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }`;

export default function AiRecommendationsPage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-background font-body antialiased"
      title="Recommandations IA"
      styles={pageStyles}
    >
      <div>
  {/* Sidebar Navigation */}
  <aside className="h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-[#ffffff] flex flex-col z-50">
    <div className="px-8 py-8">
      <h1 className="text-xl font-headline font-bold tracking-tighter text-[#1A237E] uppercase">SmartEstate</h1>
    </div>
    <nav className="flex-1 flex flex-col gap-1 px-2">
      <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] transition-all duration-200 hover:translate-x-1" href="#">
        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
        <span className="font-medium">Tableau de Bord</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] transition-all duration-200 hover:translate-x-1" href="#">
        <span className="material-symbols-outlined" data-icon="domain">domain</span>
        <span className="font-medium">Portfolio</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] transition-all duration-200 hover:translate-x-1" href="#">
        <span className="material-symbols-outlined" data-icon="calculate">calculate</span>
        <span className="font-medium">Estimation</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 bg-[#eeeef0] text-[#1b6d24] font-bold border-r-4 border-[#1b6d24]" href="#">
        <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
        <span className="font-medium">Recommandations</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] transition-all duration-200 hover:translate-x-1" href="#">
        <span className="material-symbols-outlined" data-icon="query_stats">query_stats</span>
        <span className="font-medium">Scénarios</span>
      </a>
      <a className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] transition-all duration-200 hover:translate-x-1" href="#">
        <span className="material-symbols-outlined" data-icon="description">description</span>
        <span className="font-medium">Rapports</span>
      </a>
    </nav>
    <div className="p-6 border-t border-[#c6c5d4]/15">
      <div className="flex items-center gap-3 mb-6">
        <img className="w-10 h-10 rounded-full object-cover" data-alt="portrait of a professional male investment director in a tailored suit with a neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB12VyA2hs7s9tg4GzYwChv0As5WdNE9CktHMi8ekWQ9FgU2MQwv3olCMNMMtxs1wlMniO99AnbaP73mmOEr0ir5Np0x6_ob_7zN11BehAZwgjKNh4Y9wuFEiG8Ge7Py8Y0ZUgh9grKflXwo1wCMaLWONz9NZxIsX1qbOFcjfJ2QO8PMKmMLvOuieqxWlmr1EZRGYl_bWdQ6nJ77ucJECXg9UOva9DrF-EmGcZgfgqvhP-7uZX7PG8z9asTONdOHNA1kjmjIGKrhc1a" />
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-on-surface truncate">Yassine Mansouri</p>
          <p className="text-xs text-on-surface-variant truncate">Directeur d'Investissement</p>
        </div>
      </div>
      <button className="w-full py-3 bg-[#eeeef0] text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
        Nouvelle Analyse
      </button>
    </div>
  </aside>
  {/* Main Content Area */}
  <main className="ml-72 min-h-screen">
    {/* Header / Top Bar */}
    <header className="flex justify-between items-center px-12 py-6 sticky top-0 glass-effect z-40">
      <div className="flex flex-col">
        <h2 className="text-2xl font-headline font-extrabold text-primary tracking-tight">Opportunités du Moment au Maroc</h2>
        <p className="text-on-surface-variant text-sm mt-1">Analyse prédictive basée sur les flux économiques de la région MENA.</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center bg-surface-container px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-on-surface-variant mr-3" data-icon="search">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-48 font-medium" placeholder="Rechercher un actif..." type="text" />
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full cursor-pointer" data-icon="notifications">notifications</span>
          <span className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full cursor-pointer" data-icon="settings">settings</span>
        </div>
      </div>
    </header>
    {/* Filters Section */}
    <section className="px-12 py-8">
      <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-wrap items-end gap-8 shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Budget Maximum</label>
          <div className="relative">
            <select className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-4 pr-10 appearance-none font-semibold text-primary focus:ring-2 focus:ring-secondary/20">
              <option>5,000,000 DH</option>
              <option>10,000,000 DH</option>
              <option>25,000,000 DH</option>
              <option>50,000,000 DH+</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Rendement Cible (Yield)</label>
          <div className="flex items-center gap-4">
            <input className="flex-1 h-2 bg-surface-container-highest rounded-full appearance-none accent-secondary" type="range" />
            <span className="text-secondary font-bold text-sm">7.5% +</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Type d'Actif</label>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg">Mixte</button>
            <button className="px-4 py-2 bg-surface-container-high text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors">Résidentiel</button>
            <button className="px-4 py-2 bg-surface-container-high text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors">Retail</button>
          </div>
        </div>
        <button className="px-8 py-3 bg-secondary text-white font-bold rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
          Filtrer
        </button>
      </div>
    </section>
    {/* Opportunity Grid */}
    <section className="px-12 pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Card 1: Tanger */}
        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col md:flex-row transition-all hover:translate-y-[-4px] shadow-[0_12px_40px_rgba(26,28,29,0.06)] border border-transparent hover:border-outline-variant/15">
          <div className="w-full md:w-5/12 relative overflow-hidden">
            <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="modern architectural building with white facade and large windows reflecting coastal light in tangier morocco" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEMlljWX8ibq2CaiYp6VH7exRpgbjClxOPxvcRrpHPgCu8aQ0PUrCWd47Kjx6FH3Dvw407RcgtA7GRQt3ffvcVzUi-9jLqPKeOQNjWkoHcwkvvOl_qczo4Bo5u40dAzAWlHyq-Dzw3qczutidF4251N9kA6Xiy0dmJQF4zSToLdSeDnGFoaF9VvUHdoleftl2C4kOR9kJ-2i7WSxRLYs85iuXvYBEp0SnWcMztfM2iM1ss8khM8XASzonXnTU-bVb565C3Eeu9aglq" />
            <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Hot Deal</div>
          </div>
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight">Marina Bay Residences</h3>
                  <div className="flex items-center gap-1 text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-sm" data-icon="location_on">location_on</span>
                    <span className="text-sm font-medium">Tanger, Zone Franche</span>
                  </div>
                </div>
                <div className="bg-secondary/10 text-secondary p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase leading-none mb-1">Score IA</p>
                  <p className="text-2xl font-headline font-black leading-none">94</p>
                </div>
              </div>
              <div className="mt-6 flex gap-6">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Prix Estimé</p>
                  <p className="text-lg font-headline font-extrabold text-primary">12.4M DH</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Rendement Proj.</p>
                  <p className="text-lg font-headline font-extrabold text-secondary">8.2%</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-[10px] font-bold">+12</div>
              </div>
              <button className="bg-gradient-to-br from-secondary to-[#217128] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                Analyser l'opportunité
                <span className="material-symbols-outlined text-sm" data-icon="trending_up">trending_up</span>
              </button>
            </div>
          </div>
        </div>
        {/* Card 2: Casablanca */}
        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col md:flex-row transition-all hover:translate-y-[-4px] shadow-[0_12px_40px_rgba(26,28,29,0.06)] border border-transparent hover:border-outline-variant/15">
          <div className="w-full md:w-5/12 relative overflow-hidden">
            <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="luxury residential mansion with swimming pool and landscaped gardens in casablanca at sunset with warm glows" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0E7PozMXhzeuCYWNqtSlL0UacqceLUxU7ekdF5-QDcT_1gUDcNYuLILYyejruqJzbeVqY-okPLrt9Ym_sQtqxQtpYXL0O2Uz65mKCHhs13UfCkNSl5oPqwLBoHC8pn0pzcsDSSsFwU2MpMRwWefC7lneKq3BvLTYTr-LWGSCRLxd-u41rUIV4v3NTsyzSJ2qfbM0_K9u5-VlJeIVkQFk3FkCb6g-d9Ctuuhh0yt939u6XZhy6fw2HzxPenQ5SrJupVo_EIYgFg6WM" />
            <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Premium</div>
          </div>
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight">Anfa Tower Commercial</h3>
                  <div className="flex items-center gap-1 text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-sm" data-icon="location_on">location_on</span>
                    <span className="text-sm font-medium">Casablanca, Finance City</span>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase leading-none mb-1">Score IA</p>
                  <p className="text-2xl font-headline font-black leading-none">88</p>
                </div>
              </div>
              <div className="mt-6 flex gap-6">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Prix Estimé</p>
                  <p className="text-lg font-headline font-extrabold text-primary">34.8M DH</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Rendement Proj.</p>
                  <p className="text-lg font-headline font-extrabold text-secondary">6.5%</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined text-sm" data-icon="visibility">visibility</span>
                4.2k vues
              </div>
              <button className="bg-gradient-to-br from-secondary to-[#217128] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                Analyser l'opportunité
                <span className="material-symbols-outlined text-sm" data-icon="insights">insights</span>
              </button>
            </div>
          </div>
        </div>
        {/* Card 3: Agadir */}
        <div className="group bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col md:flex-row transition-all hover:translate-y-[-4px] shadow-[0_12px_40px_rgba(26,28,29,0.06)] border border-transparent hover:border-outline-variant/15">
          <div className="w-full md:w-5/12 relative overflow-hidden">
            <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="contemporary eco-friendly resort architecture with wooden accents and lush palms in agadir morocco" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZcGyzSCgUtmI6tV6VJ1-sx7HswGEC_cmIAH5o3AbRnmuRAylC6lbIHE0099wrGkDCoo0yY9EIIqSbMBkZNl2X5sFZHOsfSew9aEstUAgUqqkLdJl-vgBl_0PujfHyUx2YuE3RqHnaXnxvR88pcfPtmuAhB5Q9Mb0UBLVBlxyW6maKTrSBR5HHUqIoXY7yzF7OlCR8-E8U95s_89kxSTg8AfND-Zi602rFnNdgigzo4CxRLeGRKphMJzcbGNnfI-dr1jdN7gnvYmom" />
          </div>
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight">Taghazout Eco-Village</h3>
                  <div className="flex items-center gap-1 text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-sm" data-icon="location_on">location_on</span>
                    <span className="text-sm font-medium">Agadir, Taghazout Bay</span>
                  </div>
                </div>
                <div className="bg-secondary/10 text-secondary p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase leading-none mb-1">Score IA</p>
                  <p className="text-2xl font-headline font-black leading-none">91</p>
                </div>
              </div>
              <div className="mt-6 flex gap-6">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Prix Estimé</p>
                  <p className="text-lg font-headline font-extrabold text-primary">8.9M DH</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Rendement Proj.</p>
                  <p className="text-lg font-headline font-extrabold text-secondary">9.4%</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <span className="text-xs text-on-error-container bg-error-container px-2 py-1 rounded font-bold">Rare</span>
              <button className="bg-gradient-to-br from-secondary to-[#217128] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                Analyser l'opportunité
                <span className="material-symbols-outlined text-sm" data-icon="analytics">analytics</span>
              </button>
            </div>
          </div>
        </div>
        {/* Analysis Sidebar Mockup */}
        <div className="bg-primary p-8 rounded-xl flex flex-col justify-between text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl" data-icon="query_stats">query_stats</span>
              <h4 className="text-xl font-headline font-bold">Moteur de Recommandation v4.2</h4>
            </div>
            <p className="text-primary-fixed opacity-80 leading-relaxed mb-8">Notre algorithme analyse 124 points de données incluant la proximité des infrastructures, les permis de construire en attente et les prévisions de croissance touristique.</p>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-medium">Confiance Prédictive</span>
                <span className="font-bold text-secondary-fixed">Excellente (98%)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-medium">Volatilité Régionale</span>
                <span className="font-bold text-secondary-fixed text-sm">Très Faible</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Horizon d'Exclusivité</span>
                <span className="font-bold text-secondary-fixed">48 Heures restantes</span>
              </div>
            </div>
          </div>
          <div className="mt-12 bg-white/10 p-6 rounded-xl border border-white/5">
            <p className="text-xs uppercase font-bold tracking-widest text-primary-fixed mb-4">Statistiques du Marché</p>
            <div className="flex items-end gap-2 h-24">
              <div className="flex-1 bg-secondary-container h-[40%] rounded-t-sm" />
              <div className="flex-1 bg-secondary-container h-[60%] rounded-t-sm" />
              <div className="flex-1 bg-secondary-container h-[85%] rounded-t-sm" />
              <div className="flex-1 bg-secondary h-[100%] rounded-t-sm" />
              <div className="flex-1 bg-secondary-container h-[70%] rounded-t-sm" />
              <div className="flex-1 bg-secondary-container h-[90%] rounded-t-sm" />
            </div>
            <p className="mt-4 text-xs text-center opacity-60">Évolution de la demande (6 derniers mois)</p>
          </div>
        </div>
      </div>
    </section>
    {/* Map Overview / Geographic Data */}
    <section className="px-12 pb-24">
      <div className="bg-surface-container p-1 rounded-2xl h-[400px] relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-cover bg-center grayscale contrast-125 opacity-40 mix-blend-multiply" data-alt="simplified stylistic map of morocco highlighting major cities and economic hubs with architectural landmarks" data-location="Morocco" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBP55Bc5MfLLxh8BxXYanmPFIIHio4uENfaQfbWO4FXbvF4cMJsQcXf7GohayYhfNKGxkCqKUuBWahV-JvyCaVwuIrDmC_6F6u22GcvRna9ZUqLySdrN89zhZDKzrZniwM-8ehlU4TZTvvxycvSxIF7fsDwbzNJUavLMmv49_rctBIuO_d7O1G6aJMez8OGLlmsXawHP1BcHeRK89pICKPY5jvRnEdxIAMW86cj943-apMzDFmIqkXLinmoVZq4hqWk_DflnGJbuScM")'}} />
        {/* Floating Map Overlays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute top-[20%] left-[45%] bg-white p-2 rounded-xl shadow-xl border-b-2 border-secondary flex items-center gap-3 animate-pulse pointer-events-auto cursor-pointer">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span className="text-xs font-bold text-primary">Opportunité Tanger</span>
            </div>
            <div className="absolute top-[60%] left-[35%] bg-white p-2 rounded-xl shadow-xl border-b-2 border-primary flex items-center gap-3 pointer-events-auto cursor-pointer">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-xs font-bold text-primary">Focus Casablanca</span>
            </div>
            <div className="absolute top-[80%] left-[25%] bg-white p-2 rounded-xl shadow-xl border-b-2 border-tertiary-container flex items-center gap-3 pointer-events-auto cursor-pointer">
              <div className="w-2 h-2 bg-tertiary-container rounded-full" />
              <span className="text-xs font-bold text-primary">Secteur Agadir</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-2xl border border-outline-variant/15 w-64">
          <h5 className="text-xs font-bold text-on-surface uppercase mb-3">Intelligence Territoriale</h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant">Flux Nord (Med)</span>
              <span className="text-xs font-bold text-secondary">+12.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant">Axe Casa-Rabat</span>
              <span className="text-xs font-bold text-primary">+8.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant">Secteur Souss-Massa</span>
              <span className="text-xs font-bold text-secondary">+5.9%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  {/* Floating Action Button - Only for Recommandations Context */}
  <div className="fixed bottom-8 right-8 z-[60]">
    <button className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform">
      <span className="material-symbols-outlined" data-icon="smart_toy">smart_toy</span>
    </button>
  </div>
</div>

    </ImportedPageDocument>
  );
}
