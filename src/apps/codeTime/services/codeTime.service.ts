import moment from "moment";
import PocketBase from "pocketbase";

export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date.valueOf());
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const getDates = (startDate: Date, stopDate: Date): Date[] => {
  const dateArray = [];
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dateArray;
};

export const getActivities = async (
  pb: PocketBase,
  year: string | number,
): Promise<{
  data: { date: string; count: number; level: number }[];
  firstYear: number;
}> => {
  const yearValue = Number(year) || new Date().getFullYear();

  const data = await pb.collection("code_time_daily_entries").getFullList({
    filter: `date >= "${yearValue}-01-01 00:00:00.000Z" && date <= "${yearValue}-12-31 23:59:59.999Z"`,
  });

  const groupByDate: { [key: string]: number } = {};

  for (const item of data) {
    const dateKey = moment(item.date).format("YYYY-MM-DD");
    if (!groupByDate[dateKey]) {
      groupByDate[dateKey] = 0;
    }
    groupByDate[dateKey] = item.total_minutes;
  }

  const final = Object.entries(groupByDate).map(([date, totalMinutes]) => ({
    date,
    count: totalMinutes,
    level: (() => {
      const hours = totalMinutes / 60;
      if (hours < 1) {
        return 1;
      }
      if (hours < 3) {
        return 2;
      }
      if (hours < 5) {
        return 3;
      }
      return 4;
    })(),
  }));

  if (final.length > 0 && final[0].date !== `${yearValue}-01-01`) {
    final.unshift({
      date: `${yearValue}-01-01`,
      count: 0,
      level: 0,
    });
  }

  if (
    final.length > 0 &&
    final[final.length - 1].date !== `${yearValue}-12-31`
  ) {
    final.push({
      date: `${yearValue}-12-31`,
      count: 0,
      level: 0,
    });
  }

  const firstRecordEver = await pb
    .collection("code_time_daily_entries")
    .getList(1, 1, {
      sort: "+date",
    });

  return {
    data: final,
    firstYear: +firstRecordEver.items[0].date.split(" ")[0].split("-")[0],
  };
};

export const getStatistics = async (pb: PocketBase) => {
  const everything = await pb
    .collection("code_time_daily_entries")
    .getFullList({
      sort: "date",
    });

  let groupByDate: { date: string; count: number }[] = [];

  const dateMap: { [key: string]: number } = {};
  for (const item of everything) {
    const dateKey = moment(item.date).format("YYYY-MM-DD");
    dateMap[dateKey] = item.total_minutes;
  }

  groupByDate = Object.entries(dateMap).map(([date, count]) => ({
    date,
    count,
  }));

  groupByDate = groupByDate.sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    }
    if (a.count < b.count) {
      return 1;
    }
    return 0;
  });

  const mostTimeSpent = groupByDate.length > 0 ? groupByDate[0].count : 0;
  const total = everything.reduce((acc, curr) => acc + curr.total_minutes, 0);
  const average = groupByDate.length > 0 ? total / groupByDate.length : 0;

  groupByDate = groupByDate.sort((a, b) => a.date.localeCompare(b.date));

  const allDates = groupByDate.map((item) => item.date);

  const longestStreak = (() => {
    if (allDates.length === 0) return 0;

    let streak = 0;
    let longest = 0;

    const firstDate = new Date(allDates[0]);
    const lastDate = new Date(allDates[allDates.length - 1]);

    const dates = getDates(firstDate, lastDate);

    for (const date of dates) {
      const dateKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (allDates.includes(dateKey)) {
        streak += 1;
      } else {
        if (streak > longest) {
          longest = streak;
        }
        streak = 0;
      }
    }
    return longest;
  })();

  const currentStreak = (() => {
    if (allDates.length === 0) return 0;

    let streak = 0;

    const firstDate = new Date(allDates[0]);
    const lastDate = new Date(allDates[allDates.length - 1]);

    const dates = getDates(firstDate, lastDate).reverse();

    for (const date of dates) {
      const dateKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (!allDates.includes(dateKey)) break;

      streak += 1;
    }
    return streak;
  })();

  return {
    "Most time spent": mostTimeSpent,
    "Total time spent": total,
    "Average time spent": average,
    "Longest streak": Math.max(longestStreak, currentStreak),
    "Current streak": currentStreak,
  };
};

export const getLastXDays = async (pb: PocketBase, days: number) => {
  const lastXDays = moment().subtract(days, "days").format("YYYY-MM-DD");

  const data = await pb.collection("code_time_daily_entries").getFullList({
    filter: `date >= "${lastXDays} 00:00:00.000Z"`,
  });

  return data;
};

export const getProjectsStats = async (pb: PocketBase, lastXDays: string) => {
  const timeMap: { [key: string]: [number, string] } = {
    "24 hours": [24, "hours"],
    "7 days": [7, "days"],
    "30 days": [30, "days"],
  };

  const params = timeMap[lastXDays] || [7, "days"];

  const date = moment()
    .subtract(params[0], params[1] as moment.unitOfTime.DurationConstructor)
    .format("YYYY-MM-DD");

  const data = await pb.collection("code_time_daily_entries").getFullList({
    filter: `date >= "${date} 00:00:00.000Z"`,
  });

  const projects = data.map((item) => item.projects);

  let groupByProject: { [key: string]: number } = {};

  for (const item of projects) {
    for (const project in item) {
      if (!groupByProject[project]) {
        groupByProject[project] = 0;
      }
      groupByProject[project] += item[project];
    }
  }

  groupByProject = Object.fromEntries(
    Object.entries(groupByProject).sort(([, a], [, b]) => b - a),
  );

  return groupByProject;
};

export const getLanguagesStats = async (pb: PocketBase, lastXDays: string) => {
  const timeMap: { [key: string]: [number, string] } = {
    "24 hours": [24, "hours"],
    "7 days": [7, "days"],
    "30 days": [30, "days"],
  };

  const params = timeMap[lastXDays] || [7, "days"];

  const date = moment()
    .subtract(params[0], params[1] as moment.unitOfTime.DurationConstructor)
    .format("YYYY-MM-DD");

  const data = await pb.collection("code_time_daily_entries").getFullList({
    filter: `date >= "${date} 00:00:00.000Z"`,
  });

  const languages = data.map((item) => item.languages);

  let groupByLanguage: { [key: string]: number } = {};

  for (const item of languages) {
    for (const language in item) {
      if (!groupByLanguage[language]) {
        groupByLanguage[language] = 0;
      }
      groupByLanguage[language] += item[language];
    }
  }

  groupByLanguage = Object.fromEntries(
    Object.entries(groupByLanguage).sort(([, a], [, b]) => b - a),
  );

  return groupByLanguage;
};

export const getEachDay = async (pb: PocketBase) => {
  const lastDay = moment().format("YYYY-MM-DD");
  const firstDay = moment().subtract(30, "days").format("YYYY-MM-DD");

  const data = await pb.collection("code_time_daily_entries").getFullList({
    filter: `date >= "${firstDay} 00:00:00.000Z" && date <= "${lastDay} 23:59:59.999Z"`,
  });

  const groupByDate: { [key: string]: number } = {};

  for (const item of data) {
    const dateKey = moment(item.date).format("YYYY-MM-DD");
    groupByDate[dateKey] = item.total_minutes;
  }

  return Object.entries(groupByDate).map(([date, item]) => ({
    date,
    duration: item * 1000 * 60,
  }));
};

export const getUserMinutes = async (pb: PocketBase, minutes: number) => {
  const minTime = moment().subtract(minutes, "minutes").format("YYYY-MM-DD");

  const items = await pb.collection("code_time_daily_entries").getList(1, 1, {
    filter: `date >= "${minTime}"`,
  });

  return {
    minutes:
      items.totalItems > 0
        ? items.items.reduce((acc, item) => acc + item.total_minutes, 0)
        : 0,
  };
};

export const logEvent = async (pb: PocketBase, data: any) => {
  data.eventTime = Math.floor(Date.now() / 60000) * 60000;

  const date = moment(data.eventTime).format("YYYY-MM-DD");

  const lastData = await pb
    .collection("code_time_daily_entries")
    .getList(1, 1, {
      filter: `date~"${date}"`,
    });

  if (lastData.totalItems === 0) {
    await pb.collection("code_time_daily_entries").create({
      date,
      projects: {
        [data.project]: 1,
      },
      relative_files: {
        [data.relativeFile]: 1,
      },
      languages: {
        [data.language]: 1,
      },
      total_minutes: 1,
      last_timestamp: data.eventTime,
    });
  } else {
    const lastRecord = lastData.items[0];

    if (data.eventTime === lastRecord.last_timestamp) {
      return { status: "ok", message: "success" };
    }

    const projects = lastRecord.projects;
    if (projects[data.project]) {
      projects[data.project] += 1;
    } else {
      projects[data.project] = 1;
    }

    const relativeFiles = lastRecord.relative_files;
    if (relativeFiles[data.relativeFile]) {
      relativeFiles[data.relativeFile] += 1;
    } else {
      relativeFiles[data.relativeFile] = 1;
    }

    const languages = lastRecord.languages;
    if (languages[data.language]) {
      languages[data.language] += 1;
    } else {
      languages[data.language] = 1;
    }

    await pb.collection("code_time_daily_entries").update(lastRecord.id, {
      projects,
      relative_files: relativeFiles,
      languages,
      total_minutes: lastRecord.total_minutes + 1,
      last_timestamp: data.eventTime,
    });
  }

  return { status: "ok", message: "success" };
};
