import { getAPIKey } from "@functions/getAPIKey";
import Pocketbase from "pocketbase";

export const searchMovies = async (pb: Pocketbase, q: string, page: number) => {
  const apiKey = await getAPIKey("tmdb", pb);

  if (!apiKey) {
    throw new Error("API key not found");
  }

  const url = `https://api.themoviedb.org/3/search/movie?query=${decodeURIComponent(
    q,
  )}&page=${page}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }).then((res) => res.json());

  return response;
};
