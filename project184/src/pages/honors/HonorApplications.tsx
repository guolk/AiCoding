import { useState, useMemo } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Calendar,
  User,
  Paperclip,
  AlertCircle,
  Upload,
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
import type { HonorApplication, ApplicationStatus } from "@/types";

const statusFilters: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "draft", label: "草稿" },
  { value: "submitted", label: "已提交" },
  { value: "reviewing", label: "审核中" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已拒绝" },
];

const statusIcons: Record<ApplicationStatus, React.ReactNode> = {
  draft: <FileText className="w-5 h-5" />,
  submitted: <Send className="w-5 h-5" />,
  reviewing: <Clock className="w-5 h-5" />,
  approved: <CheckCircle className="w-5 h-5" />,
  rejected: <XCircle className="w-5 h-5" />,
};

const statusColors: Record<ApplicationStatus, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  submitted: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  reviewing: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const initialFormData: Omit<HonorApplication, "id"> = {
  memberId: "",
  memberName: "",
  honorName: "",
  applicationDate: "",
  status: "draft",
  materials: [],
  remarks: "",
};

export default function HonorApplications() {
  const { honorApplications, addHonorApplication, updateHonorApplication, members } =
    useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<HonorApplication | null>(null);
  const [viewingApplication, setViewingApplication] = useState<HonorApplication | null>(null);
  const [submittingApp, setSubmittingApp] = useState<HonorApplication | null>(null);
  const [formData, setFormData] = useState<Omit<HonorApplication, "id">>(
    initialFormData
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState("");

  const filteredApplications = useMemo(() => {
    return honorApplications
      .filter((app) => {
        const matchesSearch =
          app.honorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.remarks || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
  }, [honorApplications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = honorApplications.length;
    const draft = honorApplications.filter((a) => a.status === "draft").length;
    const submitted = honorApplications.filter((a) => a.status === "submitted").length;
    const reviewing = honorApplications.filter((a) => a.status === "reviewing").length;
    const approved = honorApplications.filter((a) => a.status === "approved").length;
    const rejected = honorApplications.filter((a) => a.status === "rejected").length;
    return { total, draft, submitted, reviewing, approved, rejected };
  }, [honorApplications]);

  const getBadgeVariant = (
    status: string
  ): "default" | "success" | "warning" | "danger" | "info" | "gray" => {
    const colorMap: Record<
      string,
      "default" | "success" | "warning" | "danger" | "info" | "gray"
    > = {
      green: "success",
      yellow: "warning",
      red: "danger",
      blue: "info",
      gray: "gray",
    };
    return colorMap[getStatusColor(status)] || "gray";
  };

  const handleAdd = () => {
    setEditingApplication(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (app: HonorApplication) => {
    setEditingApplication(app);
    setFormData({
      memberId: app.memberId,
      memberName: app.memberName,
      honorName: app.honorName,
      applicationDate: app.applicationDate,
      status: app.status,
      materials: [...app.materials],
      remarks: app.remarks || "",
    });
    setIsModalOpen(true);
  };

  const handleView = (app: HonorApplication) => {
    setViewingApplication(app);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    updateHonorApplication(id, {});
    setShowDeleteConfirm(null);
  };

  const handleSubmit = () => {
    if (!formData.honorName.trim() || !formData.memberName.trim()) return;

    if (editingApplication) {
      updateHonorApplication(editingApplication.id, formData);
    } else {
      const newApp: HonorApplication = {
        ...formData,
        id: generateId("app"),
      };
      addHonorApplication(newApp);
    }
    setIsModalOpen(false);
  };

  const handleSubmitApplication = (app: HonorApplication) => {
    setSubmittingApp(app);
    setIsSubmitConfirmOpen(true);
  };

  const confirmSubmit = () => {
    if (submittingApp) {
      updateHonorApplication(submittingApp.id, { status: "submitted" });
    }
    setIsSubmitConfirmOpen(false);
    setSubmittingApp(null);
  };

  const handleMemberSelect = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setFormData({
        ...formData,
        memberId: member.id,
        memberName: member.name,
      });
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial.trim()],
      });
      setNewMaterial("");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index),
    });
  };

  const getStatusStep = (status: ApplicationStatus): number => {
    const steps: ApplicationStatus[] = ["draft", "submitted", "reviewing", "approved"];
    return steps.indexOf(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            荣誉申报
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理荣誉申报记录与材料
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新建申报
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                申报总数
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                草稿
              </p>
              <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                {stats.draft}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                审核中
              </p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {stats.reviewing + stats.submitted}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                已通过
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {stats.approved}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                已拒绝
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {stats.rejected}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索申报、成员..."
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
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无申报记录</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusColors[app.status]}`}>
                        {statusIcons[app.status]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {app.honorName}
                          </h3>
                          <Badge variant={getBadgeVariant(app.status)}>
                            {getStatusLabel(app.status)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {app.memberName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(app.applicationDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Paperclip className="w-4 h-4" />
                            {app.materials.length} 份材料
                          </span>
                        </div>
                        {app.remarks && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">
                            {app.remarks}
                          </p>
                        )}

                        {app.status !== "rejected" && app.status !== "approved" && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2">
                              {(["draft", "submitted", "reviewing", "approved"] as ApplicationStatus[]).map(
                                (step, index) => {
                                  const currentStep = getStatusStep(app.status);
                                  const stepIndex = index;
                                  const isActive = stepIndex <= currentStep;
                                  const isCurrent = app.status === step;
                                  return (
                                    <div key={step} className="flex items-center">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                                          isCurrent
                                            ? "bg-primary-600 text-white"
                                            : isActive
                                            ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400"
                                            : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                                        }`}
                                      >
                                        {isActive && stepIndex < currentStep ? (
                                          <CheckCircle className="w-4 h-4" />
                                        ) : (
                                          stepIndex + 1
                                        )}
                                      </div>
                                      {index < 3 && (
                                        <div
                                          className={`w-12 h-0.5 ${
                                            stepIndex < currentStep
                                              ? "bg-primary-400"
                                              : "bg-gray-200 dark:bg-gray-700"
                                          }`}
                                        />
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs text-gray-400 w-64">
                              <span>草稿</span>
                              <span>已提交</span>
                              <span>审核中</span>
                              <span>已通过</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(app)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                      {app.status === "draft" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(app)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitApplication(app)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            提交
                          </Button>
                        </>
                      )}
                      {app.status !== "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setShowDeleteConfirm(app.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApplication ? "编辑申报" : "新建申报"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                申报成员 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.memberId}
                onChange={(e) => handleMemberSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">请选择成员</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.major}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                申报日期
              </label>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) =>
                  setFormData({ ...formData, applicationDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                荣誉名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.honorName}
                onChange={(e) =>
                  setFormData({ ...formData, honorName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入荣誉名称，如：国家奖学金、十佳大学生等"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              申报材料
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMaterial();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="输入材料名称后按回车添加"
                />
                <Button variant="outline" onClick={handleAddMaterial}>
                  <Upload className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>
              {formData.materials.length > 0 ? (
                <div className="space-y-2">
                  {formData.materials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {material}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1"
                        onClick={() => handleRemoveMaterial(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  <Paperclip className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    暂无申报材料，请添加相关证明材料
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注说明
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="请输入备注说明（选填）"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.honorName.trim() || !formData.memberName.trim()}
          >
            {editingApplication ? "保存修改" : "保存草稿"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="申报详情"
        size="lg"
      >
        {viewingApplication && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statusColors[viewingApplication.status]}`}>
                {statusIcons[viewingApplication.status]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {viewingApplication.honorName}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getBadgeVariant(viewingApplication.status)}>
                    {getStatusLabel(viewingApplication.status)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    申报编号：{viewingApplication.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  申报成员
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {viewingApplication.memberName.charAt(0)}
                  </div>
                  {viewingApplication.memberName}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  申报日期
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {formatDate(viewingApplication.applicationDate)}
                </p>
              </div>
            </div>

            {viewingApplication.status !== "rejected" && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  审核进度
                </p>
                <div className="flex items-center justify-between">
                  {(["draft", "submitted", "reviewing", "approved"] as ApplicationStatus[]).map(
                    (step, index) => {
                      const currentStep = getStatusStep(viewingApplication.status);
                      const stepIndex = index;
                      const isActive = stepIndex <= currentStep;
                      const isCurrent = viewingApplication.status === step;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                                isCurrent
                                  ? "bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900"
                                  : isActive
                                  ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400"
                                  : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                              }`}
                            >
                              {isActive && stepIndex < currentStep ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                stepIndex + 1
                              )}
                            </div>
                            <span className={`text-xs mt-2 ${
                              isActive ? "text-gray-700 dark:text-gray-300" : "text-gray-400"
                            }`}>
                              {getStatusLabel(step)}
                            </span>
                          </div>
                          {index < 3 && (
                            <div
                              className={`flex-1 h-0.5 mx-2 ${
                                stepIndex < currentStep
                                  ? "bg-primary-400"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                申报材料 ({viewingApplication.materials.length} 份)
              </p>
              {viewingApplication.materials.length > 0 ? (
                <div className="space-y-2">
                  {viewingApplication.materials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {material}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  暂无申报材料
                </p>
              )}
            </div>

            {viewingApplication.remarks && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  备注说明
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {viewingApplication.remarks}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            关闭
          </Button>
          {viewingApplication?.status === "draft" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  if (viewingApplication) {
                    handleEdit(viewingApplication);
                  }
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button
                onClick={() => {
                  if (viewingApplication) {
                    handleSubmitApplication(viewingApplication);
                    setIsViewModalOpen(false);
                  }
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                提交申报
              </Button>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isSubmitConfirmOpen}
        onClose={() => {
          setIsSubmitConfirmOpen(false);
          setSubmittingApp(null);
        }}
        title="提交申报"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                确认提交申报？
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                提交后将进入审核流程，无法再修改内容
              </p>
            </div>
          </div>
          {submittingApp && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                申报荣誉
              </p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {submittingApp.honorName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                申报人：{submittingApp.memberName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                材料数量：{submittingApp.materials.length} 份
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsSubmitConfirmOpen(false);
              setSubmittingApp(null);
            }}
          >
            取消
          </Button>
          <Button onClick={confirmSubmit}>
            确认提交
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
          确定要删除这条申报记录吗？此操作不可撤销。
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
