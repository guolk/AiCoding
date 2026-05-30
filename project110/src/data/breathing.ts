import { BreathingTechnique } from '@/types';

export const breathingTechniques: BreathingTechnique[] = [
  {
    id: 'diaphragmatic-breathing',
    name: '腹式呼吸',
    sanskritName: 'Diaphragmatic Breathing',
    description: '基础的腹式呼吸练习，帮助放松和平静身心',
    steps: [
      '找一个舒适的坐姿或卧姿',
      '将一只手放在腹部，另一只放在胸部',
      '通过鼻子慢慢吸气，感觉腹部鼓起',
      '通过鼻子或嘴巴慢慢呼气，感觉腹部收缩',
      '保持呼吸深长而缓慢，不要用力',
      '重复这个过程，每次呼吸尽量延长'
    ],
    cyclesPerMinute: 6,
    benefits: '减轻压力和焦虑，改善呼吸系统功能，增强核心稳定性',
    contraindications: '无特殊禁忌，适合所有人练习'
  },
  {
    id: 'ujjayi-breathing',
    name: '胜利呼吸',
    sanskritName: 'Ujjayi Pranayama',
    description: '瑜伽中常用的呼吸方式，通过喉腔收缩产生柔和的声音',
    steps: [
      '采取舒适的坐姿，脊柱直立',
      '轻轻收缩喉咙后方的肌肉',
      '通过鼻子吸气和呼气，空气经过收缩的喉咙',
      '呼吸时会听到类似海浪或睡眠的声音',
      '保持呼吸深长、稳定且有节奏',
      '吸气和呼气的时间尽量相等'
    ],
    cyclesPerMinute: 8,
    benefits: '增强专注力，调节体温，稳定情绪，在体式练习中提供节奏感',
    contraindications: '严重的喉咙问题、感冒鼻塞时避免练习'
  },
  {
    id: 'bhramari-breathing',
    name: '蜂鸣呼吸',
    sanskritName: 'Bhramari Pranayama',
    description: '通过发出嗡嗡声来平静心灵，缓解焦虑和紧张',
    steps: [
      '找一个安静的地方坐好，闭上眼睛',
      '用拇指堵住耳朵，食指放在眉毛上方',
      '中指轻轻放在眼睛上，无名指放在鼻子两侧',
      '小指放在下巴两侧',
      '通过鼻子深吸一口气',
      '呼气时发出像蜜蜂一样的嗡嗡声（mmmmm）',
      '重复多次，感受振动带来的平静'
    ],
    cyclesPerMinute: 4,
    benefits: '缓解偏头痛，减轻焦虑，改善睡眠质量，平静思绪',
    contraindications: '耳部感染、严重高血压时避免'
  },
  {
    id: 'alternate-nostril-breathing',
    name: '交替鼻孔呼吸',
    sanskritName: 'Nadi Shodhana',
    description: '平衡左右两侧能量通道，带来内心的平静和平衡',
    steps: [
      '采取舒适的坐姿，脊柱直立',
      '用右手拇指堵住右鼻孔，从左鼻孔深吸气',
      '用无名指堵住左鼻孔，拇指松开右鼻孔，从右鼻孔呼气',
      '从右鼻孔深吸气',
      '用拇指堵住右鼻孔，松开无名指，从左鼻孔呼气',
      '这是一个完整的循环，重复多次'
    ],
    cyclesPerMinute: 5,
    benefits: '平衡神经系统，改善注意力，减轻压力，净化能量通道',
    contraindications: '感冒鼻塞时避免，孕期前三个月谨慎'
  },
  {
    id: 'kapalabhati',
    name: '圣光调息',
    sanskritName: 'Kapalabhati',
    description: '通过快速有力的呼气来净化呼吸道和唤醒能量',
    steps: [
      '采取舒适的坐姿，脊柱直立',
      '深吸一口气，然后快速有力地通过鼻子呼气',
      '每次呼气后自然吸气，不需要刻意控制',
      '专注于有力的呼气，让吸气自然发生',
      '开始时可以做10-15次呼气，逐渐增加',
      '完成一轮后，自然呼吸几分钟'
    ],
    cyclesPerMinute: 30,
    benefits: '清洁呼吸道，提升能量，增强腹部力量，改善消化',
    contraindications: '高血压、心脏病、孕期、经期、近期手术者避免'
  }
];

export const getBreathingTechniqueById = (id: string): BreathingTechnique | undefined => {
  return breathingTechniques.find(technique => technique.id === id);
};
