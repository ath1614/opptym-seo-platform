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

const SeoToolUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  toolId: { type: String, required: true },
  toolName: { type: String, required: true },
  url: { type: String, required: true },
  results: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const SeoToolUsage = mongoose.models.SeoToolUsage || mongoose.model('SeoToolUsage', SeoToolUsageSchema)

// Simulate the trackUsage logic
async function testTrackUsage(userId, limitType, increment = 1) {
  try {
    console.log(`\n=== Testing trackUsage: ${limitType} +${increment} ===`)
    
    const user = await User.findById(userId)
    if (!user) {
      console.log('❌ User not found')
      return false
    }

    console.log(`User: ${user.email}`)
    console.log(`Plan: ${user.plan}`)
    console.log(`Cached usage:`, user.usage)

    // Get actual current usage from database
    let actualCurrentUsage = 0
    
    if (limitType === 'seoTools') {
      actualCurrentUsage = await SeoToolUsage.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId)
      })
    } else {
      actualCurrentUsage = user.usage?.[limitType] || 0
    }
    
    const newUsage = actualCurrentUsage + increment
    console.log(`Actual current usage: ${actualCurrentUsage}`)
    console.log(`New usage would be: ${newUsage}`)

    // Check limits (hardcoded for free plan)
    const limits = {
      free: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 }
    }
    
    const planLimits = limits[user.plan] || limits.free
    const limit = planLimits[limitType]
    
    console.log(`Plan limit for ${limitType}: ${limit}`)
    
    if (limit === -1) {
      console.log('✅ Unlimited - can use')
      return true
    }
    
    if (newUsage > limit) {
      console.log(`❌ Would exceed limit: ${newUsage} > ${limit}`)
      return false
    } else {
      console.log(`✅ Within limit: ${newUsage} <= ${limit}`)
      return true
    }
    
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}

async function testLimitLogic() {
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

    console.log(`\n=== Testing Limit Logic for ${user.email} ===`)

    // Test SEO tools usage
    await testTrackUsage(user._id, 'seoTools', 1)

    // Test other limits
    await testTrackUsage(user._id, 'projects', 1)
    await testTrackUsage(user._id, 'submissions', 1)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

testLimitLogic()
