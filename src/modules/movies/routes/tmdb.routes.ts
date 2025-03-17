import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as TMDBController from "../controllers/tmdb.controller";
import { searchMovieValidation } from "../middlewares/tmdbValidation";

const router = express.Router();

router.get(
  "/search",
  searchMovieValidation,
  validationMiddleware,
  TMDBController.searchMovies,
);

export default router;
