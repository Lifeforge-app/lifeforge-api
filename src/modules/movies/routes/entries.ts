import express from "express";
import { param } from "express-validator";
import asyncWrapper from "../../../utils/asyncWrapper";
import { getAPIKey } from "../../../utils/getAPIKey";
import { checkExistence } from "../../../utils/PBRecordValidator";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "../../../utils/response";

const router = express.Router();

router.get(
  "/",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    const entries = await pb.collection("movies_entries").getFullList({
      sort: "-created",
    });

    successWithBaseResponse(res, entries);
  }),
);

const updateTicket = asyncWrapper(async (req, res) => {
  const { pb } = req;

  const {
    entry_id,
    ticket_number,
    theatre_location,
    theatre_number,
    theatre_seat,
    theatre_showtime,
  } = req.body;

  if (!checkExistence(req, res, "movies_entries", entry_id)) {
    return;
  }

  const updatedEntry = await pb.collection("movies_entries").update(entry_id, {
    ticket_number,
    theatre_location,
    theatre_number,
    theatre_seat,
    theatre_showtime,
  });

  successWithBaseResponse(res, updatedEntry);
});

router.post("/ticket", updateTicket);

router.patch("/ticket/:id", updateTicket);

router.delete(
  "/ticket/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!checkExistence(req, res, "movies_entries", id)) {
      return;
    }

    await pb.collection("movies_entries").update(id, {
      ticket_number: "",
      theatre_location: "",
      theatre_number: "",
      theatre_seat: "",
      theatre_showtime: "",
    });

    return successWithBaseResponse(res, undefined, 204);
  }),
);

router.post(
  "/:id",
  [param("id").isInt({ min: 1 })],
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;
    const apiKey = await getAPIKey("tmdb", pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    const url = `https://api.themoviedb.org/3/movie/${id}`;

    const existedData = await pb
      .collection("movies_entries")
      .getFirstListItem(`tmdb_id = ${id}`)
      .catch(() => null);

    if (existedData) {
      clientError(res, "Entry already exists");
      return;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }).then((res) => res.json());

      const entryData = {
        tmdb_id: response.id,
        title: response.title,
        original_title: response.original_title,
        poster: response.poster_path,
        genres: response.genres.map((genre: { name: string }) => genre.name),
        duration: response.runtime,
        overview: response.overview,
        release_date: response.release_date,
        countries: response.origin_country,
        language: response.original_language,
      };

      const newEntry = await pb.collection("movies_entries").create(entryData);

      successWithBaseResponse(res, newEntry);
    } catch (error) {
      if (error instanceof Error) {
        serverError(res, error.message);
      } else {
        serverError(res, "Unknown error");
      }
    }
  }),
);

router.delete(
  "/:id",
  [param("id").isString()],
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;

    if (!checkExistence(req, res, "movies_entries", id)) {
      return;
    }

    await pb.collection("movies_entries").delete(id);

    successWithBaseResponse(res, undefined, 204);
  }),
);

export default router;
