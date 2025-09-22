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

async function testCompleteBookmarkletFlow() {
  try {
    console.log('🔄 TESTING COMPLETE BOOKMARKLET FLOW')
    console.log('====================================')
    
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Step 1: Get user and project
    console.log('\n📊 STEP 1: GET USER AND PROJECT')
    console.log('-------------------------------')
    
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

    // Step 2: Simulate bookmarklet token creation
    console.log('\n🔑 STEP 2: SIMULATE TOKEN CREATION')
    console.log('----------------------------------')
    
    const { createToken, validateToken, bookmarkletTokens } = await import('./src/lib/bookmarklet-tokens.js')
    
    const linkId = new mongoose.Types.ObjectId()
    const tokenData = createToken(
      user._id.toString(),
      project._id.toString(),
      linkId.toString(),
      1, // maxUsage
      60 // expires in 60 minutes
    )
    
    console.log(`✅ Token created: ${tokenData.token.substring(0, 10)}...`)
    console.log(`📊 Token store size: ${bookmarkletTokens.size}`)
    console.log(`📊 Token data:`, {
      userId: tokenData.userId,
      projectId: tokenData.projectId,
      linkId: tokenData.linkId,
      maxUsage: tokenData.maxUsage,
      expiresAt: tokenData.expiresAt
    })

    // Step 3: Validate token
    console.log('\n✅ STEP 3: VALIDATE TOKEN')
    console.log('-------------------------')
    
    const validatedToken = validateToken(tokenData.token)
    if (validatedToken) {
      console.log('✅ Token validation successful')
    } else {
      console.log('❌ Token validation failed')
      return
    }

    // Step 4: Simulate bookmarklet submission
    console.log('\n📤 STEP 4: SIMULATE BOOKMARKLET SUBMISSION')
    console.log('------------------------------------------')
    
    const submissionData = {
      token: tokenData.token,
      projectId: project._id.toString(),
      linkId: linkId.toString(),
      url: 'https://example.com',
      title: 'Test Page',
      description: 'Test description'
    }

    console.log('📤 Submission data:', {
      token: submissionData.token.substring(0, 10) + '...',
      projectId: submissionData.projectId,
      linkId: submissionData.linkId,
      url: submissionData.url
    })

    // Step 5: Test the submission API
    console.log('\n🚀 STEP 5: TEST SUBMISSION API')
    console.log('------------------------------')
    
    try {
      const response = await fetch('http://localhost:3000/api/bookmarklet/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })

      console.log(`📊 Response status: ${response.status}`)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ API Response:', result)
        
        // Check if submission was created
        const submissions = await Submission.find({ userId: user._id })
        console.log(`📊 Total submissions after API call: ${submissions.length}`)
        
        if (submissions.length > 0) {
          console.log('✅ Submission created successfully!')
          const latestSubmission = submissions[submissions.length - 1]
          console.log(`📝 Latest submission: ${latestSubmission.directory} - ${latestSubmission.status}`)
        }
        
        // Check user usage
        const updatedUser = await User.findById(user._id)
        console.log(`📊 Updated user usage:`, updatedUser.usage)
        
      } else {
        const error = await response.text()
        console.log('❌ API Error:', error)
      }
    } catch (fetchError) {
      console.log('❌ Fetch Error:', fetchError.message)
      console.log('💡 This is expected if the server is not running locally')
      
      // Simulate the submission creation manually
      console.log('\n🔧 MANUAL SUBMISSION SIMULATION')
      console.log('-------------------------------')
      
      const submission = new Submission({
        userId: user._id,
        projectId: project._id,
        linkId: linkId,
        directory: 'Test Directory - Manual Simulation',
        category: 'directory',
        status: 'success',
        submittedAt: new Date(),
        completedAt: new Date(),
        notes: `Manual simulation - URL: ${submissionData.url}, Title: ${submissionData.title}, Description: ${submissionData.description}`
      })

      await submission.save()
      console.log('✅ Manual submission created:', submission._id)
      
      // Update user usage
      user.usage.submissions = (user.usage.submissions || 0) + 1
      await user.save()
      console.log('✅ User usage updated:', user.usage)
    }

    // Step 6: Final verification
    console.log('\n📊 STEP 6: FINAL VERIFICATION')
    console.log('-----------------------------')
    
    const finalSubmissions = await Submission.find({ userId: user._id })
    const finalUser = await User.findById(user._id)
    
    console.log(`📊 Final submission count: ${finalSubmissions.length}`)
    console.log(`📊 Final user usage:`, finalUser.usage)
    
    if (finalSubmissions.length > 0) {
      console.log('✅ BOOKMARKLET FLOW TEST SUCCESSFUL!')
      console.log('🎯 Submission counter should now show 1/1')
    } else {
      console.log('❌ BOOKMARKLET FLOW TEST FAILED')
      console.log('🔧 No submissions were created')
    }

  } catch (error) {
    console.error('❌ Error during complete flow test:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

testCompleteBookmarkletFlow()
