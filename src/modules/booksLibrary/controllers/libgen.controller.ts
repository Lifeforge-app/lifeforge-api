import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";
import { Request, Response } from "express";
import request from "request";
import * as libgenService from "../services/libgen.service";

export const searchBooks = async (req: Request, res: Response) => {
  try {
    const queries = req.query as Record<string, string>;
    const result = await libgenService.searchBooks(queries);
    successWithBaseResponse(res, result);
  } catch (error: any) {
    clientError(res, error.message);
  }
};

export const getBookDetails = async (req: Request, res: Response) => {
  try {
    const { md5, tlm } = req.params;
    const bookDetails = await libgenService.getBookDetails(md5, tlm);
    successWithBaseResponse(res, bookDetails);
  } catch (error: any) {
    clientError(res, error.message);
  }
};

export const getLocalLibraryData = async (req: Request, res: Response) => {
  try {
    const { md5, tlm } = req.params;
    const libraryData = await libgenService.getLocalLibraryData(md5, tlm);
    successWithBaseResponse(res, libraryData);
  } catch (error: any) {
    clientError(res, error.message);
  }
};

export const fetchCover = async (req: Request, res: Response) => {
  try {
    request(`http://libgen.is/covers/${req.params[0]}`).pipe(res);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch cover");
  }
};

export const addToLibrary = async (req: Request, res: Response) => {
  try {
    const { pb } = req;
    const { metadata } = req.body;
    const { md5 } = req.params;

    await libgenService.initiateDownload(pb, md5, metadata);
    successWithBaseResponse(res, {}, 202);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to add book to library");
  }
};

export const getDownloadProgresses = async (req: Request, res: Response) => {
  try {
    const progresses = libgenService.getDownloadProgresses();
    successWithBaseResponse(res, progresses);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch download progresses");
  }
};

export const cancelDownload = async (req: Request, res: Response) => {
  try {
    const { md5 } = req.params;
    libgenService.cancelDownload(md5);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to cancel download");
  }
};
