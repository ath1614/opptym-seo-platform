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

async function testBookmarkletAPI() {
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
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.projectName} - ${project.status}`)
      console.log(`   ID: ${project._id}`)
      console.log(`   Website: ${project.websiteURL}`)
    })

    if (projects.length === 0) {
      console.log('❌ User has no projects - cannot test bookmarklet submission')
      return
    }

    // Test bookmarklet submission API
    console.log(`\n=== Testing Bookmarklet Submission API ===`)
    
    const testProject = projects[0]
    const testLinkId = new mongoose.Types.ObjectId() // Mock link ID
    const testToken = 'test-token-123' // Mock token
    
    const testData = {
      token: testToken,
      projectId: testProject._id.toString(),
      linkId: testLinkId.toString(),
      url: 'https://example.com',
      title: 'Test Page',
      description: 'Test description'
    }

    console.log('Test data:', testData)

    // Make API call
    const response = await fetch('http://localhost:3000/api/bookmarklet/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log(`\nAPI Response Status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('API Response:', result)
    } else {
      const error = await response.text()
      console.log('API Error:', error)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

testBookmarkletAPI()
