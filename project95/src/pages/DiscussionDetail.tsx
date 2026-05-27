import { useState } from 'react';
import { ArrowLeft, MessageCircle, Clock, User, Tag, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function DiscussionDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { discussions, users, addReply, showToast, currentUser } = useStore();
  const [replyContent, setReplyContent] = useState('');

  const discussion = discussions.find((d) => d.id === parseInt(id || '0'));

  if (!discussion) {
    return (
      <div className="p-6">
        <p className="text-neutral-500">讨论不存在</p>
        <button onClick={() => navigate('/discussions')} className="mt-4 btn-secondary">
          返回讨论列表
        </button>
      </div>
    );
  }

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  const handleSubmitReply = () => {
    if (!replyContent.trim()) {
      showToast('请输入回复内容', 'error');
      return;
    }
    addReply(discussion.id, { content: replyContent, created_by: currentUser?.id || 1 });
    showToast('回复成功', 'success');
    setReplyContent('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/discussions')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{discussion.title}</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-neutral-500">
              <User className="w-4 h-4 inline mr-1" />
              {getUserName(discussion.created_by)}
            </span>
            <span className="text-sm text-neutral-500">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date(discussion.created_at).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-accent-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-neutral-900">{getUserName(discussion.created_by)}</span>
                <span className="text-xs text-neutral-400">{new Date(discussion.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-neutral-700 whitespace-pre-wrap">{discussion.content}</p>
              {discussion.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Tag className="w-4 h-4 text-neutral-400" />
                  {discussion.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-neutral-400" />
            回复 ({discussion.replies.length})
          </h3>

          <div className="space-y-4">
            {discussion.replies.length > 0 ? (
              discussion.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="flex-1 bg-neutral-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-900">{getUserName(reply.created_by)}</span>
                      <span className="text-xs text-neutral-400">{new Date(reply.created_at).toLocaleString('zh-CN')}</span>
                    </div>
                    <p className="text-sm text-neutral-700">{reply.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">暂无回复</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="input-textarea mb-4"
              rows={3}
              placeholder="写下你的回复..."
            />
            <div className="flex justify-end">
              <button onClick={handleSubmitReply} className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" />
                回复
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
