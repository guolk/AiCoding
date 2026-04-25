import pandas as pd
import numpy as np
from datetime import datetime

print('=' * 60)
print('模块测试脚本')
print('=' * 60)

print('\n1. 加载数据...')
df = pd.read_csv('ecommerce_data.csv', parse_dates=['timestamp'], encoding='utf-8-sig')
print(f'   数据加载成功，共 {len(df)} 条记录')
print(f'   列名: {list(df.columns)}')
print(f'   时间范围: {df["timestamp"].min()} 至 {df["timestamp"].max()}')

print('\n2. 测试RFM分析模块...')
from rfm_analysis import calculate_rfm, rfm_segmentation, get_rfm_statistics

purchase_df = df[df['behavior_type'] == '购买']
print(f'   购买记录数: {len(purchase_df)}')

rfm_df = calculate_rfm(purchase_df)
print(f'   RFM计算成功，用户数: {len(rfm_df)}')
print(f'   RFM数据预览:')
print(rfm_df.head())

rfm_df = rfm_segmentation(rfm_df)
print(f'\n   RFM分段成功')
print(f'   分段分布:')
print(rfm_df['RFM_segment'].value_counts())

stats = get_rfm_statistics(rfm_df)
print(f'\n   RFM统计信息:')
print(f'   总用户数: {stats["total_users"]}')
print(f'   平均最近购买天数: {stats["avg_recency"]}')
print(f'   平均购买频率: {stats["avg_frequency"]}')
print(f'   平均购买金额: {stats["avg_monetary"]}')

print('\n3. 测试协同过滤推荐模块...')
from recommendation import CollaborativeFilteringRecommender

recommender = CollaborativeFilteringRecommender(n_similar_users=10, n_recommendations=5)
recommender.fit(df)
print(f'   推荐模型训练成功')
print(f'   用户数: {len(recommender.get_all_users())}')
print(f'   商品数: {len(recommender.products)}')

test_user = recommender.get_all_users()[0]
print(f'\n   测试用户: {test_user}')

history = recommender.get_user_behavior_history(test_user, df)
if not history.empty:
    print(f'   用户行为历史:')
    print(history)
else:
    print(f'   该用户无行为历史')

recommendations = recommender.get_recommendations(test_user)
print(f'\n   推荐商品:')
for i, rec in enumerate(recommendations):
    print(f'   {i+1}. {rec["product_id"]} ({rec["category"]}) - 分数: {rec["score"]}')

print('\n' + '=' * 60)
print('所有模块测试通过！')
print('=' * 60)
