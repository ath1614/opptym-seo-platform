import mongoose, { Document, Schema } from 'mongoose'

export interface ISeoToolConfig extends Document {
  toolId: string
  name: string
  description: string
  category: 'analysis' | 'research' | 'technical' | 'content'
  isPremium: boolean
  isEnabled: boolean
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  recommendedFrequency: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const SeoToolConfigSchema = new Schema<ISeoToolConfig>({
  toolId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['analysis', 'research', 'technical', 'content'],
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: String,
    default: '2-5 min'
  },
  recommendedFrequency: {
    type: String,
    default: 'Weekly'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

export default mongoose.models.SeoToolConfig || mongoose.model<ISeoToolConfig>('SeoToolConfig', SeoToolConfigSchema)