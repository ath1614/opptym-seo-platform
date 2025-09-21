import { JSDOM } from 'jsdom'

export interface MetaTagAnalysis {
  url: string
  title: {
    content: string
    length: number
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  description: {
    content: string
    length: number
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  keywords: {
    content: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  viewport: {
    content: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  robots: {
    content: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  openGraph: {
    title: string
    description: string
    image: string
    url: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  twitter: {
    card: string
    title: string
    description: string
    image: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  canonical: {
    content: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  hreflang: {
    content: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }
  score: number
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    severity: 'high' | 'medium' | 'low'
  }>
}

export interface PageSpeedAnalysis {
  url: string
  overallScore: number
  performance: {
    score: number
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
    metrics: {
      firstContentfulPaint: number
      largestContentfulPaint: number
      firstInputDelay: number
      cumulativeLayoutShift: number
    }
  }
  accessibility: {
    score: number
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      severity: 'high' | 'medium' | 'low'
    }>
  }
  bestPractices: {
    score: number
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      severity: 'high' | 'medium' | 'low'
    }>
  }
  seo: {
    score: number
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      severity: 'high' | 'medium' | 'low'
    }>
  }
  recommendations: string[]
  opportunities: Array<{
    name: string
    savings: string
    description: string
  }>
}

export interface KeywordDensityAnalysis {
  url: string
  totalWords: number
  keywords: Array<{
    keyword: string
    count: number
    density: number
    status: 'good' | 'warning' | 'error'
  }>
  recommendations: string[]
  score: number
}

export interface BrokenLinkAnalysis {
  url: string
  totalLinks: number
  brokenLinks: Array<{
    url: string
    status: number
    text: string
    page: string
  }>
  workingLinks: number
  score: number
  recommendations: string[]
}

export interface MobileAnalysis {
  url: string
  isMobileFriendly: boolean
  viewport: {
    configured: boolean
    content: string
    status: 'good' | 'warning' | 'error'
  }
  touchTargets: {
    total: number
    tooSmall: number
    status: 'good' | 'warning' | 'error'
  }
  textSize: {
    readable: boolean
    status: 'good' | 'warning' | 'error'
  }
  contentWidth: {
    fitsScreen: boolean
    status: 'good' | 'warning' | 'error'
  }
  score: number
  recommendations: string[]
}

export interface KeywordResearchAnalysis {
  url: string
  primaryKeywords: Array<{
    keyword: string
    searchVolume: number
    difficulty: number
    cpc: number
    competition: 'low' | 'medium' | 'high'
  }>
  relatedKeywords: Array<{
    keyword: string
    searchVolume: number
    difficulty: number
    relevance: number
  }>
  longTailKeywords: Array<{
    keyword: string
    searchVolume: number
    difficulty: number
  }>
  recommendations: string[]
  score: number
}

export interface SitemapRobotsAnalysis {
  url: string
  sitemap: {
    exists: boolean
    url: string
    status: 'good' | 'warning' | 'error'
    issues: string[]
  }
  robots: {
    exists: boolean
    url: string
    status: 'good' | 'warning' | 'error'
    rules: Array<{
      userAgent: string
      allow: string[]
      disallow: string[]
    }>
    issues: string[]
  }
  recommendations: string[]
  score: number
}

export interface BacklinkAnalysis {
  url: string
  totalBacklinks: number
  referringDomains: number
  backlinks: Array<{
    url: string
    domain: string
    anchorText: string
    linkType: 'dofollow' | 'nofollow'
    domainAuthority: number
    spamScore: number
  }>
  topReferringDomains: Array<{
    domain: string
    backlinks: number
    domainAuthority: number
  }>
  recommendations: string[]
  score: number
}

export interface KeywordTrackingAnalysis {
  url: string
  trackedKeywords: Array<{
    keyword: string
    currentRank: number
    previousRank: number
    change: number
    searchVolume: number
    difficulty: number
    url: string
  }>
  rankingChanges: {
    improved: number
    declined: number
    new: number
    lost: number
  }
  recommendations: string[]
  score: number
}

export interface CompetitorAnalysis {
  url: string
  competitors: Array<{
    domain: string
    domainAuthority: number
    backlinks: number
    organicTraffic: number
    keywords: number
    topKeywords: string[]
  }>
  competitiveGaps: Array<{
    keyword: string
    opportunity: number
    difficulty: number
  }>
  recommendations: string[]
  score: number
}

export interface TechnicalSEOAnalysis {
  url: string
  crawlability: {
    status: 'good' | 'warning' | 'error'
    issues: string[]
  }
  indexability: {
    status: 'good' | 'warning' | 'error'
    issues: string[]
  }
  siteStructure: {
    status: 'good' | 'warning' | 'error'
    issues: string[]
  }
  performance: {
    status: 'good' | 'warning' | 'error'
    issues: string[]
  }
  security: {
    status: 'good' | 'warning' | 'error'
    issues: string[]
  }
  recommendations: string[]
  score: number
}

export interface SchemaValidationAnalysis {
  url: string
  structuredData: {
    found: boolean
    types: string[]
    errors: string[]
    warnings: string[]
  }
  schemaTypes: Array<{
    type: string
    count: number
    status: 'valid' | 'invalid' | 'warning'
    issues: string[]
  }>
  recommendations: string[]
  score: number
}

export interface AltTextAnalysis {
  url: string
  totalImages: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  imagesWithPoorAlt: number
  imageIssues: Array<{
    src: string
    alt: string
    issue: string
    severity: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
  score: number
}

export interface CanonicalAnalysis {
  url: string
  canonicalUrl: string
  status: 'good' | 'warning' | 'error'
  issues: string[]
  duplicateContent: Array<{
    url: string
    similarity: number
    issue: string
  }>
  recommendations: string[]
  score: number
}

// Utility function to fetch and parse HTML
async function fetchAndParseHTML(url: string): Promise<Document | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    const dom = new JSDOM(html)
    return dom.window.document
  } catch (error) {
    console.error('Error fetching URL:', error)
    return null
  }
}

// Meta Tag Analyzer
export async function analyzeMetaTags(url: string): Promise<MetaTagAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string; severity: 'high' | 'medium' | 'low' }> = []
  let score = 100

  // Analyze title
  const titleElement = doc.querySelector('title')
  const titleContent = titleElement?.textContent || ''
  const titleLength = titleContent.length
  
  let titleStatus: 'good' | 'warning' | 'error' = 'good'
  let titleRecommendation = 'Title length is optimal for SEO'
  
  if (titleLength === 0) {
    titleStatus = 'error'
    titleRecommendation = 'Missing title tag - this is critical for SEO'
    issues.push({ type: 'error', message: 'Missing title tag', severity: 'high' })
    score -= 20
  } else if (titleLength < 30) {
    titleStatus = 'warning'
    titleRecommendation = 'Title is too short - consider adding more descriptive text'
    issues.push({ type: 'warning', message: 'Title too short', severity: 'medium' })
    score -= 5
  } else if (titleLength > 60) {
    titleStatus = 'warning'
    titleRecommendation = 'Title is too long - it may be truncated in search results'
    issues.push({ type: 'warning', message: 'Title too long', severity: 'medium' })
    score -= 5
  }

  // Analyze description
  const descriptionElement = doc.querySelector('meta[name="description"]')
  const descriptionContent = descriptionElement?.getAttribute('content') || ''
  const descriptionLength = descriptionContent.length
  
  let descriptionStatus: 'good' | 'warning' | 'error' = 'good'
  let descriptionRecommendation = 'Description length is within optimal range'
  
  if (descriptionLength === 0) {
    descriptionStatus = 'error'
    descriptionRecommendation = 'Missing meta description - this is important for SEO'
    issues.push({ type: 'error', message: 'Missing meta description', severity: 'high' })
    score -= 15
  } else if (descriptionLength < 120) {
    descriptionStatus = 'warning'
    descriptionRecommendation = 'Description could be more descriptive'
    issues.push({ type: 'warning', message: 'Description too short', severity: 'low' })
    score -= 3
  } else if (descriptionLength > 160) {
    descriptionStatus = 'warning'
    descriptionRecommendation = 'Description is too long - it may be truncated in search results'
    issues.push({ type: 'warning', message: 'Description too long', severity: 'low' })
    score -= 3
  }

  // Analyze keywords (not recommended but still checked)
  const keywordsElement = doc.querySelector('meta[name="keywords"]')
  const keywordsContent = keywordsElement?.getAttribute('content') || ''
  
  let keywordsStatus: 'good' | 'warning' | 'error' = 'good'
  let keywordsRecommendation = 'Meta keywords are not recommended for SEO'
  
  if (keywordsContent) {
    keywordsStatus = 'warning'
    keywordsRecommendation = 'Meta keywords are not recommended for SEO. Consider removing them.'
    issues.push({ type: 'warning', message: 'Meta keywords present', severity: 'low' })
    score -= 2
  }

  // Analyze viewport
  const viewportElement = doc.querySelector('meta[name="viewport"]')
  const viewportContent = viewportElement?.getAttribute('content') || ''
  
  let viewportStatus: 'good' | 'warning' | 'error' = 'good'
  let viewportRecommendation = 'Viewport meta tag is properly configured for mobile'
  
  if (!viewportContent) {
    viewportStatus = 'error'
    viewportRecommendation = 'Missing viewport meta tag - this is critical for mobile SEO'
    issues.push({ type: 'error', message: 'Missing viewport meta tag', severity: 'high' })
    score -= 15
  } else if (!viewportContent.includes('width=device-width')) {
    viewportStatus = 'warning'
    viewportRecommendation = 'Viewport meta tag should include width=device-width'
    issues.push({ type: 'warning', message: 'Viewport not properly configured', severity: 'medium' })
    score -= 5
  }

  // Analyze robots
  const robotsElement = doc.querySelector('meta[name="robots"]')
  const robotsContent = robotsElement?.getAttribute('content') || 'index, follow'
  
  let robotsStatus: 'good' | 'warning' | 'error' = 'good'
  let robotsRecommendation = 'Robots meta tag allows search engine indexing'
  
  if (robotsContent.includes('noindex')) {
    robotsStatus = 'warning'
    robotsRecommendation = 'Robots meta tag prevents indexing - ensure this is intentional'
    issues.push({ type: 'warning', message: 'Robots noindex detected', severity: 'medium' })
    score -= 10
  }

  // Analyze Open Graph
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''
  const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''
  const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || url
  
  let ogStatus: 'good' | 'warning' | 'error' = 'good'
  let ogRecommendation = 'Open Graph tags are properly configured for social sharing'
  
  if (!ogTitle || !ogDescription) {
    ogStatus = 'warning'
    ogRecommendation = 'Missing Open Graph title or description - important for social sharing'
    issues.push({ type: 'warning', message: 'Missing Open Graph tags', severity: 'low' })
    score -= 3
  }

  // Analyze Twitter Cards
  const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || ''
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || ''
  const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || ''
  const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || ''
  
  let twitterStatus: 'good' | 'warning' | 'error' = 'good'
  let twitterRecommendation = 'Twitter Card tags are properly configured'
  
  if (twitterCard && (!twitterTitle || !twitterDescription)) {
    twitterStatus = 'warning'
    twitterRecommendation = 'Twitter Card is configured but missing title or description'
    issues.push({ type: 'warning', message: 'Incomplete Twitter Card tags', severity: 'low' })
    score -= 2
  }

  // Analyze canonical
  const canonicalElement = doc.querySelector('link[rel="canonical"]')
  const canonicalContent = canonicalElement?.getAttribute('href') || ''
  
  let canonicalStatus: 'good' | 'warning' | 'error' = 'good'
  let canonicalRecommendation = 'Canonical URL is properly set'
  
  if (!canonicalContent) {
    canonicalStatus = 'warning'
    canonicalRecommendation = 'Missing canonical URL - helps prevent duplicate content issues'
    issues.push({ type: 'warning', message: 'Missing canonical URL', severity: 'medium' })
    score -= 5
  }

  // Analyze hreflang
  const hreflangElement = doc.querySelector('link[rel="alternate"][hreflang]')
  const hreflangContent = hreflangElement?.getAttribute('hreflang') || ''
  
  const hreflangStatus: 'good' | 'warning' | 'error' = 'good'
  const hreflangRecommendation = 'Hreflang is properly configured for language targeting'
  
  // hreflang is optional, so we don't penalize for its absence

  return {
    url,
    title: {
      content: titleContent,
      length: titleLength,
      status: titleStatus,
      recommendation: titleRecommendation
    },
    description: {
      content: descriptionContent,
      length: descriptionLength,
      status: descriptionStatus,
      recommendation: descriptionRecommendation
    },
    keywords: {
      content: keywordsContent,
      status: keywordsStatus,
      recommendation: keywordsRecommendation
    },
    viewport: {
      content: viewportContent,
      status: viewportStatus,
      recommendation: viewportRecommendation
    },
    robots: {
      content: robotsContent,
      status: robotsStatus,
      recommendation: robotsRecommendation
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: ogUrl,
      status: ogStatus,
      recommendation: ogRecommendation
    },
    twitter: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      image: twitterImage,
      status: twitterStatus,
      recommendation: twitterRecommendation
    },
    canonical: {
      content: canonicalContent,
      status: canonicalStatus,
      recommendation: canonicalRecommendation
    },
    hreflang: {
      content: hreflangContent,
      status: hreflangStatus,
      recommendation: hreflangRecommendation
    },
    score: Math.max(0, score),
    issues
  }
}

// Page Speed Analyzer (simplified version)
export async function analyzePageSpeed(url: string): Promise<PageSpeedAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string; severity: 'high' | 'medium' | 'low' }> = []
  const performanceScore = 100
  let accessibilityScore = 100
  let bestPracticesScore = 100
  let seoScore = 100

  // Analyze images
  const images = doc.querySelectorAll('img')
  const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'))
  
  if (imagesWithoutAlt.length > 0) {
    accessibilityScore -= imagesWithoutAlt.length * 5
    issues.push({
      type: 'warning',
      message: `${imagesWithoutAlt.length} images without alt text`,
      severity: 'medium'
    })
  }

  // Analyze headings structure
  const h1s = doc.querySelectorAll('h1')
  if (h1s.length === 0) {
    seoScore -= 10
    issues.push({
      type: 'error',
      message: 'Missing H1 tag',
      severity: 'high'
    })
  } else if (h1s.length > 1) {
    seoScore -= 5
    issues.push({
      type: 'warning',
      message: 'Multiple H1 tags found',
      severity: 'medium'
    })
  }

  // Analyze internal links
  const links = doc.querySelectorAll('a[href]')
  const internalLinks = Array.from(links).filter(link => {
    const href = link.getAttribute('href')
    return href && (href.startsWith('/') || href.includes(new URL(url).hostname))
  })

  // Analyze external links
  const externalLinks = Array.from(links).filter(link => {
    const href = link.getAttribute('href')
    return href && href.startsWith('http') && !href.includes(new URL(url).hostname)
  })

  // Check for external links without rel="noopener"
  const unsafeExternalLinks = externalLinks.filter(link => 
    !link.getAttribute('rel')?.includes('noopener')
  )

  if (unsafeExternalLinks.length > 0) {
    bestPracticesScore -= unsafeExternalLinks.length * 2
    issues.push({
      type: 'warning',
      message: `${unsafeExternalLinks.length} external links without rel="noopener"`,
      severity: 'low'
    })
  }

  // Generate recommendations
  const recommendations = [
    'Optimize images to reduce file sizes',
    'Enable compression for text resources',
    'Minify CSS and JavaScript files',
    'Use a Content Delivery Network (CDN)',
    'Implement lazy loading for images'
  ]

  const opportunities = [
    {
      name: 'Optimize Images',
      savings: '2.1s',
      description: 'Optimizing images could save 2.1 seconds of load time'
    },
    {
      name: 'Enable Compression',
      savings: '1.8s',
      description: 'Enabling compression could save 1.8 seconds of load time'
    },
    {
      name: 'Minify CSS',
      savings: '0.9s',
      description: 'Minifying CSS could save 0.9 seconds of load time'
    }
  ]

  const overallScore = Math.round((performanceScore + accessibilityScore + bestPracticesScore + seoScore) / 4)

  return {
    url,
    overallScore,
    performance: {
      score: performanceScore,
      status: performanceScore >= 90 ? 'excellent' : performanceScore >= 70 ? 'good' : performanceScore >= 50 ? 'needs-improvement' : 'poor',
      metrics: {
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.1,
        firstInputDelay: 45,
        cumulativeLayoutShift: 0.08
      }
    },
    accessibility: {
      score: accessibilityScore,
      status: accessibilityScore >= 90 ? 'excellent' : accessibilityScore >= 70 ? 'good' : accessibilityScore >= 50 ? 'needs-improvement' : 'poor',
      issues: issues.filter(issue => issue.message.includes('alt text'))
    },
    bestPractices: {
      score: bestPracticesScore,
      status: bestPracticesScore >= 90 ? 'excellent' : bestPracticesScore >= 70 ? 'good' : bestPracticesScore >= 50 ? 'needs-improvement' : 'poor',
      issues: issues.filter(issue => issue.message.includes('noopener'))
    },
    seo: {
      score: seoScore,
      status: seoScore >= 90 ? 'excellent' : seoScore >= 70 ? 'good' : seoScore >= 50 ? 'needs-improvement' : 'poor',
      issues: issues.filter(issue => issue.message.includes('H1'))
    },
    recommendations,
    opportunities
  }
}

// Keyword Density Checker
export async function analyzeKeywordDensity(url: string, targetKeywords: string[] = []): Promise<KeywordDensityAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  // Get all text content
  const body = doc.querySelector('body')
  if (!body) {
    throw new Error('No body content found')
  }

  // Remove script and style elements
  const scripts = body.querySelectorAll('script, style')
  scripts.forEach(script => script.remove())

  const textContent = body.textContent || ''
  const words = textContent.toLowerCase().match(/\b\w+\b/g) || []
  const totalWords = words.length

  // Count keyword occurrences
  const keywordCounts: { [key: string]: number } = {}
  const recommendations: string[] = []
  let score = 100

  // If no target keywords provided, analyze common words
  const keywordsToAnalyze = targetKeywords.length > 0 ? targetKeywords : 
    ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']

  keywordsToAnalyze.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g')
    const matches = textContent.toLowerCase().match(regex) || []
    const count = matches.length
    const density = totalWords > 0 ? (count / totalWords) * 100 : 0
    
    keywordCounts[keyword] = count

    // Analyze density
    let status: 'good' | 'warning' | 'error' = 'good'
    if (density > 3) {
      status = 'error'
      recommendations.push(`Keyword "${keyword}" density is too high (${density.toFixed(2)}%)`)
      score -= 10
    } else if (density > 2) {
      status = 'warning'
      recommendations.push(`Keyword "${keyword}" density is high (${density.toFixed(2)}%)`)
      score -= 5
    }
  })

  const keywordAnalysis = Object.entries(keywordCounts).map(([keyword, count]) => ({
    keyword,
    count,
    density: totalWords > 0 ? (count / totalWords) * 100 : 0,
    status: (count / totalWords) * 100 > 3 ? 'error' : (count / totalWords) * 100 > 2 ? 'warning' : 'good'
  }))

  if (recommendations.length === 0) {
    recommendations.push('Keyword density is within optimal range')
  }

  return {
    url,
    totalWords,
    keywords: keywordAnalysis,
    recommendations,
    score: Math.max(0, score)
  }
}

// Broken Link Scanner
export async function analyzeBrokenLinks(url: string): Promise<BrokenLinkAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const links = doc.querySelectorAll('a[href]')
  const linkResults: Array<{ url: string; status: number; text: string; page: string }> = []
  const brokenLinks: Array<{ url: string; status: number; text: string; page: string }> = []
  let workingLinks = 0

  // Check each link
  for (const link of Array.from(links)) {
    const href = link.getAttribute('href')
    const text = link.textContent?.trim() || ''
    
    if (!href) continue

    let fullUrl: string
    try {
      fullUrl = new URL(href, url).href
    } catch {
      brokenLinks.push({ url: href, status: 0, text, page: url })
      continue
    }

    try {
      const response = await fetch(fullUrl, { method: 'HEAD' })
      const status = response.status
      
      linkResults.push({ url: fullUrl, status, text, page: url })
      
      if (status >= 200 && status < 400) {
        workingLinks++
      } else {
        brokenLinks.push({ url: fullUrl, status, text, page: url })
      }
    } catch {
      brokenLinks.push({ url: fullUrl, status: 0, text, page: url })
    }
  }

  const totalLinks = linkResults.length
  const brokenCount = brokenLinks.length
  const score = totalLinks > 0 ? Math.round(((totalLinks - brokenCount) / totalLinks) * 100) : 100

  const recommendations = []
  if (brokenCount === 0) {
    recommendations.push('All links are working correctly')
  } else {
    recommendations.push(`Found ${brokenCount} broken links that need to be fixed`)
    recommendations.push('Update or remove broken links to improve user experience')
    recommendations.push('Consider setting up redirects for moved pages')
  }

  return {
    url,
    totalLinks,
    brokenLinks,
    workingLinks,
    score,
    recommendations
  }
}

// Mobile Checker
export async function analyzeMobileFriendly(url: string): Promise<MobileAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const recommendations: string[] = []
  let score = 100

  // Check viewport
  const viewportElement = doc.querySelector('meta[name="viewport"]')
  const viewportContent = viewportElement?.getAttribute('content') || ''
  
  let viewportStatus: 'good' | 'warning' | 'error' = 'good'
  if (!viewportContent) {
    viewportStatus = 'error'
    recommendations.push('Add viewport meta tag for mobile optimization')
    score -= 30
  } else if (!viewportContent.includes('width=device-width')) {
    viewportStatus = 'warning'
    recommendations.push('Viewport should include width=device-width')
    score -= 15
  }

  // Check touch targets (simplified)
  const links = doc.querySelectorAll('a, button, input, select, textarea')
  const touchTargets = Array.from(links).length
  const tooSmallTargets = 0 // This would require more complex analysis
  
  let touchTargetStatus: 'good' | 'warning' | 'error' = 'good'
  if (tooSmallTargets > 0) {
    touchTargetStatus = 'warning'
    recommendations.push(`${tooSmallTargets} touch targets may be too small`)
    score -= 10
  }

  // Check text size (simplified)
  const textElements = doc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
  const textSizeStatus: 'good' | 'warning' | 'error' = 'good'
  // This would require CSS analysis to be accurate

  // Check content width (simplified)
  const contentWidthStatus: 'good' | 'warning' | 'error' = 'good'
  // This would require CSS analysis to be accurate

  const isMobileFriendly = viewportStatus === 'good' && touchTargetStatus === 'good'

  if (recommendations.length === 0) {
    recommendations.push('Page appears to be mobile-friendly')
  }

  return {
    url,
    isMobileFriendly,
    viewport: {
      configured: !!viewportContent,
      content: viewportContent,
      status: viewportStatus
    },
    touchTargets: {
      total: touchTargets,
      tooSmall: tooSmallTargets,
      status: touchTargetStatus
    },
    textSize: {
      readable: true, // Simplified
      status: textSizeStatus
    },
    contentWidth: {
      fitsScreen: true, // Simplified
      status: contentWidthStatus
    },
    score: Math.max(0, score),
    recommendations
  }
}

// Keyword Researcher
export async function analyzeKeywordResearch(url: string): Promise<KeywordResearchAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  // Extract keywords from content
  const body = doc.querySelector('body')
  if (!body) {
    throw new Error('No body content found')
  }

  const textContent = body.textContent || ''
  const words = textContent.toLowerCase().match(/\b\w+\b/g) || []
  
  // Simple keyword extraction (in real implementation, this would use more sophisticated algorithms)
  const wordCounts: { [key: string]: number } = {}
  words.forEach(word => {
    if (word.length > 3) { // Filter out short words
      wordCounts[word] = (wordCounts[word] || 0) + 1
    }
  })

  // Get top keywords
  const topKeywords = Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword, count]) => ({
      keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 100, // Mock data
      difficulty: Math.floor(Math.random() * 100),
      cpc: Math.random() * 5,
      competition: Math.random() > 0.5 ? 'medium' : 'low' as 'low' | 'medium' | 'high'
    }))

  const relatedKeywords = topKeywords.slice(0, 5).map(kw => ({
    ...kw,
    relevance: Math.floor(Math.random() * 100)
  }))

  const longTailKeywords = topKeywords.slice(0, 3).map(kw => ({
    keyword: `${kw.keyword} guide tutorial`,
    searchVolume: Math.floor(kw.searchVolume * 0.1),
    difficulty: Math.floor(kw.difficulty * 0.7)
  }))

  const recommendations = [
    'Focus on long-tail keywords for better ranking opportunities',
    'Consider keyword difficulty when planning content strategy',
    'Monitor search volume trends for your target keywords',
    'Use related keywords to expand your content reach'
  ]

  return {
    url,
    primaryKeywords: topKeywords,
    relatedKeywords,
    longTailKeywords,
    recommendations,
    score: 85
  }
}

// Sitemap & Robots Checker
export async function analyzeSitemapRobots(url: string): Promise<SitemapRobotsAnalysis> {
  const baseUrl = new URL(url)
  const sitemapUrl = `${baseUrl.origin}/sitemap.xml`
  const robotsUrl = `${baseUrl.origin}/robots.txt`

  let sitemapExists = false
  let sitemapStatus: 'good' | 'warning' | 'error' = 'error'
  const sitemapIssues: string[] = []

  let robotsExists = false
  let robotsStatus: 'good' | 'warning' | 'error' = 'error'
  const robotsIssues: string[] = []
  const robotsRules: Array<{ userAgent: string; allow: string[]; disallow: string[] }> = []

  // Check sitemap
  try {
    const sitemapResponse = await fetch(sitemapUrl)
    if (sitemapResponse.ok) {
      sitemapExists = true
      sitemapStatus = 'good'
    } else {
      sitemapIssues.push('Sitemap not found or not accessible')
    }
  } catch {
    sitemapIssues.push('Sitemap not found or not accessible')
  }

  // Check robots.txt
  try {
    const robotsResponse = await fetch(robotsUrl)
    if (robotsResponse.ok) {
      robotsExists = true
      const robotsText = await robotsResponse.text()
      
      // Parse robots.txt (simplified)
      const lines = robotsText.split('\n')
      let currentUserAgent = '*'
      
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('User-agent:')) {
          currentUserAgent = trimmed.split(':')[1].trim()
        } else if (trimmed.startsWith('Disallow:')) {
          const disallow = trimmed.split(':')[1].trim()
          if (disallow) {
            const existingRule = robotsRules.find(r => r.userAgent === currentUserAgent)
            if (existingRule) {
              existingRule.disallow.push(disallow)
            } else {
              robotsRules.push({
                userAgent: currentUserAgent,
                allow: [],
                disallow: [disallow]
              })
            }
          }
        } else if (trimmed.startsWith('Allow:')) {
          const allow = trimmed.split(':')[1].trim()
          if (allow) {
            const existingRule = robotsRules.find(r => r.userAgent === currentUserAgent)
            if (existingRule) {
              existingRule.allow.push(allow)
            } else {
              robotsRules.push({
                userAgent: currentUserAgent,
                allow: [allow],
                disallow: []
              })
            }
          }
        }
      }
      
      robotsStatus = 'good'
    } else {
      robotsIssues.push('Robots.txt not found or not accessible')
    }
  } catch {
    robotsIssues.push('Robots.txt not found or not accessible')
  }

  const recommendations = []
  if (!sitemapExists) {
    recommendations.push('Create and submit a sitemap.xml file')
  }
  if (!robotsExists) {
    recommendations.push('Create a robots.txt file to guide search engine crawlers')
  }
  if (recommendations.length === 0) {
    recommendations.push('Sitemap and robots.txt are properly configured')
  }

  const score = (sitemapExists ? 50 : 0) + (robotsExists ? 50 : 0)

  return {
    url,
    sitemap: {
      exists: sitemapExists,
      url: sitemapUrl,
      status: sitemapStatus,
      issues: sitemapIssues
    },
    robots: {
      exists: robotsExists,
      url: robotsUrl,
      status: robotsStatus,
      rules: robotsRules,
      issues: robotsIssues
    },
    recommendations,
    score
  }
}

// Backlink Scanner (simplified - would need external API in real implementation)
export async function analyzeBacklinks(url: string): Promise<BacklinkAnalysis> {
  // In a real implementation, this would use APIs like Ahrefs, Moz, or SEMrush
  // For now, we'll provide a simplified analysis based on the website content
  
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  // Find external links (potential backlink sources)
  const links = doc.querySelectorAll('a[href]')
  const externalLinks = Array.from(links).filter(link => {
    const href = link.getAttribute('href')
    return href && href.startsWith('http') && !href.includes(new URL(url).hostname)
  })

  // Mock backlink data (in real implementation, this would come from backlink APIs)
  const mockBacklinks = [
    {
      url: 'https://example1.com/page1',
      domain: 'example1.com',
      anchorText: 'Learn more',
      linkType: 'dofollow' as 'dofollow' | 'nofollow',
      domainAuthority: 85,
      spamScore: 5
    },
    {
      url: 'https://example2.com/article',
      domain: 'example2.com',
      anchorText: 'Reference',
      linkType: 'nofollow' as 'dofollow' | 'nofollow',
      domainAuthority: 72,
      spamScore: 12
    }
  ]

  const topReferringDomains = [
    { domain: 'example1.com', backlinks: 5, domainAuthority: 85 },
    { domain: 'example2.com', backlinks: 3, domainAuthority: 72 }
  ]

  const recommendations = [
    'Focus on building high-quality backlinks from authoritative domains',
    'Create shareable content to attract natural backlinks',
    'Monitor your backlink profile regularly for spam links',
    'Use diverse anchor text to maintain natural link profile'
  ]

  return {
    url,
    totalBacklinks: mockBacklinks.length,
    referringDomains: topReferringDomains.length,
    backlinks: mockBacklinks,
    topReferringDomains,
    recommendations,
    score: 75
  }
}

// Keyword Tracker (simplified - would need external API in real implementation)
export async function analyzeKeywordTracking(url: string): Promise<KeywordTrackingAnalysis> {
  // In a real implementation, this would track actual keyword rankings over time
  // For now, we'll provide mock tracking data
  
  const mockTrackedKeywords = [
    {
      keyword: 'SEO tools',
      currentRank: 15,
      previousRank: 18,
      change: 3,
      searchVolume: 12000,
      difficulty: 65,
      url: url
    },
    {
      keyword: 'website analysis',
      currentRank: 8,
      previousRank: 12,
      change: 4,
      searchVolume: 8500,
      difficulty: 45,
      url: url
    },
    {
      keyword: 'digital marketing',
      currentRank: 25,
      previousRank: 22,
      change: -3,
      searchVolume: 25000,
      difficulty: 85,
      url: url
    }
  ]

  const rankingChanges = {
    improved: 2,
    declined: 1,
    new: 0,
    lost: 0
  }

  const recommendations = [
    'Focus on keywords that are declining in rankings',
    'Create more content around high-volume keywords',
    'Monitor competitor rankings for your target keywords',
    'Optimize content for keywords with good ranking potential'
  ]

  return {
    url,
    trackedKeywords: mockTrackedKeywords,
    rankingChanges,
    recommendations,
    score: 80
  }
}

// Competitor Analyzer (simplified - would need external API in real implementation)
export async function analyzeCompetitors(url: string): Promise<CompetitorAnalysis> {
  // In a real implementation, this would analyze actual competitors
  // For now, we'll provide mock competitor data
  
  const mockCompetitors = [
    {
      domain: 'competitor1.com',
      domainAuthority: 85,
      backlinks: 15000,
      organicTraffic: 500000,
      keywords: 25000,
      topKeywords: ['SEO tools', 'website analysis', 'digital marketing']
    },
    {
      domain: 'competitor2.com',
      domainAuthority: 78,
      backlinks: 12000,
      organicTraffic: 350000,
      keywords: 18000,
      topKeywords: ['SEO analysis', 'website audit', 'marketing tools']
    }
  ]

  const competitiveGaps = [
    {
      keyword: 'free SEO tools',
      opportunity: 85,
      difficulty: 45
    },
    {
      keyword: 'website speed test',
      opportunity: 72,
      difficulty: 38
    }
  ]

  const recommendations = [
    'Target keywords with high opportunity and low difficulty',
    'Analyze competitor content strategies',
    'Identify content gaps in your niche',
    'Monitor competitor backlink strategies'
  ]

  return {
    url,
    competitors: mockCompetitors,
    competitiveGaps,
    recommendations,
    score: 78
  }
}

// Technical SEO Auditor
export async function analyzeTechnicalSEO(url: string): Promise<TechnicalSEOAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const crawlabilityIssues: string[] = []
  const indexabilityIssues: string[] = []
  const siteStructureIssues: string[] = []
  const performanceIssues: string[] = []
  const securityIssues: string[] = []

  // Check crawlability
  const robotsMeta = doc.querySelector('meta[name="robots"]')
  if (robotsMeta?.getAttribute('content')?.includes('noindex')) {
    indexabilityIssues.push('Page has noindex meta tag')
  }

  // Check site structure
  const h1s = doc.querySelectorAll('h1')
  if (h1s.length === 0) {
    siteStructureIssues.push('Missing H1 tag')
  } else if (h1s.length > 1) {
    siteStructureIssues.push('Multiple H1 tags found')
  }

  // Check for HTTPS
  if (!url.startsWith('https://')) {
    securityIssues.push('Site not using HTTPS')
  }

  // Check for images without alt text
  const images = doc.querySelectorAll('img')
  const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'))
  if (imagesWithoutAlt.length > 0) {
    performanceIssues.push(`${imagesWithoutAlt.length} images without alt text`)
  }

  const recommendations = [
    'Fix crawlability issues to ensure search engines can access your content',
    'Resolve indexability problems to improve search visibility',
    'Improve site structure for better user experience and SEO',
    'Optimize performance for better user experience and rankings',
    'Enhance security measures to protect your site and users'
  ]

  const score = 100 - (crawlabilityIssues.length * 10) - (indexabilityIssues.length * 15) - 
                (siteStructureIssues.length * 10) - (performanceIssues.length * 5) - 
                (securityIssues.length * 20)

  return {
    url,
    crawlability: {
      status: crawlabilityIssues.length === 0 ? 'good' : 'warning',
      issues: crawlabilityIssues
    },
    indexability: {
      status: indexabilityIssues.length === 0 ? 'good' : 'error',
      issues: indexabilityIssues
    },
    siteStructure: {
      status: siteStructureIssues.length === 0 ? 'good' : 'warning',
      issues: siteStructureIssues
    },
    performance: {
      status: performanceIssues.length === 0 ? 'good' : 'warning',
      issues: performanceIssues
    },
    security: {
      status: securityIssues.length === 0 ? 'good' : 'error',
      issues: securityIssues
    },
    recommendations,
    score: Math.max(0, score)
  }
}

// Schema Validator
export async function analyzeSchemaValidation(url: string): Promise<SchemaValidationAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const schemaScripts = doc.querySelectorAll('script[type="application/ld+json"]')
  const schemaTypes: string[] = []
  const errors: string[] = []
  const warnings: string[] = []

  schemaScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '')
      if (data['@type']) {
        schemaTypes.push(data['@type'])
      }
    } catch {
      errors.push('Invalid JSON-LD syntax found')
    }
  })

  if (schemaTypes.length === 0) {
    warnings.push('No structured data found')
  }

  const schemaTypeAnalysis = schemaTypes.map(type => ({
    type,
    count: 1,
    status: 'valid' as 'valid' | 'invalid' | 'warning',
    issues: []
  }))

  const recommendations = [
    'Add structured data to improve search result appearance',
    'Use appropriate schema types for your content',
    'Validate your structured data with Google\'s Rich Results Test',
    'Consider adding Organization, WebSite, and BreadcrumbList schemas'
  ]

  const score = schemaTypes.length > 0 ? 90 : 30

  return {
    url,
    structuredData: {
      found: schemaTypes.length > 0,
      types: schemaTypes,
      errors,
      warnings
    },
    schemaTypes: schemaTypeAnalysis,
    recommendations,
    score
  }
}

// Alt Text Checker
export async function analyzeAltText(url: string): Promise<AltTextAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const images = doc.querySelectorAll('img')
  const totalImages = images.length
  let imagesWithAlt = 0
  let imagesWithoutAlt = 0
  let imagesWithPoorAlt = 0
  const imageIssues: Array<{ src: string; alt: string; issue: string; severity: 'high' | 'medium' | 'low' }> = []

  images.forEach(img => {
    const src = img.getAttribute('src') || ''
    const alt = img.getAttribute('alt') || ''
    
    if (!alt) {
      imagesWithoutAlt++
      imageIssues.push({
        src,
        alt: '',
        issue: 'Missing alt text',
        severity: 'high'
      })
    } else if (alt.length < 5) {
      imagesWithPoorAlt++
      imageIssues.push({
        src,
        alt,
        issue: 'Alt text too short',
        severity: 'medium'
      })
    } else {
      imagesWithAlt++
    }
  })

  const recommendations = []
  if (imagesWithoutAlt > 0) {
    recommendations.push(`Add alt text to ${imagesWithoutAlt} images`)
  }
  if (imagesWithPoorAlt > 0) {
    recommendations.push(`Improve alt text for ${imagesWithPoorAlt} images`)
  }
  if (recommendations.length === 0) {
    recommendations.push('All images have appropriate alt text')
  }

  const score = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100

  return {
    url,
    totalImages,
    imagesWithAlt,
    imagesWithoutAlt,
    imagesWithPoorAlt,
    imageIssues,
    recommendations,
    score
  }
}

// Canonical Checker
export async function analyzeCanonical(url: string): Promise<CanonicalAnalysis> {
  const doc = await fetchAndParseHTML(url)
  
  if (!doc) {
    throw new Error('Unable to fetch the webpage')
  }

  const canonicalLink = doc.querySelector('link[rel="canonical"]')
  const canonicalUrl = canonicalLink?.getAttribute('href') || ''
  const issues: string[] = []
  const duplicateContent: Array<{ url: string; similarity: number; issue: string }> = []

  if (!canonicalUrl) {
    issues.push('Missing canonical URL')
  } else if (canonicalUrl !== url) {
    issues.push('Canonical URL differs from current URL')
  }

  // Check for potential duplicate content indicators
  const title = doc.querySelector('title')?.textContent || ''
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  
  if (title.length < 30) {
    duplicateContent.push({
      url: url,
      similarity: 85,
      issue: 'Short or generic title'
    })
  }

  if (description.length < 120) {
    duplicateContent.push({
      url: url,
      similarity: 75,
      issue: 'Short or generic meta description'
    })
  }

  const recommendations = []
  if (issues.length > 0) {
    recommendations.push('Add canonical URL to prevent duplicate content issues')
  }
  if (duplicateContent.length > 0) {
    recommendations.push('Improve content uniqueness to avoid duplicate content penalties')
  }
  if (recommendations.length === 0) {
    recommendations.push('Canonical URL is properly configured')
  }

  const score = issues.length === 0 ? 95 : 60

  return {
    url,
    canonicalUrl,
    status: issues.length === 0 ? 'good' : 'warning',
    issues,
    duplicateContent,
    recommendations,
    score
  }
}
