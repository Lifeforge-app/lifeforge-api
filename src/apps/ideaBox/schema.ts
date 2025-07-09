// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: ideaBox
// Generated at: 2025-07-09T11:52:26.854Z
// Contains: idea_box__containers, idea_box__entries, idea_box__folders, idea_box__tags, idea_box__tags_aggregated, idea_box__containers_aggregated
import { z } from "zod/v4";

const IdeaBoxContainersSchema = z.object({
  icon: z.string(),
  color: z.string(),
  name: z.string(),
  cover: z.string(),
});

const IdeaBoxEntriesSchema = z.object({
  type: z.enum(["text", "image", "link"]),
  image: z.string(),
  title: z.string(),
  content: z.string(),
  container: z.string(),
  folder: z.string(),
  pinned: z.boolean(),
  archived: z.boolean(),
  tags: z.any(),
});

const IdeaBoxFoldersSchema = z.object({
  container: z.string(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  parent: z.string(),
});

const IdeaBoxTagsSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  container: z.string(),
});

const IdeaBoxTagsAggregatedSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  container: z.string(),
  amount: z.number(),
});

const IdeaBoxContainersAggregatedSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  cover: z.string(),
  text_count: z.number(),
  link_count: z.number(),
  image_count: z.number(),
});

type IIdeaBoxContainers = z.infer<typeof IdeaBoxContainersSchema>;
type IIdeaBoxEntries = z.infer<typeof IdeaBoxEntriesSchema>;
type IIdeaBoxFolders = z.infer<typeof IdeaBoxFoldersSchema>;
type IIdeaBoxTags = z.infer<typeof IdeaBoxTagsSchema>;
type IIdeaBoxTagsAggregated = z.infer<typeof IdeaBoxTagsAggregatedSchema>;
type IIdeaBoxContainersAggregated = z.infer<
  typeof IdeaBoxContainersAggregatedSchema
>;

export {
  IdeaBoxContainersSchema,
  IdeaBoxEntriesSchema,
  IdeaBoxFoldersSchema,
  IdeaBoxTagsSchema,
  IdeaBoxTagsAggregatedSchema,
  IdeaBoxContainersAggregatedSchema,
};

export type {
  IIdeaBoxContainers,
  IIdeaBoxEntries,
  IIdeaBoxFolders,
  IIdeaBoxTags,
  IIdeaBoxTagsAggregated,
  IIdeaBoxContainersAggregated,
};
