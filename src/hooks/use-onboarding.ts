"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if user has seen onboarding before
      const hasSeen = localStorage.getItem(`onboarding-seen-${session.user.id}`)
      
      // Check if this is a new user from the database
      const checkNewUser = async () => {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const userData = await response.json()
            if (userData.isNewUser) {
              localStorage.setItem(`is-new-user-${session.user.id}`, 'true')
              setShowOnboarding(true)
              setHasSeenOnboarding(false)
              return
            }
          }
        } catch (error) {
          console.error('Error checking user status:', error)
        }
        
        // Fallback to localStorage check
        if (!hasSeen) {
          setShowOnboarding(true)
          setHasSeenOnboarding(false)
        } else {
          setHasSeenOnboarding(true)
          setShowOnboarding(false)
        }
      }
      
      checkNewUser()
    }
  }, [session, status])

  const markOnboardingAsSeen = async () => {
    if (session?.user?.id) {
      localStorage.setItem(`onboarding-seen-${session.user.id}`, 'true')
      localStorage.removeItem(`is-new-user-${session.user.id}`)
      
      // Update database to mark user as no longer new
      try {
        await fetch('/api/user/onboarding-complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.error('Error updating onboarding status:', error)
      }
      
      setHasSeenOnboarding(true)
      setShowOnboarding(false)
    }
  }

  const showOnboardingAgain = () => {
    setShowOnboarding(true)
  }

  const hideOnboarding = () => {
    setShowOnboarding(false)
  }

  return {
    showOnboarding,
    hasSeenOnboarding,
    markOnboardingAsSeen,
    showOnboardingAgain,
    hideOnboarding
  }
}
