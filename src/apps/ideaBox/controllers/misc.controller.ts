import { z } from "zod";

import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import * as miscService from "../services/misc.service";

export const getPath = zodHandler(
  {
    params: z.object({
      container: z.string(),
      "0": z.string(),
    }),
    response: z.any(),
  },
  async ({ pb, params, req, res }) => {
    const result = await miscService.getPath(
      pb,
      params.container,
      params[0].split("/").filter((p) => p !== ""),
      req,
      res,
    );

    if (!result) {
      throw new Error("Something went wrong while fetching the path");
    }

    return result;
  },
);

export const checkValid = zodHandler(
  {
    params: z.object({
      container: z.string(),
      "0": z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params, req, res }) =>
    await miscService.checkValid(
      pb,
      params.container,
      params[0].split("/").filter((p) => p !== ""),
      req,
      res,
    ),
);

export const getOgData = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.record(z.string(), z.any()),
  },
  async ({ pb, params }) => await miscService.getOgData(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);

export const search = zodHandler(
  {
    query: z.object({
      q: z.string(),
      container: z.string().optional(),
      tags: z.string().optional(),
      folder: z.string().optional(),
    }),
    response: z.any(),
  },
  async ({ pb, query, req, res }) => {
    const { q, container, tags, folder } = query;

    return await miscService.search(
      pb,
      q,
      container || "",
      tags || "",
      folder || "",
      req,
      res,
    );
  },
  {
    existenceCheck: {
      query: {
        container: "[idea_box_containers]",
      },
    },
  },
);
