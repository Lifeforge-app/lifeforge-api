import PocketBase from "pocketbase";
import { IIdeaBoxContainer } from "../typescript/ideabox_interfaces";

export const checkContainerExists = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  try {
    await pb.collection("idea_box_containers").getOne(id);
    return true;
  } catch (error) {
    return false;
  }
};

export const getContainers = async (
  pb: PocketBase,
): Promise<IIdeaBoxContainer[]> => {
  return await pb
    .collection("idea_box_containers")
    .getFullList<IIdeaBoxContainer>();
};

export const createContainer = async (
  pb: PocketBase,
  name: string,
  color: string,
  icon: string,
  coverFile?: File,
): Promise<IIdeaBoxContainer> => {
  const containerData: Record<string, any> = {
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
    .create<IIdeaBoxContainer>(containerData);
};

export const updateContainer = async (
  pb: PocketBase,
  id: string,
  name: string,
  color: string,
  icon: string,
  coverFile?: File,
): Promise<IIdeaBoxContainer> => {
  const containerData: Record<string, any> = {
    name,
    color,
    icon,
  };

  if (coverFile !== undefined) {
    containerData.cover = coverFile || "";
  } else {
    containerData.cover = "";
  }

  return await pb
    .collection("idea_box_containers")
    .update<IIdeaBoxContainer>(id, containerData);
};

export const updateContainerKeepCover = async (
  pb: PocketBase,
  id: string,
  name: string,
  color: string,
  icon: string,
): Promise<IIdeaBoxContainer> => {
  return await pb
    .collection("idea_box_containers")
    .update<IIdeaBoxContainer>(id, {
      name,
      color,
      icon,
    });
};

export const deleteContainer = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("idea_box_containers").delete(id);
};
