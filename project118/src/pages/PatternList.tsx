import { useState } from 'react';
import { Plus, Grid3X3, Edit2, Trash2, Copy, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatternStore } from '@/stores/patternStore';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import SearchBar from '@/components/common/SearchBar';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

export default function PatternList() {
  const navigate = useNavigate();
  const patterns = usePatternStore((s) => s.patterns);
  const deletePattern = usePatternStore((s) => s.deletePattern);
  const duplicatePattern = usePatternStore((s) => s.duplicatePattern);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState<string | null>(null);

  const filteredPatterns = patterns.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (patternToDelete) {
      deletePattern(patternToDelete);
    }
    setDeleteModalOpen(false);
    setPatternToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">图案设计</h1>
          <p className="text-gray-500 mt-1">管理和编辑你的编织图案</p>
        </div>
        <Button onClick={() => navigate('/patterns/new')}>
          <Plus className="w-4 h-4 mr-2" />
          新建图案
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索图案..."
          className="flex-1 max-w-md"
        />
      </div>

      {filteredPatterns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Grid3X3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '没有找到匹配的图案' : '还没有创建图案'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? '尝试其他搜索词' : '创建你的第一个编织图案'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/patterns/new')}>
                <Plus className="w-4 h-4 mr-2" />
                新建图案
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPatterns.map((pattern) => (
            <Card key={pattern.id} className="overflow-hidden">
              <div
                onClick={() => navigate(`/patterns/${pattern.id}`)}
                className="aspect-square bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity relative"
              >
                {pattern.pixels.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Grid3X3 className="w-12 h-12 text-gray-300" />
                  </div>
                ) : (
                  pattern.pixels.map((pixel, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${(pixel.x / pattern.gridWidth) * 100}%`,
                        top: `${(pixel.y / pattern.gridHeight) * 100}%`,
                        width: `${100 / pattern.gridWidth}%`,
                        height: `${100 / pattern.gridHeight}%`,
                        backgroundColor: pixel.color
                      }}
                    />
                  ))
                )}
              </div>
              
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{pattern.name}</h4>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(pattern.updatedAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {pattern.gridWidth} × {pattern.gridHeight} 格 · {pattern.pixels.length} 像素
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/patterns/${pattern.id}`)}
                    className="flex-1 px-3 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => duplicatePattern(pattern.id)}
                    className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="复制"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setPatternToDelete(pattern.id);
                      setDeleteModalOpen(true);
                    }}
                    className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">确定要删除这个图案吗？此操作无法撤销。</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}
