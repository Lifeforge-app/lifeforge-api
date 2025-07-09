/**
 * This file is auto-generated. DO NOT EDIT IT MANUALLY.
 * If you want to add custom schemas, you will find a dedicated space at the end of this file.
 * Generated for module: movies
 * Generated at: 2025-07-09T12:50:41.284Z
 * Contains: movies__entries
 */
import { z } from "zod/v4";

const MoviesEntrySchema = z.object({
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

type IMoviesEntry = z.infer<typeof MoviesEntrySchema>;

export { MoviesEntrySchema };

export type { IMoviesEntry };

// -------------------- CUSTOM SCHEMAS --------------------

// Add your custom schemas here. They will not be overwritten by this script.
