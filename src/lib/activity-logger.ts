/* eslint-disable @typescript-eslint/no-explicit-any */
import ActivityLog from '@/models/ActivityLog'
import connectDB from '@/lib/mongodb'

interface LogActivityParams {
  userId: string
  userEmail: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  details?: {
    oldValue?: any
    newValue?: any
    metadata?: any
  }
  ipAddress?: string
  userAgent?: string
}

export async function logActivity(params: LogActivityParams) {
  try {
    await connectDB()
    
    const activityLog = new ActivityLog({
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent
    })

    await activityLog.save()
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

export async function getActivityLogs(
  page: number = 1,
  limit: number = 50,
  filters?: {
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
  }
) {
  try {
    await connectDB()
    
    const query: any = {}
    
    if (filters?.userId) {
      query.userId = filters.userId
    }
    
    if (filters?.action) {
      query.action = filters.action
    }
    
    if (filters?.resource) {
      query.resource = filters.resource
    }
    
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {}
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate
      }
    }

    const skip = (page - 1) * limit
    
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query)
    ])

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Failed to get activity logs:', error)
    throw error
  }
}
