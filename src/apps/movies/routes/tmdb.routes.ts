import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as TMDBController from "../controllers/tmdb.controller";
import { searchMovieValidation } from "../middlewares/tmdbValidation";

const router = express.Router();

router.get(
  "/search",
  searchMovieValidation,
  asyncWrapper(TMDBController.searchMovies),
);

export default router;
