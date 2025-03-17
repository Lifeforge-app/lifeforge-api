import PocketBase from "pocketbase";
import { IIdeaBoxFolder } from "../typescript/ideabox_interfaces";

export const getFolders = async (
  pb: PocketBase,
  container: string,
  lastFolder: string,
): Promise<IIdeaBoxFolder[]> => {
  const result = await pb
    .collection("idea_box_folders")
    .getFullList<IIdeaBoxFolder>({
      filter: `container = "${container}" && parent = "${lastFolder}"`,
      sort: "name",
    });
  return result;
};

export const createFolder = async (
  pb: PocketBase,
  name: string,
  container: string,
  parent: string,
  icon: string,
  color: string,
): Promise<IIdeaBoxFolder> => {
  const folder: IIdeaBoxFolder = await pb
    .collection("idea_box_folders")
    .create({
      name,
      container,
      parent,
      icon,
      color,
    });
  return folder;
};

export const updateFolder = async (
  pb: PocketBase,
  id: string,
  name: string,
  icon: string,
  color: string,
): Promise<IIdeaBoxFolder> => {
  const folder: IIdeaBoxFolder = await pb
    .collection("idea_box_folders")
    .update(id, {
      name,
      icon,
      color,
    });
  return folder;
};

export const moveFolder = async (
  pb: PocketBase,
  id: string,
  target: string,
): Promise<IIdeaBoxFolder> => {
  const entry: IIdeaBoxFolder = await pb
    .collection("idea_box_folders")
    .update(id, {
      parent: target,
    });
  return entry;
};

export const removeFromFolder = async (
  pb: PocketBase,
  id: string,
): Promise<IIdeaBoxFolder> => {
  const entry: IIdeaBoxFolder = await pb
    .collection("idea_box_folders")
    .update(id, {
      parent: "",
    });
  return entry;
};

export const deleteFolder = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("idea_box_folders").delete(id);
};

export const validateFolderPath = async (
  pb: PocketBase,
  container: string,
  path: string[],
): Promise<{ folderExists: boolean; lastFolder: string }> => {
  let folderExists = true;
  let lastFolder = "";

  for (const folder of path) {
    if (!folder) continue;

    try {
      const folderEntry = await pb
        .collection("idea_box_folders")
        .getOne<IIdeaBoxFolder>(folder);

      if (
        folderEntry.parent !== lastFolder ||
        folderEntry.container !== container
      ) {
        folderExists = false;
        break;
      }

      lastFolder = folder;
    } catch (error) {
      folderExists = false;
      break;
    }
  }

  return { folderExists, lastFolder };
};
