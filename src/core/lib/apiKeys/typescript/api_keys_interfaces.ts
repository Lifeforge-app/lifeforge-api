import BasePBCollection from "../../../typescript/pocketbase_interfaces";

interface IAPIKeyEntry extends BasePBCollection {
  keyId: string;
  name: string;
  description: string;
  icon: string;
  key: string;
}

export type { IAPIKeyEntry };
