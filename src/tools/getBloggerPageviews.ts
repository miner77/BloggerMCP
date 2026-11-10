import { z } from "zod";
import { getPageviews } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerGetBloggerPageviews: ToolRegistrar = (server) => {
  server.registerTool(
    "get_blogger_pageviews",
    {
      title: "Get Blogger pageviews",
      description: "Retrieve pageview statistics for a Blogger blog.",
      inputSchema: {
        blogId: z.string().optional(),
        range: z.string().min(1).describe("Date range, e.g. 'today', 'yesterday', 'all-time', '2024-01-01..2024-12-31'")
      }
    },
    async (input) => {
      const pageviews = await getPageviews({ blogId: input.blogId, range: input.range! });
      return textResult({
        status: "ok",
        pageviews: {
          blogId: pageviews.blogId,
          kind: pageviews.kind,
          counts: pageviews.counts ?? []
        }
      });
    }
  );
};
