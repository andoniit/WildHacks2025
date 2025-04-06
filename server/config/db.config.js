module.exports = {
  url: process.env.MONGODB_URI || "mongodb://localhost:27017/cycleconnect",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  }
};
