import { z } from "zod";

const YoutubeInfoSchema = z.object({
  title: z.string(),
  uploadDate: z.string(),
  uploader: z.string(),
  uploaderUrl: z.string().optional(),
  duration: z.string(),
  viewCount: z.number(),
  likeCount: z.number(),
  thumbnail: z.string(),
  captions: z.record(z.any()).optional(),
  auto_captions: z.record(z.any()).optional(),
});

type IYoutubeInfo = z.infer<typeof YoutubeInfoSchema>;

export { YoutubeInfoSchema };

export type { IYoutubeInfo };
