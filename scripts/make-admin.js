const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Minimal User schema matching production for role/verification updates
const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  companyName: String,
  plan: { type: String, default: 'free' },
  role: { type: String, default: 'user' },
  verified: { type: Boolean, default: false },
  usage: {
    projects: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
    seoTools: { type: Number, default: 0 },
    backlinks: { type: Number, default: 0 },
    reports: { type: Number, default: 0 }
  }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function makeAdmin(email) {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Add it to .env.local')
    process.exit(1)
  }

  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const user = await User.findOne({ email })
    if (!user) {
      console.error(`User not found for email: ${email}`)
      process.exit(1)
    }

    console.log(`Current role: ${user.role}, verified: ${user.verified}`)
    user.role = 'admin'
    user.verified = true
    await user.save()

    console.log(`✅ Updated user to admin: ${user.email}`)
    console.log('Note: User may need to re-login for session to reflect admin role.')
  } catch (err) {
    console.error('Error making user admin:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Allow running as: node scripts/make-admin.js <email>
const emailArg = process.argv[2] || 'shrivitthalp@gmail.com'
makeAdmin(emailArg)