import Pocketbase from "pocketbase";
import { getAPIKey } from "../../../utils/getAPIKey";

export const searchMovies = async (pb: Pocketbase, q: string, page: string) => {
  const apiKey = await getAPIKey("tmdb", pb);

  if (!apiKey) {
    throw new Error("API key not found");
  }

  const url = `https://api.themoviedb.org/3/search/movie?query=${decodeURIComponent(q)}&page=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }).then((res) => res.json());

    return response;
  } catch (error) {
    throw error;
  }
};
