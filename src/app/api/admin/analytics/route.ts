/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Project from '@/models/Project'
import Submission from '@/models/Submission'

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

    // Get user growth data (last 12 months)
    const userGrowthRaw = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
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
          users: 1,
          _id: 0
        }
      }
    ])

    // Get project growth data (last 12 months)
    const projectGrowthRaw = await Project.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
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
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
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

    // Get submission trends (last 12 months)
    const submissionTrendsRaw = await Submission.aggregate([
      {
        $match: {
          submittedAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          },
          status: 'success'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          submissions: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
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

    // Normalize to last 12 months with zero-fill for missing months
    const monthsLast12 = Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      return `${y}-${m}`
    })

    const userGrowthMap = new Map(userGrowthRaw.map((u: any) => [u.month, u.users]))
    const projectGrowthMap = new Map(projectGrowthRaw.map((p: any) => [p.month, p.projects]))
    const submissionTrendsMap = new Map(submissionTrendsRaw.map((s: any) => [s.month, s.submissions]))

    const userGrowth = monthsLast12.map(month => ({ month, users: userGrowthMap.get(month) ?? 0 }))
    const projectGrowth = monthsLast12.map(month => ({ month, projects: projectGrowthMap.get(month) ?? 0 }))
    const submissionTrends = monthsLast12.map(month => ({ month, submissions: submissionTrendsMap.get(month) ?? 0 }))

    // Get plan distribution
    const planStats = await User.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ])

    const totalUsers = planStats.reduce((sum, stat) => sum + stat.count, 0)
    const planDistribution = planStats.map(stat => ({
      plan: stat._id,
      count: stat.count,
      percentage: Math.round((stat.count / totalUsers) * 100)
    }))

    // Get top categories
    const topCategories = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      }
    ])

    return NextResponse.json({
      userGrowth,
      projectGrowth,
      submissionTrends,
      planDistribution,
      topCategories
    })

  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
