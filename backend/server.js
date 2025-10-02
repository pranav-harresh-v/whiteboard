const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./config/db");

const userRoute = require("./routes/userRoute");
const canvasRoute = require("./routes/canvasRoute");

const app = express();
connectToDatabase();

app.use(cors());
app.use(express.json());

app.use("/users", userRoute);
app.use("/canvas", canvasRoute);

app.listen(5000, () => {
  console.log("Server started");
});
