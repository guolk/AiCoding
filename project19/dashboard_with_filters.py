import pandas as pd
import numpy as np
import jieba
import re
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from snownlp import SnowNLP
from pyecharts import options as opts
from pyecharts.charts import (
    Pie, Line, Bar, WordCloud, Graph, Page, Tab, Grid
)
from pyecharts.globals import ThemeType
from pyecharts.components import Table
import warnings
warnings.filterwarnings("ignore")


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

COLORS = {
    "positive": "#52c41a",
    "negative": "#ff4d4f",
    "neutral": "#1890ff",
}


class FilterableDashboard:
    def __init__(self, data_path="social_media_comments.csv"):
        self.data_path = data_path
        self.df = None
        self.filtered_df = None
        self.keywords_list = []
        
    def load_data(self):
        print("=" * 70)
        print("🔍 社交媒体评论情感分析看板（带筛选功能）
        print("=" * 70)
        
        print("\n📂 正在加载数据...")
        self.df = pd.read_csv(self.data_path, encoding="utf-8-sig")
        self.df["时间"] = pd.to_datetime(self.df["时间"])
        self.df["日期"] = pd.to_datetime(self.df["日期"])
        self.df["日期_str"] = self.df["日期"].dt.strftime("%Y-%m-%d")
        self.df["月份"] = self.df["日期"].dt.strftime("%Y-%m")
        self.df["小时"] = self.df["时间"].dt.hour
        
        print(f"   ✅ 加载了 {len(self.df)} 条数据")
        
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
        
        print("\n🔍 正在提取关键词...")
        self._extract_all_keywords()
        
        self.filtered_df = self.df.copy()
        
        return self
    
    def _tokenize(self, text):
        text = re.sub(r"[^\u4e00-\u9fa5\w]", " ", text)
        words = jieba.lcut(text)
        words = [word for word in words if word not in stopwords and len(word) > 1]
        return words
    
    def _extract_all_keywords(self):
        all_words = []
        for comment in self.df["评论内容"]:
            words = self._tokenize(comment)
            all_words.extend(words)
        
        word_counts = Counter(all_words)
        self.keywords_list = [w for w, c in word_counts.most_common(200)]
    
    def filter_by_keyword(self, keyword):
        if not keyword or keyword.strip() == "":
            self.filtered_df = self.df.copy()
            return
        
        keyword = keyword.strip()
        
        def contains_keyword(text):
            words = self._tokenize(text)
            return keyword in words or keyword in text
        
        self.filtered_df = self.df[self.df["评论内容"].apply(contains_keyword)]
        
        print(f"   🎯 筛选关键词 '{keyword}': 找到 {len(self.filtered_df)} 条相关评论")
    
    def filter_by_date_range(self, start_date, end_date):
        if not start_date or not end_date:
            return
        
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        self.filtered_df = self.filtered_df[
            (self.filtered_df["日期"] >= start) & 
            (self.filtered_df["日期"] <= end)
        ]
        
        print(f"   📅 筛选日期范围 {start_date} ~ {end_date}: 找到 {len(self.filtered_df)} 条评论")
    
    def filter_by_platform(self, platform):
        if not platform or platform == "全部":
            return
        
        self.filtered_df = self.filtered_df[self.filtered_df["平台"] == platform]
        
        print(f"   📱 筛选平台 '{platform}': 找到 {len(self.filtered_df)} 条评论")
    
    def filter_by_sentiment(self, sentiment):
        if not sentiment or sentiment == "全部":
            return
        
        self.filtered_df = self.filtered_df[self.filtered_df["情感倾向"] == sentiment]
        
        print(f"   💭 筛选情感 '{sentiment}': 找到 {len(self.filtered_df)} 条评论")
    
    def _get_word_freq(self, comments, top_n=100):
        all_words = []
        for comment in comments:
            words = self._tokenize(comment)
            all_words.extend(words)
        return Counter(all_words).most_common(top_n)
    
    def create_summary_table(self):
        total = len(self.filtered_df)
        if total == 0:
            table = Table()
            table.add(["提示"], [["没有符合筛选条件的数据，请调整筛选条件"]])
            table.set_global_opts(title_opts=opts.ComponentTitleOpts(title="📊 数据概览"))
            return table
        
        pos_count = len(self.filtered_df[self.filtered_df["情感倾向"] == "正面"])
        neg_count = len(self.filtered_df[self.filtered_df["情感倾向"] == "负面"])
        neu_count = len(self.filtered_df[self.filtered_df["情感倾向"] == "中性"])
        
        pos_rate = round(pos_count / total * 100, 1) if total > 0 else 0
        neg_rate = round(neg_count / total * 100, 1) if total > 0 else 0
        avg_score = round(self.filtered_df["情感分数"].mean(), 3)
        avg_likes = round(self.filtered_df["点赞数"].mean(), 0)
        
        table = Table()
        headers = ["📊 指标", "📈 数值"]
        rows = [
            ["📝 筛选后评论数", f"{total:,} 条"],
            ["😊 正面评论", f"{pos_count:,} 条 ({pos_rate}%)"],
            ["😐 中性评论", f"{neu_count:,} 条"],
            ["😠 负面评论", f"{neg_count:,} 条 ({neg_rate}%)"],
            ["📊 平均情感分数", f"{avg_score}"],
            ["❤️ 平均点赞数", f"{int(avg_likes)}"],
            ["📅 数据日期范围", f"{self.filtered_df['日期'].min().strftime('%Y-%m-%d')} ~ {self.filtered_df['日期'].max().strftime('%Y-%m-%d')}"],
        ]
        
        table.add(headers, rows)
        table.set_global_opts(
            title_opts=opts.ComponentTitleOpts(
                title="📊 当前筛选结果 - 数据概览",
                subtitle="基于当前筛选条件的统计结果"
            )
        )
        
        return table
    
    def create_sentiment_pie(self):
        if len(self.filtered_df) == 0:
            return None
        
        sentiment_counts = self.filtered_df["情感倾向"].value_counts()
        data = [
            ["正面 😊", sentiment_counts.get("正面", 0)],
            ["中性 😐", sentiment_counts.get("中性", 0)],
            ["负面 😠", sentiment_counts.get("负面", 0)],
        ]
        
        pie = (
            Pie(init_opts=opts.InitOpts(theme=ThemeType.MACARONS, width="100%", height="400px"))
            .add(
                "",
                data,
                radius=["35%", "65%"],
                center=["50%", "50%"],
                rosetype="radius",
                label_opts=opts.LabelOpts(
                    position="outside",
                    formatter="{b}\n{d}% ({c}条)",
                    font_size=12,
                ),
            )
            .set_colors([COLORS["positive"], COLORS["neutral"], COLORS["negative"]])
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    title="🥧 情感分布",
                    subtitle=f"筛选后共 {len(self.filtered_df)} 条评论",
                    pos_left="center",
                ),
                legend_opts=opts.LegendOpts(orient="vertical", pos_left="2%", pos_top="middle"),
            )
        )
        
        return pie
    
    def create_trend_chart(self):
        if len(self.filtered_df) == 0:
            return None
        
        daily = self.filtered_df.groupby(["日期_str", "情感倾向"]).size().unstack(fill_value=0)
        for s in ["正面", "中性", "负面"]:
            if s not in daily.columns:
                daily[s] = 0
        
        daily = daily.sort_index()
        daily["total"] = daily.sum(axis=1)
        daily["正面率"] = daily["正面"] / daily["total"]
        daily["负面率"] = daily["负面"] / daily["total"]
        
        line = (
            Line(init_opts=opts.InitOpts(theme=ThemeType.MACARONS, width="100%", height="400px"))
            .add_xaxis(daily.index.tolist())
            .add_yaxis("正面率", daily["正面率"].round(3).tolist(), is_smooth=True, color=COLORS["positive"])
            .add_yaxis("负面率", daily["负面率"].round(3).tolist(), is_smooth=True, color=COLORS["negative"])
            .set_global_opts(
                title_opts=opts.TitleOpts(title="📈 情感趋势", pos_left="center"),
                xaxis_opts=opts.AxisOpts(axislabel_opts=opts.LabelOpts(rotate=45)),
                tooltip_opts=opts.TooltipOpts(trigger="axis"),
                datazoom_opts=[opts.DataZoomOpts(type_="inside")],
            )
        )
        
        return line
    
    def create_platform_chart(self):
        if len(self.filtered_df) == 0:
            return None
        
        platform_stats = self.filtered_df.groupby("平台").agg({
            "评论ID": "count",
            "情感分数": "mean",
        }).round(2)
        platform_stats.columns = ["评论数", "平均情感分"]
        platform_stats = platform_stats.sort_values("评论数", ascending=False)
        
        bar = (
            Bar(init_opts=opts.InitOpts(theme=ThemeType.MACARONS, width="100%", height="400px"))
            .add_xaxis(platform_stats.index.tolist())
            .add_yaxis("评论数", platform_stats["评论数"].tolist())
            .set_global_opts(
                title_opts=opts.TitleOpts(title="📱 平台分布", pos_left="center"),
                xaxis_opts=opts.AxisOpts(axislabel_opts=opts.LabelOpts(rotate=45)),
                tooltip_opts=opts.TooltipOpts(trigger="axis"),
                datazoom_opts=[opts.DataZoomOpts(type_="slider")],
            )
        )
        
        return bar
    
    def create_wordcloud(self, sentiment_type, title):
        if len(self.filtered_df) == 0:
            return None
        
        if sentiment_type == "正面":
            comments = self.filtered_df[self.filtered_df["情感倾向"] == "正面"]["评论内容"].tolist()
            colors = ["#52c41a", "#73d13d", "#95de64"]
        elif sentiment_type == "负面":
            comments = self.filtered_df[self.filtered_df["情感倾向"] == "负面"]["评论内容"].tolist()
            colors = ["#ff4d4f", "#ff7875", "#ffa39e"]
        else:
            comments = self.filtered_df[self.filtered_df["情感倾向"] == "中性"]["评论内容"].tolist()
            colors = ["#1890ff", "#40a9ff", "#69c0ff"]
        
        if not comments:
            return None
        
        word_freq = self._get_word_freq(comments, top_n=100)
        
        if not word_freq:
            return None
        
        wordcloud = (
            WordCloud(init_opts=opts.InitOpts(theme=ThemeType.MACARONS, width="100%", height="400px"))
            .add(
                "",
                word_freq,
                word_size_range=[12, 80],
                shape="cardioid",
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(title=title, pos_left="center"),
            )
        )
        
        return wordcloud
    
    def create_hourly_chart(self):
        if len(self.filtered_df) == 0:
            return None
        
        hourly = self.filtered_df.groupby("小时")["评论ID"].count()
        
        bar = (
            Bar(init_opts=opts.InitOpts(theme=ThemeType.MACARONS, width="100%", height="350px"))
            .add_xaxis([f"{h}时" for h in hourly.index])
            .add_yaxis("评论数", hourly.tolist())
            .set_global_opts(
                title_opts=opts.TitleOpts(title="⏰ 时段分布", pos_left="center"),
                tooltip_opts=opts.TooltipOpts(trigger="axis"),
            )
        )
        
        return bar
    
    def create_top_comments(self):
        if len(self.filtered_df) == 0:
            table = Table()
            table.add(["提示"], [["没有数据"]])
            table.set_global_opts(title_opts=opts.ComponentTitleOpts(title="🔥 热门评论"))
            return table
        
        table = Table()
        
        positive = self.filtered_df[self.filtered_df["情感倾向"] == "正面"].nlargest(3, "点赞数")
        negative = self.filtered_df[self.filtered_df["情感倾向"] == "负面"].nlargest(3, "点赞数")
        
        headers = ["🔥 类型", "💬 评论", "❤️ 点赞"]
        rows = []
        
        for _, row in positive.iterrows():
            rows.append(["😊 正面", row["评论内容"][:40] + "..." if len(row["评论内容"]) > 40 else row["评论内容"], row["点赞数"]])
        
        for _, row in negative.iterrows():
            rows.append(["😠 负面", row["评论内容"][:40] + "..." if len(row["评论内容"]) > 40 else row["评论内容"], row["点赞数"]])
        
        table.add(headers, rows)
        table.set_global_opts(title_opts=opts.ComponentTitleOpts(title="🔥 热门评论展示"))
        
        return table
    
    def generate_filter_info(self):
        start_date = self.df["日期"].min().strftime("%Y-%m-%d")
        end_date = self.df["日期"].max().strftime("%Y-%m-%d")
        platforms = sorted(self.df["平台"].unique().tolist())
        top_keywords = self.keywords_list[:50]
        
        filter_info = {
            "date_range": {"start": start_date, "end": end_date},
            "platforms": platforms,
            "top_keywords": top_keywords,
            "total_count": len(self.df),
        }
        
        return filter_info
    
    def generate_dashboard(self, keyword=None, start_date=None, end_date=None, platform=None, sentiment=None):
        print("\n🎨 应用筛选条件...")
        
        self.filtered_df = self.df.copy()
        
        if keyword:
            self.filter_by_keyword(keyword)
        if start_date and end_date:
            self.filter_by_date_range(start_date, end_date)
        if platform and platform != "全部":
            self.filter_by_platform(platform)
        if sentiment and sentiment != "全部":
            self.filter_by_sentiment(sentiment)
        
        page = Page(
            page_title="社交媒体情感分析看板（带筛选）",
            layout=Page.DraggablePageLayout,
        )
        
        page.add(self.create_summary_table())
        
        pie = self.create_sentiment_pie()
        if pie:
            page.add(pie)
        
        trend = self.create_trend_chart()
        if trend:
            page.add(trend)
        
        platform_chart = self.create_platform_chart()
        if platform_chart:
            page.add(platform_chart)
        
        hourly = self.create_hourly_chart()
        if hourly:
            page.add(hourly)
        
        pos_wc = self.create_wordcloud("正面", "☁️ 正面词云")
        if pos_wc:
            page.add(pos_wc)
        
        neg_wc = self.create_wordcloud("负面", "☁️ 负面词云")
        if neg_wc:
            page.add(neg_wc)
        
        page.add(self.create_top_comments())
        
        return page
    
    def run_all_presets(self):
        print("\n" + "=" * 70)
        print("📊 生成多套预设看板
        print("=" * 70)
        
        filter_info = self.generate_filter_info()
        
        presets = [
            {"name": "全部数据", "keyword": None, "platform": "全部", "sentiment": "全部"},
            {"name": "仅正面评论", "keyword": None, "platform": "全部", "sentiment": "正面"},
            {"name": "仅负面评论", "keyword": None, "platform": "全部", "sentiment": "负面"},
        ]
        
        for preset in presets:
            print(f"\n🎯 生成: {preset['name']}...")
            page = self.generate_dashboard(
                keyword=preset["keyword"],
                platform=preset["platform"],
                sentiment=preset["sentiment"]
            )
            
            safe_name = preset["name"].replace(" ", "_")
            output_file = f"dashboard_{safe_name}.html"
            page.render(output_file)
            print(f"   ✅ 已保存: {output_file}")
        
        print("\n" + "=" * 70)
        print("📋 筛选信息（用于自定义筛选）:
        print("=" * 70)
        print(f"📅 日期范围: {filter_info['date_range']['start']} ~ {filter_info['date_range']['end']}")
        print(f"📱 可用平台: {', '.join(filter_info['platforms'][:10])}...")
        print(f"🔍 热门关键词: {', '.join(filter_info['top_keywords'][:15])}")
        print("=" * 70)
        
        return filter_info


def generate_html_template():
    html_template = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>社交媒体评论情感分析看板</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 30px; margin-bottom: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .header h1 { color: #262626; font-size: 28px; margin-bottom: 10px; }
        .header p { color: #8c8c8c; font-size: 14px; }
        .filter-panel { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .filter-title { font-size: 16px; font-weight: bold; color: #262626; margin-bottom: 15px; }
        .filter-row { display: flex; flex-wrap: wrap; gap: 20px; align-items: center; }
        .filter-group { flex: 1; min-width: 200px; }
        .filter-group label { display: block; font-size: 13px; color: #595959; margin-bottom: 8px; }
        .filter-group input, .filter-group select { width: 100%; padding: 10px 15px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; transition: all 0.3s; }
        .filter-group input:focus, .filter-group select:focus { outline: none; border-color: #1890ff; }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.3s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(600px, 1fr)); gap: 20px; }
        .chart-card { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); min-height: 400px; }
        .chart-card h3 { font-size: 16px; color: #262626; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0; }
        .chart-container { width: 100%; height: 400px; }
        .kpi-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .kpi-card { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
        .kpi-value { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .kpi-label { font-size: 13px; color: #8c8c8c; }
        .positive { color: #52c41a; }
        .negative { color: #ff4d4f; }
        .neutral { color: #1890ff; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab { padding: 10px 20px; background: rgba(255,255,255,0.8); border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
        .tab.active { background: #1890ff; color: white; }
        .tab:hover { background: rgba(24, 144, 255, 0.1); }
        .instructions { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .instructions h3 { color: #262626; margin-bottom: 15px; }
        .instructions ul { color: #595959; line-height: 2; padding-left: 20px; }
        .footer { text-align: center; padding: 20px; color: rgba(255,255,255,0.8); font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 社交媒体评论情感分析看板</h1>
            <p>智能分析用户情感倾向，洞察用户反馈，优化产品服务</p>
        </div>
        
        <div class="instructions">
            <h3>💡 使用说明</h3>
            <ul>
                <li><strong>方式一：</strong>直接打开已生成的看板文件：
                    <code>dashboard_全部数据.html</code>、
                    <code>dashboard_仅正面评论.html</code>、
                    <code>dashboard_仅负面评论.html</code>
                </li>
                <li><strong>方式二：</strong>运行 <code>dashboard_with_filters.py</code> 进行自定义筛选分析</li>
                <li><strong>支持的筛选条件：</strong>关键词、日期范围、平台、情感类型</li>
                <li><strong>图表类型：</strong>情感分布饼图、趋势折线图、平台分布图、词云图、时段分析</li>
            </ul>
        </div>
        
        <div class="kpi-cards">
            <div class="kpi-card">
                <div class="kpi-value neutral" id="kpi-total">--</div>
                <div class="kpi-label">总评论数</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value positive" id="kpi-positive">--</div>
                <div class="kpi-label">正面评论</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value negative" id="kpi-negative">--</div>
                <div class="kpi-label">负面评论</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value neutral" id="kpi-score">--</div>
                <div class="kpi-label">平均情感分</div>
            </div>
        </div>
        
        <div class="filter-panel">
            <div class="filter-title">🔍 数据筛选（使用 Python 脚本筛选功能）</div>
            <div class="filter-row">
                <div class="filter-group">
                    <label>📝 关键词筛选</label>
                    <input type="text" id="keyword" placeholder="输入关键词，如：产品、服务、体验...">
                </div>
                <div class="filter-group">
                    <label>📅 开始日期</label>
                    <input type="date" id="startDate">
                </div>
                <div class="filter-group">
                    <label>📅 结束日期</label>
                    <input type="date" id="endDate">
                </div>
                <div class="filter-group">
                    <label>📱 平台</label>
                    <select id="platform">
                        <option value="全部">全部平台</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>💭 情感</label>
                    <select id="sentiment">
                        <option value="全部">全部情感</option>
                        <option value="正面">仅正面</option>
                        <option value="负面">仅负面</option>
                        <option value="中性">仅中性</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="tabs">
            <div class="tab active" onclick="alert('请运行 Python 脚本生成自定义看板')">📊 查看已生成看板</div>
        </div>
        
        <div class="dashboard-grid">
            <div class="chart-card">
                <h3>🥧 情感分布饼图</h3>
                <div class="chart-container" id="pie-chart"></div>
            </div>
            <div class="chart-card">
                <h3>📈 情感趋势折线图</h3>
                <div class="chart-container" id="line-chart"></div>
            </div>
            <div class="chart-card">
                <h3>📱 平台分布</h3>
                <div class="chart-container" id="platform-chart"></div>
            </div>
            <div class="chart-card">
                <h3>⏰ 时段分布</h3>
                <div class="chart-container" id="hourly-chart"></div>
            </div>
        </div>
        
        <div class="footer">
            <p>🚀 社交媒体评论情感分析系统 | 基于 SnowNLP & Pyecharts</p>
        </div>
    </div>
    
    <script>
        console.log('📊 情感分析看板已加载');
        console.log('💡 提示：请运行 Python 脚本生成具体的看板文件');
    </script>
</body>
</html>
'''
    
    with open('dashboard_template.html', 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    print("\n✅ 模板文件已创建: dashboard_template.html")


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("🔍 社交媒体评论情感分析系统（带筛选功能）")
    print("=" * 70)
    
    dashboard = FilterableDashboard()
    dashboard.load_data()
    
    filter_info = dashboard.run_all_presets()
    
    generate_html_template()
    
    print("\n" + "=" * 70)
    print("✅ 全部完成！")
    print("=" * 70)
    print("\n📂 生成的文件:
    print("   1. dashboard_全部数据.html - 完整数据分析看板")
    print("   2. dashboard_仅正面评论.html - 正面评论分析")
    print("   3. dashboard_仅负面评论.html - 负面评论分析")
    print("   4. dashboard_template.html - 交互式筛选模板")
    print("\n💡 使用方法:")
    print("   - 直接用浏览器打开任意 .html 文件查看分析结果")
    print("   - 如需自定义筛选，修改 dashboard_with_filters.py 中的参数后重新运行")
    print("=" * 70)
