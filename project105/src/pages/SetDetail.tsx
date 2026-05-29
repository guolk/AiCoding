import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, MapPin, Calendar, Tag, Package, ShoppingBag, FileText, CheckCircle, Clock, RefreshCw, Heart, Star } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import StatusBadge from '../components/common/StatusBadge';
import { SetStatus } from '../types';
import { STATUS_LABELS } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function SetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sets, deleteSet, updateSet, projects } = useAppStore();
  const legoSet = sets.find((s) => s.id === id);

  if (!legoSet) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-500 mb-2">套装不存在</h3>
        <button
          onClick={() => navigate('/collection')}
          className="brick-btn-outline"
        >
          返回收藏列表
        </button>
      </div>
    );
  }

  const relatedProjects = projects.filter((p) => p.related_set_id === legoSet.id);

  const handleStatusChange = (newStatus: SetStatus) => {
    updateSet(legoSet.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个套装吗？此操作不可撤销。')) {
      deleteSet(legoSet.id);
      navigate('/collection');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/collection')}
          className="p-2 hover:bg-gray-100 rounded-brick transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-lego-blue font-medium">{legoSet.set_num}</span>
            <StatusBadge status={legoSet.status} />
          </div>
          <h1 className="text-2xl font-display font-bold text-lego-dark mt-1">
            {legoSet.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="brick-btn-secondary flex items-center gap-2">
            <Edit2 size={16} />
            <span>编辑</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 text-lego-red rounded-brick transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="brick-card overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100">
              {legoSet.cover_image_url ? (
                <img
                  src={legoSet.cover_image_url}
                  alt={legoSet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">🧱</span>
                </div>
              )}
            </div>
          </div>

          {legoSet.notes && (
            <div className="brick-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className="text-lego-blue" />
                <h3 className="font-display font-semibold text-lego-dark">备注</h3>
              </div>
              <p className="text-gray-600">{legoSet.notes}</p>
            </div>
          )}

          {legoSet.tags.length > 0 && (
            <div className="brick-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={18} className="text-lego-blue" />
                <h3 className="font-display font-semibold text-lego-dark">标签</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {legoSet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-lego-blue/10 text-lego-blue rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {relatedProjects.length > 0 && (
            <div className="brick-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-lego-blue" />
                  <h3 className="font-display font-semibold text-lego-dark">相关项目</h3>
                </div>
              </div>
              <div className="space-y-3">
                {relatedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 bg-gray-50 rounded-brick hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-lego-dark">{project.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                      </div>
                      <StatusBadge status={project.status} type="project" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="brick-card p-6">
            <h3 className="font-display font-semibold text-lego-dark mb-4">快速信息</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Tag size={16} />
                  主题
                </span>
                <span className="font-medium text-lego-dark">{legoSet.theme}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Calendar size={16} />
                  年份
                </span>
                <span className="font-medium text-lego-dark">{legoSet.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Package size={16} />
                  零件数
                </span>
                <span className="font-medium text-lego-dark">
                  {legoSet.num_parts.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <MapPin size={16} />
                  储存位置
                </span>
                <span className="font-medium text-lego-dark">
                  {legoSet.storage_location || '未记录'}
                </span>
              </div>
            </div>
          </div>

          {legoSet.purchase_price && (
            <div className="brick-card p-6">
              <h3 className="font-display font-semibold text-lego-dark mb-4">购入信息</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <ShoppingBag size={16} />
                    购入价格
                  </span>
                  <span className="font-bold text-xl text-lego-dark">
                    {formatCurrency(legoSet.purchase_price)}
                  </span>
                </div>
                {legoSet.purchase_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar size={16} />
                      购入日期
                    </span>
                    <span className="font-medium text-lego-dark">
                      {formatDate(legoSet.purchase_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="brick-card p-6">
            <h3 className="font-display font-semibold text-lego-dark mb-4">状态管理</h3>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(STATUS_LABELS) as SetStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`flex items-center gap-3 p-3 rounded-brick transition-all ${
                    legoSet.status === status
                      ? 'bg-lego-blue text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-lego-dark'
                  }`}
                >
                  {status === 'owned' && <CheckCircle size={18} />}
                  {status === 'building' && <RefreshCw size={18} />}
                  {status === 'completed' && <Star size={18} />}
                  {status === 'disassembled' && <Package size={18} />}
                  {status === 'wishlist' && <Heart size={18} />}
                  <span>{STATUS_LABELS[status]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="brick-card p-6 bg-gradient-to-br from-lego-blue/5 to-lego-red/5">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">每零件成本</p>
              <p className="text-2xl font-display font-bold text-lego-dark">
                {legoSet.purchase_price
                  ? (legoSet.purchase_price / legoSet.num_parts).toFixed(2)
                  : '-'}
              </p>
              <p className="text-xs text-gray-400 mt-1">元/零件</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
