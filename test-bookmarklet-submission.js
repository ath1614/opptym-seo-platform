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

async function testBookmarkletSubmission() {
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

    // Get user's projects
    const projects = await Project.find({ userId: user._id })
    console.log(`\n=== User Projects (${projects.length}) ===`)
    
    if (projects.length === 0) {
      console.log('❌ User has no projects - cannot test bookmarklet submission')
      return
    }

    const testProject = projects[0]
    console.log(`Using project: ${testProject.projectName} (${testProject._id})`)

    // Create a test submission to simulate bookmarklet usage
    console.log(`\n=== Creating Test Submission ===`)
    
    const testSubmission = new Submission({
      userId: user._id,
      projectId: testProject._id,
      linkId: new mongoose.Types.ObjectId(), // Mock link ID
      directory: 'Test Directory - Bookmarklet Test',
      category: 'directory',
      status: 'success',
      submittedAt: new Date(),
      completedAt: new Date(),
      notes: `Test bookmarklet submission - URL: https://example.com, Title: Test Page, Description: Test description`
    })

    await testSubmission.save()
    console.log('✅ Test submission created:', testSubmission._id)

    // Update user's cached usage
    console.log(`\n=== Updating User Usage ===`)
    user.usage.submissions = (user.usage.submissions || 0) + 1
    await user.save()
    console.log('✅ User usage updated:', user.usage)

    // Verify the submission was created
    const allSubmissions = await Submission.find({ userId: user._id }).sort({ createdAt: -1 })
    console.log(`\n=== All Submissions (${allSubmissions.length}) ===`)
    
    allSubmissions.forEach((submission, index) => {
      console.log(`${index + 1}. ${submission.directory} - ${submission.status} - ${submission.createdAt.toISOString()}`)
    })

    // Get updated user data
    const updatedUser = await User.findById(user._id)
    console.log(`\n=== Updated User Usage ===`)
    console.log(`Cached submissions: ${updatedUser.usage.submissions}`)
    console.log(`Actual submissions: ${allSubmissions.length}`)

    console.log(`\n✅ Test completed successfully!`)
    console.log(`📊 Dashboard should now show: ${updatedUser.usage.submissions}/1 submissions`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

testBookmarkletSubmission()