import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBlogEntry } from "../typescript/blog_interfaces";

export const getAllEntries = (pb: PocketBase): Promise<WithPB<IBlogEntry>[]> =>
  pb.collection("blog_entries").getFullList<WithPB<IBlogEntry>>();
