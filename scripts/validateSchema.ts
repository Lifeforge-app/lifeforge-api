import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs";
import _ from "lodash";
import path from "path";
import Pocketbase from "pocketbase";

dotenv.config({
  path: path.resolve(__dirname, "../env/.env.local"),
});

if (!process.env.PB_HOST || !process.env.PB_EMAIL || !process.env.PB_PASSWORD) {
  console.error(
    "Please provide PB_HOST, PB_EMAIL, and PB_PASSWORD in your environment variables.",
  );
  process.exit(1);
}

const pb = new Pocketbase(process.env.PB_HOST);

try {
  await pb
    .collection("_superusers")
    .authWithPassword(process.env.PB_EMAIL, process.env.PB_PASSWORD);

  if (!pb.authStore.isSuperuser || !pb.authStore.isValid) {
    console.error("Invalid credentials.");
    process.exit(1);
  }
} catch {
  console.error("Invalid credentials.");
  process.exit(1);
}

function getAllTSFiles(dir: string): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let tsFiles: string[] = [];

  for (const file of files) {
    if (file.isDirectory()) {
      tsFiles = tsFiles.concat(getAllTSFiles(path.join(dir, file.name)));
    } else if (file.name.endsWith(".ts") && !file.name.endsWith(".d.ts")) {
      tsFiles.push(path.join(dir, file.name));
    }
  }

  return tsFiles;
}

const tsFiles = getAllTSFiles("./src/apps").concat(
  getAllTSFiles("./src/core/lib"),
);

const allModules = [
  ...fs.readdirSync("./src/apps", { withFileTypes: true }),
  ...fs.readdirSync("./src/core/lib", { withFileTypes: true }),
];

const allCollections = await pb.collections.getFullList();
const collections = allCollections.filter((e) => !e.system);
const modulesCollectionsMap: Record<string, string[]> = {};
for (const collection of collections) {
  const module = allModules.find((e) =>
    collection.name.startsWith(_.snakeCase(e.name)),
  );
  if (!module) {
    console.log(
      chalk.yellow("[WARNING]") +
        ` Collection ${collection.name} does not have a corresponding module.`,
    );

    continue;
  }

  if (!modulesCollectionsMap[module.name]) {
    modulesCollectionsMap[module.name] = [];
  }
  modulesCollectionsMap[module.name].push(collection.name);
}

console.log(
  chalk.green("[SUCCESS]") +
    ` Found ${Object.keys(modulesCollectionsMap).length} modules with collections.`,
);

Object.entries(modulesCollectionsMap)
  .map(([module, collections]) => {
    return `"${_.snakeCase(module)}_(${collections
      .map((e) => e.replace(new RegExp(`^${_.snakeCase(module)}_`), ""))
      .join("|")})"`;
  })
  .forEach((e) => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const occurences = content.match(new RegExp(e, "g"));
      if (!occurences) continue;

      console.log(
        chalk.blue("[INFO]") +
          ` File ${file} contains ${occurences.length} occurences of the collection name.`,
      );
    }
  });
