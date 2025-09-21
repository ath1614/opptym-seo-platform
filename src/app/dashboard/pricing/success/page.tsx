"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

function PricingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id')
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (canceled) {
      showToast({
        title: 'Payment Canceled',
        description: 'Your payment was canceled. You can try again anytime.',
        variant: 'default'
      })
      router.push('/dashboard/pricing')
      return
    }

    if (success && sessionIdParam) {
      setSessionId(sessionIdParam)
      setIsLoading(false)
      
      showToast({
        title: 'Payment Successful!',
        description: 'Your subscription has been activated. Welcome to your new plan!',
        variant: 'success'
      })
    } else {
      router.push('/dashboard/pricing')
    }
  }, [searchParams, router, showToast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated successfully. You now have access to all the features of your new plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Session ID: {sessionId}
            </p>
            <p className="text-sm text-muted-foreground">
              You can now access all the premium features in your dashboard.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/dashboard/pricing')}
            >
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PricingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PricingSuccessContent />
    </Suspense>
  )
}
