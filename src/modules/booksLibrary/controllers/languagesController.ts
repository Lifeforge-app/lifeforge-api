import { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import { successWithBaseResponse } from "../../../utils/response";
import * as LanguagesService from "../services/languagesService";

export const getAllLanguages = asyncWrapper(
  async (req: Request, res: Response) => {
    const { pb } = req;
    const languages = await LanguagesService.getAllLanguages(pb);
    successWithBaseResponse(res, languages);
  },
);

export const createLanguage = asyncWrapper(
  async (req: Request, res: Response) => {
    const { pb } = req;
    const { name, icon } = req.body;

    const language = await LanguagesService.createLanguage(pb, { name, icon });

    successWithBaseResponse(res, language);
  },
);

export const updateLanguage = asyncWrapper(
  async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;
    const { name, icon } = req.body;

    const language = await LanguagesService.updateLanguage(pb, id, {
      name,
      icon,
    });

    successWithBaseResponse(res, language);
  },
);

export const deleteLanguage = asyncWrapper(
  async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await LanguagesService.deleteLanguage(pb, id);

    successWithBaseResponse(res, undefined, 204);
  },
);
