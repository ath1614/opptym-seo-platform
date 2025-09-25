const fetch = require('node-fetch');

async function testAllSEOTools() {
  console.log('🔍 Starting comprehensive SEO tools audit for https://opptym.com...\n');
  
  const testUrl = 'https://opptym.com';
  const results = {};
  
  try {
    // Test Meta Tag Analyzer
    console.log('1️⃣ Testing Meta Tag Analyzer...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'meta-tag-analyzer',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.metaTags = {
          score: data.results?.score || 0,
          issues: data.results?.issues?.length || 0,
          recommendations: data.results?.recommendations?.length || 0
        };
        console.log(`✅ Meta Tags: Score ${results.metaTags.score}/100, ${results.metaTags.issues} issues, ${results.metaTags.recommendations} recommendations`);
      } else {
        console.log(`❌ Meta Tags failed: HTTP ${response.status}`);
        results.metaTags = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Meta Tags failed: ${error.message}`);
      results.metaTags = { error: error.message };
    }

    // Test Canonical Checker
    console.log('\n2️⃣ Testing Canonical Checker...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'canonical-checker',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.canonical = {
          score: data.results?.score || 0,
          issues: data.results?.issues?.length || 0,
          recommendations: data.results?.recommendations?.length || 0
        };
        console.log(`✅ Canonical: Score ${results.canonical.score}/100, ${results.canonical.issues} issues, ${results.canonical.recommendations} recommendations`);
      } else {
        console.log(`❌ Canonical failed: HTTP ${response.status}`);
        results.canonical = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Canonical failed: ${error.message}`);
      results.canonical = { error: error.message };
    }

    // Test Page Speed Analyzer
    console.log('\n3️⃣ Testing Page Speed Analyzer...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'page-speed-analyzer',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.pageSpeed = {
          score: data.results?.overallScore || 0,
          performance: data.results?.performance?.score || 0
        };
        console.log(`✅ Page Speed: Score ${results.pageSpeed.score}/100, Performance ${results.pageSpeed.performance}/100`);
      } else {
        console.log(`❌ Page Speed failed: HTTP ${response.status}`);
        results.pageSpeed = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Page Speed failed: ${error.message}`);
      results.pageSpeed = { error: error.message };
    }

    // Test Keyword Density Checker
    console.log('\n4️⃣ Testing Keyword Density Checker...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'keyword-density-checker',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.keywordDensity = {
          score: data.results?.score || 0,
          totalWords: data.results?.totalWords || 0,
          uniqueWords: data.results?.uniqueWords || 0
        };
        console.log(`✅ Keyword Density: Score ${results.keywordDensity.score}/100, ${results.keywordDensity.totalWords} total words, ${results.keywordDensity.uniqueWords} unique words`);
      } else {
        console.log(`❌ Keyword Density failed: HTTP ${response.status}`);
        results.keywordDensity = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Keyword Density failed: ${error.message}`);
      results.keywordDensity = { error: error.message };
    }

    // Test Alt Text Checker
    console.log('\n5️⃣ Testing Alt Text Checker...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'alt-text-checker',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.altText = {
          score: data.results?.score || 0,
          totalImages: data.results?.totalImages || 0,
          imagesWithAlt: data.results?.imagesWithAlt || 0
        };
        console.log(`✅ Alt Text: Score ${results.altText.score}/100, ${results.altText.totalImages} images, ${results.altText.imagesWithAlt} with alt text`);
      } else {
        console.log(`❌ Alt Text failed: HTTP ${response.status}`);
        results.altText = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Alt Text failed: ${error.message}`);
      results.altText = { error: error.message };
    }

    // Test Broken Links Scanner
    console.log('\n6️⃣ Testing Broken Links Scanner...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'broken-link-scanner',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.brokenLinks = {
          score: data.results?.score || 0,
          totalLinks: data.results?.totalLinks || 0,
          brokenLinks: data.results?.brokenLinks || 0
        };
        console.log(`✅ Broken Links: Score ${results.brokenLinks.score}/100, ${results.brokenLinks.totalLinks} total links, ${results.brokenLinks.brokenLinks} broken`);
      } else {
        console.log(`❌ Broken Links failed: HTTP ${response.status}`);
        results.brokenLinks = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Broken Links failed: ${error.message}`);
      results.brokenLinks = { error: error.message };
    }

    // Test Mobile Checker
    console.log('\n7️⃣ Testing Mobile Checker...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'mobile-checker',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.mobile = {
          score: data.results?.score || 0,
          isMobileFriendly: data.results?.isMobileFriendly || false
        };
        console.log(`✅ Mobile: Score ${results.mobile.score}/100, Mobile Friendly: ${results.mobile.isMobileFriendly}`);
      } else {
        console.log(`❌ Mobile failed: HTTP ${response.status}`);
        results.mobile = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Mobile failed: ${error.message}`);
      results.mobile = { error: error.message };
    }

    // Test Schema Validator
    console.log('\n8️⃣ Testing Schema Validator...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'schema-validator',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.schema = {
          score: data.results?.score || 0,
          hasSchema: data.results?.hasSchema || false,
          schemaTypes: data.results?.schemaTypes?.length || 0
        };
        console.log(`✅ Schema: Score ${results.schema.score}/100, ${results.schema.schemaTypes} schema types, Has Schema: ${results.schema.hasSchema}`);
      } else {
        console.log(`❌ Schema failed: HTTP ${response.status}`);
        results.schema = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Schema failed: ${error.message}`);
      results.schema = { error: error.message };
    }

    // Test Sitemap & Robots Checker
    console.log('\n9️⃣ Testing Sitemap & Robots Checker...');
    try {
      const response = await fetch('http://localhost:3000/api/seo-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'sitemap-robots-checker',
          url: testUrl,
          projectId: null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        results.sitemap = {
          score: data.results?.score || 0,
          hasSitemap: data.results?.hasSitemap || false,
          hasRobots: data.results?.hasRobots || false
        };
        console.log(`✅ Sitemap: Score ${results.sitemap.score}/100, Sitemap: ${results.sitemap.hasSitemap}, Robots: ${results.sitemap.hasRobots}`);
      } else {
        console.log(`❌ Sitemap failed: HTTP ${response.status}`);
        results.sitemap = { error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Sitemap failed: ${error.message}`);
      results.sitemap = { error: error.message };
    }

    // Summary
    console.log('\n📊 SEO Tools Audit Summary:');
    console.log('================================');
    
    const tools = [
      { name: 'Meta Tags', data: results.metaTags },
      { name: 'Canonical', data: results.canonical },
      { name: 'Page Speed', data: results.pageSpeed },
      { name: 'Keyword Density', data: results.keywordDensity },
      { name: 'Alt Text', data: results.altText },
      { name: 'Broken Links', data: results.brokenLinks },
      { name: 'Mobile', data: results.mobile },
      { name: 'Schema', data: results.schema },
      { name: 'Sitemap', data: results.sitemap }
    ];

    let workingTools = 0;
    let totalScore = 0;
    let toolsWithScore = 0;

    tools.forEach(tool => {
      if (tool.data.error) {
        console.log(`❌ ${tool.name}: FAILED - ${tool.data.error}`);
      } else {
        workingTools++;
        if (tool.data.score !== undefined) {
          totalScore += tool.data.score;
          toolsWithScore++;
        }
        console.log(`✅ ${tool.name}: Score ${tool.data.score || 'N/A'}/100`);
      }
    });

    const averageScore = toolsWithScore > 0 ? Math.round(totalScore / toolsWithScore) : 0;
    
    console.log('\n🎯 Final Results:');
    console.log(`Working Tools: ${workingTools}/9`);
    console.log(`Average Score: ${averageScore}/100`);
    console.log(`Overall Status: ${averageScore >= 80 ? '🟢 Excellent' : averageScore >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}`);

    console.log('\n✅ SEO Tools audit completed successfully!');

  } catch (error) {
    console.error('❌ Comprehensive audit failed:', error);
  }
}

// Run the test
testAllSEOTools().catch(console.error);
