import { z } from "zod/v4";

const MusicEntrySchema = z.object({
  name: z.string(),
  author: z.string(),
  duration: z.string(),
  file: z.string(),
  is_favourite: z.boolean(),
});

const YoutubeDataSchema = z.object({
  title: z.string(),
  uploadDate: z.string(),
  uploader: z.string(),
  uploaderUrl: z.string().optional(),
  duration: z.string(),
  viewCount: z.number(),
  likeCount: z.number(),
  thumbnail: z.string(),
});

type IMusicEntry = z.infer<typeof MusicEntrySchema>;
type IYoutubeData = z.infer<typeof YoutubeDataSchema>;

export type { IMusicEntry, IYoutubeData };

export { MusicEntrySchema, YoutubeDataSchema };
