import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Project from './models/Project.js';
import Analytics from './models/Analytics.js';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';
dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-netlify-app.netlify.app',
    /\.vercel\.app$/,
    /\.netlify\.app$/
  ],
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));
// MongoDB Connection with connection pooling for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1, // Limit pool size for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = connection;
    console.log('MongoDB Connected');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Import models after connection setup
const Project = require('./models/Project');
const Analytics = require('./models/Analytics');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MiniAIAppBuilder API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Requirement Portal API v1.0',
    endpoints: [
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/projects/:id',
      'GET /api/analytics',
      'POST /api/projects/:id/like'
    ]
  });
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
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
export default app;