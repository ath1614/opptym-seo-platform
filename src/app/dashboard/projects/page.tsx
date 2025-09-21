"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ProjectList } from '@/components/projects/project-list'

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
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

  return (
    <DashboardLayout>
      <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg">
        <h2 className="text-green-800 font-semibold">✅ Projects Page Loaded Successfully!</h2>
        <p className="text-green-700 text-sm">If you can see this message, the projects page is working correctly.</p>
      </div>
      <ProjectList />
    </DashboardLayout>
  )
}
