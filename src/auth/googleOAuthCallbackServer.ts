import http from "node:http";
import { exchangeGoogleAuthCode, getGoogleAuthUrl } from "./googleAuth.js";
import { config } from "../config.js";

function getRedirectUrl(): URL {
  try {
    return new URL(config.googleRedirectUri);
  } catch {
    throw new Error(`Invalid GOOGLE_REDIRECT_URI: ${config.googleRedirectUri}`);
  }
}

function htmlPage(title: string, body: string): string {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 48px; line-height: 1.55; color: #202124; }
      main { max-width: 720px; margin: 0 auto; }
      code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      ${body}
    </main>
  </body>
</html>`;
}

async function main(): Promise<void> {
  const redirectUrl = getRedirectUrl();
  const port = Number(redirectUrl.port || (redirectUrl.protocol === "https:" ? 443 : 80));
  const expectedPath = redirectUrl.pathname || "/";

  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", `${redirectUrl.protocol}//${redirectUrl.host}`);

    if (requestUrl.pathname !== expectedPath) {
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      response.end(htmlPage("Not found", `<p>Expected callback path: <code>${expectedPath}</code></p>`));
      return;
    }

    const error = requestUrl.searchParams.get("error");
    if (error) {
      response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
      response.end(htmlPage("Google OAuth failed", `<p>Google returned error: <code>${error}</code></p>`));
      server.close();
      return;
    }

    const code = requestUrl.searchParams.get("code");
    if (!code) {
      response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
      response.end(htmlPage("Missing OAuth code", "<p>The callback did not include a code query parameter.</p>"));
      return;
    }

    try {
      await exchangeGoogleAuthCode(code);
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(
        htmlPage(
          "Blogger OAuth complete",
          "<p>Refresh token saved successfully. You can close this tab and use the Blogger MCP tools now.</p>"
        )
      );
      server.close();
    } catch (tokenError) {
      const message = tokenError instanceof Error ? tokenError.message : String(tokenError);
      response.writeHead(500, { "content-type": "text/html; charset=utf-8" });
      response.end(htmlPage("Token exchange failed", `<p>${escapeHtml(message)}</p>`));
      server.close();
    }
  });

  server.listen(port, redirectUrl.hostname, () => {
    console.log(`Listening for Google OAuth callback at ${redirectUrl.toString()}`);
    console.log("Open this URL to authorize Blogger access:");
    console.log(getGoogleAuthUrl());
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

await main();
