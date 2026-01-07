export const DEFAULT_ERROR_MESSAGE = "We couldn't complete the request. Please try again.";

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "We couldn't sign you in with those details. Please check and try again.",
  "auth/user-not-found": "We couldn't find an account with that email.",
  "auth/wrong-password": "The password doesn't match this account.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use": "That email is already registered. Try signing in instead.",
  "auth/weak-password": "Use a stronger password with at least 6 characters.",
  "auth/requires-recent-login": "For security, please sign in again and retry.",
  "auth/too-many-requests": "Too many attempts. Please wait a bit and try again.",
  "auth/popup-closed-by-user": "The sign-in window was closed. Please try again.",
  "auth/network-request-failed": "We couldn't reach the server. Check your connection and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
};
