/**
 * VioX TinaCMS config — TEMPLATE (validated against viox.ai site-v2: 11 blog + 11 social indexed).
 *
 * Copy to <project>/tina/config.ts, then `npm i tinacms @tinacms/cli` and
 * `npx tinacms dev -c "<your dev command>"`. See _shared/cms-integration.md.
 *
 * GOTCHA proven in the spike: every field type MUST match the real frontmatter.
 * `sources` here is an OBJECT list ({title,url}) because that's what the
 * trend-blog-studio frontmatter actually contains — a string list fails indexing.
 * If a `rich-text` body ever fails MDX parsing on pipeline-generated content,
 * fall back to: { type: "string", name: "body", isBody: true, ui: { component: "textarea" } }.
 */
import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "uploads", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Posts",
        path: "content/blog",
        format: "md",
        fields: [
          { type: "string", name: "slug", label: "Slug" },
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "datetime", name: "date", label: "Date" },
          { type: "string", name: "category", label: "Category" },
          { type: "string", name: "tags", label: "Tags", list: true },
          { type: "string", name: "summary", label: "Summary", ui: { component: "textarea" } },
          { type: "object", name: "sources", label: "Sources", list: true, fields: [
            { type: "string", name: "title", label: "Title" },
            { type: "string", name: "url", label: "URL" },
          ] },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
        ],
      },
      {
        name: "social",
        label: "Social Variants",
        path: "content/social",
        format: "json",
        fields: [
          { type: "string", name: "post", label: "Post slug" },
          {
            type: "object", name: "linkedin", label: "LinkedIn",
            fields: [
              { type: "string", name: "hook", label: "Hook" },
              { type: "string", name: "body", label: "Body", ui: { component: "textarea" } },
              { type: "string", name: "cta", label: "CTA" },
              { type: "string", name: "link", label: "Link" },
              { type: "string", name: "hashtags", label: "Hashtags", list: true },
            ],
          },
        ],
      },
    ],
  },
});
