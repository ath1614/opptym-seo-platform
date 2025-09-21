import mongoose, { Document, Schema } from 'mongoose'

export interface ICustomField {
  key: string
  value: string
}

export interface IProject extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  
  // Basic Info
  projectName: string
  title: string
  websiteURL: string
  email: string
  category: string
  companyName: string
  phone: string
  whatsapp: string
  
  // Business Description
  businessDescription: string
  
  // Address
  address: {
    building: string
    addressLine1: string
    addressLine2: string
    addressLine3: string
    district: string
    city: string
    state: string
    country: string
    pincode: string
  }
  
  // SEO Metadata
  seoMetadata: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    targetKeywords: string[]
    sitemapURL: string
    robotsURL: string
  }
  
  // Article Submission
  articleSubmission: {
    articleTitle: string
    articleContent: string
    authorName: string
    authorBio: string
    tags: string[]
  }
  
  // Classified
  classified: {
    productName: string
    price: string
    condition: string
    productImageURL: string
  }
  
  // Social Media
  social: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
    youtube: string
  }
  
  // Optional Fields
  businessHours: string
  establishedYear: number
  logoImageURL: string
  
  // Custom Fields
  customFields: ICustomField[]
  
  // Status and Timestamps
  status: 'draft' | 'active' | 'paused' | 'completed'
  createdAt: Date
  updatedAt: Date
}

const CustomFieldSchema = new Schema({
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false })

const ProjectSchema = new Schema<IProject>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  
  // Basic Info
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  websiteURL: {
    type: String,
    required: [true, 'Website URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  
  // Business Description
  businessDescription: {
    type: String,
    required: [true, 'Business description is required'],
    trim: true,
    maxlength: [2000, 'Business description cannot exceed 2000 characters']
  },
  
  // Address
  address: {
    building: {
      type: String,
      trim: true
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true
    },
    addressLine3: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true
    }
  },
  
  // SEO Metadata
  seoMetadata: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title should not exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description should not exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }],
    targetKeywords: [{
      type: String,
      trim: true
    }],
    sitemapURL: {
      type: String,
      trim: true
    },
    robotsURL: {
      type: String,
      trim: true
    }
  },
  
  // Article Submission
  articleSubmission: {
    articleTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Article title cannot exceed 200 characters']
    },
    articleContent: {
      type: String,
      trim: true,
      maxlength: [5000, 'Article content cannot exceed 5000 characters']
    },
    authorName: {
      type: String,
      trim: true
    },
    authorBio: {
      type: String,
      trim: true,
      maxlength: [500, 'Author bio cannot exceed 500 characters']
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  
  // Classified
  classified: {
    productName: {
      type: String,
      trim: true
    },
    price: {
      type: String,
      trim: true
    },
    condition: {
      type: String,
      enum: ['new', 'used', 'refurbished', ''],
      default: ''
    },
    productImageURL: {
      type: String,
      trim: true
    }
  },
  
  // Social Media
  social: {
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    }
  },
  
  // Optional Fields
  businessHours: {
    type: String,
    trim: true
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  logoImageURL: {
    type: String,
    trim: true
  },
  
  // Custom Fields
  customFields: [CustomFieldSchema],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
})

// Indexes for better query performance
ProjectSchema.index({ userId: 1 })
ProjectSchema.index({ status: 1 })
ProjectSchema.index({ category: 1 })
ProjectSchema.index({ createdAt: -1 })

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)
