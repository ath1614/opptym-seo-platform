"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { User, Settings } from 'lucide-react'

const settingsNavItems = [
  {
    title: 'Profile Settings',
    href: '/dashboard/profile',
    icon: User,
    description: 'Manage your personal information and profile'
  },
  {
    title: 'Account Settings',
    href: '/dashboard/account',
    icon: Settings,
    description: 'Security, notifications, and privacy preferences'
  }
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-1 p-1 bg-muted rounded-lg w-fit">
      {settingsNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
