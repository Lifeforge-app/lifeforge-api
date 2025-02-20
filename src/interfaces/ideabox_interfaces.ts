import * as s from "superstruct";
import { BasePBCollectionSchema } from "./pocketbase_interfaces";

const IdeaBoxContainerSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    color: s.string(),
    icon: s.string(),
    cover: s.string(),
    image_count: s.number(),
    link_count: s.number(),
    text_count: s.number(),
  })
);

const IdeaBoxFolderSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    color: s.string(),
    icon: s.string(),
    name: s.string(),
    container: s.string(),
    parent: s.optional(s.string()),
  })
);

const IdeaBoxEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    container: s.string(),
    folder: s.string(),
    content: s.optional(s.string()),
    image: s.optional(s.string()),
    title: s.optional(s.string()),
    type: s.enums(["text", "image", "link"]),
    tags: s.array(s.string()),
    pinned: s.boolean(),
    archived: s.boolean(),
  })
);

const IdeaBoxTagSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    icon: s.string(),
    color: s.string(),
    container: s.string(),
    count: s.number(),
  })
);

type IIdeaBoxContainer = s.Infer<typeof IdeaBoxContainerSchema>;
type IIdeaBoxFolder = s.Infer<typeof IdeaBoxFolderSchema>;
type IIdeaBoxEntry = s.Infer<typeof IdeaBoxEntrySchema>;
type IIdeaBoxTag = s.Infer<typeof IdeaBoxTagSchema>;

export {
  IdeaBoxContainerSchema,
  IdeaBoxFolderSchema,
  IdeaBoxEntrySchema,
  IdeaBoxTagSchema,
};
export type { IIdeaBoxContainer, IIdeaBoxFolder, IIdeaBoxEntry, IIdeaBoxTag };
