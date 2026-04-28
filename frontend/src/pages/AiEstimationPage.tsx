import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .editorial-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 2rem;
        }
        .asymmetric-bleed {
            margin-left: -2rem;
        }`;

export default function AiEstimationPage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased overflow-x-hidden"
      title="SmartEstate | Outil d'Estimation ML"
      styles={pageStyles}
    >
      <div>
  <aside className="h-screen w-72 fixed left-0 top-0 border-r border-[#c6c5d4]/15 bg-[#ffffff] flex flex-col z-50">
    <div className="px-8 py-10">
      <span className="text-xl font-headline font-bold tracking-tighter text-primary uppercase">SmartEstate</span>
    </div>
    <nav className="flex-1 flex flex-col gap-1">
      <a className="group flex items-center gap-3 px-8 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined">dashboard</span>
        <span className="font-label text-sm font-medium">Tableau de Bord</span>
      </a>
      <a className="group flex items-center gap-3 px-8 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined">domain</span>
        <span className="font-label text-sm font-medium">Portfolio</span>
      </a>
      <a className="group flex items-center gap-3 px-8 py-4 bg-[#eeeef0] text-secondary font-bold border-r-4 border-secondary" href="#">
        <span className="material-symbols-outlined">calculate</span>
        <span className="font-label text-sm">Estimation</span>
      </a>
      <a className="group flex items-center gap-3 px-8 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined">query_stats</span>
        <span className="font-label text-sm font-medium">Scénarios</span>
      </a>
      <a className="group flex items-center gap-3 px-8 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined">auto_awesome</span>
        <span className="font-label text-sm font-medium">Recommandations</span>
      </a>
      <a className="group flex items-center gap-3 px-8 py-4 text-on-surface-variant hover:bg-surface-container-low transition-all duration-200" href="#">
        <span className="material-symbols-outlined">description</span>
        <span className="font-label text-sm font-medium">Rapports</span>
      </a>
    </nav>
    <div className="p-6">
      <button className="w-full bg-gradient-to-br from-secondary to-on-secondary-container text-white py-3 rounded-lg font-headline font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
        <span className="material-symbols-outlined text-sm">add</span>
        Nouvelle Analyse
      </button>
    </div>
    <div className="mt-auto border-t border-outline-variant/15 p-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
        <img alt="Avatar" data-alt="close-up portrait of a professional businessman in a navy suit with a confident smile in a bright modern office" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZOgeplTAbY3hwsfrzUoo2iaYQl6dmrMvQTDMSOyi8LAGylLXf9C0a1vwaZ_nl13OkEQimHKxahX41pUJ8Ur7Z249frm9BjVsTbb-ctaRBvmbD1jl1V2cbHecMRjWJJaotYhIefJK8pv4YNOZMOyUfyJFk99oLA439UMCyGN_8ipkRKSgc7-d-ZZbr3bhVi2yle0aCGWtZKmfkhdnULUkhEhA2FcsDfGw8P2tKS-gt4dRg4X3kt_38LkHWbjzSbvcLKHIwv83t-OPr" />
      </div>
      <div>
        <p className="text-xs font-bold text-primary">Yassine Mansouri</p>
        <p className="text-[10px] text-on-surface-variant">Directeur d'Investissement</p>
      </div>
    </div>
  </aside>
  <main className="ml-72 min-h-screen p-12">
    <header className="mb-12 flex justify-between items-end">
      <div>
        <p className="text-secondary font-label font-bold uppercase tracking-widest text-[10px] mb-2">Moteur ML SmartEstate v4.2</p>
        <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Estimation Immobilière Prédictive</h1>
      </div>
      <button className="px-6 py-2.5 bg-surface-container-highest text-on-surface rounded-lg font-headline font-bold flex items-center gap-2 hover:bg-surface-variant transition-colors active:scale-95">
        <span className="material-symbols-outlined">picture_as_pdf</span>
        Générer Rapport PDF
      </button>
    </header>
    <div className="editorial-grid">
      <section className="col-span-12 lg:col-span-4 space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
          <h2 className="text-lg font-headline font-bold mb-6 text-primary">Paramètres du Bien</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Adresse au Maroc</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">location_on</span>
                <input className="w-full bg-surface-container-low border-none rounded-lg pl-10 text-sm focus:ring-2 focus:ring-secondary/20" type="text" defaultValue="Angle Bd d'Anfa et Rue de l'Aube, Casablanca" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Surface (m²)</label>
                <input className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20" type="number" defaultValue={125} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Année de construction</label>
                <input className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20" type="number" defaultValue={2018} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Type de Bien</label>
              <select className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20">
                <option>Appartement de standing</option>
                <option>Villa moderne</option>
                <option>Bureau / Commercial</option>
                <option>Terrain nu</option>
              </select>
            </div>
            <div className="pt-4">
              <button className="w-full bg-primary text-white py-4 rounded-lg font-headline font-extrabold tracking-tight active:scale-95 transition-transform" type="button">
                Recalculer l'Estimation
              </button>
            </div>
          </form>
        </div>
        <div className="bg-primary-container p-8 rounded-xl text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
          <p className="text-primary-fixed text-xs font-bold uppercase mb-4">Valeur Estimée</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-headline font-extrabold tracking-tighter">3.450.000</h3>
            <span className="text-xl font-bold opacity-60">MAD</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-secondary-container">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <p className="text-xs font-medium">+4.2% par rapport au quartier</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-[10px] opacity-70 mb-2">Indice de confiance ML</p>
            <div className="w-full bg-white/10 h-1 rounded-full">
              <div className="bg-secondary-container h-full w-[94%] rounded-full" />
            </div>
            <p className="text-right text-[10px] mt-1 font-bold">94%</p>
          </div>
        </div>
      </section>
      <section className="col-span-12 lg:col-span-8 space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-lg font-headline font-bold text-primary">Projection à 10 ans</h2>
              <p className="text-xs text-on-surface-variant">Modèle de croissance basé sur l'urbanisme local (Casablanca Finance City)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-[10px] font-bold uppercase">Optimiste</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/30" />
                <span className="text-[10px] font-bold uppercase">Standard</span>
              </div>
            </div>
          </div>
          <div className="relative h-[280px] w-full mt-4 flex items-end justify-between px-4">
            <div className="absolute inset-0 border-b border-outline-variant/30 flex flex-col justify-between">
              <div className="border-t border-outline-variant/10 w-full h-0" />
              <div className="border-t border-outline-variant/10 w-full h-0" />
              <div className="border-t border-outline-variant/10 w-full h-0" />
              <div className="border-t border-outline-variant/10 w-full h-0" />
            </div>
            <div className="relative z-10 w-8 bg-surface-container h-[40%] rounded-t-sm group cursor-pointer hover:bg-primary/20 transition-colors">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-40">2024</span>
            </div>
            <div className="relative z-10 w-8 bg-surface-container h-[45%] rounded-t-sm">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-40">2026</span>
            </div>
            <div className="relative z-10 w-8 bg-secondary h-[55%] rounded-t-sm shadow-lg shadow-secondary/20">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-40">2028</span>
            </div>
            <div className="relative z-10 w-8 bg-secondary h-[65%] rounded-t-sm">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-40">2030</span>
            </div>
            <div className="relative z-10 w-8 bg-secondary h-[78%] rounded-t-sm">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-40">2032</span>
            </div>
            <div className="relative z-10 w-8 bg-on-secondary-container h-[92%] rounded-t-sm">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-100">2034</span>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                4.85M MAD
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-bold text-primary">Comparables à proximité</h2>
            <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-on-surface-variant">6 BIENS TROUVÉS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group">
              <div className="h-40 relative">
                <img alt="Apartment" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="luxury modern penthouse apartment in Casablanca with large windows overlooking the city skyline and harbor at dusk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaLq7DOaIYvo_MrM6GjYWScLN4kkQzpr6C_Zy0yHWoGtua0Fz66T899hkF-pChhi_oCub42Z9lft5j5Tf_kxjC4fu1O346K18e3HnmkwCWjM0ZDgxmePO7lw-ekogEEZVz2S45UGOs2Klplf9q5l8HX7eOzaMeAAP4mKyC8PExJEx9v0ukCOuqSY4H1AlaFNleFDmh4oZVq9nsIef2_-XhvIxN0a26fHVsjz6NanH2aedD9TXKswX0BWZ0ebGBDP02s_wE0OI6yldT" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm">
                  VENDU - JANV 2024
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-sm text-primary mb-1">Résidence Les Jardins d'Anfa</h4>
                <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mb-4">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  500m de votre position
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-on-surface-variant">Prix</p>
                    <p className="text-sm font-headline font-extrabold text-secondary">3.200.000 MAD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-on-surface-variant">Surface</p>
                    <p className="text-sm font-medium">118 m²</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group">
              <div className="h-40 relative">
                <img alt="Apartment" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="high-end minimalist apartment interior with white walls, wooden accents, and sophisticated designer furniture in Casablanca" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl17eOkauAqDo-r3D8rYf-mCFrtYX8_JFiCK7Tj_IQ3p_bIqO3JstAQiPA_eL7bo2R5NVHNHGJw4cbPcsvafQ0jF8a84Nm4VkH1wK-jvBJlnIWXzawU9tlHcXoAWpt3LWAA4ohhrJT95_iNx3xm7OEciAdDNGqg0kMp8pVkHe61KmuyJSh_Jg5AqTdo4ypW6r3ZyrKRahFwB-ZnLyX_lf43jege4JdTdp4ghRS312BM3nHr8q-lr8xA_pCw0o0fUAgLq2IVKckseAZ" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm">
                  OFFRE EN COURS
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-sm text-primary mb-1">CFC Tower Luxury Suites</h4>
                <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mb-4">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  1.2km de votre position
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-on-surface-variant">Prix</p>
                    <p className="text-sm font-headline font-extrabold text-secondary">3.850.000 MAD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-on-surface-variant">Surface</p>
                    <p className="text-sm font-medium">135 m²</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <section className="mt-20 pt-20 border-t border-outline-variant/20">
      <div className="bg-surface-container-low p-12 rounded-3xl flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 grayscale mix-blend-multiply pointer-events-none">
          <img alt="Map" className="w-full h-full object-cover" data-location="Casablanca" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXCLykTqAyUCjTfFbQCBcywdXUZoRWHe4CzYJ8QD_Ytl_Tu0iDZm21RBgDZrc01Lpbp0BZe0u1jFPvam7_XL38phmcQAtXXSgp_mipHIUM2i8q_ojkyDcrqq1dMT0aTXFeJZJELZxIlRpWdh0JOrPBQWCB-xzSQY16RxeT3ZYQcjrEtoRcugz0vT34CzBvtqoVsQLtOSWTZuy48Z_u3Zp1D4ZitJ9dCjMR9D6sbV4p--qZrpdi_I4QL1MljcyGQQ6KetnRJVRvsCyr" />
        </div>
        <div className="flex-1 space-y-6 relative z-10">
          <h2 className="text-3xl font-headline font-extrabold text-primary leading-tight">Prêt à approfondir votre analyse ?</h2>
          <p className="text-on-surface-variant text-sm max-w-lg leading-relaxed">
            Accédez à l'historique complet des transactions du cadastre et aux futures infrastructures prévues par la ville de Casablanca pour affiner votre stratégie d'investissement.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-headline font-bold active:scale-95 transition-transform">
              Accès Premium
            </button>
            <button className="bg-transparent border-b-2 border-secondary text-secondary px-4 py-3 font-headline font-bold hover:bg-secondary/5 transition-colors">
              Voir la carte interactive
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
  <div className="fixed bottom-8 right-8 z-40 md:hidden">
    <button className="w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
      <span className="material-symbols-outlined">calculate</span>
    </button>
  </div>
</div>

    </ImportedPageDocument>
  );
}
