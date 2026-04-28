import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-header { backdrop-filter: blur(24px); }`;

export default function TeamManagementPage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-background antialiased overflow-x-hidden"
      title="Équipe - SmartEstate Maroc"
      styles={pageStyles}
    >
      <div>
  {/* SideNavBar (Authority: JSON & Design System) */}
  <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col py-8 border-r border-slate-200/30 dark:border-slate-800/30 font-manrope text-sm font-medium">
    <div className="px-6 mb-8">
      <h1 className="text-2xl font-black text-indigo-950 dark:text-white tracking-tighter">SmartEstate</h1>
    </div>
    <nav className="flex-grow flex flex-col gap-1">
      <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-6 py-3 hover:bg-slate-100 transition-all duration-300 translate-x-1 duration-200" href="#">
        <span className="material-symbols-outlined">dashboard</span>
        Tableau de Bord
      </a>
      <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-6 py-3 hover:bg-slate-100 transition-all duration-300 translate-x-1 duration-200" href="#">
        <span className="material-symbols-outlined">domain</span>
        Portfolio
      </a>
      <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-6 py-3 hover:bg-slate-100 transition-all duration-300 translate-x-1 duration-200" href="#">
        <span className="material-symbols-outlined">calculate</span>
        Estimation
      </a>
      <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-6 py-3 hover:bg-slate-100 transition-all duration-300 translate-x-1 duration-200" href="#">
        <span className="material-symbols-outlined">insights</span>
        Scénarios
      </a>
      <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-6 py-3 hover:bg-slate-100 transition-all duration-300 translate-x-1 duration-200" href="#">
        <span className="material-symbols-outlined">auto_awesome</span>
        Recommandations
      </a>
      <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-6 py-3 hover:bg-slate-100 transition-all duration-300 translate-x-1 duration-200" href="#">
        <span className="material-symbols-outlined">assessment</span>
        Rapports
      </a>
      {/* Active State for 'Équipe' */}
      <a className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 border-r-4 border-emerald-700 px-6 py-3 translate-x-1 duration-200" href="#">
        <span className="material-symbols-outlined">group</span>
        Équipe
      </a>
    </nav>
    <div className="mt-auto px-6 pt-4 border-t border-slate-200/20">
      <button className="w-full bg-emerald-700 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 mb-6">
        <span className="material-symbols-outlined text-sm">add</span>
        Nouvelle Analyse
      </button>
      <div className="flex flex-col gap-2 mb-8">
        <a className="flex items-center gap-3 text-slate-500 px-2 py-1 hover:text-emerald-700" href="#">
          <span className="material-symbols-outlined text-xl">help</span>
          Aide
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-2 py-1 hover:text-emerald-700" href="#">
          <span className="material-symbols-outlined text-xl">headset_mic</span>
          Support
        </a>
      </div>
      <div className="flex items-center gap-3">
        <img alt="Yassine Mansouri" className="w-10 h-10 rounded-full object-cover grayscale brightness-110" data-alt="Professional portrait of a Moroccan executive man with a neat beard in a light blue business shirt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0MFKn2DNxhnyLqNewyYSObGOIYUm8PZ09LWgDeFlFwxGNWpYCvY8NEoZ5iXeUhsvQu16y2mZV-fcG71eVFhbOuNDmWD6KqU-RJkUc-DPmeSe0ZOTOII7HqQN_jsG_NOLekPRz44tPNtyME49A7rR1ylxyJJZ34TWS86chAxeD6qr2cm4y8RuhRkv2BE_UOycsAB9Cegbf5GlNv0tsDHqTcH8v53ew8zivggNW2zjonZB21DeoiuPpC35gZISocUN3HoaqZkxIgFpz" />
        <div className="flex flex-col overflow-hidden">
          <span className="text-indigo-950 font-bold truncate">Yassine Mansouri</span>
          <span className="text-xs text-slate-500 truncate">Administrateur Principal</span>
        </div>
      </div>
    </div>
  </aside>
  {/* TopNavBar (Authority: JSON) */}
  <header className="fixed top-0 w-full z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm md:pl-64">
    <div className="flex justify-between items-center px-8 py-4 w-full h-16">
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-1 focus:ring-emerald-700" placeholder="Rechercher un membre..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-emerald-700 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-500 hover:text-emerald-700 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-6 w-[1px] bg-slate-200 mx-2" />
        <button className="text-emerald-700 font-semibold text-sm hover:underline">Déconnexion</button>
      </div>
    </div>
    <div className="bg-slate-200/50 dark:bg-slate-800/50 h-[1px] w-[95%] mx-auto" />
  </header>
  {/* Main Content Canvas */}
  <main className="pt-24 md:pl-64 min-h-screen">
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight mb-2">Gestion de l'Équipe</h1>
          <p className="text-on-surface-variant text-lg">Pilotez les accès et collaborez avec vos experts immobiliers sur tout le territoire marocain.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gradient-to-br from-secondary to-on-secondary-container text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all scale-100 active:scale-95 duration-200">
          <span className="material-symbols-outlined">person_add</span>
          Inviter un membre
        </button>
      </div>
      {/* Team Stats / Data Horizon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:shadow-md transition-all">
          <p className="text-on-surface-variant font-label text-xs uppercase tracking-wider mb-2">Membres Actifs</p>
          <div className="flex items-baseline gap-4">
            <span className="font-headline text-3xl font-bold text-primary">12</span>
            <span className="text-secondary text-sm font-medium flex items-center">+2 ce mois</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:shadow-md transition-all">
          <p className="text-on-surface-variant font-label text-xs uppercase tracking-wider mb-2">Analyses en cours</p>
          <div className="flex items-baseline gap-4">
            <span className="font-headline text-3xl font-bold text-primary">48</span>
            <span className="text-secondary text-sm font-medium flex items-center">85% complétion</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:shadow-md transition-all">
          <p className="text-on-surface-variant font-label text-xs uppercase tracking-wider mb-2">Taux de Rétention</p>
          <div className="flex items-baseline gap-4">
            <span className="font-headline text-3xl font-bold text-primary">98%</span>
            <span className="text-secondary text-sm font-medium flex items-center">Excellent</span>
          </div>
        </div>
      </div>
      {/* Team Directory - Modern Table / List */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-variant/50 flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg text-primary">Annuaire Collaboratif</h3>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">filter_list</span></button>
            <button className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">sort</span></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-semibold text-sm text-on-surface-variant">Membre</th>
                <th className="px-6 py-4 font-semibold text-sm text-on-surface-variant">Rôle</th>
                <th className="px-6 py-4 font-semibold text-sm text-on-surface-variant">Région</th>
                <th className="px-6 py-4 font-semibold text-sm text-on-surface-variant">Statut</th>
                <th className="px-6 py-4 font-semibold text-sm text-on-surface-variant">Dernière activité</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/30">
              {/* Member 1 */}
              <tr className="group hover:bg-surface-bright transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img className="w-10 h-10 rounded-full object-cover" data-alt="Modern Moroccan professional woman with light makeup and confident expression in a bright office environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGI3hz4HdtEccoQ6ORdpxC9w8Q7vUd4b6PlNG2ey8LO3hP9w6CNFs2xEibkOn8b1Ins6I0jY6lH-G8-lH7NvCZQK_aCUEi2QIrExSbHndBq4tfsdVhhFHgEdk1DMMeQzlzkjo-GU8usob6a_5-8_iBWdABBFq4S8f8qBq1lTmQFjJxMVG3fE_LfzqYX1vSUmRn6Y2eony54zoaMYQmZwePOi5tw6_TAK9cHWNDQjR_6I9pY0P_BaCEbg9ZsU_WGF8fMoa8WQTRuYVi" />
                    <div>
                      <p className="font-bold text-primary">Amina Bennani</p>
                      <p className="text-xs text-on-surface-variant">amina.b@smartestate.ma</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium px-2 py-1 rounded bg-blue-50 text-blue-700">Analyste Senior</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Casablanca-Settat</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-tighter">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Actif
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Il y a 12 min</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
              {/* Member 2 */}
              <tr className="group hover:bg-surface-bright transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">OT</div>
                    <div>
                      <p className="font-bold text-primary">Omar Tazi</p>
                      <p className="text-xs text-on-surface-variant">o.tazi@smartestate.ma</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium px-2 py-1 rounded bg-purple-50 text-purple-700">Directeur Regional</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Rabat-Salé-Kénitra</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-tighter">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Actif
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Hier, 18:45</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
              {/* Member 3 */}
              <tr className="group hover:bg-surface-bright transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img className="w-10 h-10 rounded-full object-cover" data-alt="Middle-aged Moroccan man with glasses and professional attire, soft lighting on a neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPT6cHHVUUyQwkrp6SX2D_XvWBQ6ihOj3VhQJ99oesa3_3ejfMuI0iWNuMzL-fbZzkkuDbdyFnna54sK722bfEabiD6yoiDiZbzGnv3vsxGiwLz-xlY7IVytnDGd3rCHseYK1XKsWLRYIC4zGHe7laBugYcafiqOxU7Omvhn65xPsMD7isjew5ZtTfOyJfLjHd5X9ZH8WAJeicJz641TApswn8t7fpfyJnRv9qCa85OHvYBAT32R2fV3BYBF35LeGWv31T0CAIa2zC" />
                    <div>
                      <p className="font-bold text-primary">Driss Mansouri</p>
                      <p className="text-xs text-on-surface-variant">driss.m@smartestate.ma</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium px-2 py-1 rounded bg-amber-50 text-amber-700">Agent Expert</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Marrakech-Safi</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    Inactif
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Il y a 3 jours</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
              {/* Member 4 */}
              <tr className="group hover:bg-surface-bright transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">LH</div>
                    <div>
                      <p className="font-bold text-primary">Leila Hassani</p>
                      <p className="text-xs text-on-surface-variant">l.hassani@smartestate.ma</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium px-2 py-1 rounded bg-blue-50 text-blue-700">Analyste</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Tanger-Tétouan</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-tighter">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Actif
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">Il y a 1h</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-surface-variant/30 flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">Affichage de 4 membres sur 12</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">Précédent</button>
            <button className="px-4 py-2 text-sm font-medium border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">Suivant</button>
          </div>
        </div>
      </div>
      {/* Team Roles & Permissions (Asymmetric Layout) */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <h3 className="font-headline text-2xl font-bold text-primary mb-4">Hiérarchie &amp; Rôles</h3>
          <p className="text-on-surface-variant mb-6">Définissez des niveaux d'accès personnalisés pour sécuriser vos données stratégiques.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border-l-4 border-emerald-700">
              <span className="material-symbols-outlined text-emerald-700 mt-1">shield_person</span>
              <div>
                <p className="font-bold text-primary">Administrateur</p>
                <p className="text-sm text-on-surface-variant">Accès total à la configuration et à la facturation.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-surface-variant/50">
              <span className="material-symbols-outlined text-slate-400 mt-1">analytics</span>
              <div>
                <p className="font-bold text-primary">Analyste</p>
                <p className="text-sm text-on-surface-variant">Lecture et édition des rapports et estimations.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 bg-primary text-white p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="relative z-10">
            <h4 className="font-headline text-2xl font-bold mb-4">Sécurité &amp; Collaboration</h4>
            <p className="text-primary-fixed-dim text-lg leading-relaxed mb-8">Toutes les actions sont tracées pour garantir l'intégrité de vos transactions immobilières et la confidentialité de vos clients.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-secondary-fixed-dim">verified</span>
                Authentification à deux facteurs active
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-secondary-fixed-dim">verified</span>
                Journaux d'audit conformes à la loi marocaine
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-secondary-fixed-dim">verified</span>
                Chiffrement de bout en bout des fichiers partagés
              </li>
            </ul>
          </div>
          {/* Decorative background graphic */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
        </div>
      </div>
    </div>
  </main>
  {/* Footer Area (Optional based on design system but good for completeness) */}
  <footer className="md:pl-64 border-t border-surface-variant/30 mt-12">
    <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-on-surface-variant gap-4">
      <p>© 2024 SmartEstate Maroc. Tous droits réservés.</p>
      <div className="flex gap-6">
        <a className="hover:text-primary transition-colors" href="#">Politique de Confidentialité</a>
        <a className="hover:text-primary transition-colors" href="#">Conditions d'Utilisation</a>
        <a className="hover:text-primary transition-colors" href="#">Conformité CNDP</a>
      </div>
    </div>
  </footer>
</div>

    </ImportedPageDocument>
  );
}
