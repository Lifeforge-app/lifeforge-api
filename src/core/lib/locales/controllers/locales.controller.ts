import { z } from "zod/v4";

import { zodHandler } from "@utils/asyncWrapper";

import { ALLOWED_LANG, ALLOWED_NAMESPACE } from "../../../constants/locales";
import * as LocalesService from "../services/locales.service";

export const getLocales = zodHandler(
  {
    params: z.object({
      lang: z.enum(ALLOWED_LANG),
      namespace: z.enum(ALLOWED_NAMESPACE),
      subnamespace: z.string(),
    }),
    response: z.any(),
  },
  async ({ params: { lang, namespace, subnamespace } }) =>
    LocalesService.getLocales(lang, namespace, subnamespace),
);
