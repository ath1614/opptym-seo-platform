"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ProjectForm } from '@/components/projects/project-form'
import { useToast } from '@/components/ui/toast'

interface EditProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [projectData, setProjectData] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return
    
    try {
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/projects/${projectId}?t=${Date.now()}`)
      const data = await response.json()
      
      if (response.ok) {
        setProjectData(data.project)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to fetch project data',
          variant: 'destructive'
        })
        router.push('/dashboard/projects')
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error while fetching project',
        variant: 'destructive'
      })
      router.push('/dashboard/projects')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, showToast, router])

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params
      setProjectId(id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (status === 'authenticated' && projectId) {
      fetchProjectData()
    }
  }, [status, projectId, fetchProjectData])

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

  return (
<>
      <ProjectForm projectId={projectId || undefined} initialData={projectData || undefined} />
</>
  )
}
