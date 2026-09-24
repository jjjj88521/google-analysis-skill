import { google, analyticsdata_v1beta, analyticsadmin_v1beta } from "googleapis";
import { getAuthClient } from "../auth/index.js";
import type { OAuth2Client } from "google-auth-library";

let _dataClient: analyticsdata_v1beta.Analyticsdata | null = null;
let _adminClient: analyticsadmin_v1beta.Analyticsadmin | null = null;

export async function getGaDataClient(): Promise<analyticsdata_v1beta.Analyticsdata> {
  if (_dataClient) return _dataClient;
  const auth = await getAuthClient() as unknown as OAuth2Client;
  _dataClient = google.analyticsdata({ version: "v1beta", auth });
  return _dataClient;
}

export async function getGaAdminClient(): Promise<analyticsadmin_v1beta.Analyticsadmin> {
  if (_adminClient) return _adminClient;
  const auth = await getAuthClient() as unknown as OAuth2Client;
  _adminClient = google.analyticsadmin({ version: "v1beta", auth });
  return _adminClient;
}
