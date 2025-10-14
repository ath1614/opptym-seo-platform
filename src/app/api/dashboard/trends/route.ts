import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Submission from '@/models/Submission'
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

    await connectDB()

    const userId = new mongoose.Types.ObjectId(session.user.id)

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // Aggregate projects created by user per month (last 12 months)
    const projectGrowthRaw = await Project.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          projects: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: 1
                }
              }
            }
          },
          projects: 1,
          _id: 0
        }
      }
    ])

    // Aggregate successful submissions by user per month (last 12 months)
    const submissionTrendsRaw = await Submission.aggregate([
      {
        $match: {
          userId,
          status: 'success',
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          submissions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: 1
                }
              }
            }
          },
          submissions: 1,
          _id: 0
        }
      }
    ])

    // Normalize to last 12 months and fill missing months with 0
    const monthsLast12 = Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      return `${y}-${m}`
    })

    const projectGrowthMap = new Map(projectGrowthRaw.map((p: any) => [p.month, p.projects]))
    const submissionTrendsMap = new Map(submissionTrendsRaw.map((s: any) => [s.month, s.submissions]))

    const projectGrowth = monthsLast12.map(month => ({ month, projects: projectGrowthMap.get(month) ?? 0 }))
    const submissionTrends = monthsLast12.map(month => ({ month, submissions: submissionTrendsMap.get(month) ?? 0 }))

    return NextResponse.json({ projectGrowth, submissionTrends })
  } catch (error) {
    console.error('Dashboard trends API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}