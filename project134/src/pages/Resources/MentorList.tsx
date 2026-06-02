import { useState } from 'react';
import { Plus, Edit2, Trash2, UserPlus, Clock, Briefcase, Search, Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useResourceStore } from '../../store/useResourceStore';
import { useProjectStore } from '../../store/useProjectStore';
import { formatDate } from '../../utils/helpers';
import type { ServiceRecord } from '../../types';

export default function MentorList() {
  const mentors = useResourceStore((s) => s.mentors);
  const addMentor = useResourceStore((s) => s.addMentor);
  const updateMentor = useResourceStore((s) => s.updateMentor);
  const deleteMentor = useResourceStore((s) => s.deleteMentor);
  const addServiceRecord = useResourceStore((s) => s.addServiceRecord);
  const projects = useProjectStore((s) => s.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMentorId, setEditMentorId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    expertise: [] as string[],
    contact: '',
  });

  const [recordForm, setRecordForm] = useState({
    date: new Date().toISOString().split('T')[0],
    projectId: projects[0]?.id || '',
    content: '',
  });

  const expertiseOptions = [
    '人工智能', '技术战略', '产品规划', '企业管理', '市场营销',
    '团队建设', '股权设计', '融资法务', '知识产权', '财务分析',
    '品牌建设', '销售管理', '运营管理', '供应链', '行业资源',
  ];

  const filteredMentors = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.expertise.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || '未知项目';
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (isEditing && editMentorId) {
      updateMentor(editMentorId, formData);
    } else {
      addMentor(formData);
    }

    setIsAddModalOpen(false);
    setIsEditing(false);
    setEditMentorId(null);
    setFormData({ name: '', expertise: [], contact: '' });
  };

  const handleEdit = (mentor: typeof mentors[0]) => {
    setFormData({
      name: mentor.name,
      expertise: mentor.expertise,
      contact: mentor.contact,
    });
    setEditMentorId(mentor.id);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleAddRecord = () => {
    if (!selectedMentor || !recordForm.content.trim()) return;

    addServiceRecord(selectedMentor, {
      date: recordForm.date,
      projectId: recordForm.projectId,
      content: recordForm.content,
    });

    setIsRecordModalOpen(false);
    setSelectedMentor(null);
    setRecordForm({
      date: new Date().toISOString().split('T')[0],
      projectId: projects[0]?.id || '',
      content: '',
    });
  };

  const toggleExpertise = (exp: string) => {
    if (formData.expertise.includes(exp)) {
      setFormData({ ...formData, expertise: formData.expertise.filter((e) => e !== exp) });
    } else {
      setFormData({ ...formData, expertise: [...formData.expertise, exp] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">导师资源管理</h1>
          <p className="text-slate-500 mt-1">管理导师团队和服务记录</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增导师
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="搜索导师姓名或专业领域..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} hover>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                    {mentor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{mentor.name}</h3>
                    <p className="text-sm text-slate-500">{mentor.contact}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(mentor)}>
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(mentor.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  专业领域
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.expertise.map((exp) => (
                    <Badge key={exp} variant="info" className="text-xs">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    服务记录
                  </p>
                  <span className="text-xs text-slate-400">{mentor.serviceRecords.length}次</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mentor.serviceRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="p-2 bg-slate-50 rounded-lg text-sm">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{formatDate(record.date)}</span>
                        <span className="text-blue-600">{getProjectName(record.projectId)}</span>
                      </div>
                      <p className="text-slate-700 line-clamp-2">{record.content}</p>
                    </div>
                  ))}
                  {mentor.serviceRecords.length === 0 && (
                    <p className="text-sm text-slate-400 italic">暂无服务记录</p>
                  )}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedMentor(mentor.id);
                  setIsRecordModalOpen(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                添加服务记录
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-400 mb-2">
              <Award className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-500">暂无导师资源</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditing(false);
          setEditMentorId(null);
          setFormData({ name: '', expertise: [], contact: '' });
        }}
        title={isEditing ? '编辑导师' : '新增导师'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditing(false);
                setEditMentorId(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmit}>{isEditing ? '保存修改' : '确认添加'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="导师姓名"
            placeholder="请输入导师姓名"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="联系方式"
            placeholder="请输入邮箱或电话"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              专业领域（可多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {expertiseOptions.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => toggleExpertise(exp)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.expertise.includes(exp)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setSelectedMentor(null);
        }}
        title="添加服务记录"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRecordModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddRecord}>确认添加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="服务日期"
              type="date"
              value={recordForm.date}
              onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                服务项目
              </label>
              <select
                value={recordForm.projectId}
                onChange={(e) => setRecordForm({ ...recordForm, projectId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              服务内容
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows={4}
              placeholder="请详细描述服务内容..."
              value={recordForm.content}
              onChange={(e) => setRecordForm({ ...recordForm, content: e.target.value })}
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
                  deleteMentor(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-slate-600">确定要删除该导师吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
