import pandas as pd
import numpy as np
from datetime import datetime

def calculate_rfm(df, reference_date=None):
    """
    计算用户RFM指标
    R: Recency - 最近一次购买距离现在的天数
    F: Frequency - 购买频率（购买次数）
    M: Monetary - 购买总金额
    """
    if reference_date is None:
        reference_date = df['timestamp'].max()
    
    purchase_df = df[df['behavior_type'] == '购买'].copy()
    
    if len(purchase_df) == 0:
        return pd.DataFrame()
    
    purchase_df['days_since_purchase'] = (reference_date - purchase_df['timestamp']).dt.days
    
    rfm = purchase_df.groupby('user_id').agg({
        'days_since_purchase': 'min',
        'product_id': 'count',
        'price': 'sum'
    }).reset_index()
    
    rfm.columns = ['user_id', 'R', 'F', 'M']
    
    return rfm

def rfm_segmentation(rfm_df):
    """
    RFM分层分析
    将用户分为不同的价值群体
    """
    if rfm_df.empty:
        return rfm_df
    
    rfm_df = rfm_df.copy()
    
    r_labels = [4, 3, 2, 1]
    f_labels = [1, 2, 3, 4]
    m_labels = [1, 2, 3, 4]
    
    rfm_df['R_score'] = pd.qcut(rfm_df['R'], q=4, labels=r_labels, duplicates='drop')
    rfm_df['F_score'] = pd.qcut(rfm_df['F'].rank(method='first'), q=4, labels=f_labels, duplicates='drop')
    rfm_df['M_score'] = pd.qcut(rfm_df['M'].rank(method='first'), q=4, labels=m_labels, duplicates='drop')
    
    rfm_df['R_score'] = rfm_df['R_score'].astype(int)
    rfm_df['F_score'] = rfm_df['F_score'].astype(int)
    rfm_df['M_score'] = rfm_df['M_score'].astype(int)
    
    rfm_df['RFM_segment'] = rfm_df.apply(_assign_segment, axis=1)
    
    return rfm_df

def _assign_segment(row):
    """
    根据RFM分数分配用户分段
    """
    r, f, m = row['R_score'], row['F_score'], row['M_score']
    
    if r == 4 and f >= 3 and m >= 3:
        return '重要价值用户'
    elif r == 4 and f <= 2 and m <= 2:
        return '新用户'
    elif r <= 2 and f >= 3 and m >= 3:
        return '重要挽留用户'
    elif r == 3 and f >= 3 and m >= 3:
        return '重要发展用户'
    elif r == 4 and f >= 2 and m <= 2:
        return '一般价值用户'
    elif r <= 2 and f <= 2:
        return '流失用户'
    elif f >= 3 and r <= 2:
        return '重要沉睡用户'
    else:
        return '一般用户'

def get_rfm_statistics(rfm_df):
    """
    获取RFM统计信息
    """
    if rfm_df.empty:
        return {}
    
    stats = {
        'total_users': len(rfm_df),
        'avg_recency': round(rfm_df['R'].mean(), 2),
        'avg_frequency': round(rfm_df['F'].mean(), 2),
        'avg_monetary': round(rfm_df['M'].mean(), 2),
        'segment_distribution': rfm_df['RFM_segment'].value_counts().to_dict()
    }
    
    return stats
