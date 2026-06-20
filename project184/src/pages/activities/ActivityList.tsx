import { useState, useMemo } from "react";
import {
  Calendar,
  MapPin,
  User,
  Wallet,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import {
  formatDate,
  formatCurrency,
  generateId,
  getStatusLabel,
  getStatusColor,
} from "@/utils";
import type { Activity, ActivityStatus } from "@/types";

const statusFilters: { value: ActivityStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "planning", label: "筹备中" },
  { value: "ongoing", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

const initialFormData: Omit<Activity, "id"> = {
  name: "",
  date: "",
  location: "",
  organizer: "",
  budget: 0,
  participantCount: 0,
  maxParticipants: 0,
  status: "planning",
  description: "",
};

export default function ActivityList() {
  const { activities, addActivity, updateActivity, deleteActivity } =
    useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<Omit<Activity, "id">>(
    initialFormData
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || activity.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activities, searchTerm, statusFilter]);

  const handleAdd = () => {
    setEditingActivity(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      date: activity.date,
      location: activity.location,
      organizer: activity.organizer,
      budget: activity.budget,
      participantCount: activity.participantCount,
      maxParticipants: activity.maxParticipants || 0,
      status: activity.status,
      description: activity.description || "",
    });
    setIsModalOpen(true);
  };

  const handleView = (activity: Activity) => {
    setViewingActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteActivity(id);
    setShowDeleteConfirm(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingActivity) {
      updateActivity(editingActivity.id, formData);
    } else {
      const newActivity: Activity = {
        ...formData,
        id: generateId("act"),
      };
      addActivity(newActivity);
    }
    setIsModalOpen(false);
  };

  const getBadgeVariant = (status: string) => {
    const color = getStatusColor(status);
    const variantMap: Record<string, "success" | "warning" | "info" | "gray" | "danger"> = {
      green: "success",
      yellow: "warning",
      blue: "info",
      gray: "gray",
      red: "danger",
    };
    return variantMap[color] || "gray";
  };

  const stats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter((a) => a.status === "completed").length;
    const planning = activities.filter((a) => a.status === "planning").length;
    const ongoing = activities.filter((a) => a.status === "ongoing").length;
    return { total, completed, planning, ongoing };
  }, [activities]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            活动管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理社团所有活动档案
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增活动
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">活动总数</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.total}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">筹备中</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {stats.planning}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">进行中</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.ongoing}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">已完成</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.completed}
          </p>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                筛选
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索活动名称、地点、负责人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      statusFilter === filter.value
                        ? "bg-primary-800 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无活动数据</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map((activity) => (
                <Card
                  key={activity.id}
                  hover
                  className="overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-primary-800 to-primary-500" />
                  <Card.Body className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1">
                        {activity.name}
                      </h3>
                      <Badge variant={getBadgeVariant(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span>{formatDate(activity.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span>{activity.organizer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span>{formatCurrency(activity.budget)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span>
                          {activity.participantCount}
                          {activity.maxParticipants
                            ? ` / ${activity.maxParticipants} 人`
                            : " 人"}
                        </span>
                      </div>
                    </div>

                    {activity.maxParticipants && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>报名进度</span>
                          <span>
                            {Math.round(
                              (activity.participantCount /
                                activity.maxParticipants) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-800 to-primary-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                (activity.participantCount /
                                  activity.maxParticipants) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(activity)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteConfirm(activity.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? "编辑活动" : "新增活动"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                活动名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入活动名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                活动状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ActivityStatus,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="planning">筹备中</option>
                <option value="ongoing">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                活动日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                活动地点
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入活动地点"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                负责部门/人
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) =>
                  setFormData({ ...formData, organizer: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入负责部门或负责人"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                预算 (元)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                已参与人数
              </label>
              <input
                type="number"
                value={formData.participantCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    participantCount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                最大参与人数
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxParticipants: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0 表示不限制"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              活动描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="请输入活动描述"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            {editingActivity ? "保存修改" : "创建活动"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="活动详情"
        size="lg"
      >
        {viewingActivity && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {viewingActivity.name}
              </h2>
              <Badge variant={getBadgeVariant(viewingActivity.status)}>
                {getStatusLabel(viewingActivity.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  活动日期
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {formatDate(viewingActivity.date)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  活动地点
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {viewingActivity.location}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  负责部门
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {viewingActivity.organizer}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  活动预算
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {formatCurrency(viewingActivity.budget)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  参与人数
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {viewingActivity.participantCount} 人
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  最大人数
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {viewingActivity.maxParticipants
                    ? `${viewingActivity.maxParticipants} 人`
                    : "不限"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                活动描述
              </p>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {viewingActivity.description || "暂无描述"}
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            关闭
          </Button>
          <Button
            onClick={() => {
              setIsViewModalOpen(false);
              if (viewingActivity) {
                handleEdit(viewingActivity);
              }
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑活动
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300">
          确定要删除这个活动吗？此操作不可撤销。
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(null)}
          >
            取消
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              showDeleteConfirm && handleDelete(showDeleteConfirm)
            }
          >
            确认删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}
