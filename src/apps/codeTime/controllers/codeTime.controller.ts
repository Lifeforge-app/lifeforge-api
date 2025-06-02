import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";
import hasError from "@utils/checkError";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";

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
  async (req, res) => {
    const { pb } = req;
    const year = req.query.year;

    const activitiesData = await CodeTimeService.getActivities(pb, year);

    successWithBaseResponse(res, activitiesData);
  },
);

export const getStatistics = zodHandler(
  {
    response: CodeTimeStatisticsSchema,
  },
  async (req, res) => {
    const { pb } = req;

    const statistics = await CodeTimeService.getStatistics(pb);

    successWithBaseResponse(res, statistics);
  },
);

export const getLastXDays = zodHandler(
  {
    query: z.object({
      days: z.string().transform((val) => parseInt(val, 10)),
    }),
    response: z.array(WithPBSchema(CodeTimeDailyEntrySchema)),
  },
  async (req, res) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const { days } = req.query;

    if (days > 30) {
      clientError(res, "days must be less than or equal to 30", 400);
      return;
    }

    const data = await CodeTimeService.getLastXDays(pb, days);

    return successWithBaseResponse(res, data);
  },
);

export const getProjects = zodHandler(
  {
    query: z.object({
      last: z.enum(["24 hours", "7 days", "30 days"]).default("7 days"),
    }),
    response: z.record(z.string(), z.number()),
  },
  async (req, res) => {
    const { pb } = req;
    const lastXDays = req.query.last;

    const projectsStats = await CodeTimeService.getProjectsStats(pb, lastXDays);

    successWithBaseResponse(res, projectsStats);
  },
);

export const getLanguages = zodHandler(
  {
    query: z.object({
      last: z.enum(["24 hours", "7 days", "30 days"]).default("7 days"),
    }),
    response: z.record(z.string(), z.number()),
  },
  async (req, res) => {
    const { pb } = req;
    const lastXDays = req.query.last;

    const languagesStats = await CodeTimeService.getLanguagesStats(
      pb,
      lastXDays,
    );

    successWithBaseResponse(res, languagesStats);
  },
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
  async (req, res) => {
    const { pb } = req;

    const eachDayData = await CodeTimeService.getEachDay(pb);

    successWithBaseResponse(res, eachDayData);
  },
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
  async (req, res) => {
    try {
      const { pb } = req;
      const { minutes } = req.query;

      const result = await CodeTimeService.getUserMinutes(pb, +minutes!);

      res.json(result as any);
    } catch (e: any) {
      serverError(res, e.message);
    }
  },
);

export const logEvent = zodHandler(
  {
    body: z.object({
      event: z.string(),
      data: z.record(z.string(), z.any()),
    }),
    response: z.object({
      status: z.string(),
      data: z.array(z.any()),
      message: z.string(),
    }),
  },
  async (req, res) => {
    const { pb } = req;
    const data = req.body;

    await CodeTimeService.logEvent(pb, data);
    res.send({
      status: "ok",
      data: [],
      message: "success",
    } as any);
  },
);

export const getReadmeImage = zodHandler(
  {
    response: z.instanceof(Uint8Array<ArrayBufferLike>),
  },
  async (req, res) => {
    const imageBuffer = await CodeTimeService.getReadmeImage(req.pb);

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Content-Type", "image/png");

    res.send(imageBuffer as any);
  },
);
