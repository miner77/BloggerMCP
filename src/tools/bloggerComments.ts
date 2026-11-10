import { z } from "zod";
import { getComment, approveComment, deleteComment, markCommentAsSpam } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerGetBloggerComment: ToolRegistrar = (server) => {
  server.registerTool(
    "get_blogger_comment",
    {
      title: "Get Blogger comment",
      description: "Retrieve a single Blogger comment by ID.",
      inputSchema: {
        commentId: z.string().min(1),
        blogId: z.string().optional()
      }
    },
    async (input) => {
      const comment = await getComment({ commentId: input.commentId, blogId: input.blogId });
      return textResult({
        status: "ok",
        comment: {
          id: comment.id,
          author: comment.author?.displayName ?? null,
          content: comment.content ?? null,
          published: comment.published,
          updated: comment.updated,
          status: comment.status,
          blogId: comment.blog?.id ?? null,
          postId: comment.post?.id ?? null,
          inReplyTo: comment.inReplyTo?.id ?? null
        }
      });
    }
  );
};

export const registerApproveBloggerComment: ToolRegistrar = (server) => {
  server.registerTool(
    "approve_blogger_comment",
    {
      title: "Approve Blogger comment",
      description: "Approve a pending Blogger comment.",
      inputSchema: {
        commentId: z.string().min(1),
        blogId: z.string().optional(),
        confirmApprove: z.literal(true).describe("Must be true to confirm approving the comment.")
      }
    },
    async (input) => {
      const comment = await approveComment({ commentId: input.commentId, blogId: input.blogId });
      return textResult({
        status: "comment_approved",
        commentId: input.commentId
      });
    }
  );
};

export const registerDeleteBloggerComment: ToolRegistrar = (server) => {
  server.registerTool(
    "delete_blogger_comment",
    {
      title: "Delete Blogger comment",
      description: "Delete a Blogger comment permanently.",
      inputSchema: {
        commentId: z.string().min(1),
        blogId: z.string().optional(),
        confirmDelete: z.literal(true).describe("Must be true to confirm deleting the comment.")
      }
    },
    async (input) => {
      await deleteComment({ commentId: input.commentId, blogId: input.blogId });
      return textResult({
        status: "comment_deleted",
        commentId: input.commentId
      });
    }
  );
};

export const registerMarkBloggerCommentAsSpam: ToolRegistrar = (server) => {
  server.registerTool(
    "mark_blogger_comment_as_spam",
    {
      title: "Mark Blogger comment as spam",
      description: "Mark a Blogger comment as spam.",
      inputSchema: {
        commentId: z.string().min(1),
        blogId: z.string().optional(),
        confirmSpam: z.literal(true).describe("Must be true to confirm marking as spam.")
      }
    },
    async (input) => {
      const comment = await markCommentAsSpam({ commentId: input.commentId, blogId: input.blogId });
      return textResult({
        status: "comment_marked_as_spam",
        commentId: input.commentId
      });
    }
  );
};
