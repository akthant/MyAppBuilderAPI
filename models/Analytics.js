import mongoose from 'mongoose';

// Track overall app usage and popular trends
const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  
  // AI usage stats
  aiCalls: { type: Number, default: 0 },
  totalTokensUsed: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  
  // Popular categories and entities
  popularCategories: [{
    category: String,
    count: Number
  }],
  popularEntities: [{
    entity: String,
    count: Number
  }],
  
  // Performance metrics
  averageProjectViews: { type: Number, default: 0 },
  totalProjects: { type: Number, default: 0 }
}, {
  timestamps: true
});

// One record per day
analyticsSchema.index({ date: 1 }, { unique: true });

export default mongoose.model('Analytics', analyticsSchema);