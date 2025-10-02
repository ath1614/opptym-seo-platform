import * as NextAuthModule from 'next-auth'
import { authOptions } from '@/lib/auth'

// Callable type without referencing unavailable exported types
type NextAuthCallable = (options: unknown) => (req: Request) => Promise<Response>

const NextAuth = (
  (NextAuthModule as unknown as { default?: NextAuthCallable }).default ??
  (NextAuthModule as unknown as NextAuthCallable)
)

const handler: (req: Request) => Promise<Response> = NextAuth(authOptions)

export { handler as GET, handler as POST }
