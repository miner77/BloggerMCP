import { z } from "zod";
import { blogger_v3 } from "googleapis";
import { getCommentsByPost, getCommentsByBlog } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

function summarizeComment(c: blogger_v3.Schema$Comment) {
  return {
    id: c.id,
    author: c.author?.displayName ?? null,
    authorUrl: c.author?.url ?? null,
    content: c.content ?? null,
    published: c.published,
    updated: c.updated,
    inReplyTo: c.inReplyTo?.id ?? null,
    blogId: c.blog?.id ?? null,
    postId: c.post?.id ?? null,
    status: c.status
  };
}

export const registerListBloggerComments: ToolRegistrar = (server) => {
  server.registerTool(
    "list_blogger_comments",
    {
      title: "List Blogger comments",
      description: "List Blogger comments for a blog or a specific post.",
      inputSchema: {
        blogId: z.string().optional(),
        postId: z.string().optional().describe("If provided, only comments on this post."),
        maxResults: z.number().int().min(1).max(100).optional().default(10),
        fetchBodies: z.boolean().optional().default(false)
      }
    },
    async (input) => {
      const result = input.postId
        ? await getCommentsByPost({
            postId: input.postId,
            blogId: input.blogId,
            maxResults: input.maxResults,
            fetchBodies: input.fetchBodies
          })
        : await getCommentsByBlog({
            blogId: input.blogId,
            maxResults: input.maxResults,
            fetchBodies: input.fetchBodies
          });

      return textResult({
        status: "ok",
        comments: (result.items ?? []).map(summarizeComment)
      });
    }
  );
};

export const registerListBloggerCommentsByBlog: ToolRegistrar = (server) => {
  server.registerTool(
    "list_blogger_comments_by_blog",
    {
      title: "List Blogger comments by blog",
      description: "List all comments for a Blogger blog.",
      inputSchema: {
        blogId: z.string().optional(),
        maxResults: z.number().int().min(1).max(100).optional().default(10),
        fetchBodies: z.boolean().optional().default(false)
      }
    },
    async (input) => {
      const result = await getCommentsByBlog({
        blogId: input.blogId,
        maxResults: input.maxResults,
        fetchBodies: input.fetchBodies
      });

      return textResult({
        status: "ok",
        comments: (result.items ?? []).map(summarizeComment)
      });
    }
  );
};
