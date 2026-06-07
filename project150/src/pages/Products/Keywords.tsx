import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Plus, Search, TrendingUp, TrendingDown, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { platformNames, platformColors, formatDate } from '@/lib/api';
import type { KeywordRank, Product, Platform } from '@/../shared/types';

interface KeywordGroup {
  keyword: string;
  productId: string;
  product: Product | undefined;
  platform: Platform;
  currentRank: number;
  targetRank: number;
  history: KeywordRank[];
  isAlert: boolean;
}

interface AddKeywordForm {
  productId: string;
  keyword: string;
  targetRank: number;
  platform: Platform;
}

export function Keywords() {
  const { keywordRanks, products } = useAppStore();
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordGroup | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [formData, setFormData] = useState<AddKeywordForm>({
    productId: '',
    keyword: '',
    targetRank: 10,
    platform: 'amazon',
  });

  const keywordGroups = useMemo((): KeywordGroup[] => {
    const groups = new Map<string, KeywordGroup>();

    keywordRanks.forEach((rank) => {
      const key = `${rank.keyword}-${rank.productId}`;
      if (!groups.has(key)) {
        const product = products.find((p) => p.id === rank.productId);
        groups.set(key, {
          keyword: rank.keyword,
          productId: rank.productId,
          product,
          platform: rank.platform,
          currentRank: rank.rank,
          targetRank: rank.targetRank || 10,
          history: [],
          isAlert: false,
        });
      }
      const group = groups.get(key)!;
      group.history.push(rank);
    });

    const result: KeywordGroup[] = [];
    groups.forEach((group) => {
      const sortedHistory = [...group.history].sort((a, b) => a.date.localeCompare(b.date));
      const latest = sortedHistory[sortedHistory.length - 1];
      const target = group.targetRank;
      result.push({
        ...group,
        currentRank: latest.rank,
        targetRank: target,
        history: sortedHistory,
        isAlert: latest.rank > target,
      });
    });

    return result.sort((a, b) => {
      if (a.isAlert && !b.isAlert) return -1;
      if (!a.isAlert && b.isAlert) return 1;
      return a.currentRank - b.currentRank;
    });
  }, [keywordRanks, products]);

  const filteredKeywords = useMemo(() => {
    return keywordGroups.filter((kg) => {
      const matchesSearch =
        kg.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kg.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === 'all' || kg.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [keywordGroups, searchTerm, platformFilter]);

  const alertCount = keywordGroups.filter((kg) => kg.isAlert).length;

  const handleAddKeyword = () => {
    if (formData.productId && formData.keyword.trim()) {
      setShowAddModal(false);
      setFormData({ productId: '', keyword: '', targetRank: 10, platform: 'amazon' });
    }
  };

  const RankChart = ({ data, targetRank }: { data: KeywordRank[]; targetRank: number }) => {
    const chartData = data.slice(-30).map((d) => ({
      date: d.date.slice(5),
      rank: d.rank,
      target: targetRank,
    }));

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              reversed
              domain={[1, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`第 ${value} 名`, '排名']}
            />
            <ReferenceLine
              y={targetRank}
              stroke="#F59E0B"
              strokeDasharray="5 5"
              label={{ value: `目标: ${targetRank}`, fill: '#F59E0B', fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="rank"
              name="排名"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索关键词或产品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">平台：</span>
          <div className="relative">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
              className="input-field appearance-none pr-10 min-w-32"
            >
              <option value="all">全部</option>
              <option value="amazon">Amazon</option>
              <option value="ebay">eBay</option>
              <option value="shopify">Shopify</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
        </div>

        {alertCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-danger-600/20 border border-danger-600/30 rounded-lg">
            <AlertTriangle size={16} className="text-danger-500" />
            <span className="text-sm text-danger-500 font-medium">{alertCount} 个关键词排名未达标</span>
          </div>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 ml-auto"
        >
          <Plus size={18} />
          <span>添加关键词</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>关键词</th>
                <th>产品</th>
                <th>平台</th>
                <th className="text-right">当前排名</th>
                <th className="text-right">目标排名</th>
                <th className="text-right">状态</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map((kg, index) => {
                const recentHistory = kg.history.slice(-7);
                const firstRank = recentHistory[0]?.rank || kg.currentRank;
                const rankDiff = firstRank - kg.currentRank;

                return (
                  <tr
                    key={`${kg.keyword}-${kg.productId}`}
                    onClick={() => setSelectedKeyword(selectedKeyword?.keyword === kg.keyword && selectedKeyword?.productId === kg.productId ? null : kg)}
                    className="cursor-pointer"
                  >
                    <td>
                      <div className="font-medium text-white">{kg.keyword}</div>
                    </td>
                    <td>
                      <div className="text-gray-300">{kg.product?.name || '未知产品'}</div>
                      <div className="text-xs text-gray-500 font-mono">SKU: {kg.product?.sku}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: platformColors[kg.platform] }}
                        />
                        <span className="text-gray-300">{platformNames[kg.platform]}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className={`text-2xl font-bold font-mono ${
                        kg.isAlert ? 'text-danger-500' : 'text-success-500'
                      }`}>
                        #{kg.currentRank}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-lg font-mono text-gray-400">#{kg.targetRank}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {kg.isAlert ? (
                          <span className="badge-danger">未达标</span>
                        ) : (
                          <span className="badge-success">已达标</span>
                        )}
                        <div className={`flex items-center gap-1 text-xs ${
                          rankDiff > 0 ? 'text-success-500' : rankDiff < 0 ? 'text-danger-500' : 'text-gray-500'
                        }`}>
                          {rankDiff > 0 ? (
                            <TrendingUp size={14} />
                          ) : rankDiff < 0 ? (
                            <TrendingDown size={14} />
                          ) : null}
                          <span>{rankDiff > 0 ? `+${rankDiff}` : rankDiff}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedKeyword && (
          <div className="border-t border-dark-700 p-6 bg-dark-800/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">
                  {selectedKeyword.keyword}
                </h4>
                <p className="text-sm text-gray-400">
                  {selectedKeyword.product?.name} · {platformNames[selectedKeyword.platform]}
                </p>
              </div>
              <button
                onClick={() => setSelectedKeyword(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <RankChart data={selectedKeyword.history} targetRank={selectedKeyword.targetRank} />
          </div>
        )}
      </div>

      {filteredKeywords.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Search size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">暂无匹配的关键词</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">添加追踪关键词</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">选择产品</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">请选择产品</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">平台</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                  className="input-field w-full"
                >
                  <option value="amazon">Amazon</option>
                  <option value="ebay">eBay</option>
                  <option value="shopify">Shopify</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">关键词</label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="输入要追踪的关键词"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  目标排名: <span className="text-white font-medium">#{formData.targetRank}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.targetRank}
                  onChange={(e) => setFormData({ ...formData, targetRank: parseInt(e.target.value) })}
                  className="w-full accent-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleAddKeyword}
                  className="btn-primary flex-1"
                  disabled={!formData.productId || !formData.keyword.trim()}
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
