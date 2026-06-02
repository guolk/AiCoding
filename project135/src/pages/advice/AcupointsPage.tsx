import { useState, useMemo } from 'react';
import { X, Search, MapPin, Hand, Target, Users } from 'lucide-react';
import { ACUPOINTS, type Acupoint } from '@/data/acupoints';
import Card from '@/components/Card';
import ConstitutionBadge from '@/components/ConstitutionBadge';
import { cn } from '@/lib/utils';

const CONSTITUTION_FILTERS = [
  { value: 'all', label: '全部体质' },
  { value: '平和质', label: '平和质' },
  { value: '气虚质', label: '气虚质' },
  { value: '阳虚质', label: '阳虚质' },
  { value: '阴虚质', label: '阴虚质' },
  { value: '痰湿质', label: '痰湿质' },
  { value: '湿热质', label: '湿热质' },
  { value: '血瘀质', label: '血瘀质' },
  { value: '气郁质', label: '气郁质' },
  { value: '特禀质', label: '特禀质' },
];

function AcupointSVG({ acupoint }: { acupoint: Acupoint }) {
  const locationMap: Record<string, { x: number; y: number; side?: 'left' | 'right' | 'both' }> = {
    '合谷': { x: 78, y: 52, side: 'both' },
    '内关': { x: 72, y: 42, side: 'both' },
    '足三里': { x: 68, y: 80, side: 'both' },
    '三阴交': { x: 58, y: 82, side: 'both' },
    '关元': { x: 50, y: 55 },
    '气海': { x: 50, y: 52 },
    '肾俞': { x: 50, y: 48, side: 'both' },
    '脾俞': { x: 50, y: 42, side: 'both' },
    '肺俞': { x: 50, y: 32, side: 'both' },
    '肝俞': { x: 50, y: 38, side: 'both' },
    '心俞': { x: 50, y: 30, side: 'both' },
    '太冲': { x: 52, y: 95, side: 'both' },
    '涌泉': { x: 52, y: 98, side: 'both' },
    '百会': { x: 50, y: 8 },
    '太阳穴': { x: 42, y: 15, side: 'both' },
    '迎香': { x: 48, y: 20, side: 'both' },
    '风池': { x: 50, y: 18, side: 'both' },
    '肩井': { x: 62, y: 28, side: 'both' },
    '中脘': { x: 50, y: 48 },
    '神阙': { x: 50, y: 52 },
  };

  const pos = locationMap[acupoint.name] || { x: 50, y: 50 };

  return (
    <div className="w-full max-w-xs mx-auto">
      <svg viewBox="0 0 100 120" className="w-full h-auto">
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F0E1" />
            <stop offset="100%" stopColor="#E8DFC8" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="12" rx="10" ry="10" fill="url(#bodyGradient)" stroke="#B5651D" strokeWidth="0.5" />
        <path d="M40 22 L40 40 L35 55 L38 70 L32 95 L36 98 L42 85 L46 95 L50 82 L54 95 L58 85 L64 98 L68 95 L62 70 L65 55 L60 40 L60 22 Z" fill="url(#bodyGradient)" stroke="#B5651D" strokeWidth="0.5" />
        <path d="M40 25 L28 45 L25 58 L30 60 L35 50 L40 35 Z" fill="url(#bodyGradient)" stroke="#B5651D" strokeWidth="0.5" />
        <path d="M60 25 L72 45 L75 58 L70 60 L65 50 L60 35 Z" fill="url(#bodyGradient)" stroke="#B5651D" strokeWidth="0.5" />
        <circle cx="50" cy="15" r="1.5" fill="#2C5F2D" opacity="0.3" />
        <circle cx="45" cy="18" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="55" cy="18" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="50" cy="30" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="50" cy="35" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="50" cy="40" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="50" cy="45" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="50" cy="50" r="1.5" fill="#2C5F2D" opacity="0.3" />
        <circle cx="50" cy="55" r="1.5" fill="#2C5F2D" opacity="0.3" />
        <circle cx="72" cy="42" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="78" cy="52" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="68" cy="80" r="1.5" fill="#2C5F2D" opacity="0.3" />
        <circle cx="58" cy="82" r="1.5" fill="#2C5F2D" opacity="0.3" />
        <circle cx="52" cy="95" r="1" fill="#2C5F2D" opacity="0.3" />
        <circle cx="62" cy="28" r="1" fill="#2C5F2D" opacity="0.3" />
        {pos.side === 'both' ? (
          <>
            <circle cx={pos.x} cy={pos.y} r="3" fill="#B5651D" opacity="0.8" />
            <circle cx={100 - pos.x} cy={pos.y} r="3" fill="#B5651D" opacity="0.8" />
            <circle cx={pos.x} cy={pos.y} r="1.5" fill="#fff" />
            <circle cx={100 - pos.x} cy={pos.y} r="1.5" fill="#fff" />
          </>
        ) : (
          <>
            <circle cx={pos.x} cy={pos.y} r="3.5" fill="#B5651D" opacity="0.9" />
            <circle cx={pos.x} cy={pos.y} r="1.8" fill="#fff" />
          </>
        )}
        <circle cx={pos.x} cy={pos.y} r="5" fill="none" stroke="#B5651D" strokeWidth="0.5" opacity="0.5">
          <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <p className="text-center text-sm text-gray-500 mt-2">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-secondary"></span>
          {acupoint.name}穴位置示意图
        </span>
      </p>
    </div>
  );
}

function AcupointModal({ acupoint, onClose }: { acupoint: Acupoint; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{acupoint.name}穴</h3>
              <p className="text-sm text-gray-500 mt-0.5">{acupoint.pinyin}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              穴位位置
            </h4>
            <AcupointSVG acupoint={acupoint} />
            <p className="text-gray-700 leading-relaxed mt-4 bg-white/60 p-4 rounded-xl">
              {acupoint.location}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Hand className="w-5 h-5 text-secondary" />
                按摩方法
              </h4>
              <p className="text-gray-700 leading-relaxed">{acupoint.method}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                主治症状
              </h4>
              <div className="flex flex-wrap gap-2">
                {acupoint.indications.map((indication, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {indication}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                适合体质
              </h4>
              <div className="flex flex-wrap gap-2">
                {acupoint.constitutionTypes.map((type, index) => (
                  <ConstitutionBadge key={index} type={type} size="md" />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-amber-700 text-sm leading-relaxed">
              <span className="font-semibold">温馨提示：</span>
              穴位按摩仅作为日常保健使用，如有严重健康问题请及时就医。孕妇或特殊人群请在专业医师指导下进行穴位按摩。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcupointsPage() {
  const [selectedAcupoint, setSelectedAcupoint] = useState<Acupoint | null>(null);
  const [filterConstitution, setFilterConstitution] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAcupoints = useMemo(() => {
    return ACUPOINTS.filter((acupoint) => {
      const matchesConstitution =
        filterConstitution === 'all' ||
        acupoint.constitutionTypes.includes(filterConstitution as any);
      const matchesSearch =
        acupoint.name.includes(searchQuery) ||
        acupoint.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acupoint.location.includes(searchQuery);
      return matchesConstitution && matchesSearch;
    });
  }, [filterConstitution, searchQuery]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">穴位推荐</h2>
            <p className="text-gray-500">常用保健穴位，按体质推荐，点击查看详情</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium">
              共 {ACUPOINTS.length} 个穴位
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索穴位名称、拼音或位置..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
        </div>
        <select
          value={filterConstitution}
          onChange={(e) => setFilterConstitution(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
        >
          {CONSTITUTION_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAcupoints.map((acupoint) => (
          <Card
            key={acupoint.id}
            hoverable
            onClick={() => setSelectedAcupoint(acupoint)}
            className="group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                  {acupoint.name}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">{acupoint.pinyin}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="text-lg">📍</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
              {acupoint.location}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {acupoint.constitutionTypes.slice(0, 3).map((type, index) => (
                <ConstitutionBadge key={index} type={type} size="sm" />
              ))}
              {acupoint.constitutionTypes.length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                  +{acupoint.constitutionTypes.length - 3}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredAcupoints.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">未找到匹配的穴位</h4>
          <p className="text-gray-500">请尝试其他搜索关键词或筛选条件</p>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          穴位按摩小常识
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/70 rounded-xl p-4">
            <h5 className="font-semibold text-primary mb-2">按摩时间</h5>
            <p className="text-sm text-gray-600">
              每个穴位每次按摩1-5分钟，每天可按摩1-2次，晨起或睡前效果更佳。
            </p>
          </div>
          <div className="bg-white/70 rounded-xl p-4">
            <h5 className="font-semibold text-primary mb-2">按摩力度</h5>
            <p className="text-sm text-gray-600">
              力度适中，以感到酸胀、麻痛但能忍受为宜，避免用力过猛造成损伤。
            </p>
          </div>
          <div className="bg-white/70 rounded-xl p-4">
            <h5 className="font-semibold text-primary mb-2">注意事项</h5>
            <p className="text-sm text-gray-600">
              孕妇腹部、腰骶部穴位禁用，皮肤破损处不宜按摩，过饥过饱时避免按摩。
            </p>
          </div>
        </div>
      </Card>

      {selectedAcupoint && (
        <AcupointModal
          acupoint={selectedAcupoint}
          onClose={() => setSelectedAcupoint(null)}
        />
      )}
    </div>
  );
}
