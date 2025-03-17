import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as LanguagesService from "../services/languages.service";

export const getAllLanguages = async (req: Request, res: Response) => {
  const { pb } = req;

  const languages = await LanguagesService.getAllLanguages(pb);
  successWithBaseResponse(res, languages);
};

export const createLanguage = async (req: Request, res: Response) => {
  const { pb } = req;
  const { name, icon } = req.body;

  const language = await LanguagesService.createLanguage(pb, { name, icon });
  successWithBaseResponse(res, language, 201);
};

export const updateLanguage = async (req: Request, res: Response) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon } = req.body;

  if (!(await checkExistence(req, res, "languages", id))) {
    return;
  }

  const language = await LanguagesService.updateLanguage(pb, id, {
    name,
    icon,
  });

  successWithBaseResponse(res, language);
};

export const deleteLanguage = async (req: Request, res: Response) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "languages", id))) {
    return;
  }

  await LanguagesService.deleteLanguage(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
