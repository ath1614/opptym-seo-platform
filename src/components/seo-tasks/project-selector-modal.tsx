"use client"

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Building, Globe, Mail, Phone, ExternalLink, CheckCircle, Loader2 } from 'lucide-react'

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

interface BookmarkletData {
  maxUsage: number
  totalSubmissions: number
  token: string
}

export function ProjectSelectorModal({ isOpen, onClose, link, onBookmarkletGenerated }: ProjectSelectorModalProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [bookmarkletGenerated, setBookmarkletGenerated] = useState(false)
  const [bookmarkletCode, setBookmarkletCode] = useState('')
  const [bookmarkletData, setBookmarkletData] = useState<BookmarkletData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { showToast } = useToast()

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    if (!isOpen) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects)
      } else {
        throw new Error(data.error || 'Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch projects',
        variant: 'destructive'
      })
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [isOpen, showToast])

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen, fetchProjects])

  // Generate secure bookmarklet
  const generateBookmarklet = async (project: Project) => {
    if (!link || !project) {
      showToast({
        title: 'Error',
        description: 'Missing project or link information',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)
    try {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 429) {
          showToast({
            title: 'Plan Limit Reached',
            description: errorData.error || 'You have reached your submission limit. Please upgrade your plan to continue.',
            variant: 'destructive'
          })
        } else if (response.status === 401) {
          showToast({
            title: 'Authentication Error',
            description: 'Please log in again to continue.',
            variant: 'destructive'
          })
        } else {
          showToast({
            title: 'Error',
            description: errorData.error || `Failed to generate bookmarklet (${response.status})`,
            variant: 'destructive'
          })
        }
        return
      }

      const data = await response.json()
      
      if (!data.token) {
        throw new Error('No token received from server')
      }

      // Create secure bookmarklet code
      const bookmarkletTitle = `🚀 Opptym Fill Form - ${project.projectName}`
      const secureBookmarkletCode = `javascript:(function(){
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', '${window.location.origin}/api/bookmarklet/script?token=${data.token}&projectId=${project._id}&linkId=${link._id}&t=' + Date.now(), true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                try {
                  console.log('Bookmarklet script preview:', xhr.responseText.slice(0, 500));
                  eval(xhr.responseText);
                } catch (evalError) {
                  console.error('Bookmarklet eval error:', evalError);
                  alert('Error executing bookmarklet: ' + (evalError && evalError.message ? evalError.message : String(evalError)));
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
          console.error('Bookmarklet request error:', error);
          alert('Error: ' + (error && error.message ? error.message : String(error)));
        }
      })();`.replace(/\s+/g, ' ').trim()

      setBookmarkletCode(secureBookmarkletCode)
      setBookmarkletData({
        maxUsage: data.maxUsage || 1,
        totalSubmissions: data.totalSubmissions || 0,
        token: data.token
      })
      setBookmarkletGenerated(true)

      // Notify parent component
      if (onBookmarkletGenerated && link) {
        onBookmarkletGenerated(link._id)
      }

      showToast({
        title: 'Bookmarklet Generated Successfully',
        description: `Secure bookmarklet created! ${data.maxUsage || 1} uses available.`,
        variant: 'success'
      })

    } catch (error) {
      console.error('Error generating bookmarklet:', error)
      showToast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate secure bookmarklet',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle generate button click
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

  // Handle modal close
  const handleClose = () => {
    setSelectedProject(null)
    setBookmarkletGenerated(false)
    setBookmarkletCode('')
    setBookmarkletData(null)
    setIsLoading(false)
    setIsGenerating(false)
    onClose()
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'default' as const
      case 'completed': return 'secondary' as const
      case 'paused': return 'outline' as const
      case 'draft': return 'secondary' as const
      default: return 'secondary' as const
    }
  }

  // Handle drag start for bookmarklet
  const handleDragStart = (e: React.DragEvent) => {
    if (!bookmarkletCode || !selectedProject) return
    const bookmarkTitle = `🚀 Opptym Fill Form - ${selectedProject.projectName}`
    e.dataTransfer.setData('text/uri-list', bookmarkletCode)
    e.dataTransfer.setData('text/plain', bookmarkletCode)
    e.dataTransfer.setData('text/html', `<a href="${bookmarkletCode}" title="${bookmarkTitle}">${bookmarkTitle}</a>`)
    try {
      // Firefox-specific: Provide URL and Title
      e.dataTransfer.setData('text/x-moz-url', `${bookmarkletCode}\n${bookmarkTitle}`)
    } catch (err) {
      // no-op
    }
  }

  // Prevent copy operations
  const preventCopy = (e: React.ClipboardEvent | React.MouseEvent) => {
    e.preventDefault()
    showToast({
      title: 'Copy Protected',
      description: 'This bookmarklet is secured and cannot be copied. Drag it to your bookmarks bar instead.',
      variant: 'destructive'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[85vh] overflow-y-auto"
        onContextMenu={bookmarkletGenerated ? preventCopy : undefined}
        onCopy={bookmarkletGenerated ? preventCopy : undefined}
        style={{ 
          userSelect: bookmarkletGenerated ? 'none' : 'auto',
          WebkitUserSelect: bookmarkletGenerated ? 'none' : 'auto'
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {link && (
              <>
                <Globe className="h-5 w-5" />
                Select Project for {link.name}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {link && `Choose a project to generate a bookmarklet that will autofill form fields on ${link.domain}`}
          </DialogDescription>
        </DialogHeader>

        {!bookmarkletGenerated ? (
          <div className="space-y-6">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading projects...</span>
              </div>
            ) : (
              <>
                {/* Project Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select a Project</h3>
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No projects found. Please create a project first.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => window.open('/dashboard/projects', '_blank')}
                      >
                        Create Project
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {projects.map((project) => (
                        <Card 
                          key={project._id} 
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedProject?._id === project._id ? 'ring-2 ring-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setSelectedProject(project)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg truncate">{project.projectName}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadgeVariant(project.status)}>
                                  {project.status}
                                </Badge>
                                {selectedProject?._id === project._id && (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </div>
                            <CardDescription className="truncate">{project.title}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 pt-0">
                            <div className="flex items-center space-x-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{project.websiteURL}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{project.email}</span>
                            </div>
                            {project.companyName && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{project.companyName}</span>
                              </div>
                            )}
                            {project.phone && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{project.phone}</span>
                              </div>
                            )}
                            {project.category && (
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {project.category}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                {projects.length > 0 && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleGenerateBookmarklet}
                      disabled={!selectedProject || isGenerating}
                      className="min-w-[200px]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        'Generate Bookmarklet'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
                Bookmarklet Ready!
              </h3>
              <p className="text-muted-foreground mb-4">
                Your secure bookmarklet has been generated for <strong>{selectedProject?.projectName}</strong>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                📌 How to Use Your Bookmarklet
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p><strong>Step 1:</strong> Drag the button below to your browser's bookmarks bar</p>
                <p><strong>Step 2:</strong> Visit any website with a form</p>
                <p><strong>Step 3:</strong> Click the bookmarklet to auto-fill the form</p>
              </div>
            </div>
            
            {/* Draggable Bookmarklet */}
            <div className="text-center space-y-4">
              <a
                href={bookmarkletCode || '#'}
                title={`🚀 Opptym Fill Form - ${selectedProject?.projectName || ''}`}
                className="inline-block bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-xl cursor-move select-none hover:from-primary/90 hover:to-primary/70 transition-all duration-200 text-lg font-semibold shadow-xl border-2 border-primary/20"
                draggable={true}
                role="button"
                tabIndex={0}
                onDragStart={handleDragStart}
                onContextMenu={preventCopy}
                onCopy={preventCopy}
                onClick={(e) => {
                  e.preventDefault()
                  showToast({
                    title: 'Drag to Bookmarks',
                    description: 'Drag this button to your bookmarks bar to install the bookmarklet.',
                  })
                }}
                style={{ 
                  userSelect: 'none', 
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
              >
                🚀 Opptym Fill Form - {selectedProject?.projectName}
                <span className="block text-xs opacity-80 mt-1">
                  {bookmarkletData?.maxUsage || 0} use{(bookmarkletData?.maxUsage || 0) !== 1 ? 's' : ''} remaining
                </span>
              </a>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">💡 Drag this button to your browser's bookmarks bar</p>
                <p className="text-xs">Right-click is disabled for security</p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                🔒 Secure & Tracked
              </h4>
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
                onClick={() => link?.submissionUrl && window.open(link.submissionUrl, '_blank')}
                className="flex items-center space-x-2"
                disabled={!link?.submissionUrl}
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
