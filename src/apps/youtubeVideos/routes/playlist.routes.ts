import asyncWrapper from "@utils/asyncWrapper";
import { serverError, successWithBaseResponse } from "@utils/response";
import express from "express";
import { param } from "express-validator";
import getPlaylist from "../functions/getPlaylist";

const router = express.Router();

router.get(
  "/get-info/:id",
  param("id").isString(),
  asyncWrapper(async (req, res) => {
    const { id } = req.params;

    await getPlaylist(`https://www.youtube.com/playlist?list=${id}`)
      .then((playlist) => {
        successWithBaseResponse(res, playlist);
      })
      .catch(() => {
        serverError(res, "Error fetching playlist");
      });
  }),
);

export default router;
