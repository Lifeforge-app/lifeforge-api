import Moment from "moment";
import MomentRange from "moment-range";
import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IWalletAsset } from "../typescript/wallet_interfaces";
import { IWalletTransactionEntry } from "../wallet_interfaces";

export const getAllAssets = (pb: PocketBase): Promise<WithPB<IWalletAsset>[]> =>
  pb.collection("wallet_assets_aggregated").getFullList<WithPB<IWalletAsset>>({
    sort: "name",
  });

// @ts-ignore
const moment = MomentRange.extendMoment(Moment);

export const getAssetAccumulatedBalance = async (
  pb: PocketBase,
  assetId: string,
): Promise<Record<string, number>> => {
  const asset = await pb
    .collection("wallet_assets")
    .getOne<Pick<WithPB<IWalletAsset>, "starting_balance">>(assetId, {
      fields: "starting_balance",
    });

  const allTransactions = await pb
    .collection("wallet_transactions")
    .getFullList<
      Pick<WithPB<IWalletTransactionEntry>, "amount" | "date" | "side">
    >({
      filter: `asset = '${assetId}'`,
      sort: "-date",
      fields: "amount,date,side",
    });

  let currentBalance = asset.starting_balance;
  const accumulatedBalance: Record<string, number> = {};

  const allDateInBetween = moment
    .range(moment(allTransactions[allTransactions.length - 1].date), moment())
    .by("day");

  for (const date of allDateInBetween) {
    const dateStr = date.format("YYYY-MM-DD");
    accumulatedBalance[dateStr] = parseFloat(currentBalance.toFixed(2));

    const transactionsOnDate = allTransactions.filter((t) =>
      moment(t.date).isSame(date, "day"),
    );

    for (const transaction of transactionsOnDate) {
      if (transaction.side) {
        if (transaction.side === "debit") {
          currentBalance += transaction.amount;
        } else if (transaction.side === "credit") {
          currentBalance -= transaction.amount;
        }
      }
    }
  }

  return accumulatedBalance;
};

export const createAsset = (
  pb: PocketBase,
  data: Pick<IWalletAsset, "name" | "icon" | "starting_balance">,
): Promise<WithPB<IWalletAsset>> =>
  pb.collection("wallet_assets").create<WithPB<IWalletAsset>>(data);

export const updateAsset = (
  pb: PocketBase,
  id: string,
  data: Pick<IWalletAsset, "name" | "icon" | "starting_balance">,
): Promise<WithPB<IWalletAsset>> =>
  pb.collection("wallet_assets").update<WithPB<IWalletAsset>>(id, data);

export const deleteAsset = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("wallet_assets").delete(id);
};
