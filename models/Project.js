import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  // Basic project info
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // AI-generated requirements
  requirements: {
    appName: String,
    entities: [String],
    roles: [String],
    features: [String],
    originalPrompt: String
  },
  
  // Generated UI structure
  generatedUI: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Analytics data
  analytics: {
    aiModel: String,
    tokensUsed: Number,
    responseTime: Number,
    generationDate: { type: Date, default: Date.now }
  },
  
  // Public metadata
  metadata: {
    category: { 
      type: String, 
      enum: ['education', 'ecommerce', 'healthcare', 'finance', 'social', 'productivity', 'other'],
      default: 'other'
    },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isTemplate: { type: Boolean, default: false },
    tags: [String]
  },
  
  // Auto-generated slug for SEO-friendly URLs
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Create slug from project name
projectSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  next();
});

// Indexes for better performance
projectSchema.index({ slug: 1 });
projectSchema.index({ 'metadata.category': 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ 'metadata.views': -1 });

export default mongoose.model('Project', projectSchema);