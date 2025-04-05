import { spawn } from "child_process";

function downloadVideo(
  url: string,
  output: string,
  progressCallback: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn(`${process.cwd()}/src/core/bin/yt-dlp`, [
      "--newline",
      "-S",
      "ext:mp4:m4a",
      "-o",
      output,
      "--write-thumbnail",
      url,
    ]);

    ytDlp.stdout.on("data", (data) => {
      const output = data.toString();

      const progressMatch = output.match(/\[download\]\s+(\d+\.\d+)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        progressCallback(progress);
      }
    });

    ytDlp.on("error", (err) => {
      if (err.message.startsWith("WARNING")) {
        console.error(`yt-dlp warning: ${err.message}`);
        return;
      }

      console.error(`yt-dlp error: ${err}`);
      reject(err);
    });

    ytDlp.stderr.on("data", (data) => {
      if (data.toString().startsWith("WARNING")) {
        console.error(`yt-dlp warning: ${data}`);
        return;
      }

      console.error(`yt-dlp error: ${data}`);
      reject(data);
    });

    ytDlp.on("close", (code) => {
      resolve("done");
    });
  });
}

export default downloadVideo;
