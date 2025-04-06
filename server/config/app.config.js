module.exports = {
  jwtSecret: process.env.JWT_SECRET || "cycleconnect-secret-key",
  jwtExpiration: 86400, // 24 hours
  apiPrefix: "/api",
  corsOptions: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  environment: process.env.NODE_ENV || "development"
};
