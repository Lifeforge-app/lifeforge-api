import express from "express";

import booksLibraryCategoriesRouter from "./controllers/categories.controller";
import booksLibraryEntriesRouter from "./controllers/entries.controller";
import booksLibraryFileTypesRouter from "./controllers/fileTypes.controller";
import booksLibraryLanguagesRouter from "./controllers/languages.controller";
import booksLibraryLibgenRouter from "./controllers/libgen.controller";

const router = express.Router();

router.use("/entries", booksLibraryEntriesRouter);
router.use("/categories", booksLibraryCategoriesRouter);
router.use("/languages", booksLibraryLanguagesRouter);
router.use("/file-types", booksLibraryFileTypesRouter);
router.use("/libgen", booksLibraryLibgenRouter);

export default router;
