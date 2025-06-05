import { zodToTs } from "zod-to-ts";
import { z } from "zod/v4";

import app from "./core/app";

function traceRouteStack(stack: any, path = "", routes: string[] = []) {
  for (const layer of stack) {
    if (layer.handle.name === "router") {
      const pathName =
        layer.regexp
          .toString()
          .match(/\/\^\\\/(.*?)\\\/\?\(\?\=\\\/\|\$\)\/i/)?.[1] ?? "";

      const fullPath = [path, pathName].filter(Boolean).join("/");

      traceRouteStack(layer.handle.stack, fullPath, routes);
    }

    if (layer.handle.name === "bound dispatch") {
      const method = layer.route?.methods || {};
      const methods = Object.keys(method).filter((m) => method[m]);

      const routePath = [path, layer.route?.path || ""]
        .filter(Boolean)
        .join("/")
        .replace(/\/+/g, "/")
        .replace(/\\\//g, "/");

      routes.push(`${methods[0].toUpperCase()} ${routePath}`);

      const stack = layer.route?.stack || [];
      const controllerLayerMeta = stack[stack.length - 1].handle.meta;
      if (!controllerLayerMeta) {
        continue;
      }

      const responseSchema = controllerLayerMeta.schema.response;

      try {
        if (!(responseSchema instanceof z.ZodVoid)) {
          z.toJSONSchema(controllerLayerMeta.schema.response);
        }
      } catch (error) {
        console.log(`${methods[0].toUpperCase()} ${routePath}`);
      }
    }
  }

  return routes;
}

app.listen(process.env.PORT, () => {
  const routes = traceRouteStack(app._router.stack);

  console.log(`Registered routes: ${routes.length}`);
  console.log(`Server running on port ${process.env.PORT}`);
});
