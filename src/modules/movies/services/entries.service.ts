import { getAPIKey } from "@utils/getAPIKey";
import PocketBase from "pocketbase";
import { IMovieEntry } from "../typescript/movies_interfaces";

export const getAllEntries = async (pb: PocketBase) => {
  return await pb.collection("movies_entries").getFullList<IMovieEntry>({
    sort: "-created",
  });
};

export const createEntryFromTMDB = async (pb: PocketBase, id: number) => {
  const apiKey = await getAPIKey("tmdb", pb);
  if (!apiKey) {
    throw new Error("API key not found");
  }

  const url = `https://api.themoviedb.org/3/movie/${id}`;

  const existedData = await pb
    .collection("movies_entries")
    .getFirstListItem<IMovieEntry>(`tmdb_id = ${id}`)
    .catch(() => null);

  if (existedData) {
    throw new Error("Entry already exists");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }).then((res) => res.json());

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

  return await pb.collection("movies_entries").create<IMovieEntry>(entryData);
};

export const deleteEntry = async (pb: PocketBase, id: string) => {
  await pb.collection("movies_entries").delete(id);
};
