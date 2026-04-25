import dash
from dash import dcc, html, dash_table
from dash.dependencies import Input, Output, State
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
from datetime import datetime, date
import os

from data_generator import generate_ecommerce_data, add_purchase_price
from rfm_analysis import calculate_rfm, rfm_segmentation, get_rfm_statistics
from recommendation import CollaborativeFilteringRecommender

DATA_FILE = 'ecommerce_data.csv'

def load_or_generate_data():
    """
    加载数据，如果不存在则生成
    """
    if os.path.exists(DATA_FILE):
        df = pd.read_csv(DATA_FILE, parse_dates=['timestamp'], encoding='utf-8-sig')
        print(f'从文件加载数据: {len(df)} 条记录')
    else:
        print('生成模拟数据...')
        df = generate_ecommerce_data(num_records=120000, start_date='2024-01-01', end_date='2024-03-31')
        df = add_purchase_price(df)
        df.to_csv(DATA_FILE, index=False, encoding='utf-8-sig')
        print(f'数据生成完成: {len(df)} 条记录')
    
    return df

df = load_or_generate_data()

df['date'] = df['timestamp'].dt.date
df['hour'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.day_name()

min_date = df['date'].min()
max_date = df['date'].max()
categories = sorted(df['category'].unique().tolist())
users = sorted(df['user_id'].unique().tolist())

recommender = CollaborativeFilteringRecommender(n_similar_users=10, n_recommendations=10)
recommender.fit(df)

app = dash.Dash(__name__)
server = app.server

colors = {
    'background': '#f8f9fa',
    'card_background': '#ffffff',
    'text': '#2c3e50',
    'primary': '#3498db',
    'secondary': '#95a5a6',
    'success': '#27ae60',
    'warning': '#f39c12',
    'danger': '#e74c3c'
}

segment_colors = {
    '重要价值用户': '#27ae60',
    '重要发展用户': '#3498db',
    '重要挽留用户': '#f39c12',
    '重要沉睡用户': '#e67e22',
    '新用户': '#9b59b6',
    '一般价值用户': '#1abc9c',
    '一般用户': '#95a5a6',
    '流失用户': '#e74c3c'
}

app.layout = html.Div([
    html.Div([
        html.H1('电商用户行为分析平台', style={'textAlign': 'center', 'color': colors['text'], 'marginBottom': '10px'}),
        html.P('用户行为可视化与智能推荐系统', style={'textAlign': 'center', 'color': colors['secondary']})
    ], style={'padding': '20px', 'backgroundColor': colors['card_background'], 'marginBottom': '20px'}),
    
    html.Div([
        html.Div([
            html.Label('时间范围:', style={'fontWeight': 'bold', 'marginBottom': '10px', 'display': 'block'}),
            dcc.DatePickerRange(
                id='date-picker-range',
                min_date_allowed=min_date,
                max_date_allowed=max_date,
                start_date=min_date,
                end_date=max_date,
                display_format='YYYY-MM-DD',
                style={'width': '100%'}
            )
        ], style={'width': '40%', 'display': 'inline-block', 'padding': '10px'}),
        
        html.Div([
            html.Label('商品类别:', style={'fontWeight': 'bold', 'marginBottom': '10px', 'display': 'block'}),
            dcc.Dropdown(
                id='category-dropdown',
                options=[{'label': '全部类别', 'value': 'all'}] + [{'label': cat, 'value': cat} for cat in categories],
                value='all',
                multi=False,
                style={'width': '100%'}
            )
        ], style={'width': '30%', 'display': 'inline-block', 'padding': '10px'}),
        
        html.Div([
            html.Label('用户ID:', style={'fontWeight': 'bold', 'marginBottom': '10px', 'display': 'block'}),
            dcc.Dropdown(
                id='user-dropdown',
                options=[{'label': user, 'value': user} for user in users[:100]],
                value=users[0] if users else None,
                searchable=True,
                placeholder='选择或输入用户ID',
                style={'width': '100%'}
            )
        ], style={'width': '25%', 'display': 'inline-block', 'padding': '10px'})
    ], style={'backgroundColor': colors['card_background'], 'padding': '15px', 'marginBottom': '20px', 'display': 'flex', 'alignItems': 'center'}),
    
    html.Div([
        html.Div([
            html.H4('核心指标概览', style={'textAlign': 'center', 'color': colors['text'], 'marginBottom': '20px'}),
            html.Div([
                html.Div([
                    html.P('总用户数', style={'textAlign': 'center', 'color': colors['secondary']}),
                    html.H3(id='total-users', style={'textAlign': 'center', 'color': colors['primary']})
                ], style={'width': '25%', 'display': 'inline-block'}),
                html.Div([
                    html.P('总商品数', style={'textAlign': 'center', 'color': colors['secondary']}),
                    html.H3(id='total-products', style={'textAlign': 'center', 'color': colors['success']})
                ], style={'width': '25%', 'display': 'inline-block'}),
                html.Div([
                    html.P('购买转化率', style={'textAlign': 'center', 'color': colors['secondary']}),
                    html.H3(id='conversion-rate', style={'textAlign': 'center', 'color': colors['warning']})
                ], style={'width': '25%', 'display': 'inline-block'}),
                html.Div([
                    html.P('总销售额', style={'textAlign': 'center', 'color': colors['secondary']}),
                    html.H3(id='total-revenue', style={'textAlign': 'center', 'color': colors['danger']})
                ], style={'width': '25%', 'display': 'inline-block'})
            ])
        ], style={'backgroundColor': colors['card_background'], 'padding': '20px', 'marginBottom': '20px'})
    ]),
    
    html.Div([
        html.Div([
            html.H3('用户购买漏斗转化率', style={'textAlign': 'center', 'color': colors['text'], 'marginBottom': '15px'}),
            dcc.Graph(id='funnel-chart')
        ], style={'width': '50%', 'display': 'inline-block', 'padding': '10px', 'boxSizing': 'border-box'}),
        
        html.Div([
            html.H3('商品类别热度趋势（按天聚合）', style={'textAlign': 'center', 'color': colors['text'], 'marginBottom': '15px'}),
            dcc.Graph(id='trend-chart')
        ], style={'width': '50%', 'display': 'inline-block', 'padding': '10px', 'boxSizing': 'border-box'})
    ]),
    
    html.Div([
        html.Div([
            html.H3('用户RFM分层分析', style={'textAlign': 'center', 'color': colors['text'], 'marginBottom': '15px'}),
            dcc.Graph(id='rfm-scatter')
        ], style={'width': '65%', 'display': 'inline-block', 'padding': '10px', 'boxSizing': 'border-box'}),
        
        html.Div([
            html.H3('RFM用户分层分布', style={'textAlign': 'center', 'color': colors['text'], 'marginBottom': '15px'}),
            dcc.Graph(id='rfm-pie')
        ], style={'width': '35%', 'display': 'inline-block', 'padding': '10px', 'boxSizing': 'border-box'})
    ]),
    
    html.Div([
        html.H3('协同过滤商品推荐', style={'textAlign': 'center', 'color': colors['text'], 'marginBottom': '20px'}),
        html.Div([
            html.Div([
                html.H4('用户行为历史', style={'color': colors['text'], 'marginBottom': '10px', 'marginTop': '0'}),
                dash_table.DataTable(
                    id='user-history-table',
                    columns=[
                        {'name': '商品ID', 'id': 'product_id'},
                        {'name': '商品类别', 'id': 'category'},
                        {'name': '浏览', 'id': '浏览'},
                        {'name': '收藏', 'id': '收藏'},
                        {'name': '加购', 'id': '加购'},
                        {'name': '购买', 'id': '购买'}
                    ],
                    style_table={'overflowX': 'auto', 'minHeight': '300px', 'height': '300px'},
                    style_cell={
                        'textAlign': 'left',
                        'padding': '10px',
                        'backgroundColor': colors['card_background'],
                        'minWidth': '80px',
                        'maxWidth': '150px',
                        'overflow': 'hidden',
                        'textOverflow': 'ellipsis'
                    },
                    style_header={
                        'backgroundColor': colors['primary'],
                        'color': 'white',
                        'fontWeight': 'bold'
                    },
                    style_data={
                        'whiteSpace': 'normal',
                        'height': 'auto'
                    },
                    page_size=8,
                    fixed_rows={'headers': True}
                )
            ], style={'width': '48%', 'padding': '0 1%', 'verticalAlign': 'top'}),
            
            html.Div([
                html.H4('推荐商品列表', style={'color': colors['text'], 'marginBottom': '10px', 'marginTop': '0'}),
                dash_table.DataTable(
                    id='recommendations-table',
                    columns=[
                        {'name': '推荐顺序', 'id': 'rank'},
                        {'name': '商品ID', 'id': 'product_id'},
                        {'name': '商品类别', 'id': 'category'},
                        {'name': '推荐分数', 'id': 'score'}
                    ],
                    style_table={'overflowX': 'auto', 'minHeight': '300px', 'height': '300px'},
                    style_cell={
                        'textAlign': 'left',
                        'padding': '10px',
                        'backgroundColor': colors['card_background'],
                        'minWidth': '80px',
                        'maxWidth': '150px',
                        'overflow': 'hidden',
                        'textOverflow': 'ellipsis'
                    },
                    style_header={
                        'backgroundColor': colors['success'],
                        'color': 'white',
                        'fontWeight': 'bold'
                    },
                    style_data={
                        'whiteSpace': 'normal',
                        'height': 'auto'
                    },
                    page_size=8,
                    fixed_rows={'headers': True}
                )
            ], style={'width': '48%', 'padding': '0 1%', 'verticalAlign': 'top'})
        ], style={'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'flex-start', 'flexWrap': 'nowrap'})
    ], style={'backgroundColor': colors['card_background'], 'padding': '25px', 'marginBottom': '20px', 'borderRadius': '8px', 'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'})
], style={'backgroundColor': colors['background'], 'padding': '20px'})

@app.callback(
    [Output('total-users', 'children'),
     Output('total-products', 'children'),
     Output('conversion-rate', 'children'),
     Output('total-revenue', 'children'),
     Output('funnel-chart', 'figure'),
     Output('trend-chart', 'figure'),
     Output('rfm-scatter', 'figure'),
     Output('rfm-pie', 'figure')],
    [Input('date-picker-range', 'start_date'),
     Input('date-picker-range', 'end_date'),
     Input('category-dropdown', 'value')]
)
def update_dashboard(start_date, end_date, selected_category):
    start_date = datetime.strptime(start_date.split('T')[0], '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date.split('T')[0], '%Y-%m-%d').date()
    
    filtered_df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
    
    if selected_category != 'all':
        filtered_df = filtered_df[filtered_df['category'] == selected_category]
    
    if filtered_df.empty:
        empty_fig = go.Figure()
        empty_fig.update_layout(
            title='暂无数据',
            xaxis={'visible': False},
            yaxis={'visible': False},
            annotations=[{
                'text': '选择的时间范围或类别下无数据',
                'xref': 'paper',
                'yref': 'paper',
                'showarrow': False,
                'font': {'size': 20}
            }]
        )
        return '0', '0', '0%', '¥0', empty_fig, empty_fig, empty_fig, empty_fig
    
    total_users = filtered_df['user_id'].nunique()
    total_products = filtered_df['product_id'].nunique()
    
    behavior_counts = filtered_df['behavior_type'].value_counts()
    browse_count = behavior_counts.get('浏览', 0)
    favorite_count = behavior_counts.get('收藏', 0)
    cart_count = behavior_counts.get('加购', 0)
    purchase_count = behavior_counts.get('购买', 0)
    
    conversion_rate = (purchase_count / browse_count * 100) if browse_count > 0 else 0
    total_revenue = filtered_df[filtered_df['behavior_type'] == '购买']['price'].sum()
    
    funnel_fig = go.Figure(go.Funnel(
        y=['浏览', '收藏', '加购', '购买'],
        x=[browse_count, favorite_count, cart_count, purchase_count],
        textinfo='value+percent initial',
        marker={
            'color': [colors['primary'], colors['secondary'], colors['warning'], colors['success']]
        },
        connector={'line': {'color': 'royalblue', 'dash': 'dot'}}
    ))
    
    funnel_fig.update_layout(
        title='用户行为转化漏斗',
        plot_bgcolor=colors['background'],
        paper_bgcolor=colors['card_background']
    )
    
    daily_trend = filtered_df.groupby(['date', 'category']).agg({
        'user_id': 'count'
    }).reset_index()
    daily_trend.columns = ['date', 'category', 'count']
    
    trend_fig = px.line(
        daily_trend,
        x='date',
        y='count',
        color='category',
        markers=True,
        labels={'count': '行为次数', 'date': '日期', 'category': '商品类别'}
    )
    
    trend_fig.update_layout(
        title='各类别每日热度趋势',
        xaxis_title='日期',
        yaxis_title='行为次数',
        plot_bgcolor=colors['background'],
        paper_bgcolor=colors['card_background'],
        legend_title='商品类别'
    )
    
    purchase_df = filtered_df[filtered_df['behavior_type'] == '购买']
    rfm_df = calculate_rfm(purchase_df)
    
    if not rfm_df.empty:
        rfm_df = rfm_segmentation(rfm_df)
        
        rfm_scatter = px.scatter(
            rfm_df,
            x='R',
            y='F',
            size='M',
            color='RFM_segment',
            color_discrete_map=segment_colors,
            hover_data=['user_id', 'R', 'F', 'M'],
            labels={
                'R': '最近购买天数 (Recency)',
                'F': '购买频率 (Frequency)',
                'M': '购买金额 (Monetary)'
            }
        )
        
        rfm_scatter.update_layout(
            title='RFM用户分层散点图',
            plot_bgcolor=colors['background'],
            paper_bgcolor=colors['card_background'],
            legend_title='用户分层'
        )
        
        segment_counts = rfm_df['RFM_segment'].value_counts().reset_index()
        segment_counts.columns = ['segment', 'count']
        
        rfm_pie = px.pie(
            segment_counts,
            values='count',
            names='segment',
            color='segment',
            color_discrete_map=segment_colors
        )
        
        rfm_pie.update_layout(
            title='用户分层分布',
            plot_bgcolor=colors['background'],
            paper_bgcolor=colors['card_background']
        )
    else:
        rfm_scatter = go.Figure()
        rfm_scatter.update_layout(
            title='RFM分析需要购买行为数据',
            annotations=[{'text': '暂无购买数据', 'xref': 'paper', 'yref': 'paper', 'showarrow': False}]
        )
        rfm_pie = rfm_scatter
    
    return (
        f'{total_users:,}',
        f'{total_products:,}',
        f'{conversion_rate:.2f}%',
        f'¥{total_revenue:,.2f}',
        funnel_fig,
        trend_fig,
        rfm_scatter,
        rfm_pie
    )

@app.callback(
    [Output('user-history-table', 'data'),
     Output('recommendations-table', 'data')],
    [Input('user-dropdown', 'value')]
)
def update_recommendations(selected_user):
    if not selected_user:
        return [], []
    
    user_history = recommender.get_user_behavior_history(selected_user, df)
    
    if user_history.empty:
        history_data = []
    else:
        for col in ['浏览', '收藏', '加购', '购买']:
            if col not in user_history.columns:
                user_history[col] = 0
        user_history = user_history[['product_id', 'category', '浏览', '收藏', '加购', '购买']]
        history_data = user_history.to_dict('records')
    
    recommendations = recommender.get_recommendations(selected_user)
    
    for i, rec in enumerate(recommendations):
        rec['rank'] = i + 1
    
    return history_data, recommendations

if __name__ == '__main__':
    print('启动电商用户行为分析平台...')
    print(f'数据时间范围: {min_date} 至 {max_date}')
    print(f'总记录数: {len(df)}')
    print(f'用户数: {len(users)}')
    print(f'商品类别: {categories}')
    print('\n访问 http://127.0.0.1:8050 查看可视化看板')
    app.run_server(debug=True)
