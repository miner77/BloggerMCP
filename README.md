# Blogger MCP

TypeScript MCP server for Blogger drafts, post management, project devlogs with screenshots, and Strava running retrospectives.

## Features

- Create Blogger posts as drafts by default.
- List recent live posts and drafts.
- Update existing posts without publishing.
- Publish only through `publish_blogger_post` with `confirmPublish: true`.
- Store Google OAuth refresh tokens locally.
- Convert Markdown input to Blogger HTML.
- Insert image URLs or local images into post HTML.
- Auto-detect latest screenshots from a `screenshots` directory.
- Separate Strava OAuth/client module for running retrospective drafts.
- No client secret, access token, or refresh token is logged or returned.

## Setup

```bash
npm install
cp .env.example .env
npm run build
```

Fill `.env`:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
BLOGGER_BLOG_ID=...

STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=http://localhost:3000/strava/callback
```

## Google Cloud / Blogger API

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable **Blogger API v3**.
4. Configure **OAuth consent screen**.
5. Create an **OAuth client ID**.
6. Add the redirect URI from `.env`, for example `http://localhost:3000/oauth2callback`.
7. Copy client ID and client secret into `.env`.
8. Find your Blogger blog ID in Blogger settings or via Blogger API and set `BLOGGER_BLOG_ID`.

First login:

Recommended local callback flow:

```bash
npm run oauth:google
```

Then open the printed Google OAuth URL. After approval, the local
`http://localhost:3000/oauth2callback` page stores the refresh token and shows a
success message.

Manual fallback:

1. Call MCP tool `blogger_login` with no `code`.
2. Open the returned `authUrl`.
3. Copy the `code` query parameter from the redirect URL.
4. Call `blogger_login` again with that `code`.

The refresh token is stored under `.tokens/google.json`.

## Strava Setup

1. Create an app at [Strava API Settings](https://www.strava.com/settings/api).
2. Set the callback domain/redirect to match `STRAVA_REDIRECT_URI`.
3. Put `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` in `.env`.
4. Call `create_strava_activity_draft` with `mode: "auth_url"`.
5. Open the URL, approve access, then call the tool with `mode: "exchange_code"` and the returned code.

The Strava token is stored under `.tokens/strava.json`.

## MCP Configuration

Example:

```json
{
  "mcpServers": {
    "blogger": {
      "command": "node",
      "args": ["/absolute/path/to/BloggerMCP/dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

For local development:

```json
{
  "mcpServers": {
    "blogger-dev": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/absolute/path/to/BloggerMCP"
    }
  }
}
```

## Tools

### `blogger_login`

Returns a Google OAuth URL, or exchanges an OAuth code and stores a refresh token.

### `create_blogger_draft`

Creates a draft post from Markdown.

Inputs include:

- `title`
- `markdown`
- `labels`
- `imageUrls`
- `imagePaths`
- `altTexts`

Local image paths require:

```bash
BLOGGER_IMAGE_ASSET_DIR=public/blogger-assets
BLOGGER_IMAGE_PUBLIC_BASE_URL=https://your-site.example/blogger-assets
```

If image upload/copy fails, draft creation continues and warnings are returned.

### `list_blogger_posts`

Lists recent posts. Use `status: ["draft"]` for drafts only.

### `update_blogger_post`

Patches title, content, labels, and optional images. It does not publish.

### `publish_blogger_post`

Publishes a post only when called explicitly:

```json
{
  "postId": "123",
  "confirmPublish": true
}
```

### `score_blog_post`

Scores title length, heading structure, content depth, images, wrap-up, and SEO labels.

### `upload_post_image`

Prepares image URLs for post insertion. Supports:

- `png`
- `jpg`
- `jpeg`
- `webp`

### `create_project_devlog_draft`

Creates a structured devlog draft:

1. 오늘 한 일
2. 문제 상황
3. 해결 방법
4. 결과 화면
5. 배운 점
6. 다음 작업

It can auto-load latest images from `screenshots` under `projectDir`, plus explicit `screenshotPaths`.

### `create_strava_activity_draft`

Modes:

- `auth_url`
- `exchange_code`
- `list_recent`
- `create_draft`

The running retrospective includes distance, time, average pace, average heart rate, elevation, activity name, date, and lap pace data when available.

## Image Storage Design

Blogger API image upload support is limited, so image handling is separated behind `ImageStorage`.

Current adapters:

- URL images: directly inserted as `<img src="...">`.
- Local public assets: copy local files into `BLOGGER_IMAGE_ASSET_DIR`, then build URLs from `BLOGGER_IMAGE_PUBLIC_BASE_URL`.

Future adapters can add Google Photos, Google Drive, S3, or another CDN without changing Blogger tools.

## Safety Notes

- Draft creation is the default.
- Nothing publishes unless `publish_blogger_post` is explicitly called.
- `publish_blogger_post` requires `confirmPublish: true`.
- Client secrets and tokens must stay in `.env` and `.tokens`.
- `.env` and `.tokens` are ignored by git.
