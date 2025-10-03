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
  websiteURL: String,
  businessDescription: String,
  category: String,
  status: { type: String, default: 'active' }
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
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)

async function simulateBookmarkletSubmission() {
  try {
    console.log('🎯 SIMULATING BOOKMARKLET SUBMISSION')
    console.log('===================================')
    
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get user and project
    const user = await User.findOne({ email: 'atharv.soni@adypu.edu.in' })
    if (!user) {
      console.log('❌ User not found')
      return
    }

    const project = await Project.findOne({ userId: user._id })
    if (!project) {
      console.log('❌ Project not found')
      return
    }

    console.log(`✅ User: ${user.email}`)
    console.log(`✅ Project: ${project.projectName} (${project._id})`)
    console.log(`📊 Current usage:`, user.usage)

    // Check current submissions
    const currentSubmissions = await Submission.find({ userId: user._id })
    console.log(`📊 Current submissions: ${currentSubmissions.length}`)

    // Simulate bookmarklet submission
    console.log('\n🚀 SIMULATING BOOKMARKLET SUBMISSION')
    console.log('-----------------------------------')
    
    const linkId = new mongoose.Types.ObjectId()
    
    // Create submission (this is what the bookmarklet API should do)
    const submission = new Submission({
      userId: user._id,
      projectId: project._id,
      linkId: linkId,
      directory: 'Test Directory - Bookmarklet Simulation',
      category: 'directory',
      status: 'success',
      submittedAt: new Date(),
      completedAt: new Date(),
      notes: `Bookmarklet simulation - URL: https://example.com, Title: Test Page, Description: Test description`
    })

    await submission.save()
    console.log('✅ Submission created:', submission._id)

    // Update user usage (this is what trackUsage should do)
    user.usage.submissions = (user.usage.submissions || 0) + 1
    await user.save()
    console.log('✅ User usage updated:', user.usage)

    // Verify the changes
    console.log('\n📊 VERIFICATION')
    console.log('---------------')
    
    const updatedSubmissions = await Submission.find({ userId: user._id })
    const updatedUser = await User.findById(user._id)
    
    console.log(`📊 Updated submissions: ${updatedSubmissions.length}`)
    console.log(`📊 Updated user usage:`, updatedUser.usage)
    
    if (updatedSubmissions.length > currentSubmissions.length) {
      console.log('✅ SUBMISSION COUNTER INCREASED!')
      console.log('🎯 Dashboard should now show:', `${updatedUser.usage.submissions}/1 submissions`)
    } else {
      console.log('❌ Submission counter did not increase')
    }

    // Show the latest submission
    if (updatedSubmissions.length > 0) {
      const latestSubmission = updatedSubmissions[updatedSubmissions.length - 1]
      console.log('\n📝 Latest submission:')
      console.log(`   Directory: ${latestSubmission.directory}`)
      console.log(`   Status: ${latestSubmission.status}`)
      console.log(`   Created: ${latestSubmission.createdAt.toISOString()}`)
      console.log(`   Notes: ${latestSubmission.notes}`)
    }

  } catch (error) {
    console.error('❌ Error during simulation:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

simulateBookmarkletSubmission()
