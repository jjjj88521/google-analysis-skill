import { google } from "googleapis";
import { readFileSync } from "node:fs";

const SCOPES = [
  "https://www.googleapis.com/auth/tagmanager.readonly",
  "https://www.googleapis.com/auth/tagmanager.edit.containers",
  "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
  "https://www.googleapis.com/auth/tagmanager.publish",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/analytics.edit",
];

export function createServiceAccountAuth(keyFilePath: string) {
  const keyFileContent = readFileSync(keyFilePath, "utf-8");
  const keyData = JSON.parse(keyFileContent) as {
    client_email: string;
    private_key: string;
    project_id: string;
  };

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: keyData.client_email,
      private_key: keyData.private_key,
    },
    projectId: keyData.project_id,
    scopes: SCOPES,
  });

  return auth;
}

export function getServiceAccountEmail(keyFilePath: string): string {
  const keyFileContent = readFileSync(keyFilePath, "utf-8");
  const keyData = JSON.parse(keyFileContent) as { client_email: string };
  return keyData.client_email;
}
