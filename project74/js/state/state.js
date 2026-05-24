const AppState = {
    recipes: [],
    mealPlans: {},
    shoppingList: new ShoppingList(),
    inventory: new Inventory(),
    dietSettings: new DietSettings(),
    filters: {
        search: '',
        cuisine: null,
        cookingMethod: null,
        dietType: null,
        difficulty: null,
        tags: []
    },
    currentWeekOffset: 0,
    currentModule: 'recipes',
    currentSection: 'recipes',
    selectedRecipe: null,
    cookingState: {
        recipe: null,
        currentStep: 0,
        servings: 1,
        timers: [],
        voiceControl: false,
        fullscreen: false
    },
    shoppingListFilters: {
        aisle: '全部',
        showChecked: true,
        showInventory: true
    },

    init() {
        this.recipes = MOCK_RECIPES.map(r => new Recipe(r));
        this.mealPlans = MOCK_MEAL_PLANS;
        this.inventory = new Inventory();
        MOCK_INVENTORY.forEach(item => this.inventory.addItem(item));
        this.shoppingList = new ShoppingList();
        this.dietSettings = new DietSettings();
        this.saveToStorage();
    },

    saveToStorage() {
        try {
            localStorage.setItem('recipeApp_recipes', JSON.stringify(this.recipes));
            localStorage.setItem('recipeApp_mealPlans', JSON.stringify(this.mealPlans));
            localStorage.setItem('recipeApp_shoppingList', JSON.stringify(this.shoppingList));
            localStorage.setItem('recipeApp_inventory', JSON.stringify(this.inventory));
            localStorage.setItem('recipeApp_dietSettings', JSON.stringify(this.dietSettings));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },

    loadFromStorage() {
        try {
            const recipesData = localStorage.getItem('recipeApp_recipes');
            const mealPlansData = localStorage.getItem('recipeApp_mealPlans');
            const shoppingListData = localStorage.getItem('recipeApp_shoppingList');
            const inventoryData = localStorage.getItem('recipeApp_inventory');
            const dietSettingsData = localStorage.getItem('recipeApp_dietSettings');

            if (recipesData) {
                this.recipes = JSON.parse(recipesData).map(r => new Recipe(r));
            }
            if (mealPlansData) {
                const parsed = JSON.parse(mealPlansData);
                Object.keys(parsed).forEach(key => {
                    const plan = new MealPlan(key);
                    if (parsed[key].breakfast) {
                        plan.setMeal('breakfast', new Recipe(parsed[key].breakfast.recipe), parsed[key].breakfast.servings);
                    }
                    if (parsed[key].lunch) {
                        plan.setMeal('lunch', new Recipe(parsed[key].lunch.recipe), parsed[key].lunch.servings);
                    }
                    if (parsed[key].dinner) {
                        plan.setMeal('dinner', new Recipe(parsed[key].dinner.recipe), parsed[key].dinner.servings);
                    }
                    this.mealPlans[key] = plan;
                });
            }
            if (shoppingListData) {
                const parsed = JSON.parse(shoppingListData);
                this.shoppingList = new ShoppingList();
                this.shoppingList.items = parsed.items || [];
            }
            if (inventoryData) {
                const parsed = JSON.parse(inventoryData);
                this.inventory = new Inventory();
                this.inventory.items = parsed.items || [];
            }
            if (dietSettingsData) {
                const parsed = JSON.parse(dietSettingsData);
                this.dietSettings = new DietSettings();
                Object.assign(this.dietSettings, parsed);
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    },

    addRecipe(recipeData) {
        const recipe = new Recipe(recipeData);
        recipe.nutrition = recipe.calculateNutrition().perServing;
        this.recipes.push(recipe);
        this.saveToStorage();
        return recipe;
    },

    updateRecipe(id, updates) {
        const index = this.recipes.findIndex(r => r.id === id);
        if (index >= 0) {
            const updated = { ...this.recipes[index], ...updates, updatedAt: new Date().toISOString() };
            const recipe = new Recipe(updated);
            recipe.nutrition = recipe.calculateNutrition().perServing;
            this.recipes[index] = recipe;
            this.saveToStorage();
            return recipe;
        }
        return null;
    },

    deleteRecipe(id) {
        this.recipes = this.recipes.filter(r => r.id !== id);
        this.saveToStorage();
    },

    getRecipeById(id) {
        return this.recipes.find(r => r.id === id);
    },

    getFilteredRecipes() {
        return this.recipes.filter(recipe => {
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matchesSearch = 
                    recipe.name.toLowerCase().includes(searchLower) ||
                    recipe.description.toLowerCase().includes(searchLower) ||
                    recipe.tags.some(t => t.toLowerCase().includes(searchLower));
                if (!matchesSearch) return false;
            }
            if (this.filters.cuisine && recipe.cuisine !== this.filters.cuisine) return false;
            if (this.filters.cookingMethod && recipe.cookingMethod !== this.filters.cookingMethod) return false;
            if (this.filters.dietType && recipe.dietType !== this.filters.dietType) return false;
            if (this.filters.difficulty && recipe.difficulty !== this.filters.difficulty) return false;
            if (this.filters.tags.length > 0) {
                const hasTag = this.filters.tags.some(tag => recipe.tags.includes(tag));
                if (!hasTag) return false;
            }
            return true;
        });
    },

    getAllTags() {
        const tags = new Set();
        this.recipes.forEach(r => r.tags.forEach(t => tags.add(t)));
        return Array.from(tags);
    },

    setMeal(date, mealType, recipe, servings = 1) {
        if (!this.mealPlans[date]) {
            this.mealPlans[date] = new MealPlan(date);
        }
        
        const validation = this.dietSettings.validateRecipe(recipe);
        if (!validation.isValid) {
            const forbidden = validation.forbiddenIngredients.map(i => i.name).join('、');
            Toast.show(`警告: 该食谱包含禁忌食材: ${forbidden}`, 'warning');
        }
        
        this.mealPlans[date].setMeal(mealType, recipe, servings);
        this.saveToStorage();
    },

    removeMeal(date, mealType, index = null) {
        if (this.mealPlans[date]) {
            this.mealPlans[date].removeMeal(mealType, index);
            this.saveToStorage();
        }
    },

    getMealPlan(date) {
        return this.mealPlans[date] || new MealPlan(date);
    },

    getWeekMealPlans(weekOffset = 0) {
        const plans = [];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            plans.push({
                date: dateStr,
                dayName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
                isToday: dateStr === today.toISOString().split('T')[0],
                plan: this.getMealPlan(dateStr)
            });
        }
        return plans;
    },

    generateSmartPlan(date, mealType) {
        const goals = this.dietSettings.getAdjustedNutritionGoals();
        const forbidden = this.dietSettings.getAllForbiddenIngredients();
        
        let candidates = this.recipes.filter(recipe => {
            const validation = this.dietSettings.validateRecipe(recipe);
            return validation.isValid;
        });

        if (candidates.length === 0) {
            candidates = this.recipes;
        }

        const currentPlan = this.getMealPlan(date);
        const currentNutrition = currentPlan.getDailyNutrition();
        
        const calorieDistribution = {
            breakfast: 0.25,
            lunch: 0.35,
            dinner: 0.40
        };

        const targetCalories = goals.calories * calorieDistribution[mealType];
        
        candidates.sort((a, b) => {
            const aDiff = Math.abs(a.nutrition.calories - targetCalories);
            const bDiff = Math.abs(b.nutrition.calories - targetCalories);
            return aDiff - bDiff;
        });

        return candidates.slice(0, 5);
    },

    generateShoppingList(fromDate = null, toDate = null) {
        const mealPlans = [];
        
        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                if (this.mealPlans[dateStr]) {
                    mealPlans.push(this.mealPlans[dateStr]);
                }
            }
        } else {
            const weekPlans = this.getWeekMealPlans(this.currentWeekOffset);
            weekPlans.forEach(wp => {
                if (wp.plan && (wp.plan.breakfast || wp.plan.lunch || wp.plan.dinner || wp.plan.snacks.length > 0)) {
                    mealPlans.push(wp.plan);
                }
            });
        }

        const inventoryNames = this.inventory.getItemNames();
        this.shoppingList.generateFromMealPlans(mealPlans, inventoryNames);
        this.saveToStorage();
        
        return this.shoppingList;
    },

    setFilter(type, value) {
        this.filters[type] = value;
    },

    toggleTagFilter(tag) {
        const index = this.filters.tags.indexOf(tag);
        if (index >= 0) {
            this.filters.tags.splice(index, 1);
        } else {
            this.filters.tags.push(tag);
        }
    },

    clearFilters() {
        this.filters = {
            search: '',
            cuisine: null,
            cookingMethod: null,
            dietType: null,
            difficulty: null,
            tags: []
        };
    },

    updateDietSettings(updates) {
        Object.assign(this.dietSettings, updates);
        this.saveToStorage();
    }
};
