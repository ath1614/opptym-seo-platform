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

async function checkUserProjects() {
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
      console.log(`   Category: ${project.category}`)
      console.log(`   Created: ${project.createdAt.toISOString()}`)
    })

    if (projects.length === 0) {
      console.log('❌ User has no projects - cannot use bookmarklet')
      console.log('💡 User needs to create a project first')
    } else {
      console.log('✅ User has projects - bookmarklet should work')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

checkUserProjects()
