import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Save, Download, FileText, Image, Plus, Grid3X3 } from 'lucide-react';
import { usePatternStore } from '@/stores/patternStore';
import { useMaterialStore } from '@/stores/materialStore';
import PixelGrid from '@/components/editor/PixelGrid';
import Toolbar, { SymmetryPanel } from '@/components/editor/Toolbar';
import ColorPalette from '@/components/editor/ColorPalette';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { exportPatternAsPDF, exportPatternAsImage, downloadImage } from '@/utils/export';

export default function PatternEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isNew = location.pathname.endsWith('/new');  // 用路径判断，而不是 id

  const patterns = usePatternStore((s) => s.patterns);
  const currentPattern = usePatternStore((s) => s.currentPattern);
  const editorSettings = usePatternStore((s) => s.editorSettings);
  const createPattern = usePatternStore((s) => s.createPattern);
  const loadPattern = usePatternStore((s) => s.loadPattern);
  const saveCurrentPattern = usePatternStore((s) => s.saveCurrentPattern);
  const updateCurrentPattern = usePatternStore((s) => s.updateCurrentPattern);
  const setPixel = usePatternStore((s) => s.setPixel);
  const setPixels = usePatternStore((s) => s.setPixels);
  const erasePixel = usePatternStore((s) => s.erasePixel);
  const clearPattern = usePatternStore((s) => s.clearPattern);
  const updateSymmetry = usePatternStore((s) => s.updateSymmetry);
  const setEditorSettings = usePatternStore((s) => s.setEditorSettings);

  const yarns = useMaterialStore((s) => s.yarns);
  const addYarn = useMaterialStore((s) => s.addYarn);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddYarnModal, setShowAddYarnModal] = useState(false);
  
  const [patternName, setPatternName] = useState('');
  const [gridWidth, setGridWidth] = useState(20);
  const [gridHeight, setGridHeight] = useState(20);
  const [patternDesc, setPatternDesc] = useState('');

  const [newYarn, setNewYarn] = useState({
    brand: '',
    colorCode: '',
    colorName: '',
    colorHex: '#6B7280',
    weight: 50
  });

  useEffect(() => {
    if (!isNew && id) {
      loadPattern(id);
      const pattern = patterns.find((p) => p.id === id);
      if (pattern) {
        setPatternName(pattern.name);
        setPatternDesc(pattern.description);
        setGridWidth(pattern.gridWidth);
        setGridHeight(pattern.gridHeight);
      }
    }
  }, [id, isNew, loadPattern, patterns]);

  const handleCreatePattern = () => {
    if (!patternName.trim()) return;
    const newId = createPattern(patternName, gridWidth, gridHeight);
    navigate(`/patterns/${newId}`);
  };

  const handleSave = () => {
    updateCurrentPattern({ name: patternName, description: patternDesc });
    saveCurrentPattern();
    navigate('/patterns');
  };

  const handleColorSelect = (color: string, yarnId?: string) => {
    setEditorSettings({ currentColor: color, currentYarnId: yarnId || null });
  };

  const handleExportPDF = async () => {
    if (!currentPattern) return;
    try {
      await exportPatternAsPDF(currentPattern, yarns);
    } catch (e) {
      console.error('导出PDF失败', e);
    }
    setShowExportMenu(false);
  };

  const handleExportImage = async () => {
    if (!currentPattern) return;
    try {
      const dataUrl = await exportPatternAsImage(currentPattern);
      downloadImage(dataUrl, `${currentPattern.name}.png`);
    } catch (e) {
      console.error('导出图片失败', e);
    }
    setShowExportMenu(false);
  };

  const handleAddYarn = () => {
    if (!newYarn.brand || !newYarn.colorCode || !newYarn.colorName) return;
    addYarn({
      ...newYarn,
      remainingWeight: newYarn.weight
    });
    setShowAddYarnModal(false);
    setNewYarn({ brand: '', colorCode: '', colorName: '', colorHex: '#6B7280', weight: 50 });
  };

  if (isNew) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/patterns"
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">创建新图案</h1>
            <p className="text-gray-500 mt-1">设置图案的基本参数</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
              <Grid3X3 className="w-24 h-24 text-emerald-300" />
            </div>
            <div className="p-6 space-y-6">
              <Input
                label="图案名称"
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                placeholder="例如：彩虹条纹、爱心图案"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="网格宽度"
                  type="number"
                  min="4"
                  max="100"
                  value={gridWidth}
                  onChange={(e) => setGridWidth(Math.max(4, Math.min(100, Number(e.target.value))))}
                />
                <Input
                  label="网格高度"
                  type="number"
                  min="4"
                  max="100"
                  value={gridHeight}
                  onChange={(e) => setGridHeight(Math.max(4, Math.min(100, Number(e.target.value))))}
                />
              </div>
              <Textarea
                label="图案描述（可选）"
                value={patternDesc}
                onChange={(e) => setPatternDesc(e.target.value)}
                placeholder="添加图案描述、说明或备注..."
                rows={3}
              />
              <div className="flex gap-3 justify-end pt-4">
                <Link to="/patterns">
                  <Button variant="outline">取消</Button>
                </Link>
                <Button
                  onClick={handleCreatePattern}
                  disabled={!patternName.trim()}
                >
                  创建图案
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPattern) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/patterns"
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <input
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
              placeholder="图案名称"
            />
            <p className="text-sm text-gray-500">
              {currentPattern.gridWidth} × {currentPattern.gridHeight} 格
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-48 z-10">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-700">导出为 PDF</span>
                </button>
                <button
                  onClick={handleExportImage}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <Image className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-700">导出为图片</span>
                </button>
              </div>
            )}
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Toolbar
            settings={editorSettings}
            cellSize={currentPattern.cellSize}
            onSettingsChange={setEditorSettings}
            onCellSizeChange={(size) => updateCurrentPattern({ cellSize: size })}
            onClear={clearPattern}
          />
          <SymmetryPanel
            symmetry={currentPattern.symmetry}
            onChange={updateSymmetry}
          />
        </div>

        <div className="lg:col-span-6">
          <div className="sticky top-6">
            <PixelGrid
              width={currentPattern.gridWidth}
              height={currentPattern.gridHeight}
              cellSize={currentPattern.cellSize}
              pixels={currentPattern.pixels}
              currentColor={editorSettings.currentColor}
              currentYarnId={editorSettings.currentYarnId || undefined}
              tool={editorSettings.tool}
              showGrid={editorSettings.showGrid}
              symmetry={currentPattern.symmetry}
              onPixelChange={setPixel}
              onPixelErase={erasePixel}
              onPixelsSet={setPixels}
            />
            
            <div className="mt-4">
              <Textarea
                label="图案描述"
                value={patternDesc}
                onChange={(e) => setPatternDesc(e.target.value)}
                placeholder="添加图案描述、说明或备注..."
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <ColorPalette
            currentColor={editorSettings.currentColor}
            currentYarnId={editorSettings.currentYarnId}
            yarns={yarns}
            onColorSelect={handleColorSelect}
            onAddYarn={() => setShowAddYarnModal(true)}
          />
        </div>
      </div>

      <Modal
        isOpen={showAddYarnModal}
        onClose={() => setShowAddYarnModal(false)}
        title="添加线材"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="品牌"
              value={newYarn.brand}
              onChange={(e) => setNewYarn({ ...newYarn, brand: e.target.value })}
              placeholder="例如：DMC"
            />
            <Input
              label="色号"
              value={newYarn.colorCode}
              onChange={(e) => setNewYarn({ ...newYarn, colorCode: e.target.value })}
              placeholder="例如：310"
            />
          </div>
          <Input
            label="颜色名称"
            value={newYarn.colorName}
            onChange={(e) => setNewYarn({ ...newYarn, colorName: e.target.value })}
            placeholder="例如：黑色"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newYarn.colorHex}
                  onChange={(e) => setNewYarn({ ...newYarn, colorHex: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={newYarn.colorHex}
                  onChange={(e) => setNewYarn({ ...newYarn, colorHex: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <Input
              label="重量(g)"
              type="number"
              min="1"
              value={newYarn.weight}
              onChange={(e) => setNewYarn({ ...newYarn, weight: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowAddYarnModal(false)}>
              取消
            </Button>
            <Button
              onClick={handleAddYarn}
              disabled={!newYarn.brand || !newYarn.colorCode || !newYarn.colorName}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
