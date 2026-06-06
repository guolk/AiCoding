import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Ruler, Droplets, Lightbulb, Filter, Layers, Palette } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { calculateVolume } from '@/utils/helpers';

export default function TankNew() {
  const navigate = useNavigate();
  const addAquarium = useStore((state) => state.addAquarium);

  const [formData, setFormData] = useState({
    name: '',
    length: 60,
    width: 30,
    height: 36,
    filterType: '',
    lighting: '',
    substrate: '',
    aquascapeStyle: '',
    setupDate: new Date().toISOString().split('T')[0],
    status: 'running' as const,
  });

  const volume = calculateVolume(formData.length, formData.width, formData.height);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAquarium({
      ...formData,
      volume,
    });
    navigate('/tanks');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900">
            新建水族箱
          </h1>
          <p className="text-gray-500 mt-1">填写基本信息创建新的水族箱档案</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold font-serif text-gray-900 mb-6">
            基本信息
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                水族箱名称
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="给您的水族箱起个名字"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-aqua-600" />
                  缸体尺寸
                </div>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">长度</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      min="10"
                      max="500"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      cm
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">宽度</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      min="10"
                      max="200"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      cm
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">高度</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="10"
                      max="200"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      cm
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-aqua-600">
                <Droplets className="w-4 h-4" />
                <span>预计水量：{volume} 升</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开缸日期
              </label>
              <input
                type="date"
                name="setupDate"
                value={formData.setupDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold font-serif text-gray-900 mb-6">
            设备配置
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-aqua-600" />
                  过滤方式
                </div>
              </label>
              <select
                name="filterType"
                value={formData.filterType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all"
              >
                <option value="">请选择过滤方式</option>
                <option value="滤筒过滤">滤筒过滤</option>
                <option value="底滤">底滤</option>
                <option value="上滤">上滤</option>
                <option value="背滤">背滤</option>
                <option value="侧滤">侧滤</option>
                <option value="滤筒 + 前置过滤">滤筒 + 前置过滤</option>
                <option value="底滤 + 造浪泵">底滤 + 造浪泵</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  灯光配置
                </div>
              </label>
              <input
                type="text"
                name="lighting"
                value={formData.lighting}
                onChange={handleChange}
                placeholder="例如：LED水草灯 60W"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-reef-600" />
                  底床类型
                </div>
              </label>
              <select
                name="substrate"
                value={formData.substrate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all"
              >
                <option value="">请选择底床类型</option>
                <option value="ADA水草泥">ADA水草泥</option>
                <option value="尼特利水草泥">尼特利水草泥</option>
                <option value="陶粒">陶粒</option>
                <option value="河沙">河沙</option>
                <option value="化妆沙">化妆沙</option>
                <option value="珊瑚砂">珊瑚砂</option>
                <option value="菲律宾沙">菲律宾沙</option>
                <option value="ADA水草泥 + 化妆沙">ADA水草泥 + 化妆沙</option>
                <option value="珊瑚砂 + 菲律宾沙">珊瑚砂 + 菲律宾沙</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-coral-600" />
                  造景风格
                </div>
              </label>
              <select
                name="aquascapeStyle"
                value={formData.aquascapeStyle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all"
              >
                <option value="">请选择造景风格</option>
                <option value="荷兰式造景">荷兰式造景</option>
                <option value="ADA自然风">ADA自然风</option>
                <option value="石景造景">石景造景</option>
                <option value="沉木造景">沉木造景</option>
                <option value="三湖岩栖造景">三湖岩栖造景</option>
                <option value="原生造景">原生造景</option>
                <option value="水陆造景">水陆造景</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-reef-500 to-reef-600 text-white rounded-xl hover:from-reef-600 hover:to-reef-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            保存档案
          </button>
        </div>
      </form>
    </div>
  );
}
