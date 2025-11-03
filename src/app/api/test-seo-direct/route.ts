import { NextRequest, NextResponse } from 'next/server'
import { 
  analyzeMetaTags, 
  analyzePageSpeed, 
  analyzeKeywordDensity, 
  analyzeBrokenLinks,
  analyzeMobileFriendly,
  analyzeKeywordResearch,
  analyzeSitemapRobots,
  analyzeBacklinks,
  analyzeKeywordTracking,
  analyzeCompetitors,
  analyzeTechnicalSEO,
  analyzeSchemaValidation,
  analyzeAltText,
  analyzeCanonical
} from '@/lib/seo-analysis'

export async function POST(request: NextRequest) {
  try {
    const { tool, url, keywords } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let result: any
    switch (tool) {
      case 'meta':
        result = await analyzeMetaTags(url)
        break
      case 'page-speed':
        result = await analyzePageSpeed(url)
        break
      case 'keyword-density':
        result = await analyzeKeywordDensity(url, keywords)
        break
      case 'broken-links':
        result = await analyzeBrokenLinks(url)
        break
      case 'mobile':
        result = await analyzeMobileFriendly(url)
        break
      case 'keyword-research':
        result = await analyzeKeywordResearch(url)
        break
      case 'sitemap-robots':
        result = await analyzeSitemapRobots(url)
        break
      case 'backlinks':
        result = await analyzeBacklinks(url)
        break
      case 'keyword-tracker':
        result = await analyzeKeywordTracking(url)
        break
      case 'competitors':
        result = await analyzeCompetitors(url)
        break
      case 'technical-seo':
        result = await analyzeTechnicalSEO(url)
        break
      case 'schema':
        result = await analyzeSchemaValidation(url)
        break
      case 'alt-text':
        result = await analyzeAltText(url)
        break
      case 'canonical':
        result = await analyzeCanonical(url)
        break
      default:
        return NextResponse.json({ error: 'Invalid SEO tool specified' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error(`Error in direct SEO tool test for ${tool}:`, error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

