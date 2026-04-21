/*
  MongoDB Atlas connectivity check (beginner-friendly)

  Run commands for this file:
  1) npm install mongodb
  2) $env:MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-host>/<db>?retryWrites=true&w=majority"; node mongodbPing.js
*/

const fs = require("fs");
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Fallback file if MONGODB_URI is not present in environment.
// We reuse the existing Spring config so you do not need another config file.
const FALLBACK_CONFIG_PATH = path.resolve(__dirname, "../backend/src/main/resources/application.properties");
const FALLBACK_KEY = "spring.data.mongodb.uri";

function readUriFromPropertiesFile(filePath, key) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Ignore blank lines and comments to avoid accidental parsing noise.
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (trimmed.startsWith(`${key}=`)) {
      return trimmed.substring(key.length + 1).trim();
    }
  }

  return null;
}

async function runPingCheck() {
  console.log("Step 1/5: Looking for MONGODB_URI in environment variables...");

  const envUri = process.env.MONGODB_URI;
  const fileUri = envUri ? null : readUriFromPropertiesFile(FALLBACK_CONFIG_PATH, FALLBACK_KEY);
  const uri = envUri || fileUri;

  if (!uri) {
    console.error("ERROR: No MongoDB URI found.");
    console.error("Set MONGODB_URI or add spring.data.mongodb.uri in backend/src/main/resources/application.properties");
    process.exitCode = 1;
    return;
  }

  // Atlas connection strings typically start with mongodb+srv://
  if (!uri.startsWith("mongodb+srv://")) {
    console.error("ERROR: The resolved URI does not look like a MongoDB Atlas URI (expected mongodb+srv://...).");
    console.error("Please set MONGODB_URI to your Atlas connection string and run again.");
    process.exitCode = 1;
    return;
  }

  console.log("Step 2/5: URI found. Creating MongoDB client...");

  // Stable API version makes behavior more predictable across server upgrades.
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    console.log("Step 3/5: Connecting to MongoDB Atlas...");
    await client.connect();

    console.log("Step 4/5: Sending lightweight ping command...");
    await client.db("admin").command({ ping: 1 });

    console.log("SUCCESS: Connected to MongoDB Atlas and ping completed.");
  } catch (error) {
    console.error("ERROR: Connection or ping failed.");
    console.error(`Details: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log("Step 5/5: Closing MongoDB connection...");
    await client.close();
    console.log("Done: MongoDB client closed.");
  }
}

runPingCheck();
