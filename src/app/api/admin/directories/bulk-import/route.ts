import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'

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
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    if (!file || !category) {
      return NextResponse.json(
        { error: 'File and category are required' },
        { status: 400 }
      )
    }

    // Read and parse CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header and one data row' },
        { status: 400 }
      )
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const dataLines = lines.slice(1)

    let imported = 0
    let errors = 0

    for (const line of dataLines) {
      try {
        const values = line.split(',').map(v => v.trim())
        
        if (values.length < 2) continue

        const directoryData = {
          name: values[0] || `Directory ${imported + 1}`,
          url: values[1],
          domain: values[2] || '',
          classification: category,
          category: values[3] || '',
          status: values[4] || 'active',
          daScore: values[5] ? parseInt(values[5]) : 0,
          pageRank: values[6] ? parseInt(values[6]) : 0,
          priority: values[7] ? parseInt(values[7]) : 0,
          description: values[8] || '',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Check if directory already exists using the same collection approach
        const mongoose = await import('mongoose')
        const db = mongoose.connection.db
        if (!db) {
          throw new Error('Database connection not available')
        }
        const directoriesCollection = db.collection('directories')
        
        const existing = await directoriesCollection.findOne({ url: directoryData.url })
        if (!existing) {
          await directoriesCollection.insertOne(directoryData)
          imported++
        }
      } catch (error) {
        console.error('Error importing directory:', error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
      message: `Successfully imported ${imported} directories with ${errors} errors`
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Failed to import directories' },
      { status: 500 }
    )
  }
}
