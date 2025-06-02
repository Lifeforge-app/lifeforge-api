import fs from "fs";
import moment from "moment";
// @ts-expect-error - No types available
import pdfPageCounter from "pdf-page-counter";
import pdfThumbnail from "pdf-thumbnail";
import PocketBase from "pocketbase";

import {
  IGuitarTabsAuthors,
  IGuitarTabsEntry,
  IGuitarTabsSidebarData,
} from "../typescript/guitar_tabs_interfaces";

let processing = "empty";
let left = 0;
let total = 0;

export const getRandomEntry = async (pb: PocketBase): Promise => {
  const allScores = await pb
    .collection("guitar_tabs_entries")
    .getFullList<IGuitarTabsEntry>();

  return allScores[Math.floor(Math.random() * allScores.length)];
};

export const getSidebarData = async (pb: PocketBase): Promise => {
  const allScores = await pb
    .collection("guitar_tabs_entries")
    .getFullList<IGuitarTabsEntry>();
  const allAuthors = await pb
    .collection("guitar_tabs_authors")
    .getFullList<IGuitarTabsAuthors>();

  return {
    total: allScores.length,
    favourites: allScores.filter((entry) => entry.isFavourite).length,
    categories: {
      fingerstyle: allScores.filter((entry) => entry.type === "fingerstyle")
        .length,
      singalong: allScores.filter((entry) => entry.type === "singalong").length,
      uncategorized: allScores.filter((entry) => entry.type === "").length,
    },
    authors: Object.fromEntries(
      allAuthors.map((author) => [author.name, author.amount]),
    ),
  };
};

export const getEntries = async (
  pb: PocketBase,
  page: number,
  search: string,
  category: string,
  author: string,
  starred: boolean,
  sort: string,
) => {
  return await pb.collection("guitar_tabs_entries").getList(page, 20, {
    filter: `(name~"${search}" || author~"${search}") && ${
      category === "uncategorized" ? "type=''" : `type~"${category}"`
    } && ${author === "na" ? "author = ''" : `author~"${author}"`} ${
      starred ? "&& isFavourite=true" : ""
    }`,
    sort: `-isFavourite, ${
      sort === "newest"
        ? "-created"
        : sort === "oldest"
          ? "created"
          : sort || "-created"
    }`,
  });
};

export const uploadFiles = async (
  pb: PocketBase,
  files: Express.Multer.File[],
) => {
  try {
    if (processing === "in_progress") {
      for (const file of files) {
        fs.unlinkSync(file.path);
      }
      return { status: "error", message: "Already processing" };
    }

    let groups: Record = {};

    for (const file of files) {
      const decodedName = decodeURIComponent(file.originalname);
      const extension = decodedName.split(".").pop();

      if (!extension || !["mscz", "mp3", "pdf"].includes(extension)) continue;

      const name = decodedName.split(".").slice(0, -1).join(".");

      if (!groups[name]) {
        groups[name] = {
          pdf: null,
          mscz: null,
          mp3: null,
        };
      }

      groups[name][extension as "pdf" | "mscz" | "mp3"] = file;
    }

    for (const group of Object.values(groups)) {
      if (group.pdf) continue;

      for (const file of Object.values(group)) {
        if (!file) continue;

        fs.unlinkSync(file.path);
      }
    }

    groups = Object.fromEntries(
      Object.entries(groups).filter(([_, group]) => group.pdf),
    );

    processing = "in_progress";
    left = Object.keys(groups).length;
    total = Object.keys(groups).length;

    processFiles(pb, groups);

    return { status: "success" };
  } catch (error) {
    processing = "failed";
    return { status: "error", message: "Failed to process files" };
  }
};

const processFiles = async (pb: PocketBase, groups: Record) => {
  for (const group of Object.values(groups)) {
    try {
      const file = group.pdf!;
      const decodedName = decodeURIComponent(file.originalname);
      const name = decodedName.split(".").slice(0, -1).join(".");
      const path = file.path;
      const buffer = fs.readFileSync(path);

      const thumbnail = await pdfThumbnail(buffer, {
        compress: {
          type: "JPEG",
          quality: 70,
        },
      });

      const { numpages } = await pdfPageCounter(buffer);

      thumbnail
        .pipe(fs.createWriteStream(`medium/${decodedName}.jpg`))
        .once("close", async () => {
          const thumbnailBuffer = fs.readFileSync(`medium/${decodedName}.jpg`);

          const otherFiles: {
            audio: File | null;
            musescore: File | null;
          } = {
            audio: null,
            musescore: null,
          };

          if (group.mscz) {
            otherFiles.musescore = new File(
              [fs.readFileSync(group.mscz.path)],
              group.mscz.originalname,
            );
          }

          if (group.mp3) {
            otherFiles.audio = new File(
              [fs.readFileSync(group.mp3.path)],
              group.mp3.originalname,
            );
          }

          await pb.collection("guitar_tabs_entries").create(
            {
              name,
              thumbnail: new File([thumbnailBuffer], `${decodedName}.jpeg`),
              author: "",
              pdf: new File([buffer], decodedName),
              pageCount: numpages,
              ...otherFiles,
            },
            {
              $autoCancel: false,
            },
          );

          fs.unlinkSync(path);
          fs.unlinkSync(`medium/${decodedName}.jpg`);
          if (group.mscz) {
            fs.unlinkSync(group.mscz.path);
          }
          if (group.mp3) {
            fs.unlinkSync(group.mp3.path);
          }
          left--;

          if (left === 0) {
            processing = "completed";
          }
        });
    } catch (err) {
      processing = "failed";
      const allFilesLeft = fs.readdirSync("medium");
      for (const file of allFilesLeft) {
        fs.unlinkSync(`medium/${file}`);
      }

      left = 0;
      total = 0;
      break;
    }
  }
};

export const getProcessStatus = () => {
  return { status: processing, left, total };
};

export const updateEntry = async (
  pb: PocketBase,
  id: string,
  name: string,
  author: string,
  type: string,
): Promise => {
  return await pb.collection("guitar_tabs_entries").update(id, {
    name,
    author,
    type,
  });
};

export const deleteEntry = async (pb: PocketBase, id: string): Promise => {
  await pb.collection("guitar_tabs_entries").delete(id);
};

export const downloadAllEntries = async (pb: PocketBase): Promise => {
  const entries = await pb
    .collection("guitar_tabs_entries")
    .getFullList<IGuitarTabsEntry>();

  let mediumLocation = `${process.cwd()}/../medium`;
  const date = moment().format("YYYY-MM-DD");
  if (!fs.existsSync(`${mediumLocation}/guitar_tabs-${date}`)) {
    fs.mkdirSync(`${mediumLocation}/guitar_tabs-${date}`);
    mediumLocation = `${mediumLocation}/guitar_tabs-${date}`;
  } else {
    let i = 1;
    while (fs.existsSync(`${mediumLocation}/guitar_tabs-${date}-${i}`)) {
      i++;
    }
    fs.mkdirSync(`${mediumLocation}/guitar_tabs-${date}-${i}`);
    mediumLocation = `${mediumLocation}/guitar_tabs-${date}-${i}`;
  }

  for (const entry of entries) {
    let targetLocation = mediumLocation;
    const folderLocation = `${process.cwd()}/../database/pb_data/storage/${
      entry.collectionId
    }/${entry.id}`;

    let i = 0;
    if (entry.audio || entry.musescore) {
      while (true) {
        const number = i === 0 ? "" : `-${i}`;
        if (fs.existsSync(`${mediumLocation}/${entry.name}${number}`)) {
          i++;
          continue;
        }
        fs.mkdirSync(`${mediumLocation}/${entry.name}${number}`);
        targetLocation = `${mediumLocation}/${entry.name}${number}`;
        break;
      }
    }

    i = 0;
    while (true) {
      const number = i === 0 ? "" : `-${i}`;
      if (fs.existsSync(`${targetLocation}/${entry.name}${number}.pdf`)) {
        i++;
        continue;
      }
      fs.copyFileSync(
        `${folderLocation}/${entry.pdf}`,
        `${targetLocation}/${entry.name}${number}.pdf`,
      );
      break;
    }

    if (entry.audio) {
      i = 0;
      const ext = entry.audio.split(".").pop();
      while (true) {
        const number = i === 0 ? "" : `-${i}`;
        if (fs.existsSync(`${targetLocation}/${entry.name}${number}.${ext}`)) {
          i++;
          continue;
        }
        fs.copyFileSync(
          `${folderLocation}/${entry.audio}`,
          `${targetLocation}/${entry.name}${number}.${ext}`,
        );
        break;
      }

      if (entry.musescore) {
        i = 0;
        const ext = entry.musescore.split(".").pop();
        while (true) {
          const number = i === 0 ? "" : `-${i}`;
          if (
            fs.existsSync(`${targetLocation}/${entry.name}${number}.${ext}`)
          ) {
            i++;
            continue;
          }
          fs.copyFileSync(
            `${folderLocation}/${entry.musescore}`,
            `${targetLocation}/${entry.name}${number}.${ext}`,
          );
          break;
        }
      }
    }
  }
};

export const toggleFavorite = async (pb: PocketBase, id: string): Promise => {
  const entry = await pb
    .collection("guitar_tabs_entries")
    .getOne<IGuitarTabsEntry>(id);

  return await pb
    .collection("guitar_tabs_entries")
    .update<IGuitarTabsEntry>(id, {
      isFavourite: !entry.isFavourite,
    });
};
