/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    // Use the same approach as SEO tasks - direct MongoDB collection access
    const mongoose = await import('mongoose')
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')

    // Build query - same as SEO tasks
    const query: Record<string, any> = { status: 'active' }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { classification: { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      query.classification = category
    }

    const skip = (page - 1) * limit

    // Fetch directories from the same collection as SEO tasks
    const [directories, total, categories] = await Promise.all([
      directoriesCollection
        .find(query)
        .sort({ daScore: -1, pageRank: -1, priority: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      directoriesCollection.countDocuments(query),
      directoriesCollection.distinct('classification')
    ])

    return NextResponse.json({
      directories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories: categories.filter(cat => cat && cat.trim() !== '')
    })

  } catch (error) {
    console.error('Admin directories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch directories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const directoryData = await request.json()

    await connectDB()

    // Use direct MongoDB collection access
    const mongoose = await import('mongoose')
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')

    // Create new directory
    const newDirectory = {
      ...directoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await directoriesCollection.insertOne(newDirectory)

    console.log('Created new directory:', result.insertedId)

    return NextResponse.json({ 
      success: true, 
      message: 'Directory created successfully',
      directory: { ...newDirectory, _id: result.insertedId }
    })

  } catch (error) {
    console.error('Error creating directory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
