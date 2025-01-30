import fs from "fs";

const data = JSON.parse(fs.readFileSync("./en.json"));
const allModules = Object.keys(data.modules.descriptions);

allModules.forEach((e) => {
  const title = data.modules[e];
  const descriptions = data.modules.descriptions[e];
  const newModule = {
    title,
    description: descriptions,
  };
  delete data.modules[e];
  delete data.modules.descriptions[e];
  fs.writeFileSync(
    `../new_locales/en/modules/${e}.json`,
    JSON.stringify(newModule, null, 2)
  );
});

fs.writeFileSync(`./en.json`, JSON.stringify(data, null, 2));
