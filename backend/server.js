import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
dotenv.config();
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import evRoutes from './routes/evRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import penaltyRoutes from './routes/penaltyRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import mongoose from 'mongoose';

// ES6 module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 7000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    const app = express();
    
    // Middleware
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? false 
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());
    
    // Middleware to handle API prefix issues
    app.use((req, res, next) => {
      // Log all API requests
      if (req.url.includes('/api') || req.url.includes('lapi')) {
        console.log(`API Request: ${req.method} ${req.url}`);
      }
      
      // Fix double /api prefix
      if (req.url.startsWith('/api/api/')) {
        req.url = req.url.replace('/api/api/', '/api/');
        console.log(`Fixed double API prefix. New URL: ${req.url}`);
      }
      
      // Fix missing leading slash
      if (req.url.startsWith('api/')) {
        req.url = `/${req.url}`;
        console.log(`Added leading slash. New URL: ${req.url}`);
      }
      
      // Fix 'lapi' typo
      if (req.url.includes('lapi/')) {
        req.url = req.url.replace('lapi/', '/api/');
        console.log(`Fixed 'lapi' typo. New URL: ${req.url}`);
      }
      
      next();
    });
    
    // Health check route
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
      });
    });

    // Handle favicon requests
    app.get('/favicon.ico', (req, res) => {
      res.status(204).end(); // No content response
    });
    
    // API Routes
    app.use('/api/users', userRoutes);
    app.use('/api/stations', stationRoutes);
    app.use('/api/evs', evRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/penalties', penaltyRoutes);
    app.use('/api/rides', rideRoutes);
    app.use('/api/upload', uploadRoutes);
    
    // Serve uploaded files statically
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    
    // Production static files
    if (process.env.NODE_ENV === 'production') {
      const __dirname = path.resolve();
      app.use(express.static(path.join(__dirname, '/frontend/dist')));
    
      app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
      );
    } else {
      app.get('/', (req, res) => {
        res.json({ 
          message: 'EV Management API is running...',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        });
      });
    }
    
    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    
    // Start server
    const server = app.listen(port, () => {
      console.log(`🚀 Server started on port ${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error(`❌ Server error: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        console.error(`⚠️ Port ${port} is already in use. Try a different port.`);
        process.exit(1);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received. Shutting down gracefully');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
      console.error(err.name, err.message);
      console.error(err.stack);
      process.exit(1);
    });
    
    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('💥 UNHANDLED REJECTION! Shutting down...');
      console.error(err);
      server.close(() => {
        process.exit(1);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
