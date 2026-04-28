import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }`;

export default function PortfolioMarocPage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-background font-body antialiased"
      title="Portfolio Immobilier | SmartEstate Morocco"
      styles={pageStyles}
    >
      <div>
  {/* Sidebar Navigation */}
  <aside className="h-screen w-72 fixed left-0 top-0 bg-[#ffffff] flex flex-col border-r border-[#c6c5d4]/15 font-['Inter'] text-sm antialiased z-50">
    <div className="px-8 py-8">
      <h1 className="text-xl font-bold tracking-tighter text-[#1A237E] uppercase font-headline">SmartEstate</h1>
    </div>
    <div className="flex-1 space-y-1">
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
        <span>Tableau de Bord</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 bg-[#eeeef0] text-[#1b6d24] font-bold border-r-4 border-[#1b6d24] cursor-pointer">
        <span className="material-symbols-outlined" data-icon="domain" style={{fontVariationSettings: '"FILL" 1'}}>domain</span>
        <span>Portfolio</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="calculate">calculate</span>
        <span>Estimation</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="query_stats">query_stats</span>
        <span>Scénarios</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-4 text-[#454652] hover:bg-[#f9f9fb] hover:translate-x-1 transition-all duration-200 cursor-pointer">
        <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
        <span>Recommandations</span>
      </div>
    </div>
    <div className="p-6 mt-auto">
      <button className="w-full py-3 bg-gradient-to-br from-secondary to-on-secondary-container text-white rounded-xl font-semibold shadow-sm active:scale-95 transition-transform">
        Nouvelle Analyse
      </button>
    </div>
    <div className="border-t border-[#c6c5d4]/15 p-4 space-y-1">
      <div className="group flex items-center gap-3 px-6 py-3 text-[#454652] hover:bg-[#f9f9fb] transition-all cursor-pointer">
        <span className="material-symbols-outlined" data-icon="help">help</span>
        <span>Aide</span>
      </div>
      <div className="group flex items-center gap-3 px-6 py-3 text-[#454652] hover:bg-[#f9f9fb] transition-all cursor-pointer">
        <span className="material-symbols-outlined" data-icon="logout">logout</span>
        <span>Déconnexion</span>
      </div>
    </div>
  </aside>
  {/* Main Content Area */}
  <main className="ml-72 min-h-screen">
    {/* Top Navigation Bar */}
    <header className="flex justify-between items-center px-8 py-4 w-full sticky top-0 bg-[#f9f9fb]/80 backdrop-blur-md z-40">
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" data-icon="search">search</span>
          <input className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full w-80 focus:ring-2 focus:ring-secondary/20 font-body text-sm" placeholder="Rechercher un actif..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="settings">settings</span>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/30 mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-primary">Yassine Mansouri</p>
            <p className="text-[10px] text-on-surface-variant">Directeur d'Investissement</p>
          </div>
          <img alt="Yassine Mansouri" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" data-alt="professional portrait of a middle-aged businessman in a tailored navy suit with a clean and bright corporate office background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsibTls6OZtaiMeYzmB2R54-4Tlq9Iq4zBvV8lfVaWsHH8B0LELwI3xkoBTwk10bVkaRmhC4MUfGibXTgE-Xxm-xD5MILBze5Dz9oXtcCZ_f0Qr7bB8frsun_ZFV-rJhxSVC3vNMC0BGnIJU92FscV9ay6oWzkjufexay8zg26UnZv79bXhW4io6zCItKnlAuqAEeeBpZO-DgpHNPY_5_H8egVIpQmmha8fn_D1UnG-8_vKD830p0Qmw9iNh_UoE0n3rx-PCEsAvmS" />
        </div>
      </div>
    </header>
    {/* Editorial Header Section */}
    <section className="px-12 py-10">
      <div className="flex justify-between items-end mb-12">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">Aperçu Stratégique</span>
          <h2 className="text-5xl font-headline font-extrabold text-primary tracking-tight leading-tight">Portfolio Immobilier <br />Royaume du Maroc</h2>
        </div>
        <div className="text-right">
          <p className="text-on-surface-variant text-sm font-medium mb-1">Valeur Totale Sous Gestion</p>
          <p className="text-4xl font-headline font-bold text-secondary">248.5 <span className="text-xl">MDH</span></p>
        </div>
      </div>
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Interactive Map Section */}
        <div className="col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden relative shadow-[0_12px_40px_rgba(26,28,29,0.06)] h-[500px]">
          <div className="absolute inset-0 z-0 bg-[#f3f3f5]" data-location="Morocco" style={{}}>
            <img alt="Map of Morocco" className="w-full h-full object-cover opacity-60 grayscale" data-alt="clean minimalist topographic map of morocco with subtle elevation contours and soft cream and grey tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2_esR45aF-iw5dveCNArIdK-JnXYTzUYfTO_yb1I24sCioaz_YllZerlgghbiTLxN9t9DMzpKX-wDKlIcVN215iXw_8zGdmDzrTG3CoSHoEmYSfTDXwGmlXdqWlpSyphnT-HPMzqHAIRZzLSFYeVK8Y1Ve8LVav--zvXig_TZnKw8BGv0L7inItY3kOq_Ika8cSgoFqQxFNuW3Rm0S3eFPFv0aj8DQSfomkRR8LTf6WqWkVMIYshJ6FYb3knQh1C3ysc2HWnz5_C-" />
          </div>
          {/* Map Pins (Representational) */}
          <div className="absolute top-[35%] left-[45%] z-10 group cursor-pointer">
            <div className="bg-primary text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm" data-icon="location_on" style={{fontVariationSettings: '"FILL" 1'}}>location_on</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 glass-panel px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap border border-white/20">RABAT</div>
          </div>
          <div className="absolute top-[42%] left-[40%] z-10 group cursor-pointer">
            <div className="bg-secondary text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform animate-pulse">
              <span className="material-symbols-outlined text-sm" data-icon="location_on" style={{fontVariationSettings: '"FILL" 1'}}>location_on</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 glass-panel px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap border border-white/20">CASABLANCA</div>
          </div>
          <div className="absolute top-[65%] left-[38%] z-10 group cursor-pointer">
            <div className="bg-primary text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm" data-icon="location_on" style={{fontVariationSettings: '"FILL" 1'}}>location_on</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 glass-panel px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap border border-white/20">MARRAKECH</div>
          </div>
          {/* Map Overlay Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
            <button className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center text-primary shadow-sm hover:bg-white transition-colors">
              <span className="material-symbols-outlined" data-icon="add">add</span>
            </button>
            <button className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center text-primary shadow-sm hover:bg-white transition-colors">
              <span className="material-symbols-outlined" data-icon="remove">remove</span>
            </button>
          </div>
          <div className="absolute top-6 left-6 z-20 glass-panel px-6 py-4 rounded-xl border border-white/30">
            <h3 className="text-sm font-bold text-primary mb-1">Concentration Régionale</h3>
            <div className="flex items-center gap-3">
              <div className="h-2 w-24 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[65%]" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">Casablanca-Settat (65%)</span>
            </div>
          </div>
        </div>
        {/* Fast Metrics Card */}
        <div className="col-span-4 space-y-6">
          <div className="bg-primary-container p-8 rounded-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-on-primary-container text-xs font-bold uppercase tracking-tighter block mb-4">Performance Moyenne</span>
              <p className="text-5xl font-headline font-bold mb-2">6.8%</p>
              <p className="text-on-primary-container/80 text-sm">Rendement annuel net du portfolio</p>
              <div className="mt-8 flex items-center gap-2 text-secondary-container">
                <span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
                <span className="text-sm font-bold">+1.2% vs Q3 2023</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 scale-150 transition-transform group-hover:rotate-12 duration-700">
              <span className="material-symbols-outlined text-[120px]" data-icon="monitoring">monitoring</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[212px]">
            <div>
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-tighter block mb-2">Taux d'Occupation</span>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-headline font-bold text-on-surface">94.2%</p>
                <span className="text-secondary text-sm font-bold mb-1">Optimal</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                <span>RÉSIDENTIEL</span>
                <span>98%</span>
              </div>
              <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[98%]" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                <span>COMMERCIAL</span>
                <span>89%</span>
              </div>
              <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[89%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* Asset List Section */}
    <section className="px-12 py-12 bg-surface-container-low">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-headline font-bold text-primary">Détails des Actifs</h3>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface-variant text-xs font-bold rounded-lg hover:shadow-sm transition-all">
            <span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
            Filtrer par Ville
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface-variant text-xs font-bold rounded-lg hover:shadow-sm transition-all">
            <span className="material-symbols-outlined text-sm" data-icon="download">download</span>
            Exporter PDF
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* Asset Card 1 */}
        <div className="group bg-surface-container-lowest rounded-xl p-4 flex gap-8 items-center hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0">
            <img alt="Tour CFC Analytics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="ultra-modern glass skyscraper in Casablanca Finance City at twilight with blue reflective lighting and high-tech corporate aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADXh13UFr-ijiMssCXvO-3S07RfqA8Vac74DMzf5JDpq3SX5kN2Dvsgz4rB5EVew-P0cY6TI4mHI5OggEDVnAtr04-KdOBFvDrWuACT0o3nppKKO5EHCooQ2L9CI3Vc4lufOWaS80xNgKkCXr8TsDX70331GIaofQiYDM04IXtlLSE1u_yqfwjc2-A43AndMzBItYldquR8l2xaPi0SwNO_c4JYVpQWmev-tHom4Y-qdUeOXvEHQEehKaWap-ZHeYgxcQQG5QYaWau" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-xl font-bold text-on-surface">Tour CFC Analytics</h4>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" data-icon="location_on">location_on</span>
                  Casablanca Finance City, Casablanca
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-headline font-bold text-primary">125.0 MDH</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Valeur Actuelle</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-6">
              <div className="bg-surface-container-low/50 p-3 rounded-lg border border-transparent group-hover:border-outline-variant/10 transition-colors">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Rendement</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">7.2%</span>
                  <span className="text-[10px] text-secondary font-bold">+0.4%</span>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Occupation</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">100%</span>
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[8px] rounded-full uppercase font-bold">Plein</span>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Évolution (12m)</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">+12.4%</span>
                  <span className="material-symbols-outlined text-secondary text-sm" data-icon="trending_up">trending_up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Asset Card 2 */}
        <div className="group bg-surface-container-lowest rounded-xl p-4 flex gap-8 items-center hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0">
            <img alt="Villa Al-Majd" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="luxury contemporary villa in Marrakech with traditional Moorish architecture elements, terracotta walls, lush palm trees, and a clear blue swimming pool" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1t5txZxFfQ9vLmsMx_AzkQind1JMKmZMdBy1POCerOevKu7S_3rSJ6_l_2Y9yLxoxyJ5kis7wdz-ibrEo-tyl8ln7-m5iTRzNch5qvlJVFac93JUhcFfELn6m09XxVIwLRjilDsH5lx_lVnMrcTsjXPGXMwVf5e9g_1ME6XTvB_zYTVipid_kUyCMGMWXv8ofYAv1DG2GmtRLkoawsXDDnYZgLFyN0UtBcbPly_cSBXyDFsfih8YT4fAAX2UAyJrfpuQAxo1G6w67" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-xl font-bold text-on-surface">Villa Al-Majd</h4>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" data-icon="location_on">location_on</span>
                  Palmeraie, Marrakech
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-headline font-bold text-primary">82.5 MDH</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Valeur Actuelle</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-6">
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Rendement</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">5.8%</span>
                  <span className="text-[10px] text-on-surface-variant font-bold">Stable</span>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Occupation</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">85%</span>
                  <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant text-[8px] rounded-full uppercase font-bold">Saisonnier</span>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Évolution (12m)</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">+8.2%</span>
                  <span className="material-symbols-outlined text-secondary text-sm" data-icon="trending_up">trending_up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Asset Card 3 */}
        <div className="group bg-surface-container-lowest rounded-xl p-4 flex gap-8 items-center hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0">
            <img alt="Appartement L'Hivernage" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="high-end penthouse apartment interior in Marrakech with warm sunlight, marble floors, and a balcony view of the Atlas Mountains at dawn" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiWW-UJRKrLwsGxctn7Wr8YHlGkRSzkoIdiUo24UsZC9kU5L46UbZfdKtD0Q6ZwHMqR1VUC7xsqxClvU1UNiPY_7MLBAyGikC0N0tBN46KBcVnP6NAYBX52-MJG7IOCNoBn8Jn0vgkW9OFATzwr3gnXOIooGcBi2cbpoSK7CnqX-3hYvjm-xw81q9iAGrH7hTsk2nad5FnXs0ct8vxbRYeEZTwbkAWQi9uLY0ea3gaFHUmwxZpmecUX6eD7nDAMqWPpL1M4RyGBgfi" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-xl font-bold text-on-surface">Appartement L'Hivernage</h4>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" data-icon="location_on">location_on</span>
                  L'Hivernage, Marrakech
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-headline font-bold text-primary">41.0 MDH</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Valeur Actuelle</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-6">
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Rendement</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">6.4%</span>
                  <span className="text-[10px] text-error font-bold">-0.2%</span>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Occupation</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">92%</span>
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[8px] rounded-full uppercase font-bold">Stable</span>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Évolution (12m)</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">+4.5%</span>
                  <span className="material-symbols-outlined text-secondary text-sm" data-icon="trending_up">trending_up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</div>

    </ImportedPageDocument>
  );
}
