const fetch = require('node-fetch');

async function testSEOToolsAPI() {
  const baseUrl = 'http://localhost:3000';
  const url = 'https://opptym.com';
  
  console.log(`🔍 Testing all SEO tools on ${url} via API\n`);
  
  const tools = [
    'meta-tag-analyzer',
    'keyword-density-checker', 
    'page-speed-analyzer',
    'broken-link-scanner',
    'mobile-checker',
    'keyword-researcher',
    'sitemap-robots-checker',
    'backlink-scanner',
    'keyword-tracker',
    'competitor-analyzer',
    'technical-seo-auditor',
    'schema-validator',
    'alt-text-checker',
    'canonical-checker'
  ];

  const results = {};

  for (const toolId of tools) {
    try {
      console.log(`⏳ Testing ${toolId}...`);
      const startTime = Date.now();
      
      const response = await fetch(`${baseUrl}/api/seo-tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: toolId,
          url: url,
          projectId: null
        }),
      });

      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const result = data.results;
        
        results[toolId] = {
          success: true,
          duration: `${duration}ms`,
          score: result.score || result.overallScore || 'N/A',
          issues: result.issues?.length || 0,
          recommendations: result.recommendations?.length || 0,
          hasData: !!result
        };
        
        console.log(`✅ ${toolId} completed in ${duration}ms`);
        console.log(`   Score: ${result.score || result.overallScore || 'N/A'}`);
        console.log(`   Issues: ${result.issues?.length || 0}`);
        console.log(`   Recommendations: ${result.recommendations?.length || 0}`);
        
        // Show some specific data for key tools
        if (toolId === 'canonical-checker') {
          console.log(`   Canonical URL: ${result.canonicalUrl || 'Not found'}`);
          console.log(`   Has Canonical: ${result.hasCanonical || false}`);
        }
        if (toolId === 'meta-tag-analyzer') {
          console.log(`   Title: ${result.title?.content || 'Not found'}`);
          console.log(`   Description: ${result.description?.content || 'Not found'}`);
        }
        
        console.log('');
        
      } else {
        const errorData = await response.json();
        console.log(`❌ ${toolId} failed: ${errorData.error || 'Unknown error'}\n`);
        results[toolId] = {
          success: false,
          error: errorData.error || 'Unknown error',
          status: response.status
        };
      }
      
    } catch (error) {
      console.log(`❌ ${toolId} failed: ${error.message}\n`);
      results[toolId] = {
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

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log('✅ Server is running, starting tests...\n');
      await testSEOToolsAPI();
    } else {
      console.log('❌ Server is not responding properly');
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the development server first:');
    console.log('   npm run dev');
  }
}

checkServer();
