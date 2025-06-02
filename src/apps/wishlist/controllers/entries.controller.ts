import { BaseResponse } from "@typescript/base_response";
import { WithoutPBDefault } from "@typescript/pocketbase_interfaces";
import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Response } from "express";
import fs from "fs";
import * as entriesService from "../services/entries.service";
import { IWishlistEntry } from "../typescript/wishlist_interfaces";

export const getCollectionId = async (req: any, res: Response) => {
  const { pb } = req;

  const collectionId = await entriesService.getCollectionId(pb);
  successWithBaseResponse(res, collectionId);
};

export const getEntriesByListId = async (req: any, res: Response) => {
  const { pb } = req;
  const { id } = req.params;
  const bought = req.query.bought ? req.query.bought === "true" : undefined;

  if (!(await checkExistence(req, res, "wishlist_lists", id))) {
    return;
  }

  const entries = await entriesService.getEntriesByListId(pb, id, bought);
  successWithBaseResponse(res, entries);
};

export const scrapeExternal = async (req: any, res: Response) => {
  const { pb } = req;

  const { url, provider } = req.body;

  const result = await entriesService.scrapeExternal(pb, provider, url);

  if (!result) {
    serverError(res, "Error scraping provider");
    return;
  }

  successWithBaseResponse(res, result);
};

export const createEntry = async (
  req: any,
  res: Response<BaseResponse<IWishlistEntry>>,
) => {
  const { pb } = req;
  const { name, url, price, list } = req.body;

  if (!(await checkExistence(req, res, "wishlist_lists", list))) {
    return;
  }

  const finalData: Omit<WithoutPBDefault<IWishlistEntry>, "image"> & {
    image?: File;
  } = {
    name,
    url,
    price,
    list,
    bought: false,
  };

  if (req.file) {
    finalData.image = new File([req.file.buffer], req.file.originalname);
  } else if (req.body.image) {
    const { image } = req.body;

    const response = await fetch(image);
    const fileBuffer = await response.arrayBuffer();
    finalData.image = new File(
      [new Uint8Array(fileBuffer)],
      image.split("/").pop(),
    );
  }

  const entry = await entriesService.createEntry(pb, finalData);
  successWithBaseResponse(res, entry, 201);
};

export const updateEntry = async (req: any, res: Response) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wishlist_entries", id))) {
    return;
  }

  const { list, name, url, price, imageRemoved } = req.body;
  const file = req.file;
  let finalFile: null | File = null;

  if (imageRemoved === "true") {
    finalFile = null;
  }

  if (file) {
    const fileBuffer = fs.readFileSync(file.path);
    finalFile = new File([fileBuffer], file.originalname);
  }

  const oldEntry = await entriesService.getEntry(pb, id);

  const entry = await entriesService.updateEntry(pb, id, {
    list,
    name,
    url,
    price,
    ...(imageRemoved === "true" || finalFile ? { image: finalFile } : {}),
  });

  successWithBaseResponse(res, oldEntry.list === list ? entry : "removed");
};

export const updateEntryBoughtStatus = async (req: any, res: Response) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wishlist_entries", id))) {
    return;
  }

  const entry = await entriesService.updateEntryBoughtStatus(pb, id);
  successWithBaseResponse(res, entry);
};

export const deleteEntry = async (req: any, res: Response<BaseResponse>) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wishlist_entries", id))) {
    return;
  }

  await entriesService.deleteEntry(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
