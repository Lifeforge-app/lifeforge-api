import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { successWithBaseResponse } from "@utils/response";

import * as guitarWorldService from "../services/guitarWorld.service";
import { IGuitarTabsEntry } from "../typescript/guitar_tabs_interfaces";

export const getTabsList = async (req: Request, res: Response) => {
  const { cookie, page } = req.body;

  const data = await guitarWorldService.getTabsList(cookie, page);
  successWithBaseResponse(res, data);
};

export const downloadTab = async (req: Request, res: Response) => {
  const { cookie, id, name, category, mainArtist, audioUrl } = req.body;

  const newEntry = await guitarWorldService.downloadTab(
    req.pb,
    cookie,
    id,
    name,
    category,
    mainArtist,
    audioUrl,
  );
  successWithBaseResponse(res, newEntry);
};
