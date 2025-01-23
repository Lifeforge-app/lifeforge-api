import express, { Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { fieldsUploadMiddleware } from "../../../middleware/uploadMiddleware.js";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import { IVirtualWardrobeEntry } from "../../../interfaces/virtual_wardrobe_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import fs from "fs";
import { list } from "../../../utils/CRUD.js";
import { body, param, query } from "express-validator";
import { checkExistence } from "../../../utils/PBRecordValidator.js";
import { getAPIKey } from "../../../utils/getAPIKey.js";
import { z } from "zod";
import { fetchAIWithStructuredResponse } from "../../../utils/fetchOpenAIWithStructuredResponse.js";
import sharp from "sharp";
import hasError from "../../../utils/checkError.js";

const router = express.Router();

router.get(
  "/sidebar-data",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const allEntries = await pb
      .collection("virtual_wardrobe_entries")
      .getFullList<IVirtualWardrobeEntry>();

    const categories = allEntries.reduce(
      (acc, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = 0;
        }
        acc[curr.category]++;
        return acc;
      },
      {} as Record<string, number>
    );

    const subcategories = allEntries.reduce(
      (acc, curr) => {
        if (!acc[curr.subcategory]) {
          acc[curr.subcategory] = 0;
        }
        acc[curr.subcategory]++;
        return acc;
      },
      {} as Record<string, number>
    );

    const brands = allEntries.reduce(
      (acc, curr) => {
        if (!acc[curr.brand]) {
          acc[curr.brand] = 0;
        }
        acc[curr.brand]++;
        return acc;
      },
      {} as Record<string, number>
    );

    const sizes = allEntries.reduce(
      (acc, curr) => {
        if (!acc[curr.size]) {
          acc[curr.size] = 0;
        }
        acc[curr.size]++;
        return acc;
      },
      {} as Record<string, number>
    );

    const colors = allEntries.reduce(
      (acc, curr) => {
        curr.colors.forEach((color) => {
          if (!acc[color]) {
            acc[color] = 0;
          }
          acc[color]++;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    successWithBaseResponse(res, {
      total: allEntries.length,
      favourites: allEntries.filter((entry) => entry.is_favourite).length,
      categories,
      subcategories,
      brands,
      sizes,
      colors,
    });
  })
);

router.get(
  "/",
  [
    query("category").isString().optional(),
    query("subcategory").isString().optional(),
    query("brand").isString().optional(),
    query("size").isString().optional(),
    query("color").isString().optional(),
    query("favourite").isBoolean().optional(),
    query("q").isString().optional(),
  ],
  asyncWrapper(
    async (req, res: Response<BaseResponse<IVirtualWardrobeEntry[]>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;

      list(
        req,
        res,
        "virtual_wardrobe_entries",
        {
          filter: [
            req.query.category && `category = '${req.query.category}'`,
            req.query.subcategory && `subcategory = '${req.query.subcategory}'`,
            req.query.brand && `brand = '${req.query.brand}'`,
            req.query.size && `size = '${req.query.size}'`,
            req.query.color && `colors ~ '${req.query.color}'`,
            req.query.favourite && `is_favourite = ${req.query.favourite}`,
            req.query.q &&
              `(name ~ '${req.query.q}' || brand ~ '${req.query.q}' || notes ~ '${req.query.q}')`,
          ]
            .filter((e) => e)
            .join(" && "),
        },
        (data) =>
          data.map((entry) => ({
            ...entry,
            front_image: pb.files
              .getURL(entry, entry.front_image)
              .split("/files/")[1],
            back_image: pb.files
              .getURL(entry, entry.back_image)
              .split("/files/")[1],
          }))
      );
    }
  )
);

router.post(
  "/",
  fieldsUploadMiddleware.bind({
    fields: [
      { name: "backImage", maxCount: 1 },
      { name: "frontImage", maxCount: 1 },
    ],
  }),
  asyncWrapper(
    async (req, res: Response<BaseResponse<IVirtualWardrobeEntry>>) => {
      const { pb } = req;
      const {
        backImage: [backImage],
        frontImage: [frontImage],
      } = req.files as { [fieldname: string]: Express.Multer.File[] };

      const { name, category, subcategory, brand, size, colors, price, notes } =
        req.body;
      const frontImageBuffer = fs.readFileSync(frontImage.path);
      const backImageBuffer = fs.readFileSync(backImage.path);

      const entry = {
        back_image: new File([backImageBuffer], backImage.originalname),
        front_image: new File([frontImageBuffer], frontImage.originalname),
        name,
        category,
        subcategory,
        brand,
        size,
        colors: JSON.parse(colors),
        price,
        notes,
      };

      const newEntry = await pb
        .collection("virtual_wardrobe_entries")
        .create<IVirtualWardrobeEntry>(entry);

      newEntry.front_image = pb.files
        .getURL(newEntry, newEntry.front_image)
        .split("/files/")[1];
      newEntry.back_image = pb.files
        .getURL(newEntry, newEntry.back_image)
        .split("/files/")[1];

      fs.unlinkSync(backImage.path);
      fs.unlinkSync(frontImage.path);

      successWithBaseResponse(res, newEntry);
    }
  )
);

router.patch(
  "/:id",
  [
    param("id").isString().notEmpty(),
    body("name").isString().optional(),
    body("category").isString().optional(),
    body("subcategory").isString().optional(),
    body("brand").isString().optional(),
    body("size").isString().optional(),
    body("colors").isArray().optional(),
    body("price").isNumeric().optional(),
    body("notes").isString().optional(),
  ],
  asyncWrapper(
    async (req, res: Response<BaseResponse<IVirtualWardrobeEntry>>) => {
      const { pb } = req;
      const { id } = req.params;
      const entry = req.body;

      if (
        !(await checkExistence(
          req,
          res,
          "virtual_wardrobe_entries",
          id,
          "entry"
        ))
      ) {
        return;
      }

      const updatedEntry = await pb
        .collection("virtual_wardrobe_entries")
        .update<IVirtualWardrobeEntry>(id, entry);

      updatedEntry.front_image = pb.files
        .getURL(updatedEntry, updatedEntry.front_image)
        .split("/files/")[1];
      updatedEntry.back_image = pb.files
        .getURL(updatedEntry, updatedEntry.back_image)
        .split("/files/")[1];

      successWithBaseResponse(res, updatedEntry);
    }
  )
);

router.delete(
  "/:id",
  [param("id").isString().notEmpty()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (
      !(await checkExistence(req, res, "virtual_wardrobe_entries", id, "entry"))
    ) {
      return;
    }

    await pb.collection("virtual_wardrobe_entries").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

router.post(
  "/vision",
  fieldsUploadMiddleware.bind({
    fields: [
      { name: "frontImage", maxCount: 1 },
      { name: "backImage", maxCount: 1 },
    ],
  }),
  asyncWrapper(async (req, res: Response<BaseResponse<string>>) => {
    const apiKey = await getAPIKey("openai", req.pb);
    console.log(req.files);
    const {
      frontImage: [frontImage],
      backImage: [backImage],
    } = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!apiKey) {
      serverError(res, "API key not found");
      fs.unlinkSync(frontImage.path);
      fs.unlinkSync(backImage.path);
      return;
    }

    if (!frontImage || !backImage) {
      clientError(res, "Images not found");
      fs.unlinkSync(frontImage.path);
      fs.unlinkSync(backImage.path);
      return;
    }

    const frontImageBuffer = fs.readFileSync(frontImage.path);
    const backImageBuffer = fs.readFileSync(backImage.path);

    //resize images to 1024xsomething
    const resizedFrontImageBuffer = await sharp(frontImageBuffer)
      .resize(1024)
      .toBuffer();
    const resizedBackImageBuffer = await sharp(backImageBuffer)
      .resize(1024)
      .toBuffer();

    const base64FrontImage = resizedFrontImageBuffer.toString("base64");
    const base64BackImage = resizedBackImageBuffer.toString("base64");

    const responseStructure = z.object({
      name: z.string(),
      category: z.union([
        z.literal("Tops"),
        z.literal("Bottoms"),
        z.literal("Dresses & Jumpsuits"),
        z.literal("Footwear"),
        z.literal("Accessories"),
        z.literal("Activewear"),
        z.literal("Formalwear"),
        z.literal("Innerwear"),
        z.literal("Sleepwear"),
        z.literal("Traditional/Occasion Wear"),
        z.literal("Outerwear"),
      ]),
      subcategory: z.union([
        z.literal("T-shirts"),
        z.literal("Shirts"),
        z.literal("Blouses"),
        z.literal("Sweaters"),
        z.literal("Hoodies"),
        z.literal("Jackets"),
        z.literal("Coats"),
        z.literal("Tank Tops"),
        z.literal("Jeans"),
        z.literal("Trousers"),
        z.literal("Shorts"),
        z.literal("Skirts"),
        z.literal("Leggings"),
        z.literal("Joggers"),
        z.literal("Dress Pants"),
        z.literal("Casual Dresses"),
        z.literal("Formal Dresses"),
        z.literal("Maxi Dresses"),
        z.literal("Jumpsuits"),
        z.literal("Overalls"),
        z.literal("Sneakers"),
        z.literal("Sandals"),
        z.literal("Boots"),
        z.literal("Heels"),
        z.literal("Loafers"),
        z.literal("Flip-flops"),
        z.literal("Slippers"),
        z.literal("Hats & Caps"),
        z.literal("Scarves"),
        z.literal("Gloves"),
        z.literal("Belts"),
        z.literal("Watches"),
        z.literal("Sunglasses"),
        z.literal("Jewelry"),
        z.literal("Sports T-shirts"),
        z.literal("Leggings"),
        z.literal("Running Shoes"),
        z.literal("Gym Shorts"),
        z.literal("Tracksuits"),
        z.literal("Sports Bras"),
        z.literal("Suits"),
        z.literal("Blazers"),
        z.literal("Dress Shirts"),
        z.literal("Ties & Bowties"),
        z.literal("Formal Shoes"),
        z.literal("Underwear"),
        z.literal("Socks"),
        z.literal("Bras"),
        z.literal("Thermals"),
        z.literal("Pajamas"),
        z.literal("Nightgowns"),
        z.literal("Robes"),
        z.literal("Cultural Attire"),
        z.literal("Wedding Dresses"),
        z.literal("Festive Wear"),
        z.literal("Raincoats"),
        z.literal("Parkas"),
        z.literal("Windbreakers"),
        z.literal("Puffer Jackets"),
      ]),
      colors: z.array(
        z.union([
          z.literal("Black"),
          z.literal("White"),
          z.literal("Gray"),
          z.literal("Red"),
          z.literal("Blue"),
          z.literal("Green"),
          z.literal("Yellow"),
          z.literal("Orange"),
          z.literal("Purple"),
          z.literal("Pink"),
          z.literal("Brown"),
          z.literal("Beige"),
          z.literal("Navy"),
          z.literal("Teal"),
          z.literal("Maroon"),
          z.literal("Olive"),
          z.literal("Turquoise"),
          z.literal("Gold"),
          z.literal("Silver"),
        ])
      ),
    });

    const response = await fetchAIWithStructuredResponse({
      apiKey,
      model: "gpt-4o-mini",
      structure: responseStructure,
      structName: "entry",
      messages: [
        {
          role: "system",
          content:
            "Given the front and back images, please provide the name, category, subcategory, and colors of the clothing item. There could be more than one color.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64FrontImage}` },
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64BackImage}` },
            },
          ],
        },
      ],
    });

    if (!response) {
      serverError(res, "Failed to process image");
      fs.unlinkSync(frontImage.path);
      fs.unlinkSync(backImage.path);
      return;
    }

    fs.unlinkSync(frontImage.path);
    fs.unlinkSync(backImage.path);

    successWithBaseResponse(res, response);
  })
);

export default router;
