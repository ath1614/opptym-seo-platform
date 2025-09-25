"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Link as LinkIcon,
  Globe,
  Calendar,
  Upload,
  Download,
  Filter,
  Eye,
  Save,
  X,
  MapPin,
  Flag
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Directory {
  _id: string
  name: string
  url: string
  domain: string
  classification: string
  category: string
  country: string
  status: string
  daScore?: number
  pageRank?: number
  priority?: number
  description?: string
  createdAt: string
  updatedAt: string
}

interface Location {
  _id: string
  name: string
  code: string
  flag: string
  description?: string
  isActive: boolean
  priority: number
}

export function DirectoryManagement() {
  const [directories, setDirectories] = useState<Directory[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingDirectory, setEditingDirectory] = useState<Directory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    domain: '',
    classification: '',
    category: '',
    country: '',
    status: 'active',
    daScore: 0,
    pageRank: 0,
    priority: 0,
    description: ''
  })
  const { showToast } = useToast()

  const fetchDirectories = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Increased limit to show more directories
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedLocation && { country: selectedLocation })
      })

      const response = await fetch(`/api/admin/directories?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setDirectories(data.directories)
        setTotalPages(data.totalPages)
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch directories:', error)
      showToast({
        title: 'Error',
        description: 'Failed to fetch directories',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, selectedCategory, selectedLocation, showToast])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/directories/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/locations?active=true')
      if (response.ok) {
        const data = await response.json()
        setLocations(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }, [])

  useEffect(() => {
    fetchDirectories()
    fetchCategories()
    fetchLocations()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDirectories, 60000)
    
    return () => clearInterval(interval)
  }, [fetchDirectories, fetchCategories, fetchLocations])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'inactive':
        return 'bg-muted text-muted-foreground'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getCategoryColor = (category: string) => {
    if (!category) {
      return 'bg-muted text-muted-foreground'
    }
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
    ]
    const index = category.length % colors.length
    return colors[index]
  }

  const handleAddDirectory = () => {
    setFormData({
      name: '',
      url: '',
      domain: '',
      classification: '',
      category: '',
      country: '',
      status: 'active',
      daScore: 0,
      pageRank: 0,
      priority: 0,
      description: ''
    })
    setEditingDirectory(null)
    setShowAddDialog(true)
  }

  const handleEditDirectory = (directory: Directory) => {
    setFormData({
      name: directory.name,
      url: directory.url,
      domain: directory.domain || '',
      classification: directory.classification || '',
      category: directory.category || '',
      country: directory.country || '',
      status: directory.status,
      daScore: directory.daScore || 0,
      pageRank: directory.pageRank || 0,
      priority: directory.priority || 0,
      description: directory.description || ''
    })
    setEditingDirectory(directory)
    setShowAddDialog(true)
  }

  const handleSaveDirectory = async () => {
    try {
      const url = editingDirectory 
        ? `/api/admin/directories/${editingDirectory._id}`
        : '/api/admin/directories'
      
      const method = editingDirectory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: editingDirectory ? 'Directory updated successfully' : 'Directory created successfully',
          variant: 'default'
        })
        setShowAddDialog(false)
        fetchDirectories()
      } else {
        throw new Error('Failed to save directory')
      }
    } catch (error) {
      console.error('Failed to save directory:', error)
      showToast({
        title: 'Error',
        description: 'Failed to save directory',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteDirectory = async (directoryId: string) => {
    try {
      const response = await fetch(`/api/admin/directories/${directoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: 'Directory deleted successfully',
          variant: 'default'
        })
        fetchDirectories()
      } else {
        throw new Error('Failed to delete directory')
      }
    } catch (error) {
      console.error('Failed to delete directory:', error)
      showToast({
        title: 'Error',
        description: 'Failed to delete directory',
        variant: 'destructive'
      })
    }
  }

  const handleBulkImport = async (file: File, category: string, location: string) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      formData.append('location', location)

      const response = await fetch('/api/admin/directories/bulk-import', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        showToast({
          title: 'Success',
          description: `Successfully imported ${data.imported} directories`,
          variant: 'default'
        })
        fetchDirectories()
        setShowBulkImport(false)
      } else {
        throw new Error('Failed to import directories')
      }
    } catch (error) {
      console.error('Failed to import directories:', error)
      showToast({
        title: 'Error',
        description: 'Failed to import directories',
        variant: 'destructive'
      })
    }
  }

  const handleExportDirectories = async () => {
    try {
      const response = await fetch('/api/admin/directories/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'directories.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export directories:', error)
      showToast({
        title: 'Error',
        description: 'Failed to export directories',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Directory Management</h1>
          <p className="text-muted-foreground mt-2">Manage SEO directories and submissions ({directories.length} total)</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportDirectories}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={handleAddDirectory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Directory
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SEO Directories</CardTitle>
              <CardDescription>
                Manage all available SEO directories for submissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search directories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location.name}>
                      {location.flag} {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={fetchDirectories} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Directory Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>DA Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directories.map((directory) => (
                    <TableRow key={directory._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{directory.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {directory.domain || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {directory.country || 'Global'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(directory.classification)}>
                          {directory.classification || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {directory.daScore ? `DA ${directory.daScore}` : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(directory.status)}>
                          {directory.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(directory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditDirectory(directory)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Directory</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{directory.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDirectory(directory._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {directories.length === 0 && (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No directories found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'No directories have been added yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Directory Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDirectory ? 'Edit Directory' : 'Add New Directory'}
            </DialogTitle>
            <DialogDescription>
              {editingDirectory ? 'Update directory information' : 'Add a new directory to the system'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Directory Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., DMOZ Directory"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div>
              <Label htmlFor="classification">Classification</Label>
              <Input
                id="classification"
                value={formData.classification}
                onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                placeholder="e.g., Directory Submission"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., General"
              />
            </div>
            <div>
              <Label htmlFor="country">Location</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location.name}>
                    {location.flag} {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <Label htmlFor="daScore">DA Score</Label>
              <Input
                id="daScore"
                type="number"
                value={formData.daScore}
                onChange={(e) => setFormData({ ...formData, daScore: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="pageRank">Page Rank</Label>
              <Input
                id="pageRank"
                type="number"
                value={formData.pageRank}
                onChange={(e) => setFormData({ ...formData, pageRank: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Directory description..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDirectory}>
              <Save className="h-4 w-4 mr-2" />
              {editingDirectory ? 'Update' : 'Create'} Directory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Bulk Import Directories</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file with columns: name, url, domain, classification, category, status, daScore, pageRank, priority, description
            </p>
            <BulkImportForm 
              categories={categories}
              locations={locations}
              onImport={handleBulkImport}
              onCancel={() => setShowBulkImport(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface BulkImportFormProps {
  categories: string[]
  locations: Location[]
  onImport: (file: File, category: string, location: string) => void
  onCancel: () => void
}

function BulkImportForm({ categories, locations, onImport, onCancel }: BulkImportFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file && category && location) {
      onImport(file, category, location)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Select Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-md"
          required
        >
          <option value="">Choose a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Select Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-md"
          required
        >
          <option value="">Choose a location</option>
          {locations.map((loc) => (
            <option key={loc._id} value={loc.name}>
              {loc.flag} {loc.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Upload CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-input bg-background rounded-md"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!file || !category || !location}>
          Import
        </Button>
      </div>
    </form>
  )
}
