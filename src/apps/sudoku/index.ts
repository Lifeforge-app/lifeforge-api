import express from "express";
import { z } from "zod";

import { zodHandler } from "@utils/asyncWrapper";

const router = express.Router();

router.get(
  "/:difficulty",
  zodHandler(
    {
      params: z.object({
        difficulty: z.enum(["easy", "medium", "hard", "expert", "evil"]),
      }),
      query: z.object({
        count: z
          .string()
          .optional()
          .default("6")
          .transform((val) => parseInt(val, 10) || 6),
      }),
      response: z.array(
        z.object({
          id: z.number(),
          mission: z.string(),
          solution: z.string(),
          win_rate: z.number(),
        }),
      ),
    },
    async ({ params, query }) => {
      const boards: any[] = [];

      for (let i = 0; i < query.count; i++) {
        await fetch(`https://sudoku.com/api/v2/level/${params.difficulty}`, {
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
              throw new Error("Failed to parse response: " + e.message);
            });
        });
      }

      return boards;
    },
  ),
);

export default router;
