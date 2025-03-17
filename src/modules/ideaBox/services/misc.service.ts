import { checkExistence } from "@utils/PBRecordValidator";
import { clientError } from "@utils/response";
import { Request, Response } from "express";
import ogs from "open-graph-scraper";
import PocketBase from "pocketbase";
import {
  IIdeaBoxContainer,
  IIdeaBoxEntry,
  IIdeaBoxFolder,
} from "../typescript/ideabox_interfaces";

const OGCache = new Map<string, any>();

export const getPath = async (
  pb: PocketBase,
  container: string,
  path: string[],
  req: Request,
  res: Response,
) => {
  const containerExists = await checkExistence(
    req,
    res,
    "idea_box_containers",
    container,
  );

  if (!containerExists) return null;

  const containerEntry = await pb
    .collection("idea_box_containers")
    .getOne<IIdeaBoxContainer>(container);

  containerEntry.cover = pb.files
    .getURL(containerEntry, containerEntry.cover)
    .replace(`${pb.baseURL}/api/files`, "");

  let lastFolder = "";
  const fullPath: IIdeaBoxFolder[] = [];

  for (const folder of path) {
    if (!(await checkExistence(req, res, "idea_box_folders", folder))) {
      return null;
    }

    const folderEntry = await pb
      .collection("idea_box_folders")
      .getOne<IIdeaBoxFolder>(folder);

    if (
      folderEntry.parent !== lastFolder ||
      folderEntry.container !== container
    ) {
      clientError(res, "Invalid path");
      return null;
    }

    lastFolder = folder;
    fullPath.push(folderEntry);
  }

  return {
    container: containerEntry,
    path: fullPath,
  };
};

export const checkValid = async (
  pb: PocketBase,
  container: string,
  path: string[],
  req: Request,
  res: Response,
) => {
  const containerExists = await checkExistence(
    req,
    res,
    "idea_box_containers",
    container,
    false,
  );

  if (!containerExists) {
    return false;
  }

  let folderExists = true;
  let lastFolder = "";

  for (const folder of path) {
    if (!(await checkExistence(req, res, "idea_box_folders", folder, false))) {
      folderExists = false;
      break;
    }

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
  }

  return containerExists && folderExists;
};

export const getOgData = async (
  pb: PocketBase,
  id: string,
  req: Request,
  res: Response,
) => {
  if (!(await checkExistence(req, res, "idea_box_entries", id))) {
    return;
  }
  null;

  const data = await pb
    .collection("idea_box_entries")
    .getOne<IIdeaBoxEntry>(id);

  if (data.type !== "link") {
    clientError(res, "This is not a link entry");
    return null;
  }

  if (OGCache.has(id) && OGCache.get(id).requestUrl === data.content) {
    return OGCache.get(id);
  }

  const { result } = await ogs({ url: data.content });
  OGCache.set(id, result);
  return result;
};

async function recursivelySearchFolder(
  folderId: string,
  q: string,
  container: string,
  tags: string,
  req: Request,
  parents: string,
  pb: PocketBase,
) {
  const folderInsideFolder = await pb
    .collection("idea_box_folders")
    .getFullList<IIdeaBoxFolder>({
      filter: `parent = "${folderId}"`,
    });

  const allResults = (
    await pb.collection("idea_box_entries").getFullList<
      Omit<IIdeaBoxEntry, "folder"> & {
        folder: IIdeaBoxFolder;
        expand?: {
          folder: IIdeaBoxFolder;
        };
      }
    >({
      filter: `(content ~ "${q}" || title ~ "${q}") && container = "${container}" && archived = false ${
        tags
          ? "&& " +
            tags
              .split(",")
              .map((tag) => `tags ~ "${tag}"`)
              .join(" && ")
          : ""
      } && folder = "${folderId}"`,
      expand: "folder",
    })
  ).map((result) => ({ ...result, fullPath: parents }));

  if (folderInsideFolder.length === 0) {
    return allResults;
  }

  for (const folder of folderInsideFolder) {
    const results = await recursivelySearchFolder(
      folder.id,
      q,
      container,
      tags,
      req,
      parents + "/" + folder.id,
      pb,
    );

    allResults.push(...results);
  }

  return allResults;
}

export const search = async (
  pb: PocketBase,
  q: string,
  container: string,
  tags: string,
  folder: string,
  req: Request,
  res: Response,
) => {
  if (container) {
    const containerExists = await checkExistence(
      req,
      res,
      "idea_box_containers",
      container,
      false,
    );

    if (!containerExists) return null;
  }

  const results = await recursivelySearchFolder(
    folder,
    q,
    container,
    tags,
    req,
    "",
    pb,
  );

  for (const result of results) {
    if (result.expand?.folder) {
      result.folder = result.expand.folder;
      delete result.expand;
    }
  }

  return results;
};
