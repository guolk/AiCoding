import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Image,
} from 'lucide-react';
import { getCollectionStatusLabel, getCollectionStatusColor } from '@/utils/helpers';
import { CollectionStatus } from '@/types';

export default function Expansions() {
  const { games, expansions, addExpansion, updateExpansion, deleteExpansion } = useGameStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBaseGameId, setSelectedBaseGameId] = useState<string | 'all'>('all');

  const [formData, setFormData] = useState({
    baseGameId: '',
    name: '',
    publisher: '',
    yearPublished: new Date().getFullYear(),
    coverImage: '',
    status: 'owned' as CollectionStatus,
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    publisher: '',
    yearPublished: new Date().getFullYear(),
    coverImage: '',
    status: 'owned' as CollectionStatus,
    notes: '',
  });

  const getGameById = (id: string) => games.find((g) => g.id === id);

  const filteredExpansions = expansions.filter(
    (e) => selectedBaseGameId === 'all' || e.baseGameId === selectedBaseGameId
  );

  const gamesWithExpansions = games.filter((g) =>
    expansions.some((e) => e.baseGameId === g.id)
  );

  const handleAddExpansion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.baseGameId || !formData.name) {
      alert('请填写游戏名称和基础游戏');
      return;
    }

    addExpansion({
      baseGameId: formData.baseGameId,
      name: formData.name,
      publisher: formData.publisher || '未知',
      yearPublished: formData.yearPublished,
      coverImage: formData.coverImage || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=board%20game%20expansion%20box%20art%20box%20dark%20theme&image_size=square',
      status: formData.status,
      notes: formData.notes,
    });

    setFormData({
      baseGameId: '',
      name: '',
      publisher: '',
      yearPublished: new Date().getFullYear(),
      coverImage: '',
      status: 'owned',
      notes: '',
    });
    setShowAddForm(false);
  };

  const startEdit = (expansion: typeof expansions[0]) => {
    setEditingId(expansion.id);
    setEditForm({
      name: expansion.name,
      publisher: expansion.publisher,
      yearPublished: expansion.yearPublished,
      coverImage: expansion.coverImage,
      status: expansion.status,
      notes: expansion.notes || '',
    });
  };

  const saveEdit = () => {
    if (editingId) {
      updateExpansion(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个扩展吗？')) {
      deleteExpansion(id);
    }
  };

  const stats = {
    total: expansions.length,
    owned: expansions.filter((e) => e.status === 'owned').length,
    wishlist: expansions.filter((e) => e.status === 'wishlist').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">扩展内容</h1>
          <p className="text-gray-400 mt-1">管理游戏扩展包和额外内容</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">添加扩展</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">扩展总数</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.owned}</p>
              <p className="text-sm text-gray-400">已拥有</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.wishlist}</p>
              <p className="text-sm text-gray-400">愿望清单</p>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="card p-6 animate-slide-up">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            添加游戏扩展
          </h2>
          <form onSubmit={handleAddExpansion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">基础游戏</label>
                <select
                  value={formData.baseGameId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, baseGameId: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">请选择基础游戏</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">扩展名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="例如：沙丘帝国 - 崛起"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">出版社</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData((prev) => ({ ...prev, publisher: e.target.value }))}
                  className="input-field"
                  placeholder="出版社名称"
                />
              </div>
              <div>
                <label className="label">发布年份</label>
                <input
                  type="number"
                  value={formData.yearPublished}
                  onChange={(e) => setFormData((prev) => ({ ...prev, yearPublished: parseInt(e.target.value) }))}
                  className="input-field"
                  min="1900"
                  max="2100"
                />
              </div>
              <div>
                <label className="label">收藏状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as CollectionStatus }))}
                  className="input-field"
                >
                  <option value="owned">已拥有</option>
                  <option value="wishlist">愿望清单</option>
                  <option value="sold">已出售</option>
                  <option value="lent">已借出</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">封面图片 URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                  className="input-field"
                  placeholder="留空使用默认图片"
                />
              </div>
            </div>

            <div>
              <label className="label">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="input-field h-20 resize-none"
                placeholder="扩展内容说明..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {gamesWithExpansions.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBaseGameId('all')}
              className={`tag cursor-pointer transition-all ${
                selectedBaseGameId === 'all'
                  ? 'bg-accent-500 text-surface-900'
                  : 'bg-surface-200 text-gray-300 hover:bg-surface-100'
              }`}
            >
              全部扩展
            </button>
            {gamesWithExpansions.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedBaseGameId(game.id)}
                className={`tag cursor-pointer transition-all ${
                  selectedBaseGameId === game.id
                    ? 'bg-accent-500 text-surface-900'
                    : 'bg-surface-200 text-gray-300 hover:bg-surface-100'
                }`}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredExpansions.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">暂无扩展内容</p>
          <p className="text-gray-500 text-sm mt-2">
            点击上方按钮添加您的第一个游戏扩展
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExpansions.map((expansion) => {
            const baseGame = getGameById(expansion.baseGameId);
            const isEditing = editingId === expansion.id;

            return (
              <div key={expansion.id} className="card overflow-hidden">
                <div className="flex">
                  <img
                    src={expansion.coverImage}
                    alt={expansion.name}
                    className="w-24 h-32 object-cover"
                  />
                  <div className="flex-1 p-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="input-field text-sm"
                          placeholder="扩展名称"
                        />
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as CollectionStatus }))}
                          className="input-field text-sm"
                        >
                          <option value="owned">已拥有</option>
                          <option value="wishlist">愿望清单</option>
                          <option value="sold">已出售</option>
                          <option value="lent">已借出</option>
                        </select>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                          className="input-field text-sm h-16 resize-none"
                          placeholder="备注"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="btn-primary text-sm px-3 py-1.5 flex-1"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn-secondary text-sm px-3 py-1.5"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <h3 className="text-white font-medium">{expansion.name}</h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(expansion)}
                              className="p-1.5 text-gray-400 hover:text-accent-500 hover:bg-accent-500/10 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expansion.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {baseGame && (
                          <Link
                            to={`/collection/${baseGame.id}`}
                            className="text-xs text-accent-500 hover:text-accent-400 mt-1 inline-block"
                          >
                            基于: {baseGame.name}
                          </Link>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`tag ${getCollectionStatusColor(expansion.status)}`}>
                            {getCollectionStatusLabel(expansion.status)}
                          </span>
                          {expansion.publisher && (
                            <span className="text-xs text-gray-500">
                              {expansion.publisher}
                            </span>
                          )}
                        </div>
                        {expansion.notes && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                            {expansion.notes}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
