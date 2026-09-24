import { google, tagmanager_v2 } from "googleapis";
import { getAuthClient } from "../auth/index.js";
import type { OAuth2Client } from "google-auth-library";

let _gtm: tagmanager_v2.Tagmanager | null = null;

export async function getGtmClient(): Promise<tagmanager_v2.Tagmanager> {
  if (_gtm) return _gtm;
  const auth = await getAuthClient() as unknown as OAuth2Client;
  _gtm = google.tagmanager({ version: "v2", auth });
  return _gtm;
}

/** Helper to build the standard GTM workspace path */
export function workspacePath(
  accountId: string,
  containerId: string,
  workspaceId: string
): string {
  return `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;
}
