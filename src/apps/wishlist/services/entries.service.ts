import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { getAPIKey } from "@utils/getAPIKey";

import scrapeProviders from "../helpers/scrapers/index";
import { IWishlistEntry } from "../typescript/wishlist_interfaces";

export const getCollectionId = (pb: PocketBase): string =>
  pb.collection("wishlist_entries").collectionIdOrName;

export const getEntriesByListId = (
  pb: PocketBase,
  listId: string,
  bought?: boolean,
): Promise<WithPB<IWishlistEntry>[]> =>
  pb.collection("wishlist_entries").getFullList<WithPB<IWishlistEntry>>({
    filter: `list = "${listId}" ${
      typeof bought !== "undefined" ? `&& bought = ${bought}` : ""
    }`,
  });

export const scrapeExternal = async (
  pb: PocketBase,
  provider: string,
  url: string,
): Promise<{
  name: string;
  price: number;
  image?: string;
}> => {
  const apiKey = await getAPIKey("groq", pb);

  if (!apiKey) {
    throw new Error("No API key found");
  }

  const result = await scrapeProviders[
    provider as keyof typeof scrapeProviders
  ]?.(url, apiKey);

  if (!result) {
    throw new Error("Error scraping provider");
  }

  return result;
};

export const createEntry = async (
  pb: PocketBase,
  data: Omit<IWishlistEntry, "image"> & { image?: File },
): Promise<WithPB<IWishlistEntry>> => {
  const entry = await pb
    .collection("wishlist_entries")
    .create<WithPB<IWishlistEntry>>(data);

  return entry;
};

export const updateEntry = async (
  pb: PocketBase,
  id: string,
  data: {
    list: string;
    name: string;
    url: string;
    price: number;
    image?: File | null;
  },
): Promise<WithPB<IWishlistEntry>> => {
  const entry = await pb
    .collection("wishlist_entries")
    .update<WithPB<IWishlistEntry>>(id, data);

  return entry;
};

export const getEntry = async (
  pb: PocketBase,
  id: string,
): Promise<WithPB<IWishlistEntry>> => {
  return await pb
    .collection("wishlist_entries")
    .getOne<WithPB<IWishlistEntry>>(id);
};

export const updateEntryBoughtStatus = async (
  pb: PocketBase,
  id: string,
): Promise<WithPB<IWishlistEntry>> => {
  const oldEntry = await pb
    .collection("wishlist_entries")
    .getOne<WithPB<IWishlistEntry>>(id);

  const entry = await pb
    .collection("wishlist_entries")
    .update<WithPB<IWishlistEntry>>(id, {
      bought: !oldEntry.bought,
      bought_at: oldEntry.bought ? null : new Date().toISOString(),
    });

  return entry;
};

export const deleteEntry = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("wishlist_entries").delete(id);
};
