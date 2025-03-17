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
  try {
    return await pb
      .collection("idea_box_containers")
      .getFullList<IIdeaBoxContainer>();
  } catch (error) {
    throw error;
  }
};

export const createContainer = async (
  pb: PocketBase,
  name: string,
  color: string,
  icon: string,
  coverFile?: File,
): Promise<IIdeaBoxContainer> => {
  try {
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
  } catch (error) {
    throw error;
  }
};

export const updateContainer = async (
  pb: PocketBase,
  id: string,
  name: string,
  color: string,
  icon: string,
  coverFile?: File,
): Promise<IIdeaBoxContainer> => {
  try {
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
  } catch (error) {
    throw error;
  }
};

export const updateContainerKeepCover = async (
  pb: PocketBase,
  id: string,
  name: string,
  color: string,
  icon: string,
): Promise<IIdeaBoxContainer> => {
  try {
    return await pb
      .collection("idea_box_containers")
      .update<IIdeaBoxContainer>(id, {
        name,
        color,
        icon,
      });
  } catch (error) {
    throw error;
  }
};

export const deleteContainer = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  try {
    await pb.collection("idea_box_containers").delete(id);
  } catch (error) {
    throw error;
  }
};
