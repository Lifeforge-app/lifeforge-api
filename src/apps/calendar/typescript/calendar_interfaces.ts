import BasePBCollection from "@typescript/pocketbase_interfaces";

interface ICalendarEvent extends BasePBCollection {
  title: string;
  start: string | Date;
  end: string | Date;
  category: string;
  calendar: string;
  location: string;
  reference_link: string;
  description: string;
  cannot_delete: boolean;
  is_strikethrough: boolean;
  type: "single" | "recurring";
  recurring_rrule: string;
  recurring_duration_amount: number;
  recurring_duration_unit: string;
  exceptions: string[] | null;
}

interface ICalendarCategory extends BasePBCollection {
  color: string;
  icon: string;
  name: string;
  amount: number;
}

interface ICalendarCalendar extends BasePBCollection {
  name: string;
  color: string;
}

export type { ICalendarCalendar, ICalendarCategory, ICalendarEvent };
