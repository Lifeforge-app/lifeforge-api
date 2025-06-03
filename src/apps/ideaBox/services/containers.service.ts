import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IIdeaBoxContainer } from "../typescript/ideabox_interfaces";

export const checkContainerExists = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> =>
  !!(await pb
    .collection("idea_box_containers")
    .getOne(id)
    .catch(() => {}));

export const getContainers = async (
  pb: PocketBase,
): Promise<WithPB<IIdeaBoxContainer>[]> =>
  pb.collection("idea_box_containers").getFullList<WithPB<IIdeaBoxContainer>>();

export const createContainer = async (
  pb: PocketBase,
  name: string,
  color: string,
  icon: string,
  coverFile?: File,
): Promise<WithPB<IIdeaBoxContainer>> => {
  const containerData: Pick<IIdeaBoxContainer, "name" | "color" | "icon"> & {
    cover?: File | string;
  } = {
    name,
    color,
    icon,
  };

  if (coverFile) {
    containerData.cover = coverFile;
  } else {
    containerData.cover = "";
  }

  return await pb
    .collection("idea_box_containers")
    .create<WithPB<IIdeaBoxContainer>>(containerData);
};

export const updateContainer = async (
  pb: PocketBase,
  id: string,
  name: string,
  color: string,
  icon: string,
  coverFile?: File | "keep",
): Promise<WithPB<IIdeaBoxContainer>> => {
  const containerData: Pick<IIdeaBoxContainer, "name" | "color" | "icon"> & {
    cover?: File | string;
  } = {
    name,
    color,
    icon,
  };

  if (coverFile !== "keep") {
    containerData.cover = coverFile ?? "";
  }

  return await pb
    .collection("idea_box_containers")
    .update<WithPB<IIdeaBoxContainer>>(id, containerData);
};

export const deleteContainer = async (pb: PocketBase, id: string) => {
  await pb.collection("idea_box_containers").delete(id);
};
