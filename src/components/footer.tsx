"use client"

import { Linkedin, Mail, Facebook, Instagram } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Footer() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  return (
    <footer className={cn("border-t bg-background", isDashboard ? "ml-64" : undefined)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Opptym AI SEO Platform
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              The ultimate SEO optimization platform that helps businesses improve their search engine rankings and drive organic traffic growth.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/opptym/"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
                target="_blank" rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/Opptym"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
                target="_blank" rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/opptym_ai"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
                target="_blank" rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@opptym.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            {/* Contact Details */}
            <div className="mt-6 space-y-2 text-sm text-muted-foreground max-w-md">
              <p>
                <span className="text-foreground font-semibold">Address:</span> Lakshmi Narsimha Colony, Road No.12, Dattatreya Nivas, Plot Number-591, Nagole, Hyderabad, Telangana, Bharath (India)
              </p>
              <p>
                <span className="text-foreground font-semibold">Phone:</span> +1 (909) 348-8855
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/seo-tips"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  SEO Tips
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Opptym AI SEO Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
