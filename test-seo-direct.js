const { JSDOM } = require('jsdom');

// Simple test for canonical checker functionality
async function testCanonicalChecker() {
  const url = 'https://opptym.com';
  
  console.log(`🔍 Testing Canonical Checker on ${url}\n`);
  
  try {
    // Fetch the page
    console.log('⏳ Fetching page...');
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse with JSDOM
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Check for canonical link
    const canonicalElement = doc.querySelector('link[rel="canonical"]');
    const canonicalContent = canonicalElement?.getAttribute('href') || '';
    
    console.log('📊 Results:');
    console.log(`   URL: ${url}`);
    console.log(`   Has Canonical: ${!!canonicalContent}`);
    console.log(`   Canonical URL: ${canonicalContent || 'Not found'}`);
    console.log(`   Is Self-Referencing: ${canonicalContent === url}`);
    
    // Check for other meta tags
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    
    console.log('\n📋 Other Meta Tags:');
    console.log(`   Title: ${title}`);
    console.log(`   Description: ${description}`);
    console.log(`   Viewport: ${viewport}`);
    
    // Check for issues
    const issues = [];
    if (!canonicalContent) {
      issues.push('Missing canonical URL');
    } else if (canonicalContent !== url) {
      issues.push('Canonical URL does not match current URL');
    }
    
    if (!title) {
      issues.push('Missing title tag');
    }
    
    if (!description) {
      issues.push('Missing meta description');
    }
    
    if (!viewport) {
      issues.push('Missing viewport meta tag');
    }
    
    console.log('\n⚠️  Issues Found:');
    if (issues.length === 0) {
      console.log('   ✅ No issues found!');
    } else {
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // Calculate score
    const score = Math.max(0, 100 - (issues.length * 20));
    console.log(`\n📊 SEO Score: ${score}/100`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Test meta tag analyzer
async function testMetaTagAnalyzer() {
  const url = 'https://opptym.com';
  
  console.log(`\n🔍 Testing Meta Tag Analyzer on ${url}\n`);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Analyze title
    const titleElement = doc.querySelector('title');
    const title = titleElement?.textContent || '';
    const titleLength = title.length;
    
    // Analyze description
    const descElement = doc.querySelector('meta[name="description"]');
    const description = descElement?.getAttribute('content') || '';
    const descLength = description.length;
    
    // Analyze keywords
    const keywordsElement = doc.querySelector('meta[name="keywords"]');
    const keywords = keywordsElement?.getAttribute('content') || '';
    
    // Analyze viewport
    const viewportElement = doc.querySelector('meta[name="viewport"]');
    const viewport = viewportElement?.getAttribute('content') || '';
    
    // Analyze robots
    const robotsElement = doc.querySelector('meta[name="robots"]');
    const robots = robotsElement?.getAttribute('content') || '';
    
    console.log('📊 Meta Tag Analysis:');
    console.log(`   Title: "${title}" (${titleLength} chars)`);
    console.log(`   Description: "${description}" (${descLength} chars)`);
    console.log(`   Keywords: ${keywords || 'Not found'}`);
    console.log(`   Viewport: ${viewport || 'Not found'}`);
    console.log(`   Robots: ${robots || 'Not found'}`);
    
    // Check for issues
    const issues = [];
    if (!title) issues.push('Missing title tag');
    if (titleLength < 30) issues.push('Title too short (less than 30 characters)');
    if (titleLength > 60) issues.push('Title too long (more than 60 characters)');
    
    if (!description) issues.push('Missing meta description');
    if (descLength < 120) issues.push('Description too short (less than 120 characters)');
    if (descLength > 160) issues.push('Description too long (more than 160 characters)');
    
    if (!viewport) issues.push('Missing viewport meta tag');
    if (keywords) issues.push('Meta keywords tag present (not recommended)');
    
    console.log('\n⚠️  Issues Found:');
    if (issues.length === 0) {
      console.log('   ✅ No issues found!');
    } else {
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    const score = Math.max(0, 100 - (issues.length * 15));
    console.log(`\n📊 Meta Tag Score: ${score}/100`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting SEO Analysis Tests for opptym.com\n');
  console.log('='.repeat(60));
  
  await testCanonicalChecker();
  await testMetaTagAnalyzer();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests completed!');
}

runTests().catch(console.error);
