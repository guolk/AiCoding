import { useState, useMemo } from "react";
import {
  Users,
  Edit3,
  Trash2,
  Search,
  X,
  Save,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, generateId } from "@/utils";
import type { Cadre } from "@/types";

const emptyCadre: Omit<Cadre, "id"> = {
  name: "",
  position: "",
  term: "",
  startDate: "",
  endDate: "",
  department: "",
};

export default function ClubCadres() {
  const { cadres, addCadre, updateCadre, deleteCadre } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCadre, setEditingCadre] = useState<Cadre | null>(null);
  const [formData, setFormData] = useState<Omit<Cadre, "id">>(emptyCadre);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const terms = useMemo(() => {
    const termSet = new Set(cadres.map((c) => c.term));
    return Array.from(termSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      return numB - numA;
    });
  }, [cadres]);

  const filteredCadres = useMemo(() => {
    return cadres.filter((cadre) => {
      const matchesSearch =
        cadre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cadre.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cadre.department?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTerm = !selectedTerm || cadre.term === selectedTerm;
      return matchesSearch && matchesTerm;
    });
  }, [cadres, searchTerm, selectedTerm]);

  const cadresByTerm = useMemo(() => {
    const grouped: Record<string, Cadre[]> = {};
    filteredCadres.forEach((cadre) => {
      if (!grouped[cadre.term]) {
        grouped[cadre.term] = [];
      }
      grouped[cadre.term].push(cadre);
    });
    return grouped;
  }, [filteredCadres]);

  const handleAdd = () => {
    setEditingCadre(null);
    setFormData(emptyCadre);
    setIsModalOpen(true);
  };

  const handleEdit = (cadre: Cadre) => {
    setEditingCadre(cadre);
    setFormData({
      name: cadre.name,
      position: cadre.position,
      term: cadre.term,
      startDate: cadre.startDate,
      endDate: cadre.endDate || "",
      department: cadre.department || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除这名干部吗？")) {
      deleteCadre(id);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.position || !formData.term) {
      alert("请填写必填项");
      return;
    }

    if (editingCadre) {
      updateCadre(editingCadre.id, formData);
    } else {
      const newCadre: Cadre = {
        ...formData,
        id: generateId("cadre"),
      };
      addCadre(newCadre);
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  const isCurrentTerm = (term: string) => {
    const termCadres = cadres.filter((c) => c.term === term);
    return termCadres.some((c) => !c.endDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            历届干部
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理社团各届干部信息
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <UserPlus className="w-4 h-4" />
          添加干部
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名、职务、部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTerm === null ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedTerm(null)}
          >
            全部
          </Button>
          {terms.slice(0, 4).map((term) => (
            <Button
              key={term}
              variant={selectedTerm === term ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedTerm(term)}
            >
              {term}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {terms.map((term) => {
          const termCadres = cadresByTerm[term];
          if (!termCadres || termCadres.length === 0) return null;

          const isExpanded = expandedTerms.has(term);
          const current = isCurrentTerm(term);

          return (
            <Card key={term}>
              <Card.Header
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors p-0"
              >
                <div
                  className="flex items-center justify-between px-6 py-4"
                  onClick={() => toggleTerm(term)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {term}
                        </h3>
                        {current && (
                          <Badge variant="success">现任</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        共 {termCadres.length} 名干部
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </Card.Header>

              {isExpanded && (
                <Card.Body className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            姓名
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            职务
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            部门
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            任期
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {termCadres.map((cadre) => (
                          <tr
                            key={cadre.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                    {cadre.name.charAt(0)}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {cadre.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="default">{cadre.position}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                              {cadre.department || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                              <div>
                                <p>开始: {formatDate(cadre.startDate)}</p>
                                <p>
                                  结束:{" "}
                                  {cadre.endDate
                                    ? formatDate(cadre.endDate)
                                    : "至今"}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(cadre)}
                                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(cadre.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
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
                </Card.Body>
              )}
            </Card>
          );
        })}

        {filteredCadres.length === 0 && (
          <Card>
            <Card.Body className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                暂无匹配的干部信息
              </p>
            </Card.Body>
          </Card>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCadre ? "编辑干部" : "添加干部"}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入姓名"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                职务 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="请输入职务"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                届次 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                placeholder="如：第7届"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                部门
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="请输入部门"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                开始日期
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                结束日期
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
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
