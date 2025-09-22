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

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)

async function testBookmarkletAPIDirect() {
  try {
    console.log('🧪 TESTING BOOKMARKLET API DIRECTLY')
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

    // Test the bookmarklet submission API
    console.log('\n🚀 TESTING BOOKMARKLET SUBMISSION API')
    console.log('-------------------------------------')
    
    const testData = {
      token: 'test-token-123', // This will fail token validation
      projectId: project._id.toString(),
      linkId: new mongoose.Types.ObjectId().toString(),
      url: 'https://example.com',
      title: 'Test Page',
      description: 'Test description'
    }

    console.log('📤 Sending test data:', testData)

    try {
      const response = await fetch('http://localhost:3000/api/bookmarklet/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      console.log(`📊 Response status: ${response.status}`)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ API Response:', result)
      } else {
        const error = await response.text()
        console.log('❌ API Error:', error)
      }
    } catch (fetchError) {
      console.log('❌ Fetch Error:', fetchError.message)
      console.log('💡 This is expected if the server is not running locally')
    }

    // Test the trackUsage function directly
    console.log('\n🔧 TESTING trackUsage FUNCTION')
    console.log('-------------------------------')
    
    // Import the trackUsage function
    const { trackUsage } = await import('./src/lib/limit-middleware.js')
    
    console.log('📤 Testing trackUsage for submissions...')
    const canSubmit = await trackUsage(user._id.toString(), 'submissions', 1)
    console.log(`📊 trackUsage result: ${canSubmit}`)
    
    if (canSubmit) {
      console.log('✅ trackUsage allows submission')
    } else {
      console.log('❌ trackUsage blocks submission')
    }

    // Check user usage after trackUsage
    const updatedUser = await User.findById(user._id)
    console.log(`📊 Updated user usage:`, updatedUser.usage)

  } catch (error) {
    console.error('❌ Error during API test:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

testBookmarkletAPIDirect()
