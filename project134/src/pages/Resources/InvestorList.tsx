import { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Heart, Activity, Phone, Briefcase, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useResourceStore } from '../../store/useResourceStore';
import { useProjectStore } from '../../store/useProjectStore';
import { INTEREST_LEVEL_OPTIONS, FOLLOW_STATUS_OPTIONS } from '../../utils/constants';
import { getStatusLabel, getStatusColor, cn } from '../../utils/helpers';
import type { Investor, InterestLevel, FollowStatus } from '../../types';

const emptyForm = {
  name: '',
  institution: '',
  interestLevel: 'medium' as InterestLevel,
  followStatus: 'contacted' as FollowStatus,
  contact: '',
  projects: [] as string[],
};

export default function InvestorList() {
  const investors = useResourceStore((s) => s.investors);
  const addInvestor = useResourceStore((s) => s.addInvestor);
  const updateInvestor = useResourceStore((s) => s.updateInvestor);
  const deleteInvestor = useResourceStore((s) => s.deleteInvestor);
  const projects = useProjectStore((s) => s.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [interestFilter, setInterestFilter] = useState<InterestLevel | ''>('');
  const [statusFilter, setStatusFilter] = useState<FollowStatus | ''>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editInvestorId, setEditInvestorId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const filteredInvestors = investors.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchInterest = !interestFilter || i.interestLevel === interestFilter;
    const matchStatus = !statusFilter || i.followStatus === statusFilter;
    return matchSearch && matchInterest && matchStatus;
  });

  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.name || '未知项目';

  const resetForm = () => {
    setIsAddModalOpen(false);
    setIsEditing(false);
    setEditInvestorId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.institution.trim()) return;
    isEditing && editInvestorId
      ? updateInvestor(editInvestorId, formData)
      : addInvestor(formData);
    resetForm();
  };

  const handleEdit = (investor: Investor) => {
    setFormData({
      name: investor.name,
      institution: investor.institution,
      interestLevel: investor.interestLevel,
      followStatus: investor.followStatus,
      contact: investor.contact,
      projects: investor.projects,
    });
    setEditInvestorId(investor.id);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const toggleProject = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.includes(projectId)
        ? prev.projects.filter((p) => p !== projectId)
        : [...prev.projects, projectId],
    }));
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    deleteInvestor(deleteConfirm);
    setDeleteConfirm(null);
  };

  const StatusBadge = ({ status, options }: { status: string; options: { value: string; color: string; label: string }[] }) => (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(status, options))}>
      {getStatusLabel(status, options)}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">投资人管理</h1>
          <p className="text-slate-500 mt-1">管理投资机构和投资人资源</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增投资人
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索投资人姓名或机构..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={interestFilter}
                onChange={(e) => setInterestFilter(e.target.value as InterestLevel | '')}
                options={[{ value: '', label: '全部兴趣程度' }, ...INTEREST_LEVEL_OPTIONS]}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FollowStatus | '')}
                options={[{ value: '', label: '全部跟进状态' }, ...FOLLOW_STATUS_OPTIONS]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} hover>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                    {investor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{investor.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {investor.institution}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(investor)}>
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(investor.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 flex items-center gap-1"><Heart className="w-4 h-4" />兴趣程度</p>
                  <StatusBadge status={investor.interestLevel} options={INTEREST_LEVEL_OPTIONS} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 flex items-center gap-1"><Activity className="w-4 h-4" />跟进状态</p>
                  <StatusBadge status={investor.followStatus} options={FOLLOW_STATUS_OPTIONS} />
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-700">{investor.contact || '暂无联系方式'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2 flex items-center gap-1"><Briefcase className="w-4 h-4" />关注项目</p>
                <div className="flex flex-wrap gap-1.5">
                  {investor.projects.length > 0 ? (
                    investor.projects.map((pid) => (
                      <Badge key={pid} variant="info" className="text-xs">{getProjectName(pid)}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">暂无关注项目</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500">暂无投资人数据</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={resetForm}
        title={isEditing ? '编辑投资人' : '新增投资人'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>取消</Button>
            <Button onClick={handleSubmit}>{isEditing ? '保存修改' : '确认添加'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="投资人姓名" placeholder="请输入投资人姓名" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="投资机构" placeholder="请输入投资机构名称" value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="兴趣程度" value={formData.interestLevel}
              onChange={(e) => setFormData({ ...formData, interestLevel: e.target.value as InterestLevel })}
              options={INTEREST_LEVEL_OPTIONS} />
            <Select label="跟进状态" value={formData.followStatus}
              onChange={(e) => setFormData({ ...formData, followStatus: e.target.value as FollowStatus })}
              options={FOLLOW_STATUS_OPTIONS} />
          </div>
          <Input label="联系方式" placeholder="请输入邮箱或电话" value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">关注项目（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <button key={p.id} type="button" onClick={() => toggleProject(p.id)}
                  className={cn('px-3 py-1.5 rounded-full text-sm transition-all border-2',
                    formData.projects.includes(p.id)
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-500'
                      : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200')}>
                  {p.name}
                </button>
              ))}
              {projects.length === 0 && <p className="text-sm text-slate-400 italic">暂无项目可选择</p>}
            </div>
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
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>取消</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-slate-600">确定要删除该投资人吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
