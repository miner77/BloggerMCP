import { z } from "zod";
import { textResult, ToolRegistrar } from "./types.js";

function scorePost(title: string, markdown: string, labels: string[] = []) {
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const hasHeadings = /^#{2,3}\s+/m.test(markdown);
  const hasImages = /!\[[^\]]*]\([^)]+\)|<img\s/i.test(markdown);
  const hasConclusion = /(다음|결론|마무리|배운 점|next)/i.test(markdown);
  const titleLengthOk = title.length >= 18 && title.length <= 70;
  const tagCountOk = labels.length >= 1 && labels.length <= 3;

  const checks = [
    { name: "title_length", passed: titleLengthOk, points: 20 },
    { name: "structure_headings", passed: hasHeadings, points: 20 },
    { name: "body_depth", passed: wordCount >= 250, points: 20 },
    { name: "visual_context", passed: hasImages, points: 15 },
    { name: "clear_wrap_up", passed: hasConclusion, points: 15 },
    { name: "seo_labels", passed: tagCountOk, points: 10 }
  ];

  const score = checks.reduce((sum, check) => sum + (check.passed ? check.points : 0), 0);
  const suggestions = checks
    .filter((check) => !check.passed)
    .map((check) => {
      switch (check.name) {
        case "title_length":
          return "제목을 18~70자 사이의 검색 친화적인 문장으로 다듬어 보세요.";
        case "structure_headings":
          return "H2/H3 섹션을 추가해 글 흐름을 더 스캔하기 쉽게 만드세요.";
        case "body_depth":
          return "사례, 수치, 시행착오를 더해 본문을 조금 더 깊게 만드세요.";
        case "visual_context":
          return "스크린샷이나 결과 이미지를 추가하면 완성도가 올라갑니다.";
        case "clear_wrap_up":
          return "배운 점이나 다음 작업을 마지막에 정리해 보세요.";
        default:
          return "라벨은 1~3개 정도로만 간결하게 지정해 보세요.";
      }
    });

  return { score, wordCount, checks, suggestions };
}

export const registerScoreBlogPost: ToolRegistrar = (server) => {
  server.registerTool(
    "score_blog_post",
    {
      title: "Score blog post",
      description: "Score a draft for structure, SEO basics, readability, and visual context.",
      inputSchema: {
        title: z.string().min(1),
        markdown: z.string().min(1),
        labels: z.array(z.string()).optional()
      }
    },
    async (input) => textResult(scorePost(input.title, input.markdown, input.labels))
  );
};
