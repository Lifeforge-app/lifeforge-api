import express from "express";

import localesRoutes from "./routes/locales.routes";
import localesManagerRoutes from "./routes/localesManager.routes";

const router = express.Router();

router.use("/manager", localesManagerRoutes);
router.use("/", localesRoutes);

export default router;
