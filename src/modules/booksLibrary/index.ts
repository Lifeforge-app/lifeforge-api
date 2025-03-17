import express from "express";
import categoriesRoutes from "./routes/categories";
import entriesRoutes from "./routes/entries";
import fileTypesRoutes from "./routes/fileTypes";
import languagesRoutes from "./routes/languages";
import libgenRoutes from "./routes/libgen";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/languages", languagesRoutes);
router.use("/file-types", fileTypesRoutes);
router.use("/libgen", libgenRoutes);

export default router;
