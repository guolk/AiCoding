import type {
  Observation,
  MonthlyStats,
  YearlyStats,
  ClimateExtremes,
  SeasonTransition,
  TrendResult,
  ClimateAnomaly,
  WindRoseData,
  ElementKey,
} from '@/types';
import { ELEMENT_LABELS, ELEMENT_UNITS } from '@/types';
import { calculateMonthlyStats, calculateYearlyStats, calculateClimateExtremes } from './statistics';
import { determineSeasonTransitions, getSeasonName } from './seasons';
import { calculateWindRose, getDominantDirection } from './wind';

export function generateMonthlyReport(
  observations: Observation[],
  year: number,
  month: number,
  normals?: { avgTemperature: number; totalPrecipitation: number }[]
): string {
  const monthly = calculateMonthlyStats(observations, year, month);
  const extremes = calculateClimateExtremes(
    observations.filter((o) => {
      const d = new Date(o.datetime);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
  );

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  let report = `# ${year}年${monthNames[month - 1]}气候特征分析报告\n\n`;

  report += `## 一、基本概况\n\n`;
  report += `- 观测次数：${monthly.observationCount}次\n`;
  if (!isNaN(monthly.avgTemperature)) {
    report += `- 平均气温：${monthly.avgTemperature.toFixed(1)}${ELEMENT_UNITS.temperature}\n`;
  }
  if (!isNaN(monthly.maxTemperature)) {
    report += `- 极端最高气温：${monthly.maxTemperature.toFixed(1)}${ELEMENT_UNITS.temperature}`;
    if (extremes.maxTemperature.datetime) {
      report += `（${new Date(extremes.maxTemperature.datetime).getDate()}日）`;
    }
    report += '\n';
  }
  if (!isNaN(monthly.minTemperature)) {
    report += `- 极端最低气温：${monthly.minTemperature.toFixed(1)}${ELEMENT_UNITS.temperature}`;
    if (extremes.minTemperature.datetime) {
      report += `（${new Date(extremes.minTemperature.datetime).getDate()}日）`;
    }
    report += '\n';
  }
  if (!isNaN(monthly.totalPrecipitation)) {
    report += `- 降水量合计：${monthly.totalPrecipitation.toFixed(1)}${ELEMENT_UNITS.precipitation}\n`;
  }
  if (!isNaN(monthly.avgHumidity)) {
    report += `- 平均相对湿度：${monthly.avgHumidity.toFixed(0)}${ELEMENT_UNITS.humidity}\n`;
  }
  if (!isNaN(monthly.avgWindSpeed)) {
    report += `- 平均风速：${monthly.avgWindSpeed.toFixed(1)}${ELEMENT_UNITS.windSpeed}\n`;
  }
  if (!isNaN(monthly.avgVisibility)) {
    report += `- 平均能见度：${monthly.avgVisibility.toFixed(1)}${ELEMENT_UNITS.visibility}\n`;
  }
  report += '\n';

  if (normals && normals[month - 1]) {
    const normal = normals[month - 1];
    report += `## 二、气候距平分析\n\n`;

    if (!isNaN(monthly.avgTemperature) && !isNaN(normal.avgTemperature)) {
      const tempAnomaly = monthly.avgTemperature - normal.avgTemperature;
      const tempDesc = tempAnomaly > 0 ? '偏高' : tempAnomaly < 0 ? '偏低' : '持平';
      report += `- 气温较常年同期${tempDesc} ${Math.abs(tempAnomaly).toFixed(1)}${ELEMENT_UNITS.temperature}\n`;
    }

    if (!isNaN(monthly.totalPrecipitation) && !isNaN(normal.totalPrecipitation)) {
      const precAnomaly = monthly.totalPrecipitation - normal.totalPrecipitation;
      const precAnomalyPercent =
        normal.totalPrecipitation > 0
          ? ((precAnomaly / normal.totalPrecipitation) * 100).toFixed(0)
          : '0';
      const precDesc = precAnomaly > 0 ? '偏多' : precAnomaly < 0 ? '偏少' : '持平';
      report += `- 降水量较常年同期${precDesc} ${Math.abs(precAnomaly).toFixed(1)}${ELEMENT_UNITS.precipitation}（${precAnomalyPercent}%）\n`;
    }
    report += '\n';
  }

  const windRose = calculateWindRose(
    observations.filter((o) => {
      const d = new Date(o.datetime);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
  );

  report += `## 三、风向风速特征\n\n`;
  report += `- 主导风向：${getDominantDirection(windRose)}\n`;
  report += `- 静风频率：${windRose.calmFrequency.toFixed(1)}%\n`;

  const maxFreqDir = windRose.directions.reduce((max, d) => (d.frequency > max.frequency ? d : max), windRose.directions[0]);
  if (maxFreqDir && maxFreqDir.frequency > 0) {
    report += `- 最大风向频率：${maxFreqDir.direction} ${maxFreqDir.frequency.toFixed(1)}%\n`;
  }
  report += '\n';

  report += `## 四、综合评述\n\n`;

  const tempLevel = !isNaN(monthly.avgTemperature)
    ? monthly.avgTemperature < 0
      ? '寒冷'
      : monthly.avgTemperature < 10
        ? '偏冷'
        : monthly.avgTemperature < 22
          ? '温暖'
          : monthly.avgTemperature < 30
            ? '炎热'
            : '酷热'
    : '气温数据不足';

  const precLevel = !isNaN(monthly.totalPrecipitation)
    ? monthly.totalPrecipitation < 10
      ? '降水稀少'
      : monthly.totalPrecipitation < 50
        ? '降水偏少'
        : monthly.totalPrecipitation < 150
          ? '降水适中'
          : monthly.totalPrecipitation < 300
            ? '降水偏多'
            : '降水充沛'
    : '降水数据不足';

  report += `本月${year}年${monthNames[month - 1]}整体呈现"${tempLevel}、${precLevel}"的气候特征。`;

  if (normals && normals[month - 1]) {
    const normal = normals[month - 1];
    if (!isNaN(monthly.avgTemperature) && !isNaN(normal.avgTemperature)) {
      const tempAnomaly = monthly.avgTemperature - normal.avgTemperature;
      if (Math.abs(tempAnomaly) >= 2) {
        report += `气温${tempAnomaly > 0 ? '偏高明显' : '偏低显著'}，`;
      }
    }
  }

  if (!isNaN(monthly.totalPrecipitation) && monthly.totalPrecipitation > 100) {
    report += `需关注强降水可能引发的城市内涝和地质灾害。`;
  } else if (!isNaN(monthly.totalPrecipitation) && monthly.totalPrecipitation < 20) {
    report += `降水偏少，需注意森林防火和抗旱工作。`;
  }

  report += '\n\n---\n';
  report += `*报告生成时间：${new Date().toLocaleString('zh-CN')}*\n`;

  return report;
}

export function generateYearlyReport(
  observations: Observation[],
  year: number,
  seasonTransitions?: SeasonTransition[]
): string {
  const yearly = calculateYearlyStats(observations, year);

  let report = `# ${year}年气候特征综合分析报告\n\n`;

  report += `## 一、年度概览\n\n`;
  report += `- 观测次数：${yearly.observationCount}次\n`;
  if (!isNaN(yearly.avgTemperature)) {
    report += `- 年平均气温：${yearly.avgTemperature.toFixed(1)}${ELEMENT_UNITS.temperature}\n`;
  }
  if (!isNaN(yearly.maxTemperature)) {
    report += `- 年极端最高气温：${yearly.maxTemperature.toFixed(1)}${ELEMENT_UNITS.temperature}\n`;
  }
  if (!isNaN(yearly.minTemperature)) {
    report += `- 年极端最低气温：${yearly.minTemperature.toFixed(1)}${ELEMENT_UNITS.temperature}\n`;
  }
  if (!isNaN(yearly.totalPrecipitation)) {
    report += `- 年降水量：${yearly.totalPrecipitation.toFixed(1)}${ELEMENT_UNITS.precipitation}\n`;
  }
  report += '\n';

  report += `## 二、四季特征\n\n`;

  const seasons = seasonTransitions || determineSeasonTransitions(observations, year);

  if (seasons.length > 0) {
    for (const s of seasons) {
      const date = new Date(s.date);
      report += `- ${getSeasonName(s.season)}：${date.getMonth() + 1}月${date.getDate()}日前后（候平均气温${s.pentadMeanTemp.toFixed(1)}°C）\n`;
    }
  } else {
    report += `*当年数据不足以判定季节划分*\n`;
  }
  report += '\n';

  report += `## 三、各月统计\n\n`;
  report += `| 月份 | 平均气温(°C) | 最高气温(°C) | 最低气温(°C) | 降水量(mm) |\n`;
  report += `|:---:|:---:|:---:|:---:|:---:|\n`;

  for (let m = 0; m < 12; m++) {
    const ms = yearly.monthlyStats[m];
    if (ms && ms.observationCount > 0) {
      report += `| ${m + 1} | ${isNaN(ms.avgTemperature) ? '-' : ms.avgTemperature.toFixed(1)} | ${isNaN(ms.maxTemperature) ? '-' : ms.maxTemperature.toFixed(1)} | ${isNaN(ms.minTemperature) ? '-' : ms.minTemperature.toFixed(1)} | ${isNaN(ms.totalPrecipitation) ? '-' : ms.totalPrecipitation.toFixed(1)} |\n`;
    }
  }
  report += '\n';

  report += `## 四、综合评述\n\n`;

  if (!isNaN(yearly.avgTemperature)) {
    report += `本年度平均气温为${yearly.avgTemperature.toFixed(1)}°C，`;
    if (yearly.avgTemperature < 10) {
      report += `整体偏冷，`;
    } else if (yearly.avgTemperature > 20) {
      report += `整体偏暖，`;
    } else {
      report += `气候温和，`;
    }
  }

  if (!isNaN(yearly.totalPrecipitation)) {
    report += `年降水量${yearly.totalPrecipitation.toFixed(1)}mm，`;
    if (yearly.totalPrecipitation < 400) {
      report += `降水偏少，较为干旱。`;
    } else if (yearly.totalPrecipitation > 1200) {
      report += `降水充沛，较为湿润。`;
    } else {
      report += `降水适中。`;
    }
  }

  report += '\n\n---\n';
  report += `*报告生成时间：${new Date().toLocaleString('zh-CN')}*\n`;

  return report;
}

export function generateTrendDescription(
  trend: TrendResult,
  element: ElementKey,
  years: number[]
): string {
  const label = ELEMENT_LABELS[element];
  const unit = ELEMENT_UNITS[element];

  if (trend.rSquared < 0.1) {
    return `${label}在${years[0]}-${years[years.length - 1]}年期间变化趋势不显著（R²=${trend.rSquared.toFixed(2)}），序列波动较大但无明显线性趋势。`;
  }

  const direction =
    trend.slope > 0.01 ? '上升' : trend.slope < -0.01 ? '下降' : '基本平稳';
  const significance =
    trend.rSquared > 0.5 ? '显著' : trend.rSquared > 0.3 ? '较为显著' : '有一定';

  return `${label}在${years[0]}-${years[years.length - 1]}年期间呈${direction}趋势，气候倾向率为${trend.trendPerDecade.toFixed(2)}${unit}/10年，${significance}（R²=${trend.rSquared.toFixed(2)}）。`;
}
