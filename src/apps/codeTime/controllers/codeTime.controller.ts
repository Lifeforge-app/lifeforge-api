import { Request, Response } from "express";

import hasError from "@utils/checkError";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";

import * as CodeTimeService from "../services/codeTime.service";

export const getActivities = async (req, res) => {
  const { pb } = req;
  const year = req.query.year;

  const activitiesData = await CodeTimeService.getActivities(
    pb,
    year as string,
  );
  successWithBaseResponse(res, activitiesData);
};

export const getStatistics = async (req, res) => {
  const { pb } = req;

  const statistics = await CodeTimeService.getStatistics(pb);
  successWithBaseResponse(res, statistics);
};

export const getLastXDays = async (req, res) => {
  if (hasError(req, res)) return;

  const { pb } = req;
  const { days } = req.query;

  if (+days! > 30) {
    clientError(res, "days must be less than or equal to 30", 400);
    return;
  }

  const data = await CodeTimeService.getLastXDays(pb, days ? +days : 7);
  return successWithBaseResponse(res, data);
};

export const getProjects = async (req, res) => {
  const { pb } = req;
  const lastXDays = req.query.last as string;

  const projectsStats = await CodeTimeService.getProjectsStats(pb, lastXDays);
  successWithBaseResponse(res, projectsStats);
};

export const getLanguages = async (req, res) => {
  const { pb } = req;
  const lastXDays = req.query.last as string;

  const languagesStats = await CodeTimeService.getLanguagesStats(pb, lastXDays);
  successWithBaseResponse(res, languagesStats);
};

export const getEachDay = async (req, res) => {
  const { pb } = req;

  const eachDayData = await CodeTimeService.getEachDay(pb);
  successWithBaseResponse(res, eachDayData);
};

export const getUserMinutes = async (req, res) => {
  try {
    const { pb } = req;
    const { minutes } = req.query;

    const result = await CodeTimeService.getUserMinutes(pb, +minutes!);
    res.json(result);
  } catch (e: any) {
    serverError(res, e.message);
  }
};

export const logEvent = async (req, res) => {
  const { pb } = req;
  const data = req.body;

  await CodeTimeService.logEvent(pb, data);
  res.send({
    status: "ok",
    data: [],
    message: "success",
  });
};

export const getReadmeImage = async (req, res) => {
  const imageBuffer = await CodeTimeService.getReadmeImage(req.pb);
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Content-Type", "image/png");
  res.send(imageBuffer);
};
