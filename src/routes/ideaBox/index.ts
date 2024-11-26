import express from "express";
import ogs from "open-graph-scraper";
import container from "./routes/containers.js";
import folder from "./routes/folders.js";
import idea from "./routes/ideas.js";
import asyncWrapper from "../../utils/asyncWrapper.js";
import { checkExistence } from "../../utils/PBRecordValidator.js";
import { IIdeaBoxEntry } from "../../interfaces/ideabox_interfaces.js";
import { clientError, successWithBaseResponse } from "../../utils/response.js";

const router = express.Router();

const OGCache = new Map<string, any>();

router.use("/containers", container);
router.use("/folders", folder);
router.use("/ideas", idea);

router.get(
  "/og-data/:id",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

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

export default router;
