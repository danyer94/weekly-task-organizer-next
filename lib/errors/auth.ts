import { AUTH_ERROR_MESSAGES, DEFAULT_ERROR_MESSAGE } from "./messages";
import { getErrorCode } from "./types";

export const getAuthErrorMessage = (error: unknown, fallback?: string): string => {
  const code = getErrorCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  return fallback ?? DEFAULT_ERROR_MESSAGE;
};
