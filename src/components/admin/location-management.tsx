"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Save, 
  X,
  Search,
  Filter
} from 'lucide-react'

interface Location {
  _id: string
  name: string
  code: string
  flag: string
  description?: string
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export function LocationManagement() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    flag: '',
    description: '',
    isActive: true,
    priority: 0
  })
  const { showToast } = useToast()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to fetch locations',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      showToast({
        title: 'Error',
        description: 'Failed to fetch locations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingLocation 
        ? `/api/locations/${editingLocation._id}`
        : '/api/locations'
      
      const method = editingLocation ? 'PUT' : 'POST'
      
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
          description: editingLocation 
            ? 'Location updated successfully' 
            : 'Location created successfully'
        })
        setShowAddDialog(false)
        setEditingLocation(null)
        resetForm()
        fetchLocations()
      } else {
        const error = await response.json()
        showToast({
          title: 'Error',
          description: error.error || 'Failed to save location',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving location:', error)
      showToast({
        title: 'Error',
        description: 'Failed to save location',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      code: location.code,
      flag: location.flag,
      description: location.description || '',
      isActive: location.isActive,
      priority: location.priority
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location?')) {
      return
    }

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: 'Location deleted successfully'
        })
        fetchLocations()
      } else {
        const error = await response.json()
        showToast({
          title: 'Error',
          description: error.error || 'Failed to delete location',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      showToast({
        title: 'Error',
        description: 'Failed to delete location',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      flag: '',
      description: '',
      isActive: true,
      priority: 0
    })
  }

  const handleCloseDialog = () => {
    setShowAddDialog(false)
    setEditingLocation(null)
    resetForm()
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Location Management</h2>
          <p className="text-muted-foreground">
            Manage locations for SEO tasks and directory submissions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search locations by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredLocations.length} locations
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>
            Manage locations for SEO tasks and directory submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location._id}>
                  <TableCell>
                    <span className="text-2xl">{location.flag}</span>
                  </TableCell>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{location.code}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {location.description || '-'}
                  </TableCell>
                  <TableCell>{location.priority}</TableCell>
                  <TableCell>
                    <Badge variant={location.isActive ? 'default' : 'secondary'}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(location._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation 
                ? 'Update the location information below.'
                : 'Add a new location for SEO tasks and directory submissions.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Australia"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Country Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., AU"
                maxLength={2}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="flag">Flag Emoji *</Label>
              <Input
                id="flag"
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                placeholder="e.g., 🇦🇺"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this location"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingLocation ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
