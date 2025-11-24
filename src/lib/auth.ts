/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Import User model dynamically to avoid issues
          const { default: User } = await import('@/models/User')
          const { default: connectDB } = await import('./mongodb')
          
          await connectDB()
          const user = await User.findOne({ email: credentials.email })
          
          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          if (!user.verified) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            role: user.role,
            plan: user.plan,
            companyName: user.companyName
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.plan = user.plan
        token.companyName = user.companyName
        // Strip any picture/image field to avoid oversized JWT cookies
        delete token.picture
        delete token.image
      }
      // Also ensure repeated calls keep token lean
      delete token.picture
      delete token.image
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.plan = token.plan as string
        session.user.companyName = token.companyName as string
        // Avoid carrying image in session via JWT; components fetch profile separately
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If user is signing in, redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // If it's the same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
