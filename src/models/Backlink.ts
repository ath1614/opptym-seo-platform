import mongoose, { Document, Schema } from 'mongoose'

export interface IBacklink extends Document {
  _id: string
  userId: string
  projectId?: string
  sourceUrl: string
  targetUrl: string
  sourceDomain: string
  targetDomain: string
  anchorText?: string
  linkType: 'dofollow' | 'nofollow' | 'sponsored' | 'ugc'
  linkPosition: 'header' | 'footer' | 'sidebar' | 'content' | 'navigation' | 'other'
  domainAuthority?: number
  pageAuthority?: number
  traffic?: number
  spamScore?: number
  linkQuality: 'high' | 'medium' | 'low' | 'toxic'
  linkSource: 'submission' | 'manual' | 'discovered' | 'competitor'
  status: 'active' | 'lost' | 'pending' | 'disavowed'
  discoveredAt: Date
  lastCheckedAt?: Date
  title?: string
  description?: string
  language?: string
  country?: string
  isIndexed: boolean
  isRedirect: boolean
  redirectUrl?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const BacklinkSchema = new Schema<IBacklink>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  projectId: {
    type: String,
    index: true
  },
  sourceUrl: {
    type: String,
    required: true,
    index: true
  },
  targetUrl: {
    type: String,
    required: true,
    index: true
  },
  sourceDomain: {
    type: String,
    required: true,
    index: true
  },
  targetDomain: {
    type: String,
    required: true,
    index: true
  },
  anchorText: {
    type: String
  },
  linkType: {
    type: String,
    enum: ['dofollow', 'nofollow', 'sponsored', 'ugc'],
    default: 'dofollow'
  },
  linkPosition: {
    type: String,
    enum: ['header', 'footer', 'sidebar', 'content', 'navigation', 'other'],
    default: 'content'
  },
  domainAuthority: {
    type: Number,
    min: 0,
    max: 100
  },
  pageAuthority: {
    type: Number,
    min: 0,
    max: 100
  },
  traffic: {
    type: Number,
    min: 0
  },
  spamScore: {
    type: Number,
    min: 0,
    max: 100
  },
  linkQuality: {
    type: String,
    enum: ['high', 'medium', 'low', 'toxic'],
    default: 'medium'
  },
  linkSource: {
    type: String,
    enum: ['submission', 'manual', 'discovered', 'competitor'],
    default: 'discovered'
  },
  status: {
    type: String,
    enum: ['active', 'lost', 'pending', 'disavowed'],
    default: 'active'
  },
  discoveredAt: {
    type: Date,
    default: Date.now
  },
  lastCheckedAt: {
    type: Date
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  language: {
    type: String,
    default: 'en'
  },
  country: {
    type: String
  },
  isIndexed: {
    type: Boolean,
    default: true
  },
  isRedirect: {
    type: Boolean,
    default: false
  },
  redirectUrl: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
})

// Indexes for better performance
BacklinkSchema.index({ userId: 1, status: 1 })
BacklinkSchema.index({ sourceDomain: 1, targetDomain: 1 })
BacklinkSchema.index({ linkQuality: 1, status: 1 })
BacklinkSchema.index({ discoveredAt: -1 })

export default mongoose.models.Backlink || mongoose.model<IBacklink>('Backlink', BacklinkSchema)

