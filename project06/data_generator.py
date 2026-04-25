import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_ecommerce_data(num_records=100000, start_date='2024-01-01', end_date='2024-03-31'):
    """
    生成电商用户行为模拟数据集
    
    字段:
    - user_id: 用户ID
    - product_id: 商品ID
    - behavior_type: 行为类型 (浏览/收藏/加购/购买)
    - timestamp: 时间戳
    - category: 商品类别
    """
    
    start_dt = datetime.strptime(start_date, '%Y-%m-%d')
    end_dt = datetime.strptime(end_date, '%Y-%m-%d')
    total_days = (end_dt - start_dt).days + 1
    
    num_users = min(5000, int(num_records * 0.1))
    num_products = min(10000, int(num_records * 0.05))
    
    categories = [
        '电子产品', '服装鞋帽', '家居用品', '食品饮料', 
        '美妆护肤', '运动户外', '图书文具', '母婴用品'
    ]
    
    products = []
    for i in range(num_products):
        product_id = f'P{100000 + i}'
        category = random.choice(categories)
        products.append({'product_id': product_id, 'category': category})
    products_df = pd.DataFrame(products)
    
    behavior_weights = {
        '浏览': 60,
        '收藏': 15,
        '加购': 18,
        '购买': 7
    }
    behavior_types = list(behavior_weights.keys())
    behavior_prob = [v / sum(behavior_weights.values()) for v in behavior_weights.values()]
    
    data = []
    
    for _ in range(num_records):
        user_id = f'U{100000 + random.randint(0, num_users - 1)}'
        
        product_idx = random.randint(0, num_products - 1)
        product_row = products_df.iloc[product_idx]
        product_id = product_row['product_id']
        category = product_row['category']
        
        behavior_type = np.random.choice(behavior_types, p=behavior_prob)
        
        random_days = random.randint(0, total_days - 1)
        random_seconds = random.randint(0, 24 * 60 * 60 - 1)
        timestamp = start_dt + timedelta(days=random_days, seconds=random_seconds)
        
        data.append({
            'user_id': user_id,
            'product_id': product_id,
            'behavior_type': behavior_type,
            'timestamp': timestamp,
            'category': category
        })
    
    df = pd.DataFrame(data)
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    return df

def add_purchase_price(df, min_price=10, max_price=5000):
    """
    为购买行为添加商品价格（用于RFM分析中的Monetary）
    """
    category_price_ranges = {
        '电子产品': (500, 5000),
        '服装鞋帽': (50, 500),
        '家居用品': (100, 2000),
        '食品饮料': (10, 200),
        '美妆护肤': (50, 1000),
        '运动户外': (100, 3000),
        '图书文具': (10, 200),
        '母婴用品': (50, 1000)
    }
    
    prices = []
    for _, row in df.iterrows():
        if row['behavior_type'] == '购买':
            price_range = category_price_ranges.get(row['category'], (min_price, max_price))
            price = round(random.uniform(price_range[0], price_range[1]), 2)
        else:
            price = np.nan
        prices.append(price)
    
    df['price'] = prices
    return df

if __name__ == '__main__':
    print('正在生成模拟数据...')
    df = generate_ecommerce_data(num_records=120000, start_date='2024-01-01', end_date='2024-03-31')
    df = add_purchase_price(df)
    
    print(f'数据生成完成，共 {len(df)} 条记录')
    print(f'\n数据预览:')
    print(df.head(10))
    
    print(f'\n行为类型分布:')
    print(df['behavior_type'].value_counts())
    
    print(f'\n商品类别分布:')
    print(df['category'].value_counts())
    
    print(f'\n时间范围:')
    print(f'开始: {df["timestamp"].min()}')
    print(f'结束: {df["timestamp"].max()}')
    
    df.to_csv('ecommerce_data.csv', index=False, encoding='utf-8-sig')
    print('\n数据已保存到 ecommerce_data.csv')
