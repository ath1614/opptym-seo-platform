const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define schemas
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  companyName: String,
  plan: { type: String, default: 'free' },
  usage: {
    projects: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
    seoTools: { type: Number, default: 0 },
    backlinks: { type: Number, default: 0 },
    reports: { type: Number, default: 0 }
  },
  verified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: { type: String, default: 'user' }
}, { timestamps: true })

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  title: String,
  websiteURL: String,
  websiteUrl: String,
  email: String,
  category: String,
  companyName: String,
  phone: String,
  whatsapp: String,
  businessDescription: String,
  description: String,
  keywords: [String],
  targetAudience: String,
  competitors: [String],
  goals: String,
  notes: String,
  address: {
    building: String,
    addressLine1: String,
    addressLine2: String,
    addressLine3: String,
    district: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  seoMetadata: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    targetKeywords: [String],
    sitemapURL: String,
    robotsURL: String
  },
  articleSubmission: {
    articleTitle: String,
    articleContent: String,
    authorName: String,
    authorBio: String,
    tags: [String]
  },
  classified: {
    productName: String,
    price: String,
    condition: String,
    productImageURL: String
  },
  social: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  businessHours: String,
  establishedYear: String,
  logoImageURL: String,
  customFields: [{
    key: String,
    value: String
  }],
  status: { type: String, enum: ['draft', 'active', 'paused', 'completed'], default: 'draft' }
}, { timestamps: true })

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  linkId: { type: mongoose.Schema.Types.ObjectId, required: true },
  directory: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  completedAt: Date,
  notes: String
}, { timestamps: true })

const SeoToolUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  toolId: { type: String, required: true },
  toolName: { type: String, required: true },
  url: { type: String, required: true },
  results: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)
const SeoToolUsage = mongoose.models.SeoToolUsage || mongoose.model('SeoToolUsage', SeoToolUsageSchema)

async function debugUserUsage() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find the specific user
    const user = await User.findOne({ email: 'atharv.soni@adypu.edu.in' })
    if (!user) {
      console.log('User not found')
      return
    }

    console.log(`\n=== User: ${user.email} ===`)
    console.log(`Plan: ${user.plan}`)
    console.log(`Cached Usage:`, user.usage)

    // Get actual counts from database
    const actualProjects = await Project.countDocuments({ userId: user._id })
    const actualSubmissions = await Submission.countDocuments({ 
      userId: user._id,
      status: 'success'
    })
    const actualSeoTools = await SeoToolUsage.countDocuments({ userId: user._id })

    console.log(`\n=== Actual Database Counts ===`)
    console.log(`Projects: ${actualProjects}`)
    console.log(`Submissions: ${actualSubmissions}`)
    console.log(`SEO Tools: ${actualSeoTools}`)

    // Check for mismatches
    console.log(`\n=== Mismatches ===`)
    if (user.usage.projects !== actualProjects) {
      console.log(`❌ Projects mismatch: cached=${user.usage.projects}, actual=${actualProjects}`)
    } else {
      console.log(`✅ Projects match: ${actualProjects}`)
    }

    if (user.usage.submissions !== actualSubmissions) {
      console.log(`❌ Submissions mismatch: cached=${user.usage.submissions}, actual=${actualSubmissions}`)
    } else {
      console.log(`✅ Submissions match: ${actualSubmissions}`)
    }

    if (user.usage.seoTools !== actualSeoTools) {
      console.log(`❌ SEO Tools mismatch: cached=${user.usage.seoTools}, actual=${actualSeoTools}`)
    } else {
      console.log(`✅ SEO Tools match: ${actualSeoTools}`)
    }

    // Fix the cached usage if there are mismatches
    if (user.usage.projects !== actualProjects || 
        user.usage.submissions !== actualSubmissions || 
        user.usage.seoTools !== actualSeoTools) {
      
      console.log(`\n=== Fixing Cached Usage ===`)
      user.usage.projects = actualProjects
      user.usage.submissions = actualSubmissions
      user.usage.seoTools = actualSeoTools
      
      await user.save()
      console.log('✅ Cached usage updated to match database counts')
    }

    // Check plan limits
    const planLimits = {
      free: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 },
      pro: { projects: 5, submissions: 50, seoTools: 14, backlinks: 10, reports: 5 },
      business: { projects: -1, submissions: 200, seoTools: 14, backlinks: 50, reports: 10 },
      enterprise: { projects: -1, submissions: -1, seoTools: 14, backlinks: -1, reports: -1 }
    }

    const limits = planLimits[user.plan] || planLimits.free
    console.log(`\n=== Plan Limits (${user.plan}) ===`)
    console.log(`Projects: ${limits.projects === -1 ? 'unlimited' : limits.projects}`)
    console.log(`Submissions: ${limits.submissions === -1 ? 'unlimited' : limits.submissions}`)
    console.log(`SEO Tools: ${limits.seoTools === -1 ? 'unlimited' : limits.seoTools}`)

    // Check if at limits
    console.log(`\n=== At Limits? ===`)
    const isAtProjectLimit = limits.projects !== -1 && actualProjects >= limits.projects
    const isAtSubmissionLimit = limits.submissions !== -1 && actualSubmissions >= limits.submissions
    const isAtSeoToolsLimit = limits.seoTools !== -1 && actualSeoTools >= limits.seoTools

    console.log(`Projects at limit: ${isAtProjectLimit} (${actualProjects}/${limits.projects})`)
    console.log(`Submissions at limit: ${isAtSubmissionLimit} (${actualSubmissions}/${limits.submissions})`)
    console.log(`SEO Tools at limit: ${isAtSeoToolsLimit} (${actualSeoTools}/${limits.seoTools})`)

    if (actualSeoTools < limits.seoTools) {
      console.log(`\n✅ User should be able to use SEO tools (${actualSeoTools}/${limits.seoTools})`)
    } else {
      console.log(`\n❌ User has reached SEO tools limit (${actualSeoTools}/${limits.seoTools})`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

debugUserUsage()
