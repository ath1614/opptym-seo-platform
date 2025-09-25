const mongoose = require('mongoose');
const { analyzeMetaTags, analyzeCanonical, analyzePageSpeed, analyzeKeywordDensity, analyzeAltText, analyzeBrokenLinks, analyzeMobileFriendliness, analyzeSchemaMarkup, analyzeSitemapRobots } = require('./src/lib/seo-analysis.ts');

async function testAllSEOTools() {
  console.log('🔍 Starting comprehensive SEO tools audit for https://opptym.com...\n');
  
  const testUrl = 'https://opptym.com';
  const results = {};
  
  try {
    // Test Meta Tag Analyzer
    console.log('1️⃣ Testing Meta Tag Analyzer...');
    try {
      const metaResults = await analyzeMetaTags(testUrl);
      results.metaTags = {
        score: metaResults.score,
        title: metaResults.title,
        description: metaResults.description,
        issues: metaResults.issues.length,
        recommendations: metaResults.recommendations.length
      };
      console.log(`✅ Meta Tags: Score ${metaResults.score}/100, ${metaResults.issues.length} issues, ${metaResults.recommendations.length} recommendations`);
    } catch (error) {
      console.log(`❌ Meta Tags failed: ${error.message}`);
      results.metaTags = { error: error.message };
    }

    // Test Canonical Checker
    console.log('\n2️⃣ Testing Canonical Checker...');
    try {
      const canonicalResults = await analyzeCanonical(testUrl);
      results.canonical = {
        score: canonicalResults.score,
        hasCanonical: !!canonicalResults.canonicalUrl,
        issues: canonicalResults.issues.length,
        recommendations: canonicalResults.recommendations.length
      };
      console.log(`✅ Canonical: Score ${canonicalResults.score}/100, ${canonicalResults.issues.length} issues, ${canonicalResults.recommendations.length} recommendations`);
    } catch (error) {
      console.log(`❌ Canonical failed: ${error.message}`);
      results.canonical = { error: error.message };
    }

    // Test Page Speed Analyzer
    console.log('\n3️⃣ Testing Page Speed Analyzer...');
    try {
      const speedResults = await analyzePageSpeed(testUrl);
      results.pageSpeed = {
        overallScore: speedResults.overallScore,
        performance: speedResults.performance.score,
        accessibility: speedResults.accessibility.score,
        seo: speedResults.seo.score
      };
      console.log(`✅ Page Speed: Overall ${speedResults.overallScore}/100, Performance ${speedResults.performance.score}/100`);
    } catch (error) {
      console.log(`❌ Page Speed failed: ${error.message}`);
      results.pageSpeed = { error: error.message };
    }

    // Test Keyword Density Checker
    console.log('\n4️⃣ Testing Keyword Density Checker...');
    try {
      const keywordResults = await analyzeKeywordDensity(testUrl);
      results.keywordDensity = {
        score: keywordResults.score,
        totalWords: keywordResults.totalWords,
        uniqueWords: keywordResults.uniqueWords,
        topKeywords: keywordResults.topKeywords.length
      };
      console.log(`✅ Keyword Density: Score ${keywordResults.score}/100, ${keywordResults.totalWords} total words, ${keywordResults.uniqueWords} unique words`);
    } catch (error) {
      console.log(`❌ Keyword Density failed: ${error.message}`);
      results.keywordDensity = { error: error.message };
    }

    // Test Alt Text Checker
    console.log('\n5️⃣ Testing Alt Text Checker...');
    try {
      const altTextResults = await analyzeAltText(testUrl);
      results.altText = {
        score: altTextResults.score,
        totalImages: altTextResults.totalImages,
        imagesWithAlt: altTextResults.imagesWithAlt,
        imagesWithoutAlt: altTextResults.imagesWithoutAlt
      };
      console.log(`✅ Alt Text: Score ${altTextResults.score}/100, ${altTextResults.totalImages} images, ${altTextResults.imagesWithAlt} with alt text`);
    } catch (error) {
      console.log(`❌ Alt Text failed: ${error.message}`);
      results.altText = { error: error.message };
    }

    // Test Broken Links Scanner
    console.log('\n6️⃣ Testing Broken Links Scanner...');
    try {
      const brokenLinksResults = await analyzeBrokenLinks(testUrl);
      results.brokenLinks = {
        score: brokenLinksResults.score,
        totalLinks: brokenLinksResults.totalLinks,
        brokenLinks: brokenLinksResults.brokenLinks,
        workingLinks: brokenLinksResults.workingLinks
      };
      console.log(`✅ Broken Links: Score ${brokenLinksResults.score}/100, ${brokenLinksResults.totalLinks} total links, ${brokenLinksResults.brokenLinks} broken`);
    } catch (error) {
      console.log(`❌ Broken Links failed: ${error.message}`);
      results.brokenLinks = { error: error.message };
    }

    // Test Mobile Checker
    console.log('\n7️⃣ Testing Mobile Checker...');
    try {
      const mobileResults = await analyzeMobileFriendliness(testUrl);
      results.mobile = {
        score: mobileResults.score,
        isMobileFriendly: mobileResults.isMobileFriendly,
        viewportConfigured: mobileResults.viewport?.configured,
        touchTargets: mobileResults.touchTargets?.total
      };
      console.log(`✅ Mobile: Score ${mobileResults.score}/100, Mobile Friendly: ${mobileResults.isMobileFriendly}`);
    } catch (error) {
      console.log(`❌ Mobile failed: ${error.message}`);
      results.mobile = { error: error.message };
    }

    // Test Schema Validator
    console.log('\n8️⃣ Testing Schema Validator...');
    try {
      const schemaResults = await analyzeSchemaMarkup(testUrl);
      results.schema = {
        score: schemaResults.score,
        hasSchema: schemaResults.hasSchema,
        schemaTypes: schemaResults.schemaTypes.length,
        issues: schemaResults.issues.length
      };
      console.log(`✅ Schema: Score ${schemaResults.score}/100, ${schemaResults.schemaTypes.length} schema types, ${schemaResults.issues.length} issues`);
    } catch (error) {
      console.log(`❌ Schema failed: ${error.message}`);
      results.schema = { error: error.message };
    }

    // Test Sitemap & Robots Checker
    console.log('\n9️⃣ Testing Sitemap & Robots Checker...');
    try {
      const sitemapResults = await analyzeSitemapRobots(testUrl);
      results.sitemap = {
        score: sitemapResults.score,
        hasSitemap: sitemapResults.hasSitemap,
        hasRobots: sitemapResults.hasRobots,
        sitemapUrls: sitemapResults.sitemapUrls.length
      };
      console.log(`✅ Sitemap: Score ${sitemapResults.score}/100, Sitemap: ${sitemapResults.hasSitemap}, Robots: ${sitemapResults.hasRobots}`);
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

    // Issues found on opptym.com
    console.log('\n🔧 Issues Found on opptym.com:');
    console.log('============================');
    
    if (results.metaTags && !results.metaTags.error) {
      console.log('Meta Tags Issues:');
      if (results.metaTags.issues > 0) {
        console.log(`- ${results.metaTags.issues} issues found`);
      } else {
        console.log('- No meta tag issues found');
      }
    }

    if (results.canonical && !results.canonical.error) {
      console.log('Canonical Issues:');
      if (results.canonical.issues > 0) {
        console.log(`- ${results.canonical.issues} canonical issues found`);
      } else {
        console.log('- No canonical issues found');
      }
    }

    if (results.mobile && !results.mobile.error) {
      console.log('Mobile Issues:');
      if (!results.mobile.isMobileFriendly) {
        console.log('- Website is not mobile friendly');
      } else {
        console.log('- Website is mobile friendly');
      }
    }

    console.log('\n✅ SEO Tools audit completed successfully!');

  } catch (error) {
    console.error('❌ Comprehensive audit failed:', error);
  }
}

// Run the test
testAllSEOTools().catch(console.error);
