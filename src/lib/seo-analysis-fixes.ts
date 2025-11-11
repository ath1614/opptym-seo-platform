// Enhanced error handling and fallback mechanisms for SEO analysis

export function createFallbackResponse(toolName: string, url: string, error?: string) {
  const fallbackData = {
    'meta-tag-analyzer': {
      url,
      title: { content: 'Analysis unavailable', length: 0, status: 'error' as const, recommendation: 'Unable to analyze - check URL accessibility' },
      description: { content: 'Analysis unavailable', length: 0, status: 'error' as const, recommendation: 'Unable to analyze - check URL accessibility' },
      keywords: { content: '', status: 'good' as const, recommendation: 'Meta keywords not recommended' },
      viewport: { content: '', status: 'error' as const, recommendation: 'Unable to check viewport' },
      robots: { content: '', status: 'error' as const, recommendation: 'Unable to check robots meta tag' },
      openGraph: { title: '', description: '', image: '', url, status: 'error' as const, recommendation: 'Unable to check Open Graph tags' },
      twitter: { card: '', title: '', description: '', image: '', status: 'error' as const, recommendation: 'Unable to check Twitter Card tags' },
      canonical: { content: '', status: 'error' as const, recommendation: 'Unable to check canonical URL' },
      hreflang: { content: '', status: 'good' as const, recommendation: 'Hreflang is optional' },
      score: 0,
      issues: [{ type: 'error' as const, message: error || 'Unable to fetch webpage for analysis', severity: 'high' as const }],
      recommendations: ['Check URL accessibility', 'Ensure website is online', 'Verify URL format']
    },
    'keyword-density-checker': {
      url,
      totalWords: 0,
      keywords: [],
      recommendations: ['Unable to analyze content - check URL accessibility', 'Ensure website allows automated requests'],
      score: 0
    },
    'broken-link-scanner': {
      url,
      totalLinks: 0,
      brokenLinks: [],
      workingLinks: 0,
      score: 0,
      recommendations: ['Unable to scan links - check URL accessibility']
    },
    'page-speed-analyzer': {
      url,
      overallScore: 0,
      performance: { score: 0, status: 'poor' as const, metrics: { firstContentfulPaint: 0, largestContentfulPaint: 0, firstInputDelay: 0, cumulativeLayoutShift: 0 } },
      accessibility: { score: 0, status: 'poor' as const, issues: [] },
      bestPractices: { score: 0, status: 'poor' as const, issues: [] },
      seo: { score: 0, status: 'poor' as const, issues: [] },
      recommendations: ['Unable to analyze performance - check URL accessibility'],
      opportunities: []
    }
  }

  return fallbackData[toolName as keyof typeof fallbackData] || {
    url,
    error: error || 'Analysis failed',
    recommendations: ['Check URL accessibility', 'Try again later'],
    score: 0
  }
}

export function enhanceErrorHandling<T>(
  analysisFunction: () => Promise<T>,
  toolName: string,
  url: string
): Promise<T> {
  return analysisFunction().catch((error) => {
    console.error(`${toolName} analysis failed:`, error)
    return createFallbackResponse(toolName, url, error.message) as T
  })
}