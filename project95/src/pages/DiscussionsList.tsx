import { useState } from 'react';
import { Plus, Search, MessageSquare, Clock, User, Tag, MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function DiscussionsList() {
  const navigate = useNavigate();
  const { discussions, users, deleteDiscussion, showToast, currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [discussionToDelete, setDiscussionToDelete] = useState<number | null>(null);

  const filteredDiscussions = discussions.filter((d) => {
    return d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  }).sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  const handleDelete = () => {
    if (discussionToDelete) {
      deleteDiscussion(discussionToDelete);
      showToast('讨论删除成功', 'success');
      setDeleteModalOpen(false);
      setDiscussionToDelete(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, discussionId: number) => {
    e.stopPropagation();
    setDiscussionToDelete(discussionId);
    setDeleteModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">技术讨论</h1>
          <p className="text-sm text-neutral-500">讨论技术问题，保留历史记录</p>
        </div>
        <button
          onClick={() => navigate('/discussions/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          发起讨论
        </button>
      </div>

      <div className="card">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索讨论话题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>

        <div className="space-y-4">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className="p-4 border border-neutral-100 rounded-xl hover:border-neutral-200 cursor-pointer transition-all"
                onClick={() => navigate(`/discussions/${discussion.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-accent-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-medium text-neutral-900 truncate">{discussion.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-neutral-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(discussion.created_at).toLocaleDateString('zh-CN')}
                        </span>
                        {currentUser?.id === discussion.created_by && (
                          <button
                            onClick={(e) => handleDeleteClick(e, discussion.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{discussion.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <User className="w-3 h-3" />
                        {getUserName(discussion.created_by)}
                      </span>
                      {discussion.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-neutral-400" />
                          {discussion.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <MessageCircle className="w-3 h-3" />
                        {discussion.replies.length} 回复
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-2">暂无讨论话题</p>
              <button
                onClick={() => navigate('/discussions/new')}
                className="btn-secondary"
              >
                发起第一个讨论
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDiscussionToDelete(null);
        }}
        title="确认删除"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDiscussionToDelete(null);
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleDelete} className="btn-primary">
              确认删除
            </button>
          </>
        }
      >
        <p className="text-neutral-700">确定要删除这个讨论吗？此操作无法撤销。</p>
      </Modal>
    </div>
  );
}
