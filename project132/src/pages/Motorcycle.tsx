import { useState } from 'react';
import { useAppStore } from '../store';
import { formatDate, formatCurrency, getDaysUntil } from '../utils/formatters';
import { 
  Bike, 
  Calendar, 
  Shield, 
  FileText, 
  Wrench,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Fuel
} from 'lucide-react';

export default function Motorcycle() {
  const { motorcycle, updateMotorcycle } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(motorcycle || {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    displacement: 0,
    vin: '',
    purchaseDate: '',
    currentMileage: 0,
    insuranceExpiry: '',
    inspectionExpiry: '',
    modifications: []
  });

  const insuranceDays = motorcycle ? getDaysUntil(motorcycle.insuranceExpiry) : 0;
  const inspectionDays = motorcycle ? getDaysUntil(motorcycle.inspectionExpiry) : 0;

  const handleSave = () => {
    if (motorcycle) {
      updateMotorcycle(editData);
    }
    setIsEditing(false);
  };

  if (!motorcycle) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">摩托车档案</h1>
          <p className="text-dark-300 mt-1">管理你的爱车信息</p>
        </div>
        <div className="card p-12 text-center">
          <Bike className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-lg">暂无摩托车档案</p>
          <p className="text-dark-500 text-sm mt-2">添加你的爱车信息开始管理</p>
          <button className="btn-primary inline-flex items-center gap-2 mt-6">
            <Plus className="w-4 h-4" />
            添加摩托车
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">摩托车档案</h1>
          <p className="text-dark-300 mt-1">管理你的爱车信息</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {isEditing ? '取消编辑' : '编辑信息'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Bike className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">品牌</label>
                        <input
                          type="text"
                          value={editData.brand}
                          onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">型号</label>
                        <input
                          type="text"
                          value={editData.model}
                          onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">年份</label>
                        <input
                          type="number"
                          value={editData.year}
                          onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">排量 (cc)</label>
                        <input
                          type="number"
                          value={editData.displacement}
                          onChange={(e) => setEditData({ ...editData, displacement: parseInt(e.target.value) })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">底盘号 (VIN)</label>
                        <input
                          type="text"
                          value={editData.vin}
                          onChange={(e) => setEditData({ ...editData, vin: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">购入日期</label>
                        <input
                          type="date"
                          value={editData.purchaseDate}
                          onChange={(e) => setEditData({ ...editData, purchaseDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">当前里程 (km)</label>
                        <input
                          type="number"
                          value={editData.currentMileage}
                          onChange={(e) => setEditData({ ...editData, currentMileage: parseInt(e.target.value) })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <button onClick={handleSave} className="btn-primary">
                      保存修改
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">
                      {motorcycle.brand} {motorcycle.model}
                    </h2>
                    <p className="text-dark-400 mt-1">
                      {motorcycle.year}年 · {motorcycle.displacement}cc
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div>
                        <p className="text-dark-400 text-sm">底盘号</p>
                        <p className="text-white font-mono">{motorcycle.vin}</p>
                      </div>
                      <div>
                        <p className="text-dark-400 text-sm">购入日期</p>
                        <p className="text-white">{formatDate(motorcycle.purchaseDate)}</p>
                      </div>
                      <div>
                        <p className="text-dark-400 text-sm">当前里程</p>
                        <p className="text-white font-mono text-xl">{motorcycle.currentMileage.toLocaleString()} <span className="text-sm text-dark-400">km</span></p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-400" />
                改装清单
              </h2>
              <button className="btn-secondary text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" />
                添加改装
              </button>
            </div>
            <div className="space-y-3">
              {motorcycle.modifications.map((mod, index) => (
                <div key={mod.id} className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{mod.name}</p>
                      <p className="text-dark-400 text-sm">{formatDate(mod.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-brand-400 font-mono font-bold">{formatCurrency(mod.cost)}</p>
                      {mod.notes && <p className="text-dark-500 text-xs">{mod.notes}</p>}
                    </div>
                    <button className="p-2 text-dark-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between">
              <span className="text-dark-400">改装总花费</span>
              <span className="text-brand-400 font-mono font-bold text-xl">
                {formatCurrency(motorcycle.modifications.reduce((sum, m) => sum + m.cost, 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`card p-6 ${insuranceDays <= 30 ? 'border-red-500/50' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">保险</h2>
            </div>
            {isEditing ? (
              <div>
                <label className="label">到期日期</label>
                <input
                  type="date"
                  value={editData.insuranceExpiry}
                  onChange={(e) => setEditData({ ...editData, insuranceExpiry: e.target.value })}
                  className="input-field"
                />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-white">{formatDate(motorcycle.insuranceExpiry)}</p>
                <div className="mt-4 flex items-center gap-2">
                  {insuranceDays <= 30 ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                      <span className="text-red-400">还有 {insuranceDays} 天到期</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">状态正常 ({insuranceDays} 天)</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={`card p-6 ${inspectionDays <= 30 ? 'border-red-500/50' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">年检</h2>
            </div>
            {isEditing ? (
              <div>
                <label className="label">到期日期</label>
                <input
                  type="date"
                  value={editData.inspectionExpiry}
                  onChange={(e) => setEditData({ ...editData, inspectionExpiry: e.target.value })}
                  className="input-field"
                />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-white">{formatDate(motorcycle.inspectionExpiry)}</p>
                <div className="mt-4 flex items-center gap-2">
                  {inspectionDays <= 30 ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                      <span className="text-red-400">还有 {inspectionDays} 天到期</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">状态正常 ({inspectionDays} 天)</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Fuel className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">状态概览</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-400">总里程</span>
                <span className="text-white font-mono">{motorcycle.currentMileage.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">已使用</span>
                <span className="text-white">
                  {Math.floor((Date.now() - new Date(motorcycle.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} 年
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">改装项目</span>
                <span className="text-white">{motorcycle.modifications.length} 项</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
