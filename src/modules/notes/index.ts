import express from "express";
import entriesRoutes from "./routes/entries.js";
import subjectRoutes from "./routes/subjects.js";
import workspaceRoutes from "./routes/workspaces.js";

const router = express.Router();

router.use("/workspace", workspaceRoutes);
router.use("/subject", subjectRoutes);
router.use("/entries", entriesRoutes);

export default router;
