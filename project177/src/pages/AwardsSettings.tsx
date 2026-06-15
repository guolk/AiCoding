import { useState } from "react";
import { Plus, Edit2, Trash2, X, Trophy, Gift, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useEventStore } from "@/store";
import { cn } from "@/lib/utils";
import type { Award as AwardType, Prize as PrizeType } from "@/types";

const AWARD_TYPES = [
  { value: "category", label: "组别奖项" },
  { value: "overall", label: "总成绩奖项" },
  { value: "special", label: "特设奖项" },
];

export default function AwardsSettingsPage() {
  const {
    awards,
    categories,
    prizes,
    addAward,
    updateAward,
    deleteAward,
    addPrize,
  } = useEventStore();

  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [editingAward, setEditingAward] = useState<AwardType | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [awardForm, setAwardForm] = useState({
    name: "",
    type: "category" as AwardType["type"],
    category_id: categories[0]?.id || "",
    rank_from: 1,
    rank_to: 3,
    prize_id: "",
    description: "",
  });

  const [prizeForm, setPrizeForm] = useState({
    name: "",
    description: "",
    total_quantity: 10,
  });

  const handleOpenAwardModal = (award?: AwardType) => {
    if (award) {
      setEditingAward(award);
      setAwardForm({
        name: award.name,
        type: award.type,
        category_id: award.category_id || categories[0]?.id || "",
        rank_from: award.rank_from,
        rank_to: award.rank_to,
        prize_id: award.prize_id || "",
        description: award.description || "",
      });
    } else {
      setEditingAward(null);
      setAwardForm({
        name: "",
        type: "category",
        category_id: categories[0]?.id || "",
        rank_from: 1,
        rank_to: 3,
        prize_id: "",
        description: "",
      });
    }
    setShowAwardModal(true);
  };

  const handleSubmitAward = () => {
    if (!awardForm.name.trim()) return;

    const payload = {
      name: awardForm.name,
      type: awardForm.type,
      category_id: awardForm.type === "category" ? awardForm.category_id : undefined,
      rank_from: awardForm.type === "special" ? 1 : awardForm.rank_from,
      rank_to: awardForm.type === "special" ? 1 : awardForm.rank_to,
      prize_id: awardForm.prize_id || undefined,
      description: awardForm.description,
    };

    if (editingAward) {
      updateAward(editingAward.id, payload);
    } else {
      addAward(payload);
    }
    setShowAwardModal(false);
  };

  const handleSubmitPrize = () => {
    if (!prizeForm.name.trim()) return;
    addPrize({
      name: prizeForm.name,
      description: prizeForm.description,
      total_quantity: prizeForm.total_quantity,
      distributed: 0,
    });
    setShowPrizeModal(false);
    setPrizeForm({ name: "", description: "", total_quantity: 10 });
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const categoryAwards = awards.filter((a) => a.type === "category");
  const overallAwards = awards.filter((a) => a.type === "overall");
  const specialAwards = awards.filter((a) => a.type === "special");

  const getPrizeName = (prizeId?: string) => {
    if (!prizeId) return "-";
    return prizes.find((p) => p.id === prizeId)?.name || "-";
  };

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white font-display">奖项设置</h1>
            <p className="text-gray-500 mt-1">管理赛事奖项与奖品配置</p>
          </div>
          <button
            onClick={() => handleOpenAwardModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-racing-green text-dark-950 font-semibold hover:bg-racing-green-light transition-all shadow-glow-sm"
          >
            <Plus size={18} />
            添加奖项
          </button>
        </div>

        <div className="space-y-6">
          <Section title="组别奖项" icon={<Trophy size={20} />}>
            <div className="space-y-3">
              {categories.map((cat) => {
                const catAwards = categoryAwards.filter((a) => a.category_id === cat.id);
                const isExpanded = expandedCategories[cat.id] ?? true;
                return (
                  <div
                    key={cat.id}
                    className="border border-dark-700 bg-dark-900"
                  >
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-racing-green" />
                        <span className="text-white font-medium">{cat.name}</span>
                        <span className="text-xs text-gray-500">
                          {catAwards.length} 个奖项
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-dark-700 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catAwards.length === 0 ? (
                          <p className="col-span-full text-gray-600 text-sm py-4 text-center">
                            暂无奖项
                          </p>
                        ) : (
                          catAwards.map((award) => (
                            <AwardCard
                              key={award.id}
                              award={award}
                              prizeName={getPrizeName(award.prize_id)}
                              onEdit={() => handleOpenAwardModal(award)}
                              onDelete={() => deleteAward(award.id)}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="总成绩奖项" icon={<Award size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {overallAwards.length === 0 ? (
                <p className="col-span-full text-gray-600 text-sm py-8 text-center border border-dark-700 bg-dark-900">
                  暂无奖项
                </p>
              ) : (
                overallAwards.map((award) => (
                  <AwardCard
                    key={award.id}
                    award={award}
                    prizeName={getPrizeName(award.prize_id)}
                    onEdit={() => handleOpenAwardModal(award)}
                    onDelete={() => deleteAward(award.id)}
                  />
                ))
              )}
            </div>
          </Section>

          <Section title="特设奖项" icon={<Award size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {specialAwards.length === 0 ? (
                <p className="col-span-full text-gray-600 text-sm py-8 text-center border border-dark-700 bg-dark-900">
                  暂无奖项
                </p>
              ) : (
                specialAwards.map((award) => (
                  <AwardCard
                    key={award.id}
                    award={award}
                    prizeName={getPrizeName(award.prize_id)}
                    onEdit={() => handleOpenAwardModal(award)}
                    onDelete={() => deleteAward(award.id)}
                  />
                ))
              )}
            </div>
          </Section>

          <Section
            title="奖品管理"
            icon={<Gift size={20} />}
            action={
              <button
                onClick={() => setShowPrizeModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-racing-green text-racing-green hover:bg-racing-green hover:text-dark-950 transition-all text-sm font-medium"
              >
                <Plus size={16} />
                添加奖品
              </button>
            }
          >
            <div className="space-y-3">
              {prizes.map((prize) => (
                <PrizeCard key={prize.id} prize={prize} />
              ))}
            </div>
          </Section>
        </div>

        {showAwardModal && (
          <Modal
            title={editingAward ? "编辑奖项" : "添加奖项"}
            onClose={() => setShowAwardModal(false)}
            onSubmit={handleSubmitAward}
          >
            <div className="space-y-4">
              <FormField label="奖项名称">
                <input
                  type="text"
                  value={awardForm.name}
                  onChange={(e) =>
                    setAwardForm({ ...awardForm, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="请输入奖项名称"
                />
              </FormField>
              <FormField label="奖项类型">
                <select
                  value={awardForm.type}
                  onChange={(e) =>
                    setAwardForm({
                      ...awardForm,
                      type: e.target.value as AwardType["type"],
                    })
                  }
                  className="input-field"
                >
                  {AWARD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </FormField>
              {awardForm.type === "category" && (
                <FormField label="适用组别">
                  <select
                    value={awardForm.category_id}
                    onChange={(e) =>
                      setAwardForm({ ...awardForm, category_id: e.target.value })
                    }
                    className="input-field"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
              {awardForm.type !== "special" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="排名从">
                    <input
                      type="number"
                      min={1}
                      value={awardForm.rank_from}
                      onChange={(e) =>
                        setAwardForm({
                          ...awardForm,
                          rank_from: parseInt(e.target.value) || 1,
                        })
                      }
                      className="input-field"
                    />
                  </FormField>
                  <FormField label="排名到">
                    <input
                      type="number"
                      min={awardForm.rank_from}
                      value={awardForm.rank_to}
                      onChange={(e) =>
                        setAwardForm({
                          ...awardForm,
                          rank_to: parseInt(e.target.value) || 1,
                        })
                      }
                      className="input-field"
                    />
                  </FormField>
                </div>
              )}
              <FormField label="关联奖品">
                <select
                  value={awardForm.prize_id}
                  onChange={(e) =>
                    setAwardForm({ ...awardForm, prize_id: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">不关联</option>
                  {prizes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="奖项描述">
                <textarea
                  value={awardForm.description}
                  onChange={(e) =>
                    setAwardForm({ ...awardForm, description: e.target.value })
                  }
                  className="input-field resize-none h-20"
                  placeholder="请输入奖项描述"
                />
              </FormField>
            </div>
          </Modal>
        )}

        {showPrizeModal && (
          <Modal
            title="添加奖品"
            onClose={() => setShowPrizeModal(false)}
            onSubmit={handleSubmitPrize}
          >
            <div className="space-y-4">
              <FormField label="奖品名称">
                <input
                  type="text"
                  value={prizeForm.name}
                  onChange={(e) =>
                    setPrizeForm({ ...prizeForm, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="请输入奖品名称"
                />
              </FormField>
              <FormField label="总数量">
                <input
                  type="number"
                  min={1}
                  value={prizeForm.total_quantity}
                  onChange={(e) =>
                    setPrizeForm({
                      ...prizeForm,
                      total_quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="input-field"
                />
              </FormField>
              <FormField label="奖品描述">
                <textarea
                  value={prizeForm.description}
                  onChange={(e) =>
                    setPrizeForm({ ...prizeForm, description: e.target.value })
                  }
                  className="input-field resize-none h-20"
                  placeholder="请输入奖品描述"
                />
              </FormField>
            </div>
          </Modal>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: #111111;
          border: 1px solid #333333;
          color: #ffffff;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #00d26a;
          box-shadow: 0 0 10px rgba(0, 210, 106, 0.2);
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-dark-700 bg-dark-900">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="text-racing-green">{icon}</div>
          <h2 className="text-lg font-semibold text-white font-display">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function AwardCard({
  award,
  prizeName,
  onEdit,
  onDelete,
}: {
  award: AwardType;
  prizeName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border border-dark-700 bg-dark-850 p-4 hover:border-racing-green/40 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{award.name}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-racing-green hover:bg-dark-700 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-dark-700 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>排名范围</span>
          <span className="text-racing-green font-mono">
            {award.rank_from === award.rank_to
              ? `第${award.rank_from}名`
              : `第${award.rank_from}-${award.rank_to}名`}
          </span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>关联奖品</span>
          <span className="text-white">{prizeName}</span>
        </div>
      </div>
    </div>
  );
}

function PrizeCard({ prize }: { prize: PrizeType }) {
  const progress = prize.total_quantity > 0
    ? (prize.distributed / prize.total_quantity) * 100
    : 0;
  const remaining = prize.total_quantity - prize.distributed;

  return (
    <div className="border border-dark-700 bg-dark-850 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{prize.name}</h3>
          {prize.description && (
            <p className="text-gray-500 text-xs mt-1">{prize.description}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">总数</p>
          <p className="text-white font-mono font-semibold mt-0.5">
            {prize.total_quantity}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">已发放</p>
          <p className="text-racing-green font-mono font-semibold mt-0.5">
            {prize.distributed}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">剩余</p>
          <p
            className={cn(
              "font-mono font-semibold mt-0.5",
              remaining === 0 ? "text-red-500" : "text-racing-orange"
            )}
          >
            {remaining}
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-dark-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-racing-green to-racing-green-light transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  onSubmit,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-dark-900 border border-dark-700 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-white font-display">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-dark-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-dark-600 text-gray-300 hover:bg-dark-800 transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            className="px-5 py-2 bg-racing-green text-dark-950 font-semibold hover:bg-racing-green-light transition-all"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
