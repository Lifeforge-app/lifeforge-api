import type BasePBCollection from "@typescript/pocketbase_interfaces.js";

interface IGuitarTabsEntry extends BasePBCollection {
  name: string;
  author: string;
  thumbnail: string;
  pageCount: number;
  pdf: string;
  audio: string;
  musescore: string;
  type: "fingerstyle" | "singalong" | "";
  isFavourite: boolean;
}

interface IGuitarTabsAuthors extends BasePBCollection {
  name: string;
  amount: number;
}

interface IGuitarTabsSidebarData {
  total: number;
  favourites: number;
  categories: {
    fingerstyle: number;
    singalong: number;
    uncategorized: number;
  };
  authors: Record<string, number>;
}

export { IGuitarTabsAuthors, IGuitarTabsEntry, IGuitarTabsSidebarData };
