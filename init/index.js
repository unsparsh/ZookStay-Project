const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/zookstay";

async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Call main function
main()
  .then(() => {
    console.log("Connected to the Backend");
  })
  .catch((err) => {
    console.error("Connection error", err);
  });

const initDB = async () => {
  try {
    await Listing.deleteMany({}); // Delete existing data
    console.log("Existing data cleared");

    // Log initdata.data to ensure its structure
    console.log("Data to be inserted:", initdata.data);

    await Listing.insertMany(initdata.data);
    console.log("Data Inserted Successfully!");
  } catch (error) {
    console.error("Error during data initialization", error);
  }
};

initDB();
