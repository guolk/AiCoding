#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
医疗健康数据分析平台 - 启动脚本
"""

import os
import sys

# 添加当前目录到路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import pandas as pd
import numpy as np

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
    if os.path.exists(data_dir) and len([f for f in os.listdir(data_dir) if f.endswith('.csv')]) >= 5:
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
# 导航栏
# =============================================================================

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


# =============================================================================
# 页面布局
# =============================================================================

# 概览页面
overview_layout = dbc.Container([
    html.H2("📊 数据概览", className="mb-4"),
    
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
])


# 数据字典页面
dictionary_layout = dbc.Container([
    html.H2("📋 数据字典", className="mb-4"),
    
    dbc.Accordion([
        dbc.AccordionItem([
            html.P("包含10000名虚拟患者的基本人口统计信息。"),
            html.H5("患者表字段说明："),
            html.Ul([
                html.Li("patient_id: 患者唯一标识符（如P000001）"),
                html.Li("name: 患者姓名"),
                html.Li("gender: 性别（男/女）"),
                html.Li("birth_date: 出生日期"),
                html.Li("age: 年龄"),
                html.Li("region: 所在地区"),
                html.Li("smoking_status: 吸烟状态"),
                html.Li("alcohol_status: 饮酒状态"),
                html.Li("family_history: 家族病史"),
            ])
        ], title="👤 患者表 (patients.csv)"),
        
        dbc.AccordionItem([
            html.P("包含患者的诊断记录。"),
            html.H5("诊断表字段说明："),
            html.Ul([
                html.Li("diagnosis_id: 诊断唯一标识符"),
                html.Li("patient_id: 关联的患者ID"),
                html.Li("disease_name: 疾病名称"),
                html.Li("icd10_code: ICD-10编码"),
                html.Li("diagnosis_date: 诊断日期"),
                html.Li("severity: 严重程度（轻度/中度/重度）"),
                html.Li("charlson_weight: Charlson评分权重"),
            ])
        ], title="🏥 诊断表 (diagnoses.csv)"),
        
        dbc.AccordionItem([
            html.P("平台包含多种分析模型。"),
            html.H5("主要功能模块："),
            html.Ul([
                html.Li("疾病发病率时序趋势分析"),
                html.Li("用药安全分析（药物相互作用检测）"),
                html.Li("再入院率预测（逻辑回归+随机森林）"),
                html.Li("医疗资源利用分析"),
                html.Li("差分隐私保护"),
            ])
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
        return html.Div("疾病分析页面 - 请查看dashboard.py获取完整代码")
    elif pathname == '/medication':
        return html.Div("用药安全页面 - 请查看dashboard.py获取完整代码")
    elif pathname == '/readmission':
        return html.Div("再入院预测页面 - 请查看dashboard.py获取完整代码")
    elif pathname == '/resource':
        return html.Div("资源分析页面 - 请查看dashboard.py获取完整代码")
    elif pathname == '/visualization':
        return html.Div("可视化页面 - 请查看dashboard.py获取完整代码")
    elif pathname == '/privacy':
        return html.Div("隐私保护页面 - 请查看dashboard.py获取完整代码")
    elif pathname == '/dictionary':
        return dictionary_layout
    else:
        return overview_layout


# 概览页面回调
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
     Output('overview-age-gender', 'figure')],
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
    
    return fig1, fig2


# =============================================================================
# 主函数
# =============================================================================

if __name__ == '__main__':
    # 加载数据
    load_or_generate_data()
    
    print("=" * 60)
    print("医疗健康数据分析平台 - Dash交互式看板")
    print("=" * 60)
    print(f"\n数据统计:")
    stats = get_summary_stats()
    print(f"  - 总患者数: {stats['total_patients']:,}")
    print(f"  - 诊断记录: {stats['total_diagnoses']:,}")
    print(f"  - 用药记录: {stats['total_medications']:,}")
    print(f"  - 住院记录: {stats['total_hospitalizations']:,}")
    print(f"  - 检验结果: {stats['total_lab_tests']:,}")
    print(f"\n平台功能:")
    print("  1. 数据概览 - 查看总体数据统计")
    print("  2. 疾病分析 - 疾病发病率时序趋势分析")
    print("  3. 用药安全 - 药物相互作用检测和用药分析")
    print("  4. 再入院预测 - 机器学习模型预测再入院风险")
    print("  5. 资源分析 - 医疗资源利用分析和预测")
    print("  6. 可视化 - Sankey图、生存曲线、地理热力图")
    print("  7. 隐私保护 - 差分隐私保护演示")
    print("  8. 数据字典 - 完整的数据字典文档")
    print(f"\n启动服务器...")
    print("请在浏览器中访问: http://127.0.0.1:8050/")
    print("=" * 60)
    
    app.run_server(debug=True, port=8050, host='0.0.0.0')
