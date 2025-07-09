import dotenv from "dotenv";
import fs from "fs";
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

const allCollections = await pb.collections.getFullList();
const collections = allCollections.filter((e) => !e.system);
for (const collection of collections) {
  if (collection.name !== "wallet_transactions") {
    continue;
  }
  console.log(collection.fields);
}
