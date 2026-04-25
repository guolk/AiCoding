import pandas as pd
import numpy as np
import jieba
import re
from collections import Counter
from snownlp import SnowNLP
from pyecharts import options as opts
from pyecharts.charts import Pie, Line, WordCloud, Graph, Page
from pyecharts.globals import ThemeType
from pyecharts.components import Table
import warnings
warnings.filterwarnings("ignore")


# 停用词列表
stopwords = set([
    "的", "了", "是", "在", "我", "有", "和", "就",
    "不", "人", "都", "一", "一个", "上", "也", "很",
    "到", "说", "要", "去", "你", "会", "着", "没有",
    "看", "好", "自己", "这", "那", "她", "他", "它",
    "们", "这个", "那个", "什么", "怎么", "为什么", "哪",
    "哪里", "谁", "多少", "几", "啊", "吧", "呢", "吗",
    "呀", "哦", "嗯", "哈", "哎", "唉", "哦", "喂",
    "但是", "如果", "因为", "所以", "虽然", "但是", "而且",
    "或者", "还是", "不是", "就是", "只有", "只要", "不管",
    "尽管", "即使", "除非", "除了", "不但", "而且", "与其",
    "不如", "首先", "其次", "最后", "总之", "因此", "所以",
    "于是", "然而", "不过", "其实", "实际上", "事实上",
    "现在", "今天", "昨天", "明天", "今年", "去年", "明年",
    "这里", "那里", "哪里", "这边", "那边", "上面", "下面",
    "里面", "外面", "前面", "后面", "左边", "右边", "中间",
    "一些", "一点", "许多", "很多", "很少", "几乎", "大概",
    "大约", "可能", "也许", "大概", "或者", "以及", "等",
    "等等", "之", "以", "而", "于", "其", "为", "与",
    "则", "乃", "且", "或", "如", "若", "此", "即",
    "该", "本", "该", "此", "各", "每", "所有", "全部",
    "部分", "有些", "有的", "其他", "其余", "另外", "此外",
    "还有", "以及", "及", "和", "与", "跟", "同", "跟",
    "向", "往", "朝", "到", "从", "自", "由", "在",
    "于", "对", "对于", "关于", "至于", "由于", "因为",
    "为了", "以便", "以免", "免得", "省得", "以便", "为的是",
    "把", "被", "让", "给", "叫", "使", "令", "派",
    "请", "要", "想", "打算", "计划", "准备", "考虑",
    "认为", "以为", "觉得", "感到", "感觉", "知道", "明白",
    "了解", "清楚", "记得", "忘记", "想起", "回忆", "忘记",
    "来", "去", "走", "跑", "跳", "飞", "爬", "游",
    "吃", "喝", "睡", "醒", "坐", "站", "躺", "跪",
    "看", "听", "闻", "尝", "摸", "感觉", "想", "思考",
    "说", "讲", "问", "答", "告诉", "解释", "说明", "描述",
    "做", "干", "办", "搞", "弄", "进行", "开展", "执行",
    "开始", "结束", "停止", "继续", "完成", "结束", "开始",
    "可以", "能", "会", "应该", "必须", "需要", "要",
    "愿意", "肯", "敢", "要", "想", "希望", "期望", "盼望",
    "喜欢", "爱", "讨厌", "恨", "怕", "担心", "害怕",
    "高兴", "开心", "快乐", "愉快", "难过", "伤心", "痛苦",
    "生气", "愤怒", "着急", "紧张", "放松", "轻松", "愉快",
    "好", "坏", "不错", "很好", "很差", "一般", "普通",
    "美丽", "漂亮", "丑陋", "好看", "难听", "美味", "难吃",
    "大", "小", "高", "低", "长", "短", "宽", "窄",
    "多", "少", "快", "慢", "早", "晚", "新", "旧",
    "年轻", "年老", "古老", "现代", "传统", "时尚", "流行",
    "简单", "复杂", "容易", "困难", "方便", "麻烦", "舒适",
    "安全", "危险", "健康", "生病", "强壮", "虚弱", "聪明",
    "愚蠢", "勇敢", "胆小", "诚实", "虚伪", "善良", "邪恶",
    "美丽", "丑陋", "伟大", "渺小", "重要", "不重要", "主要",
    "次要", "必要", "不必要", "必须", "不必", "应该", "不应该",
    "正确", "错误", "对", "错", "是", "非", "真", "假",
    "真实", "虚假", "存在", "不存在", "有", "无", "没有",
    "这个", "那个", "这些", "那些", "这样", "那样", "这么",
    "那么", "怎么", "怎样", "如何", "为什么", "什么", "哪",
    "谁", "哪里", "多少", "几", "什么时候", "多久", "多远",
    "啊", "吧", "呢", "吗", "呀", "哦", "嗯", "哈",
    "哎", "唉", "哦", "喂", "嗨", "嘿", "啊", "呀",
    "啦", "哦", "嘛", "哟", "啵", "嘞", "咯", "喽",
    "呢", "吗", "啊", "吧", "呀", "哦", "嗯", "哈",
    "哎", "唉", "哦", "喂", "嗨", "嘿", "啊", "呀",
    "啦", "哦", "嘛", "哟", "啵", "嘞", "咯", "喽",
])


class SentimentAnalysisDashboard:
    def __init__(self, data_path="social_media_comments.csv"):
        self.data_path = data_path
        self.df = None
        self.positive_comments = None
        self.negative_comments = None
        self.neutral_comments = None
        
    def load_data(self):
        print("正在加载数据...")
        self.df = pd.read_csv(self.data_path, encoding="utf-8-sig")
        print(f"加载了 {len(self.df)} 条数据")
        return self
    
    def preprocess_data(self):
        print("正在预处理数据...")
        
        # 转换时间格式
        self.df["时间"] = pd.to_datetime(self.df["时间"])
        self.df["日期"] = pd.to_datetime(self.df["日期"])
        
        # 提取日期部分用于分组
        self.df["日期_str"] = self.df["日期"].dt.strftime("%Y-%m-%d")
        self.df["月份"] = self.df["日期"].dt.strftime("%Y-%m")
        self.df["星期"] = self.df["日期"].dt.day_name()
        
        print("数据预处理完成")
        return self
    
    def analyze_sentiment(self):
        print("正在进行情感分析...")
        
        def get_sentiment(text):
            try:
                s = SnowNLP(text)
                score = s.sentiments
                
                if score > 0.6:
                    return "正面"
                elif score < 0.4:
                    return "负面"
                else:
                    return "中性"
            except:
                return "中性"
        
        # 应用情感分析
        self.df["情感倾向"] = self.df["评论内容"].apply(get_sentiment)
        
        # 计算情感分数
        def get_sentiment_score(text):
            try:
                s = SnowNLP(text)
                return s.sentiments
            except:
                return 0.5
        
        self.df["情感分数"] = self.df["评论内容"].apply(get_sentiment_score)
        
        # 分离不同情感的评论
        self.positive_comments = self.df[self.df["情感倾向"] == "正面"]
        self.negative_comments = self.df[self.df["情感倾向"] == "负面"]
        self.neutral_comments = self.df[self.df["情感倾向"] == "中性"]
        
        print(f"正面评论: {len(self.positive_comments)} 条")
        print(f"中性评论: {len(self.neutral_comments)} 条")
        print(f"负面评论: {len(self.negative_comments)} 条")
        
        return self
    
    def tokenize(self, text):
        # 去除特殊字符
        text = re.sub(r"[^\u4e00-\u9fa5\w]", " ", text)
        # 分词
        words = jieba.lcut(text)
        # 去除停用词和单字词
        words = [word for word in words if word not in stopwords and len(word) > 1]
        return words
    
    def get_word_frequency(self, comments, top_n=50):
        all_words = []
        for comment in comments:
            words = self.tokenize(comment)
            all_words.extend(words)
        
        word_counts = Counter(all_words)
        return word_counts.most_common(top_n)
    
    def create_sentiment_pie(self):
        print("正在创建情感分布饼图...")
        
        sentiment_counts = self.df["情感倾向"].value_counts()
        colors = ["#5470c6", "#91cc75", "#ee6666"]
        
        pie = (
            Pie(init_opts=opts.InitOpts(theme=ThemeType.LIGHT, width="100%", height="500px"))
            .add(
                "",
                [list(z) for z in zip(sentiment_counts.index.tolist(), sentiment_counts.values.tolist())],
                radius=["40%", "70%"],
                center=["50%", "50%"],
                label_opts=opts.LabelOpts(
                    formatter="{b}: {c} ({d}%)",
                    font_size=14,
                ),
            )
            .set_colors(colors)
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="情感分布饼图",
                    subtitle=f"总评论数: {len(self.df)}",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18),
                ),
                legend_opts=opts.LegendOpts(
                    orient="vertical",
                    pos_left="left",
                    pos_top="middle",
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="item",
                    formatter="{a} <br/>{b}: {c} ({d}%)",
                ),
            )
        )
        
        return pie
    
    def create_sentiment_trend(self):
        print("正在创建情感趋势折线图...")
        
        # 按日期分组统计情感分布
        daily_stats = self.df.groupby(["日期_str", "情感倾向"]).size().unstack(fill_value=0)
        
        # 确保所有情感类别都存在
        for sentiment in ["正面", "中性", "负面"]:
            if sentiment not in daily_stats.columns:
                daily_stats[sentiment] = 0
        
        # 按日期排序
        daily_stats = daily_stats.sort_index()
        
        # 计算每日总数
        daily_stats["总数"] = daily_stats.sum(axis=1)
        
        # 计算比例
        daily_stats["正面比例"] = daily_stats["正面"] / daily_stats["总数"]
        daily_stats["中性比例"] = daily_stats["中性"] / daily_stats["总数"]
        daily_stats["负面比例"] = daily_stats["负面"] / daily_stats["总数"]
        
        line = (
            Line(init_opts=opts.InitOpts(theme=ThemeType.LIGHT, width="100%", height="500px"))
            .add_xaxis(daily_stats.index.tolist())
            .add_yaxis(
                "正面",
                daily_stats["正面比例"].round(2).tolist(),
                is_smooth=True,
                symbol="circle",
                symbol_size=6,
                linestyle_opts=opts.LineStyleOpts(width=2),
            )
            .add_yaxis(
                "中性",
                daily_stats["中性比例"].round(2).tolist(),
                is_smooth=True,
                symbol="circle",
                symbol_size=6,
                linestyle_opts=opts.LineStyleOpts(width=2),
            )
            .add_yaxis(
                "负面",
                daily_stats["负面比例"].round(2).tolist(),
                is_smooth=True,
                symbol="circle",
                symbol_size=6,
                linestyle_opts=opts.LineStyleOpts(width=2),
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="情感趋势折线图",
                    subtitle="按日期统计情感比例变化",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18),
                ),
                xaxis_opts=opts.AxisOpts(
                    type_="category",
                    boundary_gap=False,
                    axislabel_opts=opts.LabelOpts(rotate=45),
                ),
                yaxis_opts=opts.AxisOpts(
                    type_="value",
                    name="比例",
                    axislabel_opts=opts.LabelOpts(formatter="{value}"),
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="axis",
                    axis_pointer_type="cross",
                ),
                legend_opts=opts.LegendOpts(
                    pos_top="10%",
                ),
                datazoom_opts=[
                    opts.DataZoomOpts(type_="inside"),
                    opts.DataZoomOpts(type_="slider", pos_bottom="0%"),
                ],
            )
            .set_series_opts(
                label_opts=opts.LabelOpts(is_show=False),
                markpoint_opts=opts.MarkPointOpts(
                    data=[
                        opts.MarkPointItem(type_="max", name="最大值"),
                        opts.MarkPointItem(type_="min", name="最小值"),
                    ]
                ),
                markline_opts=opts.MarkLineOpts(
                    data=[
                        opts.MarkLineItem(type_="average", name="平均值"),
                    ]
                ),
            )
        )
        
        return line
    
    def create_word_cloud(self, sentiment="positive", top_n=100):
        print(f"正在创建{sentiment}词云...")
        
        if sentiment == "positive":
            comments = self.positive_comments["评论内容"].tolist()
            title = "正面评论词云"
            colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"]
        elif sentiment == "negative":
            comments = self.negative_comments["评论内容"].tolist()
            title = "负面评论词云"
            colors = ["#ee6666", "#ff8888", "#ffaaaa", "#ffcccc", "#ee8888"]
        else:
            comments = self.neutral_comments["评论内容"].tolist()
            title = "中性评论词云"
            colors = ["#91cc75", "#91cc75", "#b5e7a0", "#d5ecc2", "#e8f5e9"]
        
        word_freq = self.get_word_frequency(comments, top_n=top_n)
        
        if not word_freq:
            return None
        
        wordcloud = (
            WordCloud(init_opts=opts.InitOpts(theme=ThemeType.LIGHT, width="100%", height="500px"))
            .add(
                "",
                word_freq,
                word_size_range=[10, 80],
                shape="diamond",
                textstyle_opts=opts.TextStyleOpts(font_family="Microsoft YaHei"),
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title=title,
                    subtitle=f"展示前{top_n}个高频词",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18),
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="item",
                    formatter="{b}: {c}",
                ),
            )
        )
        
        return wordcloud
    
    def create_cooccurrence_network(self, top_n=30, min_count=5):
        print("正在创建关键词共现网络图...")
        
        # 仅使用负面评论
        comments = self.negative_comments["评论内容"].tolist()
        
        # 获取高频词
        word_freq = self.get_word_frequency(comments, top_n=top_n)
        high_freq_words = set([word for word, count in word_freq])
        
        # 构建共现矩阵
        cooccurrence = {}
        
        for comment in comments:
            words = self.tokenize(comment)
            # 只保留高频词
            words = [word for word in words if word in high_freq_words]
            
            # 构建词对
            for i in range(len(words)):
                for j in range(i + 1, len(words)):
                    word1, word2 = words[i], words[j]
                    if word1 != word2:
                        # 确保顺序一致
                        key = tuple(sorted([word1, word2]))
                        cooccurrence[key] = cooccurrence.get(key, 0) + 1
        
        # 过滤共现次数较少的边
        cooccurrence = {k: v for k, v in cooccurrence.items() if v >= min_count}
        
        if not cooccurrence:
            return None
        
        # 构建节点和边
        nodes = []
        edges = []
        
        # 统计每个词的总出现次数
        word_total = {}
        for (word1, word2), count in cooccurrence.items():
            word_total[word1] = word_total.get(word1, 0) + count
            word_total[word2] = word_total.get(word2, 0) + count
        
        # 创建节点
        max_count = max(word_total.values()) if word_total else 1
        for word, count in word_total.items():
            nodes.append(
                opts.GraphNode(
                    name=word,
                    symbol_size=20 + count / max_count * 30,
                    value=count,
                )
            )
        
        # 创建边
        max_edge = max(cooccurrence.values()) if cooccurrence else 1
        for (word1, word2), count in cooccurrence.items():
            edges.append(
                opts.GraphLink(
                    source=word1,
                    target=word2,
                    value=count,
                    linestyle_opts=opts.LineStyleOpts(
                        width=1 + count / max_edge * 5,
                        opacity=0.5 + count / max_edge * 0.5,
                    ),
                )
            )
        
        graph = (
            Graph(init_opts=opts.InitOpts(theme=ThemeType.LIGHT, width="100%", height="600px"))
            .add(
                "",
                nodes,
                edges,
                layout="force",
                is_roam=True,
                label_opts=opts.LabelOpts(
                    is_show=True,
                    position="right",
                    font_size=12,
                ),
                linestyle_opts=opts.LineStyleOpts(
                    curve=0.3,
                ),
                repulsion=4000,
                edge_length=[100, 300],
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="高频负面评论关键词共现网络图",
                    subtitle=f"展示前{top_n}个高频词，共现次数>= {min_count}",
                    pos_left="center",
                    title_textstyle_opts=opts.TextStyleOpts(font_size=18),
                ),
                tooltip_opts=opts.TooltipOpts(
                    trigger="item",
                    formatter="{b}: {c}",
                ),
                legend_opts=opts.LegendOpts(is_show=False),
            )
        )
        
        return graph
    
    def create_statistics_table(self):
        print("正在创建统计表格...")
        
        table = Table()
        
        # 基本统计
        total_count = len(self.df)
        positive_count = len(self.positive_comments)
        neutral_count = len(self.neutral_comments)
        negative_count = len(self.negative_comments)
        
        positive_rate = round(positive_count / total_count * 100, 2)
        neutral_rate = round(neutral_count / total_count * 100, 2)
        negative_rate = round(negative_count / total_count * 100, 2)
        
        avg_likes = round(self.df["点赞数"].mean(), 2)
        avg_comments = round(self.df["评论数"].mean(), 2)
        avg_shares = round(self.df["转发数"].mean(), 2)
        
        # 日期范围
        start_date = self.df["日期"].min().strftime("%Y-%m-%d")
        end_date = self.df["日期"].max().strftime("%Y-%m-%d")
        
        headers = ["统计项", "数值"]
        rows = [
            ["总评论数", f"{total_count:,}"],
            ["正面评论数", f"{positive_count:,} ({positive_rate}%)"],
            ["中性评论数", f"{neutral_count:,} ({neutral_rate}%)"],
            ["负面评论数", f"{negative_count:,} ({negative_rate}%)"],
            ["平均点赞数", f"{avg_likes}"],
            ["平均评论数", f"{avg_comments}"],
            ["平均转发数", f"{avg_shares}"],
            ["数据时间范围", f"{start_date} 至 {end_date}"],
        ]
        
        table.add(headers, rows)
        table.set_global_opts(
            title_opts=opts.ComponentTitleOpts(
                title="基本统计信息",
                subtitle="数据概览"
            )
        )
        
        return table
    
    def create_filterable_dashboard(self):
        print("正在创建交互式看板...")
        
        # 创建所有图表
        pie = self.create_sentiment_pie()
        line = self.create_sentiment_trend()
        positive_wordcloud = self.create_word_cloud("positive")
        negative_wordcloud = self.create_word_cloud("negative")
        cooccurrence_graph = self.create_cooccurrence_network()
        stats_table = self.create_statistics_table()
        
        # 创建页面
        page = Page(
            page_title="社交媒体评论情感分析看板",
            layout=Page.DraggablePageLayout
        )
        
        # 添加图表
        page.add(stats_table)
        page.add(pie)
        page.add(line)
        
        if positive_wordcloud:
            page.add(positive_wordcloud)
        
        if negative_wordcloud:
            page.add(negative_wordcloud)
        
        if cooccurrence_graph:
            page.add(cooccurrence_graph)
        
        return page
    
    def run(self):
        print("=" * 60)
        print("社交媒体评论情感分析看板")
        print("=" * 60)
        
        # 执行所有步骤
        (self
         .load_data()
         .preprocess_data()
         .analyze_sentiment())
        
        # 创建交互式看板
        page = self.create_filterable_dashboard()
        
        # 保存为HTML
        output_file = "sentiment_analysis_dashboard.html"
        page.render(output_file)
        
        print(f"\n看板已保存到: {output_file}")
        print("=" * 60)
        print("分析完成！")
        print("=" * 60)
        
        return self


if __name__ == "__main__":
    # 先运行数据生成脚本
    print("正在生成模拟数据...")
    from generate_data import generate_dataset
    df = generate_dataset(6000)
    df.to_csv("social_media_comments.csv", index=False, encoding="utf-8-sig")
    print(f"模拟数据已生成，共 {len(df)} 条评论\n")
    
    # 运行情感分析看板
    dashboard = SentimentAnalysisDashboard()
    dashboard.run()
