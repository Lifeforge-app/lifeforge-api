import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as RailwayMapServices from "../services/railwayMap.service";
import {
  RailwayMapLineSchema,
  RailwayMapStationSchema,
} from "../typescript/railwayMap.types";

export const getLines = forgeController(
  {
    response: z.array(WithPBSchema(RailwayMapLineSchema)),
  },
  async ({ pb }) => await RailwayMapServices.getLines(pb),
);

export const getStations = forgeController(
  {
    response: z.array(WithPBSchema(RailwayMapStationSchema)),
  },
  async ({ pb }) => RailwayMapServices.getStations(pb),
);

export const getShortestPath = forgeController(
  {
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    response: z.array(WithPBSchema(RailwayMapStationSchema)),
  },
  async ({ pb, query: { start, end } }) =>
    await RailwayMapServices.getShortestPath(pb, start, end),
);
