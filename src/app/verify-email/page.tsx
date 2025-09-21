"use client"

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }, [router])

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [searchParams, verifyEmail])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200'
      case 'success':
        return 'border-green-200'
      case 'error':
        return 'border-red-200'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifying your email address...
          </p>
        </div>

        <Card className={`${getStatusColor()}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-xl">
              {status === 'loading' && 'Verifying...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          
          {status === 'success' && (
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You will be redirected to the login page in a few seconds.
              </p>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </CardContent>
          )}

          {status === 'error' && (
            <CardContent className="text-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/auth/register')}
                className="mr-2"
              >
                Register Again
              </Button>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
