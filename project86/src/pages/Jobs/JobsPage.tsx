import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { JobApplication, ApplicationStatus } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, Briefcase, Calendar, Mail, User, Search, Filter, PlusCircle, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { generateId } from '../../utils/storage';

const JobsPage: React.FC = () => {
  const { state, updateJobApplication, deleteJobApplication } = useAppContext();
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [newInterviewDate, setNewInterviewDate] = useState('');

  const statusConfig: Record<ApplicationStatus, { label: string; variant: 'default' | 'primary' | 'warning' | 'success' | 'danger'; icon: React.ReactNode }> = {
    researching: { label: '研究中', variant: 'default', icon: <Search className="w-4 h-4" /> },
    applied: { label: '已投递', variant: 'primary', icon: <Briefcase className="w-4 h-4" /> },
    interviewing: { label: '面试中', variant: 'warning', icon: <Clock className="w-4 h-4" /> },
    offer: { label: '已拿Offer', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
    rejected: { label: '已拒绝', variant: 'danger', icon: <XCircle className="w-4 h-4" /> },
  };

  const filteredJobs = state.jobApplications.filter(job => {
    if (filterStatus !== 'all' && job.status !== filterStatus) return false;
    if (searchQuery && !job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !job.position.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const statusOrder: Record<ApplicationStatus, number> = {
      interviewing: 0,
      applied: 1,
      researching: 2,
      offer: 3,
      rejected: 4,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleSaveJob = (jobData: Partial<JobApplication>) => {
    if (editingJob) {
      updateJobApplication({ ...editingJob, ...jobData } as JobApplication);
    } else {
      const newJob: JobApplication = {
        id: generateId(),
        companyName: jobData.companyName || '',
        position: jobData.position || '',
        researchNotes: jobData.researchNotes || '',
        companyCulture: jobData.companyCulture || '',
        keyProducts: jobData.keyProducts || '',
        status: jobData.status || 'researching',
        appliedDate: jobData.appliedDate || '',
        contactPerson: jobData.contactPerson || '',
        contactEmail: jobData.contactEmail || '',
        interviewDates: jobData.interviewDates || [],
        followUpNotes: jobData.followUpNotes || '',
      };
      updateJobApplication(newJob);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJob = (id: string) => {
    deleteJobApplication(id);
    if (selectedJob?.id === id) {
      setSelectedJob(null);
    }
  };

  const handleStatusChange = (job: JobApplication, status: ApplicationStatus) => {
    const updatedJob = { ...job, status };
    if (status === 'applied' && !job.appliedDate) {
      updatedJob.appliedDate = new Date().toISOString().split('T')[0];
    }
    updateJobApplication(updatedJob);
    if (selectedJob?.id === job.id) {
      setSelectedJob(updatedJob);
    }
  };

  const handleAddInterviewDate = () => {
    if (selectedJob && newInterviewDate) {
      const updatedJob = {
        ...selectedJob,
        interviewDates: [...selectedJob.interviewDates, newInterviewDate].sort()
      };
      updateJobApplication(updatedJob);
      setSelectedJob(updatedJob);
      setNewInterviewDate('');
      setIsInterviewModalOpen(false);
    }
  };

  const handleRemoveInterviewDate = (date: string) => {
    if (selectedJob) {
      const updatedJob = {
        ...selectedJob,
        interviewDates: selectedJob.interviewDates.filter(d => d !== date)
      };
      updateJobApplication(updatedJob);
      setSelectedJob(updatedJob);
    }
  };

  const stats = {
    total: state.jobApplications.length,
    researching: state.jobApplications.filter(j => j.status === 'researching').length,
    applied: state.jobApplications.filter(j => j.status === 'applied').length,
    interviewing: state.jobApplications.filter(j => j.status === 'interviewing').length,
    offer: state.jobApplications.filter(j => j.status === 'offer').length,
    rejected: state.jobApplications.filter(j => j.status === 'rejected').length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">求职进度</h1>
          <p className="text-slate-500 mt-1">管理目标公司和投递进度</p>
        </div>
        <Button onClick={() => { setEditingJob(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          添加公司
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">总计</p>
                <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <Briefcase className="w-6 h-6 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">研究中</p>
                <p className="text-xl font-bold text-slate-600">{stats.researching}</p>
              </div>
              <Search className="w-6 h-6 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">已投递</p>
                <p className="text-xl font-bold text-primary-600">{stats.applied}</p>
              </div>
              <Briefcase className="w-6 h-6 text-primary-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">面试中</p>
                <p className="text-xl font-bold text-amber-600">{stats.interviewing}</p>
              </div>
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">已拿Offer</p>
                <p className="text-xl font-bold text-green-600">{stats.offer}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">已拒绝</p>
                <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索公司或职位..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="researching">研究中</option>
                <option value="applied">已投递</option>
                <option value="interviewing">面试中</option>
                <option value="offer">已拿Offer</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">公司</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">职位</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">状态</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">投递日期</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">面试轮次</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedJobs.map(job => (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedJob?.id === job.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{job.companyName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-600">{job.position}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig[job.status].variant}>
                          <span className="flex items-center gap-1">
                            {statusConfig[job.status].icon}
                            {statusConfig[job.status].label}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {job.appliedDate || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {job.interviewDates.length > 0 ? (
                          <Badge variant="primary">{job.interviewDates.length} 轮</Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingJob(job);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个公司记录吗？')) {
                                handleDeleteJob(job.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedJobs.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无求职记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedJob ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <Card>
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedJob.companyName}</CardTitle>
                    <p className="text-slate-500 mt-1">{selectedJob.position}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={statusConfig[selectedJob.status].variant}>
                        <span className="flex items-center gap-1">
                          {statusConfig[selectedJob.status].icon}
                          {statusConfig[selectedJob.status].label}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {selectedJob.appliedDate && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">投递日期</p>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {selectedJob.appliedDate}
                        </p>
                      </div>
                    )}
                    {selectedJob.contactPerson && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">联系人</p>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <User className="w-4 h-4 text-slate-400" />
                          {selectedJob.contactPerson}
                        </p>
                      </div>
                    )}
                    {selectedJob.contactEmail && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 mb-1">联系邮箱</p>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {selectedJob.contactEmail}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">更新状态</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={selectedJob.status === status ? config.variant : 'secondary'}
                          onClick={() => handleStatusChange(selectedJob, status as ApplicationStatus)}
                        >
                          {config.icon}
                          {config.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-base">面试安排</CardTitle>
                  <Button size="sm" onClick={() => setIsInterviewModalOpen(true)}>
                    <PlusCircle className="w-4 h-4 mr-1" />
                    添加
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedJob.interviewDates.length > 0 ? (
                    <div className="space-y-2">
                      {selectedJob.interviewDates.map((date, index) => (
                        <div key={date} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary">第 {index + 1} 轮</Badge>
                            <span className="text-sm text-slate-600">{date}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveInterviewDate(date)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">暂无面试安排</p>
                  )}
                </CardContent>
              </Card>

              {selectedJob.researchNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">公司研究笔记</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{selectedJob.researchNotes}</p>
                  </CardContent>
                </Card>
              )}

              {selectedJob.companyCulture && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">公司文化</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{selectedJob.companyCulture}</p>
                  </CardContent>
                </Card>
              )}

              {selectedJob.keyProducts && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">主要产品</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{selectedJob.keyProducts}</p>
                  </CardContent>
                </Card>
              )}

              {selectedJob.followUpNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">跟进笔记</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{selectedJob.followUpNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择一个公司查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? '编辑公司信息' : '添加目标公司'}
        size="xl"
      >
        <JobForm
          initialData={editingJob}
          onSave={handleSaveJob}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="添加面试日期"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">面试日期</label>
            <input
              type="date"
              value={newInterviewDate}
              onChange={(e) => setNewInterviewDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsInterviewModalOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddInterviewDate}>
              添加
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const JobForm: React.FC<{
  initialData: JobApplication | null;
  onSave: (data: Partial<JobApplication>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    position: initialData?.position || '',
    researchNotes: initialData?.researchNotes || '',
    companyCulture: initialData?.companyCulture || '',
    keyProducts: initialData?.keyProducts || '',
    status: initialData?.status || 'researching' as ApplicationStatus,
    appliedDate: initialData?.appliedDate || '',
    contactPerson: initialData?.contactPerson || '',
    contactEmail: initialData?.contactEmail || '',
    followUpNotes: initialData?.followUpNotes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">公司名称</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：字节跳动"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">职位</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：前端工程师"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="researching">研究中</option>
            <option value="applied">已投递</option>
            <option value="interviewing">面试中</option>
            <option value="offer">已拿Offer</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">投递日期</label>
          <input
            type="date"
            value={formData.appliedDate}
            onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">联系人</label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="HR姓名"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">联系邮箱</label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="hr@company.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">公司研究笔记</label>
        <textarea
          value={formData.researchNotes}
          onChange={(e) => setFormData({ ...formData, researchNotes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="公司业务、技术栈、面试特点等..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">公司文化</label>
        <textarea
          value={formData.companyCulture}
          onChange={(e) => setFormData({ ...formData, companyCulture: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={2}
          placeholder="价值观、工作氛围等..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">主要产品</label>
        <textarea
          value={formData.keyProducts}
          onChange={(e) => setFormData({ ...formData, keyProducts: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={2}
          placeholder="公司的核心产品和业务..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">跟进笔记</label>
        <textarea
          value={formData.followUpNotes}
          onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="面试记录、后续安排、需要注意的事项..."
        />
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

export default JobsPage;
