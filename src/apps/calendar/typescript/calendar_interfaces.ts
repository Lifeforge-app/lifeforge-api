import { z } from "zod/v4";

const CalendarEventSchema = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string(),
  category: z.string(),
  calendar: z.string(),
  location: z.string(),
  reference_link: z.string(),
  description: z.string(),
  is_strikethrough: z.boolean(),
  type: z.enum(["single", "recurring"]),
  recurring_rrule: z.string(),
  recurring_duration_amount: z.string(),
  recurring_duration_unit: z.string(),
  exceptions: z.array(z.string()).optional(),
});

const CalendarCategorySchema = z.object({
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  amount: z.number(),
});

const CalendarCalendarSchema = z.object({
  name: z.string(),
  color: z.string(),
});

type ICalendarCategory = z.infer<typeof CalendarCategorySchema>;
type ICalendarCalendar = z.infer<typeof CalendarCalendarSchema>;
type ICalendarEvent = z.infer<typeof CalendarEventSchema>;

export type { ICalendarCalendar, ICalendarCategory, ICalendarEvent };

export { CalendarEventSchema, CalendarCategorySchema, CalendarCalendarSchema };
