// Client API centralise: gere les requetes, le cache et les erreurs cote front.
const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_API_BASE_URL;

type CacheEntry = {
  expiresAt: number;
  payload: unknown;
};

const responseCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

export class ApiError extends Error {
  // Encapsule une erreur HTTP retournee par l'API SmartEstate.
  // Le statut et le payload brut sont conserves pour un diagnostic plus riche.
  details: unknown;
  status: number;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = {
  body?: BodyInit | null | Record<string, unknown>;
  cacheKey?: string;
  cacheTtlMs?: number;
  forceRefresh?: boolean;
  headers?: HeadersInit;
  method?: string;
  token?: null | string;
};

function normalizeMethod(method?: string) {
  // Normalise une methode HTTP en uppercase avec GET comme defaut.
  // Cela simplifie le reste de la logique de cache et de fetch.
  return (method ?? "GET").toUpperCase();
}

function buildHeaders(body: ApiRequestOptions["body"], headers?: HeadersInit, token?: null | string) {
  // Construit les headers finaux en ajoutant auth, Accept et Content-Type si utile.
  // La fonction detecte aussi si le body doit etre serialise en JSON.
  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Token ${token}`);
  }

  const shouldSerializeJson =
    body !== null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer);

  if (shouldSerializeJson && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  return { requestHeaders, shouldSerializeJson };
}

function defaultCacheTtlMs(path: string, method: string) {
  // Retourne la duree de cache par defaut selon la ressource demandee.
  // Les endpoints plus couteux ou frequents recoivent un TTL adapte a leur usage.
  if (method !== "GET") {
    return 0;
  }

  if (path.startsWith("/auth/me/")) {
    return 30_000;
  }

  if (path.startsWith("/dashboard/overview/")) {
    return 60_000;
  }

  if (path.startsWith("/market-listings/")) {
    return 45_000;
  }

  if (
    path.startsWith("/assets/") ||
    path.startsWith("/holdings/") ||
    path.startsWith("/organizations/") ||
    path.startsWith("/portfolios/") ||
    path.startsWith("/recommendations/") ||
    path.startsWith("/reports/") ||
    path.startsWith("/scenarios/") ||
    path.startsWith("/team-memberships/") ||
    path.startsWith("/valuations/")
  ) {
    return 90_000;
  }

  return 45_000;
}

function serializeBodyForKey(body: ApiRequestOptions["body"], shouldSerializeJson: boolean) {
  // Transforme le body en cle stable pour le cache de requetes.
  // Les corps non JSON sont volontairement resumes par une etiquette generique.
  if (body === undefined || body === null) {
    return "";
  }

  if (shouldSerializeJson) {
    return JSON.stringify(body);
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  return "[non-json-body]";
}

function buildCacheKey(
  {
    body,
    cacheKey,
    method,
    path,
    shouldSerializeJson,
    token,
  }: {
    body: ApiRequestOptions["body"];
    cacheKey?: string;
    method: string;
    path: string;
    shouldSerializeJson: boolean;
    token?: null | string;
  },
) {
  // Construit une cle de cache unique a partir de la methode, du token et du payload.
  // Une cle explicite fournie par l'appelant reste prioritaire quand elle existe.
  if (cacheKey) {
    return `${method}:${token ?? "public"}:${cacheKey}`;
  }

  const serializedBody = serializeBodyForKey(body, shouldSerializeJson);
  return `${method}:${token ?? "public"}:${path}:${serializedBody}`;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  // Essaie d'extraire le message d'erreur le plus utile depuis un payload API.
  // Le helper gere les formes detail, non_field_errors et champs standards.
  if (!payload) {
    return fallback;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.detail === "string") {
      return record.detail;
    }

    if (Array.isArray(record.non_field_errors) && typeof record.non_field_errors[0] === "string") {
      return record.non_field_errors[0];
    }

    for (const value of Object.values(record)) {
      if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
      }

      if (typeof value === "string") {
        return value;
      }
    }
  }

  return fallback;
}

function parseResponsePayload(raw: string) {
  // Parse la reponse texte en JSON si possible.
  // Un contenu non JSON est renvoye tel quel pour ne pas perdre l'information brute.
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export function clearApiCache(
  matcher?: RegExp | ((key: string) => boolean) | string,
) {
  // Invalide tout ou partie du cache de reponses et de requetes en vol.
  // Le filtrage peut se faire par sous-chaine, regex ou predicate personnalisee.
  if (!matcher) {
    responseCache.clear();
    pendingRequests.clear();
    return;
  }

  const predicate =
    typeof matcher === "function"
      ? matcher
      : matcher instanceof RegExp
        ? (key: string) => matcher.test(key)
        : (key: string) => key.includes(matcher);

  for (const key of responseCache.keys()) {
    if (predicate(key)) {
      responseCache.delete(key);
    }
  }

  for (const key of pendingRequests.keys()) {
    if (predicate(key)) {
      pendingRequests.delete(key);
    }
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  // Execute une requete API en gerant cache, dedoublonnage et erreurs homogenes.
  // Les GET eligibles peuvent reutiliser une reponse cachee ou une promesse deja en cours.
  const { body, cacheKey, forceRefresh = false, headers, token } = options;
  const method = normalizeMethod(options.method);
  const { requestHeaders, shouldSerializeJson } = buildHeaders(body, headers, token);
  const cacheTtlMs = Math.max(0, options.cacheTtlMs ?? defaultCacheTtlMs(path, method));
  const resolvedCacheKey =
    cacheTtlMs > 0
      ? buildCacheKey({
          body,
          cacheKey,
          method,
          path,
          shouldSerializeJson,
          token,
        })
      : null;

  if (resolvedCacheKey && !forceRefresh) {
    const cached = responseCache.get(resolvedCacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as T;
    }

    const pending = pendingRequests.get(resolvedCacheKey);
    if (pending) {
      return (await pending) as T;
    }
  }

  const requestPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body:
        body === undefined || body === null
          ? null
          : shouldSerializeJson
            ? JSON.stringify(body)
            : (body as BodyInit),
    });

    const raw = await response.text();
    const payload = parseResponsePayload(raw);

    if (!response.ok) {
      throw new ApiError(
        extractErrorMessage(payload, "La requete a echoue."),
        response.status,
        payload,
      );
    }

    if (resolvedCacheKey && cacheTtlMs > 0) {
      responseCache.set(resolvedCacheKey, {
        expiresAt: Date.now() + cacheTtlMs,
        payload,
      });
    }

    return payload as T;
  })();

  if (resolvedCacheKey) {
    pendingRequests.set(resolvedCacheKey, requestPromise);
    requestPromise.finally(() => {
      pendingRequests.delete(resolvedCacheKey);
    });
  }

  return await requestPromise;
}

export async function apiPrefetch<T>(path: string, options: ApiRequestOptions = {}) {
  // Lance une requete en arriere-plan sans faire echouer l'interface en cas d'erreur.
  // Ce helper est utilise par les mecanismes de prechargement de pages.
  try {
    await apiRequest<T>(path, options);
  } catch {
    // Background prefetch failures should not affect the visible UI.
  }
}

export function getErrorMessage(error: unknown, fallback = "Une erreur est survenue.") {
  // Convertit une erreur inconnue en message utilisateur lisible.
  // Les ApiError et Error standard sont traites avant le message de repli.
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
