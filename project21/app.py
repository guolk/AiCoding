import dash
from dash import dcc, html, Input, Output, State, dash_table
import dash_bootstrap_components as dbc
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
import os

from modules.data_generator import NBAGenerator, generate_multiple_seasons, NBATEAMS
from modules.heatmap_analyzer import HeatmapAnalyzer
from modules.player_efficiency import PlayerEfficiencyAnalyzer, EfficiencyTier
from modules.correlation_analyzer import CorrelationAnalyzer
from modules.matchup_analyzer import MatchupAnalyzer, AdvantageType

DATA_DIR = "data"
SEASONS = [2022, 2023, 2024]
TEAM_ABBRS = [t.abbreviation for t in NBATEAMS]
TEAM_NAMES = {t.abbreviation: t.name for t in NBATEAMS}

COLORS = {
    "primary": "#2563eb",
    "primary_light": "#3b82f6",
    "primary_dark": "#1d4ed8",
    
    "secondary": "#64748b",
    "secondary_light": "#94a3b8",
    "secondary_dark": "#475569",
    
    "accent": "#f59e0b",
    "accent_light": "#fbbf24",
    "accent_dark": "#d97706",
    
    "success": "#10b981",
    "success_light": "#34d399",
    "success_dark": "#059669",
    
    "warning": "#f97316",
    "warning_light": "#fb923c",
    "warning_dark": "#ea580c",
    
    "danger": "#ef4444",
    "danger_light": "#f87171",
    "danger_dark": "#dc2626",
    
    "info": "#6366f1",
    "info_light": "#818cf8",
    "info_dark": "#4f46e5",
    
    "bg_primary": "#f8fafc",
    "bg_secondary": "#f1f5f9",
    "bg_card": "#ffffff",
    
    "text_primary": "#1e293b",
    "text_secondary": "#64748b",
    "text_muted": "#94a3b8",
    
    "border": "#e2e8f0",
    "border_light": "#f1f5f9",
    
    "chart_blue": "#2563eb",
    "chart_red": "#ef4444",
    "chart_green": "#10b981",
    "chart_yellow": "#f59e0b",
    "chart_purple": "#8b5cf6",
    "chart_teal": "#14b8a6",
}

GRADIENT = {
    "primary": "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    "success": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    "info": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    "card": "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
}

SPACING = {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "xxl": "48px",
}

SHADOW = {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
}

CARD_STYLE = {
    "backgroundColor": COLORS["bg_card"],
    "border": f"1px solid {COLORS['border']}",
    "borderRadius": "16px",
    "boxShadow": SHADOW["md"],
    "marginBottom": SPACING["xl"],
    "overflow": "hidden",
}

CARD_STYLE_HOVER = {
    **CARD_STYLE,
    "transition": "all 0.3s ease",
}

CARD_HEADER_STYLE = {
    "backgroundColor": COLORS["bg_secondary"],
    "borderBottom": f"1px solid {COLORS['border']}",
    "padding": f"{SPACING['md']} {SPACING['lg']}",
}

SECTION_STYLE = {
    "marginBottom": SPACING["xxl"],
}

HEADER_STYLE = {
    "color": COLORS["text_primary"],
    "fontWeight": "700",
    "fontSize": "32px",
    "marginBottom": SPACING["lg"],
    "paddingBottom": SPACING["md"],
    "borderBottom": f"3px solid {COLORS['primary']}",
}

SUBHEADER_STYLE = {
    "color": COLORS["text_primary"],
    "fontWeight": "600",
    "fontSize": "18px",
    "marginBottom": SPACING["md"],
}

BUTTON_STYLE = {
    "borderRadius": "10px",
    "fontWeight": "600",
    "padding": f"{SPACING['sm']} {SPACING['lg']}",
    "border": "none",
    "transition": "all 0.2s ease",
}

app = dash.Dash(__name__, 
                external_stylesheets=[dbc.themes.FLATLY],
                suppress_callback_exceptions=True,
                title="NBA Analytics Dashboard")

server = app.server

games_df = None
shots_df = None
player_stats_df = None
heatmap_analyzer = None
efficiency_analyzer = None
correlation_analyzer = None
matchup_analyzer = None


def ensure_data_exists():
    global games_df, shots_df, player_stats_df
    global heatmap_analyzer, efficiency_analyzer, correlation_analyzer, matchup_analyzer
    
    os.makedirs(DATA_DIR, exist_ok=True)
    
    data_files = []
    for season in SEASONS:
        games_file = f"{DATA_DIR}/games_{season}.csv"
        shots_file = f"{DATA_DIR}/shots_{season}.csv"
        player_file = f"{DATA_DIR}/player_stats_{season}.csv"
        
        if not all(os.path.exists(f) for f in [games_file, shots_file, player_file]):
            print(f"Generating data for season {season}...")
            generator = NBAGenerator(season=season, random_seed=season * 100)
            g_df, s_df = generator.generate_season()
            p_df = generator.generate_player_stats()
            generator.save_all(DATA_DIR)
            
            data_files.append((g_df, s_df, p_df))
        else:
            g_df = pd.read_csv(games_file)
            s_df = pd.read_csv(shots_file)
            p_df = pd.read_csv(player_file)
            data_files.append((g_df, s_df, p_df))
    
    all_games = []
    all_shots = []
    all_players = []
    
    for g_df, s_df, p_df in data_files:
        all_games.append(g_df)
        all_shots.append(s_df)
        all_players.append(p_df)
    
    games_df = pd.concat(all_games, ignore_index=True)
    shots_df = pd.concat(all_shots, ignore_index=True)
    player_stats_df = pd.concat(all_players, ignore_index=True)
    
    print("Data loaded successfully!")
    print(f"Games: {len(games_df)}, Shots: {len(shots_df)}, Players: {len(player_stats_df)}")
    
    heatmap_analyzer = HeatmapAnalyzer(shots_df)
    efficiency_analyzer = PlayerEfficiencyAnalyzer(player_stats_df)
    correlation_analyzer = CorrelationAnalyzer(games_df, shots_df)
    matchup_analyzer = MatchupAnalyzer(games_df, shots_df, player_stats_df)


def create_court_shapes():
    shapes = []
    
    shapes.append({
        "type": "rect",
        "x0": -25, "y0": 0, "x1": 25, "y1": 47,
        "line": {"color": "#e0e0e0", "width": 2},
        "fillcolor": "rgba(0,0,0,0)"
    })
    
    shapes.append({
        "type": "rect",
        "x0": -8, "y0": 0, "x1": 8, "y1": 19,
        "line": {"color": "#e0e0e0", "width": 1},
        "fillcolor": "rgba(0,0,0,0)"
    })
    
    shapes.append({
        "type": "circle",
        "x0": -4, "y0": 0, "x1": 4, "y1": 8,
        "line": {"color": COLORS["primary"], "width": 2, "dash": "dash"},
        "fillcolor": "rgba(224, 62, 62, 0.1)"
    })
    
    return shapes


def create_navbar():
    nav_style = {
        "background": COLORS["bg_card"],
        "borderBottom": f"1px solid {COLORS['border']}",
        "boxShadow": SHADOW["md"],
        "padding": f"{SPACING['md']} 0",
    }
    
    brand_style = {
        "color": COLORS["primary"],
        "fontWeight": "800",
        "fontSize": "26px",
    }
    
    nav_link_style = {
        "color": COLORS["text_secondary"],
        "fontWeight": "500",
        "marginLeft": SPACING["sm"],
        "marginRight": SPACING["sm"],
        "borderRadius": "10px",
        "transition": "all 0.2s ease",
        "padding": f"{SPACING['sm']} {SPACING['md']}",
    }
    
    return dbc.Navbar(
        dbc.Container([
            html.A(
                html.Span("🏀 NBA 数据分析看板", style=brand_style),
                href="/",
                style={"textDecoration": "none", "display": "flex", "alignItems": "center"},
            ),
            dbc.Nav([
                dbc.NavItem(dbc.NavLink("📊 投篮热力图", href="/heatmap", id="link-heatmap", style=nav_link_style)),
                dbc.NavItem(dbc.NavLink("⭐ 球员效率", href="/efficiency", id="link-efficiency", style=nav_link_style)),
                dbc.NavItem(dbc.NavLink("📈 相关性分析", href="/correlation", id="link-correlation", style=nav_link_style)),
                dbc.NavItem(dbc.NavLink("⚔️ 对抗分析", href="/matchup", id="link-matchup", style=nav_link_style)),
            ], navbar=True),
        ], fluid=True),
        style=nav_style,
        dark=False,
        expand="lg",
    )


def create_filter_row(include_player=False):
    filter_card_style = {
        "backgroundColor": COLORS["bg_card"],
        "border": f"1px solid {COLORS['border']}",
        "borderRadius": "16px",
        "padding": f"{SPACING['lg']}",
        "marginBottom": SPACING["xl"],
        "boxShadow": SHADOW["sm"],
    }
    
    label_style = {
        "color": COLORS["text_secondary"],
        "fontWeight": "600",
        "marginBottom": SPACING["sm"],
        "fontSize": "13px",
        "textTransform": "uppercase",
        "letterSpacing": "0.5px",
    }
    
    dropdown_style = {
        "backgroundColor": COLORS["bg_secondary"],
        "border": f"1px solid {COLORS['border']}",
        "borderRadius": "10px",
        "color": COLORS["text_primary"],
        "padding": "4px",
    }
    
    filters = [
        dbc.Col([
            html.Label("📅 赛季", style=label_style),
            dcc.Dropdown(
                id="season-filter",
                options=[{"label": f"{s}-{s+1} 赛季", "value": s} for s in SEASONS],
                value=SEASONS[-1],
                clearable=False,
                style=dropdown_style,
            ),
        ], md=3),
        dbc.Col([
            html.Label("🏀 球队", style=label_style),
            dcc.Dropdown(
                id="team-filter",
                options=[{"label": f"{abbr} - {TEAM_NAMES[abbr]}", "value": abbr} 
                         for abbr in TEAM_ABBRS],
                value="LAL",
                clearable=False,
                style=dropdown_style,
            ),
        ], md=3),
    ]
    
    if include_player:
        filters.append(dbc.Col([
            html.Label("👤 球员", style=label_style),
            dcc.Dropdown(
                id="player-filter",
                options=[],
                value=None,
                clearable=True,
                placeholder="选择球员（可选）",
                style=dropdown_style,
            ),
        ], md=3))
    
    return dbc.Card(
        dbc.Row(filters, className="g-4", align="end"),
        style=filter_card_style,
    )


def create_stats_card(title, value, subtitle=None, color=None):
    color = color or COLORS["primary"]
    
    return dbc.Col([
        dbc.Card([
            dbc.CardBody([
                html.H6(title, className="mb-2", style={
                    "fontSize": "12px", 
                    "textTransform": "uppercase", 
                    "letterSpacing": "0.8px",
                    "color": COLORS["text_secondary"],
                    "fontWeight": "600",
                }),
                html.H3(value, style={
                    "color": color, 
                    "fontWeight": "800", 
                    "marginBottom": "4px",
                    "fontSize": "28px",
                }),
                html.P(subtitle, className="mb-0", style={
                    "fontSize": "11px",
                    "color": COLORS["text_muted"],
                }) if subtitle else None,
            ], style={"padding": f"{SPACING['md']} {SPACING['lg']}"})
        ], style={
            "backgroundColor": COLORS["bg_card"],
            "border": f"1px solid {COLORS['border']}",
            "borderRadius": "14px",
            "textAlign": "center",
            "boxShadow": SHADOW["sm"],
            "borderTop": f"4px solid {color}",
        })
    ], md=2, sm=4, xs=6)


home_page = html.Div([
    html.Div([
        html.H1("🏀 NBA 数据分析看板", 
                style={
                    "textAlign": "center", 
                    "fontSize": "48px", 
                    "fontWeight": "800",
                    "color": COLORS["primary"],
                    "marginBottom": SPACING["md"],
                }),
        html.P("专业的篮球比赛数据分析工具 - 探索投篮分布、球员效率、比赛趋势和球队对抗", 
               style={
                   "textAlign": "center", 
                   "fontSize": "18px", 
                   "color": COLORS["text_secondary"],
                   "marginBottom": SPACING["xxl"],
               }),
    ]),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div("📊", style={
                            "fontSize": "56px", 
                            "marginBottom": SPACING["md"],
                            "textAlign": "center",
                        }),
                        html.H4("投篮热力图", style={
                            "color": COLORS["primary"], 
                            "fontWeight": "700",
                            "textAlign": "center",
                            "marginBottom": SPACING["md"],
                        }),
                        html.P("查看球队或球员在球场各个区域的投篮命中率分布，通过颜色直观展示热区和冷区。", 
                               style={
                                   "color": COLORS["text_secondary"], 
                                   "marginBottom": SPACING["lg"],
                                   "textAlign": "center",
                                   "lineHeight": "1.6",
                               }),
                        html.Div([
                            dbc.Button("开始探索 →", href="/heatmap", 
                                       style={
                                           **BUTTON_STYLE,
                                           "backgroundColor": COLORS["primary"],
                                           "color": "white",
                                           "fontSize": "14px",
                                       }),
                        ], style={"textAlign": "center"}),
                    ]),
                ], style={"padding": f"{SPACING['xl']} {SPACING['lg']}", "minHeight": "320px"})
            ], style={
                **CARD_STYLE,
                "borderTop": f"4px solid {COLORS['primary']}",
                "cursor": "pointer",
            })
        ], lg=6, md=6, sm=12),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div("⭐", style={
                            "fontSize": "56px", 
                            "marginBottom": SPACING["md"],
                            "textAlign": "center",
                        }),
                        html.H4("球员效率", style={
                            "color": COLORS["accent"], 
                            "fontWeight": "700",
                            "textAlign": "center",
                            "marginBottom": SPACING["md"],
                        }),
                        html.P("分析球员的高级效率数据，包括真实命中率(TS%)、球员效率值(PER)、有效命中率(eFG%)等。", 
                               style={
                                   "color": COLORS["text_secondary"], 
                                   "marginBottom": SPACING["lg"],
                                   "textAlign": "center",
                                   "lineHeight": "1.6",
                               }),
                        html.Div([
                            dbc.Button("开始探索 →", href="/efficiency", 
                                       style={
                                           **BUTTON_STYLE,
                                           "backgroundColor": COLORS["accent"],
                                           "color": "white",
                                           "fontSize": "14px",
                                       }),
                        ], style={"textAlign": "center"}),
                    ]),
                ], style={"padding": f"{SPACING['xl']} {SPACING['lg']}", "minHeight": "320px"})
            ], style={
                **CARD_STYLE,
                "borderTop": f"4px solid {COLORS['accent']}",
            })
        ], lg=6, md=6, sm=12),
    ], className="g-4 mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div("📈", style={
                            "fontSize": "56px", 
                            "marginBottom": SPACING["md"],
                            "textAlign": "center",
                        }),
                        html.H4("相关性分析", style={
                            "color": COLORS["info"], 
                            "fontWeight": "700",
                            "textAlign": "center",
                            "marginBottom": SPACING["md"],
                        }),
                        html.P("研究各项比赛数据与胜负的关系，找出对胜率影响最大的关键因素。", 
                               style={
                                   "color": COLORS["text_secondary"], 
                                   "marginBottom": SPACING["lg"],
                                   "textAlign": "center",
                                   "lineHeight": "1.6",
                               }),
                        html.Div([
                            dbc.Button("开始探索 →", href="/correlation", 
                                       style={
                                           **BUTTON_STYLE,
                                           "backgroundColor": COLORS["info"],
                                           "color": "white",
                                           "fontSize": "14px",
                                       }),
                        ], style={"textAlign": "center"}),
                    ]),
                ], style={"padding": f"{SPACING['xl']} {SPACING['lg']}", "minHeight": "320px"})
            ], style={
                **CARD_STYLE,
                "borderTop": f"4px solid {COLORS['info']}",
            })
        ], lg=6, md=6, sm=12),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div("⚔️", style={
                            "fontSize": "56px", 
                            "marginBottom": SPACING["md"],
                            "textAlign": "center",
                        }),
                        html.H4("对抗分析", style={
                            "color": COLORS["success"], 
                            "fontWeight": "700",
                            "textAlign": "center",
                            "marginBottom": SPACING["md"],
                        }),
                        html.P("对比两支球队的优劣势，通过雷达图全方位展示各项能力指标。", 
                               style={
                                   "color": COLORS["text_secondary"], 
                                   "marginBottom": SPACING["lg"],
                                   "textAlign": "center",
                                   "lineHeight": "1.6",
                               }),
                        html.Div([
                            dbc.Button("开始探索 →", href="/matchup", 
                                       style={
                                           **BUTTON_STYLE,
                                           "backgroundColor": COLORS["success"],
                                           "color": "white",
                                           "fontSize": "14px",
                                       }),
                        ], style={"textAlign": "center"}),
                    ]),
                ], style={"padding": f"{SPACING['xl']} {SPACING['lg']}", "minHeight": "320px"})
            ], style={
                **CARD_STYLE,
                "borderTop": f"4px solid {COLORS['success']}",
            })
        ], lg=6, md=6, sm=12),
    ], className="g-4 mb-5"),
    
    dbc.Card([
        dbc.CardHeader(html.H4("📊 数据概览", style={
            "color": COLORS["text_primary"], 
            "fontWeight": "700",
            "marginBottom": 0,
        })),
        dbc.CardBody([
            dash_table.DataTable(
                id="overview-table",
                style_table={'overflowX': 'auto'},
                style_cell={
                    'backgroundColor': COLORS["bg_card"],
                    'color': COLORS["text_primary"],
                    'textAlign': 'center',
                    'padding': '14px',
                    'fontSize': '14px',
                    'border': f'1px solid {COLORS["border"]}',
                },
                style_header={
                    'backgroundColor': COLORS["bg_secondary"],
                    'color': COLORS["text_primary"],
                    'fontWeight': 'bold',
                    'padding': '14px',
                    'fontSize': '14px',
                    'border': f'1px solid {COLORS["border"]}',
                },
                style_data_conditional=[
                    {
                        'if': {'row_index': 'odd'},
                        'backgroundColor': COLORS["bg_secondary"],
                    }
                ],
            ),
        ]),
    ], style=CARD_STYLE),
])


heatmap_page = html.Div([
    html.H2("📊 投篮热力图", style=HEADER_STYLE),
    create_filter_row(include_player=True),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("🎯 投篮分布热力图", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                dbc.CardBody([
                    dcc.Graph(id="heatmap-graph", style={"height": "550px"}),
                ]),
            ], style=CARD_STYLE),
        ], lg=8),
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("📋 区域投篮统计", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                dbc.CardBody([
                    html.Div(id="zone-stats-card", style={"maxHeight": "500px", "overflowY": "auto"}),
                ]),
            ], style=CARD_STYLE),
        ], lg=4),
    ], className="g-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("🥧 投篮类型分布", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                dbc.CardBody([
                    dcc.Graph(id="shot-type-pie"),
                ]),
            ], style=CARD_STYLE),
        ], md=6),
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("📊 各区域命中率", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                dbc.CardBody([
                    dcc.Graph(id="zone-fg-bar"),
                ]),
            ], style=CARD_STYLE),
        ], md=6),
    ], className="g-4"),
])


efficiency_page = html.Div([
    html.H2("⭐ 球员进攻效率评级", style=HEADER_STYLE),
    create_filter_row(include_player=True),
    
    dbc.Card([
        dbc.CardHeader(
            dbc.Tabs([
                dbc.Tab(label="🏠 球队概览", tab_id="team-overview", 
                        label_style={"color": COLORS["text_primary"]}),
                dbc.Tab(label="👤 球员详情", tab_id="player-detail",
                        label_style={"color": COLORS["text_primary"]}),
                dbc.Tab(label="🏆 效率排行榜", tab_id="leaderboard",
                        label_style={"color": COLORS["text_primary"]}),
            ], id="efficiency-tabs", active_tab="team-overview")
        ),
        dbc.CardBody([
            html.Div(id="efficiency-content"),
        ]),
    ], style=CARD_STYLE),
])


correlation_page = html.Div([
    html.H2("📈 比赛胜负相关性分析", style=HEADER_STYLE),
    
    dbc.Card([
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.Label("📅 选择赛季", style={
                        "color": COLORS["text_secondary"],
                        "fontWeight": "500",
                        "marginBottom": "8px",
                    }),
                    dcc.Dropdown(
                        id="corr-season-filter",
                        options=[{"label": f"{s}-{s+1} 赛季", "value": s} for s in SEASONS] + 
                                [{"label": "所有赛季", "value": "all"}],
                        value="all",
                        clearable=False,
                        style={
                            "backgroundColor": COLORS["bg_secondary"],
                            "border": f"1px solid {COLORS['border']}",
                            "borderRadius": "8px",
                            "color": COLORS["text_primary"],
                        },
                    ),
                ], md=4),
            ]),
        ]),
    ], style={**CARD_STYLE, "marginBottom": "24px"}),
    
    html.Div(id="correlation-stats", style={"marginBottom": "24px"}),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("🔥 相关性热图", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                dbc.CardBody([
                    dcc.Graph(id="correlation-heatmap"),
                ]),
            ], style=CARD_STYLE),
        ], md=6),
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("⚖️ 高低值胜率对比", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                dbc.CardBody([
                    dcc.Graph(id="win-rate-comparison"),
                ]),
            ], style=CARD_STYLE),
        ], md=6),
    ], className="g-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("🌐 联盟整体趋势", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                dbc.CardBody([
                    html.Div(id="league-trends"),
                ]),
            ], style=CARD_STYLE),
        ], width=12),
    ], className="g-4 mt-4"),
])


matchup_page = html.Div([
    html.H2("⚔️ 对抗分析", style=HEADER_STYLE),
    
    dbc.Card([
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.Label("📅 赛季", style={"color": COLORS["text_secondary"], "fontWeight": "500", "marginBottom": "8px"}),
                    dcc.Dropdown(
                        id="matchup-season-filter",
                        options=[{"label": f"{s}-{s+1} 赛季", "value": s} for s in SEASONS] + 
                                [{"label": "所有赛季", "value": "all"}],
                        value="all",
                        clearable=False,
                        style={
                            "backgroundColor": COLORS["bg_secondary"],
                            "border": f"1px solid {COLORS['border']}",
                            "borderRadius": "8px",
                            "color": COLORS["text_primary"],
                        },
                    ),
                ], md=3),
                dbc.Col([
                    html.Label("🏀 球队 1", style={"color": COLORS["primary"], "fontWeight": "600", "marginBottom": "8px"}),
                    dcc.Dropdown(
                        id="matchup-team1",
                        options=[{"label": f"{abbr} - {TEAM_NAMES[abbr]}", "value": abbr} 
                                 for abbr in TEAM_ABBRS],
                        value="LAL",
                        clearable=False,
                        style={
                            "backgroundColor": COLORS["bg_secondary"],
                            "border": f"2px solid {COLORS['primary']}",
                            "borderRadius": "8px",
                            "color": COLORS["text_primary"],
                        },
                    ),
                ], md=3),
                dbc.Col([
                    html.Label("🏀 球队 2", style={"color": COLORS["secondary"], "fontWeight": "600", "marginBottom": "8px"}),
                    dcc.Dropdown(
                        id="matchup-team2",
                        options=[{"label": f"{abbr} - {TEAM_NAMES[abbr]}", "value": abbr} 
                                 for abbr in TEAM_ABBRS],
                        value="BOS",
                        clearable=False,
                        style={
                            "backgroundColor": COLORS["bg_secondary"],
                            "border": f"2px solid {COLORS['secondary']}",
                            "borderRadius": "8px",
                            "color": COLORS["text_primary"],
                        },
                    ),
                ], md=3),
                dbc.Col([
                    html.Label(" ", style={"marginBottom": "8px"}),
                    dbc.Button(
                        "⚔️ 开始对比分析", 
                        id="analyze-matchup-btn", 
                        className="w-100",
                        style={
                            "backgroundColor": f"linear-gradient(90deg, {COLORS['primary']} 0%, {COLORS['secondary']} 100%)",
                            "border": "none",
                            "borderRadius": "8px",
                            "fontWeight": "700",
                            "padding": "12px 24px",
                            "fontSize": "16px",
                        }
                    ),
                ], md=3),
            ], className="g-4", align="end"),
        ]),
    ], style={**CARD_STYLE, "marginBottom": "24px"}),
    
    html.Div(id="matchup-content"),
])


content = html.Div(id="page-content", style={"padding": f"0 {SPACING['sm']}"})

app.layout = html.Div([
    dcc.Location(id="url", refresh=False),
    create_navbar(),
    html.Div([content], style={
        "padding": f"{SPACING['xl']}", 
        "maxWidth": "1800px", 
        "margin": "0 auto",
    }),
], style={
    "backgroundColor": COLORS["bg_primary"],
    "minHeight": "100vh",
})


@app.callback(
    Output("page-content", "children"),
    [Input("url", "pathname")]
)
def display_page(pathname):
    if pathname == "/heatmap":
        return heatmap_page
    elif pathname == "/efficiency":
        return efficiency_page
    elif pathname == "/correlation":
        return correlation_page
    elif pathname == "/matchup":
        return matchup_page
    else:
        return home_page


@app.callback(
    Output("player-filter", "options"),
    [Input("team-filter", "value"),
     Input("season-filter", "value")]
)
def update_player_options(team, season):
    if player_stats_df is None:
        return []
    
    filtered = player_stats_df[
        (player_stats_df["team"] == team) & 
        (player_stats_df["season"] == season)
    ]
    
    players = sorted(filtered["player"].unique())
    return [{"label": p, "value": p} for p in players]


@app.callback(
    [Output("heatmap-graph", "figure"),
     Output("zone-stats-card", "children"),
     Output("shot-type-pie", "figure"),
     Output("zone-fg-bar", "figure")],
    [Input("season-filter", "value"),
     Input("team-filter", "value"),
     Input("player-filter", "value")]
)
def update_heatmap(season, team, player):
    if heatmap_analyzer is None:
        return go.Figure(), html.Div(), go.Figure(), go.Figure()
    
    season_filter = season if season != "all" else None
    
    x_bins, y_bins, fg_pct_grid, total_counts = heatmap_analyzer.get_heatmap_data(
        team=team, player=player, season=season_filter, grid_size=20
    )
    
    fig_heatmap = go.Figure()
    
    if len(fg_pct_grid) > 0:
        fig_heatmap = go.Figure(data=go.Heatmap(
            z=fg_pct_grid,
            x=np.linspace(-25, 25, 20),
            y=np.linspace(0, 45, 20),
            colorscale=[
                [0, "#1a1a2e"],
                [0.25, "#16213e"],
                [0.4, "#0f3460"],
                [0.55, "#533483"],
                [0.7, "#e94560"],
                [0.85, "#ff6b6b"],
                [1, "#feca57"],
            ],
            zmin=0.2,
            zmax=0.7,
            colorbar=dict(
                title="命中率",
                tickformat=".0%",
                titlefont=dict(color=COLORS["text_primary"]),
                tickfont=dict(color=COLORS["text_primary"]),
            ),
            hoverongaps=False,
            hovertemplate="X: %{x}<br>Y: %{y}<br>命中率: %{z:.1%}<extra></extra>",
        ))
    
    fig_heatmap.update_layout(
        xaxis=dict(
            range=[-30, 30], 
            constrain="domain", 
            title="X (英尺)",
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        yaxis=dict(
            range=[0, 50], 
            scaleanchor="x", 
            scaleratio=1, 
            title="Y (英尺)",
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        shapes=create_court_shapes(),
        title={
            "text": f"{team} - {player if player else '全队'} 投篮热力图 ({season}赛季)",
            "font": {"color": COLORS["text_primary"], "size": 18},
            "x": 0.5,
        },
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        height=520,
    )
    
    zones = heatmap_analyzer.analyze_zones(team=team, player=player, season=season_filter)
    
    zone_cards = []
    zone_names = []
    zone_fg_pcts = []
    zone_attempts = []
    
    for zone_name, zone_data in zones.items():
        zone_names.append(zone_name)
        zone_fg_pcts.append(zone_data.fg_pct)
        zone_attempts.append(zone_data.attempts)
        
        fg_color = COLORS["danger"] if zone_data.fg_pct < 0.35 else \
                   COLORS["warning"] if zone_data.fg_pct < 0.45 else \
                   COLORS["success"]
        
        zone_cards.append(
            dbc.Card([
                dbc.CardBody([
                    dbc.Row([
                        dbc.Col([
                            html.H6(zone_name, className="mb-1", 
                                    style={"color": COLORS["text_primary"], "fontWeight": "600"}),
                            html.P([
                                html.Strong(f"{zone_data.makes}/{zone_data.attempts}"),
                                f" ({zone_data.avg_distance} 英尺)",
                            ], className="mb-0 text-muted", style={"fontSize": "12px"}),
                        ], width=8),
                        dbc.Col([
                            html.H4(f"{zone_data.fg_pct:.0%}", 
                                    style={"color": fg_color, "fontWeight": "700", "textAlign": "right", "marginBottom": 0}),
                        ], width=4),
                    ], align="center"),
                ])
            ], style={
                "backgroundColor": COLORS["bg_card"],
                "border": f"1px solid {COLORS['border']}",
                "borderRadius": "8px",
                "marginBottom": "8px",
            })
        )
    
    summary = heatmap_analyzer.get_shot_distribution_summary(team=team, season=season_filter)
    
    pie_labels = []
    pie_values = []
    for shot_type, data in summary.get("shot_type_distribution", {}).items():
        if data["count"] > 0:
            pie_labels.append(f"{shot_type}\n({data['fg_pct']:.1%})")
            pie_values.append(data["count"])
    
    fig_pie = go.Figure(data=[go.Pie(
        labels=pie_labels,
        values=pie_values,
        hole=0.5,
        textinfo="label+percent",
        textfont=dict(color=COLORS["text_primary"]),
        marker=dict(
            colors=[COLORS["primary"], COLORS["accent"], COLORS["info"]],
            line=dict(color=COLORS["bg_card"], width=2),
        ),
    )])
    fig_pie.update_layout(
        title={
            "text": "投篮类型分布",
            "font": {"color": COLORS["text_primary"]},
        },
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(font=dict(color=COLORS["text_secondary"])),
    )
    
    fig_bar = go.Figure()
    
    bar_colors = [COLORS["danger"] if p < 0.35 else 
                  COLORS["warning"] if p < 0.45 else 
                  COLORS["success"] for p in zone_fg_pcts]
    
    fig_bar.add_trace(go.Bar(
        x=zone_names,
        y=[p * 100 for p in zone_fg_pcts],
        text=[f"{p:.1%}" for p in zone_fg_pcts],
        textposition="auto",
        textfont=dict(color="white"),
        marker_color=bar_colors,
        marker_line=dict(color=COLORS["bg_card"], width=1),
        name="命中率",
    ))
    
    fig_bar.update_layout(
        title={
            "text": "各区域命中率",
            "font": {"color": COLORS["text_primary"]},
        },
        yaxis_title="命中率 (%)",
        yaxis=dict(
            range=[0, 80],
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        xaxis=dict(
            tickangle=45,
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=False,
    )
    
    summary_data = summary.get("shot_type_distribution", {})
    paint_data = summary_data.get("Paint", {})
    mid_data = summary_data.get("Mid-Range", {})
    three_data = summary_data.get("3PT", {})
    
    summary_cards = dbc.Row([
        create_stats_card("总出手", summary.get("total_shots", 0), 
                         f"命中率: {summary.get('overall_fg_pct', 0):.1%}", COLORS["primary"]),
        create_stats_card("禁区", f"{paint_data.get('fg_pct', 0):.1%}", 
                         f"{paint_data.get('count', 0)} 次", COLORS["danger"]),
        create_stats_card("中距离", f"{mid_data.get('fg_pct', 0):.1%}", 
                         f"{mid_data.get('count', 0)} 次", COLORS["warning"]),
        create_stats_card("三分", f"{three_data.get('fg_pct', 0):.1%}", 
                         f"{three_data.get('count', 0)} 次", COLORS["info"]),
        create_stats_card("平均距离", f"{summary.get('avg_shot_distance', 0)}", 
                         "英尺", COLORS["accent"]),
    ], className="g-3 mb-4")
    
    zone_cards_div = html.Div([
        summary_cards,
        html.H6("各区域详情", style={"color": COLORS["text_secondary"], "marginBottom": "12px", "fontSize": "14px"}),
    ] + zone_cards)
    
    return fig_heatmap, zone_cards_div, fig_pie, fig_bar


@app.callback(
    Output("efficiency-content", "children"),
    [Input("efficiency-tabs", "active_tab"),
     Input("season-filter", "value"),
     Input("team-filter", "value"),
     Input("player-filter", "value")]
)
def update_efficiency_content(active_tab, season, team, player):
    if efficiency_analyzer is None:
        return html.Div("数据加载中...")
    
    if active_tab == "team-overview":
        return render_team_overview(season, team)
    elif active_tab == "player-detail":
        return render_player_detail(season, team, player)
    elif active_tab == "leaderboard":
        return render_leaderboard(season)
    else:
        return html.Div()


def render_team_overview(season, team):
    players = efficiency_analyzer.get_team_players_efficiency(team, season)
    team_summary = efficiency_analyzer.get_team_efficiency_summary(team, season)
    
    if not players:
        return html.Div("暂无数据")
    
    table_data = []
    for p in players:
        table_data.append({
            "球员": p.player,
            "位置": p.position,
            "场均得分": p.ppg,
            "FG%": f"{p.fg_pct:.1%}",
            "3P%": f"{p.three_pct:.1%}",
            "TS%": f"{p.ts_pct:.1%}",
            "eFG%": f"{p.efg_pct:.1%}",
            "PER": p.per,
            "效率等级": p.efficiency_tier.value,
        })
    
    df = pd.DataFrame(table_data)
    
    tier_colors = {
        "Elite": COLORS["primary"],
        "Very Good": COLORS["accent"],
        "Good": COLORS["info"],
        "Average": COLORS["success"],
        "Below Average": COLORS["warning"],
        "Poor": COLORS["danger"],
    }
    
    tier_dist = team_summary.get("efficiency_tier_distribution", {})
    fig_tier = go.Figure(data=[go.Pie(
        labels=list(tier_dist.keys()),
        values=list(tier_dist.values()),
        hole=0.5,
        textinfo="label+value",
        textfont=dict(color=COLORS["text_primary"]),
        marker=dict(
            colors=[tier_colors.get(k, COLORS["text_secondary"]) for k in tier_dist.keys()],
            line=dict(color=COLORS["bg_card"], width=2),
        ),
    )])
    fig_tier.update_layout(
        title={
            "text": "球队效率等级分布",
            "font": {"color": COLORS["text_primary"]},
        },
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(font=dict(color=COLORS["text_secondary"])),
    )
    
    per_values = [p.per for p in players]
    ts_values = [p.ts_pct * 100 for p in players]
    player_names = [p.player for p in players]
    
    fig_scatter = go.Figure()
    fig_scatter.add_trace(go.Scatter(
        x=per_values,
        y=ts_values,
        mode="markers+text",
        text=player_names,
        textposition="top center",
        textfont=dict(color=COLORS["text_secondary"], size=10),
        marker=dict(
            size=14,
            color=per_values,
            colorscale=[
                [0, COLORS["danger"]],
                [0.5, COLORS["warning"]],
                [1, COLORS["success"]],
            ],
            showscale=True,
            colorbar=dict(
                title="PER",
                titlefont=dict(color=COLORS["text_primary"]),
                tickfont=dict(color=COLORS["text_secondary"]),
            ),
            line=dict(color=COLORS["bg_card"], width=2),
        ),
    ))
    
    fig_scatter.update_layout(
        title={
            "text": "PER vs TS% 散点图",
            "font": {"color": COLORS["text_primary"]},
        },
        xaxis_title="球员效率值 (PER)",
        yaxis_title="真实命中率 (TS%)",
        xaxis=dict(
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        yaxis=dict(
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=False,
        shapes=[
            dict(type="line", x0=15, x1=15, y0=min(ts_values)-5 if ts_values else 40, 
                 y1=max(ts_values)+5 if ts_values else 70,
                 line=dict(color=COLORS["text_secondary"], dash="dash", width=1)),
            dict(type="line", x0=min(per_values)-5 if per_values else 10, 
                 x1=max(per_values)+5 if per_values else 25, 
                 y0=56, y1=56,
                 line=dict(color=COLORS["text_secondary"], dash="dash", width=1)),
        ],
    )
    
    summary_cards = dbc.Row([
        create_stats_card("合格球员", team_summary.get("num_qualified_players", 0), "名", COLORS["primary"]),
        create_stats_card("平均PER", team_summary.get("average_per", 0), "", COLORS["accent"]),
        create_stats_card("平均TS%", f"{team_summary.get('average_ts_pct', 0):.1%}", "", COLORS["info"]),
        create_stats_card("头号球星", team_summary.get("top_player", "N/A")[:10] if team_summary.get("top_player") else "N/A", 
                         f"PER: {team_summary.get('top_player_per', 0)}" if team_summary.get("top_player_per") else "", 
                         COLORS["success"]),
    ], className="g-3 mb-4")
    
    return html.Div([
        summary_cards,
        
        dbc.Row([
            dbc.Col([
                dcc.Graph(figure=fig_tier),
            ], md=6),
            dbc.Col([
                dcc.Graph(figure=fig_scatter),
            ], md=6),
        ], className="g-4"),
        
        html.H4("球员详细数据", style={**HEADER_STYLE, "marginTop": "32px"}),
        dash_table.DataTable(
            data=df.to_dict("records"),
            columns=[{"name": i, "id": i} for i in df.columns],
            style_table={"overflowX": "auto"},
            style_cell={
                "backgroundColor": COLORS["bg_card"],
                "color": COLORS["text_primary"],
                "textAlign": "center",
                "minWidth": "80px",
                "padding": "12px",
                "border": f"1px solid {COLORS['border']}",
            },
            style_header={
                "backgroundColor": COLORS["bg_secondary"],
                "color": COLORS["text_primary"],
                "fontWeight": "bold",
                "padding": "12px",
                "border": f"1px solid {COLORS['border']}",
            },
            style_data_conditional=[
                {
                    "if": {"row_index": "odd"},
                    "backgroundColor": COLORS["bg_secondary"],
                }
            ],
            sort_action="native",
            page_size=12,
        ),
    ])


def render_player_detail(season, team, player):
    if not player:
        return html.Div([
            html.H5("请先选择一名球员", 
                    className="text-center mt-5",
                    style={"color": COLORS["text_secondary"]}),
            html.P("使用上方的下拉菜单选择球队和球员", 
                   className="text-center",
                   style={"color": COLORS["text_secondary"]}),
        ], style={"padding": "48px"})
    
    radar_data = efficiency_analyzer.get_radar_chart_data(player, season)
    eff = efficiency_analyzer.get_player_efficiency(player, season)
    
    if not radar_data or not eff:
        return html.Div("球员数据不存在")
    
    overall_metrics = radar_data["overall_metrics"]
    zone_scores = radar_data["zone_scores"]
    
    fig_radar = go.Figure()
    
    fig_radar.add_trace(go.Scatterpolar(
        r=list(overall_metrics.values()),
        theta=list(overall_metrics.keys()),
        fill="toself",
        name=player,
        line=dict(color=COLORS["primary"], width=3),
        fillcolor=f"rgba(224, 62, 62, 0.2)",
    ))
    
    fig_radar.add_trace(go.Scatterpolar(
        r=[60] * len(overall_metrics),
        theta=list(overall_metrics.keys()),
        name="联盟平均",
        line=dict(color=COLORS["text_secondary"], dash="dash", width=2),
        fillcolor="rgba(0,0,0,0)",
    ))
    
    fig_radar.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100],
                tickfont=dict(color=COLORS["text_secondary"]),
                gridcolor=COLORS["border"],
            ),
            angularaxis=dict(
                tickfont=dict(color=COLORS["text_primary"], size=12),
                gridcolor=COLORS["border"],
            ),
            bgcolor="rgba(0,0,0,0)",
        ),
        title={
            "text": f"{player} 综合能力雷达图",
            "font": {"color": COLORS["text_primary"], "size": 16},
        },
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=True,
        legend=dict(font=dict(color=COLORS["text_secondary"])),
    )
    
    zone_fig = go.Figure(data=[go.Bar(
        x=list(zone_scores.keys()),
        y=list(zone_scores.values()),
        text=[f"{v:.0f}" for v in zone_scores.values()],
        textposition="auto",
        textfont=dict(color="white"),
        marker_color=[COLORS["primary"], COLORS["accent"], COLORS["info"]],
        marker_line=dict(color=COLORS["bg_card"], width=1),
    )])
    
    zone_fig.update_layout(
        title={
            "text": "各区域得分效率",
            "font": {"color": COLORS["text_primary"]},
        },
        yaxis_title="效率评分 (满分100)",
        yaxis=dict(
            range=[0, 100],
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        xaxis=dict(
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=False,
    )
    
    raw_values = radar_data.get("raw_values", {})
    
    tier_color = COLORS["primary"] if eff.efficiency_tier.value in ["Elite", "Very Good"] else \
                  COLORS["accent"] if eff.efficiency_tier.value == "Good" else \
                  COLORS["success"] if eff.efficiency_tier.value == "Average" else \
                  COLORS["warning"]
    
    stats_card = dbc.Card([
        dbc.CardHeader(html.H5("基础信息", style={"color": COLORS["text_primary"], "marginBottom": 0})),
        dbc.CardBody([
            dbc.Row([
                dbc.Col([
                    html.P([
                        html.Strong("球队: ", style={"color": COLORS["text_secondary"]}), 
                        eff.team
                    ]),
                    html.P([
                        html.Strong("位置: ", style={"color": COLORS["text_secondary"]}), 
                        eff.position
                    ]),
                    html.P([
                        html.Strong("效率等级: ", style={"color": COLORS["text_secondary"]}), 
                        html.Span(eff.efficiency_tier.value, style={"color": tier_color, "fontWeight": "700"})
                    ]),
                ], md=6),
                dbc.Col([
                    html.P([
                        html.Strong("场均得分: ", style={"color": COLORS["text_secondary"]}), 
                        raw_values.get("ppg", 0)
                    ]),
                    html.P([
                        html.Strong("PER排名: ", style={"color": COLORS["text_secondary"]}), 
                        f"第 {eff.per_rank} 名"
                    ]),
                    html.P([
                        html.Strong("TS%排名: ", style={"color": COLORS["text_secondary"]}), 
                        f"第 {eff.ts_pct_rank} 名"
                    ]),
                ], md=6),
            ]),
        ]),
    ], style=CARD_STYLE)
    
    advanced_stats = dbc.Card([
        dbc.CardHeader(html.H5("高级数据", style={"color": COLORS["text_primary"], "marginBottom": 0})),
        dbc.CardBody([
            dbc.Row([
                create_stats_card("PER", f"{raw_values.get('per', 0):.1f}", "球员效率值", COLORS["primary"]),
                create_stats_card("TS%", f"{raw_values.get('ts_pct', 0):.1%}", "真实命中率", COLORS["success"]),
                create_stats_card("eFG%", f"{raw_values.get('efg_pct', 0):.1%}", "有效命中率", COLORS["info"]),
                create_stats_card("USG%", f"{raw_values.get('usg_pct', 0):.1%}", "使用率", COLORS["accent"]),
            ], className="g-3"),
        ]),
    ], style=CARD_STYLE)
    
    return html.Div([
        html.H3(f"{player} - {team}", style={
            "color": COLORS["text_primary"], 
            "fontWeight": "700",
            "borderBottom": f"3px solid {COLORS['primary']}",
            "paddingBottom": "12px",
            "marginBottom": "24px",
        }),
        stats_card,
        advanced_stats,
        dbc.Row([
            dbc.Col([
                dcc.Graph(figure=fig_radar),
            ], md=6),
            dbc.Col([
                dcc.Graph(figure=zone_fig),
            ], md=6),
        ], className="g-4"),
    ])


def render_leaderboard(season):
    metrics = [
        ("per", "球员效率值 (PER)"),
        ("ts_pct", "真实命中率 (TS%)"),
        ("ppg", "场均得分"),
        ("efg_pct", "有效命中率 (eFG%)"),
    ]
    
    figures = []
    
    for metric, title in metrics:
        leaders = efficiency_analyzer.get_leaders(metric=metric, season=season, top_n=10)
        
        if len(leaders) == 0:
            continue
        
        fig = go.Figure(data=[go.Bar(
            x=leaders["player"],
            y=leaders[metric] * 100 if metric in ["ts_pct", "efg_pct"] else leaders[metric],
            text=[f"{v:.1%}" if metric in ["ts_pct", "efg_pct"] else f"{v:.1f}" 
                  for v in leaders[metric]],
            textposition="auto",
            textfont=dict(color="white"),
            marker_color=[COLORS["primary"], COLORS["accent"], COLORS["info"]] * 4,
            marker_line=dict(color=COLORS["bg_card"], width=1),
        )])
        
        fig.update_layout(
            title={
                "text": title,
                "font": {"color": COLORS["text_primary"]},
            },
            yaxis_title=title.split("(")[0].strip(),
            yaxis=dict(
                titlefont=dict(color=COLORS["text_primary"]),
                tickfont=dict(color=COLORS["text_secondary"]),
                gridcolor=COLORS["border"],
            ),
            xaxis=dict(
                tickangle=45,
                tickfont=dict(color=COLORS["text_secondary"]),
            ),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            showlegend=False,
        )
        
        figures.append(fig)
    
    return html.Div([
        dbc.Row([
            dbc.Col([dcc.Graph(figure=figures[0])], md=6) if len(figures) > 0 else None,
            dbc.Col([dcc.Graph(figure=figures[1])], md=6) if len(figures) > 1 else None,
        ], className="g-4"),
        dbc.Row([
            dbc.Col([dcc.Graph(figure=figures[2])], md=6) if len(figures) > 2 else None,
            dbc.Col([dcc.Graph(figure=figures[3])], md=6) if len(figures) > 3 else None,
        ], className="g-4 mt-4"),
    ])


@app.callback(
    [Output("correlation-stats", "children"),
     Output("correlation-heatmap", "figure"),
     Output("win-rate-comparison", "figure"),
     Output("league-trends", "children")],
    [Input("corr-season-filter", "value")]
)
def update_correlation(season):
    if correlation_analyzer is None:
        return html.Div(), go.Figure(), go.Figure(), html.Div()
    
    season_filter = None if season == "all" else season
    
    correlations = correlation_analyzer.calculate_correlations(season_filter)
    
    if not correlations:
        return html.Div("暂无数据"), go.Figure(), go.Figure(), html.Div()
    
    top_predictors = correlation_analyzer.get_top_predictors(season_filter, top_n=4)
    
    predictor_cards = []
    for corr in top_predictors:
        color = COLORS["success"] if corr.correlation_coefficient > 0 else COLORS["danger"]
        
        predictor_cards.append(
            dbc.Col([
                dbc.Card([
                    dbc.CardBody([
                        html.H6(corr.metric, className="text-muted mb-2", 
                                style={"fontSize": "12px", "textTransform": "uppercase", "letterSpacing": "0.5px"}),
                        html.H3(f"{corr.correlation_coefficient:+.2f}", 
                                style={"color": color, "fontWeight": "700", "marginBottom": "8px"}),
                        html.P([
                            "高值胜率: ", html.Strong(f"{corr.win_rate_when_high:.0%}"),
                            html.Br(),
                            "低值胜率: ", html.Strong(f"{corr.win_rate_when_low:.0%}"),
                        ], className="small mb-0 text-muted"),
                        html.Small(corr.impact_description, 
                                   style={"color": color, "fontWeight": "600"}),
                    ])
                ], style={
                    "backgroundColor": COLORS["bg_card"],
                    "border": f"2px solid {color}",
                    "borderRadius": "10px",
                    "textAlign": "center",
                    "boxShadow": f"0 4px 12px rgba(0, 0, 0, 0.2)",
                })
            ], md=3)
        )
    
    corr_cols, corr_matrix = correlation_analyzer.get_correlation_heatmap_data(season_filter)
    
    fig_heatmap = go.Figure()
    if len(corr_cols) > 0 and len(corr_matrix) > 0:
        fig_heatmap = go.Figure(data=go.Heatmap(
            z=corr_matrix,
            x=corr_cols,
            y=corr_cols,
            colorscale=[
                [0, COLORS["danger"]],
                [0.5, "#16213e"],
                [1, COLORS["success"]],
            ],
            zmin=-1,
            zmax=1,
            text=[[f"{v:.2f}" for v in row] for row in corr_matrix],
            texttemplate="%{text}",
            colorbar=dict(
                title="相关系数",
                titlefont=dict(color=COLORS["text_primary"]),
                tickfont=dict(color=COLORS["text_secondary"]),
            ),
        ))
    
    fig_heatmap.update_layout(
        title={
            "text": "各项指标相关性热图",
            "font": {"color": COLORS["text_primary"]},
        },
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        yaxis=dict(
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
    )
    
    metrics = [c.metric for c in correlations]
    high_win_rates = [c.win_rate_when_high * 100 for c in correlations]
    low_win_rates = [c.win_rate_when_low * 100 for c in correlations]
    
    fig_win_rate = go.Figure()
    fig_win_rate.add_trace(go.Bar(
        x=metrics,
        y=high_win_rates,
        name="高于中位数时胜率",
        marker_color=COLORS["success"],
        marker_line=dict(color=COLORS["bg_card"], width=1),
    ))
    fig_win_rate.add_trace(go.Bar(
        x=metrics,
        y=low_win_rates,
        name="低于中位数时胜率",
        marker_color=COLORS["danger"],
        marker_line=dict(color=COLORS["bg_card"], width=1),
    ))
    
    fig_win_rate.update_layout(
        title={
            "text": "高低值胜率对比",
            "font": {"color": COLORS["text_primary"]},
        },
        yaxis_title="胜率 (%)",
        yaxis=dict(
            range=[0, 100],
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        xaxis=dict(
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        barmode="group",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(font=dict(color=COLORS["text_secondary"])),
    )
    
    trends = correlation_analyzer.get_league_wide_trends()
    
    trends_cards = dbc.Row([
        create_stats_card(
            "🏠 主场优势", 
            f"{trends['home_court_advantage']['home_win_rate']:.1%}", 
            f"总计 {trends['total_games_analyzed']} 场", 
            COLORS["primary"]
        ),
        create_stats_card(
            "🎯 得分影响", 
            f"高得分: {trends['scoring_impact']['high_scoring_win_rate']:.0%}", 
            f"低得分: {trends['scoring_impact']['low_scoring_win_rate']:.0%}", 
            COLORS["accent"]
        ),
        create_stats_card(
            "📊 投篮影响", 
            f"高命中: {trends['field_goal_impact']['high_fg_win_rate']:.0%}", 
            f"低命中: {trends['field_goal_impact']['low_fg_win_rate']:.0%}", 
            COLORS["info"]
        ),
        create_stats_card(
            "🎯 三分影响", 
            f"高三分: {trends['three_point_impact']['high_3pt_win_rate']:.0%}", 
            f"低三分: {trends['three_point_impact']['low_3pt_win_rate']:.0%}", 
            COLORS["success"]
        ),
    ], className="g-3")
    
    return (
        dbc.Card(dbc.CardBody(dbc.Row(predictor_cards, className="g-4")), style=CARD_STYLE),
        fig_heatmap,
        fig_win_rate,
        trends_cards,
    )


@app.callback(
    Output("matchup-content", "children"),
    [Input("analyze-matchup-btn", "n_clicks")],
    [State("matchup-season-filter", "value"),
     State("matchup-team1", "value"),
     State("matchup-team2", "value")]
)
def update_matchup(n_clicks, season, team1, team2):
    if matchup_analyzer is None:
        return html.Div("数据加载中...")
    
    if n_clicks is None or team1 == team2:
        return html.Div([
            html.H5("请选择两支不同的球队进行对比分析", 
                    className="text-center mt-5",
                    style={"color": COLORS["text_secondary"]}),
        ], style={"padding": "48px"})
    
    season_filter = None if season == "all" else season
    
    radar_data = matchup_analyzer.get_radar_comparison(team1, team2, season_filter)
    zone_compare = matchup_analyzer.get_detailed_zone_comparison(team1, team2, season_filter)
    player_matchup = matchup_analyzer.get_player_matchup_analysis(team1, team2, season_filter)
    
    if not radar_data:
        return html.Div("对比数据不存在")
    
    categories = radar_data["category_names"]
    t1_values = radar_data["team1_normalized"]
    t2_values = radar_data["team2_normalized"]
    
    fig_radar = go.Figure()
    
    fig_radar.add_trace(go.Scatterpolar(
        r=t1_values,
        theta=categories,
        fill="toself",
        name=team1,
        line=dict(color=COLORS["primary"], width=3),
        fillcolor=f"rgba(224, 62, 62, 0.15)",
    ))
    
    fig_radar.add_trace(go.Scatterpolar(
        r=t2_values,
        theta=categories,
        fill="toself",
        name=team2,
        line=dict(color=COLORS["secondary"], width=3),
        fillcolor=f"rgba(23, 64, 139, 0.15)",
    ))
    
    fig_radar.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100],
                tickfont=dict(color=COLORS["text_secondary"]),
                gridcolor=COLORS["border"],
            ),
            angularaxis=dict(
                tickfont=dict(color=COLORS["text_primary"], size=11),
                gridcolor=COLORS["border"],
            ),
            bgcolor="rgba(0,0,0,0)",
        ),
        title={
            "text": f"{team1} vs {team2} 能力雷达图对比",
            "font": {"color": COLORS["text_primary"], "size": 16},
            "x": 0.5,
        },
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=True,
        legend=dict(
            font=dict(color=COLORS["text_secondary"]),
            bgcolor=COLORS["bg_card"],
            bordercolor=COLORS["border"],
        ),
        height=500,
    )
    
    t1_stats = radar_data["team1_stats"]
    t2_stats = radar_data["team2_stats"]
    
    h2h_cards = dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5(f"🏀 {team1}", style={
                    "color": COLORS["primary"], 
                    "marginBottom": 0,
                    "fontWeight": "700",
                })),
                dbc.CardBody([
                    html.P([
                        html.Strong("战绩: "), 
                        f"{t1_stats['wins']}胜 {t1_stats['losses']}负",
                        html.Br(),
                        html.Strong("胜率: "),
                        f"{t1_stats['win_rate']:.1%}",
                    ], style={"color": COLORS["text_secondary"]}),
                    html.P([
                        html.Strong("场均得分: "),
                        f"{t1_stats['avg_score']:.1f}",
                        html.Br(),
                        html.Strong("净胜分: "),
                        f"{t1_stats['avg_score_diff']:+.1f}",
                    ], style={"color": COLORS["text_secondary"]}),
                ]),
            ], style={
                "backgroundColor": COLORS["bg_card"],
                "border": f"2px solid {COLORS['primary']}",
                "borderRadius": "14px",
            })
        ], md=4),
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("📊 预测结果", style={
                    "color": COLORS["accent"], 
                    "marginBottom": 0,
                    "textAlign": "center",
                    "fontWeight": "700",
                })),
                dbc.CardBody([
                    html.H3(radar_data["predicted_winner"], style={
                        "color": COLORS["accent"],
                        "textAlign": "center",
                        "fontWeight": "800",
                        "marginBottom": SPACING["md"],
                    }),
                    html.P([
                        f"{team1} 优势项: {radar_data['advantage_summary'][team1]}",
                        html.Br(),
                        f"{team2} 优势项: {radar_data['advantage_summary'][team2]}",
                        html.Br(),
                        f"持平项: {radar_data['advantage_summary']['even']}",
                    ], style={
                        "color": COLORS["text_secondary"],
                        "textAlign": "center",
                    }),
                ]),
            ], style={
                "backgroundColor": COLORS["bg_card"],
                "border": f"2px solid {COLORS['accent']}",
                "borderRadius": "14px",
            })
        ], md=4),
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5(f"🏀 {team2}", style={
                    "color": COLORS["secondary"], 
                    "marginBottom": 0,
                    "fontWeight": "700",
                })),
                dbc.CardBody([
                    html.P([
                        html.Strong("战绩: "), 
                        f"{t2_stats['wins']}胜 {t2_stats['losses']}负",
                        html.Br(),
                        html.Strong("胜率: "),
                        f"{t2_stats['win_rate']:.1%}",
                    ], style={"color": COLORS["text_secondary"]}),
                    html.P([
                        html.Strong("场均得分: "),
                        f"{t2_stats['avg_score']:.1f}",
                        html.Br(),
                        html.Strong("净胜分: "),
                        f"{t2_stats['avg_score_diff']:+.1f}",
                    ], style={"color": COLORS["text_secondary"]}),
                ]),
            ], style={
                "backgroundColor": COLORS["bg_card"],
                "border": f"2px solid {COLORS['secondary']}",
                "borderRadius": "14px",
            })
        ], md=4),
    ], className="g-4 mb-4")
    
    zone_fig = go.Figure()
    
    zones = list(zone_compare.keys())
    t1_fg = [zone_compare[z][team1]["fg_pct"] for z in zones]
    t2_fg = [zone_compare[z][team2]["fg_pct"] for z in zones]
    
    zone_fig.add_trace(go.Bar(
        x=zones,
        y=[f * 100 for f in t1_fg],
        name=team1,
        marker_color=COLORS["primary"],
        marker_line=dict(color=COLORS["bg_card"], width=1),
        text=[f"{f:.1%}" for f in t1_fg],
        textposition="auto",
    ))
    
    zone_fig.add_trace(go.Bar(
        x=zones,
        y=[f * 100 for f in t2_fg],
        name=team2,
        marker_color=COLORS["secondary"],
        marker_line=dict(color=COLORS["bg_card"], width=1),
        text=[f"{f:.1%}" for f in t2_fg],
        textposition="auto",
    ))
    
    zone_fig.update_layout(
        title={
            "text": "各区域命中率对比",
            "font": {"color": COLORS["text_primary"]},
        },
        yaxis_title="命中率 (%)",
        yaxis=dict(
            range=[0, 80],
            titlefont=dict(color=COLORS["text_primary"]),
            tickfont=dict(color=COLORS["text_secondary"]),
            gridcolor=COLORS["border"],
        ),
        xaxis=dict(
            tickfont=dict(color=COLORS["text_secondary"]),
        ),
        barmode="group",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(font=dict(color=COLORS["text_secondary"])),
    )
    
    player_matchup_df = pd.DataFrame(player_matchup["player_matchups"])
    
    player_table = None
    if len(player_matchup_df) > 0:
        player_table = dash_table.DataTable(
            data=player_matchup_df.to_dict("records"),
            columns=[{"name": i, "id": i} for i in player_matchup_df.columns],
            style_table={"overflowX": "auto"},
            style_cell={
                "backgroundColor": COLORS["bg_card"],
                "color": COLORS["text_primary"],
                "textAlign": "center",
                "minWidth": "80px",
                "padding": "12px",
                "border": f"1px solid {COLORS['border']}",
            },
            style_header={
                "backgroundColor": COLORS["bg_secondary"],
                "color": COLORS["text_primary"],
                "fontWeight": "bold",
                "padding": "12px",
                "border": f"1px solid {COLORS['border']}",
            },
            style_data_conditional=[
                {
                    "if": {"row_index": "odd"},
                    "backgroundColor": COLORS["bg_secondary"],
                }
            ],
            page_size=10,
        )
    
    t1_players = t1_stats.get("top_players", [])
    t2_players = t2_stats.get("top_players", [])
    
    player_cards = dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H6(f"⭐ {team1} 核心球员", style={
                    "color": COLORS["primary"], 
                    "marginBottom": 0,
                    "fontWeight": "600",
                })),
                dbc.CardBody([
                    html.Ul([
                        html.Li([
                            html.Strong(f"{p['player']}"),
                            f" ({p['position']}) - PER: {p['per']:.1f}, TS%: {p['ts_pct']:.1%}",
                        ], style={"color": COLORS["text_secondary"], "marginBottom": SPACING["sm"]})
                        for p in t1_players[:3]
                    ], style={"paddingLeft": SPACING["lg"]}),
                ]),
            ], style={
                "backgroundColor": COLORS["bg_card"],
                "border": f"1px solid {COLORS['border']}",
                "borderRadius": "12px",
            })
        ], md=6),
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H6(f"⭐ {team2} 核心球员", style={
                    "color": COLORS["secondary"], 
                    "marginBottom": 0,
                    "fontWeight": "600",
                })),
                dbc.CardBody([
                    html.Ul([
                        html.Li([
                            html.Strong(f"{p['player']}"),
                            f" ({p['position']}) - PER: {p['per']:.1f}, TS%: {p['ts_pct']:.1%}",
                        ], style={"color": COLORS["text_secondary"], "marginBottom": SPACING["sm"]})
                        for p in t2_players[:3]
                    ], style={"paddingLeft": SPACING["lg"]}),
                ]),
            ], style={
                "backgroundColor": COLORS["bg_card"],
                "border": f"1px solid {COLORS['border']}",
                "borderRadius": "12px",
            })
        ], md=6),
    ], className="g-4")
    
    return html.Div([
        h2h_cards,
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader(html.H5("🎯 能力雷达图", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                    dbc.CardBody([
                        dcc.Graph(figure=fig_radar),
                    ]),
                ], style=CARD_STYLE),
            ], md=6),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader(html.H5("📊 区域投篮对比", style={"color": COLORS["text_primary"], "marginBottom": 0})),
                    dbc.CardBody([
                        dcc.Graph(figure=zone_fig),
                    ]),
                ], style=CARD_STYLE),
            ], md=6),
        ], className="g-4"),
        
        dbc.Card([
            dbc.CardHeader(html.H5("👤 球员对位分析", style={"color": COLORS["text_primary"], "marginBottom": 0})),
            dbc.CardBody([
                player_table if player_table else html.P("暂无球员数据", style={"color": COLORS["text_secondary"]}),
            ]),
        ], style=CARD_STYLE),
        
        player_cards,
    ])


if __name__ == "__main__":
    ensure_data_exists()
    app.run_server(debug=True, port=8050)