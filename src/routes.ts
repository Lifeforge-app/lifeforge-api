import express from "express";
import { createLazyRouter } from "express-lazy-router";

const lazyLoad = createLazyRouter();

const localesRoutes = lazyLoad(() => import("./modules/locales"));
const userRoutes = lazyLoad(() => import("./modules/user"));
const projectsMRoutes = lazyLoad(() => import("./modules/projectsM"));
const todoListRoutes = lazyLoad(() => import("./modules/todoList"));
const calendarRoutes = lazyLoad(() => import("./modules/calendar/routes"));
const ideaBoxRoutes = lazyLoad(() => import("./modules/ideaBox"));
const codeTimeRoutes = lazyLoad(() => import("./modules/codeTime"));
const booksLibraryRoutes = lazyLoad(
  () => import("./modules/booksLibrary/routes")
);
const notesRoutes = lazyLoad(() => import("./modules/notes"));
const flashcardsRoutes = lazyLoad(() => import("./modules/flashcards"));
const achievementsRoutes = lazyLoad(
  () => import("./modules/achievements/routes")
);
const spotifyRoutes = lazyLoad(() => import("./modules/spotify"));
const photosRoutes = lazyLoad(() => import("./modules/photos"));
const musicRoutes = lazyLoad(() => import("./modules/music"));
const guitarTabsRoutes = lazyLoad(() => import("./modules/guitarTabs"));
const repositoriesRoutes = lazyLoad(() => import("./modules/repositories"));
const passwordsRoutes = lazyLoad(() => import("./modules/passwords"));
const airportsRoutes = lazyLoad(() => import("./modules/airports"));
const changiRoutes = lazyLoad(() => import("./modules/changi"));
const journalRoutes = lazyLoad(() => import("./modules/journal"));
const serverRoutes = lazyLoad(() => import("./modules/server"));
const DNSRecordsRoutes = lazyLoad(() => import("./modules/dnsRecords"));
const mailInboxRoutes = lazyLoad(() => import("./modules/mailInbox"));
const walletRoutes = lazyLoad(() => import("./modules/wallet/routes"));
const wishlistRoutes = lazyLoad(() => import("./modules/wishlist"));
const youtubeVideosRoutes = lazyLoad(() => import("./modules/youtubeVideos"));
const apiKeysRoutes = lazyLoad(() => import("./modules/apiKeys"));
const pixabayRoutes = lazyLoad(() => import("./modules/pixabay"));
const quotesRoutes = lazyLoad(() => import("./modules/quotes"));
const sudokuRoutes = lazyLoad(() => import("./modules/sudoku"));
const openAIAPIPricingRoutes = lazyLoad(
  () => import("./modules/openAIAPIPricing")
);
const virtualWardrobeRoutes = lazyLoad(
  () => import("./modules/virtualWardrobe")
);
const momentVaultRoutes = lazyLoad(
  () => import("./modules/momentVault/routes")
);
const moviesRoutes = lazyLoad(() => import("./modules/movies"));
const railwayMapRoutes = lazyLoad(() => import("./modules/railwayMap"));

const router = express.Router();

router.use("/locales", localesRoutes);
router.use("/user", userRoutes);
router.use("/api-keys", apiKeysRoutes);
router.use("/projects-m", projectsMRoutes);
router.use("/todo-list", todoListRoutes);
router.use("/calendar", calendarRoutes);
router.use("/idea-box", ideaBoxRoutes);
router.use("/code-time", codeTimeRoutes);
router.use("/notes", notesRoutes);
router.use("/books-library", booksLibraryRoutes);
router.use("/flashcards", flashcardsRoutes);
router.use("/journal", journalRoutes);
router.use("/achievements", achievementsRoutes);
router.use("/wallet", walletRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/spotify", spotifyRoutes);
router.use("/photos", photosRoutes);
router.use("/music", musicRoutes);
router.use("/guitar-tabs", guitarTabsRoutes);
router.use("/youtube-videos", youtubeVideosRoutes);
router.use("/repositories", repositoriesRoutes);
router.use("/passwords", passwordsRoutes);
router.use("/airports", airportsRoutes);
router.use("/changi", changiRoutes);
router.use("/mail-inbox", mailInboxRoutes);
router.use("/dns-records", DNSRecordsRoutes);
router.use("/sudoku", sudokuRoutes);
router.use("/server", serverRoutes);
router.use("/pixabay", pixabayRoutes);
router.use("/quotes", quotesRoutes);
router.use("/openai-api-pricing", openAIAPIPricingRoutes);
router.use("/virtual-wardrobe", virtualWardrobeRoutes);
router.use("/moment-vault", momentVaultRoutes);
router.use("/movies", moviesRoutes);
router.use("/railway-map", railwayMapRoutes);

export default router;
