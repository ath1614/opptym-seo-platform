import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym-seo'

const sampleDirectories = [
  // Directory Submission
  {
    name: 'DMOZ Directory',
    domain: 'dmoz.org',
    submissionUrl: 'https://dmoz.org/add.html',
    classification: 'Directory Submission',
    category: 'General',
    description: 'The largest human-edited directory of the web',
    country: 'United States',
    daScore: 95,
    pageRank: 9,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Yahoo Directory',
    domain: 'dir.yahoo.com',
    submissionUrl: 'https://dir.yahoo.com/submit',
    classification: 'Directory Submission',
    category: 'General',
    description: 'Yahoo\'s web directory for quality websites',
    country: 'United States',
    daScore: 92,
    pageRank: 8,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Best of the Web',
    domain: 'botw.org',
    submissionUrl: 'https://botw.org/submit',
    classification: 'Directory Submission',
    category: 'General',
    description: 'Premium web directory with editorial review',
    country: 'United States',
    daScore: 78,
    pageRank: 7,
    priority: 2,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Article Submission
  {
    name: 'EzineArticles',
    domain: 'ezinearticles.com',
    submissionUrl: 'https://ezinearticles.com/submit',
    classification: 'Article Submission',
    category: 'Articles',
    description: 'Leading article directory for expert authors',
    country: 'United States',
    daScore: 85,
    pageRank: 7,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ArticleBase',
    domain: 'articlebase.com',
    submissionUrl: 'https://articlebase.com/submit',
    classification: 'Article Submission',
    category: 'Articles',
    description: 'Free article directory for content marketing',
    country: 'United States',
    daScore: 72,
    pageRank: 6,
    priority: 2,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Social Bookmarking
  {
    name: 'Reddit',
    domain: 'reddit.com',
    submissionUrl: 'https://reddit.com/submit',
    classification: 'Social Bookmarking',
    category: 'Social',
    description: 'The front page of the internet',
    country: 'United States',
    daScore: 98,
    pageRank: 9,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'StumbleUpon',
    domain: 'stumbleupon.com',
    submissionUrl: 'https://stumbleupon.com/submit',
    classification: 'Social Bookmarking',
    category: 'Social',
    description: 'Discover and share great content',
    country: 'United States',
    daScore: 88,
    pageRank: 8,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Digg',
    domain: 'digg.com',
    submissionUrl: 'https://digg.com/submit',
    classification: 'Social Bookmarking',
    category: 'Social',
    description: 'Social news aggregation website',
    country: 'United States',
    daScore: 82,
    pageRank: 7,
    priority: 2,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Business Listing
  {
    name: 'Google My Business',
    domain: 'business.google.com',
    submissionUrl: 'https://business.google.com/create',
    classification: 'Business Listing',
    category: 'Business',
    description: 'Manage your business on Google Search and Maps',
    country: 'Global',
    daScore: 100,
    pageRank: 10,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Yelp Business',
    domain: 'biz.yelp.com',
    submissionUrl: 'https://biz.yelp.com/signup',
    classification: 'Business Listing',
    category: 'Business',
    description: 'Claim your business on Yelp',
    country: 'United States',
    daScore: 95,
    pageRank: 9,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Classified Ads
  {
    name: 'Craigslist',
    domain: 'craigslist.org',
    submissionUrl: 'https://craigslist.org/about/sites',
    classification: 'Classified Ads',
    category: 'Classifieds',
    description: 'Local classified advertisements',
    country: 'United States',
    daScore: 96,
    pageRank: 9,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Backpage',
    domain: 'backpage.com',
    submissionUrl: 'https://backpage.com/post',
    classification: 'Classified Ads',
    category: 'Classifieds',
    description: 'Free classified advertising website',
    country: 'United States',
    daScore: 78,
    pageRank: 7,
    priority: 2,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Press Release
  {
    name: 'PRWeb',
    domain: 'prweb.com',
    submissionUrl: 'https://prweb.com/submit',
    classification: 'Press Release',
    category: 'PR',
    description: 'Online press release distribution service',
    country: 'United States',
    daScore: 89,
    pageRank: 8,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'PR Newswire',
    domain: 'prnewswire.com',
    submissionUrl: 'https://prnewswire.com/submit',
    classification: 'Press Release',
    category: 'PR',
    description: 'Global press release distribution',
    country: 'United States',
    daScore: 92,
    pageRank: 8,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // More SEO
  {
    name: 'Web 2.0 Blogger',
    domain: 'blogger.com',
    submissionUrl: 'https://blogger.com/create',
    classification: 'More SEO',
    category: 'Web 2.0',
    description: 'Create a free blog on Blogger',
    country: 'Global',
    daScore: 98,
    pageRank: 9,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'WordPress.com',
    domain: 'wordpress.com',
    submissionUrl: 'https://wordpress.com/start',
    classification: 'More SEO',
    category: 'Web 2.0',
    description: 'Create a free WordPress blog',
    country: 'Global',
    daScore: 99,
    pageRank: 9,
    priority: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

async function seedDirectories() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const collection = db.collection('directories')
    
    // Clear existing directories
    await collection.deleteMany({})
    console.log('Cleared existing directories')
    
    // Insert sample directories
    const result = await collection.insertMany(sampleDirectories)
    console.log(`Inserted ${result.insertedCount} directories`)
    
    // Verify insertion
    const count = await collection.countDocuments({ status: 'active' })
    console.log(`Total active directories: ${count}`)
    
    // Show classifications
    const classifications = await collection.distinct('classification')
    console.log('Available classifications:', classifications)
    
  } catch (error) {
    console.error('Error seeding directories:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seed function
seedDirectories().catch(console.error)