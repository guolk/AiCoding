import { useState } from "react";
import { Gift, Package, Search, User, Calendar, Hash, Send, PackageCheck } from "lucide-react";
import { useEventStore } from "@/store";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils";
import type { Prize } from "@/types";

export default function AwardsPrizesPage() {
  const {
    prizes,
    prizeDistributions,
    participants,
    bibNumbers,
    distributePrize,
  } = useEventStore();

  const [selectedPrizeId, setSelectedPrizeId] = useState("");
  const [bibInput, setBibInput] = useState("");
  const [operator, setOperator] = useState("");
  const [lookupResult, setLookupResult] = useState<{
    participantId: string;
    name: string;
    bib: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState("");

  const handleLookupBib = () => {
    setLookupError("");
    setLookupResult(null);
    const searchTerm = bibInput.trim().toUpperCase();
    if (!searchTerm) return;

    let found: { participantId: string; name: string; bib: string } | null = null;

    for (const bib of bibNumbers) {
      const fullBib = `${bib.prefix}${bib.number}`;
      const numStr = String(bib.number);
      if (
        fullBib === searchTerm ||
        fullBib.includes(searchTerm) ||
        numStr === searchTerm
      ) {
        const p = participants.find((x) => x.id === bib.participant_id);
        if (p) {
          found = {
            participantId: p.id,
            name: p.name,
            bib: fullBib,
          };
          break;
        }
      }
    }

    if (found) {
      setLookupResult(found);
    } else {
      setLookupError("未找到对应选手");
    }
  };

  const handleDistribute = () => {
    if (!selectedPrizeId || !lookupResult || !operator.trim()) return;
    distributePrize(selectedPrizeId, lookupResult.participantId, operator.trim());
    setSelectedPrizeId("");
    setBibInput("");
    setOperator("");
    setLookupResult(null);
  };

  const selectedPrize = prizes.find((p) => p.id === selectedPrizeId);
  const remaining = selectedPrize
    ? selectedPrize.total_quantity - selectedPrize.distributed
    : 0;

  const getPrizeName = (pid: string) =>
    prizes.find((p) => p.id === pid)?.name || "-";

  const getParticipantInfo = (pid: string) => {
    const p = participants.find((x) => x.id === pid);
    const bib = bibNumbers.find((b) => b.participant_id === pid);
    return {
      name: p?.name || "-",
      bib: bib ? `${bib.prefix}${bib.number}` : "-",
    };
  };

  const totalDistributions = prizeDistributions.length;
  const totalPrizesValue = prizes.reduce(
    (sum, p) => sum + (p.value || 0) * p.distributed,
    0
  );

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            <Gift className="text-racing-green" size={26} />
            奖品发放
          </h1>
          <p className="text-gray-500 mt-1">
            管理奖品库存与发放记录 · 累计发放 {totalDistributions} 件 · 价值{" "}
            <span className="text-racing-green font-mono">¥{totalPrizesValue}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="border border-dark-700 bg-dark-900">
              <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
                <Package size={20} className="text-racing-green" />
                <h2 className="text-lg font-semibold text-white font-display">
                  奖品库存概览
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {prizes.map((prize) => (
                  <PrizeInventoryCard key={prize.id} prize={prize} />
                ))}
              </div>
            </section>

            <section className="border border-dark-700 bg-dark-900">
              <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PackageCheck size={20} className="text-racing-orange" />
                  <h2 className="text-lg font-semibold text-white font-display">
                    发放记录
                  </h2>
                </div>
                <span className="text-xs text-gray-500">
                  共 {prizeDistributions.length} 条
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700 bg-dark-850">
                      <th className="text-left px-5 py-3 text-gray-400 font-medium">
                        奖品名称
                      </th>
                      <th className="text-left px-5 py-3 text-gray-400 font-medium">
                        领取人
                      </th>
                      <th className="text-left px-5 py-3 text-gray-400 font-medium">
                        发放时间
                      </th>
                      <th className="text-left px-5 py-3 text-gray-400 font-medium">
                        操作人
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prizeDistributions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-gray-600"
                        >
                          暂无发放记录
                        </td>
                      </tr>
                    ) : (
                      prizeDistributions
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.distributed_at).getTime() -
                            new Date(a.distributed_at).getTime()
                        )
                        .map((pd) => {
                          const info = getParticipantInfo(pd.participant_id);
                          return (
                            <tr
                              key={pd.id}
                              className="border-b border-dark-800 hover:bg-dark-850/50 transition-colors"
                            >
                              <td className="px-5 py-3 text-white">
                                <div className="flex items-center gap-2">
                                  <Gift
                                    size={14}
                                    className="text-racing-green"
                                  />
                                  {getPrizeName(pd.prize_id)}
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <User size={14} className="text-gray-500" />
                                  <span className="text-white">
                                    {info.name}
                                  </span>
                                  <span className="text-gray-500 font-mono text-xs bg-dark-800 px-2 py-0.5">
                                    {info.bib}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                  <Calendar size={12} />
                                  {formatDateTime(pd.distributed_at)}
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-racing-orange text-xs">
                                  {pd.operator}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="border border-dark-700 bg-dark-900 sticky top-6">
              <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
                <Send size={20} className="text-racing-green" />
                <h2 className="text-lg font-semibold text-white font-display">
                  手动发放
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    选择奖品
                  </label>
                  <select
                    value={selectedPrizeId}
                    onChange={(e) => setSelectedPrizeId(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">请选择奖品</option>
                    {prizes.map((p) => {
                      const rem = p.total_quantity - p.distributed;
                      return (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={rem <= 0}
                        >
                          {p.name} (剩余 {rem}/{p.total_quantity})
                        </option>
                      );
                    })}
                  </select>
                  {selectedPrize && (
                    <div
                      className={cn(
                        "mt-2 p-2 border text-xs",
                        remaining > 0
                          ? "border-racing-green/30 bg-dark-800"
                          : "border-red-500/30 bg-red-500/10"
                      )}
                    >
                      <div className="flex justify-between text-gray-400 mb-1">
                        <span>库存</span>
                        <span
                          className={cn(
                            "font-mono",
                            remaining > 0 ? "text-racing-green" : "text-red-500"
                          )}
                        >
                          {remaining} / {selectedPrize.total_quantity}
                        </span>
                      </div>
                      {selectedPrize.value && (
                        <div className="flex justify-between text-gray-500">
                          <span>单价</span>
                          <span className="font-mono text-racing-orange">
                            ¥{selectedPrize.value}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    号码布查找
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Hash
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="text"
                        value={bibInput}
                        onChange={(e) => setBibInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleLookupBib()
                        }
                        placeholder="输入号码布"
                        className="input-field w-full pl-9"
                      />
                    </div>
                    <button
                      onClick={handleLookupBib}
                      className="px-4 py-2 bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                  {lookupError && (
                    <p className="text-red-500 text-xs mt-2">{lookupError}</p>
                  )}
                  {lookupResult && (
                    <div className="mt-2 p-3 border border-racing-green/40 bg-racing-green/5">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-racing-green" />
                        <span className="text-white font-medium">
                          {lookupResult.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        号码布：
                        <span className="text-racing-green">
                          {lookupResult.bib}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    操作人姓名
                  </label>
                  <input
                    type="text"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="请输入操作人"
                    className="input-field w-full"
                  />
                </div>

                <button
                  onClick={handleDistribute}
                  disabled={
                    !selectedPrizeId ||
                    !lookupResult ||
                    !operator.trim() ||
                    remaining <= 0
                  }
                  className={cn(
                    "w-full py-3 font-semibold transition-all flex items-center justify-center gap-2",
                    !selectedPrizeId ||
                    !lookupResult ||
                    !operator.trim() ||
                    remaining <= 0
                      ? "bg-dark-700 text-gray-600 cursor-not-allowed"
                      : "bg-racing-green text-dark-950 hover:bg-racing-green-light shadow-glow-sm"
                  )}
                >
                  <Send size={18} />
                  确认发放
                </button>

                <div className="pt-3 border-t border-dark-700 space-y-2">
                  <p className="text-xs text-gray-500">发放提示：</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>· 请先核实选手身份后再发放</li>
                    <li>· 每件奖品仅发放一次</li>
                    <li>· 发放记录不可撤销</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
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
        .input-field:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function PrizeInventoryCard({ prize }: { prize: Prize }) {
  const progress =
    prize.total_quantity > 0
      ? (prize.distributed / prize.total_quantity) * 100
      : 0;
  const remaining = prize.total_quantity - prize.distributed;

  return (
    <div className="border border-dark-700 bg-dark-850 p-4 hover:border-dark-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-racing-green/40 bg-racing-green/5 flex items-center justify-center">
            <Gift size={20} className="text-racing-green" />
          </div>
          <div>
            <h3 className="text-white font-medium">{prize.name}</h3>
            {prize.description && (
              <p className="text-gray-500 text-xs mt-0.5">{prize.description}</p>
            )}
          </div>
        </div>
        {prize.value && (
          <div className="text-right">
            <p className="text-xs text-gray-500">单价</p>
            <p className="text-racing-orange font-mono font-semibold">
              ¥{prize.value}
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-0.5">总数</p>
          <p className="text-white font-mono font-semibold text-lg">
            {prize.total_quantity}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-0.5">已发</p>
          <p className="text-racing-green font-mono font-semibold text-lg">
            {prize.distributed}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-0.5">剩余</p>
          <p
            className={cn(
              "font-mono font-semibold text-lg",
              remaining === 0
                ? "text-red-500"
                : remaining < prize.total_quantity * 0.2
                ? "text-racing-orange"
                : "text-white"
            )}
          >
            {remaining}
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-dark-700 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            progress >= 100
              ? "bg-gray-500"
              : "bg-gradient-to-r from-racing-green to-racing-green-light"
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
