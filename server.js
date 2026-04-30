import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./src/create-app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 4173);
const app = createApp({
  dataFile: path.resolve(__dirname, "./data/carebridge-db.json")
});

app.listen(port, () => {
  console.log(`CareBridge is running at http://127.0.0.1:${port}`);
});

