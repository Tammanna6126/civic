import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import complaintRoutes from './routes/complaintRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless hackathon prototyping
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Civic Intelligence Backend API',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!ENV.GEMINI_API_KEY,
    supabaseConfigured: !!ENV.SUPABASE_URL
  });
});

// Mount Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start Server
app.listen(ENV.PORT, () => {
  console.log(`====================================================`);
  console.log(`🏛️  CIVIC INTELLIGENCE BACKEND RUNNING`);
  console.log(`📍 URL: http://localhost:${ENV.PORT}`);
  console.log(`🚀 Health Check: http://localhost:${ENV.PORT}/api/health`);
  console.log(`🔑 Gemini Configured: ${ENV.GEMINI_API_KEY ? 'YES' : 'NO'}`);
  console.log(`⚡ Supabase Configured: ${ENV.SUPABASE_URL ? 'YES' : 'NO'}`);
  console.log(`====================================================`);
});
