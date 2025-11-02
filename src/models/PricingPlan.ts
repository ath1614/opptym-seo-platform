import mongoose, { Document, Schema } from 'mongoose'

export interface IPricingPlan extends Document {
  _id: string
  name: string
  price: number
  features: string[]
  active: boolean
  description?: string
  maxProjects: number
  maxSubmissions: number
  maxSeoTools: number
  maxReports: number
  maxBacklinks: number
  createdAt: Date
  updatedAt: Date
}

const PricingPlanSchema = new Schema<IPricingPlan>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  features: [{
    type: String,
    required: true
  }],
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  maxProjects: {
    type: Number,
    required: true,
    default: 1
  },
  maxSubmissions: {
    type: Number,
    required: true,
    default: 10
  },
  maxSeoTools: {
    type: Number,
    required: true,
    default: 5
  },
  maxReports: {
    type: Number,
    required: true,
    default: 1
  },
  maxBacklinks: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
})

// Create indexes (name already has unique index)
PricingPlanSchema.index({ active: 1 })

export default mongoose.models.PricingPlan || mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema)
