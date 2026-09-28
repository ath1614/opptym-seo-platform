import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role?: string
      plan?: string
      companyName?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role?: string
    plan?: string
    companyName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
    plan?: string
    companyName?: string
  }
}
