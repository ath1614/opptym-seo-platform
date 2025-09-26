import { NextRequest, NextResponse } from 'next/server'
import { analyzeKeywordTracking } from '@/lib/seo-analysis'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing keyword tracker with a simple URL')
    
    // Test with a simple URL
    const testUrl = 'https://example.com'
    console.log(`🔍 Testing with URL: ${testUrl}`)
    
    const result = await analyzeKeywordTracking(testUrl)
    console.log('✅ Test successful:', result)
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Keyword tracker test successful'
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
