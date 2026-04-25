import pandas as pd
import numpy as np
from collections import defaultdict

class CollaborativeFilteringRecommender:
    """
    基于用户的协同过滤推荐系统
    使用用户-商品交互矩阵进行推荐
    """
    
    def __init__(self, n_similar_users=10, n_recommendations=5):
        self.n_similar_users = n_similar_users
        self.n_recommendations = n_recommendations
        self.user_item_matrix = None
        self.user_similarity = None
        self.users = None
        self.products = None
        self.product_info = None
        
    def fit(self, df):
        """
        训练推荐模型
        df: 包含user_id, product_id, behavior_type, category的DataFrame
        """
        behavior_weights = {
            '浏览': 1,
            '收藏': 2,
            '加购': 3,
            '购买': 5
        }
        
        df = df.copy()
        df['behavior_score'] = df['behavior_type'].map(behavior_weights)
        
        self.product_info = df[['product_id', 'category']].drop_duplicates()
        self.product_info = self.product_info.set_index('product_id')['category'].to_dict()
        
        user_product_scores = df.groupby(['user_id', 'product_id'])['behavior_score'].sum().reset_index()
        
        self.users = sorted(user_product_scores['user_id'].unique())
        self.products = sorted(user_product_scores['product_id'].unique())
        
        user_idx = {user: i for i, user in enumerate(self.users)}
        product_idx = {product: i for i, product in enumerate(self.products)}
        
        self.user_item_matrix = np.zeros((len(self.users), len(self.products)))
        
        for _, row in user_product_scores.iterrows():
            u = user_idx[row['user_id']]
            p = product_idx[row['product_id']]
            self.user_item_matrix[u, p] = row['behavior_score']
        
        self.user_similarity = self._cosine_similarity(self.user_item_matrix)
        
        self.user_idx = user_idx
        self.product_idx = product_idx
        self.idx_product = {i: p for p, i in product_idx.items()}
        
    def _cosine_similarity(self, matrix):
        """
        计算余弦相似度
        """
        norm = np.sqrt(np.sum(matrix ** 2, axis=1, keepdims=True))
        norm[norm == 0] = 1
        normalized = matrix / norm
        similarity = normalized @ normalized.T
        return similarity
    
    def get_recommendations(self, user_id, exclude_purchased=True):
        """
        为指定用户生成推荐
        """
        if user_id not in self.user_idx:
            return []
        
        user_idx = self.user_idx[user_id]
        
        similar_users = np.argsort(self.user_similarity[user_idx])[::-1][1:self.n_similar_users + 1]
        
        user_ratings = self.user_item_matrix[user_idx]
        
        scores = np.zeros(len(self.products))
        weights_sum = 0
        
        for similar_user in similar_users:
            similarity = self.user_similarity[user_idx, similar_user]
            if similarity > 0:
                scores += similarity * self.user_item_matrix[similar_user]
                weights_sum += similarity
        
        if weights_sum > 0:
            scores = scores / weights_sum
        
        if exclude_purchased:
            interacted_items = np.where(user_ratings > 0)[0]
            scores[interacted_items] = -1
        
        top_indices = np.argsort(scores)[::-1][:self.n_recommendations]
        
        recommendations = []
        for idx in top_indices:
            if scores[idx] > 0:
                product_id = self.idx_product[idx]
                recommendations.append({
                    'product_id': product_id,
                    'category': self.product_info.get(product_id, '未知'),
                    'score': round(float(scores[idx]), 4)
                })
        
        return recommendations
    
    def get_user_behavior_history(self, user_id, df):
        """
        获取用户的历史行为记录
        """
        user_history = df[df['user_id'] == user_id].copy()
        
        if user_history.empty:
            return pd.DataFrame()
        
        behavior_summary = user_history.groupby(['product_id', 'category', 'behavior_type']).agg({
            'timestamp': 'count'
        }).reset_index()
        
        behavior_summary.columns = ['product_id', 'category', 'behavior_type', 'count']
        
        pivot = behavior_summary.pivot_table(
            index=['product_id', 'category'],
            columns='behavior_type',
            values='count',
            fill_value=0
        ).reset_index()
        
        return pivot
    
    def get_all_users(self):
        """
        获取所有用户ID列表
        """
        return self.users if self.users else []
