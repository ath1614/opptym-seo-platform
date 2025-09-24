import NextAuth from 'next-auth/next'
import { authOptions } from '@/lib/auth-simple'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
