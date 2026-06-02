import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Input, TextArea, Select } from '@/components/ui/Input.js';
import type { ResourceType, Resource } from '../../shared/types.js';
import {
  BookOpen,
  Monitor,
  Video,
  Plus,
  ExternalLink,
  Wrench,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  X,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const TABS: { key: ResourceType; label: string; icon: React.FC<any> }[] = [
  { key: 'literature', label: '文献资料', icon: BookOpen },
  { key: 'equipment', label: '设备管理', icon: Monitor },
  { key: 'video', label: '示范视频', icon: Video }
];

const RESOURCE_TYPE_OPTIONS = [
  { value: 'literature', label: '文献资料' },
  { value: 'equipment', label: '设备管理' },
  { value: 'video', label: '示范视频' }
];

const STATUS_OPTIONS = [
  { value: 'normal', label: '正常' },
  { value: 'maintenance', label: '维护中' },
  { value: 'broken', label: '故障' }
];

interface Toast {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export const Resources: React.FC = () => {
  const { resources, fetchResources, createResource, loading, error } = useStore();
  const [activeTab, setActiveTab] = useState<ResourceType>('literature');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState<{ total: number; normal: number; maintenance: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, type: 'success', message: '' });
  
  const [formData, setFormData] = useState({
    type: 'literature' as ResourceType,
    title: '',
    description: '',
    url: '',
    status: 'normal',
    lastMaintenance: ''
  });

  useEffect(() => {
    fetchResources(activeTab);
  }, [fetchResources, activeTab]);

  useEffect(() => {
    if (activeTab === 'equipment') {
      fetch('/api/resources/equipment/status')
        .then(res => res.json())
        .then(data => setEquipmentStatus(data))
        .catch(() => setEquipmentStatus({ total: 0, normal: 0, maintenance: 0 }));
    }
  }, [activeTab]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    r.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleSearch = () => {
    setSearchKeyword(searchInput);
    if (searchInput.trim()) {
      showToast('success', `已搜索 "${searchInput}"，找到 ${filteredResources.length} 条结果`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchKeyword('');
  };

  const handleAddResource = async () => {
    if (!formData.title.trim()) {
      showToast('error', '请输入资源标题');
      return;
    }
    if (!formData.description.trim()) {
      showToast('error', '请输入资源描述');
      return;
    }

    try {
      const newResource: Omit<Resource, 'id'> = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        ...(formData.url && { url: formData.url.trim() }),
        ...(formData.type === 'equipment' && {
          status: formData.status,
          lastMaintenance: formData.lastMaintenance || new Date().toISOString().split('T')[0]
        })
      };

      await createResource(newResource);
      setShowAddModal(false);
      resetForm();
      showToast('success', '资源添加成功！');
    } catch (err: any) {
      showToast('error', err.message || '添加失败，请重试');
    }
  };

  const resetForm = () => {
    setFormData({
      type: activeTab,
      title: '',
      description: '',
      url: '',
      status: 'normal',
      lastMaintenance: ''
    });
  };

  const openAddModal = () => {
    setFormData(prev => ({ ...prev, type: activeTab }));
    setShowAddModal(true);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'broken':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'maintenance':
        return '维护中';
      case 'broken':
        return '故障';
      default:
        return '未知';
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'normal':
        return 'success' as const;
      case 'maintenance':
        return 'warning' as const;
      case 'broken':
        return 'danger' as const;
      default:
        return 'default' as const;
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'literature':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'equipment':
        return <Monitor className="w-5 h-5 text-teal-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeBgColor = (type: ResourceType) => {
    switch (type) {
      case 'literature':
        return 'bg-blue-100';
      case 'equipment':
        return 'bg-teal-100';
      case 'video':
        return 'bg-purple-100';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast 提示 */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg animate-fade-in-up ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {toast.message}
          </span>
          <button
            onClick={() => setToast({ ...toast, show: false })}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">资源库管理</h1>
          <p className="text-sm text-slate-500 mt-1">实验相关文献、设备和视频资源管理</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          添加资源
        </Button>
      </div>

      {activeTab === 'equipment' && equipmentStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">设备总数</p>
                  <p className="font-display text-3xl font-bold text-slate-900">{equipmentStatus.total}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">正常可用</p>
                  <p className="font-display text-3xl font-bold text-green-600">{equipmentStatus.normal}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">维护中</p>
                  <p className="font-display text-3xl font-bold text-orange-600">{equipmentStatus.maintenance}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 rounded-lg p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  handleClearSearch();
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索资源标题或描述..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} className="flex-shrink-0">
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>
          {searchKeyword && (
            <p className="text-sm text-slate-500 mt-2">
              搜索 "{searchKeyword}"，找到 <span className="font-medium text-primary-600">{filteredResources.length}</span> 条结果
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <Card
              key={resource.id}
              hover
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBgColor(resource.type)}`}>
                    {getTypeIcon(resource.type)}
                  </div>
                  {resource.status && (
                    <Badge variant={getStatusVariant(resource.status)}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(resource.status)}
                        <span>{getStatusText(resource.status)}</span>
                      </span>
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">{resource.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{resource.description}</p>
                
                {resource.type === 'equipment' && resource.lastMaintenance && (
                  <div className="flex items-center text-xs text-slate-500 mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    上次维护：{new Date(resource.lastMaintenance).toLocaleDateString('zh-CN')}
                  </div>
                )}

                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {resource.type === 'video' ? '观看视频' : '查看详情'}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredResources.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 mb-2">
            {searchKeyword ? `没有找到与 "${searchKeyword}" 相关的资源` : '暂无相关资源'}
          </p>
          {searchKeyword && (
            <Button variant="ghost" onClick={handleClearSearch}>
              清除搜索条件
            </Button>
          )}
        </div>
      )}

      {/* 添加资源弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="font-display text-xl font-bold text-slate-900">添加新资源</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">资源类型</label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                  options={RESOURCE_TYPE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">资源标题 *</label>
                <Input
                  placeholder="请输入资源标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">资源描述 *</label>
                <TextArea
                  placeholder="请输入资源详细描述"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">链接地址</label>
                <Input
                  placeholder="请输入资源链接（可选）"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              {formData.type === 'equipment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">设备状态</label>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">上次维护日期</label>
                    <Input
                      type="date"
                      value={formData.lastMaintenance}
                      onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                取消
              </Button>
              <Button onClick={handleAddResource}>
                <Save className="w-4 h-4 mr-2" />
                保存资源
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
