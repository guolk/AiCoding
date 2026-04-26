import pandas as pd
import numpy as np
import networkx as nx
from datetime import datetime, timedelta
from typing import Tuple, List, Dict
import random

class TrafficDataGenerator:
    def __init__(self, num_intersections: int = 50, num_roads: int = 100, days: int = 30):
        self.num_intersections = num_intersections
        self.num_roads = num_roads
        self.days = days
        self.center_lat = 39.9042  # 北京中心纬度
        self.center_lon = 116.4074  # 北京中心经度
        
    def generate_intersections(self) -> pd.DataFrame:
        """生成50个路口数据"""
        intersections = []
        for i in range(self.num_intersections):
            # 在中心附近随机生成路口坐标
            lat = self.center_lat + np.random.uniform(-0.05, 0.05)
            lon = self.center_lon + np.random.uniform(-0.05, 0.05)
            
            # 为一些路口设置更高的重要性（作为可能的瓶颈）
            importance = np.random.choice([1, 2, 3], p=[0.5, 0.35, 0.15])
            
            intersections.append({
                'intersection_id': f'INT{i:03d}',
                'name': f'路口{i+1}',
                'latitude': lat,
                'longitude': lon,
                'importance': importance
            })
        
        return pd.DataFrame(intersections)
    
    def generate_roads(self, intersections: pd.DataFrame) -> Tuple[pd.DataFrame, nx.Graph]:
        """生成100条道路数据，并构建路网图"""
        roads = []
        G = nx.Graph()
        
        # 将所有路口添加到图中
        for _, row in intersections.iterrows():
            G.add_node(row['intersection_id'], 
                      latitude=row['latitude'],
                      longitude=row['longitude'],
                      importance=row['importance'])
        
        # 生成道路，优先连接重要性高的路口
        intersection_ids = intersections['intersection_id'].tolist()
        importance_dict = dict(zip(intersections['intersection_id'], intersections['importance']))
        
        road_count = 0
        # 首先确保图是连通的
        while road_count < self.num_roads:
            # 根据重要性加权选择路口
            weights = [importance_dict[node] for node in intersection_ids]
            total_weight = sum(weights)
            probs = [w/total_weight for w in weights]
            
            # 选择起点和终点
            start_idx = np.random.choice(len(intersection_ids), p=probs)
            end_idx = np.random.choice(len(intersection_ids), p=probs)
            
            if start_idx == end_idx:
                continue
                
            start_id = intersection_ids[start_idx]
            end_id = intersection_ids[end_idx]
            
            # 检查是否已存在这条道路
            if G.has_edge(start_id, end_id):
                continue
            
            # 计算两点之间的距离（简化版，用于道路长度）
            start_lat = intersections.loc[intersections['intersection_id'] == start_id, 'latitude'].values[0]
            start_lon = intersections.loc[intersections['intersection_id'] == start_id, 'longitude'].values[0]
            end_lat = intersections.loc[intersections['intersection_id'] == end_id, 'latitude'].values[0]
            end_lon = intersections.loc[intersections['intersection_id'] == end_id, 'longitude'].values[0]
            
            # 简化的距离计算（近似公里数）
            distance = np.sqrt((end_lat - start_lat)**2 + (end_lon - start_lon)**2) * 111  # 大约1度=111公里
            
            # 道路类型和限速
            road_type = np.random.choice(['主干道', '次干道', '支路'], p=[0.4, 0.4, 0.2])
            speed_limit = {'主干道': 60, '次干道': 40, '支路': 30}[road_type]
            
            # 添加到道路数据
            roads.append({
                'road_id': f'RD{road_count:03d}',
                'start_intersection': start_id,
                'end_intersection': end_id,
                'name': f'{intersections.loc[intersections["intersection_id"] == start_id, "name"].values[0]}-{intersections.loc[intersections["intersection_id"] == end_id, "name"].values[0]}路',
                'type': road_type,
                'length_km': round(distance, 3),
                'speed_limit': speed_limit
            })
            
            # 添加到图中
            G.add_edge(start_id, end_id, 
                      road_id=f'RD{road_count:03d}',
                      length=distance,
                      type=road_type,
                      speed_limit=speed_limit)
            
            road_count += 1
        
        # 确保图是连通的
        if not nx.is_connected(G):
            # 获取连通分量
            components = list(nx.connected_components(G))
            # 连接各个分量
            for i in range(1, len(components)):
                # 从第一个分量和当前分量中各选一个节点
                node1 = list(components[0])[0]
                node2 = list(components[i])[0]
                
                if not G.has_edge(node1, node2):
                    # 计算距离
                    start_lat = intersections.loc[intersections['intersection_id'] == node1, 'latitude'].values[0]
                    start_lon = intersections.loc[intersections['intersection_id'] == node1, 'longitude'].values[0]
                    end_lat = intersections.loc[intersections['intersection_id'] == node2, 'latitude'].values[0]
                    end_lon = intersections.loc[intersections['intersection_id'] == node2, 'longitude'].values[0]
                    
                    distance = np.sqrt((end_lat - start_lat)**2 + (end_lon - start_lon)**2) * 111
                    
                    road_type = np.random.choice(['主干道', '次干道'], p=[0.6, 0.4])
                    speed_limit = {'主干道': 60, '次干道': 40}[road_type]
                    
                    roads.append({
                        'road_id': f'RD{road_count:03d}',
                        'start_intersection': node1,
                        'end_intersection': node2,
                        'name': f'{intersections.loc[intersections["intersection_id"] == node1, "name"].values[0]}-{intersections.loc[intersections["intersection_id"] == node2, "name"].values[0]}路',
                        'type': road_type,
                        'length_km': round(distance, 3),
                        'speed_limit': speed_limit
                    })
                    
                    G.add_edge(node1, node2,
                              road_id=f'RD{road_count:03d}',
                              length=distance,
                              type=road_type,
                              speed_limit=speed_limit)
                    
                    road_count += 1
        
        return pd.DataFrame(roads), G
    
    def generate_weather_data(self, start_date: datetime, days: int) -> pd.DataFrame:
        """生成天气数据"""
        weather_records = []
        
        for day in range(days):
            current_date = start_date + timedelta(days=day)
            
            # 每天的天气类型（简化）
            weather_type = np.random.choice(['晴天', '多云', '小雨', '中雨', '大雨', '小雪', '中雪'],
                                            p=[0.4, 0.3, 0.1, 0.08, 0.04, 0.05, 0.03])
            
            # 天气对速度的影响因子（0.4-1.0）
            speed_factor = {
                '晴天': 1.0,
                '多云': 0.95,
                '小雨': 0.85,
                '中雨': 0.75,
                '大雨': 0.6,
                '小雪': 0.8,
                '中雪': 0.65
            }[weather_type]
            
            weather_records.append({
                'date': current_date.date(),
                'weather_type': weather_type,
                'speed_factor': speed_factor,
                'temperature': np.random.uniform(-10, 35)  # 温度范围
            })
        
        return pd.DataFrame(weather_records)
    
    def generate_traffic_data(self, roads: pd.DataFrame, start_date: datetime) -> pd.DataFrame:
        """生成交通流量数据（每15分钟，30天）"""
        traffic_records = []
        
        # 生成天气数据
        weather_df = self.generate_weather_data(start_date, self.days)
        
        # 为每条道路生成时间序列数据
        for _, road in roads.iterrows():
            road_id = road['road_id']
            speed_limit = road['speed_limit']
            road_type = road['type']
            
            # 基础车流量（根据道路类型）
            base_volume = {
                '主干道': 800,
                '次干道': 500,
                '支路': 200
            }[road_type]
            
            for day in range(self.days):
                current_date = start_date + timedelta(days=day)
                is_weekend = current_date.weekday() >= 5  # 周六周日为周末
                
                # 获取当天的天气因子
                speed_factor = weather_df.loc[weather_df['date'] == current_date.date(), 'speed_factor'].values[0]
                weather_type = weather_df.loc[weather_df['date'] == current_date.date(), 'weather_type'].values[0]
                
                for hour in range(24):
                    for minute in [0, 15, 30, 45]:
                        timestamp = datetime(current_date.year, current_date.month, current_date.day, hour, minute)
                        
                        # 时间因子（早晚高峰）
                        time_of_day = hour + minute / 60
                        
                        if is_weekend:
                            # 周末模式：中午12点和晚上6点左右高峰
                            if 10 <= time_of_day <= 14:  # 中午高峰
                                time_factor = 1.5
                            elif 16 <= time_of_day <= 20:  # 晚上高峰
                                time_factor = 1.3
                            else:
                                time_factor = 0.7
                        else:
                            # 工作日模式：早晚高峰
                            if 7 <= time_of_day <= 9:  # 早高峰
                                time_factor = 2.0
                            elif 17 <= time_of_day <= 19:  # 晚高峰
                                time_factor = 1.8
                            elif 11 <= time_of_day <= 13:  # 午间
                                time_factor = 1.2
                            elif 6 <= time_of_day < 7 or 9 < time_of_day <= 11 or 13 < time_of_day <= 17 or 19 < time_of_day <= 21:
                                time_factor = 1.0
                            else:  # 夜间
                                time_factor = 0.3
                        
                        # 随机波动
                        random_factor = np.random.normal(1, 0.1)
                        
                        # 计算实际车流量
                        volume = int(base_volume * time_factor * random_factor)
                        volume = max(0, volume)
                        
                        # 计算平均速度（与车流量成反比，并考虑天气和限速）
                        # 当车流量增加时，速度下降
                        congestion_ratio = volume / (base_volume * 2)  # 相对拥堵程度
                        congestion_ratio = min(1, max(0, congestion_ratio))
                        
                        # 速度计算：基础速度 * 天气因子 * (1 - 拥堵影响)
                        base_speed = speed_limit * 0.9  # 正常行驶速度略低于限速
                        speed = base_speed * speed_factor * (1 - 0.6 * congestion_ratio)
                        speed = max(5, min(speed_limit * 1.1, speed))  # 速度范围
                        
                        # 拥堵指数（0-10，越高越拥堵）
                        # 基于速度和车流量的综合指标
                        speed_ratio = speed / speed_limit
                        volume_ratio = volume / (base_volume * 2)
                        
                        congestion_index = 10 * (0.5 * (1 - speed_ratio) + 0.5 * volume_ratio)
                        congestion_index = max(0, min(10, congestion_index))
                        
                        # 添加到记录
                        traffic_records.append({
                            'timestamp': timestamp,
                            'road_id': road_id,
                            'vehicle_volume': volume,
                            'average_speed': round(speed, 2),
                            'congestion_index': round(congestion_index, 2),
                            'weather_type': weather_type,
                            'is_weekend': is_weekend,
                            'hour': hour,
                            'minute': minute
                        })
        
        return pd.DataFrame(traffic_records)
    
    def generate_all_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, nx.Graph]:
        """生成所有数据"""
        print("正在生成路口数据...")
        intersections = self.generate_intersections()
        
        print("正在生成道路数据...")
        roads, G = self.generate_roads(intersections)
        
        print("正在生成交通流量数据...")
        start_date = datetime(2024, 1, 1)
        traffic_data = self.generate_traffic_data(roads, start_date)
        
        print(f"数据生成完成：")
        print(f"  - 路口数量：{len(intersections)}")
        print(f"  - 道路数量：{len(roads)}")
        print(f"  - 交通记录数量：{len(traffic_data)}")
        
        return intersections, roads, traffic_data, G
    
    def save_data(self, intersections: pd.DataFrame, roads: pd.DataFrame, 
                  traffic_data: pd.DataFrame, output_dir: str = './data'):
        """保存数据到文件"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"正在保存数据到 {output_dir}...")
        
        intersections.to_csv(f'{output_dir}/intersections.csv', index=False)
        roads.to_csv(f'{output_dir}/roads.csv', index=False)
        
        # 交通数据较大，可以分块保存或使用压缩
        traffic_data.to_csv(f'{output_dir}/traffic_data.csv', index=False)
        
        print("数据保存完成！")
        
        # 打印数据统计
        print("\n数据统计：")
        print(f"路口数量：{len(intersections)}")
        print(f"道路数量：{len(roads)}")
        print(f"交通记录数量：{len(traffic_data)}")
        print(f"时间范围：{traffic_data['timestamp'].min()} 到 {traffic_data['timestamp'].max()}")
        print(f"天气类型分布：\n{traffic_data['weather_type'].value_counts()}")


if __name__ == "__main__":
    # 测试数据生成
    generator = TrafficDataGenerator(num_intersections=50, num_roads=100, days=30)
    intersections, roads, traffic_data, G = generator.generate_all_data()
    
    # 保存数据
    generator.save_data(intersections, roads, traffic_data)
    
    # 打印一些样本数据
    print("\n路口数据样本：")
    print(intersections.head())
    
    print("\n道路数据样本：")
    print(roads.head())
    
    print("\n交通数据样本：")
    print(traffic_data.head())
