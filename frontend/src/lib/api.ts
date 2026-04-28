const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_API_BASE_URL;

export class ApiError extends Error {
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
  headers?: HeadersInit;
  method?: string;
  token?: null | string;
};

function buildHeaders(body: ApiRequestOptions["body"], headers?: HeadersInit, token?: null | string) {
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

function extractErrorMessage(payload: unknown, fallback: string) {
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

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, method = "GET", token } = options;
  const { requestHeaders, shouldSerializeJson } = buildHeaders(body, headers, token);

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
  const payload = raw ? (JSON.parse(raw) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, "La requete a echoue."),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export function getErrorMessage(error: unknown, fallback = "Une erreur est survenue.") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
