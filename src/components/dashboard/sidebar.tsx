"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  CheckSquare,
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Shield,
  Link as LinkIcon,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'SEO Tools',
    href: '/dashboard/seo-tools',
    icon: Search,
  },
  {
    name: 'SEO Tasks',
    href: '/dashboard/seo-tasks',
    icon: CheckSquare,
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    name: 'Pricing',
    href: '/dashboard/pricing',
    icon: CreditCard,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const isAdmin = (session?.user as any)?.role === 'admin'
  const user = session?.user as any
  const initials = (user?.name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  // Keep a global CSS var in sync so layout can react to collapse state
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const width = isCollapsed ? '4rem' : '16rem'
      document.documentElement.style.setProperty('--sidebar-width', width)
    }
  }, [isCollapsed])

  // Initialize var on first render
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-width', '16rem')
    }
  }, [])

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed ? (
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Opptym SEO Platform"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <span className="font-semibold text-foreground">Opptym SEO</span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center justify-center w-full hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Opptym SEO Platform"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-2 overflow-y-auto", isCollapsed ? "p-2" : "p-4")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={cn(
                "rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "flex items-center justify-center p-2" : "flex items-center space-x-3 px-3 py-2",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
        
        {/* Bottom Bookmarklet Tab */}
        <div className="mt-6">
          <Link
            href="/dashboard/bookmarklet"
            title="Bookmarklet"
            className={cn(
              "rounded-lg text-sm font-medium transition-colors",
              isCollapsed ? "flex items-center justify-center p-2" : "flex items-center space-x-3 px-3 py-2",
              pathname === '/dashboard/bookmarklet'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LinkIcon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Bookmarklet</span>}
          </Link>
        </div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            title="Admin Panel"
            className={cn(
              "rounded-lg text-sm font-medium transition-colors",
              isCollapsed ? "flex items-center justify-center p-2" : "flex items-center space-x-3 px-3 py-2",
              pathname.startsWith('/dashboard/admin')
                ? "bg-red-100 text-red-700 border border-red-200"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* Sticky Footer */}
      <div className="p-3 border-t">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-2">
            {/* Compact actions (icons only) */}
            <Link href="/dashboard/profile" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/account" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted">
              <Settings className="h-5 w-5" />
            </Link>
            <Link href="/contact" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted">
              <HelpCircle className="h-5 w-5" />
            </Link>
            <div className="flex items-center justify-center w-10 h-10">
              <ThemeToggle />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* User mini-profile */}
            <Link href="/dashboard/profile" className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                )}
              </div>
            </Link>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/account" className="flex items-center space-x-2 rounded-md p-2 text-sm hover:bg-muted transition-colors">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <Link href="/contact" className="flex items-center space-x-2 rounded-md p-2 text-sm hover:bg-muted transition-colors">
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </Link>
              <div className="flex items-center space-x-2 rounded-md p-2 text-sm hover:bg-muted transition-colors">
                <ThemeToggle />
                <span>Theme</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 rounded-md p-2 text-sm hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            <div className="pt-2 text-[10px] text-muted-foreground text-center">
              <p>Opptym SEO Platform</p>
              <p>v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
// Remove stray admin block outside component
