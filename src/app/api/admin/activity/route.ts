/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getActivityLogs } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    // const search = searchParams.get('search') || ''
    const action = searchParams.get('action') || ''
    const resource = searchParams.get('resource') || ''
    const userId = searchParams.get('userId') || ''

    const filters: Record<string, string> = {}
    
    if (action) {
      filters.action = action
    }
    
    if (resource) {
      filters.resource = resource
    }
    
    if (userId) {
      filters.userId = userId
    }

    // If search is provided, we'll need to implement text search
    // For now, we'll use the existing filters
    const result = await getActivityLogs(page, limit, filters)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Admin activity logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}
