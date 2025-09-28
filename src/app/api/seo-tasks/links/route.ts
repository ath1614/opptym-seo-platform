import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'

interface SessionUser {
  id: string
  role?: string
}

interface ExtendedSession {
  user?: SessionUser
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '2000')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for the directories collection
    const query: Record<string, unknown> = { status: 'active' }
    
    if (category && category !== 'all') {
      // Map our category names to the database classification names
      const categoryMap: Record<string, string> = {
        'directory': 'Directory Submission',
        'article': 'Article Submission',
        'press-release': 'Press Release',
        'bookmarking': 'BookMarking',
        'business-listing': 'Business Listing',
        'classified': 'Classified',
        'other': 'More SEO'
      }
      query.classification = categoryMap[category] || category
    }
    
    if (location && location !== 'all') {
      query.country = location
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }

    // Get the directories collection directly
    const mongoose = await import('mongoose')
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')

    // Fetch links from the directories collection
    const links = await directoriesCollection
      .find(query)
      .sort({ daScore: -1, pageRank: -1, priority: -1 })
      .limit(limit)
      .skip(offset)
      .toArray()

    // Get total count for pagination
    const total = await directoriesCollection.countDocuments(query)

    return NextResponse.json({
      links,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Get links error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    await connectDB()
    
    // Get the directories collection
    const mongoose = await import('mongoose')
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')
    
    // Add metadata
    const linkData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    }
    
    // Insert new link into directories collection
    const result = await directoriesCollection.insertOne(linkData)

    return NextResponse.json(
      { 
        message: 'Link created successfully',
        link: { _id: result.insertedId, ...linkData }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create link error:', error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
