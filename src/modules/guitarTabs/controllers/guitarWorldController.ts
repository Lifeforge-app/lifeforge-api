import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import { IGuitarTabsEntry } from "../../../interfaces/guitar_tabs_interfaces";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import * as guitarWorldService from "../services/guitarWorldService";

export const getTabsList = async (req: Request, res: Response) => {
  const { cookie, page } = req.body;

  try {
    const data = await guitarWorldService.getTabsList(cookie, page);
    if (!data) {
      clientError(res, "Failed to fetch data", 502);
      return;
    }
    successWithBaseResponse(res, data);
  } catch (error) {
    clientError(res, "Failed to fetch data", 502);
  }
};

export const downloadTab = async (
  req: Request,
  res: Response<BaseResponse<IGuitarTabsEntry>>,
) => {
  const { cookie, id, name, category, mainArtist, audioUrl } = req.body;

  try {
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
  } catch (error) {
    console.error(error);
    clientError(res, "Failed to fetch data", 502);
  }
};
