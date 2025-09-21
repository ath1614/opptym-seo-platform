/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    await connectDB()

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  try {
    await User.findByIdAndUpdate(userId, {
      plan: planId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
    })

    console.log(`User ${userId} upgraded to ${planId} plan`)
  } catch (error) {
    console.error('Error updating user plan:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const planId = subscription.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in subscription:', subscription.id)
    return
  }

  try {
    await User.findByIdAndUpdate(userId, {
      plan: planId,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    })

    console.log(`Subscription created for user ${userId}: ${planId}`)
  } catch (error) {
    console.error('Error creating subscription:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const planId = subscription.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in subscription update:', subscription.id)
    return
  }

  try {
    const updateData: {
      subscriptionStatus: string
      plan?: string
    } = {
      subscriptionStatus: subscription.status,
    }

    // If subscription is active, update the plan
    if (subscription.status === 'active') {
      updateData.plan = planId
    }

    // If subscription is canceled or past due, downgrade to free
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      updateData.plan = 'free'
    }

    await User.findByIdAndUpdate(userId, updateData)

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`)
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('Missing userId in subscription deletion:', subscription.id)
    return
  }

  try {
    await User.findByIdAndUpdate(userId, {
      plan: 'free',
      subscriptionStatus: 'canceled',
    })

    console.log(`Subscription deleted for user ${userId}, downgraded to free`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string

  if (!subscriptionId) {
    return
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: 'active',
      })

      console.log(`Payment succeeded for user ${userId}`)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string

  if (!subscriptionId) {
    return
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: 'past_due',
      })

      console.log(`Payment failed for user ${userId}`)
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
