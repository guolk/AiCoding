import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Globe,
  Building2,
  Target,
  MessageSquare,
  Calendar,
  Filter,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { useStore } from '../store/useStore';
import {
  formatDate,
  getCollaborationPotentialLabel,
  getCollaborationPotentialColor,
  getCollaborationStatusLabel,
  getCollaborationStatusColor,
} from '../utils/dateUtils';
import {
  mockScholars,
  mockCollaborationIntents,
  mockConferenceNotes,
  mockConferences,
} from '../utils/mockData';

const potentialOptions = [
  { value: 'all', label: '全部合作潜力' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export function Network() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scholars' | 'collaborations' | 'notes'>('scholars');
  const [searchQuery, setSearchQuery] = useState('');
  const [potentialFilter, setPotentialFilter] = useState('all');

  const {
    scholars = [],
    collaborationIntents = [],
    conferenceNotes = [],
    conferences = [],
  } = useStore();

  const actualScholars = scholars.length > 0 ? scholars : mockScholars;
  const actualIntents = collaborationIntents.length > 0 ? collaborationIntents : mockCollaborationIntents;
  const actualNotes = conferenceNotes.length > 0 ? conferenceNotes : mockConferenceNotes;
  const actualConferences = conferences.length > 0 ? conferences : mockConferences;

  const filteredScholars = useMemo(() => {
    return actualScholars.filter((scholar) => {
      const matchesSearch =
        !searchQuery ||
        scholar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholar.affiliation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholar.researchArea.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPotential =
        potentialFilter === 'all' || scholar.collaborationPotential === potentialFilter;

      return matchesSearch && matchesPotential;
    });
  }, [actualScholars, searchQuery, potentialFilter]);

  return (
    <Layout title="学术网络">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('scholars')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'scholars'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            学者名片 ({actualScholars.length})
          </button>
          <button
            onClick={() => setActiveTab('collaborations')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'collaborations'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            合作意向 ({actualIntents.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            会议笔记 ({actualNotes.length})
          </button>
        </div>

        {activeTab === 'scholars' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索学者..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full sm:w-72"
                  />
                </div>

                <div className="relative">
                  <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={potentialFilter}
                    onChange={(e) => setPotentialFilter(e.target.value)}
                    className="pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {potentialOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => alert('添加学者功能')}
                className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                添加学者
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScholars.length === 0 ? (
                <Card className="col-span-full">
                  <Card.Body className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无符合条件的学者</p>
                  </Card.Body>
                </Card>
              ) : (
                filteredScholars.map((scholar) => (
                  <Card key={scholar.id}>
                    <Card.Body>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {scholar.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{scholar.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Building2 className="w-3 h-3 mr-1" />
                              {scholar.affiliation}
                            </p>
                          </div>
                        </div>
                        <Badge className={getCollaborationPotentialColor(scholar.collaborationPotential)}>
                          合作潜力：{getCollaborationPotentialLabel(scholar.collaborationPotential)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700">研究方向：</span>
                          {scholar.researchArea}
                        </p>

                        <div className="flex flex-wrap gap-2 text-sm">
                          {scholar.email && (
                            <a
                              href={`mailto:${scholar.email}`}
                              className="flex items-center text-gray-500 hover:text-sky-600"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              邮箱
                            </a>
                          )}
                          {scholar.phone && (
                            <a
                              href={`tel:${scholar.phone}`}
                              className="flex items-center text-gray-500 hover:text-sky-600"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              电话
                            </a>
                          )}
                          {scholar.website && (
                            <a
                              href={scholar.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-500 hover:text-sky-600"
                            >
                              <Globe className="w-4 h-4 mr-1" />
                              主页
                            </a>
                          )}
                        </div>

                        {scholar.conferenceMetAt && (
                          <p className="text-xs text-gray-400">
                            认识于：{scholar.conferenceMetAt}
                          </p>
                        )}

                        {scholar.notes && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              <MessageSquare className="w-4 h-4 inline mr-1 text-gray-400" />
                              {scholar.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'collaborations' && (
          <div className="space-y-4">
            {actualIntents.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">暂无合作意向</p>
                  <p className="text-sm text-gray-400">
                    记录您的合作项目跟进情况
                  </p>
                </Card.Body>
              </Card>
            ) : (
              actualIntents.map((intent) => {
                const scholar = actualScholars.find((s) => s.id === intent.scholarId);

                return (
                  <Card key={intent.id}>
                    <Card.Body>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {scholar?.name.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{intent.topic}</h3>
                              <Badge className={getCollaborationStatusColor(intent.status)}>
                                {getCollaborationStatusLabel(intent.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              合作学者：{scholar?.name || '未知'}
                              {scholar?.affiliation && ` · ${scholar.affiliation}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          {intent.followUpDate && (
                            <div className="flex items-center text-gray-500">
                              <Calendar className="w-4 h-4 mr-2" />
                              跟进日期：{formatDate(intent.followUpDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      {intent.nextSteps && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <span className="font-medium">下一步：</span>
                            {intent.nextSteps}
                          </p>
                        </div>
                      )}

                      {intent.notes && (
                        <p className="mt-3 text-sm text-gray-600">{intent.notes}</p>
                      )}
                    </Card.Body>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="grid gap-4">
            {actualNotes.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">暂无会议笔记</p>
                  <p className="text-sm text-gray-400">
                    记录参会心得和学习笔记
                  </p>
                </Card.Body>
              </Card>
            ) : (
              actualNotes.map((note) => {
                const conference = actualConferences.find((c) => c.id === note.conferenceId);

                return (
                  <Card key={note.id}>
                    <Card.Body>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{note.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {conference?.name || '未关联会议'}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>

                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
