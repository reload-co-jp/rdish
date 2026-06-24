export const dynamic = "force-static"

import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const publicRules = {
    allow: "/",
    disallow: ["/favorites/", "/search/"],
  }

  return {
    rules: [
      {
        userAgent: "*",
        ...publicRules,
      },
      { userAgent: "Googlebot", ...publicRules },
      { userAgent: "Google-Extended", ...publicRules },
      { userAgent: "GPTBot", ...publicRules },
      { userAgent: "OAI-SearchBot", ...publicRules },
      { userAgent: "ChatGPT-User", ...publicRules },
      { userAgent: "PerplexityBot", ...publicRules },
      { userAgent: "ClaudeBot", ...publicRules },
      { userAgent: "Claude-SearchBot", ...publicRules },
    ],
    sitemap: "https://rdish.reload.co.jp/sitemap.xml",
  }
}
