"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ProjectList } from '@/components/projects/project-list'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showTips, setShowTips] = useState(false)

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowTips((v) => !v)}>
            {showTips ? 'Hide SEO Tips' : 'Show SEO Tips'}
          </Button>
        </div>

        {showTips && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>SEO Submission Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>Fill every field for best results</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    <li>Complete all available fields — empty fields reduce trust and discoverability.</li>
                    <li>Keep NAP consistency (Name, Address, Phone) across all directories.</li>
                    <li>Use your canonical website URL with https and ensure it resolves.</li>
                    <li>Write a clear 150–250 word description; avoid keyword stuffing.</li>
                    <li>Select the most relevant categories; add tags/keywords if supported.</li>
                    <li>Upload your logo and at least one image with alt text where available.</li>
                    <li>Add business hours, location, and social profiles when fields exist.</li>
                    <li>Verify email/phone if required by the directory and confirm any confirmations.</li>
                    <li>Revisit listings periodically to update changes and keep data fresh.</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <ProjectList />
      </div>
    </DashboardLayout>
  )
}
