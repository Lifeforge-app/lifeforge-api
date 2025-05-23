import express, { Request, Response } from "express";

import asyncWrapper from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";
import { exec } from "child_process";
import os from "os";
import osUtils from "os-utils";
import si from "systeminformation";

const router = express.Router();

router.get(
  "/disks",
  asyncWrapper(async (_: Request, res: Response) => {
    const { stdout, stderr } = exec("df -h");

    stdout?.on("data", (data) => {
      const result = data
        .split("\n")
        .map((e: string) => e.split(" ").filter((e) => e !== ""))
        .slice(1, -1)
        .filter((e: string[]) => e[5].startsWith("/home/pi"))
        .map((e: string[]) => ({
          name: e[5],
          size: e[1].replace(/(\d)([A-Z])/, "$1 $2"),
          used: e[2].replace(/(\d)([A-Z])/, "$1 $2"),
          avail: e[3].replace(/(\d)([A-Z])/, "$1 $2"),
          usedPercent: e[4],
        }));

      successWithBaseResponse(res, result);
    });

    stderr?.on("data", (data) => {
      throw new Error(data);
    });
  }),
);

router.get(
  "/memory",
  asyncWrapper(async (req, res) => {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percent = (used / total) * 100;

    successWithBaseResponse(res, {
      total,
      free,
      used,
      percent,
    });
  }),
);

router.get(
  "/cpu",
  asyncWrapper(async (req, res) => {
    osUtils.cpuUsage((v) => {
      successWithBaseResponse(res, {
        usage: v * 100,
        uptime: os.uptime(),
      });
    });
  }),
);

router.get(
  "/info",
  asyncWrapper(async (req, res) => {
    const osInfo = await si.osInfo();
    const cpu = await si.cpu();
    const mem = await si.mem();
    const networkInterfaces = await si.networkInterfaces();
    const networkStats = await si.networkStats();

    successWithBaseResponse(res, {
      osInfo,
      cpu,
      mem,
      networkInterfaces,
      networkStats,
    });
  }),
);

router.get(
  "/cpu-temp",
  asyncWrapper(async (req, res) => {
    const temp = await si.cpuTemperature();
    successWithBaseResponse(res, temp);
  }),
);

export default router;
