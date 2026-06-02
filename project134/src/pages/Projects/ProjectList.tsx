import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useProjectStore } from '../../store/useProjectStore';
import type { Project, ProjectStage } from '../../types';
import {
  STAGE_OPTIONS,
  TRACK_OPTIONS,
  MILESTONE_STATUS_OPTIONS,
} from '../../utils/constants';
import {
  getStatusLabel,
  getStatusColor,
  formatDate,
  calculateMilestoneCompletionRate,
  generateId,
} from '../../utils/helpers';

export default function ProjectList() {
  const projects = useProjectStore((s) => s.projects);
  const addProject = useProjectStore((s) => s.addProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    track: TRACK_OPTIONS[0],
    contact: '',
    joinDate: new Date().toISOString().split('T')[0],
    stage: 'idea' as ProjectStage,
    description: '',
    foundingTeam: [{ name: '', role: '' }],
  });

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.track.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage = stageFilter === 'all' || p.stage === stageFilter;
    const matchTrack = trackFilter === 'all' || p.track === trackFilter;
    return matchSearch && matchStage && matchTrack;
  });

  const handleAddProject = () => {
    if (!formData.name.trim()) return;
    addProject({
      name: formData.name,
      track: formData.track,
      contact: formData.contact,
      joinDate: formData.joinDate,
      stage: formData.stage,
      description: formData.description,
      founders: formData.foundingTeam.filter((t) => t.name.trim()).map((t) => t.name).join('、'),
      foundingTeam: formData.foundingTeam.filter((t) => t.name.trim()).map((t) => ({
        ...t,
        id: generateId(),
      })),
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      track: TRACK_OPTIONS[0],
      contact: '',
      joinDate: new Date().toISOString().split('T')[0],
      stage: 'idea',
      description: '',
      foundingTeam: [{ name: '', role: '' }],
    });
  };

  const handleAddTeamMember = () => {
    setFormData({
      ...formData,
      foundingTeam: [...formData.foundingTeam, { name: '', role: '' }],
    });
  };

  const handleTeamMemberChange = (index: number, field: 'name' | 'role', value: string) => {
    const newTeam = [...formData.foundingTeam];
    newTeam[index][field] = value;
    setFormData({ ...formData, foundingTeam: newTeam });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">创业项目档案</h1>
          <p className="text-slate-500 mt-1">管理所有入孵项目的基本信息</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增项目
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索项目名称或赛道..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                options={[
                  { value: 'all', label: '全部阶段' },
                  ...STAGE_OPTIONS,
                ]}
              />
            </div>
            <div className="w-48">
              <Select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                options={[
                  { value: 'all', label: '全部赛道' },
                  ...TRACK_OPTIONS.map((t) => ({ value: t, label: t })),
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const stageLabel = getStatusLabel(project.stage, STAGE_OPTIONS);
          const stageColor = getStatusColor(project.stage, STAGE_OPTIONS);
          const completionRate = calculateMilestoneCompletionRate(project.milestones);

          return (
            <Card key={project.id} hover>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${stageColor} mt-2 inline-block`}>
                      {stageLabel}
                    </span>
                  </div>
                  <Badge variant="info">{project.track}</Badge>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">入孵时间</span>
                    <span className="text-slate-700">{formatDate(project.joinDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">团队规模</span>
                    <span className="text-slate-700">{project.foundingTeam.length}人</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">里程碑进度</span>
                      <span className="text-slate-700 font-medium">{completionRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Link to={`/projects/${project.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      查看
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(project.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-400 mb-2">
              <FolderKanban className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-500">暂无符合条件的项目</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="新增创业项目"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddProject}>确认添加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="项目名称"
            placeholder="请输入项目名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="所属赛道"
              value={formData.track}
              onChange={(e) => setFormData({ ...formData, track: e.target.value })}
              options={TRACK_OPTIONS.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="发展阶段"
              value={formData.stage}
              onChange={(e) =>
                setFormData({ ...formData, stage: e.target.value as ProjectStage })
              }
              options={STAGE_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="联系方式"
              placeholder="联系人及电话"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
            <Input
              label="入孵时间"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              创始团队
            </label>
            <div className="space-y-2">
              {formData.foundingTeam.map((member, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="成员姓名"
                    value={member.name}
                    onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="担任角色"
                    value={member.role}
                    onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                  />
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddTeamMember}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加成员
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              项目简介
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={3}
              placeholder="请简要描述项目..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteConfirm) {
                  deleteProject(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-slate-600">确定要删除该项目吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}

function FolderKanban(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />
      <path d="M4 9h16" />
    </svg>
  );
}
