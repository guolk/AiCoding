const RecipesModule = {
    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const recipeSearch = document.getElementById('recipe-search');
        if (recipeSearch) {
            recipeSearch.addEventListener('input', (e) => {
                AppState.setFilter('search', e.target.value);
                this.render();
            });
        }

        this.bindFilterEvents();
    },

    bindFilterEvents() {
        const renderFilters = () => {
            const cuisineFilters = document.getElementById('cuisine-filters');
            const cookingMethodFilters = document.getElementById('cooking-method-filters');
            const dietTypeFilters = document.getElementById('diet-type-filters');
            const difficultyFilters = document.getElementById('difficulty-filters');
            const tagCloud = document.getElementById('tag-cloud');

            if (cuisineFilters) {
                cuisineFilters.innerHTML = CATEGORIES.cuisines.map(cuisine => `
                    <span class="filter-option ${AppState.filters.cuisine === cuisine ? 'active' : ''}" 
                          onclick="RecipesModule.setFilter('cuisine', '${cuisine}')">
                        ${cuisine}
                    </span>
                `).join('');
            }

            if (cookingMethodFilters) {
                cookingMethodFilters.innerHTML = CATEGORIES.cookingMethods.map(method => `
                    <span class="filter-option ${AppState.filters.cookingMethod === method ? 'active' : ''}" 
                          onclick="RecipesModule.setFilter('cookingMethod', '${method}')">
                        ${method}
                    </span>
                `).join('');
            }

            if (dietTypeFilters) {
                dietTypeFilters.innerHTML = CATEGORIES.dietTypes.map(type => `
                    <span class="filter-option ${AppState.filters.dietType === type ? 'active' : ''}" 
                          onclick="RecipesModule.setFilter('dietType', '${type}')">
                        ${type}
                    </span>
                `).join('');
            }

            if (difficultyFilters) {
                difficultyFilters.innerHTML = CATEGORIES.difficulties.map(diff => `
                    <span class="filter-option ${AppState.filters.difficulty === diff ? 'active' : ''}" 
                          onclick="RecipesModule.setFilter('difficulty', '${diff}')">
                        ${diff}
                    </span>
                `).join('');
            }

            if (tagCloud) {
                const tags = AppState.getAllTags();
                tagCloud.innerHTML = tags.map(tag => `
                    <span class="tag ${AppState.filters.tags.includes(tag) ? 'active' : ''}" 
                          onclick="RecipesModule.toggleTag('${tag}')">
                        ${tag}
                    </span>
                `).join('');
            }
        };

        renderFilters();
    },

    setFilter(type, value) {
        if (AppState.filters[type] === value) {
            AppState.setFilter(type, null);
        } else {
            AppState.setFilter(type, value);
        }
        this.render();
        this.bindFilterEvents();
    },

    toggleTag(tag) {
        AppState.toggleTagFilter(tag);
        this.render();
        this.bindFilterEvents();
    },

    render() {
        const grid = document.getElementById('recipes-grid');
        const recipes = AppState.getFilteredRecipes();

        if (recipes.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🍽️</div>
                    <div class="empty-state-text">暂无食谱</div>
                    <div class="empty-state-hint">点击"新增食谱"添加您的第一个食谱，或调整筛选条件</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = recipes.map(recipe => this.renderRecipeCard(recipe)).join('');
    },

    renderRecipeCard(recipe) {
        const difficultyClass = `difficulty-${recipe.difficulty.toLowerCase()}`;
        const difficultyText = {
            '简单': '⭐ 简单',
            '中等': '⭐⭐ 中等',
            '困难': '⭐⭐⭐ 困难'
        }[recipe.difficulty] || recipe.difficulty;

        return `
            <div class="recipe-card" onclick="RecipesModule.viewRecipe('${recipe.id}')">
                <div class="recipe-image">
                    ${recipe.icon}
                    <span class="recipe-difficulty ${difficultyClass}">${difficultyText}</span>
                </div>
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.totalTime}分钟</span>
                        <span>👥 ${recipe.servings}人份</span>
                    </div>
                    <div class="recipe-nutrition">
                        <div class="nutrition-item">
                            <div class="nutrition-value">${recipe.nutrition.calories}</div>
                            <div class="nutrition-label">千卡</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${recipe.nutrition.protein}g</div>
                            <div class="nutrition-label">蛋白质</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${recipe.nutrition.fat}g</div>
                            <div class="nutrition-label">脂肪</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${recipe.nutrition.carbs}g</div>
                            <div class="nutrition-label">碳水</div>
                        </div>
                    </div>
                    <div class="recipe-tags">
                        ${recipe.tags.slice(0, 3).map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        ${recipe.tags.length > 3 ? `<span class="recipe-tag">+${recipe.tags.length - 3}</span>` : ''}
                    </div>
                </div>
                <div class="recipe-card-actions" onclick="event.stopPropagation()">
                    <button class="card-action-btn" title="添加到餐单" onclick="RecipesModule.addToMealPlan('${recipe.id}')">
                        📅
                    </button>
                    <button class="card-action-btn" title="编辑" onclick="RecipesModule.editRecipe('${recipe.id}')">
                        ✏️
                    </button>
                    <button class="card-action-btn" title="删除" onclick="RecipesModule.deleteRecipe('${recipe.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },

    viewRecipe(id) {
        const recipe = AppState.getRecipeById(id);
        if (recipe) {
            Modal.recipeDetail(recipe);
        }
    },

    editRecipe(id) {
        const recipe = AppState.getRecipeById(id);
        if (recipe) {
            Modal.addRecipe(id);
        }
    },

    deleteRecipe(id) {
        const recipe = AppState.getRecipeById(id);
        if (!recipe) return;

        const content = `
            <p>确定要删除食谱「${recipe.name}」吗？</p>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                此操作无法撤销，相关的餐饮计划也会受到影响
            </p>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="Modal.close()">取消</button>
            <button class="btn btn-primary" style="background: var(--danger-color);" onclick="RecipesModule.confirmDelete('${id}')">删除</button>
        `;

        Modal.open(content, { title: '确认删除', footer, width: '400px' });
    },

    confirmDelete(id) {
        AppState.deleteRecipe(id);
        Modal.close();
        Toast.success('食谱已删除');
        this.render();
        
        if (typeof CookingModule !== 'undefined') {
            CookingModule.populateRecipeSelect();
        }
    },

    addToMealPlan(recipeId) {
        const recipe = AppState.getRecipeById(recipeId);
        if (recipe) {
            Modal.addToMealPlanFromDetail(recipeId);
        }
    },

    async calculateNutrition(recipeId) {
        const recipe = AppState.getRecipeById(recipeId);
        if (!recipe) return;

        Toast.info('正在从USDA数据库获取营养数据...');
        
        try {
            const nutrition = await recipe.fetchNutritionFromUSDA();
            AppState.updateRecipe(recipeId, { nutrition });
            Toast.success('营养数据已更新');
            this.render();
        } catch (error) {
            Toast.error('获取营养数据失败');
        }
    }
};
