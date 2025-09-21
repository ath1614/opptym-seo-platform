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
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // Use the same collection approach as SEO tasks
    const mongoose = await import('mongoose')
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    const directoriesCollection = db.collection('directories')

    // Get all directories
    const directories = await directoriesCollection
      .find({})
      .sort({ classification: 1, name: 1 })
      .toArray()

    // Create CSV content
    const headers = ['name', 'url', 'domain', 'classification', 'category', 'status', 'daScore', 'pageRank', 'priority', 'description', 'createdAt']
    const csvContent = [
      headers.join(','),
      ...directories.map(dir => [
        `"${dir.name || ''}"`,
        `"${dir.url || ''}"`,
        `"${dir.domain || ''}"`,
        `"${dir.classification || ''}"`,
        `"${dir.category || ''}"`,
        `"${dir.status || 'active'}"`,
        `"${dir.daScore || 0}"`,
        `"${dir.pageRank || 0}"`,
        `"${dir.priority || 0}"`,
        `"${dir.description || ''}"`,
        `"${dir.createdAt ? new Date(dir.createdAt).toISOString() : ''}"`
      ].join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="directories.csv"'
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export directories' },
      { status: 500 }
    )
  }
}
