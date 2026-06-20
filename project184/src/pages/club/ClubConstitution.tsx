import { useState } from "react";
import {
  FileText,
  Eye,
  Clock,
  User,
  ChevronRight,
  X,
  Save,
  FilePlus,
  BookOpen,
  History,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, generateId } from "@/utils";
import type { ConstitutionVersion } from "@/types";

const emptyConstitution: Omit<ConstitutionVersion, "id" | "createdAt"> = {
  version: "",
  content: "",
  createdBy: "",
  description: "",
};

export default function ClubConstitution() {
  const { constitutions, addConstitution } = useAppStore();
  const [viewingConstitution, setViewingConstitution] =
    useState<ConstitutionVersion | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<
    Omit<ConstitutionVersion, "id" | "createdAt">
  >(emptyConstitution);

  const latestVersion = constitutions[0];

  const handleView = (constitution: ConstitutionVersion) => {
    setViewingConstitution(constitution);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    setFormData(emptyConstitution);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.version || !formData.content) {
      alert("请填写版本号和章程内容");
      return;
    }

    const newConstitution: ConstitutionVersion = {
      ...formData,
      id: generateId("const"),
      createdAt: new Date().toISOString().split("T")[0],
    };
    addConstitution(newConstitution);
    setIsAddModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1
            key={index}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-6 first:mt-0"
          >
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5"
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (/^第[一二三四五六七八九十]+条/.test(line)) {
        return (
          <p
            key={index}
            className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed"
          >
            {line}
          </p>
        );
      } else if (line.startsWith("（") && line.endsWith("）")) {
        return (
          <p
            key={index}
            className="text-gray-600 dark:text-gray-400 mb-2 ml-4 leading-relaxed"
          >
            {line}
          </p>
        );
      } else if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }
      return (
        <p
          key={index}
          className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            章程管理
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            查看和管理社团章程版本历史
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <FilePlus className="w-4 h-4" />
          新增版本
        </Button>
      </div>

      {latestVersion && (
        <Card className="bg-gradient-to-r from-primary-800 to-primary-900 border-0">
          <Card.Body>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      现行章程
                    </h3>
                    <Badge variant="success" className="bg-green-500/20 text-green-100 border-green-400/30">
                      {latestVersion.version}
                    </Badge>
                  </div>
                  <p className="text-primary-200 mt-1 text-sm">
                    {latestVersion.description || "社团基本章程"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-primary-200 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {latestVersion.createdBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(latestVersion.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleView(latestVersion)}
                className="gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
              >
                <Eye className="w-4 h-4" />
                查看详情
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            版本历史
          </Card.Title>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {constitutions.map((constitution, index) => (
              <div
                key={constitution.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                onClick={() => handleView(constitution)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === 0
                          ? "bg-primary-100 dark:bg-primary-900/50"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${
                          index === 0
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    {index < constitutions.length - 1 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {constitution.version}
                      </span>
                      {index === 0 && (
                        <Badge variant="success">
                          最新
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {constitution.description || "章程版本"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(constitution.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {constitution.createdBy}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {constitutions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                暂无章程版本
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={
          viewingConstitution
            ? `章程 ${viewingConstitution.version}`
            : "章程详情"
        }
        size="lg"
      >
        {viewingConstitution && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {viewingConstitution.version}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {viewingConstitution.description || ""}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                <p className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {viewingConstitution.createdBy}
                </p>
                <p className="flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(viewingConstitution.createdAt)}
                </p>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2">
              {renderContent(viewingConstitution.content)}
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={() => setIsViewModalOpen(false)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="新增章程版本"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                版本号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                placeholder="如：v4.0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                创建人
              </label>
              <input
                type="text"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                placeholder="请输入创建人姓名"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              版本说明
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="请简要说明本版本的主要变更"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              章程内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={15}
              placeholder="请输入章程内容，支持使用 # 标题 和 ## 二级标题 格式"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              取消
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
