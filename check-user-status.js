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

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)

async function checkUserStatus() {
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

    // Get all submissions for this user
    const allSubmissions = await Submission.find({ userId: user._id }).sort({ createdAt: -1 })
    console.log(`\n=== All Submissions (${allSubmissions.length}) ===`)
    
    allSubmissions.forEach((submission, index) => {
      console.log(`${index + 1}. ${submission.directory} - ${submission.status} - ${submission.createdAt.toISOString()}`)
    })

    // Get submissions by status
    const successSubmissions = await Submission.countDocuments({ 
      userId: user._id, 
      status: 'success' 
    })

    console.log(`\n=== Submission Status ===`)
    console.log(`Cached submissions: ${user.usage.submissions}`)
    console.log(`Actual success submissions: ${successSubmissions}`)
    console.log(`Total submissions: ${allSubmissions.length}`)

    // Check limit
    const planLimits = {
      free: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 }
    }
    
    const limits = planLimits[user.plan] || planLimits.free
    const currentSubmissions = successSubmissions
    const limit = limits.submissions
    
    console.log(`\n=== Limit Check ===`)
    console.log(`Current submissions: ${currentSubmissions}`)
    console.log(`Limit: ${limit}`)
    console.log(`Can submit more: ${currentSubmissions < limit}`)
    
    if (currentSubmissions >= limit) {
      console.log(`❌ User has reached submission limit`)
      console.log(`💡 User needs to upgrade plan or delete a submission to test bookmarklet`)
    } else {
      console.log(`✅ User can submit ${limit - currentSubmissions} more submissions`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

checkUserStatus()
