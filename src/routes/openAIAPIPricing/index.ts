import express from "express";
import asyncWrapper from "../../utils/asyncWrapper.js";
import { JSDOM } from "jsdom";
import fs from "fs";
import { clientError, success } from "../../utils/response.js";
import { body } from "express-validator";
import hasError from "../../utils/checkError.js";

const cachedFile = "./cached/openAIAPIPricing.json";

if (!fs.existsSync(cachedFile.split("/").slice(0, -1).join("/"))) {
  fs.mkdirSync(cachedFile.split("/").slice(0, -1).join("/"), {
    recursive: true,
  });
}

function parsePrice(price: string) {
  const [amount, usage] = price.split(" / ");
  return {
    amount: parseFloat(amount.replace("$", "").replace(",", "")),
    usage,
  };
}

async function scrapeData(raw: string): Promise<Record<string, any> | null> {
  try {
    const dom = new JSDOM(raw).window.document;

    const result = Array.from(
      dom.querySelectorAll(".mt-2xl .bg-surface-primary")
    ).map((e) => e.innerHTML.trim());

    if (!result.length) {
      return null;
    }

    const grandFinalData: Record<string, any> = {};

    for (const section of result) {
      const dom = new JSDOM(section).window.document;
      const title = dom.querySelector(".text-h5")?.textContent;

      if (!title) {
        continue;
      }

      const description = dom.querySelector(".text-caption")?.textContent;
      const priceTable = dom.querySelector(
        ".overflow-hidden > .w-full:nth-child(2)"
      );

      const priceData = Array.from(priceTable?.querySelectorAll(".grid") || [])
        .map((e) =>
          Array.from(e.querySelectorAll("div.text-small > div")).map(
            (e) => e.textContent
          )
        )
        .slice(1);

      const separateByModel: Record<string, any> = {};
      let lastKey: string = "";

      for (const item of priceData) {
        if (item[0] && item[0] !== lastKey) {
          separateByModel[item[0]] = [item.slice(1)];
          lastKey = item[0];
        } else {
          separateByModel[lastKey].push(item.slice(1));
        }
      }

      const finalData: Record<string, any> = {};

      if (!title.includes("Image")) {
        for (const [key, value] of Object.entries(separateByModel)) {
          finalData[key] = [];

          let lastKey;
          for (let i = 0; i < value.length; i++) {
            if (
              !!["Audio", "Text", "Image", "Video"].some((e) =>
                value[i][0].includes(e)
              )
            ) {
              finalData[key].push({
                type: value[i][0],
                items: [],
              });
              lastKey = value[i][0];

              while (
                value[i + 1] &&
                !["Audio", "Text", "Image", "Video"].some((e) =>
                  value[i + 1][0].includes(e)
                )
              ) {
                finalData[key][finalData[key].length - 1].items.push(
                  parsePrice(value[i + 1][0])
                );
                i++;
              }
            } else {
              if (value[i].filter((e: string) => e).length === 2) {
                finalData[key].push({
                  single: parsePrice(value[i][0]),
                  batch: parsePrice(value[i][1]),
                });
              } else {
                finalData[key].push({
                  single: parsePrice(value[i][0]),
                });
              }
            }
          }
        }
      } else {
        for (const [key, value] of Object.entries(separateByModel)) {
          finalData[key] = [];

          for (let [quality, resolution, price] of value) {
            finalData[key].push({
              quality,
              resolution: resolution.split(",").map((e: string) =>
                e
                  .trim()
                  .split("×")
                  .map((e) => parseInt(e))
              ),
              price: parsePrice(price),
            });
          }
        }
      }

      grandFinalData[title] = {
        description,
        data: finalData,
      };
    }

    fs.writeFileSync(cachedFile, JSON.stringify(grandFinalData, null, 2));

    return grandFinalData;
  } catch (err) {
    return null;
  }
}

const router = express.Router();

router.get(
  "/",
  asyncWrapper(async (req, res) => {
    if (fs.existsSync(cachedFile)) {
      const data = JSON.parse(fs.readFileSync(cachedFile, "utf-8"));
      success(res, data);
    } else {
      success(res, {});
    }
  })
);

router.post(
  "/",
  [body("raw").isString()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { raw } = req.body;

    const data = await scrapeData(raw);
    if (data) {
      success(res, data);
    } else {
      clientError(res, "Failed to scrape data");
    }
  })
);

export default router;
