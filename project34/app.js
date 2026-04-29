// 数据中心机房可视化系统
class DataCenterVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;
        
        this.racks = [];
        this.servers = [];
        this.selectedServer = null;
        this.hoveredRack = null;
        this.currentView = 'perspective';
        
        this.charts = {};
        
        // 模拟数据配置
        this.rackConfig = {
            rows: 3,
            racksPerRow: 10,
            unitsPerRack: 42
        };
        
        // 状态颜色 - 增强对比度
        this.statusColors = {
            normal: 0x66BB6A,
            warning: 0xFFA726,
            error: 0xEF5350,
            offline: 0xBDBDBD
        };
        
        // 机柜颜色
        this.rackColors = {
            body: 0x78909C,
            frame: 0x546E7A,
            frontPanel: 0x37474F
        };
        
        // 温度颜色映射
        this.tempColors = [
            { temp: 20, color: 0x4CAF50 },
            { temp: 25, color: 0x8BC34A },
            { temp: 30, color: 0xCDDC39 },
            { temp: 35, color: 0xFFEB3B },
            { temp: 40, color: 0xFFC107 },
            { temp: 45, color: 0xFF9800 },
            { temp: 50, color: 0xFF5722 },
            { temp: 55, color: 0xF44336 }
        ];
        
        this.init();
    }
    
    init() {
        this.initThreeJS();
        this.initData();
        this.createRoom();
        this.createRacks();
        this.setupEventListeners();
        this.initCharts();
        this.updateStats();
        this.animate();
    }
    
    initThreeJS() {
        // 场景 - 使用深蓝色背景提高对比度
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0D1B2A);
        this.scene.fog = new THREE.Fog(0x0D1B2A, 50, 200);
        
        // 相机
        const canvas = document.getElementById('main-canvas');
        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(50, 40, 50);
        this.camera.lookAt(0, 0, 0);
        
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 灯光 - 增强照明效果
        const ambientLight = new THREE.AmbientLight(0x606060, 0.8);
        this.scene.add(ambientLight);
        
        // 主方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // 补充方向光 - 从另一侧照明，减少阴影
        const directionalLight2 = new THREE.DirectionalLight(0x88CCFF, 0.4);
        directionalLight2.position.set(-50, 50, -50);
        this.scene.add(directionalLight2);
        
        // 点光源 - 增强机柜区域的照明
        const rackLight = new THREE.PointLight(0xFFFFFF, 0.6, 200);
        rackLight.position.set(0, 30, 0);
        this.scene.add(rackLight);
        
        // 射线检测
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // 简单的轨道控制
        this.initControls();
    }
    
    initControls() {
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        
        const canvas = document.getElementById('main-canvas');
        
        canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                const deltaX = e.clientX - mouseX;
                const deltaY = e.clientY - mouseY;
                
                targetX += deltaX * 0.01;
                targetY += deltaY * 0.01;
                
                // 限制俯仰角
                targetY = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, targetY));
                
                mouseX = e.clientX;
                mouseY = e.clientY;
            }
        });
        
        // 滚轮缩放
        canvas.addEventListener('wheel', (e) => {
            const zoomSpeed = 0.1;
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            
            if (e.deltaY > 0) {
                this.camera.position.add(direction.multiplyScalar(zoomSpeed * 10));
            } else {
                this.camera.position.sub(direction.multiplyScalar(zoomSpeed * 10));
            }
        });
        
        // 动画循环中更新相机位置
        this.updateCameraPosition = () => {
            const radius = this.currentView === 'top' ? 80 : 70;
            const height = this.currentView === 'top' ? 100 : 40;
            
            if (this.currentView === 'perspective') {
                // 透视视图 - 允许自由旋转
                this.camera.position.x = Math.cos(targetY) * Math.cos(targetX) * radius;
                this.camera.position.y = Math.sin(targetY) * radius + height;
                this.camera.position.z = Math.cos(targetY) * Math.sin(targetX) * radius;
                this.camera.lookAt(0, 5, 0);
            } else {
                // 俯视图 - 固定角度
                this.camera.position.set(0, 100, 0.1);
                this.camera.lookAt(0, 0, 0);
            }
        };
    }
    
    initData() {
        // 生成机柜数据
        for (let row = 0; row < this.rackConfig.rows; row++) {
            for (let rackIndex = 0; rackIndex < this.rackConfig.racksPerRow; rackIndex++) {
                const rack = {
                    id: `R${row + 1}-${rackIndex + 1}`,
                    row: row,
                    index: rackIndex,
                    temperature: this.randomFloat(22, 48),
                    power: this.randomFloat(5, 20),
                    servers: []
                };
                
                // 为每个机柜生成服务器
                const serverCount = this.randomInt(20, 40);
                for (let unit = 0; unit < serverCount; unit++) {
                    const statuses = ['normal', 'normal', 'normal', 'normal', 'warning', 'error', 'offline'];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    
                    const server = {
                        id: `${rack.id}-U${unit + 1}`,
                        rackId: rack.id,
                        unit: unit,
                        status: status,
                        cpu: this.randomFloat(10, 90),
                        memory: this.randomFloat(20, 85),
                        disk: this.randomFloat(30, 95),
                        network: this.randomFloat(10, 80),
                        cpuHistory: this.generateHistory(10, 10, 90),
                        memoryHistory: this.generateHistory(10, 20, 85),
                        diskHistory: this.generateHistory(10, 30, 95),
                        networkHistory: this.generateHistory(10, 10, 80)
                    };
                    
                    rack.servers.push(server);
                    this.servers.push(server);
                }
                
                this.racks.push(rack);
            }
        }
    }
    
    generateHistory(length, min, max) {
        const history = [];
        for (let i = 0; i < length; i++) {
            history.push(this.randomFloat(min, max));
        }
        return history;
    }
    
    randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }
    
    randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }
    
    createRoom() {
        // 地板 - 使用深色但有对比度的颜色
        const floorGeometry = new THREE.PlaneGeometry(200, 150);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1B263B,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // 网格线 - 更亮的颜色提高对比度
        const gridHelper = new THREE.GridHelper(200, 20, 0x415A77, 0x2D4059);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
        
        // 墙壁 - 使用深蓝色调
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2D4059,
            roughness: 0.7,
            metalness: 0.1
        });
        
        // 后墙
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(200, 30, 0.5),
            wallMaterial
        );
        backWall.position.set(0, 15, -75);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // 左墙
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 30, 150),
            wallMaterial
        );
        leftWall.position.set(-100, 15, 0);
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        // 右墙
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 30, 150),
            wallMaterial
        );
        rightWall.position.set(100, 15, 0);
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
    }
    
    createRacks() {
        const rackWidth = 6;
        const rackDepth = 3;
        const rackHeight = 21; // 42U * 0.5m/U
        
        const rowSpacing = 15;
        const rackSpacing = 8;
        
        // 计算起始位置
        const startX = -(this.rackConfig.racksPerRow * rackSpacing) / 2 + rackSpacing / 2;
        const startZ = -(this.rackConfig.rows * rowSpacing) / 2 + rowSpacing / 2;
        
        this.racks.forEach((rack, index) => {
            const row = rack.row;
            const rackIndex = rack.index;
            
            const x = startX + rackIndex * rackSpacing;
            const z = startZ + row * rowSpacing;
            
            // 机柜组
            const rackGroup = new THREE.Group();
            rackGroup.position.set(x, 0, z);
            
            // 机柜主体 - 使用更浅的蓝灰色
            const rackGeometry = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth);
            const rackMaterial = new THREE.MeshStandardMaterial({ 
                color: this.rackColors.body,
                roughness: 0.5,
                metalness: 0.4
            });
            const rackMesh = new THREE.Mesh(rackGeometry, rackMaterial);
            rackMesh.position.y = rackHeight / 2;
            rackMesh.castShadow = true;
            rackMesh.receiveShadow = true;
            rackGroup.add(rackMesh);
            
            // 机柜边框 - 使用更深的颜色创建轮廓效果
            const frameThickness = 0.2;
            const frameMaterial = new THREE.MeshStandardMaterial({ 
                color: this.rackColors.frame,
                roughness: 0.4,
                metalness: 0.5
            });
            
            // 前边框
            const frontFrameTop = new THREE.Mesh(
                new THREE.BoxGeometry(rackWidth + frameThickness * 2, frameThickness, frameThickness),
                frameMaterial
            );
            frontFrameTop.position.set(0, rackHeight - frameThickness / 2, rackDepth / 2 + frameThickness / 2);
            rackGroup.add(frontFrameTop);
            
            const frontFrameBottom = new THREE.Mesh(
                new THREE.BoxGeometry(rackWidth + frameThickness * 2, frameThickness, frameThickness),
                frameMaterial
            );
            frontFrameBottom.position.set(0, frameThickness / 2, rackDepth / 2 + frameThickness / 2);
            rackGroup.add(frontFrameBottom);
            
            const frontFrameLeft = new THREE.Mesh(
                new THREE.BoxGeometry(frameThickness, rackHeight, frameThickness),
                frameMaterial
            );
            frontFrameLeft.position.set(-rackWidth / 2 - frameThickness / 2, rackHeight / 2, rackDepth / 2 + frameThickness / 2);
            rackGroup.add(frontFrameLeft);
            
            const frontFrameRight = new THREE.Mesh(
                new THREE.BoxGeometry(frameThickness, rackHeight, frameThickness),
                frameMaterial
            );
            frontFrameRight.position.set(rackWidth / 2 + frameThickness / 2, rackHeight / 2, rackDepth / 2 + frameThickness / 2);
            rackGroup.add(frontFrameRight);
            
            // 机柜前面板（深色半透明玻璃效果）
            const frontPanelGeometry = new THREE.BoxGeometry(rackWidth - 0.5, rackHeight - 0.5, 0.1);
            const frontPanelMaterial = new THREE.MeshStandardMaterial({ 
                color: this.rackColors.frontPanel,
                transparent: true,
                opacity: 0.4,
                roughness: 0.1,
                metalness: 0.9
            });
            const frontPanel = new THREE.Mesh(frontPanelGeometry, frontPanelMaterial);
            frontPanel.position.y = rackHeight / 2;
            frontPanel.position.z = rackDepth / 2 + 0.1;
            rackGroup.add(frontPanel);
            
            // 机柜标签
            this.createRackLabel(rackGroup, rack.id, rackWidth, rackHeight, rackDepth);
            
            // 服务器
            const serverHeight = 0.45;
            const serverWidth = rackWidth - 0.5;
            const serverDepth = rackDepth - 0.5;
            
            rack.servers.forEach((server, serverIndex) => {
                const unit = server.unit;
                const y = unit * 0.5 + 1; // 从底部开始
                
                const serverGeometry = new THREE.BoxGeometry(serverWidth, serverHeight, serverDepth);
                const serverMaterial = new THREE.MeshStandardMaterial({ 
                    color: this.statusColors[server.status],
                    roughness: 0.3,
                    metalness: 0.7,
                    emissive: this.statusColors[server.status],
                    emissiveIntensity: server.status === 'error' ? 0.5 : 0.3
                });
                
                const serverMesh = new THREE.Mesh(serverGeometry, serverMaterial);
                serverMesh.position.y = y;
                serverMesh.position.z = 0;
                serverMesh.castShadow = true;
                serverMesh.receiveShadow = true;
                
                // 存储服务器数据
                serverMesh.userData = {
                    type: 'server',
                    server: server,
                    rack: rack
                };
                
                rackGroup.add(serverMesh);
                
                // 服务器前面板 - 更明显的状态显示
                const frontPanelGeometry = new THREE.BoxGeometry(serverWidth - 0.2, serverHeight - 0.05, 0.08);
                const frontPanelMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x1A1A2E,
                    roughness: 0.2,
                    metalness: 0.8
                });
                const frontPanel = new THREE.Mesh(frontPanelGeometry, frontPanelMaterial);
                frontPanel.position.y = y;
                frontPanel.position.z = rackDepth / 2 - 0.05;
                rackGroup.add(frontPanel);
                
                // 状态指示灯 - 更大更亮
                const indicatorGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.1);
                const indicatorMaterial = new THREE.MeshStandardMaterial({ 
                    color: this.statusColors[server.status],
                    emissive: this.statusColors[server.status],
                    emissiveIntensity: server.status === 'error' ? 1.2 : 0.8
                });
                
                const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                indicator.position.y = y;
                indicator.position.z = rackDepth / 2 + 0.15;
                indicator.position.x = -serverWidth / 2 + 1.5;
                
                // 存储指示灯数据
                indicator.userData = {
                    type: 'indicator',
                    server: server,
                    rack: rack,
                    originalEmissiveIntensity: indicatorMaterial.emissiveIntensity
                };
                
                rackGroup.add(indicator);
                
                // 第二个指示灯 - 显示在右侧
                const indicator2Geometry = new THREE.BoxGeometry(0.3, 0.1, 0.08);
                const indicator2Material = new THREE.MeshStandardMaterial({ 
                    color: this.statusColors[server.status],
                    emissive: this.statusColors[server.status],
                    emissiveIntensity: server.status === 'error' ? 1.0 : 0.6
                });
                
                const indicator2 = new THREE.Mesh(indicator2Geometry, indicator2Material);
                indicator2.position.y = y;
                indicator2.position.z = rackDepth / 2 + 0.15;
                indicator2.position.x = serverWidth / 2 - 1.5;
                
                indicator2.userData = {
                    type: 'indicator',
                    server: server,
                    rack: rack,
                    originalEmissiveIntensity: indicator2Material.emissiveIntensity
                };
                
                rackGroup.add(indicator2);
            });
            
            // 机柜顶部热图
            this.createHeatMap(rackGroup, rack, rackWidth, rackDepth, rackHeight);
            
            // 存储机柜数据
            rackGroup.userData = {
                type: 'rack',
                rack: rack
            };
            
            this.scene.add(rackGroup);
            rack.mesh = rackGroup;
        });
    }
    
    createHeatMap(rackGroup, rack, rackWidth, rackDepth, rackHeight) {
        // 创建一个平面作为热图
        const heatMapGeometry = new THREE.PlaneGeometry(rackWidth - 0.5, rackDepth - 0.5);
        
        // 根据温度计算颜色
        const color = this.getTemperatureColor(rack.temperature);
        const heatMapMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8,
            emissive: color,
            emissiveIntensity: 0.3
        });
        
        const heatMap = new THREE.Mesh(heatMapGeometry, heatMapMaterial);
        heatMap.rotation.x = -Math.PI / 2;
        heatMap.position.y = rackHeight + 0.1;
        
        // 存储热图数据
        heatMap.userData = {
            type: 'heatmap',
            rack: rack
        };
        
        rackGroup.add(heatMap);
        
        // 温度和功率标签
        this.createLabel(rackGroup, `T: ${rack.temperature.toFixed(1)}°C`, 
            rackWidth / 2 - 1, rackHeight + 1, rackDepth / 2 + 0.5, 0xffffff);
        this.createLabel(rackGroup, `P: ${rack.power.toFixed(1)}kW`, 
            -rackWidth / 2 + 1, rackHeight + 1, rackDepth / 2 + 0.5, 0x4CAF50);
    }
    
    createLabel(rackGroup, text, x, y, z, color) {
        // 创建一个简单的平面作为标签
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'Bold 24px Arial';
        context.fillStyle = '#' + color.toString(16).padStart(6, '0');
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 8);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const geometry = new THREE.PlaneGeometry(3, 0.75);
        const label = new THREE.Mesh(geometry, material);
        label.position.set(x, y, z);
        label.rotation.x = -Math.PI / 4;
        
        rackGroup.add(label);
    }
    
    createRackLabel(rackGroup, rackId, rackWidth, rackHeight, rackDepth) {
        // 创建机柜标签 - 显示机柜编号
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        // 背景
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 边框
        context.strokeStyle = '#4FC3F7';
        context.lineWidth = 4;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        // 机柜编号
        context.font = 'Bold 48px Arial';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'center';
        context.fillText(rackId, canvas.width / 2, canvas.height / 2 + 15);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const geometry = new THREE.PlaneGeometry(4, 2);
        const label = new THREE.Mesh(geometry, material);
        
        // 放置在机柜顶部前方
        label.position.set(0, rackHeight + 2, rackDepth / 2 + 0.5);
        label.rotation.x = -Math.PI / 6;
        
        rackGroup.add(label);
    }
    
    getTemperatureColor(temperature) {
        // 找到最接近的温度颜色
        for (let i = 0; i < this.tempColors.length - 1; i++) {
            if (temperature >= this.tempColors[i].temp && temperature <= this.tempColors[i + 1].temp) {
                const t = (temperature - this.tempColors[i].temp) / 
                         (this.tempColors[i + 1].temp - this.tempColors[i].temp);
                
                const color1 = new THREE.Color(this.tempColors[i].color);
                const color2 = new THREE.Color(this.tempColors[i + 1].color);
                
                return color1.lerp(color2, t).getHex();
            }
        }
        
        return this.tempColors[this.tempColors.length - 1].color;
    }
    
    setupEventListeners() {
        const canvas = document.getElementById('main-canvas');
        
        // 鼠标移动
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // 点击
        canvas.addEventListener('click', (e) => this.onClick(e));
        
        // 视图切换按钮
        document.getElementById('top-view-btn').addEventListener('click', () => {
            this.switchView('top');
        });
        
        document.getElementById('perspective-view-btn').addEventListener('click', () => {
            this.switchView('perspective');
        });
        
        // 关闭服务器详情
        document.getElementById('close-server-detail').addEventListener('click', () => {
            this.hideServerDetail();
        });
        
        // 优化按钮
        document.getElementById('optimization-btn').addEventListener('click', () => {
            this.showOptimization();
        });
        
        document.getElementById('close-optimization').addEventListener('click', () => {
            this.hideOptimization();
        });
        
        // 窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onMouseMove(event) {
        const canvas = document.getElementById('main-canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.checkHover();
    }
    
    checkHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // 检测所有机柜和服务器
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        let hoveredRack = null;
        let hoveredServer = null;
        
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            
            if (object.userData) {
                if (object.userData.type === 'rack') {
                    hoveredRack = object.userData.rack;
                    break;
                } else if (object.userData.type === 'server' || object.userData.type === 'indicator') {
                    hoveredServer = object.userData.server;
                    hoveredRack = object.userData.rack;
                    break;
                }
            }
        }
        
        // 高亮悬停的机柜
        if (hoveredRack && hoveredRack !== this.hoveredRack) {
            // 恢复之前高亮的机柜
            if (this.hoveredRack && this.hoveredRack.mesh) {
                this.setRackHighlight(this.hoveredRack, false);
            }
            
            // 高亮新的机柜
            this.setRackHighlight(hoveredRack, true);
            this.hoveredRack = hoveredRack;
            
            // 显示机柜信息
            this.showRackInfo(hoveredRack);
        } else if (!hoveredRack && this.hoveredRack) {
            // 恢复高亮
            this.setRackHighlight(this.hoveredRack, false);
            this.hoveredRack = null;
            
            // 隐藏机柜信息（如果没有选择服务器）
            if (!this.selectedServer) {
                this.hideRackInfo();
            }
        }
    }
    
    setRackHighlight(rack, highlight) {
        if (!rack.mesh) return;
        
        rack.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                // 只高亮机柜主体，不影响服务器和指示灯
                if (child.geometry.type === 'BoxGeometry' && 
                    child.material.color.getHex() === 0x555555) {
                    if (highlight) {
                        child.material.emissive = new THREE.Color(0x4CAF50);
                        child.material.emissiveIntensity = 0.2;
                    } else {
                        child.material.emissive = new THREE.Color(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                }
            }
        });
    }
    
    onClick(event) {
        const canvas = document.getElementById('main-canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            
            if (object.userData && 
                (object.userData.type === 'server' || object.userData.type === 'indicator')) {
                const server = object.userData.server;
                this.selectServer(server);
                return;
            }
        }
        
        // 如果没有点击到服务器，隐藏服务器详情
        this.hideServerDetail();
    }
    
    selectServer(server) {
        this.selectedServer = server;
        
        // 高亮选中的服务器
        this.highlightServer(server);
        
        // 显示服务器详情
        this.showServerDetail(server);
        
        // 更新图表
        this.updateCharts(server);
    }
    
    highlightServer(server) {
        // 恢复之前选中的服务器
        if (this.selectedServer && this.selectedServer !== server) {
            this.restoreServerHighlight(this.selectedServer);
        }
        
        // 遍历所有机柜找到服务器
        this.racks.forEach(rack => {
            if (rack.mesh) {
                rack.mesh.traverse((child) => {
                    if (child.isMesh && child.userData && 
                        (child.userData.type === 'server' || child.userData.type === 'indicator')) {
                        if (child.userData.server === server) {
                            // 高亮
                            if (child.userData.type === 'server') {
                                child.material.emissive = new THREE.Color(0xffffff);
                                child.material.emissiveIntensity = 0.5;
                            } else {
                                child.material.emissiveIntensity = 1.0;
                            }
                        }
                    }
                });
            }
        });
    }
    
    restoreServerHighlight(server) {
        this.racks.forEach(rack => {
            if (rack.mesh) {
                rack.mesh.traverse((child) => {
                    if (child.isMesh && child.userData && 
                        (child.userData.type === 'server' || child.userData.type === 'indicator')) {
                        if (child.userData.server === server) {
                            // 恢复原始颜色
                            const statusColor = this.statusColors[server.status];
                            child.material.emissive = new THREE.Color(statusColor);
                            child.material.emissiveIntensity = server.status === 'error' ? 0.3 : 0.1;
                            
                            if (child.userData.type === 'indicator') {
                                child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
                            }
                        }
                    }
                });
            }
        });
    }
    
    showRackInfo(rack) {
        const rackInfo = document.getElementById('rack-info');
        const rackTitle = document.getElementById('rack-title');
        const rackTemperature = document.getElementById('rack-temperature');
        const rackPower = document.getElementById('rack-power');
        const serversContainer = document.getElementById('servers-container');
        
        // 显示机柜信息
        rackInfo.style.display = 'block';
        rackTitle.textContent = `机柜 ${rack.id}`;
        rackTemperature.textContent = `${rack.temperature.toFixed(1)} °C`;
        rackPower.textContent = `${rack.power.toFixed(1)} kW`;
        
        // 清空服务器列表
        serversContainer.innerHTML = '';
        
        // 添加服务器列表
        rack.servers.forEach(server => {
            const serverItem = document.createElement('div');
            serverItem.className = 'server-item';
            
            const statusClass = `status-${server.status}`;
            const statusText = this.getStatusText(server.status);
            
            serverItem.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <span class="server-status ${statusClass}"></span>
                    <span>${server.id}</span>
                </div>
                <span>${statusText}</span>
            `;
            
            serverItem.addEventListener('click', () => {
                this.selectServer(server);
            });
            
            serversContainer.appendChild(serverItem);
        });
        
        // 隐藏服务器详情和优化面板
        if (!this.selectedServer) {
            document.getElementById('server-detail').style.display = 'none';
        }
        document.getElementById('optimization-panel').style.display = 'none';
    }
    
    hideRackInfo() {
        document.getElementById('rack-info').style.display = 'none';
    }
    
    showServerDetail(server) {
        const serverDetail = document.getElementById('server-detail');
        const serverTitle = document.getElementById('server-title');
        const serverStatus = document.getElementById('server-status');
        const serverPosition = document.getElementById('server-position');
        
        // 显示服务器详情
        serverDetail.style.display = 'block';
        serverTitle.textContent = `服务器 ${server.id}`;
        serverStatus.textContent = this.getStatusText(server.status);
        serverPosition.textContent = `机柜 ${server.rackId}, U${server.unit + 1}`;
        
        // 确保机柜信息也显示
        const rack = this.racks.find(r => r.id === server.rackId);
        if (rack) {
            this.showRackInfo(rack);
        }
    }
    
    hideServerDetail() {
        if (this.selectedServer) {
            this.restoreServerHighlight(this.selectedServer);
            this.selectedServer = null;
        }
        
        document.getElementById('server-detail').style.display = 'none';
    }
    
    getStatusText(status) {
        const statusTexts = {
            normal: '正常',
            warning: '告警',
            error: '故障',
            offline: '下线'
        };
        return statusTexts[status] || status;
    }
    
    initCharts() {
        const chartConfig = {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: false
            }
        };
        
        // CPU图表
        const cpuCtx = document.getElementById('cpu-chart').getContext('2d');
        this.charts.cpu = new Chart(cpuCtx, {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        });
        
        // 内存图表
        const memoryCtx = document.getElementById('memory-chart').getContext('2d');
        this.charts.memory = new Chart(memoryCtx, {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        });
        
        // 磁盘图表
        const diskCtx = document.getElementById('disk-chart').getContext('2d');
        this.charts.disk = new Chart(diskCtx, {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        });
        
        // 网络图表
        const networkCtx = document.getElementById('network-chart').getContext('2d');
        this.charts.network = new Chart(networkCtx, {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: '#9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        });
    }
    
    updateCharts(server) {
        const labels = server.cpuHistory.map((_, i) => `t${i + 1}`);
        
        // 更新CPU图表
        this.charts.cpu.data.labels = labels;
        this.charts.cpu.data.datasets[0].data = [...server.cpuHistory];
        this.charts.cpu.update();
        
        // 更新内存图表
        this.charts.memory.data.labels = labels;
        this.charts.memory.data.datasets[0].data = [...server.memoryHistory];
        this.charts.memory.update();
        
        // 更新磁盘图表
        this.charts.disk.data.labels = labels;
        this.charts.disk.data.datasets[0].data = [...server.diskHistory];
        this.charts.disk.update();
        
        // 更新网络图表
        this.charts.network.data.labels = labels;
        this.charts.network.data.datasets[0].data = [...server.networkHistory];
        this.charts.network.update();
    }
    
    switchView(view) {
        this.currentView = view;
        
        // 更新按钮状态
        document.getElementById('top-view-btn').classList.toggle('active', view === 'top');
        document.getElementById('perspective-view-btn').classList.toggle('active', view === 'perspective');
    }
    
    updateStats() {
        // 计算统计数据
        let totalPower = 0;
        let totalTemperature = 0;
        let normalCount = 0;
        let warningCount = 0;
        let errorCount = 0;
        let offlineCount = 0;
        
        // 计算机柜统计
        this.racks.forEach(rack => {
            totalPower += rack.power;
            totalTemperature += rack.temperature;
        });
        
        // 计算服务器统计
        this.servers.forEach(server => {
            switch (server.status) {
                case 'normal':
                    normalCount++;
                    break;
                case 'warning':
                    warningCount++;
                    break;
                case 'error':
                    errorCount++;
                    break;
                case 'offline':
                    offlineCount++;
                    break;
            }
        });
        
        // 更新UI
        document.getElementById('total-power').textContent = `${totalPower.toFixed(1)} kW`;
        document.getElementById('avg-temperature').textContent = `${(totalTemperature / this.racks.length).toFixed(1)} °C`;
        document.getElementById('normal-servers').textContent = normalCount;
        document.getElementById('warning-servers').textContent = warningCount;
        document.getElementById('error-servers').textContent = errorCount;
        document.getElementById('offline-servers').textContent = offlineCount;
    }
    
    showOptimization() {
        const optimizationPanel = document.getElementById('optimization-panel');
        const optimizationResults = document.getElementById('optimization-results');
        
        // 隐藏其他面板
        document.getElementById('rack-info').style.display = 'none';
        document.getElementById('server-detail').style.display = 'none';
        
        optimizationPanel.style.display = 'block';
        
        // 生成优化建议
        const recommendations = this.generateOptimizationRecommendations();
        
        // 显示建议
        optimizationResults.innerHTML = '';
        
        recommendations.forEach((rec, index) => {
            const recItem = document.createElement('div');
            recItem.className = 'optimization-item';
            recItem.innerHTML = `
                <h4>建议 ${index + 1}: ${rec.title}</h4>
                <p>${rec.description}</p>
                <p><strong>预期效果:</strong> ${rec.benefit}</p>
            `;
            optimizationResults.appendChild(recItem);
        });
    }
    
    hideOptimization() {
        document.getElementById('optimization-panel').style.display = 'none';
    }
    
    generateOptimizationRecommendations() {
        const recommendations = [];
        
        // 1. 温度优化建议
        const hotRacks = this.racks.filter(r => r.temperature > 40);
        if (hotRacks.length > 0) {
            recommendations.push({
                title: '温度优化',
                description: `检测到 ${hotRacks.length} 个机柜温度超过40°C。建议将高负载服务器迁移到温度较低的机柜，或增加这些机柜的制冷能力。`,
                benefit: '预计可降低整体温度3-5°C，减少热故障风险。'
            });
        }
        
        // 2. 负载均衡建议
        const highLoadServers = this.servers.filter(s => s.status === 'normal' && s.cpu > 80);
        const lowLoadServers = this.servers.filter(s => s.status === 'normal' && s.cpu < 30);
        
        if (highLoadServers.length > 0 && lowLoadServers.length > 0) {
            recommendations.push({
                title: '负载均衡',
                description: `检测到 ${highLoadServers.length} 台高负载服务器(CPU>80%)和 ${lowLoadServers.length} 台低负载服务器(CPU<30%)。建议将部分负载从高负载服务器迁移到低负载服务器。`,
                benefit: '提高资源利用率，减少单点故障风险。'
            });
        }
        
        // 3. 故障服务器处理
        const errorServers = this.servers.filter(s => s.status === 'error');
        if (errorServers.length > 0) {
            recommendations.push({
                title: '故障服务器处理',
                description: `检测到 ${errorServers.length} 台故障服务器。建议立即维修或更换这些服务器，并将其负载迁移到其他正常服务器。`,
                benefit: '恢复业务连续性，提高系统可靠性。'
            });
        }
        
        // 4. 告警服务器处理
        const warningServers = this.servers.filter(s => s.status === 'warning');
        if (warningServers.length > 0) {
            recommendations.push({
                title: '告警服务器监控',
                description: `检测到 ${warningServers.length} 台告警服务器。建议密切监控这些服务器的状态，必要时进行预防性维护。`,
                benefit: '预防潜在故障，提高系统稳定性。'
            });
        }
        
        // 5. 能量优化
        const offlineServers = this.servers.filter(s => s.status === 'offline');
        if (offlineServers.length > 0) {
            recommendations.push({
                title: '能量优化',
                description: `检测到 ${offlineServers.length} 台下线服务器。建议关闭这些服务器的电源，或重新利用它们来分担其他服务器的负载。`,
                benefit: '降低能耗，节省运营成本。'
            });
        }
        
        // 如果没有特殊建议，提供通用建议
        if (recommendations.length === 0) {
            recommendations.push({
                title: '整体状态良好',
                description: '当前机房运行状态良好，所有指标均在正常范围内。建议继续保持当前的监控和维护策略。',
                benefit: '维持系统稳定运行。'
            });
        }
        
        return recommendations;
    }
    
    onWindowResize() {
        const canvas = document.getElementById('main-canvas');
        const aspect = canvas.clientWidth / canvas.clientHeight;
        
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 更新相机位置
        if (this.updateCameraPosition) {
            this.updateCameraPosition();
        }
        
        // 更新闪烁效果
        this.updateBlinking();
        
        // 更新模拟数据
        this.updateSimulationData();
        
        // 渲染
        this.renderer.render(this.scene, this.camera);
    }
    
    updateBlinking() {
        const time = Date.now() * 0.005;
        
        // 为故障服务器添加闪烁效果
        this.racks.forEach(rack => {
            if (rack.mesh) {
                rack.mesh.traverse((child) => {
                    if (child.isMesh && child.userData && 
                        (child.userData.type === 'server' || child.userData.type === 'indicator')) {
                        const server = child.userData.server;
                        if (server.status === 'error') {
                            // 闪烁效果
                            const intensity = 0.5 + 0.5 * Math.sin(time * 2);
                            child.material.emissiveIntensity = intensity * 
                                (child.userData.type === 'indicator' ? 1.0 : 0.3);
                        }
                    }
                });
            }
        });
    }
    
    updateSimulationData() {
        // 每5秒更新一次模拟数据
        if (!this.lastUpdateTime || Date.now() - this.lastUpdateTime > 5000) {
            this.lastUpdateTime = Date.now();
            
            // 更新服务器指标
            this.servers.forEach(server => {
                // 只更新正常和告警服务器
                if (server.status === 'normal' || server.status === 'warning') {
                    // 小幅度随机变化
                    const delta = (Math.random() - 0.5) * 10;
                    
                    server.cpu = Math.max(5, Math.min(95, server.cpu + delta));
                    server.memory = Math.max(10, Math.min(95, server.memory + delta * 0.5));
                    server.disk = Math.max(20, Math.min(98, server.disk + delta * 0.2));
                    server.network = Math.max(5, Math.min(95, server.network + delta * 0.8));
                    
                    // 更新历史数据
                    server.cpuHistory.shift();
                    server.cpuHistory.push(server.cpu);
                    
                    server.memoryHistory.shift();
                    server.memoryHistory.push(server.memory);
                    
                    server.diskHistory.shift();
                    server.diskHistory.push(server.disk);
                    
                    server.networkHistory.shift();
                    server.networkHistory.push(server.network);
                }
            });
            
            // 更新机柜温度和功率
            this.racks.forEach(rack => {
                // 计算机柜内服务器的平均负载
                let totalLoad = 0;
                let serverCount = 0;
                
                rack.servers.forEach(server => {
                    if (server.status !== 'offline') {
                        totalLoad += (server.cpu + server.memory) / 2;
                        serverCount++;
                    }
                });
                
                const avgLoad = serverCount > 0 ? totalLoad / serverCount : 0;
                
                // 根据负载调整温度和功率
                rack.temperature = 22 + (avgLoad / 100) * 28; // 22-50°C
                rack.power = 5 + (avgLoad / 100) * 15; // 5-20kW
                
                // 更新热图颜色
                if (rack.mesh) {
                    rack.mesh.traverse((child) => {
                        if (child.isMesh && child.userData && child.userData.type === 'heatmap') {
                            const color = this.getTemperatureColor(rack.temperature);
                            child.material.color.setHex(color);
                            child.material.emissive.setHex(color);
                        }
                    });
                }
            });
            
            // 更新统计
            this.updateStats();
            
            // 如果有选中的服务器，更新图表
            if (this.selectedServer) {
                this.updateCharts(this.selectedServer);
            }
        }
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    new DataCenterVisualization();
});