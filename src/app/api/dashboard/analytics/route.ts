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
    const avgRanking = totalProjects > 0 ? Math.floor(Math.random() * 50) + 1 : 0 // Mock ranking data
    
    // Calculate trends (mock for now - in real app, compare with previous month)
    const trends = {
      projects: totalProjects > 0 ? Math.floor(Math.random() * 20) + 1 : 0,
      submissions: totalSubmissions > 0 ? Math.floor(Math.random() * 30) + 5 : 0,
      backlinks: totalBacklinks > 0 ? Math.floor(Math.random() * 15) + 2 : 0,
      successRate: successRate > 0 ? Math.floor(Math.random() * 10) + 1 : 0,
      ranking: avgRanking > 0 ? -(Math.floor(Math.random() * 10) + 1) : 0 // Negative for ranking improvement
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
