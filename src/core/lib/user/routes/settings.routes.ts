import asyncWrapper from "@utils/asyncWrapper";
import { clientError, successWithBaseResponse } from "@utils/response";
import express from "express";
import { body } from "express-validator";
import fs from "fs";
import moment from "moment";
import { singleUploadMiddleware } from "../../../middleware/uploadMiddleware";

const router = express.Router();

router.put(
  "/avatar",
  singleUploadMiddleware,
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    const file = req.file;

    if (!file) {
      clientError(res, "No file uploaded");
      return;
    }

    const { id } = pb.authStore.record as any;

    const fileBuffer = fs.readFileSync(file.path);

    const newRecord = await pb.collection("users").update(id, {
      avatar: new File(
        [fileBuffer],
        `${id}.${file.originalname.split(".").pop()}`,
      ),
    });

    fs.unlinkSync(file.path);

    successWithBaseResponse(res, newRecord.avatar);
  }),
);

router.delete(
  "/avatar",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = pb.authStore.record as any;

    await pb.collection("users").update(id, {
      avatar: null,
    });

    successWithBaseResponse(res, undefined, 204);
  }),
);

router.patch(
  "/",
  [
    body("data.username").optional().isAlphanumeric(),
    body("data.email").optional().isEmail(),
    body("data.name").optional().isString(),
    body("data.dateOfBirth").optional().isString(),
  ],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = pb.authStore.record as any;
    const { data } = req.body;

    if (data.email) {
      await pb.collection("users").requestEmailChange(data.email);
    }

    const newData: {
      username?: string;
      name?: string;
      dateOfBirth?: string;
    } = {};

    if (data.username) newData.username = data.username;
    if (data.name) newData.name = data.name;
    if (data.dateOfBirth)
      newData.dateOfBirth = `${moment(data.dateOfBirth).add(1, "day").format("YYYY-MM-DD")}T00:00:00.000Z`;

    await pb.collection("users").update(id, newData);

    successWithBaseResponse(res);
  }),
);

router.post(
  "/request-password-reset",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    await pb
      .collection("users")
      .requestPasswordReset(pb.authStore.record?.email);

    successWithBaseResponse(res);
  }),
);

export default router;
