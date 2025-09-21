"use client"

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  profileImage?: string | null
  role?: string
  plan?: string
  companyName?: string
}

export function ProfileDropdown() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<ExtendedUser | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            setUserData(data.user)
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
        }
      }
    }

    fetchUserData()

    // Listen for avatar updates
    const handleAvatarUpdate = () => {
      fetchUserData()
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate)
    }
  }, [session?.user?.id])

  if (!session?.user) return null

  const user = userData || (session.user as ExtendedUser)
  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-3 rounded-lg p-2 hover:bg-muted transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImage || user.image || ''} alt={user.name || ''} />
            <AvatarFallback className="text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-foreground">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.plan || 'free'} plan
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.companyName && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.companyName}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/account" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
