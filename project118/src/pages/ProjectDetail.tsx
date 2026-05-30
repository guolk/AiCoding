import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Package,
  Calculator,
  CheckCircle2,
  X
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { usePatternStore } from '@/stores/patternStore';
import { useMaterialStore } from '@/stores/materialStore';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { Input, Textarea, Select } from '@/components/common/Input';
import ProgressBar from '@/components/common/ProgressBar';
import { calculateMaterialUsage, generateMaterialCSV } from '@/utils/materialCalculator';
import { downloadCSV } from '@/utils/export';
import type { ProjectType, ProjectYarn } from '@/types';

const typeOptions = [
  { value: 'knitting', label: '针织' },
  { value: 'crochet', label: '钩针' },
  { value: 'embroidery', label: '刺绣' },
  { value: 'weaving', label: '编织' }
];

const unitOptions = [
  { value: 'cm', label: '厘米 (cm)' },
  { value: 'in', label: '英寸 (in)' }
];

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isNew = location.pathname.endsWith('/new');  // 用路径判断，而不是 id

  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const updateProgress = useProjectStore((s) => s.updateProgress);
  const addPhoto = useProjectStore((s) => s.addPhoto);
  const deletePhoto = useProjectStore((s) => s.deletePhoto);
  const patterns = usePatternStore((s) => s.patterns);
  const yarns = useMaterialStore((s) => s.yarns);

  const [projectData, setProjectData] = useState({
    name: '',
    type: 'knitting' as ProjectType,
    patternId: '',
    dimensions: { width: 50, height: 50, unit: 'cm' as 'cm' | 'in' },
    progress: 0,
    notes: '',
    yarnsUsed: [] as ProjectYarn[]
  });

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoNote, setNewPhotoNote] = useState('');

  const currentProject = !isNew ? projects.find((p) => p.id === id) : null;

  useEffect(() => {
    if (currentProject) {
      setProjectData({
        name: currentProject.name,
        type: currentProject.type,
        patternId: currentProject.patternId || '',
        dimensions: currentProject.dimensions,
        progress: currentProject.progress,
        notes: currentProject.notes,
        yarnsUsed: currentProject.yarnsUsed
      });
    }
  }, [currentProject]);

  const handleSave = () => {
    if (!projectData.name.trim()) return;

    if (isNew) {
      createProject({
        name: projectData.name,
        type: projectData.type,
        patternId: projectData.patternId || undefined,
        dimensions: projectData.dimensions,
        notes: projectData.notes
      });
      navigate('/projects');
    } else if (id) {
      updateProject(id, {
        name: projectData.name,
        type: projectData.type,
        patternId: projectData.patternId || undefined,
        dimensions: projectData.dimensions,
        notes: projectData.notes,
        yarnsUsed: projectData.yarnsUsed
      });
      updateProgress(id, projectData.progress);
    }
  };

  const handleCalculateMaterials = () => {
    if (!projectData.patternId) return;
    const pattern = patterns.find((p) => p.id === projectData.patternId);
    if (!pattern) return;

    const materials = calculateMaterialUsage(pattern, projectData.dimensions);
    const yarnsUsed: ProjectYarn[] = materials.map((m) => ({
      yarnId: m.yarnId || m.color,
      estimatedWeight: m.estimatedWeight,
      usedWeight: 0
    }));
    setProjectData({ ...projectData, yarnsUsed });
    setShowMaterialModal(true);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim() || !id) return;
    addPhoto(id, { url: newPhotoUrl, note: newPhotoNote });
    setNewPhotoUrl('');
    setNewPhotoNote('');
    setShowPhotoModal(false);
  };

  const handleExportMaterials = () => {
    if (!projectData.patternId) return;
    const pattern = patterns.find((p) => p.id === projectData.patternId);
    if (!pattern) return;

    const materials = calculateMaterialUsage(pattern, projectData.dimensions);
    const yarnMap = new Map(yarns.map((y) => [y.id, { colorName: y.colorName, colorHex: y.colorHex, brand: y.brand }]));
    const csv = generateMaterialCSV(materials, yarnMap);
    downloadCSV(csv, `${projectData.name}_材料清单.csv`);
  };

  const selectedPattern = projectData.patternId ? patterns.find((p) => p.id === projectData.patternId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? '新建项目' : currentProject?.name || '项目详情'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isNew ? '创建一个新的编织项目' : '编辑项目信息和进度'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!projectData.name.trim()}>
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">基本信息</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="项目名称"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                placeholder="例如：冬季围巾"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="项目类型"
                  value={projectData.type}
                  onChange={(e) => setProjectData({ ...projectData, type: e.target.value as ProjectType })}
                  options={typeOptions}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">关联图案</label>
                  <select
                    value={projectData.patternId}
                    onChange={(e) => setProjectData({ ...projectData, patternId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">无（后续可添加）</option>
                    {patterns.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">尺寸</label>
                <div className="grid grid-cols-4 gap-3">
                  <Input
                    type="number"
                    value={projectData.dimensions.width}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      dimensions: { ...projectData.dimensions, width: Number(e.target.value) }
                    })}
                    placeholder="宽度"
                  />
                  <span className="flex items-center justify-center text-gray-500">×</span>
                  <Input
                    type="number"
                    value={projectData.dimensions.height}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      dimensions: { ...projectData.dimensions, height: Number(e.target.value) }
                    })}
                    placeholder="高度"
                  />
                  <Select
                    value={projectData.dimensions.unit}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      dimensions: { ...projectData.dimensions, unit: e.target.value as 'cm' | 'in' }
                    })}
                    options={unitOptions}
                  />
                </div>
              </div>

              <Textarea
                label="备注"
                value={projectData.notes}
                onChange={(e) => setProjectData({ ...projectData, notes: e.target.value })}
                placeholder="添加项目备注..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">项目进度</h3>
              <span className="text-sm font-medium text-emerald-600">{projectData.progress}%</span>
            </CardHeader>
            <CardContent>
              <input
                type="range"
                min="0"
                max="100"
                value={projectData.progress}
                onChange={(e) => setProjectData({ ...projectData, progress: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <ProgressBar
                progress={projectData.progress}
                size="lg"
                color={projectData.progress === 100 ? 'green' : 'orange'}
                className="mt-4"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">进度照片</h3>
              <Button variant="outline" size="sm" onClick={() => setShowPhotoModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加照片
              </Button>
            </CardHeader>
            <CardContent>
              {!currentProject || currentProject.photos.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">还没有添加照片</p>
                  <p className="text-sm text-gray-400 mt-1">记录你的制作过程</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentProject.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={photo.url}
                          alt={photo.note || `照片 ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      {photo.note && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{photo.note}</p>
                      )}
                      <button
                        onClick={() => id && deletePhoto(id, index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4" />
                材料清单
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectData.yarnsUsed.length === 0 ? (
                <div className="text-center py-8">
                  <Calculator className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 mb-4">关联图案后可计算材料用量</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCalculateMaterials}
                    disabled={!projectData.patternId}
                  >
                    计算材料用量
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectData.yarnsUsed.map((y, index) => {
                    const yarn = yarns.find((yarn) => yarn.id === y.yarnId);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: yarn?.colorHex || '#ccc' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {yarn?.colorName || y.yarnId}
                          </p>
                          <p className="text-xs text-gray-500">
                            预估: {y.estimatedWeight}g
                          </p>
                        </div>
                        <div className="w-16">
                          <input
                            type="number"
                            min="0"
                            value={y.usedWeight}
                            onChange={(e) => {
                              const newYarnsUsed = [...projectData.yarnsUsed];
                              newYarnsUsed[index] = { ...y, usedWeight: Number(e.target.value) };
                              setProjectData({ ...projectData, yarnsUsed: newYarnsUsed });
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                            placeholder="已用"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" size="sm" className="w-full" onClick={handleExportMaterials}>
                    导出材料清单
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedPattern && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">关联图案</h3>
              </CardHeader>
              <CardContent>
                <Link to={`/patterns/${selectedPattern.id}`} className="block">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative mb-3">
                    {selectedPattern.pixels.slice(0, 200).map((pixel, i) => (
                      <div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${(pixel.x / selectedPattern.gridWidth) * 100}%`,
                          top: `${(pixel.y / selectedPattern.gridHeight) * 100}%`,
                          width: `${100 / selectedPattern.gridWidth}%`,
                          height: `${100 / selectedPattern.gridHeight}%`,
                          backgroundColor: pixel.color
                        }}
                      />
                    ))}
                  </div>
                  <p className="font-medium text-gray-900">{selectedPattern.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedPattern.gridWidth} × {selectedPattern.gridHeight} 格
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="添加进度照片"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="图片链接"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
          <Textarea
            label="照片说明（可选）"
            value={newPhotoNote}
            onChange={(e) => setNewPhotoNote(e.target.value)}
            placeholder="这张照片记录了什么..."
            rows={2}
          />
          {newPhotoUrl && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={newPhotoUrl}
                alt="预览"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowPhotoModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddPhoto} disabled={!newPhotoUrl.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title="材料用量计算结果"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            根据图案和尺寸计算出预估材料用量，你可以调整或手动添加更多线材。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {projectData.yarnsUsed.map((y, index) => {
              const yarn = yarns.find((yrn) => yrn.id === y.yarnId);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: yarn?.colorHex || y.yarnId }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {yarn?.colorName || y.yarnId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {yarn?.brand && `${yarn.brand} · `}
                      预估 {y.estimatedWeight}g
                    </p>
                  </div>
                  {yarn && yarn.remainingWeight < y.estimatedWeight && (
                    <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      库存不足
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button onClick={() => setShowMaterialModal(false)}>
              确认
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
