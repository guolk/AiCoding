
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Shield, FileCheck, Plus, Calendar, Building2 } from 'lucide-react';
import useJewelryStore from '../../store/jewelryStore';
import { formatPrice, formatDate, getCertificateTypeLabel } from '../../utils/format';

const ValueManagement = () => {
  const { jewelries, valuations, insurances, certificates, getJewelryById } = useJewelryStore();
  const [activeTab, setActiveTab] = useState('valuation');

  const tabs = [
    { id: 'valuation', label: '估值追踪', icon: TrendingUp },
    { id: 'insurance', label: '保险管理', icon: Shield },
    { id: 'certificate', label: '证书存档', icon: FileCheck },
  ];

  const valuationChartData = jewelries.map((jewelry) => {
    const jewelryValuations = valuations
      .filter((v) => v.jewelryId === jewelry.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestValuation = jewelryValuations[jewelryValuations.length - 1];
    return {
      name: jewelry.name,
      购入价格: jewelry.purchasePrice,
      当前估值: latestValuation?.value || jewelry.purchasePrice,
    };
  });

  const totalPurchaseValue = jewelries.reduce((sum, j) => sum + j.purchasePrice, 0);
  const totalCurrentValue = jewelries.reduce((sum, jewelry) => {
    const jewelryValuations = valuations.filter((v) => v.jewelryId === jewelry.id);
    const latestValuation = jewelryValuations.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    return sum + (latestValuation?.value || jewelry.purchasePrice);
  }, 0);
  const valueChange = totalCurrentValue - totalPurchaseValue;
  const valueChangePercent = totalPurchaseValue > 0 ? ((valueChange / totalPurchaseValue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-600">价值管理</h1>
        <p className="text-ink-400 mt-1">追踪珠宝价值变化，管理保险和证书</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
          <p className="text-ink-400 text-sm">总购入价值</p>
          <p className="text-2xl font-display font-bold text-ink-600 mt-2">{formatPrice(totalPurchaseValue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
          <p className="text-ink-400 text-sm">当前总估值</p>
          <p className="text-2xl font-display font-bold text-emerald-500 mt-2">{formatPrice(totalCurrentValue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
          <p className="text-ink-400 text-sm">估值变化</p>
          <p className={`text-2xl font-display font-bold mt-2 ${valueChange >= 0 ? 'text-emerald-500' : 'text-ruby-500'}`}>
            {valueChange >= 0 ? '↑' : '↓'} {formatPrice(Math.abs(valueChange))} ({valueChangePercent}%)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gold-100 overflow-hidden">
        <div className="flex border-b border-gold-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-ink-400 hover:text-ink-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'valuation' && (
            <div className="space-y-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={valuationChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D5A3" />
                    <XAxis dataKey="name" tick={{ fill: '#606060' }} />
                    <YAxis tick={{ fill: '#606060' }} />
                    <Tooltip
                      formatter={(value: number) => formatPrice(value)}
                      contentStyle={{
                        backgroundColor: '#FFFEFC',
                        border: '1px solid #E8D5A3',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="购入价格"
                      stroke="#B8860B"
                      strokeWidth={2}
                      dot={{ fill: '#B8860B' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="当前估值"
                      stroke="#50C878"
                      strokeWidth={2}
                      dot={{ fill: '#50C878' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-ink-600">估值历史</h3>
                {valuations
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((valuation) => {
                    const jewelry = getJewelryById(valuation.jewelryId);
                    return (
                      <div
                        key={valuation.id}
                        className="flex items-center justify-between p-4 bg-cream-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-gold-600" />
                          </div>
                          <div>
                            <p className="font-medium text-ink-600">{jewelry?.name || '未知珠宝'}</p>
                            <p className="text-sm text-ink-400">{valuation.source}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-500">{formatPrice(valuation.value)}</p>
                          <p className="text-sm text-ink-400">{formatDate(valuation.date)}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="space-y-4">
              {insurances.length === 0 ? (
                <div className="text-center py-12 text-ink-400">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无保险记录</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {insurances.map((insurance) => {
                    const jewelry = getJewelryById(insurance.jewelryId);
                    return (
                      <div
                        key={insurance.id}
                        className="p-6 bg-cream-50 rounded-xl border border-gold-100"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-display font-bold text-ink-600">{jewelry?.name}</h4>
                            <p className="text-sm text-ink-400">{insurance.policyNumber}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gold-600" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-ink-400">保险公司</span>
                            <span className="font-medium">{insurance.provider}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-400">保额</span>
                            <span className="font-bold text-gold-600">{formatPrice(insurance.coverage)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-400">有效期</span>
                            <span className="font-medium">{formatDate(insurance.endDate)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificate' && (
            <div className="space-y-4">
              {certificates.length === 0 ? (
                <div className="text-center py-12 text-ink-400">
                  <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无证书记录</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {certificates.map((certificate) => {
                    const jewelry = getJewelryById(certificate.jewelryId);
                    return (
                      <div
                        key={certificate.id}
                        className="p-6 bg-gradient-to-br from-gold-50 to-white rounded-xl border border-gold-200"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-ink-600">{certificate.type}</p>
                            <p className="text-sm text-ink-400">{jewelry?.name}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-ink-400">证书编号</span>
                            <span className="font-mono">{certificate.number}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-ink-400">颁发机构</span>
                            <span>{certificate.issuer}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-ink-400">颁发日期</span>
                            <span>{formatDate(certificate.issueDate)}</span>
                          </div>
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
    </div>
  );
};

export default ValueManagement;
