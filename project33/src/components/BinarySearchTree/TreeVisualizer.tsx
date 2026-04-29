import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as d3 from 'd3'
import { TreeNode, TreeNodeVisual, AnimationStep } from '../../types'
import { getTreeHeight } from '../../utils/helpers'

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`

const Title = styled.h3`
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
`

const SVGContainer = styled.div`
  width: 100%;
  height: 550px;
  overflow: auto;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`

interface TreeVisualizerProps {
  root: TreeNode | null
  currentStep: AnimationStep | null
  width?: number
  height?: number
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  root,
  currentStep,
  width: defaultWidth = 800,
  height: defaultHeight = 500,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const nodeRadius = 28
    const nodePadding = 40
    const levelHeight = 80

    if (!root) {
      const g = svg.append('g')
      g.append('text')
        .attr('x', defaultWidth / 2)
        .attr('y', defaultHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#999')
        .attr('font-size', '16')
        .text('树为空，请插入节点')
      return
    }

    const treeHeight = getTreeHeight(root)

    const maxNodesPerLevel = Math.pow(2, treeHeight - 1)
    const calculatedWidth = Math.max(
      defaultWidth,
      maxNodesPerLevel * (nodeRadius * 2 + nodePadding) + 100
    )
    const calculatedHeight = Math.max(
      defaultHeight,
      treeHeight * levelHeight + 100
    )

    svg
      .attr('width', calculatedWidth)
      .attr('height', calculatedHeight)

    const g = svg.append('g')

    const treeLayout = d3.tree<TreeNode>()
      .size([calculatedWidth - 120, calculatedHeight - 120])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.2))

    const hierarchy = d3.hierarchy(root)
    treeLayout(hierarchy)

    const highlightedNodes = currentStep?.highlightedNodes || []
    const visitedNodes = currentStep?.visitedNodes || []
    const currentNode = currentStep?.currentNode

    g.append('g')
      .selectAll('line')
      .data(hierarchy.links())
      .enter()
      .append('line')
      .attr('x1', d => d.source.x! + 50)
      .attr('y1', d => d.source.y! + 50)
      .attr('x2', d => d.target.x! + 50)
      .attr('y2', d => d.target.y! + 50)
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 2)

    const nodeGroups = g.append('g')
      .selectAll('g')
      .data(hierarchy.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x! + 50}, ${d.y! + 50})`)

    nodeGroups.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', d => {
        const nodeData = d.data as TreeNodeVisual
        const nodeId = nodeData.id || `node-${d.data.value}`
        
        if (currentNode && nodeId === currentNode) {
          return '#e53e3e'
        }
        if (highlightedNodes.includes(nodeId)) {
          return '#f6ad55'
        }
        if (visitedNodes.includes(nodeId)) {
          return '#68d391'
        }
        return '#667eea'
      })
      .attr('stroke', d => {
        const nodeData = d.data as TreeNodeVisual
        const nodeId = nodeData.id || `node-${d.data.value}`
        
        if (currentNode && nodeId === currentNode) {
          return '#c53030'
        }
        if (highlightedNodes.includes(nodeId)) {
          return '#dd6b20'
        }
        return '#5a67d8'
      })
      .attr('stroke-width', 3)
      .style('transition', 'all 0.3s ease')

    nodeGroups.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '14')
      .text(d => d.data.value)

    nodeGroups.append('title')
      .text(d => `值: ${d.data.value}`)

  }, [root, currentStep, defaultWidth, defaultHeight])

  return (
    <Container>
      <Title>树结构可视化</Title>
      <SVGContainer>
        <svg 
          ref={svgRef} 
          width={800} 
          height={500}
        />
      </SVGContainer>
    </Container>
  )
}

export default TreeVisualizer
