import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Users,
  FileCheck,
  Clock,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { ProgressBar } from '../components/Common/ProgressBar';
import { Modal, FormLabel, FormInput, FormTextarea, FormSelect } from '../components/Common/Modal';
import { useStore } from '../store/useStore';
import { formatDateTime } from '../utils/dateUtils';
import {
  mockPapers,
  mockPaperVersions,
  mockCollaborators,
  mockChecklistItems,
} from '../utils/mockData';

interface PaperFormData {
  title: string;
  abstract: string;
  keywords: string;
  initialVersion: string;
}

const initialFormData: PaperFormData = {
  title: '',
  abstract: '',
  keywords: '',
  initialVersion: 'Draft v1',
};

const versionOptions = [
  { value: 'Draft v1', label: 'Draft v1' },
  { value: 'Draft v2', label: 'Draft v2' },
  { value: 'Final', label: 'Final' },
];

export function Papers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PaperFormData>(initialFormData);

  const {
    papers = [],
    paperVersions = [],
    collaborators = [],
    checklistItems = [],
    addPaper,
    addPaperVersion,
  } = useStore();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      alert('请填写论文标题');
      return;
    }

    const paperId = crypto.randomUUID();

    const newPaper = {
      id: paperId,
      title: formData.title,
      abstract: formData.abstract || '',
      keywords: formData.keywords
        ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [],
      createdAt: new Date().toISOString(),
    };

    const newVersion = {
      id: crypto.randomUUID(),
      paperId,
      version: formData.initialVersion,
      filePath: '',
      changes: '初始版本',
      createdAt: new Date().toISOString(),
    };

    addPaper(newPaper);
    addPaperVersion(newVersion);

    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  const actualPapers = papers.length > 0 ? papers : mockPapers;
  const actualVersions = paperVersions.length > 0 ? paperVersions : mockPaperVersions;
  const actualCollaborators = collaborators.length > 0 ? collaborators : mockCollaborators;
  const actualChecklistItems = checklistItems.length > 0 ? checklistItems : mockChecklistItems;

  const filteredPapers = useMemo(() => {
    if (!searchQuery) return actualPapers;
    return actualPapers.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [actualPapers, searchQuery]);

  return (
    <Layout title="论文管理">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索论文标题或关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full sm:w-96"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            新建论文
          </button>
        </div>

        <div className="grid gap-6">
          {filteredPapers.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无论文</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                >
                  创建第一篇论文
                </button>
              </Card.Body>
            </Card>
          ) : (
            filteredPapers.map((paper) => {
              const paperCollaborators = actualCollaborators.filter(
                (c) => c.paperId === paper.id
              );
              const paperVersions = actualVersions
                .filter((v) => v.paperId === paper.id)
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              const paperChecklist = actualChecklistItems.filter(
                (c) => c.paperId === paper.id
              );
              const latestVersion = paperVersions[0];
              const completedChecklist = paperChecklist.filter((c) => c.completed).length;
              const totalChecklist = paperChecklist.length;
              const checklistProgress =
                totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

              return (
                <Card key={paper.id} hoverable>
                  <Card.Body>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {paper.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {paper.abstract}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {paper.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {keyword}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {paperCollaborators.length} 位合作者
                          </div>
                          <div className="flex items-center">
                            <FileCheck className="w-4 h-4 mr-2" />
                            {paperVersions.length} 个版本
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            创建于 {formatDateTime(paper.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-64 flex flex-col justify-between gap-4">
                        <div>
                          {latestVersion && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-500 mb-1">最新版本</p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-sky-100 text-sky-800">
                                  {latestVersion.version}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {formatDateTime(latestVersion.createdAt)}
                                </span>
                              </div>
                            </div>
                          )}

                          {totalChecklist > 0 && (
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">格式检查</span>
                                <span className="font-medium text-gray-900">
                                  {completedChecklist}/{totalChecklist}
                                </span>
                              </div>
                              <ProgressBar progress={checklistProgress} />
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`论文详情: ${paper.title}`);
                          }}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          查看详情
                          <ChevronRight className="w-4 h-4 ml-1" />
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
        title="新建论文"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="title" required>论文标题</FormLabel>
              <FormInput
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入论文标题"
              />
            </div>
            <div>
              <FormLabel htmlFor="abstract">摘要</FormLabel>
              <FormTextarea
                id="abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                rows={4}
                placeholder="论文摘要..."
              />
            </div>
            <div>
              <FormLabel htmlFor="keywords">关键词（逗号分隔）</FormLabel>
              <FormInput
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="例如：Deep Learning, Computer Vision, Image Recognition"
              />
            </div>
            <div>
              <FormLabel htmlFor="initialVersion">初始版本</FormLabel>
              <FormSelect
                id="initialVersion"
                name="initialVersion"
                value={formData.initialVersion}
                onChange={handleInputChange}
                options={versionOptions}
              />
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
              确认创建
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
