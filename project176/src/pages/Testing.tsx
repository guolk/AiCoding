import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, CheckCircle, XCircle, MinusCircle, Users, Calendar, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/store";
import type { TestPlan, BugReport, BetaTestSession, BetaTester } from "@/types";
import BugForm from "./BugForm";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const subTabs = ["测试计划", "Bug看板", "闭包测试"] as const;
type SubTab = (typeof subTabs)[number];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    open: "bg-red-500/20 text-red-400 border-red-500/30",
    resolved: "bg-green-500/20 text-green-400 border-green-500/30",
    wont_fix: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return map[status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

const statusLabel: Record<string, string> = {
  pending: "待开始", in_progress: "进行中", completed: "已完成",
  open: "开放", resolved: "已解决", wont_fix: "不修复",
};

const scenarioIcon = (s: string) => {
  if (s === "pass") return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (s === "fail") return <XCircle className="w-4 h-4 text-red-400" />;
  return <MinusCircle className="w-4 h-4 text-gray-400" />;
};

const invitationBadge = (s: string) => {
  const map: Record<string, string> = {
    accepted: "bg-green-500/20 text-green-400",
    declined: "bg-red-500/20 text-red-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };
  return map[s] ?? "";
};

export default function Testing() {
  const [activeTab, setActiveTab] = useState<SubTab>("测试计划");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showBugForm, setShowBugForm] = useState(false);
  const [editingBug, setEditingBug] = useState<BugReport | undefined>(undefined);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const testPlans = useStore((s) => s.testPlans);
  const bugs = useStore((s) => s.bugs);
  const betaSessions = useStore((s) => s.betaSessions);
  const versions = useStore((s) => s.versions);
  const addTestPlan = useStore((s) => s.addTestPlan);
  const addBetaSession = useStore((s) => s.addBetaSession);

  const [planForm, setPlanForm] = useState({ name: "", description: "", assignee: "", deadline: "", status: "pending" as TestPlan["status"] });
  const [sessionForm, setSessionForm] = useState({ name: "", startDate: "", endDate: "", summaryNotes: "" });

  const handleAddPlan = () => {
    if (!planForm.name.trim()) return;
    addTestPlan({
      id: uid(),
      name: planForm.name,
      description: planForm.description,
      scenarios: [],
      status: planForm.status,
      assignee: planForm.assignee,
      deadline: planForm.deadline,
      createdAt: new Date().toISOString(),
    });
    setPlanForm({ name: "", description: "", assignee: "", deadline: "", status: "pending" });
    setShowPlanForm(false);
  };

  const handleAddSession = () => {
    if (!sessionForm.name.trim()) return;
    addBetaSession({
      id: uid(),
      name: sessionForm.name,
      testers: [],
      startDate: sessionForm.startDate,
      endDate: sessionForm.endDate,
      summaryNotes: sessionForm.summaryNotes,
    });
    setSessionForm({ name: "", startDate: "", endDate: "", summaryNotes: "" });
    setShowSessionForm(false);
  };

  const crashBugs = bugs.filter((b) => b.severity === "crash");
  const experienceBugs = bugs.filter((b) => b.severity === "experience");
  const cosmeticBugs = bugs.filter((b) => b.severity === "cosmetic");

  return (
    <div className="p-6 space-y-6">
      <h1 className="page-title">测试管理</h1>

      <div className="flex gap-2 border-b border-white/10 pb-3">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors ${
              activeTab === tab
                ? "bg-white/10 text-neon-green border-b-2 border-neon-green"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "测试计划" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="neon-btn-primary" onClick={() => setShowPlanForm(!showPlanForm)}>
              <Plus className="w-4 h-4 mr-1.5" />
              新增计划
            </button>
          </div>

          {showPlanForm && (
            <div className="glass-card p-5 space-y-3">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none"
                placeholder="计划名称"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              />
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none resize-none"
                rows={2}
                placeholder="计划描述"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none"
                  placeholder="指派人"
                  value={planForm.assignee}
                  onChange={(e) => setPlanForm({ ...planForm, assignee: e.target.value })}
                />
                <input
                  type="date"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-green/50 focus:outline-none"
                  value={planForm.deadline}
                  onChange={(e) => setPlanForm({ ...planForm, deadline: e.target.value })}
                />
                <select
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-green/50 focus:outline-none"
                  value={planForm.status}
                  onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as TestPlan["status"] })}
                >
                  <option value="pending">待开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-1.5 rounded-lg text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-colors" onClick={() => setShowPlanForm(false)}>取消</button>
                <button className="neon-btn-primary" onClick={handleAddPlan}>保存</button>
              </div>
            </div>
          )}

          {testPlans.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/40">暂无测试计划</div>
          ) : (
            testPlans.map((plan) => {
              const passCount = plan.scenarios.filter((s) => s.status === "pass").length;
              const failCount = plan.scenarios.filter((s) => s.status === "fail").length;
              const isExpanded = expandedPlan === plan.id;
              return (
                <div key={plan.id} className="glass-card overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-4 h-4 text-neon-green" />
                        <span className="font-mono text-white font-semibold">{plan.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs border ${statusBadge(plan.status)}`}>
                          {statusLabel[plan.status]}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{plan.assignee}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{plan.deadline ? format(new Date(plan.deadline), "yyyy-MM-dd") : "无期限"}</span>
                      <span className="text-green-400">{passCount} 通过</span>
                      <span className="text-red-400">{failCount} 失败</span>
                      <span className="text-white/30">{plan.scenarios.length} 场景</span>
                    </div>
                  </div>
                  {isExpanded && plan.scenarios.length > 0 && (
                    <div className="border-t border-white/10 px-4 py-3 space-y-2">
                      {plan.scenarios.map((sc) => (
                        <div key={sc.id} className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                          {scenarioIcon(sc.status)}
                          <span className="text-white/80">{sc.name}</span>
                          <span className="ml-auto text-xs text-white/30">{sc.status.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "Bug看板" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="neon-btn-primary" onClick={() => { setEditingBug(undefined); setShowBugForm(true); }}>
              <Plus className="w-4 h-4 mr-1.5" />
              提交Bug
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {([
              { label: "崩溃", items: crashBugs, headerClass: "text-red-400 border-red-500/40" },
              { label: "体验", items: experienceBugs, headerClass: "text-orange-400 border-orange-500/40" },
              { label: "瑕疵", items: cosmeticBugs, headerClass: "text-yellow-400 border-yellow-500/40" },
            ] as const).map((col) => (
              <div key={col.label} className="space-y-3">
                <h3 className={`font-mono text-sm font-bold pb-2 border-b ${col.headerClass}`}>{col.label} ({col.items.length})</h3>
                {col.items.length === 0 ? (
                  <div className="text-center text-white/20 text-sm py-6">无</div>
                ) : (
                  col.items.map((bug) => {
                    const ver = versions.find((v) => v.id === bug.versionId);
                    return (
                      <div
                        key={bug.id}
                        className="glass-card p-3 space-y-1.5 cursor-pointer hover:border-neon-green/30 transition-colors"
                        onClick={() => { setEditingBug(bug); setShowBugForm(true); }}
                      >
                        <div className="font-mono text-sm text-white leading-tight">{bug.title}</div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs border ${statusBadge(bug.status)}`}>{statusLabel[bug.status]}</span>
                          <span className="text-xs text-white/40">{bug.assignee}</span>
                          {ver && <span className="text-xs text-neon-green/60 ml-auto">v{ver.versionNumber}</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "闭包测试" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="neon-btn-primary" onClick={() => setShowSessionForm(!showSessionForm)}>
              <Plus className="w-4 h-4 mr-1.5" />
              新增测试
            </button>
          </div>

          {showSessionForm && (
            <div className="glass-card p-5 space-y-3">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none"
                placeholder="测试名称"
                value={sessionForm.name}
                onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-green/50 focus:outline-none" value={sessionForm.startDate} onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })} />
                <input type="date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-green/50 focus:outline-none" value={sessionForm.endDate} onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })} />
              </div>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none resize-none"
                rows={2}
                placeholder="总结备注"
                value={sessionForm.summaryNotes}
                onChange={(e) => setSessionForm({ ...sessionForm, summaryNotes: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button className="px-4 py-1.5 rounded-lg text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-colors" onClick={() => setShowSessionForm(false)}>取消</button>
                <button className="neon-btn-primary" onClick={handleAddSession}>保存</button>
              </div>
            </div>
          )}

          {betaSessions.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/40">暂无闭包测试</div>
          ) : (
            betaSessions.map((session) => {
              const accepted = session.testers.filter((t) => t.invitationStatus === "accepted").length;
              const isExpanded = expandedSession === session.id;
              return (
                <div key={session.id} className="glass-card overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedSession(isExpanded ? null : session.id)}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-white font-semibold">{session.name}</span>
                      <div className="flex items-center gap-3 text-sm text-white/50">
                        <span>{format(new Date(session.startDate), "MM/dd")} - {format(new Date(session.endDate), "MM/dd")}</span>
                        <span className="text-neon-green">{accepted}/{session.testers.length} 已接受</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-white/10 px-4 py-3 space-y-2">
                      {session.testers.map((tester) => (
                        <div key={tester.id} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 text-sm">
                          <span className="text-white/80">{tester.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${invitationBadge(tester.invitationStatus)}`}>
                            {{ accepted: "已接受", declined: "已拒绝", pending: "待响应" }[tester.invitationStatus]}
                          </span>
                          {tester.feedback && <span className="text-white/40 text-xs ml-4">"{tester.feedback}"</span>}
                          {tester.rating > 0 && <span className="ml-auto text-yellow-400">{"★".repeat(tester.rating)}</span>}
                        </div>
                      ))}
                      {session.summaryNotes && (
                        <div className="mt-3 text-sm text-white/50 bg-white/5 rounded-lg px-3 py-2 border-l-2 border-neon-green/40">
                          {session.summaryNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {showBugForm && (
        <BugForm bug={editingBug} onClose={() => { setShowBugForm(false); setEditingBug(undefined); }} />
      )}
    </div>
  );
}
