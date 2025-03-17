import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as TMDBController from "../controllers/tmdbController";
import { searchMovieValidation } from "../middlewares/tmdbValidation";

const router = express.Router();

router.get(
  "/search",
  searchMovieValidation,
  validationMiddleware,
  TMDBController.searchMovies,
);

export default router;
