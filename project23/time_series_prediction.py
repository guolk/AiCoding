import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# 尝试导入statsmodels，如果没有则使用简化方法
try:
    from statsmodels.tsa.statespace.sarimax import SARIMAX
    from statsmodels.tsa.seasonal import seasonal_decompose
    HAS_STATSMODELS = True
except ImportError:
    HAS_STATSMODELS = False
    print("警告: statsmodels未安装，将使用简化预测方法")

import folium
from visualization import TrafficVisualizer


class TrafficPredictor:
    def __init__(self, traffic_data: pd.DataFrame, roads: pd.DataFrame,
                 intersections: pd.DataFrame):
        self.traffic_data = traffic_data
        self.roads = roads
        self.intersections = intersections
        
        # 确保时间戳排序
        self.traffic_data = self.traffic_data.sort_values('timestamp').reset_index(drop=True)
        
        # 获取时间范围
        self.start_date = self.traffic_data['timestamp'].min()
        self.end_date = self.traffic_data['timestamp'].max()
        
        print(f"数据时间范围: {self.start_date} 到 {self.end_date}")
        print(f"总记录数: {len(self.traffic_data)}")
    
    def prepare_time_series(self, road_id: str = None, 
                             target_column: str = 'congestion_index') -> pd.DataFrame:
        """
        准备时间序列数据
        
        参数:
            road_id: 特定道路ID，如果为None则使用所有道路的平均值
            target_column: 目标预测列（congestion_index 或 average_speed）
            
        返回:
            按时间索引的时间序列DataFrame
        """
        if road_id:
            # 使用特定道路的数据
            road_data = self.traffic_data[self.traffic_data['road_id'] == road_id].copy()
        else:
            # 使用所有道路的平均值
            road_data = self.traffic_data.copy()
        
        # 按时间戳分组，计算目标列的平均值
        ts_data = road_data.groupby('timestamp').agg({
            target_column: 'mean',
            'vehicle_volume': 'mean',
            'is_weekend': 'first'
        }).reset_index()
        
        # 设置时间索引
        ts_data = ts_data.set_index('timestamp')
        
        # 确保时间频率是15分钟
        ts_data = ts_data.asfreq('15T')
        
        # 填充缺失值
        ts_data[target_column] = ts_data[target_column].interpolate(method='time')
        ts_data['vehicle_volume'] = ts_data['vehicle_volume'].interpolate(method='time')
        ts_data['is_weekend'] = ts_data['is_weekend'].ffill()
        
        return ts_data
    
    def analyze_seasonality(self, ts_data: pd.DataFrame, 
                             target_column: str = 'congestion_index') -> Dict:
        """
        分析时间序列的季节性
        
        参数:
            ts_data: 时间序列数据
            target_column: 目标列
            
        返回:
            季节性分析结果
        """
        print("\n正在分析时间序列季节性...")
        
        results = {}
        
        # 计算日模式（每小时的平均值）
        ts_data['hour'] = ts_data.index.hour
        hourly_pattern = ts_data.groupby('hour')[target_column].mean()
        results['hourly_pattern'] = hourly_pattern.to_dict()
        
        # 找出高峰时段
        peak_hours = hourly_pattern.nlargest(4).index.tolist()
        results['peak_hours'] = sorted(peak_hours)
        
        # 计算周模式（每周各天的平均值）
        ts_data['day_of_week'] = ts_data.index.dayofweek
        daily_pattern = ts_data.groupby('day_of_week')[target_column].mean()
        results['daily_pattern'] = {
            'Monday': daily_pattern.get(0, 0),
            'Tuesday': daily_pattern.get(1, 0),
            'Wednesday': daily_pattern.get(2, 0),
            'Thursday': daily_pattern.get(3, 0),
            'Friday': daily_pattern.get(4, 0),
            'Saturday': daily_pattern.get(5, 0),
            'Sunday': daily_pattern.get(6, 0)
        }
        
        # 工作日vs周末
        weekday_mean = ts_data[~ts_data['is_weekend']][target_column].mean()
        weekend_mean = ts_data[ts_data['is_weekend']][target_column].mean()
        results['weekday_vs_weekend'] = {
            'weekday_mean': weekday_mean,
            'weekend_mean': weekend_mean,
            'ratio': weekend_mean / weekday_mean if weekday_mean > 0 else 1
        }
        
        print(f"高峰时段（拥堵最严重的4个小时）: {[f'{h}:00' for h in results['peak_hours']]}")
        print(f"工作日平均拥堵指数: {weekday_mean:.2f}")
        print(f"周末平均拥堵指数: {weekend_mean:.2f}")
        print(f"周末/工作日拥堵比例: {results['weekday_vs_weekend']['ratio']:.1%}")
        
        return results
    
    def predict_with_sarima(self, ts_data: pd.DataFrame, 
                             target_column: str = 'congestion_index',
                             forecast_hours: int = 24,
                             order: Tuple[int, int, int] = (2, 1, 1),
                             seasonal_order: Tuple[int, int, int, int] = (1, 1, 1, 96)) -> pd.DataFrame:
        """
        使用SARIMA模型进行预测
        
        参数:
            ts_data: 时间序列数据
            target_column: 目标预测列
            forecast_hours: 预测小时数
            order: SARIMA的(p,d,q)参数
            seasonal_order: 季节性SARIMA的(P,D,Q,s)参数，s=96表示每日周期（15分钟间隔）
            
        返回:
            包含预测结果的DataFrame
        """
        if not HAS_STATSMODELS:
            print("statsmodels未安装，使用简化预测方法...")
            return self.predict_simple(ts_data, target_column, forecast_hours)
        
        print(f"\n正在使用SARIMA模型预测未来 {forecast_hours} 小时...")
        
        try:
            # 准备数据
            data = ts_data[target_column].dropna()
            
            # 创建并拟合SARIMA模型
            model = SARIMAX(
                data,
                order=order,
                seasonal_order=seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            
            results = model.fit(disp=False)
            
            # 预测步数（每步15分钟）
            steps = int(forecast_hours * 4)  # 每小时4个15分钟间隔
            
            # 进行预测
            forecast = results.get_forecast(steps=steps)
            forecast_mean = forecast.predicted_mean
            forecast_ci = forecast.conf_int()
            
            # 创建预测结果DataFrame
            last_date = ts_data.index[-1]
            forecast_index = pd.date_range(
                start=last_date + timedelta(minutes=15),
                periods=steps,
                freq='15T'
            )
            
            forecast_df = pd.DataFrame({
                'timestamp': forecast_index,
                f'predicted_{target_column}': forecast_mean.values,
                'lower_bound': forecast_ci.iloc[:, 0].values,
                'upper_bound': forecast_ci.iloc[:, 1].values
            })
            
            forecast_df = forecast_df.set_index('timestamp')
            
            # 限制预测值在合理范围内
            if target_column == 'congestion_index':
                forecast_df[f'predicted_{target_column}'] = forecast_df[f'predicted_{target_column}'].clip(0, 10)
                forecast_df['lower_bound'] = forecast_df['lower_bound'].clip(0, 10)
                forecast_df['upper_bound'] = forecast_df['upper_bound'].clip(0, 10)
            elif target_column == 'average_speed':
                forecast_df[f'predicted_{target_column}'] = forecast_df[f'predicted_{target_column}'].clip(5, 80)
            
            print(f"SARIMA预测完成，生成 {len(forecast_df)} 个预测点")
            
            return forecast_df
            
        except Exception as e:
            print(f"SARIMA模型拟合失败: {e}")
            print("切换到简化预测方法...")
            return self.predict_simple(ts_data, target_column, forecast_hours)
    
    def predict_simple(self, ts_data: pd.DataFrame,
                        target_column: str = 'congestion_index',
                        forecast_hours: int = 24) -> pd.DataFrame:
        """
        简化预测方法（基于历史模式）
        
        参数:
            ts_data: 时间序列数据
            target_column: 目标预测列
            forecast_hours: 预测小时数
            
        返回:
            包含预测结果的DataFrame
        """
        print(f"\n使用简化方法预测未来 {forecast_hours} 小时...")
        
        # 提取历史模式
        ts_data['hour'] = ts_data.index.hour
        ts_data['minute'] = ts_data.index.minute
        ts_data['day_of_week'] = ts_data.index.dayofweek
        
        # 计算每（星期几, 小时, 分钟）的平均值
        pattern = ts_data.groupby(['day_of_week', 'hour', 'minute'])[target_column].agg(['mean', 'std']).reset_index()
        
        # 创建预测时间索引
        last_date = ts_data.index[-1]
        steps = int(forecast_hours * 4)
        forecast_index = pd.date_range(
            start=last_date + timedelta(minutes=15),
            periods=steps,
            freq='15T'
        )
        
        # 生成预测
        predictions = []
        for timestamp in forecast_index:
            day_of_week = timestamp.dayofweek
            hour = timestamp.hour
            minute = timestamp.minute
            
            # 查找匹配的模式
            match = pattern[
                (pattern['day_of_week'] == day_of_week) &
                (pattern['hour'] == hour) &
                (pattern['minute'] == minute)
            ]
            
            if not match.empty:
                pred_value = match.iloc[0]['mean']
                std = match.iloc[0]['std']
            else:
                # 使用全局平均值
                pred_value = ts_data[target_column].mean()
                std = ts_data[target_column].std()
            
            predictions.append({
                'timestamp': timestamp,
                f'predicted_{target_column}': pred_value,
                'lower_bound': pred_value - 1.96 * std,
                'upper_bound': pred_value + 1.96 * std
            })
        
        forecast_df = pd.DataFrame(predictions)
        forecast_df = forecast_df.set_index('timestamp')
        
        # 限制预测值在合理范围内
        if target_column == 'congestion_index':
            forecast_df[f'predicted_{target_column}'] = forecast_df[f'predicted_{target_column}'].clip(0, 10)
            forecast_df['lower_bound'] = forecast_df['lower_bound'].clip(0, 10)
            forecast_df['upper_bound'] = forecast_df['upper_bound'].clip(0, 10)
        elif target_column == 'average_speed':
            forecast_df[f'predicted_{target_column}'] = forecast_df[f'predicted_{target_column}'].clip(5, 80)
        
        print(f"简化预测完成，生成 {len(forecast_df)} 个预测点")
        
        return forecast_df
    
    def predict_tomorrow_rush_hour(self, target_column: str = 'congestion_index',
                                     use_sarima: bool = False) -> Dict:
        """
        预测明日高峰期的拥堵情况
        
        参数:
            target_column: 目标预测列
            use_sarima: 是否使用SARIMA模型（较慢但更准确），默认False使用快速方法
        
        返回:
            包含预测结果的字典
        """
        print("\n" + "="*60)
        print("预测明日高峰期拥堵情况")
        print("="*60)
        
        # 准备整体时间序列
        ts_data = self.prepare_time_series(target_column=target_column)
        
        # 分析季节性
        seasonality = self.analyze_seasonality(ts_data, target_column)
        
        # 确定明日是星期几
        last_date = ts_data.index[-1]
        tomorrow = last_date + timedelta(days=1)
        tomorrow_day = tomorrow.dayofweek
        is_tomorrow_weekend = tomorrow_day >= 5  # 5=周六, 6=周日
        
        day_names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        print(f"\n预测日期: {tomorrow.date()} ({day_names[tomorrow_day]})")
        print(f"是否为周末: {'是' if is_tomorrow_weekend else '否'}")
        
        # 预测未来24小时
        if use_sarima and HAS_STATSMODELS:
            print("\n[注意] 使用SARIMA模型（可能需要较长时间）...")
            forecast_df = self.predict_with_sarima(
                ts_data, 
                target_column=target_column,
                forecast_hours=24
            )
        else:
            print("\n使用快速预测方法（基于历史模式）...")
            forecast_df = self.predict_simple(
                ts_data, 
                target_column=target_column,
                forecast_hours=24
            )
        
        # 提取高峰期预测
        # 定义高峰期时间范围
        if is_tomorrow_weekend:
            # 周末高峰：中午12-14点，晚上18-20点
            morning_rush_mask = (forecast_df.index.hour >= 12) & (forecast_df.index.hour < 14)
            evening_rush_mask = (forecast_df.index.hour >= 18) & (forecast_df.index.hour < 20)
            morning_rush_name = "午间高峰（12:00-14:00）"
            evening_rush_name = "晚间高峰（18:00-20:00）"
        else:
            # 工作日高峰：早上7-9点，晚上17-19点
            morning_rush_mask = (forecast_df.index.hour >= 7) & (forecast_df.index.hour < 9)
            evening_rush_mask = (forecast_df.index.hour >= 17) & (forecast_df.index.hour < 19)
            morning_rush_name = "早高峰（7:00-9:00）"
            evening_rush_name = "晚高峰（17:00-19:00）"
        
        # 计算高峰期统计
        result = {
            'forecast_date': tomorrow.date(),
            'is_weekend': is_tomorrow_weekend,
            'target_column': target_column,
            'all_forecasts': forecast_df.reset_index().to_dict('records'),
            'rush_hour_forecasts': {}
        }
        
        pred_col = f'predicted_{target_column}'
        
        # 早高峰/午间高峰
        morning_forecast = forecast_df[morning_rush_mask]
        if not morning_forecast.empty:
            result['rush_hour_forecasts']['morning_rush'] = {
                'name': morning_rush_name,
                'mean_prediction': morning_forecast[pred_col].mean(),
                'min_prediction': morning_forecast[pred_col].min(),
                'max_prediction': morning_forecast[pred_col].max(),
                'peak_time': morning_forecast[pred_col].idxmax(),
                'peak_value': morning_forecast[pred_col].max(),
                'hourly_data': morning_forecast.groupby(morning_forecast.index.hour)[pred_col].mean().to_dict()
            }
            
            print(f"\n{morning_rush_name}预测:")
            print(f"  平均{target_column}: {result['rush_hour_forecasts']['morning_rush']['mean_prediction']:.2f}")
            # 使用 pd.Timestamp 转换以支持 strftime（兼容 numpy.datetime64）
            print(f"  峰值时间: {pd.Timestamp(result['rush_hour_forecasts']['morning_rush']['peak_time']).strftime('%H:%M')}")
            print(f"  峰值{target_column}: {result['rush_hour_forecasts']['morning_rush']['peak_value']:.2f}")
            
            # 拥堵等级判断
            if target_column == 'congestion_index':
                mean_val = result['rush_hour_forecasts']['morning_rush']['mean_prediction']
                if mean_val < 3:
                    level = "畅通"
                elif mean_val < 5:
                    level = "基本畅通"
                elif mean_val < 7:
                    level = "轻度拥堵"
                elif mean_val < 9:
                    level = "中度拥堵"
                else:
                    level = "严重拥堵"
                print(f"  拥堵等级: {level}")
        
        # 晚高峰
        evening_forecast = forecast_df[evening_rush_mask]
        if not evening_forecast.empty:
            result['rush_hour_forecasts']['evening_rush'] = {
                'name': evening_rush_name,
                'mean_prediction': evening_forecast[pred_col].mean(),
                'min_prediction': evening_forecast[pred_col].min(),
                'max_prediction': evening_forecast[pred_col].max(),
                'peak_time': evening_forecast[pred_col].idxmax(),
                'peak_value': evening_forecast[pred_col].max(),
                'hourly_data': evening_forecast.groupby(evening_forecast.index.hour)[pred_col].mean().to_dict()
            }
            
            print(f"\n{evening_rush_name}预测:")
            print(f"  平均{target_column}: {result['rush_hour_forecasts']['evening_rush']['mean_prediction']:.2f}")
            # 使用 pd.Timestamp 转换以支持 strftime（兼容 numpy.datetime64）
            print(f"  峰值时间: {pd.Timestamp(result['rush_hour_forecasts']['evening_rush']['peak_time']).strftime('%H:%M')}")
            print(f"  峰值{target_column}: {result['rush_hour_forecasts']['evening_rush']['peak_value']:.2f}")
            
            # 拥堵等级判断
            if target_column == 'congestion_index':
                mean_val = result['rush_hour_forecasts']['evening_rush']['mean_prediction']
                if mean_val < 3:
                    level = "畅通"
                elif mean_val < 5:
                    level = "基本畅通"
                elif mean_val < 7:
                    level = "轻度拥堵"
                elif mean_val < 9:
                    level = "中度拥堵"
                else:
                    level = "严重拥堵"
                print(f"  拥堵等级: {level}")
        
        return result
    
    def predict_by_road(self, forecast_hours: int = 24) -> pd.DataFrame:
        """
        按道路进行预测
        
        参数:
            forecast_hours: 预测小时数
            
        返回:
            包含各道路预测结果的DataFrame
        """
        print(f"\n正在按道路预测未来 {forecast_hours} 小时的拥堵情况...")
        
        # 获取所有唯一的道路ID
        road_ids = self.traffic_data['road_id'].unique()
        
        all_road_predictions = []
        
        for idx, road_id in enumerate(road_ids[:]):  # 可以限制数量以加速
            if (idx + 1) % 10 == 0:
                print(f"  处理第 {idx + 1}/{len(road_ids)} 条道路...")
            
            try:
                # 准备该道路的时间序列
                ts_data = self.prepare_time_series(road_id=road_id, target_column='congestion_index')
                
                if len(ts_data) < 100:  # 数据不足跳过
                    continue
                
                # 使用简化方法预测（更快）
                forecast_df = self.predict_simple(ts_data, 'congestion_index', forecast_hours)
                
                # 计算该道路的平均预测拥堵指数
                avg_prediction = forecast_df['predicted_congestion_index'].mean()
                
                # 获取该道路的高峰期预测
                last_date = ts_data.index[-1]
                tomorrow = last_date + timedelta(days=1)
                tomorrow_day = tomorrow.dayofweek
                is_weekend = tomorrow_day >= 5
                
                if is_weekend:
                    rush_mask = ((forecast_df.index.hour >= 12) & (forecast_df.index.hour < 14)) | \
                               ((forecast_df.index.hour >= 18) & (forecast_df.index.hour < 20))
                else:
                    rush_mask = ((forecast_df.index.hour >= 7) & (forecast_df.index.hour < 9)) | \
                               ((forecast_df.index.hour >= 17) & (forecast_df.index.hour < 19))
                
                rush_forecast = forecast_df[rush_mask]
                rush_avg = rush_forecast['predicted_congestion_index'].mean() if not rush_forecast.empty else avg_prediction
                
                # 获取道路信息
                road_info = self.roads[self.roads['road_id'] == road_id].iloc[0]
                start_int = self.intersections[self.intersections['intersection_id'] == road_info['start_intersection']].iloc[0]
                end_int = self.intersections[self.intersections['intersection_id'] == road_info['end_intersection']].iloc[0]
                
                all_road_predictions.append({
                    'road_id': road_id,
                    'type': road_info['type'],
                    'start_lat': start_int['latitude'],
                    'start_lon': start_int['longitude'],
                    'end_lat': end_int['latitude'],
                    'end_lon': end_int['longitude'],
                    'speed_limit': road_info['speed_limit'],
                    'avg_predicted_congestion': avg_prediction,
                    'rush_hour_predicted_congestion': rush_avg,
                    'max_predicted_congestion': forecast_df['predicted_congestion_index'].max()
                })
                
            except Exception as e:
                print(f"  警告: 道路 {road_id} 预测失败: {e}")
                continue
        
        predictions_df = pd.DataFrame(all_road_predictions)
        
        print(f"\n完成 {len(predictions_df)} 条道路的预测")
        
        return predictions_df
    
    def visualize_predictions(self, predictions_df: pd.DataFrame,
                                output_file: str = 'prediction_map.html') -> folium.Map:
        """
        在地图上可视化预测结果
        """
        print("\n正在创建预测结果可视化地图...")
        
        # 创建基础地图
        visualizer = TrafficVisualizer(self.intersections, self.roads, self.traffic_data)
        m = visualizer.create_base_map()
        
        # 获取最大值用于颜色归一化
        max_congestion = predictions_df['rush_hour_predicted_congestion'].max() if not predictions_df.empty else 10
        
        # 绘制所有道路
        for _, row in predictions_df.iterrows():
            # 计算颜色
            congestion = row['rush_hour_predicted_congestion']
            
            # 使用拥堵颜色编码
            if congestion < 2:
                color = '#00FF00'  # 绿色
            elif congestion < 4:
                color = '#90EE90'  # 浅绿
            elif congestion < 6:
                color = '#FFFF00'  # 黄色
            elif congestion < 8:
                color = '#FFA500'  # 橙色
            else:
                color = '#FF0000'  # 红色
            
            # 根据道路类型设置线宽
            type_weights = {'主干道': 5, '次干道': 3, '支路': 2}
            weight = type_weights.get(row['type'], 3)
            
            # 拥堵等级
            if congestion < 3:
                level = "畅通"
            elif congestion < 5:
                level = "基本畅通"
            elif congestion < 7:
                level = "轻度拥堵"
            elif congestion < 9:
                level = "中度拥堵"
            else:
                level = "严重拥堵"
            
            folium.PolyLine(
                locations=[[row['start_lat'], row['start_lon']],
                          [row['end_lat'], row['end_lon']]],
                color=color,
                weight=weight,
                opacity=0.8,
                popup=f"<b>明日高峰期预测</b><br>"
                      f"道路ID: {row['road_id']}<br>"
                      f"类型: {row['type']}<br>"
                      f"预测平均拥堵指数: {congestion:.2f}<br>"
                      f"预测最大拥堵指数: {row['max_predicted_congestion']:.2f}<br>"
                      f"预测拥堵等级: {level}"
            ).add_to(m)
        
        # 添加图例
        self._add_prediction_legend(m)
        
        # 保存地图
        m.save(output_file)
        print(f"预测结果地图已保存到: {output_file}")
        
        return m
    
    def _add_prediction_legend(self, m: folium.Map):
        """添加预测结果图例"""
        legend_html = '''
        <div style="position: fixed; 
                    bottom: 50px; left: 50px; width: 220px; height: 160px; 
                    border:2px solid grey; z-index:9999; font-size:14px;
                    background-color:white;
                    padding: 10px;
                    border-radius: 5px;
                    opacity: 0.9;">
        <p style="margin-top: 0; margin-bottom: 10px; font-weight: bold;">明日高峰期预测</p>
        <p><i class="fa fa-minus" style="color:#00FF00; font-size: 20px;"></i>&nbsp; 畅通 (0-3)</p>
        <p><i class="fa fa-minus" style="color:#90EE90; font-size: 20px;"></i>&nbsp; 基本畅通 (3-5)</p>
        <p><i class="fa fa-minus" style="color:#FFFF00; font-size: 20px;"></i>&nbsp; 轻度拥堵 (5-7)</p>
        <p><i class="fa fa-minus" style="color:#FFA500; font-size: 20px;"></i>&nbsp; 中度拥堵 (7-9)</p>
        <p><i class="fa fa-minus" style="color:#FF0000; font-size: 20px;"></i>&nbsp; 严重拥堵 (9-10)</p>
        </div>
        '''
        
        m.get_root().html.add_child(folium.Element(legend_html))


if __name__ == "__main__":
    # 测试预测模块
    from data_generator import TrafficDataGenerator
    
    # 生成测试数据
    print("生成测试数据...")
    generator = TrafficDataGenerator(num_intersections=10, num_roads=20, days=14)
    intersections, roads, traffic_data, G = generator.generate_all_data()
    
    # 创建预测器
    print("\n初始化预测器...")
    predictor = TrafficPredictor(traffic_data, roads, intersections)
    
    # 预测明日高峰期
    prediction_result = predictor.predict_tomorrow_rush_hour(target_column='congestion_index')
    
    # 按道路预测
    road_predictions = predictor.predict_by_road(forecast_hours=24)
    
    # 可视化
    print("\n创建可视化...")
    m = predictor.visualize_predictions(road_predictions)
    
    print("\n预测分析完成！")
