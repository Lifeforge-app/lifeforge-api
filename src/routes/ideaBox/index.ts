import express, { Request, Response } from "express";
import ogs from "open-graph-scraper";
import containers from "./routes/containers.js";
import folders from "./routes/folders.js";
import ideas from "./routes/ideas.js";
import tags from "./routes/tags.js";
import asyncWrapper from "../../utils/asyncWrapper.js";
import { checkExistence } from "../../utils/PBRecordValidator.js";
import {
  IIdeaBoxContainer,
  IIdeaBoxEntry,
  IIdeaBoxFolder,
} from "../../interfaces/ideabox_interfaces.js";
import { clientError, successWithBaseResponse } from "../../utils/response.js";
import { param, query } from "express-validator";
import { BaseResponse } from "../../interfaces/base_response.js";
import hasError from "../../utils/checkError.js";
import { AnyNaptrRecord } from "node:dns";

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
      if (hasError(req, res)) return;

      const { pb } = req;
      const { container } = req.params;
      const path = req.params[0].split("/").filter((p) => p !== "");

      const containerExists = await checkExistence(
        req,
        res,
        "idea_box_containers",
        container,
        "container"
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
        if (
          !(await checkExistence(
            req,
            res,
            "idea_box_folders",
            folder,
            "folder"
          ))
        ) {
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
    if (hasError(req, res)) return;

    const { pb } = req;
    const { container } = req.params;
    const path = req.params[0].split("/").filter((p) => p !== "");

    const containerExists = await checkExistence(
      req,
      res,
      "idea_box_containers",
      container,
      "container",
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
        !(await checkExistence(
          req,
          res,
          "idea_box_folders",
          folder,
          "folder",
          false
        ))
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

    if (!(await checkExistence(req, res, "idea_box_entries", id, "id"))) return;

    if (OGCache.has(id)) {
      successWithBaseResponse(res, OGCache.get(id));
      return;
    }

    const data = await pb
      .collection("idea_box_entries")
      .getOne<IIdeaBoxEntry>(id);

    if (data.type !== "link") {
      clientError(res, "This is not a link entry");
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
  req: Request
) {
  const pb = req.pb;
  const folderInsideFolder = await pb
    .collection("idea_box_folders")
    .getFullList({
      filter: `parent = "${folderId}"`,
    });

  const allResults = await pb.collection("idea_box_entries").getFullList({
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
  });

  if (folderInsideFolder.length === 0) {
    return allResults;
  }

  for (const folder of folderInsideFolder) {
    const results = await recursivelySearchFolder(
      folder.id,
      q,
      container,
      tags,
      req
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
      if (hasError(req, res)) return;

      const { pb } = req;
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
            "container",
            false
          )
        : true;

      if (!containerExists) return;

      const results = await recursivelySearchFolder(
        folder || "",
        q,
        container || "",
        tags || "",
        req
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
