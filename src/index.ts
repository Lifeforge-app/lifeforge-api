import traceRouteStack from "@functions/traceRouteStack";

import app from "./core/app";

app.listen(process.env.PORT, () => {
  const routes = traceRouteStack(app._router.stack);

  console.log(`Registered routes: ${routes.length}`);
  console.log(`Server running on port ${process.env.PORT}`);
});
