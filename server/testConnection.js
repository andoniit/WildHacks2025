// test-connection.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

console.log("Environment variables loaded from:", path.resolve(__dirname, '.env'));
console.log("MongoDB URI:", process.env.MONGODB_URI); // Print the URI to debug (hide password for security)

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MongoDB URI is undefined. Check your .env file.");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
