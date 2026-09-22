import type { ApiErrorKind } from "../api/client";

/** User-facing copy for every ApiError kind — the UI must never surface a
 * raw AxiosError message (brief §12). */
export const API_ERROR_MESSAGES: Record<ApiErrorKind, string> = {
  network: "We couldn't reach the jobs service. Check your connection and try again.",
  timeout: "The jobs service took too long to respond. Please try again.",
  server: "The jobs service returned an error. Please try again in a moment.",
  invalidResponse: "The jobs service returned an unexpected response. Please try again.",
  notFound: "This job couldn't be found — it may have been closed or the link is out of date.",
  invalidId: "That job link looks invalid.",
};
