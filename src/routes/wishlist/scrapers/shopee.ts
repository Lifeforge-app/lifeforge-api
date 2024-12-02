import { createWorker } from "tesseract.js";
import sharp from "sharp";
import ogs from "open-graph-scraper";
import { fetchGroq } from "../../../utils/fetchGroq.js";

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

    return parseFloat(
      ret.data.text
        .split("\n")
        .filter((e) => e)
        .pop()
        ?.split("-")
        .pop() || ""
    );
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

    const prompt = `Extract the most relevant and concise product name from the given product title, removing any unnecessary words or phrases such as descriptions, locations, and promotions. The extracted product name should be a clear and accurate representation of the product being sold. Please provide the extracted product name without any other words other than the product name itself.
  
  ${result.ogTitle}`;

    final.name = await fetchGroq(groqKey, prompt);

    return final;
  } catch (error) {
    console.error("Error scraping Shopee", error);
    return null;
  }
}

export default scrapeShopee;
