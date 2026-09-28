import crypto from 'crypto'
import connectDB from './mongodb'
import BookmarkletTokenModel from '@/models/BookmarkletToken'

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

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createToken(
  userId: string,
  projectId: string,
  linkId: string,
  maxUsage: number
): Promise<BookmarkletToken> {
  await connectDB()
  const token = generateToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

  const doc = await BookmarkletTokenModel.create({
    userId,
    projectId,
    linkId,
    token,
    expiresAt,
    usageCount: 0,
    maxUsage
  })

  return {
    userId: doc.userId.toString(),
    projectId: doc.projectId.toString(),
    linkId: doc.linkId.toString(),
    token: doc.token,
    expiresAt: doc.expiresAt,
    usageCount: doc.usageCount,
    maxUsage: doc.maxUsage,
    createdAt: (doc as any).createdAt || now
  }
}

export async function validateToken(token: string): Promise<BookmarkletToken | null> {
  await connectDB()
  
  const tokenData = await BookmarkletTokenModel.findOne({ token })
  if (!tokenData) {
    console.log('Token not found in db store')
    return null
  }

  // Check if token has expired
  if (new Date() > tokenData.expiresAt) {
    console.log('Token expired, removing from db')
    await BookmarkletTokenModel.deleteOne({ _id: tokenData._id })
    return null
  }
  
  // Check max usage
  if (tokenData.usageCount >= tokenData.maxUsage) {
     console.log('Token usage limit reached')
     await BookmarkletTokenModel.deleteOne({ _id: tokenData._id })
     return null
  }

  return {
    userId: tokenData.userId.toString(),
    projectId: tokenData.projectId.toString(),
    linkId: tokenData.linkId.toString(),
    token: tokenData.token,
    expiresAt: tokenData.expiresAt,
    usageCount: tokenData.usageCount,
    maxUsage: tokenData.maxUsage,
    createdAt: (tokenData as any).createdAt || new Date()
  }
}

export async function incrementTokenUsage(token: string): Promise<boolean> {
  await connectDB()
  const tokenData = await BookmarkletTokenModel.findOneAndUpdate(
    { token },
    { $inc: { usageCount: 1 } },
    { new: true }
  )
  
  if (!tokenData) return false

  if (tokenData.usageCount >= tokenData.maxUsage) {
    await BookmarkletTokenModel.deleteOne({ _id: tokenData._id })
  }
  return true
}
