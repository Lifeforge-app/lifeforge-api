// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: blog
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: blog__entries, blog__categories
import { z } from "zod/v4";

const BlogEntriesSchema = z.object({
  content: z.string(),
  title: z.string(),
  media: z.string(),
  excerpt: z.string(),
  visibility: z.enum(["private", "public", "unlisted"]),
  featured_image: z.string(),
  labels: z.any(),
  category: z.string(),
});

const BlogCategoriesSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});

type IBlogEntries = z.infer<typeof BlogEntriesSchema>;
type IBlogCategories = z.infer<typeof BlogCategoriesSchema>;

export { BlogEntriesSchema, BlogCategoriesSchema };

export type { IBlogEntries, IBlogCategories };
