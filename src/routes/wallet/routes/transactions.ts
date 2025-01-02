import fs from "fs";
import express, { Request, Response } from "express";
import moment from "moment";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import { singleUploadMiddleware } from "../../../middleware/uploadMiddleware.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import {
  IWalletIncomeExpenses,
  IWalletTransactionEntry,
} from "../../../interfaces/wallet_interfaces.js";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces.js";
import { body, query } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";
import { fromPath } from "pdf2pic";

const router = express.Router();

function convertPDFToImage(path: string): Promise<File | undefined> {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        density: 200,
        quality: 100,
        saveFilename: "receipt",
        savePath: "uploads",
        format: "png",
        width: 2000,
        preserveAspectRatio: true,
      };

      const convert = fromPath(path, options);
      const pageToConvertAsImage = 1;

      convert(pageToConvertAsImage, { responseType: "buffer" }).then(
        (responseBuffer) => {
          if (!responseBuffer.buffer) {
            resolve(undefined);
            return;
          }

          const thumbnailFile = new File(
            [responseBuffer.buffer],
            `receipt.png`,
            {
              type: "image/png",
            }
          );

          resolve(thumbnailFile);

          fs.unlinkSync(path);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @protected
 * @summary Get a list of all wallet transactions
 * @description Retrieve a list of all wallet transactions.
 * @response 200 (IWalletTransactionEntry[]) - The list of wallet transactions
 */
router.get(
  "/",
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IWalletIncomeExpenses[]>>
    ) => list(req, res, "wallet_transactions", { sort: "-date,-created" })
  )
);

/**
 * @protected
 * @summary Get the summarized amount of income and expenses
 * @description Retrieve the total amount of income and expenses, as well as the amount of income and expenses in a specific month.
 * @query year (number, required) - The year to filter by (YYYY)
 * @query month (number, required) - The month to filter by (M)
 * @response 200 (IWalletIncomeExpenses) - The total and monthly income and expenses
 */
router.get(
  "/income-expenses",
  [query("year").isNumeric(), query("month").isNumeric()],
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IWalletIncomeExpenses>>
    ) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { year, month } = req.query;

      const start = moment(`${year}-${month}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      const end = moment(`${year}-${month}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");

      const transactions = await pb
        .collection("wallet_transactions")
        .getFullList({
          filter: "type = 'income' || type = 'expenses'",
          sort: "-date,-created",
        });

      const inThisMonth = transactions.filter(
        (transaction) =>
          moment(moment(transaction.date).format("YYYY-MM-DD")).isSameOrAfter(
            start
          ) &&
          moment(moment(transaction.date).format("YYYY-MM-DD")).isSameOrBefore(
            end
          )
      );

      const totalIncome = transactions.reduce((acc, cur) => {
        if (cur.type === "income") {
          return acc + cur.amount;
        }

        return acc;
      }, 0);

      const totalExpenses = transactions.reduce((acc, cur) => {
        if (cur.type === "expenses") {
          return acc + cur.amount;
        }

        return acc;
      }, 0);

      const monthlyIncome = inThisMonth.reduce((acc, cur) => {
        if (cur.type === "income") {
          return acc + cur.amount;
        }

        return acc;
      }, 0);

      const monthlyExpenses = inThisMonth.reduce((acc, cur) => {
        if (cur.type === "expenses") {
          return acc + cur.amount;
        }

        return acc;
      }, 0);

      successWithBaseResponse(res, {
        totalIncome,
        totalExpenses,
        monthlyIncome,
        monthlyExpenses,
      });
    }
  )
);

/**
 * @protected
 * @summary Create a new wallet transaction
 * @description Create a new wallet transaction with the given particulars, date, amount, category, asset, ledger, type, and side.
 * @body type (string, required, one_of income|expenses|transfer) - The type of the transaction
 * @body particulars (string, required) - The particulars of the transaction
 * @body date (string, required) - The date of the transaction (any valid date string that can be parsed by moment.js)
 * @body amount (number, required) - The amount of the transaction
 * @body location (string, optional) - The location where the transaction took place
 * @body category (string, optional, must_exist) - The ID of the category, will raise an error if the type is transfer
 * @body asset (string, required if type is not transfer, must_exist) - The ID of the asset, will raise an error if the type is transfer
 * @body ledger (string, optional) - The ID of the ledger, will raise an error if the type is transfer
 * @body fromAsset (string, required if type is transfer, must_exist) - The ID of the asset to transfer from
 * @body toAsset (string, required if type is transfer, must_exist) - The ID of the asset to transfer to
 * @response 201 (IWalletTransactionEntry[]) - The created wallet transaction
 */
router.post(
  "/",
  singleUploadMiddleware,
  [
    body("particulars").isString(),
    body("date").custom((value: string) => {
      if (!value) {
        throw new Error("Invalid value");
      }

      if (!moment(value).isValid()) {
        throw new Error("Invalid value");
      }

      return true;
    }),
    body("amount").isNumeric(),
    body("location").optional().isString(),
    body("category").isString().optional(),
    body("asset").custom((value: string, { req }) => {
      if (req.body.type === "transfer") {
        return !!!value;
      }

      return ["income", "expenses"].includes(req.body.type)
        ? typeof value === "string" && value.length > 0
        : true;
    }),
    body("ledger").isString().optional(),
    body("type").isIn(["income", "expenses", "transfer"]),
    body("fromAsset").custom((value: string, { req }) => {
      if (req.body.type !== "transfer") {
        return !!!value;
      }

      return typeof value === "string" && value.length > 0;
    }),
    body("toAsset").custom((value: string, { req }) => {
      if (req.body.type !== "transfer") {
        return !!!value;
      }

      return typeof value === "string" && value.length > 0;
    }),
  ],
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IWalletTransactionEntry[]>>
    ) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      let {
        particulars,
        date,
        amount,
        category,
        location,
        asset,
        ledger,
        type,
        fromAsset,
        toAsset,
      } = req.body;

      const categoryExists = category
        ? await checkExistence(
            req,
            res,
            "wallet_categories",
            category,
            "category"
          )
        : true;
      const assetExists = ["income", "expenses"].includes(type)
        ? await checkExistence(req, res, "wallet_assets", asset, "asset")
        : true;
      const ledgerExists = ledger
        ? await checkExistence(req, res, "wallet_ledgers", ledger, "ledger")
        : true;
      const fromAssetExists =
        type === "transfer"
          ? await checkExistence(
              req,
              res,
              "wallet_assets",
              fromAsset,
              "fromAsset"
            )
          : true;
      const toAssetExists =
        type === "transfer"
          ? await checkExistence(req, res, "wallet_assets", toAsset, "toAsset")
          : true;

      if (
        !categoryExists ||
        !assetExists ||
        !ledgerExists ||
        !fromAssetExists ||
        !toAssetExists
      )
        return;

      amount = +amount;

      let file: File | Express.Multer.File | undefined = req.file;

      if (file) file.originalname = decodeURIComponent(file.originalname);

      const path = file?.originalname.split("/") ?? [];
      const name = path.pop();

      if (file?.originalname.endsWith(".pdf")) {
        file = await convertPDFToImage(file.path);
      }

      let created: IWalletTransactionEntry[] = [];

      if (type === "income" || type === "expenses") {
        const newData: WithoutPBDefault<
          Omit<IWalletTransactionEntry, "receipt">
        > & {
          receipt: File | "";
        } = {
          particulars,
          date,
          amount,
          location,
          category,
          asset,
          ledger,
          type,
          side: type === "income" ? "debit" : "credit",
          receipt:
            file instanceof File
              ? file
              : file && fs.existsSync(file.path)
                ? (() => {
                    const fileBuffer = fs.readFileSync(file.path);
                    return new File([fileBuffer], name ?? "receipt.jpg", {
                      type: file.mimetype,
                    });
                  })()
                : "",
        };

        const transaction: IWalletTransactionEntry = await pb
          .collection("wallet_transactions")
          .create(newData);
        created = [transaction];
      }

      if (type === "transfer") {
        const _from = await pb.collection("wallet_assets").getOne(fromAsset);
        const _to = await pb.collection("wallet_assets").getOne(toAsset);

        if (!_from || !_to) {
          clientError(res, "Invalid asset");
          return;
        }

        const baseTransferData: WithoutPBDefault<
          Omit<IWalletTransactionEntry, "receipt" | "category" | "ledger">
        > & {
          receipt: File | string;
        } = {
          type: "transfer",
          particulars: "",
          date,
          amount,
          side: "debit",
          asset: "",
          receipt:
            file instanceof File
              ? file
              : file && fs.existsSync(file.path)
                ? (() => {
                    const fileBuffer = fs.readFileSync(file.path);
                    return new File([fileBuffer], name ?? "receipt.jpg", {
                      type: file.mimetype,
                    });
                  })()
                : "",
        };

        baseTransferData.particulars = `Transfer from ${_from.name}`;
        baseTransferData.asset = toAsset;
        const debit: IWalletTransactionEntry = await pb
          .collection("wallet_transactions")
          .create(baseTransferData);

        baseTransferData.particulars = `Transfer to ${_to.name}`;
        baseTransferData.side = "credit";
        baseTransferData.asset = fromAsset;
        const credit: IWalletTransactionEntry = await pb
          .collection("wallet_transactions")
          .create(baseTransferData);

        created = [debit, credit];
      }

      if (!(file instanceof File) && file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      successWithBaseResponse(res, created, 201);
    }
  )
);

/**
 * @protected
 * @summary Update a wallet transaction
 * @description Update a wallet income or expenses transaction with the given particulars, date, amount, category, asset, ledger, type, and side.
 * @param id (string, required, must_exist) - The ID of the transaction
 * @body particulars (string, required) - The particulars of the transaction
 * @body date (string, required) - The date of the transaction (any valid date string that can be parsed by moment.js)
 * @body amount (number, required) - The amount of the transaction
 * @body location (string, optional) - The location where the transaction took place
 * @body category (string, optional, must_exist) - The ID of the category
 * @body asset (string, optional, must_exist) - The ID of the asset
 * @body ledger (string, optional, must_exist) - The ID of the ledger
 * @body type (string, required, one_of income|expenses) - The type of the transaction
 * @response 200 (IWalletTransactionEntry) - The updated wallet transaction
 */
router.patch(
  "/:id",
  singleUploadMiddleware,
  [
    body("particulars").isString(),
    body("date").custom((value: string) => {
      if (!value) {
        throw new Error("Invalid value");
      }

      if (!moment(value).isValid()) {
        throw new Error("Invalid value");
      }

      return true;
    }),
    body("amount").isNumeric(),
    body("location").optional().isString(),
    body("category").isString().optional(),
    body("asset").isString().optional(),
    body("ledger").isString().optional(),
    body("type").isIn(["income", "expenses"]),
  ],
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IWalletTransactionEntry>>
    ) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      let {
        particulars,
        date,
        amount,
        category,
        location,
        asset,
        ledger,
        type,
        removeReceipt,
      } = req.body;

      const entryExists = await checkExistence(
        req,
        res,
        "wallet_transactions",
        id,
        "id"
      );

      const categoryExists = category
        ? await checkExistence(
            req,
            res,
            "wallet_categories",
            category,
            "category"
          )
        : true;

      const assetExists = await checkExistence(
        req,
        res,
        "wallet_assets",
        asset,
        "asset"
      );

      const ledgerExists = ledger
        ? await checkExistence(req, res, "wallet_ledgers", ledger, "ledger")
        : true;

      if (!entryExists || !categoryExists || !assetExists || !ledgerExists) {
        return;
      }

      let file: File | Express.Multer.File | undefined = req.file;

      if (!(await checkExistence(req, res, "wallet_transactions", id, "id"))) {
        if (file) fs.unlinkSync(file.path);
        return;
      }

      if (file) file.originalname = decodeURIComponent(file.originalname);

      const path = file?.originalname.split("/") ?? [];
      const name = path.pop();

      if (file?.originalname.endsWith(".pdf")) {
        file = await convertPDFToImage(file.path);
      }

      const foundTransaction = await pb
        .collection("wallet_transactions")
        .getOne(id);

      amount = +amount;

      const updatedData: WithoutPBDefault<
        Omit<IWalletTransactionEntry, "receipt">
      > & {
        receipt: File;
      } = {
        particulars,
        date,
        amount,
        category,
        location,
        asset,
        ledger,
        type,
        side: type === "income" ? "debit" : "credit",
        receipt:
          file instanceof File
            ? file
            : (() => {
                if (file && fs.existsSync(file.path)) {
                  const fileBuffer = fs.readFileSync(file.path);
                  return new File([fileBuffer], name ?? "receipt.jpg", {
                    type: file.mimetype,
                  });
                }

                if (removeReceipt) {
                  return "";
                }

                return foundTransaction.receipt;
              })(),
      };

      const transaction: IWalletTransactionEntry = await pb
        .collection("wallet_transactions")
        .update(id, updatedData);

      if (!(file instanceof File) && file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      successWithBaseResponse(res, transaction);
    }
  )
);

/**
 * @protected
 * @summary Delete a wallet transaction
 * @description Delete a wallet transaction with the given ID.
 * @param id (string, required, must_exist) - The ID of the transaction
 * @response 204 - The wallet transaction was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wallet_transactions", id, "id")))
      return;

    await pb.collection("wallet_transactions").getOne(id);

    await pb.collection("wallet_transactions").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
