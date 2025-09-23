import mongoose, { Document, Schema } from 'mongoose'

export interface ILocation extends Document {
  _id: string
  name: string
  code: string // ISO country code (e.g., 'AU', 'US', 'UK')
  flag: string // Emoji flag
  description?: string
  isActive: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

const LocationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 2
  },
  flag: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for better query performance
LocationSchema.index({ code: 1 })
LocationSchema.index({ isActive: 1 })
LocationSchema.index({ priority: -1 })

export default mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema)
