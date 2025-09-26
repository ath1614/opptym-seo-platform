import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
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
    
    // Get user's projects
    const projects = await Project.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v')

    // Get user's usage stats
    const user = await User.findById(userId)
    const usage = user?.usage || {
      projects: 0,
      submissions: 0,
      seoTools: 0,
      backlinks: 0,
      reports: 0
    }

    // Get actual submission count from Submission collection
    const actualSubmissions = await Submission.countDocuments({
      userId: userId,
      status: 'success'
    })

    // Calculate real analytics
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'active').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    
    // Calculate success rate based on completed vs total projects
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
    
    // Use actual submission count instead of cached usage data
    const totalSubmissions = actualSubmissions
    const totalBacklinks = usage.backlinks || 0
    // Calculate average ranking based on project performance
    const avgRanking = totalProjects > 0 ? Math.max(1, Math.min(100, Math.floor(100 - (successRate * 0.8)))) : 0
    
    // Calculate trends based on actual data (no random numbers)
    const trends = {
      projects: totalProjects, // Show current count as trend
      submissions: totalSubmissions, // Show current count as trend
      backlinks: totalBacklinks, // Show current count as trend
      successRate: successRate, // Show current success rate as trend
      ranking: avgRanking // Show current ranking as trend
    }

    const analytics = {
      projects: totalProjects,
      submissions: totalSubmissions,
      backlinks: totalBacklinks,
      successRate: successRate,
      ranking: avgRanking,
      trends: trends,
      activeProjects: activeProjects,
      completedProjects: completedProjects
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
