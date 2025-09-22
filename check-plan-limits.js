const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define the PricingPlan schema
const PricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  features: [{
    type: String,
    required: true
  }],
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  maxProjects: {
    type: Number,
    required: true,
    default: 1
  },
  maxSubmissions: {
    type: Number,
    required: true,
    default: 10
  },
  maxSeoTools: {
    type: Number,
    required: true,
    default: 5
  }
}, {
  timestamps: true
})

const PricingPlan = mongoose.models.PricingPlan || mongoose.model('PricingPlan', PricingPlanSchema)

async function checkPlanLimits() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get all pricing plans
    const plans = await PricingPlan.find({ active: true }).sort({ price: 1 })
    
    console.log('\n=== Database Plan Limits ===')
    plans.forEach(plan => {
      console.log(`\n${plan.name} Plan:`)
      console.log(`  Price: ₹${plan.price}/month`)
      console.log(`  Max Projects: ${plan.maxProjects === -1 ? 'Unlimited' : plan.maxProjects}`)
      console.log(`  Max Submissions: ${plan.maxSubmissions === -1 ? 'Unlimited' : plan.maxSubmissions}`)
      console.log(`  Max SEO Tools: ${plan.maxSeoTools === -1 ? 'Unlimited' : plan.maxSeoTools}`)
    })

    // Check hardcoded limits
    console.log('\n=== Hardcoded Plan Limits ===')
    const hardcodedLimits = {
      free: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 },
      pro: { projects: 15, submissions: 750, seoTools: 1000, backlinks: 100, reports: 50 },
      business: { projects: 50, submissions: 1500, seoTools: 5000, backlinks: 500, reports: 200 },
      enterprise: { projects: -1, submissions: -1, seoTools: -1, backlinks: -1, reports: -1 }
    }

    Object.entries(hardcodedLimits).forEach(([planName, limits]) => {
      console.log(`\n${planName} Plan:`)
      console.log(`  Projects: ${limits.projects === -1 ? 'Unlimited' : limits.projects}`)
      console.log(`  Submissions: ${limits.submissions === -1 ? 'Unlimited' : limits.submissions}`)
      console.log(`  SEO Tools: ${limits.seoTools === -1 ? 'Unlimited' : limits.seoTools}`)
      console.log(`  Backlinks: ${limits.backlinks === -1 ? 'Unlimited' : limits.backlinks}`)
      console.log(`  Reports: ${limits.reports === -1 ? 'Unlimited' : limits.reports}`)
    })

    // Check for mismatches
    console.log('\n=== Checking for Mismatches ===')
    const freePlan = plans.find(p => p.name.toLowerCase() === 'free')
    if (freePlan) {
      console.log('\nFree Plan Comparison:')
      console.log(`Database SEO Tools Limit: ${freePlan.maxSeoTools}`)
      console.log(`Hardcoded SEO Tools Limit: ${hardcodedLimits.free.seoTools}`)
      
      if (freePlan.maxSeoTools !== hardcodedLimits.free.seoTools) {
        console.log('❌ MISMATCH: Database and hardcoded limits differ!')
        console.log('This could cause the limit exceeded error.')
      } else {
        console.log('✅ Free plan limits match between database and hardcoded')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

checkPlanLimits()
