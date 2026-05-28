import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Image, User, Mic } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Event, OralHistory, Photo } from '../types';

type TabType = 'events' | 'oral' | 'photos';

export const History: React.FC = () => {
  const { data, addEvent, updateEvent, deleteEvent, addOralHistory, updateOralHistory, deleteOralHistory, addPhoto, updatePhoto, deletePhoto } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingItem ? editingItem.id : Date.now().toString();
    
    if (activeTab === 'events') {
      if (editingItem) {
        updateEvent(id, formData);
      } else {
        addEvent({ ...formData, id } as Event);
      }
    } else if (activeTab === 'oral') {
      if (editingItem) {
        updateOralHistory(id, formData);
      } else {
        addOralHistory({ ...formData, id } as OralHistory);
      }
    } else if (activeTab === 'photos') {
      if (editingItem) {
        updatePhoto(id, formData);
      } else {
        addPhoto({ ...formData, id, people: [] } as Photo);
      }
    }
    
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      if (activeTab === 'events') deleteEvent(id);
      else if (activeTab === 'oral') deleteOralHistory(id);
      else if (activeTab === 'photos') deletePhoto(id);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'migration': return '🚶';
      case 'historical': return '📜';
      case 'achievement': return '🏆';
      case 'tragedy': return '💔';
      default: return '📌';
    }
  };

  const renderEvents = () => (
    <div className="space-y-6">
      {data.events
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((event) => (
          <div
            key={event.id}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brown-100 flex items-center justify-center text-2xl shadow">
                {getEventIcon(event.type)}
              </div>
              <div className="w-0.5 flex-1 bg-brown-200 mt-2"></div>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-brown-800 mb-1">{event.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-brown-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-brown-600 hover:bg-brown-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-brown-700 leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      {data.events.length === 0 && (
        <div className="text-center py-12 text-brown-500">
          暂无历史事件记录
        </div>
      )}
    </div>
  );

  const renderOralHistories = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.oralHistories.map((history) => (
        <div
          key={history.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="bg-gradient-to-r from-brown-400 to-brown-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Mic className="w-5 h-5 text-brown-600" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold">{history.title}</h3>
                <p className="text-sm text-brown-100">讲述者：{history.narrator}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-brown-700 mb-4 leading-relaxed line-clamp-4">{history.content}</p>
            {history.dateRecorded && (
              <p className="text-sm text-brown-500 mb-4">记录于：{history.dateRecorded}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(history)}
                className="flex-1 py-2 px-3 text-brown-600 hover:bg-brown-50 rounded-lg transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(history.id)}
                className="flex-1 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
      {data.oralHistories.length === 0 && (
        <div className="col-span-full text-center py-12 text-brown-500">
          暂无口述历史记录
        </div>
      )}
    </div>
  );

  const renderPhotos = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.photos.map((photo) => (
        <div
          key={photo.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="aspect-video bg-brown-100">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-brown-800 mb-2">{photo.title}</h3>
            <div className="flex items-center gap-3 text-sm text-brown-600 mb-4">
              {photo.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {photo.date}
                </span>
              )}
              {photo.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {photo.location}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(photo)}
                className="flex-1 py-2 px-3 text-brown-600 hover:bg-brown-50 rounded-lg transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(photo.id)}
                className="flex-1 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
      {data.photos.length === 0 && (
        <div className="col-span-full text-center py-12 text-brown-500">
          暂无照片存档
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-beige py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-song text-brown-800 mb-2">历史记录</h1>
            <p className="text-brown-600">记录家族大事记、口述历史和珍贵照片</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brown-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brown-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加记录
          </button>
        </div>

        <div className="flex bg-white rounded-lg shadow-sm p-1 mb-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'events'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            大事记
          </button>
          <button
            onClick={() => setActiveTab('oral')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'oral'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <Mic className="w-5 h-5" />
            口述历史
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'photos'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <Image className="w-5 h-5" />
            照片存档
          </button>
        </div>

        {activeTab === 'events' && renderEvents()}
        {activeTab === 'oral' && renderOralHistories()}
        {activeTab === 'photos' && renderPhotos()}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brown-100">
              <h2 className="text-2xl font-bold font-song text-brown-800">
                {editingItem ? '编辑记录' : '添加记录'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'events' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">标题 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">类型 *</label>
                    <select
                      required
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    >
                      <option value="">选择类型</option>
                      <option value="migration">迁徙</option>
                      <option value="historical">历史事件</option>
                      <option value="achievement">成就</option>
                      <option value="tragedy">变故</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">地点</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">描述 *</label>
                    <textarea
                      required
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {activeTab === 'oral' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">标题 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">讲述者 *</label>
                    <input
                      type="text"
                      required
                      value={formData.narrator || ''}
                      onChange={(e) => setFormData({ ...formData, narrator: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">记录日期</label>
                    <input
                      type="date"
                      value={formData.dateRecorded || ''}
                      onChange={(e) => setFormData({ ...formData, dateRecorded: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">内容 *</label>
                    <textarea
                      required
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {activeTab === 'photos' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">标题 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">图片 URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">拍摄日期</label>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">拍摄地点</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brown-600 text-white py-2 px-4 rounded-lg hover:bg-brown-700 transition-colors"
                >
                  {editingItem ? '保存修改' : '添加记录'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
