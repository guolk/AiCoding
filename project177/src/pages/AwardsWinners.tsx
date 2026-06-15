import { useState, useMemo } from "react";
import { Sparkles, Check, Trophy, Crown, Medal, Award, User, Mic, Clock } from "lucide-react";
import { useEventStore } from "@/store";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/utils";
import type { Winner, Award as AwardType, Participant } from "@/types";

type TabKey = "category" | "overall" | "special";

export default function AwardsWinnersPage() {
  const {
    winners,
    awards,
    categories,
    participants,
    bibNumbers,
    generateWinners,
    markPresented,
  } = useEventStore();

  const [activeTab, setActiveTab] = useState<TabKey>("category");

  const timeline = useMemo(() => {
    const categoryWinners = winners
      .filter((w) => awards.find((a) => a.id === w.award_id)?.type === "category")
      .sort((a, b) => {
        const awardA = awards.find((x) => x.id === a.award_id)!;
        const awardB = awards.find((x) => x.id === b.award_id)!;
        if (awardA.category_id !== awardB.category_id) return (awardA.category_id || "").localeCompare(awardB.category_id || "");
        return awardA.rank_from - awardB.rank_from;
      });

    const overallWinners = winners
      .filter((w) => awards.find((a) => a.id === w.award_id)?.type === "overall")
      .sort((a, b) => {
        const awardA = awards.find((x) => x.id === a.award_id)!;
        const awardB = awards.find((x) => x.id === b.award_id)!;
        return awardA.rank_from - awardB.rank_from;
      });

    const specialWinners = winners
      .filter((w) => awards.find((a) => a.id === w.award_id)?.type === "special")
      .sort((a, b) => a.award_id.localeCompare(b.award_id));

    return [...categoryWinners, ...overallWinners, ...specialWinners];
  }, [winners, awards]);

  const getParticipant = (pid: string) =>
    participants.find((p) => p.id === pid);

  const getBibNumber = (pid: string) => {
    const bib = bibNumbers.find((b) => b.participant_id === pid);
    return bib ? `${bib.prefix}${bib.number}` : "-";
  };

  const getCategoryName = (cid?: string) =>
    categories.find((c) => c.id === cid)?.name || "";

  const categoryPodiums = useMemo(() => {
    return categories
      .map((cat) => {
        const catAwards = awards.filter(
          (a) => a.type === "category" && a.category_id === cat.id
        );
        const top3: (Winner & { participant: Participant; award: AwardType; rank: number })[] = [];
        for (let rank = 1; rank <= 3; rank++) {
          const award = catAwards.find((a) => a.rank_from <= rank && a.rank_to >= rank);
          if (award) {
            const winner = winners.find((w) => w.award_id === award.id);
            if (winner) {
              const p = getParticipant(winner.participant_id);
              if (p) {
                top3.push({ ...winner, participant: p, award, rank });
              }
            }
          }
        }
        return { category: cat, top3 };
      })
      .filter((c) => c.top3.length > 0);
  }, [awards, winners, participants, categories]);

  const overallPodium = useMemo(() => {
    const overallAwards = awards.filter((a) => a.type === "overall");
    const top3: (Winner & { participant: Participant; award: AwardType; rank: number })[] = [];
    for (let rank = 1; rank <= 3; rank++) {
      const award = overallAwards.find((a) => a.rank_from <= rank && a.rank_to >= rank);
      if (award) {
        const winner = winners.find((w) => w.award_id === award.id);
        if (winner) {
          const p = getParticipant(winner.participant_id);
          if (p) {
            top3.push({ ...winner, participant: p, award, rank });
          }
        }
      }
    }
    return top3;
  }, [awards, winners, participants]);

  const specialWinnersList = useMemo(() => {
    return winners
      .filter((w) => {
        const a = awards.find((aw) => aw.id === w.award_id);
        return a?.type === "special";
      })
      .map((w) => ({
        winner: w,
        award: awards.find((a) => a.id === w.award_id)!,
        participant: getParticipant(w.participant_id)!,
      }))
      .filter((x) => x.participant);
  }, [winners, awards, participants]);

  const pendingCount = winners.filter((w) => !w.presented).length;
  const presentedCount = winners.filter((w) => w.presented).length;

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
              <Sparkles className="text-racing-orange" size={26} />
              颁奖典礼流程
            </h1>
            <p className="text-gray-500 mt-1">
              已颁发 {presentedCount} / {winners.length}，剩余 {pendingCount} 项待颁发
            </p>
          </div>
          <button
            onClick={generateWinners}
            className="flex items-center gap-2 px-5 py-2.5 bg-racing-orange text-white font-semibold hover:bg-racing-orange-dark transition-all shadow-glow-orange"
          >
            <Trophy size={18} />
            自动生成获奖名单
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-dark-700 bg-dark-900">
              <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
                <Clock size={20} className="text-racing-green" />
                <h2 className="text-lg font-semibold text-white font-display">
                  颁奖顺序
                </h2>
              </div>
              <div className="p-4 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
                {timeline.length === 0 ? (
                  <p className="text-gray-600 text-sm py-8 text-center">
                    暂无颁奖项，请先生成获奖名单
                  </p>
                ) : (
                  timeline.map((winner, idx) => {
                    const award = awards.find((a) => a.id === winner.award_id);
                    const p = getParticipant(winner.participant_id);
                    if (!award || !p) return null;
                    const isCategory = award.type === "category";
                    const isOverall = award.type === "overall";
                    const isSpecial = award.type === "special";

                    return (
                      <div
                        key={winner.id}
                        className={cn(
                          "relative pl-8 pb-4 border-l-2",
                          idx === timeline.length - 1 ? "border-transparent pb-0" : "border-dark-700"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute left-[-9px] top-0 w-4 h-4 border-2",
                            winner.presented
                              ? "bg-racing-green border-racing-green shadow-glow-sm"
                              : isCategory
                              ? "bg-dark-800 border-blue-500"
                              : isOverall
                              ? "bg-dark-800 border-racing-orange"
                              : "bg-dark-800 border-purple-500"
                          )}
                        >
                          {winner.presented && (
                            <Check size={12} className="text-dark-950 absolute inset-0 m-auto" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "p-3 border transition-all",
                            winner.presented
                              ? "border-racing-green/30 bg-dark-800/60"
                              : "border-dark-700 bg-dark-800 hover:border-racing-green/40"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p
                                className={cn(
                                  "text-xs mb-1",
                                  isCategory
                                    ? "text-blue-400"
                                    : isOverall
                                    ? "text-racing-orange"
                                    : "text-purple-400"
                                )}
                              >
                                {isCategory && getCategoryName(award.category_id)}
                                {isOverall && "全场总成绩"}
                                {isSpecial && "特设奖项"}
                              </p>
                              <h3 className="text-white font-medium text-sm">
                                {award.name}
                              </h3>
                            </div>
                            <span
                              className={cn(
                                "px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                                winner.presented
                                  ? "bg-racing-green/20 text-racing-green border border-racing-green/30"
                                  : "bg-dark-700 text-gray-400 border border-dark-600"
                              )}
                            >
                              {winner.presented ? "已颁发" : "待颁发"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <User size={14} className="text-gray-500" />
                            <span className="text-racing-green font-medium text-sm">
                              {p.name}
                            </span>
                            <span className="text-gray-600 text-xs font-mono">
                              {getBibNumber(p.id)}
                            </span>
                          </div>
                          {winner.presented && winner.presenter && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <Mic size={12} />
                              颁奖人：{winner.presenter}
                            </div>
                          )}
                          {!winner.presented && (
                            <button
                              onClick={() => markPresented(winner.id, "主持人")}
                              className="w-full py-1.5 text-xs font-medium bg-racing-green/10 text-racing-green border border-racing-green/40 hover:bg-racing-green hover:text-dark-950 transition-all"
                            >
                              颁发奖项
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="border border-dark-700 bg-dark-900">
              <div className="flex border-b border-dark-700">
                {(
                  [
                    { key: "category", label: "组别领奖台", icon: Trophy },
                    { key: "overall", label: "总冠军领奖台", icon: Crown },
                    { key: "special", label: "特设奖项", icon: Award },
                  ] as { key: TabKey; label: string; icon: any }[]
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all",
                      activeTab === tab.key
                        ? "text-racing-green bg-dark-800 border-b-2 border-racing-green"
                        : "text-gray-500 hover:text-white hover:bg-dark-800/50"
                    )}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "category" && (
                  <div className="space-y-8">
                    {categoryPodiums.map(({ category, top3 }) => (
                      <div key={category.id}>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <div className="w-1 h-5 bg-racing-green" />
                          {category.name}
                        </h3>
                        <PodiumDisplay top3={top3} getBib={getBibNumber} />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "overall" && (
                  <div>
                    <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                      <Crown size={22} className="text-racing-orange" />
                      全场总成绩领奖台
                    </h3>
                    <PodiumDisplay top3={overallPodium} getBib={getBibNumber} />
                  </div>
                )}

                {activeTab === "special" && (
                  <div className="space-y-3">
                    {specialWinnersList.length === 0 ? (
                      <p className="text-gray-600 text-sm py-8 text-center">
                        暂无特设奖项得主
                      </p>
                    ) : (
                      specialWinnersList.map(({ winner, award, participant }) => (
                        <div
                          key={winner.id}
                          className={cn(
                            "p-4 border transition-all flex items-center justify-between gap-4",
                            winner.presented
                              ? "border-purple-500/30 bg-dark-800"
                              : "border-dark-700 bg-dark-800/60"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 border-2 border-purple-500/50 flex items-center justify-center">
                              <Medal size={24} className="text-purple-400" />
                            </div>
                            <div>
                              <p className="text-purple-400 text-xs mb-1">
                                特设奖项
                              </p>
                              <h4 className="text-white font-medium">
                                {award.name}
                              </h4>
                              {award.description && (
                                <p className="text-gray-500 text-xs mt-1">
                                  {award.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-racing-green font-medium">
                              {participant.name}
                            </p>
                            <p className="text-gray-500 text-xs font-mono">
                              {getBibNumber(participant.id)} ·{" "}
                              {calculateAge(participant.birth_date)}岁
                            </p>
                            {winner.presented && (
                              <div className="flex items-center gap-1 justify-end mt-1">
                                <Check size={12} className="text-racing-green" />
                                <span className="text-xs text-racing-green">
                                  已颁发
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumDisplay({
  top3,
  getBib,
}: {
  top3: (Winner & { participant: Participant; award: AwardType; rank: number })[];
  getBib: (pid: string) => string;
}) {
  const first = top3.find((t) => t.rank === 1);
  const second = top3.find((t) => t.rank === 2);
  const third = top3.find((t) => t.rank === 3);

  const podiumHeights = [
    { rank: 2, height: "h-32", border: "from-gray-300 to-gray-500" },
    { rank: 1, height: "h-48", border: "from-yellow-400 via-yellow-500 to-amber-600" },
    { rank: 3, height: "h-24", border: "from-amber-600 to-amber-800" },
  ];

  const getWinner = (rank: number) =>
    rank === 1 ? first : rank === 2 ? second : third;

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {podiumHeights.map((item) => {
        const w = getWinner(item.rank);
        return (
          <div key={item.rank} className="flex flex-col items-center gap-3">
            {w ? (
              <div className="text-center">
                <p className="text-white font-semibold text-lg">{w.participant.name}</p>
                <p className="text-gray-500 text-xs font-mono mt-1">
                  {getBib(w.participant.id)} · {calculateAge(w.participant.birth_date)}岁
                </p>
              </div>
            ) : (
              <div className="text-gray-600 text-sm">--</div>
            )}
            <div
              className={cn(
                "w-28 flex flex-col items-center justify-end pb-4 relative border-2",
                "bg-gradient-to-b from-dark-800 to-dark-900",
                w ? `shadow-lg` : "",
                "bg-clip-padding"
              )}
              style={{
                height: parseInt(item.height.replace("h-", "").replace(/\D/g, "")) * 4,
                borderImage: `linear-gradient(180deg, var(--tw-gradient-stops)) 1`,
                ...(w ? { boxShadow: `0 0 25px rgba(${item.rank === 1 ? "234,179,8" : item.rank === 2 ? "156,163,175" : "217,119,6"}, 0.25)` } : {}),
              }}
            >
              <div
                className={cn(
                  "absolute -top-3 w-8 h-8 flex items-center justify-center text-lg font-bold border-2",
                  item.rank === 1
                    ? "bg-yellow-500 border-yellow-400 text-dark-950"
                    : item.rank === 2
                    ? "bg-gray-400 border-gray-300 text-dark-950"
                    : "bg-amber-700 border-amber-600 text-white"
                )}
              >
                {item.rank}
              </div>
              <p
                className={cn(
                  "text-xl font-bold font-mono",
                  item.rank === 1
                    ? "text-yellow-400"
                    : item.rank === 2
                    ? "text-gray-300"
                    : "text-amber-500"
                )}
              >
                {w ? "CHAMPION" : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
