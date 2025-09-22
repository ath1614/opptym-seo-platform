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

async function resetAndTestBookmarklet() {
  try {
    console.log('🔄 RESETTING AND TESTING BOOKMARKLET')
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

    // Reset user submissions
    console.log('\n🔄 RESETTING USER SUBMISSIONS')
    console.log('-----------------------------')
    
    await Submission.deleteMany({ userId: user._id })
    user.usage.submissions = 0
    await user.save()
    
    console.log('✅ User submissions reset to 0/1')
    console.log('🎯 User can now test bookmarklet')

    // Show current status
    console.log('\n📊 CURRENT STATUS')
    console.log('================')
    console.log(`👤 User: ${user.email}`)
    console.log(`📊 Plan: ${user.plan}`)
    console.log(`📈 Usage: ${user.usage.submissions}/1 submissions`)
    console.log(`📁 Project: ${project.projectName}`)
    console.log(`🌐 Website: ${project.websiteURL}`)
    console.log(`✅ Ready for bookmarklet testing`)

    console.log('\n📝 TESTING INSTRUCTIONS')
    console.log('=======================')
    console.log('1. Go to your project in the dashboard')
    console.log('2. Navigate to SEO Tasks or Directories')
    console.log('3. Click on a directory/link')
    console.log('4. Click "Generate Bookmarklet" button')
    console.log('5. Copy the bookmarklet code')
    console.log('6. Open the test page: test-bookmarklet.html')
    console.log('7. Replace the test bookmarklet with your actual code')
    console.log('8. Drag the bookmarklet to your bookmarks bar')
    console.log('9. Click the bookmarklet on the test page')
    console.log('10. Check if submission counter increases from 0/1 to 1/1')
    
    console.log('\n🔧 TROUBLESHOOTING')
    console.log('==================')
    console.log('If bookmarklet still doesn\'t work:')
    console.log('1. Check browser console for JavaScript errors')
    console.log('2. Check network tab for failed API calls')
    console.log('3. Verify you\'re logged into your account')
    console.log('4. Try on a different website')
    console.log('5. Check if the bookmarklet code is correct')
    console.log('6. Make sure the bookmarklet is calling the correct API endpoint')

  } catch (error) {
    console.error('❌ Error during reset:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

resetAndTestBookmarklet()
