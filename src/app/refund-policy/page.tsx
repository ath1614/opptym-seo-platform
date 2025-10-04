"use client"

import React from 'react'
import { Logo } from '@/components/logo'

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="flex items-center justify-between mb-8">
        <Logo width={48} height={48} showText />
      </header>

      <h1 className="text-3xl font-bold text-foreground mb-2">Refund & Cancellation Policy</h1>
      <div className="text-sm text-muted-foreground mb-6 space-x-4">
        <span>Effective Date: 05-09-2025</span>
        <span>Last Updated: 01-10-2025</span>
      </div>

      <p className="text-muted-foreground mb-4">
        At Opptym AI SEO, we strive to deliver the best AI-powered SEO experience.
      </p>
      <p className="text-muted-foreground mb-8">
        Please read our refund and cancellation terms carefully before subscribing.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Subscription Plans</h2>
          <p className="text-muted-foreground">
            Our services are available through various paid subscription plans. By subscribing, you agree to
            recurring billing (monthly or annually) based on the selected plan.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Refund Eligibility</h2>
          <p className="text-muted-foreground mb-2">Refunds are available only under the following conditions:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>
              If you experience technical issues that prevent access to the service, and our support team is
              unable to resolve it within 7 business days.
            </li>
            <li>
              If you cancel within 48 hours of your first subscription purchase (first-time users only).
            </li>
          </ul>
          <p className="text-muted-foreground mt-4">Refunds will not be provided for:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>Renewal payments or plan upgrades</li>
            <li>Partially used subscription periods</li>
            <li>
              Service dissatisfaction due to SEO performance or ranking outcomes (as SEO depends on multiple
              external factors)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Cancellation Policy</h2>
          <p className="text-muted-foreground mb-2">
            You may cancel your subscription at any time from your account dashboard or by contacting support.
          </p>
          <p className="text-muted-foreground">Upon cancellation:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>You will continue to have access until the end of your billing period.</li>
            <li>No future renewals will be charged.</li>
          </ul>
          <p className="text-muted-foreground mt-3">Cancellations made after the renewal date will not be refunded.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Processing Refunds</h2>
          <p className="text-muted-foreground">
            Once approved, refunds will be processed to the original payment method within 7–10 business days.
            Transaction fees charged by payment gateways (if any) are non-refundable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Contact for Refunds and Cancellations</h2>
          <p className="text-muted-foreground">To request a refund or cancel your plan, please contact us at:</p>
          <div className="mt-2 text-muted-foreground">
            <p>Email: <a href="mailto:support@opptym.com" className="underline">support@opptym.com</a></p>
            <p>Visit: <a href="https://www.opptym.com/contact" target="_blank" rel="noopener noreferrer" className="underline">www.opptym.com/contact</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Policy Changes</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify or update this Refund Policy at any time. Updates will be reflected on
            this page.
          </p>
        </section>
      </div>
    </div>
  )
}