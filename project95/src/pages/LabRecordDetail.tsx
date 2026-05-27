import { ArrowLeft, Calendar, User, FlaskConical, Thermometer, Droplets, Sun } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LabRecord, ExperimentCondition, Reagent, Instrument, Environment } from '../types';

export default function LabRecordDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { labRecords, projects, users } = useStore();
  const record = labRecords.find((r) => r.id === parseInt(id || '0'));

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-neutral-500">实验记录不存在</p>
        <button onClick={() => navigate('/lab-records')} className="mt-4 btn-secondary">
          返回实验记录列表
        </button>
      </div>
    );
  }

  const getProjectName = (projectId: number) => projects.find((p) => p.id === projectId)?.name || '未知项目';
  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/lab-records')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{record.purpose}</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-neutral-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              {record.experiment_date}
            </span>
            <span className="text-sm text-neutral-500">
              <User className="w-4 h-4 inline mr-1" />
              {getUserName(record.user_id)}
            </span>
            <span className="text-sm text-neutral-500">
              <FlaskConical className="w-4 h-4 inline mr-1" />
              {getProjectName(record.project_id)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">实验目的</h3>
          <p className="text-neutral-700">{record.purpose}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">实验方法</h3>
          <p className="text-neutral-700">{record.method}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">实验结果</h3>
          <p className="text-neutral-700">{record.results}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">结论</h3>
          <p className="text-neutral-700">{record.conclusion}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">实验条件</h3>
          
          {record.conditions.reagents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                试剂信息
              </h4>
              <div className="space-y-2">
                {record.conditions.reagents.map((reagent, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium text-neutral-900">{reagent.name}</span>
                    <span className="text-sm text-neutral-500">批号: {reagent.batch}</span>
                    <span className="text-sm text-neutral-500">供应商: {reagent.supplier}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.conditions.instruments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-accent-600" />
                仪器设备
              </h4>
              <div className="space-y-2">
                {record.conditions.instruments.map((instrument, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium text-neutral-900">{instrument.name}</span>
                    <span className="text-sm text-neutral-500">型号: {instrument.model}</span>
                    <span className="text-sm text-neutral-500">设置: {instrument.settings}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.conditions.environment && (
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                环境条件
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-neutral-50 rounded-lg text-center">
                  <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-neutral-900">{record.conditions.environment.temperature}°C</p>
                  <p className="text-xs text-neutral-500">温度</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg text-center">
                  <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-neutral-900">{record.conditions.environment.humidity}%</p>
                  <p className="text-xs text-neutral-500">湿度</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg text-center">
                  <Sun className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-neutral-900">{record.conditions.environment.lighting}</p>
                  <p className="text-xs text-neutral-500">光照</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(`/lab-records/${record.id}/edit`)} className="btn-secondary">
            编辑
          </button>
          <button onClick={() => navigate('/lab-records')} className="btn-primary">
            返回列表
          </button>
        </div>
      </div>
    </div>
  );
}
