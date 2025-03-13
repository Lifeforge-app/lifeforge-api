import express, { Response } from "express";
import { body } from "express-validator";
import hasError from "../../../utils/checkError";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import asyncWrapper from "../../../utils/asyncWrapper";
import { JSDOM } from "jsdom";
import fs from "fs";
import { IGuitarTabsEntry } from "../../../interfaces/guitar_tabs_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import PDFDocument from "pdfkit";
import sharp from "sharp";

const router = express.Router();

router.post(
  "/",
  [body("cookie").exists().notEmpty(), body("page").isNumeric()],
  asyncWrapper(async (req, res) => {
    const { cookie, page } = req.body;

    const data: Record<string, any> | null = await fetch(
      `https://user.guitarworld.com.cn/user/pu/my/pu_list?page=${page}`,
      {
        headers: {
          cookie,
        },
      }
    )
      .then((res) => {
        try {
          return res.json();
        } catch (e) {
          return null;
        }
      })
      .catch(() => {
        return null;
      });

    if (!data) {
      clientError(res, "Failed to fetch data", 502);
      return;
    }

    const final = {
      data: data.data.list
        .map((item: Record<string, any>) => item.qupu)
        .map((item: Record<string, any>) => ({
          id: item.id,
          name: item.name,
          subtitle: item.sub_title,
          category: item.category_txt,
          mainArtist: item.main_artist,
          uploader: item.creator_name,
          audioUrl: item.audio,
        })),
      totalItems: data.data.total,
      perPage: data.data.page_size,
    };

    successWithBaseResponse(res, final);
  })
);

router.post(
  "/download",
  [
    body("cookie").exists().notEmpty(),
    body("id").exists().notEmpty(),
    body("name").exists().notEmpty(),
    body("category").exists().notEmpty(),
    body("mainArtist").exists().notEmpty(),
    body("audioUrl").exists().notEmpty(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IGuitarTabsEntry>>) => {
    const { cookie, id, name, category, mainArtist, audioUrl } = req.body;
    const { pb } = req;

    try {
      const rawHTML = await fetch(
        "https://user.guitarworld.com.cn/user/pu/my/" + id,
        {
          method: "GET",
          headers: {
            cookie,
          },
        }
      ).then((res) => res.text());

      const dom = new JSDOM(rawHTML);
      const pics = Array.from(
        dom.window.document.querySelectorAll(".pic img")
      ).map((e) => (e as HTMLImageElement).src);

      const folder = `./medium/${id}`;
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }

      for (let i = 0; i < pics.length; i++) {
        const arrayBuffer = await fetch(pics[i], {
          method: "GET",
          headers: {
            cookie,
          },
        }).then((res) => res.arrayBuffer());

        fs.writeFileSync(`./medium/${id}/${i}.jpg`, Buffer.from(arrayBuffer));
      }

      const doc = new PDFDocument({ autoFirstPage: false });
      const writeStream = fs.createWriteStream("./medium/" + id + ".pdf");
      doc.pipe(writeStream);

      const images = fs.readdirSync(folder).map((e) => folder + "/" + e);

      for (const image of images) {
        try {
          const imageBuffer = await sharp(image).png().toBuffer();
          const { width, height } = await sharp(imageBuffer).metadata();

          doc.addPage({ size: [width!, height!] });
          doc.image(imageBuffer, 0, 0, { width, height });
        } catch (error) {
          console.error(`Error processing image ${image}:`, error);
        }
      }

      doc.end();

      writeStream.on("finish", async () => {
        try {
          const audioBuffer = await fetch(audioUrl).then((res) =>
            res.arrayBuffer()
          );

          const newEntry = await pb
            .collection("guitar_tabs_entries")
            .create<IGuitarTabsEntry>({
              name,
              author: mainArtist,
              pageCount: images.length,
              audio: new File([Buffer.from(audioBuffer)], `${id}.mp3`),
              pdf: new File(
                [fs.readFileSync(`./medium/${id}.pdf`)],
                `${id}.pdf`
              ),
              type: (() => {
                switch (category) {
                  case "弹唱吉他谱":
                    return "singalong";
                  case "指弹吉他谱":
                    return "fingerstyle";
                  default:
                    return "";
                }
              })(),
              thumbnail: new File(
                [fs.readFileSync(`./medium/${id}/0.jpg`)],
                `${id}.jpeg`
              ),
            });

          fs.rmdirSync(folder, { recursive: true });
          fs.unlinkSync(`./medium/${id}.pdf`);

          successWithBaseResponse(res, newEntry);
        } catch {
          clientError(res, "Failed to create entry", 502);
        }
      });
    } catch (err) {
      console.error(err)
      clientError(res, "Failed to fetch data", 502);
      return;
    }
  })
);

export default router;
