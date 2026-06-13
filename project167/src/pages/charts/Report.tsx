import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { getAvailableYears, calculateClimateNormals } from '@/utils/statistics';
import { generateMonthlyReport, generateYearlyReport } from '@/utils/report';
import { determineSeasonTransitions } from '@/utils/seasons';
import { FileText, Calendar, Download, Copy, Check } from 'lucide-react';

type ReportType = 'monthly' | 'yearly';

export default function Report() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [year, setYear] = useState<number>(availableYears[availableYears.length - 1] || new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [copied, setCopied] = useState(false);

  const normals = useMemo(() => calculateClimateNormals(observations), [observations]);

  const reportContent = useMemo(() => {
    if (reportType === 'monthly') {
      return generateMonthlyReport(observations, year, month, normals);
    } else {
      const transitions = determineSeasonTransitions(observations, year);
      return generateYearlyReport(observations, year, transitions);
    }
  }, [observations, reportType, year, month, normals]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportType === 'monthly'
      ? `气候报告_${year}年${month}月.md`
      : `气候报告_${year}年度.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-slate-800 mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="ml-6 text-slate-600 leading-relaxed list-disc">
            {line.substring(2).replace(/\*([^*]+)\*/g, '$1')}
          </li>
        );
      } else if (line.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const cells = line.split('|').filter((c) => c.trim() !== '');
        if (!cells.every((c) => /^:?-+:?$/.test(c.trim()))) {
          tableRows.push(cells.map((c) => c.trim()));
        }
        if (i === lines.length - 1 || !lines[i + 1].startsWith('|')) {
          elements.push(
            <div key={`table-${i}`} className="my-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {tableRows[0]?.map((cell, idx) => (
                      <th key={idx}>{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          inTable = false;
          tableRows = [];
        }
      } else if (line.startsWith('---')) {
        elements.push(<hr key={i} className="my-4 border-slate-200" />);
      } else if (line.startsWith('*') && line.endsWith('*')) {
        elements.push(
          <p key={i} className="text-sm text-slate-400 italic mt-4">
            {line.replace(/\*/g, '')}
          </p>
        );
      } else if (line.trim() !== '') {
        elements.push(
          <p key={i} className="text-slate-600 leading-relaxed">
            {line.replace(/\*([^*]+)\*/g, '$1')}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">气候报告生成</h1>
        <p className="text-slate-500 mt-1">自动生成专业气候特征综合分析报告</p>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label flex items-center gap-2">
              <FileText className="w-4 h-4" />
              报告类型
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setReportType('monthly')}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  reportType === 'monthly'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                月度报告
              </button>
              <button
                onClick={() => setReportType('yearly')}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  reportType === 'yearly'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                年度报告
              </button>
            </div>
          </div>

          <div>
            <label className="input-label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              选择年份
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>

          {reportType === 'monthly' && (
            <div>
              <label className="input-label flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                选择月份
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="input"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="btn btn-secondary flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制报告
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          下载 Markdown
        </button>
      </div>

      <div className="card p-8">
        <div className="prose max-w-none">
          {renderMarkdown(reportContent)}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">原始 Markdown 源码</h2>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm leading-relaxed">
          <code>{reportContent}</code>
        </pre>
      </div>
    </div>
  );
}
