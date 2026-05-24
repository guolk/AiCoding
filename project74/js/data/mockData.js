const MOCK_RECIPES = [
    {
        id: '1',
        name: '番茄炒蛋',
        description: '经典家常菜，酸甜可口，简单易做',
        icon: '🍳',
        cuisine: '家常菜',
        cookingMethod: '炒',
        dietType: '普通',
        difficulty: '简单',
        tags: ['快手菜', '下饭菜', '入门'],
        prepTime: 10,
        cookTime: 10,
        servings: 2,
        ingredients: [
            { name: '番茄', amount: 300, unit: '克' },
            { name: '鸡蛋', amount: 3, unit: '个' },
            { name: '葱', amount: 10, unit: '克' },
            { name: '盐', amount: 3, unit: '克' },
            { name: '白糖', amount: 5, unit: '克' },
            { name: '花生油', amount: 15, unit: '毫升' }
        ],
        steps: [
            { instruction: '番茄洗净切块，鸡蛋打散，葱切葱花', timer: 0 },
            { instruction: '热锅倒油，倒入蛋液炒至半熟盛出', timer: 2 },
            { instruction: '锅中再加少许油，放入番茄翻炒出汁', timer: 3 },
            { instruction: '加入盐和糖调味，继续翻炒至番茄软烂', timer: 2 },
            { instruction: '倒入炒好的鸡蛋，翻炒均匀', timer: 1 },
            { instruction: '撒上葱花，出锅装盘', timer: 0 }
        ],
        nutrition: {
            calories: 285,
            protein: 18,
            fat: 20,
            carbs: 12
        }
    },
    {
        id: '2',
        name: '红烧肉',
        description: '肥而不腻，入口即化的经典红烧肉',
        icon: '🥩',
        cuisine: '家常菜',
        cookingMethod: '炖',
        dietType: '普通',
        difficulty: '中等',
        tags: ['下饭菜', '宴客菜', '经典'],
        prepTime: 30,
        cookTime: 90,
        servings: 4,
        ingredients: [
            { name: '猪肉', amount: 500, unit: '克' },
            { name: '冰糖', amount: 30, unit: '克' },
            { name: '生抽', amount: 30, unit: '毫升' },
            { name: '老抽', amount: 15, unit: '毫升' },
            { name: '料酒', amount: 30, unit: '毫升' },
            { name: '葱', amount: 20, unit: '克' },
            { name: '生姜', amount: 15, unit: '克' },
            { name: '八角', amount: 2, unit: '个' },
            { name: '桂皮', amount: 1, unit: '小块' },
            { name: '盐', amount: 5, unit: '克' }
        ],
        steps: [
            { instruction: '五花肉切块，冷水下锅焯水去血沫', timer: 10 },
            { instruction: '锅中放少许油，加入冰糖小火炒出糖色', timer: 5 },
            { instruction: '放入五花肉翻炒上色', timer: 3 },
            { instruction: '加入葱姜、八角、桂皮炒香', timer: 2 },
            { instruction: '倒入料酒、生抽、老抽翻炒均匀', timer: 2 },
            { instruction: '加入热水没过肉块，大火烧开后转小火炖60分钟', timer: 60 },
            { instruction: '加盐调味，大火收汁至浓稠', timer: 10 },
            { instruction: '出锅装盘', timer: 0 }
        ],
        nutrition: {
            calories: 680,
            protein: 25,
            fat: 58,
            carbs: 15
        }
    },
    {
        id: '3',
        name: '清蒸鲈鱼',
        description: '鲜嫩多汁，营养丰富的清蒸鱼',
        icon: '🐟',
        cuisine: '粤菜',
        cookingMethod: '蒸',
        dietType: '低脂肪',
        difficulty: '中等',
        tags: ['健康', '高蛋白', '宴客菜'],
        prepTime: 20,
        cookTime: 15,
        servings: 3,
        ingredients: [
            { name: '鲈鱼', amount: 600, unit: '克' },
            { name: '葱', amount: 30, unit: '克' },
            { name: '生姜', amount: 20, unit: '克' },
            { name: '料酒', amount: 20, unit: '毫升' },
            { name: '盐', amount: 3, unit: '克' },
            { name: '蒸鱼豉油', amount: 30, unit: '毫升' },
            { name: '花生油', amount: 20, unit: '毫升' }
        ],
        steps: [
            { instruction: '鲈鱼处理干净，两面划几刀，用盐和料酒腌制15分钟', timer: 15 },
            { instruction: '葱姜切丝，部分塞入鱼肚，部分铺在鱼身上', timer: 0 },
            { instruction: '水烧开后，将鱼放入蒸锅，大火蒸8-10分钟', timer: 10 },
            { instruction: '取出后倒掉盘中汤汁，去掉旧葱姜', timer: 0 },
            { instruction: '淋上蒸鱼豉油，铺上新鲜葱姜丝', timer: 0 },
            { instruction: '热油浇在葱姜丝上激出香味', timer: 0 }
        ],
        nutrition: {
            calories: 320,
            protein: 45,
            fat: 12,
            carbs: 3
        }
    },
    {
        id: '4',
        name: '麻婆豆腐',
        description: '麻辣鲜香，正宗川味麻婆豆腐',
        icon: '🌶️',
        cuisine: '川菜',
        cookingMethod: '炒',
        dietType: '普通',
        difficulty: '简单',
        tags: ['下饭菜', '川菜', '麻辣'],
        prepTime: 10,
        cookTime: 15,
        servings: 2,
        ingredients: [
            { name: '豆腐', amount: 400, unit: '克' },
            { name: '猪肉', amount: 100, unit: '克' },
            { name: '豆瓣酱', amount: 20, unit: '克' },
            { name: '辣椒粉', amount: 5, unit: '克' },
            { name: '花椒粉', amount: 3, unit: '克' },
            { name: '生抽', amount: 15, unit: '毫升' },
            { name: '盐', amount: 2, unit: '克' },
            { name: '葱', amount: 10, unit: '克' },
            { name: '生姜', amount: 5, unit: '克' },
            { name: '大蒜', amount: 5, unit: '克' },
            { name: '淀粉', amount: 10, unit: '克' }
        ],
        steps: [
            { instruction: '豆腐切块，用盐水浸泡5分钟', timer: 5 },
            { instruction: '猪肉切末，葱姜蒜切末', timer: 0 },
            { instruction: '热锅倒油，放入肉末炒至变色', timer: 3 },
            { instruction: '加入豆瓣酱、辣椒粉炒出红油', timer: 2 },
            { instruction: '加入葱姜蒜炒香', timer: 1 },
            { instruction: '加入适量水烧开，放入豆腐块', timer: 3 },
            { instruction: '加生抽、盐调味，小火炖5分钟入味', timer: 5 },
            { instruction: '水淀粉勾芡，撒上花椒粉和葱花', timer: 2 }
        ],
        nutrition: {
            calories: 420,
            protein: 22,
            fat: 30,
            carbs: 18
        }
    },
    {
        id: '5',
        name: '意大利面',
        description: '经典番茄肉酱意大利面',
        icon: '🍝',
        cuisine: '意餐',
        cookingMethod: '煮',
        dietType: '普通',
        difficulty: '中等',
        tags: ['西餐', '意大利', '快手'],
        prepTime: 15,
        cookTime: 25,
        servings: 2,
        ingredients: [
            { name: '意大利面', amount: 200, unit: '克' },
            { name: '牛肉', amount: 200, unit: '克' },
            { name: '番茄', amount: 300, unit: '克' },
            { name: '洋葱', amount: 100, unit: '克' },
            { name: '大蒜', amount: 10, unit: '克' },
            { name: '番茄酱', amount: 50, unit: '克' },
            { name: '橄榄油', amount: 20, unit: '毫升' },
            { name: '盐', amount: 5, unit: '克' },
            { name: '黑胡椒', amount: 2, unit: '克' },
            { name: '罗勒叶', amount: 5, unit: '克' },
            { name: '帕玛森芝士', amount: 20, unit: '克' }
        ],
        steps: [
            { instruction: '牛肉切末，番茄切丁，洋葱和大蒜切末', timer: 0 },
            { instruction: '锅中放橄榄油，炒香洋葱和蒜末', timer: 3 },
            { instruction: '加入牛肉末炒至变色', timer: 5 },
            { instruction: '加入番茄丁和番茄酱，小火炖煮20分钟', timer: 20 },
            { instruction: '另起一锅，加盐煮意大利面至al dente', timer: 10 },
            { instruction: '将煮好的面条加入肉酱中拌匀', timer: 2 },
            { instruction: '加盐和黑胡椒调味，撒上罗勒叶和芝士碎', timer: 0 }
        ],
        nutrition: {
            calories: 720,
            protein: 35,
            fat: 28,
            carbs: 75
        }
    },
    {
        id: '6',
        name: '蔬菜沙拉',
        description: '清爽健康的田园蔬菜沙拉',
        icon: '🥗',
        cuisine: '西餐',
        cookingMethod: '凉拌',
        dietType: '素食',
        difficulty: '简单',
        tags: ['健康', '减脂', '素食', '快手'],
        prepTime: 15,
        cookTime: 0,
        servings: 2,
        ingredients: [
            { name: '生菜', amount: 100, unit: '克' },
            { name: '番茄', amount: 150, unit: '克' },
            { name: '黄瓜', amount: 100, unit: '克' },
            { name: '胡萝卜', amount: 50, unit: '克' },
            { name: '紫甘蓝', amount: 50, unit: '克' },
            { name: '玉米粒', amount: 50, unit: '克' },
            { name: '橄榄油', amount: 15, unit: '毫升' },
            { name: '醋', amount: 10, unit: '毫升' },
            { name: '盐', amount: 2, unit: '克' },
            { name: '黑胡椒', amount: 1, unit: '克' },
            { name: '柠檬汁', amount: 10, unit: '毫升' }
        ],
        steps: [
            { instruction: '生菜洗净撕成小片，沥干水分', timer: 0 },
            { instruction: '番茄切块，黄瓜切片', timer: 0 },
            { instruction: '胡萝卜切丝，紫甘蓝切丝', timer: 0 },
            { instruction: '将所有蔬菜放入大碗中', timer: 0 },
            { instruction: '加入煮熟的玉米粒', timer: 0 },
            { instruction: '橄榄油、醋、柠檬汁、盐、黑胡椒混合调成酱汁', timer: 0 },
            { instruction: '将酱汁淋在蔬菜上，拌匀即可', timer: 0 }
        ],
        nutrition: {
            calories: 180,
            protein: 5,
            fat: 12,
            carbs: 18
        }
    },
    {
        id: '7',
        name: '宫保鸡丁',
        description: '香辣可口，花生酥脆的经典川菜',
        icon: '🍗',
        cuisine: '川菜',
        cookingMethod: '炒',
        dietType: '高蛋白',
        difficulty: '中等',
        tags: ['下饭菜', '川菜', '经典'],
        prepTime: 20,
        cookTime: 15,
        servings: 3,
        ingredients: [
            { name: '鸡肉', amount: 300, unit: '克' },
            { name: '花生米', amount: 50, unit: '克' },
            { name: '干辣椒', amount: 10, unit: '个' },
            { name: '花椒', amount: 5, unit: '克' },
            { name: '葱', amount: 20, unit: '克' },
            { name: '生姜', amount: 10, unit: '克' },
            { name: '大蒜', amount: 10, unit: '克' },
            { name: '生抽', amount: 20, unit: '毫升' },
            { name: '醋', amount: 15, unit: '毫升' },
            { name: '白糖', amount: 10, unit: '克' },
            { name: '淀粉', amount: 15, unit: '克' },
            { name: '料酒', amount: 15, unit: '毫升' },
            { name: '盐', amount: 3, unit: '克' },
            { name: '花生油', amount: 30, unit: '毫升' }
        ],
        steps: [
            { instruction: '鸡肉切丁，用料酒、盐、淀粉腌制15分钟', timer: 15 },
            { instruction: '干辣椒剪段，葱姜蒜切末', timer: 0 },
            { instruction: '生抽、醋、白糖、淀粉、水调成碗汁', timer: 0 },
            { instruction: '花生米小火炒熟备用', timer: 3 },
            { instruction: '热锅倒油，放入鸡丁滑炒至变色盛出', timer: 3 },
            { instruction: '锅中留底油，爆香干辣椒和花椒', timer: 2 },
            { instruction: '加入葱姜蒜炒香', timer: 1 },
            { instruction: '倒入鸡丁翻炒，淋入碗汁', timer: 2 },
            { instruction: '最后加入花生米翻炒均匀', timer: 1 }
        ],
        nutrition: {
            calories: 580,
            protein: 38,
            fat: 40,
            carbs: 18
        }
    },
    {
        id: '8',
        name: '紫菜蛋花汤',
        description: '清淡鲜美，快手营养汤',
        icon: '🍲',
        cuisine: '家常菜',
        cookingMethod: '煮',
        dietType: '低脂肪',
        difficulty: '简单',
        tags: ['快手菜', '汤类', '清淡'],
        prepTime: 5,
        cookTime: 10,
        servings: 2,
        ingredients: [
            { name: '紫菜', amount: 10, unit: '克' },
            { name: '鸡蛋', amount: 2, unit: '个' },
            { name: '葱', amount: 10, unit: '克' },
            { name: '盐', amount: 3, unit: '克' },
            { name: '生抽', amount: 5, unit: '毫升' },
            { name: '香油', amount: 5, unit: '毫升' },
            { name: '胡椒粉', amount: 1, unit: '克' }
        ],
        steps: [
            { instruction: '紫菜撕成小块，鸡蛋打散，葱切葱花', timer: 0 },
            { instruction: '锅中加水烧开', timer: 5 },
            { instruction: '放入紫菜煮1分钟', timer: 1 },
            { instruction: '淋入蛋液，形成蛋花', timer: 1 },
            { instruction: '加盐、生抽、胡椒粉调味', timer: 0 },
            { instruction: '关火，撒上葱花，淋上香油', timer: 0 }
        ],
        nutrition: {
            calories: 120,
            protein: 10,
            fat: 7,
            carbs: 5
        }
    }
];

const MOCK_MEAL_PLANS = (() => {
    const plans = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i - 3);
        const dateStr = date.toISOString().split('T')[0];
        
        const plan = new MealPlan(dateStr);
        
        if (i === 0) {
            plan.setMeal('breakfast', new Recipe(MOCK_RECIPES[5]), 1);
        } else if (i === 1) {
            plan.setMeal('breakfast', new Recipe(MOCK_RECIPES[7]), 1);
            plan.setMeal('lunch', new Recipe(MOCK_RECIPES[0]), 2);
            plan.setMeal('dinner', new Recipe(MOCK_RECIPES[4]), 1);
        } else if (i === 2) {
            plan.setMeal('lunch', new Recipe(MOCK_RECIPES[3]), 1);
            plan.setMeal('dinner', new Recipe(MOCK_RECIPES[2]), 1);
        } else if (i === 3) {
            plan.setMeal('breakfast', new Recipe(MOCK_RECIPES[5]), 1);
            plan.setMeal('lunch', new Recipe(MOCK_RECIPES[6]), 1);
            plan.setMeal('dinner', new Recipe(MOCK_RECIPES[1]), 1);
        }
        
        plans[dateStr] = plan;
    }
    
    return plans;
})();

const MOCK_INVENTORY = ['鸡蛋', '大米', '盐', '酱油', '食用油', '番茄', '土豆', '胡萝卜'];
