"use client"

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { CompetitorAnalyzer } from '@/components/seo-tools/competitor-analyzer'

export default function CompetitorAnalyzerPage() {
  return (
    <DashboardLayout>
      <CompetitorAnalyzer />
    </DashboardLayout>
  )
}