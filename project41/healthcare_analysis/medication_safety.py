import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
from itertools import combinations


class MedicationSafetyAnalyzer:
    """用药安全分析器 - 检测潜在的药物相互作用和用药风险"""
    
    def __init__(self, medications_df: pd.DataFrame, 
                 patients_df: pd.DataFrame,
                 diagnoses_df: pd.DataFrame):
        self.medications_df = medications_df.copy()
        self.patients_df = patients_df.copy()
        self.diagnoses_df = diagnoses_df.copy()
        
        # 药物相互作用数据库
        self.drug_interaction_database = self._init_drug_interaction_database()
        
        # 药物分类系统
        self.drug_class_system = self._init_drug_class_system()
        
        # 预处理数据
        self._preprocess_data()
        
    def _init_drug_interaction_database(self) -> Dict:
        """
        初始化药物相互作用数据库
        基于真实的药物相互作用知识构建
        """
        return {
            # 严重相互作用（等级：严重）
            ('阿司匹林', '华法林'): {
                'severity': '严重',
                'mechanism': '阿司匹林增强华法林的抗凝作用，增加出血风险',
                'clinical_effect': '出血风险增加3-6倍',
                'recommendation': '避免联用，如需联用需密切监测INR值',
                'evidence_level': 'A'
            },
            ('氯吡格雷', '奥美拉唑'): {
                'severity': '中度',
                'mechanism': '奥美拉唑抑制CYP2C19酶，降低氯吡格雷的活性代谢产物生成',
                'clinical_effect': '氯吡格雷抗血小板作用减弱，心血管事件风险增加',
                'recommendation': '建议更换为泮托拉唑或雷贝拉唑',
                'evidence_level': 'A'
            },
            ('二甲双胍', '碘造影剂'): {
                'severity': '严重',
                'mechanism': '碘造影剂可能导致急性肾损伤，增加二甲双胍乳酸酸中毒风险',
                'clinical_effect': '乳酸酸中毒风险显著增加',
                'recommendation': '造影检查前48小时停用二甲双胍，术后48小时肾功能正常后恢复',
                'evidence_level': 'A'
            },
            ('氨氯地平', '西地那非'): {
                'severity': '严重',
                'mechanism': '两者均有血管扩张作用，协同降压',
                'clinical_effect': '严重低血压风险',
                'recommendation': '避免联用，如需联用需谨慎',
                'evidence_level': 'B'
            },
            ('华法林', '非甾体抗炎药'): {
                'severity': '严重',
                'mechanism': '非甾体抗炎药抑制血小板功能并可能损伤胃黏膜，同时可能影响华法林代谢',
                'clinical_effect': '出血风险显著增加',
                'recommendation': '避免联用，如需联用密切监测INR',
                'evidence_level': 'A'
            },
            ('他汀类药物', '红霉素'): {
                'severity': '严重',
                'mechanism': '红霉素抑制CYP3A4酶，增加他汀类药物血药浓度',
                'clinical_effect': '横纹肌溶解风险显著增加',
                'recommendation': '避免联用或更换抗生素',
                'evidence_level': 'A'
            },
            ('ACEI类药物', '保钾利尿剂'): {
                'severity': '中度',
                'mechanism': '两者协同增加血钾浓度',
                'clinical_effect': '高钾血症风险',
                'recommendation': '密切监测血钾水平',
                'evidence_level': 'B'
            },
            ('胰岛素', 'β受体阻滞剂'): {
                'severity': '中度',
                'mechanism': 'β受体阻滞剂可能掩盖低血糖症状',
                'clinical_effect': '低血糖症状不典型，延误诊断',
                'recommendation': '密切监测血糖',
                'evidence_level': 'B'
            },
            ('茶碱类药物', '氟喹诺酮类抗生素'): {
                'severity': '中度',
                'mechanism': '氟喹诺酮类抑制茶碱代谢',
                'clinical_effect': '茶碱中毒风险',
                'recommendation': '监测茶碱血药浓度',
                'evidence_level': 'B'
            },
            ('地高辛', '胺碘酮'): {
                'severity': '严重',
                'mechanism': '胺碘酮抑制地高辛肾清除',
                'clinical_effect': '地高辛血药浓度升高，中毒风险',
                'recommendation': '地高辛剂量减半，监测血药浓度',
                'evidence_level': 'A'
            },
            # 更多相互作用...
            ('华法林', '阿司匹林'): {  # 反向组合
                'severity': '严重',
                'mechanism': '阿司匹林增强华法林的抗凝作用，增加出血风险',
                'clinical_effect': '出血风险增加3-6倍',
                'recommendation': '避免联用，如需联用需密切监测INR值',
                'evidence_level': 'A'
            },
            ('奥美拉唑', '氯吡格雷'): {
                'severity': '中度',
                'mechanism': '奥美拉唑抑制CYP2C19酶，降低氯吡格雷的活性代谢产物生成',
                'clinical_effect': '氯吡格雷抗血小板作用减弱，心血管事件风险增加',
                'recommendation': '建议更换为泮托拉唑或雷贝拉唑',
                'evidence_level': 'A'
            }
        }
    
    def _init_drug_class_system(self) -> Dict:
        """初始化药物分类系统"""
        return {
            '降压药物': ['氨氯地平', '缬沙坦', '美托洛尔', '氢氯噻嗪', '依那普利'],
            '降糖药物': ['二甲双胍', '格列美脲', '胰岛素', '阿卡波糖'],
            '心血管药物': ['阿司匹林', '氯吡格雷', '阿托伐他汀', '华法林'],
            '呼吸科药物': ['沙丁胺醇', '布地奈德'],
            '消化系统药物': ['奥美拉唑', '泮托拉唑'],
            '精神科药物': ['舍曲林', '氟西汀'],
            '骨质疏松药物': ['阿仑膦酸钠', '碳酸钙D3']
        }
    
    def _preprocess_data(self):
        """数据预处理"""
        # 转换日期格式
        self.medications_df['start_date'] = pd.to_datetime(self.medications_df['start_date'])
        self.medications_df['end_date'] = pd.to_datetime(self.medications_df['end_date'])
        
        # 合并患者信息
        self.merged_medications = pd.merge(
            self.medications_df,
            self.patients_df[['patient_id', 'gender', 'age', 'region']],
            on='patient_id',
            how='left'
        )
        
    def get_patient_medications(self, patient_id: str) -> pd.DataFrame:
        """获取特定患者的用药记录"""
        return self.merged_medications[
            self.merged_medications['patient_id'] == patient_id
        ].sort_values('start_date')
    
    def check_drug_interaction(self, drug1: str, drug2: str) -> Optional[Dict]:
        """检查两种药物之间的相互作用"""
        # 检查直接的药物对
        key = (drug1, drug2)
        if key in self.drug_interaction_database:
            return self.drug_interaction_database[key]
        
        # 检查反向的药物对
        key_reverse = (drug2, drug1)
        if key_reverse in self.drug_interaction_database:
            return self.drug_interaction_database[key_reverse]
        
        # 检查药物类别之间的相互作用
        class_interactions = self._check_class_interactions(drug1, drug2)
        if class_interactions:
            return class_interactions
        
        return None
    
    def _check_class_interactions(self, drug1: str, drug2: str) -> Optional[Dict]:
        """检查药物类别之间的相互作用"""
        # 获取药物1的类别
        drug1_class = None
        for class_name, drugs in self.drug_class_system.items():
            if drug1 in drugs:
                drug1_class = class_name
                break
        
        # 获取药物2的类别
        drug2_class = None
        for class_name, drugs in self.drug_class_system.items():
            if drug2 in drugs:
                drug2_class = class_name
                break
        
        # 类别间相互作用规则
        class_interaction_rules = {
            ('降压药物', '西地那非'): {
                'severity': '严重',
                'mechanism': '降压药物与西地那非联用可能导致严重低血压',
                'clinical_effect': '体位性低血压、头晕、晕厥',
                'recommendation': '避免联用或谨慎使用',
                'evidence_level': 'B'
            },
            ('非甾体抗炎药', '降压药物'): {
                'severity': '中度',
                'mechanism': '非甾体抗炎药可能降低降压药物的疗效',
                'clinical_effect': '血压控制不佳',
                'recommendation': '监测血压，调整降压方案',
                'evidence_level': 'B'
            },
            ('他汀类药物', '大环内酯类抗生素'): {
                'severity': '严重',
                'mechanism': '大环内酯类抗生素抑制他汀类药物代谢',
                'clinical_effect': '横纹肌溶解风险增加',
                'recommendation': '避免联用',
                'evidence_level': 'A'
            }
        }
        
        # 检查是否有类别间相互作用
        for (class1, class2), interaction in class_interaction_rules.items():
            if (drug1_class == class1 and drug2 == class2) or (drug1_class == class2 and drug2 == class1):
                return interaction
            if (drug1 == class1 and drug2_class == class2) or (drug1 == class2 and drug2_class == class1):
                return interaction
        
        return None
    
    def analyze_patient_medications(self, patient_id: str) -> Dict:
        """
        分析特定患者的用药安全性
        
        返回:
            包含用药分析结果的字典
        """
        patient_meds = self.get_patient_medications(patient_id)
        
        if patient_meds.empty:
            return {'error': '未找到该患者的用药记录'}
        
        # 获取患者信息
        patient_info = self.patients_df[
            self.patients_df['patient_id'] == patient_id
        ].iloc[0]
        
        # 1. 检查同时使用的药物
        concurrent_meds = self._find_concurrent_medications(patient_meds)
        
        # 2. 检测药物相互作用
        interactions = []
        for med_pair in concurrent_meds:
            drug1, drug2, overlap_start, overlap_end = med_pair
            interaction = self.check_drug_interaction(drug1, drug2)
            if interaction:
                interactions.append({
                    'drug1': drug1,
                    'drug2': drug2,
                    'overlap_start': overlap_start,
                    'overlap_end': overlap_end,
                    'interaction_details': interaction
                })
        
        # 3. 检查用药依从性
        adherence_analysis = self._analyze_adherence(patient_meds)
        
        # 4. 检查药物不良反应
        adverse_events = self._check_adverse_events(patient_meds, patient_info)
        
        # 5. 检查药物剂量评估
        dosage_evaluation = self._evaluate_dosage(patient_meds, patient_info)
        
        # 6. 检查药物与疾病的相互作用
        drug_disease_interactions = self._check_drug_disease_interactions(
            patient_id, patient_meds
        )
        
        return {
            'patient_id': patient_id,
            'patient_info': {
                'age': patient_info['age'],
                'gender': patient_info['gender'],
                'region': patient_info['region']
            },
            'total_medications': len(patient_meds),
            'concurrent_medication_pairs': len(concurrent_meds),
            'drug_interactions': interactions,
            'adherence_analysis': adherence_analysis,
            'adverse_events_risk': adverse_events,
            'dosage_evaluation': dosage_evaluation,
            'drug_disease_interactions': drug_disease_interactions,
            'safety_score': self._calculate_safety_score(interactions, adherence_analysis, adverse_events)
        }
    
    def _find_concurrent_medications(self, patient_meds: pd.DataFrame) -> List[Tuple]:
        """找出同时使用的药物对"""
        concurrent_pairs = []
        
        # 转换为列表以便遍历
        meds_list = patient_meds.to_dict('records')
        
        # 检查所有药物对
        for i, med1 in enumerate(meds_list):
            for j, med2 in enumerate(meds_list[i+1:], i+1):
                # 检查时间重叠
                start1, end1 = med1['start_date'], med1['end_date']
                start2, end2 = med2['start_date'], med2['end_date']
                
                # 判断是否有重叠
                overlap_start = max(start1, start2)
                overlap_end = min(end1, end2)
                
                if overlap_start <= overlap_end:
                    concurrent_pairs.append((
                        med1['medication_name'],
                        med2['medication_name'],
                        overlap_start.strftime('%Y-%m-%d'),
                        overlap_end.strftime('%Y-%m-%d')
                    ))
        
        return concurrent_pairs
    
    def _analyze_adherence(self, patient_meds: pd.DataFrame) -> Dict:
        """分析用药依从性"""
        if patient_meds = patient_meds.copy()
        
        # 计算用药时长
        patient_meds['treatment_duration'] = (
            patient_meds['end_date'] - patient_meds['start_date']
        ).dt.days
        
        # 依从性分布
        adherence_dist = patient_meds['adherence'].value_counts().to_dict()
        
        # 平均依从性评分
        adherence_scores = {'良好': 3, '一般': 2, '差': 1}
        avg_adherence = np.mean([
            adherence_scores.get(a, 1) for a in patient_meds['adherence']
        ])
        
        # 依从性问题
        adherence_issues = []
        poor_adherence = patient_meds[patient_meds['adherence'] == '差']
        
        for _, med in poor_adherence.iterrows():
            adherence_issues.append({
                'medication': med['medication_name'],
                'adherence': '差',
                'duration_days': med['treatment_duration'],
                'risk': '治疗效果可能不佳，疾病控制不稳定'
            })
        
        return {
            'adherence_distribution': adherence_dist,
            'average_adherence_score': avg_adherence,
            'poor_adherence_medications': adherence_issues,
            'overall_adherence_risk': len(adherence_issues) > 0
        }
    
    def _check_adverse_events(self, patient_meds: pd.DataFrame, patient_info: pd.Series) -> Dict:
        """检查药物不良反应风险"""
        adverse_risk_factors = []
        
        # 年龄因素
        age = patient_info['age']
        if age > 65:
            adverse_risk_factors.append({
                'factor': '高龄',
                'risk': '药物代谢减慢，不良反应风险增加2-3倍'
            })
        
        # 多重用药因素
        if len(patient_meds) > 5:
            adverse_risk_factors.append({
                'factor': '多重用药',
                'risk': f'药物相互作用和不良反应风险显著增加'
            })
        
        # 肝肾功能风险
        # （这里简化处理，实际需要检验数据）
        
        # 有不良反应历史
        has_side_effects = patient_meds[patient_meds['has_side_effects'] == True]
        if len(has_side_effects) > 0:
            adverse_risk_factors.append({
                'factor': '既往不良反应史',
                'risk': '再次发生不良反应风险增加'
            })
        
        # 计算风险等级
        risk_level = '低'
        if len(adverse_risk_factors) >= 2:
            risk_level = '高'
        elif len(adverse_risk_factors) == 1:
            risk_level = '中'
        
        return {
            'risk_level': risk_level,
            'risk_factors': adverse_risk_factors,
            'history_of_side_effects': len(has_side_effects),
            'medications_with_side_effects': has_side_effects['medication_name'].tolist()
        }
    
    def _evaluate_dosage(self, patient_meds: pd.DataFrame, patient_info: pd.Series) -> Dict:
        """评估药物剂量是否合适"""
        dosage_issues = []
        
        age = patient_info['age']
        gender = patient_info['gender']
        
        for _, med in patient_meds.iterrows():
            med_name = med['medication_name']
            dosage = med['dosage']
            
            # 老年患者剂量调整检查
            if age > 75:
                # 假设某些药物需要减量
                if med_name in ['氨氯地平', '美托洛尔', '氢氯噻嗪']:
                    # 这里简化处理，实际需要具体药物指南
                    if dosage > 5:  # 假设阈值
                        dosage_issues.append({
                            'medication': med_name,
                            'current_dosage': dosage,
                            'issue': '老年患者剂量可能偏高',
                            'recommendation': '考虑减少剂量'
                        })
        
        return {
            'dosage_issues': dosage_issues,
            'total_issues_count': len(dosage_issues)
        }
    
    def _check_drug_disease_interactions(self, patient_id: str, patient_meds: pd.DataFrame) -> List[Dict]:
        """检查药物与疾病的相互作用"""
        interactions = []
        
        # 获取患者的诊断
        patient_diagnoses = self.diagnoses_df[
            self.diagnoses_df['patient_id'] == patient_id
        ]['disease_name'].tolist()
        
        # 药物-疾病相互作用规则
        drug_disease_rules = {
            '非甾体抗炎药': {
                '消化性溃疡': {
                    'severity': '严重',
                    'mechanism': '非甾体抗炎药可能加重消化性溃疡',
                    'risk': '消化道出血风险增加'
                },
                '慢性肾病': {
                    'severity': '中度',
                    'mechanism': '非甾体抗炎药可能加重肾损伤',
                    'risk': '肾功能恶化风险'
                }
            },
            'β受体阻滞剂': {
                '哮喘': {
                    'severity': '严重',
                    'mechanism': 'β受体阻滞剂可能诱发支气管痉挛',
                    'risk': '哮喘急性发作风险'
                },
                '糖尿病': {
                    'severity': '中度',
                    'mechanism': 'β受体阻滞剂可能掩盖低血糖症状',
                    'risk': '低血糖延误诊断'
                }
            },
            '噻嗪类利尿剂': {
                '糖尿病': {
                    'severity': '中度',
                    'mechanism': '利尿剂可能影响血糖控制',
                    'risk': '血糖升高风险'
                },
                '痛风': {
                    'severity': '中度',
                    'mechanism': '利尿剂可能升高血尿酸',
                    'risk': '痛风发作风险'
                }
            }
        }
        
        # 检查每个药物
        for _, med in patient_meds.iterrows():
            med_name = med['medication_name']
            
            # 检查药物类别
            for drug_class, diseases in drug_disease_rules.items():
                # 判断药物是否属于该类别
                if med_name in self.drug_class_system.get(drug_class, []):
                    # 检查患者是否有相关疾病
                    for disease, interaction in diseases.items():
                        if disease in patient_diagnoses:
                            interactions.append({
                                'medication': med_name,
                                'drug_class': drug_class,
                                'disease': disease,
                                'interaction_details': interaction
                            })
        
        return interactions
    
    def _calculate_safety_score(self, interactions: List, adherence: Dict, adverse: Dict) -> float:
        """计算用药安全评分（0-100分）"""
        score = 100
        
        # 药物相互作用扣分
        severe_interactions = [i for i in interactions if i['interaction_details']['severity'] == '严重']
        moderate_interactions = [i for i in interactions if i['interaction_details']['severity'] == '中度']
        
        score -= len(severe_interactions) * 20
        score -= len(moderate_interactions) * 10
        
        # 依从性扣分
        if adherence.get('overall_adherence_risk'):
            score -= 15
        
        # 不良反应风险扣分
        risk_level = adverse.get('risk_level', '低')
        if risk_level == '高':
            score -= 20
        elif risk_level == '中':
            score -= 10
        
        return max(0, min(100, score))
    
    def get_high_risk_patients(self, threshold: float = 60) -> pd.DataFrame:
        """获取高风险患者列表"""
        high_risk = []
        
        # 抽样分析（实际应该分析所有患者）
        sample_patients = self.patients_df['patient_id'].sample(min(100, len(self.patients_df))
        
        for patient_id in sample_patients:
            analysis = self.analyze_patient_medications(patient_id)
            if 'error' not in analysis and analysis.get('safety_score', 100) < threshold:
                high_risk.append({
                    'patient_id': patient_id,
                    'safety_score': analysis['safety_score'],
                    'num_interactions': len(analysis.get('drug_interactions', [])),
                    'adherence_risk': analysis.get('adherence_analysis', {}).get('overall_adherence_risk', False),
                    'adverse_risk_level': analysis.get('adverse_events_risk', {}).get('risk_level', '低')
                })
        
        return pd.DataFrame(high_risk)
    
    def get_medication_statistics(self) -> Dict:
        """获取用药统计信息"""
        # 最常用的药物
        top_medications = self.medications_df['medication_name'].value_counts().head(10).to_dict()
        
        # 药物类别分布
        class_distribution = defaultdict(int)
        for med_name in self.medications_df['medication_name']:
            for class_name, drugs in self.drug_class_system.items():
                if med_name in drugs:
                    class_distribution[class_name] += 1
                    break
        
        # 依从性统计
        adherence_stats = self.medications_df['adherence'].value_counts().to_dict()
        
        # 平均用药时长
        treatment_durations = (
            self.medications_df['end_date'] - self.medications_df['start_date']
        ).dt.days
        
        return {
            'top_medications': top_medications,
            'class_distribution': dict(class_distribution),
            'adherence_statistics': adherence_stats,
            'average_treatment_days': treatment_durations.mean(),
            'median_treatment_days': treatment_durations.median(),
            'total_medication_records': len(self.medications_df),
            'unique_patients': self.medications_df['patient_id'].nunique()
        }
    
    def analyze_polypharmacy(self) -> Dict:
        """分析多重用药情况"""
        # 计算每个患者的用药数量
        patient_med_counts = self.medications_df.groupby('patient_id').agg(
            medication_count=('medication_name', 'nunique'),
            total_prescriptions=('medication_id', 'count')
        ).reset_index()
        
        # 多重用药定义
        patient_med_counts['polypharmacy_category'] = pd.cut(
            patient_med_counts['medication_count'],
            bins=[0, 2, 5, 10, float('inf')],
            labels=['少量用药(1-2种)', '适度用药(3-5种)', '多重用药(6-10种)', '严重多重用药(10种以上)']
        )
        
        # 分布统计
        polypharmacy_dist = patient_med_counts['polypharmacy_category'].value_counts().to_dict()
        
        # 高多重用药患者
        high_polypharmacy = patient_med_counts[
            patient_med_counts['medication_count'] > 5
        ].sort_values('medication_count', ascending=False)
        
        return {
            'polypharmacy_distribution': polypharmacy_dist,
            'average_medications_per_patient': patient_med_counts['medication_count'].mean(),
            'max_medications_per_patient': patient_med_counts['medication_count'].max(),
            'high_risk_patients_count': len(high_polypharmacy),
            'high_risk_patients_sample': high_polypharmacy.head(10).to_dict('records')
        }


if __name__ == '__main__':
    # 示例用法
    import os
    
    # 加载数据
    data_dir = 'data'
    if os.path.exists(data_dir):
        medications_df = pd.read_csv(os.path.join(data_dir, 'medications.csv'))
        patients_df = pd.read_csv(os.path.join(data_dir, 'patients.csv'))
        diagnoses_df = pd.read_csv(os.path.join(data_dir, 'diagnoses.csv'))
        
        # 创建分析器
        analyzer = MedicationSafetyAnalyzer(medications_df, patients_df, diagnoses_df)
        
        # 获取用药统计
        print("用药统计信息:")
        stats = analyzer.get_medication_statistics()
        print(f"总用药记录数: {stats['total_medication_records']}")
        print(f"唯一患者数: {stats['unique_patients']}")
        print(f"最常用药物: {stats['top_medications']}")
        
        # 多重用药分析
        print("\n多重用药分析:")
        poly = analyzer.analyze_polypharmacy()
        print(f"平均每人平均用药数: {poly['average_medications_per_patient']:.2f}")
        print(f"多重用药分布: {poly['polypharmacy_distribution']}")
        
        # 分析特定患者
        sample_patients = patients_df['patient_id'].sample(3).tolist()
        for patient_id in sample_patients:
            print(f"\n分析患者: {patient_id}")
            analysis = analyzer.analyze_patient_medications(patient_id)
            if 'error' not in analysis:
                print(f"  安全评分: {analysis['safety_score']}")
                print(f"  药物相互作用数: {len(analysis['drug_interactions'])}")
                print(f"  依从性风险: {analysis['adherence_analysis']['overall_adherence_risk']}")
