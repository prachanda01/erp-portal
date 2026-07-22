import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';
import { sendSuccess } from './utils/apiResponse';

const app = express();

// Trust proxy for reverse proxies (Render / Cloudflare) to support express-rate-limit
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
});
app.use('/api', limiter);

// Swagger Documentation
const swaggerDocumentPath = path.join(__dirname, '../swagger.json');
if (fs.existsSync(swaggerDocumentPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocumentPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Health Check
app.get('/health', (req, res) => {
  return sendSuccess(res, 'NexusERP Operations Suite Backend API Service is operational', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`🚀 NexusERP Operations Suite Server running on port ${PORT} [${config.nodeEnv}]`);
    logger.info(`📄 Swagger Documentation available at http://localhost:${PORT}/api-docs`);
  });
}


export default app;
