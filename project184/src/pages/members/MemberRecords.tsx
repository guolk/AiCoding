import { useState, useMemo } from "react";
import {
  UserPlus,
  UserMinus,
  Clock,
  Check,
  X,
  Filter,
  Search,
  FileText,
  Phone,
  AlertCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, generateId, getStatusLabel, getStatusColor } from "@/utils";
import type { MemberRecord, Member } from "@/types";

export default function MemberRecords() {
  const { memberRecords, updateMemberRecord, addMemberRecord, members, addMember } =
    useAppStore();
  const [activeTab, setActiveTab] = useState<"join" | "leave">("join");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<MemberRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: "",
    grade: "",
    major: "",
    phone: "",
    reason: "",
  });

  const joinRecords = useMemo(() => {
    return memberRecords.filter((r) => r.type === "join");
  }, [memberRecords]);

  const leaveRecords = useMemo(() => {
    return memberRecords.filter((r) => r.type === "leave");
  }, [memberRecords]);

  const filteredRecords = useMemo(() => {
    const records = activeTab === "join" ? joinRecords : leaveRecords;
    return records.filter((record) => {
      const matchSearch = record.name.includes(searchText);
      const matchStatus =
        statusFilter === "all" || record.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [activeTab, joinRecords, leaveRecords, searchText, statusFilter]);

  const pendingCount = useMemo(() => {
    return memberRecords.filter((r) => r.status === "pending").length;
  }, [memberRecords]);

  const joinPendingCount = useMemo(() => {
    return joinRecords.filter((r) => r.status === "pending").length;
  }, [joinRecords]);

  const leavePendingCount = useMemo(() => {
    return leaveRecords.filter((r) => r.status === "pending").length;
  }, [leaveRecords]);

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

  const handleViewDetail = (record: MemberRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (record: MemberRecord) => {
    updateMemberRecord(record.id, {
      status: "approved",
    });

    if (record.type === "join") {
      const newMember: Member = {
        id: generateId("member"),
        name: record.name,
        grade: record.grade || "",
        major: record.major || "",
        joinDate: new Date().toISOString().split("T")[0],
        position: "普通成员",
        phone: record.phone,
        points: 0,
        status: "active",
        attendance: 0,
      };
      addMember(newMember);
    }

    setIsDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const handleRejectClick = (record: MemberRecord) => {
    setSelectedRecord(record);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleReject = () => {
    if (selectedRecord) {
      updateMemberRecord(selectedRecord.id, {
        status: "rejected",
        reason: rejectReason || selectedRecord.reason,
      });
    }
    setIsRejectModalOpen(false);
    setSelectedRecord(null);
    setRejectReason("");
  };

  const handleSubmitJoin = () => {
    if (!joinForm.name.trim()) return;

    const newRecord: MemberRecord = {
      id: generateId("record"),
      name: joinForm.name,
      type: "join",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      reason: joinForm.reason || undefined,
      grade: joinForm.grade || undefined,
      major: joinForm.major || undefined,
      phone: joinForm.phone || undefined,
    };

    addMemberRecord(newRecord);

    setIsJoinModalOpen(false);
    setJoinForm({
      name: "",
      grade: "",
      major: "",
      phone: "",
      reason: "",
    });
  };

  const stats = useMemo(() => {
    const joinTotal = joinRecords.length;
    const joinApproved = joinRecords.filter(
      (r) => r.status === "approved"
    ).length;
    const joinRejected = joinRecords.filter(
      (r) => r.status === "rejected"
    ).length;
    const leaveTotal = leaveRecords.length;
    const leaveApproved = leaveRecords.filter(
      (r) => r.status === "approved"
    ).length;
    const leaveRejected = leaveRecords.filter(
      (r) => r.status === "rejected"
    ).length;
    return {
      joinTotal,
      joinApproved,
      joinRejected,
      joinPending: joinPendingCount,
      leaveTotal,
      leaveApproved,
      leaveRejected,
      leavePending: leavePendingCount,
    };
  }, [joinRecords, leaveRecords, joinPendingCount, leavePendingCount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            入退社记录
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理入社申请和退社记录
          </p>
        </div>
        <Button onClick={() => setIsJoinModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          新增入社申请
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                入社申请
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.joinTotal}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                待审批
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                已通过
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.joinApproved + stats.leaveApproved}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                退社记录
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.leaveTotal}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("join")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "join"
              ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          入社申请
          {joinPendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full">
              {joinPendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("leave")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "leave"
              ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <UserMinus className="w-4 h-4" />
          退社记录
          {leavePendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full">
              {leavePendingCount}
            </span>
          )}
        </button>
      </div>

      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索姓名..."
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
                <option value="pending">待审批</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
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
                    姓名
                  </th>
                  {activeTab === "join" && (
                    <>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        年级专业
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        联系电话
                      </th>
                    </>
                  )}
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    申请日期
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    申请原因
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
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                          {record.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {record.name}
                        </span>
                      </div>
                    </td>
                    {activeTab === "join" && (
                      <>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 dark:text-white">
                            {record.grade || "-"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {record.major || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {record.phone || "-"}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-gray-700 dark:text-gray-300 truncate">
                        {record.reason || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(record.status)}>
                        {getStatusLabel(record.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(record)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        {record.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              onClick={() => handleApprove(record)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleRejectClick(record)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRecords.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              暂无记录
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecord(null);
        }}
        title={
          selectedRecord?.type === "join" ? "入社申请详情" : "退社申请详情"
        }
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                {selectedRecord.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedRecord.name}
                </h3>
                <Badge variant={getBadgeVariant(selectedRecord.status)}>
                  {getStatusLabel(selectedRecord.status)}
                </Badge>
              </div>
            </div>

            {selectedRecord.type === "join" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    年级
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRecord.grade || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    专业
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRecord.major || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <Phone className="w-4 h-4 inline mr-1" />
                    电话
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRecord.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    申请日期
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedRecord.date)}
                  </p>
                </div>
              </div>
            )}

            {selectedRecord.type === "leave" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    申请类型
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {getStatusLabel(selectedRecord.type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    申请日期
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedRecord.date)}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                申请原因
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedRecord.reason || "未填写原因"}
                </p>
              </div>
            </div>
          </div>
        )}
        {selectedRecord?.status === "pending" && (
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="danger"
              onClick={() => handleRejectClick(selectedRecord)}
            >
              <X className="w-4 h-4 mr-2" />
              拒绝
            </Button>
            <Button onClick={() => handleApprove(selectedRecord)}>
              <Check className="w-4 h-4 mr-2" />
              通过
            </Button>
          </div>
        )}
        {selectedRecord?.status !== "pending" && (
          <div className="flex justify-end mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedRecord(null);
              }}
            >
              关闭
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedRecord(null);
          setRejectReason("");
        }}
        title="拒绝申请"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              确定要拒绝
              <span className="font-semibold">
                {" "}
                {selectedRecord?.name}{" "}
              </span>
              的{selectedRecord?.type === "join" ? "入社" : "退社"}申请吗？
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              拒绝原因
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入拒绝原因（选填）"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsRejectModalOpen(false);
              setSelectedRecord(null);
              setRejectReason("");
            }}
          >
            取消
          </Button>
          <Button variant="danger" onClick={handleReject}>
            确认拒绝
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setJoinForm({
            name: "",
            grade: "",
            major: "",
            phone: "",
            reason: "",
          });
        }}
        title="新增入社申请"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={joinForm.name}
              onChange={(e) =>
                setJoinForm({ ...joinForm, name: e.target.value })
              }
              placeholder="请输入姓名"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                年级
              </label>
              <select
                value={joinForm.grade}
                onChange={(e) =>
                  setJoinForm({ ...joinForm, grade: e.target.value })
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
                value={joinForm.major}
                onChange={(e) =>
                  setJoinForm({ ...joinForm, major: e.target.value })
                }
                placeholder="请输入专业"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              联系电话
            </label>
            <input
              type="tel"
              value={joinForm.phone}
              onChange={(e) =>
                setJoinForm({ ...joinForm, phone: e.target.value })
              }
              placeholder="请输入联系电话"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              申请原因
            </label>
            <textarea
              value={joinForm.reason}
              onChange={(e) =>
                setJoinForm({ ...joinForm, reason: e.target.value })
              }
              placeholder="请输入入社申请原因"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsJoinModalOpen(false);
              setJoinForm({
                name: "",
                grade: "",
                major: "",
                phone: "",
                reason: "",
              });
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmitJoin}
            disabled={!joinForm.name.trim()}
          >
            提交申请
          </Button>
        </div>
      </Modal>
    </div>
  );
}
