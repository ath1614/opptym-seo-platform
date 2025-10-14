"use client"

import React, { useMemo, useState, useRef } from 'react'

type Point = { x: string; y: number }
type Series = { name: string; color: string; points: Point[] }

interface LineChartProps {
  series: Series[]
  height?: number
  showLegend?: boolean
  showTooltips?: boolean
  areaOpacity?: number
}

// Lightweight SVG line chart with X-Y axes, gridlines, legend, and tooltips
export function LineChart({ series, height = 240, showLegend = true, showTooltips = true, areaOpacity = 0.08 }: LineChartProps) {
  const width = 640
  const margin = { top: 16, right: 16, bottom: 28, left: 40 }
  const chartW = width - margin.left - margin.right
  const chartH = height - margin.top - margin.bottom
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const xLabels = useMemo(() => {
    const set = new Set<string>()
    series.forEach(s => s.points.forEach(p => set.add(p.x)))
    return Array.from(set)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  }, [series])

  const maxY = useMemo(() => {
    return Math.max(1, ...series.flatMap(s => s.points.map(p => p.y)))
  }, [series])

  if (!series.length || !xLabels.length) {
    return (
      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <div className="h-40 flex items-center justify-center border border-dashed rounded bg-muted/20">
          No data available
        </div>
        <div>We’ll show charts when enough activity is recorded.</div>
      </div>
    )
  }

  const xScale = (label: string) => {
    const idx = xLabels.indexOf(label)
    const step = xLabels.length > 1 ? chartW / (xLabels.length - 1) : 0
    return margin.left + idx * step
  }

  const yScale = (value: number) => {
    const ratio = value / maxY
    return margin.top + (1 - ratio) * chartH
  }

  const yTicks = 4
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((i * maxY) / yTicks))

  const makePath = (points: Point[]) => {
    if (!points.length) return ''
    const ordered = points.slice().sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0))
    return ordered
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`)
      .join(' ')
  }

  const makeAreaPath = (points: Point[]) => {
    if (!points.length) return ''
    const ordered = points.slice().sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0))
    const baselineY = height - margin.bottom
    const topPath = ordered
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`)
      .join(' ')
    const closePath = `L ${xScale(ordered[ordered.length - 1].x)} ${baselineY} L ${xScale(ordered[0].x)} ${baselineY} Z`
    return `${topPath} ${closePath}`
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!showTooltips || !svgRef.current || xLabels.length < 2) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const startX = margin.left
    const endX = width - margin.right
    if (x < startX || x > endX) {
      setHoverIdx(null)
      return
    }
    const step = (endX - startX) / (xLabels.length - 1)
    const idx = Math.round((x - startX) / step)
    setHoverIdx(Math.max(0, Math.min(xLabels.length - 1, idx)))
  }

  const handleMouseLeave = () => {
    if (!showTooltips) return
    setHoverIdx(null)
  }

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
      {/* Gridlines */}
      {tickValues.map((tv, i) => (
        <line
          key={`grid-${i}`}
          x1={margin.left}
          x2={width - margin.right}
          y1={yScale(tv)}
          y2={yScale(tv)}
          stroke="currentColor"
          className="text-muted"
          opacity={0.2}
        />
      ))}

      {/* Axes */}
      {/* Y axis */}
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        stroke="currentColor"
        className="text-muted-foreground"
        opacity={0.6}
      />
      {/* X axis */}
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        stroke="currentColor"
        className="text-muted-foreground"
        opacity={0.6}
      />

      {/* Y axis ticks/labels */}
      {tickValues.map((tv, i) => (
        <g key={`ytick-${i}`}>
          <line
            x1={margin.left - 4}
            x2={margin.left}
            y1={yScale(tv)}
            y2={yScale(tv)}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <text
            x={margin.left - 8}
            y={yScale(tv) + 4}
            textAnchor="end"
            fontSize={10}
            className="fill-muted-foreground"
          >
            {tv}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {xLabels.map((xl, i) => (
        <text
          key={`xlabel-${i}`}
          x={xScale(xl)}
          y={height - margin.bottom + 16}
          textAnchor="middle"
          fontSize={10}
          className="fill-muted-foreground"
        >
          {xl.slice(5)}
        </text>
      ))}

      {/* Series area fills */}
      {series.map((s, si) => (
        <path
          key={`area-${si}`}
          d={makeAreaPath(s.points)}
          fill={s.color}
          opacity={areaOpacity}
        />
      ))}

      {/* Series lines and points */}
      {series.map((s, si) => (
        <g key={`series-${si}`}>
          <path
            d={makePath(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
          />
          {s.points.map((p, pi) => (
            <circle
              key={`pt-${si}-${pi}`}
              cx={xScale(p.x)}
              cy={yScale(p.y)}
              r={hoverIdx === pi ? 3.5 : 2.5}
              fill={s.color}
            />
          ))}
        </g>
      ))}

      {/* Hover indicator and tooltip */}
      {showTooltips && hoverIdx !== null && (
        <g>
          <line
            x1={xScale(xLabels[hoverIdx])}
            x2={xScale(xLabels[hoverIdx])}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke="currentColor"
            className="text-muted-foreground"
            opacity={0.3}
          />
          {/* Label at bottom for the hovered month */}
          <text
            x={xScale(xLabels[hoverIdx])}
            y={height - margin.bottom + 12}
            textAnchor="middle"
            fontSize={10}
            className="fill-foreground"
          >
            {xLabels[hoverIdx]}
          </text>
          {/* Tooltip values at top-left of chart area */}
          <rect
            x={margin.left + 4}
            y={margin.top + 4}
            width={140}
            height={12 + series.length * 14}
            fill="currentColor"
            className="text-background"
            opacity={0.85}
            rx={4}
          />
          <text x={margin.left + 10} y={margin.top + 18} fontSize={11} className="fill-foreground">
            {xLabels[hoverIdx]}
          </text>
          {series.map((s, si) => {
            const pt = s.points.find(p => p.x === xLabels[hoverIdx])
            const val = pt ? pt.y : 0
            return (
              <text
                key={`tt-${si}`}
                x={margin.left + 10}
                y={margin.top + 32 + si * 14}
                fontSize={11}
                className="fill-muted-foreground"
              >
                {s.name}: {val}
              </text>
            )
          })}
        </g>
      )}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex gap-4 items-center text-xs">
          {series.map((s, si) => (
            <div key={`legend-${si}`} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}