import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Union
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PrivacyBudget:
    """隐私预算类"""
    epsilon: float
    delta: float = 1e-5
    
    def __post_init__(self):
        if self.epsilon <= 0:
            raise ValueError("ε必须大于0")
        if self.delta < 0 or self.delta >= 1:
            raise ValueError("δ必须在[0, 1)范围内")
    
    def consume(self, epsilon_cost: float, delta_cost: float = 0) -> 'PrivacyBudget':
        """消耗隐私预算"""
        if epsilon_cost > self.epsilon:
            raise ValueError("隐私预算不足")
        if delta_cost > self.delta:
            raise ValueError("δ预算不足")
        
        return PrivacyBudget(
            epsilon=self.epsilon - epsilon_cost,
            delta=self.delta - delta_cost
        )
    
    def __repr__(self):
        return f"PrivacyBudget(ε={self.epsilon:.4f}, δ={self.delta:.6f})"


class DifferentialPrivacyProtector:
    """差分隐私保护器 - 实现ε-差分隐私"""
    
    def __init__(self, default_epsilon: float = 1.0, default_delta: float = 1e-5):
        """
        初始化差分隐私保护器
        
        参数:
            default_epsilon: 默认隐私预算ε
            default_delta: 默认隐私预算δ（用于近似差分隐私）
        """
        self.default_epsilon = default_epsilon
        self.default_delta = default_delta
        self.privacy_budget = PrivacyBudget(default_epsilon, default_delta)
        self.analysis_history = []
        
    def reset_budget(self, epsilon: float = None, delta: float = None):
        """重置隐私预算"""
        eps = epsilon if epsilon is not None else self.default_epsilon
        delt = delta if delta is not None else self.default_delta
        self.privacy_budget = PrivacyBudget(eps, delt)
    
    def get_remaining_budget(self) -> PrivacyBudget:
        """获取剩余隐私预算"""
        return self.privacy_budget
    
    def laplace_mechanism(self, 
                         true_value: float, 
                         sensitivity: float,
                         epsilon: float = None) -> float:
        """
        拉普拉斯机制 - 添加拉普拉斯噪声
        
        参数:
            true_value: 真实值
            sensitivity: 敏感度（改变一个记录时结果的最大变化量）
            epsilon: 隐私预算ε
        
        返回:
            添加噪声后的值
        """
        eps = epsilon if epsilon is not None else self.default_epsilon
        
        if sensitivity <= 0:
            raise ValueError("敏感度必须大于0")
        
        # 计算拉普拉斯分布的尺度参数
        scale = sensitivity / eps
        
        # 生成拉普拉斯噪声
        noise = np.random.laplace(0, scale)
        
        # 添加噪声
        noisy_value = true_value + noise
        
        return noisy_value
    
    def gaussian_mechanism(self,
                           true_value: float,
                           sensitivity: float,
                           epsilon: float = None,
                           delta: float = None) -> float:
        """
        高斯机制 - 添加高斯噪声（用于近似差分隐私）
        
        参数:
            true_value: 真实值
            sensitivity: 敏感度
            epsilon: 隐私预算ε
            delta: 隐私预算δ
        
        返回:
            添加噪声后的值
        """
        eps = epsilon if epsilon is not None else self.default_epsilon
        delt = delta if delta is not None else self.default_delta
        
        if sensitivity <= 0:
            raise ValueError("敏感度必须大于0")
        
        # 计算高斯分布的标准差
        # 基于 (ε, δ)-差分隐私的高斯机制
        sigma = sensitivity * np.sqrt(2 * np.log(1.25 / delt)) / eps
        
        # 生成高斯噪声
        noise = np.random.normal(0, sigma)
        
        # 添加噪声
        noisy_value = true_value + noise
        
        return noisy_value
    
    def privatize_count(self, 
                        true_count: int,
                        epsilon: float = None,
                        mechanism: str = 'laplace') -> float:
        """
        私有化计数查询
        
        参数:
            true_count: 真实计数
            epsilon: 隐私预算
            mechanism: 机制类型 ('laplace' 或 'gaussian')
        
        返回:
            私有化后的计数值
        """
        # 计数查询的敏感度为1（添加或删除一个记录最多改变计数1）
        sensitivity = 1.0
        
        if mechanism == 'laplace':
            return self.laplace_mechanism(true_count, sensitivity, epsilon)
        else:
            return self.gaussian_mechanism(true_count, sensitivity, epsilon)
    
    def privatize_sum(self,
                      true_sum: float,
                      lower_bound: float,
                      upper_bound: float,
                      epsilon: float = None,
                      mechanism: str = 'laplace') -> float:
        """
        私有化求和查询
        
        参数:
            true_sum: 真实和
            lower_bound: 每个值的下界
            upper_bound: 每个值的上界
            epsilon: 隐私预算
            mechanism: 机制类型
        
        返回:
            私有化后的和
        """
        # 求和的敏感度 = upper_bound - lower_bound
        # （改变一个记录时，和的最大变化量）
        sensitivity = upper_bound - lower_bound
        
        if mechanism == 'laplace':
            return self.laplace_mechanism(true_sum, sensitivity, epsilon)
        else:
            return self.gaussian_mechanism(true_sum, sensitivity, epsilon)
    
    def privatize_mean(self,
                       true_mean: float,
                       n: int,
                       lower_bound: float,
                       upper_bound: float,
                       epsilon: float = None) -> float:
        """
        私有化均值查询
        
        参数:
            true_mean: 真实均值
            n: 样本数量
            lower_bound: 每个值的下界
            upper_bound: 每个值的上界
            epsilon: 隐私预算
        
        返回:
            私有化后的均值
        """
        # 均值的敏感度 = (upper_bound - lower_bound) / n
        sensitivity = (upper_bound - lower_bound) / n
        
        return self.laplace_mechanism(true_mean, sensitivity, epsilon)
    
    def privatize_groupby_count(self,
                                df: pd.DataFrame,
                                group_columns: List[str],
                                count_column: str = None,
                                epsilon: float = None,
                                min_group_size: int = 5) -> pd.DataFrame:
        """
        私有化分组计数
        
        参数:
            df: 原始DataFrame
            group_columns: 分组列
            count_column: 计数列（如果为None则使用count）
            epsilon: 隐私预算
            min_group_size: 最小分组大小（小于此大小的组将被抑制）
        
        返回:
            私有化后的分组计数
        """
        eps = epsilon if epsilon is not None else self.default_epsilon
        
        # 计算真实计数
        if count_column:
            true_counts = df.groupby(group_columns)[count_column].count().reset_index()
        else:
            true_counts = df.groupby(group_columns).size().reset_index(name='true_count')
        
        # 抑制小分组（隐私保护的重要步骤）
        true_counts = true_counts[true_counts['true_count'] >= min_group_size].copy()
        
        # 为每个分组添加噪声
        # 使用并行组合：每个分组使用ε/k的预算，其中k是分组数量
        k = len(true_counts)
        per_query_epsilon = eps / k if k > 0 else eps
        
        true_counts['noisy_count'] = true_counts['true_count'].apply(
            lambda x: self.privatize_count(x, per_query_epsilon)
        )
        
        # 后处理：确保计数值为正
        true_counts['noisy_count'] = true_counts['noisy_count'].apply(
            lambda x: max(0, round(x))
        )
        
        # 计算相对误差
        true_counts['relative_error'] = (
            abs(true_counts['noisy_count'] - true_counts['true_count']) / 
            true_counts['true_count']
        )
        
        # 记录分析历史
        self.analysis_history.append({
            'type': 'groupby_count',
            'group_columns': group_columns,
            'epsilon': eps,
            'groups_count': k,
            'suppressed_groups': len(df.groupby(group_columns)) - k,
            'avg_relative_error': true_counts['relative_error'].mean()
        })
        
        return true_counts
    
    def privatize_statistics(self,
                             df: pd.DataFrame,
                             column: str,
                             epsilon: float = None,
                             lower_bound: float = None,
                             upper_bound: float = None) -> Dict:
        """
        私有化统计量（均值、方差、分位数等）
        
        参数:
            df: 原始DataFrame
            column: 目标列名
            epsilon: 隐私预算
            lower_bound: 列值下界
            upper_bound: 列值上界
        
        返回:
            包含私有化统计量的字典
        """
        eps = epsilon if epsilon is not None else self.default_epsilon
        
        # 自动推断边界
        if lower_bound is None:
            lower_bound = df[column].min()
        if upper_bound is None:
            upper_bound = df[column].max()
        
        # 样本数量
        n = len(df)
        
        # 计算真实统计量
        true_mean = df[column].mean()
        true_std = df[column].std()
        true_min = df[column].min()
        true_max = df[column].max()
        true_median = df[column].median()
        
        # 分割隐私预算
        # 均值：ε/3
        # 标准差：ε/3
        # 分位数：ε/3
        eps_per_stat = eps / 3
        
        # 私有化均值
        noisy_mean = self.privatize_mean(
            true_mean, n, lower_bound, upper_bound, eps_per_stat
        )
        
        # 私有化标准差
        # 标准差的敏感度估算：(upper_bound - lower_bound) / sqrt(n)
        std_sensitivity = (upper_bound - lower_bound) / np.sqrt(n)
        noisy_std = self.laplace_mechanism(true_std, std_sensitivity, eps_per_stat)
        
        # 私有化分位数（使用指数机制的简化版本）
        # 这里简化处理：对中位数添加噪声
        median_sensitivity = (upper_bound - lower_bound) / 2  # 简化敏感度
        noisy_median = self.laplace_mechanism(true_median, median_sensitivity, eps_per_stat)
        
        # 后处理
        noisy_mean = max(lower_bound, min(upper_bound, noisy_mean))
        noisy_std = max(0, noisy_std)
        noisy_median = max(lower_bound, min(upper_bound, noisy_median))
        
        result = {
            'column': column,
            'sample_size': n,
            'true_statistics': {
                'mean': true_mean,
                'std': true_std,
                'median': true_median,
                'min': true_min,
                'max': true_max
            },
            'privatized_statistics': {
                'mean': noisy_mean,
                'std': noisy_std,
                'median': noisy_median
            },
            'error_metrics': {
                'mean_absolute_error': abs(noisy_mean - true_mean),
                'mean_relative_error': abs(noisy_mean - true_mean) / abs(true_mean) if true_mean != 0 else 0,
                'std_absolute_error': abs(noisy_std - true_std),
                'median_absolute_error': abs(noisy_median - true_median)
            },
            'privacy_parameters': {
                'epsilon': eps,
                'lower_bound': lower_bound,
                'upper_bound': upper_bound
            }
        }
        
        # 记录历史
        self.analysis_history.append({
            'type': 'statistics',
            'column': column,
            'epsilon': eps,
            'sample_size': n
        })
        
        return result
    
    def privatize_crosstab(self,
                           df: pd.DataFrame,
                           row_column: str,
                           col_column: str,
                           epsilon: float = None,
                           min_cell_count: int = 5) -> pd.DataFrame:
        """
        私有化列联表
        
        参数:
            df: 原始DataFrame
            row_column: 行变量
            col_column: 列变量
            epsilon: 隐私预算
            min_cell_count: 最小单元格计数
        
        返回:
            私有化的列联表
        """
        eps = epsilon if epsilon is not None else self.default_epsilon
        
        # 计算真实列联表
        true_crosstab = pd.crosstab(df[row_column], df[col_column])
        
        # 扁平化以便处理
        true_flat = true_crosstab.stack().reset_index()
        true_flat.columns = [row_column, col_column, 'true_count']
        
        # 抑制小单元格
        true_flat = true_flat[true_flat['true_count'] >= min_cell_count].copy()
        
        # 计算每个单元格的隐私预算
        k = len(true_flat)
        per_cell_epsilon = eps / k if k > 0 else eps
        
        # 添加噪声
        true_flat['noisy_count'] = true_flat['true_count'].apply(
            lambda x: self.privatize_count(x, per_cell_epsilon)
        )
        
        # 后处理
        true_flat['noisy_count'] = true_flat['noisy_count'].apply(
            lambda x: max(0, round(x))
        )
        
        # 重建列联表
        noisy_crosstab = true_flat.pivot(
            index=row_column,
            columns=col_column,
            values='noisy_count'
        ).fillna(0)
        
        # 记录历史
        self.analysis_history.append({
            'type': 'crosstab',
            'row_column': row_column,
            'col_column': col_column,
            'epsilon': eps,
            'cells_count': k,
            'suppressed_cells': (true_crosstab.values.flatten() < min_cell_count).sum()
        })
        
        return {
            'true_crosstab': true_crosstab,
            'noisy_crosstab': noisy_crosstab,
            'detailed_comparison': true_flat
        }
    
    def create_privacy_report(self) -> pd.DataFrame:
        """
        创建隐私保护分析报告
        
        返回:
            包含隐私分析历史的DataFrame
        """
        if not self.analysis_history:
            return pd.DataFrame()
        
        return pd.DataFrame(self.analysis_history)
    
    def calculate_privacy_loss(self, epsilon_per_query: float, num_queries: int) -> float:
        """
        计算组合后的隐私损失
        
        使用简单组合（Sequential Composition）
        
        参数:
            epsilon_per_query: 每个查询的ε
            num_queries: 查询数量
        
        返回:
            组合后的总ε
        """
        # 简单组合：总ε = k * ε_i
        return num_queries * epsilon_per_query
    
    def calculate_advanced_composition(self,
                                       epsilon_per_query: float,
                                       delta_per_query: float,
                                       num_queries: int,
                                       target_delta: float) -> float:
        """
        计算高级组合（Advanced Composition）后的隐私损失
        
        参数:
            epsilon_per_query: 每个查询的ε
            delta_per_query: 每个查询的δ
            num_queries: 查询数量
            target_delta: 目标δ
        
        返回:
            组合后的总ε
        """
        # 高级组合定理
        # 对于k个(ε_i, δ_i)-差分隐私机制
        # 组合后是(ε_total, δ_total)-差分隐私
        # 其中：
        # ε_total = sqrt(2k ln(1/δ_total)) * ε + kε(e^ε - 1)
        # δ_total = kδ_i
        
        k = num_queries
        eps = epsilon_per_query
        delt = delta_per_query
        
        # 计算高级组合的ε
        term1 = np.sqrt(2 * k * np.log(1 / target_delta)) * eps
        term2 = k * eps * (np.exp(eps) - 1)
        total_epsilon = term1 + term2
        
        return total_epsilon
    
    def demonstrate_differential_privacy(self,
                                          df: pd.DataFrame,
                                          column: str,
                                          epsilon_values: List[float] = [0.1, 0.5, 1.0, 2.0, 5.0],
                                          num_trials: int = 100) -> pd.DataFrame:
        """
        演示差分隐私的效果
        
        展示不同ε值下的噪声水平和实用性
        
        参数:
            df: 数据DataFrame
            column: 目标列
            epsilon_values: 测试的ε值列表
            num_trials: 每个ε的试验次数
        
        返回:
            包含演示结果的DataFrame
        """
        true_mean = df[column].mean()
        n = len(df)
        lower_bound = df[column].min()
        upper_bound = df[column].max()
        
        results = []
        
        for eps in epsilon_values:
            trial_means = []
            
            for _ in range(num_trials):
                noisy_mean = self.privatize_mean(
                    true_mean, n, lower_bound, upper_bound, eps
                )
                trial_means.append(noisy_mean)
            
            trial_means = np.array(trial_means)
            
            # 计算统计量
            mean_noisy = trial_means.mean()
            std_noisy = trial_means.std()
            mean_error = np.abs(trial_means - true_mean).mean()
            mean_relative_error = np.abs(trial_means - true_mean).mean() / abs(true_mean)
            
            # 95%置信区间内的比例
            ci_lower = true_mean - 1.96 * std_noisy
            ci_upper = true_mean + 1.96 * std_noisy
            in_ci = np.mean((trial_means >= ci_lower) & (trial_means <= ci_upper))
            
            results.append({
                'epsilon': eps,
                'true_mean': true_mean,
                'mean_of_noisy_estimates': mean_noisy,
                'std_of_noisy_estimates': std_noisy,
                'mean_absolute_error': mean_error,
                'mean_relative_error': mean_relative_error,
                'proportion_in_95_ci': in_ci,
                'noise_scale': (upper_bound - lower_bound) / n / eps,
                'privacy_utility_tradeoff': mean_relative_error / eps
            })
        
        return pd.DataFrame(results)


class PrivacyPreservingAnalyzer:
    """隐私保护分析器 - 整合差分隐私到数据分析中"""
    
    def __init__(self, 
                 patients_df: pd.DataFrame,
                 diagnoses_df: pd.DataFrame,
                 hospitalizations_df: pd.DataFrame,
                 default_epsilon: float = 1.0):
        
        self.patients_df = patients_df
        self.diagnoses_df = diagnoses_df
        self.hospitalizations_df = hospitalizations_df
        
        self.dp_protector = DifferentialPrivacyProtector(
            default_epsilon=default_epsilon
        )
    
    def analyze_disease_incidence(self,
                                   epsilon: float = 1.0) -> Dict:
        """
        隐私保护的疾病发病率分析
        
        参数:
            epsilon: 隐私预算
        
        返回:
            包含真实值和私有化值的字典
        """
        # 真实发病率
        true_incidence = self.hospitalizations_df['main_diagnosis'].value_counts().reset_index()
        true_incidence.columns = ['disease', 'true_count']
        
        # 私有化发病率
        # 分组计数
        privatized = self.dp_protector.privatize_groupby_count(
            self.hospitalizations_df,
            group_columns=['main_diagnosis'],
            epsilon=epsilon,
            min_group_size=10
        )
        
        # 合并结果
        comparison = pd.merge(
            true_incidence,
            privatized,
            left_on='disease',
            right_on='main_diagnosis',
            how='left'
        )
        
        # 计算发病率（每1000人口）
        total_patients = len(self.patients_df)
        comparison['true_rate_per_1000'] = comparison['true_count'] / total_patients * 1000
        comparison['noisy_rate_per_1000'] = comparison['noisy_count'] / total_patients * 1000
        
        return {
            'comparison': comparison,
            'privacy_parameters': {
                'epsilon': epsilon,
                'method': '拉普拉斯机制',
                'sensitivity': 1.0
            },
            'utility_metrics': {
                'average_relative_error': comparison['relative_error'].mean(),
                'max_relative_error': comparison['relative_error'].max(),
                'suppressed_groups': len(true_incidence) - len(privatized)
            }
        }
    
    def analyze_demographic_distribution(self,
                                          group_by: str = 'age_group',
                                          epsilon: float = 1.0) -> Dict:
        """
        隐私保护的人口统计分布分析
        """
        # 准备数据
        df = self.patients_df.copy()
        
        # 创建年龄分组
        if group_by == 'age_group':
            df['age_group'] = pd.cut(
                df['age'],
                bins=[18, 30, 40, 50, 60, 70, 80, 90, 100],
                labels=['18-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '90+']
            )
        
        # 真实分布
        true_dist = df.groupby(group_by).size().reset_index(name='true_count')
        
        # 私有化分布
        privatized = self.dp_protector.privatize_groupby_count(
            df,
            group_columns=[group_by],
            epsilon=epsilon,
            min_group_size=5
        )
        
        # 合并
        comparison = pd.merge(
            true_dist,
            privatized,
            on=group_by,
            how='left'
        )
        
        # 计算百分比
        total = true_dist['true_count'].sum()
        comparison['true_percentage'] = comparison['true_count'] / total * 100
        comparison['noisy_percentage'] = comparison['noisy_count'] / comparison['noisy_count'].sum() * 100
        
        return {
            'comparison': comparison,
            'group_by': group_by,
            'epsilon': epsilon
        }
    
    def analyze_length_of_stay(self,
                                epsilon: float = 1.0) -> Dict:
        """
        隐私保护的住院日分析
        """
        los_data = self.hospitalizations_df['length_of_stay']
        
        # 真实统计
        true_stats = {
            'mean': los_data.mean(),
            'median': los_data.median(),
            'std': los_data.std(),
            'min': los_data.min(),
            'max': los_data.max()
        }
        
        # 私有化统计
        privatized_result = self.dp_protector.privatize_statistics(
            self.hospitalizations_df,
            column='length_of_stay',
            epsilon=epsilon,
            lower_bound=1,
            upper_bound=60
        )
        
        # 按疾病的住院日分布
        true_by_disease = self.hospitalizations_df.groupby('main_diagnosis')['length_of_stay'].agg(
            ['count', 'mean', 'median']
        ).reset_index()
        
        # 私有化分组均值
        # 简化处理：仅对总统计量进行私有化
        
        return {
            'true_statistics': true_stats,
            'privatized_statistics': privatized_result,
            'true_by_disease': true_by_disease,
            'epsilon': epsilon
        }
    
    def generate_privacy_comparison_report(self) -> pd.DataFrame:
        """
        生成隐私保护效果对比报告
        """
        # 测试不同ε值的效果
        epsilon_values = [0.1, 0.5, 1.0, 2.0, 5.0]
        
        report_data = []
        
        for eps in epsilon_values:
            # 疾病发病率分析
            incidence_result = self.analyze_disease_incidence(epsilon=eps)
            
            # 住院日分析
            los_result = self.analyze_length_of_stay(epsilon=eps)
            
            report_data.append({
                'epsilon': eps,
                'incidence_avg_relative_error': incidence_result['utility_metrics']['average_relative_error'],
                'incidence_suppressed_groups': incidence_result['utility_metrics']['suppressed_groups'],
                'los_mean_error': los_result['privatized_statistics']['error_metrics']['mean_absolute_error'],
                'los_relative_error': los_result['privatized_statistics']['error_metrics']['mean_relative_error']
            })
        
        return pd.DataFrame(report_data)


if __name__ == '__main__':
    # 示例用法
    import os
    
    # 加载数据
    data_dir = 'data'
    if os.path.exists(data_dir):
        patients_df = pd.read_csv(os.path.join(data_dir, 'patients.csv'))
        diagnoses_df = pd.read_csv(os.path.join(data_dir, 'diagnoses.csv'))
        hospitalizations_df = pd.read_csv(os.path.join(data_dir, 'hospitalizations.csv'))
        
        # 创建隐私保护分析器
        print("创建差分隐私保护器...")
        privacy_analyzer = PrivacyPreservingAnalyzer(
            patients_df, diagnoses_df, hospitalizations_df,
            default_epsilon=1.0
        )
        
        # 测试疾病发病率分析
        print("\n测试隐私保护的疾病发病率分析...")
        incidence_result = privacy_analyzer.analyze_disease_incidence(epsilon=1.0)
        print(f"  平均相对误差: {incidence_result['utility_metrics']['average_relative_error']:.4f}")
        print(f"  抑制分组数: {incidence_result['utility_metrics']['suppressed_groups']}")
        
        # 显示对比结果
        print("\n真实值 vs 私有化值（前10种疾病）:")
        comparison = incidence_result['comparison'].head(10)
        for _, row in comparison.iterrows():
            print(f"  {row['disease']}: 真实={row['true_count']}, 私有化={row['noisy_count']}, "
                  f"误差={row['relative_error']:.2%}")
        
        # 测试人口统计分布
        print("\n测试隐私保护的人口统计分布分析...")
        demo_result = privacy_analyzer.analyze_demographic_distribution(
            group_by='age_group',
            epsilon=1.0
        )
        print(demo_result['comparison'])
        
        # 测试住院日分析
        print("\n测试隐私保护的住院日分析...")
        los_result = privacy_analyzer.analyze_length_of_stay(epsilon=1.0)
        print(f"  真实均值: {los_result['true_statistics']['mean']:.2f}")
        print(f"  私有化均值: {los_result['privatized_statistics']['privatized_statistics']['mean']:.2f}")
        print(f"  绝对误差: {los_result['privatized_statistics']['error_metrics']['mean_absolute_error']:.2f}")
        print(f"  相对误差: {los_result['privatized_statistics']['error_metrics']['mean_relative_error']:.2%}")
        
        # 演示差分隐私效果
        print("\n演示不同ε值的隐私-效用权衡...")
        dp = DifferentialPrivacyProtector()
        demo_results = dp.demonstrate_differential_privacy(
            hospitalizations_df,
            column='length_of_stay',
            epsilon_values=[0.1, 0.5, 1.0, 2.0, 5.0],
            num_trials=50
        )
        print(demo_results[['epsilon', 'mean_relative_error', 'std_of_noisy_estimates']])
        
        print("\n差分隐私模块演示完成！")
