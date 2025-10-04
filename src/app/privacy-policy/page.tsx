"use client"

import React from 'react'
import { Logo } from '@/components/logo'

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="flex items-center justify-between mb-8">
        <Logo width={48} height={48} showText />
      </header>

      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <div className="text-sm text-muted-foreground mb-6 space-x-4">
        <span>Effective Date: 05-09-2025</span>
        <span>Last Updated: 01-10-2025</span>
      </div>

      <p className="text-muted-foreground mb-8">
        This Privacy Policy describes how Opptym AI SEO (“Opptym”, “we”, “our”, or “us”) collects, uses, and protects the personal information you provide when using our website, application, or related services (“Services”). By using our Services, you agree to this Privacy Policy. If you do not agree, please discontinue use of our platform.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <h3 className="text-lg font-medium text-foreground mb-2">a. Personal Information</h3>
          <p className="text-muted-foreground mb-2">When you register or use our Services, we may collect:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Name, email address, and contact details</li>
            <li>Company or website name</li>
            <li>Payment and billing information (processed securely via trusted gateways)</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">b. Technical & SEO Data</h3>
          <p className="text-muted-foreground mb-2">We automatically collect:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Browser type, operating system, and device information</li>
            <li>IP address and geolocation</li>
            <li>Usage activity such as pages visited, keywords analyzed, or features used</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">c. AI & SEO Data</h3>
          <p className="text-muted-foreground">Our AI tools may analyze and process website data, including URLs, keywords, metadata, and content, solely for providing SEO recommendations and insights.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Provide and improve our AI SEO services</li>
            <li>Generate SEO insights and keyword suggestions</li>
            <li>Personalize your dashboard experience</li>
            <li>Process payments and manage subscriptions</li>
            <li>Communicate updates, offers, and support messages</li>
            <li>Ensure compliance with security and legal requirements</li>
          </ul>
          <p className="text-muted-foreground mt-3">We do not sell or rent your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Data Security</h2>
          <p className="text-muted-foreground">We use industry-standard encryption, SSL security, and secure data storage to protect your information. While we strive for maximum protection, no online platform is 100% secure. You share information at your own risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Cookies and Tracking Technologies</h2>
          <p className="text-muted-foreground mb-2">We use cookies and similar tracking technologies to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Remember user preferences</li>
            <li>Analyze website performance and user engagement</li>
            <li>Deliver relevant content and advertisements</li>
          </ul>
          <p className="text-muted-foreground mt-3">You can disable cookies through your browser settings, but some features may not function properly.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Data Retention</h2>
          <p className="text-muted-foreground mb-2">We retain your data for as long as necessary to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Provide our Services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>
          <p className="text-muted-foreground mt-3">You may request deletion of your data anytime by contacting <a href="mailto:support@opptym.com" className="underline">support@opptym.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Third-Party Services</h2>
          <p className="text-muted-foreground mb-2">We may use trusted third-party tools for:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Payment processing</li>
            <li>Email communication</li>
            <li>Analytics and performance tracking</li>
          </ul>
          <p className="text-muted-foreground mt-3">These providers are bound by confidentiality and data protection obligations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Your Rights</h2>
          <p className="text-muted-foreground mb-2">Depending on your jurisdiction, you may have rights to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Access, correct, or delete your personal data</li>
            <li>Object to data processing or marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="text-muted-foreground mt-3">To exercise your rights, email us at <a href="mailto:support@opptym.com" className="underline">support@opptym.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Children’s Privacy</h2>
          <p className="text-muted-foreground">Our Services are not intended for individuals under 18. We do not knowingly collect data from minors.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Changes to This Policy</h2>
          <p className="text-muted-foreground">We may update this Privacy Policy periodically. Updates will be posted with a revised date. Continued use of our Services constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">10. Contact Us</h2>
          <p className="text-muted-foreground">For privacy-related queries or data removal requests:</p>
          <div className="mt-2 text-muted-foreground">
            <p>Email: <a href="mailto:support@opptym.com" className="underline">support@opptym.com</a></p>
            <p>Website: <a href="https://www.opptym.com" target="_blank" rel="noopener noreferrer" className="underline">www.opptym.com</a></p>
          </div>
        </section>
      </div>
    </div>
  )
}