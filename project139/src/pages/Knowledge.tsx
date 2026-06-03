import { useState, useRef } from 'react';
import { BookOpen, Search, ChevronRight, ChevronDown, Link2, CheckCircle2 } from 'lucide-react';
import type { KnowledgeItem } from '@/types';
import { useAppStore } from '@/store';

const CATEGORY_COLORS: Record<string, string> = {
  '急救操作': 'bg-red-100 text-red-700',
  '创伤处理': 'bg-amber-100 text-amber-700',
  '药品知识': 'bg-blue-100 text-blue-700',
};

const CATEGORIES = ['全部', '急救操作', '创伤处理', '药品知识'] as const;

export default function Knowledge() {
  const { firstAidItems, medicines, knowledgeItems } = useAppStore();
  const [activeTab, setActiveTab] = useState<'association' | 'library'>('association');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allItems = [
    ...firstAidItems.map(i => ({ id: i.id, name: i.name })),
    ...medicines.map(i => ({ id: i.id, name: i.name })),
  ];

  const relatedKnowledge = selectedItemId
    ? knowledgeItems.filter(k => k.relatedItemIds.includes(selectedItemId))
    : [];

  const filteredKnowledge = knowledgeItems.filter(k => {
    const matchSearch = appliedSearch
      ? k.title.includes(appliedSearch) || k.content.includes(appliedSearch)
      : true;
    const matchCategory = activeCategory === '全部' || k.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleSearch = () => {
    setAppliedSearch(searchQuery.trim());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRelatedItemName = (id: string) => {
    const item = allItems.find(i => i.id === id);
    return item?.name ?? id;
  };

  const renderCategoryBadge = (category: string) => (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700'}`}>
      {category}
    </span>
  );

  const renderSteps = (steps: string[], max?: number, style: 'number' | 'check' = 'number') => {
    const display = max ? steps.slice(0, max) : steps;
    return display.map((step, idx) => (
      <div key={idx} className="flex items-start gap-2">
        {style === 'check' ? (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: '#0D7377' }} />
        ) : (
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-medium"
            style={{ backgroundColor: '#0D7377' }}
          >
            {idx + 1}
          </span>
        )}
        <span className="text-sm text-gray-700">{step}</span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={28} style={{ color: '#0D7377' }} />
          <h1 className="text-2xl font-bold text-gray-900">知识关联</h1>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('association')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'association' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            知识关联
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'library' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            急救知识库
          </button>
        </div>

        {activeTab === 'association' && (
          <div className="grid grid-cols-[300px_1fr] gap-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-100 font-medium text-gray-700 text-sm">物品列表</div>
              <div className="max-h-[600px] overflow-y-auto">
                {allItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 text-sm border-b border-gray-50 transition-colors ${
                      selectedItemId === item.id ? 'bg-teal-50 text-teal-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    {selectedItemId === item.id && <ChevronRight size={16} className="shrink-0" style={{ color: '#0D7377' }} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {!selectedItemId ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                  <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                  <p>请从左侧选择一个物品查看关联知识</p>
                </div>
              ) : relatedKnowledge.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                  <Link2 size={48} className="mx-auto mb-3 opacity-30" />
                  <p>暂无关联知识</p>
                </div>
              ) : (
                relatedKnowledge.map(item => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {renderCategoryBadge(item.category)}
                      <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{item.content}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">操作步骤</p>
                      {renderSteps(item.steps, undefined, 'check')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="搜索知识..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: '#0D7377' }}
              >
                <Search size={16} />
                搜索
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={activeCategory === cat ? { backgroundColor: '#0D7377' } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filteredKnowledge.map(item => {
                const isExpanded = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {renderCategoryBadge(item.category)}
                          <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                        </div>
                        {isExpanded ? (
                          <ChevronDown size={18} className="text-gray-400 shrink-0" />
                        ) : (
                          <ChevronRight size={18} className="text-gray-400 shrink-0" />
                        )}
                      </div>

                      <p className={`text-sm text-gray-600 mb-3 ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {item.content}
                      </p>

                      {isExpanded ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">操作步骤</p>
                            <div className="space-y-2">
                              {renderSteps(item.steps, undefined, 'check')}
                            </div>
                          </div>
                          {item.relatedItemIds.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">关联物品</p>
                              <div className="flex flex-wrap gap-2">
                                {item.relatedItemIds.map(rid => (
                                  <span
                                    key={rid}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
                                    style={{ backgroundColor: '#FF6B35' }}
                                  >
                                    <Link2 size={12} />
                                    {getRelatedItemName(rid)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {item.steps.slice(0, 2).map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span
                                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ backgroundColor: '#0D7377' }}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-sm text-gray-600 truncate">{step}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: '#FF6B35', color: '#fff' }}
                            >
                              <Link2 size={10} />
                              {item.relatedItemIds.length} 个关联
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredKnowledge.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                <p>没有找到匹配的知识</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
