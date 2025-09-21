// NextAuth type extensions

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      plan?: string
      companyName?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    plan?: string
    companyName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    plan?: string
    companyName?: string
  }
}
