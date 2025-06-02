import express from "express";

import { serverError, successWithBaseResponse } from "@utils/response";

const router = express.Router();

router.get("/:difficulty", async (req, res) => {
  const boards: any[] = [];

  const count = parseInt((req.query.count as string) || "6") || 6;

  for (let i = 0; i < count; i++) {
    await fetch(`https://sudoku.com/api/v2/level/${req.params.difficulty}`, {
      method: "GET",
      headers: {
        "x-easy-locale": "en",
        "X-Requested-With": "XMLHttpRequest",
      },
    }).then(async (r) => {
      await r
        .json()
        .then((data) => {
          boards.push(data);
        })
        .catch((e) => {
          serverError(res, e);
        });
    });
  }

  successWithBaseResponse(res, boards);
});

export default router;
