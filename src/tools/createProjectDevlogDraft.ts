import { z } from "zod";
import { createDraft } from "../blogger/bloggerClient.js";
import { renderImageHtml } from "../image/imageStorage.js";
import { collectLatestScreenshots, storeImages } from "../image/localImageProvider.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

function bulletList(items?: string[]): string {
  return items && items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- 정리 예정";
}

function seoFor(projectName: string, workSummary: string[]) {
  const topic = workSummary[0] ?? "개발일지";
  return {
    title: `${projectName} 개발일지: ${topic}`,
    description: `${projectName} 프로젝트에서 진행한 작업, 문제 해결 과정, 결과 화면과 다음 작업을 정리한 개발일지입니다.`,
    labels: Array.from(new Set(["개발일지", projectName, "프로젝트", "트러블슈팅", "회고"]))
  };
}

export const registerCreateProjectDevlogDraft: ToolRegistrar = (server) => {
  server.registerTool(
    "create_project_devlog_draft",
    {
      title: "Create project devlog draft",
      description: "Create a structured Blogger draft for a web/app project devlog with optional screenshots.",
      inputSchema: {
        projectName: z.string().min(1),
        todayWork: z.array(z.string()).default([]),
        changedFiles: z.array(z.string()).optional(),
        problems: z.array(z.string()).optional(),
        solutions: z.array(z.string()).optional(),
        learnings: z.array(z.string()).optional(),
        nextTasks: z.array(z.string()).optional(),
        projectDir: z.string().optional(),
        screenshotDir: z.string().optional(),
        screenshotPaths: z.array(z.string()).optional(),
        imageUrls: z.array(z.string()).optional(),
        blogId: z.string().optional(),
        labels: z.array(z.string()).optional()
      }
    },
    async (input) => {
      const seo = seoFor(input.projectName, input.todayWork);
      const autoScreenshots = await collectLatestScreenshots({
        projectDir: input.projectDir,
        screenshotDir: input.screenshotDir,
        limit: 4
      });
      const imageResult = await storeImages({
        imageUrls: input.imageUrls,
        imagePaths: [...autoScreenshots, ...(input.screenshotPaths ?? [])]
      });

      const markdown = `> ${seo.description}

## 1. 오늘 한 일
${bulletList(input.todayWork)}

## 2. 문제 상황
${bulletList(input.problems)}

## 3. 해결 방법
${bulletList(input.solutions)}

## 4. 결과 화면
${imageResult.images.length > 0 ? "아래 스크린샷으로 결과를 확인할 수 있습니다." : "스크린샷은 아직 첨부되지 않았습니다."}

## 변경 파일
${bulletList(input.changedFiles)}

## 5. 배운 점
${bulletList(input.learnings)}

## 6. 다음 작업
${bulletList(input.nextTasks)}
`;

      const post = await createDraft({
        title: seo.title,
        markdown,
        labels: input.labels ?? seo.labels,
        blogId: input.blogId,
        imageHtml: renderImageHtml(imageResult.images, { gallery: true })
      });

      return textResult({
        status: "draft_created",
        post: summarizePost(post),
        seo,
        autoScreenshots,
        images: imageResult.images,
        warnings: imageResult.warnings
      });
    }
  );
};
