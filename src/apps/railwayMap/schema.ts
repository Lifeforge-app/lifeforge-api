// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: railwayMap
// Generated at: 2025-07-09T11:52:26.854Z
// Contains: railway_map__lines, railway_map__stations
import { z } from "zod/v4";

const RailwayMapLinesSchema = z.object({
  country: z.string(),
  type: z.string(),
  code: z.string(),
  name: z.string(),
  color: z.string(),
  ways: z.any(),
  map_paths: z.any(),
});

const RailwayMapStationsSchema = z.object({
  name: z.string(),
  desc: z.string(),
  lines: z.string(),
  codes: z.any(),
  coords: z.any(),
  map_data: z.any(),
  type: z.string(),
  distances: z.any(),
  map_image: z.string(),
});

type IRailwayMapLines = z.infer<typeof RailwayMapLinesSchema>;
type IRailwayMapStations = z.infer<typeof RailwayMapStationsSchema>;

export { RailwayMapLinesSchema, RailwayMapStationsSchema };

export type { IRailwayMapLines, IRailwayMapStations };
