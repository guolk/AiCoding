class PuzzleGame {
    constructor() {
        this.gridSize = 4;
        this.pieces = [];
        this.solution = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.isSolving = false;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.originalImage = null;
        this.pieceWidth = 0;
        this.pieceHeight = 0;
        this.draggedPiece = null;
        this.shapeType = 'rectangle';
        
        this.initElements();
        this.initEventListeners();
    }
    
    initElements() {
        this.imageInput = document.getElementById('imageInput');
        this.gridSizeInput = document.getElementById('gridSize');
        this.gridSizeValue = document.getElementById('gridSizeValue');
        this.shapeTypeSelect = document.getElementById('shapeType');
        this.startBtn = document.getElementById('startBtn');
        this.viewOriginalBtn = document.getElementById('viewOriginalBtn');
        this.autoSolveBtn = document.getElementById('autoSolveBtn');
        this.puzzleGrid = document.getElementById('puzzleGrid');
        this.originalImage = document.getElementById('originalImage');
        this.originalImageContainer = document.getElementById('originalImageContainer');
        this.originalOverlay = document.getElementById('originalOverlay');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.movesDisplay = document.getElementById('movesDisplay');
        this.completedDisplay = document.getElementById('completedDisplay');
        this.celebrationModal = document.getElementById('celebrationModal');
        this.finalTime = document.getElementById('finalTime');
        this.finalMoves = document.getElementById('finalMoves');
        this.finalGridSize = document.getElementById('finalGridSize');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.solutionSteps = document.getElementById('solutionSteps');
        this.stepsList = document.getElementById('stepsList');
        this.errorMessage = document.getElementById('errorMessage');
    }
    
    initEventListeners() {
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.gridSizeInput.addEventListener('input', (e) => this.handleGridSizeChange(e));
        this.shapeTypeSelect.addEventListener('change', (e) => this.handleShapeTypeChange(e));
        this.startBtn.addEventListener('click', () => this.startGame());
        this.viewOriginalBtn.addEventListener('mousedown', () => this.showOriginal());
        this.viewOriginalBtn.addEventListener('mouseup', () => this.hideOriginal());
        this.viewOriginalBtn.addEventListener('mouseleave', () => this.hideOriginal());
        this.viewOriginalBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.showOriginal();
        });
        this.viewOriginalBtn.addEventListener('touchend', () => this.hideOriginal());
        this.autoSolveBtn.addEventListener('click', () => this.autoSolve());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        this.puzzleGrid.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.puzzleGrid.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.puzzleGrid.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.puzzleGrid.addEventListener('drop', (e) => this.handleDrop(e));
    }
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showError('请上传有效的图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage.src = event.target.result;
                this.originalImageContainer.style.display = 'block';
                this.originalOverlay.style.backgroundImage = `url(${event.target.result})`;
                this.startBtn.disabled = false;
                this.hideError();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    handleGridSizeChange(e) {
        this.gridSize = parseInt(e.target.value);
        this.gridSizeValue.textContent = `${this.gridSize}×${this.gridSize}`;
    }
    
    handleShapeTypeChange(e) {
        this.shapeType = e.target.value;
    }
    
    startGame() {
        if (!this.originalImage.src) {
            this.showError('请先上传图片');
            return;
        }
        
        this.resetGame();
        this.createPuzzle();
        this.isPlaying = true;
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.autoSolveBtn.disabled = false;
    }
    
    resetGame() {
        this.moves = 0;
        this.pieces = [];
        this.solution = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.isSolving = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.timeDisplay.textContent = '00:00';
        this.movesDisplay.textContent = '0';
        this.completedDisplay.textContent = '0%';
        this.puzzleGrid.innerHTML = '';
        this.solutionSteps.classList.remove('show');
        this.hideError();
    }
    
    createPuzzle() {
        const gridContainerWidth = 400;
        const gridContainerHeight = 400;
        
        const img = this.originalImage;
        const imgRatio = img.width / img.height;
        const containerRatio = gridContainerWidth / gridContainerHeight;
        
        let displayWidth, displayHeight;
        if (imgRatio > containerRatio) {
            displayWidth = gridContainerWidth;
            displayHeight = gridContainerWidth / imgRatio;
        } else {
            displayHeight = gridContainerHeight;
            displayWidth = gridContainerHeight * imgRatio;
        }
        
        this.pieceWidth = displayWidth / this.gridSize;
        this.pieceHeight = displayHeight / this.gridSize;
        
        this.puzzleGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, ${this.pieceWidth}px)`;
        this.puzzleGrid.style.gridTemplateRows = `repeat(${this.gridSize}, ${this.pieceHeight}px)`;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const originalIndex = row * this.gridSize + col;
                const piece = this.createPiece(originalIndex, row, col, displayWidth, displayHeight);
                this.pieces.push(piece);
            }
        }
        
        this.shufflePieces();
        this.renderPieces();
        this.updateCompletedPercentage();
    }
    
    createPiece(originalIndex, row, col, displayWidth, displayHeight) {
        const piece = {
            originalIndex: originalIndex,
            currentIndex: originalIndex,
            row: row,
            col: col,
            isLocked: false
        };
        
        const pieceElement = document.createElement('div');
        pieceElement.className = 'puzzle-piece';
        pieceElement.style.width = `${this.pieceWidth}px`;
        pieceElement.style.height = `${this.pieceHeight}px`;
        
        const img = this.originalImage;
        
        const x = (col / this.gridSize) * 100;
        const y = (row / this.gridSize) * 100;
        
        pieceElement.style.backgroundImage = `url(${img.src})`;
        pieceElement.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
        pieceElement.style.backgroundPosition = `-${col * this.pieceWidth}px -${row * this.pieceHeight}px`;
        
        if (this.shapeType === 'hexagon') {
            pieceElement.style.clipPath = this.getHexagonClipPath();
        }
        
        pieceElement.dataset.originalIndex = originalIndex;
        pieceElement.dataset.currentIndex = originalIndex;
        
        pieceElement.draggable = true;
        
        pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, piece));
        pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e, piece));
        
        piece.element = pieceElement;
        
        return piece;
    }
    
    getHexagonClipPath() {
        const points = [];
        const sides = 6;
        const angleStep = (2 * Math.PI) / sides;
        const startAngle = -Math.PI / 2;
        
        for (let i = 0; i < sides; i++) {
            const angle = startAngle + (i * angleStep);
            const x = 50 + 50 * Math.cos(angle);
            const y = 50 + 50 * Math.sin(angle);
            points.push(`${x}% ${y}%`);
        }
        
        return `polygon(${points.join(', ')})`;
    }
    
    shufflePieces() {
        const currentIndices = this.pieces.map(p => p.currentIndex);
        
        let shuffled;
        do {
            shuffled = [...currentIndices];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
        } while (this.isSameArray(currentIndices, shuffled) || !this.isSolvable(shuffled));
        
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces.find(p => p.currentIndex === shuffled[i]);
            if (piece) {
                piece.currentIndex = i;
                piece.element.dataset.currentIndex = i;
            }
        }
        
        this.pieces.sort((a, b) => a.currentIndex - b.currentIndex);
    }
    
    isSameArray(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
    
    isSolvable(arr) {
        let inversions = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0;
    }
    
    renderPieces() {
        this.puzzleGrid.innerHTML = '';
        for (const piece of this.pieces) {
            this.puzzleGrid.appendChild(piece.element);
        }
    }
    
    handleDragStart(e, piece) {
        if (piece.isLocked || this.isSolving) {
            e.preventDefault();
            return;
        }
        
        this.draggedPiece = piece;
        piece.element.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', piece.currentIndex);
    }
    
    handleDragEnd(e, piece) {
        piece.element.classList.remove('dragging');
        this.puzzleGrid.querySelectorAll('.puzzle-piece').forEach(el => {
            el.classList.remove('drag-over');
        });
        this.draggedPiece = null;
    }
    
    handleDragEnter(e) {
        e.preventDefault();
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        const targetElement = e.target.closest('.puzzle-piece');
        if (targetElement) {
            targetElement.classList.remove('drag-over');
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const targetElement = this.getTargetPieceElement(e);
        if (targetElement && targetElement !== this.draggedPiece?.element) {
            this.puzzleGrid.querySelectorAll('.puzzle-piece').forEach(el => {
                el.classList.remove('drag-over');
            });
            targetElement.classList.add('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        const targetElement = this.getTargetPieceElement(e);
        if (!targetElement || !this.draggedPiece) {
            this.clearDragOver();
            return;
        }
        
        const targetPiece = this.getPieceByElement(targetElement);
        if (!targetPiece || this.draggedPiece === targetPiece || targetPiece.isLocked || this.draggedPiece.isLocked || this.isSolving) {
            this.clearDragOver();
            return;
        }
        
        this.swapPieces(this.draggedPiece, targetPiece);
    }
    
    getTargetPieceElement(e) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        for (const el of elements) {
            if (el.classList.contains('puzzle-piece')) {
                if (this.draggedPiece && el === this.draggedPiece.element) {
                    continue;
                }
                return el;
            }
        }
        
        const closestElement = e.target.closest('.puzzle-piece');
        if (closestElement && this.draggedPiece && closestElement === this.draggedPiece.element) {
            return null;
        }
        return closestElement;
    }
    
    getPieceByElement(element) {
        return this.pieces.find(p => p.element === element);
    }
    
    clearDragOver() {
        this.puzzleGrid.querySelectorAll('.puzzle-piece').forEach(el => {
            el.classList.remove('drag-over');
        });
    }
    
    swapPieces(piece1, piece2) {
        const tempIndex = piece1.currentIndex;
        piece1.currentIndex = piece2.currentIndex;
        piece2.currentIndex = tempIndex;
        
        piece1.element.dataset.currentIndex = piece1.currentIndex;
        piece2.element.dataset.currentIndex = piece2.currentIndex;
        
        const tempElementIndex = this.pieces.indexOf(piece1);
        const targetElementIndex = this.pieces.indexOf(piece2);
        [this.pieces[tempElementIndex], this.pieces[targetElementIndex]] = [this.pieces[targetElementIndex], this.pieces[tempElementIndex]];
        
        this.renderPieces();
        
        this.moves++;
        this.movesDisplay.textContent = this.moves;
        
        this.checkPiece(piece1);
        this.checkPiece(piece2);
        
        this.updateCompletedPercentage();
        this.checkWin();
    }
    
    checkPiece(piece) {
        if (piece.currentIndex === piece.originalIndex) {
            piece.isLocked = true;
            piece.element.classList.add('locked');
            piece.element.draggable = false;
        }
    }
    
    updateCompletedPercentage() {
        const lockedCount = this.pieces.filter(p => p.isLocked).length;
        const percentage = Math.round((lockedCount / this.pieces.length) * 100);
        this.completedDisplay.textContent = `${percentage}%`;
    }
    
    checkWin() {
        const allLocked = this.pieces.every(p => p.isLocked);
        if (allLocked && this.isPlaying) {
            this.endGame();
        }
    }
    
    endGame() {
        this.isPlaying = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.showCelebration();
    }
    
    showCelebration() {
        this.finalTime.textContent = this.timeDisplay.textContent;
        this.finalMoves.textContent = this.moves;
        this.finalGridSize.textContent = `${this.gridSize}×${this.gridSize}`;
        
        this.celebrationModal.classList.add('show');
        this.createConfetti();
    }
    
    createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = `${Math.random() * 2}s`;
                confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
                
                this.celebrationModal.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 20);
        }
    }
    
    playAgain() {
        this.celebrationModal.classList.remove('show');
        this.resetGame();
        if (this.originalImage.src) {
            this.startBtn.disabled = false;
        }
    }
    
    showOriginal() {
        if (!this.originalImage.src) return;
        this.originalOverlay.classList.add('show');
    }
    
    hideOriginal() {
        this.originalOverlay.classList.remove('show');
    }
    
    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        this.timeDisplay.textContent = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
    }
    
    padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
    }
    
    hideError() {
        this.errorMessage.classList.remove('show');
    }
    
    async autoSolve() {
        if (this.isSolving) return;
        
        this.isSolving = true;
        this.loadingIndicator.classList.add('show');
        this.autoSolveBtn.disabled = true;
        
        try {
            await this.solvePuzzle();
        } catch (error) {
            this.showError('求解失败: ' + error.message);
        } finally {
            this.isSolving = false;
            this.loadingIndicator.classList.remove('show');
            if (this.isPlaying) {
                this.autoSolveBtn.disabled = false;
            }
        }
    }
    
    async solvePuzzle() {
        const initialState = this.pieces.map(p => p.originalIndex);
        const goalState = Array.from({length: this.pieces.length}, (_, i) => i);
        
        const solution = this.aStarSearch(initialState, goalState);
        
        if (!solution) {
            throw new Error('无法找到解决方案');
        }
        
        this.solution = solution;
        this.currentStep = 0;
        
        this.displaySolutionSteps();
        
        await this.executeSolution();
    }
    
    aStarSearch(initialState, goalState) {
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        const gScore = new Map();
        const fScore = new Map();
        
        const initialKey = initialState.join(',');
        const goalKey = goalState.join(',');
        
        gScore.set(initialKey, 0);
        fScore.set(initialKey, this.heuristic(initialState, goalState));
        openSet.push({state: initialState, f: fScore.get(initialKey)});
        
        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = current.state.join(',');
            
            if (currentKey === goalKey) {
                return this.reconstructPath(cameFrom, current.state);
            }
            
            closedSet.add(currentKey);
            
            const neighbors = this.getNeighbors(current.state);
            
            for (const neighbor of neighbors) {
                const neighborKey = neighbor.state.join(',');
                
                if (closedSet.has(neighborKey)) {
                    continue;
                }
                
                const tentativeGScore = gScore.get(currentKey) + neighbor.cost;
                
                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, {state: current.state, swap: neighbor.swap});
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor.state, goalState));
                    
                    if (!openSet.some(item => item.state.join(',') === neighborKey)) {
                        openSet.push({state: neighbor.state, f: fScore.get(neighborKey)});
                    }
                }
            }
        }
        
        return null;
    }
    
    heuristic(state, goalState) {
        let distance = 0;
        const n = this.gridSize;
        
        for (let i = 0; i < state.length; i++) {
            const value = state[i];
            const goalIndex = goalState.indexOf(value);
            
            const currentRow = Math.floor(i / n);
            const currentCol = i % n;
            const goalRow = Math.floor(goalIndex / n);
            const goalCol = goalIndex % n;
            
            distance += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
        }
        
        return distance;
    }
    
    getNeighbors(state) {
        const neighbors = [];
        const n = this.gridSize;
        
        for (let i = 0; i < state.length; i++) {
            for (let j = i + 1; j < state.length; j++) {
                const row1 = Math.floor(i / n);
                const col1 = i % n;
                const row2 = Math.floor(j / n);
                const col2 = j % n;
                
                const isAdjacent = (Math.abs(row1 - row2) === 1 && col1 === col2) || 
                                   (Math.abs(col1 - col2) === 1 && row1 === row2);
                
                if (isAdjacent) {
                    const newState = [...state];
                    [newState[i], newState[j]] = [newState[j], newState[i]];
                    
                    neighbors.push({
                        state: newState,
                        cost: 1,
                        swap: {from: i, to: j}
                    });
                }
            }
        }
        
        return neighbors;
    }
    
    reconstructPath(cameFrom, currentState) {
        const path = [];
        let currentKey = currentState.join(',');
        
        while (cameFrom.has(currentKey)) {
            const prev = cameFrom.get(currentKey);
            path.unshift(prev.swap);
            currentKey = prev.state.join(',');
        }
        
        return path;
    }
    
    displaySolutionSteps() {
        this.stepsList.innerHTML = '';
        this.solutionSteps.classList.add('show');
        
        for (let i = 0; i < this.solution.length; i++) {
            const step = document.createElement('div');
            step.className = 'solution-step';
            step.textContent = `步骤 ${i + 1}: 交换位置 ${this.solution[i].from + 1} 和 ${this.solution[i].to + 1}`;
            this.stepsList.appendChild(step);
        }
    }
    
    async executeSolution() {
        const stepElements = this.stepsList.querySelectorAll('.solution-step');
        
        for (let i = 0; i < this.solution.length; i++) {
            if (!this.isSolving) break;
            
            const step = this.solution[i];
            
            if (i > 0) {
                stepElements[i - 1].classList.remove('current');
            }
            stepElements[i].classList.add('current');
            stepElements[i].scrollIntoView({behavior: 'smooth', block: 'center'});
            
            const piece1 = this.pieces.find(p => p.currentIndex === step.from);
            const piece2 = this.pieces.find(p => p.currentIndex === step.to);
            
            if (piece1 && piece2) {
                this.swapPieces(piece1, piece2);
            }
            
            await this.delay(500);
        }
        
        if (stepElements.length > 0) {
            stepElements[stepElements.length - 1].classList.remove('current');
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});