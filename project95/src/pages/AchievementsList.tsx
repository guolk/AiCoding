import { useState } from 'react';
import { Plus, Search, Award, FileText, Calendar, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';

export default function AchievementsList() {
  const navigate = useNavigate();
  const { achievements, users, projects } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || achievement.type === filterType;
    return matchesSearch && matchesType;
  });

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';
  const getProjectName = (projectId: number) => projects.find((p) => p.id === projectId)?.name || '未知项目';

  const typeLabels: Record<string, string> = {
    paper: '论文',
    patent: '专利',
    report: '报告',
  };

  const typeIcons = {
    paper: FileText,
    patent: Award,
    report: FileText,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">成果管理</h1>
          <p className="text-sm text-neutral-500">追踪论文、专利和学术报告的进度</p>
        </div>
        <button
          onClick={() => navigate('/achievements/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建成果
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索成果..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">全部类型</option>
            <option value="paper">论文</option>
            <option value="patent">专利</option>
            <option value="report">报告</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const TypeIcon = typeIcons[achievement.type];
            return (
              <div
                key={achievement.id}
                className="p-4 border border-neutral-100 rounded-xl hover:border-accent-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/achievements/${achievement.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <span className="font-medium text-neutral-900">{achievement.title}</span>
                      <p className="text-xs text-neutral-500">{typeLabels[achievement.type]}</p>
                    </div>
                  </div>
                  <StatusBadge status={achievement.status} />
                </div>

                <p className="text-sm text-neutral-500 mb-3">{achievement.details}</p>

                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {getUserName(achievement.created_by)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {getProjectName(achievement.project_id)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(achievement.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                {achievement.versions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500">
                      版本数量: {achievement.versions.length}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="py-12 text-center">
            <Award className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">没有找到匹配的成果</p>
          </div>
        )}
      </div>
    </div>
  );
}
