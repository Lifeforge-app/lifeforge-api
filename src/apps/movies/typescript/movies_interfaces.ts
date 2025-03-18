import * as s from "superstruct";
import { BasePBCollectionSchema } from "../../../core/typescript/pocketbase_interfaces";

const MovieEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    tmdb_id: s.number(),
    title: s.string(),
    original_title: s.string(),
    poster: s.string(),
    genres: s.array(s.string()),
    duration: s.number(),
    overview: s.string(),
    countries: s.array(s.string()),
    language: s.string(),
    release_date: s.string(),
    watch_date: s.string(),
    ticket_number: s.optional(s.string()),
    theatre_seat: s.optional(s.string()),
    theatre_location: s.optional(s.string()),
    theatre_showtime: s.optional(s.string()),
    theatre_number: s.optional(s.string()),
  }),
);

type IMovieEntry = s.Infer<typeof MovieEntrySchema>;

export { MovieEntrySchema };
export type { IMovieEntry };
