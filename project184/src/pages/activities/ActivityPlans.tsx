import { useState, useMemo } from "react";
import {
  FileText,
  Clock,
  User,
  Plus,
  Search,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  X,
  GitCompare,
  History,
  ChevronDown,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import {
  formatDate,
  generateId,
  getStatusLabel,
  getStatusColor,
} from "@/utils";
import type { PlanVersion, PlanStatus } from "@/types";

const statusFilters: { value: PlanStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "draft", label: "草稿" },
  { value: "reviewing", label: "审核中" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已拒绝" },
];

const initialFormData: Omit<PlanVersion, "id" | "createdAt"> = {
  activityId: "",
  activityName: "",
  version: "v1.0",
  title: "",
  content: "",
  status: "draft",
  createdBy: "",
};

export default function ActivityPlans() {
  const { planVersions, activities, addPlanVersion, updatePlanVersion } =
    useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "all">("all");
  const [selectedActivity, setSelectedActivity] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanVersion | null>(null);
  const [viewingPlan, setViewingPlan] = useState<PlanVersion | null>(null);
  const [formData, setFormData] = useState<
    Omit<PlanVersion, "id" | "createdAt">
  >(initialFormData);
  const [showVersions, setShowVersions] = useState<string | null>(null);

  const filteredPlans = useMemo(() => {
    return planVersions.filter((plan) => {
      const matchesSearch =
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || plan.status === statusFilter;
      const matchesActivity =
        selectedActivity === "all" || plan.activityId === selectedActivity;
      return matchesSearch && matchesStatus && matchesActivity;
    });
  }, [planVersions, searchTerm, statusFilter, selectedActivity]);

  const groupedByActivity = useMemo(() => {
    const groups: Record<string, PlanVersion[]> = {};
    filteredPlans.forEach((plan) => {
      if (!groups[plan.activityId]) {
        groups[plan.activityId] = [];
      }
      groups[plan.activityId].push(plan);
    });
    Object.values(groups).forEach((group) => {
      group.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    return groups;
  }, [filteredPlans]);

  const handleAdd = () => {
    setEditingPlan(null);
    setFormData({
      ...initialFormData,
      activityId: activities[0]?.id || "",
      activityName: activities[0]?.name || "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (plan: PlanVersion) => {
    setEditingPlan(plan);
    setFormData({
      activityId: plan.activityId,
      activityName: plan.activityName,
      version: plan.version,
      title: plan.title,
      content: plan.content,
      status: plan.status,
      createdBy: plan.createdBy,
    });
    setIsModalOpen(true);
  };

  const handleView = (plan: PlanVersion) => {
    setViewingPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.activityId) return;

    const activity = activities.find((a) => a.id === formData.activityId);
    const activityName = activity?.name || formData.activityName;

    if (editingPlan) {
      updatePlanVersion(editingPlan.id, {
        ...formData,
        activityName,
      });
    } else {
      const newPlan: PlanVersion = {
        ...formData,
        activityName,
        id: generateId("plan"),
        createdAt: new Date().toISOString().split("T")[0],
      };
      addPlanVersion(newPlan);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (
    planId: string,
    newStatus: PlanStatus
  ) => {
    updatePlanVersion(planId, { status: newStatus });
  };

  const getBadgeVariant = (status: string) => {
    const color = getStatusColor(status);
    const variantMap: Record<
      string,
      "success" | "warning" | "info" | "gray" | "danger"
    > = {
      green: "success",
      yellow: "warning",
      blue: "info",
      gray: "gray",
      red: "danger",
    };
    return variantMap[color] || "gray";
  };

  const getActivityPlanVersions = (activityId: string) => {
    return planVersions
      .filter((p) => p.activityId === activityId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  const stats = useMemo(() => {
    const total = planVersions.length;
    const draft = planVersions.filter((p) => p.status === "draft").length;
    const reviewing = planVersions.filter(
      (p) => p.status === "reviewing"
    ).length;
    const approved = planVersions.filter(
      (p) => p.status === "approved"
    ).length;
    const rejected = planVersions.filter(
      (p) => p.status === "rejected"
    ).length;
    return { total, draft, reviewing, approved, rejected };
  }, [planVersions]);

  const renderMarkdownContent = (content: string) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {content.split("\n").map((line, index) => {
          if (line.startsWith("## ")) {
            return (
              <h3
                key={index}
                className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2"
              >
                {line.replace("## ", "")}
              </h3>
            );
          } else if (line.startsWith("# ")) {
            return (
              <h2
                key={index}
                className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-3"
              >
                {line.replace("# ", "")}
              </h2>
            );
          } else if (line.trim() === "") {
            return <br key={index} />;
          } else {
            return (
              <p
                key={index}
                className="text-gray-600 dark:text-gray-300 mb-2"
              >
                {line}
              </p>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            策划方案
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理各活动的策划版本与迭代追踪
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增策划
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">方案总数</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.total}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">草稿</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">审核中</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {stats.reviewing}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">已通过</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.approved}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">已拒绝</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats.rejected}
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
                  placeholder="搜索方案标题、活动名称..."
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
              <div className="flex gap-2">
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">全部活动</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
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
          {Object.keys(groupedByActivity).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无策划方案</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByActivity).map(
                ([activityId, plans]) => {
                  const activity = activities.find(
                    (a) => a.id === activityId
                  );
                  const isExpanded = showVersions === activityId;
                  const versions = getActivityPlanVersions(activityId);

                  return (
                    <div
                      key={activityId}
                      className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary-800/10 to-primary-500/10 dark:from-primary-900/30 dark:to-primary-800/30 cursor-pointer"
                        onClick={() =>
                          setShowVersions(
                            isExpanded ? null : activityId
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary-700 dark:text-primary-400" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {activity?.name || plans[0].activityName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              共 {versions.length} 个版本
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {versions.slice(0, 3).map((v, i) => (
                              <Badge
                                key={i}
                                variant={getBadgeVariant(v.status)}
                                className="text-xs"
                              >
                                {v.version}
                              </Badge>
                            ))}
                            {versions.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{versions.length - 3}
                              </span>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <History className="w-4 h-4" />
                            <span>版本迭代历史</span>
                          </div>
                          <div className="relative pl-6">
                            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-800 to-primary-300" />
                            {versions.map((plan, index) => (
                              <div
                                key={plan.id}
                                className="relative pb-4 last:pb-0"
                              >
                                <div
                                  className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 ${
                                    index === 0
                                      ? "bg-primary-800 border-primary-800"
                                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                  }`}
                                />
                                <Card className="ml-2">
                                  <Card.Body className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge
                                            variant={getBadgeVariant(
                                              plan.status
                                            )}
                                          >
                                            {plan.version}
                                          </Badge>
                                          <Badge
                                            variant={getBadgeVariant(
                                              plan.status
                                            )}
                                          >
                                            {getStatusLabel(plan.status)}
                                          </Badge>
                                          {index === 0 && (
                                            <Badge variant="info">
                                              最新版本
                                            </Badge>
                                          )}
                                        </div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                          {plan.title}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                          <div className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            <span>{plan.createdBy}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>
                                              {formatDate(plan.createdAt)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleView(plan)}
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          查看
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEdit(plan)}
                                        >
                                          <Edit className="w-4 h-4 mr-1" />
                                          编辑
                                        </Button>
                                        {plan.status === "draft" && (
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleStatusChange(
                                                plan.id,
                                                "reviewing"
                                              )
                                            }
                                          >
                                            <GitCompare className="w-4 h-4 mr-1" />
                                            提交审核
                                          </Button>
                                        )}
                                        {plan.status === "reviewing" && (
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="text-green-600 hover:bg-green-50"
                                              onClick={() =>
                                                handleStatusChange(
                                                  plan.id,
                                                  "approved"
                                                )
                                              }
                                            >
                                              <CheckCircle className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="text-red-600 hover:bg-red-50"
                                              onClick={() =>
                                                handleStatusChange(
                                                  plan.id,
                                                  "rejected"
                                                )
                                              }
                                            >
                                              <XCircle className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? "编辑策划方案" : "新增策划方案"}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                关联活动
              </label>
              <select
                value={formData.activityId}
                onChange={(e) => {
                  const activity = activities.find(
                    (a) => a.id === e.target.value
                  );
                  setFormData({
                    ...formData,
                    activityId: e.target.value,
                    activityName: activity?.name || "",
                  });
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                版本号
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="v1.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as PlanStatus,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="draft">草稿</option>
                <option value="reviewing">审核中</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                方案标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入方案标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                创建人
              </label>
              <input
                type="text"
                value={formData.createdBy}
                onChange={(e) =>
                  setFormData({ ...formData, createdBy: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入创建人"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              方案内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={12}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
              placeholder="支持 Markdown 格式...

## 活动主题
活动主题内容

## 活动时间
2024年XX月XX日

## 活动地点
活动地点描述"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.activityId}
          >
            {editingPlan ? "保存修改" : "创建方案"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="策划方案详情"
        size="lg"
      >
        {viewingPlan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {viewingPlan.title}
                </h2>
                <Badge variant={getBadgeVariant(viewingPlan.status)}>
                  {viewingPlan.version}
                </Badge>
              </div>
              <Badge variant={getBadgeVariant(viewingPlan.status)}>
                {getStatusLabel(viewingPlan.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{viewingPlan.activityName}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{viewingPlan.createdBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDate(viewingPlan.createdAt)}</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {renderMarkdownContent(viewingPlan.content)}
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
              if (viewingPlan) {
                handleEdit(viewingPlan);
              }
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑方案
          </Button>
        </div>
      </Modal>
    </div>
  );
}
