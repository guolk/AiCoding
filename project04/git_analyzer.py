import os
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, List, Any, Optional
from git import Repo, Commit


class GitAnalyzer:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.repo = Repo(repo_path)
        self.commits = list(self.repo.iter_commits())
        self.max_file_size = 1024 * 1024  # 1MB in bytes

    def get_commit_frequency_by_week(self) -> Dict[str, int]:
        """按周统计提交频率"""
        weekly_stats = defaultdict(int)
        
        for commit in self.commits:
            commit_date = datetime.fromtimestamp(commit.committed_date)
            week_key = commit_date.strftime('%Y-%U')
            weekly_stats[week_key] += 1
        
        return dict(sorted(weekly_stats.items()))

    def get_contributor_activity(self) -> List[Dict[str, Any]]:
        """获取贡献者活跃度排名"""
        contributor_stats = defaultdict(lambda: {
            'commits': 0,
            'first_commit': None,
            'last_commit': None,
            'files_changed': 0
        })
        
        for commit in self.commits:
            author = commit.author.name
            email = commit.author.email
            key = f"{author} <{email}>"
            
            stats = contributor_stats[key]
            stats['commits'] += 1
            stats['files_changed'] += len(commit.stats.files)
            
            commit_date = datetime.fromtimestamp(commit.committed_date)
            if stats['first_commit'] is None or commit_date < stats['first_commit']:
                stats['first_commit'] = commit_date
            if stats['last_commit'] is None or commit_date > stats['last_commit']:
                stats['last_commit'] = commit_date
        
        # 计算活跃度：提交数 + 活跃周数
        result = []
        for key, stats in contributor_stats.items():
            active_weeks = 0
            if stats['first_commit'] and stats['last_commit']:
                delta = stats['last_commit'] - stats['first_commit']
                active_weeks = max(1, delta.days // 7 + 1)
            
            result.append({
                'author': key,
                'commits': stats['commits'],
                'active_weeks': active_weeks,
                'files_changed': stats['files_changed'],
                'activity_score': stats['commits'] + (active_weeks * 2)
            })
        
        return sorted(result, key=lambda x: x['activity_score'], reverse=True)

    def get_average_changes_per_commit(self) -> float:
        """计算平均每次提交的文件改动量"""
        if not self.commits:
            return 0.0
        
        total_files_changed = sum(len(commit.stats.files) for commit in self.commits)
        return total_files_changed / len(self.commits)

    def get_most_modified_files(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """获取最常被修改的N个文件"""
        file_stats = defaultdict(lambda: {
            'changes': 0,
            'lines_added': 0,
            'lines_deleted': 0
        })
        
        for commit in self.commits:
            for file_path, stats in commit.stats.files.items():
                file_stats[file_path]['changes'] += 1
                file_stats[file_path]['lines_added'] += stats.get('insertions', 0)
                file_stats[file_path]['lines_deleted'] += stats.get('deletions', 0)
        
        result = [
            {'file': file_path, **stats}
            for file_path, stats in file_stats.items()
        ]
        
        return sorted(result, key=lambda x: x['changes'], reverse=True)[:top_n]

    def detect_large_files(self) -> List[Dict[str, Any]]:
        """检测超大文件提交（超过1MB）"""
        large_files = []
        
        for commit in self.commits:
            for diff in commit.diff(commit.parents[0] if commit.parents else None, create_patch=False):
                if diff.a_blob:
                    file_path = diff.a_path
                    file_size = diff.a_blob.size
                    
                    if file_size > self.max_file_size:
                        large_files.append({
                            'commit': commit.hexsha[:7],
                            'file': file_path,
                            'size': file_size,
                            'size_mb': file_size / (1024 * 1024),
                            'author': f"{commit.author.name} <{commit.author.email}>",
                            'date': datetime.fromtimestamp(commit.committed_date)
                        })
        
        return large_files

    def detect_direct_branch_commits(self, target_branches: List[str] = None) -> List[Dict[str, Any]]:
        """检测直接提交到主分支的提交"""
        if target_branches is None:
            target_branches = ['main', 'master', 'develop']
        
        direct_commits = []
        
        # 获取所有目标分支的引用
        branch_refs = []
        for branch_name in target_branches:
            try:
                branch_refs.append(self.repo.heads[branch_name])
            except (IndexError, ValueError):
                continue
        
        if not branch_refs:
            return direct_commits
        
        # 分析提交是否有合并提交的痕迹
        for commit in self.commits:
            # 检查提交是否在目标分支上
            commit_branches = set()
            for ref in self.repo.refs:
                if self.repo.is_ancestor(commit, ref.commit):
                    commit_branches.add(ref.name)
            
            on_target_branch = any(
                f"refs/heads/{branch}" in commit_branches or branch in commit_branches
                for branch in target_branches
            )
            
            if on_target_branch:
                # 直接提交的特征：
                # 1. 只有一个父提交（或没有父提交，即初始提交）
                # 2. 提交信息中不包含典型的合并提交信息
                is_merge_commit = len(commit.parents) > 1
                is_pull_request_merge = any(
                    keyword in commit.message.lower()
                    for keyword in ['merge pull request', 'merge branch', 'auto-merge']
                )
                
                if not is_merge_commit and not is_pull_request_merge:
                    # 检查是否有特征分支引用指向此提交的父提交
                    # 简化逻辑：假设非合并提交到主分支即为直接提交
                    direct_commits.append({
                        'commit': commit.hexsha[:7],
                        'message': commit.message.strip(),
                        'author': f"{commit.author.name} <{commit.author.email}>",
                        'date': datetime.fromtimestamp(commit.committed_date),
                        'branch': ', '.join([b for b in target_branches if b in commit_branches or f"refs/heads/{b}" in commit_branches])
                    })
        
        return direct_commits

    def get_repository_summary(self) -> Dict[str, Any]:
        """获取仓库摘要信息"""
        total_commits = len(self.commits)
        first_commit = None
        last_commit = None
        
        if self.commits:
            first_commit = datetime.fromtimestamp(self.commits[-1].committed_date)
            last_commit = datetime.fromtimestamp(self.commits[0].committed_date)
        
        return {
            'repo_path': self.repo_path,
            'total_commits': total_commits,
            'first_commit': first_commit,
            'last_commit': last_commit,
            'active_days': (last_commit - first_commit).days + 1 if first_commit and last_commit else 0,
            'branches': [branch.name for branch in self.repo.branches],
            'tags': [tag.name for tag in self.repo.tags]
        }

    def run_full_analysis(self) -> Dict[str, Any]:
        """运行完整分析"""
        return {
            'summary': self.get_repository_summary(),
            'commit_frequency': self.get_commit_frequency_by_week(),
            'contributors': self.get_contributor_activity(),
            'average_changes': self.get_average_changes_per_commit(),
            'most_modified_files': self.get_most_modified_files(),
            'large_files': self.detect_large_files(),
            'direct_commits': self.detect_direct_branch_commits()
        }
