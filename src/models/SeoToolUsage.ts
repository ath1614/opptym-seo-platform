import mongoose, { Document, Schema } from 'mongoose'

export interface ISeoToolUsage extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  toolId: string
  toolName: string
  url: string
  results: {
    score?: number
    issues?: number
    recommendations?: number
    data?: Record<string, unknown>
  }
  createdAt: Date
  updatedAt: Date
}

const SeoToolUsageSchema = new Schema<ISeoToolUsage>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project'
  },
  toolId: {
    type: String,
    required: true,
    trim: true
  },
  toolName: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  results: {
    score: { type: Number },
    issues: { type: Number },
    recommendations: { type: Number },
    data: { type: Schema.Types.Mixed }
  }
}, {
  timestamps: true
})

// Index for efficient queries
SeoToolUsageSchema.index({ userId: 1, projectId: 1 })
SeoToolUsageSchema.index({ toolId: 1 })
SeoToolUsageSchema.index({ createdAt: -1 })

const SeoToolUsage = mongoose.models.SeoToolUsage || mongoose.model<ISeoToolUsage>('SeoToolUsage', SeoToolUsageSchema)

export default SeoToolUsage
