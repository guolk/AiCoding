import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  getElementColor, 
  getAtomicRadius, 
  latticeToMatrix, 
  fractionalToCartesian,
  calculateBonds,
  generateSupercell
} from '../utils/crystalUtils';
import { Card, Space, Slider, Switch, Select, Button, Typography } from 'antd';

const { Title } = Typography;

const CrystalViewer = ({ crystalData, analysisResults }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const crystalGroupRef = useRef(null);
  const animationIdRef = useRef(null);
  
  const [supercellSize, setSupercellSize] = useState(1);
  const [showBonds, setShowBonds] = useState(true);
  const [showCell, setShowCell] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [atomScale, setAtomScale] = useState(1);
  const [bondRadius, setBondRadius] = useState(0.1);
  const [backgroundColor, setBackgroundColor] = useState('#0a0a1a');
  const [selectedAtom, setSelectedAtom] = useState(null);

  const bonds = useMemo(() => {
    if (!crystalData?.lattice || !crystalData?.atoms) return [];
    return calculateBonds(crystalData.atoms, crystalData.lattice);
  }, [crystalData]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.FogExp2(backgroundColor, 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 12, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0x8080ff, 0.3);
    directionalLight2.position.set(-10, -10, -5);
    scene.add(directionalLight2);

    const gridHelper = new THREE.GridHelper(50, 50, 0x444466, 0x222244);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    const crystalGroup = new THREE.Group();
    scene.add(crystalGroup);
    crystalGroupRef.current = crystalGroup;

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
    if (!crystalData || !crystalGroupRef.current || !sceneRef.current) return;

    const group = crystalGroupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      group.remove(child);
    }

    const lattice = crystalData.lattice;
    const atoms = crystalData.atoms;
    
    if (!lattice || !atoms) return;

    const latticeMatrix = latticeToMatrix(lattice);
    if (!latticeMatrix) return;

    if (showCell) {
      const cellGroup = createUnitCell(lattice, latticeMatrix);
      group.add(cellGroup);
    }

    const supercellAtoms = generateSupercell(atoms, lattice, [supercellSize, supercellSize, supercellSize]);
    
    const atomGeometry = new THREE.SphereGeometry(1, 32, 32);
    
    supercellAtoms.forEach((atom, idx) => {
      const radius = getAtomicRadius(atom.element) * atomScale;
      const color = getElementColor(atom.element);
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        specular: 0x444444,
        transparent: true,
        opacity: 0.95
      });
      
      const mesh = new THREE.Mesh(atomGeometry, material);
      mesh.scale.set(radius, radius, radius);
      
      if (atom.isCartesian) {
        mesh.position.set(atom.x, atom.y, atom.z);
      } else {
        const cart = fractionalToCartesian([atom.x, atom.y, atom.z], latticeMatrix);
        mesh.position.set(cart[0], cart[1], cart[2]);
      }
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { atom, index: idx, type: 'atom' };
      
      group.add(mesh);
    });

    if (showBonds && bonds.length > 0) {
      const bondGeometry = new THREE.CylinderGeometry(bondRadius, bondRadius, 1, 16);
      const bondMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        shininess: 50,
        transparent: true,
        opacity: 0.8
      });

      bonds.forEach((bond, idx) => {
        const midPoint = [
          (bond.start[0] + bond.end[0]) / 2,
          (bond.start[1] + bond.end[1]) / 2,
          (bond.start[2] + bond.end[2]) / 2
        ];
        
        const length = bond.distance;
        const direction = new THREE.Vector3(
          bond.end[0] - bond.start[0],
          bond.end[1] - bond.start[1],
          bond.end[2] - bond.start[2]
        );
        direction.normalize();
        
        const bondMesh = new THREE.Mesh(bondGeometry, bondMaterial);
        bondMesh.position.set(midPoint[0], midPoint[1], midPoint[2]);
        bondMesh.scale.y = length;
        
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        bondMesh.quaternion.copy(quaternion);
        
        bondMesh.userData = { bond, index: idx, type: 'bond' };
        group.add(bondMesh);
      });
    }

    if (analysisResults?.symmetry?.symmetry_elements) {
      addSymmetryElements(group, analysisResults.symmetry.symmetry_elements, latticeMatrix);
    }

    const bbox = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    group.position.sub(center);

    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [crystalData, supercellSize, showBonds, showCell, atomScale, bondRadius, analysisResults, bonds]);

  const createUnitCell = (lattice, latticeMatrix) => {
    const group = new THREE.Group();
    
    const corners = [];
    for (let i = 0; i < 8; i++) {
      const frac = [
        (i & 1) ? 1 : 0,
        (i & 2) ? 1 : 0,
        (i & 4) ? 1 : 0
      ];
      corners.push(fractionalToCartesian(frac, latticeMatrix));
    }

    const edges = [
      [0, 1], [1, 3], [3, 2], [2, 0],
      [4, 5], [5, 7], [7, 6], [6, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff, 
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });

    edges.forEach(([i, j]) => {
      const points = [
        new THREE.Vector3(corners[i][0], corners[i][1], corners[i][2]),
        new THREE.Vector3(corners[j][0], corners[j][1], corners[j][2])
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, edgeMaterial);
      group.add(line);
    });

    const cornerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const cornerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x004444
    });

    corners.forEach(corner => {
      const sphere = new THREE.Mesh(cornerGeometry, cornerMaterial);
      sphere.position.set(corner[0], corner[1], corner[2]);
      group.add(sphere);
    });

    return group;
  };

  const addSymmetryElements = (group, elements, latticeMatrix) => {
    if (elements.rotation_axes) {
      elements.rotation_axes.forEach((axis, idx) => {
        const axisMaterial = new THREE.LineDashedMaterial({
          color: 0xff00ff,
          dashSize: 0.2,
          gapSize: 0.1,
          linewidth: 2
        });
        
        const center = fractionalToCartesian(
          [axis.origin[0] || 0, axis.origin[1] || 0, axis.origin[2] || 0],
          latticeMatrix
        );
        
        const direction = axis.axis;
        const length = 10;
        
        const points = [
          new THREE.Vector3(
            center[0] - direction[0] * length,
            center[1] - direction[1] * length,
            center[2] - direction[2] * length
          ),
          new THREE.Vector3(
            center[0] + direction[0] * length,
            center[1] + direction[1] * length,
            center[2] + direction[2] * length
          )
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, axisMaterial);
        line.computeLineDistances();
        group.add(line);
      });
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card 
        size="small" 
        style={{ marginBottom: 8 }}
        title="晶体结构可视化"
        extra={
          <Space size="small">
            <span>背景:</span>
            <Select 
              size="small" 
              value={backgroundColor}
              onChange={setBackgroundColor}
              style={{ width: 100 }}
              options={[
                { value: '#0a0a1a', label: '深色' },
                { value: '#f0f0f0', label: '浅色' },
                { value: '#1a1a2e', label: '深蓝' }
              ]}
            />
          </Space>
        }
      >
        <Space wrap size="middle">
          <Space size="small">
            <span>超胞:</span>
            <Slider 
              min={1} 
              max={5} 
              value={supercellSize} 
              onChange={setSupercellSize}
              style={{ width: 120 }}
            />
            <span>{supercellSize}x{supercellSize}x{supercellSize}</span>
          </Space>
          <Space size="small">
            <span>原子大小:</span>
            <Slider 
              min={0.1} 
              max={3} 
              step={0.1}
              value={atomScale} 
              onChange={setAtomScale}
              style={{ width: 120 }}
            />
          </Space>
          <Space size="small">
            <span>化学键粗细:</span>
            <Slider 
              min={0.02} 
              max={0.3} 
              step={0.01}
              value={bondRadius} 
              onChange={setBondRadius}
              style={{ width: 100 }}
            />
          </Space>
          <Switch checked={showCell} onChange={setShowCell} checkedChildren="晶胞" unCheckedChildren="晶胞" />
          <Switch checked={showBonds} onChange={setShowBonds} checkedChildren="键" unCheckedChildren="键" />
          <Switch checked={showLabels} onChange={setShowLabels} checkedChildren="标签" unCheckedChildren="标签" />
        </Space>
      </Card>
      
      <div 
        ref={containerRef} 
        style={{ 
          flex: 1, 
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative'
        }} 
      />
      
      {crystalData?.atoms && (
        <Card size="small" style={{ marginTop: 8 }}>
          <Space wrap size="large">
            <span><strong>原子数:</strong> {crystalData.atoms.length}</span>
            <span><strong>化学键:</strong> {bonds.length}</span>
            <span><strong>超胞:</strong> {supercellSize}x{supercellSize}x{supercellSize}</span>
            {crystalData.space_group && (
              <span><strong>空间群:</strong> {crystalData.space_group.name}</span>
            )}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default CrystalViewer;
