const mongoose = require('mongoose')

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym-seo')
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// SEO Tool Config Schema
const SeoToolConfigSchema = new mongoose.Schema({
  toolId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['analysis', 'research', 'technical', 'content'], required: true },
  isPremium: { type: Boolean, default: false },
  isEnabled: { type: Boolean, default: true },
  icon: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedTime: { type: String, default: '2-5 min' },
  recommendedFrequency: { type: String, default: 'Weekly' },
  order: { type: Number, default: 0 }
}, { timestamps: true })

const SeoToolConfig = mongoose.models.SeoToolConfig || mongoose.model('SeoToolConfig', SeoToolConfigSchema)

const defaultTools = [
  { toolId: 'meta-tag-analyzer', name: 'Meta Tag Analyzer', description: 'Analyze meta titles, descriptions, and other meta tags', category: 'analysis', isPremium: false, isEnabled: true, icon: 'Search', difficulty: 'beginner', estimatedTime: '2-5 min', recommendedFrequency: 'Weekly', order: 1 },
  { toolId: 'keyword-density-checker', name: 'Keyword Density Checker', description: 'Check keyword density and distribution', category: 'analysis', isPremium: false, isEnabled: true, icon: 'BarChart3', difficulty: 'beginner', estimatedTime: '3-7 min', recommendedFrequency: 'Weekly', order: 2 },
  { toolId: 'keyword-researcher', name: 'Keyword Research', description: 'Research and discover high-value keywords', category: 'research', isPremium: true, isEnabled: true, icon: 'TrendingUp', difficulty: 'intermediate', estimatedTime: '5-10 min', recommendedFrequency: 'Monthly', order: 3 },
  { toolId: 'broken-link-scanner', name: 'Broken Link Scanner', description: 'Find and identify broken links', category: 'technical', isPremium: false, isEnabled: true, icon: 'Link', difficulty: 'beginner', estimatedTime: '5-15 min', recommendedFrequency: 'Monthly', order: 4 },
  { toolId: 'backlink-scanner', name: 'Backlink Scanner', description: 'Analyze backlinks pointing to your website', category: 'research', isPremium: true, isEnabled: true, icon: 'ExternalLink', difficulty: 'intermediate', estimatedTime: '10-20 min', recommendedFrequency: 'Monthly', order: 5 },
  { toolId: 'keyword-tracker', name: 'Keyword Tracker', description: 'Track keyword rankings over time', category: 'research', isPremium: true, isEnabled: true, icon: 'TrendingUp', difficulty: 'intermediate', estimatedTime: '5-10 min', recommendedFrequency: 'Weekly', order: 6 },
  { toolId: 'competitor-analyzer', name: 'Competitor Analyzer', description: 'Analyze competitor websites and strategies', category: 'research', isPremium: true, isEnabled: true, icon: 'Users', difficulty: 'advanced', estimatedTime: '15-30 min', recommendedFrequency: 'Monthly', order: 7 },
  { toolId: 'page-speed-analyzer', name: 'Page Speed Analyzer', description: 'Analyze page loading speed and performance', category: 'technical', isPremium: false, isEnabled: true, icon: 'Gauge', difficulty: 'beginner', estimatedTime: '3-8 min', recommendedFrequency: 'Weekly', order: 8 },
  { toolId: 'mobile-checker', name: 'Mobile Checker', description: 'Check mobile-friendliness and responsive design', category: 'technical', isPremium: false, isEnabled: true, icon: 'Smartphone', difficulty: 'beginner', estimatedTime: '2-5 min', recommendedFrequency: 'Weekly', order: 9 },
  { toolId: 'technical-seo-auditor', name: 'Technical SEO Auditor', description: 'Comprehensive technical SEO audit', category: 'technical', isPremium: true, isEnabled: true, icon: 'CheckCircle', difficulty: 'advanced', estimatedTime: '20-45 min', recommendedFrequency: 'Monthly', order: 10 },
  { toolId: 'sitemap-robots-checker', name: 'Sitemap & Robots Checker', description: 'Validate sitemap and robots.txt files', category: 'technical', isPremium: false, isEnabled: true, icon: 'Map', difficulty: 'beginner', estimatedTime: '2-5 min', recommendedFrequency: 'Monthly', order: 11 },
  { toolId: 'schema-validator', name: 'Schema Validator', description: 'Validate structured data and schema markup', category: 'technical', isPremium: false, isEnabled: true, icon: 'Code', difficulty: 'intermediate', estimatedTime: '5-10 min', recommendedFrequency: 'Monthly', order: 12 },
  { toolId: 'alt-text-checker', name: 'Alt Text Checker', description: 'Check for missing or inadequate alt text', category: 'content', isPremium: false, isEnabled: true, icon: 'Image', difficulty: 'beginner', estimatedTime: '3-8 min', recommendedFrequency: 'Weekly', order: 13 },
  { toolId: 'canonical-checker', name: 'Canonical Checker', description: 'Check canonical URLs and duplicate content', category: 'technical', isPremium: false, isEnabled: true, icon: 'FileText', difficulty: 'intermediate', estimatedTime: '3-7 min', recommendedFrequency: 'Monthly', order: 14 }
]

async function seedSeoTools() {
  try {
    await connectDB()
    
    console.log('Seeding SEO tools...')
    
    // Clear existing tools
    await SeoToolConfig.deleteMany({})
    
    // Insert default tools
    await SeoToolConfig.insertMany(defaultTools)
    
    console.log(`Successfully seeded ${defaultTools.length} SEO tools`)
    
    // Display summary
    const tools = await SeoToolConfig.find({}).sort({ order: 1 })
    console.log('\nSeeded tools:')
    tools.forEach(tool => {
      console.log(`- ${tool.name} (${tool.category}) ${tool.isPremium ? '[PREMIUM]' : '[FREE]'} ${tool.isEnabled ? '[ENABLED]' : '[DISABLED]'}`)
    })
    
  } catch (error) {
    console.error('Error seeding SEO tools:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the seeder
seedSeoTools()