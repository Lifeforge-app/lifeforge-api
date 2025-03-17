import Pocketbase from "pocketbase";

declare global {
  namespace Express {
    interface Request {
      pb: Pocketbase;
    }
  }
}
