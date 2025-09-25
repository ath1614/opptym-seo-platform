const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import the SEO analysis functions
const {
  analyzeMetaTags,
  analyzeKeywordDensity,
  analyzePageSpeed,
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
} = require('./src/lib/seo-analysis.ts');

async function testSEOTools() {
  const url = 'https://opptym.com';
  
  console.log(`🔍 Testing all SEO tools on ${url}\n`);
  
  const tools = [
    { name: 'Meta Tag Analyzer', fn: analyzeMetaTags },
    { name: 'Keyword Density Checker', fn: analyzeKeywordDensity },
    { name: 'Page Speed Analyzer', fn: analyzePageSpeed },
    { name: 'Broken Link Scanner', fn: analyzeBrokenLinks },
    { name: 'Mobile Checker', fn: analyzeMobileFriendly },
    { name: 'Keyword Researcher', fn: analyzeKeywordResearch },
    { name: 'Sitemap & Robots Checker', fn: analyzeSitemapRobots },
    { name: 'Backlink Scanner', fn: analyzeBacklinks },
    { name: 'Keyword Tracker', fn: analyzeKeywordTracking },
    { name: 'Competitor Analyzer', fn: analyzeCompetitors },
    { name: 'Technical SEO Auditor', fn: analyzeTechnicalSEO },
    { name: 'Schema Validator', fn: analyzeSchemaValidation },
    { name: 'Alt Text Checker', fn: analyzeAltText },
    { name: 'Canonical Checker', fn: analyzeCanonical }
  ];

  const results = {};

  for (const tool of tools) {
    try {
      console.log(`⏳ Running ${tool.name}...`);
      const startTime = Date.now();
      
      const result = await tool.fn(url);
      const duration = Date.now() - startTime;
      
      results[tool.name] = {
        success: true,
        duration: `${duration}ms`,
        score: result.score || result.overallScore || 'N/A',
        issues: result.issues?.length || 0,
        recommendations: result.recommendations?.length || 0,
        data: result
      };
      
      console.log(`✅ ${tool.name} completed in ${duration}ms`);
      console.log(`   Score: ${result.score || result.overallScore || 'N/A'}`);
      console.log(`   Issues: ${result.issues?.length || 0}`);
      console.log(`   Recommendations: ${result.recommendations?.length || 0}\n`);
      
    } catch (error) {
      console.log(`❌ ${tool.name} failed: ${error.message}\n`);
      results[tool.name] = {
        success: false,
        error: error.message
      };
    }
  }

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const successful = Object.values(results).filter(r => r.success).length;
  const failed = Object.values(results).filter(r => !r.success).length;
  
  console.log(`Total Tools: ${tools.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tools:');
    Object.entries(results).forEach(([name, result]) => {
      if (!result.success) {
        console.log(`   - ${name}: ${result.error}`);
      }
    });
  }
  
  console.log('\n✅ Successful Tools:');
  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      console.log(`   - ${name}: Score ${result.score}, ${result.issues} issues, ${result.recommendations} recommendations`);
    }
  });

  // Save results to file
  const fs = require('fs');
  fs.writeFileSync('seo-analysis-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Results saved to seo-analysis-results.json');
}

testSEOTools().catch(console.error);
