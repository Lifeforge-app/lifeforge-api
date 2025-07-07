import { z } from "zod/v4";

const BlogEntrySchema = z.object({
  title: z.string(),
  content: z.string(),
  media: z.array(z.string()),
  excerpt: z.string(),
  visibility: z.enum(["public", "private", "unlisted"]),
  featured_image: z.string(),
  labels: z.array(z.string()),
  category: z.string(),
});

const BlogCategorySchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});

type IBlogEntry = z.infer<typeof BlogEntrySchema>;
type IBlogCategory = z.infer<typeof BlogCategorySchema>;

export { BlogEntrySchema, BlogCategorySchema };
export type { IBlogEntry, IBlogCategory };
