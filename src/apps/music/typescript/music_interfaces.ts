import BasePBCollection from "@typescript/pocketbase_interfaces";

interface IMusicEntry extends BasePBCollection {
  name: string;
  author: string;
  duration: string;
  file: string;
  is_favourite: boolean;
}

interface IYoutubeData {
  title: string;
  uploadDate: string;
  uploader: string;
  uploaderUrl?: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
}

export type { IMusicEntry, IYoutubeData };
