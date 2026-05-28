import Datastore from "@seald-io/nedb";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const chatDb = new Datastore({
  filename: path.join(__dirname, "../data/chat.db"),
  autoload: true,
});

chatDb.ensureIndex({ fieldName: "roomId" });
chatDb.ensureIndex({ fieldName: "timestamp" });

export default chatDb;
