import fs from "fs";
import { JSDOM } from "jsdom";
import PDFDocument from "pdfkit";
import PocketBase from "pocketbase";
import sharp from "sharp";
import { IGuitarTabsEntry } from "../typescript/guitar_tabs_interfaces";

export const getTabsList = async (cookie: string, page: number) => {
  const data: Record<string, any> = await fetch(
    `https://user.guitarworld.com.cn/user/pu/my/pu_list?page=${page}`,
    {
      headers: {
        cookie,
      },
    },
  ).then((res) => {
    return res.json();
  });

  return {
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
};

export const downloadTab = async (
  pb: PocketBase,
  cookie: string,
  id: string,
  name: string,
  category: string,
  mainArtist: string,
  audioUrl: string,
): Promise<IGuitarTabsEntry> => {
  const rawHTML = await fetch(
    "https://user.guitarworld.com.cn/user/pu/my/" + id,
    {
      method: "GET",
      headers: {
        cookie,
      },
    },
  ).then((res) => res.text());

  const dom = new JSDOM(rawHTML);
  const pics = Array.from(dom.window.document.querySelectorAll(".pic img")).map(
    (e) => (e as HTMLImageElement).src,
  );

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
    const imageBuffer = await sharp(image).png().toBuffer();
    const { width, height } = await sharp(imageBuffer).metadata();

    doc.addPage({ size: [width!, height!] });
    doc.image(imageBuffer, 0, 0, { width, height });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", async () => {
      const audioBuffer = await fetch(audioUrl).then((res) =>
        res.arrayBuffer(),
      );

      if (!fs.existsSync(`./medium/${id}.pdf`)) {
        reject(new Error("PDF file not found"));
        return;
      }

      const newEntry = await pb
        .collection("guitar_tabs_entries")
        .create<IGuitarTabsEntry>({
          name,
          author: mainArtist,
          pageCount: images.length,
          audio: new File([Buffer.from(audioBuffer)], `${id}.mp3`),
          pdf: new File([fs.readFileSync(`./medium/${id}.pdf`)], `${id}.pdf`),
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
            `${id}.jpeg`,
          ),
        });

      fs.rmdirSync(folder, { recursive: true });
      fs.unlinkSync(`./medium/${id}.pdf`);

      resolve(newEntry);
    });
  });
};
