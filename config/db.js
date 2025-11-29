const mongoose = require('mongoose');
require('dotenv').config();
const DB_URI = process.env.DB_URI || 'mongodb+srv://root:root@kiddo.m30ful3.mongodb.net/?appName=kiddo';
async function connectDB() {
  try {
    await mongoose.connect(DB_URI, {});
    console.log("MongoDB connected successfully");
    
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}
module.exports = connectDB;