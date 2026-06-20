export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getStatusColor(
  status: string
): "green" | "yellow" | "red" | "blue" | "gray" {
  const statusMap: Record<string, "green" | "yellow" | "red" | "blue" | "gray"> =
    {
      active: "green",
      approved: "green",
      completed: "green",
      ongoing: "blue",
      planning: "yellow",
      reviewing: "yellow",
      submitted: "yellow",
      draft: "gray",
      pending: "yellow",
      rejected: "red",
      cancelled: "red",
      inactive: "gray",
      graduated: "gray",
    };
  return statusMap[status] || "gray";
}

export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    active: "活跃",
    approved: "已通过",
    completed: "已完成",
    ongoing: "进行中",
    planning: "筹备中",
    reviewing: "审核中",
    submitted: "已提交",
    draft: "草稿",
    pending: "待审批",
    rejected: "已拒绝",
    cancelled: "已取消",
    inactive: "不活跃",
    graduated: "已毕业",
    join: "入社",
    leave: "退社",
    income: "收入",
    expense: "支出",
  };
  return labelMap[status] || status;
}

export function getCategoryLabel(category: string): string {
  const labelMap: Record<string, string> = {
    membership_fee: "会费收入",
    school_grant: "学校拨款",
    sponsorship: "企业赞助",
    activity: "活动支出",
    office: "办公采购",
    training: "培训经费",
    other: "其他",
    scholarship: "奖学金",
    honor: "荣誉称号",
    competition: "竞赛获奖",
    volunteer: "志愿服务",
  };
  return labelMap[category] || category;
}
