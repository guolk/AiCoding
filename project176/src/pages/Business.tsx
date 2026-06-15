import { useState } from "react";
import { Plus, Circle, Trash2, X } from "lucide-react";
import { format, differenceInDays, min, max } from "date-fns";
import { useStore } from "@/store";
import type { PlatformResearch, PricingStrategy, MarketingCampaign } from "@/types";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const tabs = ["平台调研", "定价策略", "营销活动"] as const;
type Tab = (typeof tabs)[number];

const emptyPlatform = {
  platformName: "", revenueShare: "", userDemographics: "",
  feeStructure: "", rating: 3, notes: "", listingRequirements: [] as string[],
};
const emptyStrategy = {
  name: "", basePrice: 0, decisionNotes: "",
  discountTiers: [] as { label: string; percentage: number; condition: string }[],
  competitorPrices: [] as { gameName: string; price: number; platform: string }[],
};
const emptyCampaign = {
  name: "", platform: "", budget: 0, startDate: "", endDate: "",
  status: "planned" as MarketingCampaign["status"], notes: "", impressions: 0, conversions: 0, revenue: 0,
};

function RatingDots({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Circle key={n} className={`w-3.5 h-3.5 ${n <= rating ? "text-neon-green fill-neon-green" : "text-gray-600"}`} />
      ))}
    </div>
  );
}

function PlatformTab({ platforms, onAdd }: { platforms: PlatformResearch[]; onAdd: (p: PlatformResearch) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPlatform);
  const [reqInput, setReqInput] = useState("");

  const submit = () => {
    if (!form.platformName) return;
    onAdd({ id: uid(), ...form });
    setForm(emptyPlatform);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="neon-btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1.5" />新增平台
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 space-y-3 animate-slide-in">
          <div className="flex justify-between items-center mb-2">
            <span className="section-title">新增平台</span>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="平台名称" value={form.platformName}
              onChange={(e) => setForm({ ...form, platformName: e.target.value })} />
            <input className="input-field" placeholder="分成比例 (如 88/12)" value={form.revenueShare}
              onChange={(e) => setForm({ ...form, revenueShare: e.target.value })} />
            <input className="input-field" placeholder="用户群体" value={form.userDemographics}
              onChange={(e) => setForm({ ...form, userDemographics: e.target.value })} />
            <input className="input-field" placeholder="费用结构" value={form.feeStructure}
              onChange={(e) => setForm({ ...form, feeStructure: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">评分:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setForm({ ...form, rating: n })}>
                <Circle className={`w-4 h-4 ${n <= form.rating ? "text-neon-green fill-neon-green" : "text-gray-600"}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1" placeholder="上架要求" value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && reqInput.trim()) { setForm({ ...form, listingRequirements: [...form.listingRequirements, reqInput.trim()] }); setReqInput(""); } }} />
            <button className="neon-btn" onClick={() => { if (reqInput.trim()) { setForm({ ...form, listingRequirements: [...form.listingRequirements, reqInput.trim()] }); setReqInput(""); } }}>添加</button>
          </div>
          {form.listingRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.listingRequirements.map((r, i) => (
                <span key={i} className="badge-blue flex items-center gap-1">
                  {r}
                  <button onClick={() => setForm({ ...form, listingRequirements: form.listingRequirements.filter((_, j) => j !== i) })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea className="input-field" rows={2} placeholder="备注" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end"><button className="neon-btn-primary" onClick={submit}>保存</button></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {platforms.map((p) => (
          <div key={p.id} className="glass-card-hover p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-neon-green font-semibold">{p.platformName}</span>
              <span className="font-mono text-xl text-white font-bold">{p.revenueShare}</span>
            </div>
            <RatingDots rating={p.rating} />
            <p className="text-gray-300 text-sm">{p.userDemographics}</p>
            {p.listingRequirements.length > 0 && (
              <ul className="space-y-1">
                {p.listingRequirements.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-sm text-gray-300">
                    <span className="w-1 h-1 rounded-full bg-neon-green/60" />{r}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-gray-400 text-sm">{p.feeStructure}</p>
            {p.notes && <p className="text-gray-500 text-xs">{p.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingTab({ strategies, onAdd }: { strategies: PricingStrategy[]; onAdd: (p: PricingStrategy) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyStrategy);
  const [tierInput, setTierInput] = useState({ label: "", percentage: 0, condition: "" });
  const [compInput, setCompInput] = useState({ gameName: "", price: 0, platform: "" });

  const submit = () => {
    if (!form.name) return;
    onAdd({ id: uid(), ...form, decidedAt: new Date().toISOString() });
    setForm(emptyStrategy);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="neon-btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1.5" />新增策略
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 space-y-3 animate-slide-in">
          <div className="flex justify-between items-center mb-2">
            <span className="section-title">新增策略</span>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="策略名称" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input-field" type="number" placeholder="基础价格" value={form.basePrice || ""}
              onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-mono uppercase">折扣层级</span>
            <div className="grid grid-cols-3 gap-2">
              <input className="input-field" placeholder="标签" value={tierInput.label}
                onChange={(e) => setTierInput({ ...tierInput, label: e.target.value })} />
              <input className="input-field" type="number" placeholder="折扣%" value={tierInput.percentage || ""}
                onChange={(e) => setTierInput({ ...tierInput, percentage: Number(e.target.value) })} />
              <input className="input-field" placeholder="条件" value={tierInput.condition}
                onChange={(e) => setTierInput({ ...tierInput, condition: e.target.value })} />
            </div>
            <button className="neon-btn text-xs" onClick={() => {
              if (tierInput.label) { setForm({ ...form, discountTiers: [...form.discountTiers, tierInput] }); setTierInput({ label: "", percentage: 0, condition: "" }); }
            }}>添加层级</button>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-mono uppercase">竞品价格</span>
            <div className="grid grid-cols-3 gap-2">
              <input className="input-field" placeholder="游戏名" value={compInput.gameName}
                onChange={(e) => setCompInput({ ...compInput, gameName: e.target.value })} />
              <input className="input-field" type="number" placeholder="价格" value={compInput.price || ""}
                onChange={(e) => setCompInput({ ...compInput, price: Number(e.target.value) })} />
              <input className="input-field" placeholder="平台" value={compInput.platform}
                onChange={(e) => setCompInput({ ...compInput, platform: e.target.value })} />
            </div>
            <button className="neon-btn text-xs" onClick={() => {
              if (compInput.gameName) { setForm({ ...form, competitorPrices: [...form.competitorPrices, compInput] }); setCompInput({ gameName: "", price: 0, platform: "" }); }
            }}>添加竞品</button>
          </div>
          <textarea className="input-field" rows={2} placeholder="决策说明" value={form.decisionNotes}
            onChange={(e) => setForm({ ...form, decisionNotes: e.target.value })} />
          <div className="flex justify-end"><button className="neon-btn-primary" onClick={submit}>保存</button></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {strategies.map((s) => (
          <div key={s.id} className="glass-card-hover p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-neon-blue font-semibold">{s.name}</span>
              <span className="font-mono text-2xl text-neon-green font-bold">¥{s.basePrice}</span>
            </div>
            {s.discountTiers.length > 0 && (
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs font-mono"><th className="text-left pb-1">标签</th><th className="text-left pb-1">折扣</th><th className="text-left pb-1">条件</th></tr></thead>
                <tbody>
                  {s.discountTiers.map((t, i) => (
                    <tr key={i} className="border-t border-white/5"><td className="py-1 text-gray-300">{t.label}</td><td className="py-1 text-neon-green">{t.percentage}%</td><td className="py-1 text-gray-400">{t.condition}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {s.competitorPrices.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-mono uppercase">竞品价格</span>
                {s.competitorPrices.map((c, i) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-gray-300">{c.gameName}</span><span className="text-neon-green font-mono">¥{c.price}</span><span className="text-gray-500">{c.platform}</span></div>
                ))}
              </div>
            )}
            {s.decisionNotes && <p className="text-gray-300 text-sm">{s.decisionNotes}</p>}
            <p className="text-gray-500 text-xs">{format(new Date(s.decidedAt), "yyyy-MM-dd")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignTab({ campaigns, onAdd }: { campaigns: MarketingCampaign[]; onAdd: (c: MarketingCampaign) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCampaign);
  const [hovered, setHovered] = useState<string | null>(null);

  const submit = () => {
    if (!form.name) return;
    onAdd({ id: uid(), ...form });
    setForm(emptyCampaign);
    setShowForm(false);
  };

  const validCampaigns = campaigns.filter((c) => c.startDate && c.endDate);
  const timelineStart = validCampaigns.length > 0 ? min(validCampaigns.map((c) => new Date(c.startDate))) : new Date();
  const timelineEnd = validCampaigns.length > 0 ? max(validCampaigns.map((c) => new Date(c.endDate))) : new Date();
  const totalDays = Math.max(differenceInDays(timelineEnd, timelineStart), 1);

  const statusColor = { planned: "bg-neon-blue", active: "bg-neon-green", completed: "bg-neon-purple" } as const;
  const statusBadge = { planned: "badge-blue", active: "badge-green", completed: "badge-purple" } as const;
  const statusLabel = { planned: "计划中", active: "进行中", completed: "已完成" } as const;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="neon-btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1.5" />新增活动
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 space-y-3 animate-slide-in">
          <div className="flex justify-between items-center mb-2">
            <span className="section-title">新增活动</span>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="活动名称" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input-field" placeholder="平台" value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })} />
            <input className="input-field" type="number" placeholder="预算" value={form.budget || ""}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
            <select className="select-field" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as MarketingCampaign["status"] })}>
              <option value="planned">计划中</option><option value="active">进行中</option><option value="completed">已完成</option>
            </select>
            <input className="input-field" type="date" value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <input className="input-field" type="date" value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <textarea className="input-field" rows={2} placeholder="备注" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end"><button className="neon-btn-primary" onClick={submit}>保存</button></div>
        </div>
      )}

      {validCampaigns.length > 0 && (
        <div className="glass-card p-5">
          <div className="relative h-20">
            <div className="absolute inset-0 flex items-end">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 border-l border-white/5 h-full flex items-end">
                  <span className="text-[10px] text-gray-600 ml-1">
                    {format(new Date(timelineStart.getTime() + (totalDays * i * 86400000)), "MM/dd")}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col justify-center gap-2 py-2">
              {validCampaigns.map((c) => {
                const start = differenceInDays(new Date(c.startDate), timelineStart);
                const dur = Math.max(differenceInDays(new Date(c.endDate), new Date(c.startDate)), 1);
                const left = (start / totalDays) * 100;
                const width = (dur / totalDays) * 100;
                return (
                  <div key={c.id} className="relative h-5"
                    onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}>
                    <div className={`absolute h-full rounded ${statusColor[c.status]} opacity-70`}
                      style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }} />
                    {hovered === c.id && (
                      <div className="absolute z-10 -top-8 left-1/2 -translate-x-1/2 bg-base-900 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 whitespace-nowrap shadow-lg">
                        {c.name} · {format(new Date(c.startDate), "MM/dd")}-{format(new Date(c.endDate), "MM/dd")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-neon-blue" />计划中</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-neon-green" />进行中</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-neon-purple" />已完成</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="glass-card-hover p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gray-100 font-semibold">{c.name}</span>
                <span className="text-gray-500 text-sm">{c.platform}</span>
                <span className={statusBadge[c.status]}>{statusLabel[c.status]}</span>
              </div>
              <span className="font-mono text-neon-green">¥{c.budget}</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {c.startDate && c.endDate ? `${format(new Date(c.startDate), "yyyy-MM-dd")} → ${format(new Date(c.endDate), "yyyy-MM-dd")}` : "日期未设定"}
            </div>
            <div className="flex gap-6 text-sm">
              <span className="text-gray-400">曝光: <span className="text-gray-200">{c.impressions.toLocaleString()}</span></span>
              {c.status === "completed" && <span className="text-gray-400">转化: <span className="text-gray-200">{c.conversions.toLocaleString()}</span></span>}
            </div>
            {c.notes && <p className="text-gray-500 text-xs mt-2">{c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Business() {
  const [activeTab, setActiveTab] = useState<Tab>("平台调研");
  const { platforms, pricingStrategies, campaigns, addPlatform, addPricingStrategy, addCampaign } = useStore();

  return (
    <div className="p-6 space-y-6">
      <h1 className="page-title">商业规划</h1>

      <div className="flex gap-1 bg-base-900/60 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-mono transition-all ${
              activeTab === t ? "bg-neon-green/15 text-neon-green shadow-neon" : "text-gray-400 hover:text-gray-200"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "平台调研" && <PlatformTab platforms={platforms} onAdd={addPlatform} />}
      {activeTab === "定价策略" && <PricingTab strategies={pricingStrategies} onAdd={addPricingStrategy} />}
      {activeTab === "营销活动" && <CampaignTab campaigns={campaigns} onAdd={addCampaign} />}
    </div>
  );
}
