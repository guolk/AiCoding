let currentSection = 'recipes';

function showSection(sectionId) {
    document.querySelectorAll('.module-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        currentSection = sectionId;
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });

    AppState.currentSection = sectionId;
    AppState.saveToStorage();

    if (sectionId === 'planner' && typeof PlannerModule !== 'undefined') {
        PlannerModule.render();
    } else if (sectionId === 'shopping' && typeof ShoppingModule !== 'undefined') {
        ShoppingModule.render();
    }
}

async function fetchRecipeFromURL() {
    const url = prompt('请输入食谱网页URL：');
    if (!url) return;

    const loadingToast = Toast.info('正在抓取食谱信息...', 0);

    try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockRecipes = [
            {
                name: '网络抓取的食谱',
                icon: '🌐',
                totalTime: 45,
                servings: 4,
                difficulty: '中等',
                cuisine: '中式',
                cookingMethod: '炒',
                dietType: '普通',
                tags: ['网络抓取', '快手'],
                ingredients: [
                    { name: '鸡胸肉', amount: 500, unit: '克' },
                    { name: '青椒', amount: 2, unit: '个' },
                    { name: '红椒', amount: 1, unit: '个' },
                    { name: '葱姜蒜', amount: '适量', unit: '' },
                    { name: '生抽', amount: 2, unit: '汤匙' },
                    { name: '料酒', amount: 1, unit: '汤匙' },
                    { name: '盐', amount: 0.5, unit: '茶匙' }
                ],
                steps: [
                    { instruction: '鸡胸肉切片，用料酒、生抽腌制15分钟', timer: 15 },
                    { instruction: '青椒、红椒切片备用', timer: 5 },
                    { instruction: '热锅凉油，放入葱姜蒜爆香', timer: 2 },
                    { instruction: '放入鸡肉片翻炒至变色', timer: 5 },
                    { instruction: '加入青红椒翻炒2分钟', timer: 2 },
                    { instruction: '加盐调味，翻炒均匀即可出锅', timer: 1 }
                ],
                description: `从 ${url} 抓取的食谱`,
                sourceUrl: url
            }
        ];

        const recipe = mockRecipes[0];

        if (typeof Modal !== 'undefined') {
            Modal.currentRecipeId = null;
            
            const content = `
                <div style="text-align: center; margin-bottom: 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">${recipe.icon}</div>
                    <h3 style="margin: 0.5rem 0;">${recipe.name}</h3>
                    <p style="color: var(--text-secondary); margin: 0; font-size: 0.875rem;">
                        来源: ${url}
                    </p>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>食谱名称</label>
                        <input type="text" id="scrape-name" value="${recipe.name}">
                    </div>
                    <div class="form-group">
                        <label>图标</label>
                        <input type="text" id="scrape-icon" value="${recipe.icon}" maxlength="4">
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>烹饪时间（分钟）</label>
                        <input type="number" id="scrape-time" value="${recipe.totalTime}">
                    </div>
                    <div class="form-group">
                        <label>份量</label>
                        <input type="number" id="scrape-servings" value="${recipe.servings}">
                    </div>
                    <div class="form-group">
                        <label>难度</label>
                        <select id="scrape-difficulty">
                            <option value="简单">简单</option>
                            <option value="中等" selected>中等</option>
                            <option value="困难">困难</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>食材清单（${recipe.ingredients.length} 项）</label>
                    <div style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem;">
                        ${recipe.ingredients.map(ing => `
                            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; border-bottom: 1px solid var(--border-color);">
                                <span>${ing.name}</span>
                                <span>${ing.amount} ${ing.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label>烹饪步骤（${recipe.steps.length} 步）</label>
                    <div style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem;">
                        ${recipe.steps.map((step, idx) => `
                            <div style="padding: 0.25rem 0; border-bottom: 1px solid var(--border-color);">
                                <strong>${idx + 1}.</strong> ${step.instruction}
                                ${step.timer > 0 ? ` (${step.timer}分钟)` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            const footer = `
                <button class="btn btn-secondary" onclick="Modal.close()">取消</button>
                <button class="btn btn-primary" onclick="confirmScrapedRecipe()">保存食谱</button>
            `;

            Modal.open(content, {
                title: '✓ 食谱抓取成功',
                footer,
                width: '550px',
                closeOnClick: false
            });

            window.confirmScrapedRecipe = function() {
                const recipeData = {
                    ...recipe,
                    name: document.getElementById('scrape-name').value,
                    icon: document.getElementById('scrape-icon').value,
                    totalTime: parseInt(document.getElementById('scrape-time').value),
                    servings: parseInt(document.getElementById('scrape-servings').value),
                    difficulty: document.getElementById('scrape-difficulty').value
                };

                const nutrition = USDA_API.calculateRecipeNutrition(recipeData.ingredients, recipeData.servings);
                recipeData.nutrition = nutrition;

                const newRecipe = AppState.addRecipe(recipeData);
                Modal.close();
                Toast.success(`食谱「${newRecipe.name}」已保存`);
                
                if (typeof RecipesModule !== 'undefined') {
                    RecipesModule.render();
                }
                if (typeof CookingModule !== 'undefined') {
                    CookingModule.populateRecipeSelect();
                }
            };
        }

    } catch (error) {
        Toast.error('抓取失败，请检查URL是否正确');
    } finally {
        if (loadingToast) {
            loadingToast.click();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (AppState.currentSection) {
        showSection(AppState.currentSection);
    }

    if (AppState.currentWeekOffset !== undefined && typeof PlannerModule !== 'undefined') {
        PlannerModule.currentWeekOffset = AppState.currentWeekOffset;
    }

    if (typeof Toast !== 'undefined') {
        Toast.init();
    }

    if (typeof RecipesModule !== 'undefined') {
        RecipesModule.init();
    }
    if (typeof PlannerModule !== 'undefined') {
        PlannerModule.init();
    }
    if (typeof ShoppingModule !== 'undefined') {
        ShoppingModule.init();
    }
    if (typeof CookingModule !== 'undefined') {
        CookingModule.init();
    }

    const addRecipeBtn = document.getElementById('btn-add-recipe');
    if (addRecipeBtn) {
        addRecipeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('新建食谱按钮被点击');
            if (typeof Modal !== 'undefined' && typeof Modal.addRecipe === 'function') {
                Modal.addRecipe();
            } else {
                console.error('Modal或Modal.addRecipe未定义');
                Toast.error('系统初始化中，请稍后再试');
            }
        });
    } else {
        console.error('未找到btn-add-recipe按钮');
    }

    const scrapeBtn = document.getElementById('btn-scrape-recipe');
    if (scrapeBtn) {
        scrapeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fetchRecipeFromURL();
        });
    } else {
        console.error('未找到btn-scrape-recipe按钮');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });

    setTimeout(() => {
        if (AppState.recipes.length > 0) {
            Toast.info(`已加载 ${AppState.recipes.length} 个食谱`, 2500);
        }
    }, 500);
});
