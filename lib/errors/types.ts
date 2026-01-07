export type ErrorWithCode = {
  code?: string;
  message?: string;
};

export const isErrorWithCode = (error: unknown): error is ErrorWithCode => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return "code" in error || "message" in error;
};

export const getErrorCode = (error: unknown): string | undefined => {
  if (!isErrorWithCode(error)) {
    return undefined;
  }

  return typeof error.code === "string" ? error.code : undefined;
};
