import nodemailer from 'nodemailer'
import { emailTemplates } from './email-templates'

let smtpWarningShown = false

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    if (!smtpWarningShown && process.env.NODE_ENV !== 'production') {
      console.warn('SMTP configuration missing. Emails will not be sent.')
      smtpWarningShown = true
    }
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

export async function sendContactEmail(details: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
  planInterest?: string;
}) {
  const adminEmail = process.env.CONTACT_RECIPIENT || process.env.SMTP_FROM;
  if (!adminEmail) {
    console.error('CONTACT_RECIPIENT or SMTP_FROM not set');
    return { success: false, error: 'Email service not configured' };
  }

  function escapeHtml(input: string) {
    return (input || '').replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return ch;
      }
    });
  }

  const safe = {
    name: escapeHtml(details.fromName),
    email: escapeHtml(details.fromEmail),
    subject: escapeHtml(details.subject),
    message: escapeHtml(details.message),
    phone: escapeHtml(details.phone || ''),
    company: escapeHtml(details.company || ''),
    planInterest: escapeHtml(details.planInterest || ''),
  };

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${safe.name}</p>
      <p><strong>Email:</strong> ${safe.email}</p>
      ${safe.company ? `<p><strong>Company:</strong> ${safe.company}</p>` : ''}
      ${safe.phone ? `<p><strong>Phone:</strong> ${safe.phone}</p>` : ''}
      ${safe.planInterest ? `<p><strong>Plan Interest:</strong> ${safe.planInterest}</p>` : ''}
      <hr />
      <p><strong>Subject:</strong> ${safe.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="white-space: pre-wrap;">${safe.message}</div>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: adminEmail,
    replyTo: safe.email,
    subject: `New Contact: ${safe.subject}`,
    html,
  };

  try {
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP verify failed:', verifyError);
      return { success: false, error: 'Email service not configured' };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error: 'Failed to send contact email' };
  }
}
