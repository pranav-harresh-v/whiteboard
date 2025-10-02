const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectToDatabase = require("./config/db");
const PORT = process.env.PORT;

const userRoute = require("./routes/userRoute");
const canvasRoute = require("./routes/canvasRoute");

const app = express();
connectToDatabase();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", userRoute);
app.use("/canvas", canvasRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
