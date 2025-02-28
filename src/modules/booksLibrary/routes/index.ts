import express from "express";
import entriesRoutes from "./entries";
import libgenRoutes from "./libgen";
import categoriesRoutes from "./categories";
import languagesRoutes from "./languages";
import fileTypesRoutes from "./fileTypes";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/languages", languagesRoutes);
router.use("/file-types", fileTypesRoutes);
router.use("/libgen", libgenRoutes);

export default router;
