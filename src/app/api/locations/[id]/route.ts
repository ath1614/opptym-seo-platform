import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Location from '@/models/Location'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const location = await Location.findById(params.id)
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(location)
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const User = (await import('@/models/User')).default
    await connectDB()
    const user = await User.findById(session.user.id)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, code, flag, description, isActive, priority } = body

    const location = await Location.findById(params.id)
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // Update location
    if (name) location.name = name
    if (code) location.code = code.toUpperCase()
    if (flag) location.flag = flag
    if (description !== undefined) location.description = description
    if (isActive !== undefined) location.isActive = isActive
    if (priority !== undefined) location.priority = priority

    await location.save()

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error updating location:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Location with this name or code already exists' },
        { status: 400 }
      )
    }
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
    const User = (await import('@/models/User')).default
    await connectDB()
    const user = await User.findById(session.user.id)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const location = await Location.findById(params.id)
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    await Location.findByIdAndDelete(params.id)

    return NextResponse.json({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
