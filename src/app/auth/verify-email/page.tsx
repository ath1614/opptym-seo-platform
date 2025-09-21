"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { CheckCircle, Mail, Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async (verificationToken: string) => {
      setIsVerifying(true)
      
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: verificationToken }),
        })

        const data = await response.json()

        if (response.ok) {
          setIsVerified(true)
          showToast({
            title: 'Email Verified!',
            description: 'Your email has been successfully verified.',
            variant: 'success'
          })
        } else {
          showToast({
            title: 'Verification Failed',
            description: data.error || 'Invalid or expired verification token.',
            variant: 'destructive'
          })
        }
      } catch {
        showToast({
          title: 'Verification Failed',
          description: 'Network error. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setIsVerifying(false)
      }
    }

    if (token) {
      verifyEmail(token)
    }
  }, [token, showToast])

  const resendVerification = async () => {
    if (!email) return
    
    try {
      // This would require a resend verification API endpoint
      showToast({
        title: 'Verification Email Sent',
        description: 'Please check your email for the verification link.',
        variant: 'success'
      })
    } catch {
      showToast({
        title: 'Failed to Resend',
        description: 'Please try again later.',
        variant: 'destructive'
      })
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Logo width={60} height={60} showText={false} />
            </div>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Email Verified!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Sign In to Your Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo width={60} height={60} showText={false} />
          </div>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            {email ? (
              <>
                We&apos;ve sent a verification link to <strong>{email}</strong>. 
                Please check your email and click the link to verify your account.
              </>
            ) : (
              'Please check your email for the verification link.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerifying ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying your email...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or request a new one.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={resendVerification}
                  variant="outline"
                  className="w-full"
                  disabled={!email}
                >
                  Resend Verification Email
                </Button>
                <Button 
                  onClick={() => router.push('/auth/login')}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
