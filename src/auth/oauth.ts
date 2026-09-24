import { OAuth2Client } from "google-auth-library";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { URL } from "node:url";
import { exec } from "node:child_process";
import { getTokenCachePath } from "../utils/config.js";

const SCOPES = [
  "https://www.googleapis.com/auth/tagmanager.readonly",
  "https://www.googleapis.com/auth/tagmanager.edit.containers",
  "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
  "https://www.googleapis.com/auth/tagmanager.publish",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/analytics.edit",
];

const REDIRECT_PORT = 3847;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth2callback`;

export function createOAuth2Client(
  clientId: string,
  clientSecret: string
): OAuth2Client {
  return new OAuth2Client(clientId, clientSecret, REDIRECT_URI);
}

export async function performOAuthFlow(
  clientId: string,
  clientSecret: string
): Promise<OAuth2Client> {
  const client = createOAuth2Client(clientId, clientSecret);

  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  const authCode = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      if (!req.url?.startsWith("/oauth2callback")) {
        res.writeHead(404);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<html><body><h2>Authentication failed.</h2><p>You can close this window.</p></body></html>");
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<html><body><h2>Authentication successful!</h2><p>You can close this window.</p></body></html>");
        server.close();
        resolve(code);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      // Print URL first so user can always open manually
      console.log("\n請複製以下網址到瀏覽器完成授權：\n");
      console.log(authorizeUrl);
      console.log("\n授權完成後程式會自動繼續...\n");

      // Try to open automatically (macOS)
      exec(`open "${authorizeUrl}"`, (err) => {
        if (!err) console.log("(已嘗試自動開啟瀏覽器)");
      });
    });

    server.on("error", reject);
  });

  const { tokens } = await client.getToken(authCode);
  client.setCredentials(tokens);

  writeFileSync(
    getTokenCachePath(),
    JSON.stringify({ clientId, clientSecret, tokens }, null, 2),
    "utf-8"
  );

  return client;
}

export function loadCachedOAuthClient(): OAuth2Client | null {
  const cachePath = getTokenCachePath();
  if (!existsSync(cachePath)) return null;

  const cached = JSON.parse(readFileSync(cachePath, "utf-8")) as {
    clientId: string;
    clientSecret: string;
    tokens: Record<string, unknown>;
  };

  if (!cached.tokens) return null;

  const client = createOAuth2Client(cached.clientId, cached.clientSecret);
  client.setCredentials(cached.tokens);
  return client;
}

export function clearTokenCache(): void {
  const cachePath = getTokenCachePath();
  if (existsSync(cachePath)) {
    const { unlinkSync } = require("node:fs");
    unlinkSync(cachePath);
  }
}
