import nodemailer from 'nodemailer'
import { emailTemplates } from './email-templates'

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('SMTP configuration missing. Emails will not be sent. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  })
}

const transporter = createTransport()

export async function sendVerificationEmail(email: string, token: string, username: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email - Opptym SEO Platform',
    html: emailTemplates.verification(verificationUrl, username),
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: 'Failed to send verification email' }
  }
}

export async function sendPasswordResetEmail(email: string, token: string, username: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your Password - Opptym SEO Platform',
    html: emailTemplates.passwordReset(resetUrl, username),
  }

  try {
    // Verify transporter before sending to catch misconfiguration early
    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error('SMTP verify failed:', verifyError)
      return { success: false, error: 'Email service not configured' }
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: 'Failed to send password reset email' }
  }
}

export async function sendWelcomeEmail(email: string, username: string, plan: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to Opptym SEO Platform!',
    html: emailTemplates.welcome(username, plan),
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: 'Failed to send welcome email' }
  }
}
