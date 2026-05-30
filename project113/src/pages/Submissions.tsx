import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  Percent,
  DollarSign,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Modal, FormLabel, FormInput, FormTextarea, FormSelect } from '../components/Common/Modal';
import { useStore } from '../store/useStore';
import {
  formatDate,
  getDaysUntil,
  getStatusText,
  getSubmissionStatusLabel,
  getSubmissionStatusColor,
} from '../utils/dateUtils';
import { mockConferences, mockSubmissions, mockPapers } from '../utils/mockData';
import type { SubmissionStatus } from '../types';

const statusOptions: { value: SubmissionStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'preparing', label: '准备中' },
  { value: 'submitted', label: '已投稿' },
  { value: 'under_review', label: '在审' },
  { value: 'accepted', label: '接受' },
  { value: 'rejected', label: '拒绝' },
  { value: 'revision_requested', label: '修改后再投' },
];

const submissionStatusOptions: { value: SubmissionStatus; label: string }[] = [
  { value: 'preparing', label: '准备中' },
  { value: 'submitted', label: '已投稿' },
  { value: 'under_review', label: '在审' },
];

interface SubmissionFormData {
  conferenceName: string;
  organizer: string;
  acceptanceRate: string;
  deadline: string;
  notificationDate: string;
  publicationFee: string;
  website: string;
  conferenceNotes: string;
  paperTitle: string;
  paperAbstract: string;
  paperKeywords: string;
  submissionStatus: SubmissionStatus;
}

const initialFormData: SubmissionFormData = {
  conferenceName: '',
  organizer: '',
  acceptanceRate: '',
  deadline: '',
  notificationDate: '',
  publicationFee: '',
  website: '',
  conferenceNotes: '',
  paperTitle: '',
  paperAbstract: '',
  paperKeywords: '',
  submissionStatus: 'preparing',
};

export function Submissions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormData);

  const {
    conferences = [],
    submissions = [],
    papers = [],
    addConference,
    addPaper,
    addSubmission,
  } = useStore();

  const actualConferences = conferences.length > 0 ? conferences : mockConferences;
  const actualSubmissions = submissions.length > 0 ? submissions : mockSubmissions;
  const actualPapers = papers.length > 0 ? papers : mockPapers;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.conferenceName || !formData.paperTitle) {
      alert('请填写会议名称和论文标题');
      return;
    }

    const conferenceId = crypto.randomUUID();
    const paperId = crypto.randomUUID();
    const submissionId = crypto.randomUUID();

    const newConference = {
      id: conferenceId,
      name: formData.conferenceName,
      organizer: formData.organizer || '待定',
      acceptanceRate: parseFloat(formData.acceptanceRate) || 0,
      deadline: formData.deadline || new Date().toISOString().split('T')[0],
      notificationDate: formData.notificationDate || new Date().toISOString().split('T')[0],
      publicationFee: parseFloat(formData.publicationFee) || 0,
      website: formData.website || '',
      notes: formData.conferenceNotes || '',
      createdAt: new Date().toISOString(),
    };

    const newPaper = {
      id: paperId,
      title: formData.paperTitle,
      abstract: formData.paperAbstract || '',
      keywords: formData.paperKeywords
        ? formData.paperKeywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [],
      createdAt: new Date().toISOString(),
    };

    const newSubmission = {
      id: submissionId,
      conferenceId,
      paperId,
      status: formData.submissionStatus,
      submittedAt:
        formData.submissionStatus !== 'preparing' ? new Date().toISOString() : '',
      createdAt: new Date().toISOString(),
    };

    addConference(newConference);
    addPaper(newPaper);
    addSubmission(newSubmission);

    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  const filteredSubmissions = useMemo(() => {
    return actualSubmissions.filter((submission) => {
      const conference = actualConferences.find((c) => c.id === submission.conferenceId);
      const paper = actualPapers.find((p) => p.id === submission.paperId);

      const matchesSearch =
        !searchQuery ||
        conference?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper?.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [actualSubmissions, actualConferences, actualPapers, searchQuery, statusFilter]);

  return (
    <Layout title="会议投稿">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索会议或论文..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full sm:w-80"
              />
            </div>

            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | 'all')}
                className="pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            添加会议
          </button>
        </div>

        <div className="grid gap-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无符合条件的投稿</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                >
                  清除筛选
                </button>
              </Card.Body>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => {
              const conference = actualConferences.find(
                (c) => c.id === submission.conferenceId
              );
              const paper = actualPapers.find((p) => p.id === submission.paperId);
              const daysUntilDeadline = conference ? getDaysUntil(conference.deadline) : 0;

              return (
                <Card key={submission.id} hoverable>
                  <Card.Body>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {conference?.name || '未知会议'}
                              </h3>
                              <Badge className={getSubmissionStatusColor(submission.status)}>
                                {getSubmissionStatusLabel(submission.status)}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-500 mb-2">
                              <Building2 className="w-4 h-4 inline mr-1" />
                              {conference?.organizer}
                            </p>

                            {paper && (
                              <p className="text-gray-700 mb-3">
                                <span className="font-medium">论文：</span>
                                {paper.title}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center text-gray-500">
                                <Percent className="w-4 h-4 mr-1" />
                                录取率：{conference?.acceptanceRate || '-'}%
                              </div>
                              <div className="flex items-center text-gray-500">
                                <DollarSign className="w-4 h-4 mr-1" />
                                费用：¥{conference?.publicationFee || 0}
                              </div>
                              {conference?.website && (
                                <a
                                  href={conference.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sky-600 hover:text-sky-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  官网
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-48 flex lg:flex-col items-center lg:items-end gap-4">
                        <div className="text-center lg:text-right">
                          <p
                            className={`font-semibold ${
                              daysUntilDeadline < 0
                                ? 'text-gray-400'
                                : daysUntilDeadline <= 7
                                ? 'text-red-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {getStatusText(daysUntilDeadline)}
                          </p>
                          <p className="text-sm text-gray-500">
                            截止：{conference ? formatDate(conference.deadline) : '-'}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`会议详情: ${conference?.name}`);
                          }}
                          className="px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData(initialFormData);
        }}
        title="添加新投稿"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">会议信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="conferenceName" required>会议名称</FormLabel>
                <FormInput
                  id="conferenceName"
                  name="conferenceName"
                  value={formData.conferenceName}
                  onChange={handleInputChange}
                  placeholder="例如：IEEE International Conference on Computer Vision"
                />
              </div>
              <div>
                <FormLabel htmlFor="organizer">举办机构</FormLabel>
                <FormInput
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  placeholder="例如：IEEE Computer Society"
                />
              </div>
              <div>
                <FormLabel htmlFor="acceptanceRate">录取率 (%)</FormLabel>
                <FormInput
                  id="acceptanceRate"
                  name="acceptanceRate"
                  type="number"
                  value={formData.acceptanceRate}
                  onChange={handleInputChange}
                  placeholder="例如：25"
                />
              </div>
              <div>
                <FormLabel htmlFor="publicationFee">发表费用 (¥)</FormLabel>
                <FormInput
                  id="publicationFee"
                  name="publicationFee"
                  type="number"
                  value={formData.publicationFee}
                  onChange={handleInputChange}
                  placeholder="例如：3000"
                />
              </div>
              <div>
                <FormLabel htmlFor="deadline" required>投稿截止日期</FormLabel>
                <FormInput
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <FormLabel htmlFor="notificationDate">通知日期</FormLabel>
                <FormInput
                  id="notificationDate"
                  name="notificationDate"
                  type="date"
                  value={formData.notificationDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <FormLabel htmlFor="website">官网链接</FormLabel>
                <FormInput
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://"
                />
              </div>
              <div className="md:col-span-2">
                <FormLabel htmlFor="conferenceNotes">备注</FormLabel>
                <FormTextarea
                  id="conferenceNotes"
                  name="conferenceNotes"
                  value={formData.conferenceNotes}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="会议相关备注信息..."
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">论文信息</h4>
            <div className="space-y-4">
              <div>
                <FormLabel htmlFor="paperTitle" required>论文标题</FormLabel>
                <FormInput
                  id="paperTitle"
                  name="paperTitle"
                  value={formData.paperTitle}
                  onChange={handleInputChange}
                  placeholder="请输入论文标题"
                />
              </div>
              <div>
                <FormLabel htmlFor="paperAbstract">摘要</FormLabel>
                <FormTextarea
                  id="paperAbstract"
                  name="paperAbstract"
                  value={formData.paperAbstract}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="论文摘要..."
                />
              </div>
              <div>
                <FormLabel htmlFor="paperKeywords">关键词（逗号分隔）</FormLabel>
                <FormInput
                  id="paperKeywords"
                  name="paperKeywords"
                  value={formData.paperKeywords}
                  onChange={handleInputChange}
                  placeholder="例如：Deep Learning, Computer Vision, Image Recognition"
                />
              </div>
              <div>
                <FormLabel htmlFor="submissionStatus">投稿状态</FormLabel>
                <FormSelect
                  id="submissionStatus"
                  name="submissionStatus"
                  value={formData.submissionStatus}
                  onChange={handleInputChange}
                  options={submissionStatusOptions}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData(initialFormData);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
            >
              确认添加
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
