import mongoose, { Document, Schema } from 'mongoose'

export interface ILink extends Document {
  _id: string
  name: string
  domain: string
  submissionUrl: string
  classification: 'Directory Submission' | 'Article Submission' | 'Press Release' | 'BookMarking' | 'Business Listing' | 'Classified' | 'More SEO'
  category: string
  country: string
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  pageRank: number
  daScore: number
  description?: string
  isCustom: boolean
  priority: number
  spamScore: number
  isPremium: boolean
  requiresApproval: boolean
  contactEmail?: string
  submissionGuidelines?: string
  requiredFields: {
    name: string
    type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox'
    required: boolean
    placeholder?: string
    options?: string[]
    selector?: string
  }[]
  totalSubmissions: number
  successfulSubmissions: number
  rejectionRate: number
  createdAt: Date
  updatedAt: Date
}

const LinkSchema = new Schema<ILink>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  submissionUrl: {
    type: String,
    required: true,
    trim: true
  },
  classification: {
    type: String,
    enum: ['Directory Submission', 'Article Submission', 'Press Release', 'BookMarking', 'Business Listing', 'Classified', 'More SEO'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'active'
  },
  pageRank: {
    type: Number,
    default: 0
  },
  daScore: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  spamScore: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  contactEmail: {
    type: String,
    trim: true
  },
  submissionGuidelines: {
    type: String,
    trim: true
  },
  requiredFields: [
    {
      name: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['text', 'email', 'url', 'textarea', 'select', 'checkbox'],
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        trim: true
      },
      options: [{
        type: String,
        trim: true
      }],
      selector: {
        type: String,
        trim: true
      }
    }
  ],
  totalSubmissions: {
    type: Number,
    default: 0
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  },
  rejectionRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for better query performance
LinkSchema.index({ classification: 1, status: 1 })
LinkSchema.index({ domain: 1 })
LinkSchema.index({ priority: -1 })
LinkSchema.index({ daScore: -1 })
LinkSchema.index({ pageRank: -1 })

const Link = mongoose.models.directories || mongoose.model<ILink>('directories', LinkSchema)

export default Link
