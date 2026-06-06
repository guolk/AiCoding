import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Plus, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import { getCertificateStatus } from '../../utils';
import type { Certificate } from '../../types';

export default function BoatList() {
  const navigate = useNavigate();
  const boats = useAppStore((state) => state.boats);
  const getBoatCertificates = useAppStore((state) => state.getBoatCertificates);

  const getWorstCertificateStatus = (certificates: Certificate[]) => {
    if (certificates.length === 0) return null;
    const statuses = certificates.map((c) => getCertificateStatus(c.expiryDate));
    const priority = ['expired', 'urgent', 'warning', 'valid'];
    return statuses.sort(
      (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status)
    )[0];
  };

  const boatsWithStatus = useMemo(() => {
    return boats.map((boat) => {
      const certificates = getBoatCertificates(boat.id);
      const worstStatus = getWorstCertificateStatus(certificates);
      return { ...boat, certificateStatus: worstStatus };
    });
  }, [boats, getBoatCertificates]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      case 'urgent':
        return <Clock className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-50 border-red-200';
      case 'urgent':
        return 'bg-orange-50 border-orange-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'expired':
        return '已过期';
      case 'urgent':
        return '即将到期';
      case 'warning':
        return '即将到期';
      default:
        return '正常';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ocean-800 mb-2">
            船艇管理
          </h1>
          <p className="text-ocean-500">管理所有船艇信息、维护记录和证书</p>
        </div>
        <button
          onClick={() => navigate('/boats/new')}
          className="btn-accent flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增船艇
        </button>
      </div>

      {boatsWithStatus.length === 0 ? (
        <div className="card p-12 text-center">
          <Ship className="w-16 h-16 text-ocean-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-ocean-700 mb-2">
            暂无船艇
          </h3>
          <p className="text-ocean-500 mb-6">点击右上角按钮添加您的第一艘船艇</p>
          <button
            onClick={() => navigate('/boats/new')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加船艇
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boatsWithStatus.map((boat, index) => (
            <div
              key={boat.id}
              onClick={() => navigate(`/boats/${boat.id}`)}
              className="card cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-40 bg-gradient-to-br from-ocean-500 to-ocean-700 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ship className="w-20 h-20 text-white/30 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-xl font-bold text-white truncate">
                    {boat.name}
                  </h3>
                </div>
                {boat.certificateStatus && (
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusBg(
                      boat.certificateStatus.status
                    )}`}
                  >
                    {getStatusIcon(boat.certificateStatus.status)}
                    {getStatusLabel(boat.certificateStatus.status)}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ocean-500 text-sm">船型</span>
                    <span className="text-ocean-800 font-medium">{boat.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ocean-500 text-sm">长度</span>
                    <span className="text-ocean-800 font-medium">{boat.length} 米</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ocean-500 text-sm">排水量</span>
                    <span className="text-ocean-800 font-medium">{boat.displacement.toLocaleString()} 公斤</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-ocean-100">
                  <div className="flex items-center justify-between">
                    <span className="text-ocean-500 text-sm">设备数量</span>
                    <span className="text-ocean-800 font-medium">{boat.equipment.length} 件</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
