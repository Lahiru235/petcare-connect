const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 first to avoid hanging on NAT64 / unreachable IPv6 addresses
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignored on older Node versions
}

// mongodb+srv:// requires an SRV lookup. Windows resolvers often answer
// REFUSED for _mongodb._tcp.<cluster>.mongodb.net, which kills the connection.
if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith("mongodb+srv://")) {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
  }
}

const connectDB = async (retries = 5, delayMs = 3000) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not set.");
    console.error("Copy backend/.env.example to backend/.env and fill in your connection string.");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) {
        console.error(`Tried: ${uri.replace(/\/\/([^:]+):[^@]*@/, "//$1:****@")}`);
        console.warn("Warning: MongoDB connection could not be established immediately. The server will keep running and retry in the background.");
      } else {
        console.log(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
};

module.exports = connectDB;
