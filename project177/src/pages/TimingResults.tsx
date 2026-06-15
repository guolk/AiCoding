import { useState, useMemo, useEffect } from "react";
import {
  Trophy, RefreshCw, Download, Medal, ArrowUpDown,
  ArrowDown, ArrowUp, Gauge, Timer, Zap, Award,
  AlertCircle, User as UserIcon
} from "lucide-react";
import { useEventStore } from "@/store";
import {
  formatDuration, formatPace, classNames, getMedalColor
} from "@/utils";
import type { Result, Participant, BibNumber, Category } from "@/types";

type TabKey = "overall" | string;
type SortKey =
  | "overall_rank" | "category_rank" | "gun_time" | "net_time"
  | "avg_speed" | "pace";

interface RowData {
  result: Result;
  participant: Participant | undefined;
  bib: BibNumber | undefined;
  category: Category | undefined;
}

const overallTab: { key: TabKey; label: string } = { key: "overall", label: "总成绩榜" };

export default function TimingResults() {
  const {
    results, participants, categories, bibNumbers, calculateResults
  } = useEventStore();

  const [activeTab, setActiveTab] = useState<TabKey>("overall");
  const [sortKey, setSortKey] = useState<SortKey>("overall_rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "info" } | null>(null);

  useEffect(() => {
    if (sortKey === "category_rank") {
      setSortDir("asc");
    }
  }, [activeTab, sortKey]);

  const participantMap = useMemo(() => {
    const m: Record<string, Participant> = {};
    participants.forEach((p) => {
      m[p.id] = p;
    });
    return m;
  }, [participants]);

  const bibByParticipant = useMemo(() => {
    const m: Record<string, BibNumber> = {};
    bibNumbers.forEach((b) => {
      m[b.participant_id] = b;
    });
    return m;
  }, [bibNumbers]);

  const categoryMap = useMemo(() => {
    const m: Record<string, Category> = {};
    categories.forEach((c) => {
      m[c.id] = c;
    });
    return m;
  }, [categories]);

  const tabItems = useMemo(() => {
    const cats = categories.map((c) => ({ key: c.id, label: c.name }));
    return [overallTab, ...cats];
  }, [categories]);

  const getRowRank = (row: RowData, key: TabKey) => {
    if (key === "overall") return row.result.overall_rank;
    return row.result.category_rank;
  };

  const getSortValue = (row: RowData) => {
    switch (sortKey) {
      case "overall_rank":
        return row.result.overall_rank || 999999;
      case "category_rank":
        return row.result.category_rank || 999999;
      case "gun_time":
        return row.result.gun_time_seconds || 999999999;
      case "net_time":
        return row.result.net_time_seconds || 999999999;
      case "avg_speed":
        return -(row.result.avg_speed || 0);
      case "pace":
        return row.result.pace_min_per_km || 999999999;
      default:
        return 0;
    }
  };

  const rows = useMemo(() => {
    const list: RowData[] = [];
    results.forEach((r) => {
      if (activeTab !== "overall" && r.category_id !== activeTab) return;
      list.push({
        result: r,
        participant: participantMap[r.participant_id],
        bib: bibByParticipant[r.participant_id],
        category: categoryMap[r.category_id],
      });
    });

    const finished = list.filter((r) => r.result.status === "finished");
    const unfinished = list.filter((r) => r.result.status !== "finished");

    finished.sort((a, b) => {
      const va = getSortValue(a);
      const vb = getSortValue(b);
      return sortDir === "asc" ? va - vb : vb - va;
    });

    unfinished.sort((a, b) => {
      const sa = a.result.status === "dnf" ? 0 : a.result.status === "dns" ? 1 : 2;
      const sb = b.result.status === "dnf" ? 0 : b.result.status === "dns" ? 1 : 2;
      return sa - sb;
    });

    return [...finished, ...unfinished];
  }, [results, activeTab, participantMap, bibByParticipant, categoryMap, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "avg_speed" ? "desc" : "asc");
    }
  };

  const showToastMsg = (msg: string, type: "ok" | "info" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleRecalc = () => {
    calculateResults();
    showToastMsg("成绩已重新计算 ✓", "ok");
  };

  const handleExport = () => {
    const lines: string[] = [];
    const header = activeTab === "overall"
      ? ["排名", "号码布", "姓名", "性别", "组别", "枪成绩", "净成绩", "平均速度(km/h)", "配速(min/km)", "状态"]
      : ["组别排名", "号码布", "姓名", "性别", "组别", "枪成绩", "净成绩", "平均速度(km/h)", "配速(min/km)", "状态"];
    lines.push(header.join(","));

    rows.forEach((row) => {
      const rank = getRowRank(row, activeTab);
      const p = row.participant;
      const bib = row.bib;
      const r = row.result;
      const bibStr = bib ? `${bib.prefix}${bib.number}` : "";
      const statusStr = r.status === "finished" ? "FINISHED" : r.status === "dnf" ? "DNF" : r.status === "dns" ? "DNS" : "PENDING";
      lines.push([
        r.status === "finished" ? String(rank) : "-",
        bibStr,
        p?.name || "",
        p?.gender === "male" ? "男" : "女",
        row.category?.name || "",
        r.status === "finished" ? formatDuration(r.gun_time_seconds) : "",
        r.status === "finished" ? formatDuration(r.net_time_seconds) : "",
        r.status === "finished" ? String(r.avg_speed) : "",
        r.status === "finished" ? formatPace(r.pace_min_per_km) : "",
        statusStr,
      ].join(","));
    });

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab === "overall" ? "总成绩榜" : categoryMap[activeTab]?.name || "成绩榜"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToastMsg("成绩榜单已导出 CSV", "info");
  };

  const SortHeader = ({ label, sk, className = "" }: { label: string; sk: SortKey; className?: string }) => {
    const active = sortKey === sk;
    return (
      <button
        onClick={() => toggleSort(sk)}
        className={classNames(
          "flex items-center gap-1 hover:text-white transition-colors select-none",
          className
        )}
      >
        <span>{label}</span>
        <span className={classNames(
          "inline-flex",
          active ? "text-green-400" : "text-gray-600"
        )}>
          {!active && <ArrowUpDown className="w-3.5 h-3.5" />}
          {active && sortDir === "asc" && <ArrowUp className="w-3.5 h-3.5" />}
          {active && sortDir === "desc" && <ArrowDown className="w-3.5 h-3.5" />}
        </span>
      </button>
    );
  };

  const renderRank = (row: RowData) => {
    const rank = getRowRank(row, activeTab);
    if (row.result.status !== "finished") {
      return (
        <span className={classNames(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
          row.result.status === "dnf" ? "bg-red-500/15 text-red-400 border border-red-500/30" :
          row.result.status === "dns" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" :
          "bg-gray-500/15 text-gray-400 border border-gray-700"
        )}>
          <AlertCircle className="w-3 h-3" />
          {row.result.status === "dnf" ? "DNF" : row.result.status === "dns" ? "DNS" : "PENDING"}
        </span>
      );
    }

    if (rank === 1 || rank === 2 || rank === 3) {
      return (
        <div className="flex items-center gap-2">
          <Medal
            className="w-7 h-7 drop-shadow-md"
            style={{ color: getMedalColor(rank) }}
            strokeWidth={2}
          />
          <span className="text-2xl font-black" style={{ color: getMedalColor(rank) }}>
            {rank}
          </span>
        </div>
      );
    }

    return (
      <span className="inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg bg-gray-800 text-gray-200 font-bold text-lg">
        {rank}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Trophy className="w-7 h-7 text-yellow-400" />
              成绩榜单
            </h1>
            <p className="text-gray-400 text-sm">展示赛事各组别实时成绩排名</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRecalc}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors border border-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              重新计算成绩
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              导出 CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {categories.map((cat) => {
            const catResults = results.filter((r) => r.category_id === cat.id);
            const finished = catResults.filter((r) => r.status === "finished");
            const dnf = catResults.filter((r) => r.status === "dnf").length;
            const dns = catResults.filter((r) => r.status === "dns").length;
            return (
              <div
                key={cat.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-yellow-500/70" />
                  <div className="text-sm text-gray-300 font-medium truncate">{cat.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-gray-500 mb-0.5">完赛</div>
                    <div className="text-lg font-bold text-green-400">{finished.length}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">DNF</div>
                    <div className="text-lg font-bold text-red-400">{dnf}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">DNS</div>
                    <div className="text-lg font-bold text-yellow-400">{dns}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1 bg-gray-900 border border-gray-800 p-1.5 rounded-xl mb-5 inline-flex">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={classNames(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                activeTab === tab.key
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-950 shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/60 text-gray-300 text-xs uppercase tracking-wider">
                  <th className="px-5 py-4 text-left w-28">
                    <SortHeader
                      label={activeTab === "overall" ? "排名" : "组别排名"}
                      sk={activeTab === "overall" ? "overall_rank" : "category_rank"}
                    />
                  </th>
                  <th className="px-5 py-4 text-left">号码布</th>
                  <th className="px-5 py-4 text-left">姓名</th>
                  <th className="px-5 py-4 text-left">性别</th>
                  <th className="px-5 py-4 text-left">组别</th>
                  <th className="px-5 py-4 text-left">
                    <SortHeader label="枪成绩" sk="gun_time" />
                  </th>
                  <th className="px-5 py-4 text-left">
                    <SortHeader label="净成绩" sk="net_time" />
                  </th>
                  <th className="px-5 py-4 text-left">
                    <SortHeader label="平均速度" sk="avg_speed" />
                  </th>
                  <th className="px-5 py-4 text-left">
                    <SortHeader label="配速" sk="pace" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-20 text-center text-gray-500">
                      <Trophy className="w-14 h-14 mx-auto mb-4 opacity-50" />
                      <div>暂无成绩数据</div>
                      <div className="text-xs mt-2 text-gray-600">请先计时记录选手出发与到达时间</div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const p = row.participant;
                    const bib = row.bib;
                    const cat = row.category;
                    const r = row.result;
                    const finished = r.status === "finished";
                    const rank = getRowRank(row, activeTab);
                    const isTop3 = finished && (rank === 1 || rank === 2 || rank === 3);

                    return (
                      <tr
                        key={r.id}
                        className={classNames(
                          "transition-colors",
                          !finished ? "opacity-60 bg-gray-900/40" :
                          isTop3 ? "bg-gradient-to-r from-yellow-500/5 to-transparent hover:from-yellow-500/10" :
                          "hover:bg-gray-800/40"
                        )}
                      >
                        <td className="px-5 py-3.5">
                          {renderRank(row)}
                        </td>
                        <td className="px-5 py-3.5">
                          {bib ? (
                            <span className={classNames(
                              "inline-block font-mono font-bold px-2 py-1 rounded border",
                              isTop3
                                ? "bg-black border-yellow-500/60 text-yellow-400"
                                : "bg-black border-green-500/50 text-green-400"
                            )}>
                              {bib.prefix}{bib.number}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={classNames(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                              isTop3 ? "bg-yellow-500/15" : "bg-gray-800"
                            )}>
                              <UserIcon className={classNames(
                                "w-4 h-4",
                                isTop3 ? "text-yellow-400" : "text-gray-400"
                              )} />
                            </div>
                            <span className={classNames(
                              "font-semibold",
                              isTop3 ? "text-white" : "text-gray-100"
                            )}>
                              {p?.name || "未知"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={classNames(
                            "font-medium",
                            p?.gender === "male" ? "text-blue-400" : "text-pink-400"
                          )}>
                            {p?.gender === "male" ? "男" : "女"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-300 text-sm">
                          {cat?.name || "-"}
                        </td>
                        <td className="px-5 py-3.5">
                          {finished ? (
                            <span className="font-mono font-bold text-gray-100">
                              {formatDuration(r.gun_time_seconds)}
                            </span>
                          ) : (
                            <span className="text-gray-600">--:--:--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {finished ? (
                            <span className={classNames(
                              "font-mono font-bold",
                              isTop3 ? "text-green-400" : "text-green-400"
                            )}>
                              {formatDuration(r.net_time_seconds)}
                            </span>
                          ) : (
                            <span className="text-gray-600">--:--:--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {finished ? (
                            <div className="flex items-center gap-1.5">
                              <Gauge className="w-3.5 h-3.5 text-blue-400" />
                              <span className="font-mono font-bold text-blue-300">
                                {r.avg_speed.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500">km/h</span>
                            </div>
                          ) : (
                            <span className="text-gray-600">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {finished ? (
                            <div className="flex items-center gap-1.5">
                              <Timer className="w-3.5 h-3.5 text-orange-400" />
                              <span className="font-mono font-bold text-orange-300">
                                {formatPace(r.pace_min_per_km)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-600">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800 bg-gray-900/50 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>
                共 <strong className="text-gray-300">{rows.length}</strong> 名选手
              </span>
              <span className="flex items-center gap-1">
                <Medal className="w-3 h-3" style={{ color: getMedalColor(1) }} /> 冠军
                <Medal className="w-3 h-3 ml-2" style={{ color: getMedalColor(2) }} /> 亚军
                <Medal className="w-3 h-3 ml-2" style={{ color: getMedalColor(3) }} /> 季军
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> DNF 未完成
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400" /> DNS 未出发
              </span>
              <Zap className="w-3.5 h-3.5 text-green-400" />
              <span>点击表头可排序</span>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-green-600 border border-green-400 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
            <Zap className="w-5 h-5 shrink-0" />
            <span className="font-medium">{toast.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
