import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Ship,
  Edit3,
  ArrowLeft,
  Info,
  Wrench,
  Clock,
  FileCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../store';
import {
  formatDate,
  getCertificateStatus,
  getMaintenanceCategory,
  getDaysUntil,
} from '../../utils';
import type { Maintenance } from '../../types';

type TabType = 'basic' | 'equipment' | 'maintenance' | 'certificates';

interface EquipmentItem {
  name: string;
  status: 'normal' | 'needs-repair' | 'replaced';
  category: string;
}

const equipmentCategories = [
  { key: 'sails', label: '帆具', icon: '⛵' },
  { key: 'navigation', label: '导航设备', icon: '🧭' },
  { key: 'safety', label: '安全设备', icon: '🛟' },
  { key: 'engine', label: '动力系统', icon: '⚙️' },
  { key: 'other', label: '其他设备', icon: '📦' },
];

export default function BoatDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  useEffect(() => {
    const state = location.state as { activeTab?: TabType };
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [location.state]);

  const getBoatById = useAppStore((state) => state.getBoatById);
  const getBoatMaintenances = useAppStore((state) => state.getBoatMaintenances);
  const getBoatCertificates = useAppStore((state) => state.getBoatCertificates);

  const boat = id ? getBoatById(id) : undefined;
  const maintenances = useMemo(() => (id ? getBoatMaintenances(id) : []), [id, getBoatMaintenances]);
  const certificates = id ? getBoatCertificates(id) : [];

  const [equipmentStatus, setEquipmentStatus] = useState<Record<string, EquipmentItem>>(() => {
    const initial: Record<string, EquipmentItem> = {};
    if (boat) {
      boat.equipment.forEach((item) => {
        initial[item] = {
          name: item,
          status: 'normal',
          category: categorizeEquipment(item),
        };
      });
    }
    return initial;
  });

  function categorizeEquipment(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('帆') || lowerName.includes('sail')) return 'sails';
    if (
      lowerName.includes('导航') ||
      lowerName.includes('gps') ||
      lowerName.includes('雷达') ||
      lowerName.includes('ais') ||
      lowerName.includes('舵')
    )
      return 'navigation';
    if (
      lowerName.includes('救生') ||
      lowerName.includes('安全') ||
      lowerName.includes('epirb')
    )
      return 'safety';
    if (
      lowerName.includes('发动机') ||
      lowerName.includes('引擎') ||
      lowerName.includes('engine') ||
      lowerName.includes('淡化')
    )
      return 'engine';
    return 'other';
  }

  const handleEquipmentStatusChange = (name: string, status: EquipmentItem['status']) => {
    setEquipmentStatus((prev) => ({
      ...prev,
      [name]: { ...prev[name], status },
    }));
  };

  const groupedEquipment = useMemo(() => {
    const groups: Record<string, EquipmentItem[]> = {};
    equipmentCategories.forEach((cat) => {
      groups[cat.key] = [];
    });
    Object.values(equipmentStatus).forEach((item) => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      } else {
        groups['other'].push(item);
      }
    });
    return groups;
  }, [equipmentStatus]);

  const totalCost = useMemo(() => {
    return maintenances.reduce((sum, m) => sum + m.cost, 0);
  }, [maintenances]);

  if (!boat) {
    return (
      <div className="card p-12 text-center">
        <Ship className="w-16 h-16 text-ocean-300 mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold text-ocean-700 mb-2">
          船艇不存在
        </h3>
        <p className="text-ocean-500 mb-6">请检查您访问的链接是否正确</p>
        <button onClick={() => navigate('/boats')} className="btn-primary">
          返回船艇列表
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'basic' as TabType, label: '基本信息', icon: Info },
    { id: 'equipment' as TabType, label: '设备清单', icon: Wrench },
    { id: 'maintenance' as TabType, label: '维护记录', icon: Clock },
    { id: 'certificates' as TabType, label: '证书管理', icon: FileCheck },
  ];

  const getStatusIcon = (status: EquipmentItem['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'needs-repair':
        return <AlertCircle className="w-5 h-5 text-nautical-500" />;
      case 'replaced':
        return <RefreshCw className="w-5 h-5 text-ocean-500" />;
    }
  };



  const getMaintenanceIcon = (category: Maintenance['category']) => {
    switch (category) {
      case 'engine':
        return '⚙️';
      case 'sails':
        return '⛵';
      case 'rigging':
        return '🔗';
      case 'safety':
        return '🛟';
      default:
        return '📋';
    }
  };

  const getCertificateBadgeColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/boats')}
          className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ocean-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-ocean-800">
              {boat.name}
            </h1>
            <span className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm font-medium">
              {boat.type}
            </span>
          </div>
          <p className="text-ocean-500 mt-1">
            最后更新: {formatDate(boat.updatedAt, 'yyyy年MM月dd日')}
          </p>
        </div>
        <button
          onClick={() => navigate(`/boats/${id}/edit`)}
          className="btn-secondary flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          编辑
        </button>
      </div>

      <div className="bg-ocean-600 rounded-t-2xl overflow-hidden">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-ocean-700 text-white border-b-2 border-nautical-500'
                  : 'text-ocean-200 hover:bg-ocean-700/50 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-b-2xl border border-t-0 border-ocean-100 shadow-lg">
        {activeTab === 'basic' && (
          <div className="p-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Info className="w-6 h-6 text-ocean-600" />
                  基本信息
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-ocean-100">
                    <span className="text-ocean-500">船名</span>
                    <span className="text-ocean-800 font-medium">{boat.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-ocean-100">
                    <span className="text-ocean-500">船型</span>
                    <span className="text-ocean-800 font-medium">{boat.type}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-ocean-100">
                    <span className="text-ocean-500">长度</span>
                    <span className="text-ocean-800 font-medium">{boat.length} 米</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-ocean-100">
                    <span className="text-ocean-500">排水量</span>
                    <span className="text-ocean-800 font-medium">
                      {boat.displacement.toLocaleString()} 公斤
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-ocean-100">
                    <span className="text-ocean-500">发动机</span>
                    <span className="text-ocean-800 font-medium">{boat.engine}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-ocean-500">创建时间</span>
                    <span className="text-ocean-800 font-medium">
                      {formatDate(boat.createdAt, 'yyyy年MM月dd日')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="section-title flex items-center gap-2">
                  <FileText className="w-6 h-6 text-ocean-600" />
                  统计概览
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 p-5 rounded-xl text-white">
                    <div className="text-3xl font-bold mb-1">
                      {maintenances.length}
                    </div>
                    <div className="text-ocean-100 text-sm">维护记录</div>
                  </div>
                  <div className="bg-gradient-to-br from-nautical-500 to-nautical-600 p-5 rounded-xl text-white">
                    <div className="text-3xl font-bold mb-1">
                      ¥{totalCost.toLocaleString()}
                    </div>
                    <div className="text-nautical-100 text-sm">维护总费用</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl text-white">
                    <div className="text-3xl font-bold mb-1">
                      {certificates.filter((c) => getCertificateStatus(c.expiryDate).status === 'valid').length}
                    </div>
                    <div className="text-green-100 text-sm">有效证书</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl text-white">
                    <div className="text-3xl font-bold mb-1">
                      {boat.equipment.length}
                    </div>
                    <div className="text-purple-100 text-sm">设备清单</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="p-8 animate-fade-in">
            <h2 className="section-title flex items-center gap-2 mb-6">
              <Wrench className="w-6 h-6 text-ocean-600" />
              设备清单
            </h2>
            <div className="space-y-6">
              {equipmentCategories.map((category) => (
                <div key={category.key} className="mb-8 last:mb-0">
                  <h3 className="font-display text-lg font-semibold text-ocean-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    {category.label}
                    <span className="text-ocean-400 text-sm font-normal">
                      ({groupedEquipment[category.key]?.length || 0} 件)
                    </span>
                  </h3>
                  {groupedEquipment[category.key]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedEquipment[category.key].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-4 bg-ocean-50 rounded-xl hover:bg-ocean-100 transition-colors"
                        >
                          <span className="text-ocean-800 font-medium">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleEquipmentStatusChange(
                                  item.name,
                                  e.target.value as EquipmentItem['status']
                                )
                              }
                              className="px-3 py-1.5 bg-white border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none cursor-pointer"
                            >
                              <option value="normal">正常</option>
                              <option value="needs-repair">需检修</option>
                              <option value="replaced">已更换</option>
                            </select>
                            {getStatusIcon(item.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ocean-400 text-sm ml-9">暂无该类设备</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-ocean-50 rounded-xl">
              <h4 className="font-medium text-ocean-700 mb-3">状态图例</h4>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-ocean-600">正常</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-nautical-500" />
                  <span className="text-ocean-600">需检修</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-ocean-500" />
                  <span className="text-ocean-600">已更换</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2 mb-0">
                <Clock className="w-6 h-6 text-ocean-600" />
                维护记录
              </h2>
              <button
                onClick={() => navigate(`/boats/${id}/maintenance/new`)}
                className="btn-accent flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新增维护记录
              </button>
            </div>

            {maintenances.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-ocean-200 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-ocean-600 mb-2">
                  暂无维护记录
                </h3>
                <p className="text-ocean-400 mb-6">
                  点击右上角按钮添加第一条维护记录
                </p>
                <button
                  onClick={() => navigate(`/boats/${id}/maintenance/new`)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加维护记录
                </button>
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-ocean-200" />
                <div className="space-y-6">
                  {maintenances.map((maintenance, index) => {
                    const categoryInfo = getMaintenanceCategory(
                      maintenance.category
                    );
                    return (
                      <div
                        key={maintenance.id}
                        className="relative animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="absolute -left-8 top-2 w-6 h-6 bg-ocean-600 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                          <span className="text-xs">
                            {getMaintenanceIcon(maintenance.category)}
                          </span>
                        </div>
                        <div className="card p-5 hover:shadow-xl transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                                >
                                  {categoryInfo.label}
                                </span>
                              </div>
                              <h4 className="font-medium text-ocean-800 text-lg">
                                {maintenance.description}
                              </h4>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 text-nautical-600 font-bold text-lg">
                                <DollarSign className="w-5 h-5" />
                                {maintenance.cost.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1.5 text-ocean-400 text-sm">
                                <Calendar className="w-4 h-4" />
                                {formatDate(
                                  maintenance.date,
                                  'yyyy年MM月dd日'
                                )}
                              </div>
                            </div>
                          </div>
                          {maintenance.notes && (
                            <div className="pt-3 border-t border-ocean-100">
                              <p className="text-ocean-500 text-sm">
                                <span className="font-medium text-ocean-600">
                                  备注:{' '}
                                </span>
                                {maintenance.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {maintenances.length > 0 && (
              <div className="mt-8 p-5 bg-gradient-to-r from-ocean-50 to-nautical-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-ocean-500 text-sm">累计维护费用</div>
                  <div className="font-display text-2xl font-bold text-ocean-800">
                    ¥{totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-ocean-500 text-sm">维护次数</div>
                  <div className="font-display text-2xl font-bold text-ocean-800">
                    {maintenances.length} 次
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="p-8 animate-fade-in">
            <h2 className="section-title flex items-center gap-2 mb-6">
              <FileCheck className="w-6 h-6 text-ocean-600" />
              证书管理
            </h2>

            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="w-16 h-16 text-ocean-200 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-ocean-600 mb-2">
                  暂无证书信息
                </h3>
                <p className="text-ocean-400">请联系管理员添加证书信息</p>
              </div>
            ) : (
              <div className="space-y-4">
                {certificates.map((certificate, index) => {
                  const status = getCertificateStatus(certificate.expiryDate);
                  const daysUntil = getDaysUntil(certificate.expiryDate);
                  return (
                    <div
                      key={certificate.id}
                      className="card p-5 hover:shadow-xl transition-all animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-ocean-800 text-lg">
                              {certificate.name}
                            </h4>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getCertificateBadgeColor(
                                status.status
                              )}`}
                            >
                              {status.status === 'expired' ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                              ) : status.status === 'urgent' ||
                                status.status === 'warning' ? (
                                <Clock className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {status.label}
                            </span>
                            {daysUntil > 0 && daysUntil <= 365 && (
                              <span className="px-2.5 py-1 bg-nautical-100 text-nautical-700 rounded-full text-xs font-medium">
                                倒计时 {daysUntil} 天
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-6 mt-4">
                            <div>
                              <div className="text-ocean-400 text-sm mb-1">
                                签发日期
                              </div>
                              <div className="text-ocean-700 font-medium">
                                {formatDate(
                                  certificate.issueDate,
                                  'yyyy年MM月dd日'
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-ocean-400 text-sm mb-1">
                                到期日期
                              </div>
                              <div
                                className={`font-medium ${
                                  status.status === 'expired'
                                    ? 'text-red-600'
                                    : status.status === 'urgent'
                                    ? 'text-orange-600'
                                    : status.status === 'warning'
                                    ? 'text-yellow-600'
                                    : 'text-ocean-700'
                                }`}
                              >
                                {formatDate(
                                  certificate.expiryDate,
                                  'yyyy年MM月dd日'
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-ocean-400 text-sm mb-1">
                                签发机构
                              </div>
                              <div className="text-ocean-700 font-medium">
                                {certificate.issuingAuthority}
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-ocean-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
