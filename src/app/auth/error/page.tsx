"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Logo } from '@/components/logo'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Error',
          description: 'There is a problem with the server configuration. Please try again later.',
          action: 'Contact Support'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in.',
          action: 'Contact Support'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or has already been used.',
          action: 'Try Again'
        }
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          description: 'An error occurred during authentication. Please check your credentials and try again.',
          action: 'Try Again'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo width={60} height={60} showText={false} />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              {errorInfo.title}
            </CardTitle>
            <CardDescription>
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error && (
                  <div className="text-sm">
                    <strong>Error Code:</strong> {error}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/register">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Create New Account
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Still having trouble?{' '}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
