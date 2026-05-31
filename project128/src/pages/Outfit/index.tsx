
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shirt, Plus, Calendar, Tag, Heart, Sparkles, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useJewelryStore from '../../store/jewelryStore';
import { formatDate, getOccasionLabel } from '../../utils/format';

const OutfitPage = () => {
  const navigate = useNavigate();
  const { outfits, jewelries, getJewelryById, getWearStats } = useJewelryStore();
  const [activeTab, setActiveTab] = useState('outfits');

  const tabs = [
    { id: 'outfits', label: '搭配收藏', icon: Shirt },
    { id: 'stats', label: '穿戴统计', icon: BarChart3 },
  ];

  const wearStats = getWearStats();
  const rarelyUsed = jewelries.filter((j) => j.wearCount < 5).slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-600">穿搭搭配</h1>
          <p className="text-ink-400 mt-1">记录搭配灵感，统计穿戴频率</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
          <p className="text-ink-400 text-sm">搭配方案</p>
          <p className="text-2xl font-display font-bold text-ink-600 mt-2">{outfits.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
          <p className="text-ink-400 text-sm">总穿戴次数</p>
          <p className="text-2xl font-display font-bold text-ink-600 mt-2">
            {jewelries.reduce((sum, j) => sum + j.wearCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
          <p className="text-ink-400 text-sm">本月穿戴</p>
          <p className="text-2xl font-display font-bold text-emerald-500 mt-2">28</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
          <p className="text-ink-400 text-sm">最少佩戴</p>
          <p className="text-2xl font-display font-bold text-ruby-500 mt-2">{rarelyUsed.length}件</p>
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
          {activeTab === 'outfits' && (
            <div className="space-y-6">
              {outfits.length === 0 ? (
                <div className="text-center py-12 text-ink-400">
                  <Shirt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无搭配记录</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {outfits.map((outfit) => {
                    const outfitJewelry = outfit.jewelryIds
                      .map((id) => getJewelryById(id))
                      .filter(Boolean);
                    return (
                      <div
                        key={outfit.id}
                        className="rounded-xl overflow-hidden border border-gold-100 card-hover"
                      >
                        <div className="aspect-video bg-cream-50">
                          <img
                            src={outfit.photoUrl}
                            alt={outfit.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-display font-bold text-ink-600">{outfit.name}</h4>
                            <span className="text-xs px-2 py-1 bg-gold-100 text-gold-700 rounded-full">
                              {getOccasionLabel(outfit.occasion)}
                            </span>
                          </div>
                          <p className="text-sm text-ink-400 mb-3 line-clamp-2">{outfit.notes}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {outfitJewelry.slice(0, 3).map((j) => (
                                <div
                                  key={j!.id}
                                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-cream-100"
                                >
                                  <img
                                    src={j!.photos[0]?.url}
                                    alt={j!.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {outfitJewelry.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gold-100 flex items-center justify-center text-xs text-gold-700">
                                  +{outfitJewelry.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-ink-400">
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">{outfit.wearCount}次</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wearStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D5A3" />
                    <XAxis dataKey="name" tick={{ fill: '#606060' }} />
                    <YAxis tick={{ fill: '#606060' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFEFC',
                        border: '1px solid #E8D5A3',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#B8860B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-6 border-t border-gold-100">
                <h3 className="font-display text-lg font-bold text-ink-600 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  佩戴频率排行
                </h3>
                <div className="space-y-3">
                  {wearStats.slice(0, 6).map((stat, index) => (
                    <div
                      key={stat.jewelryId}
                      className="flex items-center justify-between p-4 bg-cream-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                              : index === 1
                              ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                              : index === 2
                              ? 'bg-gradient-to-r from-amber-600 to-amber-800'
                              : 'bg-ink-300'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-ink-600">{stat.name}</span>
                      </div>
                      <span className="font-bold text-gold-600">{stat.count} 次</span>
                    </div>
                  ))}
                </div>
              </div>

              {rarelyUsed.length > 0 && (
                <div className="pt-6 border-t border-gold-100">
                  <h3 className="font-display text-lg font-bold text-ruby-500 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    很少佩戴的珠宝
                  </h3>
                  <p className="text-sm text-ink-400 mb-4">这些珠宝佩戴次数少于5次，可以考虑出售或赠送</p>
                  <div className="grid grid-cols-5 gap-4">
                    {rarelyUsed.map((jewelry) => (
                      <div
                        key={jewelry.id}
                        onClick={() => navigate(`/collection/${jewelry.id}`)}
                        className="rounded-xl overflow-hidden border border-gold-100 cursor-pointer card-hover"
                      >
                        <div className="aspect-square bg-cream-50">
                          <img
                            src={jewelry.photos[0]?.url}
                            alt={jewelry.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-ink-600 text-sm truncate">{jewelry.name}</p>
                          <p className="text-xs text-ink-400">仅佩戴 {jewelry.wearCount} 次</p>
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
  );
};

export default OutfitPage;
