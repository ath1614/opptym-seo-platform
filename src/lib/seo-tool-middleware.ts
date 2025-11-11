import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import SeoToolConfig from '@/models/SeoToolConfig'

export async function checkSeoToolAccess(toolId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized', status: 401 }
  }

  await connectDB()

  // Check if tool exists and is enabled
  const toolConfig = await SeoToolConfig.findOne({ toolId })
  if (!toolConfig) {
    return { success: false, error: 'SEO tool not found', status: 404 }
  }

  if (!toolConfig.isEnabled) {
    return { success: false, error: 'This SEO tool is currently disabled', status: 403 }
  }

  // Check premium access
  if (toolConfig.isPremium) {
    const { default: User } = await import('@/models/User')
    const user = await User.findById(session.user.id)
    if (!user || user.plan === 'free') {
      return { success: false, error: 'Premium plan required for this tool', status: 403 }
    }
  }

  return { success: true, toolConfig }
}