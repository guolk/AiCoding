/**
 * CPU架构可视化教学工具
 * 使用Three.js实现交互式3D演示
 */

class CPUVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        
        // CPU组件
        this.components = {};
        
        // 数据流动画
        this.dataFlows = [];
        
        // 指令系统
        this.instructions = [];
        this.currentInstructionIndex = 0;
        this.currentStage = 0;
        
        // 流水线状态
        this.pipeline = [null, null, null, null, null]; // IF, ID, EX, MEM, WB
        this.hazards = [];
        
        // 执行状态
        this.isRunning = false;
        this.executionMode = 'single';
        this.executionSpeed = 1;
        this.isPaused = false;
        
        // 组件状态
        this.registerFile = {
            R0: 0, R1: 0, R2: 0, R3: 0,
            R4: 0, R5: 0, R6: 0, R7: 0,
            PC: 0, IR: '', MAR: 0, MDR: 0
        };
        
        this.cache = {
            L1: { size: 4, blocks: [], hitCount: 0, missCount: 0 },
            L2: { size: 8, blocks: [], hitCount: 0, missCount: 0 }
        };
        
        // 初始化
        this.init();
    }
    
    init() {
        this.initThreeJS();
        this.createCPUComponents();
        this.createDataBuses();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }
    
    initThreeJS() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // 创建相机
        const container = document.getElementById('canvas-container');
        this.camera = new THREE.PerspectiveCamera(
            60, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // 添加轨道控制器
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        
        // 添加光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        const pointLight1 = new THREE.PointLight(0x3498db, 0.5, 30);
        pointLight1.position.set(-10, 5, -10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x2ecc71, 0.5, 30);
        pointLight2.position.set(10, 5, 10);
        this.scene.add(pointLight2);
        
        // 添加地面网格
        const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
        this.scene.add(gridHelper);
        
        // 窗口调整大小
        window.addEventListener('resize', () => {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }
    
    createCPUComponents() {
        // 创建ALU
        this.createALU();
        
        // 创建寄存器组
        this.createRegisterFile();
        
        // 创建控制单元
        this.createControlUnit();
        
        // 创建L1缓存
        this.createL1Cache();
        
        // 创建L2缓存
        this.createL2Cache();
        
        // 创建内存
        this.createMemory();
        
        // 创建标签
        this.createLabels();
    }
    
    createALU() {
        const geometry = new THREE.BoxGeometry(3, 1.5, 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0x3498db,
            shininess: 100
        });
        
        const alu = new THREE.Mesh(geometry, material);
        alu.position.set(0, 0.75, 0);
        alu.castShadow = true;
        alu.receiveShadow = true;
        alu.userData = {
            name: 'ALU',
            description: '算术逻辑单元(Arithmetic Logic Unit)：执行所有算术和逻辑运算。',
            status: '空闲',
            color: 0x3498db
        };
        
        this.scene.add(alu);
        this.components.alu = alu;
        
        // 添加内部细节
        const innerGeometry = new THREE.BoxGeometry(2.5, 1, 1.5);
        const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0x2980b9,
            emissive: 0x1a5276,
            emissiveIntensity: 0.2
        });
        const innerAlu = new THREE.Mesh(innerGeometry, innerMaterial);
        alu.add(innerAlu);
    }
    
    createRegisterFile() {
        const group = new THREE.Group();
        
        // 创建8个寄存器
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const material = new THREE.MeshPhongMaterial({
                color: 0x2ecc71,
                shininess: 100
            });
            
            const register = new THREE.Mesh(geometry, material);
            const row = Math.floor(i / 4);
            const col = i % 4;
            register.position.set(-4 + col * 0.9, 0.4 + row * 0.9, 5);
            register.castShadow = true;
            register.receiveShadow = true;
            register.userData = {
                name: `R${i}`,
                description: `通用寄存器 R${i}：用于存储临时数据和运算结果。`,
                status: `值: ${this.registerFile[`R${i}`]}`,
                color: 0x2ecc71
            };
            
            group.add(register);
            this.components[`register${i}`] = register;
        }
        
        // 添加PC寄存器
        const pcGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.8);
        const pcMaterial = new THREE.MeshPhongMaterial({
            color: 0xe67e22,
            shininess: 100
        });
        const pc = new THREE.Mesh(pcGeometry, pcMaterial);
        pc.position.set(-2.2, 2.2, 5);
        pc.castShadow = true;
        pc.receiveShadow = true;
        pc.userData = {
            name: 'PC',
            description: '程序计数器(Program Counter)：存储下一条要执行指令的地址。',
            status: `地址: ${this.registerFile.PC}`,
            color: 0xe67e22
        };
        group.add(pc);
        this.components.pc = pc;
        
        this.scene.add(group);
    }
    
    createControlUnit() {
        const geometry = new THREE.BoxGeometry(2.5, 1.8, 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0x9b59b6,
            shininess: 100
        });
        
        const cu = new THREE.Mesh(geometry, material);
        cu.position.set(6, 0.9, 0);
        cu.castShadow = true;
        cu.receiveShadow = true;
        cu.userData = {
            name: '控制单元',
            description: '控制单元(Control Unit)：协调CPU的所有操作，根据指令产生控制信号。',
            status: '空闲',
            color: 0x9b59b6
        };
        
        this.scene.add(cu);
        this.components.controlUnit = cu;
        
        // 添加内部闪烁的控制信号
        const ledGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const ledMaterial = new THREE.MeshPhongMaterial({
            color: 0x8e44ad,
            emissive: 0x8e44ad,
            emissiveIntensity: 0.5
        });
        
        for (let i = 0; i < 4; i++) {
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set(
                -0.8 + (i % 2) * 1.6,
                0.6 + Math.floor(i / 2) * 0.6,
                1.1
            );
            cu.add(led);
        }
    }
    
    createL1Cache() {
        const geometry = new THREE.BoxGeometry(2, 1.2, 1.5);
        const material = new THREE.MeshPhongMaterial({
            color: 0xf39c12,
            shininess: 100
        });
        
        const l1 = new THREE.Mesh(geometry, material);
        l1.position.set(-5, 0.6, 0);
        l1.castShadow = true;
        l1.receiveShadow = true;
        l1.userData = {
            name: 'L1缓存',
            description: '一级缓存(Level 1 Cache)：CPU内部高速缓存，访问速度最快，通常分为指令缓存和数据缓存。',
            status: `命中率: ${this.cache.L1.hitCount}/${this.cache.L1.hitCount + this.cache.L1.missCount}`,
            color: 0xf39c12
        };
        
        this.scene.add(l1);
        this.components.l1Cache = l1;
    }
    
    createL2Cache() {
        const geometry = new THREE.BoxGeometry(2.5, 1.5, 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0xe74c3c,
            shininess: 100
        });
        
        const l2 = new THREE.Mesh(geometry, material);
        l2.position.set(-8, 0.75, 0);
        l2.castShadow = true;
        l2.receiveShadow = true;
        l2.userData = {
            name: 'L2缓存',
            description: '二级缓存(Level 2 Cache)：比L1稍慢但容量更大的缓存，用于补充L1缓存。',
            status: `命中率: ${this.cache.L2.hitCount}/${this.cache.L2.hitCount + this.cache.L2.missCount}`,
            color: 0xe74c3c
        };
        
        this.scene.add(l2);
        this.components.l2Cache = l2;
    }
    
    createMemory() {
        const geometry = new THREE.BoxGeometry(3, 2, 2.5);
        const material = new THREE.MeshPhongMaterial({
            color: 0x1abc9c,
            shininess: 100
        });
        
        const memory = new THREE.Mesh(geometry, material);
        memory.position.set(0, 1, -6);
        memory.castShadow = true;
        memory.receiveShadow = true;
        memory.userData = {
            name: '主存储器',
            description: '主存储器(Main Memory)：RAM内存，存储当前正在执行的程序和数据。',
            status: '正常运行',
            color: 0x1abc9c
        };
        
        this.scene.add(memory);
        this.components.memory = memory;
        
        // 添加存储槽效果
        const slotGeometry = new THREE.BoxGeometry(2.4, 0.2, 0.3);
        const slotMaterial = new THREE.MeshPhongMaterial({
            color: 0x16a085,
            emissive: 0x16a085,
            emissiveIntensity: 0.1
        });
        
        for (let i = 0; i < 6; i++) {
            const slot = new THREE.Mesh(slotGeometry, slotMaterial);
            slot.position.set(0, -0.7 + i * 0.3, 1.3);
            memory.add(slot);
        }
    }
    
    createDataBuses() {
        // 创建数据总线
        this.createBus(
            'dataBus',
            [-5, 0.6, 0],  // L1缓存
            [0, 0.75, 0],   // ALU
            0x3498db,
            '数据总线：在CPU组件之间传输数据'
        );
        
        // 创建地址总线
        this.createBus(
            'addressBus',
            [0, 1, -6],     // 内存
            [-5, 0.6, 0],   // L1缓存
            0xe67e22,
            '地址总线：传输内存地址'
        );
        
        // 创建控制总线
        this.createBus(
            'controlBus',
            [6, 0.9, 0],    // 控制单元
            [0, 0.75, 0],   // ALU
            0x9b59b6,
            '控制总线：传输控制信号'
        );
        
        // 连接L1和L2缓存
        this.createBus(
            'cacheBus',
            [-8, 0.75, 0],  // L2缓存
            [-5, 0.6, 0],   // L1缓存
            0xf39c12,
            '缓存总线：L1和L2缓存之间的数据传输'
        );
    }
    
    createBus(name, start, end, color, description) {
        const points = [];
        points.push(new THREE.Vector3(start[0], start[1], start[2]));
        points.push(new THREE.Vector3(end[0], end[1], end[2]));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 3
        });
        
        const line = new THREE.Line(geometry, material);
        line.userData = {
            name: name,
            description: description,
            color: color
        };
        
        this.scene.add(line);
        this.components[name] = line;
        
        // 创建用于数据流的路径
        this[`${name}Path`] = points;
    }
    
    createLabels() {
        this.createLabel('ALU', this.components.alu.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0x3498db);
        this.createLabel('控制单元', this.components.controlUnit.position.clone().add(new THREE.Vector3(0, 1.8, 0)), 0x9b59b6);
        this.createLabel('L1缓存', this.components.l1Cache.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xf39c12);
        this.createLabel('L2缓存', this.components.l2Cache.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xe74c3c);
        this.createLabel('主存储器', this.components.memory.position.clone().add(new THREE.Vector3(0, 2, 0)), 0x1abc9c);
        this.createLabel('寄存器组', new THREE.Vector3(-2.5, 3.2, 5), 0x2ecc71);
    }
    
    createLabel(text, position, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.85)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'Bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const colorHex = '#' + color.toString(16).padStart(6, '0');
        context.fillStyle = colorHex;
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(2.5, 0.6, 1);
        
        this.scene.add(sprite);
        this.components[`label_${text}`] = sprite;
    }
    
    setupControls() {
        // 射线投射用于点击检测
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }
    
    setupEventListeners() {
        // 鼠标事件
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        // 控制面板事件
        document.getElementById('add-instruction').addEventListener('click', () => {
            this.addInstruction();
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startExecution();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseExecution();
        });
        
        document.getElementById('step-btn').addEventListener('click', () => {
            this.stepExecution();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetExecution();
        });
        
        // 执行模式选择
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.executionMode = e.target.value;
            });
        });
        
        // 速度滑块
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.executionSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = `${this.executionSpeed}x`;
        });
    }
    
    onMouseClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const meshes = Object.values(this.components).filter(c => c instanceof THREE.Mesh);
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const clickedComponent = intersects[0].object;
            this.showComponentInfo(clickedComponent);
            this.highlightComponent(clickedComponent);
        }
    }
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const meshes = Object.values(this.components).filter(c => c instanceof THREE.Mesh);
        const intersects = this.raycaster.intersectObjects(meshes);
        
        const tooltip = document.getElementById('tooltip');
        
        if (intersects.length > 0) {
            const hoveredComponent = intersects[0].object;
            this.renderer.domElement.style.cursor = 'pointer';
            
            tooltip.innerHTML = `<strong>${hoveredComponent.userData.name}</strong><br>${hoveredComponent.userData.description}`;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        } else {
            this.renderer.domElement.style.cursor = 'default';
            tooltip.style.display = 'none';
        }
    }
    
    showComponentInfo(component) {
        const details = document.getElementById('component-details');
        const userData = component.userData;
        
        // 更新寄存器状态
        if (userData.name.startsWith('R')) {
            userData.status = `值: ${this.registerFile[userData.name]}`;
        } else if (userData.name === 'PC') {
            userData.status = `地址: ${this.registerFile.PC}`;
        } else if (userData.name === 'L1缓存') {
            const total = this.cache.L1.hitCount + this.cache.L1.missCount;
            userData.status = `命中率: ${this.cache.L1.hitCount}/${total}`;
        } else if (userData.name === 'L2缓存') {
            const total = this.cache.L2.hitCount + this.cache.L2.missCount;
            userData.status = `命中率: ${this.cache.L2.hitCount}/${total}`;
        }
        
        let infoHTML = `
            <h4>${userData.name}</h4>
            <p><strong>描述:</strong> ${userData.description}</p>
            <p><strong>状态:</strong> ${userData.status}</p>
        `;
        
        // 寄存器组显示所有寄存器值
        if (userData.name.startsWith('R') || userData.name === 'PC') {
            infoHTML += `
                <table>
                    <tr><th>寄存器</th><th>值</th></tr>
                    <tr><td>PC</td><td>${this.registerFile.PC}</td></tr>
                    ${Array.from({length: 8}, (_, i) => 
                        `<tr><td>R${i}</td><td>${this.registerFile[`R${i}`]}</td></tr>`
                    ).join('')}
                </table>
            `;
        }
        
        details.innerHTML = infoHTML;
    }
    
    highlightComponent(component) {
        // 重置所有组件颜色
        Object.values(this.components).forEach(c => {
            if (c instanceof THREE.Mesh && c.material && c.userData.color) {
                c.material.color.setHex(c.userData.color);
                c.material.emissive?.setHex(c.userData.color);
                c.material.emissiveIntensity = 0;
            }
        });
        
        // 高亮选中的组件
        if (component.material && component.userData.color) {
            // 暂时高亮
            component.material.emissive?.setHex(0xffffff);
            component.material.emissiveIntensity = 0.3;
            
            // 1秒后恢复
            setTimeout(() => {
                if (component.material.emissive) {
                    component.material.emissive.setHex(component.userData.color);
                    component.material.emissiveIntensity = 0;
                }
            }, 1000);
        }
    }
    
    addInstruction() {
        const select = document.getElementById('instruction-select');
        const instructionText = select.value;
        
        if (this.instructions.length >= 10) {
            alert('指令序列最多10条指令');
            return;
        }
        
        // 解析指令
        const instruction = this.parseInstruction(instructionText);
        this.instructions.push(instruction);
        
        // 更新UI
        this.updateInstructionList();
    }
    
    parseInstruction(text) {
        const parts = text.split(/[,\s]+/);
        const opcode = parts[0].toUpperCase();
        
        let instruction = {
            text: text,
            opcode: opcode,
            operands: [],
            stage: 0,
            hasHazard: false
        };
        
        switch (opcode) {
            case 'MOV':
                // MOV R1, #10 或 MOV R1, R2
                instruction.operands = [parts[1], parts[2]];
                instruction.type = 'data_transfer';
                break;
                
            case 'ADD':
            case 'SUB':
            case 'MUL':
                // ADD R3, R1, R2
                instruction.operands = [parts[1], parts[2], parts[3]];
                instruction.type = 'arithmetic';
                break;
                
            case 'JMP':
                // JMP 0x100
                instruction.operands = [parts[1]];
                instruction.type = 'control';
                break;
                
            case 'BEQ':
            case 'BNE':
                // BEQ R1, R2, 0x200
                instruction.operands = [parts[1], parts[2], parts[3]];
                instruction.type = 'control';
                break;
                
            case 'LDR':
            case 'STR':
                // LDR R5, [R1]
                instruction.operands = [parts[1], parts[2].replace(/[\[\]]/g, '')];
                instruction.type = 'memory';
                break;
        }
        
        return instruction;
    }
    
    updateInstructionList() {
        const list = document.getElementById('instruction-list');
        list.innerHTML = '';
        
        this.instructions.forEach((inst, index) => {
            const item = document.createElement('div');
            item.className = 'instruction-item';
            if (index === this.currentInstructionIndex) {
                item.classList.add('active');
            }
            if (inst.hasHazard) {
                item.classList.add('hazard');
            }
            
            item.innerHTML = `
                <span>${inst.text}</span>
                <button class="delete-instruction" data-index="${index}">×</button>
            `;
            
            list.appendChild(item);
        });
        
        // 添加删除事件
        document.querySelectorAll('.delete-instruction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.instructions.splice(index, 1);
                this.updateInstructionList();
            });
        });
    }
    
    updateExecutionStatus(message, type = 'info') {
        const statusMessage = document.getElementById('status-message');
        let color = '#3498db';
        let prefix = '📋';
        
        switch (type) {
            case 'success':
                color = '#2ecc71';
                prefix = '✅';
                break;
            case 'running':
                color = '#f39c12';
                prefix = '⚡';
                break;
            case 'error':
                color = '#e74c3c';
                prefix = '❌';
                break;
            case 'info':
            default:
                color = '#3498db';
                prefix = '📋';
        }
        
        statusMessage.innerHTML = `<p style="color: ${color}; margin: 0; font-size: 0.95rem;">${prefix} ${message}</p>`;
    }
    
    startExecution() {
        if (this.instructions.length === 0) {
            alert('请先添加指令');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.updateExecutionStatus('开始执行指令序列...', 'running');
        
        // 更新按钮状态
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('step-btn').disabled = true;
        
        // 检查冒险
        this.detectHazards();
        
        if (this.executionMode === 'continuous') {
            this.runContinuous();
        } else {
            // 单步模式下，第一次点击开始后等待单步
            document.getElementById('step-btn').disabled = false;
            this.updateExecutionStatus('单步模式：点击"单步"按钮逐阶段执行', 'info');
        }
    }
    
    pauseExecution() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pause-btn');
        btn.textContent = this.isPaused ? '继续' : '暂停';
        
        if (this.isPaused) {
            this.updateExecutionStatus('执行已暂停', 'info');
        } else {
            this.updateExecutionStatus('继续执行...', 'running');
        }
        
        if (!this.isPaused && this.executionMode === 'continuous') {
            this.runContinuous();
        }
    }
    
    stepExecution() {
        if (this.instructions.length === 0 || !this.isRunning) {
            return;
        }
        
        const remainingInstructions = this.instructions.length - this.currentInstructionIndex;
        const pipelineActive = !this.pipeline.every(p => p === null);
        if (remainingInstructions > 0 || pipelineActive) {
            this.updateExecutionStatus(`执行阶段 ${this.currentInstructionIndex}/${this.instructions.length}`, 'running');
        }
        
        this.executeNextStage();
    }
    
    resetExecution() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentInstructionIndex = 0;
        this.currentStage = 0;
        this.pipeline = [null, null, null, null, null];
        this.hazards = [];
        
        // 重置寄存器
        Object.keys(this.registerFile).forEach(key => {
            this.registerFile[key] = key === 'IR' ? '' : 0;
        });
        
        // 重置缓存
        this.cache.L1.blocks = [];
        this.cache.L1.hitCount = 0;
        this.cache.L1.missCount = 0;
        this.cache.L2.blocks = [];
        this.cache.L2.hitCount = 0;
        this.cache.L2.missCount = 0;
        
        // 重置组件状态
        Object.values(this.components).forEach(c => {
            if (c instanceof THREE.Mesh && c.material && c.userData.color) {
                c.material.color.setHex(c.userData.color);
                c.material.emissive?.setHex(c.userData.color);
                c.material.emissiveIntensity = 0;
            }
        });
        
        // 清除数据流动画
        this.dataFlows = [];
        
        // 更新UI
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('step-btn').disabled = false;
        document.getElementById('pause-btn').textContent = '暂停';
        
        this.updateExecutionStatus('已重置，等待开始执行...', 'info');
        this.updatePipelineStatus();
        this.updateInstructionList();
        this.updateHazardDisplay();
    }
    
    detectHazards() {
        this.hazards = [];
        
        for (let i = 0; i < this.instructions.length - 1; i++) {
            const current = this.instructions[i];
            const next = this.instructions[i + 1];
            
            // 数据冒险检测
            if (current.type === 'arithmetic' && 
                (next.type === 'arithmetic' || next.type === 'data_transfer' || next.type === 'memory')) {
                
                const currentDest = current.operands[0];
                const nextSrc1 = next.operands[1];
                const nextSrc2 = next.operands[2];
                
                if (nextSrc1 && nextSrc1.startsWith('R') && nextSrc1 === currentDest) {
                    this.hazards.push({
                        type: '数据冒险 - RAW (读后写)',
                        stage: i,
                        description: `指令${i+1}需要读取${currentDest}，但指令${i}还未写入`
                    });
                    current.hasHazard = true;
                    next.hasHazard = true;
                }
                
                if (nextSrc2 && nextSrc2.startsWith('R') && nextSrc2 === currentDest) {
                    this.hazards.push({
                        type: '数据冒险 - RAW (读后写)',
                        stage: i,
                        description: `指令${i+1}需要读取${currentDest}，但指令${i}还未写入`
                    });
                    current.hasHazard = true;
                    next.hasHazard = true;
                }
            }
            
            // 控制冒险检测
            if (current.type === 'control') {
                this.hazards.push({
                    type: '控制冒险',
                    stage: i,
                    description: `分支指令${i+1}导致流水线需要清除`
                });
                current.hasHazard = true;
            }
        }
        
        this.updateInstructionList();
        this.updateHazardDisplay();
    }
    
    updateHazardDisplay() {
        const section = document.getElementById('hazard-section');
        const info = document.getElementById('hazard-info');
        
        if (this.hazards.length > 0) {
            section.style.display = 'block';
            let html = '';
            this.hazards.forEach(hazard => {
                html += `<p><strong>${hazard.type}</strong><br>${hazard.description}</p>`;
            });
            info.innerHTML = html;
        } else {
            section.style.display = 'none';
        }
    }
    
    executeNextStage() {
        if (this.currentInstructionIndex >= this.instructions.length && 
            this.pipeline.every(p => p === null)) {
            this.isRunning = false;
            document.getElementById('start-btn').disabled = false;
            document.getElementById('pause-btn').disabled = true;
            document.getElementById('step-btn').disabled = true;
            
            const totalInstructions = this.instructions.length;
            const hazardCount = this.hazards.length;
            const l1Total = this.cache.L1.hitCount + this.cache.L1.missCount;
            const l2Total = this.cache.L2.hitCount + this.cache.L2.missCount;
            
            let summary = `指令执行完成！共 ${totalInstructions} 条指令`;
            if (hazardCount > 0) {
                summary += `，检测到 ${hazardCount} 个冒险`;
            }
            
            this.updateExecutionStatus(summary, 'success');
            return;
        }
        
        // 流水线推进
        this.advancePipeline();
        
        // 取出新指令进入IF阶段
        if (this.currentInstructionIndex < this.instructions.length) {
            const instruction = this.instructions[this.currentInstructionIndex];
            instruction.stage = 0;
            this.pipeline[0] = instruction;
            this.currentInstructionIndex++;
        }
        
        // 执行当前流水线阶段
        this.executePipelineStages();
        
        // 检查是否即将完成
        if (this.currentInstructionIndex >= this.instructions.length && 
            this.pipeline.every(p => p === null)) {
            const totalInstructions = this.instructions.length;
            const hazardCount = this.hazards.length;
            let summary = `指令执行完成！共 ${totalInstructions} 条指令`;
            if (hazardCount > 0) {
                summary += `，检测到 ${hazardCount} 个冒险`;
            }
            this.updateExecutionStatus(summary, 'success');
        }
        
        // 更新UI
        this.updatePipelineStatus();
        this.updateInstructionList();
    }
    
    advancePipeline() {
        // 从后往前推进
        for (let i = 4; i > 0; i--) {
            this.pipeline[i] = this.pipeline[i - 1];
            if (this.pipeline[i]) {
                this.pipeline[i].stage = i;
            }
        }
        this.pipeline[0] = null;
    }
    
    executePipelineStages() {
        // IF阶段：取指
        if (this.pipeline[0]) {
            this.executeIF(this.pipeline[0]);
        }
        
        // ID阶段：译码
        if (this.pipeline[1]) {
            this.executeID(this.pipeline[1]);
        }
        
        // EX阶段：执行
        if (this.pipeline[2]) {
            this.executeEX(this.pipeline[2]);
        }
        
        // MEM阶段：访存
        if (this.pipeline[3]) {
            this.executeMEM(this.pipeline[3]);
        }
        
        // WB阶段：写回
        if (this.pipeline[4]) {
            this.executeWB(this.pipeline[4]);
            this.pipeline[4] = null;
        }
    }
    
    executeIF(instruction) {
        // 取指阶段：从内存读取指令
        this.activateComponent('memory');
        this.activateComponent('l1Cache');
        
        // 数据流动：内存 -> L1缓存 -> IR
        this.createDataFlow(
            this.components.memory.position,
            this.components.l1Cache.position,
            0x1abc9c
        );
        
        setTimeout(() => {
            this.createDataFlow(
                this.components.l1Cache.position,
                this.components.controlUnit.position,
                0xf39c12
            );
        }, 500 / this.executionSpeed);
        
        this.registerFile.IR = instruction.text;
        this.registerFile.PC += 4;
    }
    
    executeID(instruction) {
        // 译码阶段：控制单元解析指令
        this.activateComponent('controlUnit');
        
        // 数据流动：PC/寄存器 -> 控制单元
        if (instruction.operands.some(op => op && op.startsWith('R'))) {
            this.activateComponent('register0'); // 激活第一个寄存器作为代表
            this.createDataFlow(
                this.components.register0.position,
                this.components.controlUnit.position,
                0x2ecc71
            );
        }
    }
    
    executeEX(instruction) {
        // 执行阶段：ALU执行运算
        this.activateComponent('alu');
        
        // 数据流动：操作数 -> ALU
        this.createDataFlow(
            this.components.controlUnit.position,
            this.components.alu.position,
            0x9b59b6
        );
        
        // 根据指令类型执行不同操作
        switch (instruction.opcode) {
            case 'ADD':
                // R3 = R1 + R2
                const src1 = this.getRegisterValue(instruction.operands[1]);
                const src2 = this.getRegisterValue(instruction.operands[2]);
                this.tempResult = src1 + src2;
                break;
                
            case 'SUB':
                const subSrc1 = this.getRegisterValue(instruction.operands[1]);
                const subSrc2 = this.getRegisterValue(instruction.operands[2]);
                this.tempResult = subSrc1 - subSrc2;
                break;
                
            case 'MOV':
                if (instruction.operands[1].startsWith('#')) {
                    // 立即数
                    this.tempResult = parseInt(instruction.operands[1].substring(1));
                } else {
                    // 寄存器
                    this.tempResult = this.getRegisterValue(instruction.operands[1]);
                }
                break;
                
            case 'JMP':
                // 控制冒险：直接跳转
                this.tempResult = parseInt(instruction.operands[1]);
                break;
                
            case 'LDR':
            case 'STR':
                // 计算内存地址
                this.tempResult = this.getRegisterValue(instruction.operands[1]) || 0;
                break;
        }
    }
    
    executeMEM(instruction) {
        // 访存阶段：访问内存或缓存
        if (instruction.type === 'memory') {
            this.activateComponent('memory');
            this.activateComponent('l1Cache');
            this.activateComponent('l2Cache');
            
            // 数据流动：ALU -> 缓存 -> 内存
            this.createDataFlow(
                this.components.alu.position,
                this.components.l1Cache.position,
                0x3498db
            );
            
            setTimeout(() => {
                if (instruction.opcode === 'LDR') {
                    // 模拟缓存访问
                    const address = this.tempResult || 0;
                    const inL1 = this.cache.L1.blocks.includes(address);
                    const inL2 = this.cache.L2.blocks.includes(address);
                    
                    if (inL1) {
                        this.cache.L1.hitCount++;
                    } else if (inL2) {
                        this.cache.L2.hitCount++;
                        if (this.cache.L1.blocks.length < this.cache.L1.size) {
                            this.cache.L1.blocks.push(address);
                        }
                    } else {
                        this.cache.L1.missCount++;
                        this.cache.L2.missCount++;
                        // 从内存加载
                        if (this.cache.L2.blocks.length < this.cache.L2.size) {
                            this.cache.L2.blocks.push(address);
                        }
                        if (this.cache.L1.blocks.length < this.cache.L1.size) {
                            this.cache.L1.blocks.push(address);
                        }
                    }
                    
                    this.createDataFlow(
                        this.components.l1Cache.position,
                        this.components.l2Cache.position,
                        0xf39c12
                    );
                }
            }, 300 / this.executionSpeed);
        }
    }
    
    executeWB(instruction) {
        // 写回阶段：将结果写入寄存器
        if (instruction.type === 'arithmetic' || 
            instruction.type === 'data_transfer' ||
            instruction.opcode === 'LDR') {
            
            this.activateComponent('register0'); // 代表寄存器组
            
            // 数据流动：ALU/内存 -> 寄存器
            if (instruction.type === 'memory') {
                this.createDataFlow(
                    this.components.l1Cache.position,
                    this.components.register0.position,
                    0xf39c12
                );
            } else {
                this.createDataFlow(
                    this.components.alu.position,
                    this.components.register0.position,
                    0x3498db
                );
            }
            
            // 写入目标寄存器
            const destReg = instruction.operands[0];
            if (destReg && destReg.startsWith('R')) {
                this.registerFile[destReg] = this.tempResult || 0;
            }
        }
        
        // 处理控制指令
        if (instruction.type === 'control') {
            // 控制冒险：刷新流水线
            this.activateComponent('controlUnit');
            this.pipeline = [null, null, null, null, null]; // 清除流水线
        }
    }
    
    getRegisterValue(operand) {
        if (operand && operand.startsWith('R')) {
            return this.registerFile[operand] || 0;
        } else if (operand && operand.startsWith('#')) {
            return parseInt(operand.substring(1));
        }
        return 0;
    }
    
    activateComponent(componentName) {
        const component = this.components[componentName];
        if (!component) return;
        
        // 重置所有组件
        Object.values(this.components).forEach(c => {
            if (c instanceof THREE.Mesh && c.material && c.material.emissive) {
                c.material.emissiveIntensity = 0;
            }
        });
        
        // 激活当前组件
        if (component.material && component.material.emissive) {
            component.material.emissive.setHex(0xffffff);
            component.material.emissiveIntensity = 0.5;
            
            setTimeout(() => {
                if (component.material.emissive) {
                    component.material.emissive.setHex(component.userData.color || 0x333333);
                    component.material.emissiveIntensity = 0;
                }
            }, 1000 / this.executionSpeed);
        }
        
        // 如果是冒险状态，用红色
        if (this.hazards.some(h => h.stage === this.currentInstructionIndex - 1)) {
            if (component.material && component.material.emissive) {
                component.material.emissive.setHex(0xff4444);
                component.material.emissiveIntensity = 0.8;
            }
        }
    }
    
    createDataFlow(start, end, color) {
        // 创建数据流动画
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(start);
        
        // 创建动画
        const startTime = Date.now();
        const duration = 800 / this.executionSpeed;
        
        const animation = {
            mesh: sphere,
            start: start.clone(),
            end: end.clone(),
            startTime: startTime,
            duration: duration
        };
        
        this.dataFlows.push(animation);
        this.scene.add(sphere);
    }
    
    updatePipelineStatus() {
        const stageNames = ['stage-IF', 'stage-ID', 'stage-EX', 'stage-MEM', 'stage-WB'];
        const stageLabels = ['取指 (IF)', '译码 (ID)', '执行 (EX)', '访存 (MEM)', '写回 (WB)'];
        
        stageNames.forEach((stageId, index) => {
            const stageElement = document.getElementById(stageId);
            const statusSpan = stageElement.querySelector('.stage-status');
            
            stageElement.classList.remove('active', 'hazard');
            
            if (this.pipeline[index]) {
                stageElement.classList.add('active');
                statusSpan.textContent = this.pipeline[index].text.substring(0, 15);
                statusSpan.style.color = '#3498db';
                
                // 检查冒险
                if (this.pipeline[index].hasHazard) {
                    stageElement.classList.add('hazard');
                    statusSpan.style.color = '#ff4444';
                }
            } else {
                statusSpan.textContent = '空闲';
                statusSpan.style.color = '#2ecc71';
            }
        });
    }
    
    runContinuous() {
        if (!this.isRunning || this.isPaused) return;
        
        if (this.currentInstructionIndex >= this.instructions.length && 
            this.pipeline.every(p => p === null)) {
            this.isRunning = false;
            document.getElementById('start-btn').disabled = false;
            document.getElementById('pause-btn').disabled = true;
            document.getElementById('step-btn').disabled = true;
            
            const totalInstructions = this.instructions.length;
            const hazardCount = this.hazards.length;
            let summary = `指令执行完成！共 ${totalInstructions} 条指令`;
            if (hazardCount > 0) {
                summary += `，检测到 ${hazardCount} 个冒险`;
            }
            this.updateExecutionStatus(summary, 'success');
            return;
        }
        
        this.executeNextStage();
        
        // 延迟后继续
        setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.runContinuous();
            }
        }, 1500 / this.executionSpeed);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        
        // 更新数据流动画
        const currentTime = Date.now();
        this.dataFlows = this.dataFlows.filter(flow => {
            const elapsed = currentTime - flow.startTime;
            const progress = Math.min(elapsed / flow.duration, 1);
            
            if (progress < 1) {
                // 线性插值
                flow.mesh.position.lerpVectors(flow.start, flow.end, progress);
                
                // 添加轻微的Y轴波动
                flow.mesh.position.y += Math.sin(progress * Math.PI * 4) * 0.05;
                
                // 缩放效果
                const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
                flow.mesh.scale.set(scale, scale, scale);
                
                return true;
            } else {
                // 动画结束，移除球体
                this.scene.remove(flow.mesh);
                return false;
            }
        });
        
        // 控制单元LED闪烁
        if (this.components.controlUnit) {
            const time = this.clock.getElapsedTime();
            this.components.controlUnit.children.forEach((led, i) => {
                if (led.material && led.material.emissive) {
                    const intensity = 0.3 + Math.sin(time * 2 + i) * 0.2;
                    led.material.emissiveIntensity = intensity;
                }
            });
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    new CPUVisualizer();
});