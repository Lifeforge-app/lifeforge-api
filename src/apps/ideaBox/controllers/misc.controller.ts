import { z } from "zod/v4";

import { successWithBaseResponse } from "@utils/response";
import { forgeController } from "@utils/zodifiedHandler";

import * as miscService from "../services/misc.service";

export const getPath = forgeController(
  {
    params: z.object({
      container: z.string(),
      "0": z.string(),
    }),
    response: z.any(),
  },
  async ({ pb, params: { container, "0": pathParam }, req, res }) => {
    const result = await miscService.getPath(
      pb,
      container,
      pathParam.split("/").filter((p) => p !== ""),
      req,
      res,
    );

    if (!result) {
      throw new Error("Something went wrong while fetching the path");
    }

    return result;
  },
);

export const checkValid = forgeController(
  {
    params: z.object({
      container: z.string(),
      "0": z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params: { container, "0": pathParam }, req, res }) =>
    await miscService.checkValid(
      pb,
      container,
      pathParam.split("/").filter((p) => p !== ""),
      req,
      res,
    ),
);

export const getOgData = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.record(z.string(), z.any()),
  },
  async ({ pb, params: { id } }) => await miscService.getOgData(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);

export const search = forgeController(
  {
    query: z.object({
      q: z.string(),
      container: z.string().optional(),
      tags: z.string().optional(),
      folder: z.string().optional(),
    }),
    response: z.any(),
  },
  async ({ pb, query: { q, container, tags, folder }, req, res }) =>
    await miscService.search(
      pb,
      q,
      container || "",
      tags || "",
      folder || "",
      req,
      res,
    ),
  {
    existenceCheck: {
      query: {
        container: "[idea_box_containers]",
      },
    },
  },
);
