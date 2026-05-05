import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    roc_curve, precision_recall_curve
)
from sklearn.impute import SimpleImputer
import warnings
warnings.filterwarnings('ignore')


class ReadmissionPredictor:
    """再入院率预测器 - 使用逻辑回归和随机森林"""
    
    def __init__(self, patients_df: pd.DataFrame, 
                 diagnoses_df: pd.DataFrame,
                 hospitalizations_df: pd.DataFrame,
                 medications_df: pd.DataFrame,
                 lab_results_df: pd.DataFrame):
        self.patients_df = patients_df.copy()
        self.diagnoses_df = diagnoses_df.copy()
        self.hospitalizations_df = hospitalizations_df.copy()
        self.medications_df = medications_df.copy()
        self.lab_results_df = lab_results_df.copy()
        
        # 模型存储
        self.models = {}
        self.preprocessors = {}
        self.feature_names = {}
        
    def calculate_charlson_index(self, patient_id: str) -> Dict:
        """
        计算Charlson合并症指数
        
        Charlson合并症指数是预测患者10年死亡率的重要指标
        """
        # 获取患者的所有诊断
        patient_diagnoses = self.diagnoses_df[
            self.diagnoses_df['patient_id'] == patient_id
        ]
        
        # Charlson合并症权重
        charlson_weights = {
            # 1分
            '心肌梗死': 1,
            '心力衰竭': 1,
            '周围血管疾病': 1,
            '脑血管疾病': 1,
            '痴呆': 1,
            '慢性阻塞性肺疾病': 1,
            '结缔组织病': 1,
            '消化性溃疡': 1,
            '糖尿病': 1,
            # 2分
            '糖尿病（并发症）': 2,
            '偏瘫': 2,
            '慢性肾病': 2,
            '淋巴瘤': 2,
            '白血病': 2,
            '实体肿瘤': 2,
            # 3分
            '糖尿病（严重并发症）': 3,
            '慢性肾病（晚期）': 3,
            # 6分
            '转移性肿瘤': 6,
            '艾滋病': 6
        }
        
        # 疾病映射
        disease_mapping = {
            '冠心病': '心肌梗死',
            '脑卒中': '脑血管疾病',
            '糖尿病': '糖尿病',
            '慢性肾病': '慢性肾病',
            '慢性阻塞性肺疾病': '慢性阻塞性肺疾病',
            '消化性溃疡': '消化性溃疡'
        }
        
        total_score = 0
        comorbidities = []
        
        for _, diagnosis in patient_diagnoses.iterrows():
            disease_name = diagnosis['disease_name']
            severity = diagnosis['severity']
            
            # 映射疾病名称
            mapped_disease = disease_mapping.get(disease_name, disease_name)
            
            # 根据严重程度调整
            if severity == '重度':
                if mapped_disease == '糖尿病':
                    mapped_disease = '糖尿病（并发症）'
                elif mapped_disease == '慢性肾病':
                    mapped_disease = '慢性肾病（晚期）'
            
            # 获取权重
            weight = charlson_weights.get(mapped_disease, 0)
            
            if weight > 0:
                total_score += weight
                comorbidities.append({
                    'disease': disease_name,
                    'mapped_disease': mapped_disease,
                    'severity': severity,
                    'weight': weight
                })
        
        # 获取患者年龄因素
        patient_info = self.patients_df[
            self.patients_df['patient_id'] == patient_id
        ].iloc[0]
        age = patient_info['age']
        
        # 年龄调整
        age_score = 0
        if age >= 50:
            age_score = 1
        if age >= 60:
            age_score = 2
        if age >= 70:
            age_score = 3
        if age >= 80:
            age_score = 4
        
        total_score_with_age = total_score + age_score
        
        return {
            'patient_id': patient_id,
            'comorbidity_count': len(comorbidities),
            'comorbidities': comorbidities,
            'charlson_score': total_score,
            'age_score': age_score,
            'total_score': total_score_with_age,
            'mortality_risk': self._get_mortality_risk(total_score_with_age)
        }
    
    def _get_mortality_risk(self, score: int) -> str:
        """根据Charlson评分评估死亡率风险"""
        if score == 0:
            return '极低风险（0%）'
        elif score <= 2:
            return '低风险（12%）'
        elif score <= 4:
            return '中等风险（26%）'
        elif score <= 6:
            return '高风险（52%）'
        else:
            return '极高风险（85%）'
    
    def engineer_features(self) -> pd.DataFrame:
        """
        特征工程 - 创建用于预测的特征矩阵
        
        包括：
        1. 人口统计学特征
        2. Charlson合并症指数
        3. 住院历史特征
        4. 用药特征
        5. 检验结果特征
        """
        print("开始特征工程...")
        
        # 以住院记录为基础
        features_df = self.hospitalizations_df.copy()
        
        # 1. 目标变量：30天内再入院
        features_df['readmitted_30d'] = features_df['readmission_within_30'].astype(int)
        
        # 2. 人口统计学特征
        features_df = pd.merge(
            features_df,
            self.patients_df[['patient_id', 'gender', 'age', 'region', 'marital_status',
                             'education', 'occupation', 'smoking_status', 'alcohol_status',
                             'family_history']],
            on='patient_id',
            how='left'
        )
        
        # 3. Charlson合并症指数
        print("  计算Charlson合并症指数...")
        charlson_features = []
        for patient_id in features_df['patient_id'].unique():
            charlson = self.calculate_charlson_index(patient_id)
            charlson_features.append({
                'patient_id': patient_id,
                'charlson_score': charlson['charlson_score'],
                'total_charlson_score': charlson['total_score'],
                'comorbidity_count': charlson['comorbidity_count']
            })
        
        charlson_df = pd.DataFrame(charlson_features)
        features_df = pd.merge(features_df, charlson_df, on='patient_id', how='left')
        
        # 4. 住院历史特征
        print("  提取住院历史特征...")
        
        # 按患者分组计算历史住院次数
        patient_hospitalizations = self.hospitalizations_df.groupby('patient_id').agg(
            total_hospitalizations=('hospitalization_id', 'count'),
            avg_length_of_stay=('length_of_stay', 'mean'),
            total_icu_days=('icu_stay_days', 'sum'),
            readmission_count=('readmission_within_30', 'sum')
        ).reset_index()
        
        features_df = pd.merge(features_df, patient_hospitalizations, 
                             on='patient_id', how='left')
        
        # 5. 用药特征
        print("  提取用药特征...")
        
        # 计算每个患者的用药数量和类别
        patient_medications = self.medications_df.groupby('patient_id').agg(
            medication_count=('medication_name', 'nunique'),
            drug_class_count=('drug_class', 'nunique'),
            has_side_effects=('has_side_effects', 'any'),
            poor_adherence=('adherence', lambda x: (x == '差').any())
        ).reset_index()
        
        features_df = pd.merge(features_df, patient_medications, 
                             on='patient_id', how='left')
        
        # 6. 检验结果特征
        print("  提取检验结果特征...")
        
        # 计算异常检验结果数量
        lab_abnormalities = self.lab_results_df.groupby('patient_id').agg(
            total_lab_tests=('lab_id', 'count'),
            abnormal_lab_tests=('is_abnormal', 'sum'),
            abnormal_ratio=('is_abnormal', 'mean')
        ).reset_index()
        
        features_df = pd.merge(features_df, lab_abnormalities, 
                             on='patient_id', how='left')
        
        # 7. 编码分类变量
        print("  编码分类变量...")
        
        # 性别编码
        features_df['gender_encoded'] = features_df['gender'].map({'男': 1, '女': 0})
        
        # 吸烟状态编码
        smoking_map = {'从不吸烟': 0, '曾经吸烟': 1, '现在吸烟': 2}
        features_df['smoking_encoded'] = features_df['smoking_status'].map(smoking_map)
        
        # 饮酒状态编码
        alcohol_map = {'不饮酒': 0, '偶尔饮酒': 1, '经常饮酒': 2}
        features_df['alcohol_encoded'] = features_df['alcohol_status'].map(alcohol_map)
        
        # 婚姻状态编码
        marital_map = {'未婚': 0, '已婚': 1, '离异': 2, '丧偶': 3}
        features_df['marital_encoded'] = features_df['marital_status'].map(marital_map)
        
        # 住院类型编码
        admission_map = {'急诊入院': 3, '门诊入院': 1, '转科入院': 2, '其他': 0}
        features_df['admission_type_encoded'] = features_df['admission_type'].map(admission_map)
        
        # 床位类型编码
        bed_map = {'普通病房': 0, 'ICU': 2, 'CCU': 2, '特需病房': 1}
        features_df['bed_type_encoded'] = features_df['bed_type'].map(bed_map)
        
        # 8. 填充缺失值
        fill_columns = ['charlson_score', 'total_charlson_score', 'comorbidity_count',
                       'total_hospitalizations', 'avg_length_of_stay', 'total_icu_days',
                       'readmission_count', 'medication_count', 'drug_class_count',
                       'total_lab_tests', 'abnormal_lab_tests', 'abnormal_ratio']
        
        for col in fill_columns:
            if col in features_df.columns:
                features_df[col] = features_df[col].fillna(0)
        
        # 布尔值转换为整数
        bool_columns = ['has_complications_during_stay', 'surgery_performed',
                       'has_side_effects', 'poor_adherence']
        for col in bool_columns:
            if col in features_df.columns:
                features_df[col] = features_df[col].fillna(False).astype(int)
        
        print(f"特征工程完成！特征数量: {len(features_df.columns)}")
        print(f"样本数量: {len(features_df)}")
        print(f"再入院率: {features_df['readmitted_30d'].mean():.2%}")
        
        return features_df
    
    def prepare_model_data(self, features_df: pd.DataFrame) -> Tuple:
        """准备模型训练数据"""
        # 选择特征列
        feature_columns = [
            # 人口统计学
            'age', 'gender_encoded', 'smoking_encoded', 'alcohol_encoded',
            'marital_encoded',
            
            # Charlson合并症指数
            'charlson_score', 'total_charlson_score', 'comorbidity_count',
            
            # 住院特征
            'length_of_stay', 'total_hospitalizations', 'avg_length_of_stay',
            'total_icu_days', 'readmission_count', 'admission_type_encoded',
            'bed_type_encoded', 'has_complications_during_stay', 'surgery_performed',
            
            # 用药特征
            'medication_count', 'drug_class_count', 'has_side_effects', 'poor_adherence',
            
            # 检验特征
            'total_lab_tests', 'abnormal_lab_tests', 'abnormal_ratio'
        ]
        
        # 确保所有特征列都存在
        available_features = [col for col in feature_columns if col in features_df.columns]
        
        X = features_df[available_features]
        y = features_df['readmitted_30d']
        
        # 划分训练集和测试集
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42, stratify=y
        )
        
        return X_train, X_test, y_train, y_test, available_features
    
    def train_logistic_regression(self, X_train, X_test, y_train, y_test, 
                                  feature_names: List) -> Dict:
        """训练逻辑回归模型"""
        print("\n训练逻辑回归模型...")
        
        # 预处理管道
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), feature_names)
            ])
        
        # 逻辑回归模型
        lr_model = LogisticRegression(
            random_state=42,
            max_iter=1000,
            class_weight='balanced'
        )
        
        # 完整管道
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', lr_model)
        ])
        
        # 超参数搜索
        param_grid = {
            'classifier__C': [0.01, 0.1, 1, 10, 100],
            'classifier__penalty': ['l1', 'l2']
        }
        
        # 使用简化版本避免过慢
        pipeline.fit(X_train, y_train)
        
        # 预测
        y_pred = pipeline.predict(X_test)
        y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
        
        # 评估指标
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred),
            'roc_auc': roc_auc_score(y_test, y_pred_proba)
        }
        
        # 混淆矩阵
        cm = confusion_matrix(y_test, y_pred)
        
        # 特征重要性（系数）
        coefficients = pipeline.named_steps['classifier'].coef_[0]
        feature_importance = pd.DataFrame({
            'feature': feature_names,
            'coefficient': coefficients,
            'odds_ratio': np.exp(coefficients)
        }).sort_values('coefficient', ascending=False)
        
        # ROC曲线数据
        fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
        
        # 保存模型
        self.models['logistic_regression'] = pipeline
        self.feature_names['logistic_regression'] = feature_names
        
        return {
            'model_name': '逻辑回归',
            'metrics': metrics,
            'confusion_matrix': cm,
            'feature_importance': feature_importance,
            'roc_curve': {'fpr': fpr, 'tpr': tpr, 'thresholds': thresholds},
            'classification_report': classification_report(y_test, y_pred, output_dict=True)
        }
    
    def train_random_forest(self, X_train, X_test, y_train, y_test,
                            feature_names: List) -> Dict:
        """训练随机森林模型"""
        print("\n训练随机森林模型...")
        
        # 随机森林模型
        rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        
        # 训练
        rf_model.fit(X_train, y_train)
        
        # 预测
        y_pred = rf_model.predict(X_test)
        y_pred_proba = rf_model.predict_proba(X_test)[:, 1]
        
        # 评估指标
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred),
            'roc_auc': roc_auc_score(y_test, y_pred_proba)
        }
        
        # 混淆矩阵
        cm = confusion_matrix(y_test, y_pred)
        
        # 特征重要性
        feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        # ROC曲线数据
        fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
        
        # 保存模型
        self.models['random_forest'] = rf_model
        self.feature_names['random_forest'] = feature_names
        
        return {
            'model_name': '随机森林',
            'metrics': metrics,
            'confusion_matrix': cm,
            'feature_importance': feature_importance,
            'roc_curve': {'fpr': fpr, 'tpr': tpr, 'thresholds': thresholds},
            'classification_report': classification_report(y_test, y_pred, output_dict=True)
        }
    
    def train_and_evaluate(self) -> Dict:
        """训练和评估所有模型"""
        print("=" * 50)
        print("开始训练和评估模型")
        print("=" * 50)
        
        # 特征工程
        features_df = self.engineer_features()
        
        # 准备数据
        X_train, X_test, y_train, y_test, feature_names = self.prepare_model_data(features_df)
        
        # 训练逻辑回归
        lr_results = self.train_logistic_regression(
            X_train, X_test, y_train, y_test, feature_names
        )
        
        # 训练随机森林
        rf_results = self.train_random_forest(
            X_train, X_test, y_train, y_test, feature_names
        )
        
        # 比较模型
        comparison = {
            'logistic_regression': lr_results,
            'random_forest': rf_results
        }
        
        # 打印比较结果
        print("\n" + "=" * 50)
        print("模型性能比较")
        print("=" * 50)
        
        for model_name, results in comparison.items():
            print(f"\n{results['model_name']}:")
            print(f"  准确率: {results['metrics']['accuracy']:.4f}")
            print(f"  精确率: {results['metrics']['precision']:.4f}")
            print(f"  召回率: {results['metrics']['recall']:.4f}")
            print(f"  F1分数: {results['metrics']['f1']:.4f}")
            print(f"  ROC AUC: {results['metrics']['roc_auc']:.4f}")
        
        return comparison
    
    def predict_patient_readmission(self, patient_id: str, 
                                    hospitalization_id: Optional[str] = None) -> Dict:
        """
        预测特定患者的再入院风险
        
        参数:
            patient_id: 患者ID
            hospitalization_id: 住院记录ID（可选，如果不指定则使用最新的住院记录）
        
        返回:
            包含预测结果的字典
        """
        # 检查模型是否已训练
        if not self.models:
            return {'error': '模型尚未训练，请先调用train_and_evaluate()'}
        
        # 获取患者的住院记录
        patient_hospitalizations = self.hospitalizations_df[
            self.hospitalizations_df['patient_id'] == patient_id
        ]
        
        if patient_hospitalizations.empty:
            return {'error': '未找到该患者的住院记录'}
        
        # 选择住院记录
        if hospitalization_id:
            hospitalization = patient_hospitalizations[
                patient_hospitalizations['hospitalization_id'] == hospitalization_id
            ]
            if hospitalization.empty:
                return {'error': '未找到指定的住院记录'}
        else:
            # 使用最新的住院记录
            hospitalization = patient_hospitalizations.sort_values(
                'admission_date', ascending=False
            ).iloc[0:1]
        
        # 构建特征（简化版本，实际应该使用完整的特征工程）
        patient_info = self.patients_df[
            self.patients_df['patient_id'] == patient_id
        ].iloc[0]
        
        charlson = self.calculate_charlson_index(patient_id)
        
        # 构建特征字典
        features = {
            'age': patient_info['age'],
            'gender_encoded': 1 if patient_info['gender'] == '男' else 0,
            'smoking_encoded': 2 if patient_info['smoking_status'] == '现在吸烟' else 
                             1 if patient_info['smoking_status'] == '曾经吸烟' else 0,
            'alcohol_encoded': 2 if patient_info['alcohol_status'] == '经常饮酒' else 
                             1 if patient_info['alcohol_status'] == '偶尔饮酒' else 0,
            'charlson_score': charlson['charlson_score'],
            'total_charlson_score': charlson['total_score'],
            'comorbidity_count': charlson['comorbidity_count'],
            'length_of_stay': hospitalization['length_of_stay'].values[0],
            'total_hospitalizations': len(patient_hospitalizations),
            'total_icu_days': hospitalization['icu_stay_days'].values[0],
            'readmission_count': patient_hospitalizations['readmission_within_30'].sum(),
            'has_complications_during_stay': 1 if hospitalization['has_complications_during_stay'].values[0] else 0,
            'surgery_performed': 1 if hospitalization['surgery_performed'].values[0] else 0
        }
        
        # 转换为DataFrame
        feature_df = pd.DataFrame([features])
        
        # 使用两个模型进行预测
        predictions = {}
        
        for model_name, model in self.models.items():
            # 确保特征顺序正确
            expected_features = self.feature_names.get(model_name, list(features.keys()))
            available_features = [f for f in expected_features if f in feature_df.columns]
            
            if len(available_features) == 0:
                continue
            
            X_predict = feature_df[available_features]
            
            # 预测
            if model_name == 'logistic_regression':
                prob = model.predict_proba(X_predict)[0][1]
            else:
                prob = model.predict_proba(X_predict)[0][1]
            
            risk_level = '低风险'
            if prob > 0.6:
                risk_level = '高风险'
            elif prob > 0.3:
                risk_level = '中等风险'
            
            predictions[model_name] = {
                'model_name': '逻辑回归' if model_name == 'logistic_regression' else '随机森林',
                'readmission_probability': prob,
                'risk_level': risk_level,
                'predicted_class': 1 if prob > 0.5 else 0
            }
        
        return {
            'patient_id': patient_id,
            'hospitalization_id': hospitalization['hospitalization_id'].values[0],
            'patient_info': {
                'age': patient_info['age'],
                'gender': patient_info['gender'],
                'smoking_status': patient_info['smoking_status'],
                'alcohol_status': patient_info['alcohol_status']
            },
            'charlson_index': charlson,
            'hospitalization_info': {
                'length_of_stay': hospitalization['length_of_stay'].values[0],
                'has_complications': hospitalization['has_complications_during_stay'].values[0],
                'surgery_performed': hospitalization['surgery_performed'].values[0]
            },
            'predictions': predictions
        }
    
    def get_risk_patients(self, threshold: float = 0.5, 
                          top_n: int = 20) -> pd.DataFrame:
        """获取高风险患者列表"""
        # 简化版本，实际应该对所有患者进行预测
        # 这里使用Charlson评分作为风险指标
        
        high_risk = []
        
        for patient_id in self.patients_df['patient_id'].sample(min(100, len(self.patients_df))):
            charlson = self.calculate_charlson_index(patient_id)
            patient_hospitalizations = self.hospitalizations_df[
                self.hospitalizations_df['patient_id'] == patient_id
            ]
            
            if len(patient_hospitalizations) > 0:
                recent_hosp = patient_hospitalizations.sort_values(
                    'admission_date', ascending=False
                ).iloc[0]
                
                # 基于规则的风险评分
                risk_score = charlson['total_score'] * 0.1
                risk_score += recent_hosp['length_of_stay'] * 0.05
                risk_score += recent_hosp['total_icu_days'] * 0.1 if recent_hosp.get('total_icu_days') else 0
                risk_score += 0.3 if recent_hosp['has_complications_during_stay'] else 0
                
                high_risk.append({
                    'patient_id': patient_id,
                    'charlson_score': charlson['total_score'],
                    'mortality_risk': charlson['mortality_risk'],
                    'comorbidity_count': charlson['comorbidity_count'],
                    'recent_length_of_stay': recent_hosp['length_of_stay'],
                    'has_complications': recent_hosp['has_complications_during_stay'],
                    'risk_score': min(1.0, risk_score),
                    'risk_level': '高风险' if risk_score > 0.6 else 
                                '中等风险' if risk_score > 0.3 else '低风险'
                })
        
        risk_df = pd.DataFrame(high_risk)
        return risk_df.sort_values('risk_score', ascending=False).head(top_n)


if __name__ == '__main__':
    # 示例用法
    import os
    
    # 加载数据
    data_dir = 'data'
    if os.path.exists(data_dir):
        patients_df = pd.read_csv(os.path.join(data_dir, 'patients.csv'))
        diagnoses_df = pd.read_csv(os.path.join(data_dir, 'diagnoses.csv'))
        hospitalizations_df = pd.read_csv(os.path.join(data_dir, 'hospitalizations.csv'))
        medications_df = pd.read_csv(os.path.join(data_dir, 'medications.csv'))
        lab_results_df = pd.read_csv(os.path.join(data_dir, 'lab_results.csv'))
        
        # 创建预测器
        predictor = ReadmissionPredictor(
            patients_df, diagnoses_df, hospitalizations_df,
            medications_df, lab_results_df
        )
        
        # 测试Charlson指数计算
        print("测试Charlson合并症指数计算...")
        sample_patients = patients_df['patient_id'].sample(3).tolist()
        for patient_id in sample_patients:
            charlson = predictor.calculate_charlson_index(patient_id)
            print(f"\n患者 {patient_id}:")
            print(f"  Charlson评分: {charlson['charlson_score']}")
            print(f"  总评分(含年龄): {charlson['total_score']}")
            print(f"  合并症数量: {charlson['comorbidity_count']}")
            print(f"  死亡率风险: {charlson['mortality_risk']}")
        
        # 训练模型
        print("\n\n训练预测模型...")
        results = predictor.train_and_evaluate()
        
        # 获取高风险患者
        print("\n\n高风险患者:")
        high_risk = predictor.get_risk_patients(top_n=10)
        print(high_risk[['patient_id', 'charlson_score', 'risk_score', 'risk_level']])
