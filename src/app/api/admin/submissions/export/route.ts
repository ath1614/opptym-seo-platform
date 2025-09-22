import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import User from '@/models/User'
import Project from '@/models/Project'

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

    // Get all submissions with user and project data
    const submissions = await Submission.find()
      .populate('userId', 'email name username')
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 })
      .lean()

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Directory',
      'Category',
      'Status',
      'User Email',
      'User Name',
      'Project Name',
      'Submitted At',
      'Completed At',
      'Notes'
    ]

    const csvRows = submissions.map(submission => [
      submission._id,
      submission.directory,
      submission.category,
      submission.status,
      submission.userId?.email || 'Unknown',
      submission.userId?.name || submission.userId?.username || 'Unknown',
      submission.projectId?.projectName || 'Unknown',
      new Date(submission.submittedAt).toISOString(),
      submission.completedAt ? new Date(submission.completedAt).toISOString() : '',
      submission.notes || ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="submissions-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Admin submissions export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
