from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta
import os
from copy import deepcopy

app = Flask(__name__)
CORS(app)

SECRET_KEY = "creator-toolbox-secret-key"

USERS = []
NEXT_USER_ID = 1

CALENDAR_ITEMS = []
TOPICS = []
COMPETITORS = []
SCRIPT_TEMPLATES = []
COVER_TEMPLATES = []
REVENUE_ITEMS = []
COOPERATIONS = []

NEXT_CALENDAR_ID = 100
NEXT_TOPIC_ID = 100
NEXT_COMPETITOR_ID = 100
NEXT_SCRIPT_ID = 100
NEXT_COVER_ID = 100
NEXT_REVENUE_ID = 100
NEXT_COOPERATION_ID = 100

def init_data():
    global CALENDAR_ITEMS, TOPICS, COMPETITORS, SCRIPT_TEMPLATES, COVER_TEMPLATES, REVENUE_ITEMS, COOPERATIONS
    
    CALENDAR_ITEMS = [
        {"id": 1, "title": "Python入门教程第5期", "description": "深入讲解Python编程基础", "platform": "bilibili", "topic": "编程教学", "content_type": "video", "publish_date": "2024-01-20", "publish_time": "19:00", "status": "production", "tags": ["Python", "教程"], "user_id": 1},
        {"id": 2, "title": "2024年AI工具推荐", "description": "年度最佳AI工具合集", "platform": "xiaohongshu", "topic": "科技", "content_type": "short_video", "publish_date": "2024-01-22", "publish_time": "20:00", "status": "planning", "tags": ["AI", "工具"], "user_id": 1},
        {"id": 3, "title": "我的年度总结vlog", "description": "2023年度回顾", "platform": "douyin", "topic": "生活", "content_type": "video", "publish_date": "2024-01-25", "publish_time": "21:00", "status": "idea", "tags": ["vlog", "总结"], "user_id": 1},
        {"id": 4, "title": "高效工作流分享", "description": "如何提升工作效率", "platform": "youtube", "topic": "效率", "content_type": "video", "publish_date": "2024-01-28", "publish_time": "18:00", "status": "idea", "tags": ["效率", "工作流"], "user_id": 1}
    ]
    
    TOPICS = [
        {"id": 1, "title": "AI工具实战：从零到一", "description": "教大家如何使用AI工具提升工作效率", "traffic_potential": 5, "production_difficulty": 3, "estimated_reach": 50000, "estimated_engagement": 8.5, "status": "pending", "priority": 1, "user_id": 1},
        {"id": 2, "title": "Python 3.12新特性解析", "description": "深入讲解Python最新版本的更新", "traffic_potential": 4, "production_difficulty": 2, "estimated_reach": 30000, "estimated_engagement": 7.2, "status": "approved", "priority": 1, "user_id": 1},
        {"id": 3, "title": "我的创业故事", "description": "分享创业过程中的心得体会", "traffic_potential": 3, "production_difficulty": 1, "estimated_reach": 20000, "estimated_engagement": 10.5, "status": "pending", "priority": 0, "user_id": 1},
        {"id": 4, "title": "程序员的一天vlog", "description": "记录程序员的日常工作生活", "traffic_potential": 4, "production_difficulty": 2, "estimated_reach": 35000, "estimated_engagement": 6.8, "status": "in_progress", "priority": 0, "user_id": 1},
        {"id": 5, "title": "高难度算法精讲", "description": "深入讲解常见算法题", "traffic_potential": 2, "production_difficulty": 5, "estimated_reach": 10000, "estimated_engagement": 4.5, "status": "pending", "priority": 0, "user_id": 1},
        {"id": 6, "title": "2024年必学技术", "description": "未来趋势预测", "traffic_potential": 5, "production_difficulty": 2, "estimated_reach": 80000, "estimated_engagement": 9.0, "status": "approved", "priority": 1, "user_id": 1}
    ]
    
    COMPETITORS = [
        {"id": 1, "name": "技术老王", "platform": "bilibili", "niche": "科技", "account_url": "https://bilibili.com/techlaowang", "description": "资深科技博主", "user_id": 1, "recent_data": {"follower_count": 256000, "avg_views": 45000, "avg_likes": 3500, "avg_comments": 280, "avg_shares": 150, "engagement_rate": 8.5, "posting_frequency": 2.5}},
        {"id": 2, "name": "编程小能手", "platform": "douyin", "niche": "编程教学", "account_url": "https://douyin.com/coding_master", "description": "Python教学达人", "user_id": 1, "recent_data": {"follower_count": 520000, "avg_views": 125000, "avg_likes": 8500, "avg_comments": 520, "avg_shares": 890, "engagement_rate": 7.2, "posting_frequency": 4.0}},
        {"id": 3, "name": "效率达人", "platform": "xiaohongshu", "niche": "效率工具", "account_url": "https://xiaohongshu.com/efficiency", "description": "职场效率专家", "user_id": 1, "recent_data": {"follower_count": 185000, "avg_views": 15000, "avg_likes": 2800, "avg_comments": 180, "avg_shares": 98, "engagement_rate": 19.8, "posting_frequency": 3.0}}
    ]
    
    SCRIPT_TEMPLATES = [
        {"id": 1, "name": "产品评测模板", "content_type": "video", "platform": "bilibili", "opening": "大家好，今天来测评一下{topic}...", "main_content": "首先看外观设计...\n\n然后看功能表现...\n\n最后总结优缺点...", "closing": "以上就是今天的测评内容", "call_to_action": "喜欢的话记得点赞关注！", "duration_estimate": 600, "user_id": 1},
        {"id": 2, "name": "教程类模板", "content_type": "video", "platform": "bilibili", "opening": "今天教大家{topic}的正确做法...", "main_content": "第一步：准备工作\n\n第二步：核心操作\n\n第三步：注意事项", "closing": "学会了吗？动手试试吧！", "call_to_action": "有问题评论区留言", "duration_estimate": 480, "user_id": 1},
        {"id": 3, "name": "生活vlog模板", "content_type": "short_video", "platform": "douyin", "opening": "Hi，今天带大家看看{topic}...", "main_content": "记录一下日常...", "closing": "这就是今天的分享", "call_to_action": "点赞收藏不迷路", "duration_estimate": 60, "user_id": 1}
    ]
    
    COVER_TEMPLATES = [
        {"id": 1, "name": "简约白底蓝调", "platform": "bilibili", "width": 1280, "height": 720, "background_color": "#ffffff", "text_color": "#1a1a1a", "accent_color": "#1890ff", "font_family": "sans-serif", "layout": "center", "user_id": 1},
        {"id": 2, "name": "深色科技风", "platform": "douyin", "width": 1080, "height": 1920, "background_color": "#1a1a2e", "text_color": "#ffffff", "accent_color": "#00d4ff", "font_family": "sans-serif", "layout": "center", "user_id": 1},
        {"id": 3, "name": "活力橙渐变", "platform": "xiaohongshu", "width": 1242, "height": 1660, "background_color": "#fff7e6", "text_color": "#595959", "accent_color": "#fa8c16", "font_family": "sans-serif", "layout": "center", "user_id": 1}
    ]
    
    REVENUE_ITEMS = [
        {"id": 1, "platform": "bilibili", "revenue_type": "ad", "amount": 2500.00, "currency": "CNY", "record_date": "2024-01-01", "description": "B站广告分成", "is_recurring": True, "user_id": 1},
        {"id": 2, "platform": "douyin", "revenue_type": "cooperation", "amount": 5000.00, "currency": "CNY", "record_date": "2024-01-05", "description": "品牌合作推广", "is_recurring": False, "user_id": 1},
        {"id": 3, "platform": "xiaohongshu", "revenue_type": "tip", "amount": 350.50, "currency": "CNY", "record_date": "2024-01-10", "description": "粉丝打赏", "is_recurring": False, "user_id": 1},
        {"id": 4, "platform": "youtube", "revenue_type": "ad", "amount": 1200.00, "currency": "CNY", "record_date": "2024-01-15", "description": "YouTube广告收益", "is_recurring": True, "user_id": 1},
        {"id": 5, "platform": "bilibili", "revenue_type": "paid_content", "amount": 1500.00, "currency": "CNY", "record_date": "2024-01-12", "description": "付费专栏", "is_recurring": False, "user_id": 1}
    ]
    
    COOPERATIONS = [
        {"id": 1, "client_name": "某科技公司", "client_contact": "张经理 138xxxx", "project_name": "产品推广视频", "platform": "bilibili", "content_type": "video", "follower_count": 50000, "engagement_rate": 6.5, "quoted_price": 8000.00, "agreed_price": 7500.00, "status": "in_progress", "start_date": "2024-01-10", "end_date": "2024-01-25", "description": "产品功能介绍视频", "user_id": 1},
        {"id": 2, "client_name": "电商品牌", "client_contact": "李总", "project_name": "直播带货", "platform": "douyin", "content_type": "live", "follower_count": 80000, "engagement_rate": 4.2, "quoted_price": 15000.00, "agreed_price": 0, "status": "negotiating", "description": "年货节直播带货合作", "user_id": 1},
        {"id": 3, "client_name": "教育机构", "client_contact": "王老师", "project_name": "课程合作", "platform": "bilibili", "content_type": "video", "follower_count": 50000, "engagement_rate": 6.5, "quoted_price": 25000.00, "agreed_price": 22000.00, "status": "completed", "start_date": "2024-01-01", "end_date": "2024-01-08", "description": "Python课程系列视频", "user_id": 1}
    ]
    
    global NEXT_CALENDAR_ID, NEXT_TOPIC_ID, NEXT_COMPETITOR_ID
    global NEXT_SCRIPT_ID, NEXT_COVER_ID, NEXT_REVENUE_ID, NEXT_COOPERATION_ID
    
    NEXT_CALENDAR_ID = 5
    NEXT_TOPIC_ID = 7
    NEXT_COMPETITOR_ID = 4
    NEXT_SCRIPT_ID = 4
    NEXT_COVER_ID = 4
    NEXT_REVENUE_ID = 6
    NEXT_COOPERATION_ID = 4

init_data()

@app.route("/")
def root():
    return jsonify({
        "message": "自媒体创作者运营工具箱",
        "version": "1.0.0",
        "endpoints": [
            "POST /api/auth/register - 用户注册",
            "POST /api/auth/login - 用户登录",
            "GET /api/auth/me - 获取当前用户",
            "GET /api/data-aggregation/dashboard - 数据看板",
            "GET /api/content-planning/calendar - 内容日历",
            "GET /api/content-planning/topics - 选题库",
            "GET /api/content-planning/competitors - 竞品监控",
            "GET /api/content-production/script-templates - 脚本模板",
            "GET /api/content-production/cover-templates - 封面模板",
            "GET /api/monetization/revenue - 收益记录",
            "GET /api/analytics/content-attribution - 内容归因",
            "GET /api/analytics/follower-insights - 粉丝画像"
        ]
    })

@app.route("/api/auth/register", methods=["POST"])
def register():
    global NEXT_USER_ID
    data = request.json
    for user in USERS:
        if user["username"] == data.get("username"):
            return jsonify({"detail": "用户名已存在"}), 400
    new_user = {
        "id": NEXT_USER_ID,
        "username": data.get("username"),
        "email": data.get("email"),
        "full_name": data.get("full_name"),
        "hashed_password": data.get("password")
    }
    USERS.append(new_user)
    NEXT_USER_ID += 1
    return jsonify({
        "id": new_user["id"],
        "username": new_user["username"],
        "email": new_user["email"],
        "full_name": new_user["full_name"],
        "is_active": True
    })

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.form or request.json
    username = data.get("username") if isinstance(data, dict) else data.get("username")
    password = data.get("password") if isinstance(data, dict) else data.get("password")
    
    if not isinstance(data, dict):
        username = request.form.get("username")
        password = request.form.get("password")
    
    if not USERS:
        token = "demo-token-" + str(random.randint(1000, 9999))
        return jsonify({"access_token": token, "token_type": "bearer"})
    
    for user in USERS:
        if user["username"] == username:
            token = "token-" + str(user["id"]) + "-" + str(random.randint(1000, 9999))
            return jsonify({"access_token": token, "token_type": "bearer"})
    
    return jsonify({"detail": "用户名或密码错误"}), 401

@app.route("/api/auth/me")
def get_me():
    return jsonify({
        "id": 1,
        "username": "demo",
        "email": "demo@example.com",
        "full_name": "演示用户",
        "is_active": True
    })

@app.route("/api/data-aggregation/dashboard")
def get_dashboard():
    return jsonify({
        "total_followers": 125800,
        "total_views": 2580000,
        "total_revenue": 15680.50,
        "active_platforms": 4,
        "content_published_this_week": 12,
        "upcoming_content": 5,
        "platform_comparison": [
            {"platform": "bilibili", "total_followers": 52000, "follower_growth_rate": 3.5, "avg_views": 15000, "avg_engagement": 6.8, "total_revenue": 8500, "content_count": 156},
            {"platform": "douyin", "total_followers": 38500, "follower_growth_rate": 5.2, "avg_views": 45000, "avg_engagement": 4.2, "total_revenue": 3200, "content_count": 89},
            {"platform": "xiaohongshu", "total_followers": 21300, "follower_growth_rate": 4.1, "avg_views": 8500, "avg_engagement": 8.5, "total_revenue": 2800, "content_count": 45},
            {"platform": "youtube", "total_followers": 14000, "follower_growth_rate": 2.8, "avg_views": 12000, "avg_engagement": 5.5, "total_revenue": 1180.50, "content_count": 32}
        ],
        "recent_performance": [
            {"title": "2024年技术趋势分析", "platform": "bilibili", "publish_date": "2024-01-15", "views": 25600, "engagement_rate": 7.2},
            {"title": "Python入门教程", "platform": "douyin", "publish_date": "2024-01-14", "views": 89000, "engagement_rate": 5.1},
            {"title": "好物推荐：我的桌面setup", "platform": "xiaohongshu", "publish_date": "2024-01-13", "views": 12500, "engagement_rate": 9.8},
            {"title": "如何高效学习编程", "platform": "bilibili", "publish_date": "2024-01-12", "views": 18900, "engagement_rate": 6.5}
        ]
    })

@app.route("/api/content-planning/calendar", methods=["GET", "POST"])
def calendar():
    global NEXT_CALENDAR_ID
    if request.method == "POST":
        data = request.json
        new_item = {"id": NEXT_CALENDAR_ID, "user_id": 1, **data}
        CALENDAR_ITEMS.append(new_item)
        NEXT_CALENDAR_ID += 1
        return jsonify(new_item)
    return jsonify(CALENDAR_ITEMS)

@app.route("/api/content-planning/calendar/<int:item_id>", methods=["PUT", "DELETE"])
def calendar_item(item_id):
    global CALENDAR_ITEMS
    item = next((i for i in CALENDAR_ITEMS if i["id"] == item_id), None)
    
    if not item:
        return jsonify({"detail": "未找到该记录"}), 404
    
    if request.method == "PUT":
        data = request.json
        item.update(data)
        return jsonify(item)
    
    CALENDAR_ITEMS = [i for i in CALENDAR_ITEMS if i["id"] != item_id]
    return jsonify({"message": "删除成功"})

@app.route("/api/content-planning/topics", methods=["GET", "POST"])
def topics():
    global NEXT_TOPIC_ID
    if request.method == "POST":
        data = request.json
        new_item = {"id": NEXT_TOPIC_ID, "user_id": 1, **data}
        TOPICS.append(new_item)
        NEXT_TOPIC_ID += 1
        return jsonify(new_item)
    return jsonify(TOPICS)

@app.route("/api/content-planning/topics/<int:topic_id>", methods=["PUT", "DELETE"])
def topic_item(topic_id):
    global TOPICS
    item = next((i for i in TOPICS if i["id"] == topic_id), None)
    
    if not item:
        return jsonify({"detail": "未找到该记录"}), 404
    
    if request.method == "PUT":
        data = request.json
        item.update(data)
        return jsonify(item)
    
    TOPICS = [i for i in TOPICS if i["id"] != topic_id]
    return jsonify({"message": "删除成功"})

@app.route("/api/content-planning/competitors", methods=["GET", "POST"])
def competitors():
    global NEXT_COMPETITOR_ID
    if request.method == "POST":
        data = request.json
        new_item = {"id": NEXT_COMPETITOR_ID, "user_id": 1, **data}
        COMPETITORS.append(new_item)
        NEXT_COMPETITOR_ID += 1
        return jsonify(new_item)
    return jsonify(COMPETITORS)

@app.route("/api/content-planning/competitors/<int:comp_id>", methods=["PUT", "DELETE"])
def competitor_item(comp_id):
    global COMPETITORS
    item = next((i for i in COMPETITORS if i["id"] == comp_id), None)
    
    if not item:
        return jsonify({"detail": "未找到该记录"}), 404
    
    if request.method == "PUT":
        data = request.json
        item.update(data)
        return jsonify(item)
    
    COMPETITORS = [i for i in COMPETITORS if i["id"] != comp_id]
    return jsonify({"message": "删除成功"})

@app.route("/api/content-planning/competitors/<int:comp_id>/data", methods=["GET", "POST"])
def competitor_data(comp_id):
    return jsonify([
        {"id": 1, "competitor_id": comp_id, "follower_count": 256000, "avg_views": 45000, "avg_likes": 3500, "avg_comments": 280, "avg_shares": 150, "engagement_rate": 8.5, "record_date": datetime.now().isoformat()}
    ])

@app.route("/api/data-aggregation/accounts", methods=["GET", "POST"])
def accounts():
    if request.method == "POST":
        data = request.json
        return jsonify({"id": random.randint(100, 999), "user_id": 1, **data})
    return jsonify([
        {"id": 1, "platform": "bilibili", "account_name": "技术小哥", "account_url": "https://bilibili.com/techbro", "is_active": True, "user_id": 1},
        {"id": 2, "platform": "douyin", "account_name": "技术小哥Official", "account_url": "https://douyin.com/techbro", "is_active": True, "user_id": 1},
        {"id": 3, "platform": "xiaohongshu", "account_name": "技术小哥", "account_url": "https://xiaohongshu.com/techbro", "is_active": True, "user_id": 1},
        {"id": 4, "platform": "youtube", "account_name": "TechBrother", "account_url": "https://youtube.com/@techbrother", "is_active": True, "user_id": 1}
    ])

@app.route("/api/data-aggregation/accounts/<int:acc_id>", methods=["PUT", "DELETE"])
def account_item(acc_id):
    if request.method == "PUT":
        data = request.json
        return jsonify({"id": acc_id, "user_id": 1, **data})
    return jsonify({"message": "删除成功"})

@app.route("/api/data-aggregation/analytics/<int:acc_id>")
def analytics(acc_id):
    data = []
    for i in range(30):
        base_date = datetime.now() - timedelta(days=29-i)
        data.append({
            "date": base_date.strftime("%Y-%m-%d"),
            "follower_count": 50000 + i*500 + random.randint(0, 500),
            "follower_gain": random.randint(200, 800),
            "follower_loss": random.randint(50, 200),
            "total_views": random.randint(5000, 50000),
            "total_likes": random.randint(500, 5000),
            "total_comments": random.randint(100, 1000),
            "total_shares": random.randint(50, 500),
            "avg_engagement_rate": round(random.uniform(3, 10), 2),
            "content_published": random.randint(0, 2),
            "revenue": round(random.uniform(50, 500), 2)
        })
    return jsonify(data)

@app.route("/api/data-aggregation/analytics/<int:acc_id>", methods=["POST"])
def add_analytics(acc_id):
    data = request.json
    return jsonify({"id": random.randint(100, 999), "account_id": acc_id, **data})

@app.route("/api/data-aggregation/content-performance")
def content_performance():
    return jsonify([
        {"id": 1, "platform": "bilibili", "publish_date": "2024-01-15", "views": 25600, "likes": 2100, "comments": 185, "shares": 120, "engagement_rate": 7.2, "completion_rate": 68.5, "watch_time": 18500},
        {"id": 2, "platform": "douyin", "publish_date": "2024-01-14", "views": 89000, "likes": 5200, "comments": 420, "shares": 890, "engagement_rate": 5.1, "completion_rate": 42.3, "watch_time": 8500},
        {"id": 3, "platform": "xiaohongshu", "publish_date": "2024-01-13", "views": 12500, "likes": 1850, "comments": 256, "shares": 98, "engagement_rate": 9.8, "completion_rate": 85.2, "watch_time": 25000},
        {"id": 4, "platform": "bilibili", "publish_date": "2024-01-12", "views": 18900, "likes": 1560, "comments": 132, "shares": 85, "engagement_rate": 6.5, "completion_rate": 72.1, "watch_time": 15200}
    ])

@app.route("/api/data-aggregation/content-performance", methods=["POST"])
def add_performance():
    data = request.json
    return jsonify({"id": random.randint(100, 999), **data})

@app.route("/api/content-production/script-templates", methods=["GET", "POST"])
def script_templates():
    global NEXT_SCRIPT_ID
    if request.method == "POST":
        data = request.json
        new_item = {"id": NEXT_SCRIPT_ID, "user_id": 1, **data}
        SCRIPT_TEMPLATES.append(new_item)
        NEXT_SCRIPT_ID += 1
        return jsonify(new_item)
    return jsonify(SCRIPT_TEMPLATES)

@app.route("/api/content-production/script-templates/<int:tid>", methods=["PUT", "DELETE"])
def script_template_item(tid):
    global SCRIPT_TEMPLATES
    item = next((i for i in SCRIPT_TEMPLATES if i["id"] == tid), None)
    
    if not item:
        return jsonify({"detail": "未找到该记录"}), 404
    
    if request.method == "PUT":
        data = request.json
        item.update(data)
        return jsonify(item)
    
    SCRIPT_TEMPLATES = [i for i in SCRIPT_TEMPLATES if i["id"] != tid]
    return jsonify({"message": "删除成功"})

@app.route("/api/content-production/script-templates/<int:tid>/generate")
def generate_script(tid):
    topic = request.args.get("topic", "测试主题")
    return jsonify({
        "template_name": "动态生成脚本",
        "topic": topic,
        "opening": f"大家好，今天我们来聊一聊{topic}...",
        "main_content": f"首先，让我们了解一下{topic}的基本概念。\n\n接下来，我将详细讲解{topic}的核心要点。\n\n最后，总结一下{topic}的关键内容。",
        "closing": f"以上就是关于{topic}的全部内容，希望对你有所帮助。",
        "call_to_action": "如果喜欢这个视频，记得点赞关注收藏哦！有什么问题欢迎在评论区留言。",
        "full_script": f"大家好，今天我们来聊一聊{topic}...\n\n首先，让我们了解一下{topic}的基本概念。\n\n接下来，我将详细讲解{topic}的核心要点。\n\n最后，总结一下{topic}的关键内容。\n\n以上就是关于{topic}的全部内容，希望对你有所帮助。\n\n如果喜欢这个视频，记得点赞关注收藏哦！有什么问题欢迎在评论区留言。"
    })

@app.route("/api/content-production/keyword-research/analyze")
def analyze_keyword():
    keyword = request.args.get("keyword", "Python")
    platform = request.args.get("platform", "bilibili")
    search_volume = random.randint(1000, 100000)
    competition = "high" if search_volume > 50000 else "medium" if search_volume > 10000 else "low"
    trends = ["rising", "stable", "declining"]
    trend = random.choice(trends)
    
    return jsonify({
        "keyword": keyword,
        "platform": platform,
        "search_volume": search_volume,
        "competition_level": competition,
        "trend": trend,
        "related_keywords": [f"{keyword}教程", f"{keyword}是什么", f"{keyword}推荐", f"2024{keyword}", f"最新{keyword}"],
        "top_content": [
            {"title": f"关于{keyword}的热门内容1", "views": random.randint(10000, 1000000), "likes": random.randint(1000, 50000), "engagement_rate": round(random.uniform(2, 15), 2)},
            {"title": f"关于{keyword}的热门内容2", "views": random.randint(10000, 1000000), "likes": random.randint(1000, 50000), "engagement_rate": round(random.uniform(2, 15), 2)},
            {"title": f"关于{keyword}的热门内容3", "views": random.randint(10000, 1000000), "likes": random.randint(1000, 50000), "engagement_rate": round(random.uniform(2, 15), 2)}
        ],
        "recommendation": f"关键词'{keyword}'在{platform}平台搜索量{search_volume}，竞争{competition}，趋势{trend}"
    })

@app.route("/api/content-production/keyword-research")
def keyword_history():
    return jsonify([])

@app.route("/api/content-production/cover-templates", methods=["GET", "POST"])
def cover_templates():
    global NEXT_COVER_ID
    if request.method == "POST":
        data = request.json
        new_item = {"id": NEXT_COVER_ID, "user_id": 1, **data}
        COVER_TEMPLATES.append(new_item)
        NEXT_COVER_ID += 1
        return jsonify(new_item)
    return jsonify(COVER_TEMPLATES)

@app.route("/api/content-production/cover-templates/<int:tid>", methods=["PUT", "DELETE"])
def cover_template_item(tid):
    global COVER_TEMPLATES
    item = next((i for i in COVER_TEMPLATES if i["id"] == tid), None)
    
    if not item:
        return jsonify({"detail": "未找到该记录"}), 404
    
    if request.method == "PUT":
        data = request.json
        item.update(data)
        return jsonify(item)
    
    COVER_TEMPLATES = [i for i in COVER_TEMPLATES if i["id"] != tid]
    return jsonify({"message": "删除成功"})

@app.route("/api/content-production/cover-templates/<int:tid>/generate")
def generate_cover(tid):
    title = request.args.get("title", "测试标题")
    subtitle = request.args.get("subtitle", "")
    return jsonify({
        "template_name": "动态预览",
        "platform": "通用",
        "dimensions": "1280×720",
        "title": title,
        "subtitle": subtitle or "",
        "styles": {"background_color": "#ffffff", "text_color": "#000000", "accent_color": "#1890ff"}
    })

@app.route("/api/content-production/platform-sizes")
def platform_sizes():
    return jsonify({
        "bilibili": {"video_cover": {"width": 1920, "height": 1080, "name": "视频封面 16:9"}, "vertical_video": {"width": 1080, "height": 1920, "name": "竖版视频 9:16"}},
        "douyin": {"video_cover": {"width": 1080, "height": 1920, "name": "视频封面 9:16"}},
        "xiaohongshu": {"note_image": {"width": 1242, "height": 1660, "name": "笔记图片 3:4"}, "square_image": {"width": 1080, "height": 1080, "name": "方形图片 1:1"}},
        "wechat": {"article_cover": {"width": 900, "height": 383, "name": "文章封面 2.35:1"}},
        "youtube": {"video_cover": {"width": 1280, "height": 720, "name": "视频封面 16:9"}}
    })

@app.route("/api/monetization/revenue", methods=["GET", "POST"])
def revenue():
    global NEXT_REVENUE_ID
    if request.method == "POST":
        data = request.json
        new_item = {"id": NEXT_REVENUE_ID, "user_id": 1, **data}
        REVENUE_ITEMS.append(new_item)
        NEXT_REVENUE_ID += 1
        return jsonify(new_item)
    return jsonify(REVENUE_ITEMS)

@app.route("/api/monetization/revenue/<int:rid>", methods=["PUT", "DELETE"])
def revenue_item(rid):
    global REVENUE_ITEMS
    item = next((i for i in REVENUE_ITEMS if i["id"] == rid), None)
    
    if not item:
        return jsonify({"detail": "未找到该记录"}), 404
    
    if request.method == "PUT":
        data = request.json
        item.update(data)
        return jsonify(item)
    
    REVENUE_ITEMS = [i for i in REVENUE_ITEMS if i["id"] != rid]
    return jsonify({"message": "删除成功"})

@app.route("/api/monetization/revenue/summary")
def revenue_summary():
    period = request.args.get("period", "month")
    return jsonify({
        "period": period,
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "total_amount": 15680.50,
        "by_platform": {"bilibili": 8500.00, "douyin": 3200.00, "xiaohongshu": 2800.00, "youtube": 1180.50},
        "by_type": {"ad": 5500.00, "cooperation": 8000.00, "tip": 680.50, "paid_content": 1500.00},
        "record_count": 12
    })

@app.route("/api/monetization/revenue/price-recommendation", methods=["POST"])
def price_recommendation():
    platform = request.args.get("platform") or request.json.get("platform", "bilibili")
    content_type = request.args.get("content_type") or request.json.get("content_type", "video")
    follower_count = int(request.args.get("follower_count") or request.json.get("follower_count", 100000))
    engagement_rate = float(request.args.get("engagement_rate") or request.json.get("engagement_rate", 5.0))
    
    base_price = follower_count * 0.05
    multiplier = 1.2 if engagement_rate > 5 else 1.0
    suggested = base_price * multiplier
    
    return jsonify({
        "platform": platform,
        "content_type": content_type,
        "follower_count": follower_count,
        "engagement_rate": engagement_rate,
        "suggested_price": round(suggested, 2),
        "min_price": round(suggested * 0.7, 2),
        "max_price": round(suggested * 1.5, 2),
        "breakdown": {
            "base_price_per_1000": 0.05,
            "engagement_multiplier": multiplier,
            "tier_factor": 1.0,
            "formula": "%d × 0.05 × %.1f" % (follower_count, multiplier)
        }
    })

@app.route("/api/monetization/cooperations", methods=["GET", "POST"])
def cooperations():
    global NEXT_COOPERATION_ID
    if request.method == "POST":
        data = request.json
        new_item = {"id": NEXT_COOPERATION_ID, "user_id": 1, **data}
        COOPERATIONS.append(new_item)
        NEXT_COOPERATION_ID += 1
        return jsonify(new_item)
    return jsonify(COOPERATIONS)

@app.route("/api/monetization/cooperations/<int:cid>", methods=["PUT", "DELETE"])
def cooperation_item(cid):
    global COOPERATIONS
    item = next((i for i in COOPERATIONS if i["id"] == cid), None)
    
    if not item:
        return jsonify({"detail": "未找到该记录"}), 404
    
    if request.method == "PUT":
        data = request.json
        item.update(data)
        return jsonify(item)
    
    COOPERATIONS = [i for i in COOPERATIONS if i["id"] != cid]
    return jsonify({"message": "删除成功"})

@app.route("/api/analytics/content-attribution")
def content_attribution():
    return jsonify({
        "period": {"start_date": "2024-01-01", "end_date": "2024-01-15"},
        "by_topic": [
            {"category": "编程教学", "avg_views": 35000, "avg_engagement": 8.5, "sample_size": 12, "total_views": 420000},
            {"category": "科技测评", "avg_views": 28000, "avg_engagement": 7.2, "sample_size": 8, "total_views": 224000},
            {"category": "生活vlog", "avg_views": 15000, "avg_engagement": 10.5, "sample_size": 5, "total_views": 75000},
            {"category": "效率工具", "avg_views": 22000, "avg_engagement": 6.8, "sample_size": 6, "total_views": 132000}
        ],
        "by_content_type": [
            {"category": "video", "avg_views": 32000, "avg_engagement": 7.5, "sample_size": 20, "total_views": 640000},
            {"category": "short_video", "avg_views": 85000, "avg_engagement": 4.2, "sample_size": 10, "total_views": 850000}
        ],
        "by_publish_time": [
            {"category": "19:00-20:00", "avg_views": 45000, "avg_engagement": 9.2, "sample_size": 8, "total_views": 360000},
            {"category": "20:00-21:00", "avg_views": 38000, "avg_engagement": 8.5, "sample_size": 10, "total_views": 380000},
            {"category": "21:00-22:00", "avg_views": 32000, "avg_engagement": 7.8, "sample_size": 7, "total_views": 224000}
        ],
        "by_publish_day": [
            {"category": "Saturday", "avg_views": 52000, "avg_engagement": 9.5, "sample_size": 6, "total_views": 312000},
            {"category": "Sunday", "avg_views": 48000, "avg_engagement": 8.8, "sample_size": 5, "total_views": 240000},
            {"category": "Friday", "avg_views": 35000, "avg_engagement": 7.5, "sample_size": 8, "total_views": 280000}
        ],
        "recommendations": [
            {"type": "topic", "message": "建议增加'生活vlog'主题的内容，平均互动率10.5%", "priority": "high"},
            {"type": "publish_time", "message": "最佳发布时间段：19:00-20:00", "priority": "medium"},
            {"type": "publish_day", "message": "最佳发布日期：周六", "priority": "medium"}
        ]
    })

@app.route("/api/analytics/follower-insights")
def follower_insights():
    return jsonify({
        "accounts": [
            {
                "platform": "bilibili",
                "account_name": "技术小哥",
                "simulated_data": {
                    "age_distribution": {"18-24": 35, "25-34": 40, "35-44": 15, "45-54": 7, "55+": 3},
                    "gender_distribution": {"male": 65, "female": 35},
                    "location_distribution": {"北京": 18, "上海": 15, "广东": 12, "江苏": 10, "浙江": 8, "其他": 37},
                    "interest_tags": ["科技", "编程", "效率工具", "数码"],
                    "active_hours": [19, 20, 21, 22, 23]
                }
            },
            {
                "platform": "douyin",
                "account_name": "技术小哥Official",
                "simulated_data": {
                    "age_distribution": {"18-24": 45, "25-34": 35, "35-44": 12, "45-54": 5, "55+": 3},
                    "gender_distribution": {"male": 55, "female": 45},
                    "location_distribution": {"广东": 20, "上海": 12, "北京": 10, "四川": 8, "浙江": 7, "其他": 43},
                    "interest_tags": ["生活", "科技", "搞笑", "学习"],
                    "active_hours": [12, 18, 19, 20, 21]
                }
            },
            {
                "platform": "xiaohongshu",
                "account_name": "技术小哥",
                "simulated_data": {
                    "age_distribution": {"18-24": 40, "25-34": 38, "35-44": 15, "45-54": 5, "55+": 2},
                    "gender_distribution": {"male": 45, "female": 55},
                    "location_distribution": {"上海": 18, "北京": 15, "广东": 12, "浙江": 10, "江苏": 8, "其他": 37},
                    "interest_tags": ["效率工具", "生活方式", "职场", "学习"],
                    "active_hours": [10, 12, 20, 21, 22]
                }
            }
        ],
        "cross_platform_analysis": {
            "has_multiple_platforms": True,
            "platforms": ["bilibili", "douyin", "xiaohongshu"],
            "overlap_analysis": {
                "estimated_overlap_percent": 28,
                "interpretation": "估计约28%的粉丝在多个平台关注你",
                "recommendation": "建议为不同平台定制差异化内容，最大化触达"
            },
            "comparison": {}
        }
    })

if __name__ == "__main__":
    print("="*50)
    print("自媒体创作者运营工具箱 API 服务")
    print("="*50)
    print("后端服务已启动！")
    print("访问地址: http://localhost:8000")
    print("API文档: http://localhost:8000/")
    print("="*50)
    app.run(host="0.0.0.0", port=8000, debug=False)
