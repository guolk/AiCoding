const CookingModule = {
    currentRecipe: null,
    currentStep: 0,
    servings: 1,
    originalServings: 1,
    timers: [],
    voiceControl: false,
    fullscreen: false,
    speechSynthesis: null,
    speechRecognition: null,

    init() {
        this.bindEvents();
        this.populateRecipeSelect();
        this.initSpeech();
    },

    initSpeech() {
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
        }
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'zh-CN';
            
            this.speechRecognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                this.handleVoiceCommand(command);
            };
        }
    },

    handleVoiceCommand(command) {
        console.log('Voice command:', command);
        
        if (command.includes('下一步') || command.includes('下一个') || command.includes('继续')) {
            this.nextStep();
            Toast.info('执行：下一步');
        } else if (command.includes('上一步') || command.includes('上一个') || command.includes('返回')) {
            this.prevStep();
            Toast.info('执行：上一步');
        } else if (command.includes('开始计时') || command.includes('启动计时')) {
            this.startTimer();
            Toast.info('执行：开始计时');
        } else if (command.includes('暂停计时') || command.includes('停止计时')) {
            this.pauseTimer();
            Toast.info('执行：暂停计时');
        } else if (command.includes('重置计时') || command.includes('重新计时')) {
            this.resetTimer();
            Toast.info('执行：重置计时');
        } else if (command.includes('朗读') || command.includes('阅读') || command.includes('读出来')) {
            this.readCurrentStep();
            Toast.info('执行：朗读步骤');
        } else if (command.includes('全屏') || command.includes('进入全屏')) {
            this.enterFullscreen();
            Toast.info('执行：进入全屏');
        } else if (command.includes('退出全屏') || command.includes('关闭全屏')) {
            this.exitFullscreen();
            Toast.info('执行：退出全屏');
        }
    },

    bindEvents() {
        document.getElementById('cooking-recipe-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.startCooking(e.target.value);
            }
        });

        document.getElementById('decrease-servings').addEventListener('click', () => {
            if (this.servings > 1) {
                this.servings--;
                this.updateServingsDisplay();
            }
        });

        document.getElementById('increase-servings').addEventListener('click', () => {
            if (this.servings < 10) {
                this.servings++;
                this.updateServingsDisplay();
            }
        });

        document.getElementById('prev-step').addEventListener('click', () => this.prevStep());
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('btn-fullscreen').addEventListener('click', () => this.enterFullscreen());
        document.getElementById('btn-voice-control').addEventListener('click', () => this.toggleVoiceControl());

        document.getElementById('exit-fullscreen').addEventListener('click', () => this.exitFullscreen());
        document.getElementById('fs-prev-step').addEventListener('click', () => this.prevStep());
        document.getElementById('fs-next-step').addEventListener('click', () => this.nextStep());

        document.addEventListener('keydown', (e) => {
            if (!this.currentRecipe) return;
            
            if (e.key === 'ArrowRight') {
                this.nextStep();
            } else if (e.key === 'ArrowLeft') {
                this.prevStep();
            } else if (e.key === 'Escape' && this.fullscreen) {
                this.exitFullscreen();
            } else if (e.key === 'f' || e.key === 'F') {
                if (this.fullscreen) {
                    this.exitFullscreen();
                } else {
                    this.enterFullscreen();
                }
            }
        });
    },

    populateRecipeSelect() {
        const select = document.getElementById('cooking-recipe-select');
        select.innerHTML = '<option value="">-- 请选择食谱 --</option>' +
            AppState.recipes.map(r => `<option value="${r.id}">${r.icon} ${r.name}</option>`).join('');
    },

    startCooking(recipeId) {
        const recipe = AppState.getRecipeById(recipeId);
        if (!recipe) return;

        this.currentRecipe = recipe;
        this.currentStep = 0;
        this.servings = recipe.servings;
        this.originalServings = recipe.servings;
        this.clearAllTimers();

        document.getElementById('cooking-content').style.display = 'grid';
        document.getElementById('cooking-recipe-select').value = recipeId;

        this.updateServingsDisplay();
        this.renderIngredients();
        this.renderSteps();
        this.checkMissingIngredients();
    },

    updateServingsDisplay() {
        document.getElementById('current-servings').textContent = this.servings;
        document.getElementById('servings-badge').textContent = `(${this.servings}人份)`;
        
        if (this.currentRecipe) {
            this.renderIngredients();
        }
    },

    getScaledIngredients() {
        if (!this.currentRecipe) return [];
        return this.currentRecipe.scaleIngredients(this.servings);
    },

    renderIngredients() {
        const container = document.getElementById('cooking-ingredients');
        const ingredients = this.getScaledIngredients();

        container.innerHTML = ingredients.map(ing => {
            const isMissing = !AppState.inventory.hasIngredient(ing.name);
            return `
                <div class="ingredient-row ${isMissing ? 'missing' : ''}">
                    <span class="ingredient-name">${ing.name}</span>
                    <span class="ingredient-amount">${ing.amount}${ing.unit}</span>
                </div>
            `;
        }).join('');
    },

    checkMissingIngredients() {
        const ingredients = this.getScaledIngredients();
        const missing = ingredients.filter(ing => !AppState.inventory.hasIngredient(ing.name));
        
        if (missing.length > 0) {
            const substitutions = this.currentRecipe.getSubstitutions(missing);
            this.renderSubstitutions(substitutions);
        } else {
            document.getElementById('substitutions-section').innerHTML = '';
        }
    },

    renderSubstitutions(substitutions) {
        const container = document.getElementById('substitutions-section');
        
        if (substitutions.length === 0) {
            container.innerHTML = `
                <h4>⚠️ 缺少以下食材</h4>
                <p style="font-size: 0.875rem; color: var(--text-secondary);">
                    暂无推荐的替代食材，请考虑购买或调整食谱
                </p>
            `;
            return;
        }

        container.innerHTML = `
            <h4>💡 食材替代建议</h4>
            ${substitutions.map(sub => `
                <div class="substitution-item">
                    <span class="original">${sub.original} (${sub.originalAmount})</span>
                    <span class="arrow">→</span>
                    <span class="replacement">${sub.replacements.join(' / ')}</span>
                </div>
            `).join('')}
        `;
    },

    renderSteps() {
        document.getElementById('total-steps').textContent = this.currentRecipe.steps.length;
        document.getElementById('fs-total-steps').textContent = this.currentRecipe.steps.length;
        this.renderCurrentStep();
    },

    renderCurrentStep() {
        const step = this.currentRecipe.steps[this.currentStep];
        const stepNum = this.currentStep + 1;

        document.getElementById('current-step-num').textContent = stepNum;
        document.getElementById('fs-current-step').textContent = stepNum;

        const stepContent = `
            <span class="step-number">${stepNum}</span>
            <span class="step-text">${step.instruction}</span>
        `;

        document.getElementById('step-content').innerHTML = stepContent;
        document.getElementById('fullscreen-step').innerHTML = stepContent;
        document.getElementById('fullscreen-recipe-title').textContent = this.currentRecipe.name;

        this.renderTimer(step.timer);
    },

    renderTimer(minutes) {
        const container = document.getElementById('timer-section');
        const fsContainer = document.getElementById('fullscreen-timer');

        if (minutes <= 0) {
            container.innerHTML = '';
            fsContainer.innerHTML = '';
            return;
        }

        const totalSeconds = minutes * 60;
        const timerId = `timer-${this.currentStep}`;
        
        let timer = this.timers.find(t => t.id === timerId);
        if (!timer) {
            timer = {
                id: timerId,
                totalSeconds,
                remainingSeconds: totalSeconds,
                interval: null,
                running: false
            };
            this.timers.push(timer);
        }

        const timerHtml = (fullscreen = false) => `
            <div class="timer-display" id="${fullscreen ? 'fs-' : ''}timer-display-${timerId}">
                ${this.formatTime(timer.remainingSeconds)}
            </div>
            <div class="timer-controls">
                <button class="btn btn-secondary" onclick="CookingModule.startTimer('${timerId}')">▶️ 开始</button>
                <button class="btn btn-secondary" onclick="CookingModule.pauseTimer('${timerId}')">⏸️ 暂停</button>
                <button class="btn btn-secondary" onclick="CookingModule.resetTimer('${timerId}')">🔄 重置</button>
            </div>
        `;

        container.innerHTML = timerHtml(false);
        fsContainer.innerHTML = timerHtml(true);
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    startTimer(timerId = null) {
        const id = timerId || `timer-${this.currentStep}`;
        const timer = this.timers.find(t => t.id === id);
        
        if (!timer || timer.running) return;

        timer.running = true;
        timer.interval = setInterval(() => {
            timer.remainingSeconds--;
            
            const display = document.getElementById(`timer-display-${id}`);
            const fsDisplay = document.getElementById(`fs-timer-display-${id}`);
            
            if (display) display.textContent = this.formatTime(timer.remainingSeconds);
            if (fsDisplay) fsDisplay.textContent = this.formatTime(timer.remainingSeconds);

            if (timer.remainingSeconds <= 0) {
                this.pauseTimer(id);
                this.timerFinished();
            }
        }, 1000);
    },

    pauseTimer(timerId = null) {
        const id = timerId || `timer-${this.currentStep}`;
        const timer = this.timers.find(t => t.id === id);
        
        if (!timer) return;

        timer.running = false;
        if (timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
        }
    },

    resetTimer(timerId = null) {
        const id = timerId || `timer-${this.currentStep}`;
        const timer = this.timers.find(t => t.id === id);
        
        if (!timer) return;

        this.pauseTimer(id);
        timer.remainingSeconds = timer.totalSeconds;
        
        const display = document.getElementById(`timer-display-${id}`);
        const fsDisplay = document.getElementById(`fs-timer-display-${id}`);
        
        if (display) display.textContent = this.formatTime(timer.remainingSeconds);
        if (fsDisplay) fsDisplay.textContent = this.formatTime(timer.remainingSeconds);
    },

    timerFinished() {
        Toast.success('⏰ 计时结束！', 5000);
        
        if (this.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('计时结束，请进行下一步操作');
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            this.speechSynthesis.speak(utterance);
        }

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('烹饪计时器', {
                body: '计时结束！请进行下一步操作',
                icon: '🍳'
            });
        }
    },

    clearAllTimers() {
        this.timers.forEach(timer => {
            if (timer.interval) {
                clearInterval(timer.interval);
            }
        });
        this.timers = [];
    },

    prevStep() {
        if (this.currentStep > 0) {
            this.pauseTimer();
            this.currentStep--;
            this.renderCurrentStep();
        }
    },

    nextStep() {
        if (this.currentStep < this.currentRecipe.steps.length - 1) {
            this.pauseTimer();
            this.currentStep++;
            this.renderCurrentStep();
        } else {
            Toast.success('🎉 恭喜！您已完成所有烹饪步骤！');
        }
    },

    enterFullscreen() {
        if (!this.currentRecipe) return;
        
        this.fullscreen = true;
        document.getElementById('fullscreen-cooking').classList.remove('hidden');
        AppState.cookingState.fullscreen = true;
        
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    exitFullscreen() {
        this.fullscreen = false;
        document.getElementById('fullscreen-cooking').classList.add('hidden');
        AppState.cookingState.fullscreen = false;
    },

    toggleVoiceControl() {
        if (!this.speechRecognition) {
            Toast.warning('您的浏览器不支持语音识别功能');
            return;
        }

        this.voiceControl = !this.voiceControl;
        
        if (this.voiceControl) {
            this.speechRecognition.start();
            Toast.success('语音控制已开启，您可以说"下一步"、"上一步"等指令');
        } else {
            this.speechRecognition.stop();
            Toast.info('语音控制已关闭');
        }

        const btn = document.getElementById('btn-voice-control');
        btn.style.background = this.voiceControl ? 'var(--primary-color)' : '';
        btn.style.color = this.voiceControl ? 'white' : '';
    },

    readCurrentStep() {
        if (!this.speechSynthesis || !this.currentRecipe) return;

        const step = this.currentRecipe.steps[this.currentStep];
        const utterance = new SpeechSynthesisUtterance(`步骤${this.currentStep + 1}：${step.instruction}`);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        
        this.speechSynthesis.cancel();
        this.speechSynthesis.speak(utterance);
    }
};
