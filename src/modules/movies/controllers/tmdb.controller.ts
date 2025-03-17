import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as TMDBService from "../services/tmdb.service";

export const searchMovies = async (req: Request, res: Response) => {
  const { q, page } = req.query as { q: string; page: string };

  const response = await TMDBService.searchMovies(req.pb, q, page);
  successWithBaseResponse(res, response);
};
