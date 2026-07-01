import axios from "axios";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

const STRAVA_TOKEN_FILE = "strava.json";
const STRAVA_BASE_URL = "https://www.strava.com/api/v3";

type StoredStravaToken = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type?: string;
};

export type StravaActivity = {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  start_date_local: string;
  average_heartrate?: number;
  average_speed?: number;
  laps?: Array<{
    name?: string;
    distance: number;
    moving_time: number;
    average_speed?: number;
  }>;
};

function tokenPath(): string {
  return path.join(config.tokenDir, STRAVA_TOKEN_FILE);
}

function assertStravaEnv(): void {
  if (!config.stravaClientId || !config.stravaClientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set in .env");
  }
}

export function getStravaAuthUrl(): string {
  assertStravaEnv();
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", config.stravaClientId!);
  url.searchParams.set("redirect_uri", config.stravaRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", "read,activity:read_all");
  return url.toString();
}

export async function exchangeStravaAuthCode(code: string): Promise<void> {
  assertStravaEnv();
  const response = await axios.post("https://www.strava.com/oauth/token", {
    client_id: config.stravaClientId,
    client_secret: config.stravaClientSecret,
    code,
    grant_type: "authorization_code"
  });

  await fs.mkdir(config.tokenDir, { recursive: true, mode: 0o700 });
  const token: StoredStravaToken = {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
    expires_at: response.data.expires_at,
    token_type: response.data.token_type
  };
  await fs.writeFile(tokenPath(), JSON.stringify(token, null, 2), { mode: 0o600 });
}

async function readToken(): Promise<StoredStravaToken> {
  const raw = await fs.readFile(tokenPath(), "utf8").catch(() => undefined);
  if (!raw) throw new Error("Strava OAuth token not found.");
  return JSON.parse(raw) as StoredStravaToken;
}

async function writeToken(token: StoredStravaToken): Promise<void> {
  await fs.mkdir(config.tokenDir, { recursive: true, mode: 0o700 });
  await fs.writeFile(tokenPath(), JSON.stringify(token, null, 2), { mode: 0o600 });
}

async function getAccessToken(): Promise<string> {
  assertStravaEnv();
  const token = await readToken();
  const now = Math.floor(Date.now() / 1000);
  if (token.expires_at > now + 60) return token.access_token;

  const response = await axios.post("https://www.strava.com/oauth/token", {
    client_id: config.stravaClientId,
    client_secret: config.stravaClientSecret,
    refresh_token: token.refresh_token,
    grant_type: "refresh_token"
  });

  const refreshed: StoredStravaToken = {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
    expires_at: response.data.expires_at,
    token_type: response.data.token_type
  };
  await writeToken(refreshed);
  return refreshed.access_token;
}

export async function listRecentActivities(limit = 10): Promise<StravaActivity[]> {
  const accessToken = await getAccessToken();
  const response = await axios.get(`${STRAVA_BASE_URL}/athlete/activities`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { per_page: limit }
  });
  return response.data as StravaActivity[];
}

export async function getActivity(activityId: number): Promise<StravaActivity> {
  const accessToken = await getAccessToken();
  const response = await axios.get(`${STRAVA_BASE_URL}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { include_all_efforts: false }
  });
  return response.data as StravaActivity;
}

export function formatDistanceMeters(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

export function formatPace(distanceMeters: number, movingTimeSeconds: number): string {
  if (distanceMeters <= 0) return "N/A";
  const secondsPerKm = movingTimeSeconds / (distanceMeters / 1000);
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
}
