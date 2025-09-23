"use client"

import { useSession } from 'next-auth/react'
import { ProfileDropdown } from './profile-dropdown'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Link from 'next/link'

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  plan?: string
  companyName?: string
}

export function DashboardNavbar() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const user = session.user as ExtendedUser

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Welcome text */}
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-foreground">
            Welcome back, {user.name?.split(' ')[0] || 'User'}!
          </h1>
        </div>

        {/* Right side - Home, Theme Toggle, Profile */}
        <div className="flex items-center space-x-4">
          {/* Home Button (Mobile) */}
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
