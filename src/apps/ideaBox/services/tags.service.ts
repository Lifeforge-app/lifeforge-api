import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IIdeaBoxTag } from "../schema";

export const getTags = (
  pb: PocketBase,
  container: string,
): Promise<WithPB<IIdeaBoxTag>[]> =>
  pb.collection("idea_box__tags_aggregated").getFullList<WithPB<IIdeaBoxTag>>({
    filter: `container = "${container}"`,
  });

export const createTag = (
  pb: PocketBase,
  container: string,
  {
    name,
    icon,
    color,
  }: {
    name: string;
    icon: string;
    color: string;
  },
) =>
  pb.collection("idea_box__tags").create<WithPB<IIdeaBoxTag>>({
    name,
    icon,
    color,
    container,
  });

export const updateTag = (
  pb: PocketBase,
  id: string,
  {
    name,
    icon,
    color,
  }: {
    name: string;
    icon: string;
    color: string;
  },
): Promise<WithPB<IIdeaBoxTag>> =>
  pb.collection("idea_box__tags").update(id, {
    name,
    icon,
    color,
  });

export const deleteTag = async (pb: PocketBase, id: string) => {
  await pb.collection("idea_box__tags").delete(id);
};
