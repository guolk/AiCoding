import { useState, useMemo, useRef, useEffect } from "react";
import {
  Package, Search, CheckCircle2, Clock, UserRound, Phone as PhoneIcon,
  QrCode, ArrowRight, AlertTriangle, Check, X, Zap
} from "lucide-react";
import { useEventStore } from "@/store";
import { formatDateTime, classNames } from "@/utils";
import type { PickupRecord, Participant, BibNumber, Category } from "@/types";

const OPERATOR_DEFAULT = "当前操作员";

type StatusFilter = "all" | "picked" | "unpicked";

interface RowData {
  participant: Participant;
  bib: BibNumber | undefined;
  pickup: PickupRecord | undefined;
  category: Category | undefined;
}

export default function RegistrationPickup() {
  const {
    participants, categories, bibNumbers, pickupRecords,
    markPickup
  } = useEventStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [quickInput, setQuickInput] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bibByParticipant = useMemo(() => {
    const m: Record<string, BibNumber> = {};
    bibNumbers.forEach((b) => {
      m[b.participant_id] = b;
    });
    return m;
  }, [bibNumbers]);

  const bibByFull = useMemo(() => {
    const m: Record<string, string> = {};
    bibNumbers.forEach((b) => {
      m[`${b.prefix}${b.number}`] = b.participant_id;
      m[String(b.number)] = b.participant_id;
    });
    return m;
  }, [bibNumbers]);

  const pickupMap = useMemo(() => {
    const m: Record<string, PickupRecord> = {};
    pickupRecords.forEach((r) => {
      m[r.participant_id] = r;
    });
    return m;
  }, [pickupRecords]);

  const categoryMap = useMemo(() => {
    const m: Record<string, Category> = {};
    categories.forEach((c) => (m[c.id] = c));
    return m;
  }, [categories]);

  const stats = useMemo(() => {
    let picked = 0;
    let notPicked = 0;
    participants.forEach((p) => {
      const r = pickupMap[p.id];
      if (r?.picked) picked++;
      else notPicked++;
    });
    const total = picked + notPicked;
    const rate = total > 0 ? Math.round((picked / total) * 100) : 0;
    return { picked, notPicked, total, rate };
  }, [participants, pickupMap]);

  const rows: RowData[] = useMemo(() => {
    const list: RowData[] = [];
    participants.forEach((p) => {
      const bib = bibByParticipant[p.id];
      const pickup = pickupMap[p.id];
      const category = categoryMap[p.category_id];

      if (statusFilter === "picked" && !pickup?.picked) return;
      if (statusFilter === "unpicked" && pickup?.picked) return;

      if (search) {
        const s = search.toLowerCase().trim();
        const bibStr = bib ? `${bib.prefix}${bib.number}`.toLowerCase() : "";
        const numStr = bib ? String(bib.number) : "";
        const hit =
          p.name.toLowerCase().includes(s) ||
          bibStr.includes(s) ||
          numStr.includes(s) ||
          p.phone.includes(s);
        if (!hit) return;
      }

      list.push({ participant: p, bib, pickup, category });
    });

    list.sort((a, b) => {
      const pa = a.pickup?.picked ? 1 : 0;
      const pb = b.pickup?.picked ? 1 : 0;
      if (pa !== pb) return pa - pb;
      return new Date(a.participant.registered_at).getTime() - new Date(b.participant.registered_at).getTime();
    });

    return list;
  }, [participants, bibByParticipant, pickupMap, categoryMap, search, statusFilter]);

  const showToastMsg = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const doPickup = (participantId: string, participantName: string) => {
    markPickup(participantId, OPERATOR_DEFAULT);
    showToastMsg(`${participantName} 领取成功 ✓`);
  };

  const handleQuickSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = quickInput.trim();
    if (!q) return;

    const pid = bibByFull[q] || bibByFull[q.toUpperCase()];
    if (pid) {
      const p = participants.find((x) => x.id === pid);
      const r = pickupMap[pid];
      if (r?.picked) {
        showToastMsg(`${p?.name || "选手"} 已领取过`, "err");
      } else {
        doPickup(pid, p?.name || "选手");
      }
    } else {
      showToastMsg(`未找到号码布: ${q}`, "err");
    }
    setQuickInput("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Package className="w-7 h-7 text-green-400" />
            参赛包领取核销
          </h1>
          <p className="text-gray-400 text-sm">快速核销参赛者的参赛包领取状态</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-xs text-green-400 uppercase tracking-wider mb-2">已领取</div>
                <div className="text-4xl font-black text-green-400">{stats.picked}</div>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-400/40" />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">未领取</div>
                <div className="text-4xl font-black text-gray-300">{stats.notPicked}</div>
              </div>
              <Clock className="w-10 h-10 text-gray-500/40" />
            </div>
          </div>
          <div className="bg-gray-900 border border-orange-500/30 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-xs text-orange-400 uppercase tracking-wider mb-2">领取率</div>
                <div className="text-4xl font-black text-orange-400">{stats.rate}<span className="text-2xl">%</span></div>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin-slow" style={{ animation: "spin 15s linear infinite" }} />
            </div>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="搜索姓名 / 号码布 / 手机号..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
              >
                <option value="all">全部状态</option>
                <option value="picked">已领取</option>
                <option value="unpicked">未领取</option>
              </select>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800/50 text-gray-300 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">号码布</th>
                      <th className="px-4 py-3 text-left">姓名</th>
                      <th className="px-4 py-3 text-left">组别</th>
                      <th className="px-4 py-3 text-left">联系电话</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-left">领取时间</th>
                      <th className="px-4 py-3 text-left">操作人</th>
                      <th className="px-4 py-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <div>暂无数据</div>
                        </td>
                      </tr>
                    ) : (
                      rows.map(({ participant, bib, pickup, category }) => {
                        const picked = pickup?.picked;
                        return (
                          <tr
                            key={participant.id}
                            className={classNames(
                              "transition-colors",
                              picked ? "bg-green-500/5 hover:bg-green-500/10" : "hover:bg-gray-800/40"
                            )}
                          >
                            <td className="px-4 py-3">
                              {bib ? (
                                <span className="inline-block bg-black border-2 border-green-500 text-green-400 font-mono font-bold px-2 py-0.5 rounded">
                                  {bib.prefix}{bib.number}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                                  <UserRound className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <span className={classNames(
                                  "font-medium",
                                  picked ? "text-green-300" : "text-white"
                                )}>
                                  {participant.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-300">{category?.name || "-"}</td>
                            <td className="px-4 py-3 text-gray-300 font-mono flex items-center gap-1.5">
                              <PhoneIcon className="w-3.5 h-3.5 text-gray-500" />
                              {participant.phone}
                            </td>
                            <td className="px-4 py-3">
                              {picked ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30">
                                  <Check className="w-3 h-3" />
                                  已领取
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-700">
                                  <Clock className="w-3 h-3" />
                                  未领取
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {picked && pickup?.picked_at ? formatDateTime(pickup.picked_at) : "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {picked && pickup?.operator ? pickup.operator : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {!picked ? (
                                <button
                                  onClick={() => doPickup(participant.id, participant.name)}
                                  className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ml-auto transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  核销领取
                                </button>
                              ) : (
                                <span className="text-green-400/60 text-xs">✓ 已核销</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  快速核销
                </h3>
                <span className="text-xs text-gray-500">扫码 / 手动</span>
              </div>

              <form onSubmit={handleQuickSubmit}>
                <div className="relative mb-3">
                  <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="输入号码布数字回车核销"
                    className="w-full bg-black border-2 border-green-500/50 rounded-xl pl-12 pr-12 py-4 text-lg text-green-400 font-mono font-bold placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>

              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-400 mb-2">使用说明</div>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">›</span>
                    直接输入号码布数字部分（如 <span className="text-gray-300 font-mono">101</span>）
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">›</span>
                    也可输入完整号码布（如 <span className="text-gray-300 font-mono">ME101</span>）
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">›</span>
                    按 <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Enter</kbd> 立即核销
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">›</span>
                    支持扫码枪快速输入
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">今日已核销</span>
                  <span className="text-green-400 font-bold text-lg">{stats.picked}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">剩余待领</span>
                  <span className="text-orange-400 font-bold text-lg">{stats.notPicked}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className={classNames(
            "fixed bottom-6 right-6 z-50 border text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-[fadeIn_0.2s_ease]",
            toast.type === "ok"
              ? "bg-green-600 border-green-400"
              : "bg-red-600 border-red-400"
          )}>
            {toast.type === "ok" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
