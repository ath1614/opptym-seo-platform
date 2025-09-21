/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Plus, X, Save, ArrowLeft, RefreshCw } from 'lucide-react'

interface ProjectFormProps {
  projectId?: string
  initialData?: Record<string, unknown>
}

interface CustomField {
  key: string
  value: string
}

export function ProjectForm({ projectId, initialData }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const router = useRouter()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    // Basic Info
    projectName: '',
    title: '',
    websiteURL: '',
    websiteUrl: '', // Alternative field name
    email: '',
    category: '',
    companyName: '',
    phone: '',
    whatsapp: '',
    
    // Business Description
    businessDescription: '',
    description: '', // Alternative field name
    
    // Project-specific fields
    keywords: [] as string[],
    targetAudience: '',
    competitors: [] as string[],
    goals: '',
    notes: '',
    
    // Address
    address: {
      building: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      district: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    },
    
    // SEO Metadata
    seoMetadata: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
      targetKeywords: [] as string[],
      sitemapURL: '',
      robotsURL: ''
    },
    
    // Article Submission
    articleSubmission: {
      articleTitle: '',
      articleContent: '',
      authorName: '',
      authorBio: '',
      tags: [] as string[]
    },
    
    // Classified
    classified: {
      productName: '',
      price: '',
      condition: '',
      productImageURL: ''
    },
    
    // Social Media
    social: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    
    // Optional Fields
    businessHours: '',
    establishedYear: '',
    logoImageURL: '',
    
    // Status
    status: 'draft' as 'draft' | 'active' | 'paused' | 'completed'
  })

  useEffect(() => {
    if (initialData) {
      // Merge initial data with default form structure to ensure all nested objects exist
      const mergedData = {
        ...formData,
        ...initialData,
        // Ensure nested objects exist with defaults and merge with actual data
        address: {
          building: '',
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          district: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
          ...(initialData as any).address
        },
        seoMetadata: {
          metaTitle: '',
          metaDescription: '',
          keywords: [] as string[],
          targetKeywords: [] as string[],
          sitemapURL: '',
          robotsURL: '',
          ...(initialData as any).seoMetadata
        },
        articleSubmission: {
          articleTitle: '',
          articleContent: '',
          authorName: '',
          authorBio: '',
          tags: [] as string[],
          ...(initialData as any).articleSubmission
        },
        classified: {
          productName: '',
          price: '',
          condition: '',
          productImageURL: '',
          ...(initialData as any).classified
        },
        social: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
          youtube: '',
          ...(initialData as any).social
        },
        // Project-specific fields
        keywords: (initialData as any).keywords || [],
        targetAudience: (initialData as any).targetAudience || '',
        competitors: (initialData as any).competitors || [],
        goals: (initialData as any).goals || '',
        notes: (initialData as any).notes || ''
      }
      setFormData(mergedData as any)
      setCustomFields((initialData as any).customFields || [])
    }
  }, [initialData])

  const handleInputChange = (field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayFieldChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item)
    handleInputChange(field, array)
  }

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }])
  }

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index))
  }

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    setCustomFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const refreshData = async () => {
    if (!projectId) return
    
    try {
      const response = await fetch(`/api/projects/${projectId}?t=${Date.now()}`)
      const data = await response.json()
      
      if (response.ok) {
        // Merge initial data with default form structure to ensure all nested objects exist
        const mergedData = {
          ...formData,
          ...data.project,
          // Ensure nested objects exist with defaults and merge with actual data
          address: {
            building: '',
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            district: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
            ...(data.project as any).address
          },
          seoMetadata: {
            metaTitle: '',
            metaDescription: '',
            keywords: [] as string[],
            targetKeywords: [] as string[],
            sitemapURL: '',
            robotsURL: '',
            ...(data.project as any).seoMetadata
          },
          articleSubmission: {
            articleTitle: '',
            articleContent: '',
            authorName: '',
            authorBio: '',
            tags: [] as string[],
            ...(data.project as any).articleSubmission
          },
          classified: {
            productName: '',
            price: '',
            condition: '',
            productImageURL: '',
            ...(data.project as any).classified
          },
          social: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: '',
            ...(data.project as any).social
          },
          // Project-specific fields
          keywords: (data.project as any).keywords || [],
          targetAudience: (data.project as any).targetAudience || '',
          competitors: (data.project as any).competitors || [],
          goals: (data.project as any).goals || '',
          notes: (data.project as any).notes || ''
        }
        setFormData(mergedData as any)
        setCustomFields((data.project as any).customFields || [])
        
        showToast({
          title: 'Data Refreshed',
          description: 'Project data has been reloaded from the server',
          variant: 'default'
        })
      }
    } catch (error) {
      showToast({
        title: 'Refresh Failed',
        description: 'Failed to refresh project data',
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        customFields: customFields.filter(field => field.key && field.value)
      }

      const url = projectId ? `/api/projects/${projectId}` : '/api/projects'
      const method = projectId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        showToast({
          title: projectId ? 'Project Updated!' : 'Project Created!',
          description: projectId 
            ? 'Your project has been updated successfully.'
            : 'Your project has been created successfully.',
          variant: 'success'
        })
        router.push('/dashboard/projects')
      } else {
        if (response.status === 403 && data.limitType) {
          showToast({
            title: 'Project Limit Exceeded',
            description: data.message || 'You have reached your project limit. Please upgrade your plan.',
            variant: 'destructive'
          })
        } else {
          showToast({
            title: 'Error',
            description: data.error || 'An error occurred while saving the project.',
            variant: 'destructive'
          })
        }
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {projectId ? 'Edit Project' : 'Create New Project'}
            </h1>
            <p className="text-muted-foreground">
              {projectId ? 'Update your project details' : 'Fill in the details to create a new project'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {projectId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </Button>
          )}
          <Badge variant="outline">
            {formData.status}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="article">Article</TabsTrigger>
            <TabsTrigger value="classified">Classified</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter title"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteURL">Website URL *</Label>
                  <Input
                    id="websiteURL"
                    type="url"
                    value={formData.websiteURL}
                    onChange={(e) => handleInputChange('websiteURL', e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription || formData.description}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business..."
                    rows={4}
                    required
                  />
                </div>

                {/* Project-specific fields */}
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Describe your target audience..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Project Goals</Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    placeholder="What are your SEO goals for this project?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes or requirements..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessHours">Business Hours</Label>
                    <Input
                      id="businessHours"
                      value={formData.businessHours}
                      onChange={(e) => handleInputChange('businessHours', e.target.value)}
                      placeholder="Mon-Fri 9AM-5PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoImageURL">Logo Image URL</Label>
                  <Input
                    id="logoImageURL"
                    type="url"
                    value={formData.logoImageURL}
                    onChange={(e) => handleInputChange('logoImageURL', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>
                  Enter the complete address details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    value={formData.address.building}
                    onChange={(e) => handleInputChange('address.building', e.target.value)}
                    placeholder="Building name or number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.address.addressLine1}
                    onChange={(e) => handleInputChange('address.addressLine1', e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.address.addressLine2}
                    onChange={(e) => handleInputChange('address.addressLine2', e.target.value)}
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine3">Address Line 3</Label>
                  <Input
                    id="addressLine3"
                    value={formData.address.addressLine3}
                    onChange={(e) => handleInputChange('address.addressLine3', e.target.value)}
                    placeholder="Additional address information"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={formData.address.district}
                      onChange={(e) => handleInputChange('address.district', e.target.value)}
                      placeholder="District"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) => handleInputChange('address.country', e.target.value)}
                      placeholder="Country"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.address.pincode}
                    onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                    placeholder="Postal code"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            {/* Project Keywords and Competitors */}
            <Card>
              <CardHeader>
                <CardTitle>Project Keywords & Competitors</CardTitle>
                <CardDescription>
                  Define your target keywords and analyze competitors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords.join(', ')}
                    onChange={(e) => handleInputChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                    placeholder="Enter keywords separated by commas (e.g., seo, digital marketing, web design)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitors">Competitors</Label>
                  <Input
                    id="competitors"
                    value={formData.competitors.join(', ')}
                    onChange={(e) => handleInputChange('competitors', e.target.value.split(',').map(c => c.trim()).filter(c => c))}
                    placeholder="Enter competitor websites separated by commas"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple competitors with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Metadata</CardTitle>
                <CardDescription>
                  Optimize your project for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.seoMetadata.metaTitle}
                    onChange={(e) => handleInputChange('seoMetadata.metaTitle', e.target.value)}
                    placeholder="SEO optimized title (max 60 characters)"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.seoMetadata.metaTitle.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.seoMetadata.metaDescription}
                    onChange={(e) => handleInputChange('seoMetadata.metaDescription', e.target.value)}
                    placeholder="SEO optimized description (max 160 characters)"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.seoMetadata.metaDescription.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.seoMetadata.keywords.join(', ')}
                    onChange={(e) => handleArrayFieldChange('seoMetadata.keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetKeywords">Target Keywords</Label>
                  <Input
                    id="targetKeywords"
                    value={formData.seoMetadata.targetKeywords.join(', ')}
                    onChange={(e) => handleArrayFieldChange('seoMetadata.targetKeywords', e.target.value)}
                    placeholder="target1, target2, target3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Primary keywords you want to rank for
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sitemapURL">Sitemap URL</Label>
                    <Input
                      id="sitemapURL"
                      type="url"
                      value={formData.seoMetadata.sitemapURL}
                      onChange={(e) => handleInputChange('seoMetadata.sitemapURL', e.target.value)}
                      placeholder="https://example.com/sitemap.xml"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="robotsURL">Robots.txt URL</Label>
                    <Input
                      id="robotsURL"
                      type="url"
                      value={formData.seoMetadata.robotsURL}
                      onChange={(e) => handleInputChange('seoMetadata.robotsURL', e.target.value)}
                      placeholder="https://example.com/robots.txt"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Article Tab */}
          <TabsContent value="article" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Submission</CardTitle>
                <CardDescription>
                  Content for article submissions and guest posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="articleTitle">Article Title</Label>
                  <Input
                    id="articleTitle"
                    value={formData.articleSubmission.articleTitle}
                    onChange={(e) => handleInputChange('articleSubmission.articleTitle', e.target.value)}
                    placeholder="Enter article title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="articleContent">Article Content</Label>
                  <Textarea
                    id="articleContent"
                    value={formData.articleSubmission.articleContent}
                    onChange={(e) => handleInputChange('articleSubmission.articleContent', e.target.value)}
                    placeholder="Write your article content here..."
                    rows={8}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Author Name</Label>
                    <Input
                      id="authorName"
                      value={formData.articleSubmission.authorName}
                      onChange={(e) => handleInputChange('articleSubmission.authorName', e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.articleSubmission.tags.join(', ')}
                      onChange={(e) => handleArrayFieldChange('articleSubmission.tags', e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorBio">Author Bio</Label>
                  <Textarea
                    id="authorBio"
                    value={formData.articleSubmission.authorBio}
                    onChange={(e) => handleInputChange('articleSubmission.authorBio', e.target.value)}
                    placeholder="Brief author biography..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classified Tab */}
          <TabsContent value="classified" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Classified Information</CardTitle>
                <CardDescription>
                  Product details for classified listings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.classified.productName}
                    onChange={(e) => handleInputChange('classified.productName', e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={formData.classified.price}
                      onChange={(e) => handleInputChange('classified.price', e.target.value)}
                      placeholder="$99.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={formData.classified.condition} onValueChange={(value) => handleInputChange('classified.condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productImageURL">Product Image URL</Label>
                  <Input
                    id="productImageURL"
                    type="url"
                    value={formData.classified.productImageURL}
                    onChange={(e) => handleInputChange('classified.productImageURL', e.target.value)}
                    placeholder="https://example.com/product.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Add your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      type="url"
                      value={formData.social.facebook}
                      onChange={(e) => handleInputChange('social.facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={formData.social.twitter}
                      onChange={(e) => handleInputChange('social.twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      type="url"
                      value={formData.social.instagram}
                      onChange={(e) => handleInputChange('social.instagram', e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.social.linkedin}
                      onChange={(e) => handleInputChange('social.linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    type="url"
                    value={formData.social.youtube}
                    onChange={(e) => handleInputChange('social.youtube', e.target.value)}
                    placeholder="https://youtube.com/channel/yourchannel"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Add custom fields for additional information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Field name"
                      value={field.key}
                      onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCustomField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomField}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Field
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {projectId ? 'Update Project' : 'Create Project'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
