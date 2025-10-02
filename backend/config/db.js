const mongoose = require("mongoose");
require("dotenv").config();

const connectionString = process.env.MONGO_URI;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log("Connected to database");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDatabase;
