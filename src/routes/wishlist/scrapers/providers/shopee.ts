import { createWorker } from "tesseract.js";
import sharp from "sharp";
import ogs from "open-graph-scraper";
import { fetchAI } from "../../../../utils/fetchAI.js";

async function getPrice(imageURL: string) {
  try {
    const imageBuffer = await fetch(imageURL).then((res) => res.arrayBuffer());
    const image = sharp(Buffer.from(imageBuffer));

    const { width, height } = await image.metadata();
    if (!width || !height) {
      throw new Error("Image metadata not found");
    }

    const crop = image.extract({
      left: Math.floor(width / 2),
      top: 0,
      width: Math.floor(width / 2),
      height: Math.floor(height / 2),
    });

    const buffer = await crop.toBuffer();

    const worker = await createWorker("digits", 3, {
      langPath: "./src/models",
      cachePath: "./src/models",
      cacheMethod: "readOnly",
      gzip: false,
    });
    const ret = await worker.recognize(buffer);
    await worker.terminate();

    console.log(
      ret.data.text
        .split("\n")
        .filter((e) => e)
        .pop()
        ?.split("-")
        .shift()
    );

    const numbers = ret.data.text
      .split("\n")
      .filter((e) => e)
      .pop()
      ?.split("-")
      .map((e) => parseFloat(e?.replace(/,|(?: \.)/g, "") || "")) || [0];

    return Math.max(...numbers);
  } catch (error) {
    console.error("Error getting price");
    return null;
  }
}

async function getImageURL(url: string) {
  const options = {
    url,
    fetchOptions: {
      headers: {
        "User-Agent": "TelegramBot (like TwitterBot)",
      },
    },
  };

  const { result } = await ogs(options);

  return result.ogImage?.[0]?.url || null;
}

async function scrapeShopee(url: string, groqKey: string) {
  try {
    const options = {
      url,
      fetchOptions: {
        headers: {
          "User-Agent":
            "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        },
      },
    };

    const final: {
      name: string | null;
      price: number | null;
      image: string | null;
    } = {
      name: null,
      price: null,
      image: null,
    };

    const { result } = await ogs(options);

    const imageURL = result.ogImage?.[0]?.url;

    if (imageURL) {
      final.price = await getPrice(imageURL);
    }
    final.image = await getImageURL(url);

    const prompt = `Extract the most relevant and concise product name from the given product title, removing any unnecessary words or phrases such as descriptions, locations, and promotions. The extracted product name should be a clear and accurate representation of the product being sold. If there is the brand name of the product, the result should be in the format of "{brand} - {product name}". Please provide the extracted product name without any other words other than the product name itself.
  
  ${result.ogTitle}`;

    final.name = await fetchAI({
      provider: "groq",
      apiKey: groqKey,
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return final;
  } catch (error) {
    console.error("Error scraping data", error);
    return null;
  }
}

export default scrapeShopee;
