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

const modulesMap: Record<
  string,
  {
    collections: string[];
    interfacesFile: string;
  }
> = {};

const allCollections = await pb.collections.getFullList();
const collections = allCollections.filter((e) => !e.system);
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

  if (!modulesMap[module.name]) {
    modulesMap[module.name] = {
      collections: [],
      interfacesFile: "",
    };
  }
  modulesMap[module.name].collections.push(collection.name);
}

console.log(
  chalk.green("[INFO]") +
    ` Found ${Object.values(modulesMap)
      .map((e) => e.collections.length)
      .reduce(
        (a, b) => a + b,
      )} collections across ${Object.keys(modulesMap).length} modules.`,
);

console.log(
  chalk.green("[INFO]") +
    ` Found ${
      Object.values(modulesMap)
        .map((e) => e.interfacesFile)
        .filter((e) => e).length
    } interface files across ${Object.keys(modulesMap).length} modules.`,
);
for (const [moduleName, moduleData] of Object.entries(modulesMap)) {
  if (moduleData.collections.length === 0) {
    console.log(
      chalk.yellow("[WARNING]") +
        ` Module ${moduleName} does not have any collections.`,
    );

    delete modulesMap[moduleName];
    continue;
  }

  if (!moduleData.interfacesFile) {
    console.log(
      chalk.yellow("[WARNING]") +
        ` Module ${moduleName} does not have an interface file.`,
    );

    delete modulesMap[moduleName];
  }
}

console.log(
  chalk.green("[INFO]") +
    ` Linked the interface files location and collections of ${Object.keys(modulesMap).length} modules.`,
);
