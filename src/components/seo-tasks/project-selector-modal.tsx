"use client"

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Building, Globe, Mail, Phone, ExternalLink } from 'lucide-react'

interface Project {
  _id: string
  projectName: string
  title: string
  websiteURL: string
  email: string
  category: string
  companyName?: string
  phone?: string
  whatsapp?: string
  businessDescription?: string
  address?: {
    building?: string
    addressLine1?: string
    addressLine2?: string
    addressLine3?: string
    district?: string
    city?: string
    state?: string
    country?: string
    pincode?: string
  }
  status: 'draft' | 'active' | 'paused' | 'completed'
  createdAt: string
  updatedAt: string
}

interface Link {
  _id: string
  name: string
  domain: string
  submissionUrl: string
  classification: 'Directory Submission' | 'Article Submission' | 'Press Release' | 'BookMarking' | 'Business Listing' | 'Classified' | 'More SEO'
  category: string
  country: string
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  pageRank: number
  daScore: number
  description?: string
  isCustom: boolean
  priority: number
  spamScore: number
  isPremium: boolean
  requiresApproval: boolean
  contactEmail?: string
  submissionGuidelines?: string
  requiredFields: {
    name: string
    type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox'
    required: boolean
    placeholder?: string
    options?: string[]
    selector?: string
  }[]
  totalSubmissions: number
  successfulSubmissions: number
  rejectionRate: number
  createdAt: string
  updatedAt: string
}

interface ProjectSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  link: Link | null
  onBookmarkletGenerated?: (linkId: string) => void
}

export function ProjectSelectorModal({ isOpen, onClose, link, onBookmarkletGenerated }: ProjectSelectorModalProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [bookmarkletGenerated, setBookmarkletGenerated] = useState(false)
  const [bookmarkletCode, setBookmarkletCode] = useState('')
  const [bookmarkletData, setBookmarkletData] = useState<{maxUsage: number, totalSubmissions: number} | null>(null)
  const { showToast } = useToast()

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (response.ok) {
        setProjects(data.projects)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error while fetching projects',
        variant: 'destructive'
      })
    }
  }, [showToast])

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen, fetchProjects])

  const generateBookmarklet = async (project: Project) => {
    if (!link) return

    try {
      // Generate secure token
      const response = await fetch('/api/bookmarklet/validate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project._id,
          linkId: link._id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // Handle plan limit exceeded
          showToast({
            title: 'Plan Limit Reached',
            description: data.error || 'You have reached your submission limit. Please upgrade your plan to continue.',
            variant: 'destructive'
          })
        } else {
          showToast({
            title: 'Error',
            description: data.error || 'Failed to generate bookmarklet',
            variant: 'destructive'
          })
        }
        return
      }

      // Create secure bookmarklet that validates each use
      const bookmarkletCode = `
javascript:(function(){
  try {
    // Set bookmarklet properties for better bookmark display
    var bookmarkTitle = 'Opptym Bookmarklet - ${project.projectName}';
    var bookmarkIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwN2JmZiI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNU0yIDEybDEwIDUgMTAtNSIvPjwvc3ZnPg==';
    
    // Try to set bookmark properties (works in some browsers)
    if (window.external && window.external.AddFavorite) {
      window.external.AddFavorite(window.location.href, bookmarkTitle);
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '${window.location.origin}/api/bookmarklet/script?token=${data.token}&projectId=${project._id}&linkId=${link._id}&t=' + Date.now(), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            eval(xhr.responseText);
          } catch (evalError) {
            alert('Error executing bookmarklet: ' + evalError.message);
          }
        } else if (xhr.status === 429) {
          alert('Usage limit reached. Please upgrade your plan to continue.');
        } else if (xhr.status === 400) {
          alert('Bookmarklet expired or invalid. Please generate a new one.');
        } else {
          alert('Error loading bookmarklet: HTTP ' + xhr.status);
        }
      }
    };
    xhr.send();
  } catch (error) {
    alert('Error: ' + error.message);
  }
})();
      `.trim()

      setBookmarkletCode(bookmarkletCode)
      setBookmarkletGenerated(true)
      setBookmarkletData({
        maxUsage: data.maxUsage,
        totalSubmissions: data.totalSubmissions || 0
      })

      // Notify parent component that bookmarklet was generated
      if (onBookmarkletGenerated && link) {
        onBookmarkletGenerated(link._id)
      }

      showToast({
        title: 'Bookmarklet Generated',
        description: `Secure bookmarklet created! ${data.maxUsage} uses available. Total submissions: ${data.totalSubmissions || 0}`,
        variant: 'success'
      })

    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to generate secure bookmarklet',
        variant: 'destructive'
      })
    }
  }


  const handleGenerateBookmarklet = () => {
    if (!selectedProject) {
      showToast({
        title: 'No Project Selected',
        description: 'Please select a project first',
        variant: 'destructive'
      })
      return
    }

    generateBookmarklet(selectedProject)
  }

  const handleClose = () => {
    setSelectedProject(null)
    setBookmarkletGenerated(false)
    setBookmarkletCode('')
    setBookmarkletData(null)
    onClose()
  }

  const getStatusBadgeVariant = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'default' as const
      case 'completed': return 'secondary' as const
      case 'paused': return 'outline' as const
      case 'draft': return 'secondary' as const
      default: return 'secondary' as const
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => {
          if (bookmarkletGenerated) {
            e.preventDefault()
            showToast({
              title: 'Copy Blocked',
              description: 'Copying is disabled for security.',
              variant: 'destructive'
            })
          }
        }}
        onKeyDown={(e) => {
          if (bookmarkletGenerated) {
            // Block common copy shortcuts
            if (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'v' || e.key === 'u')) {
              e.preventDefault()
            }
            if (e.key === 'F12' || e.key === 'F2') {
              e.preventDefault()
            }
          }
        }}
        style={{ 
          userSelect: bookmarkletGenerated ? 'none' : 'auto',
          WebkitUserSelect: bookmarkletGenerated ? 'none' : 'auto'
        }}
      >
        <DialogHeader>
          <DialogTitle>Select Project for {link?.name}</DialogTitle>
          <DialogDescription>
            Choose a project to generate a bookmarklet that will autofill form fields on {link?.domain}
          </DialogDescription>
        </DialogHeader>

        {!bookmarkletGenerated ? (
          <div className="space-y-6">
            {/* Project Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select a Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Card 
                    key={project._id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedProject?._id === project._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.projectName}</CardTitle>
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription>{project.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{project.websiteURL}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{project.email}</span>
                      </div>
                      {project.companyName && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{project.companyName}</span>
                        </div>
                      )}
                      {project.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{project.phone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateBookmarklet}
                disabled={!selectedProject}
                className="min-w-[200px]"
              >
                Generate Bookmarklet
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Bookmarklet Ready!</h3>
              <p className="text-muted-foreground mb-4">
                Your secure bookmarklet has been generated for <strong>{selectedProject?.projectName}</strong>
              </p>
            </div>

            {/* Draggable Bookmarklet */}
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📌 How to Use Your Bookmarklet</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p><strong>Step 1:</strong> Drag the button below to your browser's bookmarks bar</p>
                  <p><strong>Step 2:</strong> Visit any website with a form</p>
                  <p><strong>Step 3:</strong> Click the bookmarklet to auto-fill the form</p>
                </div>
              </div>
              
              <div 
                className="inline-block bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-xl cursor-move select-none hover:from-primary/90 hover:to-primary/70 transition-all duration-200 text-lg font-semibold shadow-xl border-2 border-primary/20"
                draggable={true}
                role="button"
                tabIndex={0}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/uri-list', bookmarkletCode)
                  e.dataTransfer.setData('text/plain', bookmarkletCode)
                  e.dataTransfer.setData('text/html', `<a href="${bookmarkletCode}" title="Opptym Bookmarklet - ${selectedProject?.projectName}">🚀 Fill Form - ${selectedProject?.projectName}</a>`)
                  e.dataTransfer.effectAllowed = 'copy'
                  e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                }}
                onDrag={(e) => {
                  e.preventDefault()
                }}
                onDragEnd={(e) => {
                  e.preventDefault()
                }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  showToast({
                    title: 'Copy Protected',
                    description: 'This bookmarklet is secured and cannot be copied. Drag it to your bookmarks bar instead.',
                    variant: 'destructive'
                  })
                }}
                onSelectStartCapture={(e) => e.preventDefault()}
                onCopy={(e) => {
                  e.preventDefault()
                  showToast({
                    title: 'Copy Blocked',
                    description: 'Bookmarklet copying is disabled for security.',
                    variant: 'destructive'
                  })
                }}
                onKeyDown={(e) => {
                  // Block Ctrl+C, Ctrl+A, Ctrl+V, F12, etc.
                  if (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'v' || e.key === 'u')) {
                    e.preventDefault()
                  }
                  if (e.key === 'F12' || e.key === 'F2') {
                    e.preventDefault()
                  }
                }}
                style={{ 
                  userSelect: 'none', 
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
              >
                🚀 Fill Form - {selectedProject?.projectName}
                <span className="block text-xs opacity-80 mt-1">
                  {bookmarkletData?.maxUsage || 0} use{(bookmarkletData?.maxUsage || 0) !== 1 ? 's' : ''} remaining
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">💡 Drag this button to your browser's bookmarks bar</p>
                <p className="text-xs">Right-click is disabled for security</p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔒 Secure & Tracked</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• This bookmarklet is secured with usage tracking and expires after 24 hours</p>
                <p>• Copy protection prevents unauthorized sharing</p>
                <p>• Usage is counted against your plan's submission limits</p>
                <p>• Each successful form fill counts as one submission</p>
                <p>• <strong>This bookmarklet can only be used {bookmarkletData?.maxUsage || 0} time(s)</strong></p>
                <p>• After reaching the limit, you'll need to generate a new bookmarklet</p>
              </div>
            </div>


            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.open(link?.submissionUrl, '_blank')}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visit {link?.domain}</span>
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
