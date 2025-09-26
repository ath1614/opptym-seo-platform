const fetch = require('node-fetch');

async function auditSEOTools() {
  console.log('🔍 COMPREHENSIVE SEO TOOLS AUDIT REPORT');
  console.log('=====================================\n');

  const baseURL = 'http://localhost:3000';
  const projectId = '68d6a1053e4383d962458260'; // The project we created
  
  const tools = [
    { name: 'Meta Tag Analyzer', endpoint: `/api/tools/${projectId}/run-meta` },
    { name: 'Page Speed Analyzer', endpoint: `/api/tools/${projectId}/run-page-speed` },
    { name: 'Broken Link Scanner', endpoint: `/api/tools/${projectId}/run-broken-links` },
    { name: 'Keyword Density Checker', endpoint: `/api/tools/${projectId}/run-keyword-density` },
    { name: 'Keyword Researcher', endpoint: `/api/tools/${projectId}/run-keyword-research` },
    { name: 'Alt Text Checker', endpoint: `/api/tools/${projectId}/run-alt-text` },
    { name: 'Backlink Scanner', endpoint: `/api/tools/${projectId}/run-backlinks` },
    { name: 'Canonical Checker', endpoint: `/api/tools/${projectId}/run-canonical` },
    { name: 'Mobile Audit', endpoint: `/api/tools/${projectId}/run-mobile-audit` },
    { name: 'Competitor Analyzer', endpoint: `/api/tools/${projectId}/run-competitors` }
  ];

  const results = {
    working: [],
    errors: [],
    warnings: []
  };

  console.log('📊 Testing SEO Tools API Endpoints...\n');

  for (const tool of tools) {
    try {
      console.log(`🔧 Testing ${tool.name}...`);
      
      const response = await fetch(`${baseURL}${tool.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ ${tool.name}: SUCCESS`);
        console.log(`   📈 Response: ${JSON.stringify(data).substring(0, 100)}...`);
        results.working.push(tool.name);
      } else {
        console.log(`   ❌ ${tool.name}: FAILED`);
        console.log(`   🚨 Error: ${data.error || 'Unknown error'}`);
        console.log(`   📊 Status: ${response.status}`);
        results.errors.push({
          tool: tool.name,
          error: data.error || 'Unknown error',
          status: response.status
        });
      }
    } catch (error) {
      console.log(`   ⚠️  ${tool.name}: CONNECTION ERROR`);
      console.log(`   🔌 Error: ${error.message}`);
      results.warnings.push({
        tool: tool.name,
        error: error.message
      });
    }
    console.log('');
  }

  // Test Frontend Components
  console.log('🎨 Testing Frontend Components...\n');
  
  const frontendTests = [
    { name: 'Meta Tag Analyzer Page', url: '/dashboard/seo-tools/meta-tag-analyzer' },
    { name: 'Page Speed Analyzer Page', url: '/dashboard/seo-tools/page-speed-analyzer' },
    { name: 'Broken Link Scanner Page', url: '/dashboard/seo-tools/broken-link-scanner' },
    { name: 'Keyword Density Checker Page', url: '/dashboard/seo-tools/keyword-density-checker' },
    { name: 'Keyword Researcher Page', url: '/dashboard/seo-tools/keyword-researcher' },
    { name: 'Alt Text Checker Page', url: '/dashboard/seo-tools/alt-text-checker' },
    { name: 'Backlink Scanner Page', url: '/dashboard/seo-tools/backlink-scanner' },
    { name: 'Canonical Checker Page', url: '/dashboard/seo-tools/canonical-checker' },
    { name: 'Mobile Checker Page', url: '/dashboard/seo-tools/mobile-checker' },
    { name: 'Competitor Analyzer Page', url: '/dashboard/seo-tools/competitor-analyzer' }
  ];

  for (const test of frontendTests) {
    try {
      console.log(`🌐 Testing ${test.name}...`);
      
      const response = await fetch(`${baseURL}${test.url}`);
      
      if (response.ok) {
        console.log(`   ✅ ${test.name}: PAGE LOADS`);
        results.working.push(`${test.name} (Frontend)`);
      } else {
        console.log(`   ❌ ${test.name}: PAGE ERROR`);
        console.log(`   📊 Status: ${response.status}`);
        results.errors.push({
          tool: test.name,
          error: `Page load failed with status ${response.status}`,
          status: response.status
        });
      }
    } catch (error) {
      console.log(`   ⚠️  ${test.name}: CONNECTION ERROR`);
      console.log(`   🔌 Error: ${error.message}`);
      results.warnings.push({
        tool: test.name,
        error: error.message
      });
    }
  }

  // Generate Report
  console.log('\n📋 AUDIT SUMMARY REPORT');
  console.log('=======================\n');

  console.log(`✅ WORKING TOOLS (${results.working.length}):`);
  results.working.forEach(tool => console.log(`   • ${tool}`));
  console.log('');

  if (results.errors.length > 0) {
    console.log(`❌ FAILED TOOLS (${results.errors.length}):`);
    results.errors.forEach(error => {
      console.log(`   • ${error.tool}: ${error.error} (Status: ${error.status})`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(warning => {
      console.log(`   • ${warning.tool}: ${warning.error}`);
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('===================\n');

  if (results.errors.length > 0) {
    console.log('🔧 IMMEDIATE FIXES NEEDED:');
    results.errors.forEach(error => {
      console.log(`   • Fix ${error.tool}: ${error.error}`);
    });
    console.log('');
  }

  console.log('🚀 OPTIMIZATION SUGGESTIONS:');
  console.log('   • Add loading states for better UX');
  console.log('   • Implement error boundaries for graceful error handling');
  console.log('   • Add progress indicators for long-running analyses');
  console.log('   • Implement caching for repeated analyses');
  console.log('   • Add real-time validation feedback');
  console.log('');

  console.log('📊 OVERALL HEALTH SCORE:');
  const totalTests = results.working.length + results.errors.length + results.warnings.length;
  const successRate = (results.working.length / totalTests) * 100;
  console.log(`   🎯 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   ✅ Working: ${results.working.length}`);
  console.log(`   ❌ Failed: ${results.errors.length}`);
  console.log(`   ⚠️  Warnings: ${results.warnings.length}`);
  
  if (successRate >= 90) {
    console.log('   🏆 EXCELLENT - System is highly functional!');
  } else if (successRate >= 70) {
    console.log('   👍 GOOD - Minor issues need attention');
  } else if (successRate >= 50) {
    console.log('   ⚠️  FAIR - Several issues need fixing');
  } else {
    console.log('   🚨 POOR - Major issues require immediate attention');
  }

  console.log('\n🎉 Audit completed successfully!');
}

// Run the audit
auditSEOTools().catch(console.error);
