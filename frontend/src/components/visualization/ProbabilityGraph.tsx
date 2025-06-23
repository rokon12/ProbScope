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
  width?: number
  height?: number
  animated?: boolean
  isLoading?: boolean
}

export const ProbabilityGraph: FC<ProbabilityGraphProps> = React.memo(({
  currentToken,
  width = 600,
  height = 400,
  animated = true,
  isLoading = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  // Prepare data: top 10 tokens including the selected one
  const data: TokenProbability[] = currentToken ? [
    { text: currentToken.text, probability: currentToken.probability, isSelected: true },
    ...currentToken.alternatives.slice(0, 9).map(alt => ({ 
      text: alt.text, 
      probability: alt.probability, 
      isSelected: false 
    }))
  ].sort((a, b) => b.probability - a.probability).slice(0, 10) : []

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const margin = { top: 20, right: 20, bottom: 30, left: 100 }
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
      .domain([0, d3.max(data, d => d.probability) || 1])
      .range([0, innerWidth])

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.text))
      .range([0, innerHeight])
      .padding(0.1)

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('color', 'white')

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .style('color', 'white')

    // Add bars
    const bars = svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'probability-bar-animation')
      .attr('y', d => yScale(d.text) || 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.isSelected ? '#2196F3' : '#4CAF50')
      .attr('opacity', d => d.isSelected ? 1 : 0.7)
      .attr('stroke', d => d.isSelected ? '#fff' : 'none')
      .attr('stroke-width', d => d.isSelected ? 2 : 0)

    if (animated) {
      bars
        .attr('width', 0)
        .transition()
        .duration(600)
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
      .attr('fill', 'white')
      .text(d => d.probability.toFixed(3))
      .style('opacity', 0)
      .transition()
      .duration(600)
      .style('opacity', 1)

  }, [data, width, height, animated])

  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%',
        height: 'auto',
        minHeight: height + 50,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom align="center">
        Token Probability Distribution
      </Typography>
      <Box sx={{
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
        <Typography variant="body2" color="text.secondary">
          No probability data available
        </Typography>
      ) : (
        <svg ref={svgRef} style={{ maxWidth: '100%' }} />
      )}
      </Box>
    </Paper>
  )
})
