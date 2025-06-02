import PocketBase from "pocketbase";

import { IIdeaBoxTag } from "../typescript/ideabox_interfaces";

export const getTags = async (pb: PocketBase, container: string): Promise => {
  const result = await pb.collection("idea_box_tags").getFullList<IIdeaBoxTag>({
    filter: `container = "${container}"`,
  });
  return result;
};

export const createTag = async (
  pb: PocketBase,
  name: string,
  icon: string,
  color: string,
  container: string,
): Promise => {
  const tag: IIdeaBoxTag = await pb.collection("idea_box_tags").create({
    name,
    icon,
    color,
    container,
    count: 0,
  });
  return tag;
};

export const updateTag = async (
  pb: PocketBase,
  id: string,
  name: string,
  icon: string,
  color: string,
): Promise => {
  const tag: IIdeaBoxTag = await pb.collection("idea_box_tags").update(id, {
    name,
    icon,
    color,
  });
  return tag;
};

export const deleteTag = async (pb: PocketBase, id: string): Promise => {
  await pb.collection("idea_box_tags").delete(id);
};
