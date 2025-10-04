import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Project from '@/models/Project'
import SeoToolUsage from '@/models/SeoToolUsage'
import Submission from '@/models/Submission'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    // Delete all user-related data
    await Promise.all([
      // Delete user's projects
      Project.deleteMany({ userId }),
      
      // Delete user's SEO tool usage records
      SeoToolUsage.deleteMany({ userId }),
      
      // Delete user's submissions
      Submission.deleteMany({ userId }),
      
      // Finally, delete the user account
      User.findByIdAndDelete(userId)
    ])

    return NextResponse.json({
      message: 'Account and all associated data deleted successfully'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
