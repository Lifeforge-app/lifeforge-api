import moment from "moment";
import PocketBase from "pocketbase";
import {
  ITodoListEntry,
  ITodoListStatusCounter,
  ITodoSubtask,
} from "../typescript/todo_list_interfaces";

/**
 * Get all todo entries based on filter
 */
export const getAllEntries = async (
  pb: PocketBase,
  statusFilter: string,
  tag?: string,
  list?: string,
  priority?: string,
): Promise<ITodoListEntry[]> => {
  try {
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
  } catch (error) {
    throw error;
  }
};

/**
 * Get the amount of todo entries in each status
 */
export const getStatusCounter = async (
  pb: PocketBase,
): Promise<ITodoListStatusCounter> => {
  try {
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
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new todo entry
 */
export const createEntry = async (
  pb: PocketBase,
  data: {
    summary: string;
    notes: string;
    due_date: string;
    list?: string;
    priority?: string;
    tags?: string[];
    subtasks?: { title: string }[];
  },
): Promise<ITodoListEntry> => {
  try {
    // Create subtasks first if they exist
    if (data.subtasks) {
      const subtasks = [];

      for (const task of data.subtasks) {
        const subtask: ITodoSubtask = await pb
          .collection("todo_subtasks")
          .create({
            title: task.title,
          });

        subtasks.push(subtask.id);
      }

      data.subtasks = subtasks as any;
    }

    const entries: ITodoListEntry = await pb
      .collection("todo_entries")
      .create(data);

    if (entries.list) {
      await pb.collection("todo_lists").update(entries.list, {
        "amount+": 1,
      });
    }

    if (entries.priority) {
      await pb.collection("todo_priorities").update(entries.priority, {
        "amount+": 1,
      });
    }

    for (const tag of entries.tags) {
      await pb.collection("todo_tags").update(tag, {
        "amount+": 1,
      });
    }

    return entries;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a todo entry
 */
export const updateEntry = async (
  pb: PocketBase,
  id: string,
  data: {
    summary: string;
    notes: string;
    due_date: string;
    list?: string;
    priority?: string;
    tags?: string[];
    subtasks?: Array<{
      id: string;
      title: string;
      hasChanged?: boolean;
    }>;
  },
): Promise<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }> => {
  try {
    const originalEntries: Omit<ITodoListEntry, "subtasks"> & {
      subtasks: string[];
    } = await pb.collection("todo_entries").getOne(id);

    const { subtasks } = data;

    // Process subtasks if they exist
    if (subtasks) {
      for (const subtaskIndex in subtasks) {
        const subtask = subtasks[subtaskIndex];
        let newSubtask: ITodoSubtask | { id: null } = { id: null };

        if (subtask.id.startsWith("new-")) {
          newSubtask = await pb
            .collection("todo_subtasks")
            .create({ title: subtask.title });
        } else if (subtask.hasChanged) {
          await pb.collection("todo_subtasks").update(subtask.id, {
            title: subtask.title,
          });
        }

        subtasks[subtaskIndex] = { id: newSubtask.id || subtask.id } as any;
      }

      data.subtasks = subtasks.map((subtask) =>
        typeof subtask === "string" ? subtask : subtask.id,
      ) as any;
    }

    const entries: Omit<ITodoListEntry, "subtasks"> & {
      subtasks: string[];
    } = await pb.collection("todo_entries").update(id, data);

    // Update list counts
    for (const list of [...new Set([originalEntries.list, entries.list])]) {
      if (!list) continue;

      const { totalItems } = await pb.collection("todo_entries").getList(1, 1, {
        filter: `list ~ "${list}"`,
      });

      await pb.collection("todo_lists").update(list, {
        amount: totalItems,
      });
    }

    // Update priority counts
    for (const priority of [
      ...new Set([originalEntries.priority, entries.priority]),
    ]) {
      if (!priority) continue;

      const { totalItems } = await pb.collection("todo_entries").getList(1, 1, {
        filter: `priority ~ "${priority}"`,
      });

      await pb.collection("todo_priorities").update(priority, {
        amount: totalItems,
      });
    }

    // Update tag counts
    for (const tag of [
      ...new Set([...originalEntries.tags, ...entries.tags]),
    ]) {
      if (!tag) continue;

      const { totalItems } = await pb.collection("todo_entries").getList(1, 1, {
        filter: `tags ~ "${tag}"`,
      });

      await pb.collection("todo_tags").update(tag, {
        amount: totalItems,
      });
    }

    // Delete subtasks that are no longer in the entry
    for (const subtask of originalEntries.subtasks) {
      if (entries.subtasks.includes(subtask)) continue;

      await pb.collection("todo_subtasks").delete(subtask);
    }

    return entries;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a todo entry
 */
export const deleteEntry = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  try {
    const entries: Omit<ITodoListEntry, "subtasks"> & {
      subtasks: string[];
    } = await pb.collection("todo_entries").getOne(id);

    await pb.collection("todo_entries").delete(id);

    if (entries.list) {
      await pb.collection("todo_lists").update(entries.list, {
        "amount-": 1,
      });
    }

    if (entries.priority) {
      await pb.collection("todo_priorities").update(entries.priority, {
        "amount-": 1,
      });
    }

    for (const tag of entries.tags) {
      await pb.collection("todo_tags").update(tag, {
        "amount-": 1,
      });
    }

    for (const subtask of entries.subtasks) {
      await pb.collection("todo_subtasks").delete(subtask);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle a todo entry's completion status
 */
export const toggleEntry = async (
  pb: PocketBase,
  id: string,
): Promise<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }> => {
  try {
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
  } catch (error) {
    throw error;
  }
};
