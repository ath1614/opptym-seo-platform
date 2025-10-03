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
    ? "mx-auto mt-4 w-[min(95%,1100px)] rounded-full border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-sm"
    : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"

  return (
    <nav className={navClass}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${isLanding ? 'h-14' : 'h-16'}`}>
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo width={60} height={60} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
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

              {/* Auth Links */}
              {status === 'authenticated' ? (
                <div className="flex items-center space-x-3">
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="hidden sm:flex">
                      <User className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button size="sm" variant="destructive" className="hidden sm:flex" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button size="sm" variant="outline" className="hidden sm:flex">Log In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="hidden sm:flex">Sign Up</Button>
                  </Link>
                </div>
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

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${isLanding ? 'border-t rounded-b-3xl' : 'border-t'}` }>
              <Link
                href="/#features"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#seo-tasks"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                SEO Tasks
              </Link>
              <Link
                href="/#pricing"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/#why-choose-us"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Why Choose Us
              </Link>
              <Link
                href="/#knowledge-base"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Knowledge Base
              </Link>

              {/* Mobile Auth Links */}
              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
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
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
