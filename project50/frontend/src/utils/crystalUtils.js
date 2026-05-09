export const CPK_COLORS = {
  'H': 0xFFFFFF, 'He': 0xD9FFFF, 'Li': 0xCC80FF, 'Be': 0xC2FF00, 'B': 0xFFB5B5,
  'C': 0x909090, 'N': 0x3050F8, 'O': 0xFF0D0D, 'F': 0x90E050, 'Ne': 0xB3E3F5',
  'Na': 0xAB5CF2, 'Mg': 0x8AFF00, 'Al': 0xBFA6A6, 'Si': 0xF0C8A0, 'P': 0xFF8000',
  'S': 0xFFFF30, 'Cl': 0x1FF01F, 'Ar': 0x80D1E3', 'K': 0x8F40D4', 'Ca': 0x3DFF00',
  'Sc': 0xE6E6E6', 'Ti': 0xBFC2C7, 'V': 0xA6A6AB, 'Cr': 0x8A99C7, 'Mn': 0x9C7AC7',
  'Fe': 0xE06633, 'Co': 0xF090A0, 'Ni': 0x50D050, 'Cu': 0xC88033, 'Zn': 0x7D80B0',
  'Ga': 0xC28F8F, 'Ge': 0x668F8F, 'As': 0xBD80E3, 'Se': 0xFFA100, 'Br': 0xA62929',
  'Kr': 0x5CB8D1', 'Rb': 0x702EB0, 'Sr': 0x00FF00, 'Y': 0x94FFFF, 'Zr': 0x94E0E0',
  'Nb': 0x73C2C9', 'Mo': 0x54B5B5', 'Tc': 0x3B9E9E', 'Ru': 0x248F8F, 'Rh': 0x0A7D8C',
  'Pd': 0x006985', 'Ag': 0xC0C0C0', 'Cd': 0xFFD98F', 'In': 0xA67573', 'Sn': 0x668080',
  'Sb': 0x9E63B5', 'Te': 0xD47A00', 'I': 0x940094', 'Xe': 0x429EB0', 'Cs': 0x57178F',
  'Ba': 0x00C900', 'La': 0x70D4FF', 'Ce': 0xFFFFC7', 'Pr': 0xD9FFC7', 'Nd': 0xC7FFC7',
  'Pm': 0xA3FFC7', 'Sm': 0x8FFFC7', 'Eu': 0x61FFC7', 'Gd': 0x45FFC7', 'Tb': 0x30FFC7',
  'Dy': 0x1FFFC7', 'Ho': 0x00FF9C', 'Er': 0x00E675', 'Tm': 0x00D452', 'Yb': 0x00BF38',
  'Lu': 0x00AB24', 'Hf': 0x4DC2FF', 'Ta': 0x4DA6FF', 'W': 0x2194D6', 'Re': 0x267DAB',
  'Os': 0x266696', 'Ir': 0x175487', 'Pt': 0xD0D0E0', 'Au': 0xFFD123', 'Hg': 0xB8B8D0',
  'Tl': 0xA6544D', 'Pb': 0x575961', 'Bi': 0x9E4FB5', 'Po': 0xAB5C00', 'At': 0x754F45',
  'Rn': 0x428296', 'Fr': 0x420066', 'Ra': 0x007D00', 'Ac': 0x70ABFA', 'Th': 0x00BAFF',
  'Pa': 0x00A1FF', 'U': 0x008FFF',
};

export const getElementColor = (element) => {
  const cleanElement = element.replace(/[^a-zA-Z]/g, '').capitalize();
  return CPK_COLORS[cleanElement] || 0xCCCCCC;
};

export const ATOMIC_RADII = {
  'H': 0.32, 'He': 0.46, 'Li': 1.33, 'Be': 1.02, 'B': 0.85, 'C': 0.77,
  'N': 0.74, 'O': 0.73, 'F': 0.71, 'Ne': 0.64, 'Na': 1.54, 'Mg': 1.36,
  'Al': 1.18, 'Si': 1.11, 'P': 1.07, 'S': 1.05, 'Cl': 0.99, 'Ar': 0.95,
  'K': 1.96, 'Ca': 1.74, 'Sc': 1.44, 'Ti': 1.32, 'V': 1.22, 'Cr': 1.18,
  'Mn': 1.17, 'Fe': 1.17, 'Co': 1.16, 'Ni': 1.15, 'Cu': 1.17, 'Zn': 1.25,
  'Ga': 1.26, 'Ge': 1.22, 'As': 1.21, 'Se': 1.16, 'Br': 1.14, 'Kr': 1.10,
  'Rb': 2.11, 'Sr': 1.92, 'Y': 1.62, 'Zr': 1.45, 'Nb': 1.34, 'Mo': 1.30,
  'Tc': 1.27, 'Ru': 1.25, 'Rh': 1.25, 'Pd': 1.28, 'Ag': 1.34, 'Cd': 1.41,
  'In': 1.44, 'Sn': 1.40, 'Sb': 1.40, 'Te': 1.36, 'I': 1.33, 'Xe': 1.30,
  'Cs': 2.25, 'Ba': 1.98, 'La': 1.69, 'Ce': 1.65, 'Pr': 1.65, 'Nd': 1.64,
  'Pm': 1.63, 'Sm': 1.62, 'Eu': 1.85, 'Gd': 1.61, 'Tb': 1.59, 'Dy': 1.59,
  'Ho': 1.58, 'Er': 1.57, 'Tm': 1.56, 'Yb': 1.70, 'Lu': 1.56, 'Hf': 1.44,
  'Ta': 1.34, 'W': 1.30, 'Re': 1.28, 'Os': 1.26, 'Ir': 1.27, 'Pt': 1.30,
  'Au': 1.34, 'Hg': 1.49, 'Tl': 1.48, 'Pb': 1.47, 'Bi': 1.46, 'Po': 1.46,
  'At': 1.45, 'Rn': 1.45, 'Fr': 1.80, 'Ra': 1.50, 'Ac': 1.50, 'Th': 1.50,
  'Pa': 1.50, 'U': 1.50,
};

export const getAtomicRadius = (element) => {
  const cleanElement = element.replace(/[^a-zA-Z]/g, '').capitalize();
  return ATOMIC_RADII[cleanElement] || 1.0;
};

export const latticeToMatrix = (lattice) => {
  if (!lattice) return null;
  
  const { a, b, c, alpha = 90, beta = 90, gamma = 90 } = lattice;
  const alphaRad = alpha * Math.PI / 180;
  const betaRad = beta * Math.PI / 180;
  const gammaRad = gamma * Math.PI / 180;
  
  const ca = Math.cos(alphaRad);
  const cb = Math.cos(betaRad);
  const cg = Math.cos(gammaRad);
  const sg = Math.sin(gammaRad);
  
  const vol = a * b * c * Math.sqrt(1 - ca*ca - cb*cb - cg*cg + 2 * ca * cb * cg);
  
  return [
    [a, b * cg, c * cb],
    [0, b * sg, c * (ca - cb * cg) / sg],
    [0, 0, vol / (a * b * sg)]
  ];
};

export const fractionalToCartesian = (xyz, latticeMatrix) => {
  if (!latticeMatrix) return xyz;
  
  return [
    xyz[0] * latticeMatrix[0][0] + xyz[1] * latticeMatrix[0][1] + xyz[2] * latticeMatrix[0][2],
    xyz[0] * latticeMatrix[1][0] + xyz[1] * latticeMatrix[1][1] + xyz[2] * latticeMatrix[1][2],
    xyz[0] * latticeMatrix[2][0] + xyz[1] * latticeMatrix[2][1] + xyz[2] * latticeMatrix[2][2]
  ];
};

export const generateSupercell = (atoms, lattice, supercellRange = [1, 1, 1]) => {
  const latticeMatrix = latticeToMatrix(lattice);
  const [nx, ny, nz] = supercellRange;
  const newAtoms = [];
  
  for (let i = -Math.floor(nx/2); i <= Math.floor(nx/2); i++) {
    for (let j = -Math.floor(ny/2); j <= Math.floor(ny/2); j++) {
      for (let k = -Math.floor(nz/2); k <= Math.floor(nz/2); k++) {
        atoms.forEach((atom, idx) => {
          const offset = fractionalToCartesian([i, j, k], latticeMatrix);
          const originalCart = fractionalToCartesian(
            [atom.x, atom.y, atom.z], 
            latticeMatrix
          );
          newAtoms.push({
            ...atom,
            id: `${i}_${j}_${k}_${idx}`,
            x: originalCart[0] + offset[0],
            y: originalCart[1] + offset[1],
            z: originalCart[2] + offset[2],
            isCartesian: true
          });
        });
      }
    }
  }
  
  return newAtoms;
};

export const calculateBonds = (atoms, lattice, bondThreshold = 1.8) => {
  const latticeMatrix = latticeToMatrix(lattice);
  const bonds = [];
  
  const cartAtoms = atoms.map(atom => ({
    ...atom,
    cartesian: fractionalToCartesian([atom.x, atom.y, atom.z], latticeMatrix)
  }));
  
  for (let i = 0; i < cartAtoms.length; i++) {
    for (let j = i + 1; j < cartAtoms.length; j++) {
      const dist = Math.sqrt(
        Math.pow(cartAtoms[i].cartesian[0] - cartAtoms[j].cartesian[0], 2) +
        Math.pow(cartAtoms[i].cartesian[1] - cartAtoms[j].cartesian[1], 2) +
        Math.pow(cartAtoms[i].cartesian[2] - cartAtoms[j].cartesian[2], 2)
      );
      
      const sumRadii = getAtomicRadius(cartAtoms[i].element) + getAtomicRadius(cartAtoms[j].element);
      
      if (dist < sumRadii * 1.2 && dist > 0.1) {
        bonds.push({
          atom1: i,
          atom2: j,
          distance: dist,
          start: cartAtoms[i].cartesian,
          end: cartAtoms[j].cartesian
        });
      }
    }
  }
  
  return bonds;
};

export const getMillerPlanePoints = (h, k, l, lattice, scale = 1.0) => {
  const latticeMatrix = latticeToMatrix(lattice);
  if (!latticeMatrix) return [];
  
  const invMatrix = invertMatrix(latticeMatrix);
  const g = [
    h * invMatrix[0][0] + k * invMatrix[1][0] + l * invMatrix[2][0],
    h * invMatrix[0][1] + k * invMatrix[1][1] + l * invMatrix[2][1],
    h * invMatrix[0][2] + k * invMatrix[1][2] + l * invMatrix[2][2]
  ];
  
  const norm = Math.sqrt(g[0]*g[0] + g[1]*g[1] + g[2]*g[2]);
  const normal = [g[0]/norm, g[1]/norm, g[2]/norm];
  const d = 1.0 / norm;
  
  const corners = [];
  for (let i = 0; i < 8; i++) {
    const frac = [
      (i & 1) ? scale : 0,
      (i & 2) ? scale : 0,
      (i & 4) ? scale : 0
    ];
    corners.push(fractionalToCartesian(frac, latticeMatrix));
  }
  
  let minD = Infinity, maxD = -Infinity;
  corners.forEach(c => {
    const proj = c[0]*normal[0] + c[1]*normal[1] + c[2]*normal[2];
    minD = Math.min(minD, proj);
    maxD = Math.max(maxD, proj);
  });
  
  const centerD = (minD + maxD) / 2;
  
  const planeCenter = [
    normal[0] * centerD,
    normal[1] * centerD,
    normal[2] * centerD
  ];
  
  const u = orthogonalVector(normal);
  const v = cross(normal, u);
  
  const size = Math.max(lattice.a, lattice.b, lattice.c) * scale;
  const points = [
    [planeCenter[0] + u[0]*size + v[0]*size, planeCenter[1] + u[1]*size + v[1]*size, planeCenter[2] + u[2]*size + v[2]*size],
    [planeCenter[0] - u[0]*size + v[0]*size, planeCenter[1] - u[1]*size + v[1]*size, planeCenter[2] - u[2]*size + v[2]*size],
    [planeCenter[0] - u[0]*size - v[0]*size, planeCenter[1] - u[1]*size - v[1]*size, planeCenter[2] - u[2]*size - v[2]*size],
    [planeCenter[0] + u[0]*size - v[0]*size, planeCenter[1] + u[1]*size - v[1]*size, planeCenter[2] + u[2]*size - v[2]*size]
  ];
  
  return {
    normal,
    center: planeCenter,
    vertices: points,
    distance: d
  };
};

const invertMatrix = (m) => {
  const det = m[0][0]*(m[1][1]*m[2][2] - m[2][1]*m[1][2]) -
              m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0]) +
              m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]);
  
  if (det === 0) return m;
  
  const invDet = 1.0 / det;
  
  return [
    [
      (m[1][1]*m[2][2] - m[2][1]*m[1][2]) * invDet,
      (m[0][2]*m[2][1] - m[0][1]*m[2][2]) * invDet,
      (m[0][1]*m[1][2] - m[0][2]*m[1][1]) * invDet
    ],
    [
      (m[1][2]*m[2][0] - m[1][0]*m[2][2]) * invDet,
      (m[0][0]*m[2][2] - m[0][2]*m[2][0]) * invDet,
      (m[1][0]*m[0][2] - m[0][0]*m[1][2]) * invDet
    ],
    [
      (m[1][0]*m[2][1] - m[2][0]*m[1][1]) * invDet,
      (m[2][0]*m[0][1] - m[0][0]*m[2][1]) * invDet,
      (m[0][0]*m[1][1] - m[1][0]*m[0][1]) * invDet
    ]
  ];
};

const orthogonalVector = (v) => {
  let other;
  if (Math.abs(v[0]) < Math.abs(v[1]) && Math.abs(v[0]) < Math.abs(v[2])) {
    other = [1, 0, 0];
  } else if (Math.abs(v[1]) < Math.abs(v[2])) {
    other = [0, 1, 0];
  } else {
    other = [0, 0, 1];
  }
  
  const u = cross(v, other);
  const norm = Math.sqrt(u[0]*u[0] + u[1]*u[1] + u[2]*u[2]);
  return [u[0]/norm, u[1]/norm, u[2]/norm];
};

const cross = (a, b) => [
  a[1]*b[2] - a[2]*b[1],
  a[2]*b[0] - a[0]*b[2],
  a[0]*b[1] - a[1]*b[0]
];

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};
