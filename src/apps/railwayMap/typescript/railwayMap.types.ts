import { z } from "zod";

const RailwayMapLineSchema = z.object({
  country: z.string(),
  type: z.string(),
  code: z.string(),
  name: z.string(),
  color: z.string(),
  ways: z.array(z.array(z.array(z.number()))),
  stations: z.array(z.array(z.array(z.string()))),
});

const RailwayMapStationSchema = z.object({
  name: z.string(),
  desc: z.string(),
  lines: z.array(z.string()),
  codes: z.array(z.string()),
  coords: z.array(z.number()),
  map_data: z.object({
    text: z.string(),
    textOffsetX: z.number(),
    textOffsetY: z.number(),
    x: z.number(),
    y: z.number(),
  }),
  type: z.enum(["station", "interchange"]),
  distances: z.record(z.string(), z.number()),
});

type IRailwayMapLine = z.infer<typeof RailwayMapLineSchema>;
type IRailwayMapStation = z.infer<typeof RailwayMapStationSchema>;

export type { IRailwayMapLine, IRailwayMapStation };

export { RailwayMapLineSchema, RailwayMapStationSchema };
