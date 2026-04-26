import pandas as pd
import numpy as np
import networkx as nx
from typing import Dict, List, Tuple, Optional
import folium
from visualization import TrafficVisualizer


class NetworkAnalyzer:
    def __init__(self, G: nx.Graph, intersections: pd.DataFrame, 
                 roads: pd.DataFrame, traffic_data: pd.DataFrame):
        self.G = G
        self.intersections = intersections
        self.roads = roads
        self.traffic_data = traffic_data
        
        # 预计算一些全局指标
        self._calculate_global_metrics()
    
    def _calculate_global_metrics(self):
        """计算全局网络指标"""
        # 原始网络的连通分量
        self.original_components = list(nx.connected_components(self.G))
        self.original_num_components = len(self.original_components)
        self.original_largest_component_size = max(len(c) for c in self.original_components) if self.original_components else 0
        
        # 平均最短路径长度（只在最大连通分量上计算）
        if self.original_largest_component_size > 1:
            largest_component = self.G.subgraph(max(self.original_components, key=len))
            try:
                self.original_avg_shortest_path = nx.average_shortest_path_length(largest_component, weight='length')
            except:
                self.original_avg_shortest_path = float('inf')
        else:
            self.original_avg_shortest_path = float('inf')
    
    def calculate_node_centrality(self) -> pd.DataFrame:
        """
        计算节点中心性指标，用于识别关键路口
        
        返回包含以下指标的DataFrame:
        - degree_centrality: 度中心性（连接的边数）
        - betweenness_centrality: 介数中心性（作为最短路径中介的频率）
        - closeness_centrality: 接近中心性（到其他节点的平均距离）
        - eigenvector_centrality: 特征向量中心性（邻居的重要性）
        """
        print("正在计算节点中心性指标...")
        
        centrality_metrics = []
        
        # 度中心性
        degree_centrality = nx.degree_centrality(self.G)
        
        # 介数中心性
        print("  计算介数中心性...")
        betweenness_centrality = nx.betweenness_centrality(self.G, weight='length', normalized=True)
        
        # 接近中心性
        print("  计算接近中心性...")
        closeness_centrality = nx.closeness_centrality(self.G, distance='length')
        
        # 特征向量中心性
        print("  计算特征向量中心性...")
        try:
            eigenvector_centrality = nx.eigenvector_centrality(self.G, weight='length', max_iter=1000)
        except:
            eigenvector_centrality = {node: 0 for node in self.G.nodes()}
        
        # 收集所有指标
        for node in self.G.nodes():
            node_data = self.intersections[self.intersections['intersection_id'] == node].iloc[0]
            
            centrality_metrics.append({
                'intersection_id': node,
                'name': node_data['name'],
                'latitude': node_data['latitude'],
                'longitude': node_data['longitude'],
                'importance': node_data['importance'],
                'degree': self.G.degree(node),
                'degree_centrality': degree_centrality[node],
                'betweenness_centrality': betweenness_centrality[node],
                'closeness_centrality': closeness_centrality[node],
                'eigenvector_centrality': eigenvector_centrality[node]
            })
        
        # 转换为DataFrame
        centrality_df = pd.DataFrame(centrality_metrics)
        
        # 计算综合中心性得分（归一化后加权平均）
        def normalize(series):
            return (series - series.min()) / (series.max() - series.min() + 1e-10)
        
        centrality_df['norm_degree'] = normalize(centrality_df['degree_centrality'])
        centrality_df['norm_betweenness'] = normalize(centrality_df['betweenness_centrality'])
        centrality_df['norm_closeness'] = normalize(centrality_df['closeness_centrality'])
        centrality_df['norm_eigenvector'] = normalize(centrality_df['eigenvector_centrality'])
        
        # 综合得分：介数中心性权重最高，因为它最能反映瓶颈
        centrality_df['composite_score'] = (
            0.4 * centrality_df['norm_betweenness'] +
            0.3 * centrality_df['norm_degree'] +
            0.2 * centrality_df['norm_closeness'] +
            0.1 * centrality_df['norm_eigenvector']
        )
        
        # 按综合得分排序
        centrality_df = centrality_df.sort_values('composite_score', ascending=False)
        
        print(f"已计算 {len(centrality_df)} 个路口的中心性指标")
        
        return centrality_df
    
    def analyze_node_removal_impact(self, centrality_df: pd.DataFrame = None,
                                      top_n: int = 20) -> pd.DataFrame:
        """
        分析移除每个节点对网络连通性的影响
        
        参数:
            centrality_df: 预计算的中心性DataFrame，如果为None则重新计算
            top_n: 只分析前N个最关键的节点（用于加速）
            
        返回:
            包含移除影响分析的DataFrame
        """
        print("正在分析节点移除对网络连通性的影响...")
        
        if centrality_df is None:
            centrality_df = self.calculate_node_centrality()
        
        # 只分析前N个最关键的节点以节省时间
        nodes_to_analyze = centrality_df.head(top_n)['intersection_id'].tolist()
        
        removal_impacts = []
        
        total_nodes = len(nodes_to_analyze)
        for idx, node in enumerate(nodes_to_analyze):
            if (idx + 1) % 5 == 0:
                print(f"  正在分析第 {idx + 1}/{total_nodes} 个节点...")
            
            # 创建移除该节点后的子图
            G_removed = self.G.copy()
            G_removed.remove_node(node)
            
            # 计算连通分量变化
            components = list(nx.connected_components(G_removed))
            num_components = len(components)
            largest_component_size = max(len(c) for c in components) if components else 0
            
            # 计算连通性下降比例
            component_increase = num_components - self.original_num_components
            largest_component_decrease = self.original_largest_component_size - largest_component_size
            largest_component_ratio = largest_component_size / self.original_largest_component_size if self.original_largest_component_size > 0 else 0
            
            # 计算平均最短路径变化（在最大连通分量上）
            avg_shortest_path = float('inf')
            if largest_component_size > 1:
                largest_component_subgraph = G_removed.subgraph(max(components, key=len))
                try:
                    avg_shortest_path = nx.average_shortest_path_length(largest_component_subgraph, weight='length')
                except:
                    avg_shortest_path = float('inf')
            
            # 计算孤立节点数
            isolated_nodes = [c for c in components if len(c) == 1]
            num_isolated = len(isolated_nodes)
            
            # 获取该节点的中心性数据
            node_data = centrality_df[centrality_df['intersection_id'] == node].iloc[0]
            
            # 计算综合影响得分
            # 组件增加越多、最大组件减少越多、孤立节点越多、路径增加越多，影响越大
            impact_score = 0
            
            # 连通分量增加的影响
            impact_score += 0.3 * (component_increase / (self.original_num_components + 1))
            
            # 最大组件缩小的影响
            impact_score += 0.3 * (1 - largest_component_ratio)
            
            # 孤立节点的影响
            impact_score += 0.2 * (num_isolated / len(self.G.nodes()))
            
            # 路径长度增加的影响
            if self.original_avg_shortest_path < float('inf') and avg_shortest_path < float('inf'):
                path_increase_ratio = (avg_shortest_path - self.original_avg_shortest_path) / self.original_avg_shortest_path
                impact_score += 0.2 * max(0, path_increase_ratio)
            
            # 结合中心性得分
            final_impact = 0.7 * impact_score + 0.3 * node_data['composite_score']
            
            removal_impacts.append({
                'intersection_id': node,
                'name': node_data['name'],
                'latitude': node_data['latitude'],
                'longitude': node_data['longitude'],
                'degree': node_data['degree'],
                'betweenness_centrality': node_data['betweenness_centrality'],
                'composite_centrality': node_data['composite_score'],
                'original_components': self.original_num_components,
                'components_after_removal': num_components,
                'component_increase': component_increase,
                'largest_component_original': self.original_largest_component_size,
                'largest_component_after': largest_component_size,
                'largest_component_ratio': largest_component_ratio,
                'num_isolated_nodes': num_isolated,
                'original_avg_path': self.original_avg_shortest_path,
                'avg_path_after_removal': avg_shortest_path,
                'impact_score': final_impact
            })
        
        # 转换为DataFrame并按影响得分排序
        impact_df = pd.DataFrame(removal_impacts)
        impact_df = impact_df.sort_values('impact_score', ascending=False)
        
        print(f"已完成 {len(impact_df)} 个关键节点的移除影响分析")
        
        return impact_df
    
    def identify_bottleneck_intersections(self, top_k: int = 10) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        识别关键瓶颈路口
        
        参数:
            top_k: 返回前K个最关键的瓶颈路口
            
        返回:
            (中心性指标DataFrame, 移除影响分析DataFrame)
        """
        print("\n=== 开始识别关键瓶颈路口 ===")
        
        # 计算中心性指标
        centrality_df = self.calculate_node_centrality()
        
        print("\n按综合中心性排名的前10个路口:")
        print(centrality_df[['intersection_id', 'name', 'degree', 'betweenness_centrality', 
                             'composite_score']].head(10).to_string(index=False))
        
        # 分析移除影响
        impact_df = self.analyze_node_removal_impact(centrality_df, top_n=min(30, len(centrality_df)))
        
        print("\n按移除影响排名的前10个路口:")
        print(impact_df[['intersection_id', 'name', 'degree', 'betweenness_centrality',
                        'component_increase', 'largest_component_ratio', 'num_isolated_nodes',
                        'impact_score']].head(10).to_string(index=False))
        
        # 最关键的瓶颈是移除影响最大的
        top_bottlenecks = impact_df.head(top_k)
        
        print(f"\n=== 识别出前 {top_k} 个关键瓶颈路口 ===")
        for idx, (_, row) in enumerate(top_bottlenecks.iterrows(), 1):
            print(f"\n{idx}. {row['name']} ({row['intersection_id']})")
            print(f"   - 连接道路数: {row['degree']}")
            print(f"   - 介数中心性: {row['betweenness_centrality']:.4f}")
            print(f"   - 移除后连通分量增加: {row['component_increase']}")
            print(f"   - 最大连通分量比例: {row['largest_component_ratio']:.2%}")
            print(f"   - 产生孤立节点数: {row['num_isolated_nodes']}")
            print(f"   - 综合影响得分: {row['impact_score']:.4f}")
        
        return centrality_df, impact_df
    
    def visualize_bottlenecks(self, impact_df: pd.DataFrame, 
                                output_file: str = 'bottlenecks_map.html') -> folium.Map:
        """
        在地图上可视化关键瓶颈路口
        """
        print("\n正在创建瓶颈路口可视化地图...")
        
        # 创建基础地图
        visualizer = TrafficVisualizer(self.intersections, self.roads, self.traffic_data)
        m = visualizer.create_base_map()
        
        # 添加所有道路
        m = visualizer.add_roads_to_map(m)
        
        # 根据影响得分对路口着色
        max_impact = impact_df['impact_score'].max() if not impact_df.empty else 1
        
        # 添加所有路口，根据是否是瓶颈使用不同样式
        for _, row in self.intersections.iterrows():
            int_id = row['intersection_id']
            
            # 检查是否是瓶颈路口
            bottleneck_data = impact_df[impact_df['intersection_id'] == int_id]
            
            if not bottleneck_data.empty:
                # 是瓶颈路口
                impact_score = bottleneck_data.iloc[0]['impact_score']
                rank = impact_df[impact_df['impact_score'] > impact_score].shape[0] + 1
                
                # 根据影响程度设置颜色和大小
                # 红色越深表示越关键
                intensity = min(1, impact_score / max_impact) if max_impact > 0 else 0
                red = int(255)
                green = int(255 * (1 - intensity))
                blue = int(255 * (1 - intensity))
                color = f'#{red:02X}{green:02X}{blue:02X}'
                
                radius = 12 + intensity * 10
                
                folium.CircleMarker(
                    location=[row['latitude'], row['longitude']],
                    radius=radius,
                    popup=f"<b>关键瓶颈路口</b><br>"
                          f"排名: 第{rank}位<br>"
                          f"路口ID: {int_id}<br>"
                          f"名称: {row['name']}<br>"
                          f"连接道路数: {bottleneck_data.iloc[0]['degree']}<br>"
                          f"介数中心性: {bottleneck_data.iloc[0]['betweenness_centrality']:.4f}<br>"
                          f"影响得分: {impact_score:.4f}<br>"
                          f"移除后分量增加: {bottleneck_data.iloc[0]['component_increase']}<br>"
                          f"孤立节点数: {bottleneck_data.iloc[0]['num_isolated_nodes']}",
                    color=color,
                    fill=True,
                    fillColor=color,
                    fillOpacity=0.8,
                    weight=2
                ).add_to(m)
            else:
                # 普通路口
                folium.CircleMarker(
                    location=[row['latitude'], row['longitude']],
                    radius=5,
                    popup=f"路口ID: {int_id}<br>名称: {row['name']}",
                    color='blue',
                    fill=True,
                    fillColor='blue',
                    fillOpacity=0.5
                ).add_to(m)
        
        # 添加图例
        self._add_bottleneck_legend(m)
        
        # 保存地图
        m.save(output_file)
        print(f"瓶颈路口地图已保存到: {output_file}")
        
        return m
    
    def _add_bottleneck_legend(self, m: folium.Map):
        """添加瓶颈图例"""
        legend_html = '''
        <div style="position: fixed; 
                    bottom: 50px; left: 50px; width: 220px; height: 140px; 
                    border:2px solid grey; z-index:9999; font-size:14px;
                    background-color:white;
                    padding: 10px;
                    border-radius: 5px;
                    opacity: 0.9;">
        <p style="margin-top: 0; margin-bottom: 10px; font-weight: bold;">关键瓶颈路口</p>
        <p><i class="fa fa-circle" style="color:#FF0000"></i>&nbsp; 最关键瓶颈</p>
        <p><i class="fa fa-circle" style="color:#FF6666"></i>&nbsp; 重要瓶颈</p>
        <p><i class="fa fa-circle" style="color:#FFAAAA"></i>&nbsp; 一般瓶颈</p>
        <p><i class="fa fa-circle" style="color:#0000FF"></i>&nbsp; 普通路口</p>
        </div>
        '''
        
        m.get_root().html.add_child(folium.Element(legend_html))
    
    def get_network_statistics(self) -> Dict:
        """获取网络统计信息"""
        stats = {
            'num_nodes': self.G.number_of_nodes(),
            'num_edges': self.G.number_of_edges(),
            'is_connected': nx.is_connected(self.G),
            'num_connected_components': self.original_num_components,
            'largest_component_size': self.original_largest_component_size,
            'average_degree': sum(d for n, d in self.G.degree()) / self.G.number_of_nodes(),
            'density': nx.density(self.G),
            'average_shortest_path': self.original_avg_shortest_path
        }
        
        # 计算度分布
        degree_sequence = sorted([d for n, d in self.G.degree()], reverse=True)
        stats['degree_distribution'] = {
            'min_degree': min(degree_sequence),
            'max_degree': max(degree_sequence),
            'median_degree': np.median(degree_sequence)
        }
        
        return stats


if __name__ == "__main__":
    # 测试网络分析模块
    from data_generator import TrafficDataGenerator
    
    # 生成测试数据
    print("生成测试数据...")
    generator = TrafficDataGenerator(num_intersections=20, num_roads=40, days=1)
    intersections, roads, traffic_data, G = generator.generate_all_data()
    
    # 创建网络分析器
    print("\n初始化网络分析器...")
    analyzer = NetworkAnalyzer(G, intersections, roads, traffic_data)
    
    # 打印网络统计
    print("\n网络统计信息:")
    stats = analyzer.get_network_statistics()
    import json
    print(json.dumps(stats, indent=2, default=str))
    
    # 识别瓶颈路口
    centrality_df, impact_df = analyzer.identify_bottleneck_intersections(top_k=5)
    
    # 可视化瓶颈
    m = analyzer.visualize_bottlenecks(impact_df)
    
    print("\n分析完成！")
