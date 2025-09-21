/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Project from '@/models/Project'
import Link from '@/models/Link'
import ActivityLog from '@/models/ActivityLog'
import Submission from '@/models/Submission'
import SeoToolUsage from '@/models/SeoToolUsage'

export async function GET() {
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

    await connectDB()

    // Get all stats in parallel
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      totalDirectories,
      totalSubmissions,
      totalSeoToolUsages,
      recentActivity,
      subscriptionStats
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      User.countDocuments({ verified: true }).catch(() => 0),
      Project.countDocuments().catch(() => 0),
      Link.countDocuments().catch(() => 0),
      Submission.countDocuments({ status: 'success' }).catch(() => 0),
      SeoToolUsage.countDocuments().catch(() => 0),
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('action userName resource createdAt')
        .lean()
        .catch(() => []),
      User.aggregate([
        {
          $group: {
            _id: '$plan',
            count: { $sum: 1 }
          }
        }
      ]).catch(() => [])
    ])

    // Calculate active subscriptions (paid plans)
    const activeSubscriptions = subscriptionStats
      .filter(stat => stat._id !== 'free')
      .reduce((sum, stat) => sum + stat.count, 0)

    // Calculate total revenue based on actual subscription plans
    const planPrices = {
      'free': 0,
      'pro': 1999,
      'business': 3999,
      'enterprise': 9999
    }
    
    const totalRevenue = subscriptionStats.reduce((sum, stat) => {
      const planPrice = planPrices[stat._id as keyof typeof planPrices] || 0
      return sum + (planPrice * stat.count)
    }, 0)

    const response = {
      totalUsers,
      activeUsers,
      totalProjects,
      totalSubmissions,
      totalSeoToolUsages,
      totalRevenue,
      activeSubscriptions,
      totalDirectories,
      recentActivity: recentActivity.map(activity => ({
        _id: activity._id,
        action: activity.action,
        userName: activity.userName || 'Unknown',
        resource: activity.resource,
        createdAt: activity.createdAt
      }))
    }

    console.log('Admin stats response:', JSON.stringify(response, null, 2))
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
