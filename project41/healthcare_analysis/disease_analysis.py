import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import statsmodels.api as sm
from statsmodels.tsa.seasonal import seasonal_decompose
from scipy import stats


class DiseaseTrendAnalyzer:
    """疾病发病率时序趋势分析器"""
    
    def __init__(self, patients_df: pd.DataFrame, diagnoses_df: pd.DataFrame):
        self.patients_df = patients_df.copy()
        self.diagnoses_df = diagnoses_df.copy()
        
        # 预处理数据
        self._preprocess_data()
        
    def _preprocess_data(self):
        """数据预处理"""
        # 转换日期格式
        self.diagnoses_df['diagnosis_date'] = pd.to_datetime(self.diagnoses_df['diagnosis_date'])
        self.patients_df['birth_date'] = pd.to_datetime(self.patients_df['birth_date'])
        
        # 合并患者信息
        self.merged_df = pd.merge(
            self.diagnoses_df,
            self.patients_df[['patient_id', 'gender', 'age', 'region']],
            on='patient_id',
            how='left'
        )
        
        # 创建时间特征
        self.merged_df['diagnosis_year'] = self.merged_df['diagnosis_date'].dt.year
        self.merged_df['diagnosis_month'] = self.merged_df['diagnosis_date'].dt.month
        self.merged_df['diagnosis_quarter'] = self.merged_df['diagnosis_date'].dt.quarter
        self.merged_df['diagnosis_year_month'] = self.merged_df['diagnosis_date'].dt.to_period('M')
        
        # 创建年龄分组
        self.merged_df['age_group'] = pd.cut(
            self.merged_df['age'],
            bins=[18, 30, 40, 50, 60, 70, 80, 90, 100],
            labels=['18-30岁', '31-40岁', '41-50岁', '51-60岁', 
                   '61-70岁', '71-80岁', '81-90岁', '90岁以上']
        )
    
    def get_disease_list(self) -> List[str]:
        """获取所有疾病列表"""
        return sorted(self.merged_df['disease_name'].unique().tolist())
    
    def get_region_list(self) -> List[str]:
        """获取所有地区列表"""
        return sorted(self.merged_df['region'].unique().tolist())
    
    def calculate_incidence_rate(self, 
                                   disease_name: Optional[str] = None,
                                   time_granularity: str = 'monthly',
                                   stratify_by: Optional[List[str]] = None) -> pd.DataFrame:
        """
        计算发病率
        
        参数:
            disease_name: 疾病名称，如果为None则计算所有疾病
            time_granularity: 时间粒度 ('yearly', 'quarterly', 'monthly')
            stratify_by: 分层变量列表 ['gender', 'age_group', 'region']
        
        返回:
            包含发病率的DataFrame
        """
        # 过滤数据
        df = self.merged_df.copy()
        
        if disease_name:
            df = df[df['disease_name'] == disease_name]
        
        # 确定时间分组列
        time_col_map = {
            'yearly': 'diagnosis_year',
            'quarterly': 'diagnosis_quarter',
            'monthly': 'diagnosis_year_month'
        }
        time_col = time_col_map.get(time_granularity, 'diagnosis_year_month')
        
        # 构建分组变量
        group_cols = [time_col]
        if stratify_by:
            group_cols.extend(stratify_by)
        
        # 计算病例数
        case_counts = df.groupby(group_cols).agg(
            case_count=('patient_id', 'nunique')
        ).reset_index()
        
        # 计算该时间段的总人口数（这里简化处理，假设所有患者都在风险中）
        # 实际应用中应该使用更精确的风险人口计算
        total_patients = len(self.patients_df)
        
        # 计算发病率（每1000人口）
        case_counts['incidence_rate_per_1000'] = (
            case_counts['case_count'] / total_patients * 1000
        )
        
        return case_counts
    
    def analyze_time_series(self, 
                         disease_name: str,
                         time_granularity: str = 'monthly') -> Dict:
        """
        时序分析 - 检测趋势、季节性和异常值
        
        参数:
            disease_name: 疾病名称
            time_granularity: 时间粒度
        
        返回:
            包含时序分析结果的字典
        """
        # 获取发病率数据
        incidence_df = self.calculate_incidence_rate(
            disease_name=disease_name,
            time_granularity=time_granularity
        )
        
        # 准备时序数据
        if time_granularity == 'monthly':
            # 转换为datetime索引
            incidence_df['time'] = incidence_df['diagnosis_year_month'].dt.to_timestamp()
            incidence_df = incidence_df.set_index('time').sort_index()
        else:
            # 对于年度/季度数据
            incidence_df = incidence_df.sort_values(by=list(incidence_df.columns[:1))
        
        # 提取发病率序列
        ts_data = incidence_df['incidence_rate_per_1000'].values
        
        # 趋势分析
        trend_analysis = self._detect_trend(incidence_df, 'incidence_rate_per_1000')
        
        # 季节性分析（仅月度数据）
        seasonal_analysis = None
        if time_granularity == 'monthly' and len(ts_data) >= 24:
            seasonal_analysis = self._detect_seasonality(incidence_df, 'incidence_rate_per_1000')
        
        # 异常值检测
        outliers = self._detect_outliers(ts_data)
        
        # 预测未来趋势
        forecast = self._forecast_trend(incidence_df, 'incidence_rate_per_1000', periods=12)
        
        return {
            'disease_name': disease_name,
            'time_granularity': time_granularity,
            'incidence_data': incidence_df,
            'trend_analysis': trend_analysis,
            'seasonal_analysis': seasonal_analysis,
            'outliers': outliers,
            'forecast': forecast
        }
    
    def _detect_trend(self, df: pd.DataFrame, value_col: str) -> Dict:
        """检测时间序列的趋势"""
        values = df[value_col].values
        time_indices = np.arange(len(values))
        
        # 线性回归
        slope, intercept, r_value, p_value, std_err = stats.linregress(time_indices, values)
        
        # 计算年变化率
        annual_change = slope * 12  # 假设月度数据
        
        # 趋势方向
        trend_direction = '上升' if slope > 0 else '下降' if slope < 0 else '稳定'
        
        # 统计显著性
        is_significant = p_value < 0.05
        
        return {
            'slope': slope,
            'intercept': intercept,
            'r_squared': r_value ** 2,
            'p_value': p_value,
            'annual_change_rate': annual_change,
            'trend_direction': trend_direction,
            'is_statistically_significant': is_significant,
            'description': f"{trend_direction}趋势 (p={p_value:.4f}, R²={r_value**2:.4f})"
        }
    
    def _detect_seasonality(self, df: pd.DataFrame, value_col: str) -> Dict:
        """检测季节性"""
        # 使用季节性分解
        ts = df[value_col]
        
        # 确保有足够的数据点
        if len(ts) < 24:
            return {'error': '数据点不足，无法进行季节性分析'}
        
        try:
            result = seasonal_decompose(ts, model='additive', period=12)
            
            # 计算季节性强度
            seasonal_strength = np.var(result.seasonal) / (np.var(result.seasonal) + np.var(result.resid))
            
            # 找出高峰月份
            seasonal_components = result.seasonal.groupby(result.seasonal.index.month).mean()
            peak_month = seasonal_components.idxmax()
            trough_month = seasonal_components.idxmin()
            
            return {
                'has_seasonality': seasonal_strength > 0.3,
                'seasonal_strength': seasonal_strength,
                'peak_month': peak_month,
                'trough_month': trough_month,
                'monthly_pattern': seasonal_components.to_dict(),
                'description': f"季节性强度: {seasonal_strength:.2f}, 高峰月份: {peak_month}月, 低谷月份: {trough_month}月"
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _detect_outliers(self, data: np.ndarray, method: str = 'iqr') -> Dict:
        """检测异常值"""
        if method == 'iqr':
            # IQR方法
            Q1 = np.percentile(data, 25)
            Q3 = np.percentile(data, 75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = np.where((data < lower_bound) | (data > upper_bound))[0]
            
            return {
                'method': 'IQR',
                'lower_bound': lower_bound,
                'upper_bound': upper_bound,
                'outlier_indices': outliers.tolist(),
                'outlier_values': [data[i] for i in outliers],
                'outlier_count': len(outliers)
            }
        elif method == 'zscore':
            # Z-score方法
            z_scores = np.abs(stats.zscore(data))
            outliers = np.where(z_scores > 3)[0]
            
            return {
                'method': 'Z-score',
                'threshold': 3,
                'outlier_indices': outliers.tolist(),
                'outlier_values': [data[i] for i in outliers],
                'outlier_count': len(outliers)
            }
        
        return {}
    
    def _forecast_trend(self, df: pd.DataFrame, value_col: str, periods: int = 12) -> Dict:
        """预测未来趋势"""
        values = df[value_col].values
        time_indices = np.arange(len(values))
        
        # 简单线性回归预测
        slope, intercept, r_value, p_value, std_err = stats.linregress(time_indices, values)
        
        # 预测未来值
        future_indices = np.arange(len(values), len(values) + periods)
        predicted_values = intercept + slope * future_indices
        
        # 计算预测区间
        prediction_std = std_err * np.sqrt(1 + 1/len(values) + 
                                         (future_indices - np.mean(time_indices))**2 / 
                                         np.sum((time_indices - np.mean(time_indices))**2))
        
        confidence_level = 0.95
        t_value = stats.t.ppf((1 + confidence_level) / 2, len(values) - 2)
        margin_of_error = t_value * prediction_std
        
        lower_bounds = predicted_values - margin_of_error
        upper_bounds = predicted_values + margin_of_error
        
        return {
            'method': '线性回归预测',
            'periods': periods,
            'predicted_values': predicted_values.tolist(),
            'lower_confidence_bounds': lower_bounds.tolist(),
            'upper_confidence_bounds': upper_bounds.tolist(),
            'slope': slope,
            'intercept': intercept,
            'r_squared': r_value ** 2
        }
    
    def compare_groups(self, 
                       disease_name: str,
                       group_by: str,
                       time_granularity: str = 'yearly') -> pd.DataFrame:
        """
        比较不同分组的发病率
        
        参数:
            disease_name: 疾病名称
            group_by: 分组变量 ('gender', 'age_group', 'region')
            time_granularity: 时间粒度
        
        返回:
            包含分组比较的DataFrame
        """
        # 获取分层发病率
        incidence_df = self.calculate_incidence_rate(
            disease_name=disease_name,
            time_granularity=time_granularity,
            stratify_by=[group_by]
        )
        
        # 计算总体发病率
        overall_incidence = self.calculate_incidence_rate(
            disease_name=disease_name,
            time_granularity=time_granularity
        )
        overall_incidence[group_by] = '总体'
        
        # 合并数据
        comparison_df = pd.concat([incidence_df, overall_incidence], ignore_index=True)
        
        # 统计检验
        groups = incidence_df[group_by].unique()
        if len(groups) >= 2:
            # 卡方检验比较比例
            pass
        
        return comparison_df
    
    def calculate_age_gender_adjusted_rate(self, 
                                            disease_name: str,
                                            time_granularity: str = 'yearly') -> pd.DataFrame:
        """
        计算年龄性别调整后的发病率（标准化率）
        
        使用直接标准化法
        """
        # 获取分层数据
        stratified_df = self.calculate_incidence_rate(
            disease_name=disease_name,
            time_granularity=time_granularity,
            stratify_by=['age_group', 'gender']
        )
        
        # 获取标准人口分布（这里使用研究人群作为标准
        standard_population = self.patients_df.groupby(['age_group', 'gender']).size().reset_index(name='standard_count')
        total_standard = standard_population['standard_count'].sum()
        standard_population['standard_weight'] = standard_population['standard_count'] / total_standard
        
        # 合并权重
        merged = pd.merge(stratified_df, standard_population, 
                       on=['age_group', 'gender'], how='left')
        
        # 计算标准化率
        merged['weighted_rate'] = merged['incidence_rate_per_1000'] * merged['standard_weight']
        
        # 按时间分组计算标准化率
        time_col_map = {
            'yearly': 'diagnosis_year',
            'quarterly': 'diagnosis_quarter',
            'monthly': 'diagnosis_year_month'
        }
        time_col = time_col_map.get(time_granularity, 'diagnosis_year')
        
        adjusted_rates = merged.groupby(time_col).agg(
            adjusted_rate_per_1000=('weighted_rate', 'sum'),
            crude_rate_per_1000=('incidence_rate_per_1000', 'mean')
        ).reset_index()
        
        return adjusted_rates
    
    def get_disease_summary(self, disease_name: str) -> Dict:
        """获取疾病的汇总统计信息"""
        df = self.merged_df[self.merged_df['disease_name'] == disease_name]
        
        total_cases = len(df)
        unique_patients = df['patient_id'].nunique()
        
        # 时间范围
        date_range = f"{df['diagnosis_date'].min().strftime('%Y-%m-%d') + ' 至 ' + \
                    df['diagnosis_date'].max().strftime('%Y-%m-%d')
        
        # 性别分布
        gender_dist = df.groupby('gender').agg(
            count=('patient_id', 'nunique'),
            percentage=('patient_id', lambda x: x.nunique() / unique_patients * 100)
        ).to_dict('index')
        
        # 年龄分布
        age_dist = df.groupby('age_group').agg(
            count=('patient_id', 'nunique'),
            percentage=('patient_id', lambda x: x.nunique() / unique_patients * 100)
        ).to_dict('index')
        
        # 地区分布
        region_dist = df.groupby('region').agg(
            count=('patient_id', 'nunique'),
            percentage=('patient_id', lambda x: x.nunique() / unique_patients * 100)
        ).sort_values('count', ascending=False).to_dict('index')
        
        # 严重程度分布
        severity_dist = df.groupby('severity').agg(
            count=('patient_id', 'count'),
            percentage=('patient_id', lambda x: x.count() / total_cases * 100)
        ).to_dict('index')
        
        # 诊断类型分布
        diagnosis_type_dist = df.groupby('diagnosis_type').agg(
            count=('patient_id', 'count'),
            percentage=('patient_id', lambda x: x.count() / total_cases * 100)
        ).to_dict('index')
        
        # 月份分布（季节性）
        monthly_dist = df.groupby('diagnosis_month').agg(
            count=('patient_id', 'count')
        ).to_dict('index')
        
        return {
            'disease_name': disease_name,
            'total_cases': total_cases,
            'unique_patients': unique_patients,
            'date_range': date_range,
            'gender_distribution': gender_dist,
            'age_distribution': age_dist,
            'region_distribution': region_dist,
            'severity_distribution': severity_dist,
            'diagnosis_type_distribution': diagnosis_type_dist,
            'monthly_distribution': monthly_dist,
            'average_age': df['age'].mean(),
            'median_age': df['age'].median(),
            'age_std': df['age'].std()
        }
    
    def get_top_diseases(self, top_n: int = 10) -> pd.DataFrame:
        """获取发病率最高的前N种疾病"""
        top_diseases = self.merged_df.groupby('disease_name').agg(
            total_cases=('patient_id', 'count'),
            unique_patients=('patient_id', 'nunique'),
            first_diagnosis=('diagnosis_date', 'min'),
            last_diagnosis=('diagnosis_date', 'max')
        ).sort_values('total_cases', ascending=False).head(top_n).reset_index()
        
        # 计算每1000人口发病率
        total_patients = len(self.patients_df)
        top_diseases['incidence_per_1000'] = (
            top_diseases['unique_patients'] / total_patients * 1000
        )
        
        return top_diseases


if __name__ == '__main__':
    # 示例用法
    import os
    
    # 加载数据
    data_dir = 'data'
    if os.path.exists(data_dir):
        patients_df = pd.read_csv(os.path.join(data_dir, 'patients.csv'))
        diagnoses_df = pd.read_csv(os.path.join(data_dir, 'diagnoses.csv'))
        
        # 创建分析器
        analyzer = DiseaseTrendAnalyzer(patients_df, diagnoses_df)
        
        # 获取疾病列表
        print("疾病列表:")
        print(analyzer.get_disease_list())
        
        # 获取发病率最高的疾病
        print("\n发病率最高的10种疾病:")
        top_diseases = analyzer.get_top_diseases(10)
        print(top_diseases)
        
        # 分析特定疾病的时序趋势
        if len(top_diseases) > 0:
            disease_name = top_diseases.iloc[0]['disease_name']
            print(f"\n分析疾病: {disease_name}")
            
            # 时序分析
            ts_analysis = analyzer.analyze_time_series(disease_name, time_granularity='monthly')
            print(f"趋势分析: {ts_analysis['trend_analysis']['description']}")
            
            # 年龄性别调整后的发病率
            adjusted_rates = analyzer.calculate_age_gender_adjusted_rate(disease_name)
            print(f"\n年龄性别调整后的发病率:")
            print(adjusted_rates)
