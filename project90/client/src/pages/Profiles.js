import React, { useState, useEffect } from 'react';
import { Plus, Search, Copy, Layers, Thermometer, Zap, Settings as SettingsIcon } from 'lucide-react';
import { profilesAPI } from '../services/api';

const FILAMENT_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'PC', '尼龙', '通用'];
const MODEL_TYPES = ['功能件', '装饰件', '原型件', '高精度', '快速打印', '通用'];
const INFILL_PATTERNS = ['Grid', 'Cubic', 'Triangles', 'Gyroid', 'Rectilinear', 'Honeycomb', 'Lines'];
const SUPPORT_TYPES = ['None', 'Normal', 'Tree', 'Soluble', 'Support Interface'];

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filamentFilter, setFilamentFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    filament_type: 'PLA',
    model_type: '通用',
    description: '',
    layer_height: '0.2',
    nozzle_temp: '200',
    bed_temp: '60',
    print_speed: '60',
    wall_speed: '40',
    infill_speed: '80',
    travel_speed: '120',
    wall_thickness: '1.2',
    wall_line_count: '3',
    top_layers: '3',
    bottom_layers: '3',
    infill_pattern: 'Grid',
    infill_density: '20',
    retraction_enable: true,
    retraction_distance: '2',
    retraction_speed: '40',
    retraction_retract_speed: '40',
    support_enable: false,
    support_type: 'None',
    support_density: '15',
    cooling_enable: true,
    fan_speed: '100',
    brim_enable: false,
    brim_width: '5',
    is_default: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await profilesAPI.getAll();
      setProfiles(res.data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilament = filamentFilter === 'all' || profile.filament_type === filamentFilter;
    const matchesModel = modelFilter === 'all' || profile.model_type === modelFilter;
    return matchesSearch && matchesFilament && matchesModel;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        layer_height: parseFloat(formData.layer_height),
        nozzle_temp: parseFloat(formData.nozzle_temp),
        bed_temp: parseFloat(formData.bed_temp),
        print_speed: parseFloat(formData.print_speed),
        wall_speed: parseFloat(formData.wall_speed),
        infill_speed: parseFloat(formData.infill_speed),
        travel_speed: parseFloat(formData.travel_speed),
        wall_thickness: parseFloat(formData.wall_thickness),
        wall_line_count: parseInt(formData.wall_line_count),
        top_layers: parseInt(formData.top_layers),
        bottom_layers: parseInt(formData.bottom_layers),
        infill_density: parseFloat(formData.infill_density),
        retraction_distance: parseFloat(formData.retraction_distance),
        retraction_speed: parseFloat(formData.retraction_speed),
        retraction_retract_speed: parseFloat(formData.retraction_retract_speed),
        support_density: parseFloat(formData.support_density),
        fan_speed: parseFloat(formData.fan_speed),
        brim_width: parseFloat(formData.brim_width),
      };

      if (editingProfile) {
        await profilesAPI.update(editingProfile.id, data);
      } else {
        await profilesAPI.create(data);
      }
      loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      filament_type: profile.filament_type || 'PLA',
      model_type: profile.model_type || '通用',
      description: profile.description || '',
      layer_height: profile.layer_height || '0.2',
      nozzle_temp: profile.nozzle_temp || '200',
      bed_temp: profile.bed_temp || '60',
      print_speed: profile.print_speed || '60',
      wall_speed: profile.wall_speed || '40',
      infill_speed: profile.infill_speed || '80',
      travel_speed: profile.travel_speed || '120',
      wall_thickness: profile.wall_thickness || '1.2',
      wall_line_count: profile.wall_line_count || '3',
      top_layers: profile.top_layers || '3',
      bottom_layers: profile.bottom_layers || '3',
      infill_pattern: profile.infill_pattern || 'Grid',
      infill_density: profile.infill_density || '20',
      retraction_enable: profile.retraction_enable ? true : false,
      retraction_distance: profile.retraction_distance || '2',
      retraction_speed: profile.retraction_speed || '40',
      retraction_retract_speed: profile.retraction_retract_speed || '40',
      support_enable: profile.support_enable ? true : false,
      support_type: profile.support_type || 'None',
      support_density: profile.support_density || '15',
      cooling_enable: profile.cooling_enable ? true : false,
      fan_speed: profile.fan_speed || '100',
      brim_enable: profile.brim_enable ? true : false,
      brim_width: profile.brim_width || '5',
      is_default: profile.is_default ? true : false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个切片配置吗？')) {
      try {
        await profilesAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  const handleDuplicate = async (profile) => {
    try {
      const data = {
        ...profile,
        name: `${profile.name} (副本)`,
        is_default: false,
      };
      delete data.id;
      delete data.created_at;
      await profilesAPI.create(data);
      loadData();
    } catch (error) {
      console.error('Error duplicating profile:', error);
    }
  };

  const resetForm = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      filament_type: 'PLA',
      model_type: '通用',
      description: '',
      layer_height: '0.2',
      nozzle_temp: '200',
      bed_temp: '60',
      print_speed: '60',
      wall_speed: '40',
      infill_speed: '80',
      travel_speed: '120',
      wall_thickness: '1.2',
      wall_line_count: '3',
      top_layers: '3',
      bottom_layers: '3',
      infill_pattern: 'Grid',
      infill_density: '20',
      retraction_enable: true,
      retraction_distance: '2',
      retraction_speed: '40',
      retraction_retract_speed: '40',
      support_enable: false,
      support_type: 'None',
      support_density: '15',
      cooling_enable: true,
      fan_speed: '100',
      brim_enable: false,
      brim_width: '5',
      is_default: false,
    });
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">切片参数库</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新建配置</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索配置..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <select
          value={filamentFilter}
          onChange={(e) => setFilamentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="all">全部耗材类型</option>
          {FILAMENT_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="all">全部模型类型</option>
          {MODEL_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无切片配置</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            创建第一个配置
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{profile.name}</h3>
                      {profile.is_default && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">默认</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {profile.filament_type}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        {profile.model_type}
                      </span>
                    </div>
                    {profile.description && (
                      <p className="text-sm text-gray-500 mt-2">{profile.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <ProfileItem icon={<Layers className="w-3 h-3" />} label="层厚" value={`${profile.layer_height}mm`} />
                  <ProfileItem icon={<Thermometer className="w-3 h-3" />} label="温度" value={`${profile.nozzle_temp}°C`} />
                  <ProfileItem icon={<Zap className="w-3 h-3" />} label="速度" value={`${profile.print_speed}mm/s`} />
                  <ProfileItem icon={<Layers className="w-3 h-3" />} label="填充" value={`${profile.infill_density}%`} />
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDuplicate(profile)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors"
                      title="复制配置"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(profile)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProfile ? '编辑配置' : '新建配置'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">配置名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. PLA 标准质量"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">耗材类型</label>
                  <select
                    value={formData.filament_type}
                    onChange={(e) => setFormData({ ...formData, filament_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {FILAMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模型类型</label>
                  <select
                    value={formData.model_type}
                    onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {MODEL_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">基础设置</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NumberInput label="层厚 (mm)" value={formData.layer_height} step="0.01" onChange={(v) => setFormData({ ...formData, layer_height: v })} />
                  <NumberInput label="喷嘴温度 (°C)" value={formData.nozzle_temp} onChange={(v) => setFormData({ ...formData, nozzle_temp: v })} />
                  <NumberInput label="热床温度 (°C)" value={formData.bed_temp} onChange={(v) => setFormData({ ...formData, bed_temp: v })} />
                  <NumberInput label="打印速度 (mm/s)" value={formData.print_speed} onChange={(v) => setFormData({ ...formData, print_speed: v })} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">速度设置</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NumberInput label="外壁速度 (mm/s)" value={formData.wall_speed} onChange={(v) => setFormData({ ...formData, wall_speed: v })} />
                  <NumberInput label="填充速度 (mm/s)" value={formData.infill_speed} onChange={(v) => setFormData({ ...formData, infill_speed: v })} />
                  <NumberInput label="移动速度 (mm/s)" value={formData.travel_speed} onChange={(v) => setFormData({ ...formData, travel_speed: v })} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">外壳设置</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NumberInput label="壁厚 (mm)" value={formData.wall_thickness} step="0.1" onChange={(v) => setFormData({ ...formData, wall_thickness: v })} />
                  <NumberInput label="壁线条数" value={formData.wall_line_count} onChange={(v) => setFormData({ ...formData, wall_line_count: v })} />
                  <NumberInput label="顶层数" value={formData.top_layers} onChange={(v) => setFormData({ ...formData, top_layers: v })} />
                  <NumberInput label="底层数" value={formData.bottom_layers} onChange={(v) => setFormData({ ...formData, bottom_layers: v })} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">填充设置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">填充图案</label>
                    <select
                      value={formData.infill_pattern}
                      onChange={(e) => setFormData({ ...formData, infill_pattern: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {INFILL_PATTERNS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <NumberInput label="填充密度 (%)" value={formData.infill_density} onChange={(v) => setFormData({ ...formData, infill_density: v })} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">回抽设置</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.retraction_enable}
                      onChange={(e) => setFormData({ ...formData, retraction_enable: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-sm text-gray-700">启用回抽</span>
                  </label>
                </div>
                {formData.retraction_enable && (
                  <div className="grid grid-cols-3 gap-4">
                    <NumberInput label="回抽距离 (mm)" value={formData.retraction_distance} step="0.1" onChange={(v) => setFormData({ ...formData, retraction_distance: v })} />
                    <NumberInput label="回抽速度 (mm/s)" value={formData.retraction_speed} onChange={(v) => setFormData({ ...formData, retraction_speed: v })} />
                    <NumberInput label="恢复速度 (mm/s)" value={formData.retraction_retract_speed} onChange={(v) => setFormData({ ...formData, retraction_retract_speed: v })} />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">支撑设置</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.support_enable}
                      onChange={(e) => setFormData({ ...formData, support_enable: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-sm text-gray-700">启用支撑</span>
                  </label>
                </div>
                {formData.support_enable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">支撑类型</label>
                      <select
                        value={formData.support_type}
                        onChange={(e) => setFormData({ ...formData, support_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {SUPPORT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <NumberInput label="支撑密度 (%)" value={formData.support_density} onChange={(v) => setFormData({ ...formData, support_density: v })} />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">冷却与粘附</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-4 mb-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.cooling_enable}
                          onChange={(e) => setFormData({ ...formData, cooling_enable: e.target.checked })}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span className="text-sm text-gray-700">启用冷却</span>
                      </label>
                    </div>
                    {formData.cooling_enable && (
                      <NumberInput label="风扇速度 (%)" value={formData.fan_speed} onChange={(v) => setFormData({ ...formData, fan_speed: v })} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-4 mb-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.brim_enable}
                          onChange={(e) => setFormData({ ...formData, brim_enable: e.target.checked })}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span className="text-sm text-gray-700">启用边缘</span>
                      </label>
                    </div>
                    {formData.brim_enable && (
                      <NumberInput label="边缘宽度 (mm)" value={formData.brim_width} step="0.5" onChange={(v) => setFormData({ ...formData, brim_width: v })} />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm text-gray-700">设为默认配置</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingProfile ? '保存修改' : '创建配置'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileItem({ icon, label, value }) {
  return (
    <div className="flex items-center space-x-1 text-gray-600">
      {icon}
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800 text-sm">{value}</span>
    </div>
  );
}

function NumberInput({ label, value, step = '1', onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  );
}