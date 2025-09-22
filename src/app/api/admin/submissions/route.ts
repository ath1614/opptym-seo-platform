import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import User from '@/models/User'
import Project from '@/models/Project'
import mongoose from 'mongoose'

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

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    // Build query
    const query: any = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (category && category !== 'all') {
      query.category = category
    }

    if (search) {
      query.$or = [
        { directory: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ]
    }

    // Get submissions with pagination
    const skip = (page - 1) * limit
    const submissions = await Submission.find(query)
      .populate('userId', 'email name username')
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalCount = await Submission.countDocuments(query)
    const totalPages = Math.ceil(totalCount / limit)

    // Get stats
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statsObj = {
      total: totalCount,
      success: 0,
      pending: 0,
      rejected: 0,
      failed: 0
    }

    stats.forEach(stat => {
      if (stat._id === 'success') statsObj.success = stat.count
      else if (stat._id === 'pending') statsObj.pending = stat.count
      else if (stat._id === 'rejected') statsObj.rejected = stat.count
      else if (stat._id === 'failed') statsObj.failed = stat.count
    })

    return NextResponse.json({
      submissions,
      totalPages,
      currentPage: page,
      totalCount,
      stats: statsObj
    })

  } catch (error) {
    console.error('Admin submissions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
