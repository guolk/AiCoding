#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单测试脚本 - 验证依赖和基本功能
"""

import sys

# 设置控制台编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

print("测试1: 导入基础依赖...")
try:
    import pandas as pd
    import numpy as np
    import networkx as nx
    import folium
    print("  [OK] pandas, numpy, networkx, folium 导入成功")
    print("  pandas版本:", pd.__version__)
    print("  numpy版本:", np.__version__)
    print("  networkx版本:", nx.__version__)
    print("  folium版本:", folium.__version__)
except ImportError as e:
    print("  [FAIL] 导入失败:", e)
    sys.exit(1)

print("\n测试2: 导入statsmodels并测试SARIMAX API...")
try:
    import statsmodels.api as sm
    from statsmodels.tsa.statespace.sarimax import SARIMAX
    print("  [OK] statsmodels导入成功")
    print("  statsmodels版本:", sm.__version__)
    
    # 测试SARIMAX基本功能
    print("\n  创建测试数据...")
    np.random.seed(42)
    test_data = pd.Series(np.random.randn(100), index=pd.date_range('2024-01-01', periods=100, freq='H'))
    
    print("  创建SARIMAX模型...")
    model = SARIMAX(test_data, order=(1, 0, 0), seasonal_order=(0, 0, 0, 0))
    
    print("  拟合模型...")
    results = model.fit(disp=False)
    print("  [OK] 模型拟合成功")
    
    # 测试预测API
    print("\n  测试预测API...")
    try:
        # 尝试使用get_forecast
        forecast = results.get_forecast(steps=5)
        print("  [OK] get_forecast API可用")
        print("  预测值:", forecast.predicted_mean.values)
    except AttributeError as e:
        print("  [WARN] get_forecast不可用:", e)
        # 尝试使用forecast方法
        try:
            forecast_values = results.forecast(steps=5)
            print("  [OK] 使用forecast API替代")
            print("  预测值:", forecast_values.values)
        except Exception as e2:
            print("  [FAIL] 预测API都不可用:", e2)
            
except ImportError as e:
    print("  [WARN] statsmodels导入失败:", e)
    print("  将使用简化预测方法")

print("\n测试3: 导入自定义模块...")
try:
    from data_generator import TrafficDataGenerator
    print("  [OK] data_generator导入成功")
except ImportError as e:
    print("  [FAIL] data_generator导入失败:", e)
    sys.exit(1)

try:
    from visualization import TrafficVisualizer
    print("  [OK] visualization导入成功")
except ImportError as e:
    print("  [FAIL] visualization导入失败:", e)
    sys.exit(1)

try:
    from network_analysis import NetworkAnalyzer
    print("  [OK] network_analysis导入成功")
except ImportError as e:
    print("  [FAIL] network_analysis导入失败:", e)
    sys.exit(1)

try:
    from weather_analysis import WeatherAnalyzer
    print("  [OK] weather_analysis导入成功")
except ImportError as e:
    print("  [FAIL] weather_analysis导入失败:", e)
    sys.exit(1)

try:
    from time_series_prediction import TrafficPredictor
    print("  [OK] time_series_prediction导入成功")
except ImportError as e:
    print("  [FAIL] time_series_prediction导入失败:", e)
    sys.exit(1)

print("\n" + "="*60)
print("所有基础测试通过！")
print("="*60)
print("\n现在可以运行完整测试:")
print("  python test_system.py  - 运行功能测试")
print("  python main.py        - 运行完整分析")
