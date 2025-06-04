import _ from "lodash";
import z from "zod/v4";

import { zodHandler } from "@utils/asyncWrapper";

import * as ModuleService from "../services/modules.service";

export const toggleModule = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await ModuleService.toggleModule(pb, id),
  {
    existenceCheck: {
      params: {
        id: "modules_entries",
      },
    },
  },
);

export const listAppPaths = zodHandler(
  {
    response: z.array(z.string()),
  },
  async () => ModuleService.listAppPaths(),
);

export const packageModule = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ params: { id }, res }) => {
    const backendZip = await ModuleService.packageModule(id);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${_.kebabCase(id)}.zip"`,
    );
    res.setHeader("Content-Length", backendZip.length);

    // @ts-expect-error - Custom response
    res.send(backendZip);
  },
  {
    noDefaultResponse: true,
  },
);

export const installModule = zodHandler(
  {
    body: z.object({
      name: z.string().min(1, "Name is required"),
    }),
    response: z.void(),
  },
  async ({ body: { name }, req: { file } }) =>
    ModuleService.installModule(name, file),
);
