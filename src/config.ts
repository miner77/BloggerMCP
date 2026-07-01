import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const cwd = process.cwd();

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function requiredEnv(name: string): string {
  const value = optionalEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  googleClientId: optionalEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: optionalEnv("GOOGLE_CLIENT_SECRET"),
  googleRedirectUri: optionalEnv("GOOGLE_REDIRECT_URI") ?? "http://localhost:3000/oauth2callback",
  bloggerBlogId: optionalEnv("BLOGGER_BLOG_ID"),
  tokenDir: path.resolve(cwd, optionalEnv("TOKEN_DIR") ?? ".tokens"),
  stravaClientId: optionalEnv("STRAVA_CLIENT_ID"),
  stravaClientSecret: optionalEnv("STRAVA_CLIENT_SECRET"),
  stravaRedirectUri: optionalEnv("STRAVA_REDIRECT_URI") ?? "http://localhost:3000/strava/callback"
};

export type AppConfig = typeof config;
