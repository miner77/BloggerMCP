# Blogger MCP

TypeScript MCP server for Blogger drafts, post management, project devlogs, and Strava running retrospectives.

## 한국어 안내

Blogger MCP는 Codex, Claude 같은 MCP 클라이언트에서 Blogger 글을 작성하고 관리하기 위한 TypeScript 기반 MCP 서버입니다. 기본 동작은 항상 **초안 생성**이며, 실제 게시는 `publish_blogger_post`를 명시적으로 호출할 때만 실행됩니다.

주요 기능:

- Blogger 글 초안 생성
- 최근 글/초안 목록 조회
- 기존 글 수정
- 명시적 게시
- Google OAuth refresh token 로컬 저장
- Markdown을 HTML로 변환해 Blogger 본문에 삽입
- 프로젝트 개발일지 초안 생성
- Strava 활동 데이터 기반 러닝 회고 초안 생성

### 빠른 시작

```bash
git clone https://github.com/powerofdeen/BloggerMCP.git
cd BloggerMCP
npm install
cp .env.example .env
npm run build
```

`.env`에 Blogger용 Google OAuth 값과 블로그 ID를 입력합니다.

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
BLOGGER_BLOG_ID=...
```

Google OAuth 로그인을 진행합니다.

```bash
npm run oauth:google
```

터미널에 출력된 Google 로그인 URL을 열고 승인하면, `http://localhost:3000/oauth2callback`에서 refresh token이 자동으로 저장됩니다. 토큰은 `.tokens/google.json`에 저장되며 Git에는 포함되지 않습니다.

### Codex에 등록

```bash
codex mcp add blogger -- /opt/homebrew/bin/npm --prefix /absolute/path/to/BloggerMCP run start
```

등록 확인:

```bash
codex mcp list
```

Codex에서 `/mcp`를 입력해도 `blogger` 서버가 보이는지 확인할 수 있습니다.

### Claude Desktop에 등록

macOS 기준 Claude Desktop 설정 파일:

```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

설정 예시:

```json
{
  "mcpServers": {
    "blogger": {
      "command": "/opt/homebrew/bin/npm",
      "args": [
        "--prefix",
        "/absolute/path/to/BloggerMCP",
        "run",
        "start"
      ]
    }
  }
}
```

저장 후 Claude Desktop을 완전히 종료했다가 다시 실행하면 됩니다.

### 사용 예시

초안 생성:

```text
create_blogger_draft로 제목은 "테스트 글", 본문은 "## 테스트\nBlogger MCP로 만든 첫 초안입니다."로 초안 만들어줘
```

최근 글/초안 조회:

```text
list_blogger_posts로 최근 글과 초안 보여줘
```

프로젝트 개발일지 초안 생성:

```text
create_project_devlog_draft로 프로젝트명 BloggerMCP, 오늘 작업 내용은 "Blogger MCP 서버 구현", "OAuth callback helper 추가"로 초안 만들어줘
```

게시:

```text
publish_blogger_post로 postId="POST_ID" confirmPublish=true 실행해줘
```

### 제공 도구

- `blogger_login`: Google OAuth 로그인 URL 생성 또는 OAuth code 교환
- `create_blogger_draft`: Markdown 기반 Blogger 초안 생성
- `list_blogger_posts`: 최근 글/초안 목록 조회
- `update_blogger_post`: 기존 Blogger 글 수정
- `publish_blogger_post`: 명시적 게시
- `score_blog_post`: 글 구조와 SEO 기본 점수 확인
- `create_project_devlog_draft`: 프로젝트 개발일지 초안 생성
- `create_strava_activity_draft`: Strava 활동 기반 러닝 회고 초안 생성

### 안전 원칙

- 기본은 항상 초안 생성입니다.
- 게시하려면 `publish_blogger_post`를 명시적으로 호출해야 합니다.
- `publish_blogger_post`에는 `confirmPublish: true`가 필요합니다.
- 이미지는 Blogger 편집기에서 직접 업로드하는 흐름을 권장합니다.
- `.env`, `.tokens`는 Git에 올리지 않습니다.
- client secret, access token, refresh token은 로그나 응답에 출력하지 않습니다.

## Features

- Create Blogger posts as drafts by default.
- List recent live posts and drafts.
- Update existing posts without publishing.
- Publish only through `publish_blogger_post` with `confirmPublish: true`.
- Store Google OAuth refresh tokens locally.
- Convert Markdown input to Blogger HTML.
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

Local image upload is intentionally not part of the main workflow. Create the
draft with MCP, then upload and place images in the Blogger editor.

### `list_blogger_posts`

Lists recent posts. Use `status: ["draft"]` for drafts only.

### `update_blogger_post`

Patches title, content, and labels. It does not publish.

### `publish_blogger_post`

Publishes a post only when called explicitly:

```json
{
  "postId": "123",
  "confirmPublish": true
}
```

### `score_blog_post`

Scores title length, heading structure, content depth, wrap-up, and SEO labels.

### `create_project_devlog_draft`

Creates a structured devlog draft:

1. 오늘 한 일
2. 문제 상황
3. 해결 방법
4. 결과 화면
5. 배운 점
6. 다음 작업

### `create_strava_activity_draft`

Modes:

- `auth_url`
- `exchange_code`
- `list_recent`
- `create_draft`

The running retrospective includes distance, time, average pace, average heart rate, elevation, activity name, date, and lap pace data when available.

## Image Workflow

Blogger's web editor can upload images directly into Blogger/Google-hosted
storage, but the Blogger API draft flow used by this MCP expects post content
HTML and does not provide the same simple local-file upload path.

Recommended workflow:

1. Use MCP to create or update the text draft.
2. Open the draft in Blogger.
3. Upload screenshots or attached images with the Blogger editor.
4. Review the final layout and publish manually or with `publish_blogger_post`.

## Safety Notes

- Draft creation is the default.
- Nothing publishes unless `publish_blogger_post` is explicitly called.
- `publish_blogger_post` requires `confirmPublish: true`.
- Client secrets and tokens must stay in `.env` and `.tokens`.
- `.env` and `.tokens` are ignored by git.
