const KnowledgeModule = {
    scenes: [
        {
            id: 'cpr',
            title: '心肺复苏(CPR)',
            icon: 'heartbeat',
            description: '用于心脏骤停的紧急抢救技术',
            tags: ['心脏骤停', '紧急抢救', '生命支持'],
            warning: 'CPR应在确认环境安全后立即实施，同时呼叫急救人员',
            steps: [
                {
                    title: '确认环境安全并判断意识',
                    content: '确保现场安全，轻拍患者双肩并大声呼唤，判断是否有意识。如无反应，立即呼救拨打120。',
                    icon: 'exclamation-triangle',
                    video: 'https://www.youtube.com/watch?v=J5Qj429N3Zo'
                },
                {
                    title: '判断呼吸和脉搏',
                    content: '观察胸部起伏5-10秒，同时触摸颈动脉（成人）或肱动脉（婴儿）。如无呼吸或仅有喘息，立即开始CPR。',
                    icon: 'lungs',
                    video: 'https://www.youtube.com/watch?v=J5Qj429N3Zo'
                },
                {
                    title: '胸外按压',
                    content: '将患者仰卧在坚硬平面上，双手掌根重叠放在胸骨中下1/3处，手臂伸直，垂直向下按压。按压深度：成人5-6厘米，儿童约5厘米，婴儿约4厘米。按压频率：100-120次/分钟。',
                    icon: 'hand-holding-heart',
                    video: 'https://www.youtube.com/watch?v=J5Qj429N3Zo'
                },
                {
                    title: '开放气道与人工呼吸',
                    content: '按压30次后，仰头抬颏开放气道，清除口腔异物。捏住鼻孔，口对口吹气2次，每次持续1秒，观察胸部起伏。按压与通气比例为30:2。',
                    icon: 'wind',
                    video: 'https://www.youtube.com/watch?v=J5Qj429N3Zo'
                },
                {
                    title: '持续抢救直至专业人员到达',
                    content: '重复按压和通气循环，直到患者恢复自主呼吸和心跳，或专业急救人员到达。如有AED，尽快使用。',
                    icon: 'ambulance',
                    video: 'https://www.youtube.com/watch?v=J5Qj429N3Zo'
                }
            ]
        },
        {
            id: 'heimlich',
            title: '海姆立克急救法',
            icon: 'user-injured',
            description: '用于气道异物梗阻的急救方法',
            tags: ['气道异物', '窒息', '呛噎'],
            warning: '如患者能咳嗽或说话，鼓励其用力咳嗽；如不能说话、面色发紫，立即实施海姆立克急救法',
            steps: [
                {
                    title: '识别气道梗阻',
                    content: '患者突然无法说话、咳嗽或呼吸，面色发紫，双手抓住喉咙，这是气道异物梗阻的典型表现。',
                    icon: 'comment-slash',
                    video: 'https://www.youtube.com/watch?v=7cFtC7oV_2c'
                },
                {
                    title: '站立位腹部冲击（成人/儿童）',
                    content: '站在患者身后，双臂环抱其腰部。一手握拳，拇指侧顶住患者肚脐上方两指处，另一手握住拳头，快速向上向内冲击。',
                    icon: 'hands-helping',
                    video: 'https://www.youtube.com/watch?v=7cFtC7oV_2c'
                },
                {
                    title: '重复冲击直至异物排出',
                    content: '每次冲击要有力，重复进行，直到异物排出或患者失去意识。如患者失去意识，立即开始CPR。',
                    icon: 'redo',
                    video: 'https://www.youtube.com/watch?v=7cFtC7oV_2c'
                },
                {
                    title: '孕妇或肥胖患者：胸部冲击',
                    content: '如患者怀孕或过于肥胖，无法环抱腹部，改为胸部冲击。双手放在胸骨下半部，快速向后冲击。',
                    icon: 'baby',
                    video: 'https://www.youtube.com/watch?v=7cFtC7oV_2c'
                },
                {
                    title: '婴儿海姆立克急救法',
                    content: '将婴儿面朝下放在前臂上，头部低于身体，用手掌根部在两肩胛骨之间拍击5次。如无效，翻转婴儿，用两指在胸骨下半部按压5次。交替进行，直至异物排出。',
                    icon: 'child',
                    video: 'https://www.youtube.com/watch?v=7cFtC7oV_2c'
                },
                {
                    title: '自救海姆立克法',
                    content: '如独自一人发生气道梗阻，可借助椅背或桌角冲击上腹部，或用一手握拳顶住腹部，另一手握住拳头快速冲击。',
                    icon: 'chair',
                    video: 'https://www.youtube.com/watch?v=7cFtC7oV_2c'
                }
            ]
        },
        {
            id: 'burn',
            title: '烧烫伤处理',
            icon: 'fire',
            description: '不同程度烧烫伤的正确处理方法',
            tags: ['烧伤', '烫伤', '热液烫伤'],
            warning: '严重烧伤（面积大、深度深、涉及面部/手部/会阴部等）应立即送医，切勿随意涂抹药膏或偏方',
            steps: [
                {
                    title: '快速脱离热源',
                    content: '立即脱去被热液浸湿的衣物，或用剪刀剪开，避免强行撕扯加重损伤。如衣物粘连在皮肤上，不要强行剥离。',
                    icon: 'tshirt',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '冷疗降温',
                    content: '用流动的冷水（15-25℃）冲洗伤处15-30分钟，直到疼痛明显减轻。不要用冰水，以免加重组织损伤。',
                    icon: 'tint',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '评估烧伤程度',
                    content: 'Ⅰ度：红肿疼痛；Ⅱ度：水疱；Ⅲ度：皮肤焦黑或苍白。Ⅱ度以上或面积较大的烧伤需就医。',
                    icon: 'diagnoses',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '保护创面',
                    content: '用干净的纱布或保鲜膜轻轻覆盖创面，不要刺破水疱。不要涂抹牙膏、酱油等偏方，以免引起感染。',
                    icon: 'band-aid',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '及时就医',
                    content: '如烧伤面积较大、深度较深、涉及面部/手部/会阴部，或患者是老人、儿童、孕妇，应立即送医。',
                    icon: 'hospital',
                    video: 'https://www.youtube.com/watch?v=example'
                }
            ]
        },
        {
            id: 'fracture',
            title: '骨折处理',
            icon: 'bone',
            description: '骨折的紧急处理与固定方法',
            tags: ['骨折', '脱臼', '扭伤'],
            warning: '怀疑脊柱骨折时，严禁搬动患者，以免造成截瘫。应立即拨打120，保持患者静止不动',
            steps: [
                {
                    title: '判断骨折',
                    content: '骨折表现：剧烈疼痛、肿胀、畸形、活动受限、骨擦音或骨擦感。开放性骨折可见骨头外露。',
                    icon: 'search',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '保持制动',
                    content: '不要随意移动伤肢，更不要强行复位。开放性骨折不要将外露的骨头推回体内。',
                    icon: 'hand-paper',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '伤口处理',
                    content: '如有出血，用干净纱布压迫止血。开放性骨折用干净敷料覆盖伤口，不要涂抹任何药物。',
                    icon: 'tint',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '固定伤肢',
                    content: '用夹板或替代品（木板、杂志、硬纸板等）固定骨折部位上下两个关节。固定时松紧适度，露出指（趾）端观察血液循环。',
                    icon: 'tools',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '及时送医',
                    content: '固定后尽快送医，途中注意观察患者生命体征和伤肢末端血液循环（颜色、温度、感觉）。',
                    icon: 'ambulance',
                    video: 'https://www.youtube.com/watch?v=example'
                }
            ]
        },
        {
            id: 'poisoning',
            title: '中毒急救',
            icon: 'skull-crossbones',
            description: '各种中毒情况的紧急处理',
            tags: ['食物中毒', '药物中毒', '煤气中毒', '农药中毒'],
            warning: '不要对昏迷、抽搐或腐蚀性物质中毒的患者催吐！就医时最好携带可疑毒物或呕吐物样本',
            steps: [
                {
                    title: '脱离中毒环境',
                    content: '立即将患者脱离中毒现场，转移到通风良好的地方。如为接触性中毒，脱去污染衣物，用大量清水冲洗皮肤。',
                    icon: 'running',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '保持呼吸道通畅',
                    content: '解开患者衣领，头偏向一侧，防止呕吐物窒息。如患者呼吸心跳停止，立即进行CPR。',
                    icon: 'lungs',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '收集毒物信息',
                    content: '了解患者接触的毒物名称、剂量、接触时间，保留毒物包装或呕吐物样本，供医生参考。',
                    icon: 'search',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '催吐（仅限清醒患者）',
                    content: '如患者清醒，且毒物非腐蚀性，可在中毒后1-2小时内催吐。让患者饮用温水300-500ml后，用手指刺激咽后壁催吐，重复多次。',
                    icon: 'glass-water',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '紧急送医',
                    content: '无论是否催吐，都应尽快送医。途中密切观察患者意识、呼吸、脉搏等生命体征。',
                    icon: 'ambulance',
                    video: 'https://www.youtube.com/watch?v=example'
                }
            ]
        },
        {
            id: 'heatstroke',
            title: '中暑急救',
            icon: 'sun',
            description: '中暑各阶段的识别与处理',
            tags: ['中暑', '热射病', '热痉挛', '热衰竭'],
            warning: '热射病是最严重的中暑类型，死亡率高，必须立即降温并紧急送医！',
            steps: [
                {
                    title: '识别中暑类型',
                    content: '先兆中暑：头晕、乏力、多汗；轻度中暑：面色潮红、体温升高；重度中暑（热射病）：高热（>40℃）、意识障碍、抽搐。',
                    icon: 'thermometer-half',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '立即转移阴凉处',
                    content: '将患者转移到阴凉通风处，平卧休息，解开衣扣，脱去多余衣物。',
                    icon: 'umbrella-beach',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '补充水分和电解质',
                    content: '如患者清醒，给予含盐清凉饮料或运动饮料，少量多次饮用。',
                    icon: 'glass-whiskey',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '物理降温',
                    content: '用湿毛巾冷敷额头、颈部、腋窝、腹股沟等处，或用温水（15-25℃）擦浴，同时扇风降温。',
                    icon: 'snowflake',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '重症中暑紧急处理',
                    content: '如患者出现高热、意识障碍、抽搐，立即拨打120。将患者侧卧，保持呼吸道通畅，持续降温。',
                    icon: 'ambulance',
                    video: 'https://www.youtube.com/watch?v=example'
                }
            ]
        },
        {
            id: 'bleeding',
            title: '出血止血',
            icon: 'tint',
            description: '不同部位出血的止血方法',
            tags: ['外伤出血', '鼻出血', '内出血'],
            warning: '动脉出血（喷射状）和内出血是急症，必须立即止血并送医！',
            steps: [
                {
                    title: '判断出血类型',
                    content: '动脉出血：血色鲜红，喷射状；静脉出血：血色暗红，持续流出；毛细血管出血：血色鲜红，慢慢渗出。',
                    icon: 'tint',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '直接压迫止血',
                    content: '最常用的止血方法。用干净纱布或敷料直接压迫伤口，持续压迫10-15分钟，不要频繁掀开查看。',
                    icon: 'hand-paper',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '抬高患肢',
                    content: '在压迫的同时，将受伤部位抬高超过心脏水平，有助于减少出血。',
                    icon: 'arrow-up',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '加压包扎',
                    content: '出血减少后，用绷带或布条加压包扎伤口，松紧适度，以能摸到远端脉搏为宜。',
                    icon: 'band-aid',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '止血带使用（仅限大出血）',
                    content: '仅在严重的肢体大出血且其他方法无效时使用。将止血带绑在伤口近心端（上臂上1/3或大腿中段），记录时间，每40-50分钟放松1-2分钟。',
                    icon: 'clock',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '鼻出血处理',
                    content: '身体前倾，头稍低，用手指捏住两侧鼻翼10-15分钟，张口呼吸。不要仰头，以免血液流入气管。',
                    icon: 'user',
                    video: 'https://www.youtube.com/watch?v=example'
                }
            ]
        },
        {
            id: 'seizure',
            title: '癫痫发作急救',
            icon: 'brain',
            description: '癫痫发作时的正确处理方法',
            tags: ['癫痫', '抽搐', '惊厥'],
            warning: '不要强行按压患者肢体，不要往嘴里塞任何东西！',
            steps: [
                {
                    title: '保护患者，防止受伤',
                    content: '迅速移开周围可能造成伤害的物品，让患者顺势倒地。在头下垫柔软物品，防止头部受伤。',
                    icon: 'shield-alt',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '保持呼吸道通畅',
                    content: '解开衣领，将患者侧卧（复苏体位），便于口内分泌物流出，防止窒息。',
                    icon: 'lungs',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '避免错误做法',
                    content: '不要强行按压患者肢体，不要往嘴里塞任何物品（包括手指、毛巾、筷子等），不要掐人中。',
                    icon: 'times-circle',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '观察记录发作情况',
                    content: '记录发作开始时间和持续时间，观察抽搐部位、眼睛位置、有无大小便失禁等，供医生参考。',
                    icon: 'clock',
                    video: 'https://www.youtube.com/watch?v=example'
                },
                {
                    title: '发作后处理',
                    content: '发作停止后，患者可能意识模糊，给予安慰。如抽搐持续超过5分钟，或连续发作，或有外伤、呼吸困难，立即拨打120。',
                    icon: 'ambulance',
                    video: 'https://www.youtube.com/watch?v=example'
                }
            ]
        }
    ],

    quizQuestions: [
        {
            id: 1,
            scenario: '你正在家中用餐，突然看到家人面色发紫，双手抓住喉咙，说不出话来。你应该怎么做？',
            options: [
                { id: 'A', text: '立即拍打背部，让他把东西咳出来' },
                { id: 'B', text: '立即从背后抱住他，实施海姆立克急救法' },
                { id: 'C', text: '让他喝一大口水冲下去' },
                { id: 'D', text: '立即用手指伸进喉咙里抠' }
            ],
            correctAnswer: 'B',
            explanation: '这是典型的气道异物梗阻表现。海姆立克急救法是最有效的处理方法。拍打背部适用于不能实施腹部冲击的情况，但腹部冲击更有效。喝水和用手指抠都是错误做法，可能加重梗阻或造成损伤。'
        },
        {
            id: 2,
            scenario: '你发现家人倒在地上，呼之不应，触摸颈动脉没有搏动。此时你应该：',
            options: [
                { id: 'A', text: '立即拨打120，然后在旁边等待救护车' },
                { id: 'B', text: '先拨打120，然后立即开始胸外按压' },
                { id: 'C', text: '先做人工呼吸，再做胸外按压' },
                { id: 'D', text: '立即将患者移到床上，盖上被子保暖' }
            ],
            correctAnswer: 'B',
            explanation: '心脏骤停时，时间就是生命。应立即呼救（拨打120），然后立即开始胸外按压。现代CPR指南强调"胸外按压优先"，可以不做人工呼吸，但高质量的胸外按压至关重要。移动患者可能延误抢救时机。'
        },
        {
            id: 3,
            scenario: '家人在做饭时不慎被开水烫伤手臂，皮肤发红、起水疱，疼痛明显。正确的处理顺序是：',
            options: [
                { id: 'A', text: '立即涂抹牙膏或酱油，然后包扎' },
                { id: 'B', text: '用冷水冲洗15分钟，然后用干净纱布覆盖' },
                { id: 'C', text: '立即挑破水疱，涂抹烫伤膏' },
                { id: 'D', text: '用冰水冷敷，然后包扎' }
            ],
            correctAnswer: 'B',
            explanation: '烧烫伤的正确处理是：冷疗（用流动冷水冲洗15-30分钟）→ 保护创面（用干净纱布覆盖）→ 就医。牙膏、酱油等偏方可能引起感染，不要使用。水疱不要自行挑破，应由医生处理。不要用冰水，以免加重组织损伤。'
        },
        {
            id: 4,
            scenario: '老人在下楼梯时不慎摔倒，主诉右腿疼痛，无法站立，小腿有明显畸形。你应该：',
            options: [
                { id: 'A', text: '立即搀扶老人站起来，试着走几步' },
                { id: 'B', text: '帮老人按摩腿部，缓解疼痛' },
                { id: 'C', text: '让老人保持不动，用木板固定伤肢，拨打120' },
                { id: 'D', text: '立即给老人服用止痛药' }
            ],
            correctAnswer: 'C',
            explanation: '高度怀疑骨折时，应保持伤肢制动，不要随意移动或按摩，以免加重骨折端移位和血管神经损伤。可用木板、杂志等临时固定骨折部位上下两个关节，然后送医。在明确诊断前不要随意服用止痛药，以免掩盖病情。'
        },
        {
            id: 5,
            scenario: '你发现有人倒在浴室里，室内有强烈的煤气味。你首先应该：',
            options: [
                { id: 'A', text: '立即进入浴室，将患者拖出来' },
                { id: 'B', text: '先打开门窗通风，关闭煤气阀门，再进入' },
                { id: 'C', text: '立即在浴室内拨打120' },
                { id: 'D', text: '先开灯查看情况' }
            ],
            correctAnswer: 'B',
            explanation: '煤气泄漏时，首先要确保自身安全，避免吸入有毒气体和引发爆炸。应先打开门窗通风，关闭煤气源，不要开关电器（包括开灯、打电话），不要使用明火。通风后再进入救援，将患者转移到通风处，给予吸氧，拨打120。'
        },
        {
            id: 6,
            scenario: '夏天，家人在户外活动后出现头晕、头痛、口渴、多汗，体温38.5℃。你认为是：',
            options: [
                { id: 'A', text: '感冒，让他休息一下就好' },
                { id: 'B', text: '轻度中暑，立即转移到阴凉处，补充盐水' },
                { id: 'C', text: '热射病，立即冰敷降温' },
                { id: 'D', text: '低血糖，给他吃块糖' }
            ],
            correctAnswer: 'B',
            explanation: '这是轻度中暑的表现。应立即转移到阴凉通风处，补充含盐清凉饮料，休息观察。如体温持续升高、出现意识改变，可能发展为热射病，需要紧急送医。冰敷降温适用于重症中暑。'
        },
        {
            id: 7,
            scenario: '家人在家中突发癫痫，四肢抽搐、口吐白沫。以下哪种做法是错误的？',
            options: [
                { id: 'A', text: '移开周围危险物品，保护患者头部' },
                { id: 'B', text: '将患者侧卧，保持呼吸道通畅' },
                { id: 'C', text: '用力按住患者手脚，防止抽搐' },
                { id: 'D', text: '记录发作持续时间' }
            ],
            correctAnswer: 'C',
            explanation: '癫痫发作时，不要强行按压患者肢体，以免造成骨折或肌肉损伤。正确的做法是：保护患者防止受伤、保持呼吸道通畅、记录发作情况。如抽搐持续超过5分钟，应立即送医。'
        },
        {
            id: 8,
            scenario: '关于CPR胸外按压的深度和频率，正确的是：',
            options: [
                { id: 'A', text: '深度3-4厘米，频率60-80次/分钟' },
                { id: 'B', text: '深度5-6厘米，频率100-120次/分钟' },
                { id: 'C', text: '深度7-8厘米，频率140-160次/分钟' },
                { id: 'D', text: '深度越深越好，频率越快越好' }
            ],
            correctAnswer: 'B',
            explanation: '根据最新的心肺复苏指南，胸外按压的深度应为5-6厘米（成人），频率为100-120次/分钟。按压过浅不能有效泵血，过深可能造成肋骨骨折；按压过快或过慢都会影响复苏效果。'
        },
        {
            id: 9,
            scenario: '你发现家人服用了大量安眠药，意识清醒。你应该：',
            options: [
                { id: 'A', text: '立即催吐，然后送医' },
                { id: 'B', text: '让他多喝水，促进排泄' },
                { id: 'C', text: '让他喝牛奶，保护胃黏膜' },
                { id: 'D', text: '等待观察，看是否有不良反应' }
            ],
            correctAnswer: 'A',
            explanation: '药物中毒且患者清醒时，应立即催吐（中毒后1-2小时内效果最好），然后尽快送医。保留药物包装和呕吐物样本供医生参考。不要等待观察，以免延误抢救时机。'
        },
        {
            id: 10,
            scenario: '以下哪种情况需要使用AED（自动体外除颤器）？',
            options: [
                { id: 'A', text: '患者晕倒，但还有呼吸和脉搏' },
                { id: 'B', text: '患者无反应、无呼吸、无脉搏' },
                { id: 'C', text: '患者胸口疼痛，怀疑心梗' },
                { id: 'D', text: '患者呼吸急促，面色发紫' }
            ],
            correctAnswer: 'B',
            explanation: 'AED用于治疗室颤等致命性心律失常，这些情况通常表现为心脏骤停（无反应、无呼吸、无脉搏）。AED会自动分析心律，判断是否需要除颤。有呼吸和脉搏的患者不需要AED。怀疑心梗的患者需要立即送医，但不一定需要立即除颤。'
        }
    ],

    quizState: {
        currentQuestion: 0,
        answers: [],
        isStarted: false,
        isFinished: false
    },

    init() {
        this.renderScenes();
        this.renderQuiz();
        this.renderCertificates();
        this.setupSceneSearch();
    },

    renderScenes(filter = '') {
        const grid = document.getElementById('scenesGrid');
        const filteredScenes = filter 
            ? this.scenes.filter(scene => 
                scene.title.toLowerCase().includes(filter.toLowerCase()) ||
                scene.description.toLowerCase().includes(filter.toLowerCase()) ||
                scene.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
              )
            : this.scenes;

        if (filteredScenes.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <p>没有找到匹配的急救场景</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredScenes.map(scene => `
            <div class="card scene-card" onclick="KnowledgeModule.showSceneDetail('${scene.id}')">
                <div class="icon">
                    <i class="fas fa-${scene.icon}"></i>
                </div>
                <h3>${scene.title}</h3>
                <p>${scene.description}</p>
                <div class="tags">
                    ${scene.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    },

    setupSceneSearch() {
        const searchInput = document.getElementById('sceneSearch');
        searchInput.addEventListener('input', Utils.debounce((e) => {
            this.renderScenes(e.target.value);
        }, 300));
    },

    showSceneDetail(sceneId) {
        const scene = this.scenes.find(s => s.id === sceneId);
        if (!scene) return;

        document.getElementById('sceneModalTitle').textContent = scene.title;
        document.getElementById('sceneModalBody').innerHTML = `
            <div class="scene-detail-header">
                <div class="icon-large">
                    <i class="fas fa-${scene.icon}"></i>
                </div>
                <h2>${scene.title}</h2>
                <p style="color: var(--dark-gray); margin-top: 0.5rem;">${scene.description}</p>
                <div class="tags" style="justify-content: center; display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
                    ${scene.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>

            <div class="warning-box">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>重要提示：</strong>${scene.warning}
            </div>

            <h3 style="margin-bottom: 1.5rem;">急救步骤</h3>
            <div class="steps-list">
                ${scene.steps.map(step => `
                    <div class="step-item">
                        <div class="step-content">
                            <h4>${step.title}</h4>
                            <p>${step.content}</p>
                            <div class="step-image">
                                <i class="fas fa-${step.icon}"></i>
                            </div>
                            ${step.video ? `
                                <a href="${step.video}" target="_blank" class="video-link">
                                    <i class="fas fa-play-circle"></i>
                                    观看教学视频
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('sceneModal').classList.add('active');
    },

    renderQuiz() {
        const container = document.getElementById('quizContainer');
        
        if (!this.quizState.isStarted) {
            const lastResult = Storage.get(Storage.KEYS.QUIZ_RESULTS);
            let lastResultHtml = '';
            if (lastResult) {
                const scorePercent = Math.round((lastResult.correct / lastResult.total) * 100);
                lastResultHtml = `
                    <div style="margin-top: 2rem; padding: 1rem; background: var(--light-gray); border-radius: 8px;">
                        <p style="margin-bottom: 0.5rem;">上次测验成绩：</p>
                        <p><strong>${lastResult.correct} / ${lastResult.total} 题正确 (${scorePercent}%)</strong></p>
                        <p style="font-size: 0.875rem; color: var(--dark-gray);">测验时间：${Utils.formatDateTime(lastResult.date)}</p>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="card quiz-start">
                    <i class="fas fa-clipboard-list"></i>
                    <h2>急救知识测验</h2>
                    <p>通过情景选择题测试您的急救知识掌握程度<br>共 ${this.quizQuestions.length} 道题目，每次随机抽取 5 题</p>
                    <button class="btn btn-primary" onclick="KnowledgeModule.startQuiz()">
                        <i class="fas fa-play"></i> 开始测验
                    </button>
                    ${lastResultHtml}
                </div>
            `;
            return;
        }

        if (this.quizState.isFinished) {
            this.renderQuizResult();
            return;
        }

        const currentQ = this.quizState.questions[this.quizState.currentQuestion];
        const selectedAnswer = this.quizState.answers[this.quizState.currentQuestion];

        container.innerHTML = `
            <div class="card">
                <div class="quiz-stats">
                    <span>第 ${this.quizState.currentQuestion + 1} / ${this.quizState.questions.length} 题</span>
                    <span>已答对: ${this.quizState.answers.filter(a => a && a.isCorrect).length} 题</span>
                </div>

                <div class="quiz-question">
                    <h3>${currentQ.scenario}</h3>
                    <div class="quiz-options">
                        ${currentQ.options.map(opt => {
                            let optClass = 'quiz-option';
                            if (selectedAnswer) {
                                if (opt.id === currentQ.correctAnswer) optClass += ' correct';
                                if (selectedAnswer.selectedId === opt.id && opt.id !== currentQ.correctAnswer) optClass += ' incorrect';
                            } else if (selectedAnswer && selectedAnswer.selectedId === opt.id) {
                                optClass += ' selected';
                            }
                            return `
                                <button class="${optClass}" ${selectedAnswer ? 'disabled' : ''} onclick="KnowledgeModule.selectAnswer('${opt.id}')">
                                    <strong>${opt.id}.</strong> ${opt.text}
                                </button>
                            `;
                        }).join('')}
                    </div>

                    ${selectedAnswer ? `
                        <div style="margin-top: 1.5rem; padding: 1rem; background: ${selectedAnswer.isCorrect ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)'}; border-radius: 8px; border-left: 4px solid ${selectedAnswer.isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">
                            <p style="font-weight: bold; margin-bottom: 0.5rem; color: ${selectedAnswer.isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${selectedAnswer.isCorrect ? '<i class="fas fa-check-circle"></i> 回答正确！' : '<i class="fas fa-times-circle"></i> 回答错误'}
                            </p>
                            <p style="color: var(--dark-gray);"><strong>正确答案：</strong>${currentQ.correctAnswer}</p>
                            <p style="color: var(--dark-gray); margin-top: 0.5rem;">${currentQ.explanation}</p>
                        </div>
                    ` : ''}
                </div>

                <div class="quiz-navigation">
                    <button class="btn btn-secondary" ${this.quizState.currentQuestion === 0 ? 'disabled' : ''} onclick="KnowledgeModule.prevQuestion()">
                        <i class="fas fa-arrow-left"></i> 上一题
                    </button>
                    ${selectedAnswer ? `
                        <button class="btn btn-primary" onclick="KnowledgeModule.nextQuestion()">
                            ${this.quizState.currentQuestion === this.quizState.questions.length - 1 ? '查看结果 <i class="fas fa-arrow-right"></i>' : '下一题 <i class="fas fa-arrow-right"></i>'}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    startQuiz() {
        const shuffled = [...this.quizQuestions].sort(() => Math.random() - 0.5);
        this.quizState.questions = shuffled.slice(0, 5);
        this.quizState.currentQuestion = 0;
        this.quizState.answers = [];
        this.quizState.isStarted = true;
        this.quizState.isFinished = false;
        this.renderQuiz();
    },

    selectAnswer(answerId) {
        if (this.quizState.answers[this.quizState.currentQuestion]) return;
        
        const currentQ = this.quizState.questions[this.quizState.currentQuestion];
        this.quizState.answers[this.quizState.currentQuestion] = {
            selectedId: answerId,
            isCorrect: answerId === currentQ.correctAnswer
        };
        
        this.renderQuiz();
    },

    nextQuestion() {
        if (this.quizState.currentQuestion < this.quizState.questions.length - 1) {
            this.quizState.currentQuestion++;
            this.renderQuiz();
        } else {
            this.finishQuiz();
        }
    },

    prevQuestion() {
        if (this.quizState.currentQuestion > 0) {
            this.quizState.currentQuestion--;
            this.renderQuiz();
        }
    },

    finishQuiz() {
        this.quizState.isFinished = true;
        
        const correct = this.quizState.answers.filter(a => a.isCorrect).length;
        const total = this.quizState.questions.length;
        
        Storage.set(Storage.KEYS.QUIZ_RESULTS, {
            correct,
            total,
            date: new Date().toISOString(),
            answers: this.quizState.answers.map((a, i) => ({
                questionId: this.quizState.questions[i].id,
                selectedId: a.selectedId,
                isCorrect: a.isCorrect
            }))
        });

        this.renderQuiz();
        Utils.showToast(`测验完成！正确率 ${Math.round((correct / total) * 100)}%`, correct >= 4 ? 'success' : 'warning');
    },

    renderQuizResult() {
        const container = document.getElementById('quizContainer');
        const correct = this.quizState.answers.filter(a => a.isCorrect).length;
        const total = this.quizState.questions.length;
        const scorePercent = Math.round((correct / total) * 100);

        container.innerHTML = `
            <div class="card quiz-result">
                <div class="score-circle" style="--score: ${scorePercent};">
                    <div class="score-inner">
                        <span class="score-number">${scorePercent}%</span>
                        <span style="font-size: 0.875rem; color: var(--dark-gray);">正确率</span>
                    </div>
                </div>
                <h2>${scorePercent >= 80 ? '太棒了！' : scorePercent >= 60 ? '还不错！' : '需要加油哦！'}</h2>
                <p style="color: var(--dark-gray); margin-bottom: 1rem;">
                    您答对了 <strong>${correct}</strong> / <strong>${total}</strong> 道题目
                </p>
                <p style="color: var(--dark-gray); margin-bottom: 2rem;">
                    ${scorePercent >= 80 ? '您的急救知识掌握得很好，继续保持！' : 
                      scorePercent >= 60 ? '您有一定的急救基础，但还有提升空间。' : 
                      '建议您多学习急救知识，关键时刻能救命！'}
                </p>

                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-primary" onclick="KnowledgeModule.startQuiz()">
                        <i class="fas fa-redo"></i> 重新测验
                    </button>
                    <button class="btn btn-secondary" onclick="KnowledgeModule.resetQuiz()">
                        <i class="fas fa-home"></i> 返回首页
                    </button>
                </div>
            </div>
        `;
    },

    resetQuiz() {
        this.quizState.isStarted = false;
        this.quizState.isFinished = false;
        this.quizState.currentQuestion = 0;
        this.quizState.answers = [];
        this.renderQuiz();
    },

    renderCertificates() {
        const list = document.getElementById('certificatesList');
        const certificates = Storage.get(Storage.KEYS.CERTIFICATES) || [];

        if (certificates.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-certificate"></i>
                    <p>暂无证书记录</p>
                    <p style="font-size: 0.875rem;">点击上方按钮添加急救培训证书</p>
                </div>
            `;
            return;
        }

        const now = new Date();
        certificates.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

        list.innerHTML = certificates.map(cert => {
            const daysLeft = Utils.daysUntil(cert.expiryDate);
            let status = 'valid';
            let statusText = '有效';
            if (daysLeft < 0) {
                status = 'expired';
                statusText = '已过期';
            } else if (daysLeft <= 90) {
                status = 'warning';
                statusText = `即将过期 (${daysLeft}天)`;
            }

            return `
                <div class="card certificate-card ${status}">
                    <h3><i class="fas fa-certificate"></i> ${cert.name}</h3>
                    <p class="holder">持有人：${cert.holder}</p>
                    <div class="dates">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--dark-gray);">颁发日期</div>
                            <div>${Utils.formatDate(cert.issueDate)}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: var(--dark-gray);">有效期至</div>
                            <div>${Utils.formatDate(cert.expiryDate)}</div>
                        </div>
                    </div>
                    <span class="status-badge ${status}">${statusText}</span>
                    ${cert.notes ? `<p style="margin-top: 1rem; color: var(--dark-gray); font-size: 0.875rem;">${cert.notes}</p>` : ''}
                    <div class="card-actions">
                        <button class="btn btn-sm btn-primary" onclick="KnowledgeModule.editCertificate('${cert.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="KnowledgeModule.deleteCertificate('${cert.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        Utils.updateAlertCount();
    },

    showAddCertificateModal() {
        const content = `
            <form id="certificateForm">
                <div class="form-group">
                    <label>证书名称 *</label>
                    <select name="name" required>
                        <option value="">请选择证书类型</option>
                        <option value="AED培训证书">AED培训证书</option>
                        <option value="急救员证书">急救员证书</option>
                        <option value="红十字会急救证书">红十字会急救证书</option>
                        <option value="高级心血管生命支持(ACLS)">高级心血管生命支持(ACLS)</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>持有人 *</label>
                    <input type="text" name="holder" required placeholder="请输入持有人姓名">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>颁发日期 *</label>
                        <input type="date" name="issueDate" required max="${Utils.getTodayDateInput()}">
                    </div>
                    <div class="form-group">
                        <label>有效期至 *</label>
                        <input type="date" name="expiryDate" required min="${Utils.getTodayDateInput()}">
                    </div>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="3" placeholder="培训机构、证书编号等信息"></textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'KnowledgeModule.saveCertificate()' }
        ], '添加证书');
    },

    editCertificate(id) {
        const certificates = Storage.get(Storage.KEYS.CERTIFICATES) || [];
        const cert = certificates.find(c => c.id === id);
        if (!cert) return;

        const content = `
            <form id="certificateForm">
                <input type="hidden" name="id" value="${cert.id}">
                <div class="form-group">
                    <label>证书名称 *</label>
                    <select name="name" required>
                        <option value="">请选择证书类型</option>
                        <option value="AED培训证书" ${cert.name === 'AED培训证书' ? 'selected' : ''}>AED培训证书</option>
                        <option value="急救员证书" ${cert.name === '急救员证书' ? 'selected' : ''}>急救员证书</option>
                        <option value="红十字会急救证书" ${cert.name === '红十字会急救证书' ? 'selected' : ''}>红十字会急救证书</option>
                        <option value="高级心血管生命支持(ACLS)" ${cert.name === '高级心血管生命支持(ACLS)' ? 'selected' : ''}>高级心血管生命支持(ACLS)</option>
                        <option value="其他" ${cert.name === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>持有人 *</label>
                    <input type="text" name="holder" required value="${Utils.escapeHtml(cert.holder)}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>颁发日期 *</label>
                        <input type="date" name="issueDate" required value="${Utils.getDateInputValue(cert.issueDate)}" max="${Utils.getTodayDateInput()}">
                    </div>
                    <div class="form-group">
                        <label>有效期至 *</label>
                        <input type="date" name="expiryDate" required value="${Utils.getDateInputValue(cert.expiryDate)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="3">${Utils.escapeHtml(cert.notes || '')}</textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'KnowledgeModule.saveCertificate()' }
        ], '编辑证书');
    },

    saveCertificate() {
        const form = document.getElementById('certificateForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.holder || !data.issueDate || !data.expiryDate) {
            Utils.showToast('请填写所有必填项', 'error');
            return;
        }

        if (new Date(data.expiryDate) < new Date(data.issueDate)) {
            Utils.showToast('有效期不能早于颁发日期', 'error');
            return;
        }

        let certificates = Storage.get(Storage.KEYS.CERTIFICATES) || [];

        if (data.id) {
            const index = certificates.findIndex(c => c.id === data.id);
            if (index !== -1) {
                certificates[index] = { ...certificates[index], ...data };
                Utils.showToast('证书更新成功', 'success');
            }
        } else {
            data.id = Storage.generateId();
            certificates.push(data);
            Utils.showToast('证书添加成功', 'success');
        }

        Storage.set(Storage.KEYS.CERTIFICATES, certificates);
        Utils.closeModal();
        this.renderCertificates();
    },

    deleteCertificate(id) {
        Utils.confirmDialog('确定要删除这个证书吗？', `KnowledgeModule.confirmDeleteCertificate('${id}')`);
    },

    confirmDeleteCertificate(id) {
        let certificates = Storage.get(Storage.KEYS.CERTIFICATES) || [];
        certificates = certificates.filter(c => c.id !== id);
        Storage.set(Storage.KEYS.CERTIFICATES, certificates);
        this.renderCertificates();
        Utils.showToast('证书已删除', 'success');
    }
};

function closeSceneModal() {
    document.getElementById('sceneModal').classList.remove('active');
}

function showAddCertificateModal() {
    KnowledgeModule.showAddCertificateModal();
}
