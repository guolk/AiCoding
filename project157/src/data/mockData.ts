import type { Student, CourseRecord, Artwork, Evaluation, Communication, ExhibitionRecord } from '../types';

const img = (prompt: string, size = 'square_hd') =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;

export const mockStudents: Student[] = [
  {
    id: '1',
    name: '李小雅',
    age: 7,
    className: '启蒙班A组',
    enrollmentDate: '2025-03-15',
    artCharacteristics: '对色彩敏感，喜欢大胆用色，想象力丰富，尤其擅长画动物和自然场景。性格活泼，课堂上积极参与。',
    parentExpectation: '希望培养孩子的艺术兴趣，提高审美能力，能够通过绘画表达自己的想法和情感。',
    avatar: img('cute little girl avatar, cartoon style, warm colors, smiling face, art painting theme', 'square'),
    styleAssessment: {
      abstractTendency: 4,
      concreteTendency: 8,
      colorSense: 9,
      compositionAwareness: 6,
      notes: '小雅更偏向具象绘画，喜欢描绘具体的事物。色彩感觉非常出色，总能搭配出令人惊喜的色彩组合。构图方面需要加强引导。'
    }
  },
  {
    id: '2',
    name: '王子轩',
    age: 8,
    className: '启蒙班B组',
    enrollmentDate: '2025-02-20',
    artCharacteristics: '观察力强，细节描绘能力突出，喜欢画交通工具和机械类题材。性格沉稳，作画认真仔细。',
    parentExpectation: '希望孩子能够系统学习绘画技巧，培养耐心和专注力，将来可以参加一些绘画比赛。',
    avatar: img('cute little boy avatar, cartoon style, blue theme, glasses, art painting theme', 'square'),
    styleAssessment: {
      abstractTendency: 3,
      concreteTendency: 9,
      colorSense: 6,
      compositionAwareness: 8,
      notes: '子轩的绘画非常写实，注重细节和准确性。构图意识很强，画面安排合理。色彩运用相对保守，建议鼓励更多色彩尝试。'
    }
  },
  {
    id: '3',
    name: '张诗涵',
    age: 6,
    className: '启蒙班A组',
    enrollmentDate: '2025-04-10',
    artCharacteristics: '充满创意，画风大胆，喜欢尝试不同的材料和表现手法。对抽象艺术有天然的兴趣。',
    parentExpectation: '保护孩子的创造力和想象力，不要过早限制她的画风，希望她能自由快乐地画画。',
    avatar: img('cute little girl avatar, cartoon style, colorful rainbow theme, creative art', 'square'),
    styleAssessment: {
      abstractTendency: 9,
      concreteTendency: 4,
      colorSense: 8,
      compositionAwareness: 5,
      notes: '诗涵是个天生的小艺术家，她的作品充满想象力和创意，色彩运用大胆而独特。需要适当引导构图概念，同时保护她的创作天性。'
    }
  },
  {
    id: '4',
    name: '陈浩然',
    age: 9,
    className: '进阶班A组',
    enrollmentDate: '2024-09-01',
    artCharacteristics: '学习能力强，技巧掌握快，尤其擅长线条和速写。喜欢漫画和人物绘画。',
    parentExpectation: '希望孩子能在绘画方面有更专业的发展，打好基础，将来考虑走美术专业路线。',
    avatar: img('cute boy avatar, cartoon style, green theme, sketching pencil, art theme', 'square'),
    styleAssessment: {
      abstractTendency: 5,
      concreteTendency: 7,
      colorSense: 7,
      compositionAwareness: 8,
      notes: '浩然综合能力均衡，技巧扎实。人物造型能力突出，线条流畅有力。可以开始接触更专业的绘画训练。'
    }
  },
  {
    id: '5',
    name: '刘美琪',
    age: 7,
    className: '启蒙班B组',
    enrollmentDate: '2025-01-15',
    artCharacteristics: '细腻敏感，画风柔美，喜欢画花卉和公主主题。色彩搭配清新淡雅。',
    parentExpectation: '培养女儿的艺术修养，希望通过绘画陶冶情操，提升气质。',
    avatar: img('cute little girl avatar, cartoon style, pink theme, flowers, princess style', 'square'),
    styleAssessment: {
      abstractTendency: 3,
      concreteTendency: 8,
      colorSense: 9,
      compositionAwareness: 7,
      notes: '美琪的作品非常精致，色彩柔和协调，画面干净整洁。可以鼓励她尝试更多题材，丰富画面表现力。'
    }
  },
  {
    id: '6',
    name: '赵天翊',
    age: 8,
    className: '进阶班B组',
    enrollmentDate: '2024-11-20',
    artCharacteristics: '空间感强，喜欢画建筑和风景。色彩对比强烈，画面有冲击力。',
    parentExpectation: '希望孩子能坚持绘画，培养一项特长，同时提高观察能力和动手能力。',
    avatar: img('cute boy avatar, cartoon style, orange theme, building blocks, creative', 'square'),
    styleAssessment: {
      abstractTendency: 6,
      concreteTendency: 7,
      colorSense: 8,
      compositionAwareness: 9,
      notes: '天翊的空间感和透视意识非常出色，风景画尤其优秀。构图能力很强，画面有故事感。'
    }
  }
];

export const mockCourses: CourseRecord[] = [
  {
    id: 'c1',
    studentId: '1',
    date: '2026-06-05',
    topic: '我的小宠物',
    materials: ['水彩颜料', '水彩纸', '水彩笔', '调色盘', '水杯'],
    techniques: ['湿画法', '色彩叠加', '留白技巧', '细节刻画'],
    objectives: '学习用水彩画表现动物的毛发质感，掌握湿画法的基本技巧，能够画出可爱的宠物形象。',
    observation: {
      participationLevel: 9,
      emotionalExpression: '今天小雅特别开心，因为画的是她家里的小猫。画的时候一直在跟老师分享小猫的趣事，画面充满了爱。',
      skillMastery: '湿画法掌握得不错，色彩过渡自然。猫咪的神态抓得很好，眼睛画得特别有神。',
      notes: '下次可以尝试更多不同的动物，加强对动物结构的理解。'
    }
  },
  {
    id: 'c2',
    studentId: '1',
    date: '2026-05-29',
    topic: '春天的花园',
    materials: ['丙烯颜料', '油画布', '排笔', '刮刀'],
    techniques: ['厚涂法', '刮刀法', '色彩渐变', '层次表现'],
    objectives: '感受春天的色彩，学习用丙烯表现花卉的层次感，尝试使用刮刀创造特殊质感。',
    observation: {
      participationLevel: 8,
      emotionalExpression: '画到自己喜欢的花朵时特别投入，挑选颜色非常仔细。',
      skillMastery: '刮刀使用得很好，花瓣的层次感表现出色。色彩搭配一如既往地漂亮。',
      notes: '背景处理可以再放松一些，不要太拘谨。'
    }
  },
  {
    id: 'c3',
    studentId: '2',
    date: '2026-06-05',
    topic: '超级汽车',
    materials: ['马克笔', '素描纸', '勾线笔', '色铅笔'],
    techniques: ['透视基础', '明暗关系', '质感表现', '精细勾线'],
    objectives: '学习简单的透视原理，能够画出具有立体感的汽车，掌握金属质感的表现方法。',
    observation: {
      participationLevel: 10,
      emotionalExpression: '子轩今天超级兴奋，因为汽车是他最爱的主题。整堂课都非常专注，连休息都舍不得。',
      skillMastery: '透视理解得很好，汽车的立体感很强。细节描绘非常到位，车轮、车窗、车灯都画得很仔细。',
      notes: '可以尝试画更多角度的汽车，挑战更高难度的透视。'
    }
  },
  {
    id: 'c4',
    studentId: '3',
    date: '2026-06-04',
    topic: '心情的颜色',
    materials: ['水粉颜料', '大张卡纸', '各种画笔', '海绵', '滚轮'],
    techniques: ['抽象表达', '情绪色彩', '自由笔触', '混合媒介'],
    objectives: '引导孩子用色彩和形状表达不同的情绪，释放创造力，不追求具象再现。',
    observation: {
      participationLevel: 10,
      emotionalExpression: '诗涵完全沉浸在创作中，一边画一边哼歌，非常享受这个过程。她说"开心是粉色和黄色跳来跳去"。',
      skillMastery: '创意十足，用色大胆，笔触自由。她的作品总是给人惊喜。',
      notes: '保持这种创作热情，她的抽象表达能力很突出。'
    }
  },
  {
    id: 'c5',
    studentId: '4',
    date: '2026-06-03',
    topic: '人物速写练习',
    materials: ['速写本', '铅笔', '炭笔', '橡皮'],
    techniques: ['快速抓形', '动态线', '比例关系', '线条表现'],
    objectives: '提高人物速写能力，掌握人体基本比例，能够捕捉人物动态。',
    observation: {
      participationLevel: 9,
      emotionalExpression: '非常认真，每张速写都全力以赴。画到满意的作品时会很开心地展示给老师看。',
      skillMastery: '比例把握准确，动态捕捉到位。线条肯定有力，速写速度也在提高。',
      notes: '可以尝试更短时间的速写练习，训练瞬间抓形能力。'
    }
  },
  {
    id: 'c6',
    studentId: '5',
    date: '2026-06-02',
    topic: '美丽的花瓶',
    materials: ['水彩颜料', '水彩纸', '圆头水彩笔', '留白液'],
    techniques: ['静物写生', '色彩透明感', '高光处理', '背景虚化'],
    objectives: '学习静物写生的基本方法，掌握水彩的透明感表现，处理好主体与背景的关系。',
    observation: {
      participationLevel: 8,
      emotionalExpression: '美琪画得很仔细，每一朵花都精心描绘。挑选颜色时很有自己的想法。',
      skillMastery: '花瓶的造型优美，花朵的色彩搭配清新雅致。水彩的透明感表现得很好。',
      notes: '可以稍微加快作画速度，不要过度追求完美。'
    }
  },
  {
    id: 'c7',
    studentId: '6',
    date: '2026-06-01',
    topic: '未来城市',
    materials: ['马克笔', '彩铅', 'A3画纸', '直尺'],
    techniques: ['两点透视', '建筑设计', '科幻元素', '场景构建'],
    objectives: '运用透视知识创作未来城市，发挥想象力设计未来建筑，学习构建完整的画面场景。',
    observation: {
      participationLevel: 10,
      emotionalExpression: '天翊对未来城市有很多想法，边画边讲解他设计的飞行汽车、空中花园、智能建筑。',
      skillMastery: '透视运用非常熟练，建筑群的空间关系处理得很好。想象力丰富，画面充满未来感。',
      notes: '可以加入更多人物和生活气息，让城市更有温度。'
    }
  }
];

export const mockArtworks: Artwork[] = [
  {
    id: 'a1',
    studentId: '1',
    courseId: 'c1',
    title: '我家的小橘猫',
    imageUrl: img('watercolor painting of a cute orange cat, child art style, warm colors, soft fur texture, big expressive eyes', 'square_hd'),
    date: '2026-06-05',
    comment: '这幅画中小猫的神态捕捉得非常到位，水汪汪的大眼睛充满了灵性。橘色毛发的层次处理得很好，从浅黄到深橙的过渡自然流畅。背景的淡蓝色很好地衬托出主体。最难得的是孩子通过画笔传达出的对宠物的爱。',
    isPortfolio: true
  },
  {
    id: 'a2',
    studentId: '1',
    courseId: 'c2',
    title: '春天的郁金香',
    imageUrl: img('acrylic painting of tulip garden, spring colors, impasto technique, child art style, vibrant flowers', 'square_hd'),
    date: '2026-05-29',
    comment: '使用刮刀创作的郁金香色彩浓烈，质感丰富。花朵的层次分明，前景的花朵清晰饱满，后景的花朵虚化处理，空间感很强。色彩搭配和谐，充满春的气息。',
    isPortfolio: true
  },
  {
    id: 'a3',
    studentId: '1',
    courseId: '',
    title: '彩虹独角兽',
    imageUrl: img('child drawing of a rainbow unicorn, magical style, bright colors, flowing mane, fantasy creature', 'square_hd'),
    date: '2026-05-20',
    comment: '充满想象力的作品！独角兽的鬃毛用了彩虹渐变色，角上还有星星装饰。背景的云朵和小蝴蝶让整个画面梦幻感十足。',
    isPortfolio: false
  },
  {
    id: 'a4',
    studentId: '1',
    courseId: '',
    title: '生日派对',
    imageUrl: img('child drawing of a birthday party, cake with candles, balloons, happy children, colorful celebration', 'square_hd'),
    date: '2026-04-15',
    comment: '画面内容丰富，人物表情生动，生日蛋糕画得特别诱人。色彩鲜艳，充满欢乐的氛围。',
    isPortfolio: false
  },
  {
    id: 'a5',
    studentId: '2',
    courseId: 'c3',
    title: '红色跑车',
    imageUrl: img('child drawing of a red sports car, detailed wheels and headlights, dynamic angle, marker art style', 'square_hd'),
    date: '2026-06-05',
    comment: '令人惊艳的作品！跑车的透视非常准确，低角度的视角让车子充满动感。红色车身的光泽表现得很好，车轮、车灯、进气格栅的细节都画得一丝不苟。流畅的车身线条体现了扎实的基本功。',
    isPortfolio: true
  },
  {
    id: 'a6',
    studentId: '2',
    courseId: '',
    title: '机器人战士',
    imageUrl: img('child drawing of a robot warrior, mechanical details, futuristic design, pencil and marker art', 'square_hd'),
    date: '2026-05-10',
    comment: '机械结构设计得非常复杂精细，可以看出孩子对机械构造的浓厚兴趣。每个零件都画得很清楚，是一幅用心之作。',
    isPortfolio: true
  },
  {
    id: 'a7',
    studentId: '3',
    courseId: 'c4',
    title: '开心的颜色',
    imageUrl: img('abstract expressionist painting, bright pink and yellow, energetic brushstrokes, child art, joyful colors', 'square_hd'),
    date: '2026-06-04',
    comment: '这是一幅充满能量的抽象作品！粉色和黄色的笔触在画面上跳跃，仿佛能感受到孩子画画时快乐的心情。没有具象的形象，但情感的传达却非常直接和强烈。自由奔放的笔触是这幅画最动人的地方。',
    isPortfolio: true
  },
  {
    id: 'a8',
    studentId: '3',
    courseId: '',
    title: '海底世界',
    imageUrl: img('child drawing of underwater world, colorful fish, coral reef, seaweed, bubbles, fantasy ocean', 'square_hd'),
    date: '2026-03-28',
    comment: '色彩斑斓的海底世界，各种形状奇特的鱼儿游来游去。构图饱满，充满了探索的好奇心。',
    isPortfolio: false
  },
  {
    id: 'a9',
    studentId: '4',
    courseId: 'c5',
    title: '速写人物',
    imageUrl: img('pencil sketch of a person in dynamic pose, quick lines, gesture drawing, art student style, charcoal effect', 'square_hd'),
    date: '2026-06-03',
    comment: '非常出色的人物速写！动态线抓得很准，人物的重心和动势一目了然。线条简洁有力，没有多余的修饰。虽然是速写，但人物的神态和性格都有所体现。可以看出扎实的造型能力。',
    isPortfolio: true
  },
  {
    id: 'a10',
    studentId: '5',
    courseId: 'c6',
    title: '瓶中花',
    imageUrl: img('watercolor painting of flowers in a vase, soft pink and white, delicate petals, transparent glass, child art', 'square_hd'),
    date: '2026-06-02',
    comment: '清新淡雅的水彩静物。花瓶的玻璃质感表现得很好，透明感和高光都处理得很到位。花朵柔美，色彩层次丰富。构图均衡，画面干净整洁，充分体现了孩子细腻的内心世界。',
    isPortfolio: true
  },
  {
    id: 'a11',
    studentId: '6',
    courseId: 'c7',
    title: '未来之城',
    imageUrl: img('futuristic city drawing, skyscrapers, flying cars, two point perspective, child art, sci-fi theme', 'square_hd'),
    date: '2026-06-01',
    comment: '气势恢宏的未来城市！两点透视运用得非常娴熟，建筑群的空间关系令人信服。画面中有飞行汽车、空中轨道、太阳能板、垂直绿化，充满了对未来的想象。最可贵的是，在宏大的场景中还画出了很多生活细节，使得画面有温度。',
    isPortfolio: true
  },
  {
    id: 'a12',
    studentId: '6',
    courseId: '',
    title: '老房子',
    imageUrl: img('pencil drawing of an old traditional house, detailed architecture, shading, perspective, child art style', 'square_hd'),
    date: '2026-04-20',
    comment: '写生作品，老房子的结构画得很准确。瓦顶、木窗、石阶的细节都很丰富。光影处理得也不错，有立体感。',
    isPortfolio: true
  }
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 'e1',
    studentId: '1',
    date: '2026-06-01',
    composition: 7,
    color: 9,
    line: 6,
    creativity: 8,
    expression: 9,
    suggestion: '小雅在色彩和情感表达方面天赋突出，建议继续保持。可以适当加强线条练习，提高造型的准确性。构图方面可以学习一些基本原则，如主次关系、画面平衡等。推荐多参观画展，拓宽艺术视野。'
  },
  {
    id: 'e2',
    studentId: '1',
    date: '2026-03-01',
    composition: 5,
    color: 8,
    line: 5,
    creativity: 7,
    expression: 7,
    suggestion: '入学初期评估，色彩感觉良好，线条和构图需要系统训练。'
  },
  {
    id: 'e3',
    studentId: '2',
    date: '2026-06-01',
    composition: 9,
    color: 6,
    line: 9,
    creativity: 7,
    expression: 6,
    suggestion: '子轩的造型和构图能力非常出色，线条肯定有力。建议在色彩方面多做尝试，不要害怕用色。可以多练习色彩构成，了解色彩理论，这会让你的作品更加出彩。情感表达方面可以更加放开，让画面多一些温度。'
  },
  {
    id: 'e4',
    studentId: '3',
    date: '2026-06-01',
    composition: 5,
    color: 9,
    line: 5,
    creativity: 10,
    expression: 9,
    suggestion: '诗涵是个天生的艺术家！创造力和情感表达都是满分。在保护这种创作天性的同时，可以适当地学习一些构图知识，让画面更加完整。不要急于求成，慢慢引导，保持对绘画的热爱最重要。'
  },
  {
    id: 'e5',
    studentId: '4',
    date: '2026-06-01',
    composition: 8,
    color: 7,
    line: 9,
    creativity: 7,
    expression: 7,
    suggestion: '浩然的基本功非常扎实，线条和造型能力突出。综合发展均衡。建议开始学习更专业的绘画技法，如素描光影、色彩理论等。可以尝试更多创作主题，拓宽创作思路。考虑参加一些美术比赛，以赛促练。'
  },
  {
    id: 'e6',
    studentId: '5',
    date: '2026-06-01',
    composition: 8,
    color: 9,
    line: 7,
    creativity: 6,
    expression: 8,
    suggestion: '美琪的色彩感觉和画面整洁度都非常好，作品总是很精致。建议多尝试不同的题材和表现手法，不要局限于花卉和公主主题。可以多画一些生活速写，记录日常，这样创作思路会更开阔。'
  },
  {
    id: 'e7',
    studentId: '6',
    date: '2026-06-01',
    composition: 9,
    color: 8,
    line: 8,
    creativity: 8,
    expression: 7,
    suggestion: '天翊的空间感和构图能力都是顶尖水平，建筑和风景画得特别好。建议加强人物绘画练习，让画面中的人物更加生动自然。可以开始接触更专业的透视理论，为将来学习建筑设计或环境艺术打下基础。'
  }
];

export const mockCommunications: Communication[] = [
  {
    id: 'comm1',
    studentId: '1',
    date: '2026-06-05',
    type: 'teacher',
    content: '小雅妈妈您好，今天小雅画的小猫特别棒！她把对自家宠物的感情都画进去了，小猫的眼神特别传神。下节课我们会学习风景画，建议周末可以带小雅去公园走走，观察一下大自然的色彩。'
  },
  {
    id: 'comm2',
    studentId: '1',
    date: '2026-06-05',
    type: 'parent',
    content: '谢谢老师！小雅回家特别开心，一直说今天画了家里的小橘。周末我们会带她去植物园，正好可以观察各种植物和花朵。她现在每天都要涂涂画画，进步真的很大，感谢老师的耐心教导！'
  },
  {
    id: 'comm3',
    studentId: '1',
    date: '2026-05-28',
    type: 'teacher',
    content: '小雅妈妈，小雅最近色彩搭配越来越有感觉了。昨天的郁金香画得特别好，我们已经选入她的个人作品集了。'
  },
  {
    id: 'comm4',
    studentId: '1',
    date: '2026-05-28',
    type: 'parent',
    content: '太好了！我们在家里也收藏了她很多画作，准备做一个家庭画廊。有什么适合她这个年纪看的艺术绘本推荐吗？'
  },
  {
    id: 'comm5',
    studentId: '1',
    date: '2026-05-29',
    type: 'teacher',
    content: '推荐《颜色的战争》和《点》，都是很好的艺术启蒙绘本。另外下个月有个儿童画展，建议带小雅去看看，可以提交作品参展哦。'
  },
  {
    id: 'comm6',
    studentId: '2',
    date: '2026-06-05',
    type: 'teacher',
    content: '子轩爸爸，子轩今天的跑车画得太专业了！透视非常准确，细节也很到位。他对机械类题材的热情真的很可贵。'
  },
  {
    id: 'comm7',
    studentId: '2',
    date: '2026-06-05',
    type: 'parent',
    content: '谢谢老师！子轩回家兴奋了一晚上，说要继续画赛车系列。有件事想请教，孩子现在是不是可以开始学素描了？我们想让他打打基础。'
  },
  {
    id: 'comm8',
    studentId: '2',
    date: '2026-06-06',
    type: 'teacher',
    content: '子轩的理解能力和专注力都很好，可以开始接触趣味素描了。我们下季度会开素描基础班，内容不会太枯燥，会结合他喜欢的汽车、机器人题材，建议可以报名。'
  },
  {
    id: 'comm9',
    studentId: '3',
    date: '2026-06-04',
    type: 'teacher',
    content: '诗涵妈妈，今天的抽象画课诗涵表现得太棒了！她对色彩和情感的敏感度远超同龄孩子。我给她看了一些康定斯基的作品，她特别感兴趣。'
  },
  {
    id: 'comm10',
    studentId: '3',
    date: '2026-06-04',
    type: 'parent',
    content: '老师好，谢谢您的引导！我们也发现她画画特别有自己的想法，常常画一些我们看不懂但觉得很美的东西。我们不会限制她的画风，希望她能一直这样开心地画下去。'
  },
  {
    id: 'comm11',
    studentId: '4',
    date: '2026-06-03',
    type: 'teacher',
    content: '浩然爸爸，浩然的速写进步很大。这学期他的造型能力提升明显，建议暑假可以报个专业素描班，系统学习一下光影和结构。'
  },
  {
    id: 'comm12',
    studentId: '4',
    date: '2026-06-03',
    type: 'parent',
    content: '收到，谢谢老师的建议！我们正有此意。浩然自己也说想考美术学院附中，我们会支持他的。您觉得他现在的水平差距还大吗？'
  }
];

export const mockExhibitions: ExhibitionRecord[] = [
  {
    id: 'ex1',
    studentId: '1',
    exhibitionName: '2026年市儿童美术创意展',
    date: '2026-05-20',
    artworkTitle: '我家的小橘猫',
    award: '金奖',
    experience: '小雅第一次参加正式画展，特别兴奋。颁奖典礼那天特意穿了漂亮的裙子。看到自己的作品挂在展厅里，她激动得跳了起来。这次展览让她对画画更有信心了，还认识了几个同样喜欢画画的小朋友。'
  },
  {
    id: 'ex2',
    studentId: '1',
    exhibitionName: '学校春季艺术展',
    date: '2026-04-15',
    artworkTitle: '彩虹独角兽',
    award: '优秀奖',
    experience: '学校内的展览，所有同学都能看到。小雅的画被放在很显眼的位置，好多同学都围过来看，让她小小的骄傲了一下。'
  },
  {
    id: 'ex3',
    studentId: '2',
    exhibitionName: '2026年"未来工程师"少儿科技绘画大赛',
    date: '2026-05-25',
    artworkTitle: '机器人战士',
    award: '银奖',
    experience: '子轩特意为这个比赛准备了一个月，画了好几稿。获奖那天他说"比考100分还开心"。颁奖典礼上还作为获奖代表发言，说自己长大要当会画画的工程师。'
  },
  {
    id: 'ex4',
    studentId: '4',
    exhibitionName: '2026年省青少年美术作品展',
    date: '2026-05-30',
    artworkTitle: '速写人物',
    award: '铜奖',
    experience: '这是浩然第一次参加省级比赛，虽然只拿了铜奖，但他说看到了很多比自己画得好的作品，知道了努力的方向。我们觉得这比获奖本身更有价值。'
  },
  {
    id: 'ex5',
    studentId: '6',
    exhibitionName: '2026年"我爱我家"少儿绘画大赛',
    date: '2026-05-10',
    artworkTitle: '老房子',
    award: '金奖',
    experience: '天翊画的是爷爷家的老房子，评委说这幅画"有感情、有故事、有技巧"。领奖的时候他特意把爷爷奶奶也带去了，老人家笑得合不拢嘴。'
  },
  {
    id: 'ex6',
    studentId: '5',
    exhibitionName: '学校春季艺术展',
    date: '2026-04-15',
    artworkTitle: '瓶中花',
    award: '最佳色彩奖',
    experience: '美琪的画因为色彩搭配特别漂亮，获得了单独设立的最佳色彩奖。她特别开心，说"原来我选的颜色真的很好看"。'
  }
];
