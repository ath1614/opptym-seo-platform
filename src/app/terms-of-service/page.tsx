"use client"

import React from 'react'
import { Logo } from '@/components/logo'

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="flex items-center justify-between mb-8">
        <Logo width={48} height={48} showText />
      </header>

      <h1 className="text-3xl font-bold text-foreground mb-2">Terms and Conditions</h1>
      <div className="text-sm text-muted-foreground mb-6">
        <p>
          <span className="font-semibold">Effective Date:</span> [05-09-2025]
        </p>
        <p>
          <span className="font-semibold">Last Updated:</span> [01-10-2025]
        </p>
      </div>
      <p className="text-muted-foreground mb-8">
        Welcome to Opptym AI SEO (“Opptym”, “we”, “our”, “us”). By accessing or using our AI-powered SEO services, tools, or website (collectively, the “Services”), you (“User”, “Customer”, or “You”) agree to be bound by these Terms and Conditions (“Terms”). Please read them carefully before using our Services. If you do not agree with these Terms, you must not use our Services.
      </p>

      <div className="space-y-8">
        {/* 1. Acceptance of Terms */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-2">By registering for, accessing, or using the Services, you confirm that:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>You are at least 18 years of age or have legal capacity to enter into this agreement.</li>
            <li>You have read, understood, and agree to be bound by these Terms and our Privacy Policy.</li>
          </ul>
        </section>

        {/* 2. Services Provided */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Services Provided</h2>
          <p className="text-muted-foreground mb-2">Opptym AI SEO offers artificial intelligence–powered SEO tools and automation features including but not limited to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Keyword and content optimization</li>
            <li>Real-time SEO analysis and recommendations</li>
            <li>Automated meta tags and structured data generation</li>
            <li>Website and social media SEO enhancement</li>
          </ul>
          <p className="text-muted-foreground mt-3">We may update, modify, or discontinue features at any time without prior notice.</p>
        </section>

        {/* 3. User Responsibilities */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. User Responsibilities</h2>
          <p className="text-muted-foreground mb-2">You agree to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Provide accurate and up-to-date information during registration.</li>
            <li>Use the Services only for lawful purposes.</li>
            <li>Not engage in spamming, black-hat SEO, or any activity that violates search engine guidelines.</li>
            <li>Maintain confidentiality of your account credentials and notify us immediately of unauthorized use.</li>
          </ul>
          <p className="text-muted-foreground mt-3">You are solely responsible for the content and data you input into our system.</p>
        </section>

        {/* 4. Account and Access */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Account and Access</h2>
          <p className="text-muted-foreground mb-2">You are responsible for maintaining your account security. We are not liable for losses resulting from unauthorized access to your account caused by your negligence.</p>
          <p className="text-muted-foreground">We reserve the right to suspend or terminate accounts that violate these Terms, misuse the Services, or cause harm to other users or our platform.</p>
        </section>

        {/* 5. Payments and Subscription */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Payments and Subscription</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Certain Services may require payment or subscription.</li>
            <li>Fees, pricing, and payment terms will be displayed at checkout or during registration.</li>
            <li>All payments are final and non-refundable unless stated otherwise.</li>
            <li>We may revise prices or introduce new fees with prior notice.</li>
          </ul>
          <p className="text-muted-foreground mt-3">Failure to make timely payments may result in suspension or cancellation of your account.</p>
        </section>

        {/* 6. Intellectual Property */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Intellectual Property</h2>
          <p className="text-muted-foreground mb-2">All content, tools, algorithms, trademarks, and designs on Opptym AI SEO are the exclusive property of Opptym.</p>
          <p className="text-muted-foreground">You may not copy, modify, distribute, or reverse-engineer any part of our platform or code. You retain ownership of your own data and content submitted through the platform.</p>
        </section>

        {/* 7. AI-Generated Content Disclaimer */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. AI-Generated Content Disclaimer</h2>
          <p className="text-muted-foreground mb-2">Opptym AI SEO uses artificial intelligence to generate recommendations and content.</p>
          <p className="text-muted-foreground">While we strive for accuracy and compliance with search engine policies, results are not guaranteed. You are responsible for reviewing and verifying all AI-generated content before publishing or using it commercially.</p>
        </section>

        {/* 8. Limitation of Liability */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-2">To the fullest extent permitted by law:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Opptym is not liable for indirect, incidental, or consequential damages arising from the use or inability to use our Services.</li>
            <li>We do not guarantee specific SEO rankings, traffic increases, or revenue growth.</li>
            <li>Your use of our AI features is at your own risk and discretion.</li>
          </ul>
        </section>

        {/* 9. Termination */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Termination</h2>
          <p className="text-muted-foreground mb-2">We reserve the right to suspend or terminate your access if you:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Violate these Terms;</li>
            <li>Engage in illegal, fraudulent, or harmful behavior;</li>
            <li>Cause harm to our reputation or platform stability.</li>
          </ul>
          <p className="text-muted-foreground mt-3">Upon termination, your right to use the Services will immediately cease.</p>
        </section>

        {/* 10. Privacy Policy */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">10. Privacy Policy</h2>
          <p className="text-muted-foreground">Your use of our Services is also governed by our Privacy Policy, which explains how we collect, use, and protect your data.</p>
        </section>

        {/* 11. Third-Party Links and Integrations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">11. Third-Party Links and Integrations</h2>
          <p className="text-muted-foreground">Our Services may include links or integrations with third-party tools. We do not control or endorse third-party content, and we are not responsible for their practices.</p>
        </section>

        {/* 12. Changes to Terms */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">12. Changes to Terms</h2>
          <p className="text-muted-foreground">We may modify or update these Terms from time to time. The latest version will be posted on our website with a revised “Last Updated” date. Continued use of the Services after such changes constitutes acceptance.</p>
        </section>

        {/* 13. Governing Law */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">13. Governing Law</h2>
          <p className="text-muted-foreground">These Terms are governed by the laws of [Insert Jurisdiction/Country], without regard to its conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Insert City/Country].</p>
        </section>

        {/* 14. Contact Us */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">14. Contact Us</h2>
          <p className="text-muted-foreground mb-2">For questions or concerns about these Terms, please contact us at:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>
              Email: <a href="mailto:support@opptym.com" className="text-primary hover:underline">support@opptym.com</a>
            </li>
            <li>
              Website: <a href="https://www.opptym.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.opptym.com</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}