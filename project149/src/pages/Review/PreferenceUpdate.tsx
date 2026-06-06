import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { useServiceStore } from '../../store/serviceStore';
import { useCustomerStore } from '../../store/customerStore';
import { services } from '../../data/services';

interface PreferenceUpdateProps {
  serviceId: string;
  customerId: string;
}

interface PreferenceRecord {
  id: string;
  serviceId: string;
  customerId: string;
  discoveryDate: string;
  type: 'like' | 'dislike' | 'preference' | 'allergy';
  content: string;
  synced: boolean;
  syncedAt?: string;
}

const typeOptions = [
  { value: 'like', label: '喜欢', icon: <ThumbsUp className="w-4 h-4" /> },
  { value: 'dislike', label: '不喜欢', icon: <ThumbsDown className="w-4 h-4" /> },
  { value: 'preference', label: '偏好', icon: <Heart className="w-4 h-4" /> },
  { value: 'allergy', label: '过敏', icon: <AlertCircle className="w-4 h-4" /> },
];

export function PreferenceUpdate({ serviceId, customerId }: PreferenceUpdateProps) {
  const { updateCustomerPreferences } = useServiceStore();
  const { customers } = useCustomerStore();
  const service = services.find((s) => s.id === serviceId);
  const customer = customers.find((c) => c.id === customerId);

  const [preferences, setPreferences] = useState<PreferenceRecord[]>(() => {
    const records: PreferenceRecord[] = [];

    if (service?.newPreferences) {
      service.newPreferences.forEach((pref, index) => {
        records.push({
          id: `pref-${serviceId}-${index}`,
          serviceId,
          customerId,
          discoveryDate: service.serviceDate,
          type: 'preference',
          content: pref,
          synced: false,
        });
      });
    }

    if (service?.improvements) {
      service.improvements.forEach((imp, index) => {
        records.push({
          id: `imp-${serviceId}-${index}`,
          serviceId,
          customerId,
          discoveryDate: service.serviceDate,
          type: 'dislike',
          content: imp,
          synced: false,
        });
      });
    }

    return records;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<string>('preference');
  const [newContent, setNewContent] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleAddPreference = () => {
    if (!newContent.trim()) return;

    const newRecord: PreferenceRecord = {
      id: `pref-new-${Date.now()}`,
      serviceId,
      customerId,
      discoveryDate: new Date().toISOString(),
      type: newType as PreferenceRecord['type'],
      content: newContent.trim(),
      synced: false,
    };

    setPreferences((prev) => [...prev, newRecord]);
    setNewContent('');
    setShowAddForm(false);
  };

  const handleSync = async (record: PreferenceRecord) => {
    setSyncingId(record.id);
    try {
      const updateData: Parameters<typeof updateCustomerPreferences>[1] = {};
      
      switch (record.type) {
        case 'like':
        case 'preference':
          updateData.favoriteCuisines = [
            ...(customer?.favoriteCuisines || []),
            record.content,
          ];
          break;
        case 'dislike':
          updateData.dislikedIngredients = [
            ...(customer?.dislikedIngredients || []),
            record.content,
          ];
          break;
        case 'allergy':
          updateData.allergies = [
            ...(customer?.allergies || []),
            record.content,
          ];
          break;
      }
      
      await updateCustomerPreferences(customerId, updateData);

      setPreferences((prev) =>
        prev.map((p) =>
          p.id === record.id
            ? { ...p, synced: true, syncedAt: new Date().toISOString() }
            : p
        )
      );
    } catch (error) {
      console.error('同步失败:', error);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    const unsynced = preferences.filter((p) => !p.synced);
    for (const record of unsynced) {
      await handleSync(record);
    }
  };

  const handleDelete = (id: string) => {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'like':
        return {
          badge: 'success',
          icon: <ThumbsUp className="w-4 h-4" />,
          label: '喜欢',
        };
      case 'dislike':
        return {
          badge: 'danger',
          icon: <ThumbsDown className="w-4 h-4" />,
          label: '不喜欢',
        };
      case 'preference':
        return {
          badge: 'primary',
          icon: <Heart className="w-4 h-4" />,
          label: '偏好',
        };
      case 'allergy':
        return {
          badge: 'warning',
          icon: <AlertCircle className="w-4 h-4" />,
          label: '过敏',
        };
      default:
        return {
          badge: 'secondary',
          icon: <Heart className="w-4 h-4" />,
          label: '其他',
        };
    }
  };

  const syncedCount = preferences.filter((p) => p.synced).length;
  const unsyncedCount = preferences.length - syncedCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">偏好记录总数</div>
                <div className="text-2xl font-bold text-primary-700">
                  {preferences.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">已同步</div>
                <div className="text-2xl font-bold text-green-600">
                  {syncedCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">待同步</div>
                <div className="text-2xl font-bold text-amber-600">
                  {unsyncedCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary-500" />
              偏好更新记录
            </CardTitle>
            <div className="flex items-center gap-2">
              {unsyncedCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSyncAll}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  全部同步
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                添加新发现
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {showAddForm && (
            <div className="p-4 bg-cream/50 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-primary-700">添加新发现</h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Select
                  label="类型"
                  value={newType}
                  onChange={(val) => setNewType(val as string)}
                  options={typeOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                />
              </div>
              <Textarea
                label="偏好内容"
                placeholder="请描述客户的喜好或偏好..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddPreference}
                  disabled={!newContent.trim()}
                >
                  添加
                </Button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {preferences.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                暂无偏好记录
              </div>
            ) : (
              preferences.map((record) => {
                const typeConfig = getTypeConfig(record.type);
                return (
                  <div
                    key={record.id}
                    className="p-4 hover:bg-cream/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            record.type === 'like'
                              ? 'bg-green-100 text-green-600'
                              : record.type === 'dislike'
                              ? 'bg-coral-100 text-coral-600'
                              : record.type === 'allergy'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-primary-100 text-primary-600'
                          }`}
                        >
                          {typeConfig.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={typeConfig.badge as any} size="sm">
                              {typeConfig.label}
                            </Badge>
                            {record.synced ? (
                              <Badge variant="success" size="sm">
                                已同步
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm">
                                待同步
                              </Badge>
                            )}
                          </div>
                          <p className="text-charcoal mb-2">{record.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              发现日期：
                              {format(
                                new Date(record.discoveryDate),
                                'yyyy年MM月dd日',
                                { locale: zhCN }
                              )}
                            </span>
                            {record.synced && record.syncedAt && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                同步时间：
                                {format(
                                  new Date(record.syncedAt),
                                  'yyyy年MM月dd日 HH:mm',
                                  { locale: zhCN }
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!record.synced && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(record)}
                            loading={syncingId === record.id}
                            className="gap-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            同步到档案
                          </Button>
                        )}
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-gray-400 hover:text-coral-500 hover:bg-coral-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {customer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary-500" />
              客户现有偏好
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-primary-700 mb-2">饮食限制</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.dietaryRestrictions?.length > 0 ? (
                    customer.dietaryRestrictions.map((item, index) => (
                      <Badge key={index} variant="warning">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">暂无</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-primary-700 mb-2">过敏信息</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.allergies?.length > 0 ? (
                    customer.allergies.map((item, index) => (
                      <Badge key={index} variant="danger">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">暂无</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-primary-700 mb-2">不喜欢的食材</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.dislikedIngredients?.length > 0 ? (
                    customer.dislikedIngredients.map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">暂无</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-primary-700 mb-2">喜欢的菜系</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.favoriteCuisines?.length > 0 ? (
                    customer.favoriteCuisines.map((item, index) => (
                      <Badge key={index} variant="success">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">暂无</span>
                  )}
                </div>
              </div>
            </div>
            {customer.notes && (
              <div className="mt-4 p-4 bg-cream/50 rounded-lg">
                <h4 className="font-medium text-primary-700 mb-1">备注</h4>
                <p className="text-gray-600 text-sm">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
