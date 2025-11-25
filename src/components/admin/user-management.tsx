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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Shield,
  Crown,
  Building,
  Star,
  Plus,
  Ban,
  UserCheck
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface User {
  _id: string
  username: string
  email: string
  companyName?: string
  role: 'user' | 'admin'
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  verified: boolean
  banned?: boolean
  bannedAt?: string
  bannedReason?: string
  createdAt: string
  usage?: {
    projects: number
    submissions: number
    seoTools: number
  }
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    companyName: '',
    role: 'user' as 'user' | 'admin',
    plan: 'free' as 'free' | 'pro' | 'business' | 'enterprise'
  })
  const { showToast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      showToast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchUsers()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchUsers, 60000)
    
    return () => clearInterval(interval)
  }, [fetchUsers])


  const handleEditUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: 'User updated successfully',
          variant: 'default'
        })
        fetchUsers()
        setEditDialogOpen(false)
      } else {
        const error = await response.json()
        showToast({
          title: 'Error',
          description: error.error || 'Failed to update user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      showToast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      })
    }
  }

  const handleBanToggle = async (user: User) => {
    const action = user.banned ? 'unban' : 'ban'
    const reason = user.banned ? '' : prompt('Enter reason for banning this user:')
    
    if (!user.banned && !reason) {
      return // User cancelled or didn't provide reason
    }

    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned: !user.banned,
          bannedReason: reason
        }),
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: `User ${action}ned successfully`,
          variant: 'default'
        })
        fetchUsers()
      } else {
        const error = await response.json()
        showToast({
          title: 'Error',
          description: error.error || `Failed to ${action} user`,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
      showToast({
        title: 'Error',
        description: `Failed to ${action} user`,
        variant: 'destructive'
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: 'User deleted successfully',
          variant: 'default'
        })
        fetchUsers()
        setDeleteDialogOpen(false)
      } else {
        const error = await response.json()
        showToast({
          title: 'Error',
          description: error.error || 'Failed to delete user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      showToast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      })
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        showToast({
          title: 'Success',
          description: 'User created successfully',
          variant: 'default'
        })
        fetchUsers()
        setCreateDialogOpen(false)
        setNewUser({
          username: '',
          email: '',
          password: '',
          companyName: '',
          role: 'user',
          plan: 'free'
        })
      } else {
        const error = await response.json()
        showToast({
          title: 'Error',
          description: error.error || 'Failed to create user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      showToast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive'
      })
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Star className="h-4 w-4 text-muted-foreground" />
      case 'pro': return <Crown className="h-4 w-4 text-blue-500" />
      case 'business': return <Building className="h-4 w-4 text-purple-500" />
      case 'enterprise': return <Shield className="h-4 w-4 text-yellow-500" />
      default: return <Star className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-muted text-muted-foreground'
      case 'pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'business': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'enterprise': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all platform users</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage all platform users</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, plans, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{user.email}</span>
                      {user.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.companyName || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(user.plan)}>
                      <div className="flex items-center space-x-1">
                        {getPlanIcon(user.plan)}
                        <span className="capitalize">{user.plan}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.verified ? 'default' : 'destructive'}>
                      {user.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.banned ? 'destructive' : 'default'}>
                      {user.banned ? 'Banned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div>Projects: {user.usage?.projects || 0}</div>
                      <div>Submissions: {user.usage?.submissions || 0}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanToggle(user)}
                        className={user.banned ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}
                      >
                        {user.banned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSave={(updates) => handleEditUser(selectedUser._id, updates)}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account with custom settings
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm 
            user={newUser}
            onSave={handleCreateUser}
            onCancel={() => setCreateDialogOpen(false)}
            onChange={setNewUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Edit User Form Component
function EditUserForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: User
  onSave: (updates: Partial<User>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    companyName: user.companyName || '',
    role: user.role,
    plan: user.plan,
    verified: user.verified
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Username
        </label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Company Name
        </label>
        <Input
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Role
        </label>
        <Select
          value={formData.role}
          onValueChange={(value: 'user' | 'admin') => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Plan
        </label>
        <Select
          value={formData.plan}
          onValueChange={(value: 'free' | 'pro' | 'business' | 'enterprise') => setFormData({ ...formData, plan: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="verified"
          checked={formData.verified}
          onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="verified" className="text-sm font-medium text-foreground">
          Email Verified
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  )
}

// Create User Form Component
function CreateUserForm({ 
  user, 
  onSave, 
  onCancel,
  onChange
}: { 
  user: {
    username: string
    email: string
    password: string
    companyName: string
    role: 'user' | 'admin'
    plan: 'free' | 'pro' | 'business' | 'enterprise'
  }
  onSave: () => void
  onCancel: () => void
  onChange: (user: {
    username: string
    email: string
    password: string
    companyName: string
    role: 'user' | 'admin'
    plan: 'free' | 'pro' | 'business' | 'enterprise'
  }) => void
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Username
        </label>
        <Input
          value={user.username}
          onChange={(e) => onChange({ ...user, username: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <Input
          type="email"
          value={user.email}
          onChange={(e) => onChange({ ...user, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Password
        </label>
        <Input
          type="password"
          value={user.password}
          onChange={(e) => onChange({ ...user, password: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Company Name
        </label>
        <Input
          value={user.companyName}
          onChange={(e) => onChange({ ...user, companyName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Role
        </label>
        <Select
          value={user.role}
          onValueChange={(value: 'user' | 'admin') => onChange({ ...user, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Plan
        </label>
        <Select
          value={user.plan}
          onValueChange={(value: 'free' | 'pro' | 'business' | 'enterprise') => onChange({ ...user, plan: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create User</Button>
      </DialogFooter>
    </form>
  )
}
