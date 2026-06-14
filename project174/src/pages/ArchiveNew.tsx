import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  Mic,
  Star,
  Volume2,
  FileAudio,
  Gauge,
  BookOpen,
  Cloud,
  Sun,
  CloudRain,
  CloudFog,
  Wind,
  Snowflake,
  Moon,
  Upload,
  X,
  Tag,
  Navigation,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Tag as TagComponent } from '@/components/ui/Tag';
import { useRecordingStore } from '@/store/useRecordingStore';
import {
  Recording,
  WeatherType,
  RecordingType,
  Season,
  TimeOfDay,
  QualityAssessment,
  Story,
  GPSLocation,
  WEATHER_TYPES,
  RECORDING_TYPES,
  SEASONS,
  TIMES_OF_DAY,
  TAG_CATEGORIES,
} from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDateTimeForInput = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getWeatherIcon = (weather: WeatherType) => {
  const iconMap: Record<WeatherType, React.ReactNode> = {
    sunny: <Sun size={18} />,
    cloudy: <Cloud size={18} />,
    rainy: <CloudRain size={18} />,
    foggy: <CloudFog size={18} />,
    windy: <Wind size={18} />,
    snowy: <Snowflake size={18} />,
    clear: <Moon size={18} />,
  };
  return iconMap[weather];
};

interface FormData {
  title: string;
  description: string;
  recordTime: string;
  locationName: string;
  latitude: string;
  longitude: string;
  weather: WeatherType;
  equipment: string;
  recordingType: RecordingType;
  audioFile: File | null;
  audioUrl: string;
  selectedTags: string[];
  signalToNoise: string;
  hasUnwantedNoise: boolean;
  overallRating: number;
  qualityNotes: string;
  storyContent: string;
  mood: string;
  season: Season;
  timeOfDay: TimeOfDay;
}

interface FormErrors {
  title?: string;
  description?: string;
  recordTime?: string;
  locationName?: string;
  latitude?: string;
  longitude?: string;
  weather?: string;
  equipment?: string;
  recordingType?: string;
  signalToNoise?: string;
  overallRating?: string;
  storyContent?: string;
  mood?: string;
  season?: string;
  timeOfDay?: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  recordTime: formatDateTimeForInput(new Date()),
  locationName: '',
  latitude: '',
  longitude: '',
  weather: 'sunny' as WeatherType,
  equipment: '',
  recordingType: 'field' as RecordingType,
  audioFile: null,
  audioUrl: '',
  selectedTags: [],
  signalToNoise: '',
  hasUnwantedNoise: false,
  overallRating: 3,
  qualityNotes: '',
  storyContent: '',
  mood: '',
  season: 'spring' as Season,
  timeOfDay: 'morning' as TimeOfDay,
};

const ArchiveNew: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { tags, addRecording, updateRecording, getRecordingById } = useRecordingStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const recording = getRecordingById(id);
      if (recording) {
        setFormData({
          title: recording.title,
          description: recording.description,
          recordTime: formatDateTimeForInput(recording.recordTime),
          locationName: recording.locationName,
          latitude: recording.gpsLocation?.latitude.toString() || '',
          longitude: recording.gpsLocation?.longitude.toString() || '',
          weather: recording.weather,
          equipment: recording.equipment,
          recordingType: recording.recordingType,
          audioFile: null,
          audioUrl: recording.audioUrl || '',
          selectedTags: recording.tags.map((t) => t.id),
          signalToNoise: recording.qualityAssessment?.signalToNoise.toString() || '',
          hasUnwantedNoise: recording.qualityAssessment?.hasUnwantedNoise || false,
          overallRating: recording.qualityAssessment?.overallRating || 3,
          qualityNotes: recording.qualityAssessment?.notes || '',
          storyContent: recording.story?.content || '',
          mood: recording.story?.mood || '',
          season: recording.story?.season || 'spring',
          timeOfDay: recording.story?.timeOfDay || 'morning',
        });
      }
    }
  }, [id, isEditMode, getRecordingById]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入标题';
    }

    if (!formData.recordTime) {
      newErrors.recordTime = '请选择录制时间';
    }

    if (!formData.locationName.trim()) {
      newErrors.locationName = '请输入地点名称';
    }

    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = '请输入有效的纬度';
    }

    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = '请输入有效的经度';
    }

    if (formData.signalToNoise && isNaN(parseFloat(formData.signalToNoise))) {
      newErrors.signalToNoise = '请输入有效的信噪比';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        audioFile: file,
        audioUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemoveFile = () => {
    if (formData.audioUrl) {
      URL.revokeObjectURL(formData.audioUrl);
    }
    setFormData((prev) => ({
      ...prev,
      audioFile: null,
      audioUrl: '',
    }));
  };

  const handleTagClick = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((t) => t !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      overallRating: rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const selectedTagObjects = tags.filter((t) =>
        formData.selectedTags.includes(t.id)
      );

      let targetId = id;
      
      if (!isEditMode) {
        targetId = generateId();
      }

      const gpsLocation: GPSLocation | undefined =
        formData.latitude && formData.longitude
          ? {
              id: generateId(),
              recordingId: targetId,
              latitude: parseFloat(formData.latitude),
              longitude: parseFloat(formData.longitude),
            }
          : undefined;

      const qualityAssessment: QualityAssessment = {
        id: generateId(),
        recordingId: targetId,
        signalToNoise: formData.signalToNoise
          ? parseFloat(formData.signalToNoise)
          : 0,
        hasUnwantedNoise: formData.hasUnwantedNoise,
        overallRating: formData.overallRating,
        notes: formData.qualityNotes || undefined,
      };

      const story: Story = {
        id: generateId(),
        recordingId: targetId,
        content: formData.storyContent,
        mood: formData.mood,
        season: formData.season,
        timeOfDay: formData.timeOfDay,
      };

      const recordingData: Omit<Recording, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        recordTime: new Date(formData.recordTime),
        locationName: formData.locationName,
        weather: formData.weather,
        equipment: formData.equipment,
        recordingType: formData.recordingType,
        filePath: formData.audioFile
          ? `/audio/${targetId}.wav`
          : '',
        audioUrl: formData.audioUrl || undefined,
        tags: selectedTagObjects,
        gpsLocation,
        qualityAssessment,
        story,
      };

      if (isEditMode) {
        updateRecording(id, recordingData);
      } else {
        const newRecording: Recording = {
          ...recordingData,
          id: targetId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addRecording(newRecording);
      }

      navigate(`/archive/${targetId}`);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTags = activeCategory
    ? tags.filter((t) => t.category === activeCategory)
    : tags;

  const renderStars = () => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={
                star <= formData.overallRating
                  ? 'text-sunset-500 fill-sunset-500'
                  : 'text-earth-300 dark:text-earth-600'
              }
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/archive')}
          >
            返回列表
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={18} />}
            onClick={handleSubmit}
            loading={isSaving}
          >
            {isEditMode ? '更新录音' : '保存录音'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic size={20} className="text-forest-500" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="请输入录音标题"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    描述
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="请输入录音描述"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} className="text-sky-500" />
                  录制信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    录制时间 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="recordTime"
                    value={formData.recordTime}
                    onChange={handleInputChange}
                    className={errors.recordTime ? 'border-red-500' : ''}
                  />
                  {errors.recordTime && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.recordTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    地点名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleInputChange}
                    placeholder="请输入录制地点"
                    leftIcon={<MapPin size={18} />}
                    className={errors.locationName ? 'border-red-500' : ''}
                  />
                  {errors.locationName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.locationName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      纬度
                    </label>
                    <Input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="例如: 30.1200"
                      leftIcon={<Navigation size={18} />}
                      className={errors.latitude ? 'border-red-500' : ''}
                    />
                    {errors.latitude && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      经度
                    </label>
                    <Input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="例如: 118.1700"
                      leftIcon={<Navigation size={18} />}
                      className={errors.longitude ? 'border-red-500' : ''}
                    />
                    {errors.longitude && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      天气状况
                    </label>
                    <div className="relative">
                      <select
                        name="weather"
                        value={formData.weather}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        {Object.entries(WEATHER_TYPES).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none">
                        {getWeatherIcon(formData.weather)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      录制设备
                    </label>
                    <Input
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleInputChange}
                      placeholder="例如: Zoom H6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    录音类型
                  </label>
                  <select
                    name="recordingType"
                    value={formData.recordingType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {Object.entries(RECORDING_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label} - {value.description}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileAudio size={20} className="text-purple-500" />
                  音频文件
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!formData.audioUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-earth-300 dark:border-earth-600 rounded-xl cursor-pointer hover:border-forest-500 dark:hover:border-forest-400 transition-colors bg-earth-50 dark:bg-earth-900/30">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload
                        size={40}
                        className="mb-3 text-earth-400 dark:text-earth-500"
                      />
                      <p className="mb-2 text-sm text-earth-600 dark:text-earth-400">
                        <span className="font-semibold">点击上传</span> 或拖拽文件
                      </p>
                      <p className="text-xs text-earth-500 dark:text-earth-500">
                        支持 MP3, WAV, FLAC 格式
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="audio/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-earth-50 dark:bg-earth-900/30">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-forest-100 dark:bg-forest-900/30 text-forest-600 dark:text-forest-400">
                        <Volume2 size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-earth-900 dark:text-earth-100">
                          {formData.audioFile?.name || '已选择音频文件'}
                        </p>
                        {formData.audioFile && (
                          <p className="text-sm text-earth-500 dark:text-earth-400">
                            {(formData.audioFile.size / 1024 / 1024).toFixed(2)}{' '}
                            MB
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X size={18} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag size={20} className="text-amber-500" />
                  标签选择
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === null
                        ? 'bg-forest-600 text-white'
                        : 'bg-earth-100 text-earth-700 hover:bg-earth-200 dark:bg-earth-900/50 dark:text-earth-300'
                    }`}
                  >
                    全部
                  </button>
                  {Object.entries(TAG_CATEGORIES).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setActiveCategory(
                          activeCategory === key ? null : key
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                        activeCategory === key
                          ? 'text-white border-transparent'
                          : 'border-earth-200 hover:border-earth-300 dark:border-earth-700'
                      }`}
                      style={{
                        backgroundColor:
                          activeCategory === key ? value.color : 'transparent',
                        color:
                          activeCategory === key ? '#ffffff' : value.color,
                      }}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {filteredTags.map((tag) => (
                    <TagComponent
                      key={tag.id}
                      tag={tag}
                      selected={formData.selectedTags.includes(tag.id)}
                      onClick={() => handleTagClick(tag.id)}
                    />
                  ))}
                </div>

                {formData.selectedTags.length > 0 && (
                  <div className="pt-4 border-t border-earth-200 dark:border-earth-800">
                    <p className="text-sm text-earth-600 dark:text-earth-400 mb-2">
                      已选择的标签 ({formData.selectedTags.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedTags.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId);
                        return tag ? (
                          <TagComponent
                            key={tag.id}
                            tag={tag}
                            onRemove={() => handleTagClick(tag.id)}
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge size={20} className="text-sunset-500" />
                  质量评估
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    信噪比 (dB)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    name="signalToNoise"
                    value={formData.signalToNoise}
                    onChange={handleInputChange}
                    placeholder="例如: 42.5"
                    leftIcon={<Gauge size={18} />}
                    className={errors.signalToNoise ? 'border-red-500' : ''}
                  />
                  {errors.signalToNoise && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.signalToNoise}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-earth-700 dark:text-earth-300">
                    是否有干扰音
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        hasUnwantedNoise: !prev.hasUnwantedNoise,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasUnwantedNoise
                        ? 'bg-forest-600'
                        : 'bg-earth-300 dark:bg-earth-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.hasUnwantedNoise
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    整体评分
                  </label>
                  {renderStars()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    质量备注
                  </label>
                  <Textarea
                    name="qualityNotes"
                    value={formData.qualityNotes}
                    onChange={handleInputChange}
                    placeholder="记录录音质量相关的备注信息"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} className="text-rose-500" />
                  故事内容
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    故事内容
                  </label>
                  <Textarea
                    name="storyContent"
                    value={formData.storyContent}
                    onChange={handleInputChange}
                    placeholder="记录这段录音背后的故事..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    情绪标签
                  </label>
                  <Input
                    name="mood"
                    value={formData.mood}
                    onChange={handleInputChange}
                    placeholder="例如: 平静、愉悦、怀旧"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      季节
                    </label>
                    <select
                      name="season"
                      value={formData.season}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      {Object.entries(SEASONS).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      时段
                    </label>
                    <select
                      name="timeOfDay"
                      value={formData.timeOfDay}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      {Object.entries(TIMES_OF_DAY).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArchiveNew;
