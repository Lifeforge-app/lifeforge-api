import PocketBase from "pocketbase";
import { getAPIKey } from "../../../utils/getAPIKey";

export const getAllEntries = async (pb: PocketBase) => {
  try {
    return await pb.collection("movies_entries").getFullList({
      sort: "-created",
    });
  } catch (error) {
    throw error;
  }
};

export const createEntryFromTMDB = async (pb: PocketBase, id: number) => {
  try {
    const apiKey = await getAPIKey("tmdb", pb);
    if (!apiKey) {
      throw new Error("API key not found");
    }

    const url = `https://api.themoviedb.org/3/movie/${id}`;

    const existedData = await pb
      .collection("movies_entries")
      .getFirstListItem(`tmdb_id = ${id}`)
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

    return await pb.collection("movies_entries").create(entryData);
  } catch (error) {
    throw error;
  }
};

export const deleteEntry = async (pb: PocketBase, id: string) => {
  try {
    await pb.collection("movies_entries").delete(id);
  } catch (error) {
    throw error;
  }
};
