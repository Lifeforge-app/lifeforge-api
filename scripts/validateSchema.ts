import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs";
import _ from "lodash";
import path from "path";
import Pocketbase, { CollectionModel } from "pocketbase";
import { z } from "zod/v4";

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

const allModules = [
  ...fs.readdirSync("./src/apps", { withFileTypes: true }),
  ...fs.readdirSync("./src/core/lib", { withFileTypes: true }),
];

const modulesMap: Record<string, CollectionModel[]> = {};

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
    modulesMap[module.name] = [];
  }
  modulesMap[module.name].push(collection);
}

console.log(
  chalk.green("[INFO]") +
    ` Found ${Object.values(modulesMap).flat().length} collections across ${Object.keys(modulesMap).length} modules.`,
);

for (const module of allModules) {
  if (!modulesMap[module.name]) {
    continue;
  }

  const moduleName = _.camelCase(module.name);
  const collections = modulesMap[module.name];

  let finalString = `// This file is auto-generated. DO NOT EDIT IT MANUALLY.\n// Generated for module: ${moduleName}\n// Generated at: ${new Date().toISOString()}\n// Contains: ${collections
    .map((e) => e.name)
    .join(", ")}\n\nimport { z } from "zod/v4";\n\n`;

  for (const collection of collections) {
    collection.fields = collection.fields.filter(
      (e) =>
        ![
          "id",
          "created",
          "updated",
          "collectionId",
          "collectionName",
        ].includes(e.name),
    );
    console.log(
      chalk.blue("[INFO]") +
        ` Found ${collection.fields.length} fields in collection ${chalk.bold(
          collection.name,
        )} in module ${chalk.bold(moduleName)}.`,
    );
    const zodSchemaObject: Record<string, string> = {};

    for (const field of collection.fields) {
      switch (field.type) {
        case "text":
          zodSchemaObject[field.name] = "z.string()";
          break;
        case "richtext":
          zodSchemaObject[field.name] = "z.string()";
          break;
        case "number":
          zodSchemaObject[field.name] = "z.number()";
          break;
        case "bool":
          zodSchemaObject[field.name] = "z.boolean()";
          break;
        case "email":
          zodSchemaObject[field.name] = "z.email()";
          break;
        case "url":
          zodSchemaObject[field.name] = "z.url()";
          break;
        case "date":
          zodSchemaObject[field.name] = "z.string()";
          break;
        case "autodate":
          zodSchemaObject[field.name] = "z.string()";
          break;
        case "select":
          zodSchemaObject[field.name] = field.multiple
            ? `z.array(z.enum(${JSON.stringify(field.values)}))`
            : `z.enum(${JSON.stringify(field.values)})`;
          break;
        case "file":
          zodSchemaObject[field.name] = field.multiple
            ? "z.array(z.string())"
            : "z.string()";
          break;
        case "relation":
          zodSchemaObject[field.name] = field.multiple
            ? `z.array(z.string())`
            : `z.string()`;
          break;
        case "json":
          zodSchemaObject[field.name] = "z.any()";
          break;
        case "geoPoint":
          zodSchemaObject[field.name] =
            "z.object({ lat: z.number(), lon: z.number() })";
          break;
        case "password":
          zodSchemaObject[field.name] = "z.string()";
          break;
        default:
          console.warn(
            chalk.yellow("[WARNING]") +
              ` Unknown field type ${field.type} for field ${field.name} in collection ${collection.name}.`,
          );
          continue;
      }
    }

    const zodSchemaString = `const ${_.upperFirst(
      _.camelCase(collection.name),
    )}Schema = z.object({\n${Object.entries(zodSchemaObject)
      .map(([key, value]) => `  ${key}: ${value},`)
      .join("\n")}\n});`;
    finalString += `${zodSchemaString}\n\n`;

    console.log(
      chalk.green("[INFO]") +
        ` Generated Zod schema for collection ${chalk.bold(
          collection.name,
        )} in module ${chalk.bold(moduleName)}.`,
    );
  }

  finalString += `${collections
    .map(
      (e) =>
        `type I${_.upperFirst(_.camelCase(e.name))} = z.infer<typeof ${_.upperFirst(
          _.camelCase(e.name),
        )}Schema>;`,
    )
    .join("\n")}\n\nexport {\n${collections
    .map((e) => `  ${_.upperFirst(_.camelCase(e.name))}Schema,`)
    .join("\n")}\n};\n\nexport type {\n${collections
    .map((e) => `  I${_.upperFirst(_.camelCase(e.name))},`)
    .join("\n")}\n};\n`;

  const outputPath = path.resolve(module.parentPath, module.name, "schema.ts");
  fs.writeFileSync(outputPath, finalString, "utf-8");
  console.log(
    chalk.green("[INFO]") +
      ` Successfully wrote schema for module ${chalk.bold(moduleName)} to ${chalk.bold(outputPath)}.`,
  );
}
