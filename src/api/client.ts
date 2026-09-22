import axios, { AxiosError } from "axios";

export type ApiErrorKind =
  | "network"
  | "timeout"
  | "notFound"
  | "invalidId"
  | "server"
  | "invalidResponse";

/**
 * The only error shape the UI is ever allowed to read. Never surface a raw
 * AxiosError (or its message) to the user — components branch on `kind`
 * and render friendly copy.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE_URL) {
  // Fail loudly at boot rather than silently issuing requests against a
  // relative path that will 404 every time.
  console.error("VITE_API_BASE_URL is not set — API requests will fail.");
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      // Caller-initiated AbortController cancellation — let it propagate
      // as-is so hooks can distinguish "cancelled" from "failed".
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError;

    if (axiosError.code === "ECONNABORTED") {
      return Promise.reject(new ApiError("timeout", "The request took too long to complete."));
    }
    if (!axiosError.response) {
      return Promise.reject(new ApiError("network", "Could not reach the jobs service."));
    }

    const status = axiosError.response.status;
    if (status === 404) {
      return Promise.reject(new ApiError("notFound", "Not found.", status));
    }
    // Generic 400s (malformed filters we didn't already reject client-side)
    // fall into "server" here; fetchJobById remaps 400 to "invalidId"
    // specifically, since that's the only endpoint where a 400 means the
    // identifier itself is malformed.
    return Promise.reject(new ApiError("server", "The jobs service returned an error.", status));
  }
);
