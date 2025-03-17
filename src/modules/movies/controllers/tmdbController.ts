import { Request, Response } from "express";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import * as TMDBService from "../services/tmdbService";

export const searchMovies = async (req: Request, res: Response) => {
  const { q, page } = req.query as { q: string; page: string };

  try {
    const response = await TMDBService.searchMovies(req.pb, q, page);
    successWithBaseResponse(res, response);
  } catch {
    serverError(res, "Failed to search movies");
  }
};
