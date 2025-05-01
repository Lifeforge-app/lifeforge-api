import fs from "fs";

const newSchema = JSON.parse(fs.readFileSync("data.json", "utf-8"));

fs.readdirSync("../src/apps").forEach((app) => {
    if (!fs.existsSync(`../src/apps/${app}/database/schema.json`)) {
        return;
    }

    const schema = JSON.parse(
        fs.readFileSync(`../src/apps/${app}/database/schema.json`, "utf-8")
    );

    for (const index in schema) {
        if (newSchema.find((s) => s.id === schema[index].id && JSON.stringify(s) === JSON.stringify(schema[index]))) {
            continue;
        }
        const newData = newSchema.find((s) => s.id === schema[index].id);
        if (newData) {
            schema[index] = newData;
        } else {
            console.log(`Schema for ${schema[index].name} not found in new schema`);
        }
        console.log(`Schema for ${schema[index].name} has changed and has been updated`);
    }
    fs.writeFileSync(
        `../src/apps/${app}/database/schema.json`,
        JSON.stringify(schema, null, 2)
    );
    console.log(`Schema for ${app} has been updated`);
})