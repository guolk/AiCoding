import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  TrendingUp,
  X,
  Image,
  Send,
  Flame,
  Trophy,
  Clock,
  Construction,
  Route,
  Info,
} from 'lucide-react';
import { useCommunityStore } from '@/store/useCommunityStore';
import { ShareCard } from '@/components/business/ShareCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import type { CommunityFilters } from '@/types/community';
import { formatRelativeTime } from '@/utils/format';
import { mockRoutes } from '@/mock/routes';
import { mockUsers } from '@/mock/users';
import type { Share, RouteUpdate, UpdateType, ShareFormData, UpdateFormData } from '@/types/community';
import { updateTypeLabels, updateTypeColors, updateStatusLabels, updateStatusColors } from '@/types/community';

type TabType = 'all' | 'shares' | 'updates';

const tabs = [
  { id: 'all' as TabType, label: '全部动态' },
  { id: 'shares' as TabType, label: '路线分享' },
  { id: 'updates' as TabType, label: '路线更新' },
];

const updateTypeIcons: Record<UpdateType, React.ReactNode> = {
  construction: <Construction className="w-4 h-4" />,
  detour: <Route className="w-4 h-4" />,
  accident: <AlertTriangle className="w-4 h-4" />,
  other: <Info className="w-4 h-4" />,
};

const updateTypeBadgeVariants: Record<UpdateType, 'warning' | 'info' | 'danger' | 'default'> = {
  construction: 'warning',
  detour: 'info',
  accident: 'danger',
  other: 'default',
};

export default function Community() {
  const { shares, updates, loading, total, fetchCommunityFeed, createShare, createUpdate } = useCommunityStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const [shareForm, setShareForm] = useState<ShareFormData>({
    routeId: '',
    content: '',
    images: [],
  });

  const [updateForm, setUpdateForm] = useState<UpdateFormData>({
    routeId: '',
    type: 'construction',
    description: '',
    location: '',
  });

  const loadFeed = useCallback(async (pageNum: number, reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const filters: Partial<CommunityFilters> = {
      type: activeTab === 'shares' ? 'share' : activeTab === 'updates' ? 'update' : undefined,
      page: pageNum,
      limit: 5,
    };

    const result = await fetchCommunityFeed(filters);
    setTotalPages(result.totalPages);
    setHasMore(pageNum < result.totalPages);
    loadingRef.current = false;
  }, [activeTab, fetchCommunityFeed]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadFeed(1, true);
  }, [activeTab, loadFeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingRef.current) {
          setPage((prev) => {
            const nextPage = prev + 1;
            if (nextPage <= totalPages) {
              loadFeed(nextPage);
            }
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, totalPages, loadFeed]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleCreateShare = async () => {
    if (!shareForm.routeId || !shareForm.content.trim()) return;
    const success = await createShare(shareForm);
    if (success) {
      setShowShareModal(false);
      setShareForm({ routeId: '', content: '', images: [] });
      setPage(1);
      setHasMore(true);
      loadFeed(1, true);
    }
  };

  const handleCreateUpdate = async () => {
    if (!updateForm.routeId || !updateForm.description.trim() || !updateForm.location.trim()) return;
    const success = await createUpdate(updateForm);
    if (success) {
      setShowUpdateModal(false);
      setUpdateForm({ routeId: '', type: 'construction', description: '', location: '' });
      setPage(1);
      setHasMore(true);
      loadFeed(1, true);
    }
  };

  const combinedItems = [...shares, ...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayItems = activeTab === 'shares' ? shares : activeTab === 'updates' ? updates : combinedItems;

  const hotRoutes = [...mockRoutes].sort((a, b) => b.stats.totalRides - a.stats.totalRides).slice(0, 5);
  const activeUsers = [...mockUsers].sort((a, b) => b.totalRides - a.totalRides).slice(0, 5);

  const renderUpdateCard = (update: RouteUpdate) => (
    <Card key={update.id} className="w-full mb-4">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge
              variant={updateTypeBadgeVariants[update.type]}
              size="md"
              dot
              className="flex items-center gap-1.5"
            >
              {updateTypeIcons[update.type]}
              {updateTypeLabels[update.type]}
            </Badge>
            <Badge
              variant={update.status === 'confirmed' ? 'success' : update.status === 'resolved' ? 'default' : 'warning'}
              size="sm"
            >
              {updateStatusLabels[update.status]}
            </Badge>
          </div>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeTime(update.createdAt)}
          </span>
        </div>

        <h4 className="font-semibold text-gray-900 mb-2">{update.description}</h4>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{update.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>有效期至 {new Date(update.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <img
            src={update.reporter.avatar}
            alt={update.reporter.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600">
            由 <span className="font-medium text-gray-900">{update.reporter.username}</span> 报告
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const renderItem = (item: Share | RouteUpdate) => {
    if ('shareLink' in item) {
      return <ShareCard key={item.id} share={item} />;
    }
    return renderUpdateCard(item);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">社区广场</h1>
          <p className="text-gray-600">与骑友分享你的骑行故事，获取最新路线动态</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                size="md"
                onClick={() => handleTabChange(tab.id)}
                className="relative"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => setShowShareModal(true)}
            >
              <Plus className="w-5 h-5" />
              发布动态
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowUpdateModal(true)}
            >
              <AlertTriangle className="w-5 h-5" />
              提交更新
            </Button>
          </div>
        </motion.div>

        <div className="flex gap-6">
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {loading && page === 1 ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md h-64 animate-pulse">
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full" />
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="h-3 bg-gray-200 rounded w-32" />
                          </div>
                        </div>
                        <div className="h-20 bg-gray-200 rounded" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))
                ) : displayItems.length > 0 ? (
                  <>
                    {displayItems.map(renderItem)}

                    <div ref={observerRef} className="py-4">
                      {loading && page > 1 && (
                        <div className="flex justify-center">
                          <div className="flex items-center gap-2 text-gray-500">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            加载中...
                          </div>
                        </div>
                      )}
                      {!hasMore && displayItems.length > 0 && (
                        <div className="text-center text-gray-500 py-4">
                          已加载全部内容
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Card className="text-center py-16">
                    <CardContent>
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Flame className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">暂无动态</h3>
                      <p className="text-gray-500">快来发布第一条动态吧！</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    热门路线
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hotRoutes.map((route, index) => (
                    <Link
                      key={route.id}
                      to={`/routes/${route.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                          {route.name}
                        </h5>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {route.stats.totalRides} 次骑行
                        </p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    活跃用户
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                        />
                        {index < 3 && (
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate">
                          {user.username}
                          {user.role === 'verified' && (
                            <Badge variant="primary" size="sm" dot className="ml-1">认证</Badge>
                          )}
                        </h5>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {user.totalRides} 次骑行 · {user.totalDistance} 公里
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">发布动态</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShareModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关联路线
                  </label>
                  <select
                    value={shareForm.routeId}
                    onChange={(e) => setShareForm({ ...shareForm, routeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  >
                    <option value="">选择一条路线...</option>
                    {mockRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享内容
                  </label>
                  <textarea
                    value={shareForm.content}
                    onChange={(e) => setShareForm({ ...shareForm, content: e.target.value })}
                    placeholder="分享你的骑行故事、感受或建议..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添加图片
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-teal-300 transition-colors cursor-pointer">
                    <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">点击或拖拽上传图片</p>
                    <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式，最多 9 张</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" onClick={() => setShowShareModal(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateShare}
                  disabled={!shareForm.routeId || !shareForm.content.trim()}
                >
                  <Send className="w-4 h-4" />
                  发布
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">提交路线更新</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUpdateModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关联路线
                  </label>
                  <select
                    value={updateForm.routeId}
                    onChange={(e) => setUpdateForm({ ...updateForm, routeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  >
                    <option value="">选择一条路线...</option>
                    {mockRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    更新类型
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(updateTypeLabels) as UpdateType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setUpdateForm({ ...updateForm, type })}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          updateForm.type === type
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`${updateTypeColors[type]} text-white p-1.5 rounded-lg`}>
                          {updateTypeIcons[type]}
                        </span>
                        <span className="font-medium text-gray-900">
                          {updateTypeLabels[type]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    位置描述
                  </label>
                  <Input
                    placeholder="例如：建国门桥下、中关村大街..."
                    value={updateForm.location}
                    onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                    prefix={<MapPin className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    详细描述
                  </label>
                  <textarea
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                    placeholder="请详细描述路况信息，包括影响范围、预计持续时间、绕行建议等..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">温馨提示</p>
                      <p className="text-xs text-amber-700 mt-1">
                        请确保提交的信息真实准确，恶意提交虚假信息可能会被限制使用。信息有效期默认为14天。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" onClick={() => setShowUpdateModal(false)}>
                  取消
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCreateUpdate}
                  disabled={!updateForm.routeId || !updateForm.description.trim() || !updateForm.location.trim()}
                >
                  <Send className="w-4 h-4" />
                  提交
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
