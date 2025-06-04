import express from "express";

import * as RailwayMapController from "../controllers/railwayMap.controller";

const router = express.Router();

router.get("/lines", RailwayMapController.getLines);

router.get("/stations", RailwayMapController.getStations);

router.get("/shortest", RailwayMapController.getShortestPath);

export default router;
