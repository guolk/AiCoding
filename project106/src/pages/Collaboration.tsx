import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../store';
import { VolunteerTask, ForumPost, SharingPost, TaskType, TaskStatus, ForumCategory, SharingStatus } from '../types';
import { Plus, Users, MessageSquare, Share2, Calendar, Clock, MapPin, Heart, Send, Leaf, Droplets, Trash2, UserPlus } from 'lucide-react';
import { collaborationAPI } from '../api/client';

type TabType = 'tasks' | 'sharing' | 'forum';

export default function Collaboration() {
  const { tasks, posts, sharingPosts, currentUser, fetchAllData, updateTaskLocal, updatePostLocal, updateSharingPostLocal } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<VolunteerTask | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    type: 'other' as TaskType, 
    date: '', 
    time: '', 
    location: '', 
    description: '', 
    status: 'pending' as TaskStatus 
  });
  const [sharingForm, setSharingForm] = useState({ crop: '', quantity: 0, unit: 'kg', pickupLocation: '', description: '' });
  const [postForm, setPostForm] = useState({ title: '', content: '', category: 'general' as ForumCategory });
  const [commentForm, setCommentForm] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleCreateTask = useCallback(async () => {
    const { title, date, time, location } = taskForm;
    
    if (!title.trim()) {
      alert('请填写任务标题');
      return;
    }
    if (!date) {
      alert('请选择日期');
      return;
    }
    if (!time) {
      alert('请选择时间');
      return;
    }
    if (!location.trim()) {
      alert('请填写地点');
      return;
    }

    setIsCreatingTask(true);
    
    try {
      const res = await collaborationAPI.createTask({ 
        ...taskForm, 
        assignedTo: [] 
      });
      
      if (res.success && res.data) {
        const tasksRes = await collaborationAPI.getTasks();
        if (tasksRes.data) {
          useStore.getState().setTasks(tasksRes.data);
        }
        setShowTaskModal(false);
        setTaskForm({ 
          title: '', 
          type: 'other', 
          date: '', 
          time: '', 
          location: '', 
          description: '', 
          status: 'pending' 
        });
        alert('任务发布成功！');
      } else {
        alert('发布失败: ' + (res.error || '未知错误'));
      }
    } catch (err) {
      alert('发布失败: 网络错误');
      console.error('Create task error:', err);
    } finally {
      setIsCreatingTask(false);
    }
  }, [taskForm]);

  const handleJoinTask = async (task: VolunteerTask) => {
    if (task.assignedTo.includes(currentUser.name)) {
      const res = await collaborationAPI.unassignTask(task.id, currentUser.name);
      if (res.data) updateTaskLocal(res.data);
    } else {
      const res = await collaborationAPI.assignTask(task.id, currentUser.name);
      if (res.data) updateTaskLocal(res.data);
    }
  };

  const handleUpdateTaskStatus = async (task: VolunteerTask, status: TaskStatus) => {
    const res = await collaborationAPI.updateTask(task.id, { status });
    if (res.data) updateTaskLocal(res.data);
  };

  const handleCreateSharing = async () => {
    if (!sharingForm.crop || sharingForm.quantity <= 0 || !sharingForm.pickupLocation) return;
    const res = await collaborationAPI.createSharingPost({
      crop: sharingForm.crop,
      quantity: sharingForm.quantity,
      unit: sharingForm.unit,
      author: currentUser.name,
      pickupLocation: sharingForm.pickupLocation,
      description: sharingForm.description
    });
    if (res.success && res.data) {
      const postsRes = await collaborationAPI.getSharingPosts();
      if (postsRes.data) useStore.getState().setSharingPosts(postsRes.data);
      setShowSharingModal(false);
      setSharingForm({ crop: '', quantity: 0, unit: 'kg', pickupLocation: '', description: '' });
    }
  };

  const handleClaimSharing = async (post: SharingPost) => {
    const newStatus: SharingStatus = post.status === 'available' ? 'pending_pickup' : post.status === 'pending_pickup' ? 'taken' : 'available';
    const res = await collaborationAPI.updateSharingStatus(post.id, newStatus);
    if (res.data) updateSharingPostLocal(res.data);
  };

  const handleCreatePost = async () => {
    if (!postForm.title || !postForm.content) return;
    const res = await collaborationAPI.createPost({
      title: postForm.title,
      content: postForm.content,
      author: currentUser.name,
      category: postForm.category
    });
    if (res.success && res.data) {
      const postsRes = await collaborationAPI.getPosts();
      if (postsRes.data) useStore.getState().setPosts(postsRes.data);
      setShowPostModal(false);
      setPostForm({ title: '', content: '', category: 'general' });
    }
  };

  const handleLikePost = async (post: ForumPost) => {
    const res = await collaborationAPI.likePost(post.id);
    if (res.data) updatePostLocal(res.data);
  };

  const handleAddComment = async () => {
    if (!selectedPost || !commentForm.trim()) return;
    const res = await collaborationAPI.addComment(selectedPost.id, { author: currentUser.name, content: commentForm });
    if (res.success) {
      const postRes = await collaborationAPI.getPostById(selectedPost.id);
      if (postRes.data) {
        updatePostLocal(postRes.data);
        setSelectedPost(postRes.data);
      }
      setCommentForm('');
    }
  };

  const tabs = [
    { id: 'tasks' as TabType, label: '志愿任务', icon: Calendar, badge: tasks.filter(t => t.status !== 'completed').length },
    { id: 'sharing' as TabType, label: '作物共享', icon: Share2, badge: sharingPosts.filter(s => s.status === 'available').length },
    { id: 'forum' as TabType, label: '经验交流', icon: MessageSquare, badge: posts.length },
  ];

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'lawn_maint': return <Leaf className="w-5 h-5" />;
      case 'watering': return <Droplets className="w-5 h-5" />;
      case 'cleanup': return <Trash2 className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getTaskTypeLabel = (type: TaskType) => {
    const labels = { lawn_maint: '草坪维护', watering: '浇水', cleanup: '清洁', other: '其他' };
    return labels[type];
  };

  const getTaskStatusLabel = (status: TaskStatus) => {
    const labels = { pending: '待开始', in_progress: '进行中', completed: '已完成' };
    return labels[status];
  };

  const getTaskStatusColor = (status: TaskStatus) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700'
    };
    return colors[status];
  };

  const getCategoryLabel = (category: ForumCategory) => {
    const labels = { fertilizer: '肥料', pest: '病虫害', tips: '技巧', general: '综合' };
    return labels[category];
  };

  const getCategoryColor = (category: ForumCategory) => {
    const colors = {
      fertilizer: 'bg-green-100 text-green-700',
      pest: 'bg-red-100 text-red-700',
      tips: 'bg-blue-100 text-blue-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[category];
  };

  const getSharingStatusLabel = (status: SharingStatus) => {
    const labels = { available: '可领取', pending_pickup: '待领取', taken: '已领取' };
    return labels[status];
  };

  const getSharingStatusColor = (status: SharingStatus) => {
    const colors = {
      available: 'bg-green-100 text-green-700',
      pending_pickup: 'bg-amber-100 text-amber-700',
      taken: 'bg-gray-100 text-gray-500'
    };
    return colors[status];
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">社区协作</h2>
          <p className="text-gray-500">组织活动、分享经验、共享收获</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'tasks') setShowTaskModal(true);
            else if (activeTab === 'sharing') setShowSharingModal(true);
            else setShowPostModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'tasks' ? '发布任务' : activeTab === 'sharing' ? '发布共享' : '发布帖子'}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-garden-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-garden-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-garden-100 text-garden-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length > 0 ? tasks.map((task) => (
            <div key={task.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    task.type === 'lawn_maint' ? 'bg-green-100 text-green-600' :
                    task.type === 'watering' ? 'bg-blue-100 text-blue-600' :
                    task.type === 'cleanup' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getTaskTypeIcon(task.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-800">{task.title}</h3>
                      <span className={`status-badge ${getTaskStatusColor(task.status)}`}>
                        {getTaskStatusLabel(task.status)}
                      </span>
                      <span className="status-badge bg-gray-100 text-gray-600">
                        {getTaskTypeLabel(task.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {task.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {task.location}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                    )}
                    {task.assignedTo.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          已报名: {task.assignedTo.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleJoinTask(task)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                      task.assignedTo.includes(currentUser.name)
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-garden-50 text-garden-700 hover:bg-garden-100'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {task.assignedTo.includes(currentUser.name) ? '取消报名' : '报名参加'}
                  </button>
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task, task.status === 'pending' ? 'in_progress' : 'completed')}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100"
                    >
                      {task.status === 'pending' ? '开始任务' : '完成任务'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="card p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-display text-lg font-bold text-gray-800 mb-2">暂无志愿任务</h3>
              <p className="text-gray-500">点击上方按钮发布新任务</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sharing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharingPosts.length > 0 ? sharingPosts.map((post) => (
            <div key={post.id} className={`card p-6 ${post.status === 'taken' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-800">{post.crop}</h3>
                  <p className="text-sm text-gray-500">{post.quantity} {post.unit}</p>
                </div>
                <span className={`status-badge ${getSharingStatusColor(post.status)}`}>
                  {getSharingStatusLabel(post.status)}
                </span>
              </div>
              {post.description && (
                <p className="text-sm text-gray-600 mb-3">{post.description}</p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <UserPlus className="w-4 h-4" />
                  提供者: {post.author}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  领取地点: {post.pickupLocation}
                </div>
              </div>
              {post.status !== 'taken' && (
                <button
                  onClick={() => handleClaimSharing(post)}
                  className="w-full mt-4 btn-primary text-sm"
                >
                  {post.status === 'available' ? '我要领取' : '确认领取'}
                </button>
              )}
            </div>
          )) : (
            <div className="col-span-full card p-12 text-center">
              <Share2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-display text-lg font-bold text-gray-800 mb-2">暂无共享作物</h3>
              <p className="text-gray-500">有多余的作物？分享给邻居们吧！</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'forum' && !selectedPost && (
        <div className="space-y-4">
          {posts.length > 0 ? posts.map((post) => (
            <div key={post.id} className="card p-6 cursor-pointer hover:border-garden-300" onClick={() => setSelectedPost(post)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${getCategoryColor(post.category)}`}>
                      {getCategoryLabel(post.category)}
                    </span>
                    <h3 className="font-medium text-gray-800">{post.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{post.author} · {new Date(post.createdAt).toLocaleDateString('zh-CN')}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLikePost(post); }}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  {post.likes}
                </button>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {post.comments.length} 评论
                </span>
              </div>
            </div>
          )) : (
            <div className="card p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-display text-lg font-bold text-gray-800 mb-2">暂无讨论</h3>
              <p className="text-gray-500">发布第一个帖子，和大家交流经验吧！</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'forum' && selectedPost && (
        <div>
          <button onClick={() => setSelectedPost(null)} className="text-gray-600 hover:text-garden-700 mb-4 flex items-center gap-2">
            ← 返回列表
          </button>
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`status-badge ${getCategoryColor(selectedPost.category)}`}>
                {getCategoryLabel(selectedPost.category)}
              </span>
              <h2 className="font-display text-xl font-bold text-gray-800">{selectedPost.title}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedPost.author} · {new Date(selectedPost.createdAt).toLocaleDateString('zh-CN')}</p>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => handleLikePost(selectedPost)} className="flex items-center gap-1 text-gray-500 hover:text-red-500">
                <Heart className="w-4 h-4" />
                {selectedPost.likes} 赞
              </button>
              <span className="text-gray-500">{selectedPost.comments.length} 评论</span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-medium text-gray-800 mb-4">评论 ({selectedPost.comments.length})</h3>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={commentForm}
                onChange={(e) => setCommentForm(e.target.value)}
                placeholder="写下你的评论..."
                className="input-field flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button onClick={handleAddComment} className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" />
                发送
              </button>
            </div>
            <div className="space-y-4">
              {selectedPost.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-garden-100 flex items-center justify-center text-garden-700 font-bold text-sm flex-shrink-0">
                    {comment.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
              {selectedPost.comments.length === 0 && (
                <p className="text-center text-gray-500 py-4">暂无评论，快来抢沙发！</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">发布志愿任务</h3>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
                <input 
                  type="text" 
                  value={taskForm.title} 
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} 
                  className="input-field" 
                  placeholder="例如：公共草坪修剪" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务类型</label>
                  <select 
                    value={taskForm.type} 
                    onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value as TaskType })} 
                    className="input-field"
                  >
                    <option value="lawn_maint">草坪维护</option>
                    <option value="watering">浇水</option>
                    <option value="cleanup">清洁</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select 
                    value={taskForm.status} 
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })} 
                    className="input-field"
                  >
                    <option value="pending">待开始</option>
                    <option value="in_progress">进行中</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input 
                    type="date" 
                    value={taskForm.date} 
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })} 
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时间</label>
                  <input 
                    type="time" 
                    value={taskForm.time} 
                    onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })} 
                    className="input-field" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
                <input 
                  type="text" 
                  value={taskForm.location} 
                  onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })} 
                  className="input-field" 
                  placeholder="例如：花园北侧草坪" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea 
                  value={taskForm.description} 
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} 
                  className="input-field h-24 resize-none" 
                  placeholder="任务详细说明..." 
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowTaskModal(false)} 
                className="btn-secondary"
                disabled={isCreatingTask}
              >
                取消
              </button>
              <button 
                onClick={handleCreateTask} 
                className="btn-primary"
                disabled={isCreatingTask}
              >
                {isCreatingTask ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSharingModal && (
        <div className="modal-backdrop" onClick={() => setShowSharingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">发布共享作物</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
                <input 
                  type="text" 
                  value={sharingForm.crop} 
                  onChange={(e) => setSharingForm({ ...sharingForm, crop: e.target.value })} 
                  className="input-field" 
                  placeholder="例如：黄瓜、番茄" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                  <input 
                    type="number" 
                    value={sharingForm.quantity} 
                    onChange={(e) => setSharingForm({ ...sharingForm, quantity: parseFloat(e.target.value) })} 
                    className="input-field" 
                    min="0" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <select 
                    value={sharingForm.unit} 
                    onChange={(e) => setSharingForm({ ...sharingForm, unit: e.target.value })} 
                    className="input-field"
                  >
                    <option value="kg">千克</option>
                    <option value="g">克</option>
                    <option value="个">个</option>
                    <option value="束">束</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">领取地点</label>
                <input 
                  type="text" 
                  value={sharingForm.pickupLocation} 
                  onChange={(e) => setSharingForm({ ...sharingForm, pickupLocation: e.target.value })} 
                  className="input-field" 
                  placeholder="例如：花园入口工具房" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea 
                  value={sharingForm.description} 
                  onChange={(e) => setSharingForm({ ...sharingForm, description: e.target.value })} 
                  className="input-field h-24 resize-none" 
                  placeholder="作物介绍..." 
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowSharingModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleCreateSharing} className="btn-primary" disabled={!sharingForm.crop || sharingForm.quantity <= 0 || !sharingForm.pickupLocation}>发布</button>
            </div>
          </div>
        </div>
      )}

      {showPostModal && (
        <div className="modal-backdrop" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">发布帖子</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select 
                  value={postForm.category} 
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value as ForumCategory })} 
                  className="input-field"
                >
                  <option value="fertilizer">肥料相关</option>
                  <option value="pest">病虫害防治</option>
                  <option value="tips">种植技巧</option>
                  <option value="general">综合讨论</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input 
                  type="text" 
                  value={postForm.title} 
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} 
                  className="input-field" 
                  placeholder="帖子标题" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea 
                  value={postForm.content} 
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} 
                  className="input-field h-40 resize-none" 
                  placeholder="分享你的种植经验..." 
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowPostModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleCreatePost} className="btn-primary" disabled={!postForm.title || !postForm.content}>发布</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
