import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import SeoToolConfig from '@/models/SeoToolConfig'

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { default: User } = await import('@/models/User')
    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const tools = await SeoToolConfig.find({}).sort({ order: 1 })
    
    if (tools.length === 0) {
      await SeoToolConfig.insertMany(defaultTools)
      const newTools = await SeoToolConfig.find({}).sort({ order: 1 })
      return NextResponse.json({ tools: newTools })
    }

    return NextResponse.json({ tools })
  } catch (error) {
    console.error('Error fetching SEO tools:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { default: User } = await import('@/models/User')
    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { toolId, updates } = await request.json()

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    const tool = await SeoToolConfig.findOneAndUpdate(
      { toolId },
      updates,
      { new: true }
    )

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    return NextResponse.json({ tool })
  } catch (error) {
    console.error('Error updating SEO tool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}