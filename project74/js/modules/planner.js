const PlannerModule = {
    currentWeekOffset: 0,

    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        document.getElementById('prev-week').addEventListener('click', () => {
            this.currentWeekOffset--;
            AppState.currentWeekOffset = this.currentWeekOffset;
            this.render();
        });

        document.getElementById('next-week').addEventListener('click', () => {
            this.currentWeekOffset++;
            AppState.currentWeekOffset = this.currentWeekOffset;
            this.render();
        });

        document.getElementById('btn-generate-plan').addEventListener('click', () => {
            this.generateSmartWeekPlan();
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            Modal.dietSettings();
        });

        ['calorie-goal', 'protein-goal', 'fat-goal', 'carbs-goal'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateNutritionGoals();
            });
        });
    },

    updateNutritionGoals() {
        const goals = {
            calories: parseInt(document.getElementById('calorie-goal').value) || 2000,
            protein: parseInt(document.getElementById('protein-goal').value) || 60,
            fat: parseInt(document.getElementById('fat-goal').value) || 65,
            carbs: parseInt(document.getElementById('carbs-goal').value) || 250
        };
        AppState.updateDietSettings({ nutritionGoals: goals });
        this.renderDailySummary();
    },

    render() {
        this.renderWeekDisplay();
        this.renderPlannerGrid();
        this.renderDailySummary();
        this.renderGoalInputs();
    },

    renderGoalInputs() {
        const goals = AppState.dietSettings.nutritionGoals;
        document.getElementById('calorie-goal').value = goals.calories;
        document.getElementById('protein-goal').value = goals.protein;
        document.getElementById('fat-goal').value = goals.fat;
        document.getElementById('carbs-goal').value = goals.carbs;
    },

    renderWeekDisplay() {
        const weekPlans = AppState.getWeekMealPlans(this.currentWeekOffset);
        const startDate = weekPlans[0].date;
        const endDate = weekPlans[6].date;
        
        const displayText = this.currentWeekOffset === 0 ? '本周' :
                           this.currentWeekOffset === 1 ? '下周' :
                           this.currentWeekOffset === -1 ? '上周' :
                           `${startDate} ~ ${endDate}`;
        
        document.getElementById('week-display').textContent = displayText;
    },

    renderPlannerGrid() {
        const grid = document.getElementById('planner-grid');
        const weekPlans = AppState.getWeekMealPlans(this.currentWeekOffset);

        grid.innerHTML = weekPlans.map(day => `
            <div class="planner-day ${day.isToday ? 'today' : ''}">
                <div class="planner-day-header">
                    ${day.dayName}<br>
                    <small>${day.date.slice(5)}</small>
                </div>
                <div class="planner-meal-slots">
                    ${this.renderMealSlot(day, 'breakfast', '🌅 早餐')}
                    ${this.renderMealSlot(day, 'lunch', '☀️ 午餐')}
                    ${this.renderMealSlot(day, 'dinner', '🌙 晚餐')}
                </div>
            </div>
        `).join('');
    },

    renderMealSlot(day, mealType, label) {
        const meal = day.plan[mealType];
        const icon = mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '☀️' : '🌙';
        
        if (!meal) {
            return `
                <div class="meal-slot ${mealType} empty" 
                     onclick="Modal.selectRecipeForMeal('${day.date}', '${mealType}')">
                    <span>${label}</span>
                    <button class="remove-meal" style="display: none;">×</button>
                </div>
            `;
        }

        const { recipe, servings } = meal;
        const factor = servings / recipe.servings;
        const calories = Math.round(recipe.nutrition.calories * factor);

        return `
            <div class="meal-slot ${mealType}" 
                 onclick="PlannerModule.viewMealDetail('${day.date}', '${mealType}')">
                <button class="remove-meal" onclick="event.stopPropagation(); PlannerModule.removeMeal('${day.date}', '${mealType}')">×</button>
                <div class="meal-name">${icon} ${recipe.name}</div>
                <div class="meal-calories">${calories} 千卡 · ${servings}人份</div>
            </div>
        `;
    },

    viewMealDetail(date, mealType) {
        const plan = AppState.getMealPlan(date);
        const meal = plan[mealType];
        if (meal) {
            Modal.recipeDetail(meal.recipe);
        }
    },

    removeMeal(date, mealType) {
        AppState.removeMeal(date, mealType);
        const mealTypeName = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[mealType];
        Toast.info(`已移除${mealTypeName}`);
        this.render();
    },

    renderDailySummary() {
        const today = new Date().toISOString().split('T')[0];
        const plan = AppState.getMealPlan(today);
        const nutrition = plan.getDailyNutrition();
        const goals = AppState.dietSettings.getAdjustedNutritionGoals();

        const nutrients = [
            { key: 'calories', label: '热量', unit: '千卡', color: 'calories' },
            { key: 'protein', label: '蛋白质', unit: '克', color: 'protein' },
            { key: 'fat', label: '脂肪', unit: '克', color: 'fat' },
            { key: 'carbs', label: '碳水化合物', unit: '克', color: 'carbs' }
        ];

        document.getElementById('nutrition-bars').innerHTML = nutrients.map(n => {
            const current = nutrition[n.key];
            const goal = goals[n.key];
            const percent = Math.min(100, Math.round((current / goal) * 100));
            
            return `
                <div class="nutrition-bar">
                    <div class="nutrition-bar-label">
                        <span class="name">${n.label}</span>
                        <span class="value">${current}${n.unit} / ${goal}${n.unit} (${percent}%)</span>
                    </div>
                    <div class="nutrition-bar-track">
                        <div class="nutrition-bar-fill ${n.color}" style="width: ${percent}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async generateSmartWeekPlan() {
        const weekPlans = AppState.getWeekMealPlans(this.currentWeekOffset);
        const goals = AppState.dietSettings.getAdjustedNutritionGoals();
        const forbidden = AppState.dietSettings.getAllForbiddenIngredients();

        let validRecipes = AppState.recipes.filter(recipe => {
            const validation = AppState.dietSettings.validateRecipe(recipe);
            return validation.isValid;
        });

        if (validRecipes.length === 0) {
            validRecipes = AppState.recipes;
            Toast.warning('没有符合饮食禁忌的食谱，将从所有食谱中推荐');
        }

        const mealTypeDistribution = {
            breakfast: 0.25,
            lunch: 0.35,
            dinner: 0.40
        };

        const usedRecipes = new Set();
        const changes = [];

        weekPlans.forEach(day => {
            if (day.isToday || day.date < new Date().toISOString().split('T')[0]) return;

            ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                if (day.plan[mealType]) return;

                const targetCalories = goals.calories * mealTypeDistribution[mealType];
                
                let candidates = validRecipes.filter(r => !usedRecipes.has(r.id));
                if (candidates.length === 0) {
                    usedRecipes.clear();
                    candidates = validRecipes;
                }

                candidates.sort((a, b) => {
                    const aDiff = Math.abs(a.nutrition.calories - targetCalories);
                    const bDiff = Math.abs(b.nutrition.calories - targetCalories);
                    return aDiff - bDiff;
                });

                if (candidates.length > 0) {
                    const selected = candidates[0];
                    usedRecipes.add(selected.id);
                    
                    let servings = 1;
                    const factor = targetCalories / selected.nutrition.calories;
                    if (factor > 1.5) servings = 2;
                    if (factor > 2.5) servings = 3;

                    AppState.setMeal(day.date, mealType, selected, servings);
                    changes.push(`${day.dayName} ${mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'}: ${selected.name}`);
                }
            });
        });

        if (changes.length > 0) {
            Toast.success(`已为您生成 ${changes.length} 餐的智能推荐`);
            this.render();
        } else {
            Toast.info('本周餐单已排满，无需添加新食谱');
        }
    }
};
