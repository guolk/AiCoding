import { YogaSequence } from '@/types';

export const defaultSequences: YogaSequence[] = [
  {
    id: 'sun-salutation-a',
    name: '太阳礼拜A',
    description: '经典的太阳礼拜序列，唤醒身体，提升能量，适合早晨练习',
    type: 'standard',
    targetGoal: 'energy',
    totalDuration: 720,
    isBuiltIn: true,
    poses: [
      { poseId: 'mountain-pose', poseName: '山式', duration: 60 },
      { poseId: 'downward-dog', poseName: '下犬式', duration: 60 },
      { poseId: 'plank', poseName: '平板式', duration: 45 },
      { poseId: 'downward-dog', poseName: '下犬式', duration: 60 },
      { poseId: 'mountain-pose', poseName: '山式', duration: 60 },
      { poseId: 'downward-dog', poseName: '下犬式', duration: 60 },
      { poseId: 'plank', poseName: '平板式', duration: 45 },
      { poseId: 'downward-dog', poseName: '下犬式', duration: 60 },
      { poseId: 'mountain-pose', poseName: '山式', duration: 60 },
      { poseId: 'childs-pose', poseName: '婴儿式', duration: 90 },
    ]
  },
  {
    id: 'yin-yoga-sequence',
    name: '阴瑜伽序列',
    description: '深层结缔组织的滋养，帮助释放深层紧张，适合傍晚练习',
    type: 'standard',
    targetGoal: 'flexibility',
    totalDuration: 1800,
    isBuiltIn: true,
    poses: [
      { poseId: 'childs-pose', poseName: '婴儿式', duration: 180 },
      { poseId: 'seated-forward-fold', poseName: '坐立前屈', duration: 180 },
      { poseId: 'pigeon-pose', poseName: '鸽子式', duration: 180 },
      { poseId: 'childs-pose', poseName: '婴儿式', duration: 180 },
      { poseId: 'supine-spinal-twist', poseName: '仰卧脊柱扭转', duration: 180 },
      { poseId: 'legs-up-the-wall', poseName: '倒箭式', duration: 240 },
      { poseId: 'savasana', poseName: '挺尸式', duration: 300 },
    ]
  },
  {
    id: 'restorative-sequence',
    name: '修复瑜伽序列',
    description: '完全放松的修复练习，帮助恢复精力，适合疲劳时练习',
    type: 'standard',
    targetGoal: 'relaxation',
    totalDuration: 1200,
    isBuiltIn: true,
    poses: [
      { poseId: 'childs-pose', poseName: '婴儿式', duration: 180 },
      { poseId: 'legs-up-the-wall', poseName: '倒箭式', duration: 240 },
      { poseId: 'bridge-pose', poseName: '桥式', duration: 180 },
      { poseId: 'supine-spinal-twist', poseName: '仰卧脊柱扭转', duration: 180 },
      { poseId: 'savasana', poseName: '挺尸式', duration: 420 },
    ]
  },
  {
    id: 'stress-relief-sequence',
    name: '减压放松序列',
    description: '缓解压力和焦虑的温和序列，适合忙碌的工作日结束时',
    type: 'standard',
    targetGoal: 'stress-relief',
    totalDuration: 900,
    isBuiltIn: true,
    poses: [
      { poseId: 'easy-pose', poseName: '简易坐', duration: 120 },
      { poseId: 'childs-pose', poseName: '婴儿式', duration: 120 },
      { poseId: 'cobra-pose', poseName: '眼镜蛇式', duration: 60 },
      { poseId: 'downward-dog', poseName: '下犬式', duration: 120 },
      { poseId: 'bridge-pose', poseName: '桥式', duration: 120 },
      { poseId: 'legs-up-the-wall', poseName: '倒箭式', duration: 180 },
      { poseId: 'savasana', poseName: '挺尸式', duration: 180 },
    ]
  },
  {
    id: 'strength-building-sequence',
    name: '力量提升序列',
    description: '增强核心和全身力量的动态序列，需要一定基础',
    type: 'standard',
    targetGoal: 'strength',
    totalDuration: 1080,
    isBuiltIn: true,
    poses: [
      { poseId: 'mountain-pose', poseName: '山式', duration: 60 },
      { poseId: 'downward-dog', poseName: '下犬式', duration: 60 },
      { poseId: 'plank', poseName: '平板式', duration: 60 },
      { poseId: 'warrior-i', poseName: '战士一式', duration: 60 },
      { poseId: 'warrior-ii', poseName: '战士二式', duration: 60 },
      { poseId: 'triangle-pose', poseName: '三角式', duration: 60 },
      { poseId: 'dolphin-pose', poseName: '海豚式', duration: 60 },
      { poseId: 'cobra-pose', poseName: '眼镜蛇式', duration: 45 },
      { poseId: 'locust-pose', poseName: '蝗虫式', duration: 45 },
      { poseId: 'bridge-pose', poseName: '桥式', duration: 90 },
      { poseId: 'tree-pose', poseName: '树式', duration: 60 },
      { poseId: 'childs-pose', poseName: '婴儿式', duration: 90 },
      { poseId: 'savasana', poseName: '挺尸式', duration: 240 },
    ]
  }
];

export const getSequenceById = (id: string, sequences: YogaSequence[]): YogaSequence | undefined => {
  return sequences.find(seq => seq.id === id);
};

export const getSequencesByGoal = (goal: string, sequences: YogaSequence[]): YogaSequence[] => {
  return sequences.filter(seq => seq.targetGoal === goal);
};

export const getBuiltInSequences = (sequences: YogaSequence[]): YogaSequence[] => {
  return sequences.filter(seq => seq.isBuiltIn);
};

export const getCustomSequences = (sequences: YogaSequence[]): YogaSequence[] => {
  return sequences.filter(seq => !seq.isBuiltIn);
};
