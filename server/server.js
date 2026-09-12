import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { setupCollabServer } from './services/collabServer.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize isolated WebSocket real-time collaboration layer
setupCollabServer(server);

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

// Matches localhost, 127.0.0.1, or local private network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
const localNetworkOriginRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):(5173|3000)$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      // or origins matching the allowlist or local private network
      if (!origin || allowedOrigins.includes(origin) || localNetworkOriginRegex.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev mode
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Google Docs Clone API' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`[Server]: Running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server]: Local:   http://localhost:${PORT}`);
  console.log(`[Server]: Network: http://${HOST}:${PORT}`);
});
