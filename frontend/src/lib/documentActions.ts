// Actions interactives des pages importees: navigation, cibles et comportements de prototype.
import type { NavigateFunction } from "react-router-dom";
import {
  APP_ROUTES,
  buildMailtoHref,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "./smartestateApp";
import { getHomeRouteForRole } from "./roles";

type DocumentActionContext = {
  currentPath: string;
  isAuthenticated: boolean;
  logout: () => void;
  navigate: NavigateFunction;
  userRole?: string;
};

function normalizeText(value: null | string | undefined) {
  // Normalise un texte UI pour faciliter les comparaisons tolerant aux accents.
  // Cette base commune sert a detecter des intentions depuis des libelles varies.
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getLabel(trigger: HTMLElement) {
  // Recupere le libelle textuel principal d'un element interactif.
  // Le texte est normalise pour etre exploitable dans les correspondances.
  return normalizeText(trigger.textContent);
}

function getIcon(trigger: HTMLElement) {
  // Recupere l'icone eventuelle associee a un bouton ou lien.
  // Le nom de l'icone peut servir de secours quand le texte est ambigu.
  const iconNode = trigger.querySelector<HTMLElement>("[data-icon], .material-symbols-outlined");
  return normalizeText(iconNode?.getAttribute("data-icon") ?? iconNode?.textContent);
}

function scrollToHash(hash: string) {
  // Fait defiler la page vers l'ancre demandee si elle existe.
  // La fonction retourne un booleen pour indiquer si l'action a reussi.
  const target = document.querySelector(hash);
  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function downloadTextFile(filename: string, content: string) {
  // Genere puis telecharge un petit fichier texte cote navigateur.
  // Ce helper sert aux exports prototypes et aux sorties legales simplifiees.
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function focusFirstControl() {
  // Place le focus sur le premier controle principal visible dans la page.
  // Cela accompagne certaines actions de filtre ou de recherche prototype.
  const control = document.querySelector<HTMLElement>(
    "main select, main input[type='search'], main input[type='text'], main input[type='email']",
  );

  control?.focus();
}

function toggleButtonGroup(trigger: HTMLElement) {
  // Active visuellement un bouton dans un groupe et desactive ses voisins.
  // Le helper manipule aussi aria-pressed pour un etat plus explicite.
  const parent = trigger.parentElement;
  if (!parent) {
    return;
  }

  const siblings = parent.querySelectorAll<HTMLButtonElement>("button");
  siblings.forEach((button) => {
    button.classList.remove("ring-2", "ring-secondary/20", "shadow-sm", "bg-white", "text-primary");
    button.classList.add("opacity-75");
    button.setAttribute("aria-pressed", "false");
  });

  if (trigger instanceof HTMLButtonElement) {
    trigger.classList.add("ring-2", "ring-secondary/20", "shadow-sm", "bg-white", "text-primary");
    trigger.classList.remove("opacity-75");
    trigger.setAttribute("aria-pressed", "true");
  }
}

function toggleStandaloneButton(trigger: HTMLElement) {
  // Inverse l'etat visuel d'un bouton autonome.
  // Cette interaction sert de fallback pour plusieurs controles prototypes.
  if (!(trigger instanceof HTMLButtonElement)) {
    return;
  }

  const isActive = trigger.getAttribute("aria-pressed") === "true";
  trigger.setAttribute("aria-pressed", String(!isActive));
  trigger.classList.toggle("ring-2", !isActive);
  trigger.classList.toggle("ring-secondary/20", !isActive);
}

function openSupportEmail(subject: string, body: string) {
  // Ouvre le client mail du navigateur vers l'adresse de support SmartEstate.
  // Le sujet et le corps sont delegues au builder mailto central.
  window.location.href = buildMailtoHref(subject, body);
}

async function shareCurrentPage() {
  // Tente de partager la page courante via l'API Web Share.
  // Si elle est absente, l'URL est copiee dans le presse-papiers quand possible.
  const shareData = {
    text: "Decouvrez la plateforme SmartEstate.",
    title: document.title,
    url: window.location.href,
  };

  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(window.location.href);
  }
}

function openDemo(context: DocumentActionContext) {
  // Ouvre soit l'espace connecte, soit la connexion pre-remplie demo.
  // Ce helper est utilise par les boutons de demonstration importes.
  if (context.isAuthenticated) {
    context.navigate(getHomeRouteForRole(context.userRole));
    return;
  }

  context.navigate(APP_ROUTES.login, {
    state: {
      from: APP_ROUTES.userEstimation,
      prefillDemo: true,
    },
  });
}

function matchesAny(label: string, values: string[]) {
  // Indique si un libelle contient l'une des expressions attendues.
  // La recherche repose sur des textes deja normalises.
  return values.some((value) => label.includes(value));
}

function goToRoute(label: string, icon: string, context: DocumentActionContext) {
  // Associe un libelle ou une icone a une route de l'application.
  // Cette table de correspondance centralise la navigation des prototypes importes.
  const routeMap = [
    { match: ["tableau de bord"], route: getHomeRouteForRole(context.userRole) },
    { match: ["estimation", "estimateur ia"], route: APP_ROUTES.userEstimation },
    { match: ["annonces etl", "annonces du marche", "marche etl"], route: APP_ROUTES.marketListings },
    { match: ["scenario", "scenarios", "simulation"], route: APP_ROUTES.userSimulation },
    { match: ["recommandation", "recommandations"], route: APP_ROUTES.userRecommendations },
    { match: ["historique", "rapport", "rapports"], route: APP_ROUTES.userHistory },
    { match: ["equipe", "utilisateurs"], route: APP_ROUTES.adminUsers },
  ];

  const iconMap: Record<string, string> = {
    auto_awesome: APP_ROUTES.userRecommendations,
    calculate: APP_ROUTES.userEstimation,
    dashboard: getHomeRouteForRole(context.userRole),
    description: APP_ROUTES.userHistory,
    group: APP_ROUTES.adminUsers,
    insights: APP_ROUTES.userSimulation,
    travel_explore: APP_ROUTES.marketListings,
    query_stats: APP_ROUTES.userSimulation,
  };

  for (const entry of routeMap) {
    if (matchesAny(label, entry.match)) {
      context.navigate(entry.route);
      return true;
    }
  }

  if (iconMap[icon]) {
    context.navigate(iconMap[icon]);
    return true;
  }

  return false;
}

export function handleDocumentAction(trigger: HTMLElement, context: DocumentActionContext) {
  // Interprete un clic prototype et declenche l'action la plus plausible.
  // Navigation, support, export et toggles UI sont centralises dans cette fonction.
  const label = getLabel(trigger);
  const icon = getIcon(trigger);
  const href = trigger instanceof HTMLAnchorElement ? trigger.getAttribute("href") : null;

  if (href?.startsWith("#") && href.length > 1) {
    return scrollToHash(href);
  }

  if (label === "plateforme") {
    if (context.currentPath === APP_ROUTES.home) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      context.navigate(APP_ROUTES.home);
    }
    return true;
  }

  if (matchesAny(label, ["mot de passe oublie", "mot de passe oublie ?"])) {
    openSupportEmail(
      "Recuperation d'acces SmartEstate",
      "Bonjour,\n\nJ'ai besoin d'aide pour reinitialiser mon mot de passe SmartEstate.\n\nMerci.",
    );
    return true;
  }

  if (matchesAny(label, ["connexion", "se connecter", "acces investisseur"])) {
    context.navigate(APP_ROUTES.login);
    return true;
  }

  if (
    matchesAny(label, [
      "essai gratuit",
      "commencer gratuitement",
      "creer mon compte",
      "creer un profil",
    ])
  ) {
    context.navigate(context.isAuthenticated ? getHomeRouteForRole(context.userRole) : APP_ROUTES.signup);
    return true;
  }

  if (label.includes("voir la demo")) {
    openDemo(context);
    return true;
  }

  if (
    matchesAny(label, [
      "parler a un expert",
      "contacter un expert",
      "centre d'aide",
      "centre daide",
      "support",
      "aide",
    ])
  ) {
    openSupportEmail(
      "Contact SmartEstate",
      `Bonjour,\n\nJe souhaite etre contacte par un expert SmartEstate.\nTelephone: ${SUPPORT_PHONE}\n\nMerci.`,
    );
    return true;
  }

  if (matchesAny(label, ["deconnexion"]) || icon === "logout") {
    context.logout();
    context.navigate(APP_ROUTES.home);
    return true;
  }

  if (goToRoute(label, icon, context)) {
    return true;
  }

  if (matchesAny(label, ["nouvelle analyse", "generer avec l'ia", "generer avec lia"])) {
    context.navigate(APP_ROUTES.userEstimation);
    return true;
  }

  if (matchesAny(label, ["inviter un membre"])) {
    context.navigate(APP_ROUTES.adminUsers);
    return true;
  }

  if (
    matchesAny(label, [
      "voir tout le marche",
      "toutes les annonces etl",
      "annonces etl",
      "historique complet",
      "voir tout lhistorique",
      "dossier danalyse",
    ])
  ) {
    context.navigate(APP_ROUTES.marketListings);
    return true;
  }

  if (matchesAny(label, ["filtrer"]) || icon === "filter_list" || icon === "sort") {
    focusFirstControl();
    toggleStandaloneButton(trigger);
    return true;
  }

  if (
    matchesAny(label, ["exporter tout", "telecharger"]) ||
    icon === "download"
  ) {
    downloadTextFile(
      "smartestate-export.txt",
      `SmartEstate export\nPage: ${document.title}\nURL: ${window.location.href}\nSupport: ${SUPPORT_EMAIL}\n`,
    );
    return true;
  }

  if (
    matchesAny(label, ["conditions", "confidentialite", "protection des donnees", "cndp"])
  ) {
    downloadTextFile(
      "smartestate-legal.txt",
      "Documentation legale SmartEstate.\n\nPour la version contractuelle a jour, contactez contact@smartestate.ma.",
    );
    return true;
  }

  if (matchesAny(label, ["precedent"])) {
    window.history.back();
    return true;
  }

  if (matchesAny(label, ["suivant"])) {
    window.history.forward();
    return true;
  }

  if (
    matchesAny(label, [
      "vue d'ensemble",
      "vue densemble",
      "par ville",
      "valeur",
      "rendement",
      "mixte",
      "residentiel",
      "retail",
    ])
  ) {
    toggleButtonGroup(trigger);
    return true;
  }

  if (icon === "notifications") {
    context.navigate(APP_ROUTES.userHistory);
    return true;
  }

  if (icon === "settings") {
    context.navigate(APP_ROUTES.adminSettings);
    return true;
  }

  if (icon === "mail") {
    openSupportEmail("Contact SmartEstate", "Bonjour,\n\nJe souhaite obtenir plus d'informations.\n");
    return true;
  }

  if (icon === "public") {
    context.navigate(APP_ROUTES.home);
    return true;
  }

  if (icon === "share") {
    void shareCurrentPage();
    return true;
  }

  if (icon === "visibility") {
    context.navigate(APP_ROUTES.userHistory);
    return true;
  }

  if (icon === "more_vert") {
    toggleStandaloneButton(trigger);
    return true;
  }

  if (trigger instanceof HTMLButtonElement && (label || icon)) {
    toggleStandaloneButton(trigger);
    return true;
  }

  return false;
}
