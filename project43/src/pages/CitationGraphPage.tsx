import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import * as d3 from 'd3';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { paperService } from '@/services/paperService';
import type { Paper, CitationGraph, CitationNode, CitationLink } from '@/types';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  paper: Paper;
  group: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | string;
  target: GraphNode | string;
  type: 'cites' | 'cited-by';
}

function ForceGraph({
  graph,
  onNodeClick,
}: {
  graph: CitationGraph;
  onNodeClick: (node: CitationNode) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.max(400, width), height: Math.max(400, height - 10) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || graph.nodes.length === 0) return;

    const { width, height } = dimensions;

    const nodes: GraphNode[] = graph.nodes.map((node) => ({
      ...node,
      group:
        node.id === graph.nodes[0]?.id
          ? 0
          : graph.links.some((l) => l.source === node.id || l.target === graph.nodes[0]?.id && l.type === 'cites')
          ? 1
          : 2,
    }));

    const links: GraphLink[] = graph.links.map((link) => ({
      ...link,
    }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const defs = svg.append('defs');

    const gradientCites = defs
      .append('linearGradient')
      .attr('id', 'gradient-cites')
      .attr('gradientUnits', 'userSpaceOnUse');

    gradientCites
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366f1');

    gradientCites
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#a855f7');

    const gradientCitedBy = defs
      .append('linearGradient')
      .attr('id', 'gradient-cited-by')
      .attr('gradientUnits', 'userSpaceOnUse');

    gradientCitedBy
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981');

    gradientCitedBy
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#34d399');

    const arrows = defs.append('marker');
    arrows
      .attr('id', 'arrowhead-cites')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6);

    arrows
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6366f1');

    const arrowsCitedBy = defs.append('marker');
    arrowsCitedBy
      .attr('id', 'arrowhead-cited-by')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6);

    arrowsCitedBy
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#10b981');

    const color = d3.scaleOrdinal<string>()
      .domain(['0', '1', '2'])
      .range(['#f59e0b', '#6366f1', '#10b981']);

    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => (d.type === 'cites' ? '#6366f1' : '#10b981'))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', (d) =>
        d.type === 'cites' ? 'url(#arrowhead-cites)' : 'url(#arrowhead-cited-by)'
      );

    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredNode(d.id);
        d3.select(event.currentTarget).select('circle').transition().duration(200).attr('r', 20);
      })
      .on('mouseleave', (event, d) => {
        setHoveredNode(null);
        if (selectedNode !== d.id) {
          d3.select(event.currentTarget).select('circle').transition().duration(200).attr('r', 12);
        }
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.id);
        onNodeClick(d);
      })
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active && simulationRef.current) {
              simulationRef.current.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active && simulationRef.current) {
              simulationRef.current.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append('circle')
      .attr('r', (d) => (d.group === 0 ? 16 : 12))
      .attr('fill', (d) => color(d.group.toString()))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    node
      .append('text')
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#374151')
      .attr('pointer-events', 'none')
      .text((d) => {
        const title = d.paper.title;
        return title.length > 25 ? title.slice(0, 25) + '...' : title;
      });

    node
      .append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#6b7280')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.paper.authors.length > 0) {
          const author = d.paper.authors[0];
          return `${author.familyName || author.name.split(' ').pop() || author.name} et al. ${d.paper.year || ''}`;
        }
        return d.paper.year?.toString() || '';
      });

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d: unknown) => (d as GraphNode).id).distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))
      .on('tick', () => {
        link
          .attr('x1', (d) => (d.source as GraphNode).x!)
          .attr('y1', (d) => (d.source as GraphNode).y!)
          .attr('x2', (d) => (d.target as GraphNode).x!)
          .attr('y2', (d) => (d.target as GraphNode).y!);

        node.attr('transform', (d) => `translate(${d.x},${d.y})`);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graph, dimensions, onNodeClick]);

  const hoveredNodeData = graph.nodes.find((n) => n.id === hoveredNode);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-full min-h-[500px]">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="bg-gray-50 rounded-lg" />
      </div>

      {hoveredNodeData && (
        <div className="absolute top-4 left-4 bg-white shadow-lg border border-gray-200 rounded-lg p-4 max-w-xs z-10">
          <h4 className="font-semibold text-gray-900 text-sm">
            {hoveredNodeData.paper.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {hoveredNodeData.paper.authors.map((a) => a.name).join(', ')}
          </p>
          {hoveredNodeData.paper.year && (
            <p className="text-xs text-gray-500">{hoveredNodeData.paper.year}</p>
          )}
          {hoveredNodeData.paper.journal && (
            <p className="text-xs text-gray-400">{hoveredNodeData.paper.journal}</p>
          )}
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-white shadow-lg border border-gray-200 rounded-lg p-3 z-10">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">图例</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">核心文献</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-xs text-gray-600">参考文献</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-600">引用文献</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CitationGraphPage() {
  const params = useParams<{ paperId: string }>();
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const { data: paper, isLoading: isLoadingPaper } = useQuery({
    queryKey: ['paper', params.paperId],
    queryFn: () => paperService.getPaper(params.paperId!),
    enabled: !!params.paperId,
  });

  const { data: graph, isLoading: isLoadingGraph } = useQuery({
    queryKey: ['citation-graph', params.paperId],
    queryFn: () => paperService.getCitationGraph(params.paperId!),
    enabled: !!params.paperId,
  });

  const handleNodeClick = (node: CitationNode) => {
    setSelectedPaper(node.paper);
  };

  const isLoading = isLoadingPaper || isLoadingGraph;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Link to="/papers" className="text-sm text-indigo-600 hover:underline mb-1 block">
              ← 返回文献列表
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">文献引用关系图</h1>
            <p className="text-gray-500 mt-1">
              基于引用关系构建力导向图，发现相关文献</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="ml-1">下载图片</span>
            </Button>
          </div>
        </div>

        {paper && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{paper.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {paper.authors.map((a) => a.name).join(', ')}
                  {paper.year && ` (${paper.year})`}
                </p>
                {paper.journal && (
                  <p className="text-sm text-gray-400">{paper.journal}</p>
                )}
              </div>
              {graph && (
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">
                      {paper.references?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">参考文献</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {paper.citations?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">被引用</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">
                      {graph.nodes.length}
                    </p>
                    <p className="text-xs text-gray-500">节点数</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="h-[500px] flex items-center justify-center">
              <Loading text="加载引用关系图..." />
            </div>
          ) : graph && graph.nodes.length > 0 ? (
            <div className="p-4">
              <ForceGraph
                graph={graph}
                onNodeClick={handleNodeClick}
              />
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无引用关系数据</h3>
                <p className="text-gray-500">该文献暂未找到引用关系数据</p>
              </div>
            </div>
          )}
        </div>

        {selectedPaper && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{selectedPaper.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPaper.authors.map((a) => a.name).join(', ')}
                  {selectedPaper.year && ` (${selectedPaper.year})`}
                </p>
                {selectedPaper.abstract && (
                  <p className="text-sm text-gray-600 mt-2">{selectedPaper.abstract}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Link to={`/papers/${selectedPaper.id}`}>
                  <Button variant="primary" size="sm">
                    查看详情
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPaper(null)}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">操作说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">鼠标悬停</p>
                <p className="text-gray-500">查看节点详细信息</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">点击节点</p>
                <p className="text-gray-500">查看该文献详情</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">拖拽节点</p>
                <p className="text-gray-500">重新排列布局</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CitationGraphPage;
