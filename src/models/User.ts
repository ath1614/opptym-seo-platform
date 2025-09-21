import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  username: string
  email: string
  password: string
  name?: string
  companyName?: string
  bio?: string
  phone?: string
  website?: string
  location?: string
  role: 'user' | 'admin'
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  profileImage?: string
  verified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid'
  notificationSettings?: {
    emailNotifications: boolean
    projectUpdates: boolean
    seoToolResults: boolean
    systemAlerts: boolean
    marketingEmails: boolean
    weeklyReports: boolean
  }
  privacySettings?: {
    profileVisibility: 'public' | 'private'
    dataSharing: boolean
    analyticsTracking: boolean
  }
  usage?: {
    projects: number
    submissions: number
    seoTools: number
    backlinks: number
    reports: number
  }
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot exceed 200 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business', 'enterprise'],
    default: 'free'
  },
  profileImage: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: ''
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: ''
  },
  stripeSubscriptionId: {
    type: String,
    default: ''
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'],
    default: 'active'
  },
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    projectUpdates: {
      type: Boolean,
      default: true
    },
    seoToolResults: {
      type: Boolean,
      default: true
    },
    systemAlerts: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    weeklyReports: {
      type: Boolean,
      default: true
    }
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    },
    dataSharing: {
      type: Boolean,
      default: false
    },
    analyticsTracking: {
      type: Boolean,
      default: true
    }
  },
  usage: {
    projects: {
      type: Number,
      default: 0
    },
    submissions: {
      type: Number,
      default: 0
    },
    seoTools: {
      type: Number,
      default: 0
    },
    backlinks: {
      type: Number,
      default: 0
    },
    reports: {
      type: Number,
      default: 0
    }
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Index for better query performance
// Note: email and username indexes are automatically created by unique: true
UserSchema.index({ emailVerificationToken: 1 })
UserSchema.index({ passwordResetToken: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
