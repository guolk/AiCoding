const USDA_NUTRITION_DATABASE = {
    '番茄': { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, per100g: true },
    '西红柿': { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, per100g: true },
    '鸡蛋': { calories: 155, protein: 13, fat: 11, carbs: 1.1, per100g: true },
    '葱': { calories: 28, protein: 1.7, fat: 0.3, carbs: 5.2, per100g: true },
    '大葱': { calories: 28, protein: 1.7, fat: 0.3, carbs: 5.2, per100g: true },
    '小葱': { calories: 28, protein: 1.7, fat: 0.3, carbs: 5.2, per100g: true },
    '盐': { calories: 0, protein: 0, fat: 0, carbs: 0, per100g: true },
    '白糖': { calories: 387, protein: 0, fat: 0, carbs: 100, per100g: true },
    '冰糖': { calories: 387, protein: 0, fat: 0, carbs: 100, per100g: true },
    '花生油': { calories: 884, protein: 0, fat: 100, carbs: 0, per100g: true },
    '食用油': { calories: 884, protein: 0, fat: 100, carbs: 0, per100g: true },
    '橄榄油': { calories: 884, protein: 0, fat: 100, carbs: 0, per100g: true },
    '芝麻油': { calories: 884, protein: 0, fat: 100, carbs: 0, per100g: true },
    '香油': { calories: 884, protein: 0, fat: 100, carbs: 0, per100g: true },
    '猪肉': { calories: 242, protein: 27, fat: 14, carbs: 0, per100g: true },
    '五花肉': { calories: 518, protein: 9, fat: 53, carbs: 0, per100g: true },
    '牛肉': { calories: 250, protein: 26, fat: 15, carbs: 0, per100g: true },
    '羊肉': { calories: 294, protein: 25, fat: 20, carbs: 0, per100g: true },
    '鸡肉': { calories: 239, protein: 27, fat: 14, carbs: 0, per100g: true },
    '鸡胸肉': { calories: 165, protein: 31, fat: 3.6, carbs: 0, per100g: true },
    '鸭肉': { calories: 337, protein: 19, fat: 28, carbs: 0, per100g: true },
    '鱼肉': { calories: 113, protein: 20, fat: 3, carbs: 0, per100g: true },
    '鲈鱼': { calories: 105, protein: 18.6, fat: 3.4, carbs: 0, per100g: true },
    '虾': { calories: 99, protein: 21, fat: 1.7, carbs: 0.2, per100g: true },
    '虾仁': { calories: 99, protein: 21, fat: 1.7, carbs: 0.2, per100g: true },
    '蟹': { calories: 103, protein: 17.5, fat: 2.6, carbs: 2.3, per100g: true },
    '豆腐': { calories: 76, protein: 8, fat: 4.8, carbs: 1.9, per100g: true },
    '北豆腐': { calories: 98, protein: 12.2, fat: 4.8, carbs: 1.5, per100g: true },
    '嫩豆腐': { calories: 57, protein: 6.2, fat: 2.5, carbs: 2.4, per100g: true },
    '豆腐干': { calories: 140, protein: 16.2, fat: 3.6, carbs: 11.5, per100g: true },
    '生抽': { calories: 20, protein: 4, fat: 0, carbs: 1, per100g: true },
    '酱油': { calories: 20, protein: 4, fat: 0, carbs: 1, per100g: true },
    '老抽': { calories: 51, protein: 7.9, fat: 0, carbs: 4.5, per100g: true },
    '蒸鱼豉油': { calories: 25, protein: 5, fat: 0, carbs: 1.5, per100g: true },
    '醋': { calories: 31, protein: 0, fat: 0, carbs: 6, per100g: true },
    '白醋': { calories: 31, protein: 0, fat: 0, carbs: 6, per100g: true },
    '陈醋': { calories: 31, protein: 0, fat: 0, carbs: 6, per100g: true },
    '料酒': { calories: 114, protein: 0, fat: 0, carbs: 4, per100g: true },
    '黄酒': { calories: 66, protein: 1.2, fat: 0, carbs: 1, per100g: true },
    '蚝油': { calories: 114, protein: 5, fat: 0.5, carbs: 23, per100g: true },
    '豆瓣酱': { calories: 106, protein: 6, fat: 5.8, carbs: 8.6, per100g: true },
    '辣椒酱': { calories: 87, protein: 2.3, fat: 5.6, carbs: 7.6, per100g: true },
    '辣椒粉': { calories: 318, protein: 14.5, fat: 12.9, carbs: 49, per100g: true },
    '花椒粉': { calories: 263, protein: 6.7, fat: 8.9, carbs: 41.6, per100g: true },
    '番茄酱': { calories: 81, protein: 1.7, fat: 0.5, carbs: 18.5, per100g: true },
    '芝麻酱': { calories: 594, protein: 19.2, fat: 52.7, carbs: 22.7, per100g: true },
    '花椒': { calories: 263, protein: 6.7, fat: 8.9, carbs: 41.6, per100g: true },
    '八角': { calories: 304, protein: 3.8, fat: 5.5, carbs: 56, per100g: true },
    '桂皮': { calories: 297, protein: 1.8, fat: 3.2, carbs: 71.5, per100g: true },
    '香叶': { calories: 313, protein: 7.6, fat: 8.3, carbs: 58, per100g: true },
    '孜然': { calories: 375, protein: 17.7, fat: 22.3, carbs: 38.1, per100g: true },
    '胡椒粉': { calories: 296, protein: 10.4, fat: 3.3, carbs: 64.1, per100g: true },
    '黑胡椒': { calories: 296, protein: 10.4, fat: 3.3, carbs: 64.1, per100g: true },
    '味精': { calories: 288, protein: 73, fat: 0, carbs: 0, per100g: true },
    '鸡精': { calories: 200, protein: 40, fat: 2, carbs: 5, per100g: true },
    '淀粉': { calories: 381, protein: 0.3, fat: 0.1, carbs: 94, per100g: true },
    '玉米淀粉': { calories: 381, protein: 0.3, fat: 0.1, carbs: 94, per100g: true },
    '生粉': { calories: 381, protein: 0.3, fat: 0.1, carbs: 94, per100g: true },
    '大米': { calories: 365, protein: 7, fat: 0.8, carbs: 77, per100g: true },
    '面粉': { calories: 364, protein: 10, fat: 1, carbs: 76, per100g: true },
    '面条': { calories: 270, protein: 8, fat: 1, carbs: 56, per100g: true },
    '意大利面': { calories: 371, protein: 13, fat: 1.5, carbs: 75, per100g: true },
    '面包': { calories: 265, protein: 9, fat: 3.2, carbs: 49, per100g: true },
    '馒头': { calories: 221, protein: 7, fat: 1.1, carbs: 47, per100g: true },
    '糙米': { calories: 362, protein: 7.5, fat: 2.7, carbs: 75, per100g: true },
    '燕麦': { calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3, per100g: true },
    '玉米': { calories: 96, protein: 3.4, fat: 1.5, carbs: 19, per100g: true },
    '小米': { calories: 361, protein: 9, fat: 3.1, carbs: 75, per100g: true },
    '白菜': { calories: 17, protein: 1.5, fat: 0.1, carbs: 3.2, per100g: true },
    '小白菜': { calories: 15, protein: 1.5, fat: 0.3, carbs: 2.7, per100g: true },
    '青菜': { calories: 15, protein: 1.5, fat: 0.3, carbs: 2.7, per100g: true },
    '油菜': { calories: 23, protein: 1.8, fat: 0.5, carbs: 3.8, per100g: true },
    '菠菜': { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, per100g: true },
    '芹菜': { calories: 16, protein: 0.7, fat: 0.1, carbs: 3, per100g: true },
    '韭菜': { calories: 29, protein: 2.4, fat: 0.4, carbs: 4.5, per100g: true },
    '生菜': { calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, per100g: true },
    '西兰花': { calories: 34, protein: 2.8, fat: 0.4, carbs: 7, per100g: true },
    '花菜': { calories: 25, protein: 1.9, fat: 0.2, carbs: 5.2, per100g: true },
    '胡萝卜': { calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, per100g: true },
    '白萝卜': { calories: 16, protein: 0.7, fat: 0.1, carbs: 3.6, per100g: true },
    '土豆': { calories: 77, protein: 2, fat: 0.1, carbs: 17, per100g: true },
    '红薯': { calories: 86, protein: 1.6, fat: 0.1, carbs: 20, per100g: true },
    '黄瓜': { calories: 16, protein: 0.7, fat: 0.1, carbs: 3.6, per100g: true },
    '茄子': { calories: 25, protein: 1, fat: 0.2, carbs: 5.8, per100g: true },
    '辣椒': { calories: 40, protein: 1.9, fat: 0.3, carbs: 8.8, per100g: true },
    '青椒': { calories: 22, protein: 1, fat: 0.2, carbs: 5.4, per100g: true },
    '彩椒': { calories: 26, protein: 0.9, fat: 0.2, carbs: 6.3, per100g: true },
    '洋葱': { calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, per100g: true },
    '大蒜': { calories: 149, protein: 6.4, fat: 0.5, carbs: 33, per100g: true },
    '生姜': { calories: 80, protein: 1.8, fat: 0.8, carbs: 18, per100g: true },
    '香菜': { calories: 21, protein: 1.8, fat: 0.4, carbs: 3.6, per100g: true },
    '金针菇': { calories: 32, protein: 2.4, fat: 0.4, carbs: 6, per100g: true },
    '香菇': { calories: 34, protein: 2.2, fat: 0.3, carbs: 6.1, per100g: true },
    '平菇': { calories: 24, protein: 1.9, fat: 0.3, carbs: 4.6, per100g: true },
    '杏鲍菇': { calories: 35, protein: 1.3, fat: 0.1, carbs: 8.3, per100g: true },
    '木耳': { calories: 265, protein: 12.1, fat: 1.5, carbs: 65.6, per100g: true },
    '银耳': { calories: 261, protein: 10, fat: 1.4, carbs: 67.3, per100g: true },
    '苹果': { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, per100g: true },
    '香蕉': { calories: 89, protein: 1.1, fat: 0.3, carbs: 23, per100g: true },
    '橙子': { calories: 47, protein: 0.9, fat: 0.1, carbs: 12, per100g: true },
    '橘子': { calories: 47, protein: 0.9, fat: 0.1, carbs: 12, per100g: true },
    '葡萄': { calories: 69, protein: 0.7, fat: 0.2, carbs: 18, per100g: true },
    '西瓜': { calories: 30, protein: 0.6, fat: 0.2, carbs: 7.6, per100g: true },
    '草莓': { calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7, per100g: true },
    '蓝莓': { calories: 57, protein: 0.7, fat: 0.3, carbs: 14, per100g: true },
    '芒果': { calories: 60, protein: 0.5, fat: 0.3, carbs: 15, per100g: true },
    '菠萝': { calories: 50, protein: 0.5, fat: 0.1, carbs: 13, per100g: true },
    '紫菜': { calories: 207, protein: 26.7, fat: 3.9, carbs: 44.1, per100g: true },
    '海带': { calories: 38, protein: 1.8, fat: 0.4, carbs: 9.6, per100g: true },
    '红枣': { calories: 287, protein: 2.1, fat: 0.4, carbs: 77, per100g: true },
    '枸杞': { calories: 258, protein: 9.1, fat: 1.4, carbs: 64, per100g: true },
    '莲子': { calories: 343, protein: 17.2, fat: 2, carbs: 64.2, per100g: true },
    '百合': { calories: 166, protein: 3.2, fat: 0.1, carbs: 38.8, per100g: true },
    '桂圆': { calories: 277, protein: 1.2, fat: 0.4, carbs: 65.4, per100g: true },
    '花生米': { calories: 567, protein: 25, fat: 44, carbs: 16, per100g: true },
    '花生': { calories: 567, protein: 25, fat: 44, carbs: 16, per100g: true },
    '玉米': { calories: 96, protein: 3.4, fat: 1.5, carbs: 19, per100g: true },
    '玉米粒': { calories: 96, protein: 3.4, fat: 1.5, carbs: 19, per100g: true },
    '罗勒叶': { calories: 21, protein: 3.15, fat: 0.6, carbs: 4, per100g: true },
    '帕玛森芝士': { calories: 392, protein: 38.1, fat: 25.7, carbs: 4.1, per100g: true },
    '芝士': { calories: 402, protein: 25.4, fat: 31.8, carbs: 3.2, per100g: true },
    '紫甘蓝': { calories: 31, protein: 1.4, fat: 0.2, carbs: 7, per100g: true },
    '柠檬汁': { calories: 26, protein: 0.4, fat: 0.2, carbs: 8.2, per100g: true },
    '牛奶': { calories: 42, protein: 3.4, fat: 1, carbs: 5, per100g: true },
    '酸奶': { calories: 59, protein: 3.5, fat: 0.7, carbs: 10, per100g: true },
    '蜂蜜': { calories: 304, protein: 0.3, fat: 0, carbs: 82.4, per100g: true },
    '酵母': { calories: 325, protein: 40.4, fat: 7.6, carbs: 23.5, per100g: true },
    '小苏打': { calories: 0, protein: 0, fat: 0, carbs: 0, per100g: true },
    '泡打粉': { calories: 53, protein: 0.2, fat: 0.2, carbs: 28.6, per100g: true },
    '可可粉': { calories: 228, protein: 19.6, fat: 13.7, carbs: 57.9, per100g: true },
    '巧克力': { calories: 546, protein: 5, fat: 31, carbs: 59, per100g: true },
    '奶油': { calories: 340, protein: 2.1, fat: 37, carbs: 2.8, per100g: true },
    '黄油': { calories: 717, protein: 0.9, fat: 81.1, carbs: 0.1, per100g: true },
    '奶酪': { calories: 402, protein: 25.4, fat: 31.8, carbs: 3.2, per100g: true },
    '干辣椒': { calories: 318, protein: 14.5, fat: 12.9, carbs: 49, per100g: true },
    '速冻水饺': { calories: 240, protein: 8, fat: 10, carbs: 30, per100g: true },
    '速冻包子': { calories: 227, protein: 7.9, fat: 8.1, carbs: 31.8, per100g: true },
    '豆腐': { calories: 76, protein: 8, fat: 4.8, carbs: 1.9, per100g: true }
};

const USDA_API = {
    API_KEY: 'DEMO_KEY',
    BASE_URL: 'https://api.nal.usda.gov/fdc/v1',

    async searchFood(query) {
        console.log(`[USDA API] Searching for: ${query}`);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const [name, data] of Object.entries(USDA_NUTRITION_DATABASE)) {
            if (name.toLowerCase().includes(lowerQuery) || lowerQuery.includes(name.toLowerCase())) {
                results.push({
                    fdcId: Date.now() + Math.random(),
                    description: name,
                    dataType: 'SR Legacy',
                    foodNutrients: this._convertToNutrients(data)
                });
            }
        }
        
        if (results.length === 0) {
            results.push({
                fdcId: Date.now() + Math.random(),
                description: query,
                dataType: 'Estimated',
                foodNutrients: this._convertToNutrients(this._estimateNutrition(query))
            });
        }
        
        return results;
    },

    async getFoodNutrition(fdcId) {
        console.log(`[USDA API] Getting nutrition for FDC ID: ${fdcId}`);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        for (const [name, data] of Object.entries(USDA_NUTRITION_DATABASE)) {
            if (data.fdcId === fdcId) {
                return {
                    description: name,
                    foodNutrients: this._convertToNutrients(data)
                };
            }
        }
        
        return null;
    },

    async getNutritionByIngredient(ingredientName, amount = 100, unit = '克') {
        console.log(`[USDA API] Getting nutrition for: ${ingredientName} ${amount}${unit}`);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        let nutritionData = null;
        const lowerName = ingredientName.toLowerCase();
        
        for (const [name, data] of Object.entries(USDA_NUTRITION_DATABASE)) {
            if (lowerName.includes(name.toLowerCase()) || name.toLowerCase().includes(lowerName)) {
                nutritionData = { ...data };
                break;
            }
        }
        
        if (!nutritionData) {
            nutritionData = this._estimateNutrition(ingredientName);
        }
        
        const factor = unit === '个' || unit === '块' || unit === '个' || unit === '小块' || unit === '片' 
            ? (amount * 50) / 100 
            : amount / 100;
        
        return {
            ingredient: ingredientName,
            amount,
            unit,
            nutrition: {
                calories: Math.round(nutritionData.calories * factor),
                protein: +(nutritionData.protein * factor).toFixed(1),
                fat: +(nutritionData.fat * factor).toFixed(1),
                carbs: +(nutritionData.carbs * factor).toFixed(1)
            },
            source: nutritionData.per100g ? 'USDA Database' : 'Estimated'
        };
    },

    async getBatchNutrition(ingredients) {
        console.log(`[USDA API] Getting batch nutrition for ${ingredients.length} ingredients`);
        
        const results = [];
        for (const ing of ingredients) {
            const result = await this.getNutritionByIngredient(ing.name, ing.amount, ing.unit);
            results.push(result);
        }
        
        return results;
    },

    calculateRecipeNutrition(ingredients, servings = 1) {
        const total = { calories: 0, protein: 0, fat: 0, carbs: 0 };
        
        ingredients.forEach(ing => {
            let nutritionData = null;
            const lowerName = ing.name.toLowerCase();
            
            for (const [name, data] of Object.entries(USDA_NUTRITION_DATABASE)) {
                if (lowerName.includes(name.toLowerCase()) || name.toLowerCase().includes(lowerName)) {
                    nutritionData = data;
                    break;
                }
            }
            
            if (!nutritionData) {
                nutritionData = this._estimateNutrition(ing.name);
            }
            
            const factor = ['个', '块', '片', '小块', '只', '瓣'].includes(ing.unit)
                ? (ing.amount * 50) / 100
                : ing.amount / 100;
            
            total.calories += nutritionData.calories * factor;
            total.protein += nutritionData.protein * factor;
            total.fat += nutritionData.fat * factor;
            total.carbs += nutritionData.carbs * factor;
        });
        
        return {
            perServing: {
                calories: Math.round(total.calories / servings),
                protein: +(total.protein / servings).toFixed(1),
                fat: +(total.fat / servings).toFixed(1),
                carbs: +(total.carbs / servings).toFixed(1)
            },
            total: {
                calories: Math.round(total.calories),
                protein: +total.protein.toFixed(1),
                fat: +total.fat.toFixed(1),
                carbs: +total.carbs.toFixed(1)
            },
            source: 'USDA Food Database'
        };
    },

    _convertToNutrients(data) {
        return [
            { nutrientName: 'Energy', nutrientNumber: '208', value: data.calories, unitName: 'kcal' },
            { nutrientName: 'Protein', nutrientNumber: '203', value: data.protein, unitName: 'g' },
            { nutrientName: 'Total lipid (fat)', nutrientNumber: '204', value: data.fat, unitName: 'g' },
            { nutrientName: 'Carbohydrate, by difference', nutrientNumber: '205', value: data.carbs, unitName: 'g' }
        ];
    },

    _estimateNutrition(ingredientName) {
        const name = ingredientName.toLowerCase();
        
        if (name.includes('肉') || name.includes('牛') || name.includes('猪') || name.includes('羊') || name.includes('鸡') || name.includes('鸭')) {
            return { calories: 200, protein: 25, fat: 10, carbs: 0, per100g: true };
        }
        if (name.includes('鱼') || name.includes('虾') || name.includes('蟹') || name.includes('海鲜')) {
            return { calories: 100, protein: 20, fat: 2, carbs: 0, per100g: true };
        }
        if (name.includes('菜') || name.includes('瓜') || name.includes('菇') || name.includes('菌') || name.includes('藻')) {
            return { calories: 30, protein: 2, fat: 0.3, carbs: 6, per100g: true };
        }
        if (name.includes('果') || name.includes('瓜')) {
            return { calories: 50, protein: 0.5, fat: 0.2, carbs: 12, per100g: true };
        }
        if (name.includes('油') || name.includes('脂') || name.includes('酱') && name.includes('芝麻')) {
            return { calories: 884, protein: 0, fat: 100, carbs: 0, per100g: true };
        }
        if (name.includes('糖') || name.includes('蜜')) {
            return { calories: 380, protein: 0, fat: 0, carbs: 95, per100g: true };
        }
        if (name.includes('盐') || name.includes('味精') || name.includes('鸡精')) {
            return { calories: 0, protein: 0, fat: 0, carbs: 0, per100g: true };
        }
        if (name.includes('酱油') || name.includes('醋') || name.includes('酒') || name.includes('汁')) {
            return { calories: 30, protein: 3, fat: 0, carbs: 5, per100g: true };
        }
        if (name.includes('粉') || name.includes('面') || name.includes('米') || name.includes('饭') || name.includes('包') || name.includes('条')) {
            return { calories: 350, protein: 8, fat: 2, carbs: 75, per100g: true };
        }
        if (name.includes('蛋') || name.includes('奶') || name.includes('酪') || name.includes('酸奶')) {
            return { calories: 100, protein: 8, fat: 6, carbs: 3, per100g: true };
        }
        if (name.includes('豆腐') || name.includes('豆') || name.includes('腐')) {
            return { calories: 80, protein: 8, fat: 5, carbs: 2, per100g: true };
        }
        if (name.includes('椒') || name.includes('姜') || name.includes('蒜') || name.includes('葱') || name.includes('香菜')) {
            return { calories: 30, protein: 1.5, fat: 0.3, carbs: 6, per100g: true };
        }
        if (name.includes('桂皮') || name.includes('八角') || name.includes('香叶') || name.includes('孜然') || name.includes('胡椒') || name.includes('花椒')) {
            return { calories: 300, protein: 8, fat: 8, carbs: 55, per100g: true };
        }
        
        return { calories: 100, protein: 5, fat: 3, carbs: 15, per100g: true };
    }
};
