import { Request, Response } from "express";

import { successWithBaseResponse } from "@utils/response";

import * as TMDBService from "../services/tmdb.service";

export const searchMovies = async (req, res) => {
  const { q, page } = req.query as { q: string; page: string };

  const response = await TMDBService.searchMovies(req.pb, q, page);
  successWithBaseResponse(res, response);
};
