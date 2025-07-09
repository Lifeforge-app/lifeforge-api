// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: movies
// Generated at: 2025-07-09T11:52:26.854Z
// Contains: movies__entries
import { z } from "zod/v4";

const MoviesEntriesSchema = z.object({
  tmdb_id: z.number(),
  title: z.string(),
  original_title: z.string(),
  poster: z.string(),
  genres: z.any(),
  duration: z.number(),
  overview: z.string(),
  countries: z.any(),
  language: z.string(),
  release_date: z.string(),
  watch_date: z.string(),
  ticket_number: z.string(),
  theatre_seat: z.string(),
  theatre_showtime: z.string(),
  theatre_location: z.string(),
  theatre_number: z.string(),
  is_watched: z.boolean(),
});

type IMoviesEntries = z.infer<typeof MoviesEntriesSchema>;

export { MoviesEntriesSchema };

export type { IMoviesEntries };
