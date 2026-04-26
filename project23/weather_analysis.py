import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import folium
from visualization import TrafficVisualizer
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # 非交互式后端


class WeatherAnalyzer:
    def __init__(self, traffic_data: pd.DataFrame, roads: pd.DataFrame,
                 intersections: pd.DataFrame):
        self.traffic_data = traffic_data
        self.roads = roads
        self.intersections = intersections
        
        # 预合并数据
        self.road_traffic = self._merge_data()
        
        # 定义天气类型及其影响
        self.weather_types = ['晴天', '多云', '小雨', '中雨', '大雨', '小雪', '中雪']
        self.weather_severity = {
            '晴天': 0,
            '多云': 1,
            '小雨': 2,
            '中雨': 3,
            '大雨': 4,
            '小雪': 3,
            '中雪': 5
        }
    
    def _merge_data(self) -> pd.DataFrame:
        """合并交通数据和道路数据"""
        # 合并道路起点信息
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
    
    def analyze_weather_impact_overall(self) -> pd.DataFrame:
        """
        分析不同天气对整体交通的影响
        
        返回:
            按天气类型分组的统计DataFrame
        """
        print("正在分析天气对整体交通的影响...")
        
        # 按天气类型分组统计
        weather_stats = self.road_traffic.groupby('weather_type').agg({
            'average_speed': ['mean', 'std', 'min', 'max'],
            'congestion_index': ['mean', 'std', 'min', 'max'],
            'vehicle_volume': ['mean', 'std'],
            'speed_limit': 'first'
        }).round(2)
        
        # 展平列名
        weather_stats.columns = ['_'.join(col).strip() for col in weather_stats.columns.values]
        weather_stats = weather_stats.reset_index()
        
        # 相对于晴天的影响比例
        sunny_stats = weather_stats[weather_stats['weather_type'] == '晴天'].iloc[0]
        
        weather_stats['speed_vs_sunny'] = weather_stats['average_speed_mean'] / sunny_stats['average_speed_mean']
        weather_stats['congestion_vs_sunny'] = weather_stats['congestion_index_mean'] / sunny_stats['congestion_index_mean']
        
        # 添加严重程度排序
        weather_stats['severity'] = weather_stats['weather_type'].map(self.weather_severity)
        weather_stats = weather_stats.sort_values('severity')
        
        print("\n=== 不同天气条件下的交通统计 ===")
        for _, row in weather_stats.iterrows():
            print(f"\n{row['weather_type']}:")
            print(f"  平均速度: {row['average_speed_mean']:.2f} km/h (相对于晴天: {row['speed_vs_sunny']:.1%})")
            print(f"  平均拥堵指数: {row['congestion_index_mean']:.2f} (相对于晴天: {row['congestion_vs_sunny']:.1%})")
            print(f"  平均车流量: {row['vehicle_volume_mean']:.0f} 辆/15分钟")
        
        return weather_stats
    
    def analyze_weather_impact_by_road_type(self) -> pd.DataFrame:
        """
        分析不同天气对不同类型道路的影响差异
        
        返回:
            按天气类型和道路类型分组的统计DataFrame
        """
        print("\n正在分析天气对不同类型道路的影响...")
        
        # 按天气类型和道路类型分组
        road_type_stats = self.road_traffic.groupby(['weather_type', 'type']).agg({
            'average_speed': 'mean',
            'congestion_index': 'mean',
            'vehicle_volume': 'mean',
            'speed_limit': 'first'
        }).round(2)
        
        road_type_stats = road_type_stats.reset_index()
        
        # 计算相对于晴天的影响
        sunny_by_type = road_type_stats[road_type_stats['weather_type'] == '晴天'].set_index('type')
        
        def calc_vs_sunny(row):
            sunny_speed = sunny_by_type.loc[row['type'], 'average_speed']
            sunny_congestion = sunny_by_type.loc[row['type'], 'congestion_index']
            return pd.Series({
                'speed_vs_sunny': row['average_speed'] / sunny_speed,
                'congestion_vs_sunny': row['congestion_index'] / sunny_congestion
            })
        
        road_type_stats[['speed_vs_sunny', 'congestion_vs_sunny']] = road_type_stats.apply(calc_vs_sunny, axis=1)
        
        # 添加严重程度
        road_type_stats['severity'] = road_type_stats['weather_type'].map(self.weather_severity)
        
        print("\n=== 不同天气对不同类型道路的影响 ===")
        for weather_type in self.weather_types:
            weather_data = road_type_stats[road_type_stats['weather_type'] == weather_type]
            if not weather_data.empty:
                print(f"\n{weather_type}:")
                for _, row in weather_data.iterrows():
                    print(f"  {row['type']}:")
                    print(f"    平均速度: {row['average_speed']:.2f} km/h (相对于晴天: {row['speed_vs_sunny']:.1%})")
                    print(f"    平均拥堵指数: {row['congestion_index']:.2f} (相对于晴天: {row['congestion_vs_sunny']:.1%})")
        
        return road_type_stats
    
    def analyze_weather_impact_by_time(self) -> pd.DataFrame:
        """
        分析天气在不同时段（特别是早晚高峰）的影响差异
        
        返回:
            按天气类型和时段分组的统计DataFrame
        """
        print("\n正在分析天气在不同时段的影响...")
        
        # 定义时段
        def categorize_time(hour):
            if 7 <= hour < 9:
                return '早高峰'
            elif 17 <= hour < 19:
                return '晚高峰'
            elif 9 <= hour < 17:
                return '日间平峰'
            elif 19 <= hour < 23:
                return '晚间'
            else:
                return '夜间'
        
        self.road_traffic['time_period'] = self.road_traffic['hour'].apply(categorize_time)
        
        # 按天气类型和时段分组
        time_stats = self.road_traffic.groupby(['weather_type', 'time_period']).agg({
            'average_speed': 'mean',
            'congestion_index': 'mean',
            'vehicle_volume': 'mean'
        }).round(2)
        
        time_stats = time_stats.reset_index()
        
        # 计算相对于晴天的影响
        sunny_by_time = time_stats[time_stats['weather_type'] == '晴天'].set_index('time_period')
        
        def calc_vs_sunny_time(row):
            if row['time_period'] in sunny_by_time.index:
                sunny_speed = sunny_by_time.loc[row['time_period'], 'average_speed']
                sunny_congestion = sunny_by_time.loc[row['time_period'], 'congestion_index']
                return pd.Series({
                    'speed_vs_sunny': row['average_speed'] / sunny_speed,
                    'congestion_vs_sunny': row['congestion_index'] / sunny_congestion
                })
            return pd.Series({'speed_vs_sunny': 1, 'congestion_vs_sunny': 1})
        
        time_stats[['speed_vs_sunny', 'congestion_vs_sunny']] = time_stats.apply(calc_vs_sunny_time, axis=1)
        
        print("\n=== 天气在不同时段的影响 ===")
        time_periods = ['早高峰', '日间平峰', '晚高峰', '晚间', '夜间']
        
        for weather_type in self.weather_types:
            weather_data = time_stats[time_stats['weather_type'] == weather_type]
            if not weather_data.empty:
                print(f"\n{weather_type}:")
                for period in time_periods:
                    period_data = weather_data[weather_data['time_period'] == period]
                    if not period_data.empty:
                        row = period_data.iloc[0]
                        print(f"  {period}:")
                        print(f"    平均速度: {row['average_speed']:.2f} km/h (相对于晴天: {row['speed_vs_sunny']:.1%})")
                        print(f"    平均拥堵指数: {row['congestion_index']:.2f} (相对于晴天: {row['congestion_vs_sunny']:.1%})")
        
        return time_stats
    
    def identify_weather_sensitive_roads(self, top_k: int = 10) -> pd.DataFrame:
        """
        识别对天气变化最敏感的路段
        
        参数:
            top_k: 返回前K个最敏感的路段
            
        返回:
            按天气敏感度排序的路段DataFrame
        """
        print(f"\n正在识别对天气变化最敏感的前 {top_k} 个路段...")
        
        # 计算每条道路在不同天气下的速度变化
        road_weather_stats = self.road_traffic.groupby(['road_id', 'weather_type']).agg({
            'average_speed': 'mean',
            'congestion_index': 'mean',
            'start_lat': 'first',
            'start_lon': 'first',
            'end_lat': 'first',
            'end_lon': 'first',
            'type': 'first',
            'speed_limit': 'first'
        }).reset_index()
        
        # 计算每条道路的晴天基准
        sunny_baseline = road_weather_stats[road_weather_stats['weather_type'] == '晴天'].set_index('road_id')
        
        # 计算每条道路的敏感度
        road_sensitivity = []
        
        for road_id in road_weather_stats['road_id'].unique():
            road_data = road_weather_stats[road_weather_stats['road_id'] == road_id]
            
            if road_id in sunny_baseline.index:
                sunny_speed = sunny_baseline.loc[road_id, 'average_speed']
                sunny_congestion = sunny_baseline.loc[road_id, 'congestion_index']
                
                # 获取非晴天的数据
                bad_weather_data = road_data[road_data['weather_type'] != '晴天']
                
                if not bad_weather_data.empty:
                    # 计算平均速度下降比例
                    avg_speed_ratio = (bad_weather_data['average_speed'] / sunny_speed).mean()
                    speed_sensitivity = 1 - avg_speed_ratio  # 下降越多，敏感度越高
                    
                    # 计算平均拥堵上升比例
                    avg_congestion_ratio = (bad_weather_data['congestion_index'] / sunny_congestion).mean()
                    congestion_sensitivity = avg_congestion_ratio - 1  # 上升越多，敏感度越高
                    
                    # 综合敏感度
                    composite_sensitivity = 0.6 * speed_sensitivity + 0.4 * congestion_sensitivity
                    
                    # 获取道路信息
                    road_info = road_data.iloc[0]
                    
                    road_sensitivity.append({
                        'road_id': road_id,
                        'type': road_info['type'],
                        'start_lat': road_info['start_lat'],
                        'start_lon': road_info['start_lon'],
                        'end_lat': road_info['end_lat'],
                        'end_lon': road_info['end_lon'],
                        'speed_limit': road_info['speed_limit'],
                        'sunny_speed': sunny_speed,
                        'sunny_congestion': sunny_congestion,
                        'avg_bad_weather_speed_ratio': avg_speed_ratio,
                        'avg_bad_weather_congestion_ratio': avg_congestion_ratio,
                        'speed_sensitivity': speed_sensitivity,
                        'congestion_sensitivity': congestion_sensitivity,
                        'composite_sensitivity': composite_sensitivity
                    })
        
        # 转换为DataFrame并排序
        sensitivity_df = pd.DataFrame(road_sensitivity)
        sensitivity_df = sensitivity_df.sort_values('composite_sensitivity', ascending=False)
        
        # 获取前K个
        top_sensitive = sensitivity_df.head(top_k)
        
        print(f"\n=== 对天气变化最敏感的前 {top_k} 个路段 ===")
        for idx, (_, row) in enumerate(top_sensitive.iterrows(), 1):
            print(f"\n{idx}. 道路 {row['road_id']} ({row['type']})")
            print(f"   晴天下平均速度: {row['sunny_speed']:.2f} km/h")
            print(f"   恶劣天气下速度比例: {row['avg_bad_weather_speed_ratio']:.1%}")
            print(f"   速度敏感度: {row['speed_sensitivity']:.2%}")
            print(f"   拥堵敏感度: {row['congestion_sensitivity']:.2%}")
            print(f"   综合敏感度: {row['composite_sensitivity']:.4f}")
        
        return sensitivity_df
    
    def visualize_weather_impact(self, sensitivity_df: pd.DataFrame,
                                   output_file: str = 'weather_impact_map.html') -> folium.Map:
        """
        在地图上可视化天气影响
        """
        print("\n正在创建天气影响可视化地图...")
        
        # 创建基础地图
        visualizer = TrafficVisualizer(self.intersections, self.roads, self.traffic_data)
        m = visualizer.create_base_map()
        
        # 获取最大敏感度用于归一化
        max_sensitivity = sensitivity_df['composite_sensitivity'].max() if not sensitivity_df.empty else 1
        
        # 绘制所有道路，根据敏感度着色
        for _, row in sensitivity_df.iterrows():
            # 计算颜色：越敏感越红
            sensitivity = row['composite_sensitivity']
            normalized = min(1, sensitivity / max_sensitivity) if max_sensitivity > 0 else 0
            
            # 从绿色到红色的渐变
            red = int(255 * normalized)
            green = int(255 * (1 - normalized))
            blue = 50
            color = f'#{red:02X}{green:02X}{blue:02X}'
            
            # 根据道路类型设置线宽
            type_weights = {'主干道': 5, '次干道': 3, '支路': 2}
            weight = type_weights.get(row['type'], 3)
            
            folium.PolyLine(
                locations=[[row['start_lat'], row['start_lon']],
                          [row['end_lat'], row['end_lon']]],
                color=color,
                weight=weight,
                opacity=0.8,
                popup=f"<b>天气敏感路段</b><br>"
                      f"道路ID: {row['road_id']}<br>"
                      f"类型: {row['type']}<br>"
                      f"限速: {row['speed_limit']} km/h<br>"
                      f"晴天速度: {row['sunny_speed']:.2f} km/h<br>"
                      f"恶劣天气速度比例: {row['avg_bad_weather_speed_ratio']:.1%}<br>"
                      f"综合敏感度: {row['composite_sensitivity']:.4f}"
            ).add_to(m)
        
        # 添加图例
        self._add_weather_legend(m)
        
        # 保存地图
        m.save(output_file)
        print(f"天气影响地图已保存到: {output_file}")
        
        return m
    
    def _add_weather_legend(self, m: folium.Map):
        """添加天气影响图例"""
        legend_html = '''
        <div style="position: fixed; 
                    bottom: 50px; left: 50px; width: 220px; height: 140px; 
                    border:2px solid grey; z-index:9999; font-size:14px;
                    background-color:white;
                    padding: 10px;
                    border-radius: 5px;
                    opacity: 0.9;">
        <p style="margin-top: 0; margin-bottom: 10px; font-weight: bold;">天气敏感度</p>
        <p><i class="fa fa-minus" style="color:#00FF00; font-size: 20px;"></i>&nbsp; 低敏感度</p>
        <p><i class="fa fa-minus" style="color:#FFFF00; font-size: 20px;"></i>&nbsp; 中等敏感度</p>
        <p><i class="fa fa-minus" style="color:#FF8800; font-size: 20px;"></i>&nbsp; 较高敏感度</p>
        <p><i class="fa fa-minus" style="color:#FF0000; font-size: 20px;"></i>&nbsp; 高敏感度</p>
        </div>
        '''
        
        m.get_root().html.add_child(folium.Element(legend_html))
    
    def generate_weather_report(self) -> Dict:
        """生成完整的天气影响分析报告"""
        print("\n" + "="*60)
        print("天气影响分析报告")
        print("="*60)
        
        # 执行所有分析
        overall_stats = self.analyze_weather_impact_overall()
        road_type_stats = self.analyze_weather_impact_by_road_type()
        time_stats = self.analyze_weather_impact_by_time()
        sensitivity_df = self.identify_weather_sensitive_roads(top_k=10)
        
        # 汇总关键发现
        report = {
            'overall_statistics': overall_stats.to_dict('records'),
            'road_type_impact': road_type_stats.to_dict('records'),
            'time_period_impact': time_stats.to_dict('records'),
            'weather_sensitive_roads': sensitivity_df.head(10).to_dict('records'),
            'key_findings': []
        }
        
        # 提取关键发现
        # 1. 影响最大的天气类型
        if not overall_stats.empty:
            worst_weather = overall_stats.loc[overall_stats['speed_vs_sunny'].idxmin()]
            report['key_findings'].append({
                'finding': '影响最大的天气类型',
                'weather_type': worst_weather['weather_type'],
                'speed_reduction': f"{(1 - worst_weather['speed_vs_sunny']):.1%}",
                'congestion_increase': f"{(worst_weather['congestion_vs_sunny'] - 1):.1%}"
            })
        
        # 2. 最敏感的道路类型
        if not road_type_stats.empty:
            # 找出在恶劣天气下速度下降最多的道路类型
            bad_weather = road_type_stats[road_type_stats['weather_type'] != '晴天']
            if not bad_weather.empty:
                most_sensitive_type = bad_weather.loc[bad_weather['speed_vs_sunny'].idxmin()]
                report['key_findings'].append({
                    'finding': '对天气最敏感的道路类型',
                    'road_type': most_sensitive_type['type'],
                    'weather_type': most_sensitive_type['weather_type'],
                    'speed_reduction': f"{(1 - most_sensitive_type['speed_vs_sunny']):.1%}"
                })
        
        # 3. 最敏感的时段
        if not time_stats.empty:
            bad_weather_time = time_stats[time_stats['weather_type'] != '晴天']
            if not bad_weather_time.empty:
                most_sensitive_time = bad_weather_time.loc[bad_weather_time['speed_vs_sunny'].idxmin()]
                report['key_findings'].append({
                    'finding': '对天气最敏感的时段',
                    'time_period': most_sensitive_time['time_period'],
                    'weather_type': most_sensitive_time['weather_type'],
                    'speed_reduction': f"{(1 - most_sensitive_time['speed_vs_sunny']):.1%}"
                })
        
        print("\n" + "="*60)
        print("关键发现总结")
        print("="*60)
        for finding in report['key_findings']:
            print(f"\n{finding['finding']}:")
            for key, value in finding.items():
                if key != 'finding':
                    print(f"  {key}: {value}")
        
        return report


if __name__ == "__main__":
    # 测试天气分析模块
    from data_generator import TrafficDataGenerator
    
    # 生成测试数据
    print("生成测试数据...")
    generator = TrafficDataGenerator(num_intersections=15, num_roads=30, days=7)
    intersections, roads, traffic_data, G = generator.generate_all_data()
    
    # 创建天气分析器
    print("\n初始化天气分析器...")
    analyzer = WeatherAnalyzer(traffic_data, roads, intersections)
    
    # 生成完整报告
    report = analyzer.generate_weather_report()
    
    # 可视化
    print("\n创建可视化...")
    sensitivity_df = analyzer.identify_weather_sensitive_roads(top_k=10)
    m = analyzer.visualize_weather_impact(sensitivity_df)
    
    print("\n天气影响分析完成！")
