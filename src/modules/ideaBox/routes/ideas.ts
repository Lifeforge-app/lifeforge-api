import express, { Request, Response } from "express";
import multer from "multer";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import asyncWrapper from "../../../utils/asyncWrapper";
import { body, param, query } from "express-validator";
import hasError from "../../../utils/checkError";
import { list } from "../../../utils/CRUD";
import {
  IIdeaBoxEntry,
  IIdeaBoxFolder,
  IIdeaBoxTag,
} from "../../../interfaces/ideabox_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import fs from "fs";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all idea box entries
 * @description Retrieve a list of all idea box entries, filtered by container and folder given in the URL.
 * @query container (string, required, must_exist) - The container of the idea box entries
 * @query folder (string, optional, must_exist) - The folder of the idea box entries
 * @query archived (boolean, optional) - Whether to include archived entries
 * @response 200 (IIdeaBoxEntry[]) - The list of idea box entries
 */
router.get(
  "/:container/*",
  [query("archived").isBoolean().optional(), param("container").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxEntry[]>>) => {
    const { pb } = req;
    const path = req.params[0].split("/").filter((e) => e);
    const { container } = req.params;
    const { archived } = req.query as Record<string, string>;

    const containerExist = await checkExistence(
      req,
      res,
      "idea_box_containers",
      container
    );
    let folderExist = true;
    let lastFolder = "";

    for (const folder of path) {
      if (!(await checkExistence(req, res, "idea_box_folders", folder))) {
        folderExist = false;
        break;
      }

      const folderEntry = await pb
        .collection("idea_box_folders")
        .getOne<IIdeaBoxFolder>(folder);

      if (
        folderEntry.parent !== lastFolder ||
        folderEntry.container !== container
      ) {
        folderExist = false;
        break;
      }

      lastFolder = folder;
    }

    if (!containerExist || !folderExist) {
      try {
        clientError(res, "folder: Not found", 400);
      } catch {}
      return;
    }

    await list(req, res, "idea_box_entries", {
      filter: `container = "${container}" && archived = ${archived || "false"} ${
        lastFolder ? `&& folder = "${lastFolder}"` : "&& folder=''"
      }`,
      sort: "-pinned,-created",
    });
  })
);

/**
 * @protected
 * @summary Create a new idea box entry
 * @description Create a new idea box entry with the given container, title, content, and type.
 * @body container (string, required, must_exist) - The container of the idea box entry
 * @body type (string, required, one_of text|link|image) - The type of the idea box entry
 * @body title (string, required if type is text or link) - The title of the idea box entry
 * @body content (string, required if type is link) - The content of the idea box entry
 * @body imageLink (string, optional) - The link to the image, will raise an error if type is not image
 * @body folder (string, optional, must_exist) - The folder of the idea box entry
 * @body file (file, required if type is image) - The image file
 * @response 201 (IIdeaBoxEntry) - The created idea box entry
 */
router.post(
  "/",
  multer().single("image"),
  [
    body("container").isString(),
    body("title").custom((value, { req }) => {
      if (
        ["link", "image"].includes(req.body.type) &&
        (typeof value !== "string" || !value)
      ) {
        throw new Error("Invalid value");
      }
      return true;
    }),
    body("content").custom((value, { req }) => {
      if (req.body.type === "image") return true;
      if (typeof value !== "string" || !value) {
        throw new Error("Invalid value");
      }
      return true;
    }),
    body("type").isString().isIn(["text", "link", "image"]).notEmpty(),
    body("imageLink").custom((value, { req }) => {
      if (req.body.type !== "image" && value) {
        throw new Error("Invalid value");
      }
      return true;
    }),
    body("folder").isString().optional(),
    body("file").custom((_, { req }) => {
      if (req.body.type === "image" && !req.file && !req.body.imageLink) {
        throw new Error("Image is required");
      }
      return true;
    }),
    body("tags").isString().optional(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
    const { pb } = req;
    const { container, title, content, type, imageLink, folder, tags } =
      req.body;

    const { file } = req;

    if (!(await checkExistence(req, res, "idea_box_containers", container))) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      return;
    }

    let data: WithoutPBDefault<
      Omit<IIdeaBoxEntry, "image" | "pinned" | "archived">
    > & {
      image?: File;
    } = {
      type,
      container,
      folder,
      tags: tags || null,
    };

    switch (type) {
      case "text":
      case "link":
        data["title"] = title;
        data["content"] = content;
        break;
      case "image":
        if (imageLink) {
          await fetch(imageLink).then(async (response) => {
            const buffer = await response.arrayBuffer();
            data["image"] = new File([buffer], "image.jpg", {
              type: "image/jpeg",
            });
            data["title"] = title;
          });
        } else {
          if (!file) {
            clientError(res, "image: Invalid value");
            return;
          }

          data["image"] = new File([file.buffer], file.originalname, {
            type: file.mimetype,
          });
          data["title"] = title;
        }
        break;
    }

    const idea: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .create(data);

    await pb.collection("idea_box_containers").update(container, {
      [`${type}_count+`]: 1,
    });

    if (idea.tags) {
      for (const tag of idea.tags) {
        const tagEntry = await pb
          .collection("idea_box_tags")
          .getFirstListItem(
            `name = "${tag}" && container = "${idea.container}"`
          )
          .catch(() => null);

        if (tagEntry) {
          await pb.collection("idea_box_tags").update(tagEntry.id, {
            "count+": 1,
          });
        } else {
          await pb.collection("idea_box_tags").create({
            name: tag,
            container: idea.container,
            count: 1,
          });
        }
      }
    }

    successWithBaseResponse(res, idea, 201);
  })
);

/**
 * @protected
 * @summary Update an idea box entry
 * @description Update an existing idea box entry with the given ID, setting the title, content, and type.
 * @param id (string, required, must_exist) - The ID of the idea box entry to update
 * @body title (string, required) - The title of the idea box entry
 * @body content (string, required) - The content of the idea box entry
 * @body type (string, required, one_of text|link) - The type of the idea box entry
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.patch(
  "/:id",
  [
    body("title").isString(),
    body("content").isString(),
    body("type").isIn(["text", "link", "image"]),
    body("tags").isArray().optional(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { title, content, type, tags } = req.body;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

    const oldEntry = await pb.collection("idea_box_entries").getOne(id);

    let data;
    switch (type) {
      case "text":
      case "link":
        data = {
          title,
          content,
          type,
          tags: tags || null,
        };
        break;
      case "image":
        data = {
          title,
          type,
          tags: tags || null,
        };
        break;
    }

    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, data);

    if (oldEntry.type !== entry.type) {
      await pb.collection("idea_box_containers").update(entry.container, {
        [`${oldEntry.type}_count-`]: 1,
        [`${entry.type}_count+`]: 1,
      });
    }

    for (const tag of oldEntry.tags || []) {
      if (entry.tags?.includes(tag)) continue;

      const tagEntry = await pb
        .collection("idea_box_tags")
        .getFirstListItem<IIdeaBoxTag>(
          `name = "${tag}" && container = "${entry.container}"`
        )
        .catch(() => null);

      if (tagEntry) {
        if (tagEntry.count === 1) {
          await pb.collection("idea_box_tags").delete(tagEntry.id);
        } else {
          await pb.collection("idea_box_tags").update(tagEntry.id, {
            "count-": 1,
          });
        }
      }
    }

    for (const tag of entry.tags || []) {
      if (oldEntry.tags?.includes(tag)) continue;

      const tagEntry = await pb
        .collection("idea_box_tags")
        .getFirstListItem(`name = "${tag}" && container = "${entry.container}"`)
        .catch(() => null);

      if (tagEntry) {
        await pb.collection("idea_box_tags").update(tagEntry.id, {
          "count+": 1,
        });
      } else {
        await pb.collection("idea_box_tags").create({
          name: tag,
          container: entry.container,
          count: 1,
        });
      }
    }

    successWithBaseResponse(res, entry);
  })
);

/**
 * @protected
 * @summary Delete an idea box entry
 * @description Delete an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to delete
 * @response 204 - The idea box entry was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

    const idea = await pb
      .collection("idea_box_entries")
      .getOne<IIdeaBoxEntry>(id);
    await pb.collection("idea_box_entries").delete(id);
    await pb.collection("idea_box_containers").update(idea.container, {
      [`${idea.type}_count-`]: 1,
    });

    if (idea.tags) {
      for (const tag of idea.tags) {
        const tagEntry = await pb
          .collection("idea_box_tags")
          .getFirstListItem(
            `name = "${tag}" && container = "${idea.container}"`
          )
          .catch(() => null);

        if (tagEntry) {
          if (tagEntry.count === 1) {
            await pb.collection("idea_box_tags").delete(tagEntry.id);
          } else {
            await pb.collection("idea_box_tags").update(tagEntry.id, {
              "count-": 1,
            });
          }
        }
      }
    }

    successWithBaseResponse(res, undefined, 204);
  })
);

/**
 * @protected
 * @summary Pin/unpin an idea box entry
 * @description Update the pinned status of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to pin
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.post(
  "/pin/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

    const idea = await pb.collection("idea_box_entries").getOne(id);
    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, {
        pinned: !idea.pinned,
      });

    successWithBaseResponse(res, entry);
  })
);

/**
 * @protected
 * @summary Archive/unarchive an idea box entry
 * @description Update the archived status of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to archive
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.post(
  "/archive/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

    const idea = await pb.collection("idea_box_entries").getOne(id);
    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, {
        archived: !idea.archived,
        pinned: false,
      });

    successWithBaseResponse(res, entry);
  })
);

/**
 * @protected
 * @summary Move an idea box entry to a folder
 * @description Update the folder of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to move
 * @query folder (string, required, must_exist) - The folder to move the idea box entry to
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.post(
  "/move/:id",
  query("target").isString(),
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { target } = req.query as Record<string, string>;

    const entryExist = await checkExistence(req, res, "idea_box_entries", id);
    const folderExist = await checkExistence(
      req,
      res,
      "idea_box_folders",
      target
    );
    if (!(entryExist && folderExist)) return;

    const entry: IIdeaBoxEntry = await pb
      .collection("idea_box_entries")
      .update(id, {
        folder: target,
      });

    successWithBaseResponse(res, entry);
  })
);

/**
 * @protected
 * @summary Remove an idea box entry from a folder
 * @description Update the folder of an existing idea box entry with the given ID to an empty string.
 * @param id (string, required, must_exist) - The ID of the idea box entry to remove from the folder
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.delete(
  "/move/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

    const entry = await pb
      .collection("idea_box_entries")
      .update<IIdeaBoxEntry>(id, {
        folder: "",
      });

    successWithBaseResponse(res, entry);
  })
);

export default router;
