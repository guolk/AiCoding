import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatCurrency, formatNumber, formatPercent, platformNames, platformColors } from '@/lib/api';
import type { Platform } from '@/../shared/types';

interface FormData {
  platform: Platform | '';
  storeId: string;
  date: string;
  salesAmount: string;
  orderCount: string;
  refundRate: string;
  reviewScore: string;
  adSpend: string;
}

export function DataEntry() {
  const { stores } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState<FormData>({
    platform: '',
    storeId: '',
    date: new Date().toISOString().split('T')[0],
    salesAmount: '',
    orderCount: '',
    refundRate: '',
    reviewScore: '',
    adSpend: '',
  });

  const filteredStores = formData.platform
    ? stores.filter((s) => s.platform === formData.platform)
    : stores;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      platform: e.target.value as Platform | '',
      storeId: '',
    }));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'text/csv') {
      setSelectedFile(files[0]);
      setUploadStatus('idle');
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadStatus('idle');
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setUploadStatus('success');
    setTimeout(() => setUploadStatus('idle'), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('success');
    setTimeout(() => {
      setSubmitStatus('idle');
      setFormData({
        platform: '',
        storeId: '',
        date: new Date().toISOString().split('T')[0],
        salesAmount: '',
        orderCount: '',
        refundRate: '',
        reviewScore: '',
        adSpend: '',
      });
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">手动录入数据</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                平台
              </label>
              <div className="relative">
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handlePlatformChange}
                  className="input-field w-full appearance-none pr-10"
                  required
                >
                  <option value="">请选择平台</option>
                  <option value="amazon">Amazon</option>
                  <option value="ebay">eBay</option>
                  <option value="shopify">Shopify</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                店铺
              </label>
              <div className="relative">
                <select
                  name="storeId"
                  value={formData.storeId}
                  onChange={handleInputChange}
                  className="input-field w-full appearance-none pr-10"
                  required
                  disabled={!formData.platform}
                >
                  <option value="">请选择店铺</option>
                  {filteredStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              日期
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="input-field w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                销售额 (USD)
              </label>
              <input
                type="number"
                name="salesAmount"
                value={formData.salesAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="input-field w-full"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                订单数
              </label>
              <input
                type="number"
                name="orderCount"
                value={formData.orderCount}
                onChange={handleInputChange}
                placeholder="0"
                className="input-field w-full"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                退款率 (%)
              </label>
              <input
                type="number"
                name="refundRate"
                value={formData.refundRate}
                onChange={handleInputChange}
                placeholder="0.00"
                className="input-field w-full"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                评分 (1-5)
              </label>
              <input
                type="number"
                name="reviewScore"
                value={formData.reviewScore}
                onChange={handleInputChange}
                placeholder="4.5"
                className="input-field w-full"
                min="1"
                max="5"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                广告支出 (USD)
              </label>
              <input
                type="number"
                name="adSpend"
                value={formData.adSpend}
                onChange={handleInputChange}
                placeholder="0.00"
                className="input-field w-full"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {formData.salesAmount && formData.adSpend && (
            <div className="bg-dark-700/30 rounded-lg p-4 border border-white/5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">数据预览</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">预计销售额</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(Number(formData.salesAmount))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">订单数</p>
                  <p className="text-lg font-semibold text-white">
                    {formatNumber(Number(formData.orderCount || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">退款率</p>
                  <p className="text-lg font-semibold text-white">
                    {formatPercent(Number(formData.refundRate || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">预计利润</p>
                  <p className="text-lg font-semibold text-success-500">
                    {formatCurrency(Number(formData.salesAmount) - Number(formData.adSpend))}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitStatus === 'success' ? (
              <>
                <Check size={18} />
                提交成功
              </>
            ) : (
              '提交数据'
            )}
          </button>

          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 text-success-500 text-sm bg-success-500/10 p-3 rounded-lg border border-success-500/20">
              <Check size={16} />
              <span>数据已成功保存</span>
            </div>
          )}
        </form>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">CSV 批量导入</h2>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-700/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-dark-700 rounded-full flex items-center justify-center">
                <Check size={28} className="text-success-500" />
              </div>
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-dark-700 rounded-full flex items-center justify-center">
                <Upload size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="text-white font-medium">拖拽 CSV 文件到此处</p>
                <p className="text-sm text-gray-500">或点击选择文件</p>
              </div>
              <p className="text-xs text-gray-600">
                支持 .csv 格式，最大 10MB
              </p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setUploadStatus('idle');
              }}
              className="btn-secondary flex-1"
            >
              重新选择
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {uploadStatus === 'success' ? (
                <>
                  <Check size={16} />
                  导入成功
                </>
              ) : (
                '开始导入'
              )}
            </button>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-4 flex items-center gap-2 text-success-500 text-sm bg-success-500/10 p-3 rounded-lg border border-success-500/20">
            <Check size={16} />
            <span>CSV 文件已成功导入，共处理 128 条数据</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-danger-500 text-sm bg-danger-500/10 p-3 rounded-lg border border-danger-500/20">
            <AlertCircle size={16} />
            <span>文件格式错误，请检查 CSV 格式</span>
          </div>
        )}

        <div className="mt-6 p-4 bg-dark-700/30 rounded-lg border border-white/5">
          <h3 className="text-sm font-medium text-white mb-3">CSV 格式说明</h3>
          <p className="text-xs text-gray-500 mb-3">
            文件需包含以下列：platform, storeId, date, salesAmount, orderCount, refundRate, reviewScore, adSpend
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• platform: amazon / ebay / shopify</p>
            <p>• date: YYYY-MM-DD 格式</p>
            <p>• refundRate: 百分比（如 2.5 表示 2.5%）</p>
            <p>• reviewScore: 1-5 之间的数字</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-white mb-4">最近导入记录</h3>
          <div className="space-y-3">
            {[
              { platform: 'amazon' as Platform, count: 45, date: '2024-06-05', status: 'success' },
              { platform: 'shopify' as Platform, count: 32, date: '2024-06-04', status: 'success' },
              { platform: 'ebay' as Platform, count: 28, date: '2024-06-03', status: 'success' },
            ].map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: platformColors[record.platform] }}
                  />
                  <div>
                    <p className="text-sm text-white">{platformNames[record.platform]}</p>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{record.count} 条数据</span>
                  <div className="flex items-center gap-1 text-success-500">
                    <Check size={14} />
                    <span className="text-xs">成功</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
