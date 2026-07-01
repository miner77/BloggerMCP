import { z } from "zod";
import { createDraft } from "../blogger/bloggerClient.js";
import {
  exchangeStravaAuthCode,
  formatDistanceMeters,
  formatDuration,
  formatPace,
  getActivity,
  getStravaAuthUrl,
  listRecentActivities,
  StravaActivity
} from "../strava/stravaClient.js";
import { normalizeLabels, summarizePost, textResult, ToolRegistrar } from "./types.js";

function renderActivityMarkdown(activity: StravaActivity): string {
  const distance = formatDistanceMeters(activity.distance);
  const duration = formatDuration(activity.moving_time);
  const pace = formatPace(activity.distance, activity.moving_time);
  const elevation = activity.total_elevation_gain ? `${activity.total_elevation_gain.toFixed(0)} m` : "N/A";
  const heartRate = activity.average_heartrate ? `${activity.average_heartrate.toFixed(0)} bpm` : "N/A";
  const date = new Date(activity.start_date_local).toLocaleDateString("ko-KR");
  const laps = activity.laps?.length
    ? activity.laps
        .map((lap, index) => `- ${lap.name ?? `${index + 1}랩`}: ${formatDistanceMeters(lap.distance)}, ${formatPace(lap.distance, lap.moving_time)}`)
        .join("\n")
    : "- 랩 데이터 없음";

  return `## 1. 오늘의 러닝 요약
- 활동명: ${activity.name}
- 날짜: ${date}
- 거리: ${distance}
- 시간: ${duration}
- 평균 페이스: ${pace}

## 2. 데이터 분석
- 평균 심박: ${heartRate}
- 고도 상승: ${elevation}
- 랩별 페이스
${laps}

## 3. 잘한 점
- 꾸준히 움직인 구간과 페이스가 안정적이었던 구간을 중심으로 회고해 봅니다.

## 4. 보완할 점
- 심박, 후반 페이스 변화, 회복 상태를 함께 보며 다음 훈련에 반영합니다.

## 5. 다음 훈련 제안
- 다음 러닝은 오늘 평균 페이스보다 10~20초 여유 있는 이지런 또는 짧은 템포 구간을 추천합니다.
`;
}

export const registerCreateStravaActivityDraft: ToolRegistrar = (server) => {
  server.registerTool(
    "create_strava_activity_draft",
    {
      title: "Create Strava activity draft",
      description: "Authenticate Strava, list activities, or create a Blogger running retrospective draft from an activity.",
      inputSchema: {
        mode: z.enum(["auth_url", "exchange_code", "list_recent", "create_draft"]).default("create_draft"),
        code: z.string().optional(),
        activityId: z.number().int().optional(),
        blogId: z.string().optional(),
        maxResults: z.number().int().min(1).max(30).optional().default(10),
        labels: z.array(z.string()).max(3).optional()
      }
    },
    async (input) => {
      if (input.mode === "auth_url") {
        return textResult({
          status: "authorization_required",
          authUrl: getStravaAuthUrl(),
          nextStep: "Open authUrl, approve access, then call create_strava_activity_draft with mode=exchange_code and code."
        });
      }

      if (input.mode === "exchange_code") {
        if (!input.code) throw new Error("code is required for exchange_code mode.");
        await exchangeStravaAuthCode(input.code);
        return textResult({ status: "ok", message: "Strava token saved. Token values were not returned for safety." });
      }

      if (input.mode === "list_recent") {
        const activities = await listRecentActivities(input.maxResults);
        return textResult({
          status: "ok",
          activities: activities.map((activity) => ({
            id: activity.id,
            name: activity.name,
            date: activity.start_date_local,
            distance: formatDistanceMeters(activity.distance),
            movingTime: formatDuration(activity.moving_time),
            pace: formatPace(activity.distance, activity.moving_time)
          }))
        });
      }

      if (!input.activityId) throw new Error("activityId is required for create_draft mode.");
      const activity = await getActivity(input.activityId);
      const title = `러닝 회고: ${activity.name} (${formatDistanceMeters(activity.distance)})`;
      const post = await createDraft({
        title,
        markdown: renderActivityMarkdown(activity),
        labels: normalizeLabels(input.labels) ?? ["러닝", "Strava", "회고"],
        blogId: input.blogId
      });

      return textResult({
        status: "draft_created",
        post: summarizePost(post),
        activity: {
          id: activity.id,
          name: activity.name,
          distance: formatDistanceMeters(activity.distance),
          movingTime: formatDuration(activity.moving_time),
          pace: formatPace(activity.distance, activity.moving_time)
        }
      });
    }
  );
};
