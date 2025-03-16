import Pocketbase from "pocketbase";
import {
  IBooksLibraryDownloadProcess,
  IBooksLibraryEntry,
} from "../../../../../interfaces/books_library_interfaces";
import { addToLibrary } from "./process";

// Store for all active download processes
const downloadProcesses = new Map<string, IBooksLibraryDownloadProcess>();

/**
 * Initiates a download and adds a book to the library
 */
export const initiateDownload = async (
  pb: Pocketbase,
  md5: string,
  metadata: Omit<IBooksLibraryEntry, "thumbnail" | "file"> & {
    thumbnail: File;
    file: File;
  },
) => {
  return addToLibrary(pb, md5, metadata, downloadProcesses);
};

/**
 * Gets the progress of all active downloads
 */
export const getDownloadProgresses = () => {
  return Object.fromEntries(
    Array.from(downloadProcesses.entries()).map(([k, v]) => [
      k,
      { ...v, kill: undefined },
    ]),
  );
};

/**
 * Cancels an active download
 */
export const cancelDownload = (md5: string) => {
  const process = downloadProcesses.get(md5);
  if (!process) {
    throw new Error("No such download process");
  }

  process.kill();
  downloadProcesses.delete(md5);
  return true;
};
