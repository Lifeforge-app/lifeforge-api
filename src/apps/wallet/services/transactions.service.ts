import { fetchAI } from "@functions/fetchAI";
import parseOCR from "@functions/parseOCR";
import fs from "fs";
import { fromPath } from "pdf2pic";
import Pocketbase from "pocketbase";
import { z } from "zod";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IWalletReceiptScanResult, IWalletTransactionEntry } from "../schema";

function convertPDFToImage(path: string): Promise<File | undefined> {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        density: 200,
        quality: 100,
        saveFilename: "receipt",
        savePath: "medium",
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
            },
          );

          resolve(thumbnailFile);

          fs.unlinkSync(path);
        },
      );
    } catch (error) {
      reject(error);
    }
  });
}

export const getAllTransactions = (
  pb: Pocketbase,
): Promise<WithPB<IWalletTransactionEntry>[]> =>
  pb
    .collection("wallet__transactions")
    .getFullList<WithPB<IWalletTransactionEntry>>({
      sort: "-date,-created",
    });

export const createTransaction = async (
  pb: Pocketbase,
  data: Pick<
    IWalletTransactionEntry,
    "particulars" | "date" | "amount" | "type"
  > & {
    asset?: string;
    ledger?: string;
    category?: string;
    fromAsset?: string;
    toAsset?: string;
    location_name?: string;
    location_coords?: {
      lon: number;
      lat: number;
    };
  },
  file: Express.Multer.File | undefined,
): Promise<WithPB<IWalletTransactionEntry>[]> => {
  async function processFile(): Promise<
    [Express.Multer.File | File | undefined, string | undefined]
  > {
    let targetFile: Express.Multer.File | File | undefined = file;

    if (targetFile)
      targetFile.originalname = decodeURIComponent(targetFile.originalname);

    const path = file?.originalname.split("/") ?? [];
    const name = path.pop();

    if (file?.originalname.endsWith(".pdf")) {
      targetFile = await convertPDFToImage(file.path);
    }

    return [targetFile, name];
  }

  function getReceipt(): File | string {
    if (targetFile instanceof File) {
      return targetFile;
    }

    if (targetFile && fs.existsSync(targetFile.path)) {
      const fileBuffer = fs.readFileSync(targetFile.path);
      return new File([fileBuffer], fileName ?? "receipt.jpg", {
        type: targetFile.mimetype,
      });
    }

    return "";
  }

  async function createIncomeOrExpensesTransactions(): Promise<
    WithPB<IWalletTransactionEntry>[]
  > {
    const newData: Omit<
      IWalletTransactionEntry,
      "receipt" | "fromAsset" | "toAsset"
    > & {
      receipt: File | string;
    } = {
      particulars,
      date,
      amount,
      location_name: data.location_name || "",
      location_coords: data.location_coords ?? { lon: 0, lat: 0 },
      category: category || "",
      asset: asset || "",
      ledger: ledger || "",
      type,
      side: type === "income" ? "debit" : "credit",
      receipt: getReceipt(),
    };

    const transaction = await pb
      .collection("wallet__transactions")
      .create<WithPB<IWalletTransactionEntry>>(newData);

    return [transaction];
  }

  async function createTransferTransactions(): Promise<
    WithPB<IWalletTransactionEntry>[]
  > {
    const _from = await pb.collection("wallet__assets").getOne(fromAsset!);
    const _to = await pb.collection("wallet__assets").getOne(toAsset!);

    const baseTransferData: Omit<
      IWalletTransactionEntry,
      | "receipt"
      | "category"
      | "ledger"
      | "location_name"
      | "location_coords"
      | "fromAsset"
      | "toAsset"
    > & {
      receipt: File | string;
    } = {
      type: "transfer",
      particulars: "",
      date,
      amount,
      side: "debit",
      asset: "",
      receipt: getReceipt(),
    };

    baseTransferData.particulars = `Transfer from ${_from.name}`;
    baseTransferData.asset = toAsset!;
    const debit = await pb
      .collection("wallet__transactions")
      .create<WithPB<IWalletTransactionEntry>>(baseTransferData);

    baseTransferData.particulars = `Transfer to ${_to.name}`;
    baseTransferData.side = "credit";
    baseTransferData.asset = fromAsset!;
    const credit = await pb
      .collection("wallet__transactions")
      .create<WithPB<IWalletTransactionEntry>>(baseTransferData);

    return [debit, credit];
  }

  const {
    particulars,
    date,
    amount,
    category,
    asset,
    ledger,
    type,
    fromAsset,
    toAsset,
  } = data;

  let [targetFile, fileName] = await processFile();

  let created: WithPB<IWalletTransactionEntry>[] = [];

  switch (type) {
    case "income":
    case "expenses":
      created = await createIncomeOrExpensesTransactions();
      break;
    case "transfer":
      created = await createTransferTransactions();
      break;
  }

  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return created;
};

export const updateTransaction = async (
  pb: Pocketbase,
  id: string,
  data: Pick<
    IWalletTransactionEntry,
    "particulars" | "date" | "amount" | "type"
  > & {
    asset?: string;
    ledger?: string;
    category?: string;
    location_name?: string;
    location_coords?: {
      lon: number;
      lat: number;
    };
  },
  file: Express.Multer.File | undefined,
  toRemoveReceipt: boolean,
): Promise<WithPB<IWalletTransactionEntry>> => {
  async function processFile(): Promise<
    [Express.Multer.File | File | undefined, string | undefined]
  > {
    let targetFile: Express.Multer.File | File | undefined = file;

    if (targetFile)
      targetFile.originalname = decodeURIComponent(targetFile.originalname);

    const path = file?.originalname.split("/") ?? [];
    const name = path.pop();

    if (file?.originalname.endsWith(".pdf")) {
      targetFile = await convertPDFToImage(file.path);
    }

    return [targetFile, name];
  }

  function getReceipt(): File | string {
    if (targetFile instanceof File) {
      return targetFile;
    }

    if (targetFile && fs.existsSync(targetFile.path)) {
      const fileBuffer = fs.readFileSync(targetFile.path);
      return new File([fileBuffer], fileName ?? "receipt.jpg", {
        type: targetFile.mimetype,
      });
    }

    if (toRemoveReceipt) {
      return "";
    }

    return foundTransaction.receipt;
  }

  const {
    particulars,
    date,
    amount,
    category,
    location_name,
    location_coords,
    asset,
    ledger,
    type,
  } = data;

  const foundTransaction = await pb
    .collection("wallet__transactions")
    .getOne<WithPB<IWalletTransactionEntry>>(id);

  const [targetFile, fileName] = await processFile();

  if (!category || !asset) {
    throw new Error(
      "Category and Asset are required for updating a transaction",
    );
  }

  const updatedData: Omit<
    IWalletTransactionEntry,
    "receipt" | "fromAsset" | "toAsset"
  > & {
    receipt: File | string;
  } = {
    particulars,
    date,
    amount,
    category: category,
    location_name: location_name || "",
    location_coords: location_coords ?? { lon: 0, lat: 0 },
    asset,
    ledger: ledger ?? "",
    type,
    side: type === "income" ? "debit" : "credit",
    receipt: getReceipt(),
  };

  const transaction = await pb
    .collection("wallet__transactions")
    .update<WithPB<IWalletTransactionEntry>>(id, updatedData);

  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return transaction;
};

export const deleteTransaction = async (
  pb: Pocketbase,
  id: string,
): Promise<void> => {
  await pb.collection("wallet__transactions").delete(id);
};

export const scanReceipt = async (
  pb: Pocketbase,
  file: Express.Multer.File,
): Promise<IWalletReceiptScanResult> => {
  async function getTransactionDetails(): Promise<IWalletReceiptScanResult> {
    const TransactionDetails = z.object({
      date: z.string(),
      particulars: z.string(),
      type: z.union([z.literal("income"), z.literal("expenses")]),
      amount: z.number(),
    });

    const completion = await fetchAI({
      pb,
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract the following details from the text: date (in the format YYYY-MM-DD), particulars (e.g. what this transaction is about, e.g. Lunch, Purchase of <books, groceries,mineral water,etc>, Reload of xxx credit, etc. @ <Location(if applicable)>, don't list out the purchased item), type (income or expenses), and amount (without currency).",
        },
        {
          role: "user",
          content: OCRResult,
        },
      ],
      structure: TransactionDetails,
    });

    if (!completion) {
      throw new Error("Failed to extract transaction details");
    }

    return completion;
  }

  if (file.originalname.endsWith(".pdf")) {
    const image = await convertPDFToImage(file.path);

    if (!image) {
      throw new Error("Failed to convert PDF to image");
    }

    const buffer = await image.arrayBuffer();

    fs.writeFileSync("medium/receipt.png", Buffer.from(buffer));
  } else {
    fs.renameSync(file.path, "medium/receipt.png");
  }

  if (!fs.existsSync("medium/receipt.png")) {
    throw new Error("Receipt image not found");
  }

  const OCRResult = await parseOCR("medium/receipt.png");

  if (!OCRResult) {
    throw new Error("OCR parsing failed");
  }

  fs.unlinkSync("medium/receipt.png");

  const transaction = await getTransactionDetails();

  return transaction;
};
