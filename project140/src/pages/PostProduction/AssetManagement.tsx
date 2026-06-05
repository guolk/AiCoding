import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Image, Plus, Save, FileText, Download, Edit3, Trash2, X, Check } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function AssetManagement() {
  const { assets, episodes, updateAsset } = useAppStore();
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [editingCover, setEditingCover] = useState(false);
  const [newImageModal, setNewImageModal] = useState(false);
  const [newImage, setNewImage] = useState({ url: '', caption: '' });

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const currentEpisode = episodes.find(e => e.id === selectedAsset?.episodeId);

  const handleAddImage = () => {
    if (!selectedAsset || !newImage.url) return;
    
    const newImageItem = {
      id: Math.random().toString(36).substr(2, 9),
      url: newImage.url,
      caption: newImage.caption,
    };
    
    updateAsset(selectedAssetId, {
      images: [...selectedAsset.images, newImageItem],
    });
    
    setNewImageModal(false);
    setNewImage({ url: '', caption: '' });
  };

  const handleDeleteImage = (imageId: string) => {
    if (!selectedAsset) return;
    updateAsset(selectedAssetId, {
      images: selectedAsset.images.filter(img => img.id !== imageId),
    });
  };

  const handleSaveNotes = (notes: string) => {
    if (!selectedAsset) return;
    updateAsset(selectedAssetId, { designNotes: notes });
  };

  const coverSizes = [
    { name: '播客平台', size: '1400×1400', usage: '喜马拉雅、苹果播客等' },
    { name: '社交媒体', size: '1200×630', usage: '微信、微博分享' },
    { name: 'Instagram', size: '1080×1080', usage: 'Instagram帖子' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-600">选择节目:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-[280px]"
          >
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {episodes.find(e => e.id === asset.episodeId)?.title || '未知节目'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedAsset && currentEpisode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Image className="text-accent-500" size={20} />
                  封面设计
                </h3>
                <button
                  onClick={() => setEditingCover(!editingCover)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit3 size={16} />
                  {editingCover ? '取消编辑' : '编辑'}
                </button>
              </div>
              <div className="p-5">
                <div className="relative group">
                  <img
                    src={selectedAsset.coverUrl}
                    alt="节目封面"
                    className="w-full aspect-square rounded-xl object-cover shadow-lg"
                  />
                  {editingCover && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-4 py-2 bg-white text-slate-800 rounded-lg font-medium flex items-center gap-2">
                        <FileText size={18} />
                        更换封面
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <p className="text-sm font-medium text-slate-700">需要导出尺寸</p>
                  {coverSizes.map((size, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{size.name}</p>
                        <p className="text-xs text-slate-500">{size.usage}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 font-mono">{size.size}</span>
                        <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-primary-600 transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="text-primary-500" size={20} />
                  设计备注
                </h3>
              </div>
              <div className="p-5">
                <textarea
                  defaultValue={selectedAsset.designNotes}
                  onBlur={(e) => handleSaveNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none text-sm text-slate-700"
                  rows={5}
                  placeholder="记录设计思路、修改历史、版本信息等..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Image className="text-primary-500" size={20} />
                  配图素材
                  <span className="text-xs text-slate-400 font-normal">({selectedAsset.images.length} 张)</span>
                </h3>
                <button
                  onClick={() => setNewImageModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                  添加配图
                </button>
              </div>
              <div className="p-5">
                {selectedAsset.images.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <Image size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">暂无配图</p>
                    <p className="text-sm text-slate-400 mt-1">点击上方按钮添加配图素材</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAsset.images.map(image => (
                      <div key={image.id} className="group relative">
                        <img
                          src={image.url}
                          alt={image.caption}
                          className="w-full aspect-video rounded-xl object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100 transition-colors">
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {image.caption && (
                          <p className="mt-2 text-sm text-slate-600 text-center">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-950 to-primary-800 rounded-2xl p-6 text-white">
              <h3 className="font-display text-lg font-semibold mb-4">设计版本记录</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-accent-500 mt-1.5" />
                    <div className="absolute top-4.5 left-1.5 w-px h-8 bg-white/20" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">V1.0 初稿完成</p>
                      <span className="text-xs text-slate-300">6月3日</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">完成封面初稿设计，包含主视觉和字体选择</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5" />
                    <div className="absolute top-4.5 left-1.5 w-px h-8 bg-white/20" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">V1.1 配色调整</p>
                      <span className="text-xs text-slate-300">6月4日</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">根据反馈调整主色调，优化对比度</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">V1.2 最终版</p>
                      <span className="text-xs text-slate-300">6月5日</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">确认所有尺寸导出，准备发布使用</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {newImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">添加配图</h3>
              <button onClick={() => setNewImageModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">图片URL</label>
                <input
                  type="text"
                  value={newImage.url}
                  onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="输入图片链接..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">图片说明</label>
                <input
                  type="text"
                  value={newImage.caption}
                  onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="简要描述这张图片..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setNewImageModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddImage}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
