import fs from "fs";
// @ts-expect-error - No types available
import pdfPageCounter from "pdf-page-counter";
import pdfThumbnail from "pdf-thumbnail";
import PocketBase, { ListResult } from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import {
  IGuitarTabsAuthors,
  IGuitarTabsEntry,
  IGuitarTabsSidebarData,
} from "../typescript/guitar_tabs_interfaces";

let processing = "empty";
let left = 0;
let total = 0;

export const getRandomEntry = async (
  pb: PocketBase,
): Promise<WithPB<IGuitarTabsEntry>> => {
  const allScores = await pb
    .collection("guitar_tabs_entries")
    .getFullList<WithPB<IGuitarTabsEntry>>();

  return allScores[Math.floor(Math.random() * allScores.length)];
};

export const getSidebarData = async (
  pb: PocketBase,
): Promise<IGuitarTabsSidebarData> => {
  const allScores = await pb
    .collection("guitar_tabs_entries")
    .getFullList<WithPB<IGuitarTabsEntry>>();
  const allAuthors = await pb
    .collection("guitar_tabs_authors")
    .getFullList<WithPB<IGuitarTabsAuthors>>();

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
  } satisfies IGuitarTabsSidebarData;
};

export const getEntries = (
  pb: PocketBase,
  {
    page,
    query = "",
    category,
    author,
    starred,
    sort,
  }: {
    page: number;
    query?: string;
    category?: string;
    author?: string;
    starred: boolean;
    sort: "name" | "author" | "newest" | "oldest";
  },
): Promise<ListResult<WithPB<IGuitarTabsEntry>>> => {
  return pb
    .collection("guitar_tabs_entries")
    .getList<WithPB<IGuitarTabsEntry>>(page, 20, {
      filter: `(name~"${query}" || author~"${query}") 
        ${category ? `&& type="${category === "uncategorized" ? "" : category}"` : ""} 
        ${author ? `&& ${author === "[na]" ? "author = ''" : `author~"${author}"`}` : ""} 
        ${starred ? "&& isFavourite=true" : ""}`,
      sort: `-isFavourite, ${
        {
          name: "name",
          author: "author",
          newest: "-created",
          oldest: "created",
        }[sort]
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

    let groups: Record<
      string,
      {
        pdf: Express.Multer.File | null;
        mscz: Express.Multer.File | null;
        mp3: Express.Multer.File | null;
      }
    > = {};

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

const processFiles = async (
  pb: PocketBase,
  groups: Record<
    string,
    {
      pdf: Express.Multer.File | null;
      mscz: Express.Multer.File | null;
      mp3: Express.Multer.File | null;
    }
  >,
) => {
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

          await pb
            .collection("guitar_tabs_entries")
            .create<WithPB<IGuitarTabsEntry>>(
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

export const getProcessStatus = (): {
  status: string;
  left: number;
  total: number;
} => ({
  status: processing,
  left,
  total,
});

export const updateEntry = (
  pb: PocketBase,
  id: string,
  { name, author, type }: Pick<IGuitarTabsEntry, "name" | "author" | "type">,
): Promise<WithPB<IGuitarTabsEntry>> =>
  pb.collection("guitar_tabs_entries").update<WithPB<IGuitarTabsEntry>>(id, {
    name,
    author,
    type,
  });

export const deleteEntry = async (pb: PocketBase, id: string) => {
  await pb.collection("guitar_tabs_entries").delete(id);
};

export const toggleFavorite = async (
  pb: PocketBase,
  id: string,
): Promise<WithPB<IGuitarTabsEntry>> => {
  const entry = await pb
    .collection("guitar_tabs_entries")
    .getOne<WithPB<IGuitarTabsEntry>>(id);

  return await pb
    .collection("guitar_tabs_entries")
    .update<WithPB<IGuitarTabsEntry>>(id, {
      isFavourite: !entry.isFavourite,
    });
};
