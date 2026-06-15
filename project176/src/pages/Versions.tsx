import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, Bug, Edit, Star, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/store";
import type { GameVersion } from "@/types";
import Modal from "@/components/Modal";

export default function Versions() {
  const navigate = useNavigate();
  const versions = useStore((s) => s.versions);
  const [selected, setSelected] = useState<GameVersion | null>(null);

  const sorted = [...versions].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">版本管理</h1>
        <button className="neon-btn-primary" onClick={() => navigate("/versions/new")}>
          <Plus className="w-4 h-4 mr-1.5" />
          新增版本
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          暂无版本记录，点击"新增版本"开始
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-neon-green/30" />

          <div className="space-y-6">
            {sorted.map((v) => {
              const completedCount = v.releaseChecklist.filter((c) => c.completed).length;
              const totalCount = v.releaseChecklist.length;
              const avgRating =
                v.userFeedbacks.length > 0
                  ? v.userFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
                    v.userFeedbacks.length
                  : 0;
              const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <div key={v.id} className="relative flex gap-5">
                  <div className="absolute -left-8 top-6 flex items-center justify-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        v.isMilestone
                          ? "bg-neon-green border-neon-green shadow-neon"
                          : "bg-base-800 border-gray-500"
                      }`}
                    />
                  </div>

                  <div
                    className="flex-1 glass-card-hover p-5 cursor-pointer"
                    onClick={() => setSelected(v)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg text-neon-green font-semibold">
                          v{v.versionNumber}
                        </span>
                        {v.isMilestone && (
                          <span className="badge-green">{v.milestoneLabel || "里程碑"}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">
                          {format(new Date(v.releaseDate), "yyyy-MM-dd")}
                        </span>
                        <button
                          className="neon-btn p-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/versions/${v.id}`);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {v.newFeatures.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 uppercase font-mono mb-1.5">
                          新增功能
                        </div>
                        <ul className="space-y-1">
                          {v.newFeatures.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <Check className="w-3.5 h-3.5 text-neon-green mt-0.5 shrink-0" />
                              {f}
                            </li>
                          ))}
                          {v.newFeatures.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{v.newFeatures.length - 3} 项更多
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {v.fixedBugs.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 uppercase font-mono mb-1.5">
                          修复Bug
                        </div>
                        <ul className="space-y-1">
                          {v.fixedBugs.slice(0, 3).map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <Bug className="w-3.5 h-3.5 text-neon-orange mt-0.5 shrink-0" />
                              {b}
                            </li>
                          ))}
                          {v.fixedBugs.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{v.fixedBugs.length - 3} 项更多
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-6 mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-gray-500 font-mono">检查清单</span>
                        <div className="flex-1 h-1.5 bg-base-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neon-green/60 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                          {completedCount}/{totalCount}
                        </span>
                      </div>

                      {avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-neon-yellow fill-neon-yellow" />
                          <span className="text-xs text-gray-400 font-mono">
                            {avgRating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `v${selected.versionNumber} 详情` : ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl text-neon-green font-bold">
                v{selected.versionNumber}
              </span>
              {selected.isMilestone && (
                <span className="badge-green">{selected.milestoneLabel || "里程碑"}</span>
              )}
              <span className="text-gray-400 text-sm ml-auto">
                {format(new Date(selected.releaseDate), "yyyy-MM-dd")}
              </span>
            </div>

            {selected.newFeatures.length > 0 && (
              <div>
                <h3 className="section-title mb-2">新增功能</h3>
                <ul className="space-y-1.5">
                  {selected.newFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.fixedBugs.length > 0 && (
              <div>
                <h3 className="section-title mb-2">修复Bug</h3>
                <ul className="space-y-1.5">
                  {selected.fixedBugs.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Bug className="w-4 h-4 text-neon-orange mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.releaseChecklist.length > 0 && (
              <div>
                <h3 className="section-title mb-2">发布检查清单</h3>
                <ul className="space-y-1.5">
                  {selected.releaseChecklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          item.completed
                            ? "bg-neon-green/20 border-neon-green/40"
                            : "border-white/20"
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3 text-neon-green" />}
                      </div>
                      <span className={item.completed ? "text-gray-400" : "text-gray-300"}>
                        {item.text}
                      </span>
                      <span className="badge-blue text-[10px]">{item.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.userFeedbacks.length > 0 && (
              <div>
                <h3 className="section-title mb-2">用户反馈</h3>
                <div className="space-y-3">
                  {selected.userFeedbacks.map((fb) => (
                    <div key={fb.id} className="glass-card p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`w-3.5 h-3.5 ${
                                n <= fb.rating
                                  ? "text-neon-yellow fill-neon-yellow"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {fb.source} · {format(new Date(fb.date), "yyyy-MM-dd")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                className="neon-btn"
                onClick={() => {
                  setSelected(null);
                  navigate(`/versions/${selected.id}`);
                }}
              >
                <Edit className="w-4 h-4 mr-1.5" />
                编辑版本
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
