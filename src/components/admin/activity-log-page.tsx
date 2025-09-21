"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Download,
  Activity,
  User,
  FolderOpen,
  CreditCard,
  Link as LinkIcon,
  BarChart3
} from 'lucide-react'

interface ActivityLog {
  _id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  details: {
    oldValue?: any
    newValue?: any
    metadata?: any
  }
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    resource: '',
    userId: ''
  })

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.search && { search: filters.search }),
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.userId && { userId: filters.userId })
      })

      const response = await fetch(`/api/admin/activity?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchActivityLogs()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivityLogs, 30000)
    
    return () => clearInterval(interval)
  }, [fetchActivityLogs])


  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        return <User className="h-4 w-4" />
      case 'project_created':
      case 'project_updated':
      case 'project_deleted':
        return <FolderOpen className="h-4 w-4" />
      case 'payment_successful':
      case 'subscription_created':
      case 'subscription_updated':
        return <CreditCard className="h-4 w-4" />
      case 'seo_tool_used':
      case 'submission_created':
        return <LinkIcon className="h-4 w-4" />
      case 'report_generated':
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('successful')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    }
    if (action.includes('updated')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    }
    if (action.includes('deleted') || action.includes('failed')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    }
    return 'bg-muted text-muted-foreground'
  }

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'project': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'payment': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'subscription': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'seo_tool': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'submission': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300'
      case 'report': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      action: '',
      resource: '',
      userId: ''
    })
    setPage(1)
  }

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground mt-2">Monitor all platform activities</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground mt-2">Monitor all platform activities</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Action
              </label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="user_created">User Created</SelectItem>
                  <SelectItem value="user_updated">User Updated</SelectItem>
                  <SelectItem value="user_deleted">User Deleted</SelectItem>
                  <SelectItem value="project_created">Project Created</SelectItem>
                  <SelectItem value="project_updated">Project Updated</SelectItem>
                  <SelectItem value="project_deleted">Project Deleted</SelectItem>
                  <SelectItem value="payment_successful">Payment Successful</SelectItem>
                  <SelectItem value="subscription_created">Subscription Created</SelectItem>
                  <SelectItem value="seo_tool_used">SEO Tool Used</SelectItem>
                  <SelectItem value="submission_created">Submission Created</SelectItem>
                  <SelectItem value="report_generated">Report Generated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Resource
              </label>
              <Select
                value={filters.resource}
                onValueChange={(value) => handleFilterChange('resource', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="seo_tool">SEO Tool</SelectItem>
                  <SelectItem value="submission">Submission</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                User ID
              </label>
              <Input
                placeholder="User ID..."
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs ({logs.length})</CardTitle>
          <CardDescription>
            Real-time activity monitoring across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="border rounded-lg p-4 hover:bg-accent">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">
                          {log.userName}
                        </span>
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace('_', ' ')}
                        </Badge>
                        <Badge className={getResourceColor(log.resource)}>
                          {log.resource}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {log.userEmail}
                      </p>
                      {log.details.metadata && (
                        <div className="text-xs text-muted-foreground mb-2">
                          {JSON.stringify(log.details.metadata, null, 2)}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                        {log.resourceId && (
                          <span>ID: {log.resourceId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
