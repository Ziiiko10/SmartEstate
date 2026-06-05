// Simulation d'investissement: compare le cout, le financement et la rentabilite.
import { useMemo, useState } from "react";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { Field, MetricCard, SelectField } from "../components/PageWidgets";
import { formatDh, formatPercent, toNumber } from "../lib/formatters";

const pageStyles = `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }`;

type SimulationForm = {
  agencyFees: string;
  bankRatePresetId: string;
  downPayment: string;
  loanAmount: string;
  loanDurationYears: string;
  monthlyCharges: string;
  monthlyRent: string;
  notaryFees: string;
  purchasePrice: string;
  worksBudget: string;
  yearlyInterestRate: string;
};

type MoroccanBankCatalogEntry = {
  agencyCount2024: number;
  annualRate: string;
  asOf: string;
  bankName: string;
  category: "conventional" | "participative";
  id: string;
  isSelectable: boolean;
  note: string;
  offerLabel: string;
  rateLabel: string;
  sourceLabel: string;
  sourceUrl: string;
};

const VERIFIED_BANK_DATA_AT = "5 juin 2026";
const BKAM_BANKING_IMPLANTATION_2024_LABEL = "Bank Al-Maghrib - Implantation bancaire 2024";
const BKAM_BANKING_IMPLANTATION_2024_URL =
  "https://www.bkam.ma/fr/content/download/825344/9011558/Implantation%20Bancaire%202024.pdf";
const FIXED_BANK_INTEREST_RATE = "4.75";
const FIXED_BANK_INTEREST_RATE_LABEL = `${toNumber(FIXED_BANK_INTEREST_RATE).toLocaleString("fr-MA", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})} % fixe`;
const NO_PUBLIC_RATE_LABEL = "Taux public non publié";

const MOROCCAN_BANKS: MoroccanBankCatalogEntry[] = [
  {
    agencyCount2024: 943,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Al Barid Bank",
    category: "conventional",
    id: "al-barid-bank",
    isSelectable: true,
    note: "Offre habitat grand public avec conditions tarifaires accessibles, mais sans taux unique chiffré sur la page officielle consultée.",
    offerLabel: "Crédit immobilier SalafLik",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Page officielle Al Barid Bank - Crédit immobilier SalafLik",
    sourceUrl: "https://www.albaridbank.ma/fr/produits/credit-immobilier-salaflik",
  },
  {
    agencyCount2024: 4,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Arab Bank PLC",
    category: "conventional",
    id: "arab-bank-plc",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    agencyCount2024: 929,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Attijariwafa bank",
    category: "conventional",
    id: "attijariwafa-bank",
    isSelectable: true,
    note: "Attijariwafa bank publie un parcours de simulation et de demande en ligne, mais renvoie vers le meilleur taux selon le dossier sans barème chiffré public sur la page consultée.",
    offerLabel: "Crédit Miftah / crédit immobilier en ligne",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Page officielle Attijariwafa bank - financement immobilier",
    sourceUrl: "https://www.attijariwafabank.com/fr/besoin/financer-vos-projets-immobiliers",
  },
  {
    agencyCount2024: 1,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Banco Sabadell",
    category: "conventional",
    id: "banco-sabadell",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    agencyCount2024: 1,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Bank Al-Amal",
    category: "conventional",
    id: "bank-al-amal",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    annualRate: "4.75",
    agencyCount2024: 636,
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "BANK OF AFRICA",
    category: "conventional",
    id: "boa-credit-habitat",
    isSelectable: true,
    note: "Taux public annonce a partir de 4,75 % selon le profil de l'emprunteur et la duree du pret.",
    offerLabel: "Credit Habitat / Immo Plus Classique",
    rateLabel: "4,75 % minimum",
    sourceLabel: "Article officiel BANK OF AFRICA",
    sourceUrl:
      "https://www.bankofafrica.ma/index.php/fr/articles/pourquoi-cest-le-bon-moment-pour-lachat-immobilier-au-maroc",
  },
  {
    annualRate: "4.1",
    agencyCount2024: 250,
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "BMCI",
    category: "conventional",
    id: "bmci-credit-habitat-mre",
    isSelectable: true,
    note: "Taux nominal HT de 4,1 % affiche sur l'exemple officiel BMCI Credit Habitat MRE.",
    offerLabel: "Credit Habitat MRE",
    rateLabel: "4,10 % nominal HT",
    sourceLabel: "Page officielle BMCI Credit Habitat",
    sourceUrl: "https://www.bmci.ma/particuliers/marocains-residents-a-letranger/credits/credit-habitat/",
  },
  {
    agencyCount2024: 3,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "CaixaBank",
    category: "conventional",
    id: "caixabank",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    agencyCount2024: 19,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "CFG Bank",
    category: "conventional",
    id: "cfg-bank",
    isSelectable: true,
    note: "CFG Bank publie son offre de crédit immobilier personnalisé, mais sans taux public chiffré unique sur la page consultée.",
    offerLabel: "Crédit immobilier personnalisé",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Page officielle CFG Bank - solutions de financement",
    sourceUrl: "https://www.cfgbank.com/particuliers/notre-offre/solution-financement/",
  },
  {
    agencyCount2024: 1,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "CDG Capital",
    category: "conventional",
    id: "cdg-capital",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    agencyCount2024: 2,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Citibank Maghreb",
    category: "conventional",
    id: "citibank-maghreb",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    agencyCount2024: 490,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Crédit Agricole du Maroc",
    category: "conventional",
    id: "credit-agricole-du-maroc",
    isSelectable: true,
    note: "Le Crédit Agricole du Maroc met en avant son Crédit Habitat avec meilleures conditions de financement et frais de dossier gratuits, sans publier un taux chiffré unique sur la page consultée.",
    offerLabel: "Crédit Habitat",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Page officielle Crédit Agricole du Maroc - Crédit Habitat",
    sourceUrl:
      "https://www.creditagricole.ma/fr/hadi-ma-kanetch-f-khbarek-votre-credit-habitat-vous-ouvre-les-portes-de-votre-foyer",
  },
  {
    agencyCount2024: 268,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Crédit du Maroc",
    category: "conventional",
    id: "credit-du-maroc",
    isSelectable: true,
    note: "Crédit du Maroc publie un espace immobilier et un simulateur habitat, mais sans taux public chiffré unique sur la page consultée.",
    offerLabel: "Simulateur crédit immobilier / habitat",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Site officiel Crédit du Maroc - immobilier",
    sourceUrl: "https://immobilier.creditdumaroc.ma/",
  },
  {
    agencyCount2024: 333,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "CIH Bank",
    category: "conventional",
    id: "cih-bank",
    isSelectable: true,
    note: "CIH Bank publie plusieurs produits immobiliers comme Code Sakane et Iskane, avec simulateur et caractéristiques, mais sans taux public chiffré unique sur la page consultée.",
    offerLabel: "Code Sakane / Iskane",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Page officielle CIH Bank - acquisition immobilière",
    sourceUrl:
      "https://www.cihbank.ma/particuliers/nos-offres/financer-mes-projets/financer-mon-projet-immobilier/acquisition",
  },
  {
    agencyCount2024: 1334,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Banque Populaire",
    category: "conventional",
    id: "banque-populaire",
    isSelectable: true,
    note: "Banque Populaire met à disposition un simulateur officiel de crédit immobilier, mais le taux doit être saisi par l'utilisateur sur l'outil consulté.",
    offerLabel: "Simulateur Crédit Immobilier",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Simulateur officiel Banque Populaire",
    sourceUrl: "https://bpnet.gbp.ma/Public/FinaServices/CreditSimulateurs",
  },
  {
    agencyCount2024: 1,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Fonds d'Équipement Communal",
    category: "conventional",
    id: "fec",
    isSelectable: false,
    note: "Banque dédiée au financement des collectivités territoriales; pas d'offre habitat grand public repérée sur la source officielle consultée.",
    offerLabel: "Financement des collectivités territoriales",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: "Site officiel FEC - réaliser vos projets",
    sourceUrl: "https://www.fec.ma/Realisez-vos-projets-8-100-4-5-6-7.html",
  },
  {
    agencyCount2024: 1,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "BCP Securities Services",
    category: "conventional",
    id: "bcp-securities-services",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    agencyCount2024: 264,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Société Générale Maroc",
    category: "conventional",
    id: "societe-generale-maroc",
    isSelectable: true,
    note: "La fiche officielle Salaf Bayti confirme l'offre immobilière, mais sans taux public chiffré unique sur la source consultée.",
    offerLabel: "Crédit Immobilier Salaf Bayti",
    rateLabel: "Taux à saisir manuellement",
    sourceLabel: "Fiche officielle SG Maroc - Salaf Bayti",
    sourceUrl: "https://www.sgmaroc.com/wp-content/uploads/2022/04/info-conso.pdf",
  },
  {
    agencyCount2024: 6,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Union Marocaine de Banques",
    category: "conventional",
    id: "umb",
    isSelectable: false,
    note: "Établissement listé par Bank Al-Maghrib; aucune offre habitat grand public n'a été clairement repérée sur la source officielle consultée.",
    offerLabel: "Pas d'offre habitat grand public repérée",
    rateLabel: NO_PUBLIC_RATE_LABEL,
    sourceLabel: BKAM_BANKING_IMPLANTATION_2024_LABEL,
    sourceUrl: BKAM_BANKING_IMPLANTATION_2024_URL,
  },
  {
    agencyCount2024: 40,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Bank Assafa",
    category: "participative",
    id: "bank-assafa",
    isSelectable: true,
    note: "Offre Mourabaha pour logement ou terrain avec simulateur en ligne; la banque ne publie pas de taux d'intérêt car il s'agit d'une marge participative.",
    offerLabel: "Assafa Sakane",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Page officielle Bank Assafa - Assafa Sakane",
    sourceUrl: "https://www.bankassafa.com/fr/assafa-sakane",
  },
  {
    agencyCount2024: 53,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Umnia Bank",
    category: "participative",
    id: "umnia-bank",
    isSelectable: true,
    note: "Financement Murabaha immobilier avec simulation et accord de principe en ligne; la banque ne publie pas de taux d'intérêt car il s'agit d'une marge participative.",
    offerLabel: "Murabaha Immobilier",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Page officielle Umnia Bank - financement immobilier",
    sourceUrl: "https://new.umniabank.ma/fr/financementimmobilier/",
  },
  {
    agencyCount2024: 26,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Bank Al Yousr",
    category: "participative",
    id: "bank-al-yousr",
    isSelectable: true,
    note: "Mourabaha immobilière avec simulation et marge bénéficiaire ajustée au bien et à la durée; la banque ne publie pas de taux d'intérêt unique.",
    offerLabel: "Mourabaha Immobilière",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Page officielle Bank Al Yousr - Mourabaha Immobilière",
    sourceUrl: "https://www.alyousr.ma/fr/particulier/mourabaha-immobiliere",
  },
  {
    agencyCount2024: 25,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Al Akhdar Bank",
    category: "participative",
    id: "al-akhdar-bank",
    isSelectable: true,
    note: "Banque participative du groupe Crédit Agricole du Maroc couvrant les besoins de financement immobilier via des instruments comme la Mourabaha.",
    offerLabel: "Financement immobilier participatif",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Page officielle Crédit Agricole du Maroc - Al Akhdar Bank",
    sourceUrl: "https://www.credit-agricole.ma/fr/al-akhdar-bank",
  },
  {
    agencyCount2024: 11,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Bank Al Karam (BTI Bank)",
    category: "participative",
    id: "bank-al-karam",
    isSelectable: true,
    note: "BTI Bank commercialise la Mourabaha Immobilière sous la marque Bank Al Karam, sans taux d'intérêt car la tarification repose sur une marge participative.",
    offerLabel: "Mourabaha Immobilière",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Page officielle BTI Bank - Bank Al Karam",
    sourceUrl: "https://btibank.ma/particuliers/vos-financements/mourabaha-immobilier/",
  },
  {
    agencyCount2024: 19,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Dar Al Amane",
    category: "participative",
    id: "dar-al-amane",
    isSelectable: true,
    note: "Dar Al Amane publie une plateforme de simulation et de demande de financement immobilier participatif, sans taux d'intérêt car l'offre repose sur la Mourabaha.",
    offerLabel: "Mourabaha Al Amane Lil-Akar",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Plateforme officielle Dar Al Amane - financement immobilier",
    sourceUrl: "https://mourabahasmart.daralamane.ma/",
  },
  {
    agencyCount2024: 17,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Najmah (BMCI)",
    category: "participative",
    id: "najmah-bmci",
    isSelectable: true,
    note: "Najmah propose une Mourabaha immobilière avec marge fixe sur la durée du financement, sans taux d'intérêt public.",
    offerLabel: "Mourabaha Immobilière",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Page officielle BMCI Najmah",
    sourceUrl: "https://www.bmci.ma/najmah/",
  },
  {
    agencyCount2024: 15,
    annualRate: "",
    asOf: VERIFIED_BANK_DATA_AT,
    bankName: "Arreda (Crédit du Maroc)",
    category: "participative",
    id: "arreda-credit-du-maroc",
    isSelectable: true,
    note: "Fenêtre participative de Crédit du Maroc avec offres habitat et points de vente dédiés; pas de taux d'intérêt public car l'offre est participative.",
    offerLabel: "Offres Habitat",
    rateLabel: "Marge à saisir manuellement",
    sourceLabel: "Page officielle Crédit du Maroc - Arreda Habitat",
    sourceUrl: "https://www.creditdumaroc.ma/institutionnel/arreda-12-nouveaux-points-de-vente-et-des-offres-pour-lhabitat",
  },
];

// Normalise les banques selectionnables avec un taux unique pour comparer les scenarios sur la meme base.
function withFixedSimulationRate(bank: MoroccanBankCatalogEntry): MoroccanBankCatalogEntry {
  return {
    ...bank,
    annualRate: FIXED_BANK_INTEREST_RATE,
    rateLabel: FIXED_BANK_INTEREST_RATE_LABEL,
  };
}

const SELECTABLE_MOROCCAN_BANKS = MOROCCAN_BANKS.filter((bank) => bank.isSelectable).map(withFixedSimulationRate);
const DEFAULT_SELECTED_BANK = SELECTABLE_MOROCCAN_BANKS[0];

const defaultForm: SimulationForm = {
  agencyFees: "36000",
  bankRatePresetId: DEFAULT_SELECTED_BANK.id,
  downPayment: "320000",
  loanAmount: "1280000",
  loanDurationYears: "20",
  monthlyCharges: "1400",
  monthlyRent: "9800",
  notaryFees: "64000",
  purchasePrice: "1600000",
  worksBudget: "90000",
  yearlyInterestRate: FIXED_BANK_INTEREST_RATE,
};

// Traduit la famille de banque en categorie lisible par l'utilisateur final.
function getBankCategoryLabel(category: MoroccanBankCatalogEntry["category"]) {
  return category === "participative" ? "Banque participative" : "Banque conventionnelle";
}

// Calcule la mensualite d'un pret amortissable a taux fixe.
function computeMonthlyPayment(loanAmount: number, annualRate: number, durationYears: number) {
  const monthlyRate = annualRate / 100 / 12;
  const months = durationYears * 12;

  if (loanAmount <= 0 || months <= 0) {
    return 0;
  }

  if (monthlyRate <= 0) {
    return loanAmount / months;
  }

  return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

// Produit une lecture simple de la rentabilite a partir du cash-flow et du rendement net.
function buildAdvice(monthlyGain: number, netYield: number) {
  if (monthlyGain > 1800 && netYield >= 6) {
    return {
      label: "Rentable",
      tone: "bg-secondary-container text-secondary",
      text: "Le scénario reste sain avec une marge positive et un rendement net solide.",
    };
  }

  if (monthlyGain >= 0 && netYield >= 4) {
    return {
      label: "Moyen",
      tone: "bg-amber-100 text-amber-800",
      text: "Le projet peut tenir, mais il mérite une négociation du prix ou des charges.",
    };
  }

  return {
    label: "Risqué",
    tone: "bg-red-100 text-red-700",
    text: "Le cash-flow est trop tendu. Réduisez le coût d'acquisition ou augmentez le loyer cible.",
  };
}

// Simule un investissement locatif a partir d'hypotheses de prix, credit et charges.
export default function UserInvestmentSimulationPage() {
  const [form, setForm] = useState<SimulationForm>(defaultForm);

  // Met a jour une hypothese du simulateur.
  function updateField<K extends keyof SimulationForm>(field: K, value: SimulationForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Applique la banque choisie et recopie le taux fixe commun a la simulation.
  function applyBankRatePreset(presetId: string) {
    const preset = SELECTABLE_MOROCCAN_BANKS.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setForm((current) => ({
      ...current,
      bankRatePresetId: preset.id,
      yearlyInterestRate: preset.annualRate,
    }));
  }

  // Retrouve le preset bancaire actif pour afficher son contexte et ses sources.
  const selectedBankRatePreset = useMemo(
    () => SELECTABLE_MOROCCAN_BANKS.find((item) => item.id === form.bankRatePresetId) ?? null,
    [form.bankRatePresetId],
  );

  // Recalcule toutes les metriques financieres des que les hypotheses evoluent.
  const result = useMemo(() => {
    const purchasePrice = toNumber(form.purchasePrice);
    const downPayment = toNumber(form.downPayment);
    const loanAmount = toNumber(form.loanAmount) || Math.max(0, purchasePrice - downPayment);
    const durationYears = Math.max(1, toNumber(form.loanDurationYears));
    const annualRate = toNumber(form.yearlyInterestRate);
    const monthlyRent = toNumber(form.monthlyRent);
    const monthlyCharges = toNumber(form.monthlyCharges);
    const notaryFees = toNumber(form.notaryFees);
    const agencyFees = toNumber(form.agencyFees);
    const worksBudget = toNumber(form.worksBudget);

    const monthlyPayment = computeMonthlyPayment(loanAmount, annualRate, durationYears);
    const totalProjectCost = purchasePrice + notaryFees + agencyFees + worksBudget;
    const yearlyRent = monthlyRent * 12;
    const yearlyCharges = monthlyCharges * 12;
    const grossYield = totalProjectCost > 0 ? (yearlyRent / totalProjectCost) * 100 : 0;
    const netYield = totalProjectCost > 0 ? ((yearlyRent - yearlyCharges) / totalProjectCost) * 100 : 0;
    const monthlyGain = monthlyRent - monthlyCharges - monthlyPayment;

    return {
      advice: buildAdvice(monthlyGain, netYield),
      grossYield,
      loanAmount,
      monthlyGain,
      monthlyPayment,
      netYield,
      totalProjectCost,
    };
  }, [form]);

  return (
    <ImportedPageDocument
      bodyClassName="bg-background font-body text-on-surface antialiased"
      title="SmartEstate | Simulation d'investissement"
      styles={pageStyles}
    >
      <main className="md:ml-72 min-h-screen px-6 md:px-12 py-8">
        <section className="mb-8">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
            Projection locative
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            Simulation d'investissement
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant">
            Ajustez vos hypothèses d'achat, de financement et de charges pour mesurer instantanément la
            rentabilité d'un projet immobilier au Maroc.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8">
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-headline font-bold text-primary">Hypothèses</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Prix d'achat" suffix="DH" value={form.purchasePrice} onChange={(value) => updateField("purchasePrice", value)} />
              <Field label="Apport personnel" suffix="DH" value={form.downPayment} onChange={(value) => updateField("downPayment", value)} />
              <Field label="Montant du crédit" suffix="DH" value={form.loanAmount} onChange={(value) => updateField("loanAmount", value)} />
              <Field label="Durée du crédit" suffix="ans" value={form.loanDurationYears} onChange={(value) => updateField("loanDurationYears", value)} />
              <SelectField
                label="Banque marocaine / données publiques"
                options={SELECTABLE_MOROCCAN_BANKS.map((preset) => ({
                  label: `${preset.bankName} - ${getBankCategoryLabel(preset.category)}`,
                  value: preset.id,
                }))}
                value={form.bankRatePresetId}
                onChange={applyBankRatePreset}
              />
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Taux d'intérêt appliqué
                </span>
                <div className="flex items-center gap-3 overflow-hidden rounded-xl bg-surface-container-low px-4 py-3">
                  <span className="text-sm font-semibold text-on-surface">{FIXED_BANK_INTEREST_RATE_LABEL}</span>
                  <span className="ml-auto rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                    Identique pour toutes les banques
                  </span>
                </div>
              </label>
              <div className="md:col-span-2 rounded-2xl border border-secondary/15 bg-secondary/5 p-5">
                {selectedBankRatePreset ? (
                  <>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                          Données bancaires publiques
                        </p>
                        <h3 className="mt-2 text-lg font-headline font-bold text-primary">
                          {selectedBankRatePreset.bankName}
                        </h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {selectedBankRatePreset.offerLabel}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm">
                        {selectedBankRatePreset.rateLabel}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                      {selectedBankRatePreset.note}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                      <span className="rounded-full bg-white px-3 py-2 text-on-surface-variant">
                        {getBankCategoryLabel(selectedBankRatePreset.category)}
                      </span>
                      <span className="rounded-full bg-white px-3 py-2 text-on-surface-variant">
                        Réseau 2024 : {selectedBankRatePreset.agencyCount2024.toLocaleString("fr-MA")} agences
                      </span>
                      <span className="rounded-full bg-white px-3 py-2 text-on-surface-variant">
                        Vérifié le {selectedBankRatePreset.asOf}
                      </span>
                      <a
                        className="rounded-full bg-white px-3 py-2 text-secondary transition hover:opacity-80"
                        href={selectedBankRatePreset.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {selectedBankRatePreset.sourceLabel}
                      </a>
                      <span className="rounded-full bg-white px-3 py-2 text-on-surface-variant">
                        Taux fixe commun : {FIXED_BANK_INTEREST_RATE_LABEL}
                      </span>
                      <span className="rounded-full bg-white px-3 py-2 text-on-surface-variant">
                        Simulation homogène entre banques
                      </span>
                      <a
                        className="rounded-full bg-white px-3 py-2 text-secondary transition hover:opacity-80"
                        href={BKAM_BANKING_IMPLANTATION_2024_URL}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {BKAM_BANKING_IMPLANTATION_2024_LABEL}
                      </a>
                    </div>
                    <p className="mt-4 rounded-xl border border-secondary/15 bg-white/80 px-4 py-3 text-sm text-on-surface-variant">
                      Pour garder une comparaison fiable, SmartEstate applique le même taux de crédit à
                      toutes les banques dans cette simulation, y compris les banques participatives.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                      Taux bancaire
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                      Choisissez une banque pour afficher sa fiche publique. Le taux de crédit reste fixe
                      pour toute la simulation.
                    </p>
                  </>
                )}
              </div>
              <Field label="Loyer mensuel estimé" suffix="DH" value={form.monthlyRent} onChange={(value) => updateField("monthlyRent", value)} />
              <Field label="Charges mensuelles" suffix="DH" value={form.monthlyCharges} onChange={(value) => updateField("monthlyCharges", value)} />
              <Field label="Frais de notaire" suffix="DH" value={form.notaryFees} onChange={(value) => updateField("notaryFees", value)} />
              <Field label="Frais d'agence" suffix="DH" value={form.agencyFees} onChange={(value) => updateField("agencyFees", value)} />
              <Field label="Travaux éventuels" suffix="DH" value={form.worksBudget} onChange={(value) => updateField("worksBudget", value)} />
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl bg-primary p-7 text-white shadow-[0_18px_40px_rgba(26,35,126,0.2)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
                Résultat synthétique
              </p>
              <h2 className="mt-3 text-3xl font-headline font-extrabold">
                {formatDh(result.monthlyGain)}
              </h2>
              <p className="mt-2 text-primary-fixed">
                Gain ou perte mensuelle après charges et mensualité estimée.
              </p>
              <div className={`mt-6 inline-flex rounded-full px-4 py-2 text-sm font-bold ${result.advice.tone}`}>
                {result.advice.label}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-primary-fixed">{result.advice.text}</p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard label="Mensualité estimée" value={formatDh(result.monthlyPayment)} />
              <MetricCard label="Rendement brut" value={formatPercent(result.grossYield)} />
              <MetricCard label="Rendement net" value={formatPercent(result.netYield)} />
              <MetricCard label="Coût total projet" value={formatDh(result.totalProjectCost, true)} />
            </section>
          </div>
        </section>
      </main>
    </ImportedPageDocument>
  );
}
