import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";

import * as CodeTimeService from "../services/codeTime.service";
import {
  CodeTimeActivitiesSchema,
  CodeTimeDailyEntrySchema,
  CodeTimeStatisticsSchema,
} from "../typescript/codetime_interfaces";

export const getActivities = zodHandler(
  {
    query: z.object({
      year: z.number().optional(),
    }),
    response: CodeTimeActivitiesSchema,
  },
  async ({ pb, query: { year } }) =>
    await CodeTimeService.getActivities(pb, year),
);

export const getStatistics = zodHandler(
  {
    response: CodeTimeStatisticsSchema,
  },
  async ({ pb }) => await CodeTimeService.getStatistics(pb),
);

export const getLastXDays = zodHandler(
  {
    query: z.object({
      days: z.string().transform((val) => parseInt(val, 10)),
    }),
    response: z.array(WithPBSchema(CodeTimeDailyEntrySchema)),
  },
  async ({ pb, query: { days } }) => {
    if (days > 30) {
      throw new ClientError("days must be less than or equal to 30");
    }

    return await CodeTimeService.getLastXDays(pb, days);
  },
);

export const getProjects = zodHandler(
  {
    query: z.object({
      last: z.enum(["24 hours", "7 days", "30 days"]).default("7 days"),
    }),
    response: z.record(z.string(), z.number()),
  },
  async ({ pb, query: { last } }) =>
    await CodeTimeService.getProjectsStats(pb, last),
);

export const getLanguages = zodHandler(
  {
    query: z.object({
      last: z.enum(["24 hours", "7 days", "30 days"]).default("7 days"),
    }),
    response: z.record(z.string(), z.number()),
  },
  async ({ pb, query: { last } }) =>
    await CodeTimeService.getLanguagesStats(pb, last),
);

export const getEachDay = zodHandler(
  {
    response: z.array(
      z.object({
        date: z.string(),
        duration: z.number(),
      }),
    ),
  },
  async ({ pb }) => await CodeTimeService.getEachDay(pb),
);

export const getUserMinutes = zodHandler(
  {
    query: z.object({
      minutes: z.string().transform((val) => parseInt(val, 10)),
    }),
    response: z.object({
      minutes: z.number(),
    }),
  },
  async ({ pb, query: { minutes } }) =>
    await CodeTimeService.getUserMinutes(pb, minutes),
);

export const logEvent = zodHandler(
  {
    // @ts-ignore
    body: z.any(),
    response: z.object({
      status: z.string(),
      data: z.array(z.any()),
      message: z.string(),
    }),
  },
  async ({ pb, body }) => {
    await CodeTimeService.logEvent(pb, body);

    return {
      status: "ok",
      data: [],
      message: "success",
    };
  },
);

export const getReadmeImage = zodHandler(
  {
    response: z.instanceof(Uint8Array<ArrayBufferLike>),
  },
  async ({ pb, res }) => {
    const imageBuffer = await CodeTimeService.getReadmeImage(pb);

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Content-Type", "image/png");

    return imageBuffer;
  },
);
