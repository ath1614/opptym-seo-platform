"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type Stats = {
  projects: number
  submissions: number
  backlinks: number
  successRate: number // percentage 0-100
  ranking: number // 1-100 (lower is better)
}

function formatLabel(key: keyof Stats): string {
  switch (key) {
    case 'projects':
      return 'Projects'
    case 'submissions':
      return 'Submissions'
    case 'backlinks':
      return 'Backlinks'
    case 'successRate':
      return 'Success Rate'
    case 'ranking':
      return 'Avg. Ranking'
    default:
      return String(key)
  }
}

function formatValue(key: keyof Stats, value: number): string {
  if (key === 'successRate') return `${Math.round(value)}%`
  if (key === 'ranking') return `#${Math.round(value)}`
  return String(value)
}

export function StatsGraph({ stats }: { stats: Stats }) {
  const entries = Object.entries(stats) as Array<[keyof Stats, number]>

  // Compute relative widths for a comparison chart
  const maxMetric = Math.max(
    1,
    stats.projects,
    stats.submissions,
    stats.backlinks
  )

  // For ranking, lower is better; invert to visualize positively
  const rankingScore = 100 - Math.min(100, Math.max(1, stats.ranking))
  const successScore = Math.min(100, Math.max(0, stats.successRate))

  const getWidthPct = (key: keyof Stats, value: number) => {
    switch (key) {
      case 'projects':
      case 'submissions':
      case 'backlinks':
        return Math.round((value / maxMetric) * 100)
      case 'successRate':
        return successScore
      case 'ranking':
        return rankingScore
      default:
        return 0
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats Overview</CardTitle>
        <CardDescription>Quick comparison across key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{formatLabel(key)}</span>
                <span className="font-medium text-foreground">{formatValue(key, value)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${getWidthPct(key, value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}