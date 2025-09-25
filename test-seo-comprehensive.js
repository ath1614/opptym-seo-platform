const { JSDOM } = require('jsdom');

async function testAllSEOTools() {
  const url = 'https://opptym.com';
  
  console.log(`🔍 Comprehensive SEO Analysis for ${url}\n`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // 1. Meta Tag Analysis
    console.log('\n📋 1. META TAG ANALYSIS');
    console.log('-'.repeat(30));
    
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    
    console.log(`Title: "${title}" (${title.length} chars)`);
    console.log(`Description: "${description}" (${description.length} chars)`);
    console.log(`Keywords: ${keywords || 'Not found'}`);
    console.log(`Viewport: ${viewport || 'Not found'}`);
    console.log(`Robots: ${robots || 'Not found'}`);
    
    // 2. Canonical URL Analysis
    console.log('\n🔗 2. CANONICAL URL ANALYSIS');
    console.log('-'.repeat(30));
    
    const canonicalElement = doc.querySelector('link[rel="canonical"]');
    const canonicalUrl = canonicalElement?.getAttribute('href') || '';
    
    console.log(`Current URL: ${url}`);
    console.log(`Canonical URL: ${canonicalUrl || 'Not found'}`);
    console.log(`Has Canonical: ${!!canonicalUrl}`);
    console.log(`Is Self-Referencing: ${canonicalUrl === url}`);
    
    // 3. Open Graph Analysis
    console.log('\n📱 3. OPEN GRAPH ANALYSIS');
    console.log('-'.repeat(30));
    
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
    
    console.log(`OG Title: ${ogTitle || 'Not found'}`);
    console.log(`OG Description: ${ogDescription || 'Not found'}`);
    console.log(`OG Image: ${ogImage || 'Not found'}`);
    console.log(`OG URL: ${ogUrl || 'Not found'}`);
    
    // 4. Twitter Card Analysis
    console.log('\n🐦 4. TWITTER CARD ANALYSIS');
    console.log('-'.repeat(30));
    
    const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '';
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
    const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
    const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';
    
    console.log(`Twitter Card: ${twitterCard || 'Not found'}`);
    console.log(`Twitter Title: ${twitterTitle || 'Not found'}`);
    console.log(`Twitter Description: ${twitterDescription || 'Not found'}`);
    console.log(`Twitter Image: ${twitterImage || 'Not found'}`);
    
    // 5. Structured Data Analysis
    console.log('\n🏗️ 5. STRUCTURED DATA ANALYSIS');
    console.log('-'.repeat(30));
    
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    const microdataItems = doc.querySelectorAll('[itemscope]');
    
    console.log(`JSON-LD Scripts: ${jsonLdScripts.length}`);
    console.log(`Microdata Items: ${microdataItems.length}`);
    
    if (jsonLdScripts.length > 0) {
      jsonLdScripts.forEach((script, index) => {
        try {
          const data = JSON.parse(script.textContent);
          console.log(`  JSON-LD ${index + 1}: ${data['@type'] || 'Unknown type'}`);
        } catch (e) {
          console.log(`  JSON-LD ${index + 1}: Invalid JSON`);
        }
      });
    }
    
    // 6. Image Analysis
    console.log('\n🖼️ 6. IMAGE ANALYSIS');
    console.log('-'.repeat(30));
    
    const images = doc.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    let imagesWithAlt = 0;
    
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        imagesWithoutAlt++;
      } else {
        imagesWithAlt++;
      }
    });
    
    console.log(`Total Images: ${images.length}`);
    console.log(`Images with Alt Text: ${imagesWithAlt}`);
    console.log(`Images without Alt Text: ${imagesWithoutAlt}`);
    
    // 7. Heading Structure Analysis
    console.log('\n📝 7. HEADING STRUCTURE ANALYSIS');
    console.log('-'.repeat(30));
    
    const h1s = doc.querySelectorAll('h1');
    const h2s = doc.querySelectorAll('h2');
    const h3s = doc.querySelectorAll('h3');
    const h4s = doc.querySelectorAll('h4');
    const h5s = doc.querySelectorAll('h5');
    const h6s = doc.querySelectorAll('h6');
    
    console.log(`H1 Tags: ${h1s.length}`);
    console.log(`H2 Tags: ${h2s.length}`);
    console.log(`H3 Tags: ${h3s.length}`);
    console.log(`H4 Tags: ${h4s.length}`);
    console.log(`H5 Tags: ${h5s.length}`);
    console.log(`H6 Tags: ${h6s.length}`);
    
    if (h1s.length > 0) {
      console.log(`First H1: "${h1s[0].textContent?.trim()}"`);
    }
    
    // 8. Link Analysis
    console.log('\n🔗 8. LINK ANALYSIS');
    console.log('-'.repeat(30));
    
    const links = doc.querySelectorAll('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;
    let noFollowLinks = 0;
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      const rel = link.getAttribute('rel');
      
      if (href) {
        if (href.startsWith('http') && !href.includes('opptym.com')) {
          externalLinks++;
        } else {
          internalLinks++;
        }
        
        if (rel && rel.includes('nofollow')) {
          noFollowLinks++;
        }
      }
    });
    
    console.log(`Total Links: ${links.length}`);
    console.log(`Internal Links: ${internalLinks}`);
    console.log(`External Links: ${externalLinks}`);
    console.log(`NoFollow Links: ${noFollowLinks}`);
    
    // 9. Performance Analysis (Basic)
    console.log('\n⚡ 9. PERFORMANCE ANALYSIS');
    console.log('-'.repeat(30));
    
    const scripts = doc.querySelectorAll('script[src]');
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
    const inlineStyles = doc.querySelectorAll('style');
    
    console.log(`External Scripts: ${scripts.length}`);
    console.log(`External Stylesheets: ${stylesheets.length}`);
    console.log(`Inline Styles: ${inlineStyles.length}`);
    
    // 10. Issues Summary
    console.log('\n⚠️ 10. ISSUES SUMMARY');
    console.log('-'.repeat(30));
    
    const issues = [];
    
    // Meta tag issues
    if (!title) issues.push('Missing title tag');
    if (title.length < 30) issues.push('Title too short');
    if (title.length > 60) issues.push('Title too long');
    if (!description) issues.push('Missing meta description');
    if (description.length < 120) issues.push('Description too short');
    if (description.length > 160) issues.push('Description too long');
    if (keywords) issues.push('Meta keywords tag present (not recommended)');
    if (!viewport) issues.push('Missing viewport meta tag');
    
    // Canonical issues
    if (!canonicalUrl) issues.push('Missing canonical URL');
    if (canonicalUrl && canonicalUrl !== url) issues.push('Canonical URL does not match current URL');
    
    // Open Graph issues
    if (!ogTitle) issues.push('Missing Open Graph title');
    if (!ogDescription) issues.push('Missing Open Graph description');
    if (!ogImage) issues.push('Missing Open Graph image');
    
    // Twitter Card issues
    if (!twitterCard) issues.push('Missing Twitter Card meta tag');
    
    // Image issues
    if (imagesWithoutAlt > 0) issues.push(`${imagesWithoutAlt} images missing alt text`);
    
    // Heading issues
    if (h1s.length === 0) issues.push('Missing H1 tag');
    if (h1s.length > 1) issues.push('Multiple H1 tags found');
    
    // Structured data issues
    if (jsonLdScripts.length === 0 && microdataItems.length === 0) {
      issues.push('No structured data found');
    }
    
    if (issues.length === 0) {
      console.log('✅ No issues found!');
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    // Overall Score
    const score = Math.max(0, 100 - (issues.length * 5));
    console.log(`\n📊 OVERALL SEO SCORE: ${score}/100`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(30));
    
    const recommendations = [];
    
    if (canonicalUrl !== url) {
      recommendations.push('Fix canonical URL to match current URL');
    }
    if (description.length > 160) {
      recommendations.push('Shorten meta description to under 160 characters');
    }
    if (keywords) {
      recommendations.push('Remove meta keywords tag');
    }
    if (!ogTitle) {
      recommendations.push('Add Open Graph title');
    }
    if (!ogDescription) {
      recommendations.push('Add Open Graph description');
    }
    if (!ogImage) {
      recommendations.push('Add Open Graph image');
    }
    if (!twitterCard) {
      recommendations.push('Add Twitter Card meta tag');
    }
    if (imagesWithoutAlt > 0) {
      recommendations.push('Add alt text to all images');
    }
    if (jsonLdScripts.length === 0) {
      recommendations.push('Add structured data (JSON-LD)');
    }
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testAllSEOTools().catch(console.error);
