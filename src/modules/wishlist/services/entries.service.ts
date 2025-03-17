import { getAPIKey } from "@utils/getAPIKey";
import PocketBase from "pocketbase";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import scrapeProviders from "../helpers/scrapers/index";
import { IWishlistEntry } from "../typescript/wishlist_interfaces";

export const getCollectionId = async (pb: PocketBase): Promise<string> => {
  try {
    return pb.collection("wishlist_entries").collectionIdOrName;
  } catch (error) {
    throw error;
  }
};

export const getEntriesByListId = async (
  pb: PocketBase,
  listId: string,
  bought?: boolean,
): Promise<IWishlistEntry[]> => {
  try {
    const filter = `list = "${listId}" ${
      typeof bought !== "undefined" ? `&& bought = ${bought}` : ""
    }`;

    const result = await pb
      .collection("wishlist_entries")
      .getFullList<IWishlistEntry>({
        filter,
      });

    return result;
  } catch (error) {
    throw error;
  }
};

export const scrapeExternal = async (
  pb: PocketBase,
  provider: string,
  url: string,
) => {
  const apiKey = await getAPIKey("groq", pb);

  if (!apiKey) {
    throw new Error("No API key found");
  }

  try {
    return await scrapeProviders[provider as keyof typeof scrapeProviders]?.(
      url,
      apiKey,
    );
  } catch (error) {
    throw error;
  }
};

export const createEntry = async (
  pb: PocketBase,
  data: Omit<WithoutPBDefault<IWishlistEntry>, "image"> & { image?: File },
): Promise<IWishlistEntry> => {
  try {
    const entry = await pb
      .collection("wishlist_entries")
      .create<IWishlistEntry>(data);

    await pb.collection("wishlist_lists").update(data.list, {
      "item_count+": 1,
      "total_amount+": entry.price,
    });

    return entry;
  } catch (error) {
    throw error;
  }
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
): Promise<IWishlistEntry> => {
  try {
    const oldEntry = await pb
      .collection("wishlist_entries")
      .getOne<IWishlistEntry>(id);

    const entry = await pb
      .collection("wishlist_entries")
      .update<IWishlistEntry>(id, data);

    if (oldEntry.list !== data.list) {
      await pb
        .collection("wishlist_lists")
        .update<IWishlistEntry>(oldEntry.list, {
          "item_count-": 1,
          "total_amount-": oldEntry.price,
          "bought_count-": oldEntry.bought ? 1 : 0,
        });

      await pb.collection("wishlist_lists").update<IWishlistEntry>(data.list, {
        "item_count+": 1,
        "total_amount+": entry.price,
        "bought_count+": entry.bought ? 1 : 0,
      });
    } else {
      await pb.collection("wishlist_lists").update<IWishlistEntry>(entry.list, {
        "total_amount+": entry.price - oldEntry.price,
      });
    }

    return entry;
  } catch (error) {
    throw error;
  }
};

export const getEntry = async (
  pb: PocketBase,
  id: string,
): Promise<IWishlistEntry> => {
  try {
    return await pb.collection("wishlist_entries").getOne<IWishlistEntry>(id);
  } catch (error) {
    throw error;
  }
};

export const updateEntryBoughtStatus = async (
  pb: PocketBase,
  id: string,
): Promise<IWishlistEntry> => {
  try {
    const oldEntry = await pb
      .collection("wishlist_entries")
      .getOne<IWishlistEntry>(id);

    const entry = await pb
      .collection("wishlist_entries")
      .update<IWishlistEntry>(id, {
        bought: !oldEntry.bought,
        bought_at: oldEntry.bought ? null : new Date().toISOString(),
      });

    await pb.collection("wishlist_lists").update<IWishlistEntry>(entry.list, {
      "bought_count+": oldEntry.bought ? -1 : 1,
    });

    return entry;
  } catch (error) {
    throw error;
  }
};

export const deleteEntry = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  try {
    const entry = await pb
      .collection("wishlist_entries")
      .getOne<IWishlistEntry>(id);

    await pb.collection("wishlist_entries").delete(id);

    await pb.collection("wishlist_lists").update<IWishlistEntry>(entry.list, {
      "item_count-": 1,
      "total_amount-": entry.price,
      "bought_count-": entry.bought ? 1 : 0,
    });
  } catch (error) {
    throw error;
  }
};
