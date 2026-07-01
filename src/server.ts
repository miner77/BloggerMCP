#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerBloggerLogin } from "./tools/bloggerLogin.js";
import { registerCreateBloggerDraft } from "./tools/createBloggerDraft.js";
import { registerCreateProjectDevlogDraft } from "./tools/createProjectDevlogDraft.js";
import { registerCreateStravaActivityDraft } from "./tools/createStravaActivityDraft.js";
import { registerListBloggerPosts } from "./tools/listBloggerPosts.js";
import { registerPublishBloggerPost } from "./tools/publishBloggerPost.js";
import { registerScoreBlogPost } from "./tools/scoreBlogPost.js";
import { registerUpdateBloggerPost } from "./tools/updateBloggerPost.js";
import { registerUploadPostImage } from "./tools/uploadPostImage.js";

const server = new McpServer({
  name: "blogger-mcp",
  version: "0.1.0"
});

registerBloggerLogin(server);
registerCreateBloggerDraft(server);
registerListBloggerPosts(server);
registerUpdateBloggerPost(server);
registerPublishBloggerPost(server);
registerScoreBlogPost(server);
registerUploadPostImage(server);
registerCreateProjectDevlogDraft(server);
registerCreateStravaActivityDraft(server);

const transport = new StdioServerTransport();
await server.connect(transport);
