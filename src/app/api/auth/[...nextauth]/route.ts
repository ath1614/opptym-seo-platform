import NextAuth from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export async function GET(request: Request) {
  try {
    console.log('NextAuth GET request received')
    return await handler(request)
  } catch (error) {
    console.error('NextAuth GET error:', error)
    return new Response('Authentication error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('NextAuth POST request received')
    return await handler(request)
  } catch (error) {
    console.error('NextAuth POST error:', error)
    return new Response('Authentication error', { status: 500 })
  }
}
