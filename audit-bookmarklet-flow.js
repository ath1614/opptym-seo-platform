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

async function auditBookmarkletFlow() {
  try {
    console.log('🔍 AUDITING BOOKMARKLET SUBMISSION FLOW')
    console.log('=====================================')
    
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Step 1: Check user status
    console.log('\n📊 STEP 1: USER STATUS CHECK')
    console.log('----------------------------')
    
    const user = await User.findOne({ email: 'atharv.soni@adypu.edu.in' })
    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log(`✅ User found: ${user.email}`)
    console.log(`📋 Plan: ${user.plan}`)
    console.log(`📈 Cached Usage:`, user.usage)

    // Step 2: Check user's projects
    console.log('\n📁 STEP 2: PROJECT CHECK')
    console.log('------------------------')
    
    const projects = await Project.find({ userId: user._id })
    console.log(`📊 User has ${projects.length} projects`)
    
    if (projects.length === 0) {
      console.log('❌ No projects found - bookmarklet cannot work')
      return
    }

    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.projectName} (${project._id})`)
      console.log(`   Status: ${project.status}`)
      console.log(`   Website: ${project.websiteURL}`)
    })

    // Step 3: Check current submissions
    console.log('\n📝 STEP 3: SUBMISSION STATUS CHECK')
    console.log('----------------------------------')
    
    const allSubmissions = await Submission.find({ userId: user._id }).sort({ createdAt: -1 })
    console.log(`📊 Total submissions: ${allSubmissions.length}`)
    
    if (allSubmissions.length > 0) {
      allSubmissions.forEach((submission, index) => {
        console.log(`${index + 1}. ${submission.directory} - ${submission.status}`)
        console.log(`   Created: ${submission.createdAt.toISOString()}`)
        console.log(`   Project: ${submission.projectId}`)
        console.log(`   Notes: ${submission.notes}`)
      })
    } else {
      console.log('📝 No submissions found')
    }

    // Step 4: Check submission limits
    console.log('\n🚫 STEP 4: LIMIT CHECK')
    console.log('----------------------')
    
    const planLimits = {
      free: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 }
    }
    
    const limits = planLimits[user.plan] || planLimits.free
    const successSubmissions = await Submission.countDocuments({ 
      userId: user._id, 
      status: 'success' 
    })
    
    console.log(`📊 Plan: ${user.plan}`)
    console.log(`📊 Submission limit: ${limits.submissions}`)
    console.log(`📊 Current success submissions: ${successSubmissions}`)
    console.log(`📊 Cached submissions: ${user.usage.submissions}`)
    
    if (successSubmissions >= limits.submissions) {
      console.log('❌ User has reached submission limit')
      console.log('💡 Cannot test bookmarklet - limit exceeded')
    } else {
      console.log('✅ User can submit more submissions')
      console.log(`💡 Can submit ${limits.submissions - successSubmissions} more`)
    }

    // Step 5: Check for recent submissions (last hour)
    console.log('\n⏰ STEP 5: RECENT ACTIVITY CHECK')
    console.log('--------------------------------')
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentSubmissions = await Submission.find({ 
      userId: user._id,
      createdAt: { $gte: oneHourAgo }
    }).sort({ createdAt: -1 })

    console.log(`📊 Submissions in last hour: ${recentSubmissions.length}`)
    
    if (recentSubmissions.length > 0) {
      recentSubmissions.forEach((submission, index) => {
        console.log(`${index + 1}. ${submission.directory} - ${submission.status}`)
        console.log(`   Time: ${submission.createdAt.toISOString()}`)
      })
    } else {
      console.log('📝 No recent submissions found')
    }

    // Step 6: Check for any pending submissions
    console.log('\n⏳ STEP 6: PENDING SUBMISSIONS CHECK')
    console.log('-----------------------------------')
    
    const pendingSubmissions = await Submission.find({ 
      userId: user._id,
      status: 'pending'
    })

    console.log(`📊 Pending submissions: ${pendingSubmissions.length}`)
    
    if (pendingSubmissions.length > 0) {
      pendingSubmissions.forEach((submission, index) => {
        console.log(`${index + 1}. ${submission.directory} - ${submission.status}`)
        console.log(`   Created: ${submission.createdAt.toISOString()}`)
      })
    }

    // Step 7: Summary and recommendations
    console.log('\n📋 STEP 7: SUMMARY & RECOMMENDATIONS')
    console.log('-----------------------------------')
    
    console.log(`👤 User: ${user.email}`)
    console.log(`📊 Plan: ${user.plan}`)
    console.log(`📈 Cached usage: ${user.usage.submissions}/${limits.submissions}`)
    console.log(`📝 Actual submissions: ${successSubmissions}/${limits.submissions}`)
    console.log(`⏰ Recent submissions: ${recentSubmissions.length}`)
    console.log(`⏳ Pending submissions: ${pendingSubmissions.length}`)
    
    if (successSubmissions >= limits.submissions) {
      console.log('\n❌ ISSUE IDENTIFIED: User has reached submission limit')
      console.log('🔧 SOLUTION: Reset user submissions or upgrade plan')
    } else if (recentSubmissions.length > 0) {
      console.log('\n✅ Recent submissions found - bookmarklet is working')
      console.log('🔧 Check if dashboard is updating properly')
    } else {
      console.log('\n❓ ISSUE: No recent submissions found')
      console.log('🔧 POSSIBLE CAUSES:')
      console.log('   1. Bookmarklet not being used')
      console.log('   2. Bookmarklet API failing')
      console.log('   3. Token validation failing')
      console.log('   4. CORS issues')
      console.log('   5. JavaScript errors in bookmarklet')
    }

  } catch (error) {
    console.error('❌ Error during audit:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

auditBookmarkletFlow()
