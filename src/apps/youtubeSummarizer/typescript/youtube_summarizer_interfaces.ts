interface IYoutubeInfo {
  title: string;
  uploadDate: string;
  uploader: string;
  uploaderUrl?: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
  captions?: Record<string, any>;
  auto_captions?: Record<string, any>;
}
