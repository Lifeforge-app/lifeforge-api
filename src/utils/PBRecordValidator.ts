import { clientError } from "./response.js";
import { Request, Response } from "express";

export async function checkExistence(
  req: Request,
  res: Response,
  collection: string,
  id: string,
  item: string,
  sendError = true
): Promise<boolean> {
  const found =
    (await req.pb
      .collection(collection)
      .getOne(id)
      .then(() => true)
      .catch((err) => {
        sendError && clientError(res, `${item}: Not found`, 404);
      })) ?? false;

  return found;
}
