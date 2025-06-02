import fs from "fs";
import mime from "mime-types";
import * as mm from "music-metadata";
import Pocketbase from "pocketbase";

import { IMusicEntry } from "../typescript/music_interfaces";

let importProgress: "in_progress" | "completed" | "failed" | "empty" = "empty";

export const getImportProgress = ():
  | "in_progress"
  | "completed"
  | "failed"
  | "empty" => {
  return importProgress;
};

export const setImportProgress = (
  status: "in_progress" | "completed" | "failed" | "empty",
) => {
  importProgress = status;
};

export const getAllEntries = async (pb: Pocketbase): Promise<IMusicEntry[]> => {
  const result = await pb.collection("music_entries").getFullList<IMusicEntry>({
    sort: "-is_favourite, name",
  });
  return result;
};

export const importMusicFromNAS = async (pb: Pocketbase) => {
  fs.readdirSync(`${process.cwd()}/../medium`)
    .filter((file) => file.startsWith("."))
    .forEach((file) => fs.unlinkSync(`${process.cwd()}/../medium/${file}`));

  const newFiles = fs
    .readdirSync(`${process.cwd()}/../medium`)
    .filter((file) => {
      const fileMime = mime.lookup(file);
      return (
        !file.startsWith(".") &&
        (fileMime ? fileMime.startsWith("audio") : false)
      );
    });

  for (const file of newFiles) {
    const fp = `${process.cwd()}/../medium/${file}`;
    const fileBuffer = fs.readFileSync(fp);
    const metadata = await mm.parseFile(fp);
    const artist = metadata.common.artist || "Unknown";
    const duration = metadata.format.duration || 0;

    await pb.collection("music_entries").create({
      name: metadata.common.title || file.split(".").slice(0, -1).join("."),
      author: artist,
      duration,
      file: new File([fileBuffer], file),
    });

    fs.unlinkSync(fp);
  }
};

export const updateEntry = async (
  pb: Pocketbase,
  id: string,
  data: { name: string; author: string },
): Promise<IMusicEntry> => {
  return await pb.collection("music_entries").update(id, data);
};

export const deleteEntry = async (pb: Pocketbase, id: string) => {
  await pb.collection("music_entries").delete(id);
};

export const toggleFavorite = async (
  pb: Pocketbase,
  id: string,
): Promise<IMusicEntry> => {
  const entry = await pb.collection("music_entries").getOne(id);
  return await pb.collection("music_entries").update(id, {
    is_favourite: !entry.is_favourite,
  });
};
