"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Code, CheckCircle, AlertTriangle, ExternalLink, Copy, Download, Eye, Zap, Sparkles, Loader2 } from 'lucide-react'
import { SEOToolLayout } from './seo-tool-layout'
import { useToast } from '@/components/ui/toast'

interface Project {
  _id: string
  projectName: string
  websiteURL?: string
  companyName?: string
  businessDescription?: string
  metaTitle?: string
  metaDescription?: string
  logoImageURL?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  priceRange?: string
  establishedYear?: string
}

const schemaTypes = [
  { value: 'article', label: 'Article', category: 'Content' },
  { value: 'blogPosting', label: 'Blog Post', category: 'Content' },
  { value: 'newsArticle', label: 'News Article', category: 'Content' },
  { value: 'localBusiness', label: 'Local Business', category: 'Business' },
  { value: 'restaurant', label: 'Restaurant', category: 'Business' },
  { value: 'product', label: 'Product', category: 'E-commerce' },
  { value: 'offer', label: 'Offer', category: 'E-commerce' },
  { value: 'faq', label: 'FAQ Page', category: 'Content' },
  { value: 'event', label: 'Event', category: 'Events' },
  { value: 'recipe', label: 'Recipe', category: 'Content' },
  { value: 'organization', label: 'Organization', category: 'Business' },
  { value: 'person', label: 'Person', category: 'People' },
  { value: 'website', label: 'Website', category: 'Technical' },
  { value: 'breadcrumbList', label: 'Breadcrumb List', category: 'Technical' },
  { value: 'jobPosting', label: 'Job Posting', category: 'Business' },
  { value: 'course', label: 'Course', category: 'Education' },
  { value: 'review', label: 'Review', category: 'Content' },
  { value: 'videoObject', label: 'Video', category: 'Media' },
]

interface SchemaData {
  '@context': string;
  '@type': string;
  name?: string;
  description?: string;
  image?: string;
  url?: string;
  headline?: string;
  title?: string;
  author?: {
    '@type': string;
    name: string;
  };
  datePublished?: string;
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  address?: {
    '@type': string;
    streetAddress: string;
  };
  telephone?: string;
  priceRange?: string;
  brand?: {
    '@type': string;
    name: string;
  };
  sku?: string;
  offers?: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
  };
  mainEntity?: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
  startDate?: string;
  endDate?: string;
  location?: {
    '@type': string;
    name: string;
    address: {
      '@type': string;
      streetAddress: string;
    };
  };
  cookTime?: string;
  prepTime?: string;
  recipeYield?: string;
  recipeIngredient?: string[];
  recipeInstructions?: Array<{
    '@type': string;
    text: string;
  }>;
  foundingDate?: string;
  founder?: {
    '@type': string;
    name: string;
  };
  logo?: string;
  jobTitle?: string;
  birthDate?: string;
  baseSalary?: {
    '@type': string;
    currency: string;
    value: {
      '@type': string;
      value: string;
    };
  };
  employmentType?: string;
  hiringOrganization?: {
    '@type': string;
    name: string;
  };
  provider?: {
    '@type': string;
    name: string;
  };
  instructor?: {
    '@type': string;
    name: string;
  };
  duration?: string;
  contentUrl?: string;
  uploadDate?: string;
  thumbnailUrl?: string;
  itemListElement?: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}

export function SchemaMarkupGenerator() {
  const [schemaType, setSchemaType] = useState('article')
  const [activeTab, setActiveTab] = useState('form')
  const [generatedSchema, setGeneratedSchema] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null)
  
  // Project-related state
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isAutoPopulating, setIsAutoPopulating] = useState(false)
  
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    description: '',
    url: '',
    image: '',
    
    // Article fields
    headline: '',
    author: '',
    datePublished: '',
    publisher: '',
    
    // Business fields
    address: '',
    telephone: '',
    priceRange: '',
    
    // Product fields
    price: '',
    currency: 'USD',
    availability: 'InStock',
    brand: '',
    sku: '',
    
    // FAQ fields
    questions: [{ question: '', answer: '' }],
    
    // Event fields
    startDate: '',
    endDate: '',
    location: '',
    
    // Recipe fields
    prepTime: '',
    cookTime: '',
    recipeYield: '',
    ingredients: '',
    instructions: '',
    
    // Organization fields
    foundingDate: '',
    founderName: '',
    
    // Person fields
    jobTitle: '',
    birthDate: '',
    
    // Additional fields for new schema types
    category: '',
    rating: '',
    reviewCount: '',
    salary: '',
    employmentType: '',
    courseDuration: '',
    instructor: '',
    breadcrumbs: [{ name: '', url: '' }],
    videoUrl: '',
    uploadDate: '',
    videoDuration: '',
    thumbnailUrl: ''
  })

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  // Auto-populate form with project data
  const autoPopulateFromProject = async () => {
    if (!selectedProject) {
      showToast({
        title: 'No Project Selected',
        description: 'Please select a project to auto-populate the form.',
        variant: 'destructive'
      })
      return
    }

    setIsAutoPopulating(true)
    
    try {
      const project = projects.find(p => p._id === selectedProject)
      if (!project) {
        throw new Error('Project not found')
      }

      // Map project data to form fields based on schema type
      const updatedFormData = { ...formData }
      
      // Common mappings for all schema types
      updatedFormData.name = project.projectName || project.companyName || ''
      updatedFormData.description = project.businessDescription || project.metaDescription || ''
      updatedFormData.url = project.websiteURL || ''
      updatedFormData.image = project.logoImageURL || ''
      
      // Schema-specific mappings
      switch (schemaType) {
        case 'article':
        case 'blogPosting':
        case 'newsArticle':
          updatedFormData.headline = project.metaTitle || project.projectName || ''
          updatedFormData.author = project.companyName || ''
          updatedFormData.publisher = project.companyName || ''
          updatedFormData.datePublished = new Date().toISOString().split('T')[0]
          break
          
        case 'localBusiness':
        case 'restaurant':
          updatedFormData.name = project.companyName || project.projectName || ''
          updatedFormData.address = `${project.streetAddress || ''} ${project.city || ''} ${project.state || ''} ${project.zipCode || ''}`.trim()
          updatedFormData.telephone = project.phone || ''
          updatedFormData.priceRange = project.priceRange || ''
          break
          
        case 'product':
          updatedFormData.name = project.projectName || ''
          updatedFormData.brand = project.companyName || ''
          updatedFormData.description = project.businessDescription || ''
          break
          
        case 'organization':
          updatedFormData.name = project.companyName || project.projectName || ''
          updatedFormData.foundingDate = project.establishedYear ? `${project.establishedYear}-01-01` : ''
          updatedFormData.address = `${project.streetAddress || ''} ${project.city || ''} ${project.state || ''} ${project.zipCode || ''}`.trim()
          updatedFormData.telephone = project.phone || ''
          break
          
        case 'website':
          updatedFormData.name = project.projectName || ''
          updatedFormData.description = project.metaDescription || project.businessDescription || ''
          break
          
        case 'jobPosting':
          updatedFormData.name = project.projectName || ''
          updatedFormData.description = project.businessDescription || ''
          break
      }
      
      setFormData(updatedFormData)
      
      showToast({
        title: 'Form Auto-Populated',
        description: 'Form fields have been filled with project data. You can now review and modify as needed.',
        variant: 'success'
      })
      
    } catch (error) {
      console.error('Error auto-populating form:', error)
      showToast({
        title: 'Auto-Population Failed',
        description: 'There was an error auto-populating the form. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAutoPopulating(false)
    }
  }

  // Validation functions
  const validateSchema = (schema: SchemaData): ValidationResult => {
    const warnings: string[] = []
    const suggestions: string[] = []
    let isValid = true

    // Required field validation
    if (!schema.name && !schema.headline) {
      warnings.push('Missing required name/headline field')
      isValid = false
    }

    if (!schema.description) {
      warnings.push('Description is recommended for better SEO')
    }

    if (!schema.image) {
      suggestions.push('Adding an image URL can improve rich snippet appearance')
    }

    if (!schema.url) {
      suggestions.push('Adding a canonical URL is recommended')
    }

    // Type-specific validation
    switch (schemaType) {
      case 'article':
      case 'blogPosting':
      case 'newsArticle':
        if (!schema.author) {
          warnings.push('Author information is highly recommended for articles')
        }
        if (!schema.datePublished) {
          warnings.push('Publication date is important for article credibility')
        }
        break
        
      case 'product':
        if (!schema.offers?.price) {
          warnings.push('Price information is required for products')
          isValid = false
        }
        break
        
      case 'localBusiness':
      case 'restaurant':
        if (!schema.address) {
          warnings.push('Address is required for local businesses')
          isValid = false
        }
        break
        
      case 'event':
        if (!schema.startDate) {
          warnings.push('Start date is required for events')
          isValid = false
        }
        break
    }

    return { isValid, warnings, suggestions }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    })
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', answer: '' }]
    })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions.splice(index, 1)
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    })
  }

  const generateSchema = () => {
    setIsValidating(true)
    
    const schemaTypeMapping: { [key: string]: string } = {
      'localBusiness': 'LocalBusiness',
      'blogPosting': 'BlogPosting',
      'newsArticle': 'NewsArticle',
      'jobPosting': 'JobPosting',
      'videoObject': 'VideoObject',
      'breadcrumbList': 'BreadcrumbList'
    }
    
    let schema: SchemaData = {
      '@context': 'https://schema.org',
      '@type': schemaTypeMapping[schemaType] || schemaType.charAt(0).toUpperCase() + schemaType.slice(1),
      name: formData.name,
      description: formData.description,
      url: formData.url,
      image: formData.image
    }
    
    switch (schemaType) {
      case 'article':
      case 'blogPosting':
      case 'newsArticle':
        schema = {
          ...schema,
          headline: formData.headline || formData.name,
          author: {
            '@type': 'Person',
            name: formData.author
          },
          datePublished: formData.datePublished,
          publisher: {
            '@type': 'Organization',
            name: formData.publisher,
            logo: {
              '@type': 'ImageObject',
              url: formData.image
            }
          }
        }
        break
        
      case 'localBusiness':
      case 'restaurant':
        schema = {
          ...schema,
          address: {
            '@type': 'PostalAddress',
            streetAddress: formData.address
          },
          telephone: formData.telephone,
          priceRange: formData.priceRange
        }
        break
        
      case 'product':
        schema = {
          ...schema,
          brand: {
            '@type': 'Brand',
            name: formData.brand
          },
          sku: formData.sku,
          offers: {
            '@type': 'Offer',
            price: formData.price,
            priceCurrency: formData.currency,
            availability: `https://schema.org/${formData.availability}`
          }
        }
        break
        
      case 'faq':
        schema = {
          ...schema,
          mainEntity: formData.questions.map(q => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer
            }
          }))
        }
        break
        
      case 'event':
        schema = {
          ...schema,
          startDate: formData.startDate,
          endDate: formData.endDate,
          location: {
            '@type': 'Place',
            name: formData.location,
            address: {
              '@type': 'PostalAddress',
              streetAddress: formData.address
            }
          }
        }
        break
        
      case 'recipe':
        schema = {
          ...schema,
          author: {
            '@type': 'Person',
            name: formData.author
          },
          prepTime: formData.prepTime,
          cookTime: formData.cookTime,
          recipeYield: formData.recipeYield,
          recipeIngredient: formData.ingredients.split('\n').filter(i => i.trim()),
          recipeInstructions: formData.instructions.split('\n').filter(i => i.trim()).map(instruction => ({
            '@type': 'HowToStep',
            text: instruction
          }))
        }
        break
        
      case 'organization':
        schema = {
          ...schema,
          description: formData.description,
          url: formData.url,
          logo: formData.image,
          foundingDate: formData.foundingDate,
          founder: {
            '@type': 'Person',
            name: formData.founderName
          }
        }
        break
        
      case 'person':
        schema = {
          ...schema,
          jobTitle: formData.jobTitle,
          birthDate: formData.birthDate
        }
        break
        
      case 'jobPosting':
        schema = {
          ...schema,
          '@type': 'JobPosting',
          title: formData.name,
          description: formData.description,
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: formData.currency,
            value: {
              '@type': 'QuantitativeValue',
              value: formData.salary
            }
          },
          employmentType: formData.employmentType,
          hiringOrganization: {
            '@type': 'Organization',
            name: formData.publisher
          }
        }
        break
        
      case 'course':
        schema = {
          ...schema,
          '@type': 'Course',
          name: formData.name,
          description: formData.description,
          provider: {
            '@type': 'Organization',
            name: formData.publisher
          },
          instructor: {
            '@type': 'Person',
            name: formData.instructor
          },
          duration: formData.courseDuration
        }
        break
        
      case 'videoObject':
        schema = {
          ...schema,
          '@type': 'VideoObject',
          name: formData.name,
          description: formData.description,
          contentUrl: formData.videoUrl,
          uploadDate: formData.uploadDate,
          duration: formData.videoDuration,
          thumbnailUrl: formData.thumbnailUrl
        }
        break
        
      case 'breadcrumbList':
        schema = {
          ...schema,
          '@type': 'BreadcrumbList',
          itemListElement: formData.breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url
          }))
        }
        break
    }
    
    // Validate the generated schema
    const validation = validateSchema(schema)
    setValidationResults(validation)
    
    setGeneratedSchema(JSON.stringify(schema, null, 2))
    setActiveTab('preview')
    setIsValidating(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSchema)
  }

  const renderFormFields = () => {
    // Common fields for all schema types
    const commonFields = (
      <>
        <div className="grid gap-4 mb-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name/Title</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
              placeholder="Enter name or title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleInputChange('description', e.target.value)} 
              placeholder="Enter description"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input 
              id="url" 
              value={formData.url} 
              onChange={(e) => handleInputChange('url', e.target.value)} 
              placeholder="https://example.com/page"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input 
              id="image" 
              value={formData.image} 
              onChange={(e) => handleInputChange('image', e.target.value)} 
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </>
    )

    // Type-specific fields
    let specificFields = null
    
    switch (schemaType) {
      case 'article':
        specificFields = (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="headline">Headline</Label>
                <Input 
                  id="headline" 
                  value={formData.headline} 
                  onChange={(e) => handleInputChange('headline', e.target.value)} 
                  placeholder="Article headline"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input 
                  id="author" 
                  value={formData.author} 
                  onChange={(e) => handleInputChange('author', e.target.value)} 
                  placeholder="Author name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="datePublished">Date Published</Label>
                <Input 
                  id="datePublished" 
                  type="date"
                  value={formData.datePublished} 
                  onChange={(e) => handleInputChange('datePublished', e.target.value)} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input 
                  id="publisher" 
                  value={formData.publisher} 
                  onChange={(e) => handleInputChange('publisher', e.target.value)} 
                  placeholder="Publisher name"
                />
              </div>
            </div>
          </>
        )
        break
        
      case 'localBusiness':
        specificFields = (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => handleInputChange('address', e.target.value)} 
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="telephone">Telephone</Label>
                <Input 
                  id="telephone" 
                  value={formData.telephone} 
                  onChange={(e) => handleInputChange('telephone', e.target.value)} 
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priceRange">Price Range</Label>
                <Input 
                  id="priceRange" 
                  value={formData.priceRange} 
                  onChange={(e) => handleInputChange('priceRange', e.target.value)} 
                  placeholder="$$ or $$$"
                />
              </div>
            </div>
          </>
        )
        break
        
      case 'product':
        specificFields = (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  value={formData.price} 
                  onChange={(e) => handleInputChange('price', e.target.value)} 
                  placeholder="29.99"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="availability">Availability</Label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(value) => handleInputChange('availability', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="InStock">In Stock</SelectItem>
                    <SelectItem value="OutOfStock">Out of Stock</SelectItem>
                    <SelectItem value="PreOrder">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
        break
        
      case 'faq':
        specificFields = (
          <>
            <div className="grid gap-6 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">FAQ Questions</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addQuestion}
                >
                  Add Question
                </Button>
              </div>
              
              {formData.questions.map((q, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    {formData.questions.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeQuestion(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`question-${index}`}>Question</Label>
                      <Input 
                        id={`question-${index}`} 
                        value={q.question} 
                        onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} 
                        placeholder="Enter question"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor={`answer-${index}`}>Answer</Label>
                      <Textarea 
                        id={`answer-${index}`} 
                        value={q.answer} 
                        onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)} 
                        placeholder="Enter answer"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )
        break
        
      case 'event':
        specificFields = (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="datetime-local"
                  value={formData.startDate} 
                  onChange={(e) => handleInputChange('startDate', e.target.value)} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="datetime-local"
                  value={formData.endDate} 
                  onChange={(e) => handleInputChange('endDate', e.target.value)} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location Name</Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => handleInputChange('location', e.target.value)} 
                  placeholder="Venue name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => handleInputChange('address', e.target.value)} 
                  placeholder="Full address"
                  rows={2}
                />
              </div>
            </div>
          </>
        )
        break
        
      case 'recipe':
        specificFields = (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input 
                  id="author" 
                  value={formData.author} 
                  onChange={(e) => handleInputChange('author', e.target.value)} 
                  placeholder="Recipe author"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="prepTime">Prep Time (ISO format)</Label>
                <Input 
                  id="prepTime" 
                  value={formData.prepTime} 
                  onChange={(e) => handleInputChange('prepTime', e.target.value)} 
                  placeholder="PT15M (15 minutes)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cookTime">Cook Time (ISO format)</Label>
                <Input 
                  id="cookTime" 
                  value={formData.cookTime} 
                  onChange={(e) => handleInputChange('cookTime', e.target.value)} 
                  placeholder="PT1H (1 hour)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="recipeYield">Recipe Yield</Label>
                <Input 
                  id="recipeYield" 
                  value={formData.recipeYield} 
                  onChange={(e) => handleInputChange('recipeYield', e.target.value)} 
                  placeholder="4 servings"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                <Textarea 
                  id="ingredients" 
                  value={formData.ingredients} 
                  onChange={(e) => handleInputChange('ingredients', e.target.value)} 
                  placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs"
                  rows={4}
                />
              </div>
            </div>
          </>
        )
        break
        
      case 'organization':
        specificFields = (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="foundingDate">Founding Date</Label>
                <Input 
                  id="foundingDate" 
                  type="date"
                  value={formData.foundingDate} 
                  onChange={(e) => handleInputChange('foundingDate', e.target.value)} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="founderName">Founder Name</Label>
                <Input 
                  id="founderName" 
                  value={formData.founderName} 
                  onChange={(e) => handleInputChange('founderName', e.target.value)} 
                  placeholder="Founder's name"
                />
              </div>
            </div>
          </>
        )
        break
        
      case 'person':
        specificFields = (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input 
                  id="jobTitle" 
                  value={formData.jobTitle} 
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)} 
                  placeholder="CEO, Developer, etc."
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input 
                  id="birthDate" 
                  type="date"
                  value={formData.birthDate} 
                  onChange={(e) => handleInputChange('birthDate', e.target.value)} 
                />
              </div>
            </div>
          </>
        )
        break
    }

    return (
      <>
        {commonFields}
        {specificFields}
      </>
    )
  }

  return (
    <SEOToolLayout 
      toolId="schema-validator"
      toolName="Schema Markup Generator"
      toolDescription="Create structured data markup for your website to enhance search engine visibility"
      mockData={{}}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Schema Markup Generator
            </CardTitle>
            <CardDescription>
              Create structured data markup for your website to enhance search engine visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="form">Form</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="form">
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="schemaType">Schema Type</Label>
                    <Select 
                      value={schemaType} 
                      onValueChange={setSchemaType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select schema type" />
                      </SelectTrigger>
                      <SelectContent>
                        {schemaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project Selection and Auto-Fill */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        Auto-Fill from Project
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Select a project to automatically populate schema fields with your project data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Select 
                            value={selectedProject} 
                            onValueChange={setSelectedProject}
                            disabled={isLoadingProjects}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project._id} value={project._id}>
                                  {project.projectName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={autoPopulateFromProject}
                          disabled={!selectedProject || isAutoPopulating}
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-blue-50 border-blue-200"
                        >
                          {isAutoPopulating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Filling...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Auto-Fill
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {renderFormFields()}
                  
                  <Button onClick={generateSchema} className="w-full">
                    Generate Schema Markup
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                      <code>{generatedSchema}</code>
                    </pre>
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={copyToClipboard}
                    >
                      Copy
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Implementation Instructions</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add the following script tag to the &lt;head&gt; section of your HTML:
                    </p>
                    <pre className="bg-background p-2 rounded-md text-xs overflow-x-auto">
                      <code>{`<script type="application/ld+json">\n${generatedSchema}\n</script>`}</code>
                    </pre>
                  </div>
                  
                  <Button variant="outline" onClick={() => setActiveTab('form')} className="w-full">
                    Back to Form
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}

export default SchemaMarkupGenerator