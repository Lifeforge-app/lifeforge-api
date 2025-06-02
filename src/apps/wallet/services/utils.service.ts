import moment from "moment";
import Pocketbase from "pocketbase";

import {
  IWalletCategory,
  IWalletIncomeExpensesSummary,
  IWalletTransactionEntry,
} from "../wallet_interfaces";

export const getTypesCount = async (
  pb: Pocketbase,
): Promise<{
  [key: string]: {
    amount: number;
    accumulate: number;
  };
}> => {
  const types = await pb
    .collection("wallet_transaction_types_with_amount")
    .getFullList();

  const typesCount: {
    [key: string]: {
      amount: number;
      accumulate: number;
    };
  } = {};
  types.forEach((type) => {
    typesCount[type.name] = {
      amount: type.amount,
      accumulate: type.accumulate,
    };
  });

  return typesCount;
};

export const getIncomeExpensesSummary = async (
  pb: Pocketbase,
  year: string,
  month: string,
): Promise<IWalletIncomeExpensesSummary> => {
  const start = moment(`${year}-${month}-01`)
    .startOf("month")
    .format("YYYY-MM-DD");
  const end = moment(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD");

  const transactions = await pb.collection("wallet_transactions").getFullList({
    filter: "type = 'income' || type = 'expenses'",
    sort: "-date,-created",
  });

  const inThisMonth = transactions.filter(
    (transaction) =>
      moment(moment(transaction.date).format("YYYY-MM-DD")).isSameOrAfter(
        start,
      ) &&
      moment(moment(transaction.date).format("YYYY-MM-DD")).isSameOrBefore(end),
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

export const getExpensesBreakdown = async ({
  pb,
  year,
  month,
}: {
  pb: Pocketbase;
  year: number;
  month: number;
}) => {
  const startDate = moment()
    .year(year)
    .month(month - 1)
    .startOf("month")
    .format("YYYY-MM-DD");
  const endDate = moment()
    .year(year)
    .month(month - 1)
    .endOf("month")
    .format("YYYY-MM-DD");

  const expenses = await pb.collection("wallet_transactions").getFullList<
    IWalletTransactionEntry & {
      expand?: { category: IWalletCategory };
    }
  >({
    filter: `date >= '${startDate}' && date <= '${endDate}' && type = 'expenses'`,
    expand: "category",
  });

  const spentOnEachCategory: Record<
    string,
    {
      amount: number;
      count: number;
      percentage: number;
    }
  > = {};

  for (const expense of expenses) {
    const categoryId = expense.expand?.category.id;
    if (!categoryId) {
      continue;
    }

    if (spentOnEachCategory[categoryId]) {
      spentOnEachCategory[categoryId].amount += expense.amount;
      spentOnEachCategory[categoryId].count += 1;
    } else {
      spentOnEachCategory[categoryId] = {
        amount: expense.amount,
        count: 1,
        percentage: 0,
      };
    }
  }

  const totalSpent = Object.values(spentOnEachCategory).reduce(
    (acc, { amount }) => acc + amount,
    0,
  );

  for (const categoryId in spentOnEachCategory) {
    spentOnEachCategory[categoryId].percentage =
      (spentOnEachCategory[categoryId].amount / totalSpent) * 100;
  }

  return spentOnEachCategory;
};
