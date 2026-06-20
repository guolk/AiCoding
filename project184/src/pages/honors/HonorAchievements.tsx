import { useState, useMemo } from "react";
import {
  Award,
  Trophy,
  GraduationCap,
  HeartHandshake,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  LayoutGrid,
  List,
  Calendar,
  User,
  FileText,
  Paperclip,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import {
  formatDate,
  generateId,
  getCategoryLabel,
} from "@/utils";
import type { Achievement, AchievementCategory } from "@/types";

const categoryIcons: Record<AchievementCategory, React.ReactNode> = {
  scholarship: <GraduationCap className="w-5 h-5" />,
  honor: <Award className="w-5 h-5" />,
  competition: <Trophy className="w-5 h-5" />,
  volunteer: <HeartHandshake className="w-5 h-5" />,
};

const categoryColors: Record<AchievementCategory, string> = {
  scholarship: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  honor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  competition: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  volunteer: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
};

const categoryBadgeVariants: Record<AchievementCategory, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  scholarship: "warning",
  honor: "default",
  competition: "info",
  volunteer: "success",
};

const categoryFilters: { value: AchievementCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "全部", icon: <Filter className="w-4 h-4" /> },
  { value: "scholarship", label: "奖学金", icon: <GraduationCap className="w-4 h-4" /> },
  { value: "honor", label: "荣誉称号", icon: <Award className="w-4 h-4" /> },
  { value: "competition", label: "竞赛获奖", icon: <Trophy className="w-4 h-4" /> },
  { value: "volunteer", label: "志愿服务", icon: <HeartHandshake className="w-4 h-4" /> },
];

const initialFormData: Omit<Achievement, "id" | "createdAt"> = {
  memberId: "",
  memberName: "",
  title: "",
  category: "scholarship",
  date: "",
  description: "",
  attachments: [],
};

export default function HonorAchievements() {
  const { achievements, addAchievement, updateAchievement, deleteAchievement, members } =
    useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"card" | "timeline">("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [viewingAchievement, setViewingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<Omit<Achievement, "id" | "createdAt">>(
    initialFormData
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newAttachment, setNewAttachment] = useState("");

  const filteredAchievements = useMemo(() => {
    return achievements
      .filter((achievement) => {
        const matchesSearch =
          achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          achievement.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || achievement.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [achievements, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    const total = achievements.length;
    const scholarship = achievements.filter((a) => a.category === "scholarship").length;
    const honor = achievements.filter((a) => a.category === "honor").length;
    const competition = achievements.filter((a) => a.category === "competition").length;
    const volunteer = achievements.filter((a) => a.category === "volunteer").length;
    return { total, scholarship, honor, competition, volunteer };
  }, [achievements]);

  const handleAdd = () => {
    setEditingAchievement(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      memberId: achievement.memberId,
      memberName: achievement.memberName,
      title: achievement.title,
      category: achievement.category,
      date: achievement.date,
      description: achievement.description,
      attachments: achievement.attachments || [],
    });
    setIsModalOpen(true);
  };

  const handleView = (achievement: Achievement) => {
    setViewingAchievement(achievement);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAchievement(id);
    setShowDeleteConfirm(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.memberName.trim()) return;

    if (editingAchievement) {
      updateAchievement(editingAchievement.id, formData);
    } else {
      const newAchievement: Achievement = {
        ...formData,
        id: generateId("ach"),
        createdAt: new Date().toISOString().split("T")[0],
      };
      addAchievement(newAchievement);
    }
    setIsModalOpen(false);
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

  const handleAddAttachment = () => {
    if (newAttachment.trim()) {
      setFormData({
        ...formData,
        attachments: [...(formData.attachments || []), newAttachment.trim()],
      });
      setNewAttachment("");
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments?.filter((_, i) => i !== index) || [],
    });
  };

  const groupedByYear = useMemo(() => {
    const groups: Record<string, Achievement[]> = {};
    filteredAchievements.forEach((achievement) => {
      const year = new Date(achievement.date).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(achievement);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
  }, [filteredAchievements]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            事迹记录
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理成员优秀事迹档案
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增事迹
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                事迹总数
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                奖学金
              </p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {stats.scholarship}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                荣誉称号
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {stats.honor}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                竞赛获奖
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {stats.competition}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                志愿服务
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {stats.volunteer}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    categoryFilter === filter.value
                      ? "bg-primary-800 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索事迹、成员..."
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
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "card"
                      ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "timeline"
                      ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无事迹记录</p>
            </div>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  hover
                  className="overflow-hidden"
                >
                  <div className={`h-2 ${
                    achievement.category === "scholarship"
                      ? "bg-gradient-to-r from-amber-500 to-amber-300"
                      : achievement.category === "honor"
                      ? "bg-gradient-to-r from-purple-500 to-purple-300"
                      : achievement.category === "competition"
                      ? "bg-gradient-to-r from-blue-500 to-blue-300"
                      : "bg-gradient-to-r from-green-500 to-green-300"
                  }`} />
                  <Card.Body className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[achievement.category]}`}>
                        {categoryIcons[achievement.category]}
                      </div>
                      <Badge variant={categoryBadgeVariants[achievement.category]}>
                        {getCategoryLabel(achievement.category)}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">
                      {achievement.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span>{achievement.memberName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span>{formatDate(achievement.date)}</span>
                      </div>
                      {achievement.attachments && achievement.attachments.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          <span>{achievement.attachments.length} 个附件</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {achievement.description}
                    </p>

                    <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(achievement)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(achievement)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteConfirm(achievement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {groupedByYear.map(([year, yearAchievements]) => (
                <div key={year}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {year}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary-200 to-transparent dark:from-primary-800" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {yearAchievements.length} 项事迹
                    </span>
                  </div>
                  <div className="relative pl-8 space-y-4">
                    <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-300 to-gray-100 dark:from-primary-700 dark:to-gray-800" />
                    {yearAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="relative"
                      >
                        <div className={`absolute -left-3 top-4 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center ${
                          achievement.category === "scholarship"
                            ? "bg-amber-500"
                            : achievement.category === "honor"
                            ? "bg-purple-500"
                            : achievement.category === "competition"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <Card hover className="ml-2">
                          <Card.Body className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[achievement.category]}`}>
                                  {categoryIcons[achievement.category]}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {achievement.title}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3.5 h-3.5" />
                                      {achievement.memberName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {formatDate(achievement.date)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(achievement)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(achievement)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => setShowDeleteConfirm(achievement.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
                              {achievement.description}
                            </p>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
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
        title={editingAchievement ? "编辑事迹" : "新增事迹"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                成员 <span className="text-red-500">*</span>
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
                事迹分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as AchievementCategory,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="scholarship">奖学金</option>
                <option value="honor">荣誉称号</option>
                <option value="competition">竞赛获奖</option>
                <option value="volunteer">志愿服务</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                事迹标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入事迹标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                获得日期
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              事迹描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="请输入事迹详细描述"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              附件材料
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAttachment();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="输入附件名称后按回车添加"
                />
                <Button variant="outline" onClick={handleAddAttachment}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="space-y-1">
                  {formData.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {attachment}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.memberName.trim()}
          >
            {editingAchievement ? "保存修改" : "创建事迹"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="事迹详情"
        size="lg"
      >
        {viewingAchievement && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${categoryColors[viewingAchievement.category]}`}>
                {categoryIcons[viewingAchievement.category]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {viewingAchievement.title}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={categoryBadgeVariants[viewingAchievement.category]}>
                    {getCategoryLabel(viewingAchievement.category)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(viewingAchievement.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  获得成员
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {viewingAchievement.memberName.charAt(0)}
                  </div>
                  {viewingAchievement.memberName}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  记录时间
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {formatDate(viewingAchievement.createdAt)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                事迹描述
              </p>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {viewingAchievement.description || "暂无描述"}
              </p>
            </div>

            {viewingAchievement.attachments &&
              viewingAchievement.attachments.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    附件材料
                  </p>
                  <div className="space-y-2">
                    {viewingAchievement.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700"
                      >
                        <FileText className="w-5 h-5 text-primary-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {attachment}
                        </span>
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            关闭
          </Button>
          <Button
            onClick={() => {
              setIsViewModalOpen(false);
              if (viewingAchievement) {
                handleEdit(viewingAchievement);
              }
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑事迹
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
          确定要删除这条事迹记录吗？此操作不可撤销。
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
