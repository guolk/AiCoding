import { useState, useRef } from 'react';
import { Settings, Download, Upload, Trash2, AlertTriangle, Info, Palette, Grid3X3 } from 'lucide-react';
import { usePatternStore } from '@/stores/patternStore';
import { useProjectStore } from '@/stores/projectStore';
import { useMaterialStore } from '@/stores/materialStore';
import { useLearningStore } from '@/stores/learningStore';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface BackupData {
  version: string;
  exportedAt: string;
  patterns: any[];
  projects: any[];
  materials: any[];
  learning: any;
}

export default function SettingsPage() {
  const patterns = usePatternStore((s) => s.patterns);
  const projects = useProjectStore((s) => s.projects);
  const materials = useMaterialStore((s) => s.yarns);
  const yarnUsageHistory = useMaterialStore((s) => s.yarnUsageHistory);
  const stitchNotes = useLearningStore((s) => s.stitchNotes);
  const problemSolutions = useLearningStore((s) => s.problemSolutions);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  const [defaultCellSize, setDefaultCellSize] = useState(20);
  const [defaultGridWidth, setDefaultGridWidth] = useState(20);
  const [defaultGridHeight, setDefaultGridHeight] = useState(20);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backupData: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patterns,
      projects,
      materials,
      learning: {
        stitchNotes,
        problemSolutions,
        yarnUsageHistory
      }
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `织梦工坊备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError('');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const data = JSON.parse(text) as BackupData;

      if (!data.version || !data.exportedAt) {
        throw new Error('无效的备份文件格式');
      }

      if (data.patterns) {
        localStorage.setItem('pattern-storage', JSON.stringify({
          state: { patterns: data.patterns },
          version: 0
        }));
      }

      if (data.projects) {
        localStorage.setItem('project-storage', JSON.stringify({
          state: { projects: data.projects },
          version: 0
        }));
      }

      if (data.materials) {
        localStorage.setItem('material-storage', JSON.stringify({
          state: { yarns: data.materials },
          version: 0
        }));
      }

      if (data.learning) {
        localStorage.setItem('learning-storage', JSON.stringify({
          state: {
            stitchNotes: data.learning.stitchNotes || [],
            problemSolutions: data.learning.problemSolutions || []
          },
          version: 0
        }));
      }

      setShowImportModal(false);
      setImportFile(null);
      window.location.reload();
    } catch (err) {
      setImportError('导入失败：文件格式不正确或已损坏');
    }
  };

  const handleClearAll = () => {
    const keys = ['pattern-storage', 'project-storage', 'material-storage', 'learning-storage'];
    keys.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  const stats = {
    patterns: patterns.length,
    projects: projects.length,
    materials: materials.length,
    stitches: stitchNotes.length,
    solutions: problemSolutions.length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-500 mt-1">管理应用设置和数据</p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">数据管理</h2>
            <p className="text-sm text-gray-500">备份和恢复你的所有数据</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.patterns}</p>
              <p className="text-xs text-gray-500">图案</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.projects}</p>
              <p className="text-xs text-gray-500">项目</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.materials}</p>
              <p className="text-xs text-gray-500">线材</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.stitches}</p>
              <p className="text-xs text-gray-500">针法</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{stats.solutions}</p>
              <p className="text-xs text-gray-500">方案</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出所有数据
            </Button>
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              导入数据
            </Button>
            <Button variant="danger" onClick={() => setShowClearModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              清空所有数据
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">编辑器默认设置</h2>
            <p className="text-sm text-gray-500">自定义图案编辑器的默认参数</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="默认格子大小 (px)"
              type="number"
              min="10"
              max="50"
              value={defaultCellSize}
              onChange={(e) => setDefaultCellSize(Number(e.target.value))}
            />
            <Input
              label="默认网格宽度"
              type="number"
              min="5"
              max="200"
              value={defaultGridWidth}
              onChange={(e) => setDefaultGridWidth(Number(e.target.value))}
            />
            <Input
              label="默认网格高度"
              type="number"
              min="5"
              max="200"
              value={defaultGridHeight}
              onChange={(e) => setDefaultGridHeight(Number(e.target.value))}
            />
          </div>
          <p className="text-xs text-gray-400">
            注意：这些设置将影响新建图案时的默认参数，已有图案不受影响。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">关于织梦工坊</h2>
            <p className="text-sm text-gray-500">专为手工编织爱好者设计</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <h3 className="font-semibold text-emerald-800 mb-2">织梦工坊 v1.0</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              一个功能完整的在线图案和织物设计管理工具。支持像素网格编辑器、线材库存管理、
              项目进度追踪、材料用量计算等功能，帮助你更好地管理编织、刺绣、钩针等手工项目。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Palette className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">数据存储在本地浏览器</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Download className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">支持数据导入导出</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Settings className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">无需注册即可使用</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Grid3X3 className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">支持图案对称绘制</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportError('');
        }}
        title="导入数据"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">导入注意事项</p>
                <p className="text-xs text-amber-700 mt-1">
                  导入将覆盖当前所有数据，请确保已备份现有数据。
                </p>
              </div>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                importFile
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={`w-10 h-10 mx-auto mb-2 ${importFile ? 'text-emerald-500' : 'text-gray-300'}`} />
              {importFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">点击选择备份文件</p>
                  <p className="text-xs text-gray-400 mt-1">支持 .json 格式</p>
                </div>
              )}
            </div>
          </div>

          {importError && (
            <p className="text-sm text-red-500">{importError}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
                setImportError('');
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile}
            >
              确认导入
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="清空所有数据"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">此操作不可撤销</p>
                <p className="text-sm text-red-700 mt-1">
                  清空后所有图案、项目、线材库存、学习笔记等数据将被永久删除。
                  建议先导出备份。
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleClearAll}
            >
              确认清空
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
