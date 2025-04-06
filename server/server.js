const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./database/connection');
const path = require('path');
// Load environment variables before anything else
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to MongoDB
try {
  connectDB();
  console.log('MongoDB connection initialized');
} catch (err) {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}

// Define Routes - Wrapped in try/catch to catch any errors in route initialization
try {
  console.log('Initializing routes...');
  
  // Auth routes
  app.use('/api/auth', require('./api/routes/auth.routes'));
  console.log('Auth routes registered');
  
  // User routes
  app.use('/api/users', require('./api/routes/user.routes'));
  console.log('User routes registered');
  
  // Cycle routes
  app.use('/api/cycles', require('./api/routes/cycle.routes'));
  console.log('Cycle routes registered');
  
  // Symptom routes
  app.use('/api/symptoms', require('./api/routes/symptom.routes'));
  console.log('Symptom routes registered');
  
  // Contact routes
  app.use('/api/contacts', require('./api/routes/contact.routes'));
  console.log('Contact routes registered');
  
  // AI routes
  app.use('/api/ai', require('./api/routes/ai.routes'));
  console.log('AI routes registered');
  
  // Notification routes
  app.use('/api/notifications', require('./api/routes/notification.routes'));
  console.log('Notification routes registered');
  
  // Alert routes
  app.use('/api/alerts', require('./api/routes/alert.routes'));
  console.log('Alert routes registered');

  console.log('All routes initialized successfully');
} catch (err) {
  console.error('Error initializing routes:', err);
  process.exit(1);
}

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).send({ message: err.message || 'Something went wrong!' });
});

// Start server
try {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
} catch (err) {
  console.error('Error starting server:', err);
  process.exit(1);
}

// Handle uncaught exceptions to prevent server crash
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process here to keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process here to keep server running
});

module.exports = app;
