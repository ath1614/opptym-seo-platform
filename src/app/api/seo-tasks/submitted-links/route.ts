import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const submissions = await Submission.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
      category: 'seo-task'
    }).select('linkId')

    const submittedLinkIds = submissions.map(s => s.linkId.toString())

    return NextResponse.json({ submittedLinkIds })
  } catch (error) {
    console.error('Get submitted links error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}