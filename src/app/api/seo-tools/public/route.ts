import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SeoToolConfig from '@/models/SeoToolConfig'

export async function GET() {
  try {
    await connectDB()
    
    const tools = await SeoToolConfig.find({ isEnabled: true }).sort({ order: 1 })
    
    return NextResponse.json({ tools })
  } catch (error) {
    console.error('Error fetching public SEO tools config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}