export const emailTemplates = {
  verification: (verificationUrl: string, userName: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Opptym SEO Platform</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 120px;
                height: auto;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 30px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color: #3b82f6;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #2563eb;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .link {
                color: #3b82f6;
                text-decoration: none;
            }
            .link:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="http://localhost:3000/logo.png" alt="Opptym SEO Platform" class="logo">
                <h1 class="title">Welcome to Opptym SEO Platform!</h1>
                <p class="subtitle">Please verify your email address to get started</p>
            </div>
            
            <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Thank you for signing up for Opptym SEO Platform! We're excited to help you boost your website's search engine rankings.</p>
                
                <p>To complete your registration and start using our powerful SEO tools, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p><a href="${verificationUrl}" class="link">${verificationUrl}</a></p>
                
                <p><strong>What's next?</strong></p>
                <ul>
                    <li>Create your first SEO project</li>
                    <li>Run comprehensive SEO analysis</li>
                    <li>Submit to 2,800+ directories</li>
                    <li>Track your rankings and progress</li>
                </ul>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Opptym SEO Platform. If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 Opptym SEO Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  passwordReset: (resetUrl: string, userName: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Opptym SEO Platform</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 120px;
                height: auto;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 30px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color: #dc2626;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #b91c1c;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .link {
                color: #3b82f6;
                text-decoration: none;
            }
            .link:hover {
                text-decoration: underline;
            }
            .warning {
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
                color: #991b1b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="http://localhost:3000/logo.png" alt="Opptym SEO Platform" class="logo">
                <h1 class="title">Password Reset Request</h1>
                <p class="subtitle">Reset your Opptym SEO Platform password</p>
            </div>
            
            <div class="content">
                <p>Hi ${userName},</p>
                
                <p>We received a request to reset your password for your Opptym SEO Platform account.</p>
                
                <p>To reset your password, click the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
                
                <div class="warning">
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This link will expire in 1 hour for security reasons</li>
                        <li>If you didn't request this password reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you create a new one</li>
                    </ul>
                </div>
                
                <p>If you continue to have problems accessing your account, please contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Opptym SEO Platform. If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 Opptym SEO Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  welcome: (userName: string, plan: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Opptym SEO Platform</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 120px;
                height: auto;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 30px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color: #10b981;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #059669;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .link {
                color: #3b82f6;
                text-decoration: none;
            }
            .link:hover {
                text-decoration: underline;
            }
            .feature-list {
                background-color: #f8fafc;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="http://localhost:3000/logo.png" alt="Opptym SEO Platform" class="logo">
                <h1 class="title">Welcome to Opptym SEO Platform!</h1>
                <p class="subtitle">Your account is now verified and ready to use</p>
            </div>
            
            <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Congratulations! Your email has been verified and your Opptym SEO Platform account is now active.</p>
                
                <p>You're currently on the <strong>${plan}</strong> plan. Here's what you can do:</p>
                
                <div class="feature-list">
                    <h3>🚀 Get Started:</h3>
                    <ul>
                        <li>Create your first SEO project</li>
                        <li>Run comprehensive SEO analysis with 14+ tools</li>
                        <li>Submit to 2,800+ directories and platforms</li>
                        <li>Track your keyword rankings</li>
                        <li>Generate detailed SEO reports</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
                </div>
                
                <p><strong>Need help getting started?</strong></p>
                <ul>
                    <li>Check out our <a href="http://localhost:3000/#knowledge-base" class="link">Knowledge Base</a></li>
                    <li>Watch our tutorial videos</li>
                    <li>Contact our support team</li>
                </ul>
                
                <p>We're here to help you succeed with your SEO goals!</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Opptym SEO Platform. If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 Opptym SEO Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `
}
