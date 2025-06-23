import React, { FC, useEffect, useRef } from 'react'
import { Box, CircularProgress, Typography, Paper } from '@mui/material'
import * as d3 from 'd3'
import { TokenInfo } from '../../types/types'

interface TokenProbability {
  text: string
  probability: number
  isSelected?: boolean
}

interface ProbabilityGraphProps {
  currentToken: TokenInfo | null
  selectedToken?: TokenInfo | null
  width?: number
  height?: number
  animated?: boolean
  isLoading?: boolean
}

export const ProbabilityGraph: FC<ProbabilityGraphProps> = React.memo(({
  currentToken,
  selectedToken,
  width = 500,
  height = 350,
  animated = true,
  isLoading = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  // Prepare data: Use selectedToken if available, otherwise fallback to currentToken
  const tokenToShow = selectedToken || currentToken
  const data: TokenProbability[] = tokenToShow ? [
    { text: tokenToShow.text, probability: tokenToShow.probability, isSelected: true },
    ...tokenToShow.alternatives.slice(0, 9).map(alt => ({ 
      text: alt.text, 
      probability: alt.probability, 
      isSelected: false 
    }))
  ].sort((a, b) => b.probability - a.probability).slice(0, 10) : []


  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const margin = { top: 20, right: 30, bottom: 40, left: 120 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 1]) // Always show 0-100% scale
      .range([0, innerWidth])

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.text))
      .range([0, innerHeight])
      .padding(0.2)

    // Add X axis with percentage formatting
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => `${((d as number) * 100).toFixed(0)}%`)
        .ticks(5))
      .style('color', '#888')
      .style('font-size', '12px')

    // Add Y axis with styled text
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .style('color', '#888')
      .style('font-size', '14px')
      .selectAll('text')
      .style('font-family', 'monospace')

    // Add background for bars
    svg.selectAll('.bar-bg')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-bg')
      .attr('x', 0)
      .attr('y', d => yScale(d.text) || 0)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.3)

    // Add bars
    const bars = svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'probability-bar-animation')
      .attr('y', d => yScale(d.text) || 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.isSelected ? '#2196F3' : '#4CAF50')
      .attr('opacity', d => d.isSelected ? 1 : 0.8)
      .attr('stroke', d => d.isSelected ? '#fff' : 'none')
      .attr('stroke-width', d => d.isSelected ? 2 : 0)
      .attr('rx', 4)
      .attr('ry', 4)

    if (animated) {
      bars
        .attr('width', 0)
        .transition()
        .duration(150)
        .ease(d3.easeQuadOut)
        .attr('width', d => xScale(d.probability))
    } else {
      bars.attr('width', d => xScale(d.probability))
    }

    // Add probability values
    svg.selectAll('.probability-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'probability-label')
      .attr('x', d => xScale(d.probability) + 5)
      .attr('y', d => (yScale(d.text) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', d => d.isSelected ? '#fff' : '#ccc')
      .attr('font-weight', d => d.isSelected ? 'bold' : 'normal')
      .attr('font-size', '12px')
      .text(d => d.probability >= 0.001 
        ? `${(d.probability * 100).toFixed(1)}%`
        : `${(d.probability * 100).toFixed(3)}%`
      )
      .style('opacity', 0)
      .transition()
      .duration(150)
      .delay(50)
      .style('opacity', 1)
      
    // Add selected indicator
    svg.selectAll('.selected-indicator')
      .data(data.filter(d => d.isSelected))
      .enter()
      .append('text')
      .attr('x', 5)
      .attr('y', d => (yScale(d.text) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', '#2196F3')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('▶')

  }, [data, width, height, animated])

  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%',
        height: 'auto',
        minHeight: height + 80,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2, color: 'text.primary' }}>
        Token Probability Distribution
      </Typography>
      
      {tokenToShow && (
        <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
          {selectedToken ? 'Selected token' : 'Current token'}: <strong>"{tokenToShow.text}"</strong>
          {selectedToken && (
            <Typography variant="caption" display="block" sx={{ color: 'primary.main', mt: 0.5 }}>
              Click any token to change analysis
            </Typography>
          )}
        </Typography>
      )}
      
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Calculating probabilities...
            </Typography>
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No probability data available
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click play to see token alternatives
            </Typography>
          </Box>
        ) : (
          <svg ref={svgRef} style={{ maxWidth: '100%', height: height }} />
        )}
      </Box>
    </Paper>
  )
})
