import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, CheckCircle2, XCircle, Minus, Info } from "lucide-react";
import { useApplicationStore } from "@/store/useApplicationStore";
import { formatCurrency } from "@/utils/format";

export default function ApplicationCompare() {
  const { universities } = useApplicationStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    universities.slice(0, Math.min(3, universities.length)).map((u) => u.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedUniversities = universities.filter((u) => selectedIds.includes(u.id));

  const renderComparison = (label: string, values: Array<{ id: string; value: string | number; raw?: number }>) => {
    const nums = values.map(v => typeof v.raw === "number" ? v.raw : null).filter((n): n is number => n !== null);
    const hasNumeric = nums.length === values.length && nums.length > 0;
    let minIdx = -1;
    let maxIdx = -1;
    if (hasNumeric && nums.length > 1) {
      minIdx = nums.indexOf(Math.min(...nums));
      maxIdx = nums.indexOf(Math.max(...nums));
    }

    return (
      <tr>
        <td className="px-6 py-4 text-left bg-slate-50/50 font-medium text-slate-700 whitespace-nowrap border-b border-slate-100">
          {label}
        </td>
        {values.map((v, idx) => (
          <td
            key={v.id}
            className={`px-6 py-4 text-center border-b border-slate-100 ${
              hasNumeric && idx === maxIdx && label.includes("学费") ? "bg-danger-50 text-danger-600 font-bold" :
              hasNumeric && idx === minIdx && label.includes("学费") ? "bg-success-50 text-success-600 font-bold" :
              hasNumeric && idx === maxIdx ? "bg-success-50 text-success-600 font-bold" :
              hasNumeric && idx === minIdx && !label.includes("学费") ? "bg-danger-50 text-danger-600" :
              "text-slate-700"
            }`}
          >
            {v.value}
          </td>
        ))}
      </tr>
    );
  };

  const boolCell = (condition: boolean) => {
    if (condition) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success-100 text-success-600">
          <CheckCircle2 className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
        <Minus className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link
        to="/applications"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回申请列表
      </Link>

      {/* 标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <Scale className="w-7 h-7 text-primary-700" />
            院校申请要求对比
          </h1>
          <p className="mt-1 text-slate-500">横向对比各院校的录取要求、学费和关键指标</p>
        </div>
      </div>

      {/* 院校选择器 */}
      <div className="card p-5">
        <div className="text-sm font-medium text-slate-700 mb-3">选择要对比的院校（建议选择2-4所）</div>
        <div className="flex flex-wrap gap-3">
          {universities.map((uni) => {
            const isSelected = selectedIds.includes(uni.id);
            return (
              <button
                key={uni.id}
                onClick={() => toggleSelect(uni.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 border-2 ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <img
                  src={uni.logoUrl}
                  alt={uni.name}
                  className="w-8 h-8 rounded-lg object-contain bg-slate-100 p-1"
                />
                <div className="text-left">
                  <div className={`font-medium text-sm ${isSelected ? "text-primary-800" : "text-slate-700"}`}>
                    {uni.name}
                  </div>
                  <div className="text-xs text-slate-500">{uni.country}</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? "bg-primary-600 text-white"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 对比表格 */}
      {selectedUniversities.length >= 2 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="px-6 py-5 bg-slate-50 border-b-2 border-slate-200 text-left font-semibold text-slate-700 w-48">
                    对比项目
                  </th>
                  {selectedUniversities.map((uni) => (
                    <th
                      key={uni.id}
                      className="px-6 py-5 bg-slate-50 border-b-2 border-slate-200 text-center min-w-[200px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                          <img
                            src={uni.logoUrl}
                            alt={uni.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-slate-900">{uni.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{uni.country} · {uni.major}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {/* 基础信息 */}
                {renderComparison(
                  "所在国家 / 地区",
                  selectedUniversities.map((u) => ({ id: u.id, value: u.country }))
                )}
                {renderComparison(
                  "申请专业",
                  selectedUniversities.map((u) => ({ id: u.id, value: u.major }))
                )}

                {/* 学术要求 */}
                <tr>
                  <td colSpan={selectedUniversities.length + 1} className="px-6 py-3 bg-gradient-to-r from-primary-50 to-transparent font-serif font-semibold text-primary-800 border-b border-slate-100">
                    📊 学术成绩要求
                  </td>
                </tr>
                {renderComparison(
                  "最低 GPA",
                  selectedUniversities.map((u) => ({
                    id: u.id,
                    value: `${u.requirements.gpaMin.toFixed(1)}+`,
                    raw: u.requirements.gpaMin,
                  }))
                )}
                {renderComparison(
                  "TOEFL 最低分",
                  selectedUniversities.map((u) => ({
                    id: u.id,
                    value: `${u.requirements.toeflMin}+`,
                    raw: u.requirements.toeflMin,
                  }))
                )}
                {renderComparison(
                  "IELTS 最低分",
                  selectedUniversities.map((u) => ({
                    id: u.id,
                    value: `${u.requirements.ieltsMin.toFixed(1)}+`,
                    raw: u.requirements.ieltsMin,
                  }))
                )}
                {renderComparison(
                  "GRE 分数要求",
                  selectedUniversities.map((u) => ({
                    id: u.id,
                    value: u.requirements.greScore ? `${u.requirements.greScore}+` : "不强制",
                    raw: u.requirements.greScore ?? 0,
                  }))
                )}
                {renderComparison(
                  "推荐信数量",
                  selectedUniversities.map((u) => ({
                    id: u.id,
                    value: `${u.requirements.recommendationCount} 封`,
                    raw: u.requirements.recommendationCount,
                  }))
                )}

                {/* 费用 */}
                <tr>
                  <td colSpan={selectedUniversities.length + 1} className="px-6 py-3 bg-gradient-to-r from-accent-50 to-transparent font-serif font-semibold text-accent-700 border-b border-slate-100">
                    💰 费用预算
                  </td>
                </tr>
                {renderComparison(
                  "学费 / 学年",
                  selectedUniversities.map((u) => ({
                    id: u.id,
                    value: formatCurrency(u.tuition.tuitionPerYear, u.tuition.currency),
                    raw:
                      u.tuition.currency === "USD"
                        ? u.tuition.tuitionPerYear * 7.2
                        : u.tuition.currency === "GBP"
                          ? u.tuition.tuitionPerYear * 9.2
                          : u.tuition.currency === "SGD"
                            ? u.tuition.tuitionPerYear * 5.3
                            : u.tuition.currency === "CHF"
                              ? u.tuition.tuitionPerYear * 8.3
                              : u.tuition.tuitionPerYear,
                  }))
                )}
                {renderComparison(
                  "生活费估算 / 年",
                  selectedUniversities.map((u) => ({
                    id: u.id,
                    value: formatCurrency(u.tuition.livingCost, u.tuition.currency),
                    raw:
                      u.tuition.currency === "USD"
                        ? u.tuition.livingCost * 7.2
                        : u.tuition.currency === "GBP"
                          ? u.tuition.livingCost * 9.2
                          : u.tuition.currency === "SGD"
                            ? u.tuition.livingCost * 5.3
                            : u.tuition.currency === "CHF"
                              ? u.tuition.livingCost * 8.3
                              : u.tuition.livingCost,
                  }))
                )}

                {/* 特殊要求 */}
                <tr>
                  <td colSpan={selectedUniversities.length + 1} className="px-6 py-3 bg-gradient-to-r from-purple-50 to-transparent font-serif font-semibold text-purple-800 border-b border-slate-100">
                    ✨ 其他信息
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-left bg-slate-50/50 font-medium text-slate-700 border-b border-slate-100">
                    是否有奖学金
                  </td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="px-6 py-4 text-center border-b border-slate-100">
                      {u.scholarship ? (
                        <span className="text-sm text-success-700 font-medium bg-success-50 px-3 py-1 rounded-full">
                          ✓ {u.scholarship}
                        </span>
                      ) : (
                        boolCell(false)
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-5 text-left bg-slate-50/50 font-medium text-slate-700 align-top">
                    <div className="flex items-center gap-1">
                      <Info className="w-4 h-4 text-slate-400" />
                      特别要求备注
                    </div>
                  </td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="px-6 py-5 text-center text-sm text-slate-600 border-b border-slate-100 align-top">
                      {u.requirements.otherRequirements || (
                        <span className="text-slate-400">无特别说明</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <Scale className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">请选择至少2所院校进行对比</h3>
          <p className="text-slate-500">点击上方卡片选择你想要对比的院校</p>
        </div>
      )}
    </div>
  );
}
