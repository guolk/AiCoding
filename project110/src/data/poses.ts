import { YogaPose } from '@/types';

export const yogaPoses: YogaPose[] = [
  {
    id: 'mountain-pose',
    nameSanskrit: 'Tadasana',
    nameChinese: '山式',
    category: 'standing',
    difficulty: 'beginner',
    benefits: '改善体态，增强腿部力量，提高身体意识和专注力',
    contraindications: '严重膝盖损伤者需要调整姿势',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20mountain%20pose%20tadasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '保持双脚平行，重量均匀分布在双脚',
      '收紧大腿肌肉，膝盖微屈',
      '拉长脊柱，肩膀下沉远离耳朵',
      '保持呼吸自然，不要屏息'
    ],
    transitionsFrom: [],
    transitionsTo: ['downward-dog', 'warrior-i', 'tree-pose'],
    defaultDuration: 60
  },
  {
    id: 'downward-dog',
    nameSanskrit: 'Adho Mukha Svanasana',
    nameChinese: '下犬式',
    category: 'standing',
    difficulty: 'beginner',
    benefits: '伸展背部、小腿和跟腱，增强手臂力量，改善血液循环',
    contraindications: '手腕受伤、高血压、怀孕期间避免',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20downward%20dog%20pose%20adho%20mukha%20svanasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '双手与肩同宽，手指张开发力',
      '双脚与髋同宽，脚跟尽量踩地',
      '坐骨向后向上延展，背部保持平展',
      '初学者可以微屈膝盖'
    ],
    transitionsFrom: ['mountain-pose', 'plank'],
    transitionsTo: ['plank', 'childs-pose', 'warrior-i'],
    defaultDuration: 90
  },
  {
    id: 'plank',
    nameSanskrit: 'Phalakasana',
    nameChinese: '平板式',
    category: 'arm-balance',
    difficulty: 'beginner',
    benefits: '增强核心、手臂和背部力量，改善体态',
    contraindications: '手腕受伤、孕期后期',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20plank%20pose%20phalakasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '身体保持一条直线，从头顶到脚跟',
      '核心收紧，避免臀部过高或过低',
      '手腕与肩膀对齐，手肘微屈',
      '颈部保持自然延伸，不要低头或仰头'
    ],
    transitionsFrom: ['downward-dog'],
    transitionsTo: ['downward-dog', 'knee-chest', 'low-plank'],
    defaultDuration: 45
  },
  {
    id: 'childs-pose',
    nameSanskrit: 'Balasana',
    nameChinese: '婴儿式',
    category: 'prone',
    difficulty: 'beginner',
    benefits: '放松背部和肩部，缓解疲劳，平复情绪',
    contraindications: '膝盖严重受伤、怀孕后期',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20child%20pose%20balasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '膝盖分开与髋同宽，大脚趾相触',
      '臀部坐向脚跟，前额触地',
      '手臂可向前伸展或放在身体两侧',
      '深呼吸，完全放松'
    ],
    transitionsFrom: ['downward-dog', 'plank'],
    transitionsTo: ['tabletop-pose', 'cobra-pose'],
    defaultDuration: 60
  },
  {
    id: 'warrior-i',
    nameSanskrit: 'Virabhadrasana I',
    nameChinese: '战士一式',
    category: 'standing',
    difficulty: 'beginner',
    benefits: '增强腿部力量，打开髋部，提升心肺功能',
    contraindications: '膝盖或肩部严重损伤、高血压',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20warrior%201%20pose%20virabhadrasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '前腿膝盖在脚踝正上方，不要超过脚尖',
      '后腿伸直但不锁死，脚跟踩地',
      '髋部尽量朝向正前方',
      '手臂向上延伸，肩膀放松'
    ],
    transitionsFrom: ['mountain-pose', 'downward-dog'],
    transitionsTo: ['warrior-ii', 'triangle-pose'],
    defaultDuration: 45
  },
  {
    id: 'warrior-ii',
    nameSanskrit: 'Virabhadrasana II',
    nameChinese: '战士二式',
    category: 'standing',
    difficulty: 'intermediate',
    benefits: '增强腿部力量，打开髋部和胸部，提高稳定性',
    contraindications: '膝盖损伤、颈部问题',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20warrior%202%20pose%20virabhadrasana%20ii%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '前腿膝盖与脚踝对齐，不要内扣',
      '后腿向外旋转，膝盖朝向脚尖方向',
      '手臂与地面平行，凝视前方手指',
      '保持核心收紧，髋部稳定'
    ],
    transitionsFrom: ['warrior-i'],
    transitionsTo: ['triangle-pose', 'side-angle-pose'],
    defaultDuration: 45
  },
  {
    id: 'triangle-pose',
    nameSanskrit: 'Trikonasana',
    nameChinese: '三角式',
    category: 'standing',
    difficulty: 'intermediate',
    benefits: '伸展腿筋、髋部和躯干，增强核心力量',
    contraindications: '腰部损伤、高血压',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20triangle%20pose%20trikonasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '双脚分开约一腿长，前脚向外旋转90度',
      '从髋部侧弯，不要从腰部',
      '下手可放在小腿、脚踝或地面',
      '上方手臂向上延伸，肩膀放松'
    ],
    transitionsFrom: ['warrior-i', 'warrior-ii'],
    transitionsTo: ['downward-dog', 'mountain-pose'],
    defaultDuration: 45
  },
  {
    id: 'cobra-pose',
    nameSanskrit: 'Bhujangasana',
    nameChinese: '眼镜蛇式',
    category: 'backbend',
    difficulty: 'beginner',
    benefits: '打开胸部，增强背部力量，改善体态',
    contraindications: '腰部损伤、孕妇、手腕受伤',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20cobra%20pose%20bhujangasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '肘部靠近身体两侧，不要外展',
      '用背部力量抬起，不要用手臂力量',
      '肩膀下沉远离耳朵',
      '颈部保持自然延长，不要过度后仰'
    ],
    transitionsFrom: ['childs-pose', 'tabletop-pose'],
    transitionsTo: ['downward-dog', 'locust-pose'],
    defaultDuration: 30
  },
  {
    id: 'locust-pose',
    nameSanskrit: 'Salabhasana',
    nameChinese: '蝗虫式',
    category: 'prone',
    difficulty: 'intermediate',
    benefits: '增强背部和臀部力量，改善消化',
    contraindications: '腰部损伤、孕妇',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20locust%20pose%20salabhasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '双腿伸直并拢，从后臀部发力抬起',
      '保持核心收紧，避免腰部压力过大',
      '额头轻触地面或微微抬起',
      '肩膀下沉，远离耳朵'
    ],
    transitionsFrom: ['cobra-pose'],
    transitionsTo: ['childs-pose', 'bow-pose'],
    defaultDuration: 30
  },
  {
    id: 'tree-pose',
    nameSanskrit: 'Vrksasana',
    nameChinese: '树式',
    category: 'standing',
    difficulty: 'beginner',
    benefits: '提高平衡感和专注力，增强腿部和核心力量',
    contraindications: '脚踝或膝盖严重损伤',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20tree%20pose%20vrksasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '支撑腿膝盖微屈，不要锁死',
      '抬起的脚放在大腿内侧，不要放在膝盖上',
      '双手合十于胸前或向上伸展',
      '目光凝视一个固定点帮助平衡'
    ],
    transitionsFrom: ['mountain-pose'],
    transitionsTo: ['mountain-pose', 'warrior-iii'],
    defaultDuration: 30
  },
  {
    id: 'warrior-iii',
    nameSanskrit: 'Virabhadrasana III',
    nameChinese: '战士三式',
    category: 'standing',
    difficulty: 'intermediate',
    benefits: '增强腿部和核心力量，提高平衡感',
    contraindications: '膝盖损伤、背部问题',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20warrior%203%20pose%20virabhadrasana%20iii%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '身体从髋部折叠，与地面平行',
      '后腿伸直，与身体成一条直线',
      '核心收紧，保持髋部稳定',
      '手臂向前或放在身体两侧'
    ],
    transitionsFrom: ['tree-pose', 'mountain-pose'],
    transitionsTo: ['mountain-pose', 'downward-dog'],
    defaultDuration: 30
  },
  {
    id: 'bridge-pose',
    nameSanskrit: 'Setu Bandhasana',
    nameChinese: '桥式',
    category: 'backbend',
    difficulty: 'beginner',
    benefits: '打开胸部和髋部，增强背部和臀部力量',
    contraindications: '颈部损伤、高血压',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20bridge%20pose%20setu%20bandhasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '双脚与髋同宽，脚跟靠近臀部',
      '从后大腿和臀部发力抬起骨盆',
      '下巴微收，避免颈部压力',
      '可以在骶骨下方放一块瑜伽砖辅助'
    ],
    transitionsFrom: ['supine-spinal-twist'],
    transitionsTo: ['legs-up-the-wall', 'savasana'],
    defaultDuration: 45
  },
  {
    id: 'supine-spinal-twist',
    nameSanskrit: 'Supta Matsyendrasana',
    nameChinese: '仰卧脊柱扭转',
    category: 'supine',
    difficulty: 'beginner',
    benefits: '按摩腹部器官，释放背部紧张，改善消化',
    contraindications: '近期手术、严重背部损伤',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20supine%20spinal%20twist%20supta%20matsyendrasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '肩膀尽量贴地，不要抬起',
      '双腿向一侧扭转，目光看向另一侧',
      '膝盖并拢，大腿与身体成90度',
      '可以用手轻压膝盖加深扭转'
    ],
    transitionsFrom: ['supine-leg-stretch'],
    transitionsTo: ['bridge-pose', 'savasana'],
    defaultDuration: 45
  },
  {
    id: 'savasana',
    nameSanskrit: 'Savasana',
    nameChinese: '挺尸式',
    category: 'supine',
    difficulty: 'beginner',
    benefits: '深度放松，恢复精力，整合练习效果',
    contraindications: '孕妇后期可侧卧',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20savasana%20corpse%20pose%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '完全仰卧，双腿分开与髋同宽',
      '手臂放在身体两侧，掌心朝上',
      '闭上眼睛，完全放松所有肌肉',
      '保持自然呼吸，不要控制'
    ],
    transitionsFrom: ['bridge-pose', 'supine-spinal-twist'],
    transitionsTo: [],
    defaultDuration: 300
  },
  {
    id: 'seated-forward-fold',
    nameSanskrit: 'Paschimottanasana',
    nameChinese: '坐立前屈',
    category: 'seated',
    difficulty: 'beginner',
    benefits: '伸展背部和腿筋，缓解压力，改善消化',
    contraindications: '背部损伤、坐骨神经痛',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20seated%20forward%20fold%20paschimottanasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '从髋部折叠，不要从腰部',
      '保持脊柱延伸，不要弓背',
      '手可以抓握脚踝或小腿',
      '初学者可以微屈膝盖'
    ],
    transitionsFrom: ['easy-pose'],
    transitionsTo: ['childs-pose', 'savasana'],
    defaultDuration: 60
  },
  {
    id: 'easy-pose',
    nameSanskrit: 'Sukhasana',
    nameChinese: '简易坐',
    category: 'seated',
    difficulty: 'beginner',
    benefits: '打开髋部，平静心灵，准备冥想',
    contraindications: '膝盖严重损伤',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20easy%20pose%20sukhasana%20meditation%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '双腿交叉，脚踝在膝盖下方',
      '脊柱直立，肩膀放松',
      '双手放在膝盖上，掌心朝上或朝下',
      '可以在臀部下方放瑜伽垫垫高'
    ],
    transitionsFrom: ['savasana'],
    transitionsTo: ['seated-forward-fold'],
    defaultDuration: 120
  },
  {
    id: 'dolphin-pose',
    nameSanskrit: 'Ardha Pincha Mayurasana',
    nameChinese: '海豚式',
    category: 'inversion',
    difficulty: 'intermediate',
    benefits: '增强核心和肩部力量，准备倒立',
    contraindications: '颈部损伤、高血压',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20dolphin%20pose%20ardha%20pincha%20mayurasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '前臂着地，手肘与肩同宽',
      '头顶轻点地面，不要承重',
      '坐骨向后向上，背部延展',
      '初学者可以弯曲膝盖'
    ],
    transitionsFrom: ['downward-dog'],
    transitionsTo: ['childs-pose', 'downward-dog'],
    defaultDuration: 45
  },
  {
    id: 'crow-pose',
    nameSanskrit: 'Bakasana',
    nameChinese: '乌鸦式',
    category: 'arm-balance',
    difficulty: 'intermediate',
    benefits: '增强手臂和核心力量，提高专注力',
    contraindications: '手腕损伤、孕妇',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20crow%20pose%20bakasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '双手与肩同宽，手指张开发力',
      '膝盖靠近上臂',
      '重心向前，脚跟抬起',
      '目光凝视双手之间的一点'
    ],
    transitionsFrom: ['mountain-pose'],
    transitionsTo: ['childs-pose', 'plank'],
    defaultDuration: 20
  },
  {
    id: 'legs-up-the-wall',
    nameSanskrit: 'Viparita Karani',
    nameChinese: '倒箭式',
    category: 'inversion',
    difficulty: 'beginner',
    benefits: '缓解腿部疲劳，促进血液循环，平静神经系统',
    contraindications: '青光眼、高血压',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20legs%20up%20the%20wall%20viparita%20karani%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '臀部靠近墙壁，双腿向上伸展',
      '手臂可以放在身体两侧或腹部',
      '保持自然呼吸，完全放松',
      '背部可以用瑜伽垫支撑'
    ],
    transitionsFrom: ['bridge-pose'],
    transitionsTo: ['savasana'],
    defaultDuration: 120
  },
  {
    id: 'pigeon-pose',
    nameSanskrit: 'Eka Pada Rajakapotasana',
    nameChinese: '鸽子式',
    category: 'seated',
    difficulty: 'intermediate',
    benefits: '深度打开髋部，伸展大腿前侧',
    contraindications: '膝盖损伤、怀孕后期',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20pigeon%20pose%20eka%20pada%20rajakapotasana%20illustration%20clean%20minimal%20style&image_size=square'],
    precautions: [
      '前腿小腿尽量与垫子前缘平行',
      '后腿伸直，髋部摆正',
      '可以用手支撑或向前折叠',
      '在臀部下方放瑜伽垫帮助平衡'
    ],
    transitionsFrom: ['downward-dog'],
    transitionsTo: ['childs-pose', 'downward-dog'],
    defaultDuration: 60
  }
];

export const getPoseById = (id: string): YogaPose | undefined => {
  return yogaPoses.find(pose => pose.id === id);
};

export const getPosesByCategory = (category: string): YogaPose[] => {
  return yogaPoses.filter(pose => pose.category === category);
};

export const getPosesByDifficulty = (difficulty: string): YogaPose[] => {
  return yogaPoses.filter(pose => pose.difficulty === difficulty);
};

export const searchPoses = (query: string): YogaPose[] => {
  const lowerQuery = query.toLowerCase();
  return yogaPoses.filter(pose => 
    pose.nameChinese.toLowerCase().includes(lowerQuery) ||
    pose.nameSanskrit.toLowerCase().includes(lowerQuery) ||
    pose.benefits.toLowerCase().includes(lowerQuery)
  );
};
