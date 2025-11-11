import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import SeoToolConfig from '@/models/SeoToolConfig'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const tools = await SeoToolConfig.find({ isEnabled: true }).sort({ order: 1 })
    
    return NextResponse.json({ tools })
  } catch (error) {
    console.error('Error fetching SEO tools config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}