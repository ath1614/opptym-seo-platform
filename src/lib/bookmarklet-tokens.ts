import crypto from 'crypto'

export interface BookmarkletToken {
  userId: string
  projectId: string
  linkId: string
  token: string
  expiresAt: Date
  usageCount: number
  maxUsage: number
  createdAt: Date
}

// Global stores to ensure they're shared across all API routes
declare global {
  var __bookmarkletTokens: Map<string, BookmarkletToken> | undefined
  var __rateLimitStore: Map<string, { count: number, lastReset: number }> | undefined
}

// In-memory store for bookmarklet tokens (in production, use Redis)
export const bookmarkletTokens = globalThis.__bookmarkletTokens || (globalThis.__bookmarkletTokens = new Map<string, BookmarkletToken>())

// Rate limiting store (in production, use Redis)
export const rateLimitStore = globalThis.__rateLimitStore || (globalThis.__rateLimitStore = new Map<string, { count: number, lastReset: number }>())

// Cleanup expired tokens every 5 minutes
setInterval(() => {
  const now = new Date()
  for (const [token, tokenData] of bookmarkletTokens.entries()) {
    if (now > tokenData.expiresAt) {
      bookmarkletTokens.delete(token)
    }
  }
  
  // Cleanup old rate limit entries
  for (const [key, rateLimit] of rateLimitStore.entries()) {
    if (now.getTime() - rateLimit.lastReset > 300000) { // 5 minutes
      rateLimitStore.delete(key)
    }
  }
}, 300000) // 5 minutes

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function createToken(
  userId: string,
  projectId: string,
  linkId: string,
  maxUsage: number
): BookmarkletToken {
  const token = generateToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

  const tokenData: BookmarkletToken = {
    userId,
    projectId,
    linkId,
    token,
    expiresAt,
    usageCount: 0,
    maxUsage,
    createdAt: now
  }

  bookmarkletTokens.set(token, tokenData)
  console.log('Token stored in global store:', { 
    token: token.substring(0, 10) + '...', 
    storeSize: bookmarkletTokens.size,
    isGlobal: globalThis.__bookmarkletTokens === bookmarkletTokens
  })
  return tokenData
}

export function validateToken(token: string): BookmarkletToken | null {
  console.log('Validating token from global store:', { 
    token: token.substring(0, 10) + '...', 
    storeSize: bookmarkletTokens.size,
    isGlobal: globalThis.__bookmarkletTokens === bookmarkletTokens,
    availableTokens: Array.from(bookmarkletTokens.keys()).map(t => t.substring(0, 10) + '...')
  })
  
  const tokenData = bookmarkletTokens.get(token)
  if (!tokenData) {
    console.log('Token not found in global store')
    return null
  }

  // Check if token has expired
  if (new Date() > tokenData.expiresAt) {
    console.log('Token expired, removing from store')
    bookmarkletTokens.delete(token)
    return null
  }

  console.log('Token found and valid:', { usageCount: tokenData.usageCount, maxUsage: tokenData.maxUsage })
  return tokenData
}

export function incrementTokenUsage(token: string): boolean {
  const tokenData = bookmarkletTokens.get(token)
  if (!tokenData) {
    return false
  }

  tokenData.usageCount++
  
  // If usage limit exceeded, remove the token
  if (tokenData.usageCount > tokenData.maxUsage) {
    bookmarkletTokens.delete(token)
  }

  return true
}
