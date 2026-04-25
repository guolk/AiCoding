#!/usr/bin/env python3
"""
Git仓库健康检查工具
分析Git仓库的提交历史，生成详细的健康报告
"""

import argparse
import os
import sys
from git import InvalidGitRepositoryError

from git_analyzer import GitAnalyzer
from console_reporter import ConsoleReporter
from html_reporter import HTMLReporter


def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='Git仓库健康检查工具 - 分析Git仓库的提交历史和健康状况',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例用法:
  python main.py /path/to/repo                    # 分析仓库并输出终端报告
  python main.py /path/to/repo -o report.html     # 生成HTML报告
  python main.py /path/to/repo --console --html   # 同时输出终端和HTML报告
        '''
    )
    
    parser.add_argument(
        'repo_path',
        type=str,
        help='Git仓库的路径'
    )
    
    parser.add_argument(
        '-o', '--output',
        type=str,
        default=None,
        help='HTML报告输出文件路径（默认不生成HTML报告）'
    )
    
    parser.add_argument(
        '--console',
        action='store_true',
        default=True,
        help='输出终端彩色报告（默认启用）'
    )
    
    parser.add_argument(
        '--no-console',
        action='store_true',
        help='不输出终端报告'
    )
    
    parser.add_argument(
        '--html',
        action='store_true',
        help='生成HTML报告（需要配合 -o 参数指定输出路径）'
    )
    
    parser.add_argument(
        '--max-file-size',
        type=int,
        default=1,
        help='超大文件阈值（MB），默认为1MB'
    )
    
    parser.add_argument(
        '--target-branches',
        type=str,
        default='main,master,develop',
        help='需要检测的目标分支（逗号分隔），默认为 main,master,develop'
    )
    
    return parser.parse_args()


def validate_repo_path(repo_path: str) -> bool:
    """验证仓库路径是否有效"""
    if not os.path.exists(repo_path):
        print(f"错误: 路径 '{repo_path}' 不存在")
        return False
    
    if not os.path.isdir(repo_path):
        print(f"错误: '{repo_path}' 不是一个目录")
        return False
    
    # 检查是否是Git仓库
    git_dir = os.path.join(repo_path, '.git')
    if not os.path.exists(git_dir):
        print(f"错误: '{repo_path}' 不是一个有效的Git仓库")
        return False
    
    return True


def main():
    """主函数"""
    args = parse_arguments()
    
    # 验证仓库路径
    if not validate_repo_path(args.repo_path):
        sys.exit(1)
    
    print(f"正在分析Git仓库: {args.repo_path}")
    print("=" * 60)
    
    try:
        # 创建分析器
        analyzer = GitAnalyzer(args.repo_path)
        
        # 设置自定义参数
        analyzer.max_file_size = args.max_file_size * 1024 * 1024
        target_branches = [b.strip() for b in args.target_branches.split(',')]
        
        # 运行分析
        print("正在分析提交历史...")
        results = analyzer.run_full_analysis()
        
        # 输出终端报告
        if args.console and not args.no_console:
            console_reporter = ConsoleReporter()
            console_reporter.generate_report(results)
        
        # 生成HTML报告
        if args.html or args.output:
            if not args.output:
                # 如果没有指定输出路径，使用默认路径
                args.output = os.path.join(args.repo_path, 'git_health_report.html')
            
            print(f"\n正在生成HTML报告: {args.output}")
            html_reporter = HTMLReporter()
            html_reporter.generate_report(results, args.output)
        
        print("\n分析完成！")
        
    except InvalidGitRepositoryError:
        print(f"错误: '{args.repo_path}' 不是一个有效的Git仓库")
        sys.exit(1)
    except Exception as e:
        print(f"分析过程中发生错误: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
