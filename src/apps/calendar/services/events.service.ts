import { fetchAI } from "@utils/fetchAI";
import fs from "fs";
import moment from "moment";
import PocketBase from "pocketbase";
import { z } from "zod";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import {
  ICalendarCategory,
  ICalendarEvent,
} from "../typescript/calendar_interfaces";

export const getEventsByDateRange = async (
  pb: PocketBase,
  startDate: string,
  endDate: string,
): Promise<ICalendarEvent[]> => {
  const start = moment(startDate).startOf("day").toISOString();
  const end = moment(endDate).endOf("day").toISOString();

  return await pb.collection("calendar_events").getFullList<ICalendarEvent>({
    filter: `(start >= '${start}' || end >= '${start}') && (start <= '${end}' || end <= '${end}')`,
  });
};

export const getTodayEvents = async (
  pb: PocketBase,
): Promise<ICalendarEvent[]> => {
  const start = moment().startOf("day").toISOString();
  const end = moment().endOf("day").toISOString();

  const allEvents = await pb
    .collection("calendar_events")
    .getFullList<ICalendarEvent>();

  return allEvents.filter((event) => {
    return moment(event.start).isBetween(start, end, null, "[]");
  });
};

export const createEvent = async (
  pb: PocketBase,
  eventData: WithoutPBDefault<ICalendarEvent>,
): Promise<ICalendarEvent> => {
  return await pb
    .collection("calendar_events")
    .create<ICalendarEvent>(eventData);
};

export const scanImage = async (
  pb: PocketBase,
  filePath: string,
  apiKey: string,
): Promise<Partial<ICalendarEvent> | null> => {
  const categories = await pb
    .collection("calendar_categories")
    .getFullList<ICalendarCategory>();

  const categoryList = categories.map((category) => category.name);

  const responseStructure = z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
  });

  const base64Image = await fs.readFileSync(filePath, {
    encoding: "base64",
  });

  const response = await fetchAI({
    provider: "openai",
    apiKey,
    model: "gpt-4o",
    structure: responseStructure,
    messages: [
      {
        role: "system",
        content: `You are a calendar assistant. Extract the event details from the image. If no event can be extracted, respond with null. Assume that today is ${moment().format(
          "YYYY-MM-DD",
        )} unless specified otherwise. 

        The title should be the name of the event.

        The dates should be in the format of YYYY-MM-DD HH:mm:ss
        
        Parse the description (event details) from the image and express it in the form of markdown. If there are multiple lines of description seen in the image, try not to squeeze everything into a single paragraph. If possible, break the details into multiple sections, with each section having a h3 heading. For example:

        ### Section Title:
        Section details here.

        ### Another Section Title:
        Another section details here.
        
        The categories should be one of the following (case sensitive): ${categoryList.join(
          ", ",
        )}. Try to pick the most relevant category instead of just picking the most general one, unless you're really not sure`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  if (!response) {
    return null;
  }

  response.category = categories.find(
    (category) => category.name === response.category,
  )?.id;

  return response;
};

export const updateEvent = async (
  pb: PocketBase,
  id: string,
  eventData: WithoutPBDefault<ICalendarEvent>,
): Promise<ICalendarEvent> => {
  return await pb
    .collection("calendar_events")
    .update<ICalendarEvent>(id, eventData);
};

export const deleteEvent = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  return await pb.collection("calendar_events").delete(id);
};

export const getEventById = async (
  pb: PocketBase,
  id: string,
): Promise<ICalendarEvent> => {
  return await pb.collection("calendar_events").getOne<ICalendarEvent>(id);
};
