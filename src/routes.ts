import express from "express";
import { createLazyRouter } from "express-lazy-router";

const lazyLoad = createLazyRouter();
const router = express.Router();

// Routes mapping object - path to module mapping
const routes = {
  "/locales": "./modules/locales",
  "/user": "./modules/user",
  "/api-keys": "./modules/apiKeys",
  "/projects-m": "./modules/projectsM",
  "/todo-list": "./modules/todoList",
  "/calendar": "./modules/calendar",
  "/idea-box": "./modules/ideaBox",
  "/code-time": "./modules/codeTime",
  "/notes": "./modules/notes",
  "/books-library": "./modules/booksLibrary",
  "/flashcards": "./modules/flashcards",
  "/journal": "./modules/journal",
  "/achievements": "./modules/achievements",
  "/wallet": "./modules/wallet",
  "/wishlist": "./modules/wishlist",
  "/spotify": "./modules/spotify",
  "/photos": "./modules/photos",
  "/music": "./modules/music",
  "/guitar-tabs": "./modules/guitarTabs",
  "/youtube-videos": "./modules/youtubeVideos",
  "/repositories": "./modules/repositories",
  "/passwords": "./modules/passwords",
  "/airports": "./modules/airports",
  "/changi": "./modules/changi",
  "/mail-inbox": "./modules/mailInbox",
  "/dns-records": "./modules/dnsRecords",
  "/sudoku": "./modules/sudoku",
  "/server": "./modules/server",
  "/pixabay": "./modules/pixabay",
  "/quotes": "./modules/quotes",
  "/virtual-wardrobe": "./modules/virtualWardrobe",
  "/moment-vault": "./modules/momentVault/routes",
  "/movies": "./modules/movies",
  "/railway-map": "./modules/railwayMap",
  "/locations": "./modules/locations",
};

// Register all routes using the mapping
Object.entries(routes).forEach(([path, module]) => {
  router.use(
    path,
    lazyLoad(() => import(module)),
  );
});

export default router;
