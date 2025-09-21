import nodemailer from 'nodemailer'
import { emailTemplates } from './email-templates'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

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
