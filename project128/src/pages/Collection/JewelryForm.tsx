
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import useJewelryStore from '../../store/jewelryStore';
import { Jewelry, JewelryType, OccasionType, Photo, PhotoType } from '../../types';
import { generateId } from '../../utils/format';

const JewelryForm = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location.pathname.includes('/edit');
  const { getJewelryById, addJewelry, updateJewelry } = useJewelryStore();

  const jewelry = isEdit ? getJewelryById(id || '') : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'ring' as JewelryType,
    material: '',
    gemstone: '',
    brand: '',
    purchaseDate: '',
    purchasePrice: 0,
    purchaseChannel: '',
    story: {
      giver: '',
      occasion: '',
      meaning: '',
    },
    suitableOccasions: [] as OccasionType[],
    photos: [] as Photo[],
    tags: [] as string[],
    wearCount: 0,
  });

  const [tagInput, setTagInput] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (jewelry) {
      setFormData({
        name: jewelry.name,
        type: jewelry.type,
        material: jewelry.material,
        gemstone: jewelry.gemstone,
        brand: jewelry.brand,
        purchaseDate: jewelry.purchaseDate,
        purchasePrice: jewelry.purchasePrice,
        purchaseChannel: jewelry.purchaseChannel,
        story: jewelry.story,
        suitableOccasions: jewelry.suitableOccasions,
        photos: jewelry.photos,
        tags: jewelry.tags,
        wearCount: jewelry.wearCount,
      });
    }
  }, [jewelry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('请输入珠宝名称');
      }

      if (isEdit && id) {
        updateJewelry(id, formData);
      } else {
        const jewelryData: Omit<Jewelry, 'id' | 'createdAt' | 'updatedAt'> = {
          name: formData.name,
          type: formData.type,
          material: formData.material,
          gemstone: formData.gemstone,
          brand: formData.brand,
          purchaseDate: formData.purchaseDate,
          purchasePrice: formData.purchasePrice,
          purchaseChannel: formData.purchaseChannel,
          story: formData.story,
          suitableOccasions: formData.suitableOccasions,
          photos: formData.photos,
          tags: formData.tags,
          wearCount: formData.wearCount,
        };
        addJewelry(jewelryData);
      }

      setTimeout(() => {
        navigate('/collection');
      }, 300);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: Photo = {
          id: generateId(),
          url: reader.result as string,
          type: 'detail',
          description: '',
        };
        setFormData({ ...formData, photos: [...formData.photos, newPhoto] });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (photoId: string) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((p) => p.id !== photoId),
    });
  };

  const toggleOccasion = (occasion: OccasionType) => {
    setFormData({
      ...formData,
      suitableOccasions: formData.suitableOccasions.includes(occasion)
        ? formData.suitableOccasions.filter((o) => o !== occasion)
        : [...formData.suitableOccasions, occasion],
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const steps = [
    { id: 1, label: '基本信息' },
    { id: 2, label: '来源故事' },
    { id: 3, label: '照片档案' },
    { id: 4, label: '其他设置' },
  ];

  const jewelryTypes: { value: JewelryType; label: string }[] = [
    { value: 'ring', label: '戒指' },
    { value: 'necklace', label: '项链' },
    { value: 'earring', label: '耳环' },
    { value: 'bracelet', label: '手链' },
    { value: 'brooch', label: '胸针' },
    { value: 'watch', label: '腕表' },
    { value: 'other', label: '其他' },
  ];

  const occasionTypes: { value: OccasionType; label: string }[] = [
    { value: 'daily', label: '日常' },
    { value: 'formal', label: '正式场合' },
    { value: 'wedding', label: '婚礼' },
    { value: 'party', label: '派对' },
    { value: 'business', label: '商务' },
  ];

  return (
    <div className="space-y-6 animate-fadeInUp max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/collection')}
          className="p-2 rounded-full hover:bg-gold-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-ink-600" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-600">
            {isEdit ? '编辑珠宝' : '新增珠宝'}
          </h1>
          <p className="text-ink-400">填写珠宝的详细信息</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-card border border-gold-100">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= step.id
                      ? 'bg-gold-500 text-white'
                      : 'bg-cream-100 text-ink-400'
                  }`}
                >
                  {step.id}
                </div>
                <span
                  className={`text-sm ${currentStep >= step.id ? 'text-gold-600' : 'text-ink-400'}`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 h-0.5 mx-4 bg-gold-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-card border border-gold-100">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-ink-600 font-medium mb-2">珠宝名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                  placeholder="例如：祖母绿戒指"
                  required
                />
              </div>
              <div>
                <label className="block text-ink-600 font-medium mb-2">珠宝类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as JewelryType })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                >
                  {jewelryTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ink-600 font-medium mb-2">品牌</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                  placeholder="例如：Cartier"
                />
              </div>
              <div>
                <label className="block text-ink-600 font-medium mb-2">材质</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                  placeholder="例如：18K白金"
                />
              </div>
              <div>
                <label className="block text-ink-600 font-medium mb-2">宝石</label>
                <input
                  type="text"
                  value={formData.gemstone}
                  onChange={(e) => setFormData({ ...formData, gemstone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                  placeholder="例如：祖母绿 2.5ct"
                />
              </div>
              <div>
                <label className="block text-ink-600 font-medium mb-2">购入日期</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                />
              </div>
              <div>
                <label className="block text-ink-600 font-medium mb-2">购入价格 (元)</label>
                <input
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-ink-600 font-medium mb-2">购入渠道</label>
                <input
                  type="text"
                  value={formData.purchaseChannel}
                  onChange={(e) => setFormData({ ...formData, purchaseChannel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                  placeholder="例如：巴黎专卖店"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-ink-600 font-medium mb-2">赠送者</label>
              <input
                type="text"
                value={formData.story.giver}
                onChange={(e) => setFormData({ ...formData, story: { ...formData.story, giver: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                placeholder="例如：丈夫"
              />
            </div>
            <div>
              <label className="block text-ink-600 font-medium mb-2">赠送场合</label>
              <input
                type="text"
                value={formData.story.occasion}
                onChange={(e) => setFormData({ ...formData, story: { ...formData.story, occasion: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                placeholder="例如：结婚十周年纪念"
              />
            </div>
            <div>
              <label className="block text-ink-600 font-medium mb-2">背后的意义</label>
              <textarea
                value={formData.story.meaning}
                onChange={(e) => setFormData({ ...formData, story: { ...formData.story, meaning: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50 h-32 resize-none"
                placeholder="记录这件珠宝背后的故事..."
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-ink-600 font-medium mb-4">上传照片</label>
              <div className="grid grid-cols-4 gap-4">
                {formData.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-xl overflow-hidden relative group">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-ruby-500" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-gold-300 flex flex-col items-center justify-center cursor-pointer hover:bg-cream-50 transition-colors">
                  <Upload className="w-8 h-8 text-gold-400 mb-2" />
                  <span className="text-sm text-ink-400">添加照片</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-ink-600 font-medium mb-4">适合场合</label>
              <div className="flex flex-wrap gap-3">
                {occasionTypes.map((occasion) => (
                  <button
                    key={occasion.value}
                    type="button"
                    onClick={() => toggleOccasion(occasion.value)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      formData.suitableOccasions.includes(occasion.value)
                        ? 'bg-gold-500 text-white border-gold-500'
                        : 'bg-white text-ink-600 border-gold-200 hover:border-gold-400'
                    }`}
                  >
                    {occasion.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-ink-600 font-medium mb-4">标签</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
                  placeholder="输入标签后按回车添加"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 gold-gradient text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-cream-100 text-ink-600 rounded-full text-sm"
                  >
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-ruby-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gold-100">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isSubmitting}
            className="px-6 py-3 border border-gold-300 text-gold-600 rounded-xl font-medium hover:bg-gold-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一步
          </button>
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={isSubmitting}
              className="px-6 py-3 gold-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 gold-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? '保存修改' : '创建珠宝'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default JewelryForm;
