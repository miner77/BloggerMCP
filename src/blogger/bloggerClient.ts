import { google, blogger_v3 } from "googleapis";
import { marked } from "marked";
import { config } from "../config.js";
import { getGoogleAuthClient } from "../auth/googleAuth.js";

export type BloggerPostStatus = "draft" | "live" | "scheduled";

export type BloggerPostInput = {
  title: string;
  markdown: string;
  labels?: string[];
  imageHtml?: string;
  blogId?: string;
};

export type BloggerUpdateInput = {
  postId: string;
  title?: string;
  markdown?: string;
  labels?: string[];
  imageHtml?: string;
  blogId?: string;
};

function resolveBlogId(blogId?: string): string {
  const resolved = blogId ?? config.bloggerBlogId;
  if (!resolved) {
    throw new Error("BLOGGER_BLOG_ID must be set in .env or passed as blogId.");
  }
  return resolved;
}

function composeContent(markdown?: string, imageHtml?: string): string {
  const body = markdown ? marked.parse(markdown, { async: false }) : undefined;
  return [imageHtml, body].filter(Boolean).join("\n\n");
}

async function getBlogger(): Promise<blogger_v3.Blogger> {
  const auth = await getGoogleAuthClient();
  return google.blogger({ version: "v3", auth });
}

export async function createDraft(input: BloggerPostInput): Promise<blogger_v3.Schema$Post> {
  const blogger = await getBlogger();
  const response = await blogger.posts.insert({
    blogId: resolveBlogId(input.blogId),
    isDraft: true,
    requestBody: {
      title: input.title,
      content: composeContent(input.markdown, input.imageHtml),
      labels: input.labels
    }
  });

  return response.data;
}

export async function listPosts(input: {
  blogId?: string;
  status?: BloggerPostStatus[];
  maxResults?: number;
}): Promise<blogger_v3.Schema$PostList> {
  const blogger = await getBlogger();
  const response = await blogger.posts.list({
    blogId: resolveBlogId(input.blogId),
    status: input.status,
    maxResults: input.maxResults ?? 10,
    fetchBodies: false,
    orderBy: "updated"
  });

  return response.data;
}

export async function updatePost(input: BloggerUpdateInput): Promise<blogger_v3.Schema$Post> {
  const blogger = await getBlogger();
  const requestBody: blogger_v3.Schema$Post = {};

  if (input.title) requestBody.title = input.title;
  if (input.markdown || input.imageHtml) {
    requestBody.content = composeContent(input.markdown ?? "", input.imageHtml);
  }
  if (input.labels) requestBody.labels = input.labels;

  const response = await blogger.posts.patch({
    blogId: resolveBlogId(input.blogId),
    postId: input.postId,
    requestBody
  });

  return response.data;
}

export async function publishPost(input: { postId: string; blogId?: string }): Promise<blogger_v3.Schema$Post> {
  const blogger = await getBlogger();
  const response = await blogger.posts.publish({
    blogId: resolveBlogId(input.blogId),
    postId: input.postId
  });

  return response.data;
}
