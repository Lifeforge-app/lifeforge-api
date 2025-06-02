import { z } from "zod";

const BasePBSchema = z.object({
  id: z.string(),
  collectionId: z.string(),
  collectionName: z.string(),
  created: z.string(),
  updated: z.string(),
});

type WithPB<T> = T & z.infer<typeof BasePBSchema>;

const WithPBSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return z.intersection(schema, BasePBSchema);
};

export type { WithPB };
export { WithPBSchema };
