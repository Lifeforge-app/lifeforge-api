import { z } from "zod/v4";

const MovieEntrySchema = z.object({
  tmdb_id: z.number(),
  title: z.string(),
  original_title: z.string(),
  poster: z.string(),
  genres: z.array(z.string()),
  duration: z.number(),
  overview: z.string(),
  countries: z.array(z.string()),
  language: z.string(),
  release_date: z.string(),
  ticket_number: z.string().optional(),
  theatre_seat: z.string().optional(),
  theatre_location: z.string().optional(),
  theatre_showtime: z.string().optional(),
  theatre_number: z.string().optional(),
  is_watched: z.boolean(),
  calendar_record: z.string().optional(),
});

type IMovieEntry = z.infer<typeof MovieEntrySchema>;

export type { IMovieEntry };

export { MovieEntrySchema };
