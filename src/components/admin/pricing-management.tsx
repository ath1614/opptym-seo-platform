"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Edit, Plus, Save, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface PricingPlan {
  _id?: string
  name: string
  price: number
  features: string[]
  active: boolean
  description?: string
  maxProjects?: number
  maxSubmissions?: number
  maxSeoTools?: number
}

export function PricingManagement() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<PricingPlan | null>(null)
  const [newPlan, setNewPlan] = useState<PricingPlan>({
    name: '',
    price: 0,
    features: [],
    active: true,
    description: '',
    maxProjects: 1,
    maxSubmissions: 10,
    maxSeoTools: 5
  })
  const { showToast } = useToast()

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch plans from the API
      const response = await fetch('/api/admin/pricing')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      } else {
        throw new Error('Failed to fetch pricing plans')
      }
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error)
      showToast({
        title: 'Error',
        description: 'Failed to fetch pricing plans',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const handleSavePlan = async (plan: PricingPlan) => {
    try {
      const response = await fetch('/api/admin/pricing', {
        method: plan._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: `Plan ${plan._id ? 'updated' : 'created'} successfully`,
          variant: 'default'
        })
        fetchPlans()
        setIsDialogOpen(false)
        setEditingPlan(null)
        setNewPlan({
          name: '',
          price: 0,
          features: [],
          active: true,
          description: '',
          maxProjects: 1,
          maxSubmissions: 10,
          maxSeoTools: 5
        })
      } else {
        throw new Error('Failed to save plan')
      }
    } catch (error) {
      console.error('Failed to save plan:', error)
      showToast({
        title: 'Error',
        description: 'Failed to save plan',
        variant: 'destructive'
      })
    }
  }

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan)
    setIsDialogOpen(true)
  }

  const handleAddNewPlan = () => {
    setEditingPlan(null)
    setNewPlan({
      name: '',
      price: 0,
      features: [],
      active: true,
      description: '',
      maxProjects: 1,
      maxSubmissions: 10,
      maxSeoTools: 5
    })
    setIsDialogOpen(true)
  }

  const addFeature = (plan: PricingPlan, setPlan: (plan: PricingPlan) => void) => {
    const newFeature = prompt('Enter feature:')
    if (newFeature) {
      setPlan({
        ...plan,
        features: [...plan.features, newFeature]
      })
    }
  }

  const removeFeature = (plan: PricingPlan, setPlan: (plan: PricingPlan) => void, index: number) => {
    setPlan({
      ...plan,
      features: plan.features.filter((_, i) => i !== index)
    })
  }

  const handleDeletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/admin/pricing/${planId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: 'Pricing plan deleted successfully',
          variant: 'default'
        })
        fetchPlans()
        setDeletingPlan(null)
      } else {
        const error = await response.json()
        showToast({
          title: 'Error',
          description: error.error || 'Failed to delete pricing plan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to delete pricing plan:', error)
      showToast({
        title: 'Error',
        description: 'Failed to delete pricing plan',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pricing Management</h1>
            <p className="text-muted-foreground mt-2">Manage subscription plans and pricing</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pricing Management</h1>
          <p className="text-muted-foreground mt-2">Manage subscription plans and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update the pricing plan details' : 'Create a new pricing plan'}
              </DialogDescription>
            </DialogHeader>
            <PlanForm 
              plan={editingPlan || newPlan}
              setPlan={editingPlan ? setEditingPlan : setNewPlan}
              onSave={handleSavePlan}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingPlan(null)
              }}
              addFeature={addFeature}
              removeFeature={removeFeature}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant={plan.active ? "default" : "secondary"}>
                  {plan.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                ₹{plan.price}
                {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {feature}
                  </li>
                ))}
              </ul>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setDeletingPlan(plan)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Analytics</CardTitle>
          <CardDescription>Revenue and subscription insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Pricing Analytics</h3>
            <p className="text-muted-foreground">
              Detailed pricing analytics and revenue tracking will be available here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pricing Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{deletingPlan?.name}" plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPlan(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingPlan?._id && handleDeletePlan(deletingPlan._id)}
            >
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PlanFormProps {
  plan: PricingPlan
  setPlan: (plan: PricingPlan) => void
  onSave: (plan: PricingPlan) => void
  onCancel: () => void
  addFeature: (plan: PricingPlan, setPlan: (plan: PricingPlan) => void) => void
  removeFeature: (plan: PricingPlan, setPlan: (plan: PricingPlan) => void, index: number) => void
}

function PlanForm({ plan, setPlan, onSave, onCancel, addFeature, removeFeature }: PlanFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={plan.name}
            onChange={(e) => setPlan({ ...plan, name: e.target.value })}
            placeholder="e.g., Pro, Business"
          />
        </div>
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={plan.price}
            onChange={(e) => setPlan({ ...plan, price: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={plan.description || ''}
          onChange={(e) => setPlan({ ...plan, description: e.target.value })}
          placeholder="Plan description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="maxProjects">Max Projects</Label>
          <Input
            id="maxProjects"
            type="number"
            value={plan.maxProjects || 1}
            onChange={(e) => setPlan({ ...plan, maxProjects: parseInt(e.target.value) || 1 })}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="maxSubmissions">Max Submissions</Label>
          <Input
            id="maxSubmissions"
            type="number"
            value={plan.maxSubmissions || 10}
            onChange={(e) => setPlan({ ...plan, maxSubmissions: parseInt(e.target.value) || 10 })}
            placeholder="10"
          />
        </div>
        <div>
          <Label htmlFor="maxSeoTools">Max SEO Tools</Label>
          <Input
            id="maxSeoTools"
            type="number"
            value={plan.maxSeoTools || 5}
            onChange={(e) => setPlan({ ...plan, maxSeoTools: parseInt(e.target.value) || 5 })}
            placeholder="5"
          />
        </div>
      </div>

      <div>
        <Label>Features</Label>
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input value={feature} readOnly />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(plan, setPlan, index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addFeature(plan, setPlan)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="active"
          checked={plan.active}
          onChange={(e) => setPlan({ ...plan, active: e.target.checked })}
        />
        <Label htmlFor="active">Active Plan</Label>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(plan)}>
          <Save className="h-4 w-4 mr-2" />
          Save Plan
        </Button>
      </DialogFooter>
    </div>
  )
}
