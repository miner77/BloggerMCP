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

export type BloggerPageInput = {
  title: string;
  markdown: string;
  blogId?: string;
};

export type BloggerPageUpdateInput = {
  pageId: string;
  title?: string;
  markdown?: string;
  blogId?: string;
};

export type BloggerCommentInput = {
  blogId?: string;
  postId?: string;
  maxResults?: number;
  fetchBodies?: boolean;
};

export type BloggerPageviewsInput = {
  blogId?: string;
  range: string;
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

/* ============================================================
   BLOGS
   ============================================================ */

export async function getBlog(input: { blogId?: string }): Promise<blogger_v3.Schema$Blog> {
  const blogger = await getBlogger();
  const response = await blogger.blogs.get({ blogId: resolveBlogId(input.blogId) });
  return response.data;
}

export async function getBlogByUrl(input: { url: string }): Promise<blogger_v3.Schema$Blog> {
  const blogger = await getBlogger();
  const response = await blogger.blogs.getByUrl({ url: input.url });
  return response.data;
}

export async function listBlogsByUser(input: {
  userId: string;
}): Promise<blogger_v3.Schema$BlogList> {
  const blogger = await getBlogger();
  const response = await blogger.blogs.listByUser({ userId: input.userId });
  return response.data;
}

/* ============================================================
   POSTS
   ============================================================ */

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

export async function getPost(input: {
  postId: string;
  blogId?: string;
  fetchBody?: boolean;
}): Promise<blogger_v3.Schema$Post> {
  const blogger = await getBlogger();
  const response = await blogger.posts.get({
    blogId: resolveBlogId(input.blogId),
    postId: input.postId,
    fetchBody: input.fetchBody
  });

  return response.data;
}

export async function deletePost(input: {
  postId: string;
  blogId?: string;
}): Promise<void> {
  const blogger = await getBlogger();
  await blogger.posts.delete({
    blogId: resolveBlogId(input.blogId),
    postId: input.postId
  });
}

export async function revertPost(input: {
  postId: string;
  blogId?: string;
}): Promise<blogger_v3.Schema$Post> {
  const blogger = await getBlogger();
  const response = await blogger.posts.revert({
    blogId: resolveBlogId(input.blogId),
    postId: input.postId
  });

  return response.data;
}

export async function searchPosts(input: {
  blogId?: string;
  q: string;
  fetchBodies?: boolean;
}): Promise<blogger_v3.Schema$PostList> {
  const blogger = await getBlogger();
  const response = await blogger.posts.search({
    blogId: resolveBlogId(input.blogId),
    q: input.q,
    fetchBodies: input.fetchBodies
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

/* ============================================================
   PAGES
   ============================================================ */

export async function createPage(input: BloggerPageInput): Promise<blogger_v3.Schema$Page> {
  const blogger = await getBlogger();
  const response = await blogger.pages.insert({
    blogId: resolveBlogId(input.blogId),
    requestBody: {
      title: input.title,
      content: composeContent(input.markdown)
    }
  });

  return response.data;
}

export async function listPages(input: {
  blogId?: string;
  maxResults?: number;
}): Promise<blogger_v3.Schema$PageList> {
  const blogger = await getBlogger();
  const response = await blogger.pages.list({
    blogId: resolveBlogId(input.blogId),
    maxResults: input.maxResults ?? 10,
    fetchBodies: false
  });

  return response.data;
}

export async function getPage(input: {
  pageId: string;
  blogId?: string;
}): Promise<blogger_v3.Schema$Page> {
  const blogger = await getBlogger();
  const response = await blogger.pages.get({
    blogId: resolveBlogId(input.blogId),
    pageId: input.pageId
  });

  return response.data;
}

export async function deletePage(input: {
  pageId: string;
  blogId?: string;
}): Promise<void> {
  const blogger = await getBlogger();
  await blogger.pages.delete({
    blogId: resolveBlogId(input.blogId),
    pageId: input.pageId
  });
}

export async function revertPage(input: {
  pageId: string;
  blogId?: string;
}): Promise<blogger_v3.Schema$Page> {
  const blogger = await getBlogger();
  const response = await blogger.pages.revert({
    blogId: resolveBlogId(input.blogId),
    pageId: input.pageId
  });

  return response.data;
}

export async function updatePage(input: BloggerPageUpdateInput): Promise<blogger_v3.Schema$Page> {
  const blogger = await getBlogger();
  const requestBody: blogger_v3.Schema$Page = {};

  if (input.title) requestBody.title = input.title;
  if (input.markdown !== undefined) {
    requestBody.content = composeContent(input.markdown);
  }

  const response = await blogger.pages.update({
    blogId: resolveBlogId(input.blogId),
    pageId: input.pageId,
    requestBody
  });

  return response.data;
}

export async function publishPage(input: { pageId: string; blogId?: string }): Promise<blogger_v3.Schema$Page> {
  const blogger = await getBlogger();
  const response = await blogger.pages.publish({
    blogId: resolveBlogId(input.blogId),
    pageId: input.pageId
  });

  return response.data;
}

/* ============================================================
   COMMENTS
   ============================================================ */

export async function listComments(input: BloggerCommentInput): Promise<blogger_v3.Schema$CommentList> {
  const blogger = await getBlogger();
  const response = await blogger.comments.list({
    blogId: resolveBlogId(input.blogId),
    postId: input.postId,
    maxResults: input.maxResults ?? 10,
    fetchBodies: input.fetchBodies
  });

  return response.data;
}

export async function getComment(input: {
  commentId: string;
  blogId?: string;
}): Promise<blogger_v3.Schema$Comment> {
  const blogger = await getBlogger();
  const response = await blogger.comments.get({
    blogId: resolveBlogId(input.blogId),
    commentId: input.commentId
  });

  return response.data;
}

export async function approveComment(input: {
  commentId: string;
  blogId?: string;
}): Promise<blogger_v3.Schema$Comment> {
  const blogger = await getBlogger();
  const response = await blogger.comments.approve({
    blogId: resolveBlogId(input.blogId),
    commentId: input.commentId
  });

  return response.data;
}

export async function deleteComment(input: {
  commentId: string;
  blogId?: string;
}): Promise<void> {
  const blogger = await getBlogger();
  await blogger.comments.delete({
    blogId: resolveBlogId(input.blogId),
    commentId: input.commentId
  });
}

export async function markCommentAsSpam(input: {
  commentId: string;
  blogId?: string;
}): Promise<blogger_v3.Schema$Comment> {
  const blogger = await getBlogger();
  const response = await blogger.comments.markAsSpam({
    blogId: resolveBlogId(input.blogId),
    commentId: input.commentId
  });

  return response.data;
}

export async function getCommentsByPost(input: {
  postId: string;
  blogId?: string;
  maxResults?: number;
  fetchBodies?: boolean;
}): Promise<blogger_v3.Schema$CommentList> {
  const blogger = await getBlogger();
  const response = await blogger.comments.list({
    blogId: resolveBlogId(input.blogId),
    postId: input.postId,
    maxResults: input.maxResults ?? 10,
    fetchBodies: input.fetchBodies
  });

  return response.data;
}

export async function getCommentsByBlog(input: {
  blogId?: string;
  maxResults?: number;
  fetchBodies?: boolean;
}): Promise<blogger_v3.Schema$CommentList> {
  const blogger = await getBlogger();
  const response = await blogger.comments.list({
    blogId: resolveBlogId(input.blogId),
    maxResults: input.maxResults ?? 10,
    fetchBodies: input.fetchBodies
  });

  return response.data;
}

/* ============================================================
   PAGEVIEWS
   ============================================================ */

export async function getPageviews(input: BloggerPageviewsInput): Promise<blogger_v3.Schema$Pageviews> {
  const blogger = await getBlogger();
  const response = await blogger.pageViews.get({
    blogId: resolveBlogId(input.blogId),
    range: [input.range]
  });

  return response.data;
}
