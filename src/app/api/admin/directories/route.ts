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
    const country = searchParams.get('country') || ''

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

    if (country) {
      query.country = country
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
    console.log('Received directory data:', directoryData)

    // Validate required fields
    if (!directoryData.name || !directoryData.url || !directoryData.domain || !directoryData.classification || !directoryData.category || !directoryData.country) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, domain, classification, category, and country are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Use direct MongoDB collection access
    const mongoose = await import('mongoose')
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')

    // Check if directory already exists
    const existingDirectory = await directoriesCollection.findOne({
      $or: [
        { name: directoryData.name },
        { url: directoryData.url },
        { domain: directoryData.domain }
      ]
    })

    if (existingDirectory) {
      return NextResponse.json(
        { error: 'Directory with this name, URL, or domain already exists' },
        { status: 409 }
      )
    }

    // Create new directory with proper validation
    const newDirectory = {
      name: directoryData.name.trim(),
      url: directoryData.url.trim(),
      domain: directoryData.domain.trim().toLowerCase(),
      classification: directoryData.classification.trim(),
      category: directoryData.category.trim(),
      country: directoryData.country.trim(),
      status: directoryData.status || 'active',
      daScore: parseInt(directoryData.daScore) || 0,
      pageRank: parseFloat(directoryData.pageRank) || 0,
      priority: parseInt(directoryData.priority) || 0,
      description: directoryData.description?.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('Creating directory with data:', newDirectory)

    const result = await directoriesCollection.insertOne(newDirectory)

    if (!result.insertedId) {
      throw new Error('Failed to insert directory')
    }

    console.log('Successfully created directory:', result.insertedId)

    return NextResponse.json({ 
      success: true, 
      message: 'Directory created successfully',
      directory: { ...newDirectory, _id: result.insertedId }
    })

  } catch (error) {
    console.error('Error creating directory:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
