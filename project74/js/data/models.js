const CATEGORIES = {
    cuisines: ['中餐', '西餐', '日料', '韩餐', '泰餐', '意餐', '川菜', '粤菜', '东北菜', '家常菜'],
    cookingMethods: ['炒', '煮', '蒸', '烤', '煎', '炸', '炖', '煲', '凉拌', '烘焙'],
    dietTypes: ['普通', '素食', '低碳水', '高蛋白', '低脂肪', '无麸质', '糖尿病友好', '清真', '素食主义'],
    difficulties: ['简单', '中等', '困难']
};

const AISLE_CATEGORIES = {
    '生鲜': ['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鱼肉', '虾', '蟹', '鸡蛋', '鸭蛋', '牛奶', '酸奶', '豆腐'],
    '蔬菜': ['白菜', '青菜', '菠菜', '芹菜', '韭菜', '生菜', '西兰花', '花菜', '胡萝卜', '白萝卜', '土豆', '红薯', '番茄', '黄瓜', '茄子', '辣椒', '青椒', '洋葱', '大蒜', '生姜', '葱', '香菜', '金针菇', '香菇', '木耳'],
    '水果': ['苹果', '香蕉', '橙子', '橘子', '葡萄', '西瓜', '草莓', '蓝莓', '芒果', '菠萝'],
    '冷冻': ['冷冻水饺', '冷冻包子', '冷冻肉类', '冷冻海鲜', '冷冻蔬菜', '冰淇淋'],
    '调料': ['盐', '糖', '酱油', '醋', '料酒', '生抽', '老抽', '蚝油', '豆瓣酱', '辣椒酱', '番茄酱', '芝麻酱', '花生油', '橄榄油', '芝麻油', '花椒', '八角', '桂皮', '香叶', '孜然', '胡椒粉', '味精', '鸡精'],
    '主食': ['大米', '面粉', '面条', '面包', '馒头', '糙米', '燕麦', '玉米', '小米'],
    '干货': ['红枣', '枸杞', '银耳', '莲子', '百合', '桂圆', '木耳', '香菇', '海带', '紫菜'],
    '饮品': ['矿泉水', '可乐', '果汁', '茶', '咖啡', '啤酒', '红酒']
};

const INGREDIENT_SUBSTITUTIONS = {
    '鸡蛋': ['鸭蛋', '鹌鹑蛋', '豆腐（素食替代）'],
    '牛奶': ['豆浆', '杏仁奶', '椰奶', '燕麦奶'],
    '猪肉': ['牛肉', '鸡肉', '豆腐', '蘑菇'],
    '牛肉': ['猪肉', '羊肉', '鸡肉', '豆腐干'],
    '鸡肉': ['猪肉', '牛肉', '豆腐', '杏鲍菇'],
    '鱼肉': ['鸡肉', '猪肉', '豆腐'],
    '虾': ['虾仁', '鱼肉', '鸡肉丁', '杏鲍菇丁'],
    '豆腐': ['鸡蛋', '豆腐干', '腐竹'],
    '酱油': ['生抽', '老抽', '蒸鱼豉油'],
    '生抽': ['酱油', '蒸鱼豉油'],
    '老抽': ['酱油', '红烧酱油'],
    '醋': ['白醋', '陈醋', '苹果醋'],
    '白糖': ['冰糖', '蜂蜜', '枫糖浆'],
    '盐': ['低钠盐', '酱油（少量）'],
    '料酒': ['黄酒', '米酒', '白酒（少量）'],
    '香油': ['芝麻油', '花椒油'],
    '花生油': ['玉米油', '大豆油', '菜籽油'],
    '橄榄油': ['牛油果油', '山茶油'],
    '面粉': ['全麦面粉', '低筋面粉', '中筋面粉'],
    '大米': ['糙米', '糯米', '小米'],
    '面条': ['米粉', '挂面', '意大利面'],
    '番茄': ['番茄酱', '番茄罐头'],
    '黄瓜': ['丝瓜', '冬瓜', '西葫芦'],
    '茄子': ['丝瓜', '西葫芦', '土豆'],
    '土豆': ['红薯', '山药', '芋头'],
    '胡萝卜': ['白萝卜', '心里美萝卜'],
    '洋葱': ['大葱', '小葱', '洋葱粉'],
    '大蒜': ['蒜末', '大蒜粉'],
    '生姜': ['姜丝', '姜粉'],
    '葱': ['小葱', '大葱', '洋葱'],
    '香菜': ['芹菜叶', '薄荷', '罗勒'],
    '辣椒': ['青椒', '彩椒', '辣椒粉'],
    '青椒': ['彩椒', '辣椒', '西葫芦'],
    '菠菜': ['青菜', '油菜', '生菜'],
    '白菜': ['娃娃菜', '青菜', '生菜'],
    '西兰花': ['花菜', '甘蓝'],
    '香菇': ['平菇', '金针菇', '杏鲍菇'],
    '木耳': ['银耳', '海带', '紫菜']
};

const COMMON_ALLERGENS = [
    { name: '花生', icon: '🥜' },
    { name: '坚果', icon: '🌰' },
    { name: '牛奶', icon: '🥛' },
    { name: '鸡蛋', icon: '🥚' },
    { name: '小麦', icon: '🌾' },
    { name: '大豆', icon: '🫘' },
    { name: '鱼类', icon: '🐟' },
    { name: '甲壳类', icon: '🦐' },
    { name: '芝麻', icon: '🥢' },
    { name: '芥末', icon: '🌶️' }
];

const RELIGIOUS_RESTRICTIONS = [
    { name: '清真（Halal）', description: '符合伊斯兰教规，禁食猪肉、血液、自死物等' },
    { name: '犹太洁食（Kosher）', description: '符合犹太教教规' },
    { name: '素食', description: '不食用任何动物肉类' },
    { name: '纯素食', description: '不食用任何动物制品，包括蛋奶蜂蜜' },
    { name: '不食牛肉', description: '印度教等宗教禁忌' },
    { name: '不食猪肉', description: '伊斯兰教、犹太教禁忌' }
];

const MEDICAL_CONDITIONS = [
    { name: '糖尿病', description: '控制碳水化合物摄入，低糖', nutrients: { carbs: 0.5, sugar: 0 } },
    { name: '高血压', description: '低盐饮食，控制钠摄入', nutrients: { sodium: 0.3 } },
    { name: '高血脂', description: '低脂肪，低胆固醇', nutrients: { fat: 0.5, cholesterol: 0 } },
    { name: '痛风', description: '低嘌呤，不饮酒、海鲜、动物内脏', ingredients: ['海鲜', '动物内脏', '酒精'] },
    { name: '肾病', description: '低蛋白，控制钾、磷摄入', nutrients: { protein: 0.5 } },
    { name: '乳糖不耐受', description: '避免乳制品', ingredients: ['牛奶', '奶酪', '黄油', '酸奶'] },
    { name: '麸质不耐受', description: '避免小麦、大麦、黑麦', ingredients: ['小麦', '大麦', '黑麦', '面粉'] },
    { name: '低蛋白饮食', description: '减少蛋白质摄入', nutrients: { protein: 0.3 } },
    { name: '高蛋白饮食', description: '增加蛋白质摄入', nutrients: { protein: 1.5 } }
];

class Recipe {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.name = data.name || '';
        this.description = data.description || '';
        this.image = data.image || '';
        this.icon = data.icon || '🍽️';
        this.cuisine = data.cuisine || '家常菜';
        this.cookingMethod = data.cookingMethod || '炒';
        this.dietType = data.dietType || '普通';
        this.difficulty = data.difficulty || '中等';
        this.tags = data.tags || [];
        this.prepTime = data.prepTime || 15;
        this.cookTime = data.cookTime || 30;
        this.servings = data.servings || 2;
        this.ingredients = data.ingredients || [];
        this.steps = data.steps || [];
        this.nutrition = data.nutrition || {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0
        };
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    get totalTime() {
        return this.prepTime + this.cookTime;
    }

    calculateNutrition() {
        return USDA_API.calculateRecipeNutrition(this.ingredients, this.servings);
    }

    async fetchNutritionFromUSDA() {
        const nutrition = await USDA_API.getBatchNutrition(this.ingredients);
        this.nutrition = nutrition;
        return nutrition;
    }

    scaleIngredients(servings) {
        const factor = servings / this.servings;
        return this.ingredients.map(ing => ({
            ...ing,
            amount: +(ing.amount * factor).toFixed(2)
        }));
    }

    checkForbiddenIngredients(forbiddenList) {
        return this.ingredients.filter(ing => 
            forbiddenList.some(forbidden => 
                ing.name.includes(forbidden) || forbidden.includes(ing.name)
            )
        );
    }

    getSubstitutions(missingIngredients) {
        const substitutions = [];
        missingIngredients.forEach(ing => {
            const key = Object.keys(INGREDIENT_SUBSTITUTIONS).find(k => 
                ing.name.includes(k) || k.includes(ing.name)
            );
            if (key && INGREDIENT_SUBSTITUTIONS[key]) {
                substitutions.push({
                    original: ing.name,
                    originalAmount: `${ing.amount}${ing.unit}`,
                    replacements: INGREDIENT_SUBSTITUTIONS[key]
                });
            }
        });
        return substitutions;
    }
}

class MealPlan {
    constructor(date) {
        this.date = date || new Date().toISOString().split('T')[0];
        this.breakfast = null;
        this.lunch = null;
        this.dinner = null;
        this.snacks = [];
    }

    setMeal(mealType, recipe, servings = 1) {
        if (!['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)) {
            throw new Error('Invalid meal type');
        }
        
        if (mealType === 'snacks') {
            this.snacks.push({ recipe, servings, addedAt: new Date() });
        } else {
            this[mealType] = { recipe, servings, addedAt: new Date() };
        }
    }

    removeMeal(mealType, index = null) {
        if (mealType === 'snacks' && index !== null) {
            this.snacks.splice(index, 1);
        } else {
            this[mealType] = null;
        }
    }

    getDailyNutrition() {
        let total = { calories: 0, protein: 0, fat: 0, carbs: 0 };
        
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            if (this[mealType]) {
                const { recipe, servings } = this[mealType];
                const factor = servings / recipe.servings;
                total.calories += recipe.nutrition.calories * factor;
                total.protein += recipe.nutrition.protein * factor;
                total.fat += recipe.nutrition.fat * factor;
                total.carbs += recipe.nutrition.carbs * factor;
            }
        });

        this.snacks.forEach(snack => {
            const factor = snack.servings / snack.recipe.servings;
            total.calories += snack.recipe.nutrition.calories * factor;
            total.protein += snack.recipe.nutrition.protein * factor;
            total.fat += snack.recipe.nutrition.fat * factor;
            total.carbs += snack.recipe.nutrition.carbs * factor;
        });

        return {
            calories: Math.round(total.calories),
            protein: +total.protein.toFixed(1),
            fat: +total.fat.toFixed(1),
            carbs: +total.carbs.toFixed(1)
        };
    }

    getAllIngredients() {
        const ingredients = [];
        
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            if (this[mealType]) {
                const { recipe, servings } = this[mealType];
                const scaled = recipe.scaleIngredients(servings);
                ingredients.push(...scaled);
            }
        });

        this.snacks.forEach(snack => {
            const scaled = snack.recipe.scaleIngredients(snack.servings);
            ingredients.push(...scaled);
        });

        return ingredients;
    }

    checkForbiddenIngredients(forbiddenList) {
        const issues = [];
        
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            if (this[mealType]) {
                const { recipe } = this[mealType];
                const forbidden = recipe.checkForbiddenIngredients(forbiddenList);
                if (forbidden.length > 0) {
                    issues.push({ mealType, recipe, forbidden });
                }
            }
        });

        return issues;
    }
}

class ShoppingList {
    constructor() {
        this.items = [];
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    addItem(item) {
        const existingIndex = this.items.findIndex(i => 
            i.name.toLowerCase() === item.name.toLowerCase() && 
            i.unit === item.unit
        );

        if (existingIndex >= 0) {
            this.items[existingIndex].amount += item.amount;
            this.items[existingIndex].fromRecipes = [
                ...new Set([...this.items[existingIndex].fromRecipes, ...(item.fromRecipes || [])])
            ];
        } else {
            this.items.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: item.name,
                amount: item.amount,
                unit: item.unit,
                aisle: this.getAisleCategory(item.name),
                checked: false,
                inInventory: false,
                fromRecipes: item.fromRecipes || [],
                notes: item.notes || ''
            });
        }
        
        this.updatedAt = new Date().toISOString();
    }

    addItems(items) {
        items.forEach(item => this.addItem(item));
    }

    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.updatedAt = new Date().toISOString();
    }

    toggleChecked(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.checked = !item.checked;
            this.updatedAt = new Date().toISOString();
        }
    }

    toggleInventory(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.inInventory = !item.inInventory;
            this.updatedAt = new Date().toISOString();
        }
    }

    getAisleCategory(ingredientName) {
        for (const [aisle, ingredients] of Object.entries(AISLE_CATEGORIES)) {
            if (ingredients.some(ing => 
                ingredientName.includes(ing) || ing.includes(ingredientName)
            )) {
                return aisle;
            }
        }
        return '其他';
    }

    getItemsByAisle() {
        const grouped = {};
        this.items.forEach(item => {
            if (!grouped[item.aisle]) {
                grouped[item.aisle] = [];
            }
            grouped[item.aisle].push(item);
        });
        return grouped;
    }

    getStats() {
        const total = this.items.length;
        const checked = this.items.filter(i => i.checked).length;
        const inInventory = this.items.filter(i => i.inInventory).length;
        const pending = total - checked - inInventory;
        
        return { total, checked, inInventory, pending };
    }

    clear() {
        this.items = [];
        this.updatedAt = new Date().toISOString();
    }

    generateFromMealPlans(mealPlans, inventory = []) {
        this.clear();
        
        mealPlans.forEach(plan => {
            const ingredients = plan.getAllIngredients();
            ingredients.forEach(ing => {
                this.addItem({
                    ...ing,
                    fromRecipes: [plan.date]
                });
            });
        });

        inventory.forEach(invItem => {
            const matchingItem = this.items.find(i => 
                i.name.toLowerCase().includes(invItem.toLowerCase()) ||
                invItem.toLowerCase().includes(i.name.toLowerCase())
            );
            if (matchingItem) {
                matchingItem.inInventory = true;
            }
        });

        return this.items;
    }

    export() {
        const lines = ['购物清单', '='.repeat(30), ''];
        
        const grouped = this.getItemsByAisle();
        for (const [aisle, items] of Object.entries(grouped)) {
            const pendingItems = items.filter(i => !i.checked && !i.inInventory);
            if (pendingItems.length > 0) {
                lines.push(`【${aisle}】`);
                pendingItems.forEach(item => {
                    const status = item.inInventory ? '（已有）' : '';
                    lines.push(`□ ${item.name} - ${item.amount}${item.unit} ${status}`);
                });
                lines.push('');
            }
        }

        return lines.join('\n');
    }
}

class DietSettings {
    constructor() {
        this.allergies = [];
        this.religiousRestrictions = [];
        this.medicalConditions = [];
        this.customForbiddenIngredients = [];
        this.nutritionGoals = {
            calories: 2000,
            protein: 60,
            fat: 65,
            carbs: 250
        };
    }

    getAllForbiddenIngredients() {
        const forbidden = [...this.customForbiddenIngredients];
        
        this.allergies.forEach(allergy => {
            const allergen = COMMON_ALLERGENS.find(a => a.name === allergy);
            if (allergen) {
                forbidden.push(allergen.name);
            }
        });

        this.religiousRestrictions.forEach(restriction => {
            if (restriction === '清真（Halal）' || restriction === '犹太洁食（Kosher）') {
                forbidden.push('猪肉');
            }
            if (restriction === '素食' || restriction === '纯素食') {
                forbidden.push('猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鱼肉', '虾', '蟹');
            }
            if (restriction === '纯素食') {
                forbidden.push('牛奶', '鸡蛋', '奶酪', '黄油', '酸奶', '蜂蜜');
            }
            if (restriction === '不食牛肉') {
                forbidden.push('牛肉');
            }
            if (restriction === '不食猪肉') {
                forbidden.push('猪肉');
            }
        });

        this.medicalConditions.forEach(condition => {
            const cond = MEDICAL_CONDITIONS.find(c => c.name === condition);
            if (cond && cond.ingredients) {
                forbidden.push(...cond.ingredients);
            }
        });

        return [...new Set(forbidden)];
    }

    getNutritionModifiers() {
        const modifiers = { calories: 1, protein: 1, fat: 1, carbs: 1, sodium: 1, cholesterol: 1, sugar: 1 };
        
        this.medicalConditions.forEach(condition => {
            const cond = MEDICAL_CONDITIONS.find(c => c.name === condition);
            if (cond && cond.nutrients) {
                Object.entries(cond.nutrients).forEach(([nutrient, factor]) => {
                    if (modifiers[nutrient] !== undefined) {
                        modifiers[nutrient] = Math.min(modifiers[nutrient], factor);
                    }
                });
            }
        });

        return modifiers;
    }

    getAdjustedNutritionGoals() {
        const modifiers = this.getNutritionModifiers();
        return {
            calories: Math.round(this.nutritionGoals.calories * modifiers.calories),
            protein: Math.round(this.nutritionGoals.protein * modifiers.protein),
            fat: Math.round(this.nutritionGoals.fat * modifiers.fat),
            carbs: Math.round(this.nutritionGoals.carbs * modifiers.carbs)
        };
    }

    validateRecipe(recipe) {
        const forbidden = this.getAllForbiddenIngredients();
        const issues = recipe.checkForbiddenIngredients(forbidden);
        
        return {
            isValid: issues.length === 0,
            forbiddenIngredients: issues,
            warnings: []
        };
    }

    validateMealPlan(mealPlan) {
        const forbidden = this.getAllForbiddenIngredients();
        const issues = mealPlan.checkForbiddenIngredients(forbidden);
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
}

class Inventory {
    constructor() {
        this.items = [];
        this.lastUpdated = new Date().toISOString();
    }

    addItem(name, quantity = 1, unit = '份') {
        const existing = this.items.find(i => 
            i.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name,
                quantity,
                unit,
                addedAt: new Date().toISOString()
            });
        }
        
        this.lastUpdated = new Date().toISOString();
    }

    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.lastUpdated = new Date().toISOString();
    }

    hasIngredient(ingredientName) {
        return this.items.some(i => 
            i.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
            ingredientName.toLowerCase().includes(i.name.toLowerCase())
        );
    }

    getMissingIngredients(requiredIngredients) {
        return requiredIngredients.filter(ing => !this.hasIngredient(ing.name));
    }

    getItemNames() {
        return this.items.map(i => i.name);
    }

    clear() {
        this.items = [];
        this.lastUpdated = new Date().toISOString();
    }
}
