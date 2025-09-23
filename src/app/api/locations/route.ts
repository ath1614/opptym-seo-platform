import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Location from '@/models/Location'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    const query = activeOnly ? { isActive: true } : {}
    const locations = await Location.find(query).sort({ priority: 1, name: 1 })
    
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    if (!name || !code || !flag) {
      return NextResponse.json(
        { error: 'Name, code, and flag are required' },
        { status: 400 }
      )
    }

    const location = new Location({
      name,
      code: code.toUpperCase(),
      flag,
      description,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0
    })

    await location.save()

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)
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
