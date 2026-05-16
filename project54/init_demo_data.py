#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
会议系统演示数据初始化脚本
运行此脚本可生成模拟的测试数据用于系统演示
"""

import sys
from datetime import datetime, timedelta
from app import app, db, Participant, Meeting, MeetingParticipant, Topic, Decision, Todo


def init_demo_data():
    """初始化演示数据"""
    
    print("=" * 50)
    print("开始生成会议系统演示数据...")
    print("=" * 50)
    
    with app.app_context():
        # 清空现有数据
        print("\n[1/6] 清空现有数据...")
        db.drop_all()
        db.create_all()
        print("✓ 数据库已重置")
        
        # 创建参与者
        print("\n[2/6] 创建参与者...")
        participants_data = [
            {"name": "张伟", "email": "zhangwei@company.com"},
            {"name": "李娜", "email": "lina@company.com"},
            {"name": "王强", "email": "wangqiang@company.com"},
            {"name": "刘芳", "email": "liufang@company.com"},
            {"name": "陈明", "email": "chenming@company.com"},
            {"name": "赵丽", "email": "zhaoli@company.com"},
            {"name": "孙磊", "email": "sunlei@company.com"},
            {"name": "周静", "email": "zhoujing@company.com"},
        ]
        
        participants = []
        for p_data in participants_data:
            p = Participant(name=p_data["name"], email=p_data["email"])
            db.session.add(p)
            participants.append(p)
        db.session.commit()
        print(f"✓ 已创建 {len(participants)} 个参与者")
        
        # 创建会议
        print("\n[3/6] 创建会议...")
        meetings_data = [
            {
                "title": "产品需求评审会议",
                "days_ago": 7,
                "agenda": "1. 讨论Q2产品需求\n2. 确定开发优先级\n3. 分配开发任务",
                "participant_indices": [0, 1, 2, 3],
            },
            {
                "title": "项目进度周会",
                "days_ago": 5,
                "agenda": "1. 各项目组汇报进度\n2. 讨论遇到的问题\n3. 下周工作计划",
                "participant_indices": [0, 1, 2, 4, 5],
            },
            {
                "title": "技术方案选型会议",
                "days_ago": 3,
                "agenda": "1. 分析各技术方案优缺点\n2. 性能对比测试结果\n3. 确定最终技术栈",
                "participant_indices": [2, 3, 4, 6],
            },
            {
                "title": "团队团建活动讨论",
                "days_ago": 1,
                "agenda": "1. 讨论团建活动形式\n2. 确定时间和地点\n3. 预算审批",
                "participant_indices": [0, 1, 2, 3, 4, 5, 6, 7],
            },
        ]
        
        meetings = []
        for m_data in meetings_data:
            meeting_date = datetime.now() - timedelta(days=m_data["days_ago"])
            meeting = Meeting(
                title=m_data["title"],
                date=meeting_date,
                agenda=m_data["agenda"],
            )
            db.session.add(meeting)
            
            # 添加参会人员
            for idx in m_data["participant_indices"]:
                mp = MeetingParticipant(participant_id=participants[idx].id)
                meeting.participants.append(mp)
            
            meetings.append(meeting)
        db.session.commit()
        print(f"✓ 已创建 {len(meetings)} 个会议")
        
        # 为会议添加议题
        print("\n[4/6] 创建会议议题...")
        topics_data = [
            {
                "meeting_idx": 0,
                "topics": [
                    {"title": "用户管理模块需求", "content": "讨论用户注册、登录、权限管理等功能需求"},
                    {"title": "数据可视化模块", "content": "讨论报表展示、图表类型等需求"},
                    {"title": "移动端适配需求", "content": "讨论H5和小程序的适配方案"},
                ]
            },
            {
                "meeting_idx": 1,
                "topics": [
                    {"title": "后端开发进度", "content": "API接口开发完成80%，预计本周可联调"},
                    {"title": "前端开发进度", "content": "页面开发完成，待接口联调"},
                    {"title": "测试工作计划", "content": "测试用例已编写，等待开发提测"},
                ]
            },
            {
                "meeting_idx": 2,
                "topics": [
                    {"title": "数据库选型", "content": "MySQL vs PostgreSQL对比分析"},
                    {"title": "缓存方案", "content": "Redis vs Memcached性能对比"},
                ]
            },
            {
                "meeting_idx": 3,
                "topics": [
                    {"title": "活动形式", "content": "户外拓展 vs 室内轰趴 vs 聚餐"},
                    {"title": "预算方案", "content": "人均200元标准，总计约1600元"},
                ]
            },
        ]
        
        all_topics = []
        for data in topics_data:
            meeting = meetings[data["meeting_idx"]]
            for i, topic_data in enumerate(data["topics"]):
                topic = Topic(
                    meeting_id=meeting.id,
                    title=topic_data["title"],
                    content=topic_data["content"],
                    order=i
                )
                db.session.add(topic)
                all_topics.append(topic)
        db.session.commit()
        print(f"✓ 已创建 {len(all_topics)} 个议题")
        
        # 添加决策
        print("\n[5/6] 创建决策记录...")
        decisions_data = [
            {"meeting_idx": 0, "content": "用户管理模块优先级最高，下周开始开发"},
            {"meeting_idx": 0, "content": "数据可视化使用ECharts组件库"},
            {"meeting_idx": 0, "content": "移动端优先开发H5版本"},
            {"meeting_idx": 1, "content": "下周三开始前后端联调"},
            {"meeting_idx": 1, "content": "测试团队下周五开始第一轮测试"},
            {"meeting_idx": 2, "content": "数据库选用PostgreSQL"},
            {"meeting_idx": 2, "content": "使用Redis作为缓存方案"},
            {"meeting_idx": 3, "content": "团建活动定为户外拓展+聚餐"},
            {"meeting_idx": 3, "content": "时间定在下周六，地点在近郊拓展基地"},
        ]
        
        for d_data in decisions_data:
            meeting = meetings[d_data["meeting_idx"]]
            decision = Decision(
                meeting_id=meeting.id,
                content=d_data["content"]
            )
            db.session.add(decision)
        db.session.commit()
        print(f"✓ 已创建 {len(decisions_data)} 条决策记录")
        
        # 添加待办事项
        print("\n[6/6] 创建待办事项...")
        todos_data = [
            {
                "meeting_idx": 0,
                "todos": [
                    {"content": "完成用户管理模块接口文档", "assignee_idx": 2, "days_due": 3, "completed": True},
                    {"content": "设计数据库表结构", "assignee_idx": 3, "days_due": 5, "completed": True},
                    {"content": "整理可视化组件需求清单", "assignee_idx": 1, "days_due": 7, "completed": False},
                ]
            },
            {
                "meeting_idx": 1,
                "todos": [
                    {"content": "完成剩余20%接口开发", "assignee_idx": 2, "days_due": 2, "completed": True},
                    {"content": "准备联调测试环境", "assignee_idx": 3, "days_due": 4, "completed": False},
                    {"content": "补充测试用例边缘场景", "assignee_idx": 4, "days_due": 5, "completed": False},
                ]
            },
            {
                "meeting_idx": 2,
                "todos": [
                    {"content": "搭建PostgreSQL数据库环境", "assignee_idx": 3, "days_due": 2, "completed": True},
                    {"content": "Redis集群方案设计", "assignee_idx": 6, "days_due": 7, "completed": False},
                ]
            },
            {
                "meeting_idx": 3,
                "todos": [
                    {"content": "联系拓展公司确定方案", "assignee_idx": 7, "days_due": 3, "completed": False},
                    {"content": "统计参加人员名单", "assignee_idx": 5, "days_due": 2, "completed": True},
                    {"content": "申请团建预算", "assignee_idx": 0, "days_due": 5, "completed": False},
                ]
            },
        ]
        
        todo_count = 0
        for data in todos_data:
            meeting = meetings[data["meeting_idx"]]
            for todo_data in data["todos"]:
                due_date = datetime.now() + timedelta(days=todo_data["days_due"])
                todo = Todo(
                    meeting_id=meeting.id,
                    content=todo_data["content"],
                    assignee_id=participants[todo_data["assignee_idx"]].id,
                    due_date=due_date,
                    status="completed" if todo_data["completed"] else "pending"
                )
                if todo_data["completed"]:
                    todo.completed_at = datetime.now() - timedelta(days=1)
                db.session.add(todo)
                todo_count += 1
        db.session.commit()
        print(f"✓ 已创建 {todo_count} 条待办事项")
        
        print("\n" + "=" * 50)
        print("✅ 演示数据生成完成！")
        print("=" * 50)
        print(f"\n数据统计：")
        print(f"  - 参与者: {len(participants)} 人")
        print(f"  - 会议: {len(meetings)} 个")
        print(f"  - 议题: {len(all_topics)} 个")
        print(f"  - 决策: {len(decisions_data)} 条")
        print(f"  - 待办: {todo_count} 条")
        print("\n现在可以启动系统查看演示数据了！")
        print("运行命令: python app.py")


if __name__ == "__main__":
    init_demo_data()
