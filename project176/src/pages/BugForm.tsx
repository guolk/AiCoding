import { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useStore } from "@/store";
import type { BugReport } from "@/types";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

interface BugFormProps {
  bug?: BugReport;
  onClose: () => void;
}

export default function BugForm({ bug, onClose }: BugFormProps) {
  const isEdit = !!bug;
  const versions = useStore((s) => s.versions);
  const addBug = useStore((s) => s.addBug);
  const updateBug = useStore((s) => s.updateBug);

  const [title, setTitle] = useState(bug?.title ?? "");
  const [description, setDescription] = useState(bug?.description ?? "");
  const [severity, setSeverity] = useState<BugReport["severity"]>(bug?.severity ?? "experience");
  const [status, setStatus] = useState<BugReport["status"]>(bug?.status ?? "open");
  const [assignee, setAssignee] = useState(bug?.assignee ?? "");
  const [versionId, setVersionId] = useState(bug?.versionId ?? (versions[0]?.id ?? ""));
  const [steps, setSteps] = useState<string[]>(bug?.reproductionSteps ?? [""]);

  const handleStepChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const data: BugReport = {
      id: bug?.id ?? uid(),
      title,
      description,
      reproductionSteps: steps.filter((s) => s.trim()),
      severity,
      status,
      assignee,
      versionId,
      createdAt: bug?.createdAt ?? now,
      resolvedAt: status === "resolved" ? now : (bug?.resolvedAt ?? null),
    };
    if (isEdit) {
      updateBug(data);
    } else {
      addBug(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4 bg-[#1A2332]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-mono text-white text-lg font-semibold">{isEdit ? "编辑Bug" : "提交Bug"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-neon-green hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block text-sm text-white/50 mb-1">标题</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none" placeholder="Bug标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">描述</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none resize-none" rows={3} placeholder="详细描述" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-white/50 mb-1">严重程度</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-green/50 focus:outline-none" value={severity} onChange={(e) => setSeverity(e.target.value as BugReport["severity"])}>
                <option value="crash">崩溃</option>
                <option value="experience">体验</option>
                <option value="cosmetic">瑕疵</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">状态</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-green/50 focus:outline-none" value={status} onChange={(e) => setStatus(e.target.value as BugReport["status"])}>
                <option value="open">开放</option>
                <option value="in_progress">进行中</option>
                <option value="resolved">已解决</option>
                <option value="wont_fix">不修复</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">关联版本</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-neon-green/50 focus:outline-none" value={versionId} onChange={(e) => setVersionId(e.target.value)}>
                {versions.map((v) => <option key={v.id} value={v.id}>v{v.versionNumber}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">指派人</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-neon-green/50 focus:outline-none" placeholder="指派人" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/50">复现步骤</label>
              <button className="text-neon-green hover:text-neon-green/80 transition-colors" onClick={addStep}><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-white/30 text-xs w-5 text-right">{i + 1}.</span>
                  <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/30 focus:border-neon-green/50 focus:outline-none" placeholder={`步骤 ${i + 1}`} value={step} onChange={(e) => handleStepChange(i, e.target.value)} />
                  {steps.length > 1 && <button className="text-red-400/60 hover:text-red-400 transition-colors" onClick={() => removeStep(i)}><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/10">
          <button className="px-4 py-1.5 rounded-lg text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-colors" onClick={onClose}>取消</button>
          <button className="neon-btn-primary flex items-center gap-1.5" onClick={handleSave}><Save className="w-4 h-4" />保存</button>
        </div>
      </div>
    </div>
  );
}
