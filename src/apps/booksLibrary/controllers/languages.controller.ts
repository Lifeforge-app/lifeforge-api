import { Request, Response } from "express";
import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import * as LanguagesService from "../services/languages.service";
import { BooksLibraryLanguageSchema } from "../typescript/books_library_interfaces";

export const getAllLanguages = zodHandler(
  {
    response: z.array(BooksLibraryLanguageSchema),
  },
  async (req, res) => {
    const { pb } = req;

    const languages = await LanguagesService.getAllLanguages(pb);

    successWithBaseResponse(res, languages);
  },
);

export const createLanguage = zodHandler(
  {
    body: BooksLibraryLanguageSchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryLanguageSchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { name, icon } = req.body;

    const language = await LanguagesService.createLanguage(pb, { name, icon });

    successWithBaseResponse(res, language, 201);
  },
);

export const updateLanguage = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: BooksLibraryLanguageSchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryLanguageSchema),
  },
  async (req, res) => {
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
  },
);

export const deleteLanguage = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "languages", id))) {
      return;
    }

    await LanguagesService.deleteLanguage(pb, id);

    successWithBaseResponse(res, undefined, 204);
  },
);
