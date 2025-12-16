"use client"

import React from 'react'

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">Opptym SEO Platform Documentation</h1>
      <p className="text-muted-foreground mb-6">
        Complete guide to using Opptym SEO Platform for optimizing your website's search engine performance.
      </p>
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">🚀 Getting Started</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">1. Create Your Account</h3>
              <p className="text-muted-foreground">Sign up for a free account to access our comprehensive SEO tools and start optimizing your website.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">2. Set Up Your First Project</h3>
              <p className="text-muted-foreground">Create a project for your website to organize your SEO efforts and track progress across different domains.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">3. Run Your First Analysis</h3>
              <p className="text-muted-foreground">Use our website analyzer to get instant insights into your site's SEO performance and identify improvement opportunities.</p>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">🛠️ SEO Tools Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Meta Tag Analyzer</h3>
              <p className="text-sm text-muted-foreground">Analyze and optimize your page titles, descriptions, and meta tags for better search visibility.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Broken Link Scanner</h3>
              <p className="text-sm text-muted-foreground">Find and fix broken links that hurt user experience and SEO rankings.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Page Speed Analyzer</h3>
              <p className="text-sm text-muted-foreground">Test your website's loading speed and get recommendations for performance improvements.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Keyword Research Tool</h3>
              <p className="text-sm text-muted-foreground">Discover high-value keywords and analyze competition to improve your content strategy.</p>
            </div>
          </div>
        </section>

        {/* 1️⃣ SEO Fundamentals */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1️⃣ SEO Fundamentals</h2>
          <h3 className="text-lg font-medium text-foreground">Learning Objectives</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Understand crawling, indexing, and ranking.</li>
            <li>Identify search intent and map content accordingly.</li>
            <li>Apply on-page and technical basics to improve visibility.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Concepts</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li><span className="text-foreground font-medium">Crawl → Index → Rank:</span> How search engines discover and evaluate pages.</li>
            <li><span className="text-foreground font-medium">Search Intent:</span> Informational, Navigational, Transactional/Commercial.</li>
            <li><span className="text-foreground font-medium">On-Page SEO:</span> Titles, meta descriptions, headings, body copy, internal links.</li>
            <li><span className="text-foreground font-medium">Technical SEO:</span> Site speed, mobile-first, sitemaps, robots.txt, canonical tags.</li>
            <li><span className="text-foreground font-medium">Link Equity:</span> Internal linking and backlinks as authority signals.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Examples</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Rewrite a title tag to include intent-aligned keywords and a clear value.</li>
            <li>Add 3 internal links from related posts to a target article.</li>
            <li>Compress hero image and set descriptive `alt` text.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Practical Exercises</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Build a keyword list with intent categories for one page.</li>
            <li>Create an on-page checklist and apply it to a blog post.</li>
            <li>Generate an XML sitemap and verify in Search Console.</li>
          </ul>
        </section>

        {/* 2️⃣ Advanced Strategies */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2️⃣ Advanced Strategies</h2>
          <h3 className="text-lg font-medium text-foreground">Learning Objectives</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Develop topical authority using pillar–cluster content.</li>
            <li>Leverage structured data and programmatic SEO at scale.</li>
            <li>Use internal linking and E‑E‑A‑T to strengthen rankings.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Concepts</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li><span className="text-foreground font-medium">Pillar–Cluster Architecture:</span> One pillar page supported by focused clusters.</li>
            <li><span className="text-foreground font-medium">E‑E‑A‑T:</span> Experience, Expertise, Authoritativeness, Trustworthiness signals.</li>
            <li><span className="text-foreground font-medium">Structured Data:</span> Article, FAQ, Product, HowTo schemas for rich results.</li>
            <li><span className="text-foreground font-medium">Programmatic SEO:</span> Templated pages populated with quality data.</li>
            <li><span className="text-foreground font-medium">Log Analysis:</span> Inspect crawl patterns to fix bottlenecks.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Examples</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Create a pillar page for “Technical SEO” and 5 cluster posts (e.g., Core Web Vitals, sitemaps).</li>
            <li>Add FAQ schema to a support article and validate with Rich Results Test.</li>
            <li>Build a curated internal links map from high-authority posts to new clusters.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Practical Exercises</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Design a content hub and interlink 8–10 assets using descriptive anchors.</li>
            <li>Implement JSON‑LD for a page and verify schema coverage.</li>
            <li>Draft a data model for a programmatic SEO template (fields, validation).</li>
          </ul>
        </section>

        {/* SEO Case Studies (Applied Learning) */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">SEO Case Studies (Applied Learning)</h2>
          {/* Case Study 1 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">Case Study 1: Increasing Organic Traffic by 200% for a Blog Site</h3>
            <p className="text-muted-foreground"><span className="font-semibold">Objective:</span> Boost organic traffic and keyword visibility for a content-heavy blog in the education niche.</p>
            <p className="text-foreground font-medium">Strategy:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Conducted keyword research to identify high-traffic, low-competition topics.</li>
              <li>Improved on-page SEO — optimized meta titles, headings, and content readability.</li>
              <li>Implemented internal linking to distribute link equity across posts.</li>
              <li>Added structured data (FAQ schema) to enhance search appearance.</li>
              <li>Published 2–3 SEO-optimized articles weekly.</li>
            </ul>
            <p className="text-foreground font-medium">Outcome:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>200% increase in organic sessions within 4 months.</li>
              <li>65% more keywords ranked on Google’s first page.</li>
              <li>Average session duration increased by 1.3 minutes.</li>
            </ul>
            <p className="text-muted-foreground"><span className="font-semibold">Key Takeaway:</span> Consistent, keyword-driven, and structured content can yield significant long-term traffic growth.</p>
          </div>

          {/* Case Study 2 */}
          <div className="space-y-2 mt-6">
            <h3 className="text-lg font-medium text-foreground">Case Study 2: E-Commerce SEO Success (Product Page Optimization)</h3>
            <p className="text-muted-foreground"><span className="font-semibold">Objective:</span> Increase organic visibility and sales for an online fashion store.</p>
            <p className="text-foreground font-medium">Strategy:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Optimized product titles and descriptions with target transactional keywords.</li>
              <li>Added structured data (Product schema) to show reviews and prices in search.</li>
              <li>Improved site speed and mobile UX to boost conversions.</li>
              <li>Built backlinks from fashion blogs and influencers.</li>
              <li>Created SEO landing pages for each product category.</li>
            </ul>
            <p className="text-foreground font-medium">Outcome:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>145% increase in organic sales within 6 months.</li>
              <li>80% more impressions in Google Search Console.</li>
              <li>Bounce rate reduced by 25%.</li>
            </ul>
            <p className="text-muted-foreground"><span className="font-semibold">Key Takeaway:</span> Combining on-page SEO, structured data, and UX optimization can directly boost e-commerce sales.</p>
          </div>

          {/* Case Study 3 */}
          <div className="space-y-2 mt-6">
            <h3 className="text-lg font-medium text-foreground">Case Study 3: Local SEO Growth for a Small Business</h3>
            <p className="text-muted-foreground"><span className="font-semibold">Objective:</span> Help a local restaurant chain appear in Google’s “Local Pack” and improve local search rankings.</p>
            <p className="text-foreground font-medium">Strategy:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Created and verified Google Business Profiles for all branches.</li>
              <li>Collected customer reviews and responded regularly.</li>
              <li>Optimized NAP (Name, Address, Phone) consistency across local directories.</li>
              <li>Added location-specific content and schema to their website.</li>
              <li>Built local backlinks from city blogs and event pages.</li>
            </ul>
            <p className="text-foreground font-medium">Outcome:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Appeared in Google’s Top 3 Local Pack for 10 major keywords.</li>
              <li>110% increase in calls and direction requests from Google Maps.</li>
              <li>60% growth in local organic traffic.</li>
            </ul>
            <p className="text-muted-foreground"><span className="font-semibold">Key Takeaway:</span> Local SEO requires consistency, reputation management, and geographically targeted optimization.</p>
          </div>

          {/* Case Study 4 */}
          <div className="space-y-2 mt-6">
            <h3 className="text-lg font-medium text-foreground">Case Study 4: Recovering from a Google Penalty</h3>
            <p className="text-muted-foreground"><span className="font-semibold">Objective:</span> Recover rankings for a travel blog penalized due to spammy backlinks.</p>
            <p className="text-foreground font-medium">Strategy:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Used Google Search Console to identify harmful backlinks.</li>
              <li>Disavowed over 1,200 toxic links.</li>
              <li>Removed duplicate and thin content.</li>
              <li>Published high-quality, original blog posts with topic authority.</li>
              <li>Implemented a content freshness strategy (updating older articles).</li>
            </ul>
            <p className="text-foreground font-medium">Outcome:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Site recovered from penalty in 3 months.</li>
              <li>Regained 90% of lost traffic.</li>
              <li>Domain authority improved by 12 points.</li>
            </ul>
            <p className="text-muted-foreground"><span className="font-semibold">Key Takeaway:</span> Quality and trust are vital — cleaning up spammy links and updating content restores credibility.</p>
          </div>

          {/* Case Study 5 */}
          <div className="space-y-2 mt-6">
            <h3 className="text-lg font-medium text-foreground">Case Study 5: SaaS Company SEO — Boosting B2B Leads</h3>
            <p className="text-muted-foreground"><span className="font-semibold">Objective:</span> Increase inbound leads for a SaaS platform offering marketing automation tools.</p>
            <p className="text-foreground font-medium">Strategy:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Performed keyword mapping for each feature and benefit.</li>
              <li>Created educational content (blogs, guides, and videos).</li>
              <li>Implemented pillar-cluster content structure to boost topical authority.</li>
              <li>Built case study backlinks and guest posts from tech sites.</li>
              <li>Used conversion tracking to measure SEO-driven sign-ups.</li>
            </ul>
            <p className="text-foreground font-medium">Outcome:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>120% increase in demo requests from organic search.</li>
              <li>80 new backlinks from authority tech blogs.</li>
              <li>40% increase in organic traffic within 5 months.</li>
            </ul>
            <p className="text-muted-foreground"><span className="font-semibold">Key Takeaway:</span> A strong content strategy built around user intent and authority can turn SEO traffic into real B2B leads.</p>
          </div>
        </section>

        {/* 4️⃣ Video Tutorials */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4️⃣ Video Tutorials</h2>
          <h3 className="text-lg font-medium text-foreground">Learning Objectives</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Follow step‑by‑step walkthroughs for key SEO workflows.</li>
            <li>Translate concepts into hands‑on implementation.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Concepts</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Keyword research live demo.</li>
            <li>On‑page optimization checklist run‑through.</li>
            <li>Structured data implementation and validation.</li>
            <li>Internal linking strategy builder.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Examples</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Short video: optimize a blog post title, meta, and headings.</li>
            <li>Screen‑share: add FAQ schema and test with Google tools.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Practical Exercises</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Record your own 5‑minute optimization demo for one page.</li>
            <li>Create a checklist from the video and apply it to 3 URLs.</li>
          </ul>
          <p className="text-muted-foreground mt-3">Note: Embedded tutorials will be added soon.</p>
        </section>

        {/* 5️⃣ Best Practices */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5️⃣ Best Practices</h2>
          <h3 className="text-lg font-medium text-foreground">Learning Objectives</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Apply modern, sustainable SEO methods.</li>
            <li>Avoid black‑hat pitfalls and penalties.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Concepts</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>User intent and content quality.</li>
            <li>Mobile‑first and page speed fundamentals.</li>
            <li>Structured data and internal linking hygiene.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Examples</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Convert a generic article into an intent‑aligned, scannable guide.</li>
            <li>Measure and improve LCP/CLS with image optimization.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Practical Exercises</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Run a best‑practices audit on one page; log fixes and outcomes.</li>
            <li>Add structured data to 2 pages and monitor CTR changes.</li>
          </ul>
          <p className="text-muted-foreground mt-3">See the full guide: <a href="/seo-tips" className="text-primary hover:underline">SEO Tips</a>.</p>
        </section>

        {/* 6️⃣ SEO News */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6️⃣ SEO News</h2>
          <h3 className="text-lg font-medium text-foreground">Learning Objectives</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Stay current with algorithm updates and industry trends.</li>
            <li>Vet news sources and translate updates into actions.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Concepts</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Official channels: Google Search Central blog, documentation.</li>
            <li>Reputable media: Search Engine Journal, Search Engine Land, Moz.</li>
            <li>Change management: assessing impact and prioritizing fixes.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Examples</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
            <li>Respond to a core update by auditing content quality and helpfulness.</li>
            <li>Update schema across product pages to match new guidelines.</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground">Practical Exercises</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Create a news watchlist and summarize monthly changes.</li>
            <li>Run a quarterly technical audit and track regression fixes.</li>
          </ul>
        </section>

        {/* Reference to SEO Tips (moved below Best Practices) */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">More SEO Tips</h2>
          <p className="text-muted-foreground">Explore comprehensive recommendations in our <a href="/seo-tips" className="text-primary hover:underline">SEO Tips</a> guide.</p>
        </section>
      </div>
    </div>
  )
}