import { useState, useEffect, useMemo, useRef } from "react";
import {
  Timer, Flag, CircleDot, Upload, FileText, AlertCircle,
  CheckCircle2, Zap, Hash, User as UserIcon, Play, ArrowRightLeft,
  Info, Database, Clock
} from "lucide-react";
import { useEventStore } from "@/store";
import {
  formatTime, formatDuration, formatDurationWithMs,
  parseCSV, classNames, getTimeDifference
} from "@/utils";
import type { TimeRecord, BibNumber, Participant, Category } from "@/types";

type Mode = "start" | "finish";

export default function TimingRecord() {
  const {
    participants, categories, bibNumbers, timeRecords,
    addStartTime, addFinishTime, importChipCSV
  } = useEventStore();

  const [now, setNow] = useState<Date>(new Date());
  const [mode, setMode] = useState<Mode>("start");
  const [bibInput, setBibInput] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "info" } | null>(null);
  const [importResult, setImportResult] = useState<{ count: number; total: number } | null>(null);
  const [fileProcessing, setFileProcessing] = useState(false);
  const bibInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 50);
    return () => clearInterval(t);
  }, []);

  const bibByFull = useMemo(() => {
    const m: Record<string, { participantId: string; bib: BibNumber }> = {};
    bibNumbers.forEach((b) => {
      const entry = { participantId: b.participant_id, bib: b };
      m[`${b.prefix}${b.number}`] = entry;
      m[String(b.number)] = entry;
      m[`${b.prefix}${b.number}`.toUpperCase()] = entry;
    });
    return m;
  }, [bibNumbers]);

  const bibByParticipant = useMemo(() => {
    const m: Record<string, BibNumber> = {};
    bibNumbers.forEach((b) => {
      m[b.participant_id] = b;
    });
    return m;
  }, [bibNumbers]);

  const participantMap = useMemo(() => {
    const m: Record<string, Participant> = {};
    participants.forEach((p) => {
      m[p.id] = p;
    });
    return m;
  }, [participants]);

  const categoryMap = useMemo(() => {
    const m: Record<string, Category> = {};
    categories.forEach((c) => {
      m[c.id] = c;
    });
    return m;
  }, [categories]);

  const recordRows = useMemo(() => {
    const list: {
      record: TimeRecord;
      participant: Participant | undefined;
      bib: BibNumber | undefined;
      duration: number;
    }[] = [];

    timeRecords.forEach((r) => {
      const participant = participantMap[r.participant_id];
      const bib = bibByParticipant[r.participant_id];
      let duration = 0;
      if (r.start_time && r.finish_time) {
        duration = getTimeDifference(r.start_time, r.finish_time);
      }
      list.push({ record: r, participant, bib, duration });
    });

    return list.sort((a, b) => {
      const at = new Date(a.record.start_time || a.record.finish_time || 0).getTime();
      const bt = new Date(b.record.start_time || b.record.finish_time || 0).getTime();
      return bt - at;
    }).slice(0, 20);
  }, [timeRecords, participantMap, bibByParticipant]);

  const showToastMsg = (msg: string, type: "ok" | "err" | "info" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const lookupParticipant = (val: string) => {
    const q = val.trim().toUpperCase();
    if (!q) return null;
    return bibByFull[q] || bibByFull[val.trim()];
  };

  const processRecord = (forceMode?: Mode) => {
    const val = bibInput.trim();
    if (!val) {
      showToastMsg("请先输入号码布", "err");
      return;
    }
    const entry = lookupParticipant(val);
    if (!entry) {
      showToastMsg(`未找到号码布: ${val}`, "err");
      setBibInput("");
      bibInputRef.current?.focus();
      return;
    }

    const p = participantMap[entry.participantId];
    const effectiveMode = forceMode || mode;
    const isoTime = new Date().toISOString();

    if (effectiveMode === "start") {
      addStartTime(entry.participantId, isoTime, "manual");
      showToastMsg(`${p?.name || "选手"} 出发时间已记录 ✓`);
    } else {
      addFinishTime(entry.participantId, isoTime, "manual");
      const tr = timeRecords.find((r) => r.participant_id === entry.participantId);
      if (tr?.start_time) {
        const d = getTimeDifference(tr.start_time, isoTime);
        showToastMsg(`${p?.name || "选手"} 完赛! 用时 ${formatDuration(d)}`, "ok");
      } else {
        showToastMsg(`${p?.name || "选手"} 到达时间已记录 ✓`);
      }
    }
    setBibInput("");
    bibInputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processRecord();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileProcessing(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const count = importChipCSV(rows);
      setImportResult({ count, total: rows.length });
      showToastMsg(`CSV导入成功: ${count}条记录`, "info");
    } catch (err) {
      console.error(err);
      showToastMsg("CSV解析失败", "err");
    } finally {
      setFileProcessing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const timeDisplay = useMemo(() => {
    const pad = (n: number, w = 2) => String(n).padStart(w, "0");
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const ms = pad(now.getMilliseconds(), 3);
    return { hh, mm, ss, ms };
  }, [now]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Timer className="w-7 h-7 text-green-400" />
            计时记录
          </h1>
          <p className="text-gray-400 text-sm">实时记录选手出发与到达时间，支持手动录入与CSV导入</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-900 to-black border-b border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    实时时钟 (本地时间)
                  </div>
                  <button
                    onClick={() => setMode(mode === "start" ? "finish" : "start")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    切换模式
                  </button>
                </div>

                <div className="text-center py-6">
                  <div className="inline-flex items-baseline gap-1 font-mono font-black text-green-400 tracking-tight">
                    <span className="text-7xl md:text-8xl drop-shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                      {timeDisplay.hh}
                    </span>
                    <span className="text-7xl md:text-8xl text-green-500/60 animate-pulse">:</span>
                    <span className="text-7xl md:text-8xl drop-shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                      {timeDisplay.mm}
                    </span>
                    <span className="text-7xl md:text-8xl text-green-500/60 animate-pulse">:</span>
                    <span className="text-7xl md:text-8xl drop-shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                      {timeDisplay.ss}
                    </span>
                    <span className="text-4xl md:text-5xl text-green-500/60 ml-1">
                      .{timeDisplay.ms}
                    </span>
                  </div>
                </div>

                <div className="mt-6 max-w-xl mx-auto">
                  <div
                    className={classNames(
                      "mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                      mode === "start"
                        ? "bg-green-500/15 text-green-400 border border-green-500/40"
                        : "bg-orange-500/15 text-orange-400 border border-orange-500/40"
                    )}
                  >
                    <Zap className="w-4 h-4" />
                    当前模式：
                    <span className="font-bold">
                      {mode === "start" ? "出发模式" : "到达模式"}
                    </span>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="relative">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                      <input
                        ref={bibInputRef}
                        type="text"
                        value={bibInput}
                        onChange={(e) => setBibInput(e.target.value)}
                        placeholder="输入号码布 (如 ME101 或 101) 回车记录"
                        className="w-full bg-black border-2 border-gray-700 focus:border-green-500 rounded-xl pl-16 pr-5 py-5 text-2xl font-mono font-bold text-green-400 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                        autoFocus
                        autoComplete="off"
                      />
                    </div>
                  </form>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => processRecord("start")}
                      className={classNames(
                        "py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                        mode === "start"
                          ? "bg-green-600 hover:bg-green-500 active:bg-green-700 text-white shadow-lg shadow-green-900/40"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                      )}
                    >
                      <Flag className="w-6 h-6" />
                      出发
                    </button>
                    <button
                      onClick={() => processRecord("finish")}
                      className={classNames(
                        "py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                        mode === "finish"
                          ? "bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white shadow-lg shadow-orange-900/40"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                      )}
                    >
                      <CircleDot className="w-6 h-6" />
                      到达
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-400" />
                  最近计时记录
                </h3>
                <div className="max-h-80 overflow-y-auto -mx-5 -mb-5">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                        <th className="px-5 py-3 text-left">号码布</th>
                        <th className="px-5 py-3 text-left">姓名</th>
                        <th className="px-5 py-3 text-left">出发时间</th>
                        <th className="px-5 py-3 text-left">到达时间</th>
                        <th className="px-5 py-3 text-left">耗时</th>
                        <th className="px-5 py-3 text-left">来源</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {recordRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                            <Timer className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <div className="text-sm">暂无计时记录</div>
                          </td>
                        </tr>
                      ) : (
                        recordRows.map(({ record, participant, bib, duration }) => (
                          <tr key={record.id} className="hover:bg-gray-800/40">
                            <td className="px-5 py-3">
                              {bib ? (
                                <span className="inline-block bg-black border border-green-500/60 text-green-400 font-mono font-bold px-2 py-0.5 rounded text-sm">
                                  {bib.prefix}{bib.number}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <span className="text-white font-medium">
                                  {participant?.name || "未知"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-gray-300 font-mono text-xs">
                              {record.start_time ? formatTime(record.start_time) : (
                                <span className="text-gray-600">未出发</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-300 font-mono text-xs">
                              {record.finish_time ? formatTime(record.finish_time) : (
                                record.dnf ? (
                                  <span className="text-red-400">DNF</span>
                                ) : record.dns ? (
                                  <span className="text-yellow-500">DNS</span>
                                ) : (
                                  <span className="text-gray-600">未到达</span>
                                )
                              )}
                            </td>
                            <td className="px-5 py-3">
                              {duration > 0 ? (
                                <span className="text-green-400 font-mono font-bold">
                                  {formatDuration(duration)}
                                </span>
                              ) : (
                                <span className="text-gray-600">--</span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <span className={classNames(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                record.source === "manual" ? "bg-blue-500/15 text-blue-400" :
                                record.source === "chip" ? "bg-purple-500/15 text-purple-400" :
                                "bg-gray-500/15 text-gray-400"
                              )}>
                                {record.source === "manual" ? "手动" :
                                 record.source === "chip" ? "芯片" : "CSV"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                CSV 导入
              </h3>
              <p className="text-xs text-gray-500 mb-4">导入芯片计时数据文件，批量添加出发/到达时间</p>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-blue-500/60 rounded-xl p-8 text-center cursor-pointer transition-colors mb-4"
              >
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <div className="text-sm text-gray-400 mb-1">
                  {fileProcessing ? "处理中..." : "点击选择CSV文件 或 拖拽到此区域"}
                </div>
                <div className="text-xs text-gray-600">
                  .csv 格式
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {importResult && (
                <div className={classNames(
                  "p-3 rounded-lg flex items-center gap-2 text-sm",
                  importResult.count > 0
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                )}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    共解析 {importResult.total} 行，成功导入 <strong>{importResult.count}</strong> 条记录
                  </span>
                </div>
              )}

              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                  <Info className="w-3.5 h-3.5" />
                  CSV 格式说明
                </div>
                <div className="text-xs text-gray-500 leading-relaxed space-y-1">
                  <p>首行为表头，支持以下列名（任一别名均可）：</p>
                  <ul className="pl-4 space-y-1">
                    <li>号码布：<code className="text-gray-400 bg-black px-1 rounded">bib</code> / <code className="text-gray-400 bg-black px-1 rounded">number</code> / <code className="text-gray-400 bg-black px-1 rounded">chip</code> / <code className="text-gray-400 bg-black px-1 rounded">号码布</code></li>
                    <li>出发时间：<code className="text-gray-400 bg-black px-1 rounded">start_time</code> / <code className="text-gray-400 bg-black px-1 rounded">start</code> / <code className="text-gray-400 bg-black px-1 rounded">出发时间</code></li>
                    <li>到达时间：<code className="text-gray-400 bg-black px-1 rounded">finish_time</code> / <code className="text-gray-400 bg-black px-1 rounded">finish</code> / <code className="text-gray-400 bg-black px-1 rounded">time</code> / <code className="text-gray-400 bg-black px-1 rounded">成绩</code></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-green-400" />
                今日统计
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">已出发</div>
                  <div className="text-2xl font-bold text-green-400">
                    {timeRecords.filter((r) => r.start_time && !r.dns).length}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">已完赛</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {timeRecords.filter((r) => r.finish_time && !r.dnf).length}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">总记录</div>
                  <div className="text-2xl font-bold text-white">
                    {timeRecords.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className={classNames(
            "fixed bottom-6 right-6 z-50 border text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-[fadeIn_0.2s_ease] max-w-sm",
            toast.type === "ok" ? "bg-green-600 border-green-400" :
            toast.type === "err" ? "bg-red-600 border-red-400" :
            "bg-blue-600 border-blue-400"
          )}>
            {toast.type === "ok" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> :
             toast.type === "err" ? <AlertCircle className="w-5 h-5 shrink-0" /> :
             <Info className="w-5 h-5 shrink-0" />}
            <span className="font-medium text-sm break-all">{toast.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
