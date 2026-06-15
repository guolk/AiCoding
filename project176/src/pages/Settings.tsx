import { useState } from "react";
import { Save, Trash2, Plus, Download, Upload, RotateCcw, X } from "lucide-react";
import { useStore } from "@/store";
import type { TeamMember } from "@/types";

const NEON_COLORS = ["#00FF88", "#00D4FF", "#FF6B6B", "#FFB800", "#A855F7", "#FF2D95", "#6BFF6B", "#FF8C42"];

function getNeonColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return NEON_COLORS[Math.abs(hash) % NEON_COLORS.length];
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function Settings() {
  const { projectSettings, setProjectSettings } = useStore();

  const [name, setName] = useState(projectSettings.projectName);
  const [desc, setDesc] = useState(projectSettings.description);
  const [engine, setEngine] = useState(projectSettings.engine);
  const [platforms, setPlatforms] = useState<string[]>(projectSettings.targetPlatforms);
  const [platformInput, setPlatformInput] = useState("");
  const [members, setMembers] = useState<TeamMember[]>(projectSettings.teamMembers);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [importKey, setImportKey] = useState(0);

  const handleSave = () => {
    setProjectSettings({
      ...projectSettings,
      projectName: name,
      description: desc,
      engine,
      targetPlatforms: platforms,
      teamMembers: members,
    });
  };

  const addPlatform = () => {
    const trimmed = platformInput.trim();
    if (trimmed && !platforms.includes(trimmed)) {
      setPlatforms([...platforms, trimmed]);
      setPlatformInput("");
    }
  };

  const removePlatform = (p: string) => {
    setPlatforms(platforms.filter((pl) => pl !== p));
  };

  const addMember = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const member: TeamMember = {
      id: genId(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole.trim() || "成员",
      avatarUrl: "",
    };
    setMembers([...members, member]);
    setNewName("");
    setNewEmail("");
    setNewRole("");
    setShowAddMember(false);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleExport = () => {
    const data = useStore.getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gamedev-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.projectSettings) {
          useStore.setState(data);
          setName(data.projectSettings.projectName || "");
          setDesc(data.projectSettings.description || "");
          setEngine(data.projectSettings.engine || "");
          setPlatforms(data.projectSettings.targetPlatforms || []);
          setMembers(data.projectSettings.teamMembers || []);
        }
      } catch {}
    };
    reader.readAsText(file);
    setImportKey((prev) => prev + 1);
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">项目设置</h1>

      <div className="glass-card p-6 space-y-4">
        <h2 className="section-title">项目信息</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-400 text-sm mb-1">项目名称</label>
            <input className="cyber-input w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">项目描述</label>
            <textarea className="cyber-input w-full h-24 resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">开发引擎</label>
            <input className="cyber-input w-full" value={engine} onChange={(e) => setEngine(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">目标平台</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {platforms.map((p) => (
                <span key={p} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-green/10 text-neon-green text-sm border border-neon-green/30">
                  {p}
                  <button onClick={() => removePlatform(p)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="cyber-input flex-1" placeholder="添加平台..." value={platformInput} onChange={(e) => setPlatformInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPlatform()} />
              <button className="neon-btn flex items-center gap-1" onClick={addPlatform}><Plus className="w-4 h-4" />添加</button>
            </div>
          </div>
          <button className="neon-btn-primary flex items-center gap-2" onClick={handleSave}><Save className="w-4 h-4" />保存设置</button>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="section-title">团队成员</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: getNeonColor(m.name) + "33", color: getNeonColor(m.name) }}>
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-100 font-medium truncate">{m.name}</div>
                <div className="text-gray-500 text-xs truncate">{m.email}</div>
                <div className="text-gray-400 text-xs">{m.role}</div>
              </div>
              <button className="neon-btn-danger p-1.5" onClick={() => removeMember(m.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        {showAddMember ? (
          <div className="p-4 rounded-lg bg-white/5 border border-neon-green/20 space-y-3">
            <input className="cyber-input w-full" placeholder="姓名" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="cyber-input w-full" placeholder="邮箱" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <input className="cyber-input w-full" placeholder="角色" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
            <div className="flex gap-2">
              <button className="neon-btn-primary flex items-center gap-1" onClick={addMember}><Plus className="w-4 h-4" />确认添加</button>
              <button className="neon-btn" onClick={() => setShowAddMember(false)}>取消</button>
            </div>
          </div>
        ) : (
          <button className="neon-btn flex items-center gap-2" onClick={() => setShowAddMember(true)}><Plus className="w-4 h-4" />添加成员</button>
        )}
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="section-title">数据管理</h2>
        <div className="flex flex-wrap gap-3">
          <button className="neon-btn flex items-center gap-2" onClick={handleExport}><Download className="w-4 h-4" />导出项目数据</button>
          <label className="neon-btn flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />导入项目数据
            <input key={importKey} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button className="neon-btn-danger flex items-center gap-2" onClick={handleReset}><RotateCcw className="w-4 h-4" />重置为默认数据</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
