import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Swords,
  Target,
  ArrowLeft,
  Layers,
  Zap,
  Info,
  Target as TargetIcon,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { openings, type Opening, type Variation, type Trap } from '@/data/openings';
import ChessBoard from '@/components/ChessBoard';

interface TreeViewProps {
  openings: Opening[];
  selectedOpeningId: string | null;
  onSelectOpening: (opening: Opening) => void;
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
}

function TreeView({
  openings,
  selectedOpeningId,
  onSelectOpening,
  expandedCategories,
  onToggleCategory,
}: TreeViewProps) {
  const categories = useMemo(() => {
    const categoryMap = new Map<string, Opening[]>();
    openings.forEach(opening => {
      if (!categoryMap.has(opening.category)) {
        categoryMap.set(opening.category, []);
      }
      categoryMap.get(opening.category)!.push(opening);
    });
    return Array.from(categoryMap.entries());
  }, [openings]);

  return (
    <div className="h-full overflow-y-auto">
      {categories.map(([category, categoryOpenings]) => {
        const isExpanded = expandedCategories.has(category);

        return (
          <div key={category} className="border-b border-wood-brown-200 last:border-b-0">
            <button
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                "hover:bg-wood-brown-100/50"
              )}
              onClick={() => onToggleCategory(category)}
            >
              <div className="flex items-center gap-2">
                <Layers className="text-wood-brown-600" size={18} />
                <span className="font-semibold text-wood-brown-800">{category}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="text-wood-brown-500" size={16} />
              ) : (
                <ChevronRight className="text-wood-brown-500" size={16} />
              )}
            </button>

            {isExpanded && (
              <div className="animate-fadeIn">
                {categoryOpenings.map(opening => (
                  <button
                    key={opening.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-3 pl-10 text-left transition-all",
                      selectedOpeningId === opening.id
                        ? "bg-wood-brown-600 text-white"
                        : "hover:bg-wood-brown-100 text-wood-brown-700 hover:text-wood-brown-800"
                    )}
                    onClick={() => onSelectOpening(opening)}
                  >
                    <BookOpen size={16} />
                    <span>{opening.name}</span>
                    <span className="ml-auto text-xs opacity-70">
                      {opening.variations.length} 变例
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type TabType = 'variations' | 'traps';

export default function Openings() {
  const navigate = useNavigate();
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('variations');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['王翼开局'])
  );

  const handleToggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSelectOpening = (opening: Opening) => {
    setSelectedOpening(opening);
    setSelectedVariation(opening.variations[0] || null);
    setActiveTab('variations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-500 via-ivory-400 to-ivory-300">
      <header className="bg-gradient-to-r from-wood-brown-700 to-wood-brown-900">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-ivory-100 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回首页</span>
              </button>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">开局库</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden h-[calc(100vh-220px)]">
              <div className="px-4 py-4 border-b border-wood-brown-200">
                <h2 className="font-display font-bold text-xl text-wood-brown-800">
                  开局分类
                </h2>
              </div>
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                <TreeView
                  openings={openings}
                  selectedOpeningId={selectedOpening?.id || null}
                  onSelectOpening={handleSelectOpening}
                  expandedCategories={expandedCategories}
                  onToggleCategory={handleToggleCategory}
                />
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            {selectedOpening ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden">
                <div className="p-6 border-b border-wood-brown-200">
                  <h2 className="text-2xl font-display font-bold text-wood-brown-900 mb-2">
                    {selectedOpening.name}
                  </h2>
                  <p className="text-wood-brown-600 leading-relaxed">
                    {selectedOpening.description}
                  </p>
                </div>

                <div className="flex border-b border-wood-brown-200">
                  <button
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 font-medium transition-colors",
                      activeTab === 'variations'
                        ? "text-wood-brown-800 border-b-2 border-wood-brown-600"
                        : "text-wood-brown-500 hover:text-wood-brown-700"
                    )}
                    onClick={() => setActiveTab('variations')}
                  >
                    <Swords size={18} />
                    <span>开局变例</span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 font-medium transition-colors",
                      activeTab === 'traps'
                        ? "text-wood-brown-800 border-b-2 border-wood-brown-600"
                        : "text-wood-brown-500 hover:text-wood-brown-700"
                    )}
                    onClick={() => setActiveTab('traps')}
                  >
                    <Target size={18} />
                    <span>陷阱专题</span>
                    <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-wood-brown-100 text-wood-brown-600">
                      {selectedOpening.traps.length}
                    </span>
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'variations' ? (
                    <div>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <aside className="lg:col-span-4">
                          <h3 className="font-display font-semibold text-lg text-wood-brown-800 mb-4">
                            变例列表
                          </h3>
                          <div className="space-y-2">
                            {selectedOpening.variations.map(variation => (
                              <button
                                key={variation.id}
                                className={cn(
                                  "w-full text-left p-4 rounded-xl transition-all",
                                  selectedVariation?.id === variation.id
                                    ? "bg-wood-brown-600 text-white"
                                    : "bg-wood-brown-100 hover:bg-wood-brown-200 text-wood-brown-800"
                                )}
                                onClick={() => setSelectedVariation(variation)}
                              >
                                <div className="font-medium">{variation.name}</div>
                              </button>
                            ))}
                          </div>
                        </aside>

                        <div className="lg:col-span-8">
                          {selectedVariation ? (
                            <div>
                              <h3 className="font-display font-semibold text-xl text-wood-brown-800 mb-4">
                                {selectedVariation.name}
                              </h3>

                              <div className="mb-6">
                                <ChessBoard moves={selectedVariation.moves} />
                              </div>

                              <div className="space-y-4">
                                <div className="bg-ivory-100 rounded-xl p-5 border border-wood-brown-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Info className="text-wood-brown-700" size={20} />
                                    <h4 className="font-semibold text-wood-brown-800">
                                      战略说明
                                    </h4>
                                  </div>
                                  <p className="text-wood-brown-700 leading-relaxed">
                                    {selectedVariation.strategy}
                                  </p>
                                </div>

                                <div className="bg-ivory-100 rounded-xl p-5 border border-wood-brown-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TargetIcon className="text-wood-brown-700" size={20} />
                                    <h4 className="font-semibold text-wood-brown-800">
                                      战略目标
                                    </h4>
                                  </div>
                                  <p className="text-wood-brown-700 leading-relaxed">
                                    {selectedVariation.goals}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-64 bg-ivory-100 rounded-xl">
                              <Swords className="text-wood-brown-400 mb-3" size={48} />
                              <p className="text-wood-brown-600">
                                选择一个变例查看详情
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {selectedOpening.traps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-ivory-100 rounded-xl">
                          <Shield className="text-wood-brown-400 mb-3" size={48} />
                          <p className="text-wood-brown-600">
                            该开局暂无陷阱专题
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {selectedOpening.traps.map(trap => (
                            <div
                              key={trap.id}
                              className="bg-ivory-100 rounded-xl border border-wood-brown-200 overflow-hidden"
                            >
                              <div className="p-6 border-b border-wood-brown-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Zap className="text-gold-600" size={24} />
                                  <h4 className="font-display font-semibold text-xl text-wood-brown-800">
                                    {trap.name}
                                  </h4>
                                </div>
                              </div>

                              <div className="p-6">
                                <div className="mb-6">
                                  <ChessBoard moves={trap.moves} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-wood-brown-100 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Info className="text-wood-brown-700" size={18} />
                                      <h5 className="font-semibold text-wood-brown-800">
                                        陷阱描述
                                      </h5>
                                    </div>
                                    <p className="text-wood-brown-700 leading-relaxed">
                                      {trap.description}
                                    </p>
                                  </div>

                                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Shield className="text-emerald-700" size={18} />
                                      <h5 className="font-semibold text-emerald-800">
                                        应对方法
                                      </h5>
                                    </div>
                                    <p className="text-emerald-700 leading-relaxed">
                                      {trap.counterplay}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200">
                <BookOpen className="text-wood-brown-400 mb-4" size={64} />
                <h3 className="text-xl font-display font-semibold text-wood-brown-800 mb-2">
                  选择一个开局
                </h3>
                <p className="text-wood-brown-600">
                  从左侧选择一个开局开始学习
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
