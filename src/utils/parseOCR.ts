import { createWorker } from "tesseract.js";

async function parseOCR(imagePath: string): Promise<string> {
  const worker = await createWorker("eng", 3, {
    langPath: "./src/models",
    cachePath: "./src/models",
    cacheMethod: "readOnly",
    gzip: false,
  });
  const ret = await worker.recognize(imagePath);
  await worker.terminate();

  return ret.data.text;
}

export default parseOCR;
