import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as TicketService from "../services/ticket.service";
import { IMovieEntry } from "../typescript/movies_interfaces";

export const updateTicket = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  try {
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

    const updatedEntry = await TicketService.updateTicket(pb, entry_id, {
      ticket_number,
      theatre_location,
      theatre_number,
      theatre_seat,
      theatre_showtime,
    });

    successWithBaseResponse(res, updatedEntry);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to update ticket");
  }
};

export const clearTicket = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  try {
    const { pb } = req;
    const { id } = req.params;

    if (!checkExistence(req, res, "movies_entries", id)) {
      return;
    }

    await TicketService.clearTicket(pb, id);
    return successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to clear ticket");
  }
};
