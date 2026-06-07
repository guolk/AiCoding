import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import RadarChart from '@/components/charts/RadarChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store';
import { getCurrentYear } from '@/utils/dateUtils';

const TECHNICAL_FIELD_OPTIONS = [
  { value: '', label: '全部技术领域' },
];

const HOT_WORDS = [
  { word: '人工智能', count: 45 },
  { word: '机器学习', count: 38 },
  { word: '深度学习', count: 32 },
  { word: '神经网络', count: 28 },
  { word: '大数据', count: 25 },
  { word: '云计算', count: 22 },
  { word: '边缘计算', count: 18 },
  { word: '物联网', count: 16 },
  { word: '区块链', count: 14 },
  { word: '自然语言处理', count: 12 },
  { word: '计算机视觉', count: 10 },
  { word: '知识图谱', count: 8 },
];

const getWordSize = (count: number) => {
  if (count >= 40) return 'text-xl font-bold';
  if (count >= 30) return 'text-lg font-semibold';
  if (count >= 20) return 'text-base font-medium';
  if (count >= 10) return 'text-sm';
  return 'text-xs';
};

export default function PatentMap() {
  const { competitorPatents } = useAppStore();
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [technicalField, setTechnicalField] = useState('');
  const [competitorFilter, setCompetitorFilter] = useState('');

  const currentYear = getCurrentYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const competitors = useMemo(() => {
    const unique = [...new Set(competitorPatents.map((p) => p.competitorName))];
    return [{ value: '', label: '全部竞争对手' }, ...unique.map((c) => ({ value: c, label: c }))];
  }, [competitorPatents]);

  const technicalFields = useMemo(() => {
    const unique = [...new Set(competitorPatents.map((p) => p.technicalField))];
    return [{ value: '', label: '全部技术领域' }, ...unique.map((f) => ({ value: f, label: f }))];
  }, [competitorPatents]);

  const filteredPatents = useMemo(() => {
    return competitorPatents.filter((patent) => {
      const appYear = new Date(patent.applicationDate).getFullYear();
      const matchesStart = startYear === '' || appYear >= parseInt(startYear);
      const matchesEnd = endYear === '' || appYear <= parseInt(endYear);
      const matchesField = technicalField === '' || patent.technicalField === technicalField;
      const matchesCompetitor = competitorFilter === '' || patent.competitorName === competitorFilter;
      return matchesStart && matchesEnd && matchesField && matchesCompetitor;
    });
  }, [competitorPatents, startYear, endYear, technicalField, competitorFilter]);

  const radarData = useMemo(() => {
    const allFields = [...new Set(filteredPatents.map((p) => p.technicalField))];
    const allCompetitors = [...new Set(filteredPatents.map((p) => p.competitorName))];

    return allFields.map((field) => {
      const entry: { subject: string; [key: string]: number | string } = { subject: field };
      allCompetitors.forEach((comp) => {
        entry[comp] = filteredPatents.filter((p) => p.technicalField === field && p.competitorName === comp).length;
      });
      return entry;
    });
  }, [filteredPatents]);

  const radarSeries = useMemo(() => {
    const allCompetitors = [...new Set(filteredPatents.map((p) => p.competitorName))];
    return allCompetitors.map((comp) => ({ dataKey: comp, name: comp }));
  }, [filteredPatents]);

  const ipcData = useMemo(() => {
    const ipcMap = new Map<string, number>();
    filteredPatents.forEach((p) => {
      const ipc = p.ipcClassification.split('/')[0];
      ipcMap.set(ipc, (ipcMap.get(ipc) || 0) + 1);
    });
    return Array.from(ipcMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filteredPatents]);

  const pieData = useMemo(() => {
    const compMap = new Map<string, number>();
    filteredPatents.forEach((p) => {
      compMap.set(p.competitorName, (compMap.get(p.competitorName) || 0) + 1);
    });
    return Array.from(compMap.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredPatents]);

  const lineData = useMemo(() => {
    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 4 + i));
    const fields = [...new Set(filteredPatents.map((p) => p.technicalField))];

    return years.map((year) => {
      const entry: { name: string; [key: string]: number | string } = { name: `${year}年` };
      fields.forEach((field) => {
        entry[field] = filteredPatents.filter((p) => {
          const y = new Date(p.applicationDate).getFullYear();
          return String(y) === year && p.technicalField === field;
        }).length;
      });
      return entry;
    });
  }, [filteredPatents, currentYear]);

  const lineConfig = useMemo(() => {
    const fields = [...new Set(filteredPatents.map((p) => p.technicalField))];
    return fields.map((field) => ({ dataKey: field, name: field }));
  }, [filteredPatents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">专利地图分析</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select placeholder="开始年份" value={startYear} onChange={(e) => setStartYear(e.target.value)} options={[{ value: '', label: '开始年份' }, ...yearOptions]} />
            <Select placeholder="结束年份" value={endYear} onChange={(e) => setEndYear(e.target.value)} options={[{ value: '', label: '结束年份' }, ...yearOptions]} />
            <Select placeholder="技术领域" value={technicalField} onChange={(e) => setTechnicalField(e.target.value)} options={technicalFields} />
            <Select placeholder="竞争对手" value={competitorFilter} onChange={(e) => setCompetitorFilter(e.target.value)} options={competitors} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>技术领域分布</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              {radarData.length > 0 && radarSeries.length > 0 ? (
                <RadarChart data={radarData} series={radarSeries} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>IPC 分类统计</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              {ipcData.length > 0 ? (
                <BarChart data={ipcData} direction="horizontal" />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>竞争对手专利数量对比</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              {pieData.length > 0 ? (
                <PieChart data={pieData} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>技术发展趋势（近5年）</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              {lineData.length > 0 && lineConfig.length > 0 ? (
                <LineChart data={lineData} lines={lineConfig} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>技术热点词云</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 p-6 justify-center items-center min-h-40">
            {HOT_WORDS.map((item, index) => (
              <Badge
                key={index}
                variant="active"
                className={`${getWordSize(item.count)} px-4 py-2`}
                style={{ opacity: 0.6 + (item.count / 50) * 0.4 }}
              >
                {item.word}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
