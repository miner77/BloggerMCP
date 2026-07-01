import { z } from "zod";
import { exchangeGoogleAuthCode, getGoogleAuthUrl } from "../auth/googleAuth.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerBloggerLogin: ToolRegistrar = (server) => {
  server.registerTool(
    "blogger_login",
    {
      title: "Blogger OAuth login",
      description: "Return a Google OAuth URL or exchange an OAuth code and store the refresh token locally.",
      inputSchema: {
        code: z.string().optional().describe("OAuth authorization code copied from the Google redirect URL.")
      }
    },
    async ({ code }) => {
      if (!code) {
        return textResult({
          status: "authorization_required",
          authUrl: getGoogleAuthUrl(),
          nextStep: "Open authUrl, approve Blogger access, then call blogger_login again with the returned code."
        });
      }

      await exchangeGoogleAuthCode(code);
      return textResult({
        status: "ok",
        message: "Google refresh token saved. Token values were not returned for safety."
      });
    }
  );
};
