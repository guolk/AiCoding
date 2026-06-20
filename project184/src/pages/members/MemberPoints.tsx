import { useState, useMemo } from "react";
import {
  Trophy,
  TrendingUp,
  History,
  BookOpen,
  Star,
  Plus,
  Minus,
  Award,
  Target,
  Zap,
  Search,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, generateId } from "@/utils";
import type { PointRecord, Member } from "@/types";

export default function MemberPoints() {
  const { members, pointRecords, addPointRecord, updateMember } = useAppStore();
  const [activeTab, setActiveTab] = useState<"ranking" | "records" | "rules">("ranking");
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pointForm, setPointForm] = useState({
    memberId: "",
    memberName: "",
    points: 0,
    reason: "",
    activityName: "",
  });

  const rankedMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => b.points - a.points)
      .map((member, index) => ({
        ...member,
        rank: index + 1,
      }));
  }, [members]);

  const filteredRecords = useMemo(() => {
    return pointRecords.filter(
      (record) =>
        record.memberName.includes(searchText) ||
        record.reason.includes(searchText) ||
        (record.activityName && record.activityName.includes(searchText))
    );
  }, [pointRecords, searchText]);

  const totalPoints = useMemo(() => {
    return members.reduce((sum, m) => sum + m.points, 0);
  }, [members]);

  const totalRecords = pointRecords.length;

  const pointRules = [
    {
      icon: Trophy,
      title: "竞赛获奖",
      description: "参加各类科技竞赛并获奖",
      items: [
        { level: "国家级一等奖", points: 100 },
        { level: "国家级二等奖", points: 80 },
        { level: "省级一等奖", points: 50 },
        { level: "省级二等奖", points: 30 },
        { level: "校级一等奖", points: 20 },
        { level: "校级二等奖", points: 10 },
      ],
    },
    {
      icon: Zap,
      title: "活动参与",
      description: "参加社团组织的各类活动",
      items: [
        { level: "作为组织者", points: 15 },
        { level: "作为参与者", points: 5 },
        { level: "志愿服务1小时", points: 2 },
      ],
    },
    {
      icon: Target,
      title: "职务贡献",
      description: "担任社团职务履行职责",
      items: [
        { level: "社长/副社长", points: "每月10分" },
        { level: "部长", points: "每月8分" },
        { level: "干事", points: "每月5分" },
      ],
    },
    {
      icon: Award,
      title: "其他加分",
      description: "其他对社团有贡献的行为",
      items: [
        { level: "拉取赞助(每百元)", points: 5 },
        { level: "宣传推文(每篇)", points: 3 },
        { level: "技术分享(每次)", points: 10 },
      ],
    },
  ];

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white";
    }
    if (rank === 2) {
      return "bg-gradient-to-br from-gray-300 to-gray-400 text-white";
    }
    if (rank === 3) {
      return "bg-gradient-to-br from-orange-400 to-orange-500 text-white";
    }
    return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  };

  const handleAddPoints = (member?: Member) => {
    if (member) {
      setSelectedMember(member);
      setPointForm({
        memberId: member.id,
        memberName: member.name,
        points: 0,
        reason: "",
        activityName: "",
      });
    } else {
      setSelectedMember(null);
      setPointForm({
        memberId: "",
        memberName: "",
        points: 0,
        reason: "",
        activityName: "",
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSubmitPoints = () => {
    if (!pointForm.memberId || pointForm.points === 0 || !pointForm.reason.trim()) {
      return;
    }

    const record: PointRecord = {
      id: generateId("point"),
      memberId: pointForm.memberId,
      memberName: pointForm.memberName,
      points: pointForm.points,
      reason: pointForm.reason,
      activityName: pointForm.activityName || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    addPointRecord(record);

    const member = members.find((m) => m.id === pointForm.memberId);
    if (member) {
      updateMember(member.id, {
        points: member.points + pointForm.points,
      });
    }

    setIsAddModalOpen(false);
    setPointForm({
      memberId: "",
      memberName: "",
      points: 0,
      reason: "",
      activityName: "",
    });
    setSelectedMember(null);
  };

  const handleMemberSelect = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setPointForm({
        ...pointForm,
        memberId: member.id,
        memberName: member.name,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            积分系统
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理社团成员积分，查看排行榜和记录
          </p>
        </div>
        <Button onClick={() => handleAddPoints()}>
          <Plus className="w-4 h-4 mr-2" />
          积分调整
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总积分</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalPoints}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">参与成员</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {members.filter((m) => m.points > 0).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">积分记录</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalRecords}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("ranking")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "ranking"
              ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          积分排行榜
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "records"
              ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <History className="w-4 h-4 inline mr-2" />
          积分流水
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          积分规则
        </button>
      </div>

      {activeTab === "ranking" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <Card.Header>
              <Card.Title>积分排行榜</Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {rankedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(
                        member.rank
                      )}`}
                    >
                      {member.rank <= 3 ? (
                        <Star className="w-5 h-5" />
                      ) : (
                        member.rank
                      )}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.position}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {member.points}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        积分
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddPoints(member)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>前三名风采</Card.Title>
            </Card.Header>
            <Card.Body className="space-y-4">
              {rankedMembers.slice(0, 3).map((member, index) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-xl ${
                    index === 0
                      ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200 dark:border-gray-700"
                      : "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankStyle(
                        member.rank
                      )}`}
                    >
                      <Star className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.position}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {member.points}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        积分
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>
      )}

      {activeTab === "records" && (
        <Card>
          <Card.Header>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Card.Title>积分流水记录</Card.Title>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索成员、原因、活动..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
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
                      积分变动
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      原因
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      相关活动
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      日期
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
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {record.memberName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {record.memberName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            record.points > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {record.points > 0 ? (
                            <Plus className="w-4 h-4" />
                          ) : (
                            <Minus className="w-4 h-4" />
                          )}
                          {Math.abs(record.points)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {record.reason}
                      </td>
                      <td className="px-6 py-4">
                        {record.activityName ? (
                          <Badge variant="info">{record.activityName}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(record.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRecords.length === 0 && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                暂无积分记录
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pointRules.map((rule, index) => (
            <Card key={index}>
              <Card.Header>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <rule.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <Card.Title>{rule.title}</Card.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rule.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.level}
                      </span>
                      <Badge variant="default">
                        {typeof item.points === "number"
                          ? `+${item.points} 分`
                          : item.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPointForm({
            memberId: "",
            memberName: "",
            points: 0,
            reason: "",
            activityName: "",
          });
          setSelectedMember(null);
        }}
        title="积分调整"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择成员 <span className="text-red-500">*</span>
            </label>
            <select
              value={pointForm.memberId}
              onChange={(e) => handleMemberSelect(e.target.value)}
              disabled={!!selectedMember}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
            >
              <option value="">请选择成员</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.position}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              积分变动 <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">正数加分，负数扣分</span>
            </label>
            <input
              type="number"
              value={pointForm.points}
              onChange={(e) =>
                setPointForm({
                  ...pointForm,
                  points: parseInt(e.target.value) || 0,
                })
              }
              placeholder="请输入积分数值"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              变动原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={pointForm.reason}
              onChange={(e) =>
                setPointForm({ ...pointForm, reason: e.target.value })
              }
              placeholder="请输入积分变动原因"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              相关活动
            </label>
            <input
              type="text"
              value={pointForm.activityName}
              onChange={(e) =>
                setPointForm({ ...pointForm, activityName: e.target.value })
              }
              placeholder="选填，关联的活动名称"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsAddModalOpen(false);
              setPointForm({
                memberId: "",
                memberName: "",
                points: 0,
                reason: "",
                activityName: "",
              });
              setSelectedMember(null);
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmitPoints}
            disabled={
              !pointForm.memberId ||
              pointForm.points === 0 ||
              !pointForm.reason.trim()
            }
          >
            确认调整
          </Button>
        </div>
      </Modal>
    </div>
  );
}
