import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { Card } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import {
  ChevronLeft,
  FileDown,
  FileJson,
  Download,
  Upload,
  Trash2,
  BarChart3,
  Target,
  Award,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { CATEGORY_INFO } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ExportCompare() {
  const { year } = useParams();
  const navigate = useNavigate();
  const { data, currentYear, setCurrentYear, importData, clearAllData } = useYearlyReviewStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [compareYears, setCompareYears] = useState<number[]>([]);

  useEffect(() => {
    if (year) {
      setCurrentYear(parseInt(year));
    }
  }, [year, setCurrentYear]);

  const displayYear = year ? parseInt(year) : currentYear;
  const yearData = data[displayYear];

  const availableYears = Object.keys(data).map(Number).sort((a, b) => b - a);

  const toggleYearCompare = (yr: number) => {
    setCompareYears(prev => 
      prev.includes(yr)
        ? prev.filter(y => y !== yr)
        : [...prev, yr]
    );
  };

  const getComparisonData = () => {
    return compareYears.map(yr => {
      const yd = data[yr];
      const stats = yd?.review.statistics;
      return {
        year: yr,
        goals: yd?.plan.goals.length || 0,
        achievements: yd?.gratitude.achievements.length || 0,
        gratitude: yd?.gratitude.gratitudeItems.length || 0,
        booksRead: stats?.booksRead || 0,
        exercise: stats?.exerciseCount || 0,
      };
    });
  };

  const exportToPDF = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${displayYear}-年度回顾报告.pdf`);
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `年度回顾数据-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (confirm('导入数据将覆盖现有数据，确定要继续吗？')) {
          importData(imported);
          alert('导入成功！');
        }
      } catch {
        alert('文件格式错误，请选择有效的 JSON 文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      if (confirm('再次确认：所有年度回顾数据将被永久删除。确定清除？')) {
        clearAllData();
        alert('数据已清除');
      }
    }
  };

  const comparisonData = getComparisonData();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-secondary-500">
            分享与存档
          </h1>
          <p className="text-gray-500 mt-1">
            {displayYear} 年 - 导出报告与对比往年数据
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FileDown className="w-5 h-5 text-primary-500" />
            <h3 className="font-display text-xl font-semibold text-secondary-500">
              导出报告
            </h3>
          </div>
          <p className="text-gray-500 mb-4">
            将你的年度回顾导出为 PDF 报告，方便保存和分享。
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={exportToPDF}
              loading={isExporting}
              fullWidth
              leftIcon={<Download className="w-4 h-4" />}
            >
              导出 PDF 报告
            </Button>
            <Button
              variant="outline"
              onClick={exportToJSON}
              fullWidth
              leftIcon={<FileJson className="w-4 h-4" />}
            >
              导出数据 (JSON)
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-secondary-500" />
            <h3 className="font-display text-xl font-semibold text-secondary-500">
              导入与管理
            </h3>
          </div>
          <p className="text-gray-500 mb-4">
            导入之前导出的数据，或管理现有数据。
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />

          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              leftIcon={<Upload className="w-4 h-4" />}
            >
              导入数据
            </Button>
            <Button
              variant="ghost"
              onClick={handleClearData}
              fullWidth
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="text-red-500 hover:bg-red-50"
            >
              清除所有数据
            </Button>
          </div>
        </Card>
      </div>

      {availableYears.length > 1 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <h3 className="font-display text-xl font-semibold text-secondary-500">
              年度对比
            </h3>
          </div>
          <p className="text-gray-500 mb-4">
            选择多个年份进行对比分析。
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => toggleYearCompare(yr)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  compareYears.includes(yr)
                    ? 'bg-primary-500 text-white'
                    : 'bg-warm-100 text-gray-600 hover:bg-warm-200'
                }`}
              >
                {yr} 年
              </button>
            ))}
          </div>

          {comparisonData.length >= 2 && (
            <>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="goals" stroke="#FF6B35" name="目标数量" strokeWidth={2} />
                    <Line type="monotone" dataKey="achievements" stroke="#1A365D" name="成就数量" strokeWidth={2} />
                    <Line type="monotone" dataKey="booksRead" stroke="#10B981" name="阅读书籍" strokeWidth={2} />
                    <Line type="monotone" dataKey="exercise" stroke="#8B5CF6" name="运动次数" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-warm-200">
                      <th className="text-left py-3 px-4 font-semibold text-secondary-500">年份</th>
                      <th className="text-center py-3 px-4 font-semibold text-secondary-500">目标</th>
                      <th className="text-center py-3 px-4 font-semibold text-secondary-500">成就</th>
                      <th className="text-center py-3 px-4 font-semibold text-secondary-500">感恩</th>
                      <th className="text-center py-3 px-4 font-semibold text-secondary-500">书籍</th>
                      <th className="text-center py-3 px-4 font-semibold text-secondary-500">运动</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item) => (
                      <tr key={item.year} className="border-b border-warm-100 hover:bg-warm-50">
                        <td className="py-3 px-4 font-medium text-secondary-500">{item.year} 年</td>
                        <td className="text-center py-3 px-4 text-gray-600">{item.goals}</td>
                        <td className="text-center py-3 px-4 text-gray-600">{item.achievements}</td>
                        <td className="text-center py-3 px-4 text-gray-600">{item.gratitude}</td>
                        <td className="text-center py-3 px-4 text-gray-600">{item.booksRead}</td>
                        <td className="text-center py-3 px-4 text-gray-600">{item.exercise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {compareYears.length < 2 && availableYears.length >= 2 && (
            <div className="text-center py-8 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>请选择至少两个年份进行对比</p>
            </div>
          )}
        </Card>
      )}

      <div className="hidden">
        <div ref={exportRef} className="bg-white p-8 max-w-3xl mx-auto">
          <div className="text-center mb-8 pb-6 border-b-2 border-primary-100">
            <h1 className="font-display text-4xl font-bold text-secondary-500 mb-2">
              {displayYear} 年度回顾报告
            </h1>
            <p className="text-gray-500">记录成长，规划未来</p>
          </div>

          {yearData?.review.timeline.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h2 className="font-display text-xl font-semibold text-secondary-500">
                  年度重要事件
                </h2>
              </div>
              <div className="space-y-2">
                {yearData.review.timeline.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
                    <span className="text-sm text-gray-400 flex-shrink-0">{event.date}</span>
                    <div>
                      <p className="font-medium text-secondary-500">{event.title}</p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yearData?.gratitude.achievements.filter(a => a.isHighlight).length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary-500" />
                <h2 className="font-display text-xl font-semibold text-secondary-500">
                  年度亮点
                </h2>
              </div>
              <div className="space-y-2">
                {yearData.gratitude.achievements.filter(a => a.isHighlight).map((a) => (
                  <div key={a.id} className="p-3 bg-primary-50 rounded-lg">
                    <p className="font-medium text-primary-700">{a.title}</p>
                    {a.description && (
                      <p className="text-sm text-primary-600 mt-1">{a.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {yearData?.plan.goals.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-500" />
                <h2 className="font-display text-xl font-semibold text-secondary-500">
                  {displayYear + 1} 年目标
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {yearData.plan.goals.map((goal) => (
                  <div key={goal.id} className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${CATEGORY_INFO[goal.category].color}`}>
                      {CATEGORY_INFO[goal.category].name}
                    </span>
                    <span className="text-gray-700">{goal.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yearData?.plan.tenYearVision && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <h2 className="font-display text-xl font-semibold text-secondary-500">
                  十年愿景
                </h2>
              </div>
              <div className="p-4 bg-gradient-to-r from-primary-50 to-warm-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{yearData.plan.tenYearVision}</p>
              </div>
            </div>
          )}

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-400">
              由「年度回顾与新年计划工具」生成
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/visualize/${displayYear}`)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          返回可视化总结
        </Button>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}
