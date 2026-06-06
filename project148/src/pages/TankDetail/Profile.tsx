import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Ruler,
  Droplets,
  Filter,
  Lightbulb,
  Layers,
  Palette,
  Calendar,
  Plus,
  Image,
  Fish as FishIcon,
  Leaf,
  Clock,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { formatDate, getDaysSince } from '@/utils/helpers';
import type { Plant, Fish, Photo } from '@/types';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const {
    aquariums,
    plants,
    fishes,
    photos,
    addPlant,
    addFish,
    addPhoto,
  } = useStore();

  const [plantModal, setPlantModal] = useState(false);
  const [fishModal, setFishModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const tank = aquariums.find((a) => a.id === id);
  const tankPlants = plants.filter((p) => p.tankId === id);
  const tankFishes = fishes.filter((f) => f.tankId === id);
  const tankPhotos = [...photos.filter((p) => p.tankId === id)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const [plantForm, setPlantForm] = useState<Omit<Plant, 'id'>>({
    tankId: id || '',
    name: '',
    scientificName: '',
    quantity: 1,
    addDate: new Date().toISOString().split('T')[0],
    source: '',
    status: 'healthy',
  });

  const [fishForm, setFishForm] = useState<Omit<Fish, 'id'>>({
    tankId: id || '',
    name: '',
    scientificName: '',
    quantity: 1,
    addDate: new Date().toISOString().split('T')[0],
    source: '',
    status: 'healthy',
  });

  const [photoForm, setPhotoForm] = useState<Omit<Photo, 'id'>>({
    tankId: id || '',
    url: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    addPlant(plantForm);
    setPlantModal(false);
    setPlantForm({
      tankId: id || '',
      name: '',
      scientificName: '',
      quantity: 1,
      addDate: new Date().toISOString().split('T')[0],
      source: '',
      status: 'healthy',
    });
  };

  const handleAddFish = (e: React.FormEvent) => {
    e.preventDefault();
    addFish(fishForm);
    setFishModal(false);
    setFishForm({
      tankId: id || '',
      name: '',
      scientificName: '',
      quantity: 1,
      addDate: new Date().toISOString().split('T')[0],
      source: '',
      status: 'healthy',
    });
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    addPhoto(photoForm);
    setPhotoModal(false);
    setPhotoForm({
      tankId: id || '',
      url: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  if (!tank) return null;

  const paramItems = [
    { icon: Ruler, label: '缸体尺寸', value: `${tank.length} × ${tank.width} × ${tank.height} cm` },
    { icon: Droplets, label: '水体容量', value: `${tank.volume} 升` },
    { icon: Filter, label: '过滤方式', value: tank.filterType },
    { icon: Lightbulb, label: '灯光配置', value: tank.lighting },
    { icon: Layers, label: '底床类型', value: tank.substrate },
    { icon: Palette, label: '造景风格', value: tank.aquascapeStyle },
    { icon: Calendar, label: '开缸日期', value: formatDate(tank.setupDate) },
    { icon: Clock, label: '运行天数', value: `${getDaysSince(tank.setupDate)} 天` },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-6">
          缸体参数
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {paramItems.map((item, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              <p className="text-lg font-medium text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-reef-600" />
            <h2 className="text-xl font-bold font-serif text-gray-900">
              水草配置
            </h2>
          </div>
          <button
            onClick={() => setPlantModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-reef-50 text-reef-600 rounded-xl hover:bg-reef-100 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            添加水草
          </button>
        </div>

        {tankPlants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无水草配置，点击上方按钮添加
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    水草名称
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    数量
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    入缸时间
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    来源
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {tankPlants.map((plant, index) => (
                  <tr
                    key={plant.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{plant.name}</p>
                        {plant.scientificName && (
                          <p className="text-sm text-gray-500 italic">
                            {plant.scientificName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{plant.quantity} 株</td>
                    <td className="py-4 px-4 text-gray-500">
                      {formatDate(plant.addDate)}
                    </td>
                    <td className="py-4 px-4 text-gray-500">{plant.source}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={plant.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FishIcon className="w-5 h-5 text-aqua-600" />
            <h2 className="text-xl font-bold font-serif text-gray-900">
              鱼类配置
            </h2>
          </div>
          <button
            onClick={() => setFishModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-aqua-50 text-aqua-600 rounded-xl hover:bg-aqua-100 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            添加鱼类
          </button>
        </div>

        {tankFishes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无鱼类配置，点击上方按钮添加
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    物种名称
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    数量
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    入缸时间
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    来源
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {tankFishes.map((fish, index) => (
                  <tr
                    key={fish.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{fish.name}</p>
                        {fish.scientificName && (
                          <p className="text-sm text-gray-500 italic">
                            {fish.scientificName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{fish.quantity} 尾</td>
                    <td className="py-4 px-4 text-gray-500">
                      {formatDate(fish.addDate)}
                    </td>
                    <td className="py-4 px-4 text-gray-500">{fish.source}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={fish.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-coral-600" />
            <h2 className="text-xl font-bold font-serif text-gray-900">
              照片时间轴
            </h2>
          </div>
          <button
            onClick={() => setPhotoModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-coral-50 text-coral-600 rounded-xl hover:bg-coral-100 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            添加照片
          </button>
        </div>

        {tankPhotos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无照片，点击上方按钮记录成长历程
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-aqua-200 via-reef-200 to-coral-200 transform -translate-x-1/2" />
            <div className="space-y-8">
              {tankPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`relative flex items-center gap-8 animate-slide-up ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div
                      onClick={() => setSelectedPhoto(photo)}
                      className="group cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                        <img
                          src={photo.url}
                          alt={photo.notes || '水族箱照片'}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            点击查看大图
                          </span>
                        </div>
                      </div>
                      {photo.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          {photo.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-white border-4 border-aqua-500 shadow-lg" />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`${
                        index % 2 === 0 ? 'text-left' : 'text-right'
                      }`}
                    >
                      <p className="text-lg font-bold text-aqua-700 font-serif">
                        {formatDate(photo.date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        第 {getDaysSince(tank.setupDate) - getDaysSince(photo.date)} 天
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={plantModal}
        onClose={() => setPlantModal(false)}
        title="添加水草"
      >
        <form onSubmit={handleAddPlant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              水草名称
            </label>
            <input
              type="text"
              value={plantForm.name}
              onChange={(e) =>
                setPlantForm({ ...plantForm, name: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
              placeholder="例如：矮珍珠"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              学名（可选）
            </label>
            <input
              type="text"
              value={plantForm.scientificName}
              onChange={(e) =>
                setPlantForm({ ...plantForm, scientificName: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
              placeholder="例如：Micranthemum tweediei"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数量
              </label>
              <input
                type="number"
                value={plantForm.quantity}
                onChange={(e) =>
                  setPlantForm({
                    ...plantForm,
                    quantity: Number(e.target.value),
                  })
                }
                min="1"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入缸日期
              </label>
              <input
                type="date"
                value={plantForm.addDate}
                onChange={(e) =>
                  setPlantForm({ ...plantForm, addDate: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              来源
            </label>
            <input
              type="text"
              value={plantForm.source}
              onChange={(e) =>
                setPlantForm({ ...plantForm, source: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
              placeholder="例如：本地水族店"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={plantForm.status}
              onChange={(e) =>
                setPlantForm({
                  ...plantForm,
                  status: e.target.value as Plant['status'],
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reef-500 focus:border-transparent"
            >
              <option value="healthy">健康</option>
              <option value="growing">生长中</option>
              <option value="melting">融叶</option>
              <option value="dead">死亡</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setPlantModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-reef-500 to-reef-600 text-white rounded-xl hover:from-reef-600 hover:to-reef-700 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={fishModal}
        onClose={() => setFishModal(false)}
        title="添加鱼类"
      >
        <form onSubmit={handleAddFish} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              物种名称
            </label>
            <input
              type="text"
              value={fishForm.name}
              onChange={(e) =>
                setFishForm({ ...fishForm, name: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              placeholder="例如：宝莲灯"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              学名（可选）
            </label>
            <input
              type="text"
              value={fishForm.scientificName}
              onChange={(e) =>
                setFishForm({ ...fishForm, scientificName: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              placeholder="例如：Paracheirodon axelrodi"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数量
              </label>
              <input
                type="number"
                value={fishForm.quantity}
                onChange={(e) =>
                  setFishForm({
                    ...fishForm,
                    quantity: Number(e.target.value),
                  })
                }
                min="1"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入缸日期
              </label>
              <input
                type="date"
                value={fishForm.addDate}
                onChange={(e) =>
                  setFishForm({ ...fishForm, addDate: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              来源
            </label>
            <input
              type="text"
              value={fishForm.source}
              onChange={(e) =>
                setFishForm({ ...fishForm, source: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
              placeholder="例如：本地水族店"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={fishForm.status}
              onChange={(e) =>
                setFishForm({
                  ...fishForm,
                  status: e.target.value as Fish['status'],
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-500 focus:border-transparent"
            >
              <option value="healthy">健康</option>
              <option value="observing">观察中</option>
              <option value="sick">生病</option>
              <option value="dead">死亡</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setFishModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-aqua-500 to-aqua-600 text-white rounded-xl hover:from-aqua-600 hover:to-aqua-700 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={photoModal}
        onClose={() => setPhotoModal(false)}
        title="添加照片"
      >
        <form onSubmit={handleAddPhoto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              照片链接
            </label>
            <input
              type="url"
              value={photoForm.url}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, url: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              placeholder="输入图片URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              拍摄日期
            </label>
            <input
              type="date"
              value={photoForm.date}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, date: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注（可选）
            </label>
            <textarea
              value={photoForm.notes}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, notes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
              placeholder="记录这一刻的状态..."
            />
          </div>
          {photoForm.url && (
            <div className="relative">
              <img
                src={photoForm.url}
                alt="预览"
                className="w-full h-48 object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setPhotoModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title="照片详情"
        size="lg"
      >
        {selectedPhoto && (
          <div>
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.notes || '水族箱照片'}
                className="w-full max-h-96 object-contain"
              />
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-bold font-serif text-gray-900">
                {formatDate(selectedPhoto.date)}
              </p>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {selectedPhoto.notes && (
              <p className="text-gray-600">{selectedPhoto.notes}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
