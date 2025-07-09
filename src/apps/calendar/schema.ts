// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: calendar
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: calendar__events, calendar__categories, calendar__categories_aggregated, calendar__calendars
import { z } from "zod/v4";

const CalendarEventsSchema = z.object({
  start: z.string(),
  end: z.string(),
  title: z.string(),
  category: z.string(),
  calendar: z.string(),
  location: z.string(),
  reference_link: z.string(),
  description: z.string(),
  is_striktethrough: z.boolean(),
  is_recurring: z.boolean(),
  use_google_map: z.boolean(),
  type: z.enum(["single", "recurring"]),
  recurring_rrule: z.string(),
  recurring_duration_unit: z.string(),
  recurring_duration_amount: z.number(),
  exceptions: z.any(),
});

const CalendarCategoriesSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});

const CalendarCategoriesAggregatedSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  amount: z.number(),
});

const CalendarCalendarsSchema = z.object({
  name: z.string(),
  color: z.string(),
});

type ICalendarEvents = z.infer<typeof CalendarEventsSchema>;
type ICalendarCategories = z.infer<typeof CalendarCategoriesSchema>;
type ICalendarCategoriesAggregated = z.infer<
  typeof CalendarCategoriesAggregatedSchema
>;
type ICalendarCalendars = z.infer<typeof CalendarCalendarsSchema>;

export {
  CalendarEventsSchema,
  CalendarCategoriesSchema,
  CalendarCategoriesAggregatedSchema,
  CalendarCalendarsSchema,
};

export type {
  ICalendarEvents,
  ICalendarCategories,
  ICalendarCategoriesAggregated,
  ICalendarCalendars,
};
