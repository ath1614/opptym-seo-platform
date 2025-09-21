import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const directoryData = await request.json()
    const directoryId = params.id

    await connectDB()

    // Use direct MongoDB collection access like other directory APIs
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')

    // Update directory
    const result = await directoriesCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(directoryId) },
      { 
        $set: {
          ...directoryData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    console.log('Updated directory:', directoryId)

    return NextResponse.json({ 
      success: true, 
      message: 'Directory updated successfully' 
    })

  } catch (error) {
    console.error('Error updating directory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const directoryId = params.id

    await connectDB()

    // Use direct MongoDB collection access like other directory APIs
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')

    // Delete directory
    const result = await directoriesCollection.deleteOne({
      _id: new mongoose.Types.ObjectId(directoryId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    console.log('Deleted directory:', directoryId)

    return NextResponse.json({ 
      success: true, 
      message: 'Directory deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting directory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
