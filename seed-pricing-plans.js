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
  },
  maxReports: {
    type: Number,
    required: true,
    default: 1
  },
  maxBacklinks: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
})

const PricingPlan = mongoose.models.PricingPlan || mongoose.model('PricingPlan', PricingPlanSchema)

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started with basic SEO tools',
    features: [
      'Basic SEO analysis',
      'Meta tag analyzer',
      'Keyword density checker',
      'Broken link scanner',
      'Sitemap & robots checker',
      'Page speed analyzer',
      'Mobile checker',
      'Schema validator',
      'Alt text checker',
      'Canonical checker'
    ],
    maxProjects: 1,
    maxSubmissions: 1,
    maxSeoTools: 5,
    maxReports: 1,
    maxBacklinks: 0,
    active: true
  },
  {
    name: 'Pro',
    price: 1999,
    description: 'Advanced SEO tools for growing businesses',
    features: [
      'Everything in Free',
      'Keyword researcher',
      'Backlink scanner',
      'Keyword tracker',
      'Competitor analyzer',
      'Technical SEO auditor',
      'Advanced analytics',
      'Priority support',
      'Custom reports',
      'API access'
    ],
    maxProjects: 5,
    maxSubmissions: 50,
    maxSeoTools: 14,
    maxReports: 10,
    maxBacklinks: 25,
    active: true
  },
  {
    name: 'Business',
    price: 3999,
    description: 'Complete SEO solution for established businesses',
    features: [
      'Everything in Pro',
      'White-label reports',
      'Team collaboration',
      'Advanced competitor analysis',
      'Custom integrations',
      'Dedicated account manager',
      'Unlimited projects',
      'Priority processing',
      'Custom branding',
      'Advanced API limits'
    ],
    maxProjects: -1, // Unlimited
    maxSubmissions: 200,
    maxSeoTools: 14,
    maxReports: 50,
    maxBacklinks: 100,
    active: true
  },
  {
    name: 'Enterprise',
    price: 9999,
    description: 'Enterprise-grade SEO platform with custom solutions',
    features: [
      'Everything in Business',
      'Custom development',
      'On-premise deployment',
      'Advanced security',
      'Custom integrations',
      'Dedicated infrastructure',
      '24/7 phone support',
      'Custom training',
      'SLA guarantees',
      'Unlimited everything'
    ],
    maxProjects: -1, // Unlimited
    maxSubmissions: -1, // Unlimited
    maxSeoTools: -1, // Unlimited
    maxReports: -1, // Unlimited
    maxBacklinks: -1, // Unlimited
    active: true
  }
]

async function seedPricingPlans() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing pricing plans
    console.log('Clearing existing pricing plans...')
    await PricingPlan.deleteMany({})
    console.log('Existing pricing plans cleared')

    // Insert new pricing plans
    console.log('Inserting new pricing plans...')
    const insertedPlans = await PricingPlan.insertMany(pricingPlans)
    console.log(`Successfully inserted ${insertedPlans.length} pricing plans:`)
    
    insertedPlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price}/month (${plan.maxProjects} projects, ${plan.maxSubmissions} submissions, ${plan.maxSeoTools} SEO tools)`)
    })

    console.log('Pricing plans seeded successfully!')
  } catch (error) {
    console.error('Error seeding pricing plans:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedPricingPlans()
