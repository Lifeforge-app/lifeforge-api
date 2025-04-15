import { fetchAI } from "@utils/fetchAI";
import fs from "fs";
import moment from "moment";
import PocketBase from "pocketbase";
import rrule from "rrule";
import { z } from "zod";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import { IMovieEntry } from "../../movies/typescript/movies_interfaces";
import { ITodoListEntry } from "../../todoList/typescript/todo_list_interfaces";
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

  const allEvents = [];

  const singleCalendarEvents = await pb
    .collection("calendar_events")
    .getFullList<ICalendarEvent>({
      filter: `(start >= '${start}' || end >= '${start}') && (start <= '${end}' || end <= '${end}') && type="single"`,
    });

  allEvents.push(...singleCalendarEvents);

  const recurringCalendarEvents = await pb
    .collection("calendar_events")
    .getFullList<ICalendarEvent>({
      filter: "type='recurring'",
    });

  for (const event of recurringCalendarEvents) {
    const parsed = rrule.RRule.fromString(event.recurring_rrule);
    const eventsInRange = parsed.between(
      moment(start).toDate(),
      moment(end).toDate(),
      true,
    );

    for (const eventDate of eventsInRange) {
      const start = moment(eventDate).utc().format("YYYY-MM-DD HH:mm:ss");

      const end = moment(eventDate)
        .add(
          event.recurring_duration_amount,
          event.recurring_duration_unit as any,
        )
        .utc()
        .format("YYYY-MM-DD HH:mm:ss");

      allEvents.push({
        ...event,
        id: `${event.id}-${moment(eventDate).format("YYYYMMDD")}`,
        start,
        end,
      });
    }
  }

  const todoEntries = (
    await pb
      .collection("todo_entries")
      .getFullList<ITodoListEntry>({
        filter: `due_date >= '${start}' && due_date <= '${end}'`,
      })
      .catch(() => [])
  ).map((entry) => {
    return {
      id: entry.id,
      title: entry.summary,
      start: entry.due_date,
      end: moment(entry.due_date).add(1, "millisecond").toISOString(),
      category: "_todo",
      description: entry.notes,
      reference_link: `/todo-list?entry=${entry.id}`,
      is_strikethrough: entry.done,
    } as ICalendarEvent;
  });

  allEvents.push(...todoEntries);

  const movieEntries = (
    await pb
      .collection("movies_entries")
      .getFullList<IMovieEntry>({
        filter: `theatre_showtime >= '${start}' && theatre_showtime <= '${end}'`,
      })
      .catch(() => [])
  ).map((entry) => {
    return {
      id: entry.id,
      title: entry.title,
      start: entry.theatre_showtime,
      end: moment(entry.theatre_showtime)
        .add(entry.duration, "minutes")
        .toISOString(),
      category: "_movie",
      location: entry.theatre_location ?? "",
      description: `
### Movie Description:
${entry.overview}

### Theatre Number:
${entry.theatre_number}

### Seat Number:
${entry.theatre_seat}
      `,
      reference_link: `/movies?show-ticket=${entry.id}`,
    } as ICalendarEvent;
  });

  allEvents.push(...movieEntries);

  return allEvents;
};

export const getTodayEvents = async (
  pb: PocketBase,
): Promise<ICalendarEvent[]> => {
  const start = moment().startOf("day").toISOString();
  const end = moment().endOf("day").toISOString();

  return await getEventsByDateRange(pb, start, end);
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
