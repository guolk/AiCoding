import { useState, useMemo } from 'react';
import {
  FileText, Calendar, MapPin, Users, Wallet, Palette,
  Edit3, Save, Clock, ChevronRight, Sparkles, Type,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { EventType } from '@/types';

const eventTypeOptions = [
  { value: 'wedding', label: '婚礼' },
  { value: 'birthday', label: '生日派对' },
  { value: 'babyShower', label: '宝宝宴' },
  { value: 'other', label: '其他活动' },
];

const getVersionStatusColor = (status: string): 'success' | 'warning' | 'accent' | 'gray' => {
  const colors: Record<string, 'success' | 'warning' | 'accent' | 'gray'> = {
    draft: 'gray',
    review: 'warning',
    approved: 'success',
    archived: 'accent',
  };
  return colors[status] || 'gray';
};

const getVersionStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    draft: '草稿',
    review: '审核中',
    approved: '已批准',
    archived: '已归档',
  };
  return texts[status] || status;
};

export default function EventPlanning() {
  const { getCurrentEvent, updateEvent, addPlanVersion, planVersions, currentEventId } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [formData, setFormData] = useState({
    type: 'wedding' as EventType,
    title: '',
    theme: '',
    style: '',
    description: '',
    date: '',
    location: '',
    address: '',
    estimatedGuests: 0,
    totalBudget: 0,
  });

  const event = getCurrentEvent();

  const recentVersions = useMemo(() => 
    planVersions
      .filter(v => v.eventId === currentEventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [planVersions, currentEventId]
  );

  const handleEdit = () => {
    if (event) {
      setFormData({
        type: event.type,
        title: event.title,
        theme: event.theme,
        style: event.style,
        description: event.description,
        date: event.date.slice(0, 16),
        location: event.location,
        address: event.address,
        estimatedGuests: event.estimatedGuests,
        totalBudget: event.totalBudget,
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!event) return;
    updateEvent(event.id, {
      ...formData,
      date: new Date(formData.date).toISOString(),
    });
    setIsEditing(false);
  };

  const handleSaveVersion = () => {
    if (!event || !versionName.trim()) return;
    const content = `活动类型：${eventTypeOptions.find(o => o.value === event.type)?.label}
主题：${event.theme}
风格：${event.style}
描述：${event.description}
日期：${formatDate(event.date)}
地点：${event.location}
地址：${event.address}
预计人数：${event.estimatedGuests}人
总预算：${formatCurrency(event.totalBudget)}`;
    
    addPlanVersion({
      eventId: event.id,
      name: versionName,
      content,
      notes: versionNotes,
      status: 'draft',
      createdBy: '用户',
    });
    setShowSaveModal(false);
    setVersionName('');
    setVersionNotes('');
  };

  if (!event) return null;

  const infoItems = isEditing ? null : [
    { icon: Type, label: '活动类型', value: eventTypeOptions.find(o => o.value === event.type)?.label },
    { icon: Sparkles, label: '活动主题', value: event.theme },
    { icon: Palette, label: '活动风格', value: event.style },
    { icon: Calendar, label: '活动日期', value: formatDate(event.date) },
    { icon: MapPin, label: '活动地点', value: event.location },
    { icon: Users, label: '预计人数', value: `${event.estimatedGuests} 人` },
    { icon: Wallet, label: '总预算', value: formatCurrency(event.totalBudget) },
  ];

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-slide-up">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-500">
            策划文档
          </h2>
          <p className="text-warmGray-500 mt-1">
            管理活动策划方案和详细文档
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <Button variant="secondary" onClick={handleEdit} leftIcon={<Edit3 className="w-4 h-4" />}>
                编辑信息
              </Button>
              <Button onClick={() => setShowSaveModal(true)} leftIcon={<Save className="w-4 h-4" />}>
                保存版本
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                取消
              </Button>
              <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
                保存修改
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-500">活动基本信息</h3>
                <p className="text-sm text-warmGray-500">活动的核心信息配置</p>
              </div>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="活动类型"
                  value={formData.type}
                  options={eventTypeOptions}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                />
                <Input
                  label="活动主题"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                />
                <Input
                  label="活动风格"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                />
                <Input
                  label="活动名称"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  label="活动日期"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <Input
                  label="活动地点"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <Input
                  label="预计人数"
                  type="number"
                  value={formData.estimatedGuests}
                  onChange={(e) => setFormData({ ...formData, estimatedGuests: Number(e.target.value) })}
                />
                <Input
                  label="总预算"
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                />
                <div className="md:col-span-2">
                  <Input
                    label="详细地址"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="活动描述"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-rose rounded-xl p-4 mb-4">
                  <h4 className="font-display text-xl text-accent-500 mb-1">{event.title}</h4>
                  <p className="text-warmGray-600">{event.address}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {infoItems?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-warmGray-50">
                      <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-primary-500" />
                      </div>
                      <div>
                        <div className="text-xs text-warmGray-500">{item.label}</div>
                        <div className="font-medium text-warmGray-800">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-warmGray-50">
                  <div className="text-xs text-warmGray-500 mb-1">活动描述</div>
                  <p className="text-warmGray-700">{event.description}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-champagne-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-champagne-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-500">最近版本</h3>
                <p className="text-sm text-warmGray-500">历史版本记录</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentVersions.length === 0 ? (
                <p className="text-center text-warmGray-400 py-8">暂无版本记录</p>
              ) : (
                recentVersions.map((version, index) => (
                  <div
                    key={version.id}
                    className="p-3 rounded-xl bg-warmGray-50 hover:bg-primary-50 transition-colors cursor-pointer group"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-warmGray-800 group-hover:text-primary-600 transition-colors">
                        {version.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-warmGray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-warmGray-500">
                      <Badge variant={getVersionStatusColor(version.status)}>
                        {getVersionStatusText(version.status)}
                      </Badge>
                      <span>{formatDateTime(version.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="保存新版本"
        description="将当前策划文档保存为一个新的版本快照"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSaveModal(false)}>取消</Button>
            <Button onClick={handleSaveVersion} disabled={!versionName.trim()}>确认保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="版本名称"
            placeholder="例如：最终方案 v2.0"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            required
          />
          <Textarea
            label="版本说明"
            placeholder="描述此版本的主要变更内容..."
            value={versionNotes}
            onChange={(e) => setVersionNotes(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
