import express from "express";

import * as TMDBController from "../controllers/tmdb.controller";

const router = express.Router();

router.get("/search", TMDBController.searchMovies);

export default router;
