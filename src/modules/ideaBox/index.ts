import express, { Request, Response } from "express";
import ogs from "open-graph-scraper";
import containers from "./routes/containers";
import folders from "./routes/folders";
import ideas from "./routes/ideas";
import tags from "./routes/tags";
import asyncWrapper from "../../utils/asyncWrapper";
import { checkExistence } from "../../utils/PBRecordValidator";
import {
  IIdeaBoxContainer,
  IIdeaBoxEntry,
  IIdeaBoxFolder,
} from "../../interfaces/ideabox_interfaces";
import { clientError, successWithBaseResponse } from "../../utils/response";
import { param, query } from "express-validator";
import { BaseResponse } from "../../interfaces/base_response";

const router = express.Router();

const OGCache = new Map<string, any>();

router.use("/containers", containers);
router.use("/folders", folders);
router.use("/ideas", ideas);
router.use("/tags", tags);

router.get(
  "/path/:container/*",
  [param("container").isString()],
  asyncWrapper(
    async (
      req,
      res: Response<
        BaseResponse<{
          container: IIdeaBoxContainer;
          path: IIdeaBoxFolder[];
        }>
      >
    ) => {
      const { pb } = req;
      const { container } = req.params;
      const path = req.params[0].split("/").filter((p) => p !== "");

      const containerExists = await checkExistence(
        req,
        res,
        "idea_box_containers",
        container
      );

      if (!containerExists) return;

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
          return;
        }

        const folderEntry = await pb
          .collection("idea_box_folders")
          .getOne<IIdeaBoxFolder>(folder);

        if (
          folderEntry.parent !== lastFolder ||
          folderEntry.container !== container
        ) {
          clientError(res, "Invalid path");
          return;
        }

        lastFolder = folder;

        fullPath.push(folderEntry);
      }

      successWithBaseResponse(res, {
        container: containerEntry,
        path: fullPath,
      });
    }
  )
);

/**
 * @protected
 * @summary Check if an idea box folder exists
 * @description Check if an idea box folder exists by its ID.
 * @param id (string, required) - The ID of the idea box folder
 * @response 200 (boolean) - Whether the idea box folder exists
 */
router.get(
  "/valid/:container/*",
  [param("container").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    const { pb } = req;
    const { container } = req.params;
    const path = req.params[0].split("/").filter((p) => p !== "");

    const containerExists = await checkExistence(
      req,
      res,
      "idea_box_containers",
      container,
      false
    );

    if (!containerExists) {
      successWithBaseResponse(res, false);
      return;
    }

    let folderExists = true;
    let lastFolder = "";

    for (const folder of path) {
      if (
        !(await checkExistence(req, res, "idea_box_folders", folder, false))
      ) {
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

    successWithBaseResponse(res, containerExists && folderExists);
  })
);

router.get(
  "/og-data/:id",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

    const data = await pb
      .collection("idea_box_entries")
      .getOne<IIdeaBoxEntry>(id);

    if (data.type !== "link") {
      clientError(res, "This is not a link entry");
    }

    if (OGCache.has(id) && OGCache.get(id).requestUrl === data.content) {
      successWithBaseResponse(res, OGCache.get(id));
      return;
    }

    ogs({ url: data.content })
      .then((data) => {
        const { error, result } = data;
        if (error) {
          clientError(res);
        }

        OGCache.set(id, result);
        successWithBaseResponse(res, result);
      })
      .catch(() => {
        clientError(res);
      });
  })
);

async function recursivelySearchFolder(
  folderId: string,
  q: string,
  container: string,
  tags: string,
  req: Request,
  parents: string
) {
  const pb = req.pb;
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
      parents + "/" + folder.id
    );

    allResults.push(...results);
  }

  return allResults;
}

router.get(
  "/search",
  [
    query("q").isString().trim(),
    query("tags").isString().optional().trim(),
    query("container").isString().optional().trim(),
    query("folder").isString().optional().trim(),
  ],
  asyncWrapper(
    async (
      req,
      res: Response<
        BaseResponse<
          (Omit<IIdeaBoxEntry, "folder"> & {
            folder?: IIdeaBoxFolder;
            expand: {
              folder?: IIdeaBoxFolder;
            };
          })[]
        >
      >
    ) => {
      const { q, container, tags, folder } = req.query as Record<
        string,
        string
      >;

      const containerExists = container
        ? await checkExistence(
            req,
            res,
            "idea_box_containers",
            container,
            false
          )
        : true;

      if (!containerExists) return;

      const results = await recursivelySearchFolder(
        folder || "",
        q,
        container || "",
        tags || "",
        req,
        ""
      );

      for (const result of results) {
        if (result.expand?.folder) {
          result.folder = result.expand.folder;
          delete result.expand;
        }
      }

      successWithBaseResponse(res, results as any);
    }
  )
);

export default router;
