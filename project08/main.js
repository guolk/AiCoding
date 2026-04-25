// 全局变量
let scene, camera, renderer, controls;
let buildings = [];
let isNightMode = false;
let isTopView = false;
let raycaster, mouse;
let selectedBuilding = null;
let windowLights = [];
let isCameraAnimating = false;

// 建筑用途配置
const buildingPurposes = [
    { 
        name: '办公楼', 
        color: 0x3a6ea5, 
        accentColor: 0x5a8fc5,
        minFloors: 15, 
        maxFloors: 40,
        windowColor: 0x1a2a3a,
        glassReflectivity: 0.8
    },
    { 
        name: '住宅楼', 
        color: 0x5a8a5a, 
        accentColor: 0x7aaa7a,
        minFloors: 10, 
        maxFloors: 25,
        windowColor: 0x2a3a2a,
        glassReflectivity: 0.5
    },
    { 
        name: '商业中心', 
        color: 0x8a6a2a, 
        accentColor: 0xaa8a4a,
        minFloors: 5, 
        maxFloors: 15,
        windowColor: 0x3a2a1a,
        glassReflectivity: 0.9
    },
    { 
        name: '酒店', 
        color: 0x5a3a6a, 
        accentColor: 0x7a5a8a,
        minFloors: 12, 
        maxFloors: 30,
        windowColor: 0x2a1a3a,
        glassReflectivity: 0.7
    },
    { 
        name: '医院', 
        color: 0x8a3a3a, 
        accentColor: 0xaa5a5a,
        minFloors: 8, 
        maxFloors: 20,
        windowColor: 0x3a1a1a,
        glassReflectivity: 0.4
    },
    { 
        name: '学校', 
        color: 0x3a6a5a, 
        accentColor: 0x5a8a7a,
        minFloors: 5, 
        maxFloors: 12,
        windowColor: 0x1a2a2a,
        glassReflectivity: 0.6
    }
];

// 建筑名称前缀
const namePrefixes = ['环球', '新世纪', '天际', '云端', '金色', '阳光', '翡翠', '钻石', '银河', '星辰'];
const nameSuffixes = ['大厦', '广场', '中心', '塔', '楼', '阁', '轩', '苑', '城', '府'];

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 40, 30);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // 添加轨道控制器 - 优化流畅度
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 15;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.screenSpacePanning = true;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.6;
    controls.panSpeed = 0.5;
    controls.target.set(0, 15, 0);
    
    // 初始化射线投射器和鼠标向量
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // 添加灯光
    setupLighting();
    
    // 创建地面
    createGround();
    
    // 生成城市网格
    generateCity();
    
    // 更新排行榜
    updateRanking();
    
    // 添加事件监听
    addEventListeners();
    
    // 开始动画循环
    animate();
}

// 设置灯光
function setupLighting() {
    // 环境光 - 更柔和
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);
    
    // 半球光 - 模拟天空光
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x2ecc71, 0.4);
    hemiLight.name = 'hemiLight';
    scene.add(hemiLight);
    
    // 主光源（太阳光）
    const directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
    directionalLight.position.set(60, 100, 40);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 300;
    directionalLight.shadow.camera.left = -80;
    directionalLight.shadow.camera.right = 80;
    directionalLight.shadow.camera.top = 80;
    directionalLight.shadow.camera.bottom = -80;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.radius = 2;
    directionalLight.name = 'directionalLight';
    scene.add(directionalLight);
    
    // 添加补光
    const fillLight = new THREE.DirectionalLight(0x8ec8e8, 0.3);
    fillLight.position.set(-40, 50, -30);
    fillLight.name = 'fillLight';
    scene.add(fillLight);
}

// 创建地面
function createGround() {
    // 创建地面几何体 - 细分更多以获得更好的光照效果
    const groundGeometry = new THREE.PlaneGeometry(150, 150, 50, 50);
    
    // 使用更真实的草地材质
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7a3a,
        roughness: 0.95,
        metalness: 0.0
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // 添加道路网格 - 更细的道路
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.85,
        metalness: 0.05
    });
    
    // 人行道材质
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.0
    });
    
    for (let i = -5; i <= 5; i++) {
        if (i === 0) continue;
        
        // 主道路
        const horizontalRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(150, 3),
            roadMaterial
        );
        horizontalRoad.rotation.x = -Math.PI / 2;
        horizontalRoad.position.set(0, 0.02, i * 10);
        horizontalRoad.receiveShadow = true;
        scene.add(horizontalRoad);
        
        const verticalRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 150),
            roadMaterial
        );
        verticalRoad.rotation.x = -Math.PI / 2;
        verticalRoad.position.set(i * 10, 0.02, 0);
        verticalRoad.receiveShadow = true;
        scene.add(verticalRoad);
        
        // 人行道
        const horizontalSidewalk1 = new THREE.Mesh(
            new THREE.PlaneGeometry(150, 1),
            sidewalkMaterial
        );
        horizontalSidewalk1.rotation.x = -Math.PI / 2;
        horizontalSidewalk1.position.set(0, 0.015, i * 10 + 2);
        horizontalSidewalk1.receiveShadow = true;
        scene.add(horizontalSidewalk1);
        
        const horizontalSidewalk2 = new THREE.Mesh(
            new THREE.PlaneGeometry(150, 1),
            sidewalkMaterial
        );
        horizontalSidewalk2.rotation.x = -Math.PI / 2;
        horizontalSidewalk2.position.set(0, 0.015, i * 10 - 2);
        horizontalSidewalk2.receiveShadow = true;
        scene.add(horizontalSidewalk2);
        
        const verticalSidewalk1 = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 150),
            sidewalkMaterial
        );
        verticalSidewalk1.rotation.x = -Math.PI / 2;
        verticalSidewalk1.position.set(i * 10 + 2, 0.015, 0);
        verticalSidewalk1.receiveShadow = true;
        scene.add(verticalSidewalk1);
        
        const verticalSidewalk2 = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 150),
            sidewalkMaterial
        );
        verticalSidewalk2.rotation.x = -Math.PI / 2;
        verticalSidewalk2.position.set(i * 10 - 2, 0.015, 0);
        verticalSidewalk2.receiveShadow = true;
        scene.add(verticalSidewalk2);
        
        // 道路标线
        addRoadMarkings(0, i * 10, true);
        addRoadMarkings(i * 10, 0, false);
    }
    
    // 添加一些树木作为装饰
    addTrees();
}

// 添加道路标线
function addRoadMarkings(x, z, isHorizontal) {
    const markingMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        roughness: 0.9,
        emissive: 0xffffcc,
        emissiveIntensity: 0.1
    });
    
    const markingWidth = 0.15;
    const markingLength = 1.5;
    const markingSpacing = 3;
    
    for (let i = -20; i < 20; i++) {
        const marking = new THREE.Mesh(
            new THREE.PlaneGeometry(isHorizontal ? markingLength : markingWidth, isHorizontal ? markingWidth : markingLength),
            markingMaterial
        );
        marking.rotation.x = -Math.PI / 2;
        marking.position.set(
            isHorizontal ? i * markingSpacing : x,
            0.03,
            isHorizontal ? z : i * markingSpacing
        );
        scene.add(marking);
    }
}

// 添加树木
function addTrees() {
    const treePositions = [
        [-22, -22], [22, -22], [-22, 22], [22, 22],
        [-22, 0], [22, 0], [0, -22], [0, 22],
        [-35, -35], [35, -35], [-35, 35], [35, 35],
        [-35, 0], [35, 0], [0, -35], [0, 35]
    ];
    
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a3a1a,
        roughness: 0.9
    });
    
    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a5a2a,
        roughness: 0.8
    });
    
    treePositions.forEach(([x, z]) => {
        // 树干
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);
        
        // 树冠
        const foliageGeometry = new THREE.SphereGeometry(2.5, 8, 8);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 4, z);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        scene.add(foliage);
    });
}

// 生成城市
function generateCity() {
    const gridSize = 10;
    const spacing = 10;
    const offset = (gridSize - 1) * spacing / 2;
    
    for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
            const purposeIndex = Math.floor(Math.random() * buildingPurposes.length);
            const purpose = buildingPurposes[purposeIndex];
            
            const floors = Math.floor(Math.random() * (purpose.maxFloors - purpose.minFloors + 1)) + purpose.minFloors;
            const floorHeight = 3.0;
            const buildingHeight = floors * floorHeight;
            
            const width = 4 + Math.random() * 3;
            const depth = 4 + Math.random() * 3;
            
            const namePrefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
            const nameSuffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
            const buildingName = namePrefix + nameSuffix;
            
            const building = createBuilding(
                width, buildingHeight, depth,
                purpose,
                {
                    name: buildingName,
                    floors: floors,
                    purpose: purpose.name,
                    height: buildingHeight
                }
            );
            
            building.position.set(
                x * spacing - offset,
                0,
                z * spacing - offset
            );
            
            scene.add(building);
            buildings.push(building);
        }
    }
}

// 创建建筑 - 更真实的风格
function createBuilding(width, height, depth, purpose, info) {
    const buildingGroup = new THREE.Group();
    
    // 建筑主体 - 使用分段几何体获得更好的光照
    const geometry = new THREE.BoxGeometry(width, height, depth, 4, Math.floor(info.floors), 4);
    
    // 创建渐变材质效果
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: purpose.color,
        roughness: 0.7,
        metalness: 0.15,
        flatShading: false
    });
    
    const buildingMesh = new THREE.Mesh(geometry, buildingMaterial);
    buildingMesh.position.y = height / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    buildingGroup.add(buildingMesh);
    
    // 添加屋顶细节
    addRoofDetails(buildingGroup, width, height, depth, purpose);
    
    // 添加底层入口
    addEntrance(buildingGroup, width, depth, purpose);
    
    // 创建窗户
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: purpose.windowColor,
        roughness: 0.1,
        metalness: purpose.glassReflectivity,
        transparent: true,
        opacity: 0.9
    });
    
    const windowFrameMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const windowLightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffcc66,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0
    });
    
    const windowWidth = 0.8;
    const windowHeight = 1.8;
    const horizontalSpacing = 1.5;
    const verticalSpacing = 3.0;
    
    const windowPositions = [];
    
    // 计算每层的窗户数量
    const windowsPerFloorFront = Math.floor((width - 1.5) / horizontalSpacing);
    const windowsPerFloorSide = Math.floor((depth - 1.5) / horizontalSpacing);
    
    // 每层创建窗户 - 留出底层和顶层
    for (let floor = 1; floor < info.floors - 1; floor++) {
        const yPos = floor * verticalSpacing + windowHeight / 2 + 0.5;
        
        // 前后面窗户
        for (let w = 0; w < windowsPerFloorFront; w++) {
            const xPos = -width / 2 + 0.75 + w * horizontalSpacing + horizontalSpacing / 2;
            
            windowPositions.push({ 
                x: xPos, 
                y: yPos, 
                z: depth / 2 + 0.01, 
                face: 'front',
                isCorner: false
            });
            windowPositions.push({ 
                x: xPos, 
                y: yPos, 
                z: -depth / 2 - 0.01, 
                face: 'back',
                isCorner: false
            });
        }
        
        // 左右面窗户
        for (let w = 0; w < windowsPerFloorSide; w++) {
            const zPos = -depth / 2 + 0.75 + w * horizontalSpacing + horizontalSpacing / 2;
            
            windowPositions.push({ 
                x: width / 2 + 0.01, 
                y: yPos, 
                z: zPos, 
                face: 'right',
                isCorner: false
            });
            windowPositions.push({ 
                x: -width / 2 - 0.01, 
                y: yPos, 
                z: zPos, 
                face: 'left',
                isCorner: false
            });
        }
    }
    
    // 创建窗户
    windowPositions.forEach((pos, index) => {
        // 窗户玻璃
        const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial.clone());
        
        // 窗户框架
        const frameThickness = 0.08;
        const frameOuter = new THREE.Mesh(
            new THREE.PlaneGeometry(windowWidth + frameThickness * 2, windowHeight + frameThickness * 2),
            windowFrameMaterial
        );
        
        // 设置旋转
        if (pos.face === 'front') {
            windowMesh.rotation.y = 0;
            frameOuter.rotation.y = 0;
        } else if (pos.face === 'back') {
            windowMesh.rotation.y = Math.PI;
            frameOuter.rotation.y = Math.PI;
        } else if (pos.face === 'right') {
            windowMesh.rotation.y = Math.PI / 2;
            frameOuter.rotation.y = Math.PI / 2;
        } else if (pos.face === 'left') {
            windowMesh.rotation.y = -Math.PI / 2;
            frameOuter.rotation.y = -Math.PI / 2;
        }
        
        windowMesh.position.set(pos.x, pos.y, pos.z);
        frameOuter.position.set(pos.x, pos.y, pos.z);
        
        // 调整z位置，确保框架在玻璃后面
        const frameOffset = 0.005;
        if (pos.face === 'front') frameOuter.position.z -= frameOffset;
        else if (pos.face === 'back') frameOuter.position.z += frameOffset;
        else if (pos.face === 'right') frameOuter.position.x -= frameOffset;
        else if (pos.face === 'left') frameOuter.position.x += frameOffset;
        
        buildingGroup.add(frameOuter);
        buildingGroup.add(windowMesh);
        
        // 窗户灯光（夜晚效果）
        const windowLightMesh = new THREE.Mesh(windowGeometry, windowLightMaterial.clone());
        windowLightMesh.rotation.copy(windowMesh.rotation);
        windowLightMesh.position.copy(windowMesh.position);
        windowLightMesh.userData.isWindowLight = true;
        windowLightMesh.userData.baseEmissiveIntensity = Math.random() * 0.4 + 0.4;
        windowLightMesh.userData.flickerOffset = Math.random() * Math.PI * 2;
        
        // 稍微向前一点，确保在玻璃前面
        if (pos.face === 'front') windowLightMesh.position.z += 0.005;
        else if (pos.face === 'back') windowLightMesh.position.z -= 0.005;
        else if (pos.face === 'right') windowLightMesh.position.x += 0.005;
        else if (pos.face === 'left') windowLightMesh.position.x -= 0.005;
        
        buildingGroup.add(windowLightMesh);
        windowLights.push(windowLightMesh);
    });
    
    // 存储建筑数据
    buildingGroup.userData = {
        buildingInfo: info,
        color: purpose.color,
        buildingMesh: buildingMesh,
        windowMeshes: buildingGroup.children.filter(child => 
            child.material && child.material.color && child.material.color.getHex() === purpose.windowColor
        ),
        windowLights: windowLights.slice(-windowPositions.length)
    };
    
    return buildingGroup;
}

// 添加屋顶细节
function addRoofDetails(buildingGroup, width, height, depth, purpose) {
    const roofY = height;
    
    // 屋顶平台
    const roofGeometry = new THREE.BoxGeometry(width + 0.4, 0.5, depth + 0.4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.8,
        metalness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = roofY + 0.25;
    roof.castShadow = true;
    roof.receiveShadow = true;
    buildingGroup.add(roof);
    
    // 屋顶设备（空调机组等）
    const equipmentCount = Math.floor(Math.random() * 3) + 1;
    const equipmentMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a5a5a,
        roughness: 0.7,
        metalness: 0.3
    });
    
    for (let i = 0; i < equipmentCount; i++) {
        const eqWidth = 1 + Math.random() * 1.5;
        const eqHeight = 1 + Math.random() * 2;
        const eqDepth = 1 + Math.random() * 1.5;
        
        const equipmentGeometry = new THREE.BoxGeometry(eqWidth, eqHeight, eqDepth);
        const equipment = new THREE.Mesh(equipmentGeometry, equipmentMaterial);
        
        equipment.position.set(
            (Math.random() - 0.5) * (width - eqWidth - 1),
            roofY + 0.5 + eqHeight / 2,
            (Math.random() - 0.5) * (depth - eqDepth - 1)
        );
        
        equipment.castShadow = true;
        equipment.receiveShadow = true;
        buildingGroup.add(equipment);
        
        // 设备风扇
        if (Math.random() > 0.5) {
            const fanGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
            const fan = new THREE.Mesh(fanGeometry, equipmentMaterial);
            fan.position.copy(equipment.position);
            fan.position.y += eqHeight / 2 + 0.05;
            fan.castShadow = true;
            buildingGroup.add(fan);
        }
    }
    
    // 屋顶栏杆
    const railingMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.6,
        metalness: 0.4
    });
    
    const railingHeight = 1.0;
    const postSpacing = 2;
    
    // 沿边缘添加栏杆
    for (let side = 0; side < 4; side++) {
        let x1, z1, x2, z2;
        
        if (side === 0) {
            x1 = -width / 2 + 1; z1 = depth / 2;
            x2 = width / 2 - 1; z2 = depth / 2;
        } else if (side === 1) {
            x1 = -width / 2 + 1; z1 = -depth / 2;
            x2 = width / 2 - 1; z2 = -depth / 2;
        } else if (side === 2) {
            x1 = width / 2; z1 = -depth / 2 + 1;
            x2 = width / 2; z2 = depth / 2 - 1;
        } else {
            x1 = -width / 2; z1 = -depth / 2 + 1;
            x2 = -width / 2; z2 = depth / 2 - 1;
        }
        
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
        const postCount = Math.floor(length / postSpacing) + 1;
        
        for (let p = 0; p < postCount; p++) {
            const t = postCount > 1 ? p / (postCount - 1) : 0.5;
            const px = x1 + (x2 - x1) * t;
            const pz = z1 + (z2 - z1) * t;
            
            // 栏杆柱
            const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, railingHeight, 6);
            const post = new THREE.Mesh(postGeometry, railingMaterial);
            post.position.set(px, roofY + 0.5 + railingHeight / 2, pz);
            post.castShadow = true;
            buildingGroup.add(post);
            
            // 横杆
            if (p < postCount - 1) {
                const nextT = (p + 1) / (postCount - 1);
                const npx = x1 + (x2 - x1) * nextT;
                const npz = z1 + (z2 - z1) * nextT;
                
                const midX = (px + npx) / 2;
                const midZ = (pz + npz) / 2;
                const barLength = Math.sqrt(Math.pow(npx - px, 2) + Math.pow(npz - pz, 2));
                
                for (let h = 0; h < 3; h++) {
                    const barHeight = roofY + 0.5 + 0.3 + h * 0.3;
                    const barGeometry = new THREE.CylinderGeometry(0.03, 0.03, barLength, 6);
                    const bar = new THREE.Mesh(barGeometry, railingMaterial);
                    
                    bar.position.set(midX, barHeight, midZ);
                    
                    if (side < 2) {
                        bar.rotation.z = Math.PI / 2;
                    } else {
                        bar.rotation.x = Math.PI / 2;
                    }
                    
                    buildingGroup.add(bar);
                }
            }
        }
    }
}

// 添加入口细节
function addEntrance(buildingGroup, width, depth, purpose) {
    const entranceMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.5,
        metalness: 0.5
    });
    
    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x88aacc,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7
    });
    
    // 主入口（前面）
    const entranceWidth = Math.min(width * 0.6, 4);
    const entranceHeight = 5;
    const entranceDepth = 0.3;
    
    // 入口雨篷
    const canopyGeometry = new THREE.BoxGeometry(entranceWidth + 2, 0.3, 2.5);
    const canopy = new THREE.Mesh(canopyGeometry, entranceMaterial);
    canopy.position.set(0, entranceHeight, depth / 2 + 1.25);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    buildingGroup.add(canopy);
    
    // 雨篷支撑柱
    const columnGeometry = new THREE.CylinderGeometry(0.15, 0.15, entranceHeight, 8);
    const columnMaterial = new THREE.MeshStandardMaterial({
        color: purpose.accentColor,
        roughness: 0.4,
        metalness: 0.6
    });
    
    const leftColumn = new THREE.Mesh(columnGeometry, columnMaterial);
    leftColumn.position.set(-entranceWidth / 2 - 0.5, entranceHeight / 2, depth / 2 + 2);
    leftColumn.castShadow = true;
    leftColumn.receiveShadow = true;
    buildingGroup.add(leftColumn);
    
    const rightColumn = new THREE.Mesh(columnGeometry, columnMaterial);
    rightColumn.position.set(entranceWidth / 2 + 0.5, entranceHeight / 2, depth / 2 + 2);
    rightColumn.castShadow = true;
    rightColumn.receiveShadow = true;
    buildingGroup.add(rightColumn);
    
    // 玻璃门
    const doorGeometry = new THREE.PlaneGeometry(entranceWidth, entranceHeight - 0.5);
    const door = new THREE.Mesh(doorGeometry, glassMaterial);
    door.position.set(0, (entranceHeight - 0.5) / 2, depth / 2 + 0.01);
    buildingGroup.add(door);
    
    // 门框
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.6,
        metalness: 0.4
    });
    
    const frameThickness = 0.15;
    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(entranceWidth + frameThickness * 2, frameThickness, 0.2),
        frameMaterial
    );
    topFrame.position.set(0, entranceHeight - 0.5, depth / 2 + 0.1);
    buildingGroup.add(topFrame);
    
    const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, entranceHeight - 0.5, 0.2),
        frameMaterial
    );
    leftFrame.position.set(-entranceWidth / 2 - frameThickness / 2, (entranceHeight - 0.5) / 2, depth / 2 + 0.1);
    buildingGroup.add(leftFrame);
    
    const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, entranceHeight - 0.5, 0.2),
        frameMaterial
    );
    rightFrame.position.set(entranceWidth / 2 + frameThickness / 2, (entranceHeight - 0.5) / 2, depth / 2 + 0.1);
    buildingGroup.add(rightFrame);
}

// 切换白天/夜晚模式
function toggleDayNight() {
    isNightMode = !isNightMode;
    const button = document.getElementById('toggleDayNight');
    
    if (isNightMode) {
        button.textContent = '☀️ 切换白天';
        scene.background = new THREE.Color(0x0a0a15);
        scene.fog = new THREE.Fog(0x0a0a15, 50, 150);
        renderer.toneMappingExposure = 0.6;
        
        const ambientLight = scene.getObjectByName('ambientLight');
        const directionalLight = scene.getObjectByName('directionalLight');
        const hemiLight = scene.getObjectByName('hemiLight');
        const fillLight = scene.getObjectByName('fillLight');
        
        if (ambientLight) ambientLight.intensity = 0.15;
        if (directionalLight) directionalLight.intensity = 0.1;
        if (hemiLight) hemiLight.intensity = 0.1;
        if (fillLight) fillLight.intensity = 0.05;
        
        // 随机点亮窗户 - 70%的概率点亮
        windowLights.forEach(light => {
            if (Math.random() > 0.3) {
                light.material.emissiveIntensity = light.userData.baseEmissiveIntensity;
                light.material.opacity = 0.85;
            } else {
                light.material.emissiveIntensity = 0;
                light.material.opacity = 0;
            }
        });
        
        // 添加街灯效果
        addStreetLights();
    } else {
        button.textContent = '🌙 切换夜晚';
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        renderer.toneMappingExposure = 1.0;
        
        const ambientLight = scene.getObjectByName('ambientLight');
        const directionalLight = scene.getObjectByName('directionalLight');
        const hemiLight = scene.getObjectByName('hemiLight');
        const fillLight = scene.getObjectByName('fillLight');
        
        if (ambientLight) ambientLight.intensity = 0.5;
        if (directionalLight) directionalLight.intensity = 1.0;
        if (hemiLight) hemiLight.intensity = 0.4;
        if (fillLight) fillLight.intensity = 0.3;
        
        windowLights.forEach(light => {
            light.material.emissiveIntensity = 0;
            light.material.opacity = 0;
        });
        
        // 移除街灯
        removeStreetLights();
    }
}

// 添加街灯
function addStreetLights() {
    // 检查是否已经有街灯
    if (scene.getObjectByName('streetLightGroup')) return;
    
    const streetLightGroup = new THREE.Group();
    streetLightGroup.name = 'streetLightGroup';
    
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.6,
        metalness: 0.4
    });
    
    const lightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffdd99,
        emissiveIntensity: 1.0
    });
    
    const streetLightPositions = [
        [-11, -11], [11, -11], [-11, 11], [11, 11],
        [-11, 0], [11, 0], [0, -11], [0, 11],
        [-21, -21], [21, -21], [-21, 21], [21, 21],
        [-21, 0], [21, 0], [0, -21], [0, 21],
        [-31, -31], [31, -31], [-31, 31], [31, 31]
    ];
    
    streetLightPositions.forEach(([x, z]) => {
        // 灯杆
        const poleGeometry = new THREE.CylinderGeometry(0.08, 0.12, 5, 8);
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(x, 2.5, z);
        pole.castShadow = true;
        streetLightGroup.add(pole);
        
        // 灯臂
        const armGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.05);
        const arm = new THREE.Mesh(armGeometry, poleMaterial);
        arm.position.set(x + 0.75, 4.8, z);
        streetLightGroup.add(arm);
        
        // 灯具
        const lampGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const lamp = new THREE.Mesh(lampGeometry, lightMaterial);
        lamp.position.set(x + 1.5, 4.8, z);
        streetLightGroup.add(lamp);
        
        // 点光源
        const pointLight = new THREE.PointLight(0xffdd99, 0.5, 15);
        pointLight.position.set(x + 1.5, 4.8, z);
        pointLight.name = 'streetLightPoint';
        streetLightGroup.add(pointLight);
    });
    
    scene.add(streetLightGroup);
}

// 移除街灯
function removeStreetLights() {
    const streetLightGroup = scene.getObjectByName('streetLightGroup');
    if (streetLightGroup) {
        scene.remove(streetLightGroup);
    }
}

// 切换视角
function toggleView() {
    if (isCameraAnimating) return;
    
    isTopView = !isTopView;
    const button = document.getElementById('toggleView');
    
    if (isTopView) {
        button.textContent = '🏙️ 透视图';
        animateCameraTo(0, 80, 0.01, new THREE.Vector3(0, 15, 0));
    } else {
        button.textContent = '🔍 俯视图';
        animateCameraTo(30, 40, 30, new THREE.Vector3(0, 15, 0));
    }
}

// 相机聚焦到建筑
function focusCameraOnBuilding(building) {
    if (isCameraAnimating) return;
    
    const info = building.userData.buildingInfo;
    const buildingPos = building.position.clone();
    const buildingHeight = info.height;
    
    const offsetDistance = Math.max(buildingHeight * 1.2, 25);
    const offsetX = offsetDistance * 0.6;
    const offsetY = buildingHeight * 0.8 + 10;
    const offsetZ = offsetDistance * 0.6;
    
    const targetPos = new THREE.Vector3(
        buildingPos.x + offsetX,
        offsetY,
        buildingPos.z + offsetZ
    );
    
    const lookAtTarget = new THREE.Vector3(
        buildingPos.x,
        buildingHeight / 2,
        buildingPos.z
    );
    
    animateCameraTo(targetPos.x, targetPos.y, targetPos.z, lookAtTarget);
}

// 相机动画移动
function animateCameraTo(x, y, z, lookAtTarget) {
    if (isCameraAnimating) return;
    
    isCameraAnimating = true;
    
    const startPosition = camera.position.clone();
    const targetPosition = new THREE.Vector3(x, y, z);
    const startTarget = controls.target.clone();
    const duration = 1500;
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = easeInOutCubic(progress);
        
        camera.position.lerpVectors(startPosition, targetPosition, eased);
        controls.target.lerp(lookAtTarget, eased);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            isCameraAnimating = false;
        }
    }
    
    animateCamera();
}

// 缓动函数
function easeInOutCubic(t) {
    return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 更新排行榜
function updateRanking() {
    const rankingList = document.getElementById('rankingList');
    
    const sortedBuildings = [...buildings].sort((a, b) => 
        b.userData.buildingInfo.height - a.userData.buildingInfo.height
    );
    
    const top10 = sortedBuildings.slice(0, 10);
    
    rankingList.innerHTML = '';
    
    top10.forEach((building, index) => {
        const info = building.userData.buildingInfo;
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-item';
        
        let rankClass = 'normal';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        rankItem.innerHTML = `
            <span class="rank ${rankClass}">${index + 1}</span>
            <span class="building-name">${info.name}</span>
            <span class="building-height">${info.height.toFixed(1)}m</span>
        `;
        
        rankItem.addEventListener('click', (e) => {
            e.stopPropagation();
            focusCameraOnBuilding(building);
            showBuildingInfo(building);
        });
        
        rankingList.appendChild(rankItem);
    });
}

// 显示建筑信息
function showBuildingInfo(building) {
    if (selectedBuilding && selectedBuilding !== building && selectedBuilding.userData.originalMaterial) {
        selectedBuilding.userData.buildingMesh.material = selectedBuilding.userData.originalMaterial;
    }
    
    selectedBuilding = building;
    const info = building.userData.buildingInfo;
    
    document.getElementById('buildingName').textContent = info.name;
    document.getElementById('buildingFloors').textContent = info.floors + ' 层';
    document.getElementById('buildingPurpose').textContent = info.purpose;
    document.getElementById('buildingHeight').textContent = info.height.toFixed(1) + ' 米';
    
    document.getElementById('buildingInfo').classList.remove('hidden');
    
    building.userData.originalMaterial = building.userData.buildingMesh.material.clone();
    
    const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0xffaa00,
        emissiveIntensity: 0.4
    });
    
    building.userData.buildingMesh.material = highlightMaterial;
}

// 隐藏建筑信息
function hideBuildingInfo() {
    if (selectedBuilding && selectedBuilding.userData.originalMaterial) {
        selectedBuilding.userData.buildingMesh.material = selectedBuilding.userData.originalMaterial;
    }
    selectedBuilding = null;
    document.getElementById('buildingInfo').classList.add('hidden');
}

// 添加事件监听
function addEventListeners() {
    document.getElementById('toggleDayNight').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDayNight();
    });
    
    document.getElementById('toggleView').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleView();
    });
    
    document.getElementById('closeInfo').addEventListener('click', (e) => {
        e.stopPropagation();
        hideBuildingInfo();
    });
    
    document.getElementById('buildingInfo').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    document.getElementById('ranking').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    renderer.domElement.addEventListener('click', onMouseClick);
    
    window.addEventListener('resize', onWindowResize);
}

// 鼠标点击事件
function onMouseClick(event) {
    if (isCameraAnimating) return;
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(buildings, true);
    
    if (intersects.length > 0) {
        let targetMesh = intersects[0].object;
        
        while (targetMesh.parent && !targetMesh.userData.buildingInfo) {
            targetMesh = targetMesh.parent;
        }
        
        if (targetMesh.userData.buildingInfo) {
            focusCameraOnBuilding(targetMesh);
            showBuildingInfo(targetMesh);
        }
    } else {
        hideBuildingInfo();
    }
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (!isCameraAnimating) {
        controls.update();
    }
    
    if (isNightMode) {
        const time = Date.now() * 0.001;
        windowLights.forEach(light => {
            if (light.material.opacity > 0) {
                const flicker = 0.9 + Math.sin(time * 2 + light.userData.flickerOffset) * 0.1;
                light.material.emissiveIntensity = light.userData.baseEmissiveIntensity * flicker;
            }
        });
    }
    
    renderer.render(scene, camera);
}

// 初始化
init();
