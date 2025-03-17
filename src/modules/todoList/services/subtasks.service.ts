import { fetchAI } from "@utils/fetchAI";
import { getAPIKey } from "@utils/getAPIKey";
import PocketBase from "pocketbase";
import { BREAKDOWN_LEVELS } from "../constants/subtasks";
import { ITodoListEntry, ITodoSubtask } from "../typescript/todo_list_interfaces";

export const getSubtasksForEntry = async (
  pb: PocketBase,
  id: string,
): Promise<ITodoSubtask[]> => {
  try {
    const entries: ITodoListEntry & {
      expand?: { subtasks: ITodoSubtask[] };
    } = await pb.collection("todo_entries").getOne(id, {
      expand: "subtasks",
    });

    return entries.expand ? entries.expand.subtasks : [];
  } catch (error) {
    throw error;
  }
};

export const generateSubtasksWithAI = async (
  pb: PocketBase,
  summary: string,
  notes: string,
  level: number,
): Promise<string[]> => {
  try {
    const key = await getAPIKey("groq", pb);

    if (!key) {
      throw new Error("API key not found");
    }

    const prompt = `Generate a detailed list of subtasks for completing the following task: "${summary.trim()}".${
      notes.trim()
        ? `Also, take into consideration that there is notes to the task being "${notes.trim()}".`
        : ""
    } The list should be organized in a logical sequence. The level of breakdown should be ${
      BREAKDOWN_LEVELS[level]
    }. Ensure the output is in the form of a single-level flat JavaScript array, with each element containing only the task content, written in the same language as the given task, and without any additional details, comments, explanations, or nested subtasks or details of the subtask. Make sure not to wrap the output array in any code environment, and the output array should be plain text that can be parsed by javascript JSON.parse() function. Keep in mind that there SHOULD NOT be a comma at the end of the last element in the array.`;

    const response = await fetchAI({
      provider: "groq",
      apiKey: key,
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response) {
      throw new Error("Error fetching data");
    }

    return JSON.parse(response);
  } catch (error) {
    throw error;
  }
};

export const toggleSubtaskCompletion = async (
  pb: PocketBase,
  id: string,
): Promise<ITodoSubtask> => {
  try {
    const entries = await pb.collection("todo_subtasks").getOne(id);

    const subtask: ITodoSubtask = await pb
      .collection("todo_subtasks")
      .update(id, {
        done: !entries.done,
      });

    return subtask;
  } catch (error) {
    throw error;
  }
};
