import { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  AlertTriangle, 
  X, 
  Edit, 
  Trash2,
  Camera,
  FileText,
  Check
} from 'lucide-react';
import { useBillStore } from '../store/billStore';
import { Bill, EnergyType, ENERGY_INFO } from '../types';
import { getCurrentPeriod, formatBillingPeriod, formatCurrency, generateId } from '../utils/formatter';

export default function Bills() {
  const { bills, initData, addBill, updateBill, deleteBill } = useBillStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [filterType, setFilterType] = useState<EnergyType | 'all'>('all');
  const [formData, setFormData] = useState({
    energyType: 'electricity' as EnergyType,
    usage: '',
    amount: '',
    billingPeriod: getCurrentPeriod(),
    date: new Date().toISOString().split('T')[0],
  });
  const [ocrProcessing, setOcrProcessing] = useState(false);
  
  useEffect(() => {
    initData();
  }, [initData]);
  
  const handleResetData = () => {
    if (confirm('确定要重置所有账单数据吗？这将清除所有现有数据并重新生成模拟数据。')) {
      localStorage.removeItem('energy-bills-storage');
      window.location.reload();
    }
  };
  
  const handleSubmit = () => {
    console.log('提交表单数据:', formData);
    
    const billData = {
      energyType: formData.energyType,
      usage: parseFloat(formData.usage) || 0,
      amount: parseFloat(formData.amount) || 0,
      billingPeriod: formData.billingPeriod,
      date: formData.date,
    };
    
    console.log('处理后的账单数据:', billData);
    
    if (editingBill) {
      console.log('更新账单:', editingBill.id);
      updateBill(editingBill.id, billData);
    } else {
      console.log('添加新账单');
      addBill(billData);
    }
    
    console.log('当前账单列表:', bills);
    
    setShowAddModal(false);
    setEditingBill(null);
    setFormData({
      energyType: 'electricity',
      usage: '',
      amount: '',
      billingPeriod: getCurrentPeriod(),
      date: new Date().toISOString().split('T')[0],
    });
    
    alert(editingBill ? '账单更新成功！' : '账单录入成功！');
  };
  
  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      energyType: bill.energyType,
      usage: bill.usage.toString(),
      amount: bill.amount.toString(),
      billingPeriod: bill.billingPeriod,
      date: bill.date,
    });
    setShowAddModal(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条账单记录吗？')) {
      deleteBill(id);
    }
  };
  
  const simulateOCR = () => {
    setOcrProcessing(true);
    setTimeout(() => {
      setFormData({
        energyType: 'electricity',
        usage: '245',
        amount: '147.00',
        billingPeriod: getCurrentPeriod(),
        date: new Date().toISOString().split('T')[0],
      });
      setOcrProcessing(false);
      setShowOCRModal(false);
      setShowAddModal(true);
    }, 2000);
  };
  
  const filteredBills = bills
    .filter(b => filterType === 'all' || b.energyType === filterType)
    .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod));
  
  const anomalyCount = bills.filter(b => b.isAnomaly).length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            {(['all', 'electricity', 'gas', 'water'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type === 'all' ? '全部' : ENERGY_INFO[type].name}
              </button>
            ))}
          </div>
          
          {anomalyCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{anomalyCount} 条异常账单</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 z-10 relative">
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium cursor-pointer active:scale-95"
            type="button"
          >
            重置数据
          </button>
          <button
            onClick={() => {
              console.log('OCR按钮点击');
              setShowOCRModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium cursor-pointer active:scale-95"
            type="button"
          >
            <Camera className="w-4 h-4" />
            OCR识别
          </button>
          <button
            onClick={() => {
              console.log('手动录入按钮点击');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 btn-primary cursor-pointer active:scale-95"
            type="button"
          >
            <Plus className="w-4 h-4" />
            手动录入
          </button>
        </div>
      </div>
      
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">账期</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">类型</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">用量</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">金额</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">状态</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.map(bill => {
                const info = ENERGY_INFO[bill.energyType];
                return (
                  <tr 
                    key={bill.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      bill.isAnomaly ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {formatBillingPeriod(bill.billingPeriod)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: `${info.color}15`, color: info.color }}
                      >
                        {info.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {bill.usage.toFixed(bill.energyType === 'electricity' ? 0 : 1)} {info.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(bill.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {bill.isAnomaly ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {bill.anomalyReason}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                          <Check className="w-3 h-3" />
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingBill ? '编辑账单' : '录入账单'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBill(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">能源类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['electricity', 'gas', 'water'] as EnergyType[]).map(type => {
                    const info = ENERGY_INFO[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, energyType: type })}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                          formData.energyType === type
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用量 ({ENERGY_INFO[formData.energyType].unit})
                  </label>
                  <input
                    type="number"
                    value={formData.usage}
                    onChange={e => setFormData({ ...formData, usage: e.target.value })}
                    className="input-field"
                    placeholder="请输入用量"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">金额 (元)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="请输入金额"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">账期</label>
                  <input
                    type="month"
                    value={formData.billingPeriod}
                    onChange={e => setFormData({ ...formData, billingPeriod: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">缴费日期</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBill(null);
                }}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 btn-primary"
              >
                {editingBill ? '保存修改' : '确认录入'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showOCRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">OCR账单识别</h3>
              <button
                onClick={() => setShowOCRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6">
              {ocrProcessing ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
                    <FileText className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-800 mb-2">正在识别中...</p>
                  <p className="text-sm text-gray-500">请稍候，正在解析账单内容</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-4 hover:border-primary-400 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">点击上传或拖拽账单图片</p>
                    <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
                  </div>
                  
                  <button
                    onClick={simulateOCR}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    拍照识别 (模拟)
                  </button>
                  
                  <p className="text-xs text-gray-400 text-center mt-4">
                    * 演示版本，将生成模拟数据
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
