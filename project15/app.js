import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const cities = [
    { name: '北京', country: '中国', lat: 39.9042, lon: 116.4074, population: '21,540,000', timezone: 'Asia/Shanghai', offset: 8 },
    { name: '上海', country: '中国', lat: 31.2304, lon: 121.4737, population: '24,280,000', timezone: 'Asia/Shanghai', offset: 8 },
    { name: '东京', country: '日本', lat: 35.6762, lon: 139.6503, population: '37,400,000', timezone: 'Asia/Tokyo', offset: 9 },
    { name: '纽约', country: '美国', lat: 40.7128, lon: -74.0060, population: '8,336,817', timezone: 'America/New_York', offset: -5 },
    { name: '伦敦', country: '英国', lat: 51.5074, lon: -0.1278, population: '9,304,016', timezone: 'Europe/London', offset: 0 },
    { name: '巴黎', country: '法国', lat: 48.8566, lon: 2.3522, population: '2,140,526', timezone: 'Europe/Paris', offset: 1 },
    { name: '莫斯科', country: '俄罗斯', lat: 55.7558, lon: 37.6173, population: '12,506,468', timezone: 'Europe/Moscow', offset: 3 },
    { name: '悉尼', country: '澳大利亚', lat: -33.8688, lon: 151.2093, population: '5,312,163', timezone: 'Australia/Sydney', offset: 11 },
    { name: '迪拜', country: '阿联酋', lat: 25.2048, lon: 55.2708, population: '3,400,000', timezone: 'Asia/Dubai', offset: 4 },
    { name: '新加坡', country: '新加坡', lat: 1.3521, lon: 103.8198, population: '5,685,807', timezone: 'Asia/Singapore', offset: 8 },
    { name: '香港', country: '中国', lat: 22.3193, lon: 114.1694, population: '7,481,800', timezone: 'Asia/Hong_Kong', offset: 8 },
    { name: '孟买', country: '印度', lat: 19.0760, lon: 72.8777, population: '20,411,274', timezone: 'Asia/Kolkata', offset: 5.5 },
    { name: '德里', country: '印度', lat: 28.6139, lon: 77.2090, population: '32,941,000', timezone: 'Asia/Kolkata', offset: 5.5 },
    { name: '伊斯坦布尔', country: '土耳其', lat: 41.0082, lon: 28.9784, population: '15,460,000', timezone: 'Europe/Istanbul', offset: 3 },
    { name: '圣保罗', country: '巴西', lat: -23.5505, lon: -46.6333, population: '12,325,232', timezone: 'America/Sao_Paulo', offset: -3 },
    { name: '里约热内卢', country: '巴西', lat: -22.9068, lon: -43.1729, population: '6,748,000', timezone: 'America/Sao_Paulo', offset: -3 },
    { name: '洛杉矶', country: '美国', lat: 34.0522, lon: -118.2437, population: '3,971,883', timezone: 'America/Los_Angeles', offset: -8 },
    { name: '芝加哥', country: '美国', lat: 41.8781, lon: -87.6298, population: '2,695,598', timezone: 'America/Chicago', offset: -6 },
    { name: '墨西哥城', country: '墨西哥', lat: 19.4326, lon: -99.1332, population: '9,209,944', timezone: 'America/Mexico_City', offset: -6 },
    { name: '布宜诺斯艾利斯', country: '阿根廷', lat: -34.6037, lon: -58.3816, population: '3,054,300', timezone: 'America/Argentina/Buenos_Aires', offset: -3 },
    { name: '开罗', country: '埃及', lat: 30.0444, lon: 31.2357, population: '20,900,604', timezone: 'Africa/Cairo', offset: 2 },
    { name: '约翰内斯堡', country: '南非', lat: -26.2041, lon: 28.0473, population: '5,635,127', timezone: 'Africa/Johannesburg', offset: 2 },
    { name: '首尔', country: '韩国', lat: 37.5665, lon: 126.9780, population: '9,776,000', timezone: 'Asia/Seoul', offset: 9 },
    { name: '曼谷', country: '泰国', lat: 13.7563, lon: 100.5018, population: '10,150,000', timezone: 'Asia/Bangkok', offset: 7 },
    { name: '雅加达', country: '印度尼西亚', lat: -6.2088, lon: 106.8456, population: '10,770,487', timezone: 'Asia/Jakarta', offset: 7 },
    { name: '马尼拉', country: '菲律宾', lat: 14.5995, lon: 120.9842, population: '1,846,600', timezone: 'Asia/Manila', offset: 8 },
    { name: '柏林', country: '德国', lat: 52.5200, lon: 13.4050, population: '3,769,495', timezone: 'Europe/Berlin', offset: 1 },
    { name: '罗马', country: '意大利', lat: 41.9028, lon: 12.4964, population: '2,872,800', timezone: 'Europe/Rome', offset: 1 },
    { name: '马德里', country: '西班牙', lat: 40.4168, lon: -3.7038, population: '3,223,334', timezone: 'Europe/Madrid', offset: 1 },
    { name: '多伦多', country: '加拿大', lat: 43.6532, lon: -79.3832, population: '2,731,571', timezone: 'America/Toronto', offset: -5 }
];

const flightRoutes = [
    [0, 2], [0, 3], [1, 2], [1, 9], [2, 3],
    [3, 4], [4, 5], [4, 13], [5, 7], [6, 13],
    [8, 9], [10, 2], [11, 12], [14, 15], [16, 17],
    [0, 22], [2, 27], [20, 21], [23, 26]
];

let scene, camera, renderer, controls;
let earth, atmosphere, earthMaterial;
let cityMarkers = [];
let flightLines = [];
let raycaster, mouse;
let clock;

const earthVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const earthFragmentShader = `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 sunDirection;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vec3 normal = normalize(vNormal);
        vec3 sunDir = normalize(sunDirection);
        
        float intensity = dot(normal, sunDir);
        
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.5;
        
        float blend = smoothstep(-0.1, 0.1, intensity);
        
        vec3 finalColor = mix(nightColor, dayColor, blend);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const atmosphereFragmentShader = `
    uniform vec3 sunDirection;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vec3 normal = normalize(vNormal);
        vec3 sunDir = normalize(sunDirection);
        vec3 viewDir = normalize(-vPosition);
        
        float rim = 1.0 - abs(dot(viewDir, normal));
        rim = pow(rim, 3.0);
        
        float sunIntensity = dot(normal, sunDir);
        sunIntensity = smoothstep(0.0, 0.3, sunIntensity);
        
        vec3 dayColor = vec3(0.3, 0.6, 1.0);
        vec3 nightColor = vec3(0.05, 0.05, 0.15);
        
        vec3 atmosphereColor = mix(nightColor, dayColor, sunIntensity);
        
        float alpha = rim * 0.6;
        
        gl_FragColor = vec4(atmosphereColor, alpha);
    }
`;

const flightLineVertexShader = `
    uniform float time;
    attribute float aOffset;
    
    varying float vProgress;
    
    void main() {
        vProgress = position.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.0;
    }
`;

const flightLineFragmentShader = `
    uniform float time;
    uniform float trailLength;
    
    varying float vProgress;
    
    void main() {
        float t = mod(time * 0.3, 1.0);
        float distance = abs(vProgress - t);
        float alpha = 1.0 - smoothstep(0.0, trailLength, distance);
        
        vec3 color = vec3(0.0, 1.0, 1.0);
        
        gl_FragColor = vec4(color, alpha * 0.8);
    }
`;

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 4;
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.2;
    controls.maxDistance = 10;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7;
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    clock = new THREE.Clock();
    
    createStars();
    createEarth();
    createCities();
    createFlightRoutes();
    setupEventListeners();
    
    animate();
}

function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

async function createEarth() {
    const textureLoader = new THREE.TextureLoader();
    
    try {
        const dayTexture = await loadTexture(textureLoader, 'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg');
        const nightTexture = await loadTexture(textureLoader, 'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg');
        
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        earthMaterial = new THREE.ShaderMaterial({
            vertexShader: earthVertexShader,
            fragmentShader: earthFragmentShader,
            uniforms: {
                dayTexture: { value: dayTexture },
                nightTexture: { value: nightTexture },
                sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() }
            }
        });
        
        earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);
        
        createAtmosphere();
        
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Error loading textures:', error);
        createSimpleEarth();
    }
}

function loadTexture(loader, url) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
    });
}

function createSimpleEarth() {
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1a5c7a');
    gradient.addColorStop(0.3, '#2d7a9e');
    gradient.addColorStop(0.5, '#1a5c7a');
    gradient.addColorStop(0.7, '#2d7a9e');
    gradient.addColorStop(1, '#1a5c7a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    ctx.fillStyle = '#2d5a2d';
    ctx.beginPath();
    ctx.ellipse(200, 150, 100, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(350, 250, 80, 120, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(500, 150, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(520, 300, 60, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(750, 180, 200, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(850, 380, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const nightCanvas = document.createElement('canvas');
    nightCanvas.width = 1024;
    nightCanvas.height = 512;
    const nctx = nightCanvas.getContext('2d');
    
    nctx.fillStyle = '#0a0a1a';
    nctx.fillRect(0, 0, 1024, 512);
    
    nctx.fillStyle = '#ffffaa';
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const size = Math.random() * 3 + 1;
        nctx.beginPath();
        nctx.arc(x, y, size, 0, Math.PI * 2);
        nctx.fill();
    }
    
    const nightTexture = new THREE.CanvasTexture(nightCanvas);
    
    earthMaterial = new THREE.ShaderMaterial({
        vertexShader: earthVertexShader,
        fragmentShader: earthFragmentShader,
        uniforms: {
            dayTexture: { value: texture },
            nightTexture: { value: nightTexture },
            sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() }
        }
    });
    
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    createAtmosphere();
    
    document.getElementById('loading').style.display = 'none';
}

function createAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
    
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: {
            sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() }
        },
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    
    atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.1, 1.1, 1.1);
    scene.add(atmosphere);
}

function latLonToVector3(lat, lon, radius = 1.01) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
}

function createCities() {
    const markerGeometry = new THREE.SphereGeometry(0.008, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    
    const glowGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff88,
        transparent: true,
        opacity: 0.3
    });
    
    cities.forEach((city, index) => {
        const position = latLonToVector3(city.lat, city.lon);
        
        const marker = new THREE.Mesh(markerGeometry, markerMaterial.clone());
        marker.position.copy(position);
        marker.userData = { cityIndex: index, city: city, type: 'marker' };
        scene.add(marker);
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
        glow.position.copy(position);
        scene.add(glow);
        
        cityMarkers.push({ marker, glow, position, city });
    });
}

function createFlightRoutes() {
    flightRoutes.forEach((route) => {
        const city1 = cities[route[0]];
        const city2 = cities[route[1]];
        
        const start = latLonToVector3(city1.lat, city1.lon, 1.001);
        const end = latLonToVector3(city2.lat, city2.lon, 1.001);
        
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(1.3);
        
        const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
        
        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const progressValues = new Float32Array(points.length);
        for (let i = 0; i < points.length; i++) {
            progressValues[i] = i / points.length;
        }
        geometry.setAttribute('aOffset', new THREE.BufferAttribute(progressValues, 1));
        
        const lineMaterial = new THREE.ShaderMaterial({
            vertexShader: flightLineVertexShader,
            fragmentShader: flightLineFragmentShader,
            uniforms: {
                time: { value: Math.random() * 10 },
                trailLength: { value: 0.15 }
            },
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        
        flightLines.push({ line, material: lineMaterial });
        
        const baseGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const baseMaterial = new THREE.LineBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.2
        });
        const baseLine = new THREE.Line(baseGeometry, baseMaterial);
        scene.add(baseLine);
    });
}

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const markers = cityMarkers.map(m => m.marker);
    const intersects = raycaster.intersectObjects(markers);
    
    if (intersects.length > 0) {
        const cityData = intersects[0].object.userData.city;
        showCityInfo(cityData, event.clientX, event.clientY);
    } else {
        hideCityInfo();
    }
}

function showCityInfo(city, x, y) {
    const card = document.getElementById('info-card');
    
    document.getElementById('city-name').textContent = city.name;
    document.getElementById('city-country').textContent = city.country;
    document.getElementById('city-population').textContent = city.population;
    document.getElementById('city-timezone').textContent = city.timezone;
    
    updateLocalTime(city);
    
    card.style.left = x + 'px';
    card.style.top = (y - 20) + 'px';
    card.classList.add('visible');
}

function updateLocalTime(city) {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    
    let localHours = utcHours + city.offset;
    const localMinutes = utcMinutes;
    
    if (localHours >= 24) localHours -= 24;
    if (localHours < 0) localHours += 24;
    
    const timeStr = `${String(Math.floor(localHours)).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}`;
    document.getElementById('city-time').textContent = timeStr;
}

function hideCityInfo() {
    const card = document.getElementById('info-card');
    card.classList.remove('visible');
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    
    flightLines.forEach((flight, index) => {
        flight.material.uniforms.time.value = elapsed + index * 0.5;
    });
    
    cityMarkers.forEach((city, index) => {
        const pulse = Math.sin(elapsed * 2 + index) * 0.2 + 0.8;
        city.glow.material.opacity = pulse * 0.3;
        const scale = 1 + pulse * 0.1;
        city.glow.scale.set(scale, scale, scale);
    });
    
    const visibleCard = document.getElementById('info-card');
    if (visibleCard.classList.contains('visible')) {
        const cityName = document.getElementById('city-name').textContent;
        const city = cities.find(c => c.name === cityName);
        if (city) {
            updateLocalTime(city);
        }
    }
    
    controls.update();
    renderer.render(scene, camera);
}

init();
