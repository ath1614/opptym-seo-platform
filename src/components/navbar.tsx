"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden')
      window.addEventListener('keydown', onKey)
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
      window.removeEventListener('keydown', onKey)
    }
  }, [isMenuOpen])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isLanding = variant === 'landing'
  const navClass = isLanding
    ? "mx-auto mt-2 sm:mt-6 w-full sm:w-[min(95%,1100px)] rounded-none sm:rounded-full border-0 sm:border-2 border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-md"
    : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"

  return (
    <nav className={`relative ${navClass} sticky top-0 z-[9999]`}>
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

        {/* Mobile Navigation - Fullscreen Overlay */}
        {isMenuOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] bg-black text-white overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <Logo width={28} height={28} />
                  <span className="font-semibold">Menu</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="h-8 w-8"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="px-4 py-6 space-y-4 flex-1 flex flex-col justify-center">
                <Link
                  href="/#features"
                  className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#seo-tasks"
                  className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SEO Tasks
                </Link>
                <Link
                  href="/#pricing"
                  className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/#why-choose-us"
                  className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Why Choose Us
                </Link>
                <Link
                  href="/#knowledge-base"
                  className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Knowledge Base
                </Link>
              </nav>

              <div className="border-t px-4 py-4 space-y-2 border-white/20">
                {status === 'authenticated' ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleSignOut()
                      }}
                      className="text-left block w-full px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-600/20"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-9 w-9 text-white hover:bg-white/10 rounded-md"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </nav>
  )
}
