import pandas as pd
import random
from datetime import datetime, timedelta

# 正面评论模板
positive_templates = [
    "这个产品真的很棒，{adj}！",
    "今天{activity}，{adj}。",
    "{brand}的服务{adj}，很满意。",
    "终于{event}了，{adj}！",
    "{person}太{adj}了，支持！",
    "今天的{food}{adj}，推荐大家尝试。",
    "{movie}{adj}，看得很开心。",
    "{place}{adj}，下次还要来。",
    "新的{product}{adj}，性价比很高。",
    "{song}{adj}，单曲循环了。",
    "今天天气{adj}，适合{activity}。",
    "{service}{adj}，五星好评！",
    "这个{idea}{adj}，很有创意。",
    "{game}{adj}，玩得很尽兴。",
    "{book}{adj}，值得一读。",
    "这个{feature}{adj}，解决了我的问题。",
    "{event}{adj}，很有意义。",
    "{gift}{adj}，收到很开心。",
    "{app}{adj}，体验很好。",
    "{team}{adj}，表现出色！"
]

# 中性评论模板
neutral_templates = [
    "今天{activity}，一切正常。",
    "{brand}的服务{adj}，中规中矩。",
    "{event}了，没什么特别的感觉。",
    "{person}的表现{adj}，一般般。",
    "今天的{food}{adj}，没什么亮点。",
    "{movie}{adj}，没什么印象。",
    "{place}{adj}，和预期差不多。",
    "新的{product}{adj}，能用但不算好。",
    "{song}{adj}，听过就忘了。",
    "今天天气{adj}，不影响计划。",
    "{service}{adj}，基本满足需求。",
    "这个{idea}{adj}，没什么感觉。",
    "{game}{adj}，玩了但没上瘾。",
    "{book}{adj}，可读可不读。",
    "这个{feature}{adj}，可用但不常用。",
    "{event}{adj}，可有可无。",
    "{gift}{adj}，收了但没惊喜。",
    "{app}{adj}，能用但有缺陷。",
    "{team}{adj}，表现平平。",
    "{news}{adj}，没什么特别的。"
]

# 负面评论模板
negative_templates = [
    "这个产品真的很差，{adj}！",
    "今天{activity}，{adj}，很失望。",
    "{brand}的服务{adj}，太差劲了。",
    "终于{event}了，结果{adj}！",
    "{person}太{adj}了，很失望。",
    "今天的{food}{adj}，不推荐。",
    "{movie}{adj}，看得很无聊。",
    "{place}{adj}，下次不会来了。",
    "新的{product}{adj}，性价比很低。",
    "{song}{adj}，听了一遍就不想再听。",
    "今天天气{adj}，影响了计划。",
    "{service}{adj}，一星差评！",
    "这个{idea}{adj}，很糟糕。",
    "{game}{adj}，玩得很生气。",
    "{book}{adj}，不值得读。",
    "这个{feature}{adj}，没解决我的问题。",
    "{event}{adj}，浪费时间。",
    "{gift}{adj}，收到很不开心。",
    "{app}{adj}，体验很差。",
    "{team}{adj}，表现很差！"
]

# 词汇库
positive_adjectives = ["很棒", "很好", "太棒了", "很满意", "很喜欢", "很开心", "很精彩", "很出色", "很完美", "很赞", "很给力", "很精彩", "很惊艳", "很优秀", "很满意"]
neutral_adjectives = ["一般般", "中规中矩", "没什么特别", "普通", "平平", "一般", "平淡", "普通", "寻常", "一般化"]
negative_adjectives = ["很差", "很糟", "太差劲了", "很失望", "很糟糕", "很无聊", "很生气", "很失望", "很烂", "很糟", "很烦人", "很讨厌", "很糟糕", "很不爽", "很糟心"]

activities = ["去了公园", "看了电影", "吃了火锅", "逛了商场", "玩了游戏", "读了书", "听了音乐", "参加了聚会", "去了旅行", "做了运动", 
              "看了展览", "去了图书馆", "逛了超市", "参加了会议", "看了比赛", "去了健身房", "做了瑜伽", "学了新技能", "看了直播", "玩了桌游"]

brands = ["苹果", "华为", "小米", "三星", "索尼", "微软", "谷歌", "腾讯", "阿里", "京东", "美团", "拼多多", "网易", "百度", "字节跳动",
          "星巴克", "麦当劳", "肯德基", "必胜客", "海底捞"]

events = ["收到快递", "完成了项目", "通过了考试", "找到了工作", "升职了", "加薪了", "结婚了", "生了宝宝", "买了新房子", "买了新车",
          "毕业了", "退休了", "拿到了奖金", "获得了奖项", "认识了新朋友", "去了新地方", "尝试了新事物", "实现了目标", "完成了任务", "开始了新工作"]

persons = ["这个演员", "这位歌手", "这个运动员", "这位作家", "这个导演", "这位设计师", "这个主持人", "这位博主", "这个网红", "这位老师",
           "这个医生", "这位律师", "这个工程师", "这位艺术家", "这个政治家", "这位企业家", "这个科学家", "这位医生", "这个教练", "这位朋友"]

foods = ["火锅", "烧烤", "日料", "韩餐", "西餐", "中餐", "快餐", "甜点", "咖啡", "奶茶",
         "蛋糕", "冰淇淋", "披萨", "汉堡", "寿司", "拉面", "麻辣烫", "小龙虾", "海鲜", "烤肉"]

movies = ["这部电影", "这部电视剧", "这部纪录片", "这部动画片", "这部悬疑片", "这部动作片", "这部爱情片", "这部喜剧片", "这部科幻片", "这部恐怖片",
          "这部文艺片", "这部战争片", "这部历史片", "这部奇幻片", "这部冒险片", "这部犯罪片", "这部音乐片", "这部家庭片", "这部青春片", "这部古装剧"]

places = ["这个公园", "这个商场", "这个餐厅", "这个酒店", "这个景区", "这个博物馆", "这个图书馆", "这个体育馆", "这个音乐厅", "这个剧院",
          "这个咖啡馆", "这个书店", "这个健身房", "这个游泳池", "这个高尔夫球场", "这个滑雪场", "这个海滩", "这个岛屿", "这个小镇", "这个城市"]

products = ["手机", "电脑", "平板", "耳机", "手表", "相机", "电视", "冰箱", "洗衣机", "空调",
            "微波炉", "烤箱", "吸尘器", "扫地机器人", "智能音箱", "投影仪", "游戏机", "电子书", "充电宝", "路由器"]

songs = ["这首歌", "这张专辑", "这个乐队", "这位歌手", "这个组合", "这个单曲", "这个EP", "这个演唱会", "这个音乐节", "这个颁奖典礼",
         "这个经典老歌", "这个新歌", "这个流行歌", "这个摇滚歌", "这个民谣", "这个电子音乐", "这个嘻哈", "这个爵士", "这个古典", "这个轻音乐"]

services = ["快递服务", "外卖服务", "网约车服务", "酒店服务", "餐饮服务", "客服服务", "售后服", "物流服务", "支付服务", "充值服务",
            "订阅服务", "会员服务", "维修服务", "安装服务", "培训服务", "咨询服务", "设计服务", "开发服务", "测试服务", "运维服务"]

ideas = ["这个想法", "这个创意", "这个方案", "这个计划", "这个设计", "这个概念", "这个理念", "这个策略", "这个方法", "这个思路",
         "这个建议", "这个提议", "这个意见", "这个观点", "这个看法", "这个理论", "这个假设", "这个猜想", "这个推断", "这个结论"]

games = ["这个游戏", "这款手游", "这款网游", "这款单机游戏", "这款主机游戏", "这个网页游戏", "这个小游戏", "这个多人游戏", "这个竞技游戏", "这个休闲游戏",
         "这个角色扮演游戏", "这个策略游戏", "这个动作游戏", "这个冒险游戏", "这个模拟游戏", "这个养成游戏", "这个解谜游戏", "这个射击游戏", "这个赛车游戏", "这个体育游戏"]

books = ["这本书", "这部小说", "这本传记", "这本历史书", "这本科技书", "这本哲学书", "这本心理学书", "这本经济书", "这本管理书", "这本教育书",
         "这本艺术书", "这本文学书", "这本诗词", "这本散文", "这本随笔", "这本杂志", "这本期刊", "这本报纸", "这本工具书", "这本参考书"]

features = ["功能", "设计", "界面", "操作", "性能", "稳定性", "兼容性", "安全性", "速度", "容量",
            "质量", "价格", "性价比", "外观", "颜色", "材质", "手感", "重量", "尺寸", "包装"]

gifts = ["礼物", "礼品", "奖品", "纪念品", "赠品", "礼包", "礼盒", "礼卡", "礼券", "红包",
         "压岁钱", "生日礼物", "节日礼物", "结婚礼物", "宝宝礼物", "乔迁礼物", "升职礼物", "毕业礼物", "退休礼物", "慰问礼物"]

apps = ["这个APP", "这个应用", "这个软件", "这个程序", "这个工具", "这个平台", "这个系统", "这个网站", "这个小程序", "这个公众号",
        "这个社交软件", "这个购物软件", "这个支付软件", "这个导航软件", "这个娱乐软件", "这个学习软件", "这个办公软件", "这个设计软件", "这个开发工具", "这个游戏软件"]

teams = ["这个团队", "这个小组", "这个队伍", "这个部门", "这个公司", "这个组织", "这个机构", "这个俱乐部", "这个协会", "这个联盟",
         "这支球队", "这支乐队", "这个组合", "这个剧组", "这个代表团", "这个项目组", "这个研发组", "这个市场组", "这个销售组", "这个客服组"]

news = ["这个新闻", "这个消息", "这个事件", "这个报道", "这个资讯", "这个动态", "这个热点", "这个话题", "这个讨论", "这个争议",
        "这个公告", "这个声明", "这个通知", "这个预警", "这个警报", "这个提醒", "这个提示", "这个警告", "这个建议", "这个意见"]

# 用户数据
user_ids = [f"user_{i:05d}" for i in range(1, 1001)]
platforms = ["微博", "微信", "抖音", "快手", "B站", "小红书", "知乎", "豆瓣", "百度贴吧", "今日头条",
             "腾讯视频", "爱奇艺", "优酷", "芒果TV", "西瓜视频", "火山小视频", "美拍", "秒拍", "小咖秀", "映客"]

def generate_comment(sentiment):
    if sentiment == "positive":
        template = random.choice(positive_templates)
        adj = random.choice(positive_adjectives)
    elif sentiment == "neutral":
        template = random.choice(neutral_templates)
        adj = random.choice(neutral_adjectives)
    else:  # negative
        template = random.choice(negative_templates)
        adj = random.choice(negative_adjectives)
    
    # 填充模板中的占位符
    comment = template.format(
        adj=adj,
        activity=random.choice(activities),
        brand=random.choice(brands),
        event=random.choice(events),
        person=random.choice(persons),
        food=random.choice(foods),
        movie=random.choice(movies),
        place=random.choice(places),
        product=random.choice(products),
        song=random.choice(songs),
        service=random.choice(services),
        idea=random.choice(ideas),
        game=random.choice(games),
        book=random.choice(books),
        feature=random.choice(features),
        gift=random.choice(gifts),
        app=random.choice(apps),
        team=random.choice(teams),
        news=random.choice(news)
    )
    
    return comment

def generate_dataset(num_records=5000):
    # 生成数据
    data = []
    
    # 设置日期范围：过去一年
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 12, 31)
    
    # 情感分布：正面40%，中性30%，负面30%
    sentiments = ["positive"] * int(num_records * 0.4) + \
                 ["neutral"] * int(num_records * 0.3) + \
                 ["negative"] * int(num_records * 0.3)
    
    # 如果不是正好5000条，补充中性
    while len(sentiments) < num_records:
        sentiments.append("neutral")
    
    # 打乱顺序
    random.shuffle(sentiments)
    
    for i in range(num_records):
        # 生成日期
        delta_days = random.randint(0, (end_date - start_date).days)
        comment_date = start_date + timedelta(days=delta_days)
        
        # 生成时间
        hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        comment_time = datetime(comment_date.year, comment_date.month, comment_date.day, hour, minute, second)
        
        # 生成评论
        sentiment = sentiments[i]
        comment = generate_comment(sentiment)
        
        # 其他字段
        user_id = random.choice(user_ids)
        platform = random.choice(platforms)
        
        # 赞数（正面评论赞数较多，负面较少）
        if sentiment == "positive":
            likes = random.randint(10, 1000)
        elif sentiment == "negative":
            likes = random.randint(0, 100)
        else:
            likes = random.randint(5, 500)
        
        # 评论数
        comments_count = random.randint(0, likes // 2)
        
        # 转发数
        shares = random.randint(0, likes // 3)
        
        data.append({
            "评论ID": f"comment_{i+1:06d}",
            "用户ID": user_id,
            "评论内容": comment,
            "时间": comment_time.strftime("%Y-%m-%d %H:%M:%S"),
            "日期": comment_date.strftime("%Y-%m-%d"),
            "平台": platform,
            "点赞数": likes,
            "评论数": comments_count,
            "转发数": shares
        })
    
    # 转换为DataFrame
    df = pd.DataFrame(data)
    
    # 按时间排序
    df = df.sort_values(by="时间").reset_index(drop=True)
    
    return df

if __name__ == "__main__":
    print("正在生成模拟社交媒体评论数据集...")
    df = generate_dataset(6000)  # 生成6000条，确保至少5000条
    print(f"生成了 {len(df)} 条评论")
    
    # 保存到CSV
    output_file = "social_media_comments.csv"
    df.to_csv(output_file, index=False, encoding="utf-8-sig")
    print(f"数据集已保存到: {output_file}")
    
    # 显示基本信息
    print("\n数据集基本信息:")
    print(df.info())
    
    # 显示前5条
    print("\n前5条数据:")
    print(df.head())
    
    # 显示各平台分布
    print("\n平台分布:")
    print(df["平台"].value_counts())
