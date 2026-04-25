from colorama import init, Fore, Style
from datetime import datetime
from typing import Dict, Any, List

# 初始化colorama
init(autoreset=True)


class ConsoleReporter:
    """终端彩色输出报告生成器"""
    
    def __init__(self):
        self.colors = {
            'header': Fore.CYAN + Style.BRIGHT,
            'section': Fore.GREEN + Style.BRIGHT,
            'highlight': Fore.YELLOW + Style.BRIGHT,
            'warning': Fore.MAGENTA + Style.BRIGHT,
            'error': Fore.RED + Style.BRIGHT,
            'success': Fore.GREEN,
            'info': Fore.WHITE,
            'dim': Fore.LIGHTBLACK_EX
        }
    
    def _print_header(self, title: str):
        """打印报告标题"""
        print("\n" + "=" * 80)
        print(f"{self.colors['header']}{title.center(78)}")
        print("=" * 80 + "\n")
    
    def _print_section(self, title: str):
        """打印部分标题"""
        print(f"\n{self.colors['section']}{title}")
        print(f"{self.colors['section']}{'-' * len(title)}")
    
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
    
    def generate_report(self, analysis_results: Dict[str, Any]):
        """生成终端报告"""
        self._print_header("Git 仓库健康检查报告")
        
        # 仓库摘要
        self._print_summary(analysis_results['summary'])
        
        # 提交频率趋势
        self._print_commit_frequency(analysis_results['commit_frequency'])
        
        # 贡献者活跃度排名
        self._print_contributor_activity(analysis_results['contributors'])
        
        # 平均文件改动量
        self._print_average_changes(analysis_results['average_changes'])
        
        # 最常修改的文件
        self._print_most_modified_files(analysis_results['most_modified_files'])
        
        # 不良实践检测
        self._print_bad_practices(
            analysis_results['large_files'],
            analysis_results['direct_commits']
        )
        
        print("\n" + "=" * 80)
        print(f"{self.colors['header']}{'报告生成完成'.center(78)}")
        print("=" * 80 + "\n")
    
    def _print_summary(self, summary: Dict[str, Any]):
        """打印仓库摘要"""
        self._print_section("1. 仓库摘要")
        
        print(f"{self.colors['info']}仓库路径: {self.colors['highlight']}{summary['repo_path']}")
        print(f"{self.colors['info']}总提交数: {self.colors['highlight']}{summary['total_commits']}")
        print(f"{self.colors['info']}首次提交: {self.colors['highlight']}{self._format_date(summary['first_commit'])}")
        print(f"{self.colors['info']}最近提交: {self.colors['highlight']}{self._format_date(summary['last_commit'])}")
        print(f"{self.colors['info']}活跃天数: {self.colors['highlight']}{summary['active_days']}")
        print(f"{self.colors['info']}分支数量: {self.colors['highlight']}{len(summary['branches'])}")
        print(f"{self.colors['info']}标签数量: {self.colors['highlight']}{len(summary['tags'])}")
    
    def _print_commit_frequency(self, commit_frequency: Dict[str, int]):
        """打印提交频率趋势"""
        self._print_section("2. 提交频率趋势（按周统计）")
        
        if not commit_frequency:
            print(f"{self.colors['dim']}暂无提交数据")
            return
        
        # 找出最大值用于缩放
        max_commits = max(commit_frequency.values()) if commit_frequency else 0
        
        print(f"\n{self.colors['info']}{'周次':<15} {'提交数':<10} {'分布'}")
        print(f"{self.colors['dim']}{'-' * 60}")
        
        # 只显示最近的20周数据，避免输出过长
        recent_weeks = list(commit_frequency.items())[-20:] if len(commit_frequency) > 20 else list(commit_frequency.items())
        
        for week, count in recent_weeks:
            bar_length = int((count / max_commits) * 30) if max_commits > 0 else 0
            bar = '█' * bar_length
            
            # 根据提交数量选择颜色
            if count >= 20:
                count_color = self.colors['success']
            elif count >= 10:
                count_color = self.colors['highlight']
            elif count >= 5:
                count_color = self.colors['info']
            else:
                count_color = self.colors['dim']
            
            print(f"{self.colors['info']}{week:<15} {count_color}{count:<10} {self.colors['dim']}{bar}")
        
        # 统计信息
        total_weeks = len(commit_frequency)
        total_commits = sum(commit_frequency.values())
        avg_per_week = total_commits / total_weeks if total_weeks > 0 else 0
        
        print(f"\n{self.colors['info']}总周数: {self.colors['highlight']}{total_weeks}")
        print(f"{self.colors['info']}总提交数: {self.colors['highlight']}{total_commits}")
        print(f"{self.colors['info']}平均每周提交: {self.colors['highlight']}{avg_per_week:.2f}")
    
    def _print_contributor_activity(self, contributors: List[Dict[str, Any]]):
        """打印贡献者活跃度排名"""
        self._print_section("3. 贡献者活跃度排名")
        
        if not contributors:
            print(f"{self.colors['dim']}暂无贡献者数据")
            return
        
        print(f"\n{self.colors['info']}{'排名':<6} {'贡献者':<35} {'提交数':<10} {'活跃周数':<10} {'活跃度':<10}")
        print(f"{self.colors['dim']}{'-' * 85}")
        
        for i, contributor in enumerate(contributors[:10], 1):
            # 根据排名选择颜色
            if i == 1:
                rank_color = self.colors['highlight']
                name_color = self.colors['highlight']
            elif i <= 3:
                rank_color = self.colors['success']
                name_color = self.colors['success']
            else:
                rank_color = self.colors['info']
                name_color = self.colors['info']
            
            # 截断长名称
            author = contributor['author']
            if len(author) > 33:
                author = author[:30] + "..."
            
            print(
                f"{rank_color}{i:<6} {name_color}{author:<35} "
                f"{self.colors['info']}{contributor['commits']:<10} "
                f"{contributor['active_weeks']:<10} {contributor['activity_score']:<10}"
            )
        
        print(f"\n{self.colors['info']}总贡献者数: {self.colors['highlight']}{len(contributors)}")
    
    def _print_average_changes(self, average_changes: float):
        """打印平均文件改动量"""
        self._print_section("4. 平均每次提交的文件改动量")
        
        if average_changes == 0:
            print(f"{self.colors['dim']}暂无提交数据")
            return
        
        # 评估改动量
        if average_changes >= 10:
            assessment = f"{self.colors['warning']}每次提交改动文件较多，建议拆分提交"
        elif average_changes >= 5:
            assessment = f"{self.colors['highlight']}每次提交改动文件适中"
        else:
            assessment = f"{self.colors['success']}每次提交改动文件较少，提交粒度良好"
        
        print(f"\n{self.colors['info']}平均每次提交改动文件数: {self.colors['highlight']}{average_changes:.2f}")
        print(f"{assessment}")
    
    def _print_most_modified_files(self, files: List[Dict[str, Any]]):
        """打印最常修改的文件"""
        self._print_section("5. 最常被修改的10个文件")
        
        if not files:
            print(f"{self.colors['dim']}暂无文件修改数据")
            return
        
        print(f"\n{self.colors['info']}{'排名':<6} {'文件路径':<50} {'修改次数':<12} {'新增行':<10} {'删除行':<10}")
        print(f"{self.colors['dim']}{'-' * 95}")
        
        for i, file_info in enumerate(files, 1):
            # 根据修改次数选择颜色
            if file_info['changes'] >= 50:
                color = self.colors['warning']
            elif file_info['changes'] >= 20:
                color = self.colors['highlight']
            else:
                color = self.colors['info']
            
            # 截断长路径
            file_path = file_info['file']
            if len(file_path) > 48:
                file_path = "..." + file_path[-45:]
            
            print(
                f"{self.colors['info']}{i:<6} {color}{file_path:<50} "
                f"{self.colors['info']}{file_info['changes']:<12} "
                f"{file_info['lines_added']:<10} {file_info['lines_deleted']:<10}"
            )
    
    def _print_bad_practices(self, large_files: List[Dict[str, Any]], 
                              direct_commits: List[Dict[str, Any]]):
        """打印不良实践检测结果"""
        self._print_section("6. 不良实践检测")
        
        # 超大文件检测
        print(f"\n{self.colors['section']}6.1 超大文件提交检测（超过1MB）")
        if large_files:
            print(f"{self.colors['error']}[警告] 检测到 {len(large_files)} 个超大文件提交！")
            print(f"\n{self.colors['info']}{'提交ID':<12} {'文件路径':<40} {'大小(MB)':<12} {'提交者':<25}")
            print(f"{self.colors['dim']}{'-' * 95}")
            
            for file_info in large_files[:10]:
                # 截断长路径
                file_path = file_info['file']
                if len(file_path) > 38:
                    file_path = "..." + file_path[-35:]
                
                # 截断长作者名
                author = file_info['author']
                if len(author) > 23:
                    author = author[:20] + "..."
                
                print(
                    f"{self.colors['error']}{file_info['commit']:<12} "
                    f"{self.colors['error']}{file_path:<40} "
                    f"{self.colors['warning']}{file_info['size_mb']:.2f} MB{'':<6} "
                    f"{self.colors['info']}{author:<25}"
                )
            
            if len(large_files) > 10:
                print(f"{self.colors['warning']}... 还有 {len(large_files) - 10} 个超大文件")
            
            print(f"\n{self.colors['warning']}建议：将大文件使用 Git LFS 管理，或从历史记录中移除")
        else:
            print(f"{self.colors['success']}[OK] 未检测到超大文件提交（超过1MB）")
        
        # 直接提交到主分支检测
        print(f"\n{self.colors['section']}6.2 直接提交到主分支检测")
        if direct_commits:
            print(f"{self.colors['error']}[警告] 检测到 {len(direct_commits)} 个直接提交到主分支的提交！")
            print(f"\n{self.colors['info']}{'提交ID':<12} {'分支':<10} {'提交者':<30} {'日期'}")
            print(f"{self.colors['dim']}{'-' * 85}")
            
            for commit_info in direct_commits[:10]:
                # 截断长作者名
                author = commit_info['author']
                if len(author) > 28:
                    author = author[:25] + "..."
                
                print(
                    f"{self.colors['error']}{commit_info['commit']:<12} "
                    f"{self.colors['warning']}{commit_info['branch']:<10} "
                    f"{self.colors['info']}{author:<30} "
                    f"{self._format_date(commit_info['date'])}"
                )
            
            if len(direct_commits) > 10:
                print(f"{self.colors['warning']}... 还有 {len(direct_commits) - 10} 个直接提交")
            
            print(f"\n{self.colors['warning']}建议：使用特性分支工作流，通过 Pull Request 合并到主分支")
        else:
            print(f"{self.colors['success']}[OK] 未检测到直接提交到主分支的提交")
        
        # 总体评分
        total_issues = len(large_files) + len(direct_commits)
        if total_issues == 0:
            health_status = f"{self.colors['success']}优秀"
        elif total_issues <= 5:
            health_status = f"{self.colors['highlight']}良好"
        elif total_issues <= 20:
            health_status = f"{self.colors['warning']}一般"
        else:
            health_status = f"{self.colors['error']}较差"
        
        print(f"\n{self.colors['section']}仓库健康状况评估: {health_status}")
