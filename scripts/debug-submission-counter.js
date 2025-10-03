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

async function debugSubmissionCounter() {
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
    
    if (allSubmissions.length === 0) {
      console.log('❌ No submissions found')
      console.log('\n💡 Possible reasons:')
      console.log('1. User has not used the bookmarklet yet')
      console.log('2. Bookmarklet is not working properly')
      console.log('3. API is failing silently')
      console.log('4. Token validation is failing')
      console.log('\n🔧 To test:')
      console.log('1. Go to your project in the dashboard')
      console.log('2. Generate a bookmarklet for a directory')
      console.log('3. Use the bookmarklet on a test page')
      console.log('4. Check if submission counter increases')
      console.log('5. Check browser console for any errors')
    } else {
      allSubmissions.forEach((submission, index) => {
        console.log(`${index + 1}. ${submission.directory} - ${submission.status} - ${submission.createdAt.toISOString()}`)
        console.log(`   Project: ${submission.projectId}`)
        console.log(`   Link: ${submission.linkId}`)
        console.log(`   Notes: ${submission.notes}`)
      })
    }

    // Get submissions by status
    const pendingSubmissions = await Submission.countDocuments({ 
      userId: user._id, 
      status: 'pending' 
    })
    const successSubmissions = await Submission.countDocuments({ 
      userId: user._id, 
      status: 'success' 
    })
    const rejectedSubmissions = await Submission.countDocuments({ 
      userId: user._id, 
      status: 'rejected' 
    })

    console.log(`\n=== Submission Counts by Status ===`)
    console.log(`Pending: ${pendingSubmissions}`)
    console.log(`Success: ${successSubmissions}`)
    console.log(`Rejected: ${rejectedSubmissions}`)
    console.log(`Total: ${allSubmissions.length}`)

    // Check what the dashboard should show
    console.log(`\n=== Dashboard Should Show ===`)
    console.log(`Cached submissions: ${user.usage.submissions}`)
    console.log(`Actual success submissions: ${successSubmissions}`)
    console.log(`Actual total submissions: ${allSubmissions.length}`)

    // Check if there's a mismatch
    if (user.usage.submissions !== successSubmissions) {
      console.log(`\n❌ MISMATCH: Cached (${user.usage.submissions}) vs Actual Success (${successSubmissions})`)
      
      // Fix the cached usage
      console.log(`\n=== Fixing Cached Usage ===`)
      user.usage.submissions = successSubmissions
      await user.save()
      console.log('✅ Cached submissions updated to match actual success count')
    } else {
      console.log(`\n✅ Cached submissions match actual success count`)
    }

    // Test the limit logic
    console.log(`\n=== Testing Submission Limit Logic ===`)
    const planLimits = {
      free: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 }
    }
    
    const limits = planLimits[user.plan] || planLimits.free
    const currentSubmissions = successSubmissions
    const limit = limits.submissions
    
    console.log(`Current submissions: ${currentSubmissions}`)
    console.log(`Limit: ${limit}`)
    console.log(`Can submit more: ${currentSubmissions < limit}`)
    
    if (currentSubmissions >= limit) {
      console.log(`❌ User has reached submission limit`)
    } else {
      console.log(`✅ User can submit ${limit - currentSubmissions} more submissions`)
    }

    // Check if there are any recent submissions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentSubmissions = await Submission.find({ 
      userId: user._id,
      createdAt: { $gte: oneDayAgo }
    }).sort({ createdAt: -1 })

    console.log(`\n=== Recent Submissions (Last 24 hours) ===`)
    if (recentSubmissions.length === 0) {
      console.log('No recent submissions found')
    } else {
      recentSubmissions.forEach((submission, index) => {
        console.log(`${index + 1}. ${submission.directory} - ${submission.status} - ${submission.createdAt.toISOString()}`)
      })
    }

    // Check if there are any submissions from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentHourSubmissions = await Submission.find({ 
      userId: user._id,
      createdAt: { $gte: oneHourAgo }
    }).sort({ createdAt: -1 })

    console.log(`\n=== Recent Submissions (Last 1 hour) ===`)
    if (recentHourSubmissions.length === 0) {
      console.log('No submissions in the last hour')
    } else {
      recentHourSubmissions.forEach((submission, index) => {
        console.log(`${index + 1}. ${submission.directory} - ${submission.status} - ${submission.createdAt.toISOString()}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

debugSubmissionCounter()
