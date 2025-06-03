import { z } from "zod";

const IdeaBoxContainerSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  cover: z.string(),
  image_count: z.number(),
  link_count: z.number(),
  text_count: z.number(),
});

const IdeaBoxFolderSchema = z.object({
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  container: z.string(),
  parent: z.string().optional(),
});

const IdeaBoxEntrySchema = z.object({
  container: z.string(),
  folder: z.string(),
  content: z.string().optional(),
  image: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(["text", "image", "link"]),
  tags: z.array(z.string()),
  pinned: z.boolean(),
  archived: z.boolean(),
});

const IdeaBoxTagSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  container: z.string(),
  amount: z.number(),
});

type IIdeaBoxContainer = z.infer<typeof IdeaBoxContainerSchema>;
type IIdeaBoxFolder = z.infer<typeof IdeaBoxFolderSchema>;
type IIdeaBoxEntry = z.infer<typeof IdeaBoxEntrySchema>;
type IIdeaBoxTag = z.infer<typeof IdeaBoxTagSchema>;

export {
  IdeaBoxContainerSchema,
  IdeaBoxEntrySchema,
  IdeaBoxFolderSchema,
  IdeaBoxTagSchema,
};
export type { IIdeaBoxContainer, IIdeaBoxEntry, IIdeaBoxFolder, IIdeaBoxTag };
