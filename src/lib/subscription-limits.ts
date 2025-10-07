export interface SubscriptionLimits {
  projects: number
  submissions: number
  seoTools: number
  backlinks: number
  reports: number
}

export interface PlanLimits {
  free: SubscriptionLimits
  pro: SubscriptionLimits
  business: SubscriptionLimits
  enterprise: SubscriptionLimits
}

export const SUBSCRIPTION_LIMITS: PlanLimits = {
  free: {
    projects: 1,
    submissions: 1,
    seoTools: 5,
    backlinks: 0,
    reports: 1
  },
  pro: {
    projects: 15,
    submissions: 750,
    seoTools: 1000,
    backlinks: 100,
    reports: 50
  },
  business: {
    projects: 50,
    submissions: 1500,
    seoTools: 5000,
    backlinks: 500,
    reports: 200
  },
  enterprise: {
    projects: -1, // Unlimited
    submissions: -1, // Unlimited
    seoTools: -1, // Unlimited
    backlinks: -1, // Unlimited
    reports: -1 // Unlimited
  }
}

export function getPlanLimits(plan: string): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[plan as keyof PlanLimits] || SUBSCRIPTION_LIMITS.free
}

// Function to get custom plan limits from database
export async function getCustomPlanLimits(planName: string): Promise<SubscriptionLimits | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pricing`)
    if (response.ok) {
      const data = await response.json()
      const customPlan = data.plans.find((p: { name: string }) => p.name.toLowerCase() === planName.toLowerCase())
      
      if (customPlan) {
        return {
          projects: customPlan.maxProjects === -1 ? -1 : customPlan.maxProjects,
          submissions: customPlan.maxSubmissions === -1 ? -1 : customPlan.maxSubmissions,
          seoTools: customPlan.maxSeoTools === -1 ? -1 : customPlan.maxSeoTools,
          backlinks: customPlan.maxBacklinks === -1 ? -1 : customPlan.maxBacklinks,
          reports: customPlan.maxReports === -1 ? -1 : customPlan.maxReports
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch custom plan limits:', error)
  }
  return null
}

// Enhanced function that checks for custom limits first
export async function getPlanLimitsWithCustom(plan: string, userRole?: string): Promise<SubscriptionLimits> {
  // Admin users always get unlimited access
  if (userRole === 'admin') {
    return {
      projects: -1,
      submissions: -1,
      seoTools: -1,
      backlinks: -1,
      reports: -1
    }
  }
  
  // First try to get custom limits from database
  const customLimits = await getCustomPlanLimits(plan)
  if (customLimits) {
    return customLimits
  }
  
  // Fallback to hardcoded limits
  return getPlanLimits(plan)
}

export function isLimitExceeded(
  plan: string,
  limitType: keyof SubscriptionLimits,
  currentUsage: number
): boolean {
  const limits = getPlanLimits(plan)
  const limit = limits[limitType]
  
  // -1 means unlimited
  if (limit === -1) return false
  
  return currentUsage >= limit
}

// Enhanced version that accepts custom limits
export function isLimitExceededWithCustom(
  limits: SubscriptionLimits,
  limitType: keyof SubscriptionLimits,
  currentUsage: number
): boolean {
  const limit = limits[limitType]
  
  // -1 means unlimited
  if (limit === -1) return false
  
  // If limit is 5, user can use 0,1,2,3,4,5 tools (6 different values)
  // They exceed the limit only when they try to use more than 5
  return currentUsage > limit
}

export function getRemainingUsage(
  plan: string,
  limitType: keyof SubscriptionLimits,
  currentUsage: number
): number {
  const limits = getPlanLimits(plan)
  const limit = limits[limitType]
  
  // -1 means unlimited
  if (limit === -1) return -1
  
  return Math.max(0, limit - currentUsage)
}

export function getUsagePercentage(
  plan: string,
  limitType: keyof SubscriptionLimits,
  currentUsage: number
): number {
  const limits = getPlanLimits(plan)
  const limit = limits[limitType]
  
  // -1 means unlimited
  if (limit === -1) return 0
  
  return Math.min(100, (currentUsage / limit) * 100)
}

// Daily limits (per-day) used in addition to monthly counters
export interface DailyLimits {
  submissionsPerProjectPerDay: number
  seoToolsPerDay: number
  reportsPerDay: number
}

export const DAILY_LIMITS: Record<keyof PlanLimits, DailyLimits> = {
  free: {
    submissionsPerProjectPerDay: 1,
    seoToolsPerDay: 5,
    reportsPerDay: 1
  },
  pro: {
    submissionsPerProjectPerDay: 5,
    seoToolsPerDay: 4,
    reportsPerDay: 5
  },
  business: {
    submissionsPerProjectPerDay: 10,
    seoToolsPerDay: -1, // No per-day SEO tools cap specified
    reportsPerDay: 10
  },
  enterprise: {
    submissionsPerProjectPerDay: 20,
    seoToolsPerDay: -1, // No per-day SEO tools cap specified
    reportsPerDay: -1 // Unlimited daily reports
  }
}

export function getDailyLimits(plan: string): DailyLimits {
  const key = (plan || 'free') as keyof PlanLimits
  return DAILY_LIMITS[key] || DAILY_LIMITS.free
}

export async function getDailyLimitsWithCustom(plan: string, userRole?: string): Promise<DailyLimits> {
  // Admin users always get unlimited access
  if (userRole === 'admin') {
    return {
      submissionsPerProjectPerDay: -1,
      seoToolsPerDay: -1,
      reportsPerDay: -1
    }
  }
  // Currently, daily limits are not configurable via pricing API; use defaults
  return getDailyLimits(plan)
}
