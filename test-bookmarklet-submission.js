// Test bookmarklet submission counter
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  verified: { type: Boolean, default: false },
  plan: { type: String, default: 'Free' },
  companyName: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  usage: {
    projects: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
    seoTools: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    backlinks: { type: Number, default: 0 }
  },
  isNewUser: { type: Boolean, default: false }
}, { timestamps: true })

// Submission Schema
const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link' },
  directory: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  notes: { type: String, default: '' }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)

async function testBookmarkletSubmission() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Find the user
    const user = await User.findOne({ email: 'shoryataneja5@gmail.com' })
    if (!user) {
      console.log('❌ User not found: shoryataneja5@gmail.com')
      return
    }
    console.log('✅ User found:', user.email, 'Plan:', user.plan)

    // Check current submission count
    const currentSubmissions = await Submission.countDocuments({ 
      userId: user._id,
      status: 'success'
    })
    console.log('📊 Current successful submissions:', currentSubmissions)
    console.log('📊 Cached submission count:', user.usage.submissions)

    // Get all submissions for this user
    const allSubmissions = await Submission.find({ userId: user._id })
    console.log('📋 All submissions for user:')
    allSubmissions.forEach((sub, index) => {
      console.log(`  ${index + 1}. Status: ${sub.status}, Directory: ${sub.directory}, Created: ${sub.createdAt}`)
    })

    // Create a test bookmarklet submission
    console.log('\n🧪 Creating test bookmarklet submission...')
    const testSubmission = new Submission({
      userId: user._id,
      projectId: new mongoose.Types.ObjectId(), // Mock project ID
      linkId: new mongoose.Types.ObjectId(), // Mock link ID
      directory: 'Test Directory - Bookmarklet',
      category: 'directory',
      status: 'success',
      submittedAt: new Date(),
      completedAt: new Date(),
      notes: 'Test bookmarklet submission - URL: https://test.com, Title: Test Title, Description: Test Description'
    })

    await testSubmission.save()
    console.log('✅ Test submission created:', testSubmission._id)

    // Check updated submission count
    const updatedSubmissions = await Submission.countDocuments({ 
      userId: user._id,
      status: 'success'
    })
    console.log('📊 Updated successful submissions:', updatedSubmissions)

    // Update user's cached submission count
    user.usage.submissions = updatedSubmissions
    await user.save()
    console.log('✅ User cached submission count updated to:', updatedSubmissions)

    // Verify the count
    const finalCount = await Submission.countDocuments({ 
      userId: user._id,
      status: 'success'
    })
    console.log('📊 Final verification - successful submissions:', finalCount)

    console.log('\n🎉 Bookmarklet submission test completed successfully!')
    console.log('📈 Submission count increased from', currentSubmissions, 'to', finalCount)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

testBookmarkletSubmission()