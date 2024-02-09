import app from "./app.js";
import { config } from "dotenv";
config();
import connectToDB from "./config/dbconnection.js";

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  connectToDB();
  console.log(`Server is running at http://localhost:${PORT}`);
});
