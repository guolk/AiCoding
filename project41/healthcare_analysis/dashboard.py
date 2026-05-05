import pandas as pd
import numpy as np
import os
import sys

# 添加当前目录到路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import dash
from dash import dcc, html, dash_table, callback, Input, Output, State
import dash_bootstrap_components as dbc
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime

# 导入自定义模块
from data_generator import HealthcareDataGenerator
from disease_analysis import DiseaseTrendAnalyzer
from medication_safety import MedicationSafetyAnalyzer
from readmission_prediction import ReadmissionPredictor
from resource_analysis import ResourceUtilizationAnalyzer
from visualization import HealthcareVisualizer
from differential_privacy import PrivacyPreservingAnalyzer, DifferentialPrivacyProtector


# =============================================================================
# 全局配置和数据加载
# =============================================================================

# 初始化Dash应用
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    title='医疗健康数据分析平台'
)

server = app.server

# 全局变量存储数据和分析器
data = {}
analyzers = {}


def load_or_generate_data():
    """加载或生成数据"""
    global data, analyzers
    
    data_dir = os.path.join(current_dir, 'data')
    
    # 检查数据是否已存在
    if os.path.exists(data_dir) and len(os.listdir(data_dir)) >= 5:
        print("加载现有数据...")
        data = {
            'patients': pd.read_csv(os.path.join(data_dir, 'patients.csv')),
            'diagnoses': pd.read_csv(os.path.join(data_dir, 'diagnoses.csv')),
            'medications': pd.read_csv(os.path.join(data_dir, 'medications.csv')),
            'lab_results': pd.read_csv(os.path.join(data_dir, 'lab_results.csv')),
            'hospitalizations': pd.read_csv(os.path.join(data_dir, 'hospitalizations.csv'))
        }
    else:
        print("生成新数据...")
        generator = HealthcareDataGenerator(num_patients=10000, seed=42)
        data = generator.generate_all_data()
        generator.save_data(data, output_dir=data_dir)
    
    # 初始化分析器
    print("初始化分析器...")
    
    analyzers['disease'] = DiseaseTrendAnalyzer(
        data['patients'], data['diagnoses']
    )
    
    analyzers['medication'] = MedicationSafetyAnalyzer(
        data['medications'], data['patients'], data['diagnoses']
    )
    
    analyzers['readmission'] = ReadmissionPredictor(
        data['patients'], data['diagnoses'], data['hospitalizations'],
        data['medications'], data['lab_results']
    )
    
    analyzers['resource'] = ResourceUtilizationAnalyzer(
        data['hospitalizations'], data['patients'], data['diagnoses']
    )
    
    analyzers['visualization'] = HealthcareVisualizer(
        data['patients'], data['diagnoses'], data['hospitalizations'],
        data['medications'], data['lab_results']
    )
    
    analyzers['privacy'] = PrivacyPreservingAnalyzer(
        data['patients'], data['diagnoses'], data['hospitalizations']
    )
    
    print("数据和分析器初始化完成！")


# 加载数据
load_or_generate_data()


# =============================================================================
# 辅助函数
# =============================================================================

def create_empty_figure(message="请选择参数后查看图表"):
    """创建空图表"""
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
    """获取汇总统计"""
    return {
        'total_patients': len(data['patients']),
        'total_diagnoses': len(data['diagnoses']),
        'total_medications': len(data['medications']),
        'total_hospitalizations': len(data['hospitalizations']),
        'total_lab_tests': len(data['lab_results']),
        'unique_diseases': data['diagnoses']['disease_name'].nunique(),
        'average_age': round(data['patients']['age'].mean(), 1),
        'readmission_rate': round(data['hospitalizations']['readmission_within_30'].mean() * 100, 2),
        'average_length_of_stay': round(data['hospitalizations']['length_of_stay'].mean(), 1)
    }


# =============================================================================
# 布局组件
# =============================================================================

# 导航栏
navbar = dbc.NavbarSimple(
    children=[
        dbc.NavItem(dbc.NavLink("概览", href="/overview", id="nav-overview")),
        dbc.NavItem(dbc.NavLink("疾病分析", href="/disease", id="nav-disease")),
        dbc.NavItem(dbc.NavLink("用药安全", href="/medication", id="nav-medication")),
        dbc.NavItem(dbc.NavLink("再入院预测", href="/readmission", id="nav-readmission")),
        dbc.NavItem(dbc.NavLink("资源分析", href="/resource", id="nav-resource")),
        dbc.NavItem(dbc.NavLink("可视化", href="/visualization", id="nav-visualization")),
        dbc.NavItem(dbc.NavLink("隐私保护", href="/privacy", id="nav-privacy")),
        dbc.NavItem(dbc.NavLink("数据字典", href="/dictionary", id="nav-dictionary")),
    ],
    brand="🏥 医疗健康数据分析平台",
    brand_href="/",
    color="primary",
    dark=True,
    sticky="top",
    className="mb-4"
)


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
            width=2
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("诊断记录", className="card-title"),
                    html.H3(id="stat-diagnoses", className="text-success"),
                    html.P("条诊断记录", className="text-muted")
                ])
            ], color="success", outline=True),
            width=2
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("用药记录", className="card-title"),
                    html.H3(id="stat-medications", className="text-info"),
                    html.P("条用药记录", className="text-muted")
                ])
            ], color="info", outline=True),
            width=2
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("住院记录", className="card-title"),
                    html.H3(id="stat-hospitalizations", className="text-warning"),
                    html.P("条住院记录", className="text-muted")
                ])
            ], color="warning", outline=True),
            width=2
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("再入院率", className="card-title"),
                    html.H3(id="stat-readmission", className="text-danger"),
                    html.P("% 30天内再入院", className="text-muted")
                ])
            ], color="danger", outline=True),
            width=2
        ),
        dbc.Col(
            dbc.Card([
                dbc.CardBody([
                    html.H5("平均住院日", className="card-title"),
                    html.H3(id="stat-los", className="text-secondary"),
                    html.P("天", className="text-muted")
                ])
            ], color="secondary", outline=True),
            width=2
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


# 疾病分析页面
disease_layout = dbc.Container([
    html.H2("🏥 疾病发病率分析", className="mb-4"),
    
    # 控制区域
    dbc.Card([
        dbc.CardHeader("分析参数"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.Label("选择疾病："),
                    dcc.Dropdown(
                        id='disease-selector',
                        options=[{'label': d, 'value': d} for d in 
                                sorted(data['hospitalizations']['main_diagnosis'].unique())],
                        value=data['hospitalizations']['main_diagnosis'].value_counts().index[0],
                        clearable=False
                    )
                ], width=4),
                dbc.Col([
                    html.Label("时间粒度："),
                    dcc.Dropdown(
                        id='time-granularity',
                        options=[
                            {'label': '月度', 'value': 'monthly'},
                            {'label': '季度', 'value': 'quarterly'},
                            {'label': '年度', 'value': 'yearly'}
                        ],
                        value='monthly',
                        clearable=False
                    )
                ], width=4),
                dbc.Col([
                    html.Label("分层分析："),
                    dcc.Dropdown(
                        id='stratify-by',
                        options=[
                            {'label': '不分层', 'value': 'none'},
                            {'label': '按性别', 'value': 'gender'},
                            {'label': '按年龄组', 'value': 'age_group'},
                            {'label': '按地区', 'value': 'region'}
                        ],
                        value='none',
                        clearable=False
                    )
                ], width=4)
            ])
        ])
    ], className="mb-4"),
    
    # 疾病汇总信息
    dbc.Card([
        dbc.CardHeader("疾病汇总信息"),
        dbc.CardBody([
            html.Div(id="disease-summary")
        ])
    ], className="mb-4"),
    
    # 图表区域
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("发病率时序趋势"),
                dbc.CardBody([
                    dcc.Graph(id="disease-trend-chart")
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("年龄性别分布"),
                dbc.CardBody([
                    dcc.Graph(id="disease-age-gender-chart")
                ])
            ])
        ], width=6)
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("地区分布热力图"),
                dbc.CardBody([
                    dcc.Graph(id="disease-geographic-chart")
                ])
            ])
        ], width=12)
    ])
])


# 用药安全页面
medication_layout = dbc.Container([
    html.H2("💊 用药安全分析", className="mb-4"),
    
    # 患者查询
    dbc.Card([
        dbc.CardHeader("患者用药查询"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.Label("输入患者ID："),
                    dcc.Input(
                        id='patient-id-input',
                        type='text',
                        placeholder='例如：P000001',
                        value='P000001',
                        className='form-control'
                    )
                ], width=4),
                dbc.Col([
                    html.Label(" "),
                    dbc.Button(
                        "分析患者用药",
                        id='analyze-patient-btn',
                        color='primary',
                        className='w-100 mt-2'
                    )
                ], width=2)
            ])
        ])
    ], className="mb-4"),
    
    # 患者分析结果
    dbc.Card([
        dbc.CardHeader("患者用药分析结果"),
        dbc.CardBody([
            html.Div(id="patient-medication-result")
        ])
    ], className="mb-4"),
    
    # 用药统计
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("常用药物分布（Top 10）"),
                dbc.CardBody([
                    dcc.Graph(id="medication-distribution")
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("用药依从性分布"),
                dbc.CardBody([
                    dcc.Graph(id="adherence-distribution")
                ])
            ])
        ], width=6)
    ], className="mb-4"),
    
    # 多重用药分析
    dbc.Card([
        dbc.CardHeader("多重用药分析"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.Div(id="polypharmacy-summary")
                ], width=12)
            ]),
            dbc.Row([
                dbc.Col([
                    dcc.Graph(id="polypharmacy-chart")
                ], width=12)
            ])
        ])
    ])
])


# 再入院预测页面
readmission_layout = dbc.Container([
    html.H2("📈 再入院率预测", className="mb-4"),
    
    # 模型训练和评估
    dbc.Card([
        dbc.CardHeader("模型训练与评估"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    dbc.Button(
                        "训练预测模型",
                        id='train-model-btn',
                        color='success',
                        className='w-100'
                    )
                ], width=3),
                dbc.Col([
                    html.Div(id="model-training-status")
                ], width=9)
            ])
        ])
    ], className="mb-4"),
    
    # 模型性能对比
    dbc.Card([
        dbc.CardHeader("模型性能对比"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    dcc.Graph(id="model-comparison-chart")
                ], width=6),
                dbc.Col([
                    dcc.Graph(id="model-roc-curve")
                ], width=6)
            ])
        ])
    ], className="mb-4"),
    
    # 特征重要性
    dbc.Card([
        dbc.CardHeader("特征重要性分析（Charlson评分影响）"),
        dbc.CardBody([
            dcc.Graph(id="feature-importance-chart")
        ])
    ], className="mb-4"),
    
    # 患者风险预测
    dbc.Card([
        dbc.CardHeader("患者再入院风险预测"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.Label("输入患者ID："),
                    dcc.Input(
                        id='readmission-patient-input',
                        type='text',
                        placeholder='例如：P000001',
                        value='P000001',
                        className='form-control'
                    )
                ], width=4),
                dbc.Col([
                    html.Label(" "),
                    dbc.Button(
                        "预测风险",
                        id='predict-readmission-btn',
                        color='primary',
                        className='w-100 mt-2'
                    )
                ], width=2)
            ]),
            html.Hr(),
            html.Div(id="readmission-prediction-result")
        ])
    ])
])


# 资源分析页面
resource_layout = dbc.Container([
    html.H2("🏥 医疗资源利用分析", className="mb-4"),
    
    # 资源预警
    dbc.Card([
        dbc.CardHeader("⚠️ 资源预警"),
        dbc.CardBody([
            html.Div(id="resource-warnings")
        ])
    ], className="mb-4"),
    
    # 住院日分析
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("住院日分布"),
                dbc.CardBody([
                    dcc.Graph(id="los-distribution-chart")
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("各科室平均住院日"),
                dbc.CardBody([
                    dcc.Graph(id="dept-los-chart")
                ])
            ])
        ], width=6)
    ], className="mb-4"),
    
    # 科室负荷
    dbc.Card([
        dbc.CardHeader("科室负荷分析"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    dcc.Graph(id="dept-workload-chart")
                ], width=8),
                dbc.Col([
                    html.H5("科室负荷排名"),
                    html.Div(id="dept-workload-table")
                ], width=4)
            ])
        ])
    ], className="mb-4"),
    
    # 床位利用率
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("床位利用率"),
                dbc.CardBody([
                    dcc.Graph(id="bed-utilization-chart")
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("月度床位需求预测"),
                dbc.CardBody([
                    dcc.Graph(id="bed-forecast-chart")
                ])
            ])
        ], width=6)
    ])
])


# 可视化页面
visualization_layout = dbc.Container([
    html.H2("📊 高级可视化", className="mb-4"),
    
    # 标签页
    dbc.Tabs([
        dbc.Tab(label="诊疗路径Sankey图", tab_id="tab-sankey"),
        dbc.Tab(label="生存分析Kaplan-Meier", tab_id="tab-kaplan"),
        dbc.Tab(label="地理分布热力图", tab_id="tab-geo"),
    ], id="visualization-tabs", active_tab="tab-sankey"),
    
    html.Hr(),
    
    # Sankey图控制
    html.Div(id="sankey-controls", children=[
        dbc.Card([
            dbc.CardHeader("参数设置"),
            dbc.CardBody([
                dbc.Row([
                    dbc.Col([
                        html.Label("显示疾病数量："),
                        dcc.Slider(
                            id='sankey-disease-count',
                            min=3,
                            max=10,
                            value=5,
                            marks={i: str(i) for i in range(3, 11)},
                            step=1
                        )
                    ], width=6)
                ])
            ])
        ], className="mb-4"),
        
        dbc.Card([
            dbc.CardHeader("患者诊疗路径流程图"),
            dbc.CardBody([
                dcc.Graph(id="sankey-chart", style={'height': '600px'})
            ])
        ])
    ]),
    
    # Kaplan-Meier控制
    html.Div(id="kaplan-controls", style={'display': 'none'}, children=[
        dbc.Card([
            dbc.CardHeader("参数设置"),
            dbc.CardBody([
                dbc.Row([
                    dbc.Col([
                        html.Label("分组变量："),
                        dcc.Dropdown(
                            id='kaplan-groupby',
                            options=[
                                {'label': '性别', 'value': 'gender'},
                                {'label': '年龄组', 'value': 'age_group'}
                            ],
                            value='gender',
                            clearable=False
                        )
                    ], width=4),
                    dbc.Col([
                        html.Label("筛选疾病（可选）："),
                        dcc.Dropdown(
                            id='kaplan-disease',
                            options=[{'label': '全部疾病', 'value': 'all'}] +
                                   [{'label': d, 'value': d} for d in 
                                    sorted(data['hospitalizations']['main_diagnosis'].unique())],
                            value='all',
                            clearable=False
                        )
                    ], width=4)
                ])
            ])
        ], className="mb-4"),
        
        dbc.Card([
            dbc.CardHeader("Kaplan-Meier生存曲线（无再入院生存率）"),
            dbc.CardBody([
                dcc.Graph(id="kaplan-chart")
            ])
        ])
    ]),
    
    # 地理热力图控制
    html.Div(id="geo-controls", style={'display': 'none'}, children=[
        dbc.Card([
            dbc.CardHeader("参数设置"),
            dbc.CardBody([
                dbc.Row([
                    dbc.Col([
                        html.Label("选择疾病："),
                        dcc.Dropdown(
                            id='geo-disease',
                            options=[{'label': '全部疾病', 'value': 'all'}] +
                                   [{'label': d, 'value': d} for d in 
                                    sorted(data['hospitalizations']['main_diagnosis'].unique())],
                            value='all',
                            clearable=False
                        )
                    ], width=6)
                ])
            ])
        ], className="mb-4"),
        
        dbc.Card([
            dbc.CardHeader("地区疾病发病率热力图"),
            dbc.CardBody([
                dcc.Graph(id="geo-chart", style={'height': '600px'})
            ])
        ])
    ])
])


# 隐私保护页面
privacy_layout = dbc.Container([
    html.H2("🔒 差分隐私保护演示", className="mb-4"),
    
    # 说明
    dbc.Card([
        dbc.CardHeader("关于差分隐私"),
        dbc.CardBody([
            html.P("""
                差分隐私是一种严格的隐私保护框架，通过在统计结果中添加可控的噪声，
                确保攻击者无法通过查询结果推断出任何单个个体的信息。
            """),
            html.Ul([
                html.Li("ε（隐私预算）：控制隐私保护的强度，ε越小保护越强，但噪声越大"),
                html.Li("噪声机制：使用拉普拉斯机制或高斯机制添加噪声"),
                html.Li("隐私-效用权衡：需要在保护隐私和保持数据实用性之间取得平衡")
            ])
        ])
    ], className="mb-4"),
    
    # ε值选择
    dbc.Card([
        dbc.CardHeader("隐私预算设置"),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.Label("选择ε值："),
                    dcc.Slider(
                        id='privacy-epsilon',
                        min=0.1,
                        max=5.0,
                        value=1.0,
                        marks={0.1: '0.1', 0.5: '0.5', 1.0: '1.0', 2.0: '2.0', 5.0: '5.0'},
                        step=0.1
                    )
                ], width=8),
                dbc.Col([
                    html.Div(id="epsilon-description"),
                    dbc.Button(
                        "应用隐私保护",
                        id='apply-privacy-btn',
                        color='primary',
                        className='w-100 mt-2'
                    )
                ], width=4)
            ])
        ])
    ], className="mb-4"),
    
    # 疾病发病率对比
    dbc.Card([
        dbc.CardHeader("疾病发病率：真实值 vs 隐私保护值"),
        dbc.CardBody([
            dcc.Graph(id="privacy-incidence-chart")
        ])
    ], className="mb-4"),
    
    # 详细对比表
    dbc.Card([
        dbc.CardHeader("详细对比（Top 10疾病）"),
        dbc.CardBody([
            html.Div(id="privacy-comparison-table")
        ])
    ], className="mb-4"),
    
    # 隐私-效用权衡
    dbc.Card([
        dbc.CardHeader("隐私-效用权衡演示（不同ε值的效果）"),
        dbc.CardBody([
            dcc.Graph(id="privacy-utility-chart")
        ])
    ])
])


# 数据字典页面
dictionary_layout = dbc.Container([
    html.H2("📋 数据字典", className="mb-4"),
    
    dbc.Accordion([
        dbc.AccordionItem([
            html.P("包含10000名虚拟患者的基本人口统计信息。"),
            dash_table.DataTable(
                columns=[
                    {'name': '字段名', 'id': 'field'},
                    {'name': '数据类型', 'id': 'type'},
                    {'name': '描述', 'id': 'description'},
                    {'name': '示例值', 'id': 'example'}
                ],
                data=[
                    {'field': 'patient_id', 'type': '字符串', 'description': '患者唯一标识符', 'example': 'P000001'},
                    {'field': 'name', 'type': '字符串', 'description': '患者姓名', 'example': '张三'},
                    {'field': 'gender', 'type': '字符串', 'description': '性别', 'example': '男/女'},
                    {'field': 'birth_date', 'type': '日期', 'description': '出生日期', 'example': '1980-05-15'},
                    {'field': 'age', 'type': '整数', 'description': '年龄', 'example': '45'},
                    {'field': 'region', 'type': '字符串', 'description': '所在地区', 'example': '北京市'},
                    {'field': 'smoking_status', 'type': '字符串', 'description': '吸烟状态', 'example': '从不吸烟/曾经吸烟/现在吸烟'},
                    {'field': 'alcohol_status', 'type': '字符串', 'description': '饮酒状态', 'example': '不饮酒/偶尔饮酒/经常饮酒'},
                    {'field': 'family_history', 'type': '字符串', 'description': '家族病史', 'example': '无/高血压/糖尿病'},
                    {'field': 'charlson_age_factor', 'type': '整数', 'description': 'Charlson评分年龄因素', 'example': '2'}
                ],
                style_table={'overflowX': 'auto'},
                style_cell={'textAlign': 'left', 'padding': '10px'},
                style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'}
            )
        ], title="👤 患者表 (patients.csv)"),
        
        dbc.AccordionItem([
            html.P("包含患者的诊断记录，每个患者可能有多个诊断。"),
            dash_table.DataTable(
                columns=[
                    {'name': '字段名', 'id': 'field'},
                    {'name': '数据类型', 'id': 'type'},
                    {'name': '描述', 'id': 'description'},
                    {'name': '示例值', 'id': 'example'}
                ],
                data=[
                    {'field': 'diagnosis_id', 'type': '字符串', 'description': '诊断唯一标识符', 'example': 'D0000001'},
                    {'field': 'patient_id', 'type': '字符串', 'description': '关联的患者ID', 'example': 'P000001'},
                    {'field': 'disease_name', 'type': '字符串', 'description': '疾病名称', 'example': '高血压'},
                    {'field': 'icd10_code', 'type': '字符串', 'description': 'ICD-10编码', 'example': 'I10'},
                    {'field': 'diagnosis_date', 'type': '日期', 'description': '诊断日期', 'example': '2023-06-15'},
                    {'field': 'diagnosis_type', 'type': '字符串', 'description': '诊断类型', 'example': '门诊诊断/住院诊断'},
                    {'field': 'severity', 'type': '字符串', 'description': '严重程度', 'example': '轻度/中度/重度'},
                    {'field': 'disease_status', 'type': '字符串', 'description': '疾病状态', 'example': '活动期/稳定期'},
                    {'field': 'charlson_weight', 'type': '整数', 'description': 'Charlson评分权重', 'example': '1'}
                ],
                style_table={'overflowX': 'auto'},
                style_cell={'textAlign': 'left', 'padding': '10px'},
                style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'}
            )
        ], title="🏥 诊断表 (diagnoses.csv)"),
        
        dbc.AccordionItem([
            html.P("包含患者的用药记录，包括药物名称、剂量、用药时间等信息。"),
            dash_table.DataTable(
                columns=[
                    {'name': '字段名', 'id': 'field'},
                    {'name': '数据类型', 'id': 'type'},
                    {'name': '描述', 'id': 'description'},
                    {'name': '示例值', 'id': 'example'}
                ],
                data=[
                    {'field': 'medication_id', 'type': '字符串', 'description': '用药记录唯一标识符', 'example': 'M0000001'},
                    {'field': 'patient_id', 'type': '字符串', 'description': '关联的患者ID', 'example': 'P000001'},
                    {'field': 'diagnosis_id', 'type': '字符串', 'description': '关联的诊断ID', 'example': 'D0000001'},
                    {'field': 'medication_name', 'type': '字符串', 'description': '药物名称', 'example': '氨氯地平'},
                    {'field': 'drug_class', 'type': '字符串', 'description': '药物分类', 'example': '钙通道阻滞剂'},
                    {'field': 'start_date', 'type': '日期', 'description': '用药开始日期', 'example': '2023-06-15'},
                    {'field': 'end_date', 'type': '日期', 'description': '用药结束日期', 'example': '2023-12-15'},
                    {'field': 'dosage', 'type': '浮点数', 'description': '剂量', 'example': '5.0'},
                    {'field': 'frequency', 'type': '字符串', 'description': '用药频率', 'example': '每日1次'},
                    {'field': 'adherence', 'type': '字符串', 'description': '依从性', 'example': '良好/一般/差'},
                    {'field': 'has_side_effects', 'type': '布尔', 'description': '是否有副作用', 'example': 'True/False'}
                ],
                style_table={'overflowX': 'auto'},
                style_cell={'textAlign': 'left', 'padding': '10px'},
                style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'}
            )
        ], title="💊 用药表 (medications.csv)"),
        
        dbc.AccordionItem([
            html.P("包含患者的检验结果，包括血常规、生化检查等多种检验项目。"),
            dash_table.DataTable(
                columns=[
                    {'name': '字段名', 'id': 'field'},
                    {'name': '数据类型', 'id': 'type'},
                    {'name': '描述', 'id': 'description'},
                    {'name': '示例值', 'id': 'example'}
                ],
                data=[
                    {'field': 'lab_id', 'type': '字符串', 'description': '检验记录唯一标识符', 'example': 'L00000001'},
                    {'field': 'patient_id', 'type': '字符串', 'description': '关联的患者ID', 'example': 'P000001'},
                    {'field': 'lab_date', 'type': '日期', 'description': '检验日期', 'example': '2023-06-15'},
                    {'field': 'lab_type', 'type': '字符串', 'description': '检验类型', 'example': '血常规/生化检查'},
                    {'field': 'test_name', 'type': '字符串', 'description': '检验项目名称', 'example': '白细胞计数'},
                    {'field': 'test_value', 'type': '浮点数', 'description': '检验结果值', 'example': '6.5'},
                    {'field': 'unit', 'type': '字符串', 'description': '单位', 'example': '×10^9/L'},
                    {'field': 'normal_range', 'type': '字符串', 'description': '参考范围', 'example': '4.0-10.0'},
                    {'field': 'is_abnormal', 'type': '布尔', 'description': '是否异常', 'example': 'True/False'},
                    {'field': 'result_flag', 'type': '字符串', 'description': '结果标识', 'example': '↑/↓/None'}
                ],
                style_table={'overflowX': 'auto'},
                style_cell={'textAlign': 'left', 'padding': '10px'},
                style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'}
            )
        ], title="🔬 检验结果表 (lab_results.csv)"),
        
        dbc.AccordionItem([
            html.P("包含患者的住院记录，包括入院、出院信息以及住院期间的诊疗信息。"),
            dash_table.DataTable(
                columns=[
                    {'name': '字段名', 'id': 'field'},
                    {'name': '数据类型', 'id': 'type'},
                    {'name': '描述', 'id': 'description'},
                    {'name': '示例值', 'id': 'example'}
                ],
                data=[
                    {'field': 'hospitalization_id', 'type': '字符串', 'description': '住院记录唯一标识符', 'example': 'H0000001'},
                    {'field': 'patient_id', 'type': '字符串', 'description': '关联的患者ID', 'example': 'P000001'},
                    {'field': 'main_diagnosis_id', 'type': '字符串', 'description': '主要诊断ID', 'example': 'D0000001'},
                    {'field': 'main_diagnosis', 'type': '字符串', 'description': '主要诊断名称', 'example': '冠心病'},
                    {'field': 'admission_date', 'type': '日期', 'description': '入院日期', 'example': '2023-06-15'},
                    {'field': 'discharge_date', 'type': '日期', 'description': '出院日期', 'example': '2023-06-22'},
                    {'field': 'length_of_stay', 'type': '整数', 'description': '住院天数', 'example': '7'},
                    {'field': 'admission_department', 'type': '字符串', 'description': '入院科室', 'example': '心内科'},
                    {'field': 'admission_type', 'type': '字符串', 'description': '入院类型', 'example': '急诊入院/门诊入院'},
                    {'field': 'discharge_type', 'type': '字符串', 'description': '出院类型', 'example': '治愈出院/好转出院'},
                    {'field': 'bed_type', 'type': '字符串', 'description': '床位类型', 'example': '普通病房/ICU'},
                    {'field': 'treatment_path', 'type': '字符串', 'description': '诊疗路径', 'example': '入院评估→药物治疗→出院随访'},
                    {'field': 'total_cost', 'type': '浮点数', 'description': '总费用', 'example': '15000.00'},
                    {'field': 'readmission_within_30', 'type': '布尔', 'description': '30天内再入院', 'example': 'True/False'},
                    {'field': 'readmission_days', 'type': '整数', 'description': '再入院天数', 'example': '15'},
                    {'field': 'has_complications_during_stay', 'type': '布尔', 'description': '住院期间是否有并发症', 'example': 'True/False'},
                    {'field': 'icu_stay_days', 'type': '整数', 'description': 'ICU住院天数', 'example': '3'},
                    {'field': 'surgery_performed', 'type': '布尔', 'description': '是否进行手术', 'example': 'True/False'}
                ],
                style_table={'overflowX': 'auto'},
                style_cell={'textAlign': 'left', 'padding': '10px'},
                style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'}
            )
        ], title="🏨 住院表 (hospitalizations.csv)"),
        
        dbc.AccordionItem([
            html.H5("Charlson合并症指数"),
            html.P("""
                Charlson合并症指数是预测患者10年死亡率的重要指标，
                包含19种合并症，每种疾病根据死亡风险分配1-6分的权重。
            """),
            html.H6("疾病权重分配："),
            dash_table.DataTable(
                columns=[
                    {'name': '权重', 'id': 'weight'},
                    {'name': '疾病', 'id': 'diseases'}
                ],
                data=[
                    {'weight': '1分', 'diseases': '心肌梗死、心力衰竭、周围血管疾病、脑血管疾病、痴呆、慢性阻塞性肺疾病、结缔组织病、消化性溃疡、糖尿病'},
                    {'weight': '2分', 'diseases': '糖尿病（并发症）、偏瘫、慢性肾病、淋巴瘤、白血病、实体肿瘤'},
                    {'weight': '3分', 'diseases': '糖尿病（严重并发症）、慢性肾病（晚期）'},
                    {'weight': '6分', 'diseases': '转移性肿瘤、艾滋病'}
                ],
                style_table={'overflowX': 'auto'},
                style_cell={'textAlign': 'left', 'padding': '10px'},
                style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'}
            ),
            html.Hr(),
            html.H6("年龄调整："),
            html.P("""
                - 50-59岁：+1分
                - 60-69岁：+2分
                - 70-79岁：+3分
                - 80岁及以上：+4分
            """)
        ], title="📊 计算方法说明"),
        
        dbc.AccordionItem([
            html.P("平台包含多种分析模型，以下是各模型的简要说明："),
            html.H5("1. 疾病发病率时序趋势分析"),
            html.P("""
                功能：分析疾病发病率随时间的变化趋势，支持按年龄、性别、地区分层。
                方法：使用线性回归检测趋势，季节性分解检测季节性模式，IQR方法检测异常值。
            """),
            html.H5("2. 用药安全分析"),
            html.P("""
                功能：检测潜在的药物相互作用，评估用药依从性和不良反应风险。
                方法：基于药物相互作用数据库，检测同时使用的药物对；评估多重用药风险。
            """),
            html.H5("3. 再入院率预测"),
            html.P("""
                功能：使用机器学习模型预测患者30天内再入院风险。
                模型：
                - 逻辑回归：提供可解释的系数和优势比
                - 随机森林：处理非线性关系，提供特征重要性
                特征：包含Charlson合并症指数、住院历史、用药特征、检验结果等。
            """),
            html.H5("4. 医疗资源利用分析"),
            html.P("""
                功能：分析住院日分布、科室负荷、床位利用率，并进行时序预测。
                方法：描述性统计分析，随机森林回归预测未来资源需求。
            """),
            html.H5("5. 差分隐私保护"),
            html.P("""
                功能：在统计分析结果中添加满足ε-差分隐私的噪声。
                机制：
                - 拉普拉斯机制：用于纯差分隐私
                - 高斯机制：用于近似差分隐私
                保护：小分组抑制、噪声添加、后处理确保结果合理性。
            """)
        ], title="🔬 分析模型说明")
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
        return disease_layout
    elif pathname == '/medication':
        return medication_layout
    elif pathname == '/readmission':
        return readmission_layout
    elif pathname == '/resource':
        return resource_layout
    elif pathname == '/visualization':
        return visualization_layout
    elif pathname == '/privacy':
        return privacy_layout
    elif pathname == '/dictionary':
        return dictionary_layout
    else:
        return overview_layout


# -----------------------------------------------------------------------------
# 概览页面回调
# -----------------------------------------------------------------------------

@app.callback(
    [Output('stat-patients', 'children'),
     Output('stat-diagnoses', 'children'),
     Output('stat-medications', 'children'),
     Output('stat-hospitalizations', 'children'),
     Output('stat-readmission', 'children'),
     Output('stat-los', 'children')],
    [Input('url', 'pathname')]
)
def update_overview_stats(pathname):
    stats = get_summary_stats()
    return (
        f"{stats['total_patients']:,}",
        f"{stats['total_diagnoses']:,}",
        f"{stats['total_medications']:,}",
        f"{stats['total_hospitalizations']:,}",
        f"{stats['readmission_rate']}",
        f"{stats['average_length_of_stay']}"
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
    disease_counts = data['hospitalizations']['main_diagnosis'].value_counts().head(10)
    fig1 = px.bar(
        x=disease_counts.values,
        y=disease_counts.index,
        orientation='h',
        title='',
        labels={'x': '入院人数', 'y': '疾病'},
        color=disease_counts.values,
        color_continuous_scale='Blues'
    )
    fig1.update_layout(yaxis={'categoryorder': 'total ascending'})
    
    # 年龄性别分布
    fig2 = analyzers['visualization'].create_age_gender_distribution()
    
    # 地区分布
    region_counts = data['patients']['region'].value_counts().head(10)
    fig3 = px.pie(
        values=region_counts.values,
        names=region_counts.index,
        title='',
        hole=0.4
    )
    
    # 月度入院趋势
    hosp_df = data['hospitalizations'].copy()
    hosp_df['admission_date'] = pd.to_datetime(hosp_df['admission_date'])
    hosp_df['year_month'] = hosp_df['admission_date'].dt.to_period('M').astype(str)
    monthly_counts = hosp_df.groupby('year_month').size().reset_index(name='count')
    
    fig4 = px.line(
        monthly_counts,
        x='year_month',
        y='count',
        markers=True,
        title=''
    )
    fig4.update_layout(xaxis_title='月份', yaxis_title='入院人数')
    
    return fig1, fig2, fig3, fig4


# -----------------------------------------------------------------------------
# 疾病分析页面回调
# -----------------------------------------------------------------------------

@app.callback(
    [Output('disease-summary', 'children'),
     Output('disease-trend-chart', 'figure'),
     Output('disease-age-gender-chart', 'figure'),
     Output('disease-geographic-chart', 'figure')],
    [Input('disease-selector', 'value'),
     Input('time-granularity', 'value'),
     Input('stratify-by', 'value')]
)
def update_disease_analysis(disease_name, time_granularity, stratify_by):
    try:
        # 获取疾病汇总
        summary = analyzers['disease'].get_disease_summary(disease_name)
        
        # 创建汇总展示
        summary_html = dbc.Row([
            dbc.Col([
                html.H6("总病例数"),
                html.H4(f"{summary['total_cases']:,}")
            ], width=2),
            dbc.Col([
                html.H6("唯一患者"),
                html.H4(f"{summary['unique_patients']:,}")
            ], width=2),
            dbc.Col([
                html.H6("平均年龄"),
                html.H4(f"{summary['average_age']:.1f}岁")
            ], width=2),
            dbc.Col([
                html.H6("时间跨度"),
                html.H4(summary['date_range'])
            ], width=6)
        ])
        
        # 趋势图
        trend_fig = analyzers['visualization'].create_disease_trend_chart(
            disease_name, time_granularity
        )
        
        # 年龄性别分布图
        age_gender_fig = analyzers['visualization'].create_age_gender_distribution(
            disease_name
        )
        
        # 地理热力图
        geo_fig = analyzers['visualization'].create_geographic_heatmap(
            disease_name
        )
        
        return summary_html, trend_fig, age_gender_fig, geo_fig
    except Exception as e:
        return (
            html.Div(f"错误: {str(e)}"),
            create_empty_figure(),
            create_empty_figure(),
            create_empty_figure()
        )


# -----------------------------------------------------------------------------
# 用药安全页面回调
# -----------------------------------------------------------------------------

@app.callback(
    [Output('patient-medication-result', 'children'),
     Output('medication-distribution', 'figure'),
     Output('adherence-distribution', 'figure'),
     Output('polypharmacy-summary', 'children'),
     Output('polypharmacy-chart', 'figure')],
    [Input('analyze-patient-btn', 'n_clicks')],
    [State('patient-id-input', 'value')]
)
def update_medication_analysis(n_clicks, patient_id):
    try:
        # 患者用药分析
        if patient_id and patient_id in data['patients']['patient_id'].values:
            analysis = analyzers['medication'].analyze_patient_medications(patient_id)
            
            if 'error' in analysis:
                patient_result = html.Div(f"错误: {analysis['error']}")
            else:
                # 创建结果展示
                interactions = analysis.get('drug_interactions', [])
                has_interactions = len(interactions) > 0
                
                patient_result = dbc.Card([
                    dbc.CardHeader(f"患者 {patient_id} 用药分析"),
                    dbc.CardBody([
                        dbc.Row([
                            dbc.Col([
                                html.H6("安全评分"),
                                html.H4(f"{analysis['safety_score']}/100", 
                                       className='text-success' if analysis['safety_score'] >= 70 
                                       else 'text-warning' if analysis['safety_score'] >= 40 
                                       else 'text-danger')
                            ], width=3),
                            dbc.Col([
                                html.H6("用药数量"),
                                html.H4(f"{analysis['total_medications']}")
                            ], width=3),
                            dbc.Col([
                                html.H6("药物相互作用"),
                                html.H4(f"{len(interactions)} 个",
                                       className='text-danger' if has_interactions else 'text-success')
                            ], width=3),
                            dbc.Col([
                                html.H6("依从性风险"),
                                html.H4("是" if analysis['adherence_analysis']['overall_adherence_risk'] else "否",
                                       className='text-warning' if analysis['adherence_analysis']['overall_adherence_risk'] else 'text-success')
                            ], width=3)
                        ]),
                        html.Hr(),
                        html.H6("药物相互作用详情："),
                        html.Div([
                            html.P("未检测到潜在的药物相互作用。", className='text-success')
                            if not has_interactions else
                            html.Ul([
                                html.Li([
                                    html.Strong(f"{i['drug1']} + {i['drug2']}"),
                                    html.Br(),
                                    html.Small(f"严重程度: {i['interaction_details']['severity']}"),
                                    html.Br(),
                                    html.Small(f"机制: {i['interaction_details']['mechanism']}")
                                ]) for i in interactions
                            ])
                        ])
                    ])
                ])
        else:
            patient_result = html.Div("请输入有效的患者ID", className='text-warning')
        
        # 常用药物分布
        med_counts = data['medications']['medication_name'].value_counts().head(10)
        med_fig = px.bar(
            x=med_counts.values,
            y=med_counts.index,
            orientation='h',
            title='',
            labels={'x': '处方数量', 'y': '药物名称'},
            color=med_counts.values,
            color_continuous_scale='Greens'
        )
        med_fig.update_layout(yaxis={'categoryorder': 'total ascending'})
        
        # 依从性分布
        adherence_dist = data['medications']['adherence'].value_counts()
        adherence_fig = px.pie(
            values=adherence_dist.values,
            names=adherence_dist.index,
            title='用药依从性分布',
            color_discrete_map={'良好': 'green', '一般': 'orange', '差': 'red'}
        )
        
        # 多重用药分析
        poly = analyzers['medication'].analyze_polypharmacy()
        
        poly_summary = dbc.Row([
            dbc.Col([
                html.H6("平均每人用药数"),
                html.H4(f"{poly['average_medications_per_patient']:.2f}")
            ], width=3),
            dbc.Col([
                html.H6("最大用药数"),
                html.H4(f"{poly['max_medications_per_patient']}")
            ], width=3),
            dbc.Col([
                html.H6("高风险患者数"),
                html.H4(f"{poly['high_risk_patients_count']}", className='text-warning')
            ], width=3),
            dbc.Col([
                html.H6("严重多重用药"),
                html.H4(f"{poly['polypharmacy_distribution'].get('严重多重用药(10种以上)', 0)}", className='text-danger')
            ], width=3)
        ])
        
        # 多重用药分布图
        poly_data = pd.DataFrame([
            {'category': k, 'count': v} 
            for k, v in poly['polypharmacy_distribution'].items()
        ])
        poly_fig = px.bar(
            poly_data,
            x='category',
            y='count',
            title='多重用药分布',
            color='category',
            color_discrete_map={
                '少量用药(1-2种)': 'green',
                '适度用药(3-5种)': 'blue',
                '多重用药(6-10种)': 'orange',
                '严重多重用药(10种以上)': 'red'
            }
        )
        
        return patient_result, med_fig, adherence_fig, poly_summary, poly_fig
        
    except Exception as e:
        return (
            html.Div(f"错误: {str(e)}"),
            create_empty_figure(),
            create_empty_figure(),
            html.Div(f"错误: {str(e)}"),
            create_empty_figure()
        )


# -----------------------------------------------------------------------------
# 可视化页面回调
# -----------------------------------------------------------------------------

@app.callback(
    [Output('sankey-controls', 'style'),
     Output('kaplan-controls', 'style'),
     Output('geo-controls', 'style')],
    [Input('visualization-tabs', 'active_tab')]
)
def toggle_visualization_tabs(active_tab):
    if active_tab == 'tab-sankey':
        return {'display': 'block'}, {'display': 'none'}, {'display': 'none'}
    elif active_tab == 'tab-kaplan':
        return {'display': 'none'}, {'display': 'block'}, {'display': 'none'}
    elif active_tab == 'tab-geo':
        return {'display': 'none'}, {'display': 'none'}, {'display': 'block'}
    return {'display': 'none'}, {'display': 'none'}, {'display': 'none'}


@app.callback(
    Output('sankey-chart', 'figure'),
    [Input('sankey-disease-count', 'value')]
)
def update_sankey_chart(top_n):
    try:
        return analyzers['visualization'].create_sankey_treatment_path(top_n_diseases=top_n)
    except Exception as e:
        return create_empty_figure(str(e))


@app.callback(
    Output('kaplan-chart', 'figure'),
    [Input('kaplan-groupby', 'value'),
     Input('kaplan-disease', 'value')]
)
def update_kaplan_chart(groupby, disease):
    try:
        disease_name = None if disease == 'all' else disease
        return analyzers['visualization'].create_kaplan_meier_curve(
            group_by=groupby,
            disease_name=disease_name
        )
    except Exception as e:
        return create_empty_figure(str(e))


@app.callback(
    Output('geo-chart', 'figure'),
    [Input('geo-disease', 'value')]
)
def update_geo_chart(disease):
    try:
        disease_name = None if disease == 'all' else disease
        return analyzers['visualization'].create_geographic_heatmap(disease_name)
    except Exception as e:
        return create_empty_figure(str(e))


# -----------------------------------------------------------------------------
# 资源分析页面回调
# -----------------------------------------------------------------------------

@app.callback(
    [Output('resource-warnings', 'children'),
     Output('los-distribution-chart', 'figure'),
     Output('dept-los-chart', 'figure'),
     Output('dept-workload-chart', 'figure'),
     Output('dept-workload-table', 'children'),
     Output('bed-utilization-chart', 'figure'),
     Output('bed-forecast-chart', 'figure')],
    [Input('url', 'pathname')]
)
def update_resource_analysis(pathname):
    try:
        # 获取资源汇总
        resource_summary = analyzers['resource'].get_resource_summary()
        
        # 资源预警
        warnings = resource_summary.get('resource_warnings', [])
        if warnings:
            warning_html = html.Div([
                dbc.Alert([
                    html.Strong(f"⚠️ {w['type']}:"),
                    html.P(w['message']),
                    html.Small(f"涉及: {', '.join(w.get('departments', []))}")
                ], color='warning' if '预警' in w['type'] else 'danger')
                for w in warnings
            ])
        else:
            warning_html = html.Div("✅ 当前无资源预警", className='text-success')
        
        # 住院日分析
        los = resource_summary['length_of_stay_analysis']
        
        # 住院日分布
        los_dist_data = pd.DataFrame([
            {'category': k, 'count': v} 
            for k, v in los['los_distribution'].items()
        ])
        los_fig = px.bar(
            los_dist_data,
            x='category',
            y='count',
            title='住院日分布',
            labels={'category': '住院日区间', 'count': '患者数'}
        )
        
        # 各科室平均住院日
        dept_los = los['department_los'].head(10)
        dept_los_fig = px.bar(
            dept_los,
            x='mean_los',
            y='admission_department',
            orientation='h',
            title='各科室平均住院日（Top 10）',
            labels={'mean_los': '平均住院日（天）', 'admission_department': '科室'}
        )
        dept_los_fig.update_layout(yaxis={'categoryorder': 'total ascending'})
        
        # 科室负荷
        dept_workload = resource_summary['department_workload_analysis']
        
        # 科室负荷图表
        workload_df = dept_workload['department_statistics'].head(10)
        workload_fig = px.bar(
            workload_df,
            x='admission_department',
            y='normalized_workload',
            color='normalized_workload',
            color_continuous_scale='RdYlGn_r',
            title='科室负荷评分（归一化）',
            labels={'normalized_workload': '负荷评分', 'admission_department': '科室'}
        )
        
        # 科室负荷表格
        workload_table = dash_table.DataTable(
            columns=[
                {'name': '科室', 'id': 'admission_department'},
                {'name': '入院数', 'id': 'total_admissions'},
                {'name': '负荷评分', 'id': 'normalized_workload'}
            ],
            data=workload_df[['admission_department', 'total_admissions', 'normalized_workload']].to_dict('records'),
            style_table={'overflowX': 'auto'},
            style_cell={'textAlign': 'left', 'padding': '5px', 'fontSize': '12px'},
            style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'}
        )
        
        # 床位利用
        bed_util = resource_summary['bed_utilization_analysis']
        
        # 床位利用率图表
        bed_df = bed_util['department_bed_utilization']
        bed_fig = px.bar(
            bed_df,
            x='department',
            y='utilization_rate',
            color='utilization_rate',
            color_continuous_scale='RdYlGn',
            range_color=[0, 1],
            title='各科室床位利用率',
            labels={'utilization_rate': '利用率', 'department': '科室'}
        )
        bed_fig.update_layout(yaxis_tickformat='.0%')
        
        # 床位需求预测
        forecast = analyzers['resource'].forecast_resource_demand(forecast_months=12)
        forecast_df = forecast['forecast_details']
        
        # 准备历史数据和预测数据
        historical = forecast['historical_data']
        historical['type'] = '历史'
        forecast_df['type'] = '预测'
        
        # 预测图表
        forecast_fig = go.Figure()
        
        # 历史数据
        forecast_fig.add_trace(go.Scatter(
            x=historical['admission_year_month'].astype(str),
            y=historical['admissions'],
            mode='lines+markers',
            name='历史入院量',
            line=dict(color='blue')
        ))
        
        # 预测数据
        forecast_fig.add_trace(go.Scatter(
            x=forecast_df['year_month'].astype(str),
            y=forecast_df['predicted_admissions'],
            mode='lines+markers',
            name='预测入院量',
            line=dict(color='red', dash='dash')
        ))
        
        forecast_fig.update_layout(
            title='月度入院量预测',
            xaxis_title='月份',
            yaxis_title='入院人数'
        )
        
        return (
            warning_html, los_fig, dept_los_fig,
            workload_fig, workload_table, bed_fig, forecast_fig
        )
        
    except Exception as e:
        return (
            html.Div(f"错误: {str(e)}"),
            create_empty_figure(),
            create_empty_figure(),
            create_empty_figure(),
            html.Div(f"错误: {str(e)}"),
            create_empty_figure(),
            create_empty_figure()
        )


# -----------------------------------------------------------------------------
# 隐私保护页面回调
# -----------------------------------------------------------------------------

@app.callback(
    [Output('epsilon-description', 'children'),
     Output('privacy-incidence-chart', 'figure'),
     Output('privacy-comparison-table', 'children'),
     Output('privacy-utility-chart', 'figure')],
    [Input('apply-privacy-btn', 'n_clicks')],
    [State('privacy-epsilon', 'value')]
)
def update_privacy_analysis(n_clicks, epsilon):
    try:
        # ε值描述
        if epsilon < 0.5:
            desc = html.Span("强隐私保护（噪声较大）", className='text-success')
        elif epsilon < 2.0:
            desc = html.Span("平衡隐私保护和数据效用", className='text-warning')
        else:
            desc = html.Span("较弱隐私保护（数据更准确）", className='text-danger')
        
        # 疾病发病率分析
        incidence_result = analyzers['privacy'].analyze_disease_incidence(epsilon=epsilon)
        comparison = incidence_result['comparison'].head(10)
        
        # 对比图表
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            x=comparison['disease'],
            y=comparison['true_count'],
            name='真实值',
            marker_color='blue'
        ))
        
        fig.add_trace(go.Bar(
            x=comparison['disease'],
            y=comparison['noisy_count'],
            name='隐私保护值',
            marker_color='red',
            opacity=0.7
        ))
        
        fig.update_layout(
            title=f'疾病发病率对比（ε={epsilon}）',
            xaxis_title='疾病',
            yaxis_title='病例数',
            barmode='group',
            xaxis_tickangle=45
        )
        
        # 详细对比表格
        table_data = comparison[['disease', 'true_count', 'noisy_count', 'relative_error']].copy()
        table_data['relative_error'] = (table_data['relative_error'] * 100).round(2)
        table_data.columns = ['疾病', '真实值', '隐私保护值', '相对误差(%)']
        
        table = dash_table.DataTable(
            columns=[{'name': col, 'id': col} for col in table_data.columns],
            data=table_data.to_dict('records'),
            style_table={'overflowX': 'auto'},
            style_cell={'textAlign': 'left', 'padding': '10px'},
            style_header={'backgroundColor': 'rgb(230, 230, 230)', 'fontWeight': 'bold'},
            style_data_conditional=[
                {
                    'if': {
                        'filter_query': '{相对误差(%)} > 20',
                        'column_id': '相对误差(%)'
                    },
                    'backgroundColor': '#FF4136',
                    'color': 'white'
                },
                {
                    'if': {
                        'filter_query': '{相对误差(%)} > 10 && {相对误差(%)} <= 20',
                        'column_id': '相对误差(%)'
                    },
                    'backgroundColor': '#FFDC00',
                    'color': 'black'
                }
            ]
        )
        
        # 隐私-效用权衡演示
        epsilon_values = [0.1, 0.5, 1.0, 2.0, 5.0]
        demo_results = []
        
        for eps in epsilon_values:
            result = analyzers['privacy'].analyze_disease_incidence(epsilon=eps)
            demo_results.append({
                'epsilon': eps,
                'avg_relative_error': result['utility_metrics']['average_relative_error'],
                'suppressed_groups': result['utility_metrics']['suppressed_groups']
            })
        
        demo_df = pd.DataFrame(demo_results)
        
        utility_fig = make_subplots(specs=[[{"secondary_y": True}]])
        
        utility_fig.add_trace(
            go.Scatter(
                x=demo_df['epsilon'],
                y=demo_df['avg_relative_error'],
                mode='lines+markers',
                name='平均相对误差',
                line=dict(color='red')
            ),
            secondary_y=False
        )
        
        utility_fig.add_trace(
            go.Bar(
                x=demo_df['epsilon'],
                y=demo_df['suppressed_groups'],
                name='抑制分组数',
                marker_color='blue',
                opacity=0.5
            ),
            secondary_y=True
        )
        
        utility_fig.update_layout(
            title='隐私-效用权衡（不同ε值的效果）',
            xaxis_title='ε（隐私预算）',
            hovermode='x unified'
        )
        
        utility_fig.update_yaxes(title_text='平均相对误差', secondary_y=False)
        utility_fig.update_yaxes(title_text='抑制分组数', secondary_y=True)
        
        return desc, fig, table, utility_fig
        
    except Exception as e:
        return (
            html.Div(f"错误: {str(e)}"),
            create_empty_figure(),
            html.Div(f"错误: {str(e)}"),