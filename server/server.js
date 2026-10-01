import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import versionRoutes from './routes/versionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import grammarRoutes from './routes/grammarRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { setupCollabServer } from './services/collabServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize isolated WebSocket real-time collaboration layer
setupCollabServer(server);

// Security: Disable Express signature header
app.disable('x-powered-by');

// Security: Helmet HTTP response headers (configured to permit cross-origin media rendering)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Security: Restricted CORS configuration
const isProduction = process.env.NODE_ENV === 'production';

// Parse CLIENT_URL (supports comma-separated list of origins)
const envClientUrls = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
  : [];

const allowedOrigins = [
  ...envClientUrls,
  'https://doc-clone-using-mern.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

// Matches Vercel production and preview deployment URLs for this app
const vercelDomainRegex = /^https:\/\/doc-clone-using-mern(-[a-z0-9-]+)?\.vercel\.app$/i;

// Local private network regex for LAN dev testing (e.g. testing on mobile/tablets locally)
const localNetworkOriginRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):(5173|3000)$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, server-to-server, curl, health checks) without origin header
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin) || vercelDomainRegex.test(normalizedOrigin)) {
      return callback(null, true);
    }

    if (!isProduction && localNetworkOriginRegex.test(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security: Request body size limits (reduced from 10mb to 2mb to mitigate body-overflow DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Security: Sanitize request body, params and query strings against NoSQL operator injection
// Strips keys starting with '$' or containing '.', e.g. { "$gt": "" }
app.use(mongoSanitize());

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents', versionRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/grammar-check', grammarRoutes);

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
