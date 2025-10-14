"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FolderOpen, 
  Send, 
  TrendingUp, 
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface StatsCardsProps {
  stats: {
    projects: number
    submissions: number
    backlinks: number
    successRate: number
    ranking: number
  }
  trends?: {
    projects: number
    submissions: number
    backlinks: number
    successRate: number
    ranking: number
  }
}

export function StatsCards({ stats, trends }: StatsCardsProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const statCards = [
    {
      title: 'Projects',
      value: stats.projects,
      icon: FolderOpen,
      trend: trends?.projects || 0,
      description: 'Active projects'
    },
    {
      title: 'Submissions',
      value: stats.submissions,
      icon: Send,
      trend: trends?.submissions || 0,
      description: 'This month'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      trend: trends?.successRate || 0,
      description: 'Campaign success'
    },
    {
      title: 'Avg. Ranking',
      value: `#${stats.ranking}`,
      icon: Target,
      trend: trends?.ranking || 0,
      description: 'Average position'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-1 mt-1">
              {getTrendIcon(stat.trend)}
              <span className={`text-xs ${getTrendColor(stat.trend)}`}>
                {Math.abs(stat.trend)}% from last month
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
