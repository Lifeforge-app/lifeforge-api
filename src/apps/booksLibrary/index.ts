import express from "express";

import categoriesRoutes from "./routes/categories.routes";
import entriesRoutes from "./routes/entries.routes";
import fileTypesRoutes from "./routes/fileTypes.routes";
import languagesRoutes from "./routes/languages.routes";
import libgenRoutes from "./routes/libgen.routes";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/languages", languagesRoutes);
router.use("/file-types", fileTypesRoutes);
router.use("/libgen", libgenRoutes);

export default router;
