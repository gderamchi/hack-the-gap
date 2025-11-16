import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import logger from './utils/logger';
import influencerRoutes from './routes/influencer.routes';
import publicRoutes from './routes/public.routes';
import knowMoreRoutes from './routes/know-more.routes';
import authRoutes from './routes/auth.routes';
import communityRoutes from './routes/community.routes';
import transparencyRoutes from './routes/transparency.routes';
import engagementRoutes from './routes/engagement.routes';
import verificationRoutes from './routes/verification.routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS - Allow all origins for public API (your website team can access)
app.use(cors({
  origin: '*', // Allow all origins for public API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit.maxRequestsPerMinute,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes); // Authentication
app.use('/api/community', communityRoutes); // Community features
app.use('/api/transparency', transparencyRoutes); // Transparency & Fairness
app.use('/api/engagement', engagementRoutes); // Engagement & Gamification
app.use('/api/verification', verificationRoutes); // AI Verification
app.use('/api/influencers', influencerRoutes);
app.use('/api/influencers', knowMoreRoutes); // Know More feature
app.use('/api/public', publicRoutes); // Public API for website team

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// Start server (only if not in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = config.port;

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${config.nodeEnv}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
    
    if (!config.perplexity.apiKey) {
      logger.warn('⚠️  Perplexity API key not configured!');
    }
  });
}

export default app;
