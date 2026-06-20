import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  User,
  Phone,
  Mail,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, generateId, getStatusLabel, getStatusColor } from "@/utils";
import type { Member } from "@/types";

export default function MemberList() {
  const { members, addMember, updateMember, deleteMember } = useAppStore();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    major: "",
    position: "",
    phone: "",
    email: "",
    status: "active" as Member["status"],
    points: 0,
  });

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchSearch =
        member.name.includes(searchText) ||
        member.major.includes(searchText) ||
        member.position.includes(searchText) ||
        member.grade.includes(searchText);
      const matchStatus =
        statusFilter === "all" || member.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [members, searchText, statusFilter]);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "active").length;
    const inactive = members.filter((m) => m.status === "inactive").length;
    const graduated = members.filter((m) => m.status === "graduated").length;
    return { total, active, inactive, graduated };
  }, [members]);

  const resetForm = () => {
    setFormData({
      name: "",
      grade: "",
      major: "",
      position: "",
      phone: "",
      email: "",
      status: "active",
      points: 0,
    });
    setEditingMember(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      grade: member.grade,
      major: member.major,
      position: member.position,
      phone: member.phone || "",
      email: member.email || "",
      status: member.status,
      points: member.points,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (member: Member) => {
    setDeletingMember(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingMember) {
      deleteMember(deletingMember.id);
    }
    setIsDeleteModalOpen(false);
    setDeletingMember(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingMember) {
      updateMember(editingMember.id, {
        ...formData,
        joinDate: editingMember.joinDate,
        attendance: editingMember.attendance,
      });
    } else {
      const newMember: Member = {
        id: generateId("member"),
        ...formData,
        joinDate: new Date().toISOString().split("T")[0],
        attendance: 0,
      };
      addMember(newMember);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const getBadgeVariant = (
    status: string
  ): "default" | "success" | "warning" | "danger" | "info" | "gray" => {
    const colorMap: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
      green: "success",
      yellow: "warning",
      red: "danger",
      blue: "info",
      gray: "gray",
    };
    return colorMap[getStatusColor(status)] || "gray";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            成员列表
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理社团成员档案信息
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          添加成员
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总成员数</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">活跃成员</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.active}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">不活跃</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">已毕业</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.graduated}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索姓名、专业、职务..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">不活跃</option>
                <option value="graduated">已毕业</option>
              </select>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    成员
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    年级专业
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    职务
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    加入时间
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    积分
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    状态
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </p>
                          {member.email && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 dark:text-white">
                        {member.grade}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.major}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {member.position}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatDate(member.joinDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {member.points}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(member.status)}>
                        {getStatusLabel(member.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(member)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              暂无匹配的成员数据
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingMember ? "编辑成员" : "添加成员"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入姓名"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                年级
              </label>
              <select
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">请选择年级</option>
                <option value="大一">大一</option>
                <option value="大二">大二</option>
                <option value="大三">大三</option>
                <option value="大四">大四</option>
                <option value="研一">研一</option>
                <option value="研二">研二</option>
                <option value="研三">研三</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                专业
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
                placeholder="请输入专业"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                职务
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="请输入职务"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                电话
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="请输入电话号码"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="请输入邮箱地址"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {editingMember && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    积分
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="请输入积分"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        status: e.target.value as Member["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">活跃</option>
                    <option value="inactive">不活跃</option>
                    <option value="graduated">已毕业</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            {editingMember ? "保存修改" : "添加成员"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingMember(null);
        }}
        title="确认删除"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">
            确定要删除成员 "{deletingMember?.name}" 吗？
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            删除后将无法恢复，请谨慎操作
          </p>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setDeletingMember(null);
            }}
          >
            取消
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            确认删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}
