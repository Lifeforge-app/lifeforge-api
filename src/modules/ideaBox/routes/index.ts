import express from "express";

import containers from "./containers";
import folders from "./folders";
import ideas from "./ideas";
import miscRoutes from "./misc";
import tags from "./tags";

const router = express.Router();

router.use("/containers", containers);
router.use("/folders", folders);
router.use("/ideas", ideas);
router.use("/tags", tags);
router.use("/", miscRoutes);

export default router;
