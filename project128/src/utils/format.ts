
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const getJewelryTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    ring: '戒指',
    necklace: '项链',
    earring: '耳环',
    bracelet: '手链',
    brooch: '胸针',
    watch: '腕表',
    other: '其他',
  };
  return labels[type] || type;
};

export const getOccasionLabel = (occasion: string): string => {
  const labels: Record<string, string> = {
    daily: '日常',
    formal: '正式场合',
    wedding: '婚礼',
    party: '派对',
    business: '商务',
  };
  return labels[occasion] || occasion;
};

export const getPhotoTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    wear: '佩戴效果',
    detail: '细节特写',
    certificate: '证书照片',
    other: '其他',
  };
  return labels[type] || type;
};

export const getMaintenanceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    clean: '清洁',
    polish: '抛光',
    inspection: '检查',
    other: '其他',
  };
  return labels[type] || type;
};

export const getCertificateTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    GIA: 'GIA 美国宝石学院',
    IGI: 'IGI 国际宝石学院',
    NGTC: '国检 NGTC',
    other: '其他',
  };
  return labels[type] || type;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getDaysUntil = (dateString: string): number => {
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
