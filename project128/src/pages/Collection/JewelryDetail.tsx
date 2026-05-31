
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Tag, User, Gift, FileText, Sparkles, Droplet, ShieldCheck, Clock, Heart } from 'lucide-react';
import useJewelryStore from '../../store/jewelryStore';
import { formatPrice, formatDate, getJewelryTypeLabel, getOccasionLabel, getPhotoTypeLabel } from '../../utils/format';

const JewelryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJewelryById, getValuationsByJewelryId, getInsuranceByJewelryId, getCertificatesByJewelryId, getMaintenancesByJewelryId, getRepairsByJewelryId } = useJewelryStore();
  
  const [activeTab, setActiveTab] = useState('photos');
  
  const jewelry = getJewelryById(id || '');
  const valuations = getValuationsByJewelryId(id || '');
  const insurance = getInsuranceByJewelryId(id || '');
  const certificates = getCertificatesByJewelryId(id || '');
  const maintenances = getMaintenancesByJewelryId(id || '');
  const repairs = getRepairsByJewelryId(id || '');

  if (!jewelry) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-ink-600">珠宝不存在</h2>
        <button onClick={() => navigate('/collection')} className="mt-4 text-gold-600 hover:underline">
          返回列表
        </button>
      </div>
    );
  }

  const latestValuation = valuations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const tabs = [
    { id: 'photos', label: '照片画廊', icon: Sparkles },
    { id: 'story', label: '来源故事', icon: Heart },
    { id: 'value', label: '价值追踪', icon: Tag },
    { id: 'maintenance', label: '维护保养', icon: Droplet },
  ];

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/collection')}
            className="p-2 rounded-full hover:bg-gold-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-ink-600" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-600">{jewelry.name}</h1>
            <p className="text-ink-400">{jewelry.brand} · {getJewelryTypeLabel(jewelry.type)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/collection/${id}/edit`)}
          className="flex items-center gap-2 px-6 py-3 gold-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Edit className="w-5 h-5" />
          编辑
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-gold-100">
            <div className="aspect-video bg-cream-50">
              {jewelry.photos.length > 0 ? (
                <img
                  src={jewelry.photos[0].url}
                  alt={jewelry.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold-300">
                  <Sparkles className="w-20 h-20" />
                </div>
              )}
            </div>
            
            <div className="border-b border-gold-100">
              <div className="flex">
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
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'photos' && (
                <div className="grid grid-cols-4 gap-4">
                  {jewelry.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-xl overflow-hidden relative group">
                      <img
                        src={photo.url}
                        alt={photo.description}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-white text-xs">{getPhotoTypeLabel(photo.type)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'story' && (
                <div className="space-y-6">
                  <div className="bg-cream-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-gold-500" />
                      <h3 className="font-display text-lg font-semibold">赠送者</h3>
                    </div>
                    <p className="text-ink-600">{jewelry.story.giver || '未记录'}</p>
                  </div>
                  <div className="bg-cream-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Gift className="w-5 h-5 text-gold-500" />
                      <h3 className="font-display text-lg font-semibold">赠送场合</h3>
                    </div>
                    <p className="text-ink-600">{jewelry.story.occasion || '未记录'}</p>
                  </div>
                  <div className="bg-cream-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-5 h-5 text-gold-500" />
                      <h3 className="font-display text-lg font-semibold">背后的意义</h3>
                    </div>
                    <p className="text-ink-600">{jewelry.story.meaning || '未记录'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'value' && (
                <div className="space-y-6">
                  {valuations.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4">估值历史</h3>
                      <div className="space-y-3">
                        {valuations.map((v) => (
                          <div key={v.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div>
                              <p className="font-medium text-ink-600">{formatPrice(v.value)}</p>
                              <p className="text-sm text-ink-400">{v.source}</p>
                            </div>
                            <span className="text-ink-400">{formatDate(v.date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {insurance && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4">保险信息</h3>
                      <div className="p-4 bg-cream-50 rounded-xl">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-ink-400">保单号</p>
                            <p className="font-medium">{insurance.policyNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-ink-400">保额</p>
                            <p className="font-medium">{formatPrice(insurance.coverage)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-ink-400">保险公司</p>
                            <p className="font-medium">{insurance.provider}</p>
                          </div>
                          <div>
                            <p className="text-sm text-ink-400">有效期</p>
                            <p className="font-medium">{formatDate(insurance.endDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {certificates.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4">鉴定证书</h3>
                      <div className="space-y-3">
                        {certificates.map((c) => (
                          <div key={c.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="w-8 h-8 text-gold-500" />
                              <div>
                                <p className="font-medium text-ink-600">{c.type}</p>
                                <p className="text-sm text-ink-400">{c.number}</p>
                              </div>
                            </div>
                            <span className="text-ink-400">{formatDate(c.issueDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-6">
                  {maintenances.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4">保养记录</h3>
                      <div className="space-y-3">
                        {maintenances.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Clock className="w-6 h-6 text-gold-500" />
                              <div>
                                <p className="font-medium text-ink-600">{m.method}</p>
                                <p className="text-sm text-ink-400">{m.notes}</p>
                              </div>
                            </div>
                            <span className="text-ink-400">{formatDate(m.date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {repairs.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4">维修记录</h3>
                      <div className="space-y-3">
                        {repairs.map((r) => (
                          <div key={r.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                            <div>
                              <p className="font-medium text-ink-600">{r.description}</p>
                              <p className="text-sm text-ink-400">{r.notes}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gold-600">{formatPrice(r.cost)}</p>
                              <p className="text-sm text-ink-400">{formatDate(r.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
            <h3 className="font-display text-lg font-bold text-ink-600 mb-4">基本信息</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-ink-400">材质</span>
                <span className="font-medium text-ink-600">{jewelry.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">宝石</span>
                <span className="font-medium text-ink-600">{jewelry.gemstone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">品牌</span>
                <span className="font-medium text-ink-600">{jewelry.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">购入日期</span>
                <span className="font-medium text-ink-600">{formatDate(jewelry.purchaseDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">购入渠道</span>
                <span className="font-medium text-ink-600">{jewelry.purchaseChannel}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
            <h3 className="font-display text-lg font-bold text-ink-600 mb-4">价值信息</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-ink-400">购入价格</span>
                <span className="font-medium text-ink-600">{formatPrice(jewelry.purchasePrice)}</span>
              </div>
              {latestValuation && (
                <div className="flex justify-between">
                  <span className="text-ink-400">当前估值</span>
                  <span className="font-bold text-emerald-500">{formatPrice(latestValuation.value)}</span>
                </div>
              )}
              {latestValuation && (
                <div className="pt-4 border-t border-gold-100">
                  <p className="text-sm text-ink-400 mb-1">估值变化</p>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${latestValuation.value >= jewelry.purchasePrice ? 'text-emerald-500' : 'text-ruby-500'}`}>
                      {latestValuation.value >= jewelry.purchasePrice ? '↑' : '↓'}
                      {Math.abs(((latestValuation.value - jewelry.purchasePrice) / jewelry.purchasePrice * 100)).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
            <h3 className="font-display text-lg font-bold text-ink-600 mb-4">适合场合</h3>
            <div className="flex flex-wrap gap-2">
              {jewelry.suitableOccasions.map((occasion) => (
                <span
                  key={occasion}
                  className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm"
                >
                  {getOccasionLabel(occasion)}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
            <h3 className="font-display text-lg font-bold text-ink-600 mb-4">佩戴统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-ink-400">总佩戴次数</span>
                <span className="font-medium text-ink-600">{jewelry.wearCount}次</span>
              </div>
              {jewelry.lastWornDate && (
                <div className="flex justify-between">
                  <span className="text-ink-400">上次佩戴</span>
                  <span className="font-medium text-ink-600">{formatDate(jewelry.lastWornDate)}</span>
                </div>
              )}
            </div>
          </div>

          {jewelry.tags.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
              <h3 className="font-display text-lg font-bold text-ink-600 mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {jewelry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-cream-100 text-ink-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JewelryDetail;
