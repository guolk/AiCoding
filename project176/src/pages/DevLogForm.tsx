import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useStore } from "@/store";
import type { DevLogEntry } from "@/types";
import Modal from "@/components/Modal";

const moodOptions = [
  { value: 1, emoji: "😰", label: "崩溃" },
  { value: 2, emoji: "😟", label: "焦虑" },
  { value: 3, emoji: "😐", label: "一般" },
  { value: 4, emoji: "😊", label: "不错" },
  { value: 5, emoji: "🤩", label: "极佳" },
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface DevLogFormProps {
  editingLog?: DevLogEntry | null;
  onClose?: () => void;
}

export default function DevLogForm({ editingLog, onClose }: DevLogFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { devLogs, addDevLog, updateDevLog } = useStore();

  const isInline = !!editingLog && !!onClose;
  const isEdit = isInline ? true : id !== undefined;
  const existingLog = isInline
    ? editingLog
    : isEdit
    ? devLogs.find((l) => l.id === id)
    : null;

  const now = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(existingLog?.date ?? now);
  const [features, setFeatures] = useState<string[]>(
    existingLog?.completedFeatures ?? [""]
  );
  const [challenges, setChallenges] = useState(
    existingLog?.technicalChallenges.join("\n") ?? ""
  );
  const [solutions, setSolutions] = useState(
    existingLog?.solutions.join("\n") ?? ""
  );
  const [hours, setHours] = useState(existingLog?.hoursSpent ?? 0);
  const [mood, setMood] = useState(existingLog?.moodIndex ?? 3);
  const [moodNote, setMoodNote] = useState(existingLog?.moodNote ?? "");

  useEffect(() => {
    if (existingLog) {
      setDate(existingLog.date);
      setFeatures(
        existingLog.completedFeatures.length > 0
          ? existingLog.completedFeatures
          : [""]
      );
      setChallenges(existingLog.technicalChallenges.join("\n"));
      setSolutions(existingLog.solutions.join("\n"));
      setHours(existingLog.hoursSpent);
      setMood(existingLog.moodIndex);
      setMoodNote(existingLog.moodNote);
    }
  }, [existingLog]);

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, val: string) => {
    const next = [...features];
    next[i] = val;
    setFeatures(next);
  };

  const handleSave = () => {
    const filteredFeatures = features.filter((f) => f.trim());
    const entry: DevLogEntry = {
      id: existingLog?.id ?? genId(),
      date,
      completedFeatures: filteredFeatures,
      technicalChallenges: challenges
        .split("\n")
        .filter((s) => s.trim()),
      solutions: solutions.split("\n").filter((s) => s.trim()),
      hoursSpent: hours,
      moodIndex: mood,
      moodNote,
      createdAt: existingLog?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingLog) {
      updateDevLog(entry);
    } else {
      addDevLog(entry);
    }

    if (isInline && onClose) {
      onClose();
    } else {
      navigate("/devlog");
    }
  };

  const handleCancel = () => {
    if (isInline && onClose) {
      onClose();
    } else {
      navigate("/devlog");
    }
  };

  const formContent = (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-white/60 mb-1.5">日期</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-base-900/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">完成功能</label>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={f}
                onChange={(e) => updateFeature(i, e.target.value)}
                placeholder="功能名称..."
                className="flex-1 px-3 py-2 bg-base-900/60 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-green/50 transition-colors"
              />
              <button
                onClick={() => removeFeature(i)}
                className="p-2 text-white/30 hover:text-neon-red transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addFeature}
            className="flex items-center gap-1.5 px-3 py-1.5 text-neon-green/70 hover:text-neon-green text-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加功能
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">技术难题</label>
        <textarea
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          rows={3}
          placeholder="每行一个难题..."
          className="w-full px-3 py-2 bg-base-900/60 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 resize-none focus:outline-none focus:border-neon-green/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">解决方案</label>
        <textarea
          value={solutions}
          onChange={(e) => setSolutions(e.target.value)}
          rows={3}
          placeholder="每行一个方案..."
          className="w-full px-3 py-2 bg-base-900/60 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 resize-none focus:outline-none focus:border-neon-green/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">开发时长（小时）</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-base-900/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">心态指数</label>
        <div className="flex gap-2">
          {moodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMood(opt.value)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${
                mood === opt.value
                  ? "border-neon-green/50 bg-neon-green/10 shadow-neon"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-[10px] text-white/50">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">心态备注</label>
        <textarea
          value={moodNote}
          onChange={(e) => setMoodNote(e.target.value)}
          rows={2}
          placeholder="今天感觉如何..."
          className="w-full px-3 py-2 bg-base-900/60 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 resize-none focus:outline-none focus:border-neon-green/50 transition-colors"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} className="neon-btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          保存
        </button>
        <button onClick={handleCancel} className="neon-btn flex items-center gap-2">
          <X className="w-4 h-4" />
          取消
        </button>
      </div>
    </div>
  );

  if (isInline) {
    return (
      <Modal
        isOpen={true}
        onClose={handleCancel}
        title={existingLog ? "编辑日志" : "新增日志"}
        size="md"
      >
        {formContent}
      </Modal>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">{isEdit ? "编辑日志" : "新增日志"}</h1>
      <div className="glass-card p-6">{formContent}</div>
    </div>
  );
}
