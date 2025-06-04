import express from "express";

import railwayMapRoutes from "./routes/railwayMap.routes";

const router = express.Router();

router.use("/", railwayMapRoutes);

export default router;
