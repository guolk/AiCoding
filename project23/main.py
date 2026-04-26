#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
交通流量分析系统 - 主程序
================================
功能：
1. 生成模拟城市路网数据集
2. 早晚高峰时段的路网拥堵热力图（动态时间轴）
3. 关键瓶颈路口识别（网络连通性分析）
4. 不同天气条件对各路段通行速度的影响分析
5. 基于历史数据的明日高峰期拥堵预测（SARIMA时序模型）
6. 所有可视化使用Folium在地图上展示
"""

import os
import sys
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Optional
import warnings
warnings.filterwarnings('ignore')

# 导入所有模块
from data_generator import TrafficDataGenerator
from visualization import TrafficVisualizer
from network_analysis import NetworkAnalyzer
from weather_analysis import WeatherAnalyzer
from time_series_prediction import TrafficPredictor


class TrafficAnalysisSystem:
    """交通流量分析系统主类"""
    
    def __init__(self, num_intersections: int = 50, num_roads: int = 100, 
                 days: int = 30, output_dir: str = './output',
                 use_sarima: bool = False):
        """
        初始化交通流量分析系统
        
        参数:
            num_intersections: 路口数量
            num_roads: 道路数量
            days: 数据覆盖天数
            output_dir: 输出目录
            use_sarima: 是否使用SARIMA模型进行预测（较慢但更准确），默认False使用快速方法
        """
        self.num_intersections = num_intersections
        self.num_roads = num_roads
        self.days = days
        self.output_dir = output_dir
        self.use_sarima = use_sarima
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(os.path.join(output_dir, 'data'), exist_ok=True)
        os.makedirs(os.path.join(output_dir, 'maps'), exist_ok=True)
        os.makedirs(os.path.join(output_dir, 'reports'), exist_ok=True)
        
        # 数据存储
        self.intersections = None
        self.roads = None
        self.traffic_data = None
        self.G = None
        
        # 分析器
        self.visualizer = None
        self.network_analyzer = None
        self.weather_analyzer = None
        self.predictor = None
        
        # 结果存储
        self.results = {}
    
    def generate_data(self):
        """生成模拟交通数据"""
        print("\n" + "="*60)
        print("第一步：生成模拟交通数据")
        print("="*60)
        
        generator = TrafficDataGenerator(
            num_intersections=self.num_intersections,
            num_roads=self.num_roads,
            days=self.days
        )
        
        self.intersections, self.roads, self.traffic_data, self.G = generator.generate_all_data()
        
        # 保存数据
        generator.save_data(
            self.intersections, 
            self.roads, 
            self.traffic_data,
            output_dir=os.path.join(self.output_dir, 'data')
        )
        
        # 初始化分析器
        self._initialize_analyzers()
        
        print("\n数据生成完成！")
    
    def _initialize_analyzers(self):
        """初始化所有分析器"""
        print("\n正在初始化分析器...")
        
        self.visualizer = TrafficVisualizer(
            self.intersections, 
            self.roads, 
            self.traffic_data
        )
        
        self.network_analyzer = NetworkAnalyzer(
            self.G, 
            self.intersections, 
            self.roads, 
            self.traffic_data
        )
        
        self.weather_analyzer = WeatherAnalyzer(
            self.traffic_data, 
            self.roads, 
            self.intersections
        )
        
        self.predictor = TrafficPredictor(
            self.traffic_data, 
            self.roads, 
            self.intersections
        )
        
        print("所有分析器初始化完成！")
    
    def create_rush_hour_heatmaps(self):
        """创建早晚高峰拥堵热力图"""
        print("\n" + "="*60)
        print("第二步：创建早晚高峰拥堵热力图")
        print("="*60)
        
        # 创建早晚高峰热力图
        m_morning, m_evening = self.visualizer.create_rush_hour_heatmap(
            output_file=os.path.join(self.output_dir, 'maps', 'rush_hour_heatmap.html')
        )
        
        # 创建动态时间轴热力图
        start_date = self.traffic_data['timestamp'].min()
        m_time = self.visualizer.create_time_series_heatmap(
            start_date=start_date,
            days=1,
            output_file=os.path.join(self.output_dir, 'maps', 'time_series_heatmap.html')
        )
        
        # 创建路口热力图
        m_intersection = self.visualizer.create_intersection_heatmap(
            output_file=os.path.join(self.output_dir, 'maps', 'intersection_heatmap.html')
        )
        
        # 保存统计信息
        stats = self.visualizer.create_summary_statistics()
        self.results['visualization_stats'] = stats
        
        print("\n热力图创建完成！")
        print(f"  - 早高峰热力图: {os.path.join(self.output_dir, 'maps', 'rush_hour_heatmap_morning.html')}")
        print(f"  - 晚高峰热力图: {os.path.join(self.output_dir, 'maps', 'rush_hour_heatmap_evening.html')}")
        print(f"  - 动态时间轴热力图: {os.path.join(self.output_dir, 'maps', 'time_series_heatmap.html')}")
        print(f"  - 路口热力图: {os.path.join(self.output_dir, 'maps', 'intersection_heatmap.html')}")
        
        return m_morning, m_evening, m_time, m_intersection
    
    def identify_bottlenecks(self, top_k: int = 10):
        """识别关键瓶颈路口"""
        print("\n" + "="*60)
        print("第三步：识别关键瓶颈路口")
        print("="*60)
        
        # 获取网络统计
        network_stats = self.network_analyzer.get_network_statistics()
        print("\n网络基本统计:")
        for key, value in network_stats.items():
            if key != 'degree_distribution':
                print(f"  {key}: {value}")
        
        # 识别瓶颈
        centrality_df, impact_df = self.network_analyzer.identify_bottleneck_intersections(top_k=top_k)
        
        # 可视化瓶颈
        m_bottlenecks = self.network_analyzer.visualize_bottlenecks(
            impact_df,
            output_file=os.path.join(self.output_dir, 'maps', 'bottlenecks_map.html')
        )
        
        # 保存结果
        self.results['network_stats'] = network_stats
        self.results['bottleneck_centrality'] = centrality_df.head(top_k).to_dict('records')
        self.results['bottleneck_impact'] = impact_df.head(top_k).to_dict('records')
        
        print(f"\n瓶颈路口地图已保存到: {os.path.join(self.output_dir, 'maps', 'bottlenecks_map.html')}")
        
        return centrality_df, impact_df, m_bottlenecks
    
    def analyze_weather_impact(self):
        """分析天气对交通的影响"""
        print("\n" + "="*60)
        print("第四步：分析天气对交通的影响")
        print("="*60)
        
        # 生成完整天气分析报告
        weather_report = self.weather_analyzer.generate_weather_report()
        
        # 识别天气敏感路段
        sensitivity_df = self.weather_analyzer.identify_weather_sensitive_roads(top_k=10)
        
        # 可视化天气影响
        m_weather = self.weather_analyzer.visualize_weather_impact(
            sensitivity_df,
            output_file=os.path.join(self.output_dir, 'maps', 'weather_impact_map.html')
        )
        
        # 保存结果
        self.results['weather_report'] = weather_report
        self.results['weather_sensitive_roads'] = sensitivity_df.head(10).to_dict('records')
        
        print(f"\n天气影响地图已保存到: {os.path.join(self.output_dir, 'maps', 'weather_impact_map.html')}")
        
        return weather_report, sensitivity_df, m_weather
    
    def predict_tomorrow_traffic(self):
        """预测明日高峰期交通"""
        print("\n" + "="*60)
        print("第五步：预测明日高峰期拥堵情况")
        print("="*60)
        
        # 预测明日高峰期拥堵指数
        if self.use_sarima:
            print("\n[注意] 使用SARIMA模型进行预测（可能需要较长时间）...")
        else:
            print("\n使用快速预测方法（基于历史模式）...")
        
        prediction_result = self.predictor.predict_tomorrow_rush_hour(
            target_column='congestion_index',
            use_sarima=self.use_sarima
        )
        
        # 按道路预测
        road_predictions = self.predictor.predict_by_road(forecast_hours=24)
        
        # 可视化预测结果
        m_prediction = self.predictor.visualize_predictions(
            road_predictions,
            output_file=os.path.join(self.output_dir, 'maps', 'prediction_map.html')
        )
        
        # 保存结果
        self.results['tomorrow_prediction'] = prediction_result
        self.results['road_predictions'] = road_predictions.to_dict('records')
        
        print(f"\n预测结果地图已保存到: {os.path.join(self.output_dir, 'maps', 'prediction_map.html')}")
        
        return prediction_result, road_predictions, m_prediction
    
    def run_full_analysis(self):
        """运行完整的交通流量分析"""
        print("\n" + "="*60)
        print("交通流量分析系统 - 完整分析")
        print("="*60)
        print(f"\n配置参数:")
        print(f"  - 路口数量: {self.num_intersections}")
        print(f"  - 道路数量: {self.num_roads}")
        print(f"  - 数据天数: {self.days}")
        print(f"  - 输出目录: {self.output_dir}")
        
        # 执行所有分析步骤
        self.generate_data()
        self.create_rush_hour_heatmaps()
        self.identify_bottlenecks(top_k=10)
        self.analyze_weather_impact()
        self.predict_tomorrow_traffic()
        
        # 生成汇总报告
        self._generate_summary_report()
        
        print("\n" + "="*60)
        print("分析完成！")
        print("="*60)
        print(f"\n所有输出文件已保存到: {self.output_dir}")
        
        # 列出所有生成的文件
        print("\n生成的地图文件:")
        map_dir = os.path.join(self.output_dir, 'maps')
        if os.path.exists(map_dir):
            for f in sorted(os.listdir(map_dir)):
                print(f"  - {f}")
        
        return self.results
    
    def _generate_summary_report(self):
        """生成汇总分析报告"""
        print("\n" + "="*60)
        print("生成汇总分析报告")
        print("="*60)
        
        report_lines = []
        report_lines.append("="*60)
        report_lines.append("交通流量分析系统 - 汇总报告")
        report_lines.append("="*60)
        report_lines.append(f"\n生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"\n配置参数:")
        report_lines.append(f"  - 路口数量: {self.num_intersections}")
        report_lines.append(f"  - 道路数量: {self.num_roads}")
        report_lines.append(f"  - 数据天数: {self.days}")
        
        # 数据统计
        report_lines.append(f"\n--- 数据统计 ---")
        if self.traffic_data is not None:
            report_lines.append(f"  总交通记录数: {len(self.traffic_data)}")
            report_lines.append(f"  时间范围: {self.traffic_data['timestamp'].min()} 到 {self.traffic_data['timestamp'].max()}")
        
        # 可视化统计
        if 'visualization_stats' in self.results:
            stats = self.results['visualization_stats']
            report_lines.append(f"\n--- 交通概况 ---")
            report_lines.append(f"  整体平均拥堵指数: {stats['overall']['mean_congestion']:.2f}")
            report_lines.append(f"  整体平均速度: {stats['overall']['mean_speed']:.2f} km/h")
            report_lines.append(f"\n  早晚高峰对比:")
            if 'rush_hour' in stats:
                rh = stats['rush_hour']
                report_lines.append(f"    早高峰平均拥堵指数: {rh['morning']['mean_congestion']:.2f}")
                report_lines.append(f"    晚高峰平均拥堵指数: {rh['evening']['mean_congestion']:.2f}")
                report_lines.append(f"    平峰平均拥堵指数: {rh['non_rush']['mean_congestion']:.2f}")
        
        # 瓶颈路口
        if 'bottleneck_impact' in self.results:
            report_lines.append(f"\n--- 关键瓶颈路口 ---")
            report_lines.append(f"\n  前5个关键瓶颈路口:")
            for i, bottleneck in enumerate(self.results['bottleneck_impact'][:5], 1):
                report_lines.append(f"\n    {i}. {bottleneck['name']} ({bottleneck['intersection_id']})")
                report_lines.append(f"       - 连接道路数: {bottleneck['degree']}")
                report_lines.append(f"       - 介数中心性: {bottleneck['betweenness_centrality']:.4f}")
                report_lines.append(f"       - 移除后分量增加: {bottleneck['component_increase']}")
                report_lines.append(f"       - 综合影响得分: {bottleneck['impact_score']:.4f}")
        
        # 天气影响
        if 'weather_report' in self.results:
            report_lines.append(f"\n--- 天气影响分析 ---")
            for finding in self.results['weather_report'].get('key_findings', []):
                report_lines.append(f"\n  {finding['finding']}:")
                for key, value in finding.items():
                    if key != 'finding':
                        report_lines.append(f"    - {key}: {value}")
        
        # 预测结果
        if 'tomorrow_prediction' in self.results:
            pred = self.results['tomorrow_prediction']
            report_lines.append(f"\n--- 明日高峰期预测 ---")
            report_lines.append(f"\n  预测日期: {pred['forecast_date']}")
            report_lines.append(f"  是否为周末: {'是' if pred['is_weekend'] else '否'}")
            
            if 'rush_hour_forecasts' in pred:
                for key, rush in pred['rush_hour_forecasts'].items():
                    report_lines.append(f"\n  {rush['name']}:")
                    report_lines.append(f"    - 平均预测拥堵指数: {rush['mean_prediction']:.2f}")
                    # 使用 pd.Timestamp 转换以支持 strftime（兼容 numpy.datetime64）
                    report_lines.append(f"    - 峰值时间: {pd.Timestamp(rush['peak_time']).strftime('%H:%M')}")
                    report_lines.append(f"    - 峰值拥堵指数: {rush['peak_value']:.2f}")
        
        # 保存报告
        report_path = os.path.join(self.output_dir, 'reports', 'summary_report.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        print(f"汇总报告已保存到: {report_path}")
        
        # 打印报告摘要
        print("\n报告摘要:")
        for line in report_lines[10:60]:  # 只打印部分内容
            print(line)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='交通流量分析系统')
    parser.add_argument('--intersections', type=int, default=50, help='路口数量 (默认: 50)')
    parser.add_argument('--roads', type=int, default=100, help='道路数量 (默认: 100)')
    parser.add_argument('--days', type=int, default=30, help='数据天数 (默认: 30)')
    parser.add_argument('--output', type=str, default='./output', help='输出目录 (默认: ./output)')
    parser.add_argument('--quick', action='store_true', help='快速模式（使用较小的数据集，推荐先运行这个）')
    parser.add_argument('--use-sarima', action='store_true', help='使用SARIMA模型进行预测（较慢但可能更准确，默认使用快速方法）')
    
    args = parser.parse_args()
    
    # 快速模式
    if args.quick:
        args.intersections = 20
        args.roads = 40
        args.days = 7
        print("\n快速模式已启用:")
        print(f"  - 路口数量: {args.intersections}")
        print(f"  - 道路数量: {args.roads}")
        print(f"  - 数据天数: {args.days}")
    
    # SARIMA模式提示
    if args.use_sarima:
        print("\n[警告] SARIMA模式已启用，预测步骤可能需要较长时间！")
        print("         对于测试目的，建议不使用 --use-sarima 参数")
    
    # 创建分析系统并运行
    system = TrafficAnalysisSystem(
        num_intersections=args.intersections,
        num_roads=args.roads,
        days=args.days,
        output_dir=args.output,
        use_sarima=args.use_sarima
    )
    
    results = system.run_full_analysis()
    
    return results


if __name__ == "__main__":
    main()
