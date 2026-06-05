import ImportedPageDocument from "../components/ImportedPageDocument";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }`;

export default function HomePage() {
  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-surface font-body selection:bg-secondary-container overflow-x-hidden"
      title="Page d'Accueil SmartEstate"
      styles={pageStyles}
    >
      <div>
  {/* Header */}
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-10">
        <span className="text-xl font-black tracking-tighter text-[#1A237E] font-headline">SmartEstate</span>
        <nav className="hidden md:flex flex-row items-center gap-8">
          <a className="text-[#1b6d24] border-b-2 border-[#1b6d24] pb-1 font-semibold text-sm" href="#">Plateforme</a>
          <a className="text-[#454652] hover:text-[#1b6d24] font-semibold text-sm transition-colors" href="#how-it-works">Méthodologie</a>
          <a className="text-[#454652] hover:text-[#1b6d24] font-semibold text-sm transition-colors" href="#market-insights">Analyses Market</a>
          <a className="text-[#454652] hover:text-[#1b6d24] font-semibold text-sm transition-colors" href="#faq">FAQ</a>
        </nav>
      </div>
      <div className="flex flex-row items-center gap-6">
        <button className="text-[#454652] font-semibold text-sm hover:text-[#1b6d24] transition-colors">Connexion</button>
        <button className="bg-[#1b6d24] text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:opacity-90 transition-all">Essai Gratuit</button>
      </div>
    </div>
  </header>
  <main>
    {/* Hero Section */}
    <section className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col items-start gap-8">
          <div className="inline-flex flex-row items-center gap-2 px-3 py-1 bg-secondary-container/30 text-secondary rounded-full">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest font-label">Leader de la PropTech au Maroc</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold font-headline text-primary leading-tight tracking-tighter">
            L'intelligence artificielle au service de votre <span className="text-secondary">patrimoine immobilier</span> au Maroc
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl">
            Analysez, optimisez et gérez vos actifs avec une précision institutionnelle. Rejoignez l'élite des investisseurs marocains.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <button className="bg-[#1b6d24] text-white px-10 py-4.5 rounded-xl font-bold text-lg shadow-xl shadow-secondary/10 hover:shadow-secondary/20 transition-all">
              Commencer gratuitement
            </button>
            <button className="bg-white border border-outline-variant/30 text-on-surface px-10 py-4.5 rounded-xl font-bold text-lg hover:bg-surface-container-high transition-all flex flex-row items-center justify-center gap-2">
              Voir la démo <span className="material-symbols-outlined">play_circle</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5]">
            <img alt="Architecture moderne Maroc" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNG5Lt9DQjSX-qu5krTXsF7iRvph2AWj8Y3L4U7ji6h9Dz3PPJ12PHbF33f7cRYnNa65rgDXzKlsWnhE7b5L8yxoGxwbKFhZHg1cDIiL4dd3-3s_IA1QU7JHheE9iB2liZdL8kSzg6ytg1mQSZDU5-kJJL4CUEbcBUHHgIB_Pqb247vYzQP9cladlVdTQO0f7cYQITlTDEhm1S2F6EOGYxMFV9Tn-Tivw7myOKZB3Vm0B3P4zNEXJcQZK4xpN9onVI3FUSKB3VR5in" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
          <div className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 w-72">
            <div className="flex flex-row items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-2xl">trending_up</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-primary text-lg">DH 4.2M</span>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Valeur Estimée</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-3/4 rounded-full" />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-3 font-semibold">+12.4% vs année dernière</p>
          </div>
        </div>
      </div>
    </section>
    {/* Stats Section */}
    <section className="bg-primary py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl font-extrabold font-headline text-white">2.4B DH</h2>
          <p className="text-primary-fixed-dim font-bold tracking-widest uppercase text-xs">d'actifs analysés</p>
        </div>
        <div className="flex flex-col gap-2 md:border-x md:border-white/10">
          <h2 className="text-5xl font-extrabold font-headline text-secondary-fixed">+18.5%</h2>
          <p className="text-primary-fixed-dim font-bold tracking-widest uppercase text-xs">rentabilité moyenne</p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl font-extrabold font-headline text-white">12k+</h2>
          <p className="text-primary-fixed-dim font-bold tracking-widest uppercase text-xs">investisseurs actifs</p>
        </div>
      </div>
    </section>
    {/* Methodology Section */}
    <section className="py-32 px-6 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 flex flex-col items-center">
          <span className="text-secondary font-bold tracking-widest text-[10px] uppercase mb-4">Notre Méthodologie</span>
          <h2 className="text-4xl lg:text-5xl font-bold font-headline text-primary tracking-tight">L'Intelligence au Coeur de l'Immobilier</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-6 p-10 rounded-[2.5rem] bg-surface border border-outline-variant/20 shadow-sm">
            <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-secondary">database</span>
            </div>
            <h3 className="text-2xl font-bold font-headline text-primary">1. Collecte Massive</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Agrégation en temps réel des données foncières, annonces de marché, et indicateurs macro-économiques marocains.
            </p>
          </div>
          <div className="flex flex-col gap-6 p-10 rounded-[2.5rem] bg-white border border-outline-variant/20 shadow-xl ring-4 ring-primary/5 scale-105">
            <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-secondary">model_training</span>
            </div>
            <h3 className="text-2xl font-bold font-headline text-primary">2. Machine Learning</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Nos modèles exclusifs traitent des millions de points de données pour identifier les corrélations invisibles à l'œil humain.
            </p>
          </div>
          <div className="flex flex-col gap-6 p-10 rounded-[2.5rem] bg-surface border border-outline-variant/20 shadow-sm">
            <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-secondary">insights</span>
            </div>
            <h3 className="text-2xl font-bold font-headline text-primary">3. Insights Prédictifs</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Génération de scores d'opportunité et projections de cash-flow avec une précision institutionnelle inédite.
            </p>
          </div>
        </div>
      </div>
    </section>
    {/* Expertise Section */}
    <section className="py-32 px-6 bg-surface-container-low">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="relative flex justify-center">
          <img alt="Building Expertise" className="rounded-[3rem] shadow-2xl w-full max-w-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIRUYu3NviRR7waKkFNhAQwMFDlmq7mriAXE4ch2dsRqRgu6ewnwiUvgSuPFQSSrNeWcEdaJcG4D9frBiAfVNgLgJcI65It1Z_pf-hEIvhKSo60v5ZDiu8rcWXfpk6YNNwtVGatKW4NZuJdUJwHRocv9dQ1yDOLUc_Ue_Xigk2RBGkYPYY7_0JoC0LlY1YHsZbyOSRDuQi0drw79TEyp6tezPNV8gxJhZPwszpeEc37YMEDZbZGRaS8JcpiTqLE1PwxKut204yYe21" />
          <div className="absolute -z-10 bg-secondary/10 w-64 h-64 rounded-full blur-[80px]" />
        </div>
        <div className="flex flex-col gap-12">
          <h2 className="text-4xl font-bold font-headline text-primary">Une solution, deux expertises</h2>
          <div className="flex flex-col gap-10">
            <div className="flex flex-row gap-6">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">person_check</span>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold text-primary">Investisseurs Particuliers</h4>
                <p className="text-on-surface-variant leading-relaxed text-sm">Accédez aux mêmes outils que les banques d'affaires. Optimisez votre fiscalité immobilière marocaine et sécurisez votre retraite via des actifs rentables.</p>
              </div>
            </div>
            <div className="flex flex-row gap-6">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary-fixed">apartment</span>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold text-primary">Institutions &amp; Gestionnaires</h4>
                <p className="text-on-surface-variant leading-relaxed text-sm">Analyses de portefeuilles massives, reporting automatisé conforme aux normes de Casablanca Finance City, et veille concurrentielle en temps réel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* Market Trends Section */}
    <section className="py-32 px-6" id="market-insights">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="flex flex-col gap-4">
            <span className="text-secondary font-bold tracking-widest text-[10px] uppercase">Tendances Actuelles</span>
            <h2 className="text-4xl font-bold font-headline text-primary">Le Marché en Temps Réel</h2>
          </div>
          <p className="text-on-surface-variant max-w-sm text-sm">
            Indices SmartEstate basés sur plus de 450,000 transactions enregistrées au cours des 24 derniers mois.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* City Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <span className="font-bold text-primary">Casablanca</span>
              <span className="text-secondary font-bold text-sm">+4.2%</span>
            </div>
            <div className="flex flex-row items-baseline gap-1">
              <span className="text-2xl font-black text-primary">18,500</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase">DH/m²</span>
            </div>
            <div className="h-10 w-full bg-surface-container-low rounded-lg overflow-hidden relative">
              <svg className="absolute bottom-0 w-full h-full text-secondary/20" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0 35 Q 25 35, 50 20 T 100 10" fill="none" stroke="currentColor" strokeWidth={2} />
              </svg>
            </div>
          </div>
          {/* City Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <span className="font-bold text-primary">Marrakech</span>
              <span className="text-secondary font-bold text-sm">+6.8%</span>
            </div>
            <div className="flex flex-row items-baseline gap-1">
              <span className="text-2xl font-black text-primary">15,200</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase">DH/m²</span>
            </div>
            <div className="h-10 w-full bg-surface-container-low rounded-lg overflow-hidden relative">
              <svg className="absolute bottom-0 w-full h-full text-secondary/20" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0 35 Q 30 15, 60 25 T 100 5" fill="none" stroke="currentColor" strokeWidth={2} />
              </svg>
            </div>
          </div>
          {/* City Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <span className="font-bold text-primary">Tanger</span>
              <span className="text-secondary font-bold text-sm">+5.1%</span>
            </div>
            <div className="flex flex-row items-baseline gap-1">
              <span className="text-2xl font-black text-primary">12,800</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase">DH/m²</span>
            </div>
            <div className="h-10 w-full bg-surface-container-low rounded-lg overflow-hidden relative">
              <svg className="absolute bottom-0 w-full h-full text-secondary/20" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0 30 Q 20 40, 50 15 T 100 20" fill="none" stroke="currentColor" strokeWidth={2} />
              </svg>
            </div>
          </div>
          {/* City Card 4 */}
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <span className="font-bold text-primary">Rabat</span>
              <span className="text-secondary font-bold text-sm">+3.5%</span>
            </div>
            <div className="flex flex-row items-baseline gap-1">
              <span className="text-2xl font-black text-primary">17,100</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase">DH/m²</span>
            </div>
            <div className="h-10 w-full bg-surface-container-low rounded-lg overflow-hidden relative">
              <svg className="absolute bottom-0 w-full h-full text-secondary/20" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0 35 Q 40 30, 70 35 T 100 15" fill="none" stroke="currentColor" strokeWidth={2} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* FAQ Section */}
    <section className="py-32 px-6 bg-white" id="faq">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-4xl font-bold font-headline text-primary">Questions Fréquentes</h2>
          <p className="text-on-surface-variant">Tout ce que vous devez savoir sur notre plateforme.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 p-6 bg-white border border-outline-variant/20 rounded-2xl">
            <div className="flex flex-row justify-between items-center cursor-pointer">
              <h4 className="font-bold text-primary">Quelle est la précision de vos estimations ?</h4>
              <span className="material-symbols-outlined text-secondary">expand_more</span>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Nos modèles atteignent une précision moyenne de 98.2% par rapport aux transactions finales enregistrées. Nous utilisons les données croisées de l'ANCFCC, des portails immobiliers et des réseaux d'agences partenaires.
            </p>
          </div>
          <div className="flex flex-row justify-between items-center p-6 bg-white border border-outline-variant/20 rounded-2xl cursor-pointer">
            <h4 className="font-bold text-primary">Est-ce adapté pour les terrains agricoles ?</h4>
            <span className="material-symbols-outlined text-secondary">expand_more</span>
          </div>
          <div className="flex flex-row justify-between items-center p-6 bg-white border border-outline-variant/20 rounded-2xl cursor-pointer">
            <h4 className="font-bold text-primary">Comment garantissez-vous la confidentialité des données ?</h4>
            <span className="material-symbols-outlined text-secondary">expand_more</span>
          </div>
        </div>
      </div>
    </section>
    {/* Testimonial Section */}
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto relative p-16 bg-white rounded-[3rem] shadow-xl border border-outline-variant/10 flex flex-col gap-10">
        <span className="material-symbols-outlined text-9xl absolute -top-12 -left-8 text-surface-container opacity-30 -z-10">format_quote</span>
        <p className="text-3xl font-headline italic text-primary leading-tight">
          "SmartEstate a radicalement changé notre approche de l'acquisition foncière. La précision des données sur le marché marocain est sans précédent, nous permettant de sécuriser des actifs à haut rendement avec une confiance totale."
        </p>
        <div className="flex flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-secondary/10 shrink-0">
            <img alt="Ahmed Benjelloun" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiZMPO7FJf6BgDWfEYqpkMDN9fLIV0t43CMVP2ScK73yfRyL-F6ywJLgps7m0WHHtiAdfDj-bNh2lAk3-aoKomwlOSjjChAxh1SVN65JD-Gjy0de4ndTYwpFRxVHRAVYpHX4bz3GpWcFUG9L84xZOl1XyeBen15SG-YVz-H3aZlWCveR343BxjJ7o3eC7NF6GGvZz5lg20sB8cRO_sKlyiO0h2peZfzDZ2skNb2DCJdGf5lry8EGaTMgdz6TzNBhaDCvZngsWr5_hx" />
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-primary">Ahmed Benjelloun</h4>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-extrabold">Directeur d'Investissement, Atlas Capital</p>
          </div>
        </div>
      </div>
    </section>
    {/* Partners Section */}
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.3em]">Partenaires Institutionnels</p>
        <div className="flex flex-wrap flex-row justify-center items-center gap-16 opacity-40">
          <span className="text-2xl font-black font-headline tracking-tighter">ATTIJARIWAFABANK</span>
          <span className="text-2xl font-black font-headline tracking-tighter">BCP GROUP</span>
          <span className="text-2xl font-black font-headline tracking-tighter">CFC HOLDING</span>
          <span className="text-2xl font-black font-headline tracking-tighter">FINANCE COM</span>
        </div>
      </div>
    </section>
    {/* Final CTA Section */}
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto bg-primary rounded-[3.5rem] p-20 text-center flex flex-col items-center gap-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />
        <div className="flex flex-col gap-6 max-w-2xl">
          <h2 className="text-4xl lg:text-6xl font-bold font-headline text-white">Prêt à transformer vos investissements ?</h2>
          <p className="text-primary-fixed-dim text-xl">
            Accédez dès aujourd'hui à la plateforme de référence pour l'immobilier haut de gamme au Maroc.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 relative z-10">
          <button className="bg-secondary text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-secondary/90 transition-all shadow-2xl shadow-black/20">
            Créer mon compte
          </button>
          <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all">
            Parler à un expert
          </button>
        </div>
      </div>
    </section>
  </main>
  {/* Footer */}
  <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-20 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
      <div className="md:col-span-5 flex flex-col gap-8">
        <span className="font-headline font-extrabold text-[#1A237E] text-2xl tracking-tighter">SmartEstate Morocco</span>
        <p className="text-[#454652] opacity-80 text-sm leading-relaxed max-w-sm">
          L'architecture de l'investissement intelligent. Solutions technologiques de pointe pour le marché immobilier marocain, basées à Casablanca Finance City.
        </p>
        <div className="flex flex-row gap-6 text-[#454652]">
          <span className="material-symbols-outlined cursor-pointer hover:text-secondary">public</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-secondary">share</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-secondary">mail</span>
        </div>
      </div>
      <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
        <div className="flex flex-col gap-6">
          <h5 className="font-bold text-primary text-xs uppercase tracking-widest">Plateforme</h5>
          <ul className="flex flex-col gap-4">
            <li><a className="text-[#454652]/70 hover:text-secondary text-sm transition-colors" href="#">Analyses de Marché</a></li>
            <li><a className="text-[#454652]/70 hover:text-secondary text-sm transition-colors" href="#">Estimateur IA</a></li>
            <li><a className="text-[#454652]/70 hover:text-secondary text-sm transition-colors" href="#">Gestion d'Actifs</a></li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <h5 className="font-bold text-primary text-xs uppercase tracking-widest">Légal</h5>
          <ul className="flex flex-col gap-4">
            <li><a className="text-[#454652]/70 hover:text-secondary text-sm transition-colors" href="#">Conditions Générales</a></li>
            <li><a className="text-[#454652]/70 hover:text-secondary text-sm transition-colors" href="#">Protection des Données</a></li>
            <li><a className="text-[#454652]/70 hover:text-secondary text-sm transition-colors" href="#">Conformité CNDP</a></li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <h5 className="font-bold text-primary text-xs uppercase tracking-widest">Support</h5>
          <ul className="flex flex-col gap-4">
            <li><a className="text-[#454652]/70 hover:text-secondary text-sm transition-colors" href="#">Centre d'aide</a></li>
            <li><a className="text-secondary font-bold underline text-sm" href="#">Contacter un expert</a></li>
          </ul>
        </div>
      </div>
      <div className="md:col-span-12 pt-16 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-start gap-8">
        <p className="font-inter text-[10px] font-bold uppercase tracking-widest text-[#454652]">© 2026 SmartEstate Morocco. Tous droits réservés.</p>
        <p className="text-[10px] text-[#454652]/60 max-w-xl leading-relaxed">
          SmartEstate Morocco est une plateforme technologique. Les investissements immobiliers comportent des risques. Les rendements passés ne garantissent pas les résultats futurs. Agrément AMMC en cours.
        </p>
      </div>
    </div>
  </footer>
</div>

    </ImportedPageDocument>
  );
}
