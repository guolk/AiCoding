import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Trash2, FileText, Settings, Gauge } from 'lucide-react';
import { useEquipmentStore } from '@/store/equipmentStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { useWorkOrderStore } from '@/store/workOrderStore';
import { useLubricationStore } from '@/store/lubricationStore';
import { equipmentStatusConfig, documentTypeConfig, formatDate, cn } from '@/utils/helpers';
import type { DocumentType } from '@/types';

type TabKey = 'info' | 'params' | 'documents' | 'inspections' | 'workorders' | 'lubrication';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  const getEquipmentById = useEquipmentStore((s) => s.getEquipmentById);
  const getTechParametersByEquipment = useEquipmentStore((s) => s.getTechParametersByEquipment);
  const getDocumentsByEquipment = useEquipmentStore((s) => s.getDocumentsByEquipment);
  const addTechParameter = useEquipmentStore((s) => s.addTechParameter);
  const deleteTechParameter = useEquipmentStore((s) => s.deleteTechParameter);
  const addDocument = useEquipmentStore((s) => s.addDocument);
  const deleteDocument = useEquipmentStore((s) => s.deleteDocument);

  const getStandardsByEquipment = useInspectionStore((s) => s.getStandardsByEquipment);
  const getRecordsByEquipment = useInspectionStore((s) => s.getRecordsByEquipment);

  const getWorkOrdersByEquipment = useWorkOrderStore((s) => s.getWorkOrdersByEquipment);

  const getPointsByEquipment = useLubricationStore((s) => s.getPointsByEquipment);
  const getRecordsByEquipmentLubrication = useLubricationStore((s) => s.getRecordsByEquipment);

  const equipment = id ? getEquipmentById(id) : undefined;
  const techParams = id ? getTechParametersByEquipment(id) : [];
  const documents = id ? getDocumentsByEquipment(id) : [];
  const inspectionStandards = id ? getStandardsByEquipment(id) : [];
  const inspectionRecords = id ? getRecordsByEquipment(id) : [];
  const workOrders = id ? getWorkOrdersByEquipment(id) : [];
  const lubricationPoints = id ? getPointsByEquipment(id) : [];
  const lubricationRecords = id ? getRecordsByEquipmentLubrication(id) : [];

  const [newParam, setNewParam] = useState({ name: '', value: '', unit: '', remark: '' });
  const [newDoc, setNewDoc] = useState({ name: '', type: 'manual' as DocumentType, fileName: '' });

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">设备不存在</p>
        <button
          onClick={() => navigate('/equipment')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  const statusConfig = equipmentStatusConfig[equipment.status];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'info', label: '基本信息' },
    { key: 'params', label: '技术参数' },
    { key: 'documents', label: '随机资料' },
    { key: 'inspections', label: '点检记录' },
    { key: 'workorders', label: '维修工单' },
    { key: 'lubrication', label: '润滑管理' },
  ];

  const handleAddParam = () => {
    if (id && newParam.name && newParam.value) {
      addTechParameter({
        equipmentId: id,
        name: newParam.name,
        value: newParam.value,
        unit: newParam.unit,
        remark: newParam.remark,
      });
      setNewParam({ name: '', value: '', unit: '', remark: '' });
    }
  };

  const handleAddDocument = () => {
    if (id && newDoc.name && newDoc.fileName) {
      addDocument({
        equipmentId: id,
        name: newDoc.name,
        type: newDoc.type,
        fileName: newDoc.fileName,
        uploadDate: new Date().toISOString().split('T')[0],
      });
      setNewDoc({ name: '', type: 'manual', fileName: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/equipment')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{equipment.name}</h2>
            <p className="text-sm text-gray-500">{equipment.code}</p>
          </div>
          <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded', statusConfig.bgColor, statusConfig.color)}>
            {statusConfig.label}
          </span>
        </div>
        <Link
          to={`/equipment/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          编辑
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="设备编号" value={equipment.code} />
              <InfoItem label="设备名称" value={equipment.name} />
              <InfoItem label="型号" value={equipment.model} />
              <InfoItem label="制造商" value={equipment.manufacturer} />
              <InfoItem label="安装位置" value={equipment.location} />
              <InfoItem label="设备状态" value={statusConfig.label} />
              <InfoItem label="出厂日期" value={formatDate(equipment.productionDate)} />
              <InfoItem label="投用日期" value={formatDate(equipment.commissioningDate)} />
              <InfoItem label="创建时间" value={formatDate(equipment.createdAt)} />
              <InfoItem label="更新时间" value={formatDate(equipment.updatedAt)} />
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  添加技术参数
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="参数名称"
                    value={newParam.name}
                    onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="参数值"
                    value={newParam.value}
                    onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="单位"
                    value={newParam.unit}
                    onChange={(e) => setNewParam({ ...newParam, unit: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddParam}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">参数名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">参数值</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">单位</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {techParams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          暂无技术参数
                        </td>
                      </tr>
                    ) : (
                      techParams.map((param) => (
                        <tr key={param.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{param.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{param.value}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{param.unit}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{param.remark || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteTechParameter(param.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  上传资料
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="资料名称"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newDoc.type}
                    onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value as DocumentType })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="manual">说明书</option>
                    <option value="certificate">合格证</option>
                    <option value="drawing">图纸</option>
                    <option value="other">其他</option>
                  </select>
                  <input
                    type="text"
                    placeholder="文件名"
                    value={newDoc.fileName}
                    onChange={(e) => setNewDoc({ ...newDoc, fileName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddDocument}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    暂无随机资料
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {documentTypeConfig[doc.type].label} · {doc.fileName}
                          </p>
                          <p className="text-xs text-gray-400">上传于 {formatDate(doc.uploadDate)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'inspections' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">点检标准 ({inspectionStandards.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">点检项目</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">检查标准</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">频率</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">负责人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inspectionStandards.map((std) => (
                        <tr key={std.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{std.itemName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{std.checkStandard}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {std.frequency === 'daily' && '每日'}
                            {std.frequency === 'weekly' && '每周'}
                            {std.frequency === 'monthly' && '每月'}
                            {std.frequency === 'quarterly' && '每季度'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{std.responsiblePerson}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">点检记录 ({inspectionRecords.length})</h4>
                {inspectionRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无点检记录</div>
                ) : (
                  <div className="space-y-3">
                    {inspectionRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            record.isNormal ? 'bg-green-500' : 'bg-red-500'
                          )} />
                          <div>
                            <p className="font-medium text-gray-900">
                              {record.isNormal ? '正常' : '异常'} - {record.measuredValue || '无实测值'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.inspector} · {formatDate(record.inspectionTime)}
                            </p>
                            {record.abnormalDesc && (
                              <p className="text-xs text-red-600 mt-1">异常：{record.abnormalDesc}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'workorders' && (
            <div>
              {workOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无维修工单</div>
              ) : (
                <div className="space-y-3">
                  {workOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{order.faultDesc}</span>
                        <span className={cn(
                          'text-xs px-2 py-1 rounded',
                          order.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        )}>
                          {order.status === 'pending' && '待派工'}
                          {order.status === 'assigned' && '已派工'}
                          {order.status === 'processing' && '处理中'}
                          {order.status === 'completed' && '已完成'}
                          {order.status === 'closed' && '已关闭'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        上报人：{order.reporter} · {formatDate(order.reportTime)}
                        {order.assignee && ` · 维修人：${order.assignee}`}
                        {order.workHours && ` · 工时：${order.workHours}h`}
                      </div>
                      {order.repairContent && (
                        <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                          维修内容：{order.repairContent}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lubrication' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">润滑点 ({lubricationPoints.length})</h4>
                {lubricationPoints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无润滑点配置</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">润滑部位</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">润滑油牌号</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">换油周期</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">上次换油</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">下次换油</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {lubricationPoints.map((point) => (
                          <tr key={point.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{point.location}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{point.oilType}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{point.changeCycle}天</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(point.lastChangeDate)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(point.nextChangeDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">换油记录 ({lubricationRecords.length})</h4>
                {lubricationRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无换油记录</div>
                ) : (
                  <div className="space-y-3">
                    {lubricationRecords.map((record) => (
                      <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{record.oilType}</p>
                        <p className="text-sm text-gray-500">
                          操作人员：{record.operator} · {formatDate(record.changeDate)}
                        </p>
                        {record.remark && <p className="text-sm text-gray-600 mt-1">备注：{record.remark}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '-'}</span>
    </div>
  );
}
