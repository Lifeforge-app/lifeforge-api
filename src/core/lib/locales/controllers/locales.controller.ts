import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import { ALLOWED_LANG, ALLOWED_NAMESPACE } from "../../../constants/locales";
import * as LocalesService from "../services/locales.service";

export const getLocales = forgeController(
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
