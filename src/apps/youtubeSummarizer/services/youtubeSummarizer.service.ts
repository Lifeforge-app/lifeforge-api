import { exec } from "child_process";

export const getYoutubeVideoInfo = (videoId: string): Promise<IYoutubeInfo> => {
  return new Promise((resolve, reject) => {
    exec(
      `${process.cwd()}/src/core/bin/yt-dlp --skip-download --dump-json "https://www.youtube.com/watch?v=${videoId}"`,
      (err, stdout) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const data = JSON.parse(stdout);

          const response: IYoutubeInfo = {
            title: data.title,
            uploadDate: data.upload_date,
            uploader: data.uploader,
            uploaderUrl: data.uploader_url,
            duration: data.duration.toString(),
            viewCount: data.view_count,
            likeCount: data.like_count || 0,
            thumbnail: data.thumbnail,
            captions: data.subtitles || {},
            auto_captions: data.automatic_captions || {},
          };

          resolve(response);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};
