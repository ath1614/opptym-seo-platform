"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { 
  FolderOpen, 
  FileText, 
  Megaphone, 
  Bookmark, 
  Building, 
  Tag, 
  MoreHorizontal,
  Search,
  ExternalLink,
  RefreshCw,
  Globe,
  Filter
} from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ProjectSelectorModal } from './project-selector-modal'

interface Location {
  _id: string
  name: string
  code: string
  flag: string
  description?: string
  isActive: boolean
  priority: number
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

interface UsageStats {
  plan: string
  limits: {
    submissions: number | 'unlimited'
  }
  usage: {
    submissions: number
  }
  isAtLimit: {
    submissions: boolean
  }
}

const categoryConfig = {
  directory: {
    name: 'Directory Submission',
    icon: FolderOpen,
    color: 'bg-blue-100 text-blue-800',
    description: 'Submit your website to directories'
  },
  article: {
    name: 'Article Submission',
    icon: FileText,
    color: 'bg-green-100 text-green-800',
    description: 'Submit articles to article directories'
  },
  'press-release': {
    name: 'Press Release',
    icon: Megaphone,
    color: 'bg-purple-100 text-purple-800',
    description: 'Submit press releases to news sites'
  },
  bookmarking: {
    name: 'Bookmarking',
    icon: Bookmark,
    color: 'bg-orange-100 text-orange-800',
    description: 'Bookmark your content on social platforms'
  },
  'business-listing': {
    name: 'Business Listing',
    icon: Building,
    color: 'bg-red-100 text-red-800',
    description: 'List your business on local directories'
  },
  classified: {
    name: 'Classified',
    icon: Tag,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Post classified ads'
  },
  other: {
    name: 'More SEO',
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-800',
    description: 'Other SEO submission opportunities'
  }
}

export function SEOTasksGrid() {
  const [links, setLinks] = useState<Link[]>([])
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [generatedBookmarklets, setGeneratedBookmarklets] = useState<Set<string>>(new Set())
  const [submissionStatus, setSubmissionStatus] = useState<{
    current: number
    limit: number
    remaining: number
    isLimitReached: boolean
    isUnlimited: boolean
  } | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLinks, setTotalLinks] = useState(0)
  const [linksPerPage] = useState(20) // Show 20 links per page
  
  const { showToast } = useToast()

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/locations?active=true')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }, [])

  const fetchSubmissionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/user/submission-status')
      const data = await response.json()
      
      if (response.ok) {
        setSubmissionStatus(data.submissions)
      }
    } catch (error) {
      console.error('Failed to fetch submission status:', error)
    }
  }, [])

  const fetchLinks = useCallback(async (page: number = 1, category: string = 'all', search: string = '', location: string = 'all') => {
    try {
      setIsLoading(true)
      const offset = (page - 1) * linksPerPage
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: linksPerPage.toString(),
        offset: offset.toString(),
        _t: Date.now().toString()
      })
      
      if (category !== 'all') {
        params.append('category', category)
      }
      
      if (location !== 'all') {
        params.append('location', location)
      }
      
      if (search) {
        params.append('search', search)
      }
      
      const response = await fetch(`/api/seo-tasks/links?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setLinks(data.links)
        setFilteredLinks(data.links)
        setTotalLinks(data.total)
        setTotalPages(Math.ceil(data.total / linksPerPage))
        setCurrentPage(page)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to fetch SEO task links',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error while fetching links',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [showToast, linksPerPage])

  const fetchUsageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/usage')
      const data = await response.json()
      
      if (response.ok) {
        setUsageStats(data)
      }
    } catch {
      // Handle error silently
    }
  }, [])

  useEffect(() => {
    fetchLinks(1, selectedCategory, searchTerm)
    fetchUsageStats()
    fetchSubmissionStatus()
    fetchLocations()
  }, [fetchLinks, fetchUsageStats, fetchSubmissionStatus, fetchLocations])

  // Handle category and location change
  useEffect(() => {
    if (selectedCategory !== 'all' || selectedLocation !== 'all' || searchTerm) {
      setCurrentPage(1)
      fetchLinks(1, selectedCategory, searchTerm, selectedLocation)
    }
  }, [selectedCategory, selectedLocation, searchTerm, fetchLinks])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1)
        fetchLinks(1, selectedCategory, searchTerm)
      } else if (selectedCategory !== 'all') {
        setCurrentPage(1)
        fetchLinks(1, selectedCategory, '')
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, fetchLinks])

  const handleFillForm = (link: Link) => {
    // Check if user has reached their submission limit
    if (submissionStatus?.isLimitReached) {
      showToast({
        title: 'Submission Limit Reached',
        description: `You have used ${submissionStatus.current} of ${submissionStatus.isUnlimited ? 'unlimited' : submissionStatus.limit} submissions. ${submissionStatus.isUnlimited ? '' : 'Upgrade your plan to continue.'}`,
        variant: 'destructive'
      })
      return
    }

    // Open project selector modal
    setSelectedLink(link)
    setIsModalOpen(true)
  }

  const handleBookmarkletGenerated = (linkId: string) => {
    setGeneratedBookmarklets(prev => new Set([...prev, linkId]))
    // Refresh submission status after bookmarklet generation
    fetchSubmissionStatus()
  }

  // Add periodic refresh for submission status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubmissionStatus()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchSubmissionStatus])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchLinks(page, selectedCategory, searchTerm)
    }
  }

  const handleRefresh = () => {
    fetchLinks(currentPage, selectedCategory, searchTerm)
    fetchSubmissionStatus() // Also refresh submission status
    fetchUsageStats() // Refresh usage stats
  }

  // Note: Category stats are now handled server-side with pagination
  // We'll show total counts from the API response
  const categoryStats = {
    directory: 0,
    article: 0,
    'press-release': 0,
    bookmarking: 0,
    'business-listing': 0,
    classified: 0,
    other: 0
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
              {/* Header with Refresh Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">SEO Tasks</h2>
                  <p className="text-muted-foreground">
                    Showing {filteredLinks.length} of 1,00,000+ directories
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

      {/* Submission Status Display */}
      {submissionStatus && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium">Submissions:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    submissionStatus.isLimitReached 
                      ? 'bg-red-100 text-red-800' 
                      : submissionStatus.remaining <= 2 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {submissionStatus.current}/{submissionStatus.isUnlimited ? '∞' : submissionStatus.limit}
                  </span>
                </div>
                {!submissionStatus.isUnlimited && (
                  <div className="text-sm text-muted-foreground">
                    Remaining: {submissionStatus.remaining}
                  </div>
                )}
              </div>
              {submissionStatus.isLimitReached && (
                <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All (1,00,000+)
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const IconComponent = config.icon
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {config.name}
            </Button>
          )
        })}
      </div>

      {/* Location Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Location:</span>
        </div>
        <Button
          variant={selectedLocation === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLocation('all')}
        >
          🌍 All Locations
        </Button>
        {locations.map((location) => (
          <Button
            key={location._id}
            variant={selectedLocation === location.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLocation(location.code)}
          >
            {location.flag} {location.name}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search links by name, description, or domain..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Links Grid */}
      {filteredLinks.length === 0 ? (
        <Card className="text-center py-12">
          <CardTitle className="text-2xl mb-2">No Links Found</CardTitle>
          <CardDescription className="mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No links match your current filters.' 
              : 'No SEO task links available at the moment.'
            }
          </CardDescription>
          {(searchTerm || selectedCategory !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => {
            // Map classification to our category config
            const classificationMap: Record<string, string> = {
              'Directory Submission': 'directory',
              'Article Submission': 'article',
              'Press Release': 'press-release',
              'BookMarking': 'bookmarking',
              'Business Listing': 'business-listing',
              'Classified': 'classified',
              'More SEO': 'other'
            }
            
            const categoryKey = classificationMap[link.classification] || 'other'
            const config = categoryConfig[categoryKey as keyof typeof categoryConfig]
            const IconComponent = config.icon
            
            return (
              <Card key={link._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{link.name}</CardTitle>
                        <Badge className={config.color}>
                          {config.name}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(link.submissionUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="mt-2">
                    {link.description || `${link.classification} - ${link.category}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Domain: {link.domain}</div>
                    <div>Country: {link.country}</div>
                    <div>DA Score: {link.daScore}</div>
                    <div>Page Rank: {link.pageRank}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">Fields: </span>
                        <Badge variant="outline">{link.requiredFields.length}</Badge>
                      </div>
                      <Button 
                        onClick={() => handleFillForm(link)}
                        className="flex-1 ml-4"
                      >
                        Fill Form
                      </Button>
                    </div>
                    
                    {/* Visit Website Button - Show after bookmarklet is generated */}
                    {generatedBookmarklets.has(link._id) && (
                      <div className="pt-2 border-t">
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(link.submissionUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Website to Use Bookmarklet
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  size="default"
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(pageNum)
                      }}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                      size="default"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Project Selector Modal */}
      <ProjectSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        link={selectedLink}
        onBookmarkletGenerated={handleBookmarkletGenerated}
      />
    </div>
  )
}
