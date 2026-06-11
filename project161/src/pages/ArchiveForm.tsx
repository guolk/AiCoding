import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { ArrowLeft, Save } from 'lucide-react';
import type { Tree } from '@/types';

export default function ArchiveForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trees, addTree, updateTree } = useTreeStore();

  const existingTree = id ? trees.find((t) => t.id === id) : null;

  const [form, setForm] = useState<Partial<Tree>>(existingTree || {
    species: '', scientificName: '', dbh: 0, height: 0, crownWidth: 0,
    estimatedAge: 0, gpsLatitude: '', gpsLongitude: '', location: '',
    ownership: '', healthStatus: 'good',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingTree) {
      updateTree(id!, { ...form, updatedAt: new Date().toISOString().split('T')[0] } as Partial<Tree>);
    } else {
      const newTree: Tree = {
        id: `t${Date.now()}`,
        species: form.species || '',
        scientificName: form.scientificName || '',
        dbh: form.dbh || 0,
        height: form.height || 0,
        crownWidth: form.crownWidth || 0,
        estimatedAge: form.estimatedAge || 0,
        gpsLatitude: form.gpsLatitude || '',
        gpsLongitude: form.gpsLongitude || '',
        location: form.location || '',
        ownership: form.ownership || '',
        healthStatus: (form.healthStatus as Tree['healthStatus']) || 'good',
        coverImage: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20${encodeURIComponent(form.species || 'tree')}%20tree%20in%20Chinese%20landscape&image_size=landscape_4_3`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      addTree(newTree);
    }
    navigate('/archives');
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/archives" className="p-2 rounded-lg hover:bg-forest-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-forest-600" />
        </Link>
        <h1 className="font-serif text-3xl font-bold text-forest-600">
          {existingTree ? '编辑古树档案' : '新增古树档案'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">基本信息</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">树种</label>
              <input type="text" value={form.species || ''} onChange={(e) => updateField('species', e.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" required />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">学名</label>
              <input type="text" value={form.scientificName || ''} onChange={(e) => updateField('scientificName', e.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 italic" required />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">健康状态</label>
              <select value={form.healthStatus || 'good'} onChange={(e) => updateField('healthStatus', e.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400">
                <option value="excellent">优</option>
                <option value="good">良</option>
                <option value="fair">中</option>
                <option value="poor">差</option>
                <option value="critical">危</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">测量数据</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">胸径 (cm)</label>
              <input type="number" value={form.dbh || ''} onChange={(e) => updateField('dbh', Number(e.target.value))}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">树高 (m)</label>
              <input type="number" step="0.1" value={form.height || ''} onChange={(e) => updateField('height', Number(e.target.value))}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">冠幅 (m)</label>
              <input type="number" step="0.1" value={form.crownWidth || ''} onChange={(e) => updateField('crownWidth', Number(e.target.value))}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">推测树龄 (年)</label>
              <input type="number" value={form.estimatedAge || ''} onChange={(e) => updateField('estimatedAge', Number(e.target.value))}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">位置与权属</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">生长地点</label>
              <input type="text" value={form.location || ''} onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" required />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">权属单位</label>
              <input type="text" value={form.ownership || ''} onChange={(e) => updateField('ownership', e.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">GPS 纬度</label>
              <input type="text" value={form.gpsLatitude || ''} onChange={(e) => updateField('gpsLatitude', e.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" placeholder="例: 30.2592" />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">GPS 经度</label>
              <input type="text" value={form.gpsLongitude || ''} onChange={(e) => updateField('gpsLongitude', e.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" placeholder="例: 120.1551" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/archives" className="px-6 py-2.5 border border-forest-200 rounded-lg text-brown-700/70 hover:bg-forest-50 transition-colors">
            取消
          </Link>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors shadow-md">
            <Save className="w-4 h-4" />
            {existingTree ? '保存修改' : '创建档案'}
          </button>
        </div>
      </form>
    </div>
  );
}
