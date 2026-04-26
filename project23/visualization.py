import pandas as pd
import numpy as np
import folium
from folium import plugins
from folium.plugins import HeatMap, HeatMapWithTime
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from typing import Dict, List, Tuple
from datetime import datetime, timedelta


class TrafficVisualizer:
    def __init__(self, intersections: pd.DataFrame, roads: pd.DataFrame, 
                 traffic_data: pd.DataFrame):
        self.intersections = intersections
        self.roads = roads
        self.traffic_data = traffic_data
        
        # 计算地图中心
        self.center_lat = intersections['latitude'].mean()
        self.center_lon = intersections['longitude'].mean()
        
        # 预合并道路和交通数据
        self.road_traffic = self._merge_road_traffic_data()
    
    def _merge_road_traffic_data(self) -> pd.DataFrame:
        """合并道路和交通数据"""
        # 首先合并道路起点信息
        road_with_start = pd.merge(
            self.roads,
            self.intersections[['intersection_id', 'latitude', 'longitude']],
            left_on='start_intersection',
            right_on='intersection_id',
            how='left'
        ).rename(columns={'latitude': 'start_lat', 'longitude': 'start_lon'})
        
        # 合并道路终点信息
        road_with_end = pd.merge(
            road_with_start,
            self.intersections[['intersection_id', 'latitude', 'longitude']],
            left_on='end_intersection',
            right_on='intersection_id',
            how='left',
            suffixes=('', '_end')
        ).rename(columns={'latitude': 'end_lat', 'longitude': 'end_lon'})
        
        # 合并交通数据
        road_traffic = pd.merge(
            self.traffic_data,
            road_with_end[['road_id', 'start_lat', 'start_lon', 'end_lat', 'end_lon', 
                          'type', 'length_km', 'speed_limit']],
            on='road_id',
            how='left'
        )
        
        return road_traffic
    
    def _get_congestion_color(self, congestion_index: float) -> str:
        """根据拥堵指数返回颜色"""
        if congestion_index < 2:
            return '#00FF00'  # 绿色 - 畅通
        elif congestion_index < 4:
            return '#90EE90'  # 浅绿 - 基本畅通
        elif congestion_index < 6:
            return '#FFFF00'  # 黄色 - 轻度拥堵
        elif congestion_index < 8:
            return '#FFA500'  # 橙色 - 中度拥堵
        else:
            return '#FF0000'  # 红色 - 严重拥堵
    
    def _get_speed_color(self, speed: float, speed_limit: float) -> str:
        """根据实际速度和限速返回颜色"""
        speed_ratio = speed / speed_limit
        if speed_ratio > 0.9:
            return '#00FF00'  # 绿色
        elif speed_ratio > 0.7:
            return '#90EE90'  # 浅绿
        elif speed_ratio > 0.5:
            return '#FFFF00'  # 黄色
        elif speed_ratio > 0.3:
            return '#FFA500'  # 橙色
        else:
            return '#FF0000'  # 红色
    
    def create_base_map(self) -> folium.Map:
        """创建基础地图"""
        m = folium.Map(
            location=[self.center_lat, self.center_lon],
            zoom_start=12,
            tiles='OpenStreetMap'
        )
        
        return m
    
    def add_intersections_to_map(self, m: folium.Map, 
                                   intersection_data: pd.DataFrame = None) -> folium.Map:
        """添加路口到地图"""
        if intersection_data is None:
            intersection_data = self.intersections
        
        for _, row in intersection_data.iterrows():
            # 根据重要性设置不同的标记
            importance_colors = {1: 'blue', 2: 'orange', 3: 'red'}
            color = importance_colors.get(row['importance'], 'blue')
            
            folium.CircleMarker(
                location=[row['latitude'], row['longitude']],
                radius=5 + row['importance'] * 2,
                popup=f"路口ID: {row['intersection_id']}<br>名称: {row['name']}<br>重要性: {row['importance']}",
                color=color,
                fill=True,
                fillColor=color,
                fillOpacity=0.7
            ).add_to(m)
        
        return m
    
    def add_roads_to_map(self, m: folium.Map, road_data: pd.DataFrame = None,
                          time_filter: Tuple[datetime, datetime] = None) -> folium.Map:
        """添加道路到地图，支持时间过滤"""
        if road_data is None:
            road_data = self.road_traffic
        
        # 如果指定了时间范围，过滤数据
        if time_filter:
            start_time, end_time = time_filter
            road_data = road_data[
                (road_data['timestamp'] >= start_time) & 
                (road_data['timestamp'] <= end_time)
            ]
            
            # 计算每条道路的平均拥堵指数
            road_stats = road_data.groupby('road_id').agg({
                'congestion_index': 'mean',
                'average_speed': 'mean',
                'start_lat': 'first',
                'start_lon': 'first',
                'end_lat': 'first',
                'end_lon': 'first',
                'type': 'first',
                'speed_limit': 'first'
            }).reset_index()
        else:
            # 使用所有数据的平均值
            road_stats = road_data.groupby('road_id').agg({
                'congestion_index': 'mean',
                'average_speed': 'mean',
                'start_lat': 'first',
                'start_lon': 'first',
                'end_lat': 'first',
                'end_lon': 'first',
                'type': 'first',
                'speed_limit': 'first'
            }).reset_index()
        
        # 绘制道路
        for _, row in road_stats.iterrows():
            # 获取道路颜色
            color = self._get_congestion_color(row['congestion_index'])
            
            # 根据道路类型设置线宽
            type_weights = {'主干道': 5, '次干道': 3, '支路': 2}
            weight = type_weights.get(row['type'], 3)
            
            # 添加道路线段
            folium.PolyLine(
                locations=[[row['start_lat'], row['start_lon']], 
                          [row['end_lat'], row['end_lon']]],
                color=color,
                weight=weight,
                opacity=0.8,
                popup=f"道路ID: {row['road_id']}<br>"
                      f"类型: {row['type']}<br>"
                      f"平均拥堵指数: {row['congestion_index']:.2f}<br>"
                      f"平均速度: {row['average_speed']:.2f} km/h<br>"
                      f"限速: {row['speed_limit']} km/h"
            ).add_to(m)
        
        return m
    
    def create_rush_hour_heatmap(self, date: datetime = None, 
                                   output_file: str = 'rush_hour_heatmap.html'):
        """
        创建早晚高峰时段的拥堵热力图
        
        参数:
            date: 指定日期，如果为None则使用所有工作日的平均数据
            output_file: 输出HTML文件路径
        """
        print("正在创建早晚高峰拥堵热力图...")
        
        # 定义早晚高峰时间范围
        morning_rush_start = 7  # 7:00
        morning_rush_end = 9    # 9:00
        evening_rush_start = 17 # 17:00
        evening_rush_end = 19   # 19:00
        
        # 过滤数据
        if date:
            # 特定日期
            date_str = date.date()
            morning_data = self.road_traffic[
                (self.road_traffic['timestamp'].dt.date == date_str) &
                (self.road_traffic['hour'] >= morning_rush_start) &
                (self.road_traffic['hour'] < morning_rush_end)
            ]
            
            evening_data = self.road_traffic[
                (self.road_traffic['timestamp'].dt.date == date_str) &
                (self.road_traffic['hour'] >= evening_rush_start) &
                (self.road_traffic['hour'] < evening_rush_end)
            ]
        else:
            # 所有工作日的平均数据
            weekday_data = self.road_traffic[~self.road_traffic['is_weekend']]
            
            morning_data = weekday_data[
                (weekday_data['hour'] >= morning_rush_start) &
                (weekday_data['hour'] < morning_rush_end)
            ]
            
            evening_data = weekday_data[
                (weekday_data['hour'] >= evening_rush_start) &
                (weekday_data['hour'] < evening_rush_end)
            ]
        
        # 计算平均拥堵指数
        def calculate_road_stats(data: pd.DataFrame) -> pd.DataFrame:
            if data.empty:
                return pd.DataFrame()
            
            return data.groupby('road_id').agg({
                'congestion_index': 'mean',
                'average_speed': 'mean',
                'start_lat': 'first',
                'start_lon': 'first',
                'end_lat': 'first',
                'end_lon': 'first',
                'type': 'first',
                'speed_limit': 'first'
            }).reset_index()
        
        morning_stats = calculate_road_stats(morning_data)
        evening_stats = calculate_road_stats(evening_data)
        
        # 创建两个地图：早高峰和晚高峰
        print("创建早高峰地图...")
        m_morning = self.create_base_map()
        m_morning = self.add_roads_to_map(m_morning, time_filter=None)
        if not morning_stats.empty:
            # 重新添加带有早高峰数据的道路
            for _, row in morning_stats.iterrows():
                color = self._get_congestion_color(row['congestion_index'])
                type_weights = {'主干道': 5, '次干道': 3, '支路': 2}
                weight = type_weights.get(row['type'], 3)
                
                folium.PolyLine(
                    locations=[[row['start_lat'], row['start_lon']], 
                              [row['end_lat'], row['end_lon']]],
                    color=color,
                    weight=weight,
                    opacity=0.8,
                    popup=f"道路ID: {row['road_id']}<br>"
                          f"类型: {row['type']}<br>"
                          f"早高峰平均拥堵指数: {row['congestion_index']:.2f}<br>"
                          f"早高峰平均速度: {row['average_speed']:.2f} km/h"
                ).add_to(m_morning)
        
        # 添加图例
        self._add_congestion_legend(m_morning, "早高峰拥堵热力图")
        
        print("创建晚高峰地图...")
        m_evening = self.create_base_map()
        if not evening_stats.empty:
            for _, row in evening_stats.iterrows():
                color = self._get_congestion_color(row['congestion_index'])
                type_weights = {'主干道': 5, '次干道': 3, '支路': 2}
                weight = type_weights.get(row['type'], 3)
                
                folium.PolyLine(
                    locations=[[row['start_lat'], row['start_lon']], 
                              [row['end_lat'], row['end_lon']]],
                    color=color,
                    weight=weight,
                    opacity=0.8,
                    popup=f"道路ID: {row['road_id']}<br>"
                          f"类型: {row['type']}<br>"
                          f"晚高峰平均拥堵指数: {row['congestion_index']:.2f}<br>"
                          f"晚高峰平均速度: {row['average_speed']:.2f} km/h"
                ).add_to(m_evening)
        
        self._add_congestion_legend(m_evening, "晚高峰拥堵热力图")
        
        # 保存地图
        morning_file = output_file.replace('.html', '_morning.html')
        evening_file = output_file.replace('.html', '_evening.html')
        
        m_morning.save(morning_file)
        m_evening.save(evening_file)
        
        print(f"早高峰热力图已保存到: {morning_file}")
        print(f"晚高峰热力图已保存到: {evening_file}")
        
        return m_morning, m_evening
    
    def create_time_series_heatmap(self, start_date: datetime, days: int = 1,
                                     output_file: str = 'time_series_heatmap.html'):
        """
        创建带动态时间轴的拥堵热力图
        
        参数:
            start_date: 开始日期
            days: 显示的天数
            output_file: 输出HTML文件路径
        """
        print("正在创建动态时间轴热力图...")
        
        # 过滤数据
        end_date = start_date + timedelta(days=days)
        time_filtered = self.road_traffic[
            (self.road_traffic['timestamp'] >= start_date) &
            (self.road_traffic['timestamp'] < end_date)
        ]
        
        if time_filtered.empty:
            print("警告：没有找到指定时间范围内的数据")
            return None
        
        # 获取唯一的时间点
        time_points = sorted(time_filtered['timestamp'].unique())
        
        # 准备每个时间点的热力数据
        heat_data = []
        time_labels = []
        
        for time_point in time_points:
            time_data = time_filtered[time_filtered['timestamp'] == time_point]
            
            # 收集该时间点的所有道路数据
            point_data = []
            for _, row in time_data.iterrows():
                # 使用起点坐标
                point_data.append([
                    row['start_lat'],
                    row['start_lon'],
                    row['congestion_index']  # 拥堵指数作为强度
                ])
                # 也可以添加终点
                point_data.append([
                    row['end_lat'],
                    row['end_lon'],
                    row['congestion_index']
                ])
            
            if point_data:
                heat_data.append(point_data)
                # 转换为 pandas Timestamp 以支持 strftime（兼容 numpy.datetime64）
                time_labels.append(pd.Timestamp(time_point).strftime('%Y-%m-%d %H:%M'))
        
        if not heat_data:
            print("警告：没有足够的数据创建热力图")
            return None
        
        # 创建地图
        m = self.create_base_map()
        
        # 创建HeatMapWithTime
        hm = HeatMapWithTime(
            heat_data,
            index=time_labels,
            auto_play=True,
            max_opacity=0.8,
            radius=15,
            gradient={0.2: 'green', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1: 'red'}
        )
        
        hm.add_to(m)
        
        # 添加图例
        self._add_congestion_legend(m, "动态时间轴拥堵热力图")
        
        # 保存地图
        m.save(output_file)
        print(f"动态时间轴热力图已保存到: {output_file}")
        
        return m
    
    def create_intersection_heatmap(self, output_file: str = 'intersection_heatmap.html'):
        """
        创建路口拥堵热力图
        """
        print("正在创建路口拥堵热力图...")
        
        # 计算每个路口的平均拥堵情况
        # 通过路口连接的道路来计算
        intersection_congestion = {}
        
        for _, row in self.intersections.iterrows():
            int_id = row['intersection_id']
            
            # 找到所有连接到该路口的道路
            connected_roads = self.roads[
                (self.roads['start_intersection'] == int_id) |
                (self.roads['end_intersection'] == int_id)
            ]
            
            if not connected_roads.empty:
                # 获取这些道路的拥堵数据
                road_ids = connected_roads['road_id'].tolist()
                road_traffic = self.road_traffic[self.road_traffic['road_id'].isin(road_ids)]
                
                if not road_traffic.empty:
                    avg_congestion = road_traffic['congestion_index'].mean()
                    intersection_congestion[int_id] = {
                        'lat': row['latitude'],
                        'lon': row['longitude'],
                        'congestion': avg_congestion,
                        'name': row['name']
                    }
        
        # 准备热力图数据
        heat_data = []
        for int_id, data in intersection_congestion.items():
            heat_data.append([data['lat'], data['lon'], data['congestion']])
        
        # 创建地图
        m = self.create_base_map()
        
        # 添加热力图层
        HeatMap(
            heat_data,
            min_opacity=0.3,
            max_val=10,
            radius=20,
            blur=15,
            gradient={0.2: 'green', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1: 'red'}
        ).add_to(m)
        
        # 添加路口标记
        for int_id, data in intersection_congestion.items():
            color = self._get_congestion_color(data['congestion'])
            
            folium.CircleMarker(
                location=[data['lat'], data['lon']],
                radius=8,
                popup=f"路口ID: {int_id}<br>"
                      f"名称: {data['name']}<br>"
                      f"平均拥堵指数: {data['congestion']:.2f}",
                color=color,
                fill=True,
                fillColor=color,
                fillOpacity=0.8
            ).add_to(m)
        
        # 添加图例
        self._add_congestion_legend(m, "路口拥堵热力图")
        
        # 保存地图
        m.save(output_file)
        print(f"路口热力图已保存到: {output_file}")
        
        return m
    
    def _add_congestion_legend(self, m: folium.Map, title: str):
        """添加拥堵图例到地图"""
        legend_html = f'''
        <div style="position: fixed; 
                    bottom: 50px; left: 50px; width: 180px; height: 180px; 
                    border:2px solid grey; z-index:9999; font-size:14px;
                    background-color:white;
                    padding: 10px;
                    border-radius: 5px;
                    opacity: 0.9;">
        <p style="margin-top: 0; margin-bottom: 10px; font-weight: bold;">{title}</p>
        <p><i class="fa fa-circle" style="color:#00FF00"></i>&nbsp; 畅通 (0-2)</p>
        <p><i class="fa fa-circle" style="color:#90EE90"></i>&nbsp; 基本畅通 (2-4)</p>
        <p><i class="fa fa-circle" style="color:#FFFF00"></i>&nbsp; 轻度拥堵 (4-6)</p>
        <p><i class="fa fa-circle" style="color:#FFA500"></i>&nbsp; 中度拥堵 (6-8)</p>
        <p><i class="fa fa-circle" style="color:#FF0000"></i>&nbsp; 严重拥堵 (8-10)</p>
        </div>
        '''
        
        m.get_root().html.add_child(folium.Element(legend_html))
    
    def create_summary_statistics(self) -> Dict:
        """创建汇总统计信息"""
        stats = {}
        
        # 整体拥堵情况
        stats['overall'] = {
            'mean_congestion': self.traffic_data['congestion_index'].mean(),
            'mean_speed': self.traffic_data['average_speed'].mean(),
            'mean_volume': self.traffic_data['vehicle_volume'].mean()
        }
        
        # 早晚高峰对比
        weekday_data = self.traffic_data[~self.traffic_data['is_weekend']]
        
        morning_rush = weekday_data[
            (weekday_data['hour'] >= 7) & (weekday_data['hour'] < 9)
        ]
        evening_rush = weekday_data[
            (weekday_data['hour'] >= 17) & (weekday_data['hour'] < 19)
        ]
        non_rush = weekday_data[
            ~((weekday_data['hour'] >= 7) & (weekday_data['hour'] < 9) |
              (weekday_data['hour'] >= 17) & (weekday_data['hour'] < 19))
        ]
        
        stats['rush_hour'] = {
            'morning': {
                'mean_congestion': morning_rush['congestion_index'].mean() if not morning_rush.empty else 0,
                'mean_speed': morning_rush['average_speed'].mean() if not morning_rush.empty else 0,
                'mean_volume': morning_rush['vehicle_volume'].mean() if not morning_rush.empty else 0
            },
            'evening': {
                'mean_congestion': evening_rush['congestion_index'].mean() if not evening_rush.empty else 0,
                'mean_speed': evening_rush['average_speed'].mean() if not evening_rush.empty else 0,
                'mean_volume': evening_rush['vehicle_volume'].mean() if not evening_rush.empty else 0
            },
            'non_rush': {
                'mean_congestion': non_rush['congestion_index'].mean() if not non_rush.empty else 0,
                'mean_speed': non_rush['average_speed'].mean() if not non_rush.empty else 0,
                'mean_volume': non_rush['vehicle_volume'].mean() if not non_rush.empty else 0
            }
        }
        
        # 工作日 vs 周末
        weekend_data = self.traffic_data[self.traffic_data['is_weekend']]
        
        stats['day_type'] = {
            'weekday': {
                'mean_congestion': weekday_data['congestion_index'].mean() if not weekday_data.empty else 0,
                'mean_speed': weekday_data['average_speed'].mean() if not weekday_data.empty else 0
            },
            'weekend': {
                'mean_congestion': weekend_data['congestion_index'].mean() if not weekend_data.empty else 0,
                'mean_speed': weekend_data['average_speed'].mean() if not weekend_data.empty else 0
            }
        }
        
        # 天气影响
        weather_stats = self.traffic_data.groupby('weather_type').agg({
            'congestion_index': 'mean',
            'average_speed': 'mean',
            'vehicle_volume': 'mean'
        }).round(2)
        
        stats['weather'] = weather_stats.to_dict('index')
        
        return stats


if __name__ == "__main__":
    # 测试可视化模块
    from data_generator import TrafficDataGenerator
    
    # 生成测试数据
    print("生成测试数据...")
    generator = TrafficDataGenerator(num_intersections=10, num_roads=20, days=3)
    intersections, roads, traffic_data, G = generator.generate_all_data()
    
    # 创建可视化器
    print("\n初始化可视化器...")
    visualizer = TrafficVisualizer(intersections, roads, traffic_data)
    
    # 创建早晚高峰热力图
    print("\n创建早晚高峰热力图...")
    m_morning, m_evening = visualizer.create_rush_hour_heatmap()
    
    # 创建动态时间轴热力图
    print("\n创建动态时间轴热力图...")
    start_date = datetime(2024, 1, 1, 6, 0)
    m_time = visualizer.create_time_series_heatmap(start_date, days=1)
    
    # 创建路口热力图
    print("\n创建路口热力图...")
    m_intersection = visualizer.create_intersection_heatmap()
    
    # 打印统计信息
    print("\n统计信息:")
    stats = visualizer.create_summary_statistics()
    import json
    print(json.dumps(stats, indent=2, default=str))
