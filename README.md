# 🚀 Requirement Portal Backend API

A Node.js/Express backend API for the Requirement Portal application, deployed on Render with MongoDB Atlas integration. This API handles AI-generated project requirements, provides CRUD operations for projects, and offers analytics functionality.

![API Status](https://img.shields.io/badge/API-Live-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Render](https://img.shields.io/badge/Deployed%20on-Render-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [API Usage Examples](#api-usage-examples)
- [Error Handling](#error-handling)
- [Performance & Monitoring](#performance--monitoring)
- [Contributing](#contributing)

## 🎯 Overview

This backend API serves as the data layer for the Requirement Portal, a web application that transforms natural language descriptions into functional UI mockups using AI. The API provides:

- **Project Management**: CRUD operations for AI-generated projects
- **Public Gallery**: Browse and discover community projects
- **Analytics**: Usage statistics and trending insights
- **Template System**: Reusable project templates
- **Search & Filtering**: Advanced project discovery features

### Key Features

- ✅ **RESTful API Design** with proper HTTP status codes
- ✅ **MongoDB Integration** with Mongoose ODM
- ✅ **CORS Enabled** for cross-origin requests
- ✅ **Error Handling** with detailed error responses
- ✅ **Request Logging** for monitoring and debugging
- ✅ **Health Checks** for monitoring system status
- ✅ **Performance Optimized** with database indexing

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** (v18.x) - JavaScript runtime
- **Express.js** (v4.18+) - Web framework
- **MongoDB** (Atlas) - NoSQL database
- **Mongoose** (v7.x) - MongoDB object modeling

### Deployment & DevOps
- **Render.com** - Cloud hosting platform
- **MongoDB Atlas** - Cloud database service
- **Git** - Version control with auto-deployment

### Development Tools
- **Nodemon** - Development server with hot reload
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

## 🔌 API Endpoints

### Base URL
```
Production: https://myappbuilderapi.onrender.com
Local: http://localhost:3001
```

### Health & Status

#### `GET /`
Basic server status check.

**Response:**
```json
{
  "message": "My AI App Builder Portal API",
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### `GET /health`
Detailed health check including database status.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Projects

#### `GET /api/projects`
Retrieve projects with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 12) - Items per page
- `category` (string) - Filter by category
- `search` (string) - Search in name, description, and entities

**Example Request:**
```
GET /api/projects?page=1&limit=10&category=education&search=student
```

**Response:**
```json
{
  "projects": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Student Management System",
      "description": "A comprehensive system for managing student information",
      "requirements": {
        "appName": "Student Portal",
        "entities": ["Student", "Course", "Grade"],
        "roles": ["Admin", "Teacher", "Student"],
        "features": ["Enrollment", "Grade tracking", "Reports"]
      },
      "metadata": {
        "category": "education",
        "views": 45,
        "likes": 12,
        "tags": ["Student", "Course", "Grade"]
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### `POST /api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "E-commerce Platform",
  "description": "Online store with inventory management",
  "requirements": {
    "appName": "ShopMaster",
    "entities": ["Product", "Order", "Customer"],
    "roles": ["Admin", "Customer", "Manager"],
    "features": ["Shopping cart", "Payment processing", "Inventory tracking"],
    "originalPrompt": "I want to build an e-commerce platform..."
  },
  "analytics": {
    "aiModel": "claude-3.5-sonnet",
    "tokensUsed": 450,
    "responseTime": 2300
  },
  "metadata": {
    "category": "ecommerce",
    "tags": ["Product", "Order", "Customer"]
  }
}
```

**Response:**
```json
{
  "message": "Project saved successfully",
  "project": {
    "id": "507f1f77bcf86cd799439012",
    "slug": "e-commerce-platform-1642252800000",
    "name": "E-commerce Platform"
  }
}
```

#### `GET /api/projects/:identifier`
Get a specific project by ID or slug.

**Parameters:**
- `identifier` - Project ID or slug

**Response:**
```json
{
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Student Management System",
    "slug": "student-management-system-1642252800000",
    "description": "A comprehensive system for managing student information",
    "requirements": { ... },
    "generatedUI": { ... },
    "metadata": {
      "category": "education",
      "views": 46,
      "likes": 12
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### `PUT /api/projects/:id/ui`
Update project's generated UI structure.

**Request Body:**
```json
{
  "generatedUI": {
    "roles": ["Admin", "Teacher", "Student"],
    "entities": ["Student", "Course", "Grade"],
    "fields": {
      "student": [
        {
          "name": "Full Name",
          "type": "text",
          "required": true
        }
      ]
    },
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "version": "1.0"
  }
}
```

**Response:**
```json
{
  "message": "UI structure saved successfully"
}
```

#### `POST /api/projects/:id/like`
Increment like count for a project.

**Response:**
```json
{
  "likes": 13
}
```

### Templates

#### `GET /api/templates`
Get all public project templates.

**Response:**
```json
{
  "templates": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Learning Management System",
      "description": "Complete LMS template with courses and assessments",
      "requirements": { ... },
      "metadata": {
        "category": "education",
        "views": 120,
        "likes": 35,
        "isTemplate": true
      }
    }
  ]
}
```

### Search & Suggestions

#### `GET /api/search`
Advanced search with filters and sorting.

**Query Parameters:**
- `q` (string) - Search query
- `category` (string) - Filter by category
- `entities` (string) - Comma-separated entity filters
- `roles` (string) - Comma-separated role filters
- `sortBy` (string) - Sort by: 'recent', 'popular', 'liked'
- `page` (number) - Page number
- `limit` (number) - Items per page

**Example Request:**
```
GET /api/search?q=student&category=education&sortBy=popular&page=1&limit=10
```

**Response:**
```json
{
  "projects": [...],
  "pagination": { ... },
  "filters": {
    "categories": ["education", "ecommerce", "healthcare"],
    "entities": ["Student", "Course", "Product", "User"],
    "roles": ["Admin", "Teacher", "Customer", "Manager"]
  },
  "searchQuery": "student"
}
```

#### `GET /api/suggestions`
Get popular entities, roles, and categories for autocomplete.

**Response:**
```json
{
  "topEntities": ["User", "Product", "Order", "Student", "Course"],
  "topRoles": ["Admin", "Customer", "Teacher", "Manager"],
  "categories": ["education", "ecommerce", "healthcare", "finance"]
}
```

### Analytics

#### `GET /api/analytics`
Get platform analytics and statistics.

**Response:**
```json
{
  "totalProjects": 150,
  "totalViews": 2847,
  "categoryStats": [
    {
      "_id": "education",
      "count": 45,
      "avgViews": 23.5,
      "totalLikes": 156
    }
  ],
  "aiUsage": {
    "totalCalls": 150,
    "totalTokens": 45230
  }
}
```

#### `GET /api/analytics/dashboard`
Comprehensive analytics dashboard data.

**Query Parameters:**
- `period` (string) - Time period: '24h', '7d', '30d', '90d'

**Response:**
```json
{
  "overview": {
    "totalProjects": 150,
    "recentPageViews": 45,
    "totalViews": 2847,
    "totalLikes": 234
  },
  "topProjects": [...],
  "categoryStats": [...],
  "dailyActivity": [
    {
      "date": "2024-01-15",
      "views": 23,
      "uniqueProjectCount": 8
    }
  ],
  "popularEntities": [
    { "_id": "User", "count": 45 },
    { "_id": "Product", "count": 32 }
  ],
  "popularRoles": [
    { "_id": "Admin", "count": 78 },
    { "_id": "Customer", "count": 56 }
  ]
}
```

#### `POST /api/analytics/pageview`
Track page view for analytics.

**Request Body:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "sessionId": "session_1642252800_abc123"
}
```

## 🗄️ Database Schema

### Project Model
```javascript
{
  _id: ObjectId,
  name: String (required, max: 100),
  description: String (required, max: 1000),
  slug: String (unique),
  
  requirements: {
    appName: String,
    entities: [String],
    roles: [String],
    features: [String],
    originalPrompt: String
  },
  
  generatedUI: Mixed,
  
  analytics: {
    aiModel: String,
    tokensUsed: Number,
    responseTime: Number,
    generationDate: Date
  },
  
  metadata: {
    category: String (enum),
    views: Number (default: 0),
    likes: Number (default: 0),
    isTemplate: Boolean (default: false),
    tags: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Analytics Model
```javascript
{
  _id: ObjectId,
  date: Date (unique),
  aiCalls: Number,
  totalTokensUsed: Number,
  averageResponseTime: Number,
  popularCategories: [{ category: String, count: Number }],
  popularEntities: [{ entity: String, count: Number }],
  averageProjectViews: Number,
  totalProjects: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### PageView Model
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project'),
  timestamp: Date,
  userAgent: String,
  referrer: String,
  sessionId: String,
  timeOnPage: Number,
  scrollDepth: Number,
  interactionEvents: [Mixed]
}
```

### Database Indexes
```javascript
// Project indexes
{ slug: 1 }
{ 'metadata.category': 1 }
{ createdAt: -1 }
{ 'metadata.views': -1 }
{ 'metadata.category': 1, 'metadata.views': -1 }
{ name: 'text', description: 'text', 'requirements.appName': 'text' }

// Analytics indexes
{ date: 1 } (unique)

// PageView indexes
{ projectId: 1, timestamp: -1 }
{ timestamp: -1 }
```

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file in your project root:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/requirement-portal

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,https://your-frontend.netlify.app

# AI Integration (Optional)
OPENROUTER_API_KEY=your-openrouter-api-key

# Monitoring (Optional)
LOG_LEVEL=info
```

### Production Environment (Render)

In your Render dashboard, set these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://your-frontend.netlify.app
PORT=10000
OPENROUTER_API_KEY=sk-or-v1-...
```

## 💻 Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/requirement-portal-backend.git
   cd requirement-portal-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Verify installation:**
   ```bash
   curl http://localhost:3001/health
   ```

### Development Scripts

```bash
npm run dev       # Start with nodemon (hot reload)
npm start         # Start production server
npm run test      # Run tests (if available)
npm run lint      # Run linter (if configured)
```

### Database Setup

1. **MongoDB Atlas:**
   - Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for development)
   - Get connection string

2. **Local MongoDB (Optional):**
   ```bash
   # Install MongoDB locally
   brew install mongodb-community  # macOS
   # or
   sudo apt-get install mongodb    # Ubuntu
   
   # Start MongoDB
   mongod
   ```

## 🚀 Deployment

### Render Deployment

1. **Connect GitHub Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   ```
   Name: requirement-portal-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables:**
   - Add all production environment variables
   - Ensure CORS_ORIGIN points to your frontend URL

4. **Deploy:**
   - Render will automatically deploy on git push
   - Monitor logs for any issues

### Health Monitoring

The API includes several health check endpoints:
- `GET /` - Basic status
- `GET /health` - Detailed health with DB status
- `GET /api/test` - API routing test

### Performance Considerations

- **Database Indexing:** Properly indexed for common queries
- **Connection Pooling:** MongoDB connection pooling enabled
- **Request Logging:** Comprehensive request/error logging
- **Error Handling:** Graceful error handling with appropriate status codes

## 📖 API Usage Examples

### JavaScript/Fetch
```javascript
// Get all projects
const response = await fetch('https://myappbuilderapi.onrender.com/api/projects');
const data = await response.json();

// Create new project
const newProject = await fetch('https://myappbuilderapi.onrender.com/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My App',
    description: 'Description here',
    requirements: { ... }
  })
});

// Search projects
const searchResults = await fetch(
  'https://myappbuilderapi.onrender.com/api/search?q=student&category=education'
);
```

### cURL Examples
```bash
# Health check
curl https://myappbuilderapi.onrender.com/health

# Get projects
curl "https://myappbuilderapi.onrender.com/api/projects?limit=5"

# Search projects
curl "https://myappbuilderapi.onrender.com/api/search?q=ecommerce&sortBy=popular"

# Create project
curl -X POST https://myappbuilderapi.onrender.com/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test App","description":"Test description"}'
```

### React Integration
```jsx
// Custom hook for API calls
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://myappbuilderapi.onrender.com/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return { projects, loading };
};
```

## 🚨 Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/projects"
}
```

### Common Errors
- **Database Connection Issues:** Check MongoDB Atlas connection
- **CORS Errors:** Verify CORS_ORIGIN environment variable
- **Validation Errors:** Check request body format
- **Rate Limiting:** API may implement rate limiting in the future

## 📊 Performance & Monitoring

### Logging
- Request logging with timestamp and origin
- Error logging with stack traces
- Database query performance logging

### Database Performance
- Indexed queries for better performance
- Connection pooling for efficient resource usage
- Query optimization for large datasets

### Monitoring Tools
- Render provides built-in monitoring
- Real-time logs available in dashboard
- Uptime monitoring included

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test locally
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Submit pull request

### Code Standards
- Follow Node.js best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Include error handling for all async operations
- Validate input data

### Testing
```bash
# Add tests for new features
npm test

# Check code coverage
npm run coverage
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation:** This README and inline code comments
- **Issues:** Report bugs on GitHub Issues
- **API Status:** Monitor at https://myappbuilderapi.onrender.com/health

---

**Built with ❤️ by AK**

*Transform your ideas into applications, one requirement at a time.*