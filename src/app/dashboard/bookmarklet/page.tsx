"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function BookmarkletInfoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tocExpanded, setTocExpanded] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleAllAccordions = (open: boolean) => {
    const details = document.querySelectorAll('details')
    details.forEach((d) => {
      ;(d as HTMLDetailsElement).open = open
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Opptym AI SEO Bookmarklet</h1>
            <p className="text-muted-foreground">Auto‑fill directory submission forms using your saved project details</p>
          </div>
          <Logo width={48} height={48} />
        </div>

        {/* Table of Contents (sticky with smooth scrolling) */}
        <div className="sticky top-0 z-40 border-b bg-muted/50 backdrop-blur px-4 py-3 rounded-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Table of contents</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
              <Button variant="outline" size="sm" onClick={() => setTocExpanded((v) => !v)}>
                {tocExpanded ? 'Compact ToC' : 'Show more'}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
            <a href="#overview" onClick={(e)=>{e.preventDefault(); scrollToId('overview');}} className="hover:text-foreground">Overview</a>
            <a href="#install" onClick={(e)=>{e.preventDefault(); scrollToId('install');}} className="hover:text-foreground">Install</a>
            <a href="#usage" onClick={(e)=>{e.preventDefault(); scrollToId('usage');}} className="hover:text-foreground">Usage</a>
            <a href="#notes-tips" onClick={(e)=>{e.preventDefault(); scrollToId('notes-tips');}} className="hover:text-foreground">Notes & Tips</a>
            <a href="#troubleshooting" onClick={(e)=>{e.preventDefault(); scrollToId('troubleshooting');}} className="hover:text-foreground">Troubleshooting</a>
            <a href="#browser-compatibility" onClick={(e)=>{e.preventDefault(); scrollToId('browser-compatibility');}} className="hover:text-foreground">Browser compatibility</a>
            <a href="#privacy-safety" onClick={(e)=>{e.preventDefault(); scrollToId('privacy-safety');}} className="hover:text-foreground">Privacy & Safety</a>
            <a href="#best-practices" onClick={(e)=>{e.preventDefault(); scrollToId('best-practices');}} className="hover:text-foreground">Best practices</a>
            <a href="#quick-start" onClick={(e)=>{e.preventDefault(); scrollToId('quick-start');}} className="hover:text-foreground">Quick start</a>
            <a href="#faq" onClick={(e)=>{e.preventDefault(); scrollToId('faq');}} className="hover:text-foreground">FAQ</a>
            {tocExpanded && (
              <>
                <a href="#field-mapping" onClick={(e)=>{e.preventDefault(); scrollToId('field-mapping');}} className="hover:text-foreground">Field mapping</a>
                <a href="#browser-tips" onClick={(e)=>{e.preventDefault(); scrollToId('browser-tips');}} className="hover:text-foreground">Browser tips</a>
                <a href="#security-data-flow" onClick={(e)=>{e.preventDefault(); scrollToId('security-data-flow');}} className="hover:text-foreground">Security & Data</a>
                <a href="#limitations" onClick={(e)=>{e.preventDefault(); scrollToId('limitations');}} className="hover:text-foreground">Limitations</a>
                <a href="#playbook" onClick={(e)=>{e.preventDefault(); scrollToId('playbook');}} className="hover:text-foreground">Playbook</a>
                <a href="#accessibility" onClick={(e)=>{e.preventDefault(); scrollToId('accessibility');}} className="hover:text-foreground">Accessibility</a>
                <a href="#troubleshooting-tree" onClick={(e)=>{e.preventDefault(); scrollToId('troubleshooting-tree');}} className="hover:text-foreground">Troubleshooting tree</a>
              </>
            )}
          </div>
        </div>
        <Card className="p-6 space-y-6">
          {/* Overview */}
          <div className="space-y-2">
            <h2 id="overview" className="text-xl font-semibold scroll-mt-24">What it does</h2>
            <p className="text-muted-foreground">
              The Opptym bookmarklet saves time by automatically filling common fields (name, URL, description, keywords) on directory submission pages using your project information stored in the dashboard.
              This reduces manual typing, improves consistency, and helps you submit faster across multiple sites.
            </p>
            <div>
              <Button variant="link" size="sm" onClick={() => scrollToId('install')}>Skip to installation</Button>
            </div>
          </div>

          {/* Install Instructions */}
          <div className="space-y-2">
            <h3 id="install" className="text-lg font-semibold scroll-mt-24">How to install</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Open the homepage and find the Bookmarklet Generator section.</li>
              <li>Drag the bookmarklet button to your browser’s bookmarks bar.</li>
              <li>Optional: Right‑click the saved bookmarklet and choose “Rename” to set your preferred label.</li>
            </ol>
            <div className="mt-2">
              <Button variant="link" size="sm" onClick={() => scrollToId('usage')}>Next: Usage</Button>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="space-y-2">
            <h3 id="usage" className="text-lg font-semibold scroll-mt-24">How to use</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Open any directory submission form page.</li>
              <li>Click the Opptym bookmarklet from your bookmarks bar.</li>
              <li>It will auto‑fill the fields it recognizes based on standard input names.</li>
              <li>Review the filled data and submit the form.</li>
            </ol>
          </div>

          {/* Notes & Tips */}
          <div className="space-y-2">
            <h3 id="notes-tips" className="text-lg font-semibold scroll-mt-24">Notes & Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Some browsers show a generic icon or name for bookmarklets. This is normal and does not affect functionality.</li>
              <li>If fields don’t fill, ensure your project has up‑to‑date details (name, URL, description, keywords) and the page uses standard input names.</li>
              <li>Corporate or privacy settings may block custom icons; functionality remains unaffected.</li>
              <li>You can rename the bookmarklet in your bookmarks bar for clarity.</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="space-y-2">
            <h3 id="troubleshooting" className="text-lg font-semibold scroll-mt-24">Troubleshooting</h3>
            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => toggleAllAccordions(true)}>Expand all</Button>
              <Button variant="outline" size="sm" onClick={() => toggleAllAccordions(false)}>Collapse all</Button>
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Fields not filling: Check the form uses standard labels like “name”, “url”, “website”, “description”, “keywords”. Some sites use custom field names we may not recognize.</li>
              <li>Nothing happens on click: Make sure the bookmarklet was correctly saved from the generator and you’re clicking it on a form page (not a plain content page).</li>
              <li>Data looks outdated: Update your project details in the Dashboard and try again on the next page.</li>
              <li>Permissions: Some browsers or extensions can block bookmarklet execution; temporarily disable blockers to test.</li>
            </ul>
          </div>

          {/* Browser Compatibility */}
          <div className="space-y-2">
            <h3 id="browser-compatibility" className="text-lg font-semibold scroll-mt-24">Browser compatibility</h3>
            <p className="text-muted-foreground">
              Works on modern desktop browsers that support bookmarks bars and JavaScript bookmarklets (Chrome, Edge, Firefox, Safari). Mobile browsers may limit bookmarklet usage.
            </p>
          </div>

          {/* Privacy & Safety */}
          <div className="space-y-2">
            <h3 id="privacy-safety" className="text-lg font-semibold scroll-mt-24">Privacy & safety</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The bookmarklet only auto‑fills forms on pages you open and never posts data without your click.</li>
              <li>It uses the project data you’ve stored in the dashboard; you control and can update this at any time.</li>
              <li>No custom icons are required; visual appearance may vary by browser, but functionality remains the same.</li>
            </ul>
          </div>

          {/* Best Practices */}
          <div className="space-y-2">
            <h3 id="best-practices" className="text-lg font-semibold scroll-mt-24">Best practices</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Verify entries before submission to match each directory’s guidelines.</li>
              <li>Keep your project details up‑to‑date for accurate auto‑fill.</li>
              <li>Rename the bookmarklet for clarity (e.g., “Opptym Auto‑Fill”).</li>
            </ul>
          </div>

          {/* Quick Start Checklist */}
          <div className="space-y-2">
            <h3 id="quick-start" className="text-lg font-semibold scroll-mt-24">Quick start checklist</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Bookmarks bar visible (Chrome/Edge: Cmd+Shift+B; Firefox: View → Toolbars → Bookmarks Toolbar; Safari: View → Show Favorites Bar).</li>
              <li>Drag the bookmarklet to your bookmarks bar.</li>
              <li>Open a directory submission form and click the bookmarklet.</li>
              <li>Review autofilled fields, add any missing required items, and submit.</li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="space-y-2">
            <h3 id="faq" className="text-lg font-semibold scroll-mt-24">FAQ</h3>
            <div className="space-y-2">
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">Why does the bookmarklet look generic?</summary>
                <p className="mt-2 text-muted-foreground">Browsers often render bookmarklets with default icons and names. This is normal and does not impact functionality. You can rename it after saving.</p>
              </details>
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">Does it submit forms automatically?</summary>
                <p className="mt-2 text-muted-foreground">No. It only auto‑fills fields to save you time. You stay in control and click Submit.</p>
              </details>
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">What data does it use?</summary>
                <p className="mt-2 text-muted-foreground">It uses your saved project details from the dashboard (e.g., name, URL, description, keywords). Update these anytime to change what gets filled.</p>
              </details>
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">Will it work on every site?</summary>
                <p className="mt-2 text-muted-foreground">Most standard forms work. Some sites use non‑standard field names or custom components, which may require manual entry.</p>
              </details>
            </div>
          </div>

          {/* Advanced Field Mapping */}
          <div className="space-y-2">
            <h3 id="field-mapping" className="text-lg font-semibold">Advanced field mapping (what we look for)</h3>
            <p className="text-muted-foreground">The bookmarklet typically recognizes common input names and labels. Coverage varies by site.</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Names and titles: name, title, company, business</li>
              <li>URLs: url, website, site</li>
              <li>Descriptions: description, about, summary</li>
              <li>Keywords/tags: keywords, tags</li>
              <li>Contact (if present): email, phone</li>
              <li>Location (if present): address, city, state, country</li>
              <li>Category (if present): category, industry</li>
            </ul>
          </div>

          {/* Site-specific field mapping examples */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Site‑specific field mapping examples</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><span className="font-medium">Yelp Business</span>: Business name, website, description, category, address, phone.</li>
              <li><span className="font-medium">Google My Business</span>: Business name, website, description, category, address, hours.</li>
              <li><span className="font-medium">PRWeb/PR Newswire</span>: Title, summary/description, website link, keywords/tags.</li>
              <li><span className="font-medium">Reddit/Digg</span>: Title, URL, description; choose a relevant subreddit/category.</li>
              <li><span className="font-medium">Product Hunt</span>: Name/title, tagline, website, description, category/tags.</li>
              <li><span className="font-medium">G2/Capterra</span>: Product name, website, description, category, pricing tier, contacts.</li>
              <li><span className="font-medium">LinkedIn Company Page</span>: Company name, website, description, industry, size, location.</li>
              <li><span className="font-medium">Hacker News</span>: Title and URL; optional text, ensure concise title.</li>
            </ul>
          </div>

          {/* Browser Tips */}
          <div className="space-y-2">
            <h3 id="browser-tips" className="text-lg font-semibold scroll-mt-24">Browser tips</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Show bookmarks bar:
                <span className="block pl-4">Chrome/Edge: Cmd+Shift+B (Mac) or Ctrl+Shift+B (Windows)</span>
                <span className="block pl-4">Firefox: View → Toolbars → Bookmarks Toolbar → Always Show</span>
                <span className="block pl-4">Safari: View → Show Favorites Bar</span>
              </li>
              <li>Rename a bookmark: Right‑click the bookmarklet in the bar and choose Rename.</li>
            </ul>

            {/* Browser mini‑guides as Tabs */}
            <Tabs defaultValue="chrome" className="mt-3">
              <TabsList>
                <TabsTrigger value="chrome">Chrome / Edge</TabsTrigger>
                <TabsTrigger value="firefox">Firefox</TabsTrigger>
                <TabsTrigger value="safari">Safari</TabsTrigger>
              </TabsList>
              <TabsContent value="chrome" className="border rounded-lg p-3 mt-2">
                <h4 className="font-medium">Chrome / Edge</h4>
                <svg viewBox="0 0 200 120" className="w-full h-24">
                  <rect x="5" y="5" width="190" height="110" rx="8" fill="currentColor" className="text-muted/40" />
                  <rect x="15" y="20" width="170" height="12" rx="3" fill="currentColor" className="text-muted-foreground/30" />
                  <rect x="15" y="40" width="90" height="10" rx="2" fill="currentColor" className="text-blue-400/60" />
                  <text x="20" y="48" fontSize="8" fill="currentColor" className="text-blue-700">Drag bookmarklet here</text>
                </svg>
                <p className="text-xs text-muted-foreground mt-2">Show bookmarks bar, then drag the generator button into the bar.</p>
              </TabsContent>
              <TabsContent value="firefox" className="border rounded-lg p-3 mt-2">
                <h4 className="font-medium">Firefox</h4>
                <svg viewBox="0 0 200 120" className="w-full h-24">
                  <rect x="5" y="5" width="190" height="110" rx="8" fill="currentColor" className="text-muted/40" />
                  <rect x="15" y="20" width="170" height="12" rx="3" fill="currentColor" className="text-muted-foreground/30" />
                  <rect x="15" y="55" width="140" height="10" rx="2" fill="currentColor" className="text-green-400/60" />
                  <text x="20" y="63" fontSize="8" fill="currentColor" className="text-green-700">Bookmarks Toolbar</text>
                </svg>
                <p className="text-xs text-muted-foreground mt-2">Enable Bookmarks Toolbar (Always Show), then drag to it.</p>
              </TabsContent>
              <TabsContent value="safari" className="border rounded-lg p-3 mt-2">
                <h4 className="font-medium">Safari</h4>
                <svg viewBox="0 0 200 120" className="w-full h-24">
                  <rect x="5" y="5" width="190" height="110" rx="8" fill="currentColor" className="text-muted/40" />
                  <rect x="15" y="20" width="170" height="10" rx="2" fill="currentColor" className="text-muted-foreground/30" />
                  <rect x="15" y="35" width="120" height="10" rx="2" fill="currentColor" className="text-purple-400/60" />
                  <text x="20" y="43" fontSize="8" fill="currentColor" className="text-purple-700">Favorites Bar</text>
                </svg>
                <p className="text-xs text-muted-foreground mt-2">Show Favorites Bar, then drag the generator button to it.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Security & Data Flow */}
          <div className="space-y-2">
            <h3 id="security-data-flow" className="text-lg font-semibold">Security & data flow</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Runs locally in your browser; no auto‑submission occurs without your action.</li>
              <li>Uses your authenticated session to access project data when needed.</li>
              <li>Does not store credentials or send data to third parties.</li>
            </ul>
          </div>

          {/* Known Limitations & Workarounds */}
          <div className="space-y-2">
            <h3 id="limitations" className="text-lg font-semibold">Known limitations & workarounds</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Non‑standard fields or custom UI may not auto‑fill: manually enter key details and consider reporting the site for improvement.</li>
              <li>Dynamic forms (React/Vue) may require focusing the field after autofill: click into a field to trigger validation.</li>
              <li>iFrames or embedded forms can block access: open the direct submission page when possible.</li>
              <li>Enterprise blockers can restrict bookmarklets: test with extensions disabled or on an allowed browser.</li>
            </ul>
          </div>

          {/* Common Submissions Playbook */}
          <div className="space-y-2">
            <h3 id="playbook" className="text-lg font-semibold">Common submissions playbook</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Log in to the directory and navigate to the submission form.</li>
              <li>Click the bookmarklet to auto‑fill standard fields.</li>
              <li>Add category‑specific fields and attachments (logos/images) if required.</li>
              <li>Double‑check accuracy, ensure no duplicates, and submit.</li>
            </ol>
            <div className="mt-2">
              <Button variant="link" size="sm" onClick={() => scrollToId('faq')}>Next: FAQ</Button>
            </div>
          </div>

          {/* Accessibility & Compliance */}
          <div className="space-y-2">
            <h3 id="accessibility" className="text-lg font-semibold">Accessibility & compliance</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The bookmarklet respects your browser and site constraints; it does not bypass consent or security gates.</li>
              <li>Manual review ensures compliance with each directory’s unique requirements.</li>
            </ul>
          </div>

          {/* Troubleshooting Decision Tree */}
          <div className="space-y-2">
            <h3 id="troubleshooting-tree" className="text-lg font-semibold">Troubleshooting decision tree</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Did the bookmarklet click do anything? If not, confirm it’s saved correctly and you’re on a form page.</li>
              <li>Are any fields filled? If none, the site may use non‑standard names; fill manually.
                <span className="block pl-4">If some are filled, focus each required field to trigger validation.</span>
              </li>
              <li>Is data outdated? Update your project in the dashboard, then try on the next submission page.</li>
              <li>Still blocked? Try disabling extensions that may prevent bookmarklets or use another browser.</li>
            </ol>
          </div>

          {/* Troubleshooting (accordion) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Troubleshooting (accordion)</h3>
            <div className="space-y-2">
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">Fields not filling</summary>
                <p className="mt-2 text-muted-foreground">Check that the form uses standard labels like “name”, “url”, “website”, “description”, “keywords”. Some sites use custom names or scripts.</p>
              </details>
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">Nothing happens on click</summary>
                <p className="mt-2 text-muted-foreground">Ensure the bookmarklet is saved correctly and you’re clicking it on a submission form page.</p>
              </details>
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">Data looks outdated</summary>
                <p className="mt-2 text-muted-foreground">Update your project details in the Dashboard and try again on the next page.</p>
              </details>
              <details className="rounded-md border p-3 bg-muted/30">
                <summary className="font-medium cursor-pointer">Permissions or blockers</summary>
                <p className="mt-2 text-muted-foreground">Extensions or enterprise policies may block bookmarklets. Temporarily disable blockers or test in another browser.</p>
              </details>
            </div>
          </div>
        </Card>

        {/* Floating Back to Top */}
        <Button className="fixed bottom-6 right-6 z-50" variant="default" onClick={() => scrollToId('overview')}>
          Back to top
        </Button>
      </div>
    </DashboardLayout>
  )
}