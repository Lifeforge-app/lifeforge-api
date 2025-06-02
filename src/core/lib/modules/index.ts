import express from "express";
import { body } from "express-validator";
import fs from "fs";
import JSZip from "jszip";
import _ from "lodash";
import path from "path";

import { checkExistence } from "@utils/PBRecordValidator";
import asyncWrapper from "@utils/asyncWrapper";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";

import { singleUploadMiddleware } from "../../middlewares/uploadMiddleware";

const router = express.Router();

router.get(
  "/",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const allCategories = await pb
      .collection("modules_categories")
      .getFullList();
    const allEntries = await pb.collection("modules_entries").getFullList();

    const categorizedEntries = allEntries.reduce(
      (acc, entry) => {
        const category =
          allCategories.find((cat) => cat.id === entry.category)?.name ||
          "Uncategorized";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(entry);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    successWithBaseResponse(res, categorizedEntries);
  }),
);

router.get(
  "/paths",
  asyncWrapper(async (req, res) => {
    const appsDir = path.resolve(process.cwd(), "src/apps");
    if (!fs.existsSync(appsDir)) {
      serverError(res, "Apps directory does not exist");
      return;
    }

    const appFolders = fs.readdirSync(appsDir).filter((file) => {
      return fs.statSync(path.join(appsDir, file)).isDirectory();
    });

    successWithBaseResponse(res, appFolders);
  }),
);

router.post(
  "/toggle/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "modules_entries", id))) {
      return;
    }

    const entry = await pb.collection("modules_entries").getOne(id);

    const updatedEntry = await pb.collection("modules_entries").update(id, {
      enabled: !entry.enabled,
    });

    successWithBaseResponse(res, updatedEntry);
  }),
);

function traverse(path: string, rootPath: string, zip: JSZip) {
  const listing = fs.readdirSync(path);
  for (let item of listing) {
    const itemPath = `${path}/${item}`;
    const isDirectory = fs.lstatSync(itemPath).isDirectory();
    if (isDirectory) {
      const childZip = zip.folder(item);
      traverse(itemPath, rootPath, childZip!);
    } else {
      zip.file(item, fs.readFileSync(itemPath));
    }
  }
}

router.post(
  "/package/:id",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;

    const appDir = path.resolve(process.cwd(), "src/apps");
    const moduleDir = path.join(appDir, id);

    if (!fs.existsSync(moduleDir)) {
      clientError(res, "Module does not exist");
      return;
    }

    const backendZip = JSZip();
    traverse(moduleDir, moduleDir, backendZip);
    const backendZipContent = await backendZip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${_.kebabCase(id)}.zip"`,
    );
    res.setHeader("Content-Length", backendZipContent.length);
    res.send(backendZipContent);
  }),
);

router.post(
  "/install",
  singleUploadMiddleware,
  [body("name").isString().notEmpty()],
  asyncWrapper(async (req, res) => {
    const { name } = req.body;

    if (!req.file) {
      clientError(res, "No file uploaded");
      return;
    }

    const folderName = _.camelCase(name);
    const pathName = _.kebabCase(name);

    const appsDir = path.resolve(process.cwd(), "src/apps");
    const moduleDir = path.join(appsDir, folderName);

    if (fs.existsSync(moduleDir)) {
      clientError(res, "Module already exists");
      return;
    }

    fs.mkdirSync(moduleDir, { recursive: true });
    const zipFileBuffer = fs.readFileSync(req.file.path);
    const backendzip = await JSZip.loadAsync(zipFileBuffer);
    const filePromises = Object.keys(backendzip.files).map(async (filename) => {
      const fileData = await backendzip.file(filename)?.async("nodebuffer");
      if (fileData) {
        const outputPath = path.join(moduleDir, filename);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, fileData);
      }
    });
    await Promise.all(filePromises);

    const appHasAPIIndex = fs.existsSync(path.join(moduleDir, "index.ts"));

    if (appHasAPIIndex) {
      const routesConfig = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "src/core/routes/module.routes.json"),
          "utf-8",
        ),
      ) as Record<string, string>;

      if (routesConfig[`/${pathName}`]) {
        clientError(res, "Route already exists");
        return;
      }

      routesConfig[`/${pathName}`] = folderName;
      fs.writeFileSync(
        path.join(process.cwd(), "src/core/routes/module.routes.json"),
        JSON.stringify(routesConfig, null, 2),
      );
    }

    fs.unlinkSync(req.file.path);
    successWithBaseResponse(res);
  }),
);

export default router;
