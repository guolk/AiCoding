import { useState } from 'react';
import { ArrowLeft, BookOpen, User, Calendar, ExternalLink, BookMarked, Send, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function LiteratureDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { literature, users, readingProgress, readingReports, updateReadingProgress, addReadingReport, showToast, currentUser } = useStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [reportData, setReportData] = useState({ summary: '', key_points: [''], comments: '' });

  const lit = literature.find((l) => l.id === parseInt(id || '0'));
  const userProgress = readingProgress.find((rp) => rp.literature_id === parseInt(id || '0') && rp.user_id === currentUser?.id);
  const allReports = readingReports.filter((r) => r.literature_id === parseInt(id || '0'));

  if (!lit) {
    return (
      <div className="p-6">
        <p className="text-neutral-500">文献不存在</p>
        <button onClick={() => navigate('/literature')} className="mt-4 btn-secondary">
          返回文献列表
        </button>
      </div>
    );
  }

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  const handleProgressChange = () => {
    const status = progressValue === 100 ? 'finished' : progressValue > 0 ? 'reading' : 'unread';
    updateReadingProgress(lit.id, currentUser?.id || 1, progressValue, status);
    showToast('阅读进度更新成功', 'success');
  };

  const handleSubmitReport = () => {
    addReadingReport({
      literature_id: lit.id,
      user_id: currentUser?.id || 1,
      summary: reportData.summary,
      key_points: reportData.key_points.filter((k) => k.trim()),
      comments: reportData.comments,
    });
    showToast('阅读报告分享成功', 'success');
    setShowReportModal(false);
    setReportData({ summary: '', key_points: [''], comments: '' });
  };

  const addKeyPoint = () => {
    setReportData({ ...reportData, key_points: [...reportData.key_points, ''] });
  };

  const updateKeyPoint = (index: number, value: string) => {
    const keyPoints = [...reportData.key_points];
    keyPoints[index] = value;
    setReportData({ ...reportData, key_points: keyPoints });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/literature')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{lit.title}</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-neutral-500">
              <User className="w-4 h-4 inline mr-1" />
              {getUserName(lit.added_by)}
            </span>
            <span className="text-sm text-neutral-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(lit.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-start gap-4">
            <BookOpen className="w-12 h-12 text-accent-600 flex-shrink-0" />
            <div>
              <p className="text-neutral-700 mb-2">{lit.authors}</p>
              <p className="text-sm text-neutral-500 mb-1">{lit.journal}, {lit.year}</p>
              {lit.doi && (
                <p className="text-sm text-accent-600 flex items-center gap-1 mt-2">
                  <ExternalLink className="w-4 h-4" />
                  DOI: {lit.doi}
                </p>
              )}
              {lit.url && (
                <a href={lit.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 flex items-center gap-1 mt-1 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  查看原文
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">我的阅读进度</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-600">阅读进度</span>
                <span className="text-sm font-medium text-neutral-900">{progressValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progressValue}
                onChange={(e) => setProgressValue(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-accent-600"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <button onClick={handleProgressChange} className="btn-accent w-full">
              保存阅读进度
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">阅读报告</h3>
            <button onClick={() => setShowReportModal(true)} className="btn-secondary flex items-center gap-2">
              <Send className="w-4 h-4" />
              分享报告
            </button>
          </div>

          {allReports.length > 0 ? (
            <div className="space-y-4">
              {allReports.map((report) => (
                <div key={report.id} className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookMarked className="w-4 h-4 text-accent-600" />
                    <span className="font-medium text-neutral-900">{getUserName(report.user_id)} 的阅读报告</span>
                  </div>
                  <p className="text-sm text-neutral-700 mb-2">{report.summary}</p>
                  {report.key_points.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-neutral-500 mb-1">关键点:</p>
                      <ul className="text-sm text-neutral-700 list-disc list-inside space-y-1">
                        {report.key_points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.comments && (
                    <p className="text-sm text-neutral-600">{report.comments}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookMarked className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">暂无阅读报告</p>
              <p className="text-sm text-neutral-400">点击上方按钮分享您的阅读报告</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="分享阅读报告"
        footer={
          <>
            <button onClick={() => setShowReportModal(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmitReport} className="btn-primary">
              分享报告
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">报告摘要</label>
            <textarea
              value={reportData.summary}
              onChange={(e) => setReportData({ ...reportData, summary: e.target.value })}
              className="input-textarea"
              rows={3}
              placeholder="请简要总结文献内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">关键点</label>
            <div className="space-y-2">
              {reportData.key_points.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updateKeyPoint(index, e.target.value)}
                    className="input-field"
                    placeholder="输入关键点"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addKeyPoint}
              className="text-sm text-accent-600 hover:text-accent-700 mt-2 flex items-center gap-1"
            >
              <span>+</span> 添加关键点
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">评论/建议</label>
            <textarea
              value={reportData.comments}
              onChange={(e) => setReportData({ ...reportData, comments: e.target.value })}
              className="input-textarea"
              rows={2}
              placeholder="分享您的见解和建议"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
