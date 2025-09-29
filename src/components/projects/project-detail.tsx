"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  Calendar,
  Tag,
  Search,
  Share2,
  Clock,
  User
} from 'lucide-react'

interface Project {
  _id: string
  projectName: string
  websiteUrl?: string
  description?: string
  keywords?: string[]
  targetAudience?: string
  competitors?: string[]
  goals?: string
  notes?: string
  status?: 'draft' | 'active' | 'paused' | 'completed'
  createdAt?: string
  updatedAt?: string
  // Optional fields that may not exist in all projects
  title?: string
  websiteURL?: string
  email?: string
  category?: string
  companyName?: string
  phone?: string
  whatsapp?: string
  businessDescription?: string
  businessHours?: string
  establishedYear?: number
  logoImageURL?: string
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
  seoMetadata?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    targetKeywords?: string[]
    sitemapURL?: string
    robotsURL?: string
  }
  articleSubmission?: {
    articleTitle?: string
    articleContent?: string
    authorName?: string
    authorBio?: string
    tags?: string[]
  }
  classified?: {
    productName?: string
    price?: string
    condition?: string
    productImageURL?: string
  }
  social?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  customFields?: Array<{
    key: string
    value: string
  }>
}

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { showToast } = useToast()

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()
      
      if (response.ok) {
        setProject(data.project)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to fetch project details',
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
    fetchProject()
  }, [fetchProject])

  const handleDelete = async () => {
    if (!project || !confirm(`Are you sure you want to delete "${project.projectName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        showToast({
          title: 'Project Deleted',
          description: data.message || `"${project.projectName}" has been deleted successfully.`,
          variant: 'success'
        })
        router.push('/dashboard/projects')
      } else {
        showToast({
          title: 'Error',
          description: data.message || data.error || 'Failed to delete project',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Delete project error:', error)
      showToast({
        title: 'Error',
        description: 'Network error while deleting project. Please check your connection and try again.',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Business & Industry': return 'bg-purple-100 text-purple-800'
      case 'Technology & IT': return 'bg-cyan-100 text-cyan-800'
      case 'E-Commerce & Retail': return 'bg-blue-100 text-blue-800'
      case 'Marketing & Advertising': return 'bg-pink-100 text-pink-800'
      case 'Finance & Investment': return 'bg-green-100 text-green-800'
      case 'Health & Fitness': return 'bg-red-100 text-red-800'
      case 'Education & Training': return 'bg-indigo-100 text-indigo-800'
      case 'Home & Lifestyle': return 'bg-orange-100 text-orange-800'
      case 'Startups & Innovation': return 'bg-violet-100 text-violet-800'
      case 'Travel & Tourism': return 'bg-teal-100 text-teal-800'
      case 'Food & Beverages': return 'bg-amber-100 text-amber-800'
      case 'Automobile & Transport': return 'bg-slate-100 text-slate-800'
      case 'Real Estate': return 'bg-emerald-100 text-emerald-800'
      case 'Religion & Spirituality': return 'bg-yellow-100 text-yellow-800'
      case 'Arts & Entertainment': return 'bg-fuchsia-100 text-fuchsia-800'
      case 'Jobs & Career': return 'bg-lime-100 text-lime-800'
      case 'Beauty & Fashion': return 'bg-rose-100 text-rose-800'
      case 'Science & Research': return 'bg-sky-100 text-sky-800'
      case 'Environment & Sustainability': return 'bg-green-200 text-green-900'
      case 'Government & Politics': return 'bg-gray-200 text-gray-900'
      case 'Telecommunication': return 'bg-blue-200 text-blue-900'
      case 'Legal & Law': return 'bg-neutral-100 text-neutral-800'
      case 'Events & Conferences': return 'bg-purple-200 text-purple-900'
      case 'Nonprofits & NGOs': return 'bg-teal-200 text-teal-900'
      case 'Pets & Animals': return 'bg-orange-200 text-orange-900'
      case 'Parenting & Family': return 'bg-pink-200 text-pink-900'
      case 'Personal Blogs & Hobbies': return 'bg-indigo-200 text-indigo-900'
      case 'Sports & Fitness': return 'bg-red-200 text-red-900'
      case 'Health': return 'bg-emerald-200 text-emerald-900'
      case 'Media & News': return 'bg-slate-200 text-slate-900'
      case 'Miscellaneous / General': return 'bg-gray-100 text-gray-800'
      // Legacy categories for backward compatibility
      case 'business': return 'bg-purple-100 text-purple-800'
      case 'ecommerce': return 'bg-blue-100 text-blue-800'
      case 'blog': return 'bg-green-100 text-green-800'
      case 'portfolio': return 'bg-orange-100 text-orange-800'
      case 'news': return 'bg-red-100 text-red-800'
      case 'education': return 'bg-indigo-100 text-indigo-800'
      case 'healthcare': return 'bg-pink-100 text-pink-800'
      case 'technology': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Project not found</h3>
        <p className="text-muted-foreground mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/dashboard/projects')}>
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.projectName}</h1>
            <p className="text-muted-foreground">{project.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(project.status || 'active')}>
            {project.status || 'active'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Details */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="article">Article</TabsTrigger>
          <TabsTrigger value="classified">Classified</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{project.companyName || 'Not specified'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <div className="mt-1">
                        <Badge className={getCategoryColor(project.category || 'general')}>
                          {project.category || 'General'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {(project.websiteURL || project.websiteUrl) ? (
                        <a 
                          href={project.websiteURL || project.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {project.websiteURL || project.websiteUrl}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{project.email || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{project.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {project.whatsapp && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{project.whatsapp}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1 text-sm">{project.businessDescription || project.description || 'No description available'}</p>
                  </div>

                  {/* Project-specific fields */}
                  {project.targetAudience && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Target Audience</label>
                      <p className="mt-1 text-sm">{project.targetAudience}</p>
                    </div>
                  )}

                  {project.goals && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Goals</label>
                      <p className="mt-1 text-sm">{project.goals}</p>
                    </div>
                  )}

                  {project.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="mt-1 text-sm">{project.notes}</p>
                    </div>
                  )}

                  {project.keywords && project.keywords.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.competitors && project.competitors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Competitors</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.competitors.map((competitor, index) => (
                          <Badge key={index} variant="outline">
                            {competitor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(project.businessHours || project.establishedYear) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.businessHours && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Business Hours</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{project.businessHours}</span>
                          </div>
                        </div>
                      )}
                      {project.establishedYear && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Established Year</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{project.establishedYear}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.address ? (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="space-y-1">
                        {project.address.building && <div>{project.address.building}</div>}
                        {project.address.addressLine1 && <div>{project.address.addressLine1}</div>}
                        {project.address.addressLine2 && <div>{project.address.addressLine2}</div>}
                        {project.address.addressLine3 && <div>{project.address.addressLine3}</div>}
                        {(project.address.district || project.address.city || project.address.state) && (
                          <div>
                            {[project.address.district, project.address.city, project.address.state].filter(Boolean).join(', ')}
                          </div>
                        )}
                        {(project.address.country || project.address.pincode) && (
                          <div>
                            {[project.address.country, project.address.pincode].filter(Boolean).join(' - ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>No address information available</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logo */}
              {project.logoImageURL && (
                <Card>
                  <CardHeader>
                    <CardTitle>Logo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <img 
                        src={project.logoImageURL} 
                        alt="Company Logo" 
                        className="max-w-full h-32 object-contain rounded"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Custom Fields */}
              {project.customFields && project.customFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Fields</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {project.customFields.map((field, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{field.key}:</span>
                        <span className="text-sm text-muted-foreground">{field.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.seoMetadata?.metaTitle && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                  <p className="mt-1">{project.seoMetadata.metaTitle}</p>
                </div>
              )}
              {project.seoMetadata?.metaDescription && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                  <p className="mt-1">{project.seoMetadata.metaDescription}</p>
                </div>
              )}
              {(project.seoMetadata?.keywords?.length || project.keywords?.length) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(project.seoMetadata?.keywords || project.keywords || []).map((keyword, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {project.seoMetadata?.targetKeywords?.length && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Target Keywords</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.seoMetadata.targetKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        <Search className="h-3 w-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(project.seoMetadata?.sitemapURL || project.seoMetadata?.robotsURL) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.seoMetadata?.sitemapURL && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sitemap URL</label>
                      <div className="mt-1">
                        <a 
                          href={project.seoMetadata.sitemapURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          {project.seoMetadata.sitemapURL}
                        </a>
                      </div>
                    </div>
                  )}
                  {project.seoMetadata?.robotsURL && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Robots.txt URL</label>
                      <div className="mt-1">
                        <a 
                          href={project.seoMetadata.robotsURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          {project.seoMetadata.robotsURL}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Article Tab */}
        <TabsContent value="article" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.articleSubmission?.articleTitle && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Article Title</label>
                  <p className="mt-1">{project.articleSubmission.articleTitle}</p>
                </div>
              )}
              {project.articleSubmission?.articleContent && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Article Content</label>
                  <div className="mt-1 p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{project.articleSubmission.articleContent}</p>
                  </div>
                </div>
              )}
              {project.articleSubmission?.authorName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Author</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{project.articleSubmission.authorName}</span>
                  </div>
                </div>
              )}
              {project.articleSubmission?.authorBio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Author Bio</label>
                  <p className="mt-1">{project.articleSubmission.authorBio}</p>
                </div>
              )}
              {project.articleSubmission?.tags?.length && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(project.articleSubmission?.tags || []).map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classified Tab */}
        <TabsContent value="classified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Classified Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.classified?.productName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                  <p className="mt-1">{project.classified.productName}</p>
                </div>
              )}
              {(project.classified?.price || project.classified?.condition) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.classified?.price && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price</label>
                      <p className="mt-1 font-semibold">{project.classified.price}</p>
                    </div>
                  )}
                  {project.classified?.condition && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Condition</label>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {project.classified.condition}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {project.classified?.productImageURL && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Image</label>
                  <div className="mt-1">
                    <img 
                      src={project.classified.productImageURL} 
                      alt="Product" 
                      className="max-w-full h-48 object-contain rounded border"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.social?.facebook && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facebook</label>
                    <div className="mt-1">
                      <a 
                        href={project.social.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Visit Facebook Page</span>
                      </a>
                    </div>
                  </div>
                )}
                {project.social?.twitter && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Twitter</label>
                    <div className="mt-1">
                      <a 
                        href={project.social.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Visit Twitter Profile</span>
                      </a>
                    </div>
                  </div>
                )}
                {project.social?.instagram && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Instagram</label>
                    <div className="mt-1">
                      <a 
                        href={project.social.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Visit Instagram Profile</span>
                      </a>
                    </div>
                  </div>
                )}
                {project.social?.linkedin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                    <div className="mt-1">
                      <a 
                        href={project.social.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Visit LinkedIn Page</span>
                      </a>
                    </div>
                  </div>
                )}
                {project.social?.youtube && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">YouTube</label>
                    <div className="mt-1">
                      <a 
                        href={project.social.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Visit YouTube Channel</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
