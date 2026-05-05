import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt
import seaborn as sns
from lifelines import KaplanMeierFitter
from lifelines.statistics import logrank_test
import warnings
warnings.filterwarnings('ignore')


class HealthcareVisualizer:
    """医疗数据可视化器"""
    
    def __init__(self, patients_df: pd.DataFrame,
                 diagnoses_df: pd.DataFrame,
                 hospitalizations_df: pd.DataFrame,
                 medications_df: pd.DataFrame = None,
                 lab_results_df: pd.DataFrame = None):
        self.patients_df = patients_df.copy()
        self.diagnoses_df = diagnoses_df.copy()
        self.hospitalizations_df = hospitalizations_df.copy()
        self.medications_df = medications_df.copy() if medications_df is not None else None
        self.lab_results_df = lab_results_df.copy() if lab_results_df is not None else None
        
        # 预处理
        self._preprocess_data()
        
    def _preprocess_data(self):
        """数据预处理"""
        # 转换日期格式
        self.hospitalizations_df['admission_date'] = pd.to_datetime(
            self.hospitalizations_df['admission_date']
        )
        self.hospitalizations_df['discharge_date'] = pd.to_datetime(
            self.hospitalizations_df['discharge_date']
        )
        self.diagnoses_df['diagnosis_date'] = pd.to_datetime(
            self.diagnoses_df['diagnosis_date']
        )
        
        # 合并数据
        self.merged_hospitalizations = pd.merge(
            self.hospitalizations_df,
            self.patients_df[['patient_id', 'age', 'gender', 'region']],
            on='patient_id',
            how='left'
        )
        
    def create_sankey_treatment_path(self, top_n_diseases: int = 5) -> go.Figure:
        """
        创建Sankey图展示患者诊疗路径
        
        展示从入院诊断 → 治疗方案 → 出院结果的流程
        """
        # 获取主要疾病
        top_diseases = self.hospitalizations_df['main_diagnosis'].value_counts().head(top_n_diseases).index.tolist()
        
        # 过滤数据
        filtered_hosp = self.hospitalizations_df[
            self.hospitalizations_df['main_diagnosis'].isin(top_diseases)
        ]
        
        # 构建节点和链接
        nodes = []
        links = []
        
        # 节点索引映射
        node_index = {}
        current_idx = 0
        
        # 第一层：入院诊断（疾病）
        diagnosis_nodes = sorted(filtered_hosp['main_diagnosis'].unique().tolist())
        for diagnosis in diagnosis_nodes:
            node_index[f'diagnosis:{diagnosis}'] = current_idx
            nodes.append({
                'label': f'诊断：{diagnosis}',
                'color': self._get_color(current_idx, len(diagnosis_nodes))
            })
            current_idx += 1
        
        # 第二层：治疗方案
        # 从诊疗路径中提取
        treatment_types = ['药物治疗', '手术治疗', '介入治疗', '康复治疗', '支持治疗']
        for treatment in treatment_types:
            node_index[f'treatment:{treatment}'] = current_idx
            nodes.append({
                'label': f'治疗：{treatment}',
                'color': self._get_color(current_idx, len(treatment_types))
            })
            current_idx += 1
        
        # 第三层：出院结果
        discharge_types = sorted(filtered_hosp['discharge_type'].unique().tolist())
        for discharge in discharge_types:
            node_index[f'discharge:{discharge}'] = current_idx
            nodes.append({
                'label': f'出院：{discharge}',
                'color': self._get_color(current_idx, len(discharge_types))
            })
            current_idx += 1
        
        # 构建链接：诊断 → 治疗
        for diagnosis in diagnosis_nodes:
            # 简化处理：根据疾病类型分配治疗方案
            # 实际应该从数据中真实提取
            diag_data = filtered_hosp[filtered_hosp['main_diagnosis'] == diagnosis]
            total_count = len(diag_data)
            
            # 模拟治疗分布
            treatment_distribution = self._simulate_treatment_distribution(diagnosis, total_count)
            
            for treatment, count in treatment_distribution.items():
                if count > 0:
                    links.append({
                        'source': node_index[f'diagnosis:{diagnosis}'],
                        'target': node_index[f'treatment:{treatment}'],
                        'value': count
                    })
        
        # 构建链接：治疗 → 出院结果
        for treatment in treatment_types:
            # 模拟出院结果分布
            discharge_distribution = self._simulate_discharge_distribution(treatment)
            
            for discharge, prob in discharge_distribution.items():
                # 估算数量
                count = int(filtered_hosp.shape[0] * prob / len(treatment_types))
                if count > 0:
                    links.append({
                        'source': node_index[f'treatment:{treatment}'],
                        'target': node_index[f'discharge:{discharge}'],
                        'value': count
                    })
        
        # 创建Sankey图
        fig = go.Figure(data=[go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color='black', width=0.5),
                label=[node['label'] for node in nodes],
                color=[node['color'] for node in nodes]
            ),
            link=dict(
                source=[link['source'] for link in links],
                target=[link['target'] for link in links],
                value=[link['value'] for link in links],
                color='rgba(150, 150, 150, 0.4)'
            )
        )])
        
        fig.update_layout(
            title_text='患者诊疗路径流程图（Sankey图）',
            title_font_size=20,
            font_size=12,
            height=600,
            width=1000
        )
        
        return fig
    
    def _get_color(self, index: int, total: int) -> str:
        """生成颜色"""
        colors = px.colors.qualitative.Plotly
        return colors[index % len(colors)]
    
    def _simulate_treatment_distribution(self, diagnosis: str, total_count: int) -> Dict:
        """模拟治疗分布"""
        # 基于疾病类型的治疗分布
        base_distribution = {
            '药物治疗': 0.5,
            '手术治疗': 0.2,
            '介入治疗': 0.15,
            '康复治疗': 0.1,
            '支持治疗': 0.05
        }
        
        # 根据疾病调整
        if diagnosis == '冠心病':
            base_distribution['介入治疗'] = 0.35
            base_distribution['药物治疗'] = 0.45
            base_distribution['手术治疗'] = 0.1
        elif diagnosis == '脑卒中':
            base_distribution['康复治疗'] = 0.3
            base_distribution['药物治疗'] = 0.5
        elif diagnosis in ['慢性肾病', '糖尿病']:
            base_distribution['药物治疗'] = 0.7
            base_distribution['支持治疗'] = 0.15
        
        # 计算实际数量
        actual_counts = {}
        remaining = total_count
        treatments = list(base_distribution.keys())
        
        for i, treatment in enumerate(treatments):
            if i == len(treatments) - 1:
                actual_counts[treatment] = remaining
            else:
                count = int(total_count * base_distribution[treatment])
                actual_counts[treatment] = count
                remaining -= count
        
        return actual_counts
    
    def _simulate_discharge_distribution(self, treatment: str) -> Dict:
        """模拟出院结果分布"""
        base_distribution = {
            '治愈出院': 0.4,
            '好转出院': 0.4,
            '未愈出院': 0.12,
            '转院': 0.06,
            '死亡': 0.02
        }
        
        # 根据治疗调整
        if treatment == '手术治疗':
            base_distribution['治愈出院'] = 0.5
            base_distribution['死亡'] = 0.05
        elif treatment == '支持治疗':
            base_distribution['治愈出院'] = 0.2
            base_distribution['未愈出院'] = 0.3
            base_distribution['死亡'] = 0.08
        
        return base_distribution
    
    def create_kaplan_meier_curve(self, 
                                   group_by: str = 'gender',
                                   disease_name: Optional[str] = None) -> go.Figure:
        """
        创建Kaplan-Meier生存曲线
        
        参数:
            group_by: 分组变量 ('gender', 'age_group', 'treatment_type')
            disease_name: 可选，特定疾病
        """
        # 准备生存数据
        # 使用住院时长作为生存时间，再入院作为事件
        surv_data = self.merged_hospitalizations.copy()
        
        if disease_name:
            surv_data = surv_data[surv_data['main_diagnosis'] == disease_name]
        
        # 准备生存分析数据
        # 时间：住院时长
        # 事件：30天内再入院
        T = surv_data['length_of_stay'].values
        E = surv_data['readmission_within_30'].astype(int).values
        
        # 创建图形
        fig = go.Figure()
        
        if group_by == 'gender':
            # 按性别分组
            male_mask = surv_data['gender'] == '男'
            female_mask = surv_data['gender'] == '女'
            
            # 男性
            kmf_male = KaplanMeierFitter()
            kmf_male.fit(T[male_mask], event_observed=E[male_mask], label='男性')
            
            # 女性
            kmf_female = KaplanMeierFitter()
            kmf_female.fit(T[female_mask], event_observed=E[female_mask], label='女性')
            
            # 绘制曲线
            fig.add_trace(go.Scatter(
                x=kmf_male.survival_function_.index,
                y=kmf_male.survival_function_['男性'],
                mode='lines',
                name='男性',
                line=dict(color='#1f77b4', width=2)
            ))
            
            fig.add_trace(go.Scatter(
                x=kmf_female.survival_function_.index,
                y=kmf_female.survival_function_['女性'],
                mode='lines',
                name='女性',
                line=dict(color='#ff7f0e', width=2)
            ))
            
            # Log-rank检验
            results = logrank_test(
                T[male_mask], T[female_mask],
                event_observed_A=E[male_mask],
                event_observed_B=E[female_mask]
            )
            
            fig.add_annotation(
                text=f'Log-rank检验: p值 = {results.p_value:.4f}',
                xref='paper', yref='paper',
                x=0.02, y=0.02,
                showarrow=False,
                font=dict(size=12)
            )
            
        elif group_by == 'age_group':
            # 按年龄分组
            surv_data['age_group'] = pd.cut(
                surv_data['age'],
                bins=[18, 40, 60, 80, 100],
                labels=['18-40岁', '41-60岁', '61-80岁', '80岁以上']
            )
            
            colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']
            
            for i, (group_name, group_data) in enumerate(surv_data.groupby('age_group')):
                if len(group_data) > 0:
                    kmf = KaplanMeierFitter()
                    kmf.fit(
                        group_data['length_of_stay'].values,
                        event_observed=group_data['readmission_within_30'].astype(int).values,
                        label=group_name
                    )
                    
                    fig.add_trace(go.Scatter(
                        x=kmf.survival_function_.index,
                        y=kmf.survival_function_[group_name],
                        mode='lines',
                        name=group_name,
                        line=dict(color=colors[i % len(colors)], width=2)
                    ))
        
        else:
            # 总体生存曲线
            kmf = KaplanMeierFitter()
            kmf.fit(T, event_observed=E, label='总体')
            
            fig.add_trace(go.Scatter(
                x=kmf.survival_function_.index,
                y=kmf.survival_function_['总体'],
                mode='lines',
                name='总体',
                line=dict(color='#1f77b4', width=2)
            ))
            
            # 添加置信区间
            ci_lower = kmf.confidence_interval_['KM_estimate_lower_0.95']
            ci_upper = kmf.confidence_interval_['KM_estimate_upper_0.95']
            
            fig.add_trace(go.Scatter(
                x=list(ci_lower.index) + list(ci_upper.index)[::-1],
                y=list(ci_lower) + list(ci_upper)[::-1],
                fill='toself',
                fillcolor='rgba(31, 119, 180, 0.2)',
                line=dict(color='rgba(255,255,255,0)'),
                showlegend=False,
                name='95%置信区间'
            ))
        
        # 更新布局
        title = 'Kaplan-Meier生存曲线（无再入院生存率）'
        if disease_name:
            title = f'{disease_name} - {title}'
        
        fig.update_layout(
            title=title,
            xaxis_title='住院时长（天）',
            yaxis_title='无再入院生存率',
            xaxis=dict(range=[0, max(T) * 1.1]),
            yaxis=dict(range=[0, 1.05]),
            legend=dict(
                yanchor='top',
                y=0.99,
                xanchor='left',
                x=0.01
            ),
            height=500,
            width=800
        )
        
        return fig
    
    def create_geographic_heatmap(self, 
                                    disease_name: Optional[str] = None) -> go.Figure:
        """
        创建地理分布热力图
        
        展示不同地区的疾病发病率
        """
        # 准备数据
        region_data = self.merged_hospitalizations.copy()
        
        if disease_name:
            region_data = region_data[region_data['main_diagnosis'] == disease_name]
        
        # 按地区统计
        region_stats = region_data.groupby('region').agg(
            patient_count=('patient_id', 'nunique'),
            admission_count=('hospitalization_id', 'count'),
            avg_length_of_stay=('length_of_stay', 'mean'),
            total_cost=('total_cost', 'sum'),
            readmission_rate=('readmission_within_30', 'mean')
        ).reset_index()
        
        # 计算发病率（基于该地区的患者总数）
        region_patients = self.patients_df.groupby('region').agg(
            total_patients=('patient_id', 'nunique')
        ).reset_index()
        
        region_stats = pd.merge(region_stats, region_patients, on='region', how='left')
        region_stats['incidence_rate_per_1000'] = (
            region_stats['patient_count'] / region_stats['total_patients'] * 1000
        )
        
        # 准备地理数据
        # 由于没有真实的地理坐标，使用模拟的坐标
        # 中国主要城市坐标
        region_coords = {
            '北京市': {'lat': 39.9042, 'lon': 116.4074},
            '上海市': {'lat': 31.2304, 'lon': 121.4737},
            '广州市': {'lat': 23.1291, 'lon': 113.2644},
            '深圳市': {'lat': 22.5431, 'lon': 114.0579},
            '杭州市': {'lat': 30.2741, 'lon': 120.1551},
            '南京市': {'lat': 32.0603, 'lon': 118.7969},
            '武汉市': {'lat': 30.5928, 'lon': 114.3055},
            '成都市': {'lat': 30.5728, 'lon': 104.0668},
            '重庆市': {'lat': 29.4316, 'lon': 106.9123},
            '西安市': {'lat': 34.3416, 'lon': 108.9398},
            '天津市': {'lat': 39.0842, 'lon': 117.2009},
            '苏州市': {'lat': 31.2989, 'lon': 120.5853},
            '郑州市': {'lat': 34.7466, 'lon': 113.6254},
            '长沙市': {'lat': 28.2282, 'lon': 112.9388},
            '东莞市': {'lat': 23.0207, 'lon': 113.7518},
            '青岛市': {'lat': 36.0671, 'lon': 120.3826},
            '沈阳市': {'lat': 41.8057, 'lon': 123.4315},
            '宁波市': {'lat': 29.8683, 'lon': 121.5440},
            '昆明市': {'lat': 25.0389, 'lon': 102.7183},
            '大连市': {'lat': 38.9140, 'lon': 121.6147}
        }
        
        # 添加坐标
        region_stats['lat'] = region_stats['region'].map(
            lambda x: region_coords.get(x, {}).get('lat', 35)
        )
        region_stats['lon'] = region_stats['region'].map(
            lambda x: region_coords.get(x, {}).get('lon', 110)
        )
        
        # 创建气泡地图
        fig = px.scatter_mapbox(
            region_stats,
            lat='lat',
            lon='lon',
            size='incidence_rate_per_1000',
            color='incidence_rate_per_1000',
            hover_name='region',
            hover_data={
                'patient_count': True,
                'admission_count': True,
                'avg_length_of_stay': ':.2f',
                'readmission_rate': ':.2%',
                'incidence_rate_per_1000': ':.2f'
            },
            color_continuous_scale='RdYlGn_r',
            size_max=50,
            zoom=3,
            mapbox_style='carto-positron'
        )
        
        # 更新布局
        title = '地区疾病发病率热力图'
        if disease_name:
            title = f'{disease_name} - {title}'
        
        fig.update_layout(
            title=title,
            mapbox=dict(
                center=dict(lat=35, lon=110),
                zoom=3
            ),
            height=600,
            width=900
        )
        
        return fig
    
    def create_disease_trend_chart(self, 
                                     disease_name: str,
                                     time_granularity: str = 'monthly') -> go.Figure:
        """
        创建疾病发病率时序趋势图
        """
        # 准备数据
        hosp_data = self.merged_hospitalizations.copy()
        hosp_data = hosp_data[hosp_data['main_diagnosis'] == disease_name]
        
        if time_granularity == 'monthly':
            hosp_data['time_period'] = hosp_data['admission_date'].dt.to_period('M')
        elif time_granularity == 'quarterly':
            hosp_data['time_period'] = hosp_data['admission_date'].dt.to_period('Q')
        else:  # yearly
            hosp_data['time_period'] = hosp_data['admission_date'].dt.year
        
        # 按时间统计
        trend_data = hosp_data.groupby('time_period').agg(
            admission_count=('hospitalization_id', 'count'),
            patient_count=('patient_id', 'nunique'),
            avg_length_of_stay=('length_of_stay', 'mean'),
            total_cost=('total_cost', 'sum'),
            readmission_rate=('readmission_within_30', 'mean')
        ).reset_index()
        
        # 转换为字符串以便绘图
        trend_data['time_period'] = trend_data['time_period'].astype(str)
        
        # 创建子图
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                '月度入院量趋势',
                '平均住院日趋势',
                '再入院率趋势',
                '总费用趋势'
            ),
            vertical_spacing=0.15,
            horizontal_spacing=0.1
        )
        
        # 入院量趋势
        fig.add_trace(
            go.Scatter(
                x=trend_data['time_period'],
                y=trend_data['admission_count'],
                mode='lines+markers',
                name='入院量',
                line=dict(color='#1f77b4', width=2),
                marker=dict(size=6)
            ),
            row=1, col=1
        )
        
        # 平均住院日趋势
        fig.add_trace(
            go.Scatter(
                x=trend_data['time_period'],
                y=trend_data['avg_length_of_stay'],
                mode='lines+markers',
                name='平均住院日',
                line=dict(color='#ff7f0e', width=2),
                marker=dict(size=6)
            ),
            row=1, col=2
        )
        
        # 再入院率趋势
        fig.add_trace(
            go.Bar(
                x=trend_data['time_period'],
                y=trend_data['readmission_rate'],
                name='再入院率',
                marker_color='#2ca02c',
                opacity=0.7
            ),
            row=2, col=1
        )
        
        # 总费用趋势
        fig.add_trace(
            go.Bar(
                x=trend_data['time_period'],
                y=trend_data['total_cost'],
                name='总费用',
                marker_color='#d62728',
                opacity=0.7
            ),
            row=2, col=2
        )
        
        # 更新布局
        fig.update_layout(
            title_text=f'{disease_name} - 时序趋势分析',
            title_font_size=18,
            height=700,
            width=1000,
            showlegend=False
        )
        
        # 更新y轴标签
        fig.update_yaxes(title_text='入院量', row=1, col=1)
        fig.update_yaxes(title_text='天数', row=1, col=2)
        fig.update_yaxes(title_text='比例', row=2, col=1)
        fig.update_yaxes(title_text='费用', row=2, col=2)
        
        return fig
    
    def create_age_gender_distribution(self, disease_name: Optional[str] = None) -> go.Figure:
        """
        创建年龄性别分布金字塔图
        """
        # 准备数据
        data = self.merged_hospitalizations.copy()
        
        if disease_name:
            data = data[data['main_diagnosis'] == disease_name]
        
        # 创建年龄分组
        data['age_group'] = pd.cut(
            data['age'],
            bins=[18, 30, 40, 50, 60, 70, 80, 90, 100],
            labels=['18-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '90+']
        )
        
        # 按年龄和性别统计
        dist_data = data.groupby(['age_group', 'gender']).agg(
            count=('patient_id', 'nunique')
        ).reset_index()
        
        # 准备金字塔数据
        male_data = dist_data[dist_data['gender'] == '男'].copy()
        female_data = dist_data[dist_data['gender'] == '女'].copy()
        
        # 男性使用负值（向左）
        male_data['count'] = -male_data['count']
        
        # 创建图形
        fig = go.Figure()
        
        # 男性
        fig.add_trace(go.Bar(
            y=male_data['age_group'],
            x=male_data['count'],
            name='男性',
            orientation='h',
            marker=dict(color='#1f77b4'),
            hovertemplate='年龄组: %{y}<br>男性人数: %{customdata}<extra></extra>',
            customdata=[abs(x) for x in male_data['count']]
        ))
        
        # 女性
        fig.add_trace(go.Bar(
            y=female_data['age_group'],
            x=female_data['count'],
            name='女性',
            orientation='h',
            marker=dict(color='#ff7f0e'),
            hovertemplate='年龄组: %{y}<br>女性人数: %{x}<extra></extra>'
        ))
        
        # 更新布局
        title = '患者年龄性别分布'
        if disease_name:
            title = f'{disease_name} - {title}'
        
        fig.update_layout(
            title=title,
            xaxis=dict(
                title='患者人数',
                tickvals=[-200, -150, -100, -50, 0, 50, 100, 150, 200],
                ticktext=['200', '150', '100', '50', '0', '50', '100', '150', '200']
            ),
            yaxis=dict(title='年龄组'),
            barmode='relative',
            bargap=0.1,
            height=500,
            width=800,
            legend=dict(
                orientation='h',
                yanchor='bottom',
                y=1.02,
                xanchor='right',
                x=1
            )
        )
        
        return fig
    
    def create_comparison_chart(self, 
                                 metrics: List[str] = ['admission_count', 'avg_length_of_stay', 
                                                       'readmission_rate', 'total_cost'],
                                 top_n: int = 10) -> go.Figure:
        """
        创建疾病比较图表
        """
        # 按疾病统计
        disease_stats = self.merged_hospitalizations.groupby('main_diagnosis').agg(
            admission_count=('hospitalization_id', 'count'),
            patient_count=('patient_id', 'nunique'),
            avg_length_of_stay=('length_of_stay', 'mean'),
            total_cost=('total_cost', 'sum'),
            avg_cost_per_day=('total_cost', lambda x: x.sum() / self.merged_hospitalizations.loc[x.index, 'length_of_stay'].sum()),
            readmission_rate=('readmission_within_30', 'mean'),
            complication_rate=('has_complications_during_stay', 'mean'),
            surgery_rate=('surgery_performed', 'mean')
        ).reset_index()
        
        # 按入院量排序
        disease_stats = disease_stats.sort_values('admission_count', ascending=False).head(top_n)
        
        # 创建子图
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                '入院量排名',
                '平均住院日',
                '再入院率',
                '平均费用'
            ),
            vertical_spacing=0.2,
            horizontal_spacing=0.15
        )
        
        # 入院量排名
        fig.add_trace(
            go.Bar(
                x=disease_stats['main_diagnosis'],
                y=disease_stats['admission_count'],
                name='入院量',
                marker_color='#1f77b4',
                text=disease_stats['admission_count'],
                textposition='auto'
            ),
            row=1, col=1
        )
        
        # 平均住院日
        fig.add_trace(
            go.Bar(
                x=disease_stats['main_diagnosis'],
                y=disease_stats['avg_length_of_stay'],
                name='平均住院日',
                marker_color='#ff7f0e',
                text=disease_stats['avg_length_of_stay'].round(1),
                textposition='auto'
            ),
            row=1, col=2
        )
        
        # 再入院率
        fig.add_trace(
            go.Bar(
                x=disease_stats['main_diagnosis'],
                y=disease_stats['readmission_rate'],
                name='再入院率',
                marker_color='#2ca02c',
                text=(disease_stats['readmission_rate'] * 100).round(1).astype(str) + '%',
                textposition='auto'
            ),
            row=2, col=1
        )
        
        # 平均费用
        fig.add_trace(
            go.Bar(
                x=disease_stats['main_diagnosis'],
                y=disease_stats['avg_cost_per_day'],
                name='日均费用',
                marker_color='#d62728',
                text=disease_stats['avg_cost_per_day'].round(0).astype(int),
                textposition='auto'
            ),
            row=2, col=2
        )
        
        # 更新布局
        fig.update_layout(
            title_text='疾病指标比较分析',
            title_font_size=18,
            height=700,
            width=1100,
            showlegend=False
        )
        
        # 旋转x轴标签
        fig.update_xaxes(tickangle=45)
        
        return fig


if __name__ == '__main__':
    # 示例用法
    import os
    
    # 加载数据
    data_dir = 'data'
    if os.path.exists(data_dir):
        patients_df = pd.read_csv(os.path.join(data_dir, 'patients.csv'))
        diagnoses_df = pd.read_csv(os.path.join(data_dir, 'diagnoses.csv'))
        hospitalizations_df = pd.read_csv(os.path.join(data_dir, 'hospitalizations.csv'))
        
        # 创建可视化器
        visualizer = HealthcareVisualizer(
            patients_df, diagnoses_df, hospitalizations_df
        )
        
        # 创建Sankey图
        print("创建诊疗路径Sankey图...")
        sankey_fig = visualizer.create_sankey_treatment_path(top_n_diseases=5)
        # sankey_fig.show()  # 在Dash中显示
        
        # 创建Kaplan-Meier生存曲线
        print("创建Kaplan-Meier生存曲线...")
        km_fig = visualizer.create_kaplan_meier_curve(group_by='gender')
        # km_fig.show()
        
        # 创建地理热力图
        print("创建地理分布热力图...")
        geo_fig = visualizer.create_geographic_heatmap()
        # geo_fig.show()
        
        # 创建疾病趋势图
        print("创建疾病趋势图...")
        # 获取最常见的疾病
        top_disease = hospitalizations_df['main_diagnosis'].value_counts().index[0]
        trend_fig = visualizer.create_disease_trend_chart(top_disease)
        # trend_fig.show()
        
        # 创建年龄性别分布
        print("创建年龄性别分布图...")
        age_gender_fig = visualizer.create_age_gender_distribution()
        # age_gender_fig.show()
        
        # 创建疾病比较图
        print("创建疾病比较图...")
        comparison_fig = visualizer.create_comparison_chart()
        # comparison_fig.show()
        
        print("\n可视化模块创建完成！")
