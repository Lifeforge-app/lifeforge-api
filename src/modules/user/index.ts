import express from "express";
import { successWithBaseResponse } from "../../utils/response";
import asyncWrapper from "../../utils/asyncWrapper";
import settingsRoutes from "./routes/settings";
import authRoutes from "./routes/auth";
import personalizationRoutes from "./routes/personalization";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/personalization", personalizationRoutes);

/**
 * @protected
 * @summary Change the module enabled status
 * @description Change the enabled status of all toggled modules.
 * @body data (array, required) - The array of enabled modules
 * @response 200 - The module status has been updated
 */
router.patch(
  "/module",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { data } = req.body;
    await pb.collection("users").update(req.pb.authStore.record!.id, {
      enabledModules: data,
    });

    successWithBaseResponse(res);
  })
);

export default router;
