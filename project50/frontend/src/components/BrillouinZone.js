import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card, Typography, Space, Descriptions, Tag, Select } from 'antd';
import { latticeToMatrix } from '../utils/crystalUtils';

const { Title, Text, Paragraph } = Typography;

const HIGH_SYMMETRY_POINTS = {
  cubic: {
    'Γ': [0, 0, 0],
    'X': [0.5, 0, 0],
    'M': [0.5, 0.5, 0],
    'R': [0.5, 0.5, 0.5],
    'K': [0.375, 0.375, 0.75]
  },
  tetragonal: {
    'Γ': [0, 0, 0],
    'X': [0.5, 0, 0],
    'M': [0.5, 0.5, 0],
    'Z': [0, 0, 0.5],
    'P': [0.5, 0, 0.5],
    'A': [0.5, 0.5, 0.5]
  },
  orthorhombic: {
    'Γ': [0, 0, 0],
    'X': [0.5, 0, 0],
    'Y': [0, 0.5, 0],
    'Z': [0, 0, 0.5],
    'U': [0, 0.5, 0.5],
    'R': [0.5, 0.5, 0.5]
  },
  hexagonal: {
    'Γ': [0, 0, 0],
    'K': [1/3, 1/3, 0],
    'M': [0, 0.5, 0],
    'A': [0, 0, 0.5],
    'H': [1/3, 1/3, 0.5],
    'L': [0, 0.5, 0.5]
  }
};

const BrillouinZone = ({ crystalData }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  
  const [crystalSystem, setCrystalSystem] = useState('cubic');
  const [showLabels, setShowLabels] = useState(true);

  const invertMatrix = (m) => {
    const det = m[0][0]*(m[1][1]*m[2][2] - m[2][1]*m[1][2]) -
                m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0]) +
                m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]);
    
    if (det === 0) return m;
    
    const invDet = 1.0 / det;
    
    return [
      [(m[1][1]*m[2][2] - m[2][1]*m[1][2]) * invDet,
       (m[0][2]*m[2][1] - m[0][1]*m[2][2]) * invDet,
       (m[0][1]*m[1][2] - m[0][2]*m[1][1]) * invDet],
      [(m[1][2]*m[2][0] - m[1][0]*m[2][2]) * invDet,
       (m[0][0]*m[2][2] - m[0][2]*m[2][0]) * invDet,
       (m[1][0]*m[0][2] - m[0][0]*m[1][2]) * invDet],
      [(m[1][0]*m[2][1] - m[2][0]*m[1][1]) * invDet,
       (m[2][0]*m[0][1] - m[0][0]*m[2][1]) * invDet,
       (m[0][0]*m[1][1] - m[1][0]*m[0][1]) * invDet]
    ];
  };

  const getCrystalSystem = (lattice) => {
    if (!lattice) return 'cubic';
    
    const { a, b, c } = lattice;
    const alpha = lattice.alpha || 90;
    const beta = lattice.beta || 90;
    const gamma = lattice.gamma || 90;
    
    const tol = 0.01;
    const angleTol = 0.5;
    
    if (Math.abs(a - b) < tol && Math.abs(b - c) < tol &&
        Math.abs(alpha - 90) < angleTol && Math.abs(beta - 90) < angleTol &&
        Math.abs(gamma - 90) < angleTol) {
      return 'cubic';
    }
    
    if (Math.abs(a - b) < tol &&
        Math.abs(alpha - 90) < angleTol && Math.abs(beta - 90) < angleTol &&
        Math.abs(gamma - 90) < angleTol) {
      return 'tetragonal';
    }
    
    if (Math.abs(alpha - 90) < angleTol && Math.abs(beta - 90) < angleTol &&
        Math.abs(gamma - 90) < angleTol) {
      return 'orthorhombic';
    }
    
    if (Math.abs(a - b) < tol && Math.abs(gamma - 120) < angleTol) {
      return 'hexagonal';
    }
    
    return 'cubic';
  };

  const getBrillouinZoneFaces = (system) => {
    const s = 2 / 3;
    const sqrt3 = Math.sqrt(3);
    
    switch (system) {
      case 'cubic':
        return {
          vertices: [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
          ],
          faces: [
            [0, 1, 2, 3],
            [4, 7, 6, 5],
            [0, 4, 5, 1],
            [2, 6, 7, 3],
            [0, 3, 7, 4],
            [1, 5, 6, 2]
          ]
        };
      case 'hexagonal':
        return {
          vertices: [
            [0, -1, -1],
            [sqrt3/2, -0.5, -1],
            [sqrt3/2, 0.5, -1],
            [0, 1, -1],
            [-sqrt3/2, 0.5, -1],
            [-sqrt3/2, -0.5, -1],
            [0, -1, 1],
            [sqrt3/2, -0.5, 1],
            [sqrt3/2, 0.5, 1],
            [0, 1, 1],
            [-sqrt3/2, 0.5, 1],
            [-sqrt3/2, -0.5, 1]
          ],
          faces: [
            [0, 1, 2, 3, 4, 5],
            [11, 10, 9, 8, 7, 6],
            [0, 6, 7, 1],
            [1, 7, 8, 2],
            [2, 8, 9, 3],
            [3, 9, 10, 4],
            [4, 10, 11, 5],
            [5, 11, 6, 0]
          ]
        };
      default:
        return getBrillouinZoneFaces('cubic');
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a1a');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 2.5, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(10, 10, 0x444466, 0x222244);
    scene.add(gridHelper);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const toRemove = scene.children.filter(child => 
      child.userData && child.userData.type === 'bz'
    );
    toRemove.forEach(child => {
      scene.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    const bzGroup = new THREE.Group();
    bzGroup.userData = { type: 'bz' };

    const lattice = crystalData?.lattice;
    const system = getCrystalSystem(lattice);
    const bzData = getBrillouinZoneFaces(system);

    const vertices = [];
    const indices = [];

    bzData.faces.forEach(face => {
      for (let i = 2; i < face.length; i++) {
        indices.push(face[0], face[i-1], face[i]);
      }
    });

    const scale = 1.0;
    bzData.vertices.forEach(v => {
      vertices.push(v[0] * scale, v[1] * scale, v[2] * scale);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0x1890ff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      shininess: 100
    });

    const bzMesh = new THREE.Mesh(geometry, material);
    bzGroup.add(bzMesh);

    const edgeGeometry = new THREE.EdgesGeometry(geometry, 15);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff, 
      linewidth: 2 
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    bzGroup.add(edges);

    const points = HIGH_SYMMETRY_POINTS[system] || HIGH_SYMMETRY_POINTS.cubic;
    
    Object.entries(points).forEach(([label, coords]) => {
      const pos = [
        (coords[0] - 0.5) * 2 * scale,
        (coords[1] - 0.5) * 2 * scale,
        (coords[2] - 0.5) * 2 * scale
      ];

      const sphereGeom = new THREE.SphereGeometry(0.08, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff4d4f });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(pos[0], pos[1], pos[2]);
      bzGroup.add(sphere);

      if (showLabels) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 32;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, 32, 22);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(pos[0] + 0.15, pos[1] + 0.15, pos[2] + 0.15);
        sprite.scale.set(0.6, 0.3, 1);
        bzGroup.add(sprite);
      }
    });

    scene.add(bzGroup);
  }, [crystalSystem, crystalData, showLabels]);

  const currentSystem = getCrystalSystem(crystalData?.lattice);
  const highSymPoints = HIGH_SYMMETRY_POINTS[currentSystem] || HIGH_SYMMETRY_POINTS.cubic;

  return (
    <div>
      <Card>
        <Title level={3}>布里渊区可视化</Title>
        <Paragraph type="secondary">
          第一布里渊区是倒易空间中的Wigner-Seitz原胞，是能带理论中的重要概念。
          {crystalData?.lattice && (
            <span> 当前晶体系统: <Tag color="blue">{currentSystem}</Tag></span>
          )}
        </Paragraph>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <span>晶系:</span>
            <Select 
              value={crystalSystem}
              onChange={setCrystalSystem}
              style={{ width: 200 }}
              options={[
                { value: 'cubic', label: '立方 (Cubic)' },
                { value: 'tetragonal', label: '四方 (Tetragonal)' },
                { value: 'orthorhombic', label: '正交 (Orthorhombic)' },
                { value: 'hexagonal', label: '六方 (Hexagonal)' }
              ]}
            />
          </Space>
          
          <div 
            ref={containerRef} 
            style={{ 
              height: 500, 
              border: '1px solid #d9d9d9',
              borderRadius: 8
            }} 
          />

          <Card size="small" title="高对称点坐标">
            <Descriptions size="small" bordered column={3}>
              {Object.entries(highSymPoints).map(([label, coords]) => (
                <Descriptions.Item key={label} label={<Tag color="purple">{label}</Tag>}>
                  ({coords[0].toFixed(2)}, {coords[1].toFixed(2)}, {coords[2].toFixed(2)})
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>

          <Card size="small" title="常见高对称路径">
            <Space direction="vertical">
              <Text>立方晶系: Γ → X → M → Γ → R → X | M → R</Text>
              <Text>六方晶系: Γ → M → K → Γ → A → L → H → A</Text>
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default BrillouinZone;
