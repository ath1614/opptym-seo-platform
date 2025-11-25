/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from 'react'
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
  type: 'text' | 'url' | 'number' | 'email' | 'phone'
  section?: 'basic' | 'address' | 'seo' | 'article' | 'classified' | 'social'
}

export function ProjectForm({ projectId, initialData }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // Field references for scrolling to validation errors
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({})
  
  // Separate display values for comma-separated fields to allow natural typing
  const [displayValues, setDisplayValues] = useState({
    competitors: '',
    keywords: '',
    targetKeywords: '',
    seoKeywords: '',
    tags: ''
  })
  
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
        notes: (initialData as any).notes || '',
        // Convert establishedYear to string for form input
        establishedYear: (initialData as any).establishedYear ? String((initialData as any).establishedYear) : ''
      }
      // Normalize category and website field aliases
      const rawCategory = (((initialData as any).category ?? (formData as any).category) ?? '').toString().trim()
      const normalizedMap: Record<string, string> = {
        'miscellaneous / general': 'Miscellaneous / General',
        'miscellaneous & general': 'Miscellaneous / General',
        'miscellaneous/general': 'Miscellaneous / General',
        'general': 'Miscellaneous / General',
        'misc': 'Miscellaneous / General',
        'miscellaneous': 'Miscellaneous / General'
      }
      const key = rawCategory.toLowerCase().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ')
      const normalizedCategory = normalizedMap[key] || rawCategory
      const websiteURL = (initialData as any).websiteURL || (initialData as any).websiteUrl || (mergedData as any).websiteURL

      const finalData = { ...mergedData, category: normalizedCategory, websiteURL }

      setFormData(finalData as any)
      setCustomFields((initialData as any).customFields || [])
      
      // Initialize display values for comma-separated fields
      setDisplayValues({
        competitors: ((initialData as any).competitors || []).join(', '),
        keywords: (((initialData as any).keywords) || []).join(', '),
        seoKeywords: (((initialData as any).seoMetadata?.keywords) || []).join(', '),
        targetKeywords: (((initialData as any).seoMetadata?.targetKeywords) || []).join(', '),
        tags: (((initialData as any).articleSubmission?.tags) || []).join(', ')
      })
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
    
    // Real-time validation - validate field after a short delay
    setTimeout(() => {
      const error = validateField(field, value)
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: error
        }))
      } else {
        // Clear error if validation passes
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    }, 500) // 500ms delay to avoid validation while typing
  }

  const handleArrayFieldChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item)
    handleInputChange(field, array)
  }

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
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
    
    // SEO Metadata validations - now required
    if (!formData.seoMetadata.metaTitle?.trim()) {
      errors['seoMetadata.metaTitle'] = 'Meta title is required'
    } else if (formData.seoMetadata.metaTitle.length < 30) {
      errors['seoMetadata.metaTitle'] = 'Meta title should be at least 30 characters for better SEO'
    } else if (formData.seoMetadata.metaTitle.length > 60) {
      errors['seoMetadata.metaTitle'] = 'Meta title should not exceed 60 characters to avoid truncation in search results'
    }
    
    if (!formData.seoMetadata.metaDescription?.trim()) {
      errors['seoMetadata.metaDescription'] = 'Meta description is required'
    } else if (formData.seoMetadata.metaDescription.length < 120) {
      errors['seoMetadata.metaDescription'] = 'Meta description should be at least 120 characters for better SEO'
    } else if (formData.seoMetadata.metaDescription.length > 160) {
      errors['seoMetadata.metaDescription'] = 'Meta description should not exceed 160 characters to avoid truncation'
    }
    
    // Article submission validations - now required
    if (!formData.articleSubmission.articleTitle?.trim()) {
      errors['articleSubmission.articleTitle'] = 'Article title is required'
    } else if (formData.articleSubmission.articleTitle.length < 10) {
      errors['articleSubmission.articleTitle'] = 'Article title should be at least 10 characters'
    } else if (formData.articleSubmission.articleTitle.length > 200) {
      errors['articleSubmission.articleTitle'] = 'Article title cannot exceed 200 characters'
    }
    
    if (!formData.articleSubmission.articleContent?.trim()) {
      errors['articleSubmission.articleContent'] = 'Article content is required'
    } else if (formData.articleSubmission.articleContent.length < 100) {
      errors['articleSubmission.articleContent'] = 'Article content should be at least 100 characters'
    } else if (formData.articleSubmission.articleContent.length > 5000) {
      errors['articleSubmission.articleContent'] = 'Article content cannot exceed 5000 characters'
    }
    
    if (formData.articleSubmission.authorBio && formData.articleSubmission.authorBio.length > 500) {
      errors['articleSubmission.authorBio'] = 'Author bio cannot exceed 500 characters'
    }
    
    // WhatsApp validation - now required
    if (!formData.whatsapp?.trim()) {
      errors.whatsapp = 'WhatsApp number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.whatsapp.replace(/[\s\-\(\)]/g, ''))) {
      errors.whatsapp = 'Please enter a valid WhatsApp number (e.g., +1234567890)'
    }
    
    // Target Audience validation - now required
    if (!formData.targetAudience?.trim()) {
      errors.targetAudience = 'Target audience is required'
    } else if (formData.targetAudience.length > 500) {
      errors.targetAudience = 'Target audience description cannot exceed 500 characters'
    }
    
    // Goals validation - now required
    if (!formData.goals?.trim()) {
      errors.goals = 'Project goals are required'
    } else if (formData.goals.length > 1000) {
      errors.goals = 'Goals description cannot exceed 1000 characters'
    }
    
    // Notes validation - now required
    if (!formData.notes?.trim()) {
      errors.notes = 'Notes are required'
    } else if (formData.notes.length > 2000) {
      errors.notes = 'Notes cannot exceed 2000 characters'
    }
    
    // Business Hours validation - now required
    if (!formData.businessHours?.trim()) {
      errors.businessHours = 'Business hours are required'
    }
    
    // Established Year validation - now required
    if (!formData.establishedYear || !String(formData.establishedYear).trim()) {
      errors.establishedYear = 'Established year is required'
    }
    
    // Logo Image URL validation - now required
    if (!formData.logoImageURL?.trim()) {
      errors.logoImageURL = 'Logo image URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.logoImageURL)) {
      errors.logoImageURL = 'Please enter a valid URL starting with http:// or https://'
    }
    
    // Building validation - now required
    if (!formData.address.building?.trim()) {
      errors['address.building'] = 'Building is required'
    }
    
    // Address Line 3 validation - now required
    if (!formData.address.addressLine3?.trim()) {
      errors['address.addressLine3'] = 'Address line 3 is required'
    }
    
    // Keywords validation - now required
    if (formData.keywords.length === 0) {
      errors.keywords = 'At least one keyword is required'
    } else if (formData.keywords.length > 20) {
      errors.keywords = 'Maximum 20 keywords allowed'
    }
    
    // Competitors validation - now required
    if (formData.competitors.length === 0) {
      errors.competitors = 'At least one competitor is required'
    } else if (formData.competitors.length > 10) {
      errors.competitors = 'Maximum 10 competitors allowed'
    }
    
    // SEO Keywords validation - now required
    if (formData.seoMetadata.keywords.length === 0) {
      errors['seoMetadata.keywords'] = 'At least one SEO keyword is required'
    } else if (formData.seoMetadata.keywords.length > 15) {
      errors['seoMetadata.keywords'] = 'Maximum 15 SEO keywords allowed'
    }
    
    if (formData.seoMetadata.targetKeywords.length === 0) {
      errors['seoMetadata.targetKeywords'] = 'At least one target keyword is required'
    } else if (formData.seoMetadata.targetKeywords.length > 10) {
      errors['seoMetadata.targetKeywords'] = 'Maximum 10 target keywords allowed'
    }
    
    // Sitemap URL validation - now required
    if (!formData.seoMetadata.sitemapURL?.trim()) {
      errors['seoMetadata.sitemapURL'] = 'Sitemap URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.seoMetadata.sitemapURL)) {
      errors['seoMetadata.sitemapURL'] = 'Sitemap URL must start with http:// or https://'
    }
    
    // Robots URL validation - now required
    if (!formData.seoMetadata.robotsURL?.trim()) {
      errors['seoMetadata.robotsURL'] = 'Robots URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.seoMetadata.robotsURL)) {
      errors['seoMetadata.robotsURL'] = 'Robots URL must start with http:// or https://'
    }
    
    // Article Author Name validation - now required
    if (!formData.articleSubmission.authorName?.trim()) {
      errors['articleSubmission.authorName'] = 'Author name is required'
    } else if (formData.articleSubmission.authorName.length > 100) {
      errors['articleSubmission.authorName'] = 'Author name cannot exceed 100 characters'
    }
    
    // Article Tags validation - now required
    if (formData.articleSubmission.tags.length === 0) {
      errors['articleSubmission.tags'] = 'At least one article tag is required'
    } else if (formData.articleSubmission.tags.length > 10) {
      errors['articleSubmission.tags'] = 'Maximum 10 article tags allowed'
    }
    
    // Classified Product Name validation - now required
    if (!formData.classified.productName?.trim()) {
      errors['classified.productName'] = 'Product name is required'
    } else if (formData.classified.productName.length > 200) {
      errors['classified.productName'] = 'Product name cannot exceed 200 characters'
    }
    
    // Price validation - now required
    if (!formData.classified.price?.trim()) {
      errors['classified.price'] = 'Price is required'
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.classified.price)) {
      errors['classified.price'] = 'Please enter a valid price (e.g., 99.99)'
    }
    
    // Condition validation - now required
    if (!formData.classified.condition?.trim()) {
      errors['classified.condition'] = 'Product condition is required'
    }
    
    // Product Image URL validation - now required
    if (!formData.classified.productImageURL?.trim()) {
      errors['classified.productImageURL'] = 'Product image URL is required'
    } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.classified.productImageURL)) {
      errors['classified.productImageURL'] = 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)'
    }
    
    // Social Media URL validations - optional but must be valid if provided
    const socialFields = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube']
    socialFields.forEach(field => {
      const value = formData.social[field as keyof typeof formData.social]
      if (value?.trim() && !/^https?:\/\/.+/.test(value)) {
        errors[`social.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} URL must start with http:// or https://`
      }
    })
    
    // Business Hours validation
    if (formData.businessHours && formData.businessHours.length > 200) {
      errors.businessHours = 'Business hours cannot exceed 200 characters'
    }
    
    // Established Year validation
    if (formData.establishedYear && String(formData.establishedYear).trim()) {
      const year = parseInt(String(formData.establishedYear))
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
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '', type: 'text' }])
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
      'address.pincode': 'Enter your postal or ZIP code (e.g., 12345, SW1A 1AA, K1A 0A6)',
      
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

  // Real-time validation for individual fields
  const validateField = (field: string, value: any): string | null => {
    // Required field validations
    if (field === 'projectName') {
      if (!value?.trim()) return 'Project name is required'
      if (value.length < 3) return 'Project name must be at least 3 characters long'
      if (value.length > 100) return 'Project name cannot exceed 100 characters'
    }
    
    if (field === 'title') {
      if (!value?.trim()) return 'Title is required'
      if (value.length < 10) return 'Title should be at least 10 characters for better SEO'
      if (value.length > 200) return 'Title cannot exceed 200 characters'
    }
    
    if (field === 'websiteURL') {
      if (!value?.trim()) return 'Website URL is required'
      if (!/^https?:\/\/.+/.test(value)) return 'Please enter a valid URL starting with http:// or https://'
      if (!/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value)) return 'Please enter a complete URL with domain (e.g., https://example.com)'
    }
    
    if (field === 'email') {
      if (!value?.trim()) return 'Email address is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address (e.g., user@example.com)'
    }
    
    if (field === 'category') {
      if (!value?.trim()) return 'Please select a category for your project'
    }
    
    if (field === 'companyName') {
      if (!value?.trim()) return 'Company name is required'
      if (value.length < 2) return 'Company name must be at least 2 characters'
      if (value.length > 100) return 'Company name cannot exceed 100 characters'
    }
    
    if (field === 'phone') {
      if (!value?.trim()) return 'Phone number is required'
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) return 'Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)'
    }
    
    if (field === 'whatsapp') {
      if (!value?.trim()) return 'WhatsApp number is required'
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) return 'Please enter a valid WhatsApp number'
    }
    
    if (field === 'businessDescription') {
      if (!value?.trim()) return 'Business description is required'
      if (value.length < 50) return 'Business description should be at least 50 characters for better SEO'
      if (value.length > 2000) return 'Business description cannot exceed 2000 characters'
    }
    
    if (field === 'targetAudience') {
      if (!value?.trim()) return 'Target audience is required'
      if (value.length > 500) return 'Target audience cannot exceed 500 characters'
    }
    
    if (field === 'goals') {
      if (!value?.trim()) return 'Project goals are required'
      if (value.length > 1000) return 'Goals cannot exceed 1000 characters'
    }
    
    if (field === 'notes') {
      if (!value?.trim()) return 'Notes are required'
      if (value.length > 2000) return 'Notes cannot exceed 2000 characters'
    }
    
    if (field === 'businessHours') {
      if (!value?.trim()) return 'Business hours are required'
      if (value.length > 200) return 'Business hours cannot exceed 200 characters'
    }
    
    if (field === 'establishedYear') {
      if (!value || !String(value).trim()) return 'Established year is required'
      const year = parseInt(String(value))
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1800 || year > currentYear) return `Please enter a valid year between 1800 and ${currentYear}`
    }
    
    if (field === 'logoImageURL') {
      if (!value?.trim()) return 'Logo image URL is required'
      if (!/^https?:\/\/.+/.test(value)) return 'Please enter a valid URL starting with http:// or https://'
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value)) return 'Please enter a valid image URL'
    }
    
    // Address validations
    if (field === 'address.building') {
      if (!value?.trim()) return 'Building is required'
    }
    
    if (field === 'address.addressLine1') {
      if (!value?.trim()) return 'Street address is required'
      if (value.length < 5) return 'Please provide a complete street address'
    }
    
    if (field === 'address.addressLine3') {
      if (!value?.trim()) return 'Address line 3 is required'
    }
    
    if (field === 'address.district') {
      if (!value?.trim()) return 'District is required'
    }
    
    if (field === 'address.city') {
      if (!value?.trim()) return 'City is required'
    }
    
    if (field === 'address.state') {
      if (!value?.trim()) return 'State/Province is required'
    }
    
    if (field === 'address.country') {
      if (!value?.trim()) return 'Country is required'
    }
    
    if (field === 'address.pincode') {
      if (!value?.trim()) return 'Postal/ZIP code is required'
      if (!/^[A-Za-z0-9\s\-]{3,10}$/.test(value)) return 'Please enter a valid postal code'
    }
    
    // Classified validations
    if (field === 'classified.condition') {
      if (!value?.trim()) return 'Product condition is required'
    }
    
    return null
  }

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index))
  }

  const updateCustomField = (index: number, field: 'key' | 'value' | 'type', value: string) => {
    setCustomFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  // Section-aware custom fields helpers
  const addSectionCustomField = (section: CustomField['section']) => {
    setCustomFields(prev => [
      ...prev,
      { key: '', value: '', type: 'text', section: section || 'social' }
    ])
  }

  const updateSectionCustomField = (
    section: CustomField['section'],
    sectionIndex: number,
    field: 'key' | 'value' | 'type',
    value: string
  ) => {
    setCustomFields(prev => {
      let count = -1
      const targetIdx = prev.findIndex(cf => {
        const sec = cf.section || 'social'
        if (sec === (section || 'social')) {
          count += 1
          return count === sectionIndex
        }
        return false
      })
      if (targetIdx === -1) return prev
      return prev.map((item, i) => i === targetIdx ? { ...item, [field]: value } : item)
    })
  }

  const removeSectionCustomField = (section: CustomField['section'], sectionIndex: number) => {
    setCustomFields(prev => {
      let count = -1
      let targetIdx = -1
      prev.some((cf, i) => {
        const sec = cf.section || 'social'
        if (sec === (section || 'social')) {
          count += 1
          if (count === sectionIndex) {
            targetIdx = i
            return true
          }
        }
        return false
      })
      if (targetIdx === -1) return prev
      return prev.filter((_, i) => i !== targetIdx)
    })
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

        // Normalize category and website aliases from server response
        const rawCategory = (((data.project as any).category ?? (formData as any).category) ?? '').toString().trim()
        const normalizedMap: Record<string, string> = {
          'miscellaneous / general': 'Miscellaneous / General',
          'miscellaneous & general': 'Miscellaneous / General',
          'miscellaneous/general': 'Miscellaneous / General',
          'general': 'Miscellaneous / General',
          'misc': 'Miscellaneous / General',
          'miscellaneous': 'Miscellaneous / General'
        }
        const key = rawCategory.toLowerCase().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ')
        const normalizedCategory = normalizedMap[key] || rawCategory
        const websiteURL = (data.project as any).websiteURL || (data.project as any).websiteUrl || (mergedData as any).websiteURL

        const finalData = { ...mergedData, category: normalizedCategory, websiteURL }

        setFormData(finalData as any)
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

  // Helper function to scroll to first validation error field
  const scrollToFirstError = (errors: Record<string, string>) => {
    const errorFields = Object.keys(errors)
    if (errorFields.length === 0) return

    // Define field priority order for scrolling (most important fields first)
    const fieldPriority = [
      'projectName', 'title', 'websiteURL', 'email', 'category', 'companyName',
      'phone', 'businessDescription', 'address.building', 'address.addressLine1',
      'address.city', 'address.state', 'address.country', 'address.pincode',
      'seoMetadata.metaTitle', 'seoMetadata.metaDescription', 'articleSubmission.articleTitle',
      'articleSubmission.articleContent'
    ]

    // Find the first error field based on priority
    let firstErrorField = errorFields[0]
    for (const priorityField of fieldPriority) {
      if (errorFields.includes(priorityField)) {
        firstErrorField = priorityField
        break
      }
    }

    // Get the field element and scroll to it
    const fieldElement = fieldRefs.current[firstErrorField]
    if (fieldElement) {
      // Add visual highlight to the field
      fieldElement.classList.add('ring-2', 'ring-red-500', 'ring-offset-2')
      
      // Smooth scroll to the field with some offset for better visibility
      fieldElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })

      // Focus the field if it's an input element
      if (fieldElement instanceof HTMLInputElement || 
          fieldElement instanceof HTMLTextAreaElement || 
          fieldElement instanceof HTMLSelectElement) {
        setTimeout(() => {
          fieldElement.focus()
        }, 500) // Delay to allow scroll to complete
      }

      // Remove highlight after a few seconds
      setTimeout(() => {
        fieldElement.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2')
      }, 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Perform client-side validation first
    const validationResult = validateForm()
    if (!validationResult.isValid) {
      // Set validation errors for visual indicators
      setValidationErrors(validationResult.errors)
      
      // Scroll to first error field
      scrollToFirstError(validationResult.errors)
      
      const errorCount = Object.keys(validationResult.errors).length
      const errorFields = Object.keys(validationResult.errors)
      
      // Show only first 5 errors to keep toast readable
      const displayErrors = errorFields.slice(0, 5)
      const remainingErrors = errorCount - displayErrors.length
      
      let errorMessage = `❌ Please fix ${errorCount} error${errorCount > 1 ? 's' : ''}:\n\n`
      
      displayErrors.forEach((field, index) => {
        const fieldName = field
          .replace('address.', '')
          .replace('seoMetadata.', '')
          .replace('articleSubmission.', '')
          .replace('classified.', '')
          .replace('social.', '')
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
        errorMessage += `${index + 1}. ${fieldName}\n`
      })
      
      if (remainingErrors > 0) {
        errorMessage += `\n...and ${remainingErrors} more error${remainingErrors > 1 ? 's' : ''}\n`
      }
      
      errorMessage += `\n💡 Check the red highlighted fields below for details.`
      
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
        customFields: customFields
          .filter(field => field.key && field.value)
          .map(field => ({
            key: field.key,
            value: field.value,
            type: field.type,
            section: field.section || 'social'
          }))
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
          
          // Scroll to first error field for server-side validation errors
          scrollToFirstError(data.validationErrors)
          
          const errorFields = Object.keys(data.validationErrors)
          const errorCount = data.errorCount || errorFields.length
          
          // Show only first 5 errors to keep toast readable
          const displayErrors = errorFields.slice(0, 5)
          const remainingErrors = errorCount - displayErrors.length
          
          let errorMessage = `❌ Please fix ${errorCount} error${errorCount > 1 ? 's' : ''}:\n\n`
          
          displayErrors.forEach((field, index) => {
            const fieldName = field
              .replace('address.', '')
              .replace('seoMetadata.', '')
              .replace('articleSubmission.', '')
              .replace('classified.', '')
              .replace('social.', '')
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
            errorMessage += `${index + 1}. ${fieldName}\n`
          })
          
          if (remainingErrors > 0) {
            errorMessage += `\n...and ${remainingErrors} more error${remainingErrors > 1 ? 's' : ''}\n`
          }
          
          errorMessage += `\n💡 Check the red highlighted fields below for details.`
          
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
                      ref={(el) => { fieldRefs.current['projectName'] = el }}
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
                      ref={(el) => { fieldRefs.current['title'] = el }}
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
                    ref={(el) => { fieldRefs.current['websiteURL'] = el }}
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
                      ref={(el) => { fieldRefs.current['email'] = el }}
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
                      <SelectTrigger 
                        ref={(el) => { fieldRefs.current['category'] = el }}
                        className={getFieldError('category') ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business & Industry">Business & Industry</SelectItem>
                        <SelectItem value="Technology & IT">Technology & IT</SelectItem>
                        <SelectItem value="E-Commerce & Retail">E-Commerce & Retail</SelectItem>
                        <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                        <SelectItem value="Finance & Investment">Finance & Investment</SelectItem>
                        <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                        <SelectItem value="Education & Training">Education & Training</SelectItem>
                        <SelectItem value="Home & Lifestyle">Home & Lifestyle</SelectItem>
                        <SelectItem value="Startups & Innovation">Startups & Innovation</SelectItem>
                        <SelectItem value="Travel & Tourism">Travel & Tourism</SelectItem>
                        <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                        <SelectItem value="Automobile & Transport">Automobile & Transport</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Religion & Spirituality">Religion & Spirituality</SelectItem>
                        <SelectItem value="Arts & Entertainment">Arts & Entertainment</SelectItem>
                        <SelectItem value="Jobs & Career">Jobs & Career</SelectItem>
                        <SelectItem value="Beauty & Fashion">Beauty & Fashion</SelectItem>
                        <SelectItem value="Science & Research">Science & Research</SelectItem>
                        <SelectItem value="Environment & Sustainability">Environment & Sustainability</SelectItem>
                        <SelectItem value="Government & Politics">Government & Politics</SelectItem>
                        <SelectItem value="Telecommunication">Telecommunication</SelectItem>
                        <SelectItem value="Legal & Law">Legal & Law</SelectItem>
                        <SelectItem value="Events & Conferences">Events & Conferences</SelectItem>
                        <SelectItem value="Nonprofits & NGOs">Nonprofits & NGOs</SelectItem>
                        <SelectItem value="Pets & Animals">Pets & Animals</SelectItem>
                        <SelectItem value="Parenting & Family">Parenting & Family</SelectItem>
                        <SelectItem value="Personal Blogs & Hobbies">Personal Blogs & Hobbies</SelectItem>
                        <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Media & News">Media & News</SelectItem>
                        <SelectItem value="Miscellaneous / General">Miscellaneous / General</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError('category') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('category')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('category')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      ref={(el) => { fieldRefs.current['companyName'] = el }}
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      required
                      className={getFieldError('companyName') ? 'border-red-500' : ''}
                    />
                    {getFieldError('companyName') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('companyName')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('companyName')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      ref={(el) => { fieldRefs.current['phone'] = el }}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                      className={getFieldError('phone') ? 'border-red-500' : ''}
                    />
                    {getFieldError('phone') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('phone')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('phone')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    ref={(el) => { fieldRefs.current['whatsapp'] = el }}
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                    className={getFieldError('whatsapp') ? 'border-red-500' : ''}
                  />
                  {getFieldError('whatsapp') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('whatsapp')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('whatsapp')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    ref={(el) => { fieldRefs.current['businessDescription'] = el }}
                    value={formData.businessDescription || formData.description}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business..."
                    rows={4}
                    required
                    className={getFieldError('businessDescription') ? 'border-red-500' : ''}
                  />
                  {getFieldError('businessDescription') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('businessDescription')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('businessDescription')}</p>
                    </div>
                  )}
                </div>

                {/* Project-specific fields */}
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience *</Label>
                  <Textarea
                    id="targetAudience"
                    ref={(el) => { fieldRefs.current['targetAudience'] = el }}
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Describe your target audience..."
                    rows={3}
                    required
                    className={getFieldError('targetAudience') ? 'border-red-500' : ''}
                  />
                  {getFieldError('targetAudience') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('targetAudience')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('targetAudience')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Project Goals *</Label>
                  <Textarea
                    id="goals"
                    ref={(el) => { fieldRefs.current['goals'] = el }}
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    placeholder="What are your SEO goals for this project?"
                    rows={3}
                    required
                    className={getFieldError('goals') ? 'border-red-500' : ''}
                  />
                  {getFieldError('goals') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('goals')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('goals')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes *</Label>
                  <Textarea
                    id="notes"
                    ref={(el) => { fieldRefs.current['notes'] = el }}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes or requirements..."
                    rows={3}
                    required
                    className={getFieldError('notes') ? 'border-red-500' : ''}
                  />
                  {getFieldError('notes') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('notes')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('notes')}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessHours">Business Hours *</Label>
                    <Input
                      id="businessHours"
                      ref={(el) => { fieldRefs.current['businessHours'] = el }}
                      value={formData.businessHours}
                      onChange={(e) => handleInputChange('businessHours', e.target.value)}
                      placeholder="Mon-Fri 9AM-5PM"
                      required
                      className={getFieldError('businessHours') ? 'border-red-500' : ''}
                    />
                    {getFieldError('businessHours') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('businessHours')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('businessHours')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year *</Label>
                    <Input
                      id="establishedYear"
                      ref={(el) => { fieldRefs.current['establishedYear'] = el }}
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      required
                      className={getFieldError('establishedYear') ? 'border-red-500' : ''}
                    />
                    {getFieldError('establishedYear') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('establishedYear')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('establishedYear')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoImageURL">Logo Image URL *</Label>
                  <Input
                    id="logoImageURL"
                    ref={(el) => { fieldRefs.current['logoImageURL'] = el }}
                    type="url"
                    value={formData.logoImageURL}
                    onChange={(e) => handleInputChange('logoImageURL', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    required
                    className={getFieldError('logoImageURL') ? 'border-red-500' : ''}
                  />
                  {getFieldError('logoImageURL') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('logoImageURL')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('logoImageURL')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Add custom fields for additional basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.filter(f => f.section === 'basic').map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => updateSectionCustomField('basic', index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={field.type || 'text'} 
                        onValueChange={(value) => updateSectionCustomField('basic', index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder={`Enter ${field.type || 'text'} value`}
                        value={field.value}
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
                        onChange={(e) => updateSectionCustomField('basic', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSectionCustomField('basic', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSectionCustomField('basic')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Field
                </Button>
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
                  <Label htmlFor="building">Building *</Label>
                  <Input
                    id="building"
                    ref={(el) => { fieldRefs.current['address.building'] = el }}
                    value={formData.address.building}
                    onChange={(e) => handleInputChange('address.building', e.target.value)}
                    placeholder="Building name or number"
                    required
                    className={getNestedFieldError('address', 'building') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('address', 'building') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('address', 'building')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('address.building')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    ref={(el) => { fieldRefs.current['address.addressLine1'] = el }}
                    value={formData.address.addressLine1}
                    onChange={(e) => handleInputChange('address.addressLine1', e.target.value)}
                    placeholder="Street address"
                    required
                    className={getFieldError('address.addressLine1') ? 'border-red-500' : ''}
                  />
                  {getFieldError('address.addressLine1') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('address.addressLine1')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('address.addressLine1')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    value={formData.address.addressLine2}
                    onChange={(e) => handleInputChange('address.addressLine2', e.target.value)}
                    placeholder="Apartment, suite, unit, etc. (Optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine3">Address Line 3 *</Label>
                  <Input
                    id="addressLine3"
                    ref={(el) => { fieldRefs.current['address.addressLine3'] = el }}
                    value={formData.address.addressLine3}
                    onChange={(e) => handleInputChange('address.addressLine3', e.target.value)}
                    placeholder="Additional address information"
                    required
                    className={getNestedFieldError('address', 'addressLine3') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('address', 'addressLine3') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('address', 'addressLine3')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('address.addressLine3')}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      ref={(el) => { fieldRefs.current['address.district'] = el }}
                      value={formData.address.district}
                      onChange={(e) => handleInputChange('address.district', e.target.value)}
                      placeholder="District"
                      required
                      className={getFieldError('address.district') ? 'border-red-500' : ''}
                    />
                    {getFieldError('address.district') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('address.district')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('address.district')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      ref={(el) => { fieldRefs.current['address.city'] = el }}
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="City"
                      required
                      className={getFieldError('address.city') ? 'border-red-500' : ''}
                    />
                    {getFieldError('address.city') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('address.city')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('address.city')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      ref={(el) => { fieldRefs.current['address.state'] = el }}
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      placeholder="State"
                      required
                      className={getFieldError('address.state') ? 'border-red-500' : ''}
                    />
                    {getFieldError('address.state') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('address.state')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('address.state')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      ref={(el) => { fieldRefs.current['address.country'] = el }}
                      value={formData.address.country}
                      onChange={(e) => handleInputChange('address.country', e.target.value)}
                      placeholder="Country"
                      required
                      className={getFieldError('address.country') ? 'border-red-500' : ''}
                    />
                    {getFieldError('address.country') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getFieldError('address.country')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('address.country')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    ref={(el) => { fieldRefs.current['address.pincode'] = el }}
                    value={formData.address.pincode}
                    onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                    placeholder="Postal code"
                    required
                    className={getFieldError('address.pincode') ? 'border-red-500' : ''}
                  />
                  {getFieldError('address.pincode') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('address.pincode')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('address.pincode')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Add custom fields for address information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.filter(f => f.section === 'address').map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => updateSectionCustomField('address', index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={field.type || 'text'} 
                        onValueChange={(value) => updateSectionCustomField('address', index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder={`Enter ${field.type || 'text'} value`}
                        value={field.value}
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
                        onChange={(e) => updateSectionCustomField('address', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSectionCustomField('address', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSectionCustomField('address')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Field
                </Button>
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
                  <Label htmlFor="keywords">Keywords *</Label>
                  <Input
                    id="keywords"
                    ref={(el) => { fieldRefs.current['keywords'] = el }}
                    value={displayValues.keywords}
                    onChange={(e) => {
                      // Allow natural typing - just update display value
                      setDisplayValues(prev => ({
                        ...prev,
                        keywords: e.target.value
                      }))
                    }}
                    onBlur={(e) => {
                      // Process comma-separated values when user leaves the field
                      const value = e.target.value
                      const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                      handleInputChange('keywords', array)
                      // Update display value to show cleaned up version
                      setDisplayValues(prev => ({
                        ...prev,
                        keywords: array.join(', ')
                      }))
                    }}
                    onKeyDown={(e) => {
                      // Handle Enter key to process comma-separated values
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value
                        const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                        handleInputChange('keywords', array)
                        // Update display value to show cleaned up version
                        setDisplayValues(prev => ({
                          ...prev,
                          keywords: array.join(', ')
                        }))
                      }
                    }}
                    placeholder="keyword1, keyword2, keyword3"
                    required
                    className={getFieldError('keywords') ? 'border-red-500' : ''}
                  />
                  {getFieldError('keywords') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('keywords')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('keywords')}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitors">Competitors *</Label>
                  <Input
                    id="competitors"
                    ref={(el) => { fieldRefs.current['competitors'] = el }}
                    value={displayValues.competitors}
                    onChange={(e) => {
                      // Allow natural typing - just update display value
                      setDisplayValues(prev => ({
                        ...prev,
                        competitors: e.target.value
                      }))
                    }}
                    onBlur={(e) => {
                      // Process comma-separated values when user leaves the field
                      const value = e.target.value
                      const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                      handleInputChange('competitors', array)
                      // Update display value to show cleaned up version
                      setDisplayValues(prev => ({
                        ...prev,
                        competitors: array.join(', ')
                      }))
                    }}
                    onKeyDown={(e) => {
                      // Handle Enter key to process comma-separated values
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value
                        const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                        handleInputChange('competitors', array)
                        // Update display value to show cleaned up version
                        setDisplayValues(prev => ({
                          ...prev,
                          competitors: array.join(', ')
                        }))
                      }
                    }}
                    placeholder="Enter competitor websites separated by commas"
                    required
                    className={getFieldError('competitors') ? 'border-red-500' : ''}
                  />
                  {getFieldError('competitors') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getFieldError('competitors')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('competitors')}</p>
                    </div>
                  )}
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
                  <Label htmlFor="metaTitle">Meta Title *</Label>
                  <Input
                    id="metaTitle"
                    ref={(el) => { fieldRefs.current['seoMetadata.metaTitle'] = el }}
                    value={formData.seoMetadata.metaTitle}
                    onChange={(e) => handleInputChange('seoMetadata.metaTitle', e.target.value)}
                    placeholder="SEO optimized title (max 60 characters)"
                    maxLength={60}
                    required
                    className={getNestedFieldError('seoMetadata', 'metaTitle') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('seoMetadata', 'metaTitle') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('seoMetadata', 'metaTitle')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('seoMetadata.metaTitle')}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.seoMetadata.metaTitle.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description *</Label>
                  <Textarea
                    id="metaDescription"
                    ref={(el) => { fieldRefs.current['seoMetadata.metaDescription'] = el }}
                    value={formData.seoMetadata.metaDescription}
                    onChange={(e) => handleInputChange('seoMetadata.metaDescription', e.target.value)}
                    placeholder="SEO optimized description (max 160 characters)"
                    rows={3}
                    maxLength={160}
                    required
                    className={getNestedFieldError('seoMetadata', 'metaDescription') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('seoMetadata', 'metaDescription') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('seoMetadata', 'metaDescription')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('seoMetadata.metaDescription')}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.seoMetadata.metaDescription.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Keywords *</Label>
                  <Input
                    id="seoKeywords"
                    ref={(el) => { fieldRefs.current['seoMetadata.keywords'] = el }}
                    value={displayValues.seoKeywords}
                    onChange={(e) => {
                      // Allow natural typing - just update display value
                      setDisplayValues(prev => ({
                        ...prev,
                        seoKeywords: e.target.value
                      }))
                    }}
                    onBlur={(e) => {
                      // Process comma-separated values when user leaves the field
                      const value = e.target.value
                      const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                      handleInputChange('seoMetadata.keywords', array)
                      // Update display value to show cleaned up version
                      setDisplayValues(prev => ({
                        ...prev,
                        seoKeywords: array.join(', ')
                      }))
                    }}
                    onKeyDown={(e) => {
                      // Handle Enter key to process comma-separated values
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value
                        const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                        handleInputChange('seoMetadata.keywords', array)
                        // Update display value to show cleaned up version
                        setDisplayValues(prev => ({
                          ...prev,
                          seoKeywords: array.join(', ')
                        }))
                      }
                    }}
                    placeholder="keyword1, keyword2, keyword3"
                    required
                    className={getNestedFieldError('seoMetadata', 'keywords') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('seoMetadata', 'keywords') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('seoMetadata', 'keywords')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('seoMetadata.keywords')}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetKeywords">Target Keywords *</Label>
                  <Input
                    id="targetKeywords"
                    ref={(el) => { fieldRefs.current['seoMetadata.targetKeywords'] = el }}
                    value={displayValues.targetKeywords}
                    onChange={(e) => {
                      // Allow natural typing - just update display value
                      setDisplayValues(prev => ({
                        ...prev,
                        targetKeywords: e.target.value
                      }))
                    }}
                    onBlur={(e) => {
                      // Process comma-separated values when user leaves the field
                      const value = e.target.value
                      const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                      handleInputChange('seoMetadata.targetKeywords', array)
                      // Update display value to show cleaned up version
                      setDisplayValues(prev => ({
                        ...prev,
                        targetKeywords: array.join(', ')
                      }))
                    }}
                    onKeyDown={(e) => {
                      // Handle Enter key to process comma-separated values
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value
                        const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                        handleInputChange('seoMetadata.targetKeywords', array)
                        // Update display value to show cleaned up version
                        setDisplayValues(prev => ({
                          ...prev,
                          targetKeywords: array.join(', ')
                        }))
                      }
                    }}
                    placeholder="target1, target2, target3"
                    required
                    className={getNestedFieldError('seoMetadata', 'targetKeywords') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('seoMetadata', 'targetKeywords') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('seoMetadata', 'targetKeywords')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('seoMetadata.targetKeywords')}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Primary keywords you want to rank for
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sitemapURL">Sitemap URL *</Label>
                    <Input
                      id="sitemapURL"
                      ref={(el) => { fieldRefs.current['seoMetadata.sitemapURL'] = el }}
                      type="url"
                      value={formData.seoMetadata.sitemapURL}
                      onChange={(e) => handleInputChange('seoMetadata.sitemapURL', e.target.value)}
                      placeholder="https://example.com/sitemap.xml"
                      required
                      className={getNestedFieldError('seoMetadata', 'sitemapURL') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('seoMetadata', 'sitemapURL') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('seoMetadata', 'sitemapURL')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('seoMetadata.sitemapURL')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="robotsURL">Robots.txt URL *</Label>
                    <Input
                      id="robotsURL"
                      ref={(el) => { fieldRefs.current['seoMetadata.robotsURL'] = el }}
                      type="url"
                      value={formData.seoMetadata.robotsURL}
                      onChange={(e) => handleInputChange('seoMetadata.robotsURL', e.target.value)}
                      placeholder="https://example.com/robots.txt"
                      required
                      className={getNestedFieldError('seoMetadata', 'robotsURL') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('seoMetadata', 'robotsURL') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('seoMetadata', 'robotsURL')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('seoMetadata.robotsURL')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Add custom fields for SEO metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.filter(f => f.section === 'seo').map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => updateSectionCustomField('seo', index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={field.type || 'text'} 
                        onValueChange={(value) => updateSectionCustomField('seo', index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder={`Enter ${field.type || 'text'} value`}
                        value={field.value}
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
                        onChange={(e) => updateSectionCustomField('seo', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSectionCustomField('seo', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSectionCustomField('seo')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Field
                </Button>
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
                  <Label htmlFor="articleTitle">Article Title *</Label>
                  <Input
                    id="articleTitle"
                    ref={(el) => { fieldRefs.current['articleSubmission.articleTitle'] = el }}
                    value={formData.articleSubmission.articleTitle}
                    onChange={(e) => handleInputChange('articleSubmission.articleTitle', e.target.value)}
                    placeholder="Enter article title"
                    required
                    className={getNestedFieldError('articleSubmission', 'articleTitle') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('articleSubmission', 'articleTitle') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('articleSubmission', 'articleTitle')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('articleSubmission.articleTitle')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="articleContent">Article Content *</Label>
                  <Textarea
                    id="articleContent"
                    ref={(el) => { fieldRefs.current['articleSubmission.articleContent'] = el }}
                    value={formData.articleSubmission.articleContent}
                    onChange={(e) => handleInputChange('articleSubmission.articleContent', e.target.value)}
                    placeholder="Write your article content here..."
                    rows={8}
                    required
                    className={getNestedFieldError('articleSubmission', 'articleContent') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('articleSubmission', 'articleContent') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('articleSubmission', 'articleContent')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('articleSubmission.articleContent')}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Author Name *</Label>
                    <Input
                      id="authorName"
                      ref={(el) => { fieldRefs.current['articleSubmission.authorName'] = el }}
                      value={formData.articleSubmission.authorName}
                      onChange={(e) => handleInputChange('articleSubmission.authorName', e.target.value)}
                      placeholder="Author name"
                      required
                      className={getNestedFieldError('articleSubmission', 'authorName') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('articleSubmission', 'authorName') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('articleSubmission', 'authorName')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('articleSubmission.authorName')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags *</Label>
                    <Input
                      id="tags"
                      ref={(el) => { fieldRefs.current['articleSubmission.tags'] = el }}
                      value={displayValues.tags || ''}
                      onChange={(e) => {
                        // Allow natural typing by storing in display state
                        setDisplayValues(prev => ({
                          ...prev,
                          tags: e.target.value
                        }))
                      }}
                      onBlur={(e) => {
                        // Process comma-separated values when user leaves the field
                        const value = e.target.value
                        const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                        handleInputChange('articleSubmission.tags', array)
                        // Update display value to show cleaned up version
                        setDisplayValues(prev => ({
                          ...prev,
                          tags: array.join(', ')
                        }))
                      }}
                      onKeyDown={(e) => {
                        // Handle Enter key to process comma-separated values
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = e.currentTarget.value
                          const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
                          handleInputChange('articleSubmission.tags', array)
                          // Update display value to show cleaned up version
                          setDisplayValues(prev => ({
                            ...prev,
                            tags: array.join(', ')
                          }))
                        }
                      }}
                      placeholder="tag1, tag2, tag3"
                      required
                      className={getNestedFieldError('articleSubmission', 'tags') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('articleSubmission', 'tags') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('articleSubmission', 'tags')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('articleSubmission.tags')}</p>
                      </div>
                    )}
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

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Add custom fields for article submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.filter(f => f.section === 'article').map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => updateSectionCustomField('article', index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={field.type || 'text'} 
                        onValueChange={(value) => updateSectionCustomField('article', index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder={`Enter ${field.type || 'text'} value`}
                        value={field.value}
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
                        onChange={(e) => updateSectionCustomField('article', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSectionCustomField('article', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSectionCustomField('article')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Field
                </Button>
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
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    ref={(el) => { fieldRefs.current['classified.productName'] = el }}
                    value={formData.classified.productName}
                    onChange={(e) => handleInputChange('classified.productName', e.target.value)}
                    placeholder="Enter product name"
                    required
                    className={getNestedFieldError('classified', 'productName') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('classified', 'productName') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('classified', 'productName')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('classified.productName')}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      ref={(el) => { fieldRefs.current['classified.price'] = el }}
                      value={formData.classified.price}
                      onChange={(e) => handleInputChange('classified.price', e.target.value)}
                      placeholder="$99.99"
                      required
                      className={getNestedFieldError('classified', 'price') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('classified', 'price') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('classified', 'price')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('classified.price')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.classified.condition} onValueChange={(value) => handleInputChange('classified.condition', value)}>
                      <SelectTrigger 
                        ref={(el) => { fieldRefs.current['classified.condition'] = el }}
                        className={getNestedFieldError('classified', 'condition') ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                    {getNestedFieldError('classified', 'condition') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('classified', 'condition')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('classified.condition')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productImageURL">Product Image URL *</Label>
                  <Input
                    id="productImageURL"
                    ref={(el) => { fieldRefs.current['classified.productImageURL'] = el }}
                    type="url"
                    value={formData.classified.productImageURL}
                    onChange={(e) => handleInputChange('classified.productImageURL', e.target.value)}
                    placeholder="https://example.com/product.jpg"
                    required
                    className={getNestedFieldError('classified', 'productImageURL') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('classified', 'productImageURL') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('classified', 'productImageURL')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('classified.productImageURL')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Add custom fields for classified listings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.filter(f => f.section === 'classified').map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => updateSectionCustomField('classified', index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={field.type || 'text'} 
                        onValueChange={(value) => updateSectionCustomField('classified', index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder={`Enter ${field.type || 'text'} value`}
                        value={field.value}
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
                        onChange={(e) => updateSectionCustomField('classified', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSectionCustomField('classified', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSectionCustomField('classified')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Field
                </Button>
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
                    <Label htmlFor="facebook">Facebook (Optional)</Label>
                    <Input
                      id="facebook"
                      ref={(el) => { fieldRefs.current['social.facebook'] = el }}
                      type="url"
                      value={formData.social.facebook}
                      onChange={(e) => handleInputChange('social.facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage (Optional)"
                      className={getNestedFieldError('social', 'facebook') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('social', 'facebook') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('social', 'facebook')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('social.facebook')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter (Optional)</Label>
                    <Input
                      id="twitter"
                      ref={(el) => { fieldRefs.current['social.twitter'] = el }}
                      type="url"
                      value={formData.social.twitter}
                      onChange={(e) => handleInputChange('social.twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle (Optional)"
                      className={getNestedFieldError('social', 'twitter') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('social', 'twitter') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('social', 'twitter')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('social.twitter')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram (Optional)</Label>
                    <Input
                      id="instagram"
                      ref={(el) => { fieldRefs.current['social.instagram'] = el }}
                      type="url"
                      value={formData.social.instagram}
                      onChange={(e) => handleInputChange('social.instagram', e.target.value)}
                      placeholder="https://instagram.com/yourhandle (Optional)"
                      className={getNestedFieldError('social', 'instagram') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('social', 'instagram') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('social', 'instagram')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('social.instagram')}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                    <Input
                      id="linkedin"
                      ref={(el) => { fieldRefs.current['social.linkedin'] = el }}
                      type="url"
                      value={formData.social.linkedin}
                      onChange={(e) => handleInputChange('social.linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany (Optional)"
                      className={getNestedFieldError('social', 'linkedin') ? 'border-red-500' : ''}
                    />
                    {getNestedFieldError('social', 'linkedin') && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-600">{getNestedFieldError('social', 'linkedin')}</p>
                        <p className="text-xs text-gray-500">{getFieldSuggestion('social.linkedin')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube (Optional)</Label>
                  <Input
                    id="youtube"
                    ref={(el) => { fieldRefs.current['social.youtube'] = el }}
                    type="url"
                    value={formData.social.youtube}
                    onChange={(e) => handleInputChange('social.youtube', e.target.value)}
                    placeholder="https://youtube.com/channel/yourchannel (Optional)"
                    className={getNestedFieldError('social', 'youtube') ? 'border-red-500' : ''}
                  />
                  {getNestedFieldError('social', 'youtube') && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{getNestedFieldError('social', 'youtube')}</p>
                      <p className="text-xs text-gray-500">{getFieldSuggestion('social.youtube')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Add custom fields for additional information with specific field types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.filter(f => (f.section || 'social') === 'social').map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => updateSectionCustomField('social', index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={field.type || 'text'} 
                        onValueChange={(value) => updateSectionCustomField('social', index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder={`Enter ${field.type || 'text'} value`}
                        value={field.value}
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
                        onChange={(e) => updateSectionCustomField('social', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSectionCustomField('social', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSectionCustomField('social')}
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
