import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calculator, Save, History, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store';
import { PatentValuation, ValuationFactor } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';

interface FactorSlider { name: string; weight: number; key: string; }

const METHOD_LABELS: Record<string, string> = { COST: '成本法', INCOME: '收益法', MARKET: '市场法' };
const FACTOR_DEFAULTS: FactorSlider[] = [
  { name: '技术创新性', weight: 25, key: 'innovation' },
  { name: '市场应用前景', weight: 25, key: 'market' },
  { name: '权利稳定性', weight: 20, key: 'stability' },
  { name: '剩余保护期限', weight: 20, key: 'duration' },
  { name: '竞争强度', weight: 10, key: 'competition' },
];

export default function ValuationPage() {
  const { patents, patentValuations, addPatentValuation } = useAppStore();
  const [selectedPatentId, setSelectedPatentId] = useState('');
  const [valuationMethod, setValuationMethod] = useState('COST');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatentForHistory, setSelectedPatentForHistory] = useState<string | null>(null);
  const [factors, setFactors] = useState<FactorSlider[]>(FACTOR_DEFAULTS);

  const patentOptions = useMemo(() => patents.map(p => ({ value: p.id, label: p.name })), [patents]);
  const totalValuation = useMemo(() => patentValuations.reduce((sum, v) => sum + v.estimatedValue, 0), [patentValuations]);
  
  const latestValuations = useMemo(() => {
    const latest = new Map<string, PatentValuation>();
    patentValuations.forEach(v => {
      const existing = latest.get(v.patentId);
      if (!existing || new Date(v.valuationDate) > new Date(existing.valuationDate)) latest.set(v.patentId, v);
    });
    return Array.from(latest.values()).sort((a, b) => b.estimatedValue - a.estimatedValue);
  }, [patentValuations]);

  const trendData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 4 + i;
      const total = patentValuations.filter(v => new Date(v.valuationDate).getFullYear() === year)
        .reduce((sum, v) => sum + v.estimatedValue, 0);
      return { name: `${year}年`, 估值: total / 10000 };
    });
  }, [patentValuations]);

  const calculatedValue = useMemo(() => {
    if (!selectedPatentId) return 0;
    const methodMultiplier = valuationMethod === 'COST' ? 1 : valuationMethod === 'INCOME' ? 1.5 : 1.2;
    const factorScore = factors.reduce((sum, f) => sum + (f.weight / 100) * 0.8, 0) * 1000000;
    return Math.round((500000 + factorScore) * methodMultiplier);
  }, [selectedPatentId, valuationMethod, factors]);

  const handleFactorChange = (key: string, value: number) => {
    setFactors(prev => prev.map(f => f.key === key ? { ...f, weight: value } : f));
  };

  const handleSaveValuation = () => {
    if (!selectedPatentId) return;
    const valuationFactors: ValuationFactor[] = factors.map(f => ({
      name: f.name, weight: f.weight, score: Math.round(Math.random() * 40 + 60), description: `${f.name}评估`,
    }));
    addPatentValuation({
      patentId: selectedPatentId, valuationDate: new Date().toISOString(), valuationMethod,
      estimatedValue: calculatedValue, currency: 'CNY', factors: valuationFactors,
      assumptions: '基于当前市场状况', limitations: '仅供参考', valuer: '系统自动评估',
    });
  };

  const handleViewHistory = (patentId: string) => {
    setSelectedPatentForHistory(patentId);
    setShowHistoryModal(true);
  };

  const historyValuations = useMemo(() => {
    if (!selectedPatentForHistory) return [];
    return patentValuations.filter(v => v.patentId === selectedPatentForHistory)
      .sort((a, b) => new Date(b.valuationDate).getTime() - new Date(a.valuationDate).getTime());
  }, [selectedPatentForHistory, patentValuations]);

  const selectedPatentName = useMemo(() => patents.find(p => p.id === selectedPatentForHistory)?.name || '', [patents, selectedPatentForHistory]);

  const getChangePercent = (valuation: PatentValuation) => {
    const all = patentValuations.filter(v => v.patentId === valuation.patentId)
      .sort((a, b) => new Date(a.valuationDate).getTime() - new Date(b.valuationDate).getTime());
    const idx = all.findIndex(v => v.id === valuation.id);
    if (idx <= 0) return 0;
    return ((valuation.estimatedValue - all[idx - 1].estimatedValue) / all[idx - 1].estimatedValue) * 100;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">价值评估</h1>
        <p className="page-subtitle">专利资产估值与分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="总估值" value={formatCurrency(totalValuation)} trend={12.5} variant="primary" icon={<TrendingUp className="h-6 w-6" />} className="animate-slide-up" style={{ animationDelay: '0.1s' }} />
        <StatCard title="较上年变化" value="+18.5%" trend={18.5} variant="success" icon={<TrendingUp className="h-6 w-6" />} className="animate-slide-up" style={{ animationDelay: '0.2s' }} />
        <StatCard title="专利数量" value={patents.length} variant="accent" className="animate-slide-up" style={{ animationDelay: '0.3s' }} />
        <StatCard title="平均单件估值" value={formatCurrency(totalValuation / (patents.length || 1))} variant="primary" className="animate-slide-up" style={{ animationDelay: '0.4s' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />估值计算工具</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select label="选择专利" placeholder="请选择专利" value={selectedPatentId} onChange={(e) => setSelectedPatentId(e.target.value)} options={patentOptions} />
            <Select label="估值方法" value={valuationMethod} onChange={(e) => setValuationMethod(e.target.value)} options={Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }))} />
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">计算结果</p>
              <p className="text-2xl font-bold text-primary-700">{formatCurrency(calculatedValue)}</p>
            </div>
            <Button fullWidth onClick={handleSaveValuation} disabled={!selectedPatentId} leftIcon={<Save className="h-4 w-4" />}>保存估值</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <CardHeader><CardTitle>估值因素权重设置</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {factors.map((factor) => (
              <div key={factor.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">{factor.name}</label>
                  <span className="text-sm font-semibold text-primary-700">{factor.weight}%</span>
                </div>
                <input type="range" min="0" max="100" value={factor.weight} onChange={(e) => handleFactorChange(factor.key, parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-700" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <CardHeader><CardTitle>历年估值趋势</CardTitle></CardHeader>
        <CardContent className="h-64">
          <LineChart data={trendData} lines={[{ dataKey: '估值', color: '#0F3460', name: '总估值(万元)' }]} areaMode showLegend={false} />
        </CardContent>
      </Card>

      <Card className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
        <CardHeader><CardTitle>专利估值排行榜</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>专利名称</TableHead>
                <TableHead>最新估值</TableHead>
                <TableHead>较上次变化</TableHead>
                <TableHead>估值日期</TableHead>
                <TableHead>估值方法</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestValuations.slice(0, 10).map((v) => {
                const patent = patents.find(p => p.id === v.patentId);
                const change = getChangePercent(v);
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{patent?.name || '-'}</TableCell>
                    <TableCell>{formatCurrency(v.estimatedValue)}</TableCell>
                    <TableCell><Badge variant={change >= 0 ? 'success' : 'danger'}>{change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}{formatPercent(change / 100)}</Badge></TableCell>
                    <TableCell>{formatDate(v.valuationDate)}</TableCell>
                    <TableCell>{METHOD_LABELS[v.valuationMethod] || v.valuationMethod}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" leftIcon={<History className="h-4 w-4" />} onClick={() => handleViewHistory(v.patentId)}>历史</Button>
                        <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => setSelectedPatentId(v.patentId)}>重估</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <ModalContent className="max-w-3xl">
          <ModalHeader><ModalTitle>估值历史记录 - {selectedPatentName}</ModalTitle></ModalHeader>
          <ModalBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>估值日期</TableHead>
                  <TableHead>估值方法</TableHead>
                  <TableHead>估值金额</TableHead>
                  <TableHead>评估人</TableHead>
                  <TableHead>变化幅度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyValuations.map((v, idx) => {
                  const change = idx < historyValuations.length - 1 ? ((v.estimatedValue - historyValuations[idx + 1].estimatedValue) / historyValuations[idx + 1].estimatedValue) * 100 : 0;
                  return (
                    <TableRow key={v.id}>
                      <TableCell>{formatDate(v.valuationDate)}</TableCell>
                      <TableCell>{METHOD_LABELS[v.valuationMethod] || v.valuationMethod}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(v.estimatedValue)}</TableCell>
                      <TableCell>{v.valuer}</TableCell>
                      <TableCell>{idx < historyValuations.length - 1 && <Badge variant={change >= 0 ? 'success' : 'danger'}>{formatPercent(change / 100)}</Badge>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
