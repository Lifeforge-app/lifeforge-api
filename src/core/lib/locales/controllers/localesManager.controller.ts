import fs from "fs";
import { z } from "zod/v4";

import ClientError from "@utils/ClientError";
import { fetchAI } from "@utils/fetchAI";
import { forgeController } from "@utils/forgeController";

import { ALLOWED_LANG, ALLOWED_NAMESPACE } from "../../../constants/locales";
import * as LocalesManagerService from "../services/localesManager.service";

export const listSubnamespaces = forgeController(
  {
    params: z.object({
      namespace: z.enum(ALLOWED_NAMESPACE),
    }),
    response: z.array(z.string()),
  },
  async ({ params: { namespace } }) =>
    LocalesManagerService.listSubnamespaces(namespace),
);

export const listLocales = forgeController(
  {
    params: z.object({
      namespace: z.enum(ALLOWED_NAMESPACE),
      subnamespace: z.string(),
    }),
    response: z.record(z.enum(ALLOWED_LANG).exclude(["zh"]), z.string()),
  },
  async ({ params: { namespace, subnamespace } }) =>
    LocalesManagerService.listLocales(namespace, subnamespace),
);

export const syncLocales = forgeController(
  {
    body: z.object({
      data: z.record(
        z.string(),
        z.record(z.enum(ALLOWED_LANG).exclude(["zh"]), z.string()),
      ),
    }),
    params: z.object({
      namespace: z.enum(["apps", "common", "utils", "core"]),
      subnamespace: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ body: { data }, params: { namespace, subnamespace } }) =>
    LocalesManagerService.syncLocales(data, namespace, subnamespace),
);

export const createLocale = forgeController(
  {
    params: z.object({
      type: z.enum(["entry", "folder"]),
      namespace: z.enum(ALLOWED_NAMESPACE),
      subnamespace: z.string(),
    }),
    body: z.object({
      path: z.string().optional().default(""),
    }),
    response: z.boolean(),
  },
  async ({ params: { type, namespace, subnamespace }, body: { path } }) =>
    LocalesManagerService.createLocale(type, namespace, subnamespace, path),
  {
    statusCode: 201,
  },
);

export const renameLocale = forgeController(
  {
    params: z.object({
      namespace: z.enum(ALLOWED_NAMESPACE),
      subnamespace: z.string(),
    }),
    body: z.object({
      path: z.string().optional().default(""),
      newName: z.string().optional().default(""),
    }),
    response: z.boolean(),
  },
  async ({ params: { namespace, subnamespace }, body: { path, newName } }) =>
    LocalesManagerService.renameLocale(namespace, subnamespace, path, newName),
);

export const deleteLocale = forgeController(
  {
    params: z.object({
      namespace: z.enum(ALLOWED_NAMESPACE),
      subnamespace: z.string(),
    }),
    body: z.object({
      path: z.string().optional().default(""),
    }),
    response: z.boolean(),
  },
  async ({ params: { namespace, subnamespace }, body: { path } }) =>
    LocalesManagerService.deleteLocale(namespace, subnamespace, path),
  {
    statusCode: 204,
  },
);

export const getTranslationSuggestions = forgeController(
  {
    params: z.object({
      namespace: z.enum(ALLOWED_NAMESPACE),
      subnamespace: z.string(),
    }),
    body: z.object({
      path: z.string(),
      hint: z.string().optional().default(""),
    }),
    response: z.object({
      en: z.string(),
      ms: z.string(),
      "zh-CN": z.string(),
      "zh-TW": z.string(),
    }),
  },
  async ({ pb, params: { namespace, subnamespace }, body: { path, hint } }) =>
    await LocalesManagerService.getTranslationSuggestions(
      namespace,
      subnamespace,
      path,
      hint,
      pb,
    ),
);
