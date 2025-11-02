// Test script for the new keyword research implementation
const { analyzeKeywordResearch } = require('./src/lib/seo-analysis.ts')

async function testKeywordResearch() {
  console.log('🧪 Testing new keyword research implementation...\n')
  
  // Test data similar to what would come from project form
  const testProjectData = {
    keywords: ['seo', 'digital marketing', 'website optimization'],
    targetKeywords: ['seo tools', 'keyword research', 'competitor analysis'],
    seoKeywords: ['search engine optimization', 'organic traffic'],
    competitors: ['semrush.com', 'ahrefs.com'],
    businessDescription: 'We provide comprehensive SEO tools and digital marketing solutions for businesses looking to improve their online presence and search engine rankings.'
  }
  
  const testUrl = 'https://www.opptym.com'
  
  try {
    console.log('📊 Project Data:')
    console.log(`- Keywords: ${testProjectData.keywords.join(', ')}`)
    console.log(`- Target Keywords: ${testProjectData.targetKeywords.join(', ')}`)
    console.log(`- SEO Keywords: ${testProjectData.seoKeywords.join(', ')}`)
    console.log(`- Competitors: ${testProjectData.competitors.join(', ')}`)
    console.log(`- Business Description: ${testProjectData.businessDescription.substring(0, 100)}...\n`)
    
    console.log('🔍 Running keyword research analysis...')
    const result = await analyzeKeywordResearch(testUrl, testProjectData)
    
    console.log('\n✅ Results:')
    console.log(`- Seed Keyword: ${result.seedKeyword}`)
    console.log(`- Primary Keywords: ${result.primaryKeywords.length}`)
    console.log(`- Related Keywords: ${result.relatedKeywords.length}`)
    console.log(`- Long-tail Keywords: ${result.longTailKeywords.length}`)
    console.log(`- Score: ${result.score}`)
    
    console.log('\n📈 Primary Keywords:')
    result.primaryKeywords.slice(0, 5).forEach((kw, i) => {
      console.log(`  ${i + 1}. ${kw.keyword} - ${kw.searchVolume} searches, ${kw.difficulty}% difficulty, $${kw.cpc} CPC`)
    })
    
    console.log('\n🔗 Related Keywords:')
    result.relatedKeywords.slice(0, 3).forEach((kw, i) => {
      console.log(`  ${i + 1}. ${kw.keyword} - ${kw.searchVolume} searches, ${kw.relevance}% relevance`)
    })
    
    console.log('\n📝 Long-tail Keywords:')
    result.longTailKeywords.slice(0, 3).forEach((kw, i) => {
      console.log(`  ${i + 1}. ${kw.keyword} - ${kw.searchVolume} searches`)
    })
    
    console.log('\n💡 Recommendations:')
    result.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`)
    })
    
    console.log('\n🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error.stack)
  }
}

// Run the test
testKeywordResearch()