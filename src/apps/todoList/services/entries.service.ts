import moment from "moment";
import PocketBase from "pocketbase";
import {
  ITodoListEntry,
  ITodoListStatusCounter,
  ITodoSubtask,
} from "../typescript/todo_list_interfaces";

export const getEntryById = async (
  pb: PocketBase,
  id: string,
): Promise<Omit<ITodoListEntry, "subtasks"> & { subtasks: ITodoSubtask[] }> => {
  const entry = await pb.collection("todo_entries").getOne<
    ITodoListEntry & {
      expand?: { subtasks: ITodoSubtask[] };
    }
  >(id, {
    expand: "subtasks",
  });

  entry.subtasks =
    entry.expand?.subtasks?.map((subtask: ITodoSubtask) => ({
      title: subtask.title,
      done: subtask.done,
      id: subtask.id,
    })) ?? [];

  delete entry.expand;
  return entry;
};

export const getAllEntries = async (
  pb: PocketBase,
  statusFilter: string,
  tag?: string,
  list?: string,
  priority?: string,
): Promise<ITodoListEntry[]> => {
  const filters = {
    all: "done = false",
    today: `done = false && due_date >= "${moment()
      .startOf("day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss")}" && due_date <= "${moment()
      .endOf("day")
      .utc()
      .add(1, "second")
      .format("YYYY-MM-DD HH:mm:ss")}"`,
    scheduled: `done = false && due_date != "" && due_date >= "${moment()
      .utc()
      .format("YYYY-MM-DD HH:mm:ss")}"`,
    overdue: `done = false && due_date != "" && due_date < "${moment()
      .utc()
      .format("YYYY-MM-DD HH:mm:ss")}"`,
    completed: "done = true",
  };

  let finalFilter = filters[statusFilter as keyof typeof filters];

  if (tag) finalFilter += ` && tags ~ "${tag}"`;
  if (list) finalFilter += ` && list = "${list}"`;
  if (priority) finalFilter += ` && priority = "${priority}"`;

  const entries: (ITodoListEntry & {
    expand?: { subtasks: ITodoSubtask[] };
  })[] = await pb.collection("todo_entries").getFullList({
    filter: finalFilter,
    sort: "-created",
    expand: "subtasks",
  });

  entries.forEach((entry) => {
    if (entry.subtasks.length === 0) return;

    entry.subtasks =
      entry.expand?.subtasks.map((subtask: ITodoSubtask) => ({
        title: subtask.title,
        done: subtask.done,
        id: subtask.id,
      })) ?? [];

    delete entry.expand;
  });

  return entries;
};

export const getStatusCounter = async (
  pb: PocketBase,
): Promise<ITodoListStatusCounter> => {
  const filters = {
    all: "done = false",
    today: `done = false && due_date >= "${moment()
      .startOf("day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss")}" && due_date <= "${moment()
      .endOf("day")
      .utc()
      .add(1, "second")
      .format("YYYY-MM-DD HH:mm:ss")}"`,
    scheduled: `done = false && due_date != "" && due_date >= "${moment()
      .utc()
      .format("YYYY-MM-DD HH:mm:ss")}"`,
    overdue: `done = false && due_date != "" && due_date < "${moment()
      .utc()
      .format("YYYY-MM-DD HH:mm:ss")}"`,
    completed: "done = true",
  };

  const counters: ITodoListStatusCounter = {
    all: 0,
    today: 0,
    scheduled: 0,
    overdue: 0,
    completed: 0,
  };

  for (const type of Object.keys(filters) as (keyof typeof filters)[]) {
    const { totalItems } = await pb.collection("todo_entries").getList(1, 1, {
      filter: filters[type],
    });

    counters[type] = totalItems;
  }

  return counters;
};

export const createEntry = async (
  pb: PocketBase,
  data: {
    summary: string;
    notes: string;
    due_date: string;
    due_date_has_time: boolean;
    list?: string;
    priority?: string;
    tags?: string[];
    subtasks?: { title: string }[];
  },
): Promise<ITodoListEntry> => {
  const subtasksEntries: ITodoSubtask[] = [];

  if (data.subtasks) {
    const subtaskIds = [];

    for (const task of data.subtasks) {
      const subtask: ITodoSubtask = await pb
        .collection("todo_subtasks")
        .create({
          title: task.title,
        });

      subtaskIds.push(subtask.id);
      subtasksEntries.push(subtask);
    }

    data.subtasks = subtaskIds as any;
  }

  const entries: ITodoListEntry = await pb
    .collection("todo_entries")
    .create(data);

  entries.subtasks = subtasksEntries;

  return entries;
};

export const updateEntry = async (
  pb: PocketBase,
  id: string,
  data: {
    summary: string;
    notes: string;
    due_date: string;
    due_date_has_time: boolean;
    list?: string;
    priority?: string;
    tags?: string[];
    subtasks?: Array<ITodoSubtask>;
  },
): Promise<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }> => {
  const originalEntries: Omit<ITodoListEntry, "subtasks"> & {
    subtasks: string[];
  } = await pb.collection("todo_entries").getOne(id);

  const { subtasks } = data;

  const subtasksEntries: ITodoSubtask[] = [];

  if (subtasks) {
    for (const subtaskIndex in subtasks) {
      let subtask = subtasks[subtaskIndex];
      let newSubtask: ITodoSubtask | null = null;

      if (subtask.id.startsWith("new-")) {
        newSubtask = await pb
          .collection("todo_subtasks")
          .create<ITodoSubtask>({ title: subtask.title });
      } else if (subtask.hasChanged) {
        subtask = await pb
          .collection("todo_subtasks")
          .update<ITodoSubtask>(subtask.id, {
            title: subtask.title,
          });
      }

      subtasks[subtaskIndex] = { id: newSubtask?.id || subtask.id } as any;
      subtasksEntries.push(newSubtask ?? subtask);
    }

    data.subtasks = subtasks.map((subtask) =>
      typeof subtask === "string" ? subtask : subtask.id,
    ) as any;
  }

  const entry: Omit<ITodoListEntry, "subtasks"> & {
    subtasks: string[];
  } = await pb.collection("todo_entries").update(id, data);

  for (const subtask of originalEntries.subtasks) {
    if (entry.subtasks.includes(subtask)) continue;

    await pb.collection("todo_subtasks").delete(subtask);
  }

  entry.subtasks = subtasksEntries as any;

  return entry;
};

export const deleteEntry = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  const entries: Omit<ITodoListEntry, "subtasks"> & {
    subtasks: string[];
  } = await pb.collection("todo_entries").getOne(id);

  await pb.collection("todo_entries").delete(id);

  for (const subtask of entries.subtasks) {
    await pb.collection("todo_subtasks").delete(subtask);
  }
};

export const toggleEntry = async (
  pb: PocketBase,
  id: string,
): Promise<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }> => {
  const entries: Omit<ITodoListEntry, "subtasks"> & {
    subtasks: string[];
  } = await pb.collection("todo_entries").getOne(id);

  if (!entries.done) {
    for (const subtask of entries.subtasks) {
      await pb.collection("todo_subtasks").update(subtask, {
        done: true,
      });
    }
  }

  const entry: Omit<ITodoListEntry, "subtasks"> & {
    subtasks: string[];
  } = await pb.collection("todo_entries").update(id, {
    done: !entries.done,
    completed_at: entries.done
      ? null
      : moment().utc().format("YYYY-MM-DD HH:mm:ss"),
  });

  return entry;
};
