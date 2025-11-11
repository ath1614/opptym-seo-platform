const fs = require('fs')
const path = require('path')

const toolRoutes = [
  'run-alt-text',
  'run-backlinks', 
  'run-broken-links',
  'run-canonical',
  'run-competitors',
  'run-keyword-research',
  'run-keyword-tracker',
  'run-mobile-checker',
  'run-page-speed',
  'run-schema-validator',
  'run-sitemap-robots',
  'run-technical-seo-auditor'
]

const toolIdMap = {
  'run-alt-text': 'alt-text-checker',
  'run-backlinks': 'backlink-scanner',
  'run-broken-links': 'broken-link-scanner', 
  'run-canonical': 'canonical-checker',
  'run-competitors': 'competitor-analyzer',
  'run-keyword-research': 'keyword-researcher',
  'run-keyword-tracker': 'keyword-tracker',
  'run-mobile-checker': 'mobile-checker',
  'run-page-speed': 'page-speed-analyzer',
  'run-schema-validator': 'schema-validator',
  'run-sitemap-robots': 'sitemap-robots-checker',
  'run-technical-seo-auditor': 'technical-seo-auditor'
}

function addAccessCheck(routePath, toolId) {
  const filePath = path.join(__dirname, '..', 'src', 'app', 'api', 'tools', '[projectId]', routePath, 'route.ts')
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`)
    return
  }
  
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Check if already has access check
  if (content.includes('checkSeoToolAccess')) {
    console.log(`${routePath} already has access check`)
    return
  }
  
  // Add access check after project validation
  const searchPattern = /\/\/ Track usage\s*\n\s*const usageResult = await trackUsage/
  const replacement = `// Check if tool is enabled
    const { checkSeoToolAccess } = await import('@/lib/seo-tool-middleware')
    const accessCheck = await checkSeoToolAccess('${toolId}')
    if (!accessCheck.success) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status })
    }

    // Track usage
    const usageResult = await trackUsage`
  
  if (searchPattern.test(content)) {
    content = content.replace(searchPattern, replacement)
    fs.writeFileSync(filePath, content)
    console.log(`✅ Updated ${routePath}`)
  } else {
    console.log(`⚠️ Pattern not found in ${routePath}`)
  }
}

console.log('Fixing SEO tool routes...')

toolRoutes.forEach(route => {
  const toolId = toolIdMap[route]
  if (toolId) {
    addAccessCheck(route, toolId)
  }
})

console.log('Done!')