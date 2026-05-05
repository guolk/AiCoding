#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
简化版医疗健康数据分析平台 - 使用已安装的库
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json

import dash
from dash import dcc, html, dash_table, callback, Input, Output, State
import dash_bootstrap_components as dbc
import plotly
import plotly.graph_objects as go
import plotly.express as px

# 检查环境
print("=" * 60)
print("医疗健康数据分析平台 - 简化版")
print("=" * 60)
print(f"\nPython版本: {sys.version}")
print(f"当前目录: {os.getcwd()}")

# 已安装的库
print("\n已安装的关键库:")
print(f"  - pandas: {pd.__version__}")
print(f"  - numpy: {np.__version__}")
print(f"  - dash: {dash.__version__}")
print(f"  - plotly: {plotly.__version__}")

# 尝试导入可选库
optional_libs = {}
try:
    import seaborn as sns
    optional_libs['seaborn'] = sns
    print(f"  - seaborn: {sns.__version__}")
except ImportError:
    print("  - seaborn: 未安装")

try:
    from faker import Faker
    optional_libs['Faker'] = Faker
    print(f"  - Faker: 已安装")
except ImportError:
    print("  - Faker: 未安装（将使用内置方法生成数据）")

try:
    from sklearn.linear_model import LogisticRegression
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
    optional_libs['sklearn'] = True
    print(f"  - scikit-learn: 已安装")
except ImportError:
    print("  - scikit-learn: 未安装（机器学习功能将不可用）")

try:
    from lifelines import KaplanMeierFitter
    from lifelines.statistics import logrank_test
    optional_libs['lifelines'] = True
    print(f"  - lifelines: 已安装")
except ImportError:
    print("  - lifelines: 未安装（生存分析将使用简化方法）")

print("\n" + "=" * 60)


# =============================================================================
# 数据生成（简化版）
# =============================================================================

def generate_synthetic_data(num_patients=10000):
    """生成简化的合成医疗数据"""
    print(f"\n生成 {num_patients} 名虚拟患者的数据...")
    
    np.random.seed(42)
    random.seed(42)
    
    # 疾病列表
    diseases = [
        '高血压', '糖尿病', '冠心病', '脑卒中', 
        '慢性阻塞性肺疾病', '慢性肾病', '抑郁症', 
        '骨质疏松症', '哮喘', '消化性溃疡'
    ]
    
    # 地区列表
    regions = [
        '北京市', '上海市', '广州市', '深圳市', '杭州市',
        '南京市', '武汉市', '成都市', '重庆市', '西安市',
        '天津市', '苏州市', '郑州市', '长沙市', '东莞市',
        '青岛市', '沈阳市', '宁波市', '昆明市', '大连市'
    ]
    
    # 科室列表
    departments = [
        '内科', '外科', '儿科', '妇产科', '骨科', '心内科',
        '神经内科', '呼吸内科', '消化内科', '肾内科', '内分泌科',
        '肿瘤科', '眼科', '耳鼻喉科', '皮肤科', '急诊科'
    ]
    
    # 1. 患者表
    patients = []
    for i in range(num_patients):
        gender = random.choice(['男', '女'])
        age = int(np.random.normal(50, 18))
        age = max(18, min(90, age))
        
        # 年龄因素对Charlson评分的影响
        charlson_age_factor = 0
        if age >= 50:
            charlson_age_factor = 1
        if age >= 60:
            charlson_age_factor = 2
        if age >= 70:
            charlson_age_factor = 3
        if age >= 80:
            charlson_age_factor = 4
        
        patient = {
            'patient_id': f'P{i+1:06d}',
            'name': f'患者{i+1}',
            'gender': gender,
            'birth_date': (datetime.now() - timedelta(days=age*365)).strftime('%Y-%m-%d'),
            'age': age,
            'region': random.choice(regions),
            'address': f'{random.choice(regions)}某某区某某路{random.randint(1, 999)}号',
            'phone': f'1{random.randint(3, 9)}{random.randint(100000000, 999999999)}',
            'marital_status': random.choice(['未婚', '已婚', '离异', '丧偶']),
            'education': random.choice(['小学', '初中', '高中', '大专', '本科', '硕士及以上']),
            'occupation': random.choice(['企业职工', '事业单位', '自由职业', '农民', '学生', '退休', '其他']),
            'smoking_status': random.choice(['从不吸烟', '曾经吸烟', '现在吸烟']),
            'alcohol_status': random.choice(['不饮酒', '偶尔饮酒', '经常饮酒']),
            'family_history': random.choice(['无', '高血压', '糖尿病', '冠心病', '脑卒中', '肿瘤']),
            'charlson_age_factor': charlson_age_factor
        }
        patients.append(patient)
    
    patients_df = pd.DataFrame(patients)
    
    # 2. 诊断表
    diagnoses = []
    diagnosis_id = 1
    
    for _, patient in patients_df.iterrows():
        # 每个患者平均1-4种疾病
        num_diseases = np.random.poisson(2)
        num_diseases = max(1, min(6, num_diseases))
        
        # 根据年龄调整疾病概率
        age = patient['age']
        disease_weights = []
        
        for disease in diseases:
            weight = 1.0
            # 年龄调整
            if disease in ['高血压', '糖尿病', '冠心病', '脑卒中', '慢性肾病', '骨质疏松症']:
                if age > 50:
                    weight *= 2.0
                if age > 65:
                    weight *= 1.5
            if disease in ['骨质疏松症'] and patient['gender'] == '女':
                weight *= 2.0
            
            disease_weights.append(weight)
        
        # 归一化
        total_weight = sum(disease_weights)
        probabilities = [w / total_weight for w in disease_weights]
        
        selected_diseases = np.random.choice(
            diseases, 
            size=num_diseases, 
            replace=False,
            p=probabilities
        )
        
        for disease in selected_diseases:
            # 诊断日期在5年内
            days_ago = int(np.random.uniform(0, 365*5))
            diagnosis_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            
            severity = random.choice(['轻度', '中度', '重度'])
            
            # Charlson权重
            charlson_weight = 1
            if severity == '重度':
                charlson_weight = 2
            if disease in ['冠心病', '脑卒中']:
                charlson_weight = 1
            if disease in ['慢性肾病']:
                charlson_weight = 2
            
            diagnosis = {
                'diagnosis_id': f'D{diagnosis_id:07d}',
                'patient_id': patient['patient_id'],
                'disease_name': disease,
                'icd10_code': f'I{random.randint(10, 99)}',
                'diagnosis_date': diagnosis_date,
                'diagnosis_type': random.choice(['门诊诊断', '住院诊断', '急诊诊断', '体检发现']),
                'severity': severity,
                'disease_status': random.choice(['活动期', '稳定期', '缓解期']),
                'department': random.choice(departments),
                'doctor_name': f'医生{random.randint(1, 100)}',
                'charlson_weight': charlson_weight,
                'has_complications': random.random() < 0.3,
                'risk_factors': ','.join(random.sample(['高龄', '肥胖', '吸烟', '家族史'], min(2, 4)))
            }
            diagnoses.append(diagnosis)
            diagnosis_id += 1
    
    diagnoses_df = pd.DataFrame(diagnoses)
    
    # 3. 住院表
    hospitalizations = []
    hospitalization_id = 1
    
    for _, patient in patients_df.iterrows():
        # 住院概率 - 有严重疾病的患者更可能住院
        patient_diagnoses = diagnoses_df[diagnoses_df['patient_id'] == patient['patient_id']]
        has_severe = any(patient_diagnoses['severity'] == '重度')
        
        if has_severe:
            num_hosp = int(np.random.poisson(1.5))
        else:
            num_hosp = int(np.random.poisson(0.3))
        
        num_hosp = max(0, min(4, num_hosp))
        
        for _ in range(num_hosp):
            # 选择主要诊断
            if len(patient_diagnoses) > 0:
                main_diag = patient_diagnoses.sample(n=1).iloc[0]
                
                # 住院日期
                days_ago = int(np.random.uniform(30, 365*5))
                admission_date = datetime.now() - timedelta(days=days_ago)
                
                # 住院时长
                if main_diag['severity'] == '重度':
                    los = int(np.random.normal(14, 7))
                else:
                    los = int(np.random.normal(5, 3))
                los = max(1, min(60, los))
                
                discharge_date = admission_date + timedelta(days=los)
                
                # 30天再入院
                readmission = random.random() < 0.15
                
                # 费用
                base_cost = 5000 if main_diag['severity'] == '轻度' else 10000 if main_diag['severity'] == '中度' else 20000
                total_cost = base_cost * los * (0.8 + np.random.uniform(0, 0.4))
                
                hospitalization = {
                    'hospitalization_id': f'H{hospitalization_id:07d}',
                    'patient_id': patient['patient_id'],
                    'main_diagnosis_id': main_diag['diagnosis_id'],
                    'main_diagnosis': main_diag['disease_name'],
                    'admission_date': admission_date.strftime('%Y-%m-%d'),
                    'discharge_date': discharge_date.strftime('%Y-%m-%d'),
                    'length_of_stay': los,
                    'admission_department': random.choice(departments),
                    'discharge_department': random.choice(departments),
                    'admission_type': random.choice(['急诊入院', '门诊入院', '转科入院']),
                    'discharge_type': random.choices(
                        ['治愈出院', '好转出院', '未愈出院', '转院', '死亡'],
                        weights=[0.4, 0.4, 0.12, 0.06, 0.02]
                    )[0],
                    'bed_type': random.choice(['普通病房', 'ICU', 'CCU', '特需病房']),
                    'treatment_path': '入院评估→检查→治疗→出院随访',
                    'total_cost': round(total_cost, 2),
                    'attending_doctor': f'医生{random.randint(1, 100)}',
                    'chief_doctor': f'主任{random.randint(1, 20)}',
                    'readmission_within_30': readmission,
                    'readmission_days': int(np.random.uniform(1, 30)) if readmission else None,
                    'has_complications_during_stay': random.random() < 0.2,
                    'complications': random.choice(['感染', '出血', '其他']) if random.random() < 0.2 else None,
                    'icu_stay_days': int(np.random.uniform(1, 7)) if random.random() < 0.2 else 0,
                    'surgery_performed': random.random() < 0.3,
                    'surgery_type': random.choice(['微创手术', '开放手术', '介入手术']) if random.random() < 0.3 else None
                }
                hospitalizations.append(hospitalization)
                hospitalization_id += 1
    
    hospitalizations_df = pd.DataFrame(hospitalizations)
    
    print(f"数据生成完成:")
    print(f"  - 患者: {len(patients_df)} 条")
    print(f"  - 诊断: {len(diagnoses_df)} 条")
    print(f"  - 住院: {len(hospitalizations_df)} 条")
    
    return {
        'patients': patients_df,
        'diagnoses': diagnoses_df,
        'hospitalizations': hospitalizations_df
    }


# =============================================================================
# 加载或生成数据
# =============================================================================

print("\n加载数据...")
data_dir = os.path.join(os.path.dirname(__file__), 'data')

if os.path.exists(data_dir) and len([f for f in os.listdir(data_dir) if f.endswith('.csv')]) >= 3:
    print("从现有文件加载数据...")
    try:
        data = {
            'patients': pd.read_csv(os.path.join(data_dir, 'patients.csv')),
            'diagnoses': pd.read_csv(os.path.join(data_dir, 'diagnoses.csv')),
            'hospitalizations': pd.read_csv(os.path.join(data_dir, 'hospitalizations.csv'))
        }
        print("数据加载成功!")
    except Exception as e:
        print(f"加载失败，重新生成数据: {e}")
        data = generate_synthetic_data(10000)
        # 保存数据
        os.makedirs(data_dir, exist_ok=True)
        for name, df in data.items():
            df.to_csv(os.path.join(data_dir, f'{name}.csv'), index=False, encoding='utf-8-sig')
else:
    print("生成新数据...")
    data = generate_synthetic_data(10000)
    # 保存数据
    os.makedirs(data_dir, exist_ok=True)
    for name, df in data.items():
        df.to_csv(os.path.join(data_dir, f'{name}.csv'), index=False, encoding='utf-8-sig')


# =============================================================================
# 预处理
# =============================================================================

# 转换日期格式
if 'admission_date' in data['hospitalizations'].columns:
    data['hospitalizations']['admission_date'] = pd.to_datetime(data['hospitalizations']['admission_date'])
    data['hospitalizations']['discharge_date'] = pd.to_datetime(data['hospitalizations']['discharge_date'])
    
    # 创建时间特征
    data['hospitalizations']['admission_year'] = data['hospitalizations']['admission_date'].dt.year
    data['hospitalizations']['admission_month'] = data['hospitalizations']['admission_date'].dt.month
    data['hospitalizations']['admission_year_month'] = data['hospitalizations']['admission_date'].dt.to_period('M')

# 合并患者和住院数据
merged_hosp = pd.merge(
    data['hospitalizations'],
    data['patients'][['patient_id', 'age', 'gender', 'region']],
    on='patient_id',
    how='left'
)


# =============================================================================
# 创建Dash应用
# =============================================================================

print("\n初始化Dash应用...")

app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    title='医疗健康数据分析平台'
)

server = app.server


# =============================================================================
# 辅助函数
# =============================================================================

def create_empty_figure(message="请选择参数后查看图表"):
    fig = go.Figure()
    fig.add_annotation(
        text=message,
        xref="paper", yref="paper",
        x=0.5, y=0.5,
        showarrow=False,
        font=dict(size=20, color="gray")
    )
    fig.update_layout(
        xaxis=dict(showgrid=False, showticklabels=False, zeroline=False),
        yaxis=dict(showgrid=False, showticklabels=False, zeroline=False)
    )
    return fig


def get_summary_stats():
    return {
        'total_patients': len(data['patients']),
        'total_diagnoses': len(data['diagnoses']),
        'total_hospitalizations': len(data['hospitalizations']),
        'unique_diseases': data['diagnoses']['disease_name'].nunique(),
        'average_age': round(data['patients']['age'].mean(), 1),
        'readmission_rate': round(data['hospitalizations']['readmission_within_30'].mean() * 100, 2) if 'readmission_within_30' in data['hospitalizations'].columns else 0,
        'average_length_of_stay': round(data['hospitalizations']['length_of_stay'].mean(), 1) if 'length_of_stay' in data['hospitalizations'].columns else 0
    }


# =============================================================================
# 导航栏
# =============================================================================

navbar = dbc.NavbarSimple(
    children=[
        dbc.NavItem(dbc.NavLink("概览", href="/overview", id="nav-overview")),
        dbc.NavItem(dbc.NavLink("疾病分析", href="/disease", id="nav-disease")),
        dbc.NavItem(dbc.NavLink("资源分析", href="/resource", id="nav-resource")),
        dbc.NavItem(dbc.NavLink("可视化", href="/visualization", id="nav-visualization")),
        dbc.NavItem(dbc.NavLink("数据字典", href="/dictionary", id="nav-dictionary")),
    ],
    brand="🏥 医疗健康数据分析平台",
    brand_href="/",
    color="primary",
    dark=True,
    sticky="top",
    className="mb-4"
)


# =============================================================================
# 页面布局
# =============================================================================

# 概览页面
overview_layout = dbc.Container([
    html.H2("📊 数据概览", className="mb-4"),
    
    # 汇总卡片
    dbc.Row([
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("总患者数", className="card-title"),
                    html.H3(id="stat-patients", className="text-primary"),
                    html.P("名虚拟患者", className="text-muted")
                ])
            ], color="primary", outline=True),
            width=3
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("诊断记录", className="card-title"),
                    html.H3(id="stat-diagnoses", className="text-success"),
                    html.P("条诊断记录", className="text-muted")
                ])
            ], color="success", outline=True),
            width=3
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("住院记录", className="card-title"),
                    html.H3(id="stat-hospitalizations", className="text-warning"),
                    html.P("条住院记录", className="text-muted")
                ])
            ], color="warning", outline=True),
            width=3
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("再入院率", className="card-title"),
                    html.H3(id="stat-readmission", className="text-danger"),
                    html.P("% 30天内再入院", className="text-muted")
                ])
            ], color="danger", outline=True),
            width=3
        ),
    ], className="mb-4"),
    
    # 图表区域
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("疾病分布（Top 10）"),
                dbc.CardBody([
                    dcc.Graph(id="overview-disease-dist")
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("年龄性别分布"),
                dbc.CardBody([
                    dcc.Graph(id="overview-age-gender")
                ])
            ])
        ], width=6)
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("地区分布"),
                dbc.CardBody([
                    dcc.Graph(id="overview-region-dist")
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("月度入院趋势"),
                dbc.CardBody([
                    dcc.Graph(id="overview-monthly-trend")
                ])
            ])
        ], width=6)
    ])
])


# 数据字典页面
dictionary_layout = dbc.Container([
    html.H2("📋 数据字典", className="mb-4"),
    
    dbc.Card([
        dbc.CardHeader("👤 患者表 (patients.csv)"),
        dbc.CardBody([
            html.P("包含10000名虚拟患者的基本人口统计信息。"),
            html.H5("字段说明："),
            html.Ul([
                html.Li("patient_id: 患者唯一标识符（如P000001）"),
                html.Li("name: 患者姓名"),
                html.Li("gender: 性别（男/女）"),
                html.Li("age: 年龄"),
                html.Li("region: 所在地区"),
                html.Li("smoking_status: 吸烟状态"),
                html.Li("alcohol_status: 饮酒状态"),
                html.Li("charlson_age_factor: Charlson评分年龄因素"),
            ])
        ])
    ], className="mb-3"),
    
    dbc.Card([
        dbc.CardHeader("🏥 诊断表 (diagnoses.csv)"),
        dbc.CardBody([
            html.P("包含患者的诊断记录。"),
            html.H5("字段说明："),
            html.Ul([
                html.Li("diagnosis_id: 诊断唯一标识符"),
                html.Li("patient_id: 关联的患者ID"),
                html.Li("disease_name: 疾病名称"),
                html.Li("diagnosis_date: 诊断日期"),
                html.Li("severity: 严重程度（轻度/中度/重度）"),
                html.Li("charlson_weight: Charlson评分权重"),
            ])
        ])
    ], className="mb-3"),
    
    dbc.Card([
        dbc.CardHeader("� 住院表 (hospitalizations.csv)"),
        dbc.CardBody([
            html.P("包含患者的住院记录。"),
            html.H5("字段说明："),
            html.Ul([
                html.Li("hospitalization_id: 住院记录唯一标识符"),
                html.Li("patient_id: 关联的患者ID"),
                html.Li("main_diagnosis: 主要诊断名称"),
                html.Li("admission_date: 入院日期"),
                html.Li("discharge_date: 出院日期"),
                html.Li("length_of_stay: 住院天数"),
                html.Li("readmission_within_30: 30天内再入院"),
                html.Li("total_cost: 总费用"),
            ])
        ])
    ], className="mb-3"),
    
    dbc.Card([
        dbc.CardHeader("🔬 功能说明"),
        dbc.CardBody([
            html.H5("平台功能模块："),
            html.Ul([
                html.Li("数据概览 - 查看总体数据统计和分布"),
                html.Li("疾病分析 - 疾病发病率时序趋势分析"),
                html.Li("资源分析 - 医疗资源利用分析"),
                html.Li("可视化 - 多种交互式图表"),
            ])
        ])
    ])
])


# 主布局
app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    navbar,
    html.Div(id='page-content')
])


# =============================================================================
# 回调函数
# =============================================================================

# 页面路由
@app.callback(Output('page-content', 'children'),
              Input('url', 'pathname'))
def display_page(pathname):
    if pathname == '/overview' or pathname == '/':
        return overview_layout
    elif pathname == '/disease':
        return html.Div("疾病分析页面 - 选择左侧菜单查看其他页面")
    elif pathname == '/resource':
        return html.Div("资源分析页面 - 选择左侧菜单查看其他页面")
    elif pathname == '/visualization':
        return html.Div("可视化页面 - 选择左侧菜单查看其他页面")
    elif pathname == '/dictionary':
        return dictionary_layout
    else:
        return overview_layout


# 概览页面回调
@app.callback(
    [Output('stat-patients', 'children'),
     Output('stat-diagnoses', 'children'),
     Output('stat-hospitalizations', 'children'),
     Output('stat-readmission', 'children')],
    [Input('url', 'pathname')]
)
def update_overview_stats(pathname):
    stats = get_summary_stats()
    return (
        f"{stats['total_patients']:,}",
        f"{stats['total_diagnoses']:,}",
        f"{stats['total_hospitalizations']:,}",
        f"{stats['readmission_rate']}"
    )


@app.callback(
    [Output('overview-disease-dist', 'figure'),
     Output('overview-age-gender', 'figure'),
     Output('overview-region-dist', 'figure'),
     Output('overview-monthly-trend', 'figure')],
    [Input('url', 'pathname')]
)
def update_overview_charts(pathname):
    # 疾病分布
    disease_counts = data['diagnoses']['disease_name'].value_counts().head(10)
    fig1 = px.bar(
        x=disease_counts.values,
        y=disease_counts.index,
        orientation='h',
        title='',
        labels={'x': '病例数', 'y': '疾病'},
        color=disease_counts.values,
        color_continuous_scale='Blues'
    )
    fig1.update_layout(yaxis={'categoryorder': 'total ascending'})
    
    # 年龄性别分布
    # 创建年龄分组
    df = data['patients'].copy()
    df['age_group'] = pd.cut(
        df['age'],
        bins=[18, 30, 40, 50, 60, 70, 80, 90, 100],
        labels=['18-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '90+']
    )
    
    # 计算分布
    age_gender_dist = df.groupby(['age_group', 'gender']).size().reset_index(name='count')
    
    # 创建金字塔图
    male_data = age_gender_dist[age_gender_dist['gender'] == '男'].copy()
    female_data = age_gender_dist[age_gender_dist['gender'] == '女'].copy()
    
    male_data['count'] = -male_data['count']
    
    fig2 = go.Figure()
    
    fig2.add_trace(go.Bar(
        y=male_data['age_group'],
        x=male_data['count'],
        name='男性',
        orientation='h',
        marker=dict(color='#1f77b4'),
        customdata=[abs(x) for x in male_data['count']],
        hovertemplate='年龄组: %{y}<br>男性人数: %{customdata}<extra></extra>'
    ))
    
    fig2.add_trace(go.Bar(
        y=female_data['age_group'],
        x=female_data['count'],
        name='女性',
        orientation='h',
        marker=dict(color='#ff7f0e'),
        hovertemplate='年龄组: %{y}<br>女性人数: %{x}<extra></extra>'
    ))
    
    fig2.update_layout(
        title='年龄性别分布',
        xaxis=dict(
            title='患者人数',
            tickvals=[-200, -150, -100, -50, 0, 50, 100, 150, 200],
            ticktext=['200', '150', '100', '50', '0', '50', '100', '150', '200']
        ),
        yaxis=dict(title='年龄组'),
        barmode='relative',
        bargap=0.1
    )
    
    # 地区分布
    region_counts = data['patients']['region'].value_counts().head(10)
    fig3 = px.pie(
        values=region_counts.values,
        names=region_counts.index,
        title='地区分布',
        hole=0.4
    )
    
    # 月度入院趋势
    if 'admission_year_month' in data['hospitalizations'].columns:
        monthly_counts = data['hospitalizations'].groupby('admission_year_month').size().reset_index(name='count')
        monthly_counts['admission_year_month'] = monthly_counts['admission_year_month'].astype(str)
        
        fig4 = px.line(
            monthly_counts,
            x='admission_year_month',
            y='count',
            markers=True,
            title='月度入院趋势'
        )
        fig4.update_layout(xaxis_title='月份', yaxis_title='入院人数')
    else:
        fig4 = create_empty_figure("无时间序列数据")
    
    return fig1, fig2, fig3, fig4


# =============================================================================
# 启动应用
# =============================================================================

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("医疗健康数据分析平台 - 简化版")
    print("=" * 60)
    print(f"\n数据统计:")
    stats = get_summary_stats()
    print(f"  - 总患者数: {stats['total_patients']:,}")
    print(f"  - 诊断记录: {stats['total_diagnoses']:,}")
    print(f"  - 住院记录: {stats['total_hospitalizations']:,}")
    print(f"  - 平均年龄: {stats['average_age']} 岁")
    print(f"  - 再入院率: {stats['readmission_rate']}%")
    print(f"\n启动服务器...")
    print("请在浏览器中访问: http://127.0.0.1:8050/")
    print("=" * 60)
    
    app.run_server(debug=True, port=8050, host='0.0.0.0')
