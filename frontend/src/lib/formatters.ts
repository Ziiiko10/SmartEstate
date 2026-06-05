export type ApiNumber = number | string | null | undefined;

export function toNumber(value: ApiNumber) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDh(value: ApiNumber, compact = false) {
  const amount = toNumber(value);

  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("fr-MA", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 1,
    })} MDH`;
  }

  return `${amount.toLocaleString("fr-MA", {
    maximumFractionDigits: 0,
  })} DH`;
}

export function formatPercent(value: ApiNumber, digits = 1) {
  return `${toNumber(value).toLocaleString("fr-MA", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}%`;
}

export function formatDateTime(value: string) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelative(value: string) {
  if (!value) {
    return "Aucune activité";
  }

  const diffHours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 3600000));
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }

  return formatDateTime(value);
}

export function cityGradient(city: string) {
  const palette: Record<string, string> = {
    Agadir: "from-[#0f766e] via-[#14b8a6] to-[#67e8f9]",
    Casablanca: "from-[#183153] via-[#1b6d24] to-[#89b0ae]",
    Fes: "from-[#7c2d12] via-[#b45309] to-[#f59e0b]",
    Marrakech: "from-[#7b341e] via-[#c05621] to-[#f6ad55]",
    Meknes: "from-[#1f2937] via-[#374151] to-[#9ca3af]",
    Oujda: "from-[#164e63] via-[#0e7490] to-[#67e8f9]",
    Rabat: "from-[#1a237e] via-[#2c5282] to-[#63b3ed]",
    Tanger: "from-[#0f766e] via-[#1d4ed8] to-[#7dd3fc]",
  };

  return palette[city] ?? "from-[#334155] via-[#475569] to-[#94a3b8]";
}
