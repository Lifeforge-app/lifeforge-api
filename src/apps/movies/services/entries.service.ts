import { getAPIKey } from "@functions/getAPIKey";
import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IMovieEntry } from "../typescript/movies_interfaces";

export const getAllEntries = async (
  pb: PocketBase,
  watched: boolean,
): Promise<{
  entries: WithPB<IMovieEntry>[];
  total: number;
}> => {
  const entries = await pb
    .collection("movies__entries")
    .getFullList<WithPB<IMovieEntry>>({
      filter: `is_watched = ${watched}`,
    });

  const total = (
    await pb.collection("movies__entries").getList<WithPB<IMovieEntry>>(1, 1)
  ).totalItems;

  return {
    total,
    entries: entries.sort((a, b) => {
      if (a.is_watched !== b.is_watched) {
        return a.is_watched ? 1 : -1; // Unwatched entries come first
      }

      if (a.theatre_showtime && b.theatre_showtime) {
        return (
          new Date(b.theatre_showtime).getTime() -
          new Date(a.theatre_showtime).getTime()
        );
      }

      return a.title.localeCompare(b.title);
    }),
  };
};

export const createEntryFromTMDB = async (
  pb: PocketBase,
  id: string,
): Promise<WithPB<IMovieEntry>> => {
  const apiKey = await getAPIKey("tmdb", pb);
  if (!apiKey) {
    throw new Error("API key not found");
  }

  const existedData = await pb
    .collection("movies__entries")
    .getFirstListItem<WithPB<IMovieEntry>>(`tmdb_id = ${id}`)
    .catch(() => null);

  if (existedData) {
    throw new Error("Entry already exists");
  }

  const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((res) => res.json())
    .catch((err) => {
      throw new Error(`Failed to fetch data from TMDB: ${err.message}`);
    });

  const entryData = {
    tmdb_id: response.id,
    title: response.title,
    original_title: response.original_title,
    poster: response.poster_path,
    genres: response.genres.map((genre: { name: string }) => genre.name),
    duration: response.runtime,
    overview: response.overview,
    release_date: response.release_date,
    countries: response.origin_country,
    language: response.original_language,
  };

  return await pb
    .collection("movies__entries")
    .create<WithPB<IMovieEntry>>(entryData);
};

export const deleteEntry = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("movies__entries").delete(id);
};

export const toggleWatchStatus = async (
  pb: PocketBase,
  id: string,
): Promise<WithPB<IMovieEntry>> => {
  const entry = await pb
    .collection("movies__entries")
    .getOne<WithPB<IMovieEntry>>(id);

  const updatedEntry = await pb
    .collection("movies__entries")
    .update<WithPB<IMovieEntry>>(id, {
      is_watched: !entry.is_watched,
    });

  return updatedEntry;
};
