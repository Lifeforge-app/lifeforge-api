import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import request from "request";
import * as libgenService from "../services/libgen.service";

export const getStatus = async (req: Request, res: Response) => {
  const status = await libgenService.getStatus();
  successWithBaseResponse(res, status);
};

export const searchBooks = async (req: Request, res: Response) => {
  const queries = req.query as Record<string, string>;
  const result = await libgenService.searchBooks(queries);
  successWithBaseResponse(res, result);
};

export const getBookDetails = async (req: Request, res: Response) => {
  const { md5, tlm } = req.params;
  const bookDetails = await libgenService.getBookDetails(md5, tlm);
  successWithBaseResponse(res, bookDetails);
};

export const getLocalLibraryData = async (req: Request, res: Response) => {
  const { md5, tlm } = req.params;
  const libraryData = await libgenService.getLocalLibraryData(md5, tlm);
  successWithBaseResponse(res, libraryData);
};

export const fetchCover = async (req: Request, res: Response) => {
  request(`http://libgen.is/covers/${req.params[0]}`).pipe(res);
};

export const addToLibrary = async (req: Request, res: Response) => {
  const { pb } = req;
  const { metadata } = req.body;
  const { md5 } = req.params;

  await libgenService.initiateDownload(pb, md5, metadata);
  successWithBaseResponse(res, {}, 202);
};

export const getDownloadProgresses = async (req: Request, res: Response) => {
  const progresses = libgenService.getDownloadProgresses();
  successWithBaseResponse(res, progresses);
};

export const cancelDownload = async (req: Request, res: Response) => {
  const { md5 } = req.params;
  libgenService.cancelDownload(md5);
  successWithBaseResponse(res, undefined, 204);
};
