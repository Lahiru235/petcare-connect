const mongoose = require("mongoose");
const dns = require("dns");

// mongodb+srv:// requires an SRV lookup. Windows resolvers often answer
// REFUSED for _mongodb._tcp.<cluster>.mongodb.net, which kills the connection.
if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith("mongodb+srv://")) {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
  }
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not set.");
    console.error("Copy backend/.env.example to backend/.env and fill in your connection string.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error(`Tried: ${uri.replace(/\/\/([^:]+):[^@]*@/, "//$1:****@")}`);
    process.exit(1);
  }
};

module.exports = connectDB;

