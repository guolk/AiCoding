import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon,
  Map,
  X,
  Plus
} from 'lucide-react';
import type { Ride } from '../types';

export default function RideForm() {
  const navigate = useNavigate();
  const { addRide } = useAppStore();
  
  const [formData, setFormData] = useState<Omit<Ride, 'id' | 'createdAt'>>({
    date: new Date().toISOString().split('T')[0],
    routeName: '',
    distance: 0,
    duration: 0,
    weather: '',
    ridingBuddies: '',
    roadCondition: '',
    notes: '',
    gpxData: undefined,
    photos: []
  });
  
  const [gpxFileName, setGpxFileName] = useState<string>('');
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRide(formData);
    navigate('/rides');
  };

  const handleChange = (field: keyof Omit<Ride, 'id' | 'createdAt' | 'photos' | 'gpxData'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGpxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGpxFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, gpxData: event.target?.result as string }));
      };
      reader.readAsText(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewPhotos(prev => [...prev, result]);
        setFormData(prev => ({ ...prev, photos: [...prev.photos, result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPreviewPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rides')}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">记录新骑行</h1>
          <p className="text-dark-300 mt-1">记录你的精彩旅程</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">路线名称</label>
              <input
                type="text"
                value={formData.routeName}
                onChange={(e) => handleChange('routeName', e.target.value)}
                placeholder="如：香山环山公路"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">里程 (km)</label>
              <input
                type="number"
                step="0.1"
                value={formData.distance || ''}
                onChange={(e) => handleChange('distance', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">骑行时长 (分钟)</label>
              <input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">详细信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">天气</label>
              <input
                type="text"
                value={formData.weather}
                onChange={(e) => handleChange('weather', e.target.value)}
                placeholder="如：晴朗、多云、小雨"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">同行车友</label>
              <input
                type="text"
                value={formData.ridingBuddies}
                onChange={(e) => handleChange('ridingBuddies', e.target.value)}
                placeholder="用逗号分隔"
                className="input-field"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">路况体验</label>
            <input
              type="text"
              value={formData.roadCondition}
              onChange={(e) => handleChange('roadCondition', e.target.value)}
              placeholder="描述一下路况"
              className="input-field"
            />
          </div>
          <div className="mt-4">
            <label className="label">骑行心得</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="记录一下这次骑行的感受..."
              rows={4}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">GPX 轨迹</h2>
          <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:border-brand-400 transition-colors">
            <input
              type="file"
              accept=".gpx"
              onChange={handleGpxUpload}
              className="hidden"
              id="gpx-upload"
            />
            <label htmlFor="gpx-upload" className="cursor-pointer">
              <Map className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              {gpxFileName ? (
                <div>
                  <p className="text-brand-400 font-medium">{gpxFileName}</p>
                  <p className="text-dark-400 text-sm mt-1">点击重新上传</p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium">点击上传GPX文件</p>
                  <p className="text-dark-400 text-sm mt-1">支持 .gpx 格式</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">骑行照片</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {previewPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`骑行照片 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="border-2 border-dashed border-dark-600 rounded-lg flex items-center justify-center h-32 hover:border-brand-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer text-center">
                <Plus className="w-8 h-8 text-dark-500 mx-auto mb-1" />
                <p className="text-dark-400 text-sm">添加照片</p>
              </label>
            </div>
          </div>
          {previewPhotos.length > 0 && (
            <p className="text-sm text-dark-400">已上传 {previewPhotos.length} 张照片</p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/rides')}
            className="btn-secondary px-6"
          >
            取消
          </button>
          <button type="submit" className="btn-primary px-6">
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
