import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Scale,
  Ruler,
  Sparkles,
  Gem,
  Flame,
  Droplets,
  Eye,
  Sun,
  Moon,
  Star,
  Shield,
  Atom,
  Camera,
  ImagePlus,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';
import type {
  Specimen,
  MineralSpecimen,
  MeteoriteSpecimen,
  SpecimenType,
  CrystalSystem,
  LusterType,
  MeteoriteClass,
  FallType,
  SpecimenPhoto,
} from '@/types';
import {
  SPECIMEN_TYPE_LABELS,
  SPECIMEN_TYPE_COLORS,
  CRYSTAL_SYSTEM_LABELS,
  LUSTER_LABELS,
  METEORITE_CLASS_LABELS,
  FALL_TYPE_LABELS,
} from '@/types';

const TRANSPARENCY_LABELS: Record<MineralSpecimen['transparency'], string> = {
  opaque: '不透明',
  translucent: '半透明',
  transparent: '透明',
};

interface FormData {
  name: string;
  specimenNo: string;
  type: SpecimenType;
  chemicalFormula: string;
  locality: string;
  collectionDate: string;
  weightG: string;
  dimensionsMm: string;
  description: string;
  crystalSystem: CrystalSystem;
  hardnessMin: string;
  hardnessMax: string;
  luster: LusterType;
  color: string;
  streak: string;
  cleavage: string;
  fracture: string;
  variety: string;
  transparency: MineralSpecimen['transparency'];
  meteoriteClass: MeteoriteClass;
  subClassification: string;
  fallType: FallType;
  fallDate: string;
  findDate: string;
  parentBody: string;
  shockStage: string;
  weatheringGrade: string;
  tkw: string;
}

const defaultFormData: FormData = {
  name: '',
  specimenNo: '',
  type: 'mineral',
  chemicalFormula: '',
  locality: '',
  collectionDate: '',
  weightG: '',
  dimensionsMm: '',
  description: '',
  crystalSystem: 'cubic',
  hardnessMin: '',
  hardnessMax: '',
  luster: 'vitreous',
  color: '',
  streak: '',
  cleavage: '',
  fracture: '',
  variety: '',
  transparency: 'transparent',
  meteoriteClass: 'chondrite',
  subClassification: '',
  fallType: 'find',
  fallDate: '',
  findDate: '',
  parentBody: '',
  shockStage: '',
  weatheringGrade: '',
  tkw: '',
};

function specimenToFormData(specimen: Specimen): FormData {
  const base: FormData = {
    ...defaultFormData,
    name: specimen.name,
    specimenNo: specimen.specimenNo,
    type: specimen.type,
    chemicalFormula: specimen.chemicalFormula ?? '',
    locality: specimen.locality ?? '',
    collectionDate: specimen.collectionDate ?? '',
    weightG: specimen.weightG?.toString() ?? '',
    dimensionsMm: specimen.dimensionsMm ?? '',
    description: specimen.description ?? '',
  };

  if (specimen.type === 'mineral') {
    return {
      ...base,
      crystalSystem: specimen.crystalSystem ?? 'cubic',
      hardnessMin: specimen.hardnessMin?.toString() ?? '',
      hardnessMax: specimen.hardnessMax?.toString() ?? '',
      luster: specimen.luster ?? 'vitreous',
      color: specimen.color ?? '',
      streak: specimen.streak ?? '',
      cleavage: specimen.cleavage ?? '',
      fracture: specimen.fracture ?? '',
      variety: specimen.variety ?? '',
      transparency: specimen.transparency ?? 'transparent',
    };
  }

  return {
    ...base,
    meteoriteClass: specimen.meteoriteClass,
    subClassification: specimen.subClassification ?? '',
    fallType: specimen.fallType,
    fallDate: specimen.fallDate ?? '',
    findDate: specimen.findDate ?? '',
    parentBody: specimen.parentBody ?? '',
    shockStage: specimen.shockStage ?? '',
    weatheringGrade: specimen.weatheringGrade ?? '',
    tkw: specimen.tkw?.toString() ?? '',
  };
}

function formDataToSpecimen(form: FormData, photos: SpecimenPhoto[]): Omit<MineralSpecimen, 'id' | 'createdAt' | 'updatedAt'> | Omit<MeteoriteSpecimen, 'id' | 'createdAt' | 'updatedAt'> {
  const base = {
    name: form.name,
    specimenNo: form.specimenNo,
    chemicalFormula: form.chemicalFormula || undefined,
    locality: form.locality || undefined,
    collectionDate: form.collectionDate || undefined,
    weightG: form.weightG ? parseFloat(form.weightG) : undefined,
    dimensionsMm: form.dimensionsMm || undefined,
    description: form.description || undefined,
    photos,
  };

  if (form.type === 'mineral') {
    return {
      ...base,
      type: 'mineral',
      crystalSystem: form.crystalSystem,
      hardnessMin: form.hardnessMin ? parseFloat(form.hardnessMin) : undefined,
      hardnessMax: form.hardnessMax ? parseFloat(form.hardnessMax) : undefined,
      luster: form.luster,
      color: form.color || undefined,
      streak: form.streak || undefined,
      cleavage: form.cleavage || undefined,
      fracture: form.fracture || undefined,
      variety: form.variety || undefined,
      transparency: form.transparency,
    };
  }

  return {
    ...base,
    type: 'meteorite',
    meteoriteClass: form.meteoriteClass,
    subClassification: form.subClassification || undefined,
    fallType: form.fallType,
    fallDate: form.fallDate || undefined,
    findDate: form.findDate || undefined,
    parentBody: form.parentBody || undefined,
    shockStage: form.shockStage || undefined,
    weatheringGrade: form.weatheringGrade || undefined,
    tkw: form.tkw ? parseFloat(form.tkw) : undefined,
  };
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: string | number }) {
  if (value === undefined || value === '' || value === null) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-gray-500">{label}：</span>
        <span className="text-gray-800 font-medium">{value}</span>
      </div>
    </div>
  );
}

export default function Specimens() {
  const specimens = useAppStore((s) => s.specimens);
  const addSpecimen = useAppStore((s) => s.addSpecimen);
  const updateSpecimen = useAppStore((s) => s.updateSpecimen);
  const deleteSpecimen = useAppStore((s) => s.deleteSpecimen);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SpecimenType>('all');

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSpecimen, setEditingSpecimen] = useState<Specimen | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [formPhotos, setFormPhotos] = useState<SpecimenPhoto[]>([]);

  const filteredSpecimens = useMemo(() => {
    return specimens.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNo = s.specimenNo.toLowerCase().includes(q);
        const matchLocality = s.locality?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchNo && !matchLocality) return false;
      }
      return true;
    });
  }, [specimens, searchQuery, typeFilter]);

  const openDetail = (specimen: Specimen) => {
    setSelectedSpecimen(specimen);
    setCarouselIndex(0);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedSpecimen(null);
  };

  const openAddForm = () => {
    setEditingSpecimen(null);
    setFormData(defaultFormData);
    setFormPhotos([]);
    setFormOpen(true);
  };

  const openEditForm = (specimen: Specimen) => {
    setEditingSpecimen(specimen);
    setFormData(specimenToFormData(specimen));
    setFormPhotos([...specimen.photos]);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingSpecimen(null);
    setFormData(defaultFormData);
    setFormPhotos([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.specimenNo) return;

    const photos = formPhotos.length > 0
      ? formPhotos
      : [
          {
            id: `ph-${Date.now()}`,
            url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(formData.name)}%20${encodeURIComponent(SPECIMEN_TYPE_LABELS[formData.type])}%20specimen%20on%20white%20background&image_size=square_hd`,
            caption: '默认图片',
            angle: '正面',
            isPrimary: true,
            uploadedAt: new Date().toISOString(),
          },
        ];

    const spec = formDataToSpecimen(formData, photos) as Omit<Specimen, 'id' | 'createdAt' | 'updatedAt'>;

    if (editingSpecimen) {
      updateSpecimen(editingSpecimen.id, spec);
    } else {
      addSpecimen(spec);
    }

    closeForm();
  };

  const handleAddPhoto = () => {
    const url = prompt('请输入图片URL地址：');
    if (!url) return;
    const caption = prompt('图片说明（可选）：', '') || '';
    const angle = prompt('拍摄角度（如：正面/侧面/顶面/底部）：', '正面') || '正面';
    const newPhoto: SpecimenPhoto = {
      id: `ph-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url,
      caption,
      angle,
      isPrimary: formPhotos.length === 0,
      uploadedAt: new Date().toISOString(),
    };
    setFormPhotos((prev) => [...prev, newPhoto]);
  };

  const handleAddLocalPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setFormPhotos((prev) => [
            ...prev,
            {
              id: `ph-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
              url: dataUrl,
              caption: file.name,
              angle: '正面',
              isPrimary: prev.length === 0,
              uploadedAt: new Date().toISOString(),
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const handleRemovePhoto = (photoId: string) => {
    setFormPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      if (updated.length > 0 && !updated.some((p) => p.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true };
      }
      return updated;
    });
  };

  const handleSetPrimary = (photoId: string) => {
    setFormPhotos((prev) =>
      prev.map((p) => ({ ...p, isPrimary: p.id === photoId }))
    );
  };

  const handleUpdatePhotoCaption = (photoId: string, caption: string) => {
    setFormPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
  };

  const handleUpdatePhotoAngle = (photoId: string, angle: string) => {
    setFormPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, angle } : p))
    );
  };

  const handleDelete = () => {
    if (!selectedSpecimen) return;
    if (window.confirm(`确定要删除标本"${selectedSpecimen.name}"吗？`)) {
      deleteSpecimen(selectedSpecimen.id);
      closeDetail();
    }
  };

  const nextPhoto = () => {
    if (!selectedSpecimen) return;
    setCarouselIndex((i) => (i + 1) % selectedSpecimen.photos.length);
  };

  const prevPhoto = () => {
    if (!selectedSpecimen) return;
    setCarouselIndex((i) => (i - 1 + selectedSpecimen.photos.length) % selectedSpecimen.photos.length);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card border border-amber-50 p-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 font-serif">标本档案</h1>
              <p className="text-sm text-gray-500 mt-0.5">共 {specimens.length} 件收藏 · {specimens.filter((s) => s.type === 'mineral').length} 件矿物 · {specimens.filter((s) => s.type === 'meteorite').length} 件陨石</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:flex-none sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索名称、编号、产地..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              {(['all', 'mineral', 'meteorite'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === t
                      ? 'bg-white shadow-sm text-amber-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'all' ? '全部' : SPECIMEN_TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              新增标本
            </button>
          </div>
        </div>
      </div>

      {filteredSpecimens.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-amber-50 p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <Gem className="w-10 h-10 text-amber-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无标本</h3>
          <p className="text-gray-500 text-sm">点击右上角"新增标本"按钮开始建立您的收藏档案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredSpecimens.map((specimen) => (
            <div
              key={specimen.id}
              onClick={() => openDetail(specimen)}
              className="group bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 relative">
                {specimen.photos[0] ? (
                  <img
                    src={specimen.photos[0].url}
                    alt={specimen.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gem className="w-16 h-16 text-amber-200" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${SPECIMEN_TYPE_COLORS[specimen.type]}`}>
                    {SPECIMEN_TYPE_LABELS[specimen.type]}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-amber-700 transition-colors font-serif">
                  {specimen.name}
                </h3>
                <p className="text-xs text-amber-600 font-mono mb-3">{specimen.specimenNo}</p>

                <div className="space-y-1.5">
                  <InfoItem icon={MapPin} label="产地" value={specimen.locality} />
                  <InfoItem icon={Scale} label="重量" value={specimen.weightG ? `${specimen.weightG} g` : undefined} />
                  <InfoItem icon={Calendar} label="采集" value={specimen.collectionDate ? formatDate(specimen.collectionDate) : undefined} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailOpen && selectedSpecimen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeDetail}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              {selectedSpecimen.photos.length > 0 ? (
                <>
                  <img
                    src={selectedSpecimen.photos[carouselIndex].url}
                    alt={selectedSpecimen.photos[carouselIndex].caption ?? selectedSpecimen.name}
                    className="w-full h-full object-contain p-4"
                  />
                  {selectedSpecimen.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-amber-600 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-amber-600 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedSpecimen.photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCarouselIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === carouselIndex ? 'bg-amber-500 w-6' : 'bg-white/60 hover:bg-white/90'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Gem className="w-24 h-24 text-amber-200" />
              )}
              <button
                onClick={closeDetail}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-20rem)]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 font-serif">{selectedSpecimen.name}</h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${SPECIMEN_TYPE_COLORS[selectedSpecimen.type]}`}>
                      {SPECIMEN_TYPE_LABELS[selectedSpecimen.type]}
                    </span>
                  </div>
                  <p className="text-sm text-amber-600 font-mono">{selectedSpecimen.specimenNo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(selectedSpecimen)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    基本信息
                  </h3>
                  <InfoItem icon={Sparkles} label="名称" value={selectedSpecimen.name} />
                  <InfoItem icon={Eye} label="编号" value={selectedSpecimen.specimenNo} />
                  <InfoItem icon={Star} label="类型" value={SPECIMEN_TYPE_LABELS[selectedSpecimen.type]} />
                  <InfoItem icon={MapPin} label="产地" value={selectedSpecimen.locality} />
                  <InfoItem icon={Calendar} label="采集日期" value={selectedSpecimen.collectionDate ? formatDate(selectedSpecimen.collectionDate) : undefined} />
                  <InfoItem icon={Scale} label="重量" value={selectedSpecimen.weightG ? `${selectedSpecimen.weightG} 克` : undefined} />
                  <InfoItem icon={Ruler} label="尺寸" value={selectedSpecimen.dimensionsMm} />
                  <InfoItem icon={Atom} label="化学成分" value={selectedSpecimen.chemicalFormula} />
                </div>

                {selectedSpecimen.type === 'mineral' ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Gem className="w-4 h-4 text-emerald-500" />
                      矿物特征
                    </h3>
                    <InfoItem icon={Gem} label="晶系" value={selectedSpecimen.crystalSystem ? CRYSTAL_SYSTEM_LABELS[selectedSpecimen.crystalSystem] : undefined} />
                    <InfoItem
                      icon={Shield}
                      label="莫氏硬度"
                      value={
                        selectedSpecimen.hardnessMin && selectedSpecimen.hardnessMax
                          ? selectedSpecimen.hardnessMin === selectedSpecimen.hardnessMax
                            ? selectedSpecimen.hardnessMin.toString()
                            : `${selectedSpecimen.hardnessMin} - ${selectedSpecimen.hardnessMax}`
                          : selectedSpecimen.hardnessMin?.toString() ?? selectedSpecimen.hardnessMax?.toString()
                      }
                    />
                    <InfoItem icon={Sun} label="光泽" value={selectedSpecimen.luster ? LUSTER_LABELS[selectedSpecimen.luster] : undefined} />
                    <InfoItem icon={Droplets} label="颜色" value={selectedSpecimen.color} />
                    <InfoItem icon={Star} label="条痕" value={selectedSpecimen.streak} />
                    <InfoItem icon={Ruler} label="解理" value={selectedSpecimen.cleavage} />
                    <InfoItem icon={Flame} label="断口" value={selectedSpecimen.fracture} />
                    <InfoItem icon={Eye} label="透明度" value={selectedSpecimen.transparency ? TRANSPARENCY_LABELS[selectedSpecimen.transparency] : undefined} />
                    <InfoItem icon={Sparkles} label="变种" value={selectedSpecimen.variety} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-orange-500" />
                      陨石特征
                    </h3>
                    <InfoItem icon={Star} label="陨石分类" value={METEORITE_CLASS_LABELS[selectedSpecimen.meteoriteClass]} />
                    <InfoItem icon={Sparkles} label="亚分类" value={selectedSpecimen.subClassification} />
                    <InfoItem icon={Flame} label="降落/发现" value={FALL_TYPE_LABELS[selectedSpecimen.fallType]} />
                    {selectedSpecimen.fallType === 'fall' ? (
                      <InfoItem icon={Calendar} label="降落日期" value={selectedSpecimen.fallDate ? formatDate(selectedSpecimen.fallDate) : undefined} />
                    ) : (
                      <InfoItem icon={Calendar} label="发现日期" value={selectedSpecimen.findDate ? formatDate(selectedSpecimen.findDate) : undefined} />
                    )}
                    <InfoItem icon={Moon} label="母体行星" value={selectedSpecimen.parentBody} />
                    <InfoItem icon={Shield} label="冲击阶段" value={selectedSpecimen.shockStage} />
                    <InfoItem icon={Sun} label="风化等级" value={selectedSpecimen.weatheringGrade} />
                    <InfoItem icon={Scale} label="TKW" value={selectedSpecimen.tkw ? `${selectedSpecimen.tkw} kg` : undefined} />
                  </div>
                )}
              </div>

              {selectedSpecimen.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    描述
                  </h3>
                  <p className="text-gray-600 leading-relaxed bg-amber-50/50 rounded-xl p-4 text-sm">
                    {selectedSpecimen.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeForm}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  {editingSpecimen ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 font-serif">{editingSpecimen ? '编辑标本' : '新增标本'}</h2>
                  <p className="text-xs text-gray-500">填写标本详细信息</p>
                </div>
              </div>
              <button
                onClick={closeForm}
                className="w-9 h-9 rounded-full hover:bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">标本类型</label>
                  <div className="flex gap-2">
                    {(['mineral', 'meteorite'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, type: t }))}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                          formData.type === t
                            ? t === 'mineral'
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {SPECIMEN_TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">标本名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="如：石英晶体"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">标本编号 *</label>
                  <input
                    type="text"
                    value={formData.specimenNo}
                    onChange={(e) => setFormData((f) => ({ ...f, specimenNo: e.target.value }))}
                    placeholder="如：MIN-2024-001"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  公共信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">化学成分</label>
                    <input
                      type="text"
                      value={formData.chemicalFormula}
                      onChange={(e) => setFormData((f) => ({ ...f, chemicalFormula: e.target.value }))}
                      placeholder="如：SiO₂"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">产地</label>
                    <input
                      type="text"
                      value={formData.locality}
                      onChange={(e) => setFormData((f) => ({ ...f, locality: e.target.value }))}
                      placeholder="如：巴西，米纳斯吉拉斯州"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">采集日期</label>
                    <input
                      type="date"
                      value={formData.collectionDate}
                      onChange={(e) => setFormData((f) => ({ ...f, collectionDate: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">重量 (克)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weightG}
                      onChange={(e) => setFormData((f) => ({ ...f, weightG: e.target.value }))}
                      placeholder="如：245.5"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">尺寸</label>
                    <input
                      type="text"
                      value={formData.dimensionsMm}
                      onChange={(e) => setFormData((f) => ({ ...f, dimensionsMm: e.target.value }))}
                      placeholder="如：85 x 62 x 45 mm"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">描述</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                      placeholder="描述标本的特征、品质、历史等信息..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-500" />
                  标本照片
                  <span className="text-xs font-normal text-gray-400 ml-1">（至少添加一张主图）</span>
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={handleAddLocalPhoto}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors text-sm border border-amber-200"
                  >
                    <ImagePlus className="w-4 h-4" />
                    从本地上传
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm border border-gray-200"
                  >
                    <Camera className="w-4 h-4" />
                    输入图片URL
                  </button>
                </div>

                {formPhotos.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                    <ImagePlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-1">暂无照片</p>
                    <p className="text-xs text-gray-400">点击上方按钮上传标本照片，如不上传将自动生成默认图片</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                          photo.isPrimary ? 'border-amber-400 shadow-md' : 'border-gray-200'
                        }`}
                      >
                        <div className="aspect-square">
                          <img
                            src={photo.url}
                            alt={photo.caption || '标本照片'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {photo.isPrimary && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full shadow-sm">
                            主图
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1 mb-1">
                            <input
                              type="text"
                              value={photo.angle}
                              onChange={(e) => handleUpdatePhotoAngle(photo.id, e.target.value)}
                              placeholder="角度"
                              className="flex-1 px-2 py-1 text-xs bg-white/90 rounded border-0 outline-none"
                            />
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={(e) => handleUpdatePhotoCaption(photo.id, e.target.value)}
                              placeholder="说明"
                              className="flex-1 px-2 py-1 text-xs bg-white/90 rounded border-0 outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            {!photo.isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(photo.id)}
                                className="flex-1 px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors flex items-center justify-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                设为主图
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(photo.id)}
                              className="flex-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddLocalPhoto}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
                    >
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-xs">添加照片</span>
                    </button>
                  </div>
                )}
              </div>

              {formData.type === 'mineral' ? (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Gem className="w-4 h-4 text-emerald-500" />
                    矿物特征
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">晶系</label>
                      <select
                        value={formData.crystalSystem}
                        onChange={(e) => setFormData((f) => ({ ...f, crystalSystem: e.target.value as CrystalSystem }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      >
                        {Object.entries(CRYSTAL_SYSTEM_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">光泽</label>
                      <select
                        value={formData.luster}
                        onChange={(e) => setFormData((f) => ({ ...f, luster: e.target.value as LusterType }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      >
                        {Object.entries(LUSTER_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">硬度最小值</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={formData.hardnessMin}
                        onChange={(e) => setFormData((f) => ({ ...f, hardnessMin: e.target.value }))}
                        placeholder="1-10"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">硬度最大值</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={formData.hardnessMax}
                        onChange={(e) => setFormData((f) => ({ ...f, hardnessMax: e.target.value }))}
                        placeholder="1-10"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">透明度</label>
                      <select
                        value={formData.transparency}
                        onChange={(e) => setFormData((f) => ({ ...f, transparency: e.target.value as MineralSpecimen['transparency'] }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      >
                        {Object.entries(TRANSPARENCY_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">颜色</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData((f) => ({ ...f, color: e.target.value }))}
                        placeholder="如：无色透明"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">条痕</label>
                      <input
                        type="text"
                        value={formData.streak}
                        onChange={(e) => setFormData((f) => ({ ...f, streak: e.target.value }))}
                        placeholder="如：白色"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">变种</label>
                      <input
                        type="text"
                        value={formData.variety}
                        onChange={(e) => setFormData((f) => ({ ...f, variety: e.target.value }))}
                        placeholder="如：水晶"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">解理</label>
                      <input
                        type="text"
                        value={formData.cleavage}
                        onChange={(e) => setFormData((f) => ({ ...f, cleavage: e.target.value }))}
                        placeholder="如：完全八面体解理"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">断口</label>
                      <input
                        type="text"
                        value={formData.fracture}
                        onChange={(e) => setFormData((f) => ({ ...f, fracture: e.target.value }))}
                        placeholder="如：贝壳状断口"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-orange-500" />
                    陨石特征
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">陨石分类</label>
                      <select
                        value={formData.meteoriteClass}
                        onChange={(e) => setFormData((f) => ({ ...f, meteoriteClass: e.target.value as MeteoriteClass }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      >
                        {Object.entries(METEORITE_CLASS_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">降落/发现类型</label>
                      <select
                        value={formData.fallType}
                        onChange={(e) => setFormData((f) => ({ ...f, fallType: e.target.value as FallType }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      >
                        {Object.entries(FALL_TYPE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">亚分类</label>
                      <input
                        type="text"
                        value={formData.subClassification}
                        onChange={(e) => setFormData((f) => ({ ...f, subClassification: e.target.value }))}
                        placeholder="如：L3-6, IVA"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">母体行星</label>
                      <input
                        type="text"
                        value={formData.parentBody}
                        onChange={(e) => setFormData((f) => ({ ...f, parentBody: e.target.value }))}
                        placeholder="如：小行星带、火星、月球"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    {formData.fallType === 'fall' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">降落日期</label>
                        <input
                          type="date"
                          value={formData.fallDate}
                          onChange={(e) => setFormData((f) => ({ ...f, fallDate: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">发现日期</label>
                        <input
                          type="date"
                          value={formData.findDate}
                          onChange={(e) => setFormData((f) => ({ ...f, findDate: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">冲击阶段</label>
                      <input
                        type="text"
                        value={formData.shockStage}
                        onChange={(e) => setFormData((f) => ({ ...f, shockStage: e.target.value }))}
                        placeholder="如：S3, S4"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">风化等级</label>
                      <input
                        type="text"
                        value={formData.weatheringGrade}
                        onChange={(e) => setFormData((f) => ({ ...f, weatheringGrade: e.target.value }))}
                        placeholder="如：W2"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">TKW (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tkw}
                        onChange={(e) => setFormData((f) => ({ ...f, tkw: e.target.value }))}
                        placeholder="总已知重量"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
              >
                {editingSpecimen ? '保存修改' : '创建标本'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
