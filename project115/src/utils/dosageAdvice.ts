export const getMakeupAdvice = (): string[] => {
  return [
    '如果距离下一次服药时间超过4小时，可以补服。',
    '如果距离下一次服药时间少于4小时，跳过本次，下次正常服用。',
    '切勿加倍服用以弥补漏服。',
    '如有疑问，请咨询医生或药师。'
  ];
};

export const getReminderText = (relation: 'before' | 'after' | 'any', time: string): string => {
  const relationText = {
    before: '饭前',
    after: '饭后',
    any: ''
  }[relation];
  return relationText ? `${time} ${relationText}服用` : `${time} 服用`;
};
