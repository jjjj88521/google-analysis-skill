import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

dotenv.config();

export interface AppConfig {
  googleClientId?: string;
  googleClientSecret?: string;
  serviceAccountKeyFile?: string;
  gaPropertyId?: string;
  gtmAccountId?: string;
}

export function loadConfig(): AppConfig {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    serviceAccountKeyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    gaPropertyId: process.env.GA_PROPERTY_ID,
    gtmAccountId: process.env.GTM_ACCOUNT_ID,
  };
}

const TOKEN_CACHE_PATH = resolve(process.cwd(), ".token-cache.json");

export function getTokenCachePath(): string {
  return TOKEN_CACHE_PATH;
}

export function tokenCacheExists(): boolean {
  return existsSync(TOKEN_CACHE_PATH);
}
