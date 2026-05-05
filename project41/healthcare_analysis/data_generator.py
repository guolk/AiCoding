import pandas as pd
import numpy as np
from faker import Faker
from datetime import datetime, timedelta
import random
from typing import Dict, List, Tuple

class HealthcareDataGenerator:
    """医疗健康数据生成器 - 生成10000名虚拟患者的合成数据集"""
    
    def __init__(self, num_patients: int = 10000, seed: int = 42):
        self.num_patients = num_patients
        self.seed = seed
        self.fake = Faker('zh_CN')
        random.seed(seed)
        np.random.seed(seed)
        Faker.seed(seed)
        
        # 医学知识库
        self.diseases = self._init_diseases()
        self.medications = self._init_medications()
        self.lab_tests = self._init_lab_tests()
        self.departments = [
            '内科', '外科', '儿科', '妇产科', '骨科', '心内科',
            '神经内科', '呼吸内科', '消化内科', '肾内科', '内分泌科',
            '肿瘤科', '眼科', '耳鼻喉科', '皮肤科', '急诊科'
        ]
        self.regions = [
            '北京市', '上海市', '广州市', '深圳市', '杭州市',
            '南京市', '武汉市', '成都市', '重庆市', '西安市',
            '天津市', '苏州市', '郑州市', '长沙市', '东莞市',
            '青岛市', '沈阳市', '宁波市', '昆明市', '大连市'
        ]
        
    def _init_diseases(self) -> Dict:
        """初始化疾病知识库"""
        return {
            '高血压': {
                'icd10': 'I10',
                'age_range': (40, 85),
                'prevalence': 0.25,
                'complications': ['冠心病', '脑卒中', '糖尿病', '慢性肾病'],
                'treatments': ['降压药物', '生活方式干预'],
                'risk_factors': ['高龄', '肥胖', '高盐饮食', '家族史']
            },
            '糖尿病': {
                'icd10': 'E11',
                'age_range': (35, 80),
                'prevalence': 0.12,
                'complications': ['糖尿病肾病', '糖尿病视网膜病变', '冠心病', '脑卒中'],
                'treatments': ['降糖药物', '胰岛素', '饮食控制'],
                'risk_factors': ['肥胖', '高龄', '家族史', '缺乏运动']
            },
            '冠心病': {
                'icd10': 'I25',
                'age_range': (50, 85),
                'prevalence': 0.08,
                'complications': ['心力衰竭', '心肌梗死', '心律失常'],
                'treatments': ['抗血小板药物', '他汀类药物', '支架植入'],
                'risk_factors': ['高血压', '糖尿病', '吸烟', '高血脂']
            },
            '脑卒中': {
                'icd10': 'I63',
                'age_range': (55, 85),
                'prevalence': 0.05,
                'complications': ['瘫痪', '失语', '认知障碍', '抑郁症'],
                'treatments': ['溶栓治疗', '康复训练', '抗血栓药物'],
                'risk_factors': ['高血压', '糖尿病', '房颤', '吸烟']
            },
            '慢性阻塞性肺疾病': {
                'icd10': 'J44',
                'age_range': (50, 80),
                'prevalence': 0.06,
                'complications': ['呼吸衰竭', '肺心病', '肺部感染'],
                'treatments': ['支气管扩张剂', '激素', '氧疗'],
                'risk_factors': ['吸烟', '空气污染', '职业暴露']
            },
            '慢性肾病': {
                'icd10': 'N18',
                'age_range': (40, 85),
                'prevalence': 0.07,
                'complications': ['贫血', '骨病', '心血管疾病', '尿毒症'],
                'treatments': ['透析', '肾移植', '药物治疗'],
                'risk_factors': ['高血压', '糖尿病', '家族史', '药物滥用']
            },
            '抑郁症': {
                'icd10': 'F32',
                'age_range': (18, 65),
                'prevalence': 0.08,
                'complications': ['焦虑症', '睡眠障碍', '自杀倾向'],
                'treatments': ['抗抑郁药物', '心理治疗', '电休克治疗'],
                'risk_factors': ['家族史', '压力事件', '慢性疾病', '孤独']
            },
            '骨质疏松症': {
                'icd10': 'M81',
                'age_range': (50, 85),
                'prevalence': 0.10,
                'complications': ['骨折', '疼痛', '残疾'],
                'treatments': ['钙剂', '维生素D', '双膦酸盐'],
                'risk_factors': ['女性', '高龄', '低体重', '缺乏运动']
            },
            '哮喘': {
                'icd10': 'J45',
                'age_range': (5, 60),
                'prevalence': 0.05,
                'complications': ['呼吸衰竭', '气胸', '肺不张'],
                'treatments': ['吸入激素', '支气管扩张剂', '脱敏治疗'],
                'risk_factors': ['过敏体质', '家族史', '空气污染', '吸烟']
            },
            '消化性溃疡': {
                'icd10': 'K25',
                'age_range': (25, 70),
                'prevalence': 0.06,
                'complications': ['出血', '穿孔', '幽门梗阻', '癌变'],
                'treatments': ['质子泵抑制剂', '抗生素', '手术'],
                'risk_factors': ['幽门螺杆菌感染', '非甾体抗炎药', '吸烟', '压力']
            }
        }
    
    def _init_medications(self) -> Dict:
        """初始化药物知识库"""
        return {
            # 降压药物
            '氨氯地平': {
                'class': '钙通道阻滞剂',
                'indications': ['高血压', '冠心病'],
                'interactions': ['西地那非', '伊曲康唑', '红霉素'],
                'dosage_range': (2.5, 10)
            },
            '缬沙坦': {
                'class': 'ARB',
                'indications': ['高血压', '心力衰竭', '糖尿病肾病'],
                'interactions': ['保钾利尿剂', '锂剂', '非甾体抗炎药'],
                'dosage_range': (80, 320)
            },
            '美托洛尔': {
                'class': 'β受体阻滞剂',
                'indications': ['高血压', '冠心病', '心力衰竭', '心律失常'],
                'interactions': ['维拉帕米', '地尔硫卓', '胰岛素'],
                'dosage_range': (25, 200)
            },
            '氢氯噻嗪': {
                'class': '利尿剂',
                'indications': ['高血压', '心力衰竭', '水肿'],
                'interactions': ['锂剂', '地高辛', '非甾体抗炎药'],
                'dosage_range': (12.5, 50)
            },
            '依那普利': {
                'class': 'ACEI',
                'indications': ['高血压', '心力衰竭', '心肌梗死'],
                'interactions': ['保钾利尿剂', '锂剂', '非甾体抗炎药'],
                'dosage_range': (5, 40)
            },
            
            # 降糖药物
            '二甲双胍': {
                'class': '双胍类',
                'indications': ['糖尿病'],
                'interactions': ['碘造影剂', '西咪替丁', '华法林'],
                'dosage_range': (500, 2550)
            },
            '格列美脲': {
                'class': '磺脲类',
                'indications': ['糖尿病'],
                'interactions': ['非甾体抗炎药', '华法林', '酒精'],
                'dosage_range': (1, 8)
            },
            '胰岛素': {
                'class': '胰岛素',
                'indications': ['糖尿病'],
                'interactions': ['口服降糖药', 'β受体阻滞剂', '酒精'],
                'dosage_range': (10, 100)
            },
            '阿卡波糖': {
                'class': 'α-葡萄糖苷酶抑制剂',
                'indications': ['糖尿病'],
                'interactions': ['地高辛', '华法林'],
                'dosage_range': (50, 300)
            },
            
            # 心血管药物
            '阿司匹林': {
                'class': '抗血小板',
                'indications': ['冠心病', '脑卒中', '外周动脉疾病'],
                'interactions': ['华法林', '非甾体抗炎药', '糖皮质激素'],
                'dosage_range': (75, 325)
            },
            '氯吡格雷': {
                'class': '抗血小板',
                'indications': ['冠心病', '急性冠脉综合征', '脑卒中'],
                'interactions': ['奥美拉唑', '华法林', '非甾体抗炎药'],
                'dosage_range': (75, 75)
            },
            '阿托伐他汀': {
                'class': '他汀类',
                'indications': ['高血脂', '冠心病', '脑卒中预防'],
                'interactions': ['红霉素', '克拉霉素', '伊曲康唑'],
                'dosage_range': (10, 80)
            },
            '华法林': {
                'class': '抗凝剂',
                'indications': ['房颤', '深静脉血栓', '肺栓塞', '人工心脏瓣膜'],
                'interactions': ['阿司匹林', '非甾体抗炎药', '抗生素', '酒精'],
                'dosage_range': (2, 10)
            },
            
            # 呼吸科药物
            '沙丁胺醇': {
                'class': '支气管扩张剂',
                'indications': ['哮喘', '慢性阻塞性肺疾病'],
                'interactions': ['β受体阻滞剂', '利尿剂', '茶碱'],
                'dosage_range': (2, 8)
            },
            '布地奈德': {
                'class': '吸入激素',
                'indications': ['哮喘', '慢性阻塞性肺疾病'],
                'interactions': ['酮康唑', '伊曲康唑'],
                'dosage_range': (100, 800)
            },
            
            # 消化系统药物
            '奥美拉唑': {
                'class': '质子泵抑制剂',
                'indications': ['消化性溃疡', '胃食管反流', '幽门螺杆菌根除'],
                'interactions': ['氯吡格雷', '华法林', '地西泮'],
                'dosage_range': (20, 40)
            },
            '泮托拉唑': {
                'class': '质子泵抑制剂',
                'indications': ['消化性溃疡', '胃食管反流'],
                'interactions': ['华法林', '地高辛'],
                'dosage_range': (20, 40)
            },
            
            # 精神科药物
            '舍曲林': {
                'class': 'SSRIs',
                'indications': ['抑郁症', '强迫症', '焦虑症'],
                'interactions': ['单胺氧化酶抑制剂', '华法林', '西咪替丁'],
                'dosage_range': (50, 200)
            },
            '氟西汀': {
                'class': 'SSRIs',
                'indications': ['抑郁症', '强迫症', '暴食症'],
                'interactions': ['单胺氧化酶抑制剂', '华法林', '锂剂'],
                'dosage_range': (20, 80)
            },
            
            # 骨质疏松药物
            '阿仑膦酸钠': {
                'class': '双膦酸盐',
                'indications': ['骨质疏松症', '佩吉特病'],
                'interactions': ['钙剂', '铝剂', '非甾体抗炎药'],
                'dosage_range': (70, 70)
            },
            '碳酸钙D3': {
                'class': '钙剂',
                'indications': ['骨质疏松症', '钙缺乏'],
                'interactions': ['四环素', '喹诺酮类', '铁剂'],
                'dosage_range': (600, 1200)
            }
        }
    
    def _init_lab_tests(self) -> Dict:
        """初始化检验项目知识库"""
        return {
            '血常规': {
                'tests': ['白细胞计数', '红细胞计数', '血红蛋白', '血小板计数',
                         '中性粒细胞百分比', '淋巴细胞百分比', '单核细胞百分比',
                         '嗜酸性粒细胞百分比', '嗜碱性粒细胞百分比'],
                'normal_ranges': {
                    '白细胞计数': (4.0, 10.0),
                    '红细胞计数': (4.0, 5.5),
                    '血红蛋白': (120, 160),
                    '血小板计数': (100, 300),
                    '中性粒细胞百分比': (50, 70),
                    '淋巴细胞百分比': (20, 40),
                    '单核细胞百分比': (3, 8),
                    '嗜酸性粒细胞百分比': (0.5, 5),
                    '嗜碱性粒细胞百分比': (0, 1)
                }
            },
            '生化检查': {
                'tests': ['谷丙转氨酶', '谷草转氨酶', '总胆红素', '直接胆红素',
                         '总蛋白', '白蛋白', '球蛋白', '尿素氮', '肌酐',
                         '尿酸', '空腹血糖', '糖化血红蛋白', '总胆固醇',
                         '甘油三酯', '高密度脂蛋白胆固醇', '低密度脂蛋白胆固醇',
                         '钾', '钠', '氯', '钙', '磷'],
                'normal_ranges': {
                    '谷丙转氨酶': (0, 40),
                    '谷草转氨酶': (0, 40),
                    '总胆红素': (3.4, 17.1),
                    '直接胆红素': (0, 6.8),
                    '总蛋白': (60, 80),
                    '白蛋白': (35, 55),
                    '球蛋白': (20, 30),
                    '尿素氮': (2.9, 8.2),
                    '肌酐': (44, 133),
                    '尿酸': (150, 420),
                    '空腹血糖': (3.9, 6.1),
                    '糖化血红蛋白': (4.0, 6.0),
                    '总胆固醇': (2.8, 5.2),
                    '甘油三酯': (0.56, 1.7),
                    '高密度脂蛋白胆固醇': (0.9, 1.68),
                    '低密度脂蛋白胆固醇': (2.1, 3.1),
                    '钾': (3.5, 5.5),
                    '钠': (135, 145),
                    '氯': (96, 108),
                    '钙': (2.25, 2.75),
                    '磷': (0.96, 1.62)
                }
            },
            '凝血功能': {
                'tests': ['凝血酶原时间', '国际标准化比值', '活化部分凝血活酶时间',
                         '凝血酶时间', '纤维蛋白原'],
                'normal_ranges': {
                    '凝血酶原时间': (11, 13),
                    '国际标准化比值': (0.8, 1.2),
                    '活化部分凝血活酶时间': (25, 35),
                    '凝血酶时间': (12, 16),
                    '纤维蛋白原': (2, 4)
                }
            },
            '尿常规': {
                'tests': ['尿蛋白', '尿糖', '尿胆红素', '尿胆原', '尿酮体',
                         '尿潜血', '尿白细胞', '尿亚硝酸盐', '尿pH值',
                         '尿比重', '维生素C'],
                'normal_ranges': {
                    '尿蛋白': (0, 0),
                    '尿糖': (0, 0),
                    '尿胆红素': (0, 0),
                    '尿胆原': (0, 1),
                    '尿酮体': (0, 0),
                    '尿潜血': (0, 0),
                    '尿白细胞': (0, 5),
                    '尿亚硝酸盐': (0, 0),
                    '尿pH值': (5.5, 7.5),
                    '尿比重': (1.015, 1.025),
                    '维生素C': (0, 0)
                }
            }
        }
    
    def generate_patients(self) -> pd.DataFrame:
        """生成患者基本信息表"""
        print("正在生成患者基本信息...")
        
        patients = []
        for i in range(self.num_patients):
            # 基础人口统计信息
            gender = random.choice(['男', '女'])
            age = int(np.random.normal(50, 18))
            age = max(18, min(90, age))  # 限制在18-90岁
            
            # 根据年龄和性别调整疾病概率
            region = random.choice(self.regions)
            
            # 计算Charlson合并症指数的基础因素
            # 根据年龄调整
            age_factor = 0
            if age >= 50:
                age_factor = 1
            if age >= 60:
                age_factor = 2
            if age >= 70:
                age_factor = 3
            if age >= 80:
                age_factor = 4
            
            patient = {
                'patient_id': f'P{i+1:06d}',
                'name': self.fake.name(),
                'gender': gender,
                'birth_date': self.fake.date_of_birth(minimum_age=age, maximum_age=age),
                'age': age,
                'region': region,
                'address': self.fake.address(),
                'phone': self.fake.phone_number(),
                'marital_status': random.choice(['未婚', '已婚', '离异', '丧偶']),
                'education': random.choice(['小学', '初中', '高中', '大专', '本科', '硕士及以上']),
                'occupation': random.choice(['企业职工', '事业单位', '自由职业', '农民', '学生', '退休', '其他']),
                'smoking_status': random.choice(['从不吸烟', '曾经吸烟', '现在吸烟']),
                'alcohol_status': random.choice(['不饮酒', '偶尔饮酒', '经常饮酒']),
                'family_history': random.choice(['无', '高血压', '糖尿病', '冠心病', '脑卒中', '肿瘤']),
                'charlson_age_factor': age_factor,
                'follow_up_start': (datetime.now() - timedelta(days=365*5)).strftime('%Y-%m-%d'),
                'follow_up_end': datetime.now().strftime('%Y-%m-%d')
            }
            patients.append(patient)
        
        return pd.DataFrame(patients)
    
    def generate_diagnoses(self, patients_df: pd.DataFrame) -> pd.DataFrame:
        """生成诊断记录表"""
        print("正在生成诊断记录...")
        
        diagnoses = []
        diagnosis_id = 1
        
        for _, patient in patients_df.iterrows():
            patient_age = patient['age']
            patient_gender = patient['gender']
            patient_id = patient['patient_id']
            
            # 每个患者平均有2-5种疾病
            num_diseases = np.random.poisson(2.5)
            num_diseases = max(1, min(8, num_diseases))
            
            # 主要疾病选择（根据年龄和性别调整概率）
            available_diseases = list(self.diseases.keys())
            selected_diseases = []
            
            # 计算患者的疾病风险因素
            risk_score = 0
            if patient['smoking_status'] == '现在吸烟':
                risk_score += 2
            if patient['alcohol_status'] == '经常饮酒':
                risk_score += 1
            if patient['family_history'] != '无':
                risk_score += 1
            
            for i in range(num_diseases):
                if not available_diseases:
                    break
                
                # 根据疾病患病率和患者特征选择疾病
                weights = []
                for disease in available_diseases:
                    disease_info = self.diseases[disease]
                    age_min, age_max = disease_info['age_range']
                    
                    # 基础权重 = 患病率
                    weight = disease_info['prevalence']
                    
                    # 年龄调整 - 如果在疾病高发年龄范围内，增加权重
                    if age_min <= patient_age <= age_max:
                        weight *= 2.0
                    
                    # 性别调整
                    if disease in ['骨质疏松症'] and patient_gender == '女':
                        weight *= 2.5
                    if disease in ['冠心病', '脑卒中'] and patient_gender == '男':
                        weight *= 1.5
                    
                    # 风险因素调整
                    weight *= (1 + risk_score * 0.2)
                    
                    # 如果患者已经有并发症相关疾病，增加患病概率
                    for complication in disease_info['complications']:
                        if complication in selected_diseases:
                            weight *= 1.5
                    
                    weights.append(weight)
                
                # 归一化权重
                total_weight = sum(weights)
                if total_weight > 0:
                    probabilities = [w / total_weight for w in weights]
                else:
                    probabilities = [1.0 / len(available_diseases)] * len(available_diseases)
                
                # 选择疾病
                selected_disease = np.random.choice(available_diseases, p=probabilities)
                selected_diseases.append(selected_disease)
                available_diseases.remove(selected_disease)
                
                # 生成诊断详情
                disease_info = self.diseases[selected_disease]
                
                # 诊断日期 - 在5年随访期内
                follow_days = 365 * 5
                diagnosis_days_ago = int(np.random.uniform(0, follow_days))
                diagnosis_date = (datetime.now() - timedelta(days=diagnosis_days_ago)).strftime('%Y-%m-%d')
                
                # 疾病严重程度
                severity = random.choice(['轻度', '中度', '重度'])
                
                # 诊断类型
                diagnosis_type = random.choice(['门诊诊断', '住院诊断', '急诊诊断', '体检发现'])
                
                # 疾病状态
                status = random.choice(['活动期', '稳定期', '缓解期', '治愈'])
                
                # 计算Charlson评分
                charlson_weight = self._calculate_charlson_weight(selected_disease, severity)
                
                diagnosis = {
                    'diagnosis_id': f'D{diagnosis_id:07d}',
                    'patient_id': patient_id,
                    'disease_name': selected_disease,
                    'icd10_code': disease_info['icd10'],
                    'diagnosis_date': diagnosis_date,
                    'diagnosis_type': diagnosis_type,
                    'severity': severity,
                    'disease_status': status,
                    'department': random.choice(self.departments),
                    'doctor_name': self.fake.name(),
                    'charlson_weight': charlson_weight,
                    'has_complications': len([c for c in disease_info['complications'] if c in selected_diseases]) > 0,
                    'risk_factors': ','.join(random.sample(disease_info['risk_factors'], 
                                                   min(2, len(disease_info['risk_factors']))))
                }
                diagnoses.append(diagnosis)
                diagnosis_id += 1
        
        return pd.DataFrame(diagnoses)
    
    def _calculate_charlson_weight(self, disease: str, severity: str) -> int:
        """计算疾病的Charlson合并症权重"""
        # Charlson合并症指数标准权重
        charlson_weights = {
            '心肌梗死': 1,
            '心力衰竭': 1,
            '周围血管疾病': 1,
            '脑血管疾病': 1,
            '痴呆': 1,
            '慢性阻塞性肺疾病': 1,
            '结缔组织病': 1,
            '消化性溃疡': 1,
            '糖尿病': 1,
            '糖尿病（并发症）': 2,
            '偏瘫': 2,
            '慢性肾病': 2,
            '慢性肾病（晚期）': 3,
            '淋巴瘤': 2,
            '白血病': 2,
            '实体肿瘤': 2,
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
            '肿瘤': '实体肿瘤',
            '消化性溃疡': '消化性溃疡'
        }
        
        mapped_disease = disease_mapping.get(disease, disease)
        base_weight = charlson_weights.get(mapped_disease, 0)
        
        # 根据严重程度调整
        if severity == '重度':
            base_weight = min(base_weight + 1, 6)
        elif severity == '轻度':
            base_weight = max(0, base_weight - 1)
        
        return base_weight
    
    def generate_medications(self, patients_df: pd.DataFrame, diagnoses_df: pd.DataFrame) -> pd.DataFrame:
        """生成用药记录表"""
        print("正在生成用药记录...")
        
        medications = []
        medication_id = 1
        
        for _, patient in patients_df.iterrows():
            patient_id = patient['patient_id']
            
            # 获取患者的诊断
            patient_diagnoses = diagnoses_df[diagnoses_df['patient_id'] == patient_id]
            
            if patient_diagnoses.empty:
                continue
            
            # 为每个诊断生成对应的药物
            for _, diagnosis in patient_diagnoses.iterrows():
                disease_name = diagnosis['disease_name']
                disease_info = self.diseases.get(disease_name, {})
                
                # 获取该疾病的推荐治疗药物
                indicated_medications = []
                for med_name, med_info in self.medications.items():
                    if disease_name in med_info['indications']:
                        indicated_medications.append(med_name)
                
                # 随机选择2-4种药物
                if indicated_medications:
                    num_meds = min(len(indicated_medications), random.randint(1, 3))
                    selected_meds = random.sample(indicated_medications, num_meds)
                    
                    for med_name in selected_meds:
                        med_info = self.medications[med_name]
                        
                        # 用药日期 - 在诊断日期之后
                        diagnosis_date = datetime.strptime(diagnosis['diagnosis_date'], '%Y-%m-%d')
                        start_days = int(np.random.uniform(0, 90))
                        start_date = (diagnosis_date + timedelta(days=start_days)).strftime('%Y-%m-%d')
                        
                        # 用药时长
                        duration_days = int(np.random.uniform(30, 365*2))
                        end_date = (datetime.strptime(start_date, '%Y-%m-%d') + 
                                   timedelta(days=duration_days)).strftime('%Y-%m-%d')
                        
                        # 剂量
                        min_dose, max_dose = med_info['dosage_range']
                        dosage = round(np.random.uniform(min_dose, max_dose), 1)
                        
                        # 用药频率
                        frequency = random.choice(['每日1次', '每日2次', '每日3次', '每周1次', '需要时'])
                        
                        # 给药途径
                        route = random.choice(['口服', '静脉注射', '肌肉注射', '皮下注射', '吸入'])
                        
                        # 处方医生
                        prescriber = self.fake.name()
                        
                        medication = {
                            'medication_id': f'M{medication_id:07d}',
                            'patient_id': patient_id,
                            'diagnosis_id': diagnosis['diagnosis_id'],
                            'medication_name': med_name,
                            'drug_class': med_info['class'],
                            'indication': disease_name,
                            'start_date': start_date,
                            'end_date': end_date,
                            'dosage': dosage,
                            'dosage_unit': 'mg' if med_name != '胰岛素' else 'IU',
                            'frequency': frequency,
                            'route': route,
                            'prescriber': prescriber,
                            'prescription_status': random.choice(['进行中', '已完成', '已停止']),
                            'adherence': random.choice(['良好', '一般', '差']),
                            'has_side_effects': random.random() < 0.15,
                            'side_effects': random.choice(['恶心', '头晕', '皮疹', '头痛', '其他']) if random.random() < 0.15 else None
                        }
                        medications.append(medication)
                        medication_id += 1
        
        return pd.DataFrame(medications)
    
    def generate_lab_results(self, patients_df: pd.DataFrame, diagnoses_df: pd.DataFrame) -> pd.DataFrame:
        """生成检验结果表"""
        print("正在生成检验结果...")
        
        lab_results = []
        lab_id = 1
        
        for _, patient in patients_df.iterrows():
            patient_id = patient['patient_id']
            patient_age = patient['age']
            
            # 每个患者有3-12次检验记录
            num_labs = int(np.random.uniform(3, 12))
            
            # 获取患者的诊断，用于调整检验结果
            patient_diagnoses = diagnoses_df[diagnoses_df['patient_id'] == patient_id]
            has_diabetes = any('糖尿病' in d for d in patient_diagnoses['disease_name'].values)
            has_hypertension = any('高血压' in d for d in patient_diagnoses['disease_name'].values)
            has_kidney_disease = any('慢性肾病' in d for d in patient_diagnoses['disease_name'].values)
            has_heart_disease = any('冠心病' in d for d in patient_diagnoses['disease_name'].values)
            
            for lab_idx in range(num_labs):
                # 检验日期 - 在5年随访期内
                lab_days_ago = int(np.random.uniform(0, 365*5))
                lab_date = (datetime.now() - timedelta(days=lab_days_ago)).strftime('%Y-%m-%d')
                
                # 检验类型
                lab_types = list(self.lab_tests.keys())
                selected_lab_type = random.choice(lab_types)
                lab_info = self.lab_tests[selected_lab_type]
                
                # 检验科室
                department = random.choice(['检验科', '门诊', '住院部', '急诊科'])
                
                # 生成每个检验项目的结果
                for test_name in lab_info['tests']:
                    normal_min, normal_max = lab_info['normal_ranges'].get(test_name, (0, 1))
                    
                    # 根据患者疾病状态调整结果
                    base_value = np.random.normal(
                        (normal_min + normal_max) / 2,
                        (normal_max - normal_min) / 6
                    )
                    
                    # 针对特定疾病的异常结果
                    is_abnormal = False
                    
                    if has_diabetes and test_name in ['空腹血糖', '糖化血红蛋白', '甘油三酯']:
                        if random.random() < 0.6:
                            is_abnormal = True
                            if test_name == '空腹血糖':
                                base_value = np.random.uniform(7.0, 15.0)
                            elif test_name == '糖化血红蛋白':
                                base_value = np.random.uniform(6.5, 10.0)
                            elif test_name == '甘油三酯':
                                base_value = np.random.uniform(2.0, 5.0)
                    
                    if has_hypertension and test_name in ['肌酐', '尿酸', '总胆固醇', '低密度脂蛋白胆固醇']:
                        if random.random() < 0.5:
                            is_abnormal = True
                            if test_name == '肌酐':
                                base_value = np.random.uniform(133, 200)
                            elif test_name == '尿酸':
                                base_value = np.random.uniform(420, 600)
                            elif test_name in ['总胆固醇', '低密度脂蛋白胆固醇']:
                                base_value = normal_max * 1.3
                    
                    if has_kidney_disease and test_name in ['肌酐', '尿素氮', '尿酸', '尿蛋白']:
                        if random.random() < 0.7:
                            is_abnormal = True
                            if test_name == '肌酐':
                                base_value = np.random.uniform(150, 400)
                            elif test_name == '尿素氮':
                                base_value = np.random.uniform(10, 30)
                            elif test_name == '尿蛋白':
                                base_value = np.random.choice([1, 2, 3])
                    
                    if has_heart_disease and test_name in ['肌钙蛋白', '肌红蛋白', 'BNP']:
                        # 这些检验不在默认列表中，但可以特殊处理
                        pass
                    
                    # 年龄调整
                    if patient_age > 65:
                        base_value *= (1 + np.random.uniform(-0.1, 0.2))
                    
                    # 确保值在合理范围内
                    value = max(normal_min * 0.5, min(normal_max * 2.0, base_value))
                    
                    # 判断是否异常
                    if not is_abnormal:
                        is_abnormal = (value < normal_min * 0.9) or (value > normal_max * 1.1)
                    
                    # 结果标识
                    result_flag = None
                    if is_abnormal:
                        if value < normal_min:
                            result_flag = '↓'
                        elif value > normal_max:
                            result_flag = '↑'
                    
                    # 单位
                    unit = ''
                    if test_name in ['白细胞计数', '红细胞计数']:
                        unit = '×10^9/L'
                    elif test_name == '血红蛋白':
                        unit = 'g/L'
                    elif test_name == '血小板计数':
                        unit = '×10^9/L'
                    elif test_name in ['谷丙转氨酶', '谷草转氨酶']:
                        unit = 'U/L'
                    elif test_name in ['总胆红素', '直接胆红素']:
                        unit = 'μmol/L'
                    elif test_name in ['总蛋白', '白蛋白', '球蛋白']:
                        unit = 'g/L'
                    elif test_name in ['尿素氮', '肌酐', '尿酸', '空腹血糖']:
                        unit = 'mmol/L'
                    elif test_name == '糖化血红蛋白':
                        unit = '%'
                    elif test_name in ['总胆固醇', '甘油三酯', '高密度脂蛋白胆固醇', '低密度脂蛋白胆固醇']:
                        unit = 'mmol/L'
                    elif test_name in ['钾', '钠', '氯', '钙', '磷']:
                        unit = 'mmol/L'
                    elif test_name in ['凝血酶原时间', '活化部分凝血活酶时间', '凝血酶时间']:
                        unit = '秒'
                    elif test_name == '纤维蛋白原':
                        unit = 'g/L'
                    elif test_name == '尿比重':
                        unit = ''
                    elif test_name == '尿pH值':
                        unit = ''
                    
                    lab_result = {
                        'lab_id': f'L{lab_id:08d}',
                        'patient_id': patient_id,
                        'lab_date': lab_date,
                        'lab_type': selected_lab_type,
                        'test_name': test_name,
                        'test_value': round(value, 2),
                        'unit': unit,
                        'normal_range': f'{normal_min}-{normal_max}',
                        'is_abnormal': is_abnormal,
                        'result_flag': result_flag,
                        'department': department,
                        'doctor_name': self.fake.name(),
                        'lab_technician': self.fake.name(),
                        'report_time': lab_date
                    }
                    lab_results.append(lab_result)
                    lab_id += 1
        
        return pd.DataFrame(lab_results)
    
    def generate_hospitalizations(self, patients_df: pd.DataFrame, diagnoses_df: pd.DataFrame) -> pd.DataFrame:
        """生成住院记录表"""
        print("正在生成住院记录...")
        
        hospitalizations = []
        hospitalization_id = 1
        
        for _, patient in patients_df.iterrows():
            patient_id = patient['patient_id']
            
            # 获取患者的诊断
            patient_diagnoses = diagnoses_df[diagnoses_df['patient_id'] == patient_id]
            
            if patient_diagnoses.empty:
                continue
            
            # 根据疾病严重程度决定住院次数
            # 严重疾病患者住院概率更高
            has_severe_disease = any(patient_diagnoses['severity'] == '重度')
            has_moderate_disease = any(patient_diagnoses['severity'] == '中度')
            
            if has_severe_disease:
                num_hospitalizations = int(np.random.poisson(2))
                num_hospitalizations = min(num_hospitalizations, 5)
            elif has_moderate_disease:
                num_hospitalizations = int(np.random.poisson(0.8))
                num_hospitalizations = min(num_hospitalizations, 3)
            else:
                num_hospitalizations = int(np.random.poisson(0.3))
                num_hospitalizations = min(num_hospitalizations, 2)
            
            if num_hospitalizations == 0:
                continue
            
            for hosp_idx in range(num_hospitalizations):
                # 选择主要诊断
                main_diagnosis = patient_diagnoses.sample(n=1).iloc[0]
                
                # 住院日期 - 在5年随访期内
                hosp_days_ago = int(np.random.uniform(30, 365*5))
                admission_date = (datetime.now() - timedelta(days=hosp_days_ago)).strftime('%Y-%m-%d')
                
                # 住院时长 - 根据疾病严重程度
                if main_diagnosis['severity'] == '重度':
                    los_mean = 14
                    los_std = 7
                elif main_diagnosis['severity'] == '中度':
                    los_mean = 7
                    los_std = 3
                else:
                    los_mean = 4
                    los_std = 2
                
                length_of_stay = int(np.random.normal(los_mean, los_std))
                length_of_stay = max(1, min(60, length_of_stay))
                
                discharge_date = (datetime.strptime(admission_date, '%Y-%m-%d') + 
                                timedelta(days=length_of_stay)).strftime('%Y-%m-%d')
                
                # 入院科室
                admission_department = random.choice(self.departments)
                
                # 出院科室
                discharge_department = admission_department if random.random() < 0.8 else random.choice(self.departments)
                
                # 入院类型
                admission_type = random.choice(['急诊入院', '门诊入院', '转科入院', '其他'])
                
                # 出院方式
                discharge_type = random.choice(['治愈出院', '好转出院', '未愈出院', '转院', '死亡'])
                
                # 诊疗路径
                # 从入院到治疗到出院的流程
                treatment_path = self._generate_treatment_path(main_diagnosis['disease_name'], 
                                                               main_diagnosis['severity'])
                
                # 再入院信息
                # 30天内再入院概率
                readmission_within_30 = random.random() < 0.15
                readmission_days = None
                if readmission_within_30:
                    readmission_days = int(np.random.uniform(1, 30))
                
                # 费用信息
                total_cost = self._calculate_hospitalization_cost(
                    main_diagnosis['disease_name'], 
                    length_of_stay, 
                    main_diagnosis['severity']
                )
                
                # 床位信息
                bed_type = random.choice(['普通病房', 'ICU', 'CCU', '特需病房'])
                if main_diagnosis['severity'] == '重度' and random.random() < 0.6:
                    bed_type = 'ICU'
                
                # 医生信息
                attending_doctor = self.fake.name()
                chief_doctor = self.fake.name()
                
                hospitalization = {
                    'hospitalization_id': f'H{hospitalization_id:07d}',
                    'patient_id': patient_id,
                    'main_diagnosis_id': main_diagnosis['diagnosis_id'],
                    'main_diagnosis': main_diagnosis['disease_name'],
                    'admission_date': admission_date,
                    'discharge_date': discharge_date,
                    'length_of_stay': length_of_stay,
                    'admission_department': admission_department,
                    'discharge_department': discharge_department,
                    'admission_type': admission_type,
                    'discharge_type': discharge_type,
                    'bed_type': bed_type,
                    'treatment_path': ' → '.join(treatment_path),
                    'total_cost': round(total_cost, 2),
                    'attending_doctor': attending_doctor,
                    'chief_doctor': chief_doctor,
                    'readmission_within_30': readmission_within_30,
                    'readmission_days': readmission_days,
                    'has_complications_during_stay': random.random() < 0.2,
                    'complications': random.choice(['感染', '出血', '器官功能障碍', '其他']) if random.random() < 0.2 else None,
                    'icu_stay_days': int(np.random.uniform(1, 7)) if bed_type == 'ICU' else 0,
                    'surgery_performed': random.random() < 0.3,
                    'surgery_type': random.choice(['微创手术', '开放手术', '介入手术']) if random.random() < 0.3 else None
                }
                hospitalizations.append(hospitalization)
                hospitalization_id += 1
        
        return pd.DataFrame(hospitalizations)
    
    def _generate_treatment_path(self, disease: str, severity: str) -> List[str]:
        """生成诊疗路径"""
        # 基础诊疗路径
        base_path = ['入院评估', '初步诊断']
        
        # 根据疾病和严重程度添加检查
        if severity == '重度':
            base_path.append('紧急检查')
        base_path.append('实验室检查')
        base_path.append('影像学检查')
        
        # 治疗阶段
        if severity == '重度':
            base_path.append('重症监护')
        
        # 疾病特异性治疗
        disease_treatments = {
            '冠心病': ['药物治疗', '冠脉造影', '可能支架植入'],
            '脑卒中': ['溶栓评估', '药物治疗', '康复治疗'],
            '糖尿病': ['血糖调控', '并发症筛查', '糖尿病教育'],
            '慢性阻塞性肺疾病': ['氧疗', '支气管扩张剂', '呼吸康复'],
            '慢性肾病': ['肾功能评估', '透析准备', '肾科随访'],
            '高血压': ['血压监测', '药物调整', '生活方式指导'],
            '抑郁症': ['心理评估', '药物治疗', '心理治疗'],
            '骨质疏松症': ['骨密度检测', '药物治疗', '防跌倒教育'],
            '哮喘': ['肺功能检查', '吸入治疗', '过敏原规避指导'],
            '消化性溃疡': ['胃镜检查', '幽门螺杆菌根除', '饮食指导']
        }
        
        specific_treatments = disease_treatments.get(disease, ['药物治疗', '支持治疗'])
        base_path.extend(specific_treatments)
        
        # 出院阶段
        base_path.append('出院评估')
        base_path.append('出院带药')
        base_path.append('出院随访')
        
        return base_path
    
    def _calculate_hospitalization_cost(self, disease: str, length_of_stay: int, severity: str) -> float:
        """计算住院费用"""
        # 基础日费用
        base_daily_cost = {
            '普通病房': 800,
            'ICU': 5000,
            'CCU': 4000,
            '特需病房': 2000
        }
        
        # 疾病系数
        disease_coefficients = {
            '冠心病': 1.5,
            '脑卒中': 1.6,
            '糖尿病': 1.2,
            '慢性阻塞性肺疾病': 1.3,
            '慢性肾病': 1.8,
            '高血压': 1.1,
            '抑郁症': 1.0,
            '骨质疏松症': 1.0,
            '哮喘': 1.1,
            '消化性溃疡': 1.2
        }
        
        # 严重程度系数
        severity_coefficients = {
            '轻度': 1.0,
            '中度': 1.5,
            '重度': 2.5
        }
        
        base_cost = base_daily_cost['普通病房'] * length_of_stay
        disease_coeff = disease_coefficients.get(disease, 1.0)
        severity_coeff = severity_coefficients.get(severity, 1.0)
        
        # 手术费用
        has_surgery = random.random() < 0.3
        surgery_cost = np.random.uniform(5000, 30000) if has_surgery else 0
        
        # 检查费用
        lab_cost = length_of_stay * np.random.uniform(200, 500)
        
        # 药物费用
        drug_cost = length_of_stay * np.random.uniform(300, 800) * disease_coeff
        
        total_cost = (base_cost * severity_coeff) + surgery_cost + lab_cost + drug_cost
        
        # 添加一些随机波动
        total_cost *= (1 + np.random.uniform(-0.1, 0.15))
        
        return total_cost
    
    def generate_all_data(self) -> Dict[str, pd.DataFrame]:
        """生成所有数据集"""
        print("开始生成医疗健康数据...")
        print(f"患者数量: {self.num_patients}")
        print(f"时间跨度: 5年")
        print("=" * 50)
        
        # 1. 生成患者基本信息
        patients_df = self.generate_patients()
        
        # 2. 生成诊断记录
        diagnoses_df = self.generate_diagnoses(patients_df)
        
        # 3. 生成用药记录
        medications_df = self.generate_medications(patients_df, diagnoses_df)
        
        # 4. 生成检验结果
        lab_results_df = self.generate_lab_results(patients_df, diagnoses_df)
        
        # 5. 生成住院记录
        hospitalizations_df = self.generate_hospitalizations(patients_df, diagnoses_df)
        
        print("=" * 50)
        print("数据生成完成！")
        print(f"患者数: {len(patients_df)}")
        print(f"诊断记录数: {len(diagnoses_df)}")
        print(f"用药记录数: {len(medications_df)}")
        print(f"检验结果数: {len(lab_results_df)}")
        print(f"住院记录数: {len(hospitalizations_df)}")
        
        return {
            'patients': patients_df,
            'diagnoses': diagnoses_df,
            'medications': medications_df,
            'lab_results': lab_results_df,
            'hospitalizations': hospitalizations_df
        }
    
    def save_data(self, data: Dict[str, pd.DataFrame], output_dir: str = 'data'):
        """保存数据到CSV文件"""
        import os
        
        # 创建输出目录
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        print(f"正在保存数据到 {output_dir}/ 目录...")
        
        for name, df in data.items():
            file_path = os.path.join(output_dir, f'{name}.csv')
            df.to_csv(file_path, index=False, encoding='utf-8-sig')
            print(f"  已保存: {file_path} ({len(df)} 条记录)")
        
        print("数据保存完成！")


if __name__ == '__main__':
    # 创建数据生成器
    generator = HealthcareDataGenerator(num_patients=10000, seed=42)
    
    # 生成所有数据
    all_data = generator.generate_all_data()
    
    # 保存数据
    generator.save_data(all_data, output_dir='data')
    
    print("\n" + "=" * 50)
    print("医疗健康数据分析平台 - 数据生成完成")
    print("=" * 50)
