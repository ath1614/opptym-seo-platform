"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  CreditCard, 
  Link as LinkIcon, 
  Activity,
  BarChart3,
  Settings,
  FileText,
  Globe
} from 'lucide-react'

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Activity Log',
    href: '/dashboard/admin/activity',
    icon: Activity
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: Users
  },
  {
    title: 'Projects',
    href: '/dashboard/admin/projects',
    icon: FolderOpen
  },
  {
    title: 'Submissions',
    href: '/dashboard/admin/submissions',
    icon: FileText
  },
  {
    title: 'Locations',
    href: '/dashboard/admin/locations',
    icon: Globe
  },
  {
    title: 'Pricing Plans',
    href: '/dashboard/admin/pricing',
    icon: CreditCard
  },
  {
    title: 'SEO Directories',
    href: '/dashboard/admin/directories',
    icon: LinkIcon
  },
  {
    title: 'Analytics',
    href: '/dashboard/admin/analytics',
    icon: BarChart3
  },
  {
    title: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r shadow-lg h-screen fixed left-0 top-16 overflow-y-auto hidden md:block">
      <div className="p-4">
        <Link href="/" className="flex items-center space-x-2 mb-6 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Opptym SEO Platform"
            width={24}
            height={24}
            className="object-contain"
            priority
          />
          <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
        </Link>
        <nav className="space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
