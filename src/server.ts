#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerBloggerLogin } from "./tools/bloggerLogin.js";
import { registerCreateBloggerDraft } from "./tools/createBloggerDraft.js";
import { registerCreateBloggerPage } from "./tools/createBloggerPage.js";
import { registerCreateProjectDevlogDraft } from "./tools/createProjectDevlogDraft.js";
import { registerCreateStravaActivityDraft } from "./tools/createStravaActivityDraft.js";
import { registerListBloggerPosts } from "./tools/listBloggerPosts.js";
import { registerListBloggerPages } from "./tools/listBloggerPages.js";
import { registerUpdateBloggerPost } from "./tools/updateBloggerPost.js";
import { registerUpdateBloggerPage } from "./tools/updateBloggerPage.js";
import { registerPublishBloggerPost } from "./tools/publishBloggerPost.js";
import { registerPublishBloggerPage } from "./tools/publishBloggerPage.js";
import { registerGetBloggerBlog } from "./tools/getBloggerBlog.js";
import { registerGetBloggerBlogByUrl } from "./tools/getBloggerBlogByUrl.js";
import { registerListBlogsByUser } from "./tools/listBlogsByUser.js";
import { registerGetBloggerPost } from "./tools/getBloggerPost.js";
import { registerDeleteBloggerPost } from "./tools/deleteBloggerPost.js";
import { registerRevertBloggerPost } from "./tools/revertBloggerPost.js";
import { registerSearchBloggerPosts } from "./tools/searchBloggerPosts.js";
import { registerGetBloggerPage } from "./tools/getBloggerPage.js";
import { registerDeleteBloggerPage } from "./tools/deleteBloggerPage.js";
import { registerRevertBloggerPage } from "./tools/revertBloggerPage.js";
import { registerGetBloggerComment } from "./tools/bloggerComments.js";
import { registerApproveBloggerComment } from "./tools/bloggerComments.js";
import { registerDeleteBloggerComment } from "./tools/bloggerComments.js";
import { registerMarkBloggerCommentAsSpam } from "./tools/bloggerComments.js";
import { registerListBloggerComments } from "./tools/listBloggerComments.js";
import { registerListBloggerCommentsByBlog } from "./tools/listBloggerComments.js";
import { registerScoreBlogPost } from "./tools/scoreBlogPost.js";
import { registerGetBloggerPageviews } from "./tools/getBloggerPageviews.js";

const server = new McpServer({
  name: "blogger-mcp",
  version: "0.2.0"
});

registerBloggerLogin(server);

// Posts
registerCreateBloggerDraft(server);
registerListBloggerPosts(server);
registerGetBloggerPost(server);
registerDeleteBloggerPost(server);
registerRevertBloggerPost(server);
registerSearchBloggerPosts(server);
registerUpdateBloggerPost(server);
registerPublishBloggerPost(server);

// Pages
registerCreateBloggerPage(server);
registerListBloggerPages(server);
registerGetBloggerPage(server);
registerDeleteBloggerPage(server);
registerRevertBloggerPage(server);
registerUpdateBloggerPage(server);
registerPublishBloggerPage(server);

// Comments
registerListBloggerComments(server);
registerListBloggerCommentsByBlog(server);
registerGetBloggerComment(server);
registerApproveBloggerComment(server);
registerDeleteBloggerComment(server);
registerMarkBloggerCommentAsSpam(server);

// Blogs
registerGetBloggerBlog(server);
registerGetBloggerBlogByUrl(server);
registerListBlogsByUser(server);

// Pageviews
registerGetBloggerPageviews(server);

// Scoring
registerScoreBlogPost(server);

// Project
registerCreateProjectDevlogDraft(server);
registerCreateStravaActivityDraft(server);

const transport = new StdioServerTransport();
await server.connect(transport);
