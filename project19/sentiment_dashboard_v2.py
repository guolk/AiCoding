import pandas as pd
import numpy as np
import jieba
import re
from collections import Counter, defaultdict
from snownlp import SnowNLP
from pyecharts import options as opts
from pyecharts.charts import (
    Pie, Line, Bar, WordCloud, Graph, Page, Grid,
    Scatter, Funnel, Gauge, Calendar, Radar, Boxplot
)
from pyecharts.globals import ThemeType
from pyecharts.components import Table
import warnings
import random
from datetime import datetime, timedelta
warnings.filterwarnings("ignore")


# 停用词列表
stopwords = set([
    "的", "了", "是", "在", "我", "有", "和", "就", "不", "人", "都",
    "一", "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会",
    "着", "没有", "看", "好", "自己", "这", "那", "她", "他", "它", "们",
    "这个", "那个", "什么", "怎么", "为什么", "哪", "哪里", "谁", "多少",
    "几", "啊", "吧", "呢", "吗", "呀", "哦", "嗯", "哈", "哎", "唉",
    "但是", "如果", "因为", "所以", "虽然", "而且", "或者", "还是",
    "不是", "就是", "只有", "只要", "不管", "尽管", "即使", "除非",
    "除了", "不但", "与其", "不如", "首先", "其次", "最后", "总之",
    "因此", "于是", "然而", "不过", "其实", "实际上", "事实上",
    "现在", "今天", "昨天", "明天", "今年", "去年", "明年",
    "这里", "那里", "这边", "那边", "上面", "下面", "里面", "外面",
    "前面", "后面", "左边", "右边", "中间", "一些", "一点", "许多",
    "很多", "很少", "几乎", "大概", "大约", "可能", "也许", "或者",
    "以及", "等", "等等", "之", "以", "而", "于", "其", "为", "与",
    "则", "乃", "且", "或", "如", "若", "此", "即", "该", "本",
    "各", "每", "所有", "全部", "部分", "有些", "有的", "其他",
    "其余", "另外", "此外", "还有", "及", "跟", "同", "向", "往",
    "朝", "从", "自", "由", "对", "对于", "关于", "至于", "由于",
    "为了", "以便", "以免", "免得", "省得", "把", "被", "让", "给",
    "叫", "使", "令", "派", "请", "要", "想", "打算", "计划",
    "准备", "考虑", "认为", "以为", "觉得", "感到", "感觉", "知道",
    "明白", "了解", "清楚", "记得", "忘记", "想起", "回忆",
    "来", "去", "走", "跑", "跳", "飞", "爬", "游", "吃", "喝",
    "睡", "醒", "坐", "站", "躺", "跪", "看", "听", "闻", "尝",
    "摸", "想", "思考", "说", "讲", "问", "答", "告诉", "解释",
    "说明", "描述", "做", "干", "办", "搞", "弄", "进行", "开展",
    "执行", "开始", "结束", "停止", "继续", "完成", "可以", "能",
    "会", "应该", "必须", "需要", "愿意", "肯", "敢", "希望",
    "期望", "盼望", "喜欢", "爱", "讨厌", "恨", "怕", "担心",
    "害怕", "高兴", "开心", "快乐", "愉快", "难过", "伤心",
    "痛苦", "生气", "愤怒", "着急", "紧张", "放松", "轻松",
    "坏", "不错", "很差", "一般", "普通", "美丽", "漂亮",
    "丑陋", "好看", "难听", "美味", "难吃", "大", "小", "高",
    "低", "长", "短", "宽", "窄", "多", "少", "快", "慢", "早",
    "晚", "新", "旧", "年轻", "年老", "古老", "现代", "传统",
    "时尚", "流行", "简单", "复杂", "容易", "困难", "方便",
    "麻烦", "舒适", "安全", "危险", "健康", "生病", "强壮",
    "虚弱", "聪明", "愚蠢", "勇敢", "胆小", "诚实", "虚伪",
    "善良", "邪恶", "伟大", "渺小", "重要", "不重要", "主要",
    "次要", "必要", "不必要", "必须", "不必", "正确", "错误",
    "对", "错", "是", "非", "真", "假", "真实", "虚假", "存在",
    "不存在", "有", "无", "没有", "这些", "那些", "这样", "那样",
    "这么", "那么", "怎样", "如何", "什么时候", "多久", "多远",
    "啦", "嘛", "哟", "啵", "嘞", "咯", "喽", "哈", "哇",
])


# 情感配色方案
COLORS = {
    "positive": "#52c41a",      # 绿色
    "negative": "#ff4d4f",      # 红色
    "neutral": "#1890ff",       # 蓝色
    "background": "#f5f7fa",
    "card": "#ffffff",
    "title": "#262626",
    "text": "#595959",
}

# 图表配色序列
CHART_COLORS = [
    "#52c41a", "#1890ff", "#ff4d4f", "#faad14", "#722ed1",
    "#eb2f96", "#13c2c2", "#fa8c16", "#2f54eb", "#a0d911",
    "#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1",
]


class EnhancedSentimentDashboard:
    def __init__(self, data_path="social_media_comments.csv"):
        self.data_path = data_path
        self.df = None
        self.positive_df = None
        self.negative_df = None
        self.neutral_df = None
        self.all_keywords = set()
        
    def load_and_process(self):
        print("=" * 70)
        print("🚀 社交媒体评论情感分析看板 V2.0")
        print("=" * 70)
        
        print("\n📂 正在加载数据...")
        self.df = pd.read_csv(self.data_path, encoding="utf-8-sig")
        print(f"   ✅ 加载了 {len(self.df)} 条数据")
        
        print("\n🔧 正在预处理数据...")
        self.df["时间"] = pd.to_datetime(self.df["时间"])
        self.df["日期"] = pd.to_datetime(self.df["日期"])
        self.df["日期_str"] = self.df["日期"].dt.strftime("%Y-%m-%d")
        self.df["月份"] = self.df["日期"].dt.strftime("%Y-%m")
        self.df["星期"] = self.df["日期"].dt.day_name()
        self.df["小时"] = self.df["时间"].dt.hour
        self.df["日期序号"] = (self.df["日期"] - self.df["日期"].min()).dt.days
        print("   ✅ 数据预处理完成")
        
        print("\n💭 正在进行情感分析...")
        def get_sentiment(text):
            try:
                s = SnowNLP(text)
                score = s.sentiments
                if score > 0.65:
                    return "正面"
                elif score < 0.35:
                    return "负面"
                else:
                    return "中性"
            except:
                return "中性"
        
        def get_score(text):
            try:
                return SnowNLP(text).sentiments
            except:
                return 0.5
        
        self.df["情感倾向"] = self.df["评论内容"].apply(get_sentiment)
        self.df["情感分数"] = self.df["评论内容"].apply(get_score)
        
        self.positive_df = self.df[self.df["情感倾向"] == "正面"].copy()
        self.negative_df = self.df[self.df["情感倾向"] == "负面"].copy()
        self.neutral_df = self.df[self.df["情感倾向"] == "中性"].copy()
        
        print(f"   ✅ 正面评论: {len(self.positive_df)} 条")
        print(f"   ✅ 中性评论: {len(self.neutral_df)} 条")
        print(f"   ✅ 负面评论: {len(self.negative_df)} 条")
        
        print("\n🔍 正在提取关键词...")
        self._extract_keywords()
        print("   ✅ 关键词提取完成")
        
        return self
    
    def _extract_keywords(self):
        all_words = []
        for comment in self.df["评论内容"]:
            words = self._tokenize(comment)
            all_words.extend(words)
        
        word_counts = Counter(all_words)
        self.all_keywords = set([w for w, c in word_counts.most_common(200)])
    
    def _tokenize(self, text):
        text = re.sub(r"[^\u4e00-\u9fa5\w]", " ", text)
        words = jieba.lcut(text)
        words = [word for word in words if word not in stopwords and len(word) > 1]
        return words
    
    def _get_word_freq(self, comments, top_n=100):
        all_words = []
        for comment in comments:
            words = self._tokenize(comment)
            all_words.extend(words)
        return Counter(all_words).most_common(top_n)
    
    def create_kpi_cards(self):
        print("\n📊 创建KPI指标卡片...")
        
        total = len(self.df)
        pos_count = len(self.positive_df)
        neg_count = len(self.negative_df)
        neu_count = len(self.neutral_df)
        
        pos_rate = round(pos_count / total * 100, 1)
        neg_rate = round(neg_count / total * 100, 1)
        avg_score = round(self.df["情感分数"].mean(), 3)
        avg_likes = round(self.df["点赞数"].mean(), 0)
        
        table = Table()
        headers = ["📊 指标名称", "📈 数值", "💡 说明"]
        rows = [
            ["📝 总评论数", f"{total:,} 条", "所有采集的社交媒体评论"],
            ["😊 正面评论", f"{pos_count:,} 条 ({pos_rate}%)", "情感分数 > 0.65"],
            ["😐 中性评论", f"{neu_count:,} 条 ({round(neu_count/total*100,1)}%)", "0.35 ≤ 情感分数 ≤ 0.65"],
            ["😠 负面评论", f"{neg_count:,} 条 ({neg_rate}%)", "情感分数 < 0.35"],
            ["📊 平均情感分数", f"{avg_score}", "0.5 为中性，越高越正面"],
            ["❤️ 平均点赞数", f"{int(avg_likes)}", "每条评论的平均点赞数"],
            ["📅 数据时间范围", f"{self.df['日期'].min().strftime('%Y-%m-%d')} ~ {self.df['日期'].max().strftime('%Y-%m-%d')}", "数据采集时间段"],
        ]
        
        table.add(headers, rows)
        table.set_global_opts(
            title_opts=opts.ComponentTitleOpts(
                title="📊 数据概览 - Key Performance Indicators",
                subtitle="社交媒体评论情感分析核心指标"
            )
        )
        
        return table
    
    def create_sentiment_pie(self):
        print("🥧 创建情感分布环形图...")
        
        sentiment_counts = self.df["情感倾向"].value_counts()
        data = [
            {"value": sentiment_counts.get("正面", 0), "name": "正面 😊"},
            {"value": sentiment_counts.get("中性", 0), "name": "中性 😐"},
            {"value": sentiment_counts.get("负面", 0), "name": "负面 😠"},
        ]
        
        pie = (
            Pie(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="450px",
                page_title="情感分布"
            ))
            .add(
                series_name="情感分布",
                data_pair=[[d["name"], d["value"]] for d in data],
                radius=["35%", "65%"],
                center=["50%", "50%"],
                rosetype="radius",
                label_opts=opts.LabelOpts(
                    is_show=True,
                    position="outside",
                    formatter="{b}\n{d}% ({c}条)",
                    font_size=13,
                    font_weight="bold",
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="item",
                    formatter="{a}<br/>{b}: {c} ({d}%)",
                ),
                itemstyle_opts=opts.ItemStyleOpts(
                    border_width=2,
                    border_color="#fff",
                ),
            )
            .set_colors([COLORS["positive"], COLORS["neutral"], COLORS["negative"]])
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="🥧 情感分布环形图",
                    subtitle=f"总评论: {len(self.df)} 条 | 正面比例: {round(len(self.positive_df)/len(self.df)*100,1)}%",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(
                        font_size=18,
                        font_weight="bold",
                        color=COLORS["title"],
                    ),
                ),
                legend_opts=opts.LegendOpts(
                    orient="vertical",
                    pos_left="2%",
                    pos_top="middle",
                    item_width=20,
                    item_height=14,
                    textstyle_opts=opts.TextStyleOpts(font_size=12),
                ),
            )
        )
        
        return pie
    
    def create_sentiment_trend(self):
        print("📈 创建情感趋势折线图...")
        
        daily = self.df.groupby(["日期_str", "情感倾向"]).size().unstack(fill_value=0)
        for s in ["正面", "中性", "负面"]:
            if s not in daily.columns:
                daily[s] = 0
        
        daily = daily.sort_index()
        daily["total"] = daily.sum(axis=1)
        daily["正面率"] = daily["正面"] / daily["total"]
        daily["负面率"] = daily["负面"] / daily["total"]
        
        line = (
            Line(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="450px",
            ))
            .add_xaxis(daily.index.tolist())
            .add_yaxis(
                "正面率",
                daily["正面率"].round(3).tolist(),
                is_smooth=True,
                symbol="circle",
                symbol_size=8,
                linestyle_opts=opts.LineStyleOpts(width=3, color=COLORS["positive"]),
                itemstyle_opts=opts.ItemStyleOpts(color=COLORS["positive"]),
                areastyle_opts=opts.AreaStyleOpts(
                    opacity=0.15,
                    color=COLORS["positive"],
                ),
            )
            .add_yaxis(
                "负面率",
                daily["负面率"].round(3).tolist(),
                is_smooth=True,
                symbol="circle",
                symbol_size=8,
                linestyle_opts=opts.LineStyleOpts(width=3, color=COLORS["negative"]),
                itemstyle_opts=opts.ItemStyleOpts(color=COLORS["negative"]),
                areastyle_opts=opts.AreaStyleOpts(
                    opacity=0.15,
                    color=COLORS["negative"],
                ),
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="📈 情感趋势分析",
                    subtitle="正负面评论比例随时间变化趋势（面积图）",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(
                        font_size=18,
                        font_weight="bold",
                    ),
                ),
                xaxis_opts=opts.AxisOpts(
                    type_="category",
                    boundary_gap=False,
                    axislabel_opts=opts.LabelOpts(rotate=45, font_size=10),
                    splitline_opts=opts.SplitLineOpts(is_show=False),
                ),
                yaxis_opts=opts.AxisOpts(
                    type_="value",
                    name="比例",
                    min_=0,
                    max_=1,
                    axislabel_opts=opts.LabelOpts(formatter="{value}"),
                    splitline_opts=opts.SplitLineOpts(
                        is_show=True,
                        linestyle_opts=opts.LineStyleOpts(type_="dashed", opacity=0.3),
                    ),
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="axis",
                    axis_pointer_type="cross",
                    formatter="{b}<br/>{a0}: {c0}<br/>{a1}: {c1}",
                ),
                legend_opts=opts.LegendOpts(
                    pos_top="3%",
                    item_width=15,
                ),
                datazoom_opts=[
                    opts.DataZoomOpts(
                        type_="inside",
                        range_start=0,
                        range_end=100,
                    ),
                    opts.DataZoomOpts(
                        type_="slider",
                        pos_bottom="0%",
                        range_start=0,
                        range_end=100,
                    ),
                ],
            )
        )
        
        return line
    
    def create_platform_distribution(self):
        print("📱 创建平台分布分析...")
        
        platform_stats = self.df.groupby("平台").agg({
            "评论ID": "count",
            "点赞数": "mean",
            "情感分数": "mean",
        }).round(2)
        platform_stats.columns = ["评论数", "平均点赞", "平均情感分"]
        platform_stats = platform_stats.sort_values("评论数", ascending=False)
        
        bar = (
            Bar(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="450px",
            ))
            .add_xaxis(platform_stats.index.tolist())
            .add_yaxis(
                "评论数",
                platform_stats["评论数"].tolist(),
                yaxis_index=0,
                itemstyle_opts=opts.ItemStyleOpts(color=CHART_COLORS[0]),
            )
            .add_yaxis(
                "平均情感分",
                platform_stats["平均情感分"].tolist(),
                yaxis_index=1,
                itemstyle_opts=opts.ItemStyleOpts(color=CHART_COLORS[2]),
            )
            .extend_axis(
                yaxis=opts.AxisOpts(
                    type_="value",
                    name="情感分",
                    min_=0,
                    max_=1,
                    position="right",
                    axislabel_opts=opts.LabelOpts(formatter="{value}"),
                )
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="📱 各平台评论分布 & 情感分析",
                    subtitle="不同平台的评论数量和平均情感分数对比",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18, font_weight="bold"),
                ),
                xaxis_opts=opts.AxisOpts(
                    axislabel_opts=opts.LabelOpts(rotate=45, font_size=10),
                ),
                yaxis_opts=opts.AxisOpts(
                    type_="value",
                    name="评论数",
                    position="left",
                ),
                tooltip_opts=opts.TooltipOpts(trigger="axis", axis_pointer_type="shadow"),
                legend_opts=opts.LegendOpts(pos_top="3%"),
                datazoom_opts=[opts.DataZoomOpts(type_="slider")],
            )
        )
        
        return bar
    
    def create_hourly_distribution(self):
        print("⏰ 创建时段分布分析...")
        
        hourly = self.df.groupby("小时").agg({
            "评论ID": "count",
            "情感分数": "mean",
        }).round(3)
        
        bar = (
            Bar(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="400px",
            ))
            .add_xaxis([f"{h}时" for h in hourly.index])
            .add_yaxis(
                "评论数",
                hourly["评论ID"].tolist(),
                itemstyle_opts=opts.ItemStyleOpts(color="#52c41a"),
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="⏰ 24小时评论发布分布",
                    subtitle="一天中各时段的评论数量统计",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18, font_weight="bold"),
                ),
                xaxis_opts=opts.AxisOpts(name="时段"),
                yaxis_opts=opts.AxisOpts(name="评论数"),
                tooltip_opts=opts.TooltipOpts(trigger="axis"),
                datazoom_opts=[opts.DataZoomOpts(type_="inside")],
            )
        )
        
        return bar
    
    def create_likes_sentiment_scatter(self):
        print("💫 创建点赞数与情感关系散点图...")
        
        sample_df = self.df.sample(min(1000, len(self.df))).copy()
        
        scatter = (
            Scatter(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="450px",
            ))
            .add_xaxis(sample_df["情感分数"].round(3).tolist())
            .add_yaxis(
                "点赞数",
                sample_df["点赞数"].tolist(),
                symbol_size=10,
                label_opts=opts.LabelOpts(is_show=False),
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="💫 情感分数 vs 点赞数关系分析",
                    subtitle="抽样1000条数据展示情感与互动的关系",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18, font_weight="bold"),
                ),
                xaxis_opts=opts.AxisOpts(
                    name="情感分数",
                    min_=0,
                    max_=1,
                    splitline_opts=opts.SplitLineOpts(is_show=True),
                ),
                yaxis_opts=opts.AxisOpts(
                    name="点赞数",
                    type_="log",
                    splitline_opts=opts.SplitLineOpts(is_show=True),
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="item",
                    formatter="情感分数: {b}<br/>点赞数: {c}",
                ),
                visualmap_opts=opts.VisualMapOpts(
                    type_="color",
                    min_=sample_df["点赞数"].min(),
                    max_=sample_df["点赞数"].max(),
                    range_color=["#52c41a", "#faad14", "#ff4d4f"],
                    pos_right="5%",
                    pos_bottom="15%",
                ),
            )
        )
        
        return scatter
    
    def create_wordcloud(self, sentiment_type, title, subtitle, colors):
        print(f"☁️ 创建{sentiment_type}词云...")
        
        if sentiment_type == "正面":
            comments = self.positive_df["评论内容"].tolist()
        elif sentiment_type == "负面":
            comments = self.negative_df["评论内容"].tolist()
        else:
            comments = self.neutral_df["评论内容"].tolist()
        
        word_freq = self._get_word_freq(comments, top_n=150)
        
        if not word_freq:
            return None
        
        wordcloud = (
            WordCloud(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="500px",
            ))
            .add(
                "",
                word_freq,
                word_size_range=[12, 90],
                shape="cardioid",
                rotate_step=30,
                textstyle_opts=opts.TextStyleOpts(font_family="Microsoft YaHei"),
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title=title,
                    subtitle=subtitle,
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(
                        font_size=18,
                        font_weight="bold",
                    ),
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="item",
                    formatter="{b}: {c}次",
                ),
            )
        )
        
        return wordcloud
    
    def create_positive_wordcloud(self):
        return self.create_wordcloud(
            "正面",
            "☁️ 正面评论高频词云",
            "用户满意度较高的关键词展示（心形布局）",
            ["#52c41a", "#73d13d", "#95de64", "#b7eb8f", "#d9f7be"]
        )
    
    def create_negative_wordcloud(self):
        return self.create_wordcloud(
            "负面",
            "☁️ 负面评论高频词云",
            "用户抱怨较多的关键词展示（心形布局）",
            ["#ff4d4f", "#ff7875", "#ffa39e", "#ffccc7", "#fff1f0"]
        )
    
    def create_neutral_wordcloud(self):
        return self.create_wordcloud(
            "中性",
            "☁️ 中性评论高频词云",
            "用户态度中立的关键词展示",
            ["#1890ff", "#40a9ff", "#69c0ff", "#91d5ff", "#bae7ff"]
        )
    
    def create_cooccurrence_network(self):
        print("🕸️ 创建关键词共现网络图...")
        
        comments = self.negative_df["评论内容"].tolist()
        word_freq = self._get_word_freq(comments, top_n=50)
        high_freq_words = set([w for w, c in word_freq])
        
        cooccurrence = defaultdict(int)
        
        for comment in comments:
            words = self._tokenize(comment)
            words = [w for w in words if w in high_freq_words]
            
            for i in range(len(words)):
                for j in range(i + 1, len(words)):
                    key = tuple(sorted([words[i], words[j]]))
                    cooccurrence[key] += 1
        
        cooccurrence = {k: v for k, v in cooccurrence.items() if v >= 3}
        
        if not cooccurrence:
            return None
        
        word_total = defaultdict(int)
        for (w1, w2), cnt in cooccurrence.items():
            word_total[w1] += cnt
            word_total[w2] += cnt
        
        max_count = max(word_total.values()) if word_total else 1
        nodes = []
        for word, count in word_total.items():
            size = 15 + (count / max_count) * 40
            
            if count > max_count * 0.7:
                color = "#ff4d4f"
            elif count > max_count * 0.4:
                color = "#faad14"
            else:
                color = "#1890ff"
            
            nodes.append(
                opts.GraphNode(
                    name=word,
                    symbol_size=size,
                    value=count,
                    itemstyle_opts=opts.ItemStyleOpts(color=color),
                )
            )
        
        max_edge = max(cooccurrence.values()) if cooccurrence else 1
        edges = []
        for (w1, w2), cnt in cooccurrence.items():
            edges.append(
                opts.GraphLink(
                    source=w1,
                    target=w2,
                    value=cnt,
                    linestyle_opts=opts.LineStyleOpts(
                        width=1 + (cnt / max_edge) * 8,
                        opacity=0.3 + (cnt / max_edge) * 0.6,
                        color="#ff7875",
                    ),
                )
            )
        
        graph = (
            Graph(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="600px",
            ))
            .add(
                "",
                nodes,
                edges,
                layout="force",
                is_roam=True,
                is_draggable=True,
                label_opts=opts.LabelOpts(
                    is_show=True,
                    position="right",
                    font_size=12,
                    font_weight="bold",
                    color="#333",
                ),
                linestyle_opts=opts.LineStyleOpts(curve=0.2),
                repulsion=5000,
                edge_length=[100, 250],
                gravity=0.1,
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="🕸️ 负面评论关键词共现网络图",
                    subtitle="高频词之间的关联关系（力导向布局）| 节点大小=出现频率 | 边粗细=共现次数",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(
                        font_size=18,
                        font_weight="bold",
                    ),
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="item",
                    formatter="{b}: {c}",
                ),
                legend_opts=opts.LegendOpts(is_show=False),
            )
        )
        
        return graph
    
    def create_top_comments_table(self):
        print("📝 创建热门评论展示...")
        
        table = Table()
        
        top_positive = self.positive_df.nlargest(5, "点赞数")[["评论内容", "点赞数", "情感分数"]]
        top_negative = self.negative_df.nlargest(5, "点赞数")[["评论内容", "点赞数", "情感分数"]]
        
        headers = ["🔥 类型", "💬 评论内容", "❤️ 点赞数", "📊 情感分数"]
        rows = []
        
        for _, row in top_positive.iterrows():
            rows.append(["😊 正面热门", row["评论内容"][:50] + "..." if len(row["评论内容"]) > 50 else row["评论内容"], row["点赞数"], round(row["情感分数"], 3)])
        
        for _, row in top_negative.iterrows():
            rows.append(["😠 负面热门", row["评论内容"][:50] + "..." if len(row["评论内容"]) > 50 else row["评论内容"], row["点赞数"], round(row["情感分数"], 3)])
        
        table.add(headers, rows)
        table.set_global_opts(
            title_opts=opts.ComponentTitleOpts(
                title="🔥 热门评论展示",
                subtitle="点赞数最高的正面和负面评论各5条"
            )
        )
        
        return table
    
    def create_platform_sentiment_radar(self):
        print("🎯 创建平台情感雷达图...")
        
        platform_sentiment = self.df.groupby(["平台", "情感倾向"]).size().unstack(fill_value=0)
        for s in ["正面", "中性", "负面"]:
            if s not in platform_sentiment.columns:
                platform_sentiment[s] = 0
        
        platform_sentiment["total"] = platform_sentiment.sum(axis=1)
        platform_sentiment = platform_sentiment[platform_sentiment["total"] >= 100]
        
        top_platforms = platform_sentiment.nlargest(6, "total").index.tolist()
        
        radar = (
            Radar(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="450px",
            ))
            .add_schema(
                schema=[
                    opts.RadarIndicatorItem(name="正面率", max_=100),
                    opts.RadarIndicatorItem(name="负面率", max_=100),
                    opts.RadarIndicatorItem(name="平均点赞", max_=self.df.groupby("平台")["点赞数"].mean().max()),
                    opts.RadarIndicatorItem(name="评论数占比", max_=100),
                    opts.RadarIndicatorItem(name="互动活跃度", max_=100),
                ],
                splitarea_opt=opts.SplitAreaOpts(
                    is_show=True,
                    areastyle_opts=opts.AreaStyleOpts(opacity=0.1),
                ),
                splitline_opt=opts.SplitLineOpts(is_show=True),
            )
        )
        
        for i, platform in enumerate(top_platforms):
            stats = platform_sentiment.loc[platform]
            total_comments = stats["total"]
            pos_rate = stats["正面"] / total_comments * 100
            neg_rate = stats["负面"] / total_comments * 100
            
            platform_likes = self.df[self.df["平台"] == platform]["点赞数"].mean()
            comment_ratio = total_comments / len(self.df) * 100
            
            platform_comments = self.df[self.df["平台"] == platform]
            engagement = (platform_comments["点赞数"].mean() + platform_comments["评论数"].mean() * 5) / 50
            engagement = min(engagement, 100)
            
            radar.add(
                platform,
                [[round(pos_rate, 1), round(neg_rate, 1), round(platform_likes, 0), round(comment_ratio, 1), round(engagement, 1)]],
                color=CHART_COLORS[i % len(CHART_COLORS)],
                areastyle_opts=opts.AreaStyleOpts(opacity=0.2),
            )
        
        radar.set_global_opts(
            title_opts=opts.TitleOpts(
                title="🎯 主流平台情感对比雷达图",
                subtitle="评论数Top6平台的多维度对比分析",
                pos_left="center",
                title_textstyle_opts=opts.TextStyleOpts(font_size=18, font_weight="bold"),
            ),
            legend_opts=opts.LegendOpts(pos_top="5%"),
            tooltip_opts=opts.TooltipOpts(trigger="item"),
        )
        
        return radar
    
    def create_monthly_bar(self):
        print("📊 创建月度趋势柱状图...")
        
        monthly = self.df.groupby(["月份", "情感倾向"]).size().unstack(fill_value=0)
        for s in ["正面", "中性", "负面"]:
            if s not in monthly.columns:
                monthly[s] = 0
        
        monthly = monthly.sort_index()
        
        bar = (
            Bar(init_opts=opts.InitOpts(
                theme=ThemeType.MACARONS,
                width="100%",
                height="450px",
            ))
            .add_xaxis(monthly.index.tolist())
            .add_yaxis("正面", monthly["正面"].tolist(), stack="stack1")
            .add_yaxis("中性", monthly["中性"].tolist(), stack="stack1")
            .add_yaxis("负面", monthly["负面"].tolist(), stack="stack1")
            .set_colors([COLORS["positive"], COLORS["neutral"], COLORS["negative"]])
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="📊 月度情感分布堆叠柱状图",
                    subtitle="各月情感分类数量变化（堆叠显示）",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18, font_weight="bold"),
                ),
                xaxis_opts=opts.AxisOpts(axislabel_opts=opts.LabelOpts(rotate=30)),
                yaxis_opts=opts.AxisOpts(name="评论数"),
                tooltip_opts=opts.TooltipOpts(trigger="axis", axis_pointer_type="shadow"),
                legend_opts=opts.LegendOpts(pos_top="3%"),
            )
        )
        
        return bar
    
    def generate_dashboard(self):
        print("\n🎨 正在生成交互式看板...")
        
        page = Page(
            page_title="社交媒体评论情感分析看板 V2.0",
            layout=Page.DraggablePageLayout,
        )
        
        page.add(self.create_kpi_cards())
        page.add(self.create_sentiment_pie())
        page.add(self.create_sentiment_trend())
        page.add(self.create_monthly_bar())
        page.add(self.create_platform_distribution())
        page.add(self.create_platform_sentiment_radar())
        page.add(self.create_hourly_distribution())
        page.add(self.create_likes_sentiment_scatter())
        
        pos_wc = self.create_positive_wordcloud()
        if pos_wc:
            page.add(pos_wc)
        
        neg_wc = self.create_negative_wordcloud()
        if neg_wc:
            page.add(neg_wc)
        
        neu_wc = self.create_neutral_wordcloud()
        if neu_wc:
            page.add(neu_wc)
        
        cooc = self.create_cooccurrence_network()
        if cooc:
            page.add(cooc)
        
        page.add(self.create_top_comments_table())
        
        output_file = "sentiment_analysis_dashboard_v2.html"
        page.render(output_file)
        
        print(f"\n✅ 成功！看板已保存到: {output_file}")
        print("=" * 70)
        print("📋 包含的图表:")
        print("   1. 📊 KPI数据概览表")
        print("   2. 🥧 情感分布环形图")
        print("   3. 📈 情感趋势面积图")
        print("   4. 📊 月度堆叠柱状图")
        print("   5. 📱 平台分布双轴图")
        print("   6. 🎯 平台对比雷达图")
        print("   7. ⏰ 24小时时段分布图")
        print("   8. 💫 情感vs点赞散点图")
        print("   9. ☁️ 正面/负面/中性词云")
        print("  10. 🕸️ 关键词共现网络图")
        print("  11. 📝 热门评论展示表")
        print("=" * 70)
        print(f"💡 提示: 用浏览器打开 {output_file} 查看交互式看板")
        print("=" * 70)
        
        return output_file
    
    def run(self):
        self.load_and_process()
        return self.generate_dashboard()


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("🚀 社交媒体评论情感分析系统 V2.0")
    print("=" * 70)
    
    dashboard = EnhancedSentimentDashboard()
    dashboard.run()
