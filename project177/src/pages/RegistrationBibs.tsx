import { useState, useMemo } from "react";
import {
  Tag, RefreshCw, Check, Hash, User as UserIcon, Clock,
  AlertCircle, Edit3, Save, X
} from "lucide-react";
import { useEventStore } from "@/store";
import { formatDateTime, classNames } from "@/utils";
import type { Category, BibNumber, Participant } from "@/types";

type TabKey = "all" | string;

export default function RegistrationBibs() {
  const {
    participants, categories, bibNumbers,
    assignBibNumbers, updateBibNumber
  } = useEventStore();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [editingBibId, setEditingBibId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [toast, setToast] = useState("");

  const categoryMap = useMemo(() => {
    const m: Record<string, Category> = {};
    categories.forEach((c) => (m[c.id] = c));
    return m;
  }, [categories]);

  const participantMap = useMemo(() => {
    const m: Record<string, Participant> = {};
    participants.forEach((p) => (m[p.id] = p));
    return m;
  }, [participants]);

  const bibMap = useMemo(() => {
    const m: Record<string, BibNumber> = {};
    bibNumbers.forEach((b) => {
      m[b.participant_id] = b;
    });
    return m;
  }, [bibNumbers]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { assigned: number; total: number }> = {};
    categories.forEach((cat) => {
      const inCat = participants.filter((p) => p.category_id === cat.id);
      const assigned = inCat.filter((p) => bibMap[p.id]);
      stats[cat.id] = { assigned: assigned.length, total: inCat.length };
    });
    return stats;
  }, [participants, categories, bibMap]);

  const sortedRows = useMemo(() => {
    let rows: { bib: BibNumber; participant: Participant; order: number }[] = [];

    let cats = categories;
    if (activeTab !== "all") {
      cats = categories.filter((c) => c.id === activeTab);
    }

    for (const cat of cats) {
      const catParticipants = participants
        .filter((p) => p.category_id === cat.id)
        .sort((a, b) => new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime());

      catParticipants.forEach((p, idx) => {
        const bib = bibMap[p.id];
        if (bib) {
          rows.push({ bib, participant: p, order: idx + 1 });
        }
      });
    }

    return rows.sort((a, b) => {
      const catDiff = a.bib.prefix.localeCompare(b.bib.prefix);
      if (catDiff !== 0) return catDiff;
      return a.bib.number - b.bib.number;
    });
  }, [activeTab, participants, categories, bibMap]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleReassign = () => {
    if (confirm("确定要重新自动分配所有号码布吗？这将覆盖现有分配。")) {
      assignBibNumbers();
      showToast("已重新分配所有号码布");
    }
  };

  const startEdit = (bib: BibNumber) => {
    setEditingBibId(bib.id);
    setEditingValue(String(bib.number));
  };

  const cancelEdit = () => {
    setEditingBibId(null);
    setEditingValue("");
  };

  const saveEdit = () => {
    if (!editingBibId) return;
    const num = parseInt(editingValue, 10);
    if (!num || num <= 0) {
      showToast("请输入有效的数字");
      return;
    }
    updateBibNumber(editingBibId, num);
    showToast("号码布已更新");
    setEditingBibId(null);
    setEditingValue("");
  };

  const tabItems: { key: TabKey; label: string }[] = [
    { key: "all", label: "所有" },
    ...categories.map((c) => ({ key: c.id, label: c.name })),
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Tag className="w-7 h-7 text-green-400" />
            号码布分配
          </h1>
          <p className="text-gray-400 text-sm">管理参赛者号码布分配，支持自动与手动调整</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {categories.map((cat) => {
            const stat = categoryStats[cat.id];
            const pct = stat.total > 0 ? Math.round((stat.assigned / stat.total) * 100) : 0;
            const done = stat.assigned === stat.total && stat.total > 0;
            return (
              <div
                key={cat.id}
                className={classNames(
                  "bg-gray-900 border rounded-lg p-4 relative overflow-hidden",
                  done ? "border-green-500/30" : "border-gray-800"
                )}
              >
                {done && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-black border border-green-500/50 text-green-400 font-mono text-xs px-1.5 py-0.5 rounded">
                    {cat.bib_prefix}
                  </span>
                  <div className="text-sm text-gray-300 truncate">{cat.name}</div>
                </div>
                <div className="text-xs text-gray-500 mb-1">分配进度</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{stat.assigned}</span>
                  <span className="text-gray-500">/ {stat.total}</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={classNames(
                      "h-full rounded-full transition-all",
                      done ? "bg-green-500" : "bg-green-500/70"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">{pct}%</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1 bg-gray-900 border border-gray-800 p-1 rounded-lg">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={classNames(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleReassign}
            className="bg-orange-600 hover:bg-orange-500 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重新自动分配
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50 text-gray-300 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left w-56">号码布</th>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="px-4 py-3 text-left">组别</th>
                  <th className="px-4 py-3 text-left">报名时间</th>
                  <th className="px-4 py-3 text-left">分配顺序</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                      <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <div>暂无号码布分配数据</div>
                    </td>
                  </tr>
                ) : (
                  sortedRows.map(({ bib, participant, order }) => {
                    const cat = categoryMap[bib.category_id];
                    const isEditing = editingBibId === bib.id;
                    return (
                      <tr key={bib.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-black border border-orange-500/50 text-orange-400 font-mono text-sm px-2 py-1 rounded">
                                {bib.prefix}
                              </span>
                              <input
                                type="number"
                                autoFocus
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape") cancelEdit();
                                }}
                                className="w-24 bg-gray-800 border border-orange-500 rounded px-2 py-1 text-white font-mono font-bold text-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                              />
                              <button
                                onClick={saveEdit}
                                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                                title="保存"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 text-gray-400 hover:bg-gray-700 rounded transition-colors"
                                title="取消"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(bib)}
                              className="group relative"
                              title="点击编辑号码"
                            >
                              <div className="relative bg-black rounded-lg px-4 py-2 inline-flex items-center gap-0 overflow-hidden border border-gray-700 shadow-lg">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-green-600" />
                                <div className="pl-2 font-mono font-black text-green-400 text-3xl tracking-wider select-none">
                                  {bib.prefix}
                                  <span className="text-white">{bib.number}</span>
                                </div>
                                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-green-600" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                                <Edit3 className="w-5 h-5 text-white" />
                              </div>
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{participant.name}</div>
                              <div className={classNames(
                                "text-xs",
                                participant.gender === "male" ? "text-blue-400" : "text-pink-400"
                              )}>
                                {participant.gender === "male" ? "男" : "女"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300">{cat?.name || "-"}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(participant.registered_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-gray-300 text-sm font-medium">
                            #{order}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 border border-green-500/50 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
            <AlertCircle className="w-4 h-4 text-green-400" />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
