import { google } from "googleapis";
import type { AuthClient } from "google-auth-library";
import { loadConfig, tokenCacheExists } from "../utils/config.js";
import { createServiceAccountAuth, getServiceAccountEmail } from "./service-account.js";
import {
  loadCachedOAuthClient,
  performOAuthFlow,
  clearTokenCache,
} from "./oauth.js";

export type AuthMethod = "service-account" | "oauth" | "none";

export interface AuthStatus {
  method: AuthMethod;
  email?: string;
  scopes?: string[];
}

/**
 * Resolve the best available auth client.
 * Priority: 1) Service Account, 2) Cached OAuth token, 3) fail
 */
export async function getAuthClient(): Promise<AuthClient> {
  const config = loadConfig();

  // 1. Service Account
  if (config.serviceAccountKeyFile) {
    const auth = createServiceAccountAuth(config.serviceAccountKeyFile);
    const client = await auth.getClient();
    return client as AuthClient;
  }

  // 2. OAuth cached token
  const oauthClient = loadCachedOAuthClient();
  if (oauthClient) return oauthClient;

  throw new Error(
    "No authentication configured. Run `auth login` or `auth service-account --file <path>` first."
  );
}

export async function loginOAuth(): Promise<void> {
  const config = loadConfig();
  if (!config.googleClientId || !config.googleClientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env"
    );
  }
  await performOAuthFlow(config.googleClientId, config.googleClientSecret);
}

export function logout(): void {
  clearTokenCache();
}

export function getAuthStatus(): AuthStatus {
  const config = loadConfig();

  if (config.serviceAccountKeyFile) {
    const email = getServiceAccountEmail(config.serviceAccountKeyFile);
    return { method: "service-account", email };
  }

  if (tokenCacheExists()) {
    return { method: "oauth" };
  }

  return { method: "none" };
}

export { google };
