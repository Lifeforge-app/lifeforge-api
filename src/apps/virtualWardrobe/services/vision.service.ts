import fs from "fs";
import PocketBase from "pocketbase";
import sharp from "sharp";
import { z } from "zod";

import { fetchAI } from "@utils/fetchAI";
import { getAPIKey } from "@utils/getAPIKey";

export interface VisionAnalysisResult {
  name: string;
  category: string;
  subcategory: string;
  colors: string[];
}

export const analyzeClothingImages = async (
  pb: PocketBase,
  frontImagePath: string,
  backImagePath: string,
): Promise<VisionAnalysisResult> => {
  const apiKey = await getAPIKey("openai", pb);

  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }

  // Read and resize images
  const frontImageBuffer = fs.readFileSync(frontImagePath);
  const backImageBuffer = fs.readFileSync(backImagePath);

  const resizedFrontImageBuffer = await sharp(frontImageBuffer)
    .resize(1024)
    .toBuffer();
  const resizedBackImageBuffer = await sharp(backImageBuffer)
    .resize(1024)
    .toBuffer();

  const base64FrontImage = resizedFrontImageBuffer.toString("base64");
  const base64BackImage = resizedBackImageBuffer.toString("base64");

  // Define response structure
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
        z.literal("Coral"),
        z.literal("Mint"),
        z.literal("Lavender"),
        z.literal("Cream"),
        z.literal("Tan"),
        z.literal("Khaki"),
        z.literal("Burgundy"),
        z.literal("Magenta"),
        z.literal("Cyan"),
        z.literal("Lime"),
        z.literal("Rose"),
        z.literal("Salmon"),
        z.literal("Peach"),
        z.literal("Gold"),
        z.literal("Silver"),
      ]),
    ),
  });

  const response = await fetchAI({
    apiKey,
    provider: "openai",
    model: "gpt-4o-mini",
    structure: responseStructure,
    messages: [
      {
        role: "system",
        content: `Given the front and back images, please provide the name, category, subcategory, and colors of the clothing item. There could be more than one color.
          
          Note that the groupings between categories and subcategories are as follows:
          - Tops: T-shirts, Shirts, Blouses, Sweaters, Hoodies, Jackets, Coats, Tank Tops
          - Bottoms: Jeans, Trousers, Shorts, Skirts, Leggings, Joggers, Dress Pants
          - Dresses & Jumpsuits: Casual Dresses, Formal Dresses, Maxi Dresses, Jumpsuits, Overalls
          - Footwear: Sneakers, Sandals, Boots, Heels, Loafers, Flip-flops, Slippers
          - Accessories: Hats & Caps, Scarves, Gloves, Belts, Watches, Sunglasses, Jewelry
          - Activewear: Sports T-shirts, Leggings, Running Shoes, Gym Shorts, Tracksuits, Sports Bras
          - Formalwear: Suits, Blazers, Dress Shirts, Ties & Bowties, Formal Shoes
          - Innerwear: Underwear, Socks, Bras, Thermals
          - Sleepwear: Pajamas, Nightgowns, Robes
          - Traditional/Occasion Wear: Cultural Attire, Wedding Dresses, Festive Wear
          - Outerwear: Raincoats, Parkas, Windbreakers, Puffer Jackets
          `,
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
    throw new Error("Failed to process image");
  }

  return response;
};
