import { getDb, getDbPath, setupSchema } from "../src/lib/db";

setupSchema();
console.log("Schema ready at", getDbPath());
getDb().close();
