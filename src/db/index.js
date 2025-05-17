const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const { MONGO_URI } = process.env;

// Load models
const models = {
  Documents: require("./models/Documents"),
};

const setupCollections = async () => {
  try {
    const existingCollections = (
      await mongoose.connection.db.listCollections().toArray()
    ).map((col) => col.name);

    for (const model of Object.values(models)) {
      const collectionName = model.collection.collectionName;
      if (!existingCollections.includes(collectionName)) {
        await mongoose.connection.createCollection(collectionName);
        console.log(`Collection "${collectionName}" created.`);
      } else {
        console.log(`Collection "${collectionName}" already exists.`);
      }
    }
  } catch (error) {
    console.error("Error creating collections:", error);
    throw error;
  }
};

const connectDB = async () => {
  try {
    const db = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB.");
    await setupCollections();
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

connectDB();

module.exports = { connectDB };
