import type { NavigateFunction } from "react-router-dom";
import {
  APP_ROUTES,
  buildMailtoHref,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "./smartestateApp";

type DocumentActionContext = {
  currentPath: string;
  isAuthenticated: boolean;
  logout: () => void;
  navigate: NavigateFunction;
};

function normalizeText(value: null | string | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getLabel(trigger: HTMLElement) {
  return normalizeText(trigger.textContent);
}

function getIcon(trigger: HTMLElement) {
  const iconNode = trigger.querySelector<HTMLElement>("[data-icon], .material-symbols-outlined");
  return normalizeText(iconNode?.getAttribute("data-icon") ?? iconNode?.textContent);
}

function scrollToHash(hash: string) {
  const target = document.querySelector(hash);
  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function focusFirstControl() {
  const control = document.querySelector<HTMLElement>(
    "main select, main input[type='search'], main input[type='text'], main input[type='email']",
  );

  control?.focus();
}

function toggleButtonGroup(trigger: HTMLElement) {
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
  if (!(trigger instanceof HTMLButtonElement)) {
    return;
  }

  const isActive = trigger.getAttribute("aria-pressed") === "true";
  trigger.setAttribute("aria-pressed", String(!isActive));
  trigger.classList.toggle("ring-2", !isActive);
  trigger.classList.toggle("ring-secondary/20", !isActive);
}

function openSupportEmail(subject: string, body: string) {
  window.location.href = buildMailtoHref(subject, body);
}

async function shareCurrentPage() {
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
  if (context.isAuthenticated) {
    context.navigate(APP_ROUTES.dashboard);
    return;
  }

  context.navigate(APP_ROUTES.login, {
    state: {
      from: APP_ROUTES.dashboard,
      prefillDemo: true,
    },
  });
}

function matchesAny(label: string, values: string[]) {
  return values.some((value) => label.includes(value));
}

function goToRoute(label: string, icon: string, context: DocumentActionContext) {
  const routeMap = [
    { match: ["tableau de bord"], route: APP_ROUTES.dashboard },
    { match: ["portfolio", "gestion d'actifs", "gestion dactifs"], route: APP_ROUTES.portfolio },
    { match: ["estimation", "estimateur ia"], route: APP_ROUTES.estimation },
    { match: ["scenario", "scenarios"], route: APP_ROUTES.scenarios },
    { match: ["recommandation", "recommandations"], route: APP_ROUTES.recommendations },
    { match: ["rapport", "rapports", "analyses de marche"], route: APP_ROUTES.reports },
    { match: ["equipe"], route: APP_ROUTES.team },
  ];

  const iconMap: Record<string, string> = {
    auto_awesome: APP_ROUTES.recommendations,
    calculate: APP_ROUTES.estimation,
    dashboard: APP_ROUTES.dashboard,
    description: APP_ROUTES.reports,
    domain: APP_ROUTES.portfolio,
    group: APP_ROUTES.team,
    insights: APP_ROUTES.scenarios,
    query_stats: APP_ROUTES.scenarios,
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
    context.navigate(context.isAuthenticated ? APP_ROUTES.dashboard : APP_ROUTES.signup);
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
    context.navigate(APP_ROUTES.scenarios);
    return true;
  }

  if (matchesAny(label, ["inviter un membre"])) {
    context.navigate(APP_ROUTES.team);
    return true;
  }

  if (
    matchesAny(label, [
      "voir tout le marche",
      "historique complet",
      "voir tout lhistorique",
      "dossier danalyse",
    ])
  ) {
    context.navigate(APP_ROUTES.reports);
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
    context.navigate(APP_ROUTES.reports);
    return true;
  }

  if (icon === "settings") {
    context.navigate(APP_ROUTES.team);
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
    context.navigate(APP_ROUTES.reports);
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
