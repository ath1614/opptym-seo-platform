"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  Link as LinkIcon
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
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
    name: 'Backlinks',
    href: '/dashboard/backlinks',
    icon: LinkIcon,
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

  return (
    <div className={cn(
      "flex h-full flex-col bg-card border-r transition-all duration-300",
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
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
        
        {/* Admin Panel Link */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <p>Opptym SEO Platform</p>
            <p>v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  )
}
