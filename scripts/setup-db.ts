import {
  getClient,
  getDatabaseUrl,
  getDbPath,
  setupSchema,
} from "../src/lib/db";

async function main() {
  await setupSchema();
  console.log("Schema ready");
  console.log("  URL:", getDatabaseUrl());
  const path = getDbPath();
  if (path) console.log("  Local file:", path);
  getClient().close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
