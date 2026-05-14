const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { initializeScheduledTasks } = require('./utils/scheduledTasks');
const { sanitizeMessage, sanitizeErrorResponse } = require('./utils/errorSanitizer');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize scheduled tasks (email reminders, digests)
initializeScheduledTasks();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Response sanitizer middleware — intercepts ALL res.json() calls
// to strip sensitive env values (API keys, secrets, etc.) from responses
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === 'object' && body.success === false) {
      body = sanitizeErrorResponse(body);
    }
    return originalJson(body);
  };
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// routers
const authRouter = require('./routes/auth');
const authorRouter = require('./routes/author');
const reviewerRouter = require('./routes/reviewer');
const organizerRouter = require('./routes/organizer');
const participantRouter = require('./routes/participant');
const tracksRouter = require('./routes/tracks'); // NEW
const uploadRouter = require('./routes/upload'); // File uploads
const publicRouter = require('./routes/public'); // Public stats

app.use('/api/auth', authRouter);
app.use('/api/author', authorRouter);
app.use('/api/reviewer', reviewerRouter);
app.use('/api/organizer', organizerRouter);
app.use('/api/participant', participantRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/public', publicRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the full error server-side (sanitized to protect logs if they're aggregated)
  console.error('Global error handler:', sanitizeMessage(err.message));
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Never send raw error messages to clients — always sanitize
  const safeMessage = sanitizeMessage(err.message) || 'Internal Server Error';
  const statusCode = err.status || 500;

  const response = {
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : safeMessage,
  };

  // Only include sanitized stack in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = sanitizeMessage(err.stack);
  }

  res.status(statusCode).json(response);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
