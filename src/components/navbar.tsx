"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, X, User, LogOut } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

type NavbarVariant = 'default' | 'landing'

interface NavbarProps {
  variant?: NavbarVariant
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { status } = useSession()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isLanding = variant === 'landing'
  const navClass = isLanding
    ? "mx-auto mt-6 w-[min(95%,1100px)] rounded-full border-2 border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-md"
     : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"

  return (
    <nav className={`relative ${navClass} sticky top-0 z-50`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${isLanding ? 'h-16' : 'h-16'}`}>
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo width={40} height={40} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex ml-6 items-baseline space-x-4">
              <Link
                href="/#features"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#seo-tasks"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                SEO Tasks
              </Link>
              <Link
                href="/#pricing"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/#why-choose-us"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Why Choose Us
              </Link>
              <Link
                href="/#knowledge-base"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Knowledge Base
              </Link>
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center space-x-4">
              {status === 'authenticated' ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="gap-1">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
          </div>

          {/* Mobile Controls (visible on small screens) */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`lg:hidden ${isLanding ? 'mt-2 border-t-2 border-border rounded-b-3xl bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 relative z-50 shadow-lg' : 'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-50 shadow-lg'}`}>
             <div className="px-3 py-3 space-y-1">
              <Link
                href="/#features"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#seo-tasks"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                SEO Tasks
              </Link>
              <Link
                href="/#pricing"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/#why-choose-us"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Why Choose Us
              </Link>
              <Link
                href="/#knowledge-base"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Knowledge Base
              </Link>

              {/* Mobile Auth Links */}
              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                    }}
                    className="text-left block w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            </div>
         )}
         </div>
       </div>
     </nav>
   )
 }
