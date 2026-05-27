import { ArrowLeft, Award, FileText, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';

export default function AchievementDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { achievements, users, projects } = useStore();
  const [showVersions, setShowVersions] = useState(false);

  const achievement = achievements.find((a) => a.id === parseInt(id || '0'));

  if (!achievement) {
    return (
      <div className="p-6">
        <p className="text-neutral-500">成果不存在</p>
        <button onClick={() => navigate('/achievements')} className="mt-4 btn-secondary">
          返回成果列表
        </button>
      </div>
    );
  }

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';
  const getProjectName = (projectId: number) => projects.find((p) => p.id === projectId)?.name || '未知项目';

  const typeLabels: Record<string, string> = {
    paper: '论文',
    patent: '专利',
    report: '报告',
  };

  const statusHistory = [
    { status: 'draft', label: '草稿', date: new Date(achievement.created_at).toLocaleDateString('zh-CN') },
  ];

  if (achievement.status === 'submitted') {
    statusHistory.push({ status: 'submitted', label: '已提交', date: '2024-04-15' });
  } else if (achievement.status === 'reviewing') {
    statusHistory.push({ status: 'submitted', label: '已提交', date: '2024-04-15' });
    statusHistory.push({ status: 'reviewing', label: '评审中', date: '2024-04-20' });
  } else if (achievement.status === 'accepted') {
    statusHistory.push({ status: 'submitted', label: '已提交', date: '2024-04-15' });
    statusHistory.push({ status: 'reviewing', label: '评审中', date: '2024-04-20' });
    statusHistory.push({ status: 'accepted', label: '已录用', date: '2024-05-10' });
  } else if (achievement.status === 'published') {
    statusHistory.push({ status: 'submitted', label: '已提交', date: '2024-01-15' });
    statusHistory.push({ status: 'reviewing', label: '评审中', date: '2024-01-20' });
    statusHistory.push({ status: 'accepted', label: '已录用', date: '2024-02-10' });
    statusHistory.push({ status: 'published', label: '已发表', date: '2024-02-15' });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/achievements')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{achievement.title}</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-neutral-500">{typeLabels[achievement.type]}</span>
            <StatusBadge status={achievement.status} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">关联项目</p>
              <p className="text-sm text-neutral-700">{getProjectName(achievement.project_id)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">负责人</p>
              <p className="text-sm text-neutral-700">{getUserName(achievement.created_by)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">创建时间</p>
              <p className="text-sm text-neutral-700">{new Date(achievement.created_at).toLocaleString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">更新时间</p>
              <p className="text-sm text-neutral-700">{new Date(achievement.updated_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">详细信息</h3>
          <p className="text-neutral-700">{achievement.details}</p>
        </div>

        <div className="card">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-semibold text-neutral-900">版本历史</h3>
            {showVersions ? (
              <ChevronUp className="w-5 h-5 text-neutral-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-500" />
            )}
          </button>
          {showVersions && achievement.versions.length > 0 && (
            <div className="mt-4 space-y-2">
              {achievement.versions.map((version) => (
                <div key={version.version_number} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">版本 {version.version_number}</p>
                    <p className="text-xs text-neutral-500">{version.file_name}</p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(version.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          )}
          {showVersions && achievement.versions.length === 0 && (
            <p className="mt-4 text-sm text-neutral-500 text-center py-4">暂无版本记录</p>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">状态流程</h3>
          <div className="relative pl-6">
            {statusHistory.map((item, index) => (
              <div key={index} className="relative">
                <div className="absolute left-[-22px] w-3 h-3 rounded-full bg-accent-600"></div>
                {index < statusHistory.length - 1 && (
                  <div className="absolute left-[-10px] top-4 w-0.5 h-full bg-accent-200"></div>
                )}
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{item.label}</span>
                    <span className="text-xs text-neutral-500">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate('/achievements')} className="btn-primary">
            返回列表
          </button>
        </div>
      </div>
    </div>
  );
}
