import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
  FlaskConical,
  Beaker,
  Sparkles,
  Gem,
  Magnet,
  Sun,
  BarChart3,
  Microscope,
  Atom,
  Ruler,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';
import type {
  ScientificData,
  Specimen,
  RarityLevel,
  MagneticProperty,
  FluorescenceType,
} from '@/types';
import {
  RARITY_LABELS,
  RARITY_COLORS,
  MAGNETIC_LABELS,
  FLUORESCENCE_LABELS,
} from '@/types';

interface FormData {
  specimenId: string;
  densityGcm3: string;
  refractiveIndexMin: string;
  refractiveIndexMax: string;
  birefringence: string;
  pleochroism: string;
  magneticProperty: MagneticProperty;
  fluorescenceUV: FluorescenceType;
  fluorescenceUVColor: string;
  fluorescenceLW: FluorescenceType;
  fluorescenceSW: FluorescenceType;
  xrdAnalyzed: boolean;
  xrdAnalysisDate: string;
  xrdLabName: string;
  xrdPeaks: string;
  xrdMineralIdentified: string;
  xrdNotes: string;
  spectroscopyRaman: string;
  spectroscopyInfrared: string;
  spectroscopyNotes: string;
  chemicalMethod: string;
  chemicalResults: string;
  chemicalLabName: string;
  chemicalAnalysisDate: string;
  rarity: RarityLevel;
  rarityNotes: string;
  testDate: string;
  labName: string;
  notes: string;
}

const defaultFormData: FormData = {
  specimenId: '',
  densityGcm3: '',
  refractiveIndexMin: '',
  refractiveIndexMax: '',
  birefringence: '',
  pleochroism: '',
  magneticProperty: 'none',
  fluorescenceUV: 'none',
  fluorescenceUVColor: '',
  fluorescenceLW: 'none',
  fluorescenceSW: 'none',
  xrdAnalyzed: false,
  xrdAnalysisDate: '',
  xrdLabName: '',
  xrdPeaks: '',
  xrdMineralIdentified: '',
  xrdNotes: '',
  spectroscopyRaman: '',
  spectroscopyInfrared: '',
  spectroscopyNotes: '',
  chemicalMethod: '',
  chemicalResults: '',
  chemicalLabName: '',
  chemicalAnalysisDate: '',
  rarity: 'common',
  rarityNotes: '',
  testDate: '',
  labName: '',
  notes: '',
};

function scientificDataToFormData(data: ScientificData): FormData {
  return {
    specimenId: data.specimenId,
    densityGcm3: data.densityGcm3?.toString() ?? '',
    refractiveIndexMin: data.refractiveIndexMin?.toString() ?? '',
    refractiveIndexMax: data.refractiveIndexMax?.toString() ?? '',
    birefringence: data.birefringence?.toString() ?? '',
    pleochroism: data.pleochroism ?? '',
    magneticProperty: data.magneticProperty ?? 'none',
    fluorescenceUV: data.fluorescenceUV ?? 'none',
    fluorescenceUVColor: data.fluorescenceUVColor ?? '',
    fluorescenceLW: data.fluorescenceLW ?? 'none',
    fluorescenceSW: data.fluorescenceSW ?? 'none',
    xrdAnalyzed: data.xrdAnalysis?.analyzed ?? false,
    xrdAnalysisDate: data.xrdAnalysis?.analysisDate ?? '',
    xrdLabName: data.xrdAnalysis?.labName ?? '',
    xrdPeaks: data.xrdAnalysis?.peaks ?? '',
    xrdMineralIdentified: data.xrdAnalysis?.mineralIdentified ?? '',
    xrdNotes: data.xrdAnalysis?.notes ?? '',
    spectroscopyRaman: data.spectroscopy?.raman ?? '',
    spectroscopyInfrared: data.spectroscopy?.infrared ?? '',
    spectroscopyNotes: data.spectroscopy?.notes ?? '',
    chemicalMethod: data.chemicalAnalysis?.method ?? '',
    chemicalResults: data.chemicalAnalysis?.results ?? '',
    chemicalLabName: data.chemicalAnalysis?.labName ?? '',
    chemicalAnalysisDate: data.chemicalAnalysis?.analysisDate ?? '',
    rarity: data.rarity,
    rarityNotes: data.rarityNotes ?? '',
    testDate: data.testDate ?? '',
    labName: data.labName ?? '',
    notes: data.notes ?? '',
  };
}

function formDataToScientificData(
  form: FormData
): Omit<ScientificData, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    specimenId: form.specimenId,
    densityGcm3: form.densityGcm3 ? parseFloat(form.densityGcm3) : undefined,
    refractiveIndexMin: form.refractiveIndexMin
      ? parseFloat(form.refractiveIndexMin)
      : undefined,
    refractiveIndexMax: form.refractiveIndexMax
      ? parseFloat(form.refractiveIndexMax)
      : undefined,
    birefringence: form.birefringence ? parseFloat(form.birefringence) : undefined,
    pleochroism: form.pleochroism || undefined,
    magneticProperty: form.magneticProperty,
    fluorescenceUV: form.fluorescenceUV,
    fluorescenceUVColor: form.fluorescenceUVColor || undefined,
    fluorescenceLW: form.fluorescenceLW,
    fluorescenceSW: form.fluorescenceSW,
    xrdAnalysis: form.xrdAnalyzed
      ? {
          analyzed: true,
          analysisDate: form.xrdAnalysisDate || undefined,
          labName: form.xrdLabName || undefined,
          peaks: form.xrdPeaks || undefined,
          mineralIdentified: form.xrdMineralIdentified || undefined,
          notes: form.xrdNotes || undefined,
        }
      : { analyzed: false },
    spectroscopy:
      form.spectroscopyRaman || form.spectroscopyInfrared || form.spectroscopyNotes
        ? {
            raman: form.spectroscopyRaman || undefined,
            infrared: form.spectroscopyInfrared || undefined,
            notes: form.spectroscopyNotes || undefined,
          }
        : undefined,
    chemicalAnalysis:
      form.chemicalMethod || form.chemicalResults || form.chemicalLabName || form.chemicalAnalysisDate
        ? {
            method: form.chemicalMethod || undefined,
            results: form.chemicalResults || undefined,
            labName: form.chemicalLabName || undefined,
            analysisDate: form.chemicalAnalysisDate || undefined,
          }
        : undefined,
    rarity: form.rarity,
    rarityNotes: form.rarityNotes || undefined,
    testDate: form.testDate || undefined,
    labName: form.labName || undefined,
    notes: form.notes || undefined,
  };
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | number;
}) {
  if (value === undefined || value === '' || value === null) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-gray-500">{label}：</span>
        <span className="text-gray-800 font-medium">{value}</span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-teal-50 p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800 font-serif">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-md`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export default function Scientific() {
  const specimens = useAppStore((s) => s.specimens);
  const scientificData = useAppStore((s) => s.scientificData);
  const addScientificData = useAppStore((s) => s.addScientificData);
  const updateScientificData = useAppStore((s) => s.updateScientificData);
  const deleteScientificData = useAppStore((s) => s.deleteScientificData);

  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | RarityLevel>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<ScientificData | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const stats = useMemo(() => {
    const totalCount = scientificData.length;
    const xrdCompleted = scientificData.filter(
      (d) => d.xrdAnalysis?.analyzed === true
    ).length;
    const rareCount = scientificData.filter((d) => d.rarity === 'rare').length;
    const extremelyRareCount = scientificData.filter(
      (d) => d.rarity === 'extremely-rare'
    ).length;
    return { totalCount, xrdCompleted, rareCount, extremelyRareCount };
  }, [scientificData]);

  const getSpecimenById = (id: string): Specimen | undefined =>
    specimens.find((s) => s.id === id);

  const filteredData = useMemo(() => {
    return scientificData.filter((d) => {
      if (rarityFilter !== 'all' && d.rarity !== rarityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const specimen = getSpecimenById(d.specimenId);
        const matchName = specimen?.name.toLowerCase().includes(q) ?? false;
        const matchNo = specimen?.specimenNo.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchNo) return false;
      }
      return true;
    });
  }, [scientificData, searchQuery, rarityFilter, specimens]);

  const availableSpecimensForAdd = useMemo(() => {
    const usedIds = new Set(scientificData.map((d) => d.specimenId));
    return specimens.filter((s) => !usedIds.has(s.id));
  }, [specimens, scientificData]);

  const openAddForm = () => {
    setEditingData(null);
    setFormData({ ...defaultFormData, specimenId: availableSpecimensForAdd[0]?.id ?? '' });
    setFormOpen(true);
  };

  const openEditForm = (data: ScientificData) => {
    setEditingData(data);
    setFormData(scientificDataToFormData(data));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingData(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.specimenId) return;

    const data = formDataToScientificData(formData);

    if (editingData) {
      updateScientificData(editingData.id, data);
    } else {
      addScientificData(data);
    }

    closeForm();
  };

  const handleDelete = (data: ScientificData) => {
    const specimen = getSpecimenById(data.specimenId);
    if (window.confirm(`确定要删除标本"${specimen?.name ?? '未知'}"的科学数据吗？`)) {
      deleteScientificData(data.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={FlaskConical}
          label="已测试标本数"
          value={stats.totalCount}
          gradient="bg-gradient-to-br from-teal-400 to-cyan-500"
          iconColor="text-white"
        />
        <StatCard
          icon={BarChart3}
          label="XRD分析完成数"
          value={stats.xrdCompleted}
          gradient="bg-gradient-to-br from-cyan-400 to-sky-500"
          iconColor="text-white"
        />
        <StatCard
          icon={Sparkles}
          label="稀有标本数"
          value={stats.rareCount}
          gradient="bg-gradient-to-br from-purple-400 to-violet-500"
          iconColor="text-white"
        />
        <StatCard
          icon={Gem}
          label="极稀有标本数"
          value={stats.extremelyRareCount}
          gradient="bg-gradient-to-br from-rose-400 to-red-500"
          iconColor="text-white"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-teal-50 p-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 font-serif">科学数据记录</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                共 {scientificData.length} 条测试记录 · XRD完成率{' '}
                {scientificData.length > 0
                  ? Math.round((stats.xrdCompleted / scientificData.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:flex-none sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标本名称、编号..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto scrollbar-thin">
              {(['all', 'common', 'uncommon', 'rare', 'extremely-rare'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRarityFilter(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    rarityFilter === r
                      ? 'bg-white shadow-sm text-teal-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r === 'all' ? '全部' : RARITY_LABELS[r]}
                </button>
              ))}
            </div>

            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              新增测试记录
            </button>
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-teal-50 p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Beaker className="w-10 h-10 text-teal-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无科学测试数据</h3>
          <p className="text-gray-500 text-sm">
            点击右上角"新增测试记录"按钮开始记录标本的科学分析数据
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredData.map((data) => {
            const specimen = getSpecimenById(data.specimenId);
            const primaryPhoto = specimen?.photos.find((p) => p.isPrimary) ?? specimen?.photos[0];
            return (
              <div
                key={data.id}
                className="group bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="p-4 border-b border-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 flex-shrink-0">
                      {primaryPhoto ? (
                        <img
                          src={primaryPhoto.url}
                          alt={specimen?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gem className="w-8 h-8 text-teal-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-800 text-base truncate font-serif">
                          {specimen?.name ?? '未知标本'}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${RARITY_COLORS[data.rarity]}`}
                        >
                          {RARITY_LABELS[data.rarity]}
                        </span>
                      </div>
                      <p className="text-xs text-teal-600 font-mono mt-1">
                        {specimen?.specimenNo ?? 'N/A'}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {data.testDate ? formatDate(data.testDate) : '未记录'}
                        </div>
                        {data.labName && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{data.labName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4 flex-1">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-teal-500" />
                      物理测试数据
                    </h4>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <InfoItem
                        icon={BarChart3}
                        label="密度"
                        value={data.densityGcm3 ? `${data.densityGcm3} g/cm³` : undefined}
                      />
                      <InfoItem
                        icon={Atom}
                        label="折射率"
                        value={
                          data.refractiveIndexMin && data.refractiveIndexMax
                            ? `${data.refractiveIndexMin} - ${data.refractiveIndexMax}`
                            : data.refractiveIndexMin ?? data.refractiveIndexMax
                        }
                      />
                      <InfoItem
                        icon={Sparkles}
                        label="双折射"
                        value={data.birefringence}
                      />
                      <InfoItem
                        icon={Sun}
                        label="多色性"
                        value={data.pleochroism}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 p-3 border border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                        <Magnet className="w-3.5 h-3.5 text-teal-500" />
                        磁性
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {MAGNETIC_LABELS[data.magneticProperty ?? 'none']}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-3 border border-violet-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                        <Zap className="w-3.5 h-3.5 text-violet-500" />
                        荧光反应
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <p className="text-gray-700">
                          UV:{' '}
                          <span className="font-semibold">
                            {FLUORESCENCE_LABELS[data.fluorescenceUV ?? 'none']}
                          </span>
                          {data.fluorescenceUVColor && (
                            <span className="text-violet-600"> ({data.fluorescenceUVColor})</span>
                          )}
                        </p>
                        <p className="text-gray-700">
                          LW:{' '}
                          <span className="font-semibold">
                            {FLUORESCENCE_LABELS[data.fluorescenceLW ?? 'none']}
                          </span>
                        </p>
                        <p className="text-gray-700">
                          SW:{' '}
                          <span className="font-semibold">
                            {FLUORESCENCE_LABELS[data.fluorescenceSW ?? 'none']}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/30 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 mb-2">
                      <BarChart3 className="w-3.5 h-3.5" />
                      XRD 分析
                    </div>
                    {data.xrdAnalysis?.analyzed ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          {data.xrdAnalysis.analysisDate && (
                            <span className="inline-flex items-center gap-1 text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {formatDate(data.xrdAnalysis.analysisDate)}
                            </span>
                          )}
                          {data.xrdAnalysis.labName && (
                            <span className="inline-flex items-center gap-1 text-gray-600">
                              <Building2 className="w-3 h-3" />
                              {data.xrdAnalysis.labName}
                            </span>
                          )}
                        </div>
                        {data.xrdAnalysis.mineralIdentified && (
                          <p className="text-gray-700">
                            <span className="text-gray-500">鉴定矿物：</span>
                            <span className="font-semibold">{data.xrdAnalysis.mineralIdentified}</span>
                          </p>
                        )}
                        {data.xrdAnalysis.peaks && (
                          <p className="text-gray-700">
                            <span className="text-gray-500">峰位：</span>
                            <span className="font-mono text-[11px]">{data.xrdAnalysis.peaks}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        未进行XRD分析
                      </div>
                    )}
                  </div>

                  {data.chemicalAnalysis &&
                    (data.chemicalAnalysis.method ||
                      data.chemicalAnalysis.results ||
                      data.chemicalAnalysis.labName ||
                      data.chemicalAnalysis.analysisDate) && (
                      <div className="rounded-xl border-2 border-dashed border-cyan-200 bg-cyan-50/30 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 mb-2">
                          <FlaskConical className="w-3.5 h-3.5" />
                          化学分析
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            {data.chemicalAnalysis.method && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-semibold">
                                {data.chemicalAnalysis.method}
                              </span>
                            )}
                            {data.chemicalAnalysis.analysisDate && (
                              <span className="inline-flex items-center gap-1 text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {formatDate(data.chemicalAnalysis.analysisDate)}
                              </span>
                            )}
                            {data.chemicalAnalysis.labName && (
                              <span className="inline-flex items-center gap-1 text-gray-600">
                                <Building2 className="w-3 h-3" />
                                {data.chemicalAnalysis.labName}
                              </span>
                            )}
                          </div>
                          {data.chemicalAnalysis.results && (
                            <p className="text-gray-700">{data.chemicalAnalysis.results}</p>
                          )}
                        </div>
                      </div>
                    )}

                  {data.rarityNotes && (
                    <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 border border-amber-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        稀有度说明
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{data.rarityNotes}</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditForm(data)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-teal-700 bg-teal-50 rounded-lg font-medium hover:bg-teal-100 transition-colors text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(data)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                  {editingData ? (
                    <Edit2 className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 font-serif">
                    {editingData ? '编辑测试记录' : '新增测试记录'}
                  </h2>
                  <p className="text-xs text-gray-500">填写科学分析详细数据</p>
                </div>
              </div>
              <button
                onClick={closeForm}
                className="w-9 h-9 rounded-full hover:bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] space-y-6 scrollbar-thin"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">选择标本 *</label>
                <select
                  value={formData.specimenId}
                  onChange={(e) => setFormData((f) => ({ ...f, specimenId: e.target.value }))}
                  required
                  disabled={!!editingData}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {(editingData
                    ? specimens
                    : availableSpecimensForAdd
                  ).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.specimenNo})
                    </option>
                  ))}
                  {!editingData && availableSpecimensForAdd.length === 0 && (
                    <option value="">所有标本均已有测试记录</option>
                  )}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-teal-500" />
                  物理测试数据
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      密度 (g/cm³)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.densityGcm3}
                      onChange={(e) => setFormData((f) => ({ ...f, densityGcm3: e.target.value }))}
                      placeholder="如：2.65"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        折射率最小值
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.refractiveIndexMin}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, refractiveIndexMin: e.target.value }))
                        }
                        placeholder="如：1.544"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        折射率最大值
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.refractiveIndexMax}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, refractiveIndexMax: e.target.value }))
                        }
                        placeholder="如：1.553"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">双折射</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.birefringence}
                      onChange={(e) => setFormData((f) => ({ ...f, birefringence: e.target.value }))}
                      placeholder="如：0.009"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">多色性</label>
                    <input
                      type="text"
                      value={formData.pleochroism}
                      onChange={(e) => setFormData((f) => ({ ...f, pleochroism: e.target.value }))}
                      placeholder="如：无 / 明显"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Magnet className="w-4 h-4 text-teal-500" />
                  磁性与荧光
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">磁性</label>
                    <select
                      value={formData.magneticProperty}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          magneticProperty: e.target.value as MagneticProperty,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    >
                      {Object.entries(MAGNETIC_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">UV颜色</label>
                    <input
                      type="text"
                      value={formData.fluorescenceUVColor}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, fluorescenceUVColor: e.target.value }))
                      }
                      placeholder="如：淡紫色"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      荧光 UV 强度
                    </label>
                    <select
                      value={formData.fluorescenceUV}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          fluorescenceUV: e.target.value as FluorescenceType,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    >
                      {Object.entries(FLUORESCENCE_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      荧光 LW 强度
                    </label>
                    <select
                      value={formData.fluorescenceLW}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          fluorescenceLW: e.target.value as FluorescenceType,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    >
                      {Object.entries(FLUORESCENCE_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      荧光 SW 强度
                    </label>
                    <select
                      value={formData.fluorescenceSW}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          fluorescenceSW: e.target.value as FluorescenceType,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    >
                      {Object.entries(FLUORESCENCE_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-500" />
                    XRD 分析
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((f) => ({ ...f, xrdAnalyzed: !f.xrdAnalyzed }))
                    }
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    {formData.xrdAnalyzed ? (
                      <ToggleRight className="w-7 h-7 text-teal-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                    <span className={formData.xrdAnalyzed ? 'text-teal-700 font-medium' : 'text-gray-500'}>
                      是否已分析
                    </span>
                  </button>
                </div>
                {formData.xrdAnalyzed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/50 rounded-xl p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        分析日期
                      </label>
                      <input
                        type="date"
                        value={formData.xrdAnalysisDate}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, xrdAnalysisDate: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        实验室名称
                      </label>
                      <input
                        type="text"
                        value={formData.xrdLabName}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, xrdLabName: e.target.value }))
                        }
                        placeholder="如：本中心实验室"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        鉴定矿物
                      </label>
                      <input
                        type="text"
                        value={formData.xrdMineralIdentified}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, xrdMineralIdentified: e.target.value }))
                        }
                        placeholder="如：FeS₂, 黄铁矿"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        峰位描述
                      </label>
                      <input
                        type="text"
                        value={formData.xrdPeaks}
                        onChange={(e) => setFormData((f) => ({ ...f, xrdPeaks: e.target.value }))}
                        placeholder="如：2θ=28.5°, 33.1°..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
                      <textarea
                        rows={2}
                        value={formData.xrdNotes}
                        onChange={(e) => setFormData((f) => ({ ...f, xrdNotes: e.target.value }))}
                        placeholder="XRD分析备注说明..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-cyan-500" />
                  化学分析
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cyan-50/50 rounded-xl p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      分析方法
                    </label>
                    <select
                      value={formData.chemicalMethod}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, chemicalMethod: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    >
                      <option value="">请选择方法</option>
                      <option value="EDX">EDX 能谱分析</option>
                      <option value="ICP-MS">ICP-MS</option>
                      <option value="XRF">XRF</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      分析日期
                    </label>
                    <input
                      type="date"
                      value={formData.chemicalAnalysisDate}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, chemicalAnalysisDate: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      实验室名称
                    </label>
                    <input
                      type="text"
                      value={formData.chemicalLabName}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, chemicalLabName: e.target.value }))
                      }
                      placeholder="实验室名称"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">分析结果</label>
                    <textarea
                      rows={2}
                      value={formData.chemicalResults}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, chemicalResults: e.target.value }))
                      }
                      placeholder="元素组成、含量等分析结果..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-violet-500" />
                  光谱分析（可选）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-violet-50/50 rounded-xl p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">拉曼光谱</label>
                    <input
                      type="text"
                      value={formData.spectroscopyRaman}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, spectroscopyRaman: e.target.value }))
                      }
                      placeholder="拉曼光谱特征峰描述"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">红外光谱</label>
                    <input
                      type="text"
                      value={formData.spectroscopyInfrared}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, spectroscopyInfrared: e.target.value }))
                      }
                      placeholder="红外光谱特征峰描述"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
                    <textarea
                      rows={2}
                      value={formData.spectroscopyNotes}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, spectroscopyNotes: e.target.value }))
                      }
                      placeholder="光谱分析备注..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  稀有度与总体信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">稀有度</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, rarity: e.target.value as RarityLevel }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    >
                      {Object.entries(RARITY_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      测试日期
                    </label>
                    <input
                      type="date"
                      value={formData.testDate}
                      onChange={(e) => setFormData((f) => ({ ...f, testDate: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      实验室名称
                    </label>
                    <input
                      type="text"
                      value={formData.labName}
                      onChange={(e) => setFormData((f) => ({ ...f, labName: e.target.value }))}
                      placeholder="测试实验室"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div></div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      稀有度说明
                    </label>
                    <textarea
                      rows={2}
                      value={formData.rarityNotes}
                      onChange={(e) => setFormData((f) => ({ ...f, rarityNotes: e.target.value }))}
                      placeholder="说明该标本的稀有程度、市场价值等..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      总体备注
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="其他总体测试说明、注意事项等..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all text-sm"
              >
                {editingData ? '保存修改' : '创建记录'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
