import Pocketbase from "pocketbase";
import {
  IWalletIncomeExpensesSummary,
  IWalletReceiptScanResult,
  IWalletTransactionEntry,
} from "../../../interfaces/wallet_interfaces";
import moment from "moment";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";
import { fromPath } from "pdf2pic";
import fs from "fs";
import parseOCR from "../../../utils/parseOCR";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

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

export const getAllTransactions = async (
  pb: Pocketbase
): Promise<IWalletTransactionEntry[] | void> => {
  return pb
    .collection("wallet_transactions")
    .getFullList<IWalletTransactionEntry>({
      sort: "-date,-created",
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getIncomeExpensesSummary = async (
  pb: Pocketbase,
  year: string,
  month: string
): Promise<IWalletIncomeExpensesSummary | void> => {
  const start = moment(`${year}-${month}-01`)
    .startOf("month")
    .format("YYYY-MM-DD");
  const end = moment(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD");

  const transactions = await pb
    .collection("wallet_transactions")
    .getFullList({
      filter: "type = 'income' || type = 'expenses'",
      sort: "-date,-created",
    })
    .catch((error) => {
      console.error(error);
    });

  if (!transactions) {
    return;
  }

  const inThisMonth = transactions.filter(
    (transaction) =>
      moment(moment(transaction.date).format("YYYY-MM-DD")).isSameOrAfter(
        start
      ) &&
      moment(moment(transaction.date).format("YYYY-MM-DD")).isSameOrBefore(end)
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

  return {
    totalIncome,
    totalExpenses,
    monthlyIncome,
    monthlyExpenses,
  };
};

export const createTransaction = async (
  pb: Pocketbase,
  data: Omit<WithoutPBDefault<IWalletTransactionEntry>, "receipt" | "side">,
  file: Express.Multer.File | undefined
): Promise<IWalletTransactionEntry[] | void> => {
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

    if (!(file instanceof File) && file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
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
    IWalletTransactionEntry[] | void
  > {
    const newData: WithoutPBDefault<
      Omit<IWalletTransactionEntry, "receipt">
    > & {
      receipt: File | string;
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
      receipt: getReceipt(),
    };

    const transaction = await pb
      .collection("wallet_transactions")
      .create<IWalletTransactionEntry>(newData)
      .catch((error) => {
        console.error(error);
      });

    if (!transaction) {
      return;
    }

    return [transaction];
  }

  async function createTransferTransactions(): Promise<
    IWalletTransactionEntry[] | void
  > {
    const _from = await pb
      .collection("wallet_assets")
      .getOne(fromAsset!)
      .catch((error) => {
        console.error(error);
      });
    const _to = await pb
      .collection("wallet_assets")
      .getOne(toAsset!)
      .catch((error) => {
        console.error(error);
      });

    if (!_from || !_to) {
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
      receipt: getReceipt(),
    };

    baseTransferData.particulars = `Transfer from ${_from.name}`;
    baseTransferData.asset = toAsset!;
    const debit = await pb
      .collection("wallet_transactions")
      .create<IWalletTransactionEntry>(baseTransferData)
      .catch((error) => {
        console.error(error);
      });

    baseTransferData.particulars = `Transfer to ${_to.name}`;
    baseTransferData.side = "credit";
    baseTransferData.asset = fromAsset!;
    const credit = await pb
      .collection("wallet_transactions")
      .create<IWalletTransactionEntry>(baseTransferData)
      .catch((error) => {
        console.error(error);
      });

    if (!debit || !credit) {
      return;
    }

    return [debit, credit];
  }

  const {
    particulars,
    date,
    amount,
    location,
    category,
    asset,
    ledger,
    type,
    fromAsset,
    toAsset,
  } = data;

  let [targetFile, fileName] = await processFile();

  let created: IWalletTransactionEntry[] | void = [];

  switch (type) {
    case "income":
    case "expenses":
      created = await createIncomeOrExpensesTransactions();
      break;
    case "transfer":
      created = await createTransferTransactions();
      break;
  }

  return created;
};

export const updateTransaction = async (
  pb: Pocketbase,
  id: string,
  data: Omit<WithoutPBDefault<IWalletTransactionEntry>, "receipt" | "side">,
  file: Express.Multer.File | undefined,
  toRemoveReceipt: boolean
): Promise<IWalletTransactionEntry | void> => {
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

  const { particulars, date, amount, category, location, asset, ledger, type } =
    data;

  const foundTransaction = await pb
    .collection("wallet_transactions")
    .getOne<IWalletTransactionEntry>(id);

  const [targetFile, fileName] = await processFile();

  const updatedData: WithoutPBDefault<
    Omit<IWalletTransactionEntry, "receipt">
  > & {
    receipt: File | string;
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
    receipt: getReceipt(),
  };

  const transaction = await pb
    .collection("wallet_transactions")
    .update<IWalletTransactionEntry>(id, updatedData)
    .catch((error) => {
      console.error(error);
    });

  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  if (!transaction) {
    return;
  }

  return transaction;
};

export const deleteTransaction = async (
  pb: Pocketbase,
  id: string
): Promise<boolean | void> => {
  return pb
    .collection("wallet_transactions")
    .delete(id)
    .catch((error) => {
      console.error(error);
    });
};

export const scanReceipt = async (
  file: Express.Multer.File,
  key: string
): Promise<IWalletReceiptScanResult | void> => {
  async function getTransactionDetails(): Promise<IWalletReceiptScanResult | null> {
    const client = new OpenAI({
      apiKey: key,
    });

    const TransactionDetails = z.object({
      date: z.string(),
      particulars: z.string(),
      type: z.union([z.literal("income"), z.literal("expenses")]),
      amount: z.number(),
    });

    const completion = await client.beta.chat.completions.parse({
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
      response_format: zodResponseFormat(TransactionDetails, "transaction"),
    });

    const transaction: IWalletReceiptScanResult | null =
      completion.choices[0].message.parsed;

    return transaction;
  }

  if (file.originalname.endsWith(".pdf")) {
    const image = await convertPDFToImage(file.path);

    if (!image) {
      return;
    }

    const buffer = await image.arrayBuffer();

    fs.writeFileSync("medium/receipt.png", Buffer.from(buffer));
  } else {
    fs.renameSync(file.path, "medium/receipt.png");
  }

  if (!fs.existsSync("medium/receipt.png")) {
    return;
  }

  const OCRResult = await parseOCR("medium/receipt.png");

  if (!OCRResult) {
    return;
  }

  fs.unlinkSync("medium/receipt.png");

  const transaction = await getTransactionDetails();

  if (!transaction) {
    return;
  }

  return transaction;
};
