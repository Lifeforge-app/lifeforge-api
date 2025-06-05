import fs from "fs";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as entriesService from "../services/entries.service";
import * as visionService from "../services/vision.service";
import {
  VirtualWardrobeEntrySchema,
  VirtualWardrobeSidebarDataSchema,
} from "../typescript/virtual_wardrobe_interfaces";

export const getSidebarData = forgeController(
  {
    response: VirtualWardrobeSidebarDataSchema,
  },
  async ({ pb }) => await entriesService.getSidebarData(pb),
);

export const getEntries = forgeController(
  {
    query: z.object({
      category: z.string().optional(),
      subcategory: z.string().optional(),
      brand: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      favourite: z
        .string()
        .optional()
        .transform((val) => val === "true"),
      q: z.string().optional(),
    }),
    response: z.array(WithPBSchema(VirtualWardrobeEntrySchema)),
  },
  async ({ pb, query }) => await entriesService.getEntries(pb, query),
);

export const createEntry = forgeController(
  {
    body: z.object({
      name: z.string(),
      category: z.string(),
      subcategory: z.string(),
      brand: z.string(),
      size: z.string(),
      colors: z.array(z.string()),
      price: z.string().transform((val) => parseFloat(val)),
      notes: z.string(),
    }),
    response: WithPBSchema(VirtualWardrobeEntrySchema),
  },
  async ({ pb, body, req }) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const {
      backImage: [backImage],
      frontImage: [frontImage],
    } = files;

    if (!frontImage || !backImage) {
      throw new Error("Both front and back images are required");
    }

    try {
      const frontImageBuffer = fs.readFileSync(frontImage.path);
      const backImageBuffer = fs.readFileSync(backImage.path);

      const result = await entriesService.createEntry(pb, {
        ...body,
        front_image: new File([frontImageBuffer], frontImage.originalname),
        back_image: new File([backImageBuffer], backImage.originalname),
      });

      return result;
    } finally {
      // Clean up uploaded files
      if (frontImage?.path) fs.unlinkSync(frontImage.path);
      if (backImage?.path) fs.unlinkSync(backImage.path);
    }
  },
  {
    statusCode: 201,
  },
);

export const updateEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string().optional(),
      category: z.string().optional(),
      subcategory: z.string().optional(),
      brand: z.string().optional(),
      size: z.string().optional(),
      colors: z.array(z.string()).optional(),
      price: z.number().optional(),
      notes: z.string().optional(),
    }),
    response: WithPBSchema(VirtualWardrobeEntrySchema),
  },
  async ({ pb, params: { id }, body }) =>
    await entriesService.updateEntry(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "virtual_wardrobe_entries",
      },
    },
  },
);

export const deleteEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await entriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "virtual_wardrobe_entries",
      },
    },
    statusCode: 204,
  },
);

export const toggleFavourite = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(VirtualWardrobeEntrySchema),
  },
  async ({ pb, params: { id } }) =>
    await entriesService.toggleFavourite(pb, id),
  {
    existenceCheck: {
      params: {
        id: "virtual_wardrobe_entries",
      },
    },
  },
);

export const analyzeVision = forgeController(
  {
    response: z.object({
      name: z.string(),
      category: z.string(),
      subcategory: z.string(),
      colors: z.array(z.string()),
    }),
  },
  async ({ pb, req }) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const {
      frontImage: [frontImage],
      backImage: [backImage],
    } = files;

    if (!frontImage || !backImage) {
      throw new Error("Both front and back images are required");
    }

    try {
      const result = await visionService.analyzeClothingImages(
        pb,
        frontImage.path,
        backImage.path,
      );

      return result;
    } finally {
      // Clean up uploaded files
      if (frontImage?.path) fs.unlinkSync(frontImage.path);
      if (backImage?.path) fs.unlinkSync(backImage.path);
    }
  },
);
