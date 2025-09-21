import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Project from './models/Project.js';
import Analytics from './models/Analytics.js';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';
dotenv.config();
const app = express();

// Trust proxy (important for Render)
app.set('trust proxy', 1);

// Middleware
// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://localhost:5173',
      process.env.CORS_ORIGIN,
      /\.netlify\.app$/,  // Allow all Netlify apps
      /\.onrender\.com$/, // Allow Render apps
    ].filter(Boolean); // Remove any undefined values
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for debugging - remove in production
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Alternative: Simple CORS for debugging (use this temporarily)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add request logging to debug issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});


app.use(express.json({ limit: '10mb' }));
// Request logging for debugging
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Health check endpoint (important for Render)
app.get('/', (req, res) => {
  res.json({ 
    message: 'My App Builder API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API routes here...
// ROUTES

// Create new project (public endpoint)
app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    
    const project = new Project(projectData);
    await project.save();
    
    // Update analytics
    await updateAnalytics(projectData);
    
    res.status(201).json({
      message: 'Project saved successfully',
      project: {
        id: project._id,
        slug: project.slug,
        name: project.name
      }
    });
    
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// Get all projects (public gallery)
app.get('/api/projects', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = {};
    
    if (category && category !== 'all') {
      query['metadata.category'] = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'requirements.entities': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-generatedUI'); // Exclude large UI data from list

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get specific project by slug or ID
app.get('/api/projects/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by slug first, then by ID
    let project = await Project.findOne({ slug: identifier });
    if (!project && mongoose.Types.ObjectId.isValid(identifier)) {
      project = await Project.findById(identifier);
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Increment view count
    await Project.findByIdAndUpdate(project._id, {
      $inc: { 'metadata.views': 1 }
    });

    res.json({ project });

  } catch (error) {
    console.error('Fetch project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await Project.find({ 'metadata.isTemplate': true })
      .sort({ 'metadata.likes': -1, createdAt: -1 })
      .limit(20)
      .select('-generatedUI');

    res.json({ templates });
  } catch (error) {
    console.error('Fetch templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get analytics dashboard
app.get('/api/analytics', async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalViews = await Project.aggregate([
      { $group: { _id: null, total: { $sum: '$metadata.views' } } }
    ]);
    
    const categoryStats = await Project.aggregate([
      { $group: { _id: '$metadata.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentAnalytics = await Analytics.findOne().sort({ date: -1 });

    res.json({
      totalProjects,
      totalViews: totalViews[0]?.total || 0,
      categoryStats,
      aiUsage: {
        totalCalls: recentAnalytics?.aiCalls || 0,
        totalTokens: recentAnalytics?.totalTokensUsed || 0
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Like a project
app.post('/api/projects/:id/like', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'metadata.likes': 1 } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ likes: project.metadata.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like project' });
  }
});

// 404 handler
app.use('/api/', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

export default app;