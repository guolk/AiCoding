from datetime import datetime
from typing import Dict, Any, List


class HTMLReporter:
    """HTML报告生成器"""
    
    def __init__(self):
        self.generation_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    def _format_date(self, date_obj) -> str:
        """格式化日期"""
        if date_obj is None:
            return "N/A"
        if isinstance(date_obj, datetime):
            return date_obj.strftime('%Y-%m-%d %H:%M:%S')
        return str(date_obj)
    
    def _format_size(self, size_bytes: int) -> str:
        """格式化文件大小"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.2f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
    
    def _get_health_color(self, total_issues: int) -> str:
        """根据问题数量获取健康状态颜色"""
        if total_issues == 0:
            return "#28a745"  # 绿色
        elif total_issues <= 5:
            return "#17a2b8"  # 青色
        elif total_issues <= 20:
            return "#ffc107"  # 黄色
        else:
            return "#dc3545"  # 红色
    
    def _get_health_text(self, total_issues: int) -> str:
        """根据问题数量获取健康状态文本"""
        if total_issues == 0:
            return "优秀"
        elif total_issues <= 5:
            return "良好"
        elif total_issues <= 20:
            return "一般"
        else:
            return "较差"
    
    def _get_health_icon(self, total_issues: int) -> str:
        """根据问题数量获取健康状态图标"""
        if total_issues == 0:
            return "✅"
        elif total_issues <= 5:
            return "ℹ️"
        elif total_issues <= 20:
            return "⚠️"
        else:
            return "❌"
    
    def _get_card_class(self, count: int, issue_type: str) -> str:
        """根据问题数量获取卡片CSS类"""
        if count == 0:
            return "success"
        elif count <= 5:
            return "warning"
        else:
            return "danger"
    
    def _get_count_color(self, count: int) -> str:
        """根据问题数量获取数字颜色"""
        if count == 0:
            return "#28a745"
        elif count <= 5:
            return "#ffc107"
        else:
            return "#dc3545"
    
    def _get_status_color(self, count: int) -> str:
        """根据问题数量获取状态颜色"""
        if count == 0:
            return "#28a745"
        elif count <= 5:
            return "#ffc107"
        else:
            return "#dc3545"
    
    def _get_status_text(self, count: int) -> str:
        """根据问题数量获取状态文本"""
        if count == 0:
            return "正常"
        elif count <= 5:
            return "轻微"
        else:
            return "严重"
    
    def _get_change_quality_color(self, average_changes: float) -> str:
        """根据平均改动量获取质量颜色"""
        if average_changes < 5:
            return "#28a745"
        elif average_changes < 10:
            return "#17a2b8"
        else:
            return "#ffc107"
    
    def _get_change_quality_text(self, average_changes: float) -> str:
        """根据平均改动量获取质量文本"""
        if average_changes < 5:
            return "优秀"
        elif average_changes < 10:
            return "良好"
        else:
            return "需改进"
    
    def generate_report(self, analysis_results: Dict[str, Any], output_path: str):
        """生成HTML报告"""
        summary = analysis_results['summary']
        commit_frequency = analysis_results['commit_frequency']
        contributors = analysis_results['contributors']
        average_changes = analysis_results['average_changes']
        most_modified_files = analysis_results['most_modified_files']
        large_files = analysis_results['large_files']
        direct_commits = analysis_results['direct_commits']
        
        # 计算健康状态
        total_issues = len(large_files) + len(direct_commits)
        health_color = self._get_health_color(total_issues)
        health_text = self._get_health_text(total_issues)
        
        # 生成提交频率图表数据
        chart_data = self._generate_chart_data(commit_frequency)
        
        html_content = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git 仓库健康检查报告</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        .header {{
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        
        .header p {{
            font-size: 1.1em;
            opacity: 0.9;
        }}
        
        .section {{
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }}
        
        .section h2 {{
            color: #2c3e50;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 25px;
            font-size: 1.5em;
        }}
        
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        
        .summary-item {{
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        
        .summary-item .label {{
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }}
        
        .summary-item .value {{
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
        }}
        
        .health-status {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            color: white;
            background-color: {health_color};
        }}
        
        .health-banner {{
            background: linear-gradient(135deg, {health_color} 0%, {health_color}dd 100%);
            color: white;
            padding: 40px 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            text-align: center;
        }}
        
        .health-banner h2 {{
            font-size: 2.5em;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }}
        
        .health-banner .health-score {{
            font-size: 4em;
            font-weight: bold;
            margin: 20px 0;
            text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        }}
        
        .health-details {{
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 25px;
            flex-wrap: wrap;
        }}
        
        .health-detail-item {{
            background: rgba(255, 255, 255, 0.2);
            padding: 15px 25px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }}
        
        .health-detail-item .label {{
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 5px;
        }}
        
        .health-detail-item .value {{
            font-size: 1.8em;
            font-weight: bold;
        }}
        
        .health-icon {{
            font-size: 3em;
            margin-bottom: 10px;
        }}
        
        .header-health {{
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 25px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 1.2em;
        }}
        
        .quick-issues {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        
        .issue-card {{
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border-left: 5px solid #667eea;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }}
        
        .issue-card:hover {{
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }}
        
        .issue-card.danger {{
            border-left-color: #dc3545;
        }}
        
        .issue-card.warning {{
            border-left-color: #ffc107;
        }}
        
        .issue-card.success {{
            border-left-color: #28a745;
        }}
        
        .issue-card h3 {{
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #2c3e50;
        }}
        
        .issue-card .issue-count {{
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }}
        
        .issue-card .issue-desc {{
            color: #666;
            font-size: 0.95em;
        }}
        
        .issue-card .issue-status {{
            display: inline-block;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.85em;
            font-weight: bold;
            margin-top: 10px;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }}
        
        table th, table td {{
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        
        table th {{
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }}
        
        table tr:hover {{
            background-color: #f8f9fa;
        }}
        
        .commit-chart {{
            margin-top: 20px;
            height: 300px;
            position: relative;
        }}
        
        .chart-bars {{
            display: flex;
            align-items: flex-end;
            height: 250px;
            border-left: 2px solid #ddd;
            border-bottom: 2px solid #ddd;
            padding: 0 20px;
            margin-top: 20px;
        }}
        
        .chart-bar {{
            flex: 1;
            margin: 0 2px;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 3px 3px 0 0;
            position: relative;
            transition: height 0.3s ease;
        }}
        
        .chart-bar:hover {{
            opacity: 0.8;
        }}
        
        .chart-bar .tooltip {{
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 0.8em;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
        }}
        
        .chart-bar:hover .tooltip {{
            opacity: 1;
        }}
        
        .alert {{
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
        }}
        
        .alert-success {{
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }}
        
        .alert-warning {{
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
        }}
        
        .alert-danger {{
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }}
        
        .alert-info {{
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }}
        
        .badge {{
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: bold;
        }}
        
        .badge-success {{
            background-color: #28a745;
            color: white;
        }}
        
        .badge-warning {{
            background-color: #ffc107;
            color: #212529;
        }}
        
        .badge-danger {{
            background-color: #dc3545;
            color: white;
        }}
        
        .badge-info {{
            background-color: #17a2b8;
            color: white;
        }}
        
        .footer {{
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #ddd;
            margin-top: 30px;
        }}
        
        @media (max-width: 768px) {{
            .summary-grid {{
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }}
            
            .header h1 {{
                font-size: 2em;
            }}
            
            table {{
                font-size: 0.9em;
            }}
            
            table th, table td {{
                padding: 8px 10px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Git 仓库健康检查报告</h1>
            <p>生成时间: {self.generation_time} | 仓库路径: {summary['repo_path']}</p>
            <div class="header-health">
                健康状态: <strong>{health_text}</strong>
            </div>
        </div>
        
        <!-- 健康状态横幅 -->
        <div class="health-banner">
            <div class="health-icon">{self._get_health_icon(total_issues)}</div>
            <h2>仓库健康状态</h2>
            <div class="health-score">{health_text}</div>
            <div class="health-details">
                <div class="health-detail-item">
                    <div class="label">总提交数</div>
                    <div class="value">{summary['total_commits']}</div>
                </div>
                <div class="health-detail-item">
                    <div class="label">贡献者数量</div>
                    <div class="value">{len(contributors)}</div>
                </div>
                <div class="health-detail-item">
                    <div class="label">活跃天数</div>
                    <div class="value">{summary['active_days']}</div>
                </div>
                <div class="health-detail-item">
                    <div class="label">检测到的问题</div>
                    <div class="value">{total_issues}</div>
                </div>
            </div>
        </div>
        
        <!-- 快速问题概览 -->
        <div class="quick-issues">
            <div class="issue-card {self._get_card_class(len(large_files), 'large')}">
                <h3>📁 超大文件提交</h3>
                <div class="issue-count" style="color: {self._get_count_color(len(large_files))};">{len(large_files)}</div>
                <div class="issue-desc">超过1MB的文件提交数量</div>
                <span class="issue-status" style="background: {self._get_status_color(len(large_files))}; color: white;">
                    {self._get_status_text(len(large_files))}
                </span>
            </div>
            <div class="issue-card {self._get_card_class(len(direct_commits), 'direct')}">
                <h3>🔀 直接提交到主分支</h3>
                <div class="issue-count" style="color: {self._get_count_color(len(direct_commits))};">{len(direct_commits)}</div>
                <div class="issue-desc">未通过PR直接提交到主分支的数量</div>
                <span class="issue-status" style="background: {self._get_status_color(len(direct_commits))}; color: white;">
                    {self._get_status_text(len(direct_commits))}
                </span>
            </div>
            <div class="issue-card success">
                <h3>📊 代码质量指标</h3>
                <div class="issue-count" style="color: #28a745;">{average_changes:.1f}</div>
                <div class="issue-desc">平均每次提交改动文件数</div>
                <span class="issue-status" style="background: {self._get_change_quality_color(average_changes)}; color: white;">
                    {self._get_change_quality_text(average_changes)}
                </span>
            </div>
        </div>
        
        <!-- 仓库摘要 -->
        <div class="section">
            <h2>1. 仓库摘要</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">总提交数</div>
                    <div class="value">{summary['total_commits']}</div>
                </div>
                <div class="summary-item">
                    <div class="label">活跃天数</div>
                    <div class="value">{summary['active_days']}</div>
                </div>
                <div class="summary-item">
                    <div class="label">分支数量</div>
                    <div class="value">{len(summary['branches'])}</div>
                </div>
                <div class="summary-item">
                    <div class="label">标签数量</div>
                    <div class="value">{len(summary['tags'])}</div>
                </div>
                <div class="summary-item">
                    <div class="label">贡献者数量</div>
                    <div class="value">{len(contributors)}</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                <p><strong>首次提交:</strong> {self._format_date(summary['first_commit'])}</p>
                <p><strong>最近提交:</strong> {self._format_date(summary['last_commit'])}</p>
                <p><strong>分支列表:</strong> {', '.join(summary['branches']) if summary['branches'] else 'N/A'}</p>
            </div>
        </div>
        
        <!-- 提交频率趋势 -->
        <div class="section">
            <h2>2. 提交频率趋势（按周统计）</h2>
            {self._generate_commit_frequency_html(commit_frequency)}
        </div>
        
        <!-- 贡献者活跃度排名 -->
        <div class="section">
            <h2>3. 贡献者活跃度排名</h2>
            {self._generate_contributors_html(contributors)}
        </div>
        
        <!-- 平均文件改动量 -->
        <div class="section">
            <h2>4. 平均每次提交的文件改动量</h2>
            {self._generate_average_changes_html(average_changes)}
        </div>
        
        <!-- 最常修改的文件 -->
        <div class="section">
            <h2>5. 最常被修改的10个文件</h2>
            {self._generate_most_modified_files_html(most_modified_files)}
        </div>
        
        <!-- 不良实践检测 -->
        <div class="section">
            <h2>6. 不良实践检测</h2>
            
            <h3 style="margin-top: 20px; color: #495057;">6.1 超大文件提交检测（超过1MB）</h3>
            {self._generate_large_files_html(large_files)}
            
            <h3 style="margin-top: 30px; color: #495057;">6.2 直接提交到主分支检测</h3>
            {self._generate_direct_commits_html(direct_commits)}
        </div>
        
        <div class="footer">
            <p>Git 仓库健康检查工具 | 报告生成时间: {self.generation_time}</p>
        </div>
    </div>
</body>
</html>
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"HTML报告已生成: {output_path}")
    
    def _generate_chart_data(self, commit_frequency: Dict[str, int]) -> str:
        """生成图表数据"""
        if not commit_frequency:
            return ""
        
        # 只显示最近的20周数据
        recent_weeks = list(commit_frequency.items())[-20:] if len(commit_frequency) > 20 else list(commit_frequency.items())
        max_commits = max(commit_frequency.values()) if commit_frequency else 0
        
        bars = []
        for week, count in recent_weeks:
            height_percent = (count / max_commits * 90) if max_commits > 0 else 0
            bars.append(f'''
                <div class="chart-bar" style="height: {height_percent}%;">
                    <div class="tooltip">{week}: {count} 次提交</div>
                </div>
            ''')
        
        return ''.join(bars)
    
    def _generate_commit_frequency_html(self, commit_frequency: Dict[str, int]) -> str:
        """生成提交频率HTML"""
        if not commit_frequency:
            return '<div class="alert alert-info">暂无提交数据</div>'
        
        chart_bars = self._generate_chart_data(commit_frequency)
        total_weeks = len(commit_frequency)
        total_commits = sum(commit_frequency.values())
        avg_per_week = total_commits / total_weeks if total_weeks > 0 else 0
        
        return f'''
            <div class="commit-chart">
                <div class="chart-bars">
                    {chart_bars}
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                <p><strong>总周数:</strong> {total_weeks}</p>
                <p><strong>总提交数:</strong> {total_commits}</p>
                <p><strong>平均每周提交:</strong> {avg_per_week:.2f}</p>
            </div>
        '''
    
    def _generate_contributors_html(self, contributors: List[Dict[str, Any]]) -> str:
        """生成贡献者HTML"""
        if not contributors:
            return '<div class="alert alert-info">暂无贡献者数据</div>'
        
        rows = []
        for i, contributor in enumerate(contributors[:10], 1):
            badge_class = 'badge-success' if i <= 3 else 'badge-info'
            rows.append(f'''
                <tr>
                    <td><span class="badge {badge_class}">{i}</span></td>
                    <td>{contributor['author']}</td>
                    <td>{contributor['commits']}</td>
                    <td>{contributor['active_weeks']}</td>
                    <td>{contributor['activity_score']}</td>
                </tr>
            ''')
        
        return f'''
            <table>
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>贡献者</th>
                        <th>提交数</th>
                        <th>活跃周数</th>
                        <th>活跃度</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows)}
                </tbody>
            </table>
            <p style="margin-top: 15px; color: #666;">总贡献者数: {len(contributors)}</p>
        '''
    
    def _generate_average_changes_html(self, average_changes: float) -> str:
        """生成平均改动量HTML"""
        if average_changes == 0:
            return '<div class="alert alert-info">暂无提交数据</div>'
        
        # 评估改动量
        if average_changes >= 10:
            alert_class = 'alert-warning'
            message = "每次提交改动文件较多，建议拆分提交"
        elif average_changes >= 5:
            alert_class = 'alert-info'
            message = "每次提交改动文件适中"
        else:
            alert_class = 'alert-success'
            message = "每次提交改动文件较少，提交粒度良好"
        
        return f'''
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">平均每次提交改动文件数</div>
                    <div class="value">{average_changes:.2f}</div>
                </div>
            </div>
            <div class="alert {alert_class}" style="margin-top: 20px;">
                <strong>评估:</strong> {message}
            </div>
        '''
    
    def _generate_most_modified_files_html(self, files: List[Dict[str, Any]]) -> str:
        """生成最常修改文件HTML"""
        if not files:
            return '<div class="alert alert-info">暂无文件修改数据</div>'
        
        rows = []
        for i, file_info in enumerate(files, 1):
            # 根据修改次数添加标记
            if file_info['changes'] >= 50:
                badge_class = 'badge-danger'
            elif file_info['changes'] >= 20:
                badge_class = 'badge-warning'
            else:
                badge_class = 'badge-info'
            
            rows.append(f'''
                <tr>
                    <td><span class="badge {badge_class}">{i}</span></td>
                    <td>{file_info['file']}</td>
                    <td>{file_info['changes']}</td>
                    <td>{file_info['lines_added']}</td>
                    <td>{file_info['lines_deleted']}</td>
                </tr>
            ''')
        
        return f'''
            <table>
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>文件路径</th>
                        <th>修改次数</th>
                        <th>新增行</th>
                        <th>删除行</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows)}
                </tbody>
            </table>
        '''
    
    def _generate_large_files_html(self, large_files: List[Dict[str, Any]]) -> str:
        """生成超大文件HTML"""
        if not large_files:
            return '<div class="alert alert-success"><strong>✅ 未检测到超大文件提交（超过1MB）</strong></div>'
        
        rows = []
        for file_info in large_files[:20]:
            rows.append(f'''
                <tr>
                    <td>{file_info['commit']}</td>
                    <td>{file_info['file']}</td>
                    <td><span class="badge badge-danger">{file_info['size_mb']:.2f} MB</span></td>
                    <td>{file_info['author']}</td>
                    <td>{self._format_date(file_info['date'])}</td>
                </tr>
            ''')
        
        more_text = f'<p style="margin-top: 15px; color: #666;">... 还有 {len(large_files) - 20} 个超大文件</p>' if len(large_files) > 20 else ''
        
        return f'''
            <div class="alert alert-danger">
                <strong>⚠️ 检测到 {len(large_files)} 个超大文件提交！</strong>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>提交ID</th>
                        <th>文件路径</th>
                        <th>大小</th>
                        <th>提交者</th>
                        <th>日期</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows)}
                </tbody>
            </table>
            {more_text}
            <div class="alert alert-warning" style="margin-top: 15px;">
                <strong>建议:</strong> 将大文件使用 Git LFS 管理，或从历史记录中移除
            </div>
        '''
    
    def _generate_direct_commits_html(self, direct_commits: List[Dict[str, Any]]) -> str:
        """生成直接提交HTML"""
        if not direct_commits:
            return '<div class="alert alert-success"><strong>✅ 未检测到直接提交到主分支的提交</strong></div>'
        
        rows = []
        for commit_info in direct_commits[:20]:
            rows.append(f'''
                <tr>
                    <td>{commit_info['commit']}</td>
                    <td><span class="badge badge-warning">{commit_info['branch']}</span></td>
                    <td>{commit_info['author']}</td>
                    <td>{self._format_date(commit_info['date'])}</td>
                    <td>{commit_info['message'][:50]}{'...' if len(commit_info['message']) > 50 else ''}</td>
                </tr>
            ''')
        
        more_text = f'<p style="margin-top: 15px; color: #666;">... 还有 {len(direct_commits) - 20} 个直接提交</p>' if len(direct_commits) > 20 else ''
        
        return f'''
            <div class="alert alert-danger">
                <strong>⚠️ 检测到 {len(direct_commits)} 个直接提交到主分支的提交！</strong>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>提交ID</th>
                        <th>分支</th>
                        <th>提交者</th>
                        <th>日期</th>
                        <th>提交信息</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows)}
                </tbody>
            </table>
            {more_text}
            <div class="alert alert-warning" style="margin-top: 15px;">
                <strong>建议:</strong> 使用特性分支工作流，通过 Pull Request 合并到主分支
            </div>
        '''
