import BasePBCollection from "../../../core/typescript/pocketbase_interfaces";

interface ICalendarEvent extends BasePBCollection {
  title: string;
  start: string | Date;
  end: string | Date;
  category: string;
  reference_link: string;
  cannot_delete: boolean;
}

interface ICalendarCategory extends BasePBCollection {
  color: string;
  icon: string;
  name: string;
  amount: number;
}

export type { ICalendarCategory, ICalendarEvent };
