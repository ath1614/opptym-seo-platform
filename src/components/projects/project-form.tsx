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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
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
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleArrayFieldChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item)
    handleInputChange(field, array)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Required field validations with detailed messages and suggestions
    if (!formData.projectName?.trim()) {
      errors.projectName = 'Project name is required'
    } else if (formData.projectName.length < 3) {
      errors.projectName = 'Project name must be at least 3 characters long'
    } else if (formData.projectName.length > 100) {
      errors.projectName = 'Project name cannot exceed 100 characters'
    }
    
    if (!formData.title?.trim()) {
      errors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      errors.title = 'Title should be at least 10 characters for better SEO'
    } else if (formData.title.length > 200) {
      errors.title = 'Title cannot exceed 200 characters'
    }
    
    if (!formData.websiteURL?.trim()) {
      errors.websiteURL = 'Website URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.websiteURL)) {
      errors.websiteURL = 'Please enter a valid URL starting with http:// or https://'
    } else if (!/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(formData.websiteURL)) {
      errors.websiteURL = 'Please enter a complete URL with domain (e.g., https://example.com)'
    }
    
    if (!formData.email?.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address (e.g., user@example.com)'
    }
    
    if (!formData.category?.trim()) {
      errors.category = 'Please select a category for your project'
    }
    
    if (!formData.companyName?.trim()) {
      errors.companyName = 'Company name is required'
    } else if (formData.companyName.length < 2) {
      errors.companyName = 'Company name must be at least 2 characters'
    } else if (formData.companyName.length > 100) {
      errors.companyName = 'Company name cannot exceed 100 characters'
    }
    
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)'
    }
    
    if (!formData.businessDescription?.trim()) {
      errors.businessDescription = 'Business description is required'
    } else if (formData.businessDescription.length < 50) {
      errors.businessDescription = 'Business description should be at least 50 characters for better SEO'
    } else if (formData.businessDescription.length > 2000) {
      errors.businessDescription = 'Business description cannot exceed 2000 characters'
    }
    
    // Address validations with suggestions
    if (!formData.address.addressLine1?.trim()) {
      errors['address.addressLine1'] = 'Street address is required'
    } else if (formData.address.addressLine1.length < 5) {
      errors['address.addressLine1'] = 'Please provide a complete street address'
    }
    
    if (!formData.address.district?.trim()) {
      errors['address.district'] = 'District is required'
    }
    
    if (!formData.address.city?.trim()) {
      errors['address.city'] = 'City is required'
    }
    
    if (!formData.address.state?.trim()) {
      errors['address.state'] = 'State/Province is required'
    }
    
    if (!formData.address.country?.trim()) {
      errors['address.country'] = 'Country is required'
    }
    
    if (!formData.address.pincode?.trim()) {
      errors['address.pincode'] = 'Postal/ZIP code is required'
    } else if (!/^[0-9]{5,6}$/.test(formData.address.pincode)) {
      errors['address.pincode'] = 'Please enter a valid postal code (5-6 digits)'
    }
    
    // SEO Metadata validations with SEO suggestions
    if (formData.seoMetadata.metaTitle && formData.seoMetadata.metaTitle.length > 0) {
      if (formData.seoMetadata.metaTitle.length < 30) {
        errors['seoMetadata.metaTitle'] = 'Meta title should be at least 30 characters for better SEO'
      } else if (formData.seoMetadata.metaTitle.length > 60) {
        errors['seoMetadata.metaTitle'] = 'Meta title should not exceed 60 characters to avoid truncation in search results'
      }
    }
    
    if (formData.seoMetadata.metaDescription && formData.seoMetadata.metaDescription.length > 0) {
      if (formData.seoMetadata.metaDescription.length < 120) {
        errors['seoMetadata.metaDescription'] = 'Meta description should be at least 120 characters for better SEO'
      } else if (formData.seoMetadata.metaDescription.length > 160) {
        errors['seoMetadata.metaDescription'] = 'Meta description should not exceed 160 characters to avoid truncation'
      }
    }
    
    // Article submission validations
    if (formData.articleSubmission.articleTitle && formData.articleSubmission.articleTitle.length > 0) {
      if (formData.articleSubmission.articleTitle.length < 10) {
        errors['articleSubmission.articleTitle'] = 'Article title should be at least 10 characters'
      } else if (formData.articleSubmission.articleTitle.length > 200) {
        errors['articleSubmission.articleTitle'] = 'Article title cannot exceed 200 characters'
      }
    }
    
    if (formData.articleSubmission.articleContent && formData.articleSubmission.articleContent.length > 0) {
      if (formData.articleSubmission.articleContent.length < 100) {
        errors['articleSubmission.articleContent'] = 'Article content should be at least 100 characters'
      } else if (formData.articleSubmission.articleContent.length > 5000) {
        errors['articleSubmission.articleContent'] = 'Article content cannot exceed 5000 characters'
      }
    }
    
    if (formData.articleSubmission.authorBio && formData.articleSubmission.authorBio.length > 500) {
      errors['articleSubmission.authorBio'] = 'Author bio cannot exceed 500 characters'
    }
    
    // WhatsApp validation
    if (formData.whatsapp && formData.whatsapp.trim()) {
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.whatsapp.replace(/[\s\-\(\)]/g, ''))) {
        errors.whatsapp = 'Please enter a valid WhatsApp number (e.g., +1234567890)'
      }
    }
    
    // Target Audience validation
    if (formData.targetAudience && formData.targetAudience.length > 500) {
      errors.targetAudience = 'Target audience description cannot exceed 500 characters'
    }
    
    // Goals validation
    if (formData.goals && formData.goals.length > 1000) {
      errors.goals = 'Goals description cannot exceed 1000 characters'
    }
    
    // Notes validation
    if (formData.notes && formData.notes.length > 2000) {
      errors.notes = 'Notes cannot exceed 2000 characters'
    }
    
    // Keywords validation
    if (formData.keywords.length > 20) {
      errors.keywords = 'Maximum 20 keywords allowed'
    }
    
    // Competitors validation
    if (formData.competitors.length > 10) {
      errors.competitors = 'Maximum 10 competitors allowed'
    }
    
    // SEO Keywords validation
    if (formData.seoMetadata.keywords.length > 15) {
      errors['seoMetadata.keywords'] = 'Maximum 15 SEO keywords allowed'
    }
    
    if (formData.seoMetadata.targetKeywords.length > 10) {
      errors['seoMetadata.targetKeywords'] = 'Maximum 10 target keywords allowed'
    }
    
    // Sitemap URL validation
    if (formData.seoMetadata.sitemapURL && formData.seoMetadata.sitemapURL.trim()) {
      if (!/^https?:\/\/.+/.test(formData.seoMetadata.sitemapURL)) {
        errors['seoMetadata.sitemapURL'] = 'Sitemap URL must start with http:// or https://'
      }
    }
    
    // Robots URL validation
    if (formData.seoMetadata.robotsURL && formData.seoMetadata.robotsURL.trim()) {
      if (!/^https?:\/\/.+/.test(formData.seoMetadata.robotsURL)) {
        errors['seoMetadata.robotsURL'] = 'Robots URL must start with http:// or https://'
      }
    }
    
    // Article Author Name validation
    if (formData.articleSubmission.authorName && formData.articleSubmission.authorName.length > 100) {
      errors['articleSubmission.authorName'] = 'Author name cannot exceed 100 characters'
    }
    
    // Article Tags validation
    if (formData.articleSubmission.tags.length > 10) {
      errors['articleSubmission.tags'] = 'Maximum 10 article tags allowed'
    }
    
    // Classified Product Name validation
    if (formData.classified.productName && formData.classified.productName.length > 200) {
      errors['classified.productName'] = 'Product name cannot exceed 200 characters'
    }
    
    // Price validation
    if (formData.classified.price && formData.classified.price.trim()) {
      if (!/^\d+(\.\d{1,2})?$/.test(formData.classified.price)) {
        errors['classified.price'] = 'Please enter a valid price (e.g., 99.99)'
      }
    }
    
    // Product Image URL validation
    if (formData.classified.productImageURL && formData.classified.productImageURL.trim()) {
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.classified.productImageURL)) {
        errors['classified.productImageURL'] = 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)'
      }
    }
    
    // Social Media URL validations
    const socialFields = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube']
    socialFields.forEach(field => {
      const value = formData.social[field as keyof typeof formData.social]
      if (value && value.trim()) {
        if (!/^https?:\/\/.+/.test(value)) {
          errors[`social.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} URL must start with http:// or https://`
        }
      }
    })
    
    // Business Hours validation
    if (formData.businessHours && formData.businessHours.length > 200) {
      errors.businessHours = 'Business hours cannot exceed 200 characters'
    }
    
    // Established Year validation
    if (formData.establishedYear && formData.establishedYear.trim()) {
      const year = parseInt(formData.establishedYear)
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1800 || year > currentYear) {
        errors.establishedYear = `Please enter a valid year between 1800 and ${currentYear}`
      }
    }
    
    // Logo Image URL validation
    if (formData.logoImageURL && formData.logoImageURL.trim()) {
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(formData.logoImageURL)) {
        errors.logoImageURL = 'Please enter a valid logo image URL (jpg, jpeg, png, gif, webp, svg)'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }])
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors[fieldName]
  }

  const getNestedFieldError = (parentField: string, childField: string): string | undefined => {
    return validationErrors[`${parentField}.${childField}`]
  }

  const getFieldSuggestion = (fieldName: string): string => {
    const suggestions: Record<string, string> = {
      // Basic Info
      projectName: 'Use a descriptive name that reflects your business or project',
      title: 'Write a compelling title that includes your main keyword',
      websiteURL: 'Include the full URL with https:// (e.g., https://yourwebsite.com)',
      email: 'Use a professional email address (e.g., contact@yourcompany.com)',
      companyName: 'Enter your official business or company name',
      phone: 'Include country code if international (e.g., +1-555-123-4567)',
      whatsapp: 'Include country code for international numbers (e.g., +1234567890)',
      businessDescription: 'Describe what your business does, your target audience, and key services (aim for 150-300 words)',
      
      // Project-specific fields
      targetAudience: 'Describe your ideal customers, their demographics, and interests',
      goals: 'List your business objectives and what you want to achieve',
      notes: 'Add any additional information or special requirements',
      keywords: 'Enter relevant keywords separated by commas (max 20)',
      competitors: 'List your main competitors (max 10)',
      
      // Address
      'address.addressLine1': 'Include street number, street name, and any building/suite information',
      'address.pincode': 'Enter your postal or ZIP code (5-6 digits)',
      
      // SEO Metadata
      'seoMetadata.metaTitle': 'Include your main keyword and keep it under 60 characters',
      'seoMetadata.metaDescription': 'Write a compelling description that encourages clicks (120-160 characters)',
      'seoMetadata.keywords': 'Enter SEO keywords separated by commas (max 15)',
      'seoMetadata.targetKeywords': 'List your primary target keywords (max 10)',
      'seoMetadata.sitemapURL': 'Enter your sitemap URL (e.g., https://yoursite.com/sitemap.xml)',
      'seoMetadata.robotsURL': 'Enter your robots.txt URL (e.g., https://yoursite.com/robots.txt)',
      
      // Article Submission
      'articleSubmission.articleTitle': 'Create an engaging title that summarizes your article',
      'articleSubmission.articleContent': 'Write comprehensive content that provides value to readers',
      'articleSubmission.authorName': 'Enter the full name of the article author',
      'articleSubmission.authorBio': 'Write a brief bio about the author (max 500 characters)',
      'articleSubmission.tags': 'Add relevant tags separated by commas (max 10)',
      
      // Classified
      'classified.productName': 'Enter a clear, descriptive product name',
      'classified.price': 'Enter the price in decimal format (e.g., 99.99)',
      'classified.condition': 'Select the condition of your product',
      'classified.productImageURL': 'Use a high-quality image URL (jpg, jpeg, png, gif, webp)',
      
      // Social Media
      'social.facebook': 'Enter your Facebook page URL (e.g., https://facebook.com/yourpage)',
      'social.twitter': 'Enter your Twitter profile URL (e.g., https://twitter.com/yourhandle)',
      'social.instagram': 'Enter your Instagram profile URL (e.g., https://instagram.com/yourhandle)',
      'social.linkedin': 'Enter your LinkedIn company page URL',
      'social.youtube': 'Enter your YouTube channel URL',
      
      // Optional Fields
      businessHours: 'Enter your business operating hours (e.g., Mon-Fri 9AM-5PM)',
      establishedYear: 'Enter the year your business was established',
      logoImageURL: 'Use a high-quality logo image URL (jpg, jpeg, png, gif, webp, svg)'
    }
    return suggestions[fieldName] || ''
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
    
    // Clear previous validation errors
    setValidationErrors({})
    
    // Perform client-side validation first
    if (!validateForm()) {
      const errorCount = Object.keys(validationErrors).length
      const errorFields = Object.keys(validationErrors)
      
      // Create detailed error message
      let errorMessage = `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''}:\n\n`
      errorFields.forEach((field, index) => {
        const fieldName = field.replace(/^address\./, 'Address ').replace(/^seoMetadata\./, 'SEO ').replace(/^articleSubmission\./, 'Article ')
        errorMessage += `${index + 1}. ${fieldName}: ${validationErrors[field]}\n`
      })
      
      showToast({
        title: 'Validation Failed',
        description: errorMessage,
        variant: 'destructive'
      })
      return
    }
    
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
        } else if (response.status === 400 && data.validationErrors) {
          // Handle server-side validation errors
          setValidationErrors(data.validationErrors)
          const errorFields = Object.keys(data.validationErrors)
          
          // Create detailed error message
          let errorMessage = `Please fix ${data.errorCount || errorFields.length} error${(data.errorCount || errorFields.length) > 1 ? 's' : ''}:\n\n`
          errorFields.forEach((field, index) => {
            const fieldName = field.replace(/^address\./, 'Address ').replace(/^seoMetadata\./, 'SEO ').replace(/^articleSubmission\./, 'Article ')
            errorMessage += `${index + 1}. ${fieldName}: ${data.validationErrors[field]}\n`
          })
          
          showToast({
            title: 'Validation Failed',
            description: errorMessage,
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
                      className={getFieldError('projectName') ? 'border-red-500' : ''}
                    />
                    {getFieldError('projectName') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('projectName')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('projectName')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter title"
                      required
                      className={getFieldError('title') ? 'border-red-500' : ''}
                    />
                    {getFieldError('title') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('title')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('title')}</p>
                      </div>
                    )}
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
                    className={getFieldError('websiteURL') ? 'border-red-500' : ''}
                  />
                  {getFieldError('websiteURL') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('websiteURL')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('websiteURL')}</p>
                      </div>
                    )}
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
                      className={getFieldError('email') ? 'border-red-500' : ''}
                    />
                    {getFieldError('email') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('email')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('email')}</p>
                      </div>
                    )}
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
