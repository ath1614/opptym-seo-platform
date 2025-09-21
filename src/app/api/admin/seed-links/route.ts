import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Link from '@/models/Link'

const sampleLinks = [
  // Directory Submissions
  {
    name: 'DMOZ Directory',
    submissionUrl: 'https://dmoz-odp.org/',
    classification: 'Directory Submission',
    category: 'General',
    country: 'Global',
    description: 'Submit your website to the DMOZ directory for better visibility',
    domain: 'dmoz-odp.org',
    status: 'active',
    pageRank: 8,
    daScore: 85,
    isCustom: false,
    priority: 10,
    spamScore: 2,
    isPremium: false,
    requiresApproval: true,
    requiredFields: [
      { name: 'title', type: 'text', required: true, placeholder: 'Website Title' },
      { name: 'url', type: 'url', required: true, placeholder: 'Website URL' },
      { name: 'description', type: 'textarea', required: true, placeholder: 'Website Description' },
      { name: 'category', type: 'select', required: true, options: ['Business', 'Technology', 'Health', 'Education'] }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },
  {
    name: 'Yahoo Directory',
    submissionUrl: 'https://dir.yahoo.com/',
    classification: 'Directory Submission',
    category: 'General',
    country: 'Global',
    description: 'Submit to Yahoo Directory for increased web presence',
    domain: 'dir.yahoo.com',
    status: 'active',
    pageRank: 7,
    daScore: 80,
    isCustom: false,
    priority: 9,
    spamScore: 3,
    isPremium: false,
    requiresApproval: true,
    requiredFields: [
      { name: 'site_name', type: 'text', required: true, placeholder: 'Site Name' },
      { name: 'site_url', type: 'url', required: true, placeholder: 'Site URL' },
      { name: 'site_description', type: 'textarea', required: true, placeholder: 'Site Description' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },

  // Article Submissions
  {
    name: 'EzineArticles',
    submissionUrl: 'https://ezinearticles.com/',
    classification: 'Article Submission',
    category: 'Content Marketing',
    country: 'Global',
    description: 'Submit articles to EzineArticles for content marketing',
    domain: 'ezinearticles.com',
    status: 'active',
    pageRank: 6,
    daScore: 75,
    isCustom: false,
    priority: 8,
    spamScore: 4,
    isPremium: false,
    requiresApproval: true,
    requiredFields: [
      { name: 'article_title', type: 'text', required: true, placeholder: 'Article Title' },
      { name: 'article_content', type: 'textarea', required: true, placeholder: 'Article Content' },
      { name: 'author_name', type: 'text', required: true, placeholder: 'Author Name' },
      { name: 'author_bio', type: 'textarea', required: true, placeholder: 'Author Bio' },
      { name: 'website_url', type: 'url', required: true, placeholder: 'Website URL' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },
  {
    name: 'ArticleBase',
    submissionUrl: 'https://articlebase.com/',
    classification: 'Article Submission',
    category: 'Content Marketing',
    country: 'Global',
    description: 'Submit articles to ArticleBase for SEO benefits',
    domain: 'articlebase.com',
    status: 'active',
    pageRank: 5,
    daScore: 70,
    isCustom: false,
    priority: 7,
    spamScore: 5,
    isPremium: false,
    requiresApproval: true,
    requiredFields: [
      { name: 'title', type: 'text', required: true, placeholder: 'Article Title' },
      { name: 'content', type: 'textarea', required: true, placeholder: 'Article Content' },
      { name: 'author', type: 'text', required: true, placeholder: 'Author Name' },
      { name: 'website', type: 'url', required: true, placeholder: 'Website URL' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },

  // Press Releases
  {
    name: 'PRWeb',
    submissionUrl: 'https://www.prweb.com/',
    classification: 'Press Release',
    category: 'News Distribution',
    country: 'Global',
    description: 'Distribute press releases through PRWeb',
    domain: 'prweb.com',
    status: 'active',
    pageRank: 7,
    daScore: 82,
    isCustom: false,
    priority: 9,
    spamScore: 2,
    isPremium: true,
    requiresApproval: true,
    requiredFields: [
      { name: 'headline', type: 'text', required: true, placeholder: 'Press Release Headline' },
      { name: 'summary', type: 'textarea', required: true, placeholder: 'Press Release Summary' },
      { name: 'body', type: 'textarea', required: true, placeholder: 'Press Release Body' },
      { name: 'contact_name', type: 'text', required: true, placeholder: 'Contact Name' },
      { name: 'contact_email', type: 'email', required: true, placeholder: 'Contact Email' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },
  {
    name: 'PR Newswire',
    submissionUrl: 'https://www.prnewswire.com/',
    classification: 'Press Release',
    category: 'News Distribution',
    country: 'Global',
    description: 'Submit press releases to PR Newswire',
    domain: 'prnewswire.com',
    status: 'active',
    pageRank: 8,
    daScore: 88,
    isCustom: false,
    priority: 8,
    spamScore: 1,
    isPremium: true,
    requiresApproval: true,
    requiredFields: [
      { name: 'title', type: 'text', required: true, placeholder: 'Press Release Title' },
      { name: 'content', type: 'textarea', required: true, placeholder: 'Press Release Content' },
      { name: 'company_name', type: 'text', required: true, placeholder: 'Company Name' },
      { name: 'contact_info', type: 'text', required: true, placeholder: 'Contact Information' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },

  // Bookmarking
  {
    name: 'Reddit',
    submissionUrl: 'https://www.reddit.com/',
    classification: 'BookMarking',
    category: 'Social Media',
    country: 'Global',
    description: 'Share your content on Reddit for increased visibility',
    domain: 'reddit.com',
    status: 'active',
    pageRank: 9,
    daScore: 90,
    isCustom: false,
    priority: 6,
    spamScore: 8,
    isPremium: false,
    requiresApproval: false,
    requiredFields: [
      { name: 'title', type: 'text', required: true, placeholder: 'Post Title' },
      { name: 'url', type: 'url', required: true, placeholder: 'Content URL' },
      { name: 'subreddit', type: 'text', required: true, placeholder: 'Subreddit' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },
  {
    name: 'StumbleUpon',
    submissionUrl: 'https://www.stumbleupon.com/',
    classification: 'BookMarking',
    category: 'Social Media',
    country: 'Global',
    description: 'Bookmark your content on StumbleUpon',
    domain: 'stumbleupon.com',
    status: 'active',
    pageRank: 6,
    daScore: 75,
    isCustom: false,
    priority: 5,
    spamScore: 6,
    isPremium: false,
    requiresApproval: false,
    requiredFields: [
      { name: 'url', type: 'url', required: true, placeholder: 'Website URL' },
      { name: 'title', type: 'text', required: true, placeholder: 'Page Title' },
      { name: 'description', type: 'textarea', required: true, placeholder: 'Page Description' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },

  // Business Listings
  {
    name: 'Google My Business',
    submissionUrl: 'https://business.google.com/',
    classification: 'Business Listing',
    category: 'Local SEO',
    country: 'Global',
    description: 'List your business on Google My Business',
    domain: 'business.google.com',
    status: 'active',
    pageRank: 10,
    daScore: 95,
    isCustom: false,
    priority: 10,
    spamScore: 1,
    isPremium: false,
    requiresApproval: true,
    requiredFields: [
      { name: 'business_name', type: 'text', required: true, placeholder: 'Business Name' },
      { name: 'address', type: 'text', required: true, placeholder: 'Business Address' },
      { name: 'phone', type: 'text', required: true, placeholder: 'Phone Number' },
      { name: 'website', type: 'url', required: true, placeholder: 'Website URL' },
      { name: 'category', type: 'text', required: true, placeholder: 'Business Category' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },
  {
    name: 'Yelp',
    submissionUrl: 'https://www.yelp.com/',
    classification: 'Business Listing',
    category: 'Local SEO',
    country: 'Global',
    description: 'Add your business to Yelp for local SEO',
    domain: 'yelp.com',
    status: 'active',
    pageRank: 8,
    daScore: 85,
    isCustom: false,
    priority: 9,
    spamScore: 3,
    isPremium: false,
    requiresApproval: true,
    requiredFields: [
      { name: 'business_name', type: 'text', required: true, placeholder: 'Business Name' },
      { name: 'address', type: 'text', required: true, placeholder: 'Business Address' },
      { name: 'phone', type: 'text', required: true, placeholder: 'Phone Number' },
      { name: 'website', type: 'url', required: true, placeholder: 'Website URL' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },

  // Classified
  {
    name: 'Craigslist',
    submissionUrl: 'https://www.craigslist.org/',
    classification: 'Classified',
    category: 'Classified Ads',
    country: 'Global',
    description: 'Post classified ads on Craigslist',
    domain: 'craigslist.org',
    status: 'active',
    pageRank: 7,
    daScore: 80,
    isCustom: false,
    priority: 6,
    spamScore: 7,
    isPremium: false,
    requiresApproval: false,
    requiredFields: [
      { name: 'posting_title', type: 'text', required: true, placeholder: 'Posting Title' },
      { name: 'posting_body', type: 'textarea', required: true, placeholder: 'Posting Body' },
      { name: 'contact_email', type: 'email', required: true, placeholder: 'Contact Email' },
      { name: 'location', type: 'text', required: true, placeholder: 'Location' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },
  {
    name: 'Gumtree',
    submissionUrl: 'https://www.gumtree.com/',
    classification: 'Classified',
    category: 'Classified Ads',
    country: 'Global',
    description: 'Post classified ads on Gumtree',
    domain: 'gumtree.com',
    status: 'active',
    pageRank: 6,
    daScore: 75,
    isCustom: false,
    priority: 5,
    spamScore: 6,
    isPremium: false,
    requiresApproval: false,
    requiredFields: [
      { name: 'title', type: 'text', required: true, placeholder: 'Ad Title' },
      { name: 'description', type: 'textarea', required: true, placeholder: 'Ad Description' },
      { name: 'price', type: 'text', required: true, placeholder: 'Price' },
      { name: 'location', type: 'text', required: true, placeholder: 'Location' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },

  // Other SEO
  {
    name: 'Quora',
    submissionUrl: 'https://www.quora.com/',
    classification: 'More SEO',
    category: 'Q&A Platform',
    country: 'Global',
    description: 'Answer questions on Quora with your expertise',
    domain: 'quora.com',
    status: 'active',
    pageRank: 8,
    daScore: 85,
    isCustom: false,
    priority: 7,
    spamScore: 4,
    isPremium: false,
    requiresApproval: false,
    requiredFields: [
      { name: 'question', type: 'text', required: true, placeholder: 'Question to Answer' },
      { name: 'answer', type: 'textarea', required: true, placeholder: 'Your Answer' },
      { name: 'credentials', type: 'text', required: false, placeholder: 'Your Credentials' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  },
  {
    name: 'Medium',
    submissionUrl: 'https://medium.com/',
    classification: 'More SEO',
    category: 'Content Platform',
    country: 'Global',
    description: 'Publish articles on Medium for content marketing',
    domain: 'medium.com',
    status: 'active',
    pageRank: 7,
    daScore: 80,
    isCustom: false,
    priority: 6,
    spamScore: 3,
    isPremium: false,
    requiresApproval: false,
    requiredFields: [
      { name: 'title', type: 'text', required: true, placeholder: 'Article Title' },
      { name: 'content', type: 'textarea', required: true, placeholder: 'Article Content' },
      { name: 'tags', type: 'text', required: true, placeholder: 'Article Tags' }
    ],
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0
  }
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    // Clear existing links
    await Link.deleteMany({})
    console.log('Cleared existing links')
    
    // Insert sample links
    await Link.insertMany(sampleLinks)
    console.log(`Inserted ${sampleLinks.length} sample links`)
    
    return NextResponse.json({
      message: `Successfully seeded ${sampleLinks.length} links`,
      count: sampleLinks.length
    })
  } catch (error) {
    console.error('Error seeding links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
