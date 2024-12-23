import express from "express";
import entriesRoutes from "./routes/entries.js";
import libgenRoutes from "./routes/libgen.js";
import categoriesRoutes from "./routes/categories.js";
import languagesRoutes from "./routes/languages.js";
import fileTypesRoutes from "./routes/fileTypes.js";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/languages", languagesRoutes);
router.use("/file-types", fileTypesRoutes);
router.use("/libgen", libgenRoutes);

export default router;
