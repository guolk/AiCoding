#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
交通流量分析系统 - 测试脚本
用于快速验证系统各模块的基本功能
"""

import os
import sys
from datetime import datetime

# 设置控制台编码为UTF-8
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

print("="*60)
print("交通流量分析系统 - 功能测试")
print("="*60)

# 检查依赖
print("\n1. 检查Python依赖...")
try:
    import pandas as pd
    import numpy as np
    import networkx as nx
    import folium
    print("   [OK] 基础依赖 (pandas, numpy, networkx, folium) 已安装")
except ImportError as e:
    print("   [FAIL] 缺少依赖:", e)
    print("   请运行: pip install pandas numpy networkx folium")
    sys.exit(1)

try:
    from statsmodels.tsa.statespace.sarimax import SARIMAX
    print("   [OK] statsmodels 已安装（SARIMA模型可用）")
except ImportError:
    print("   [WARN] statsmodels 未安装，将使用简化预测方法")
    print("          如需使用完整SARIMA模型，请运行: pip install statsmodels")

# 导入自定义模块
print("\n2. 导入自定义模块...")
try:
    from data_generator import TrafficDataGenerator
    from visualization import TrafficVisualizer
    from network_analysis import NetworkAnalyzer
    from weather_analysis import WeatherAnalyzer
    from time_series_prediction import TrafficPredictor
    print("   [OK] 所有自定义模块导入成功")
except ImportError as e:
    print("   [FAIL] 模块导入失败:", e)
    sys.exit(1)

# 创建测试数据
print("\n3. 生成测试数据（小规模）...")
print("   参数: 10个路口, 20条道路, 3天数据")

try:
    generator = TrafficDataGenerator(
        num_intersections=10,
        num_roads=20,
        days=3
    )
    
    intersections, roads, traffic_data, G = generator.generate_all_data()
    
    print("   [OK] 数据生成成功:")
    print("     - 路口数量:", len(intersections))
    print("     - 道路数量:", len(roads))
    print("     - 交通记录:", len(traffic_data))
    print("     - 时间范围:", traffic_data['timestamp'].min(), "到", traffic_data['timestamp'].max())
    print("     - 天气类型:", traffic_data['weather_type'].unique())
    
except Exception as e:
    print("   [FAIL] 数据生成失败:", e)
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 测试可视化模块
print("\n4. 测试可视化模块...")
try:
    visualizer = TrafficVisualizer(intersections, roads, traffic_data)
    
    # 创建基础地图
    m = visualizer.create_base_map()
    print("   [OK] 基础地图创建成功")
    
    # 添加路口和道路
    m = visualizer.add_intersections_to_map(m)
    m = visualizer.add_roads_to_map(m)
    print("   [OK] 路口和道路添加成功")
    
    # 测试热力图创建
    m_morning, m_evening = visualizer.create_rush_hour_heatmap(
        output_file='./test_output/rush_hour_test.html'
    )
    print("   [OK] 早晚高峰热力图创建成功")
    
    # 测试统计信息
    stats = visualizer.create_summary_statistics()
    print("   [OK] 统计信息生成成功:")
    print("     - 平均拥堵指数: {:.2f}".format(stats['overall']['mean_congestion']))
    print("     - 平均速度: {:.2f} km/h".format(stats['overall']['mean_speed']))
    
except Exception as e:
    print("   [FAIL] 可视化模块测试失败:", e)
    import traceback
    traceback.print_exc()

# 测试网络分析模块
print("\n5. 测试网络分析模块...")
try:
    analyzer = NetworkAnalyzer(G, intersections, roads, traffic_data)
    
    # 计算网络统计
    network_stats = analyzer.get_network_statistics()
    print("   [OK] 网络统计:")
    print("     - 节点数:", network_stats['num_nodes'])
    print("     - 边数:", network_stats['num_edges'])
    print("     - 连通性:", '是' if network_stats['is_connected'] else '否')
    
    # 计算中心性
    centrality_df = analyzer.calculate_node_centrality()
    print("   [OK] 节点中心性计算成功，前3个关键路口:")
    for i, (_, row) in enumerate(centrality_df.head(3).iterrows(), 1):
        print("     {}. {} (综合得分: {:.4f})".format(i, row['name'], row['composite_score']))
    
    # 分析移除影响
    impact_df = analyzer.analyze_node_removal_impact(centrality_df, top_n=5)
    print("   [OK] 节点移除影响分析成功")
    
    # 可视化
    m_bottleneck = analyzer.visualize_bottlenecks(
        impact_df,
        output_file='./test_output/bottlenecks_test.html'
    )
    print("   [OK] 瓶颈地图创建成功")
    
except Exception as e:
    print("   [FAIL] 网络分析模块测试失败:", e)
    import traceback
    traceback.print_exc()

# 测试天气分析模块
print("\n6. 测试天气分析模块...")
try:
    weather_analyzer = WeatherAnalyzer(traffic_data, roads, intersections)
    
    # 整体天气影响
    overall_stats = weather_analyzer.analyze_weather_impact_overall()
    print("   [OK] 整体天气影响分析成功")
    
    # 按道路类型
    road_type_stats = weather_analyzer.analyze_weather_impact_by_road_type()
    print("   [OK] 按道路类型分析成功")
    
    # 按时段
    time_stats = weather_analyzer.analyze_weather_impact_by_time()
    print("   [OK] 按时段分析成功")
    
    # 敏感路段识别
    sensitivity_df = weather_analyzer.identify_weather_sensitive_roads(top_k=5)
    print("   [OK] 天气敏感路段识别成功，前3个:")
    for i, (_, row) in enumerate(sensitivity_df.head(3).iterrows(), 1):
        print("     {}. 道路 {} (敏感度: {:.4f})".format(i, row['road_id'], row['composite_sensitivity']))
    
    # 可视化
    m_weather = weather_analyzer.visualize_weather_impact(
        sensitivity_df,
        output_file='./test_output/weather_test.html'
    )
    print("   [OK] 天气影响地图创建成功")
    
except Exception as e:
    print("   [FAIL] 天气分析模块测试失败:", e)
    import traceback
    traceback.print_exc()

# 测试预测模块
print("\n7. 测试时间序列预测模块...")
try:
    predictor = TrafficPredictor(traffic_data, roads, intersections)
    
    # 准备时间序列
    ts_data = predictor.prepare_time_series(target_column='congestion_index')
    print("   [OK] 时间序列准备成功，数据点数量:", len(ts_data))
    
    # 分析季节性
    seasonality = predictor.analyze_seasonality(ts_data, 'congestion_index')
    print("   [OK] 季节性分析成功")
    
    # 简化预测
    forecast_df = predictor.predict_simple(ts_data, 'congestion_index', forecast_hours=12)
    print("   [OK] 简化预测成功，预测点数量:", len(forecast_df))
    
    # 明日高峰期预测
    prediction_result = predictor.predict_tomorrow_rush_hour(target_column='congestion_index')
    print("   [OK] 明日高峰期预测成功")
    
    # 按道路预测
    road_predictions = predictor.predict_by_road(forecast_hours=12)
    print("   [OK] 按道路预测成功，预测道路数量:", len(road_predictions))
    
    # 可视化
    if not road_predictions.empty:
        m_pred = predictor.visualize_predictions(
            road_predictions,
            output_file='./test_output/prediction_test.html'
        )
        print("   [OK] 预测结果地图创建成功")
    
except Exception as e:
    print("   [FAIL] 预测模块测试失败:", e)
    import traceback
    traceback.print_exc()

# 输出测试结果
print("\n" + "="*60)
print("测试完成！")
print("="*60)

# 列出生成的文件
test_output_dir = './test_output'
if os.path.exists(test_output_dir):
    files = os.listdir(test_output_dir)
    if files:
        print("\n生成的测试文件 (" + test_output_dir + "):")
        for f in sorted(files):
            print("  -", f)

print("\n系统功能测试通过！可以使用以下命令运行完整分析:")
print("  python main.py")
print("\n或使用快速模式:")
print("  python main.py --quick")
print("\n参数说明:")
print("  --intersections N : 设置路口数量（默认50）")
print("  --roads N         : 设置道路数量（默认100）")
print("  --days N          : 设置数据天数（默认30）")
print("  --output DIR      : 设置输出目录（默认./output）")
print("  --quick           : 快速模式（小规模数据）")
