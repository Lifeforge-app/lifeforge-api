import { clientError } from "./response";
import { Request, Response } from "express";

export async function checkExistence(
  req: Request,
  res: Response,
  collection: string,
  id: string,
  sendError = true
): Promise<boolean> {
  const found =
    (await req.pb
      .collection(collection)
      .getOne(id)
      .then(() => true)
      .catch(() => {})) ?? false;

  if (!found && sendError) {
    clientError(res, `Related record not found in database`, 400);
  }

  return found;
}
