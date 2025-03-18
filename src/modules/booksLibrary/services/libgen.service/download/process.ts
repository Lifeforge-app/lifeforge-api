import { spawn } from "child_process";
import fs from "fs";
import Pocketbase from "pocketbase";
import { IBooksLibraryEntry } from "../../../typescript/books_library_interfaces";

export const addToLibrary = async (
  pb: Pocketbase,
  md5: string,
  metadata: Omit<IBooksLibraryEntry, "thumbnail" | "file"> & {
    thumbnail: File;
    file: File;
  },
  downloadProcesses: Map<string, any>,
) => {
  const target = `http://libgen.li/ads.php?md5=${md5}`;

  downloadProcesses.set(md5, {
    kill: () => {},
    downloaded: "0B",
    total: "0B",
    percentage: "0%",
    speed: "0B/s",
    ETA: "0",
    metadata,
  });

  try {
    const data = await fetch(target).then((res) => res.text());
    const link = data.match(
      /<a href="(get\.php\?md5=.*?&key=.*?)"><h2>GET<\/h2><\/a>/,
    )?.[1];

    if (!link) throw new Error("Failed to add to library");

    const downloadLink = `http://libgen.li/${link}`;

    const downloadProcess = spawn("aria2c", [
      "--dir=./medium",
      `--out=${md5}.${metadata.extension}`,
      "--log-level=info",
      "-l-",
      "-x8",
      downloadLink,
    ]);

    new Promise<boolean>((resolve, reject) => {
      downloadProcess.stdout.on("data", (data) => {
        data = data.toString();
        if (/ETA:/.test(data)) {
          const matches =
            /\[#\w{6} (?<downloaded>.*?)\/(?<total>.*?)\((?<percentage>.*?%)\).*?DL:(?<speed>.*?) ETA:(?<ETA>.*?)s\]/g.exec(
              data,
            );

          if (matches) {
            const { downloaded, total, percentage, speed, ETA } =
              matches.groups!;

            downloadProcesses.set(md5, {
              kill: downloadProcess.kill,
              downloaded,
              total,
              percentage,
              speed,
              ETA,
              metadata,
            });
          }
        }
      });

      downloadProcess.stderr.on("data", (data) => {
        downloadProcesses.delete(md5);
        reject("Failed to download file");
      });

      downloadProcess.on("error", (err) => {
        downloadProcesses.delete(md5);
        reject("Failed to download file");
      });

      downloadProcess.on("close", async () => {
        if (!fs.existsSync(`./medium/${md5}.${metadata.extension}`)) {
          downloadProcesses.delete(md5);
          reject("Failed to download file");
          return;
        }

        try {
          await processDownloadedFiles(pb, md5, metadata);

          downloadProcesses.delete(md5);
          fs.unlinkSync(`./medium/${md5}.${metadata.extension}`);
          resolve(true);
        } catch (error) {
          downloadProcesses.delete(md5);
          fs.unlinkSync(`./medium/${md5}.${metadata.extension}`);
          reject(error);
        }
      });
    });

    return { initiated: true };
  } catch (error) {
    downloadProcesses.delete(md5);
    throw error;
  }
};

async function processDownloadedFiles(
  pb: Pocketbase,
  md5: string,
  metadata: Omit<IBooksLibraryEntry, "thumbnail" | "file"> & {
    thumbnail: File;
    file: File;
  },
) {
  await fetch(`http://libgen.is/${metadata.thumbnail}`).then(
    async (response) => {
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        metadata.thumbnail = new File([buffer], "image.jpg", {
          type: "image/jpeg",
        });
      }
    },
  );

  const file = fs.readFileSync("./medium/" + md5 + "." + metadata.extension);
  if (!file) throw new Error("Failed to read file");
  metadata.file = new File([file], `${md5}.${metadata.extension}`);

  await pb.collection("books_library_entries").create(metadata);

  await updateFileTypeStatistics(pb, metadata.extension);
}

async function updateFileTypeStatistics(pb: Pocketbase, extension: string) {
  const fileTypeEntry = await pb
    .collection("books_library_file_types")
    .getFirstListItem(`name = "${extension}"`)
    .catch(() => null);

  if (fileTypeEntry) {
    await pb.collection("books_library_file_types").update(fileTypeEntry.id, {
      count: fileTypeEntry.count + 1,
    });
  } else {
    await pb.collection("books_library_file_types").create({
      name: extension,
      count: 1,
    });
  }
}
