import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useStore } from "@/store";
import type { ChecklistItem, UserFeedback } from "@/types";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export default function VersionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const versions = useStore((s) => s.versions);
  const addVersion = useStore((s) => s.addVersion);
  const updateVersion = useStore((s) => s.updateVersion);

  const isEdit = !!id;
  const existing = isEdit ? versions.find((v) => v.id === id) : null;

  const [versionNumber, setVersionNumber] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneLabel, setMilestoneLabel] = useState("");
  const [newFeatures, setNewFeatures] = useState<string[]>([]);
  const [fixedBugs, setFixedBugs] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);

  useEffect(() => {
    if (existing) {
      setVersionNumber(existing.versionNumber);
      setReleaseDate(existing.releaseDate);
      setIsMilestone(existing.isMilestone);
      setMilestoneLabel(existing.milestoneLabel);
      setNewFeatures(existing.newFeatures);
      setFixedBugs(existing.fixedBugs);
      setChecklist(existing.releaseChecklist);
      setFeedbacks(existing.userFeedbacks);
    }
  }, [existing]);

  const addFeature = () => setNewFeatures([...newFeatures, ""]);
  const removeFeature = (i: number) => setNewFeatures(newFeatures.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, val: string) =>
    setNewFeatures(newFeatures.map((f, idx) => (idx === i ? val : f)));

  const addBug = () => setFixedBugs([...fixedBugs, ""]);
  const removeBug = (i: number) => setFixedBugs(fixedBugs.filter((_, idx) => idx !== i));
  const updateBug = (i: number, val: string) =>
    setFixedBugs(fixedBugs.map((b, idx) => (idx === i ? val : b)));

  const addChecklistItem = () =>
    setChecklist([
      ...checklist,
      { id: uid(), text: "", category: "testing", completed: false },
    ]);
  const removeChecklistItem = (i: number) =>
    setChecklist(checklist.filter((_, idx) => idx !== i));
  const updateChecklistItem = (
    i: number,
    field: keyof ChecklistItem,
    val: string | boolean
  ) =>
    setChecklist(
      checklist.map((c, idx) => (idx === i ? { ...c, [field]: val } : c))
    );

  const addFeedback = () =>
    setFeedbacks([
      ...feedbacks,
      { id: uid(), versionId: id || "", rating: 3, comment: "", source: "", date: new Date().toISOString().slice(0, 10) },
    ]);
  const removeFeedback = (i: number) =>
    setFeedbacks(feedbacks.filter((_, idx) => idx !== i));
  const updateFeedback = (
    i: number,
    field: keyof UserFeedback,
    val: string | number
  ) =>
    setFeedbacks(
      feedbacks.map((f, idx) => (idx === i ? { ...f, [field]: val } : f))
    );

  const handleSave = () => {
    const now = new Date().toISOString();
    const data = {
      versionNumber,
      releaseDate,
      isMilestone,
      milestoneLabel,
      newFeatures: newFeatures.filter((f) => f.trim()),
      fixedBugs: fixedBugs.filter((b) => b.trim()),
      releaseChecklist: checklist.filter((c) => c.text.trim()),
      userFeedbacks: feedbacks.filter((f) => f.comment.trim()),
    };

    if (isEdit && existing) {
      updateVersion({ ...existing, ...data });
    } else {
      addVersion({
        id: uid(),
        ...data,
        createdAt: now,
      });
    }
    navigate("/versions");
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="page-title">{isEdit ? "编辑版本" : "新增版本"}</h1>

      <div className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1">版本号</label>
            <input
              className="input-field"
              placeholder="0.5.0"
              value={versionNumber}
              onChange={(e) => setVersionNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1">发布日期</label>
            <input
              type="date"
              className="input-field"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isMilestone}
              onChange={(e) => setIsMilestone(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-base-900 text-neon-green focus:ring-neon-green/40"
            />
            <span className="text-sm text-gray-300">是否里程碑</span>
          </label>
          {isMilestone && (
            <input
              className="input-field flex-1"
              placeholder="里程碑标签"
              value={milestoneLabel}
              onChange={(e) => setMilestoneLabel(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">新增功能</h2>
          <button className="neon-btn text-xs" onClick={addFeature}>
            <Plus className="w-3 h-3 mr-1" />
            添加
          </button>
        </div>
        {newFeatures.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="input-field flex-1"
              placeholder="功能描述"
              value={f}
              onChange={(e) => updateFeature(i, e.target.value)}
            />
            <button className="neon-btn-danger p-1.5" onClick={() => removeFeature(i)}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">修复Bug</h2>
          <button className="neon-btn text-xs" onClick={addBug}>
            <Plus className="w-3 h-3 mr-1" />
            添加
          </button>
        </div>
        {fixedBugs.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="input-field flex-1"
              placeholder="Bug描述"
              value={b}
              onChange={(e) => updateBug(i, e.target.value)}
            />
            <button className="neon-btn-danger p-1.5" onClick={() => removeBug(i)}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">发布检查清单</h2>
          <button className="neon-btn text-xs" onClick={addChecklistItem}>
            <Plus className="w-3 h-3 mr-1" />
            添加
          </button>
        </div>
        {checklist.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={c.completed}
              onChange={(e) => updateChecklistItem(i, "completed", e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-base-900 text-neon-green focus:ring-neon-green/40"
            />
            <input
              className="input-field flex-1"
              placeholder="检查项"
              value={c.text}
              onChange={(e) => updateChecklistItem(i, "text", e.target.value)}
            />
            <select
              className="select-field w-28"
              value={c.category}
              onChange={(e) => updateChecklistItem(i, "category", e.target.value)}
            >
              <option value="testing">testing</option>
              <option value="submission">submission</option>
              <option value="marketing">marketing</option>
              <option value="other">other</option>
            </select>
            <button className="neon-btn-danger p-1.5" onClick={() => removeChecklistItem(i)}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">用户反馈</h2>
          <button className="neon-btn text-xs" onClick={addFeedback}>
            <Plus className="w-3 h-3 mr-1" />
            添加
          </button>
        </div>
        {feedbacks.map((fb, i) => (
          <div key={fb.id} className="glass-card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <select
                className="select-field w-20"
                value={fb.rating}
                onChange={(e) => updateFeedback(i, "rating", Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <input
                className="input-field flex-1"
                placeholder="来源"
                value={fb.source}
                onChange={(e) => updateFeedback(i, "source", e.target.value)}
              />
              <input
                type="date"
                className="input-field w-36"
                value={fb.date}
                onChange={(e) => updateFeedback(i, "date", e.target.value)}
              />
              <button className="neon-btn-danger p-1.5" onClick={() => removeFeedback(i)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              className="input-field"
              placeholder="评论内容"
              value={fb.comment}
              onChange={(e) => updateFeedback(i, "comment", e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button className="neon-btn-primary" onClick={handleSave}>
          <Save className="w-4 h-4 mr-1.5" />
          保存
        </button>
        <button className="neon-btn" onClick={() => navigate("/versions")}>
          <X className="w-4 h-4 mr-1.5" />
          取消
        </button>
      </div>
    </div>
  );
}
