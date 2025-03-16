import express from "express";
import categoriesRoutes from "./categories";
import entriesRoutes from "./entries";
import fileTypesRoutes from "./fileTypes";
import languagesRoutes from "./languages";
import libgenRoutes from "./libgen";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/languages", languagesRoutes);
router.use("/file-types", fileTypesRoutes);
router.use("/libgen", libgenRoutes);

export default router;
