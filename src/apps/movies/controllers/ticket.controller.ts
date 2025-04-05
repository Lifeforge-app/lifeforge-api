import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as TicketService from "../services/ticket.service";
import { IMovieEntry } from "../typescript/movies_interfaces";

export const updateTicket = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  const { pb } = req;
  const {
    entry_id,
    ticket_number,
    theatre_location,
    theatre_number,
    theatre_seat,
    theatre_showtime,
  } = req.body;

  if (!(await checkExistence(req, res, "movies_entries", entry_id))) {
    return;
  }

  const updatedEntry = await TicketService.updateTicket(pb, entry_id, {
    ticket_number,
    theatre_location,
    theatre_number,
    theatre_seat,
    theatre_showtime,
  });

  successWithBaseResponse(res, updatedEntry);
};

export const addToCalendar = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { category } = req.query;

  if (!(await checkExistence(req, res, "movies_entries", id))) {
    return;
  }

  if (
    !(await checkExistence(req, res, "calendar_categories", category as string))
  ) {
    return;
  }

  const updatedEntry = await TicketService.addToCalendar(
    pb,
    id,
    category as string,
  );
  successWithBaseResponse(res, updatedEntry);
};

export const clearTicket = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "movies_entries", id))) {
    return;
  }

  await TicketService.clearTicket(pb, id);
  return successWithBaseResponse(res, undefined, 204);
};
