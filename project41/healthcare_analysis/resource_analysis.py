import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')


class ResourceUtilizationAnalyzer:
    """医疗资源利用分析器"""
    
    def __init__(self, hospitalizations_df: pd.DataFrame,
                 patients_df: pd.DataFrame,
                 diagnoses_df: pd.DataFrame):
        self.hospitalizations_df = hospitalizations_df.copy()
        self.patients_df = patients_df.copy()
        self.diagnoses_df = diagnoses_df.copy()
        
        # 预处理数据
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
        
        # 创建时间特征
        self.hospitalizations_df['admission_year'] = self.hospitalizations_df['admission_date'].dt.year
        self.hospitalizations_df['admission_month'] = self.hospitalizations_df['admission_date'].dt.month
        self.hospitalizations_df['admission_quarter'] = self.hospitalizations_df['admission_date'].dt.quarter
        self.hospitalizations_df['admission_day_of_week'] = self.hospitalizations_df['admission_date'].dt.dayofweek
        self.hospitalizations_df['admission_year_month'] = self.hospitalizations_df['admission_date'].dt.to_period('M')
        
        # 合并患者和诊断信息
        self.merged_df = pd.merge(
            self.hospitalizations_df,
            self.patients_df[['patient_id', 'age', 'gender', 'region']],
            on='patient_id',
            how='left'
        )
        
    def analyze_length_of_stay(self) -> Dict:
        """分析住院日分布"""
        los_data = self.hospitalizations_df['length_of_stay']
        
        # 基本统计
        stats = {
            'mean_los': los_data.mean(),
            'median_los': los_data.median(),
            'std_los': los_data.std(),
            'min_los': los_data.min(),
            'max_los': los_data.max(),
            'total_hospital_days': los_data.sum(),
            'admissions_count': len(los_data)
        }
        
        # 住院日分布区间
        los_bins = pd.cut(
            los_data,
            bins=[0, 3, 7, 14, 30, 60, float('inf')],
            labels=['1-3天', '4-7天', '8-14天', '15-30天', '31-60天', '60天以上']
        )
        los_distribution = los_bins.value_counts().sort_index().to_dict()
        
        # 按科室的住院日
        dept_los = self.hospitalizations_df.groupby('admission_department').agg(
            mean_los=('length_of_stay', 'mean'),
            median_los=('length_of_stay', 'median'),
            total_admissions=('hospitalization_id', 'count'),
            total_los_days=('length_of_stay', 'sum')
        ).sort_values('mean_los', ascending=False).reset_index()
        
        # 按疾病的住院日
        disease_los = self.hospitalizations_df.groupby('main_diagnosis').agg(
            mean_los=('length_of_stay', 'mean'),
            median_los=('length_of_stay', 'median'),
            total_admissions=('hospitalization_id', 'count'),
            total_los_days=('length_of_stay', 'sum')
        ).sort_values('total_admissions', ascending=False).head(20).reset_index()
        
        # 按严重程度的住院日
        # 需要合并诊断数据来获取严重程度
        merged_with_diagnosis = pd.merge(
            self.hospitalizations_df,
            self.diagnoses_df[['diagnosis_id', 'severity']],
            left_on='main_diagnosis_id',
            right_on='diagnosis_id',
            how='left'
        )
        
        severity_los = merged_with_diagnosis.groupby('severity').agg(
            mean_los=('length_of_stay', 'mean'),
            median_los=('length_of_stay', 'median'),
            total_admissions=('hospitalization_id', 'count'),
            total_los_days=('length_of_stay', 'sum')
        ).reset_index()
        
        # ICU住院分析
        icu_data = self.hospitalizations_df[self.hospitalizations_df['icu_stay_days'] > 0]
        icu_stats = {
            'icu_admissions_count': len(icu_data),
            'icu_admission_ratio': len(icu_data) / len(self.hospitalizations_df),
            'mean_icu_days': icu_data['icu_stay_days'].mean(),
            'median_icu_days': icu_data['icu_stay_days'].median(),
            'total_icu_days': icu_data['icu_stay_days'].sum()
        }
        
        return {
            'basic_statistics': stats,
            'los_distribution': los_distribution,
            'department_los': dept_los,
            'disease_los': disease_los,
            'severity_los': severity_los,
            'icu_statistics': icu_stats
        }
    
    def analyze_department_workload(self) -> Dict:
        """分析科室负荷"""
        # 按科室统计
        dept_stats = self.hospitalizations_df.groupby('admission_department').agg(
            total_admissions=('hospitalization_id', 'count'),
            total_los_days=('length_of_stay', 'sum'),
            mean_los=('length_of_stay', 'mean'),
            total_icu_days=('icu_stay_days', 'sum'),
            surgery_count=('surgery_performed', 'sum'),
            complication_count=('has_complications_during_stay', 'sum'),
            readmission_count=('readmission_within_30', 'sum')
        ).reset_index()
        
        # 计算科室负荷指标
        dept_stats['workload_score'] = (
            dept_stats['total_los_days'] * 0.4 +
            dept_stats['surgery_count'] * 0.3 +
            dept_stats['complication_count'] * 0.2 +
            dept_stats['readmission_count'] * 0.1
        )
        
        # 归一化负荷评分
        max_workload = dept_stats['workload_score'].max()
        dept_stats['normalized_workload'] = dept_stats['workload_score'] / max_workload
        
        # 按时间的科室负荷
        # 月度科室入院量
        monthly_dept = self.hospitalizations_df.groupby(
            ['admission_year_month', 'admission_department']
        ).agg(
            admissions=('hospitalization_id', 'count'),
            total_los=('length_of_stay', 'sum')
        ).reset_index()
        
        # 季度科室负荷
        quarterly_dept = self.hospitalizations_df.groupby(
            ['admission_year', 'admission_quarter', 'admission_department']
        ).agg(
            admissions=('hospitalization_id', 'count'),
            total_los=('length_of_stay', 'sum'),
            mean_los=('length_of_stay', 'mean')
        ).reset_index()
        
        # 床位类型分布
        bed_type_dist = self.hospitalizations_df.groupby(
            ['admission_department', 'bed_type']
        ).agg(
            count=('hospitalization_id', 'count')
        ).reset_index()
        
        # 入院类型分布
        admission_type_dist = self.hospitalizations_df.groupby(
            ['admission_department', 'admission_type']
        ).agg(
            count=('hospitalization_id', 'count')
        ).reset_index()
        
        # 找出高负荷科室
        high_workload_depts = dept_stats.sort_values(
            'normalized_workload', ascending=False
        ).head(5)
        
        # 找出低负荷科室
        low_workload_depts = dept_stats.sort_values(
            'normalized_workload', ascending=True
        ).head(5)
        
        return {
            'department_statistics': dept_stats.sort_values(
                'normalized_workload', ascending=False
            ),
            'monthly_department_trend': monthly_dept,
            'quarterly_department_trend': quarterly_dept,
            'bed_type_distribution': bed_type_dist,
            'admission_type_distribution': admission_type_dist,
            'high_workload_departments': high_workload_depts,
            'low_workload_departments': low_workload_depts
        }
    
    def analyze_bed_utilization(self) -> Dict:
        """分析床位利用率"""
        # 假设总床位数（基于科室规模估算）
        # 这里使用简化的估算方法
        total_beds = {}
        for dept in self.hospitalizations_df['admission_department'].unique():
            dept_admissions = len(
                self.hospitalizations_df[
                    self.hospitalizations_df['admission_department'] == dept
                ]
            )
            # 基于入院量估算床位数
            total_beds[dept] = max(10, int(dept_admissions / 50))  # 简化估算
        
        # 计算床位利用率
        bed_utilization = []
        
        for dept, beds in total_beds.items():
            dept_data = self.hospitalizations_df[
                self.hospitalizations_df['admission_department'] == dept
            ]
            
            total_los = dept_data['length_of_stay'].sum()
            # 假设分析周期为5年
            total_days = 365 * 5
            total_bed_days = beds * total_days
            
            utilization_rate = total_los / total_bed_days if total_bed_days > 0 else 0
            
            bed_utilization.append({
                'department': dept,
                'estimated_beds': beds,
                'total_patient_days': total_los,
                'total_bed_days': total_bed_days,
                'utilization_rate': min(1.0, utilization_rate),
                'admissions_count': len(dept_data)
            })
        
        bed_utilization_df = pd.DataFrame(bed_utilization)
        
        # 时间序列的床位利用率
        # 按月计算床位需求
        monthly_bed_demand = self.hospitalizations_df.groupby(
            'admission_year_month'
        ).agg(
            admissions=('hospitalization_id', 'count'),
            total_los=('length_of_stay', 'sum'),
            mean_los=('length_of_stay', 'mean')
        ).reset_index()
        
        # 估算月度床位利用率
        # 假设总床位数不变
        total_estimated_beds = sum(total_beds.values())
        monthly_bed_demand['estimated_utilization'] = (
            monthly_bed_demand['total_los'] / (total_estimated_beds * 30)  # 假设每月30天
        )
        
        # 床位类型分析
        bed_type_analysis = self.hospitalizations_df.groupby('bed_type').agg(
            count=('hospitalization_id', 'count'),
            percentage=('hospitalization_id', lambda x: x.count() / len(self.hospitalizations_df) * 100),
            mean_los=('length_of_stay', 'mean'),
            total_los=('length_of_stay', 'sum')
        ).reset_index()
        
        # 按出院方式分析
        discharge_analysis = self.hospitalizations_df.groupby('discharge_type').agg(
            count=('hospitalization_id', 'count'),
            percentage=('hospitalization_id', lambda x: x.count() / len(self.hospitalizations_df) * 100),
            mean_los=('length_of_stay', 'mean')
        ).reset_index()
        
        return {
            'department_bed_utilization': bed_utilization_df.sort_values(
                'utilization_rate', ascending=False
            ),
            'monthly_bed_demand': monthly_bed_demand,
            'bed_type_analysis': bed_type_analysis,
            'discharge_analysis': discharge_analysis,
            'total_estimated_beds': total_estimated_beds,
            'overall_utilization_rate': bed_utilization_df['utilization_rate'].mean()
        }
    
    def forecast_resource_demand(self, forecast_months: int = 12) -> Dict:
        """
        预测医疗资源需求
        
        使用时间序列预测方法预测未来的床位需求和入院量
        """
        print("开始资源需求预测...")
        
        # 准备月度数据
        monthly_data = self.hospitalizations_df.groupby(
            'admission_year_month'
        ).agg(
            admissions=('hospitalization_id', 'count'),
            total_los=('length_of_stay', 'sum'),
            mean_los=('length_of_stay', 'mean'),
            icu_admissions=('icu_stay_days', lambda x: (x > 0).sum()),
            surgery_count=('surgery_performed', 'sum')
        ).reset_index()
        
        # 转换为时间序列索引
        monthly_data['time_index'] = np.arange(len(monthly_data))
        
        # 准备特征
        X = monthly_data[['time_index']].values
        y_admissions = monthly_data['admissions'].values
        y_los = monthly_data['total_los'].values
        
        # 划分训练测试集
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train_adm, y_test_adm = y_admissions[:train_size], y_admissions[train_size:]
        y_train_los, y_test_los = y_los[:train_size], y_los[train_size:]
        
        # 训练入院量预测模型
        adm_model = RandomForestRegressor(n_estimators=100, random_state=42)
        adm_model.fit(X_train, y_train_adm)
        
        # 训练住院日预测模型
        los_model = RandomForestRegressor(n_estimators=100, random_state=42)
        los_model.fit(X_train, y_train_los)
        
        # 预测未来月份
        future_indices = np.arange(len(X), len(X) + forecast_months).reshape(-1, 1)
        
        # 预测
        adm_predictions = adm_model.predict(future_indices)
        los_predictions = los_model.predict(future_indices)
        
        # 模型评估
        adm_pred_test = adm_model.predict(X_test)
        los_pred_test = los_model.predict(X_test)
        
        adm_metrics = {
            'r2': r2_score(y_test_adm, adm_pred_test),
            'mae': mean_absolute_error(y_test_adm, adm_pred_test),
            'rmse': np.sqrt(mean_squared_error(y_test_adm, adm_pred_test))
        }
        
        los_metrics = {
            'r2': r2_score(y_test_los, los_pred_test),
            'mae': mean_absolute_error(y_test_los, los_pred_test),
            'rmse': np.sqrt(mean_squared_error(y_test_los, los_pred_test))
        }
        
        # 创建预测结果DataFrame
        # 生成未来月份
        last_month = monthly_data['admission_year_month'].max()
        future_months = pd.period_range(
            start=last_month + 1,
            periods=forecast_months,
            freq='M'
        )
        
        forecast_df = pd.DataFrame({
            'year_month': future_months,
            'predicted_admissions': adm_predictions.astype(int),
            'predicted_total_los': los_predictions.astype(int),
            'predicted_mean_los': los_predictions / adm_predictions
        })
        
        # 预测床位需求
        # 假设每床每天平均服务1个患者
        # 床位需求 = 平均每天住院人数 / 床位周转率
        avg_daily_patients = forecast_df['predicted_total_los'] / 30  # 假设每月30天
        forecast_df['predicted_bed_demand'] = (avg_daily_patients / 0.85).astype(int)  # 假设85%利用率
        
        # 预测ICU需求
        # 基于历史ICU比例
        icu_ratio = monthly_data['icu_admissions'].mean() / monthly_data['admissions'].mean()
        forecast_df['predicted_icu_admissions'] = (
            forecast_df['predicted_admissions'] * icu_ratio
        ).astype(int)
        
        # 预测手术量
        surgery_ratio = monthly_data['surgery_count'].mean() / monthly_data['admissions'].mean()
        forecast_df['predicted_surgeries'] = (
            forecast_df['predicted_admissions'] * surgery_ratio
        ).astype(int)
        
        # 计算预测汇总
        forecast_summary = {
            'total_predicted_admissions': int(forecast_df['predicted_admissions'].sum()),
            'total_predicted_los_days': int(forecast_df['predicted_total_los'].sum()),
            'avg_monthly_admissions': int(forecast_df['predicted_admissions'].mean()),
            'avg_monthly_bed_demand': int(forecast_df['predicted_bed_demand'].mean()),
            'peak_month_admissions': int(forecast_df['predicted_admissions'].max()),
            'peak_month_bed_demand': int(forecast_df['predicted_bed_demand'].max()),
            'forecast_period': f"{forecast_df['year_month'].min()} to {forecast_df['year_month'].max()}"
        }
        
        return {
            'forecast_details': forecast_df,
            'forecast_summary': forecast_summary,
            'admissions_model_metrics': adm_metrics,
            'los_model_metrics': los_metrics,
            'historical_data': monthly_data
        }
    
    def get_resource_summary(self) -> Dict:
        """获取资源利用汇总报告"""
        los_analysis = self.analyze_length_of_stay()
        dept_analysis = self.analyze_department_workload()
        bed_analysis = self.analyze_bed_utilization()
        
        # 资源预警
        warnings = []
        
        # 检查高负荷科室
        high_workload = dept_analysis['high_workload_departments']
        if len(high_workload) > 0:
            warnings.append({
                'type': '高负荷科室预警',
                'message': f"发现{len(high_workload)}个高负荷科室，建议关注资源配置",
                'departments': high_workload['admission_department'].tolist()
            })
        
        # 检查床位利用率
        high_utilization = bed_analysis['department_bed_utilization'][
            bed_analysis['department_bed_utilization']['utilization_rate'] > 0.9
        ]
        if len(high_utilization) > 0:
            warnings.append({
                'type': '床位紧张预警',
                'message': f"{len(high_utilization)}个科室床位利用率超过90%",
                'departments': high_utilization['department'].tolist()
            })
        
        # 检查长住院日
        long_stay_ratio = los_analysis['los_distribution'].get('31-60天', 0) + \
                          los_analysis['los_distribution'].get('60天以上', 0)
        if long_stay_ratio > 0.1:
            warnings.append({
                'type': '长住院日预警',
                'message': f"超过10%的患者住院日超过30天，建议优化诊疗流程",
                'long_stay_ratio': long_stay_ratio
            })
        
        return {
            'length_of_stay_analysis': los_analysis,
            'department_workload_analysis': dept_analysis,
            'bed_utilization_analysis': bed_analysis,
            'resource_warnings': warnings,
            'overall_metrics': {
                'total_admissions': los_analysis['basic_statistics']['admissions_count'],
                'total_hospital_days': los_analysis['basic_statistics']['total_hospital_days'],
                'average_length_of_stay': round(los_analysis['basic_statistics']['mean_los'], 2),
                'total_departments': len(dept_analysis['department_statistics']),
                'overall_bed_utilization': round(bed_analysis['overall_utilization_rate'], 2),
                'icu_admission_ratio': round(los_analysis['icu_statistics']['icu_admission_ratio'], 4)
            }
        }


if __name__ == '__main__':
    # 示例用法
    import os
    
    # 加载数据
    data_dir = 'data'
    if os.path.exists(data_dir):
        hospitalizations_df = pd.read_csv(os.path.join(data_dir, 'hospitalizations.csv'))
        patients_df = pd.read_csv(os.path.join(data_dir, 'patients.csv'))
        diagnoses_df = pd.read_csv(os.path.join(data_dir, 'diagnoses.csv'))
        
        # 创建分析器
        analyzer = ResourceUtilizationAnalyzer(
            hospitalizations_df, patients_df, diagnoses_df
        )
        
        # 分析住院日
        print("住院日分析:")
        los = analyzer.analyze_length_of_stay()
        print(f"  平均住院日: {los['basic_statistics']['mean_los']:.2f} 天")
        print(f"  中位住院日: {los['basic_statistics']['median_los']} 天")
        print(f"  住院日分布: {los['los_distribution']}")
        
        # 分析科室负荷
        print("\n科室负荷分析:")
        dept = analyzer.analyze_department_workload()
        print(f"  高负荷科室: {dept['high_workload_departments']['admission_department'].tolist()}")
        
        # 分析床位利用
        print("\n床位利用分析:")
        bed = analyzer.analyze_bed_utilization()
        print(f"  总体床位利用率: {bed['overall_utilization_rate']:.2%}")
        print(f"  床位类型分布:")
        print(bed['bed_type_analysis'])
        
        # 资源需求预测
        print("\n资源需求预测:")
        forecast = analyzer.forecast_resource_demand(forecast_months=12)
        print(f"  预测周期: {forecast['forecast_summary']['forecast_period']}")
        print(f"  预测总入院量: {forecast['forecast_summary']['total_predicted_admissions']}")
        print(f"  平均每月床位需求: {forecast['forecast_summary']['avg_monthly_bed_demand']}")
        print(f"  入院量预测模型 R²: {forecast['admissions_model_metrics']['r2']:.4f}")
