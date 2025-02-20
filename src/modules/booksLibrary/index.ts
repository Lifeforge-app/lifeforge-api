import express from "express";
import entriesRoutes from "./routes/entries";
import libgenRoutes from "./routes/libgen";
import categoriesRoutes from "./routes/categories";
import languagesRoutes from "./routes/languages";
import fileTypesRoutes from "./routes/fileTypes";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/languages", languagesRoutes);
router.use("/file-types", fileTypesRoutes);
router.use("/libgen", libgenRoutes);

export default router;
