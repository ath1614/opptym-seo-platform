import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendContactEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { subject, message, issueType } = await request.json()

    if (!subject || !message || !issueType) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, message, issueType' },
        { status: 400 }
      )
    }

    // Get user info from session
    const userEmail = session.user.email || 'unknown@user.com'
    const userName = session.user.name || 'Dashboard User'
    const userPlan = (session.user as any).plan || 'unknown'

    const result = await sendContactEmail({
      fromName: userName,
      fromEmail: userEmail,
      subject: `SEO Tasks Help: ${subject}`,
      message: `User: ${userName} (${userEmail})
Plan: ${userPlan}
Issue Type: ${issueType}

Message:
${message}

---
This help request was sent from the SEO Tasks dashboard.`,
      company: 'SEO Tasks Dashboard',
      planInterest: 'support'
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send help request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Help request sent successfully' 
    })
  } catch (error) {
    console.error('SEO Tasks help API error:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}