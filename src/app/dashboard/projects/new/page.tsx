"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ProjectForm } from '@/components/projects/project-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface UsageStats {
  plan: string
  limits: {
    projects: number | 'unlimited'
    submissions: number | 'unlimited'
    seoTools: number | 'unlimited'
    backlinks: number | 'unlimited'
    reports: number | 'unlimited'
  }
  usage: {
    projects: number
    submissions: number
    seoTools: number
    backlinks: number
    reports: number
  }
  isAtLimit: {
    projects: boolean
    submissions: boolean
    seoTools: boolean
    backlinks: boolean
    reports: boolean
  }
}

export default function NewProjectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsageStats()
    }
  }, [status])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/dashboard/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = () => {
    showToast({
      title: 'Upgrade Required',
      description: 'You have reached your project limit. Upgrade your plan to create more projects.',
      variant: 'destructive'
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Check if user has reached project limit
  if (usageStats?.isAtLimit.projects) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Project Limit Reached</h1>
              <p className="text-muted-foreground">
                You have reached your project limit for your current plan
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span>Upgrade Required</span>
              </CardTitle>
              <CardDescription>
                You have used {usageStats.usage.projects} out of {usageStats.limits.projects} projects allowed on your {usageStats.plan} plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Usage:</h3>
                <div className="text-sm text-muted-foreground">
                  <div>Projects: {usageStats.usage.projects}/{usageStats.limits.projects}</div>
                  <div>Plan: {usageStats.plan.charAt(0).toUpperCase() + usageStats.plan.slice(1)}</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={handleUpgrade} className="flex-1">
                  Upgrade Plan
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/projects')}>
                  Back to Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ProjectForm />
    </DashboardLayout>
  )
}
