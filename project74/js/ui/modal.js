const Modal = {
    currentRecipeId: null,
    currentDate: null,
    currentMealType: null,

    open(content, options = {}) {
        const {
            title = '',
            footer = '',
            width = '600px',
            closeOnClick = true
        } = options;

        const modalHtml = `
            <div id="modal-overlay" class="modal-overlay" ${closeOnClick ? 'onclick="Modal.close()"' : ''}>
                <div class="modal-container" style="max-width: ${width};" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="Modal.close()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;

        const existing = document.getElementById('modal-overlay');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';

        const overlay = document.getElementById('modal-overlay');
        overlay.style.opacity = '0';
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        const container = overlay.querySelector('.modal-container');
        container.style.transform = 'scale(0.9) translateY(20px)';
        requestAnimationFrame(() => {
            container.style.transform = 'scale(1) translateY(0)';
        });
    },

    close() {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) return;

        overlay.style.opacity = '0';
        const container = overlay.querySelector('.modal-container');
        if (container) {
            container.style.transform = 'scale(0.9) translateY(20px)';
        }

        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 200);
    },

    recipeDetail(recipe) {
        const difficultyStars = {
            '简单': '⭐',
            '中等': '⭐⭐',
            '困难': '⭐⭐⭐'
        }[recipe.difficulty] || '';

        const nutrition = recipe.nutrition;
        
        const content = `
            <div class="recipe-detail">
                <div class="recipe-detail-header">
                    <div class="recipe-detail-icon">${recipe.icon}</div>
                    <div class="recipe-detail-info">
                        <h2 style="margin: 0 0 0.5rem 0;">${recipe.name}</h2>
                        <div class="recipe-meta">
                            <span>⏱️ ${recipe.totalTime}分钟</span>
                            <span>👥 ${recipe.servings}人份</span>
                            <span>📊 ${difficultyStars} ${recipe.difficulty}</span>
                        </div>
                        <div class="recipe-tags" style="margin-top: 0.5rem;">
                            ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="nutrition-grid">
                    <div class="nutrition-card">
                        <div class="nutrition-icon">🔥</div>
                        <div class="nutrition-data">
                            <span class="value">${nutrition.calories}</span>
                            <span class="label">千卡</span>
                        </div>
                    </div>
                    <div class="nutrition-card">
                        <div class="nutrition-icon">💪</div>
                        <div class="nutrition-data">
                            <span class="value">${nutrition.protein}g</span>
                            <span class="label">蛋白质</span>
                        </div>
                    </div>
                    <div class="nutrition-card">
                        <div class="nutrition-icon">🥑</div>
                        <div class="nutrition-data">
                            <span class="value">${nutrition.fat}g</span>
                            <span class="label">脂肪</span>
                        </div>
                    </div>
                    <div class="nutrition-card">
                        <div class="nutrition-icon">🍞</div>
                        <div class="nutrition-data">
                            <span class="value">${nutrition.carbs}g</span>
                            <span class="label">碳水</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>🥬 食材清单</h4>
                    <div class="ingredient-list">
                        ${recipe.ingredients.map(ing => `
                            <div class="ingredient-item">
                                <span class="ingredient-name">${ing.name}</span>
                                <span class="ingredient-amount">${ing.amount} ${ing.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>👨‍🍳 烹饪步骤</h4>
                    <div class="steps-list">
                        ${recipe.steps.map((step, idx) => `
                            <div class="step-item">
                                <span class="step-number">${idx + 1}</span>
                                <span class="step-instruction">
                                    ${step.instruction}
                                    ${step.timer > 0 ? `<span class="step-timer">⏱️ ${step.timer}分钟</span>` : ''}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${recipe.description ? `
                    <div class="detail-section">
                        <h4>📝 备注</h4>
                        <p style="color: var(--text-secondary); line-height: 1.6;">${recipe.description}</p>
                    </div>
                ` : ''}
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="Modal.close()">关闭</button>
            <button class="btn btn-secondary" onclick="RecipesModule.editRecipe('${recipe.id}'); Modal.close();">✏️ 编辑</button>
            <button class="btn btn-secondary" onclick="CookingModule.startCooking('${recipe.id}'); Modal.close(); showSection('cooking');">🍳 开始烹饪</button>
            <button class="btn btn-primary" onclick="Modal.addToMealPlanFromDetail('${recipe.id}')">📅 添加到餐单</button>
        `;

        this.open(content, {
            title: '食谱详情',
            footer,
            width: '700px'
        });
    },

    addToMealPlanFromDetail(recipeId) {
        const recipe = AppState.getRecipeById(recipeId);
        if (!recipe) return;

        this.currentRecipeId = recipeId;

        const today = new Date();
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            days.push({
                date: dateStr,
                dayName: i === 0 ? '今天' : i === 1 ? '明天' : dayNames[date.getDay()],
                dayNum: dateStr.slice(5)
            });
        }

        const mealTypes = [
            { id: 'breakfast', name: '🌅 早餐', icon: '🌅' },
            { id: 'lunch', name: '☀️ 午餐', icon: '☀️' },
            { id: 'dinner', name: '🌙 晚餐', icon: '🌙' }
        ];

        const content = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <h3 style="margin: 0.5rem 0;">${recipe.icon} ${recipe.name}</h3>
                <p style="color: var(--text-secondary); margin: 0;">选择添加到哪个餐次</p>
            </div>

            <div class="meal-selector">
                <div class="date-selector">
                    ${days.map((day, idx) => `
                        <button class="date-btn ${idx === 0 ? 'selected' : ''}" 
                                data-date="${day.date}"
                                onclick="Modal.selectDate('${day.date}')">
                            <div class="day-name">${day.dayName}</div>
                            <div class="day-num">${day.dayNum}</div>
                        </button>
                    `).join('')}
                </div>

                <div class="meal-type-selector">
                    ${mealTypes.map((mt, idx) => `
                        <button class="meal-type-btn ${idx === 0 ? 'selected' : ''}" 
                                data-meal="${mt.id}"
                                onclick="Modal.selectMealType('${mt.id}')">
                            ${mt.name}
                        </button>
                    `).join('')}
                </div>

                <div class="servings-selector" style="margin-top: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">份数：</label>
                    <div class="servings-control">
                        <button type="button" onclick="Modal.adjustServings(-1)">-</button>
                        <span id="modal-servings">${recipe.servings}</span>
                        <button type="button" onclick="Modal.adjustServings(1)">+</button>
                    </div>
                    <small style="color: var(--text-muted);">原食谱为 ${recipe.servings} 人份</small>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="Modal.close()">取消</button>
            <button class="btn btn-primary" onclick="Modal.confirmAddToMealPlan()">确认添加</button>
        `;

        this.open(content, {
            title: '添加到餐单',
            footer,
            width: '500px'
        });

        this.currentDate = days[0].date;
        this.currentMealType = 'breakfast';
    },

    selectDate(date) {
        this.currentDate = date;
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.date === date);
        });
    },

    selectMealType(mealType) {
        this.currentMealType = mealType;
        document.querySelectorAll('.meal-type-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.meal === mealType);
        });
    },

    adjustServings(delta) {
        const span = document.getElementById('modal-servings');
        let servings = parseInt(span.textContent) || 1;
        servings = Math.max(1, Math.min(10, servings + delta));
        span.textContent = servings;
    },

    confirmAddToMealPlan() {
        const recipe = AppState.getRecipeById(this.currentRecipeId);
        if (!recipe) return;

        const servings = parseInt(document.getElementById('modal-servings').textContent) || recipe.servings;
        
        AppState.setMeal(this.currentDate, this.currentMealType, recipe, servings);
        
        const mealTypeName = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[this.currentMealType];
        Toast.success(`已添加 ${recipe.name} 到 ${this.currentDate} ${mealTypeName}`);
        
        this.close();
        
        if (typeof PlannerModule !== 'undefined') {
            PlannerModule.render();
        }
    },

    selectRecipeForMeal(date, mealType) {
        this.currentDate = date;
        this.currentMealType = mealType;

        const mealTypeName = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[mealType];
        
        const recipes = AppState.recipes;
        
        if (recipes.length === 0) {
            const content = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📖</div>
                    <p>还没有创建任何食谱</p>
                    <button class="btn btn-primary" onclick="Modal.close(); Modal.addRecipe();">创建新食谱</button>
                </div>
            `;
            this.open(content, { title: `选择食谱 - ${mealTypeName}`, width: '500px' });
            return;
        }

        const forbidden = AppState.dietSettings.getAllForbiddenIngredients();

        const content = `
            <div style="margin-bottom: 1rem;">
                <input type="text" id="modal-recipe-search" 
                       placeholder="搜索食谱..." 
                       style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9375rem;"
                       oninput="Modal.filterRecipes('${forbidden.join(',')}')">
            </div>
            <div id="modal-recipe-list" style="max-height: 400px; overflow-y: auto;">
                ${recipes.map(r => {
                    const validation = AppState.dietSettings.validateRecipe(r);
                    const isForbidden = !validation.isValid;
                    
                    return `
                        <div class="modal-recipe-item ${isForbidden ? 'forbidden' : ''}" 
                             data-name="${r.name.toLowerCase()} ${r.tags.join(' ').toLowerCase()}"
                             onclick="${isForbidden ? '' : `Modal.confirmSelectRecipe('${r.id}')`}">
                            <div class="modal-recipe-icon">${r.icon}</div>
                            <div class="modal-recipe-info">
                                <div class="modal-recipe-name">
                                    ${r.name}
                                    ${isForbidden ? '<span class="forbidden-badge">⚠️ 含禁忌食材</span>' : ''}
                                </div>
                                <div class="modal-recipe-meta">
                                    <span>🔥 ${r.nutrition.calories}千卡</span>
                                    <span>⏱️ ${r.totalTime}分钟</span>
                                    <span>👥 ${r.servings}人份</span>
                                </div>
                                ${isForbidden ? `<div class="forbidden-reason">${validation.reasons.join(', ')}</div>` : ''}
                            </div>
                            ${isForbidden ? '' : '<div class="modal-recipe-arrow">→</div>'}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="Modal.close()">取消</button>
            <button class="btn btn-primary" onclick="Modal.close(); Modal.addRecipe();">+ 新建食谱</button>
        `;

        this.open(content, {
            title: `选择食谱 - ${mealTypeName}`,
            footer,
            width: '500px'
        });
    },

    filterRecipes(forbiddenStr) {
        const search = document.getElementById('modal-recipe-search').value.toLowerCase();
        const items = document.querySelectorAll('.modal-recipe-item');
        
        items.forEach(item => {
            const name = item.dataset.name;
            const forbidden = forbiddenStr ? forbiddenStr.split(',') : [];
            
            let shouldShow = name.includes(search);
            
            if (shouldShow && forbidden.length > 0) {
                const recipeName = item.querySelector('.modal-recipe-name').textContent.toLowerCase();
                const hasForbidden = forbidden.some(f => recipeName.includes(f.toLowerCase()));
            }
            
            item.style.display = shouldShow ? 'flex' : 'none';
        });
    },

    confirmSelectRecipe(recipeId) {
        const recipe = AppState.getRecipeById(recipeId);
        if (!recipe) return;

        this.currentRecipeId = recipeId;

        const content = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">${recipe.icon}</div>
                <h3 style="margin: 0.5rem 0;">${recipe.name}</h3>
                <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                    🔥 ${recipe.nutrition.calories}千卡 · ⏱️ ${recipe.totalTime}分钟 · 👥 ${recipe.servings}人份
                </div>
            </div>

            <div class="servings-selector" style="text-align: center;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">选择份数：</label>
                <div class="servings-control" style="justify-content: center; display: flex;">
                    <button type="button" onclick="Modal.adjustServings(-1)">-</button>
                    <span id="modal-servings" style="min-width: 60px; text-align: center; font-size: 1.25rem; font-weight: 600;">${recipe.servings}</span>
                    <button type="button" onclick="Modal.adjustServings(1)">+</button>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="Modal.selectRecipeForMeal('${this.currentDate}', '${this.currentMealType}')">返回</button>
            <button class="btn btn-primary" onclick="Modal.confirmAddToMealPlan()">确认添加</button>
        `;

        this.open(content, {
            title: '选择份数',
            footer,
            width: '400px'
        });
    },

    addRecipe(recipeId = null) {
        const isEdit = !!recipeId;
        let recipe = null;

        if (isEdit) {
            recipe = AppState.getRecipeById(recipeId);
            if (!recipe) return;
        }

        const content = `
            <form id="recipe-form" onsubmit="Modal.saveRecipe(event, ${isEdit ? `'${recipeId}'` : 'null'})">
                <div class="form-grid">
                    <div class="form-group">
                        <label>食谱名称 *</label>
                        <input type="text" name="name" value="${recipe?.name || ''}" required placeholder="例如：番茄炒蛋">
                    </div>
                    <div class="form-group">
                        <label>图标（表情符号）</label>
                        <input type="text" name="icon" value="${recipe?.icon || '🍽️'}" maxlength="4" placeholder="🍳">
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>烹饪时间（分钟）*</label>
                        <input type="number" name="totalTime" value="${recipe?.totalTime || 30}" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>份量（人份）*</label>
                        <input type="number" name="servings" value="${recipe?.servings || 2}" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>难度 *</label>
                        <select name="difficulty" required>
                            <option value="简单" ${recipe?.difficulty === '简单' ? 'selected' : ''}>⭐ 简单</option>
                            <option value="中等" ${recipe?.difficulty === '中等' ? 'selected' : ''}>⭐⭐ 中等</option>
                            <option value="困难" ${recipe?.difficulty === '困难' ? 'selected' : ''}>⭐⭐⭐ 困难</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>菜系</label>
                        <select name="cuisine">
                            <option value="">-- 选择菜系 --</option>
                            ${CATEGORIES.cuisines.map(c => `<option value="${c}" ${recipe?.cuisine === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>烹饪方式</label>
                        <select name="cookingMethod">
                            <option value="">-- 选择方式 --</option>
                            ${CATEGORIES.cookingMethods.map(c => `<option value="${c}" ${recipe?.cookingMethod === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>饮食类型</label>
                        <select name="dietType">
                            <option value="">-- 选择类型 --</option>
                            ${CATEGORIES.dietTypes.map(c => `<option value="${c}" ${recipe?.dietType === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>标签（用空格或逗号分隔）</label>
                    <input type="text" name="tags" value="${(recipe?.tags || []).join(', ')}" placeholder="快手, 下饭, 家常菜">
                </div>

                <div class="form-group">
                    <label>食材清单 *</label>
                    <div id="ingredients-container">
                        ${recipe ? recipe.ingredients.map((ing, idx) => this.renderIngredientRow(ing, idx)).join('') : this.renderIngredientRow(null, 0)}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="Modal.addIngredientRow()" style="margin-top: 0.5rem;">
                        + 添加食材
                    </button>
                </div>

                <div class="form-group">
                    <label>烹饪步骤 *</label>
                    <div id="steps-container">
                        ${recipe ? recipe.steps.map((step, idx) => this.renderStepRow(step, idx)).join('') : this.renderStepRow(null, 0)}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="Modal.addStepRow()" style="margin-top: 0.5rem;">
                        + 添加步骤
                    </button>
                </div>

                <div class="form-group">
                    <label>备注说明</label>
                    <textarea name="description" rows="3" placeholder="烹饪小贴士、食材替换建议等...">${recipe?.description || ''}</textarea>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="Modal.close()">取消</button>
            <button type="submit" form="recipe-form" class="btn btn-primary">${isEdit ? '保存修改' : '创建食谱'}</button>
        `;

        this.open(content, {
            title: isEdit ? '编辑食谱' : '添加新食谱',
            footer,
            width: '700px',
            closeOnClick: false
        });
    },

    renderIngredientRow(ingredient, index) {
        return `
            <div class="ingredient-row" data-idx="${index}">
                <input type="text" name="ingredient-name-${index}" placeholder="食材名称" value="${ingredient?.name || ''}" style="flex: 2;">
                <input type="text" name="ingredient-amount-${index}" placeholder="用量" value="${ingredient?.amount || ''}" style="flex: 1;">
                <input type="text" name="ingredient-unit-${index}" placeholder="单位" value="${ingredient?.unit || ''}" style="flex: 1;">
                <button type="button" class="remove-row" onclick="this.parentElement.remove()">×</button>
            </div>
        `;
    },

    renderStepRow(step, index) {
        return `
            <div class="step-row" data-idx="${index}">
                <div class="step-row-header">
                    <span class="step-num-badge">${index + 1}</span>
                    <input type="number" name="step-timer-${index}" placeholder="计时(分钟)" value="${step?.timer || 0}" min="0" style="width: 120px;">
                    <button type="button" class="remove-row" onclick="Modal.removeStepRow(this)">×</button>
                </div>
                <textarea name="step-instruction-${index}" rows="2" placeholder="步骤描述...">${step?.instruction || ''}</textarea>
            </div>
        `;
    },

    addIngredientRow() {
        const container = document.getElementById('ingredients-container');
        const rows = container.querySelectorAll('.ingredient-row');
        const newIdx = rows.length;
        container.insertAdjacentHTML('beforeend', this.renderIngredientRow(null, newIdx));
    },

    addStepRow() {
        const container = document.getElementById('steps-container');
        const rows = container.querySelectorAll('.step-row');
        const newIdx = rows.length;
        container.insertAdjacentHTML('beforeend', this.renderStepRow(null, newIdx));
        this.updateStepNumbers();
    },

    removeStepRow(btn) {
        const container = document.getElementById('steps-container');
        const rows = container.querySelectorAll('.step-row');
        if (rows.length <= 1) {
            Toast.warning('至少需要一个步骤');
            return;
        }
        btn.closest('.step-row').remove();
        this.updateStepNumbers();
    },

    updateStepNumbers() {
        const rows = document.querySelectorAll('#steps-container .step-row');
        rows.forEach((row, idx) => {
            row.querySelector('.step-num-badge').textContent = idx + 1;
            row.dataset.idx = idx;
        });
    },

    saveRecipe(event, recipeId) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const ingredientRows = form.querySelectorAll('.ingredient-row');
        const ingredients = [];
        
        for (let i = 0; i < ingredientRows.length; i++) {
            const name = formData.get(`ingredient-name-${i}`)?.trim();
            const amount = formData.get(`ingredient-amount-${i}`)?.trim();
            const unit = formData.get(`ingredient-unit-${i}`)?.trim();
            
            if (name && amount) {
                ingredients.push({
                    name,
                    amount: parseFloat(amount) || amount,
                    unit: unit || ''
                });
            }
        }

        if (ingredients.length === 0) {
            Toast.error('请至少添加一个食材');
            return;
        }

        const stepRows = form.querySelectorAll('.step-row');
        const steps = [];
        
        for (let i = 0; i < stepRows.length; i++) {
            const instruction = formData.get(`step-instruction-${i}`)?.trim();
            const timer = parseInt(formData.get(`step-timer-${i}`)) || 0;
            
            if (instruction) {
                steps.push({
                    instruction,
                    timer
                });
            }
        }

        if (steps.length === 0) {
            Toast.error('请至少添加一个步骤');
            return;
        }

        const tagsStr = formData.get('tags') || '';
        const tags = tagsStr.split(/[,，\s]+/).filter(t => t.trim());
        
        const categoryTags = [];
        const cuisine = formData.get('cuisine');
        const cookingMethod = formData.get('cookingMethod');
        const dietType = formData.get('dietType');
        
        if (cuisine) categoryTags.push(cuisine);
        if (cookingMethod) categoryTags.push(cookingMethod);
        if (dietType) categoryTags.push(dietType);
        
        const allTags = [...new Set([...categoryTags, ...tags])];

        const recipeData = {
            name: formData.get('name'),
            icon: formData.get('icon') || '🍽️',
            totalTime: parseInt(formData.get('totalTime')),
            servings: parseInt(formData.get('servings')),
            difficulty: formData.get('difficulty'),
            cuisine,
            cookingMethod,
            dietType,
            tags: allTags,
            ingredients,
            steps,
            description: formData.get('description') || ''
        };

        const nutrition = USDA_API.calculateRecipeNutrition(ingredients, recipeData.servings);
        recipeData.nutrition = nutrition;

        let recipe;
        if (recipeId) {
            recipe = AppState.updateRecipe(recipeId, recipeData);
            Toast.success('食谱已更新');
        } else {
            recipe = AppState.addRecipe(recipeData);
            Toast.success('食谱已创建');
        }

        this.close();
        
        if (typeof RecipesModule !== 'undefined') {
            RecipesModule.render();
        }
        if (typeof CookingModule !== 'undefined') {
            CookingModule.populateRecipeSelect();
        }
    },

    dietSettings() {
        const settings = AppState.dietSettings;

        const content = `
            <div class="diet-settings">
                <div class="diet-section">
                    <h4>🤧 过敏原</h4>
                    <div class="checkbox-grid">
                        ${COMMON_ALLERGENS.map(allergen => `
                            <label class="checkbox-item">
                                <input type="checkbox" value="${allergen}" 
                                    ${settings.allergies.includes(allergen) ? 'checked' : ''}
                                    onchange="Modal.updateDietSettings()">
                                <span>${allergen}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="diet-section">
                    <h4>🙏 宗教禁忌</h4>
                    <div class="checkbox-grid">
                        ${RELIGIOUS_RESTRICTIONS.map(r => `
                            <label class="checkbox-item">
                                <input type="checkbox" value="${r}" 
                                    ${settings.religious.includes(r) ? 'checked' : ''}
                                    onchange="Modal.updateDietSettings()">
                                <span>${r}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="diet-section">
                    <h4>💊 医疗禁忌</h4>
                    <div class="checkbox-grid">
                        ${MEDICAL_CONDITIONS.map(c => `
                            <label class="checkbox-item">
                                <input type="checkbox" value="${c}" 
                                    ${settings.medical.includes(c) ? 'checked' : ''}
                                    onchange="Modal.updateDietSettings()">
                                <span>${c}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="diet-section">
                    <h4>📝 自定义禁忌食材</h4>
                    <div class="custom-input-group">
                        <input type="text" id="custom-forbidden-input" placeholder="输入食材名称，按回车添加">
                        <button class="btn btn-primary btn-sm" onclick="Modal.addCustomForbidden()">添加</button>
                    </div>
                    <div id="custom-forbidden-list" style="margin-top: 0.75rem;">
                        ${settings.customForbidden.map(f => `
                            <span class="custom-tag">
                                ${f}
                                <button type="button" onclick="Modal.removeCustomForbidden('${f}')">×</button>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="diet-section">
                    <h4>👨‍👩‍👧‍👦 家庭成员配置</h4>
                    <div id="family-members-list">
                        ${settings.familyMembers.map(m => this.renderFamilyMember(m)).join('')}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 0.75rem;" onclick="Modal.addFamilyMember()">
                        + 添加成员
                    </button>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-primary" onclick="Modal.close()">确定</button>
        `;

        this.open(content, {
            title: '饮食禁忌设置',
            footer,
            width: '650px',
            closeOnClick: false
        });
    },

    renderFamilyMember(member) {
        return `
            <div class="family-member-card" data-id="${member.id}">
                <div class="family-member-header">
                    <input type="text" class="member-name-input" value="${member.name}" 
                           placeholder="成员名称" onchange="Modal.updateFamilyMember('${member.id}')">
                    <button type="button" class="remove-member" onclick="Modal.removeFamilyMember('${member.id}')">×</button>
                </div>
                <div class="family-member-settings">
                    <label class="small-label">热量目标</label>
                    <div class="multiplier-group">
                        <input type="number" class="calorie-goal-input" value="${member.calorieGoal}" min="1000" max="5000"
                               onchange="Modal.updateFamilyMember('${member.id}')">
                        <span>千卡/天</span>
                    </div>
                    <div class="member-tags">
                        ${COMMON_ALLERGENS.slice(0, 4).map(a => `
                            <label class="mini-checkbox">
                                <input type="checkbox" value="${a}" 
                                    ${member.allergies.includes(a) ? 'checked' : ''}
                                    onchange="Modal.updateFamilyMember('${member.id}')">
                                <span>${a}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    addFamilyMember() {
        const id = 'member-' + Date.now();
        const member = {
            id,
            name: '新成员',
            calorieGoal: 2000,
            allergies: []
        };
        AppState.dietSettings.familyMembers.push(member);
        AppState.saveToStorage();
        this.dietSettings();
    },

    updateFamilyMember(memberId) {
        const card = document.querySelector(`.family-member-card[data-id="${memberId}"]`);
        if (!card) return;

        const member = AppState.dietSettings.familyMembers.find(m => m.id === memberId);
        if (!member) return;

        member.name = card.querySelector('.member-name-input').value || '成员';
        member.calorieGoal = parseInt(card.querySelector('.calorie-goal-input').value) || 2000;
        
        const allergies = [];
        card.querySelectorAll('.mini-checkbox input:checked').forEach(cb => {
            allergies.push(cb.value);
        });
        member.allergies = allergies;

        AppState.saveToStorage();
    },

    removeFamilyMember(memberId) {
        AppState.dietSettings.familyMembers = AppState.dietSettings.familyMembers.filter(m => m.id !== memberId);
        AppState.saveToStorage();
        this.dietSettings();
    },

    addCustomForbidden() {
        const input = document.getElementById('custom-forbidden-input');
        const value = input.value.trim();
        
        if (!value) {
            Toast.error('请输入食材名称');
            return;
        }

        if (!AppState.dietSettings.customForbidden.includes(value)) {
            AppState.dietSettings.customForbidden.push(value);
            AppState.saveToStorage();
            Toast.success(`已添加 ${value} 到禁忌清单`);
        }
        
        input.value = '';
        this.dietSettings();
    },

    removeCustomForbidden(value) {
        AppState.dietSettings.customForbidden = AppState.dietSettings.customForbidden.filter(f => f !== value);
        AppState.saveToStorage();
        this.dietSettings();
    },

    updateDietSettings() {
        const modal = document.getElementById('modal-overlay');
        if (!modal) return;

        const settings = AppState.dietSettings;

        const allergyCheckboxes = modal.querySelectorAll('.diet-section:nth-child(1) input[type="checkbox"]');
        settings.allergies = [];
        allergyCheckboxes.forEach(cb => {
            if (cb.checked) settings.allergies.push(cb.value);
        });

        const religiousCheckboxes = modal.querySelectorAll('.diet-section:nth-child(2) input[type="checkbox"]');
        settings.religious = [];
        religiousCheckboxes.forEach(cb => {
            if (cb.checked) settings.religious.push(cb.value);
        });

        const medicalCheckboxes = modal.querySelectorAll('.diet-section:nth-child(3) input[type="checkbox"]');
        settings.medical = [];
        medicalCheckboxes.forEach(cb => {
            if (cb.checked) settings.medical.push(cb.value);
        });

        AppState.saveToStorage();
        
        if (typeof PlannerModule !== 'undefined') {
            PlannerModule.renderDailySummary();
        }
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('modal-overlay')) {
        Modal.close();
    }
});
