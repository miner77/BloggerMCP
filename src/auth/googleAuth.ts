import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config.js";

const BLOGGER_SCOPES = ["https://www.googleapis.com/auth/blogger"];
const GOOGLE_TOKEN_FILE = "google.json";

type StoredGoogleToken = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
};

async function ensureTokenDir(): Promise<void> {
  await fs.mkdir(config.tokenDir, { recursive: true, mode: 0o700 });
}

function tokenPath(): string {
  return path.join(config.tokenDir, GOOGLE_TOKEN_FILE);
}

function createOAuthClient(): OAuth2Client {
  if (!config.googleClientId || !config.googleClientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env");
  }

  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
}

export function getGoogleAuthUrl(): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: BLOGGER_SCOPES
  });
}

export async function exchangeGoogleAuthCode(code: string): Promise<void> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error("Google did not return a refresh token. Revoke app access and retry with prompt=consent.");
  }

  await ensureTokenDir();
  await fs.writeFile(tokenPath(), JSON.stringify(tokens, null, 2), { mode: 0o600 });
}

export async function getGoogleAuthClient(): Promise<OAuth2Client> {
  const client = createOAuthClient();
  const raw = await fs.readFile(tokenPath(), "utf8").catch(() => undefined);
  if (!raw) {
    throw new Error("Google OAuth token not found. Run blogger_login first.");
  }

  const tokens = JSON.parse(raw) as StoredGoogleToken;
  if (!tokens.refresh_token) {
    throw new Error("Stored Google token has no refresh token. Run blogger_login again.");
  }

  client.setCredentials(tokens);
  return client;
}
